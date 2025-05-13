'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';

export default function GeneratingStoryPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const steps = [
    '개인 정보 분석 중...',
    '서술 유형 적용 중...',
    '답변 내용 해석 중...',
    '자서전 초안 작성 중...',
    '마무리 및 문맥 검토 중...',
    '사용자 ID 확인 및 링크 생성 중...',
    '서버에 저장 중...'
  ];
  
  useEffect(() => {
    // 스토리지에서 필요한 정보 확인
    const storyAnswers = localStorage.getItem('temp_story_answers');
    const storyMessage = localStorage.getItem('temp_story_message');
    
    if (!storyAnswers) {
      // 필요한 정보가 없으면 공유 페이지로 리다이렉트
      router.push('/write/share');
      return;
    }
    
    // 중복 실행 방지: 이미 생성된 URL이 있는지 확인 (진행 플래그는 확인하지 않음)
    const existingUrl = localStorage.getItem('generated_story_url');
    if (existingUrl) {
      console.log('이미 생성된 URL이 있습니다. 완료 페이지로 이동합니다.');
      router.push('/write/complete');
      return;
    }
    
    // 새로운 생성 시작을 위해 생성 중 플래그를 설정 (기존 값은 무시)
    localStorage.setItem('generation_in_progress', 'true');
    
    // 생성 시작
    setIsGenerating(true);
    
    // 일정한 속도로 진행 상태 업데이트 (더 안정적)
    let currentProgress = 0;
    const targetProgress = 95; // 95%까지만 자동 증가 (API 호출은 별도 처리)
    const totalTime = 12000; // 12초 동안 진행
    const interval = 100; // 100ms마다 업데이트
    const step = (targetProgress * interval) / totalTime;
    
    const progressTimer = setInterval(() => {
      if (currentProgress >= targetProgress) {
        clearInterval(progressTimer);
        // API 호출 시작
        setProgress(targetProgress);
        generateStory(storyAnswers, storyMessage || '');
      } else {
        currentProgress += step;
        setProgress(currentProgress);
        
        // 진행도에 따라 현재 단계 업데이트
        const stepIndex = Math.min(
          Math.floor((currentProgress / 100) * steps.length),
          steps.length - 1
        );
        setCurrentStep(stepIndex);
      }
    }, interval);
    
    return () => {
      clearInterval(progressTimer);
      // 컴포넌트 언마운트 시 진행 상태 초기화하지 않음
    };
  }, [router, steps.length]);
  
  // 스토리 생성 함수
  const generateStory = async (answersJson: string, message: string) => {
    try {
      // 응답 데이터 파싱
      const allAnswers = JSON.parse(answersJson);
      
      // 인증 상태 확인
      let userAuth = null;
      try {
        // 로컬 스토리지에서 사용자 인증 정보 확인 (AuthContext에서 저장한 정보가 있다면)
        const authJson = localStorage.getItem('auth_user_data');
        if (authJson) {
          userAuth = JSON.parse(authJson);
          console.log('로컬 스토리지에서 사용자 인증 정보 찾음:', userAuth.uid);
        }
      } catch (e) {
        console.error('인증 정보 확인 중 오류:', e);
      }
      
      // API 요청 디버깅 로그 추가
      console.log('API 요청 시작:', { endpoint: '/api/generate-preview', data: allAnswers });
      
      try {
        // OpenAI API로 자서전 내용 생성
        console.log('API 호출 직전...');
        const response = await fetch('/api/generate-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: allAnswers })
        });
        console.log('API 호출 직후...');
        
        // 응답 상태 및 텍스트 로깅 추가
        console.log('API 응답 상태:', response.status, response.statusText);
        const responseText = await response.text();
        console.log('API 응답 텍스트:', responseText);
        
        if (!response.ok) {
          throw new Error(`자서전 생성에 실패했습니다. 상태: ${response.status}, 메시지: ${responseText}`);
        }
        
        // 텍스트를 JSON으로 파싱
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          throw new Error('API 응답을 파싱할 수 없습니다: ' + responseText);
        }
        
        const content = data.content;
        
        if (!content || typeof content !== 'string') {
          console.error('콘텐츠 형식 오류:', data);
          throw new Error('자서전 내용 형식이 올바르지 않습니다.');
        }
        
        // 메시지 정보 저장
        localStorage.setItem('generated_story_message', message);
        
        console.log('자서전 콘텐츠 생성 완료, 저장 시작');
        
        // 사용자 인증 및 customId 정보가 있다면 함께 전송
        const savePayload = {
          content,
          authInfo: userAuth ? {
            uid: userAuth.uid,
            isAnonymous: !!userAuth.isAnonymous
          } : null
        };
        
        // Firebase에 저장
        console.log('저장 요청 데이터:', savePayload);
        const saveResponse = await fetch('/api/save-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savePayload)
        });
        
        console.log('저장 API 응답 상태:', saveResponse.status, saveResponse.statusText);
        const saveResponseText = await saveResponse.text();
        console.log('저장 API 응답 텍스트:', saveResponseText);
        
        if (!saveResponse.ok) {
          throw new Error(`스토리 저장에 실패했습니다. 상태: ${saveResponse.status}, 메시지: ${saveResponseText}`);
        }
        
        // 저장 응답 파싱
        let saveData;
        try {
          saveData = JSON.parse(saveResponseText);
        } catch (parseError) {
          console.error('저장 응답 JSON 파싱 오류:', parseError);
          throw new Error('저장 API 응답을 파싱할 수 없습니다: ' + saveResponseText);
        }
        
        const storyId = saveData.storyId;
        
        if (!storyId) {
          console.error('스토리 ID 누락:', saveData);
          throw new Error('스토리 저장에 실패했습니다: ID가 반환되지 않았습니다.');
        }
        
        console.log('스토리 저장 완료, ID:', storyId);
        
        // 생성된 URL 저장 (API에서 반환한 shareUrl 사용)
        const shareUrl = saveData.shareUrl || `/story/${storyId}`;
        localStorage.setItem('generated_story_url', shareUrl);
        
        // 생성 완료 표시
        localStorage.removeItem('generation_in_progress');
        
        // 진행률 100% 표시
        setProgress(100);
        setIsGenerating(false);
        
        console.log('완료 페이지로 이동');
        // 완료 페이지로 이동
        router.push('/write/complete');
      } catch (apiError) {
        console.error('API 오류:', apiError);
        // 생성 실패 시 플래그 초기화
        localStorage.removeItem('generation_in_progress');
        setIsGenerating(false);
        throw apiError; // 상위 catch 블록으로 오류 전달
      }
    } catch (error: unknown) {
      console.error('자서전 생성 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      alert(`자서전 생성 중 오류가 발생했습니다: ${errorMessage}`);
      // 생성 실패 시 플래그 초기화
      localStorage.removeItem('generation_in_progress');
      setIsGenerating(false);
      // 오류 발생 시에도 완료 페이지로 이동
      router.push('/write/share');
    }
  };
  
  return (
    <MainLayout
      title="자서전 생성 중"
      description="당신의 디지털 자서전을 생성하고 있습니다."
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center text-center">
          {/* 로딩 아이콘 */}
          <div className={`rounded-full h-24 w-24 border-t-2 border-b-2 border-indigo-500 mb-8 ${isGenerating ? 'animate-spin' : ''}`} />
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            자서전 생성 중...
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-md">
            당신의 답변을 바탕으로 자서전을 작성하고 있습니다.
            잠시만 기다려주세요.
          </p>
          
          {/* 진행 단계 표시 */}
          <div className="w-full max-w-md mb-6">
            <p className="text-left text-indigo-600 font-medium mb-2">
              {steps[currentStep]}
            </p>
            
            {/* 진행 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* 퍼센트 표시 */}
            <p className="text-right text-sm text-gray-500 mt-1">
              {Math.min(Math.round(progress), 100)}%
            </p>
          </div>
          
          {/* 단계 표시 */}
          <div className="w-full max-w-md">
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center"
                >
                  <div 
                    className={`w-4 h-4 rounded-full ${
                      index <= currentStep
                        ? 'bg-indigo-600'
                        : 'bg-gray-300'
                    }`}
                  />
                  {index < steps.length - 1 && (
                    <div className="w-full border-t border-gray-300 mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            이 과정은 약 1분 정도 소요됩니다.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 
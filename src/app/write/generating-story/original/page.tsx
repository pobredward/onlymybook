'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { generatePreview } from '@/lib/gpt';
import { savePreviewStoryWithoutLogin } from '@/lib/db';

export default function GeneratingStoryPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [generateStep, setGenerateStep] = useState('데이터 준비 중...');
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    const generateStory = async () => {
      try {
        // 로컬 스토리지에서 데이터 가져오기
        const answersJson = localStorage.getItem('temp_story_answers');
        
        if (!answersJson) {
          throw new Error('자서전 데이터를 찾을 수 없습니다.');
        }
        
        // 진행 상태 업데이트
        setGenerateProgress(10);
        
        // 응답 데이터 파싱
        const allAnswers = JSON.parse(answersJson);
        
        // 작성자 이름, 마무리 제목, 마무리 멘트 가져오기
        const authorName = localStorage.getItem('temp_story_author') || '작가님';
        const endingTitle = localStorage.getItem('temp_story_ending_title') || '감사합니다';
        const endingMessage = localStorage.getItem('temp_story_ending_message') || '이 이야기를 읽어주셔서 감사합니다. 여러분과 함께 나눌 수 있어 행복했습니다.';
        
        // 진행 상태 업데이트
        setGenerateStep('자서전 생성 중...');
        setGenerateProgress(30);
        
        // OpenAI API로 자서전 내용 생성
        const content = await generatePreview(allAnswers);
        
        if (!content || content.includes('오류가 발생했습니다')) {
          throw new Error('자서전 생성에 실패했습니다. 다시 시도해주세요.');
        }
        
        // 진행 상태 업데이트
        setGenerateStep('자서전 저장 중...');
        setGenerateProgress(70);
        
        // Firebase에 저장
        const storyId = await savePreviewStoryWithoutLogin(content);
        
        if (!storyId) {
          throw new Error('미리보기 저장에 실패했습니다. 다시 시도해주세요.');
        }
        
        // 메타데이터 저장 (authorName, endingTitle, endingMessage)
        const storyMetadata = { authorName, endingTitle, endingMessage };
        localStorage.setItem(`story_metadata_${storyId}`, JSON.stringify(storyMetadata));
        
        // 진행 상태 업데이트
        setGenerateStep('링크 생성 완료!');
        setGenerateProgress(100);
        setPreviewId(storyId);
        
        // 3초 후 결과 페이지로 이동
        setTimeout(() => {
          router.push(`/write/share/complete?id=${storyId}`);
        }, 3000);
        
      } catch (e) {
        console.error('자서전 생성 오류:', e);
        setError(e instanceof Error ? e.message : '자서전 생성 중 오류가 발생했습니다.');
        setIsGenerating(false);
      }
    };

    // 생성 프로세스 시작
    generateStory();
  }, [router]);

  // 생성 취소 및 이전 페이지로 돌아가기
  const cancelGeneration = () => {
    router.push('/write/share');
  };

  return (
    <MainLayout 
      title="자서전 생성 중" 
      description="당신의 이야기가 자서전으로 만들어지고 있습니다."
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl mb-2">
            {previewId ? '자서전 생성 완료!' : '자서전 생성 중...'}
          </h1>
          <p className="text-lg text-gray-600">
            {previewId 
              ? '잠시 후 결과 페이지로 이동합니다.' 
              : '당신의 이야기가 디지털 자서전으로 만들어지고 있습니다.'}
          </p>
        </div>

        {error ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-600 mb-6 text-xl">
              <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <h3 className="mt-3 font-semibold">오류가 발생했습니다</h3>
            </div>
            <p className="text-gray-700 mb-6">{error}</p>
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              onClick={cancelGeneration}
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* 프로그레스 바 */}
            <div className="mb-8">
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>{generateStep}</span>
                <span>{generateProgress}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${generateProgress}%` }}
                ></div>
              </div>
            </div>

            {/* 애니메이션 */}
            <div className="flex justify-center mb-8">
              {previewId ? (
                <div className="success-animation">
                  <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
              ) : (
                <LoadingSpinner size="lg" />
              )}
            </div>

            {/* 생성 단계 표시 - 현재 단계 강조 표시 */}
            <div className="space-y-4 max-w-md mx-auto">
              <div className={`flex items-center ${generateProgress >= 10 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${generateProgress >= 10 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100'}`}>
                  {generateProgress >= 10 ? '✓' : '1'}
                </div>
                <span>입력하신 정보 분석 중</span>
              </div>
              
              <div className={`flex items-center ${isGenerating && generateProgress >= 10 && generateProgress < 30 ? 'animate-pulse' : ''} ${generateProgress >= 30 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${generateProgress >= 30 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100'}`}>
                  {generateProgress >= 30 ? '✓' : '2'}
                </div>
                <span>AI가 당신의 자서전을 작성 중</span>
              </div>
              
              <div className={`flex items-center ${isGenerating && generateProgress >= 30 && generateProgress < 70 ? 'animate-pulse' : ''} ${generateProgress >= 70 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${generateProgress >= 70 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100'}`}>
                  {generateProgress >= 70 ? '✓' : '3'}
                </div>
                <span>자서전 저장 및 링크 생성 중</span>
              </div>
              
              <div className={`flex items-center ${isGenerating && generateProgress >= 70 && generateProgress < 100 ? 'animate-pulse' : ''} ${generateProgress >= 100 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${generateProgress >= 100 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100'}`}>
                  {generateProgress >= 100 ? '✓' : '4'}
                </div>
                <span>자서전 생성 완료!</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .success-animation {
          margin: 20px auto;
        }
        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #4f46e5;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #4f46e5;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #4f46e5;
          fill: none;
          animation: stroke .6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke .3s cubic-bezier(0.65, 0, 0.45, 1) .8s forwards;
        }
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }
        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 30px #f3f4ff;
          }
        }
      `}</style>
    </MainLayout>
  );
} 
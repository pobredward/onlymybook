'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PREVIEW_QUESTIONS, FULL_QUESTIONS } from '@/constants/questions';
import { getStory, saveFullStory } from '@/lib/db';
import { generateFullMemoir } from '@/lib/gpt';
import { Story } from '@/types';

export default function FullWritePage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;
  
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [existingAnswers, setExistingAnswers] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const storyData = await getStory(storyId);
        if (!storyData) {
          throw new Error('자서전을 찾을 수 없습니다.');
        }
        
        if (!storyData.isPreview) {
          // 이미 전체 버전이 있는 경우
          if (storyData.shareUrl) {
            router.push(storyData.shareUrl);
          } else if (storyData.userId && storyData.storyNumber) {
            router.push(`/story/${storyData.userId}/${storyData.storyNumber}`);
          } else {
            router.push(`/story/${storyId}`);
          }
          return;
        }
        
        setStory(storyData);
        
        // 미리보기 질문에 대한 답변을 복원 (여기서는 더미로 처리)
        // 실제로는 미리보기 질문 답변을 저장했다가 불러와야 함
        const dummyPreviousAnswers = {
          childhood_memory: "할머니 댁 뒷마당에서 보냈던 여름날이 생각납니다...",
          grateful_person: "제 인생에서 가장 감사한 분은 초등학교 담임 선생님이셨습니다..."
        };
        
        setExistingAnswers(dummyPreviousAnswers);
      } catch (err) {
        console.error('Error fetching story:', err);
        setError(err instanceof Error ? err.message : '자서전을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [storyId, router]);

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      // 필수 답변 확인
      for (const question of FULL_QUESTIONS) {
        if (!answers[question.id] || answers[question.id].trim() === '') {
          throw new Error('모든 질문에 답해주세요.');
        }
      }

      // 이전 질문과 새 질문 결합
      const allAnswers = { ...existingAnswers, ...answers };
      
      // AI로 전체 자서전 생성
      const content = await generateFullMemoir(allAnswers);
      
      // 전체 자서전 저장
      const fullStoryId = await saveFullStory(story?.userId || '', content, storyId);
      
      // 완성된 자서전 페이지로 이동
      const savedStory = await getStory(fullStoryId);
      if (savedStory?.shareUrl) {
        router.push(savedStory.shareUrl);
      } else if (savedStory?.userId && savedStory?.storyNumber) {
        router.push(`/story/${savedStory.userId}/${savedStory.storyNumber}`);
      } else {
        router.push(`/story/${fullStoryId}`);
      }
    } catch (err) {
      console.error('Error generating full memoir:', err);
      setError(err instanceof Error ? err.message : '자서전 생성 중 오류가 발생했습니다.');
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="정보를 불러오는 중입니다..." />
        </div>
      </MainLayout>
    );
  }

  if (error && !story) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={() => router.push('/write')}>
            처음으로 돌아가기
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="전체 자서전 작성하기 - 디지털 자서전"
      description="추가 질문에 답하고 당신만의 완전한 디지털 자서전을 완성하세요."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            당신의 완전한 자서전을 작성하세요
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            추가 질문에 답하고 AI가 당신만의 완전한 자서전을 생성합니다.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-indigo-50 p-6 rounded-lg mb-8">
            <h2 className="font-medium text-lg text-indigo-800 mb-4">이전 질문에 대한 답변</h2>
            
            {PREVIEW_QUESTIONS.map((question) => (
              <div key={question.id} className="mb-4 last:mb-0">
                <p className="font-medium text-gray-700">{question.text}</p>
                <p className="mt-1 text-gray-600 bg-white p-3 rounded border border-indigo-100">
                  {existingAnswers[question.id] || '(답변 없음)'}
                </p>
              </div>
            ))}
          </div>

          <h2 className="font-semibold text-xl text-gray-800 mb-4">추가 질문</h2>
          
          {FULL_QUESTIONS.map((question) => (
            <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <TextArea
                label={question.text}
                placeholder={question.placeholder}
                value={answers[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                disabled={isGenerating}
              />
            </div>
          ))}

          <div className="flex justify-center mt-12">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              isLoading={isGenerating}
              disabled={isGenerating}
            >
              완전한 자서전 생성하기
            </Button>
          </div>
        </form>

        {isGenerating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-xl font-semibold">당신의 완전한 자서전을 생성 중입니다...</p>
              <p className="mt-2 text-gray-500">
                이 과정은 최대 1분 정도 소요될 수 있습니다.
                잠시만 기다려주세요. 당신의 이야기를 10개의 챕터로 구성된 자서전으로 담아내고 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 
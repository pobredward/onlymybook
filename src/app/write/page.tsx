'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MainLayout } from '@/components/layout/MainLayout';
import { PREVIEW_QUESTIONS } from '@/constants/questions';
import { generatePreview } from '@/lib/gpt';
import { getOrCreateUser, savePreviewStory } from '@/lib/db';

export default function WritePage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 필수 답변 확인
      for (const question of PREVIEW_QUESTIONS) {
        if (!answers[question.id] || answers[question.id].trim() === '') {
          throw new Error('모든 질문에 답해주세요.');
        }
      }

      // AI로 자서전 미리보기 생성
      const content = await generatePreview(answers);
      
      // 익명 사용자 생성 또는 가져오기
      const userId = await getOrCreateUser();
      
      // 미리보기 스토리 저장
      const storyId = await savePreviewStory(userId, content);
      
      // 미리보기 페이지로 이동
      router.push(`/preview/${storyId}`);
    } catch (err) {
      console.error('Error generating preview:', err);
      setError(err instanceof Error ? err.message : '미리보기 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout 
      title="자서전 작성하기 - 디지털 자서전" 
      description="간단한 질문에 답하고 당신만의 디지털 자서전 미리보기를 만나보세요."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            당신의 이야기를 들려주세요
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            간단한 두 가지 질문에 답하고 AI가 만든 당신의 자서전 미리보기를 확인하세요.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {PREVIEW_QUESTIONS.map((question) => (
            <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <TextArea
                label={question.text}
                placeholder={question.placeholder}
                value={answers[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                disabled={isLoading}
              />
            </div>
          ))}

          <div className="flex justify-center mt-8">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              isLoading={isLoading}
              disabled={isLoading}
            >
              자서전 미리보기 생성하기
            </Button>
          </div>
        </form>

        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-xl font-semibold">당신의 자서전을 생성 중입니다...</p>
              <p className="mt-2 text-gray-500">
                잠시만 기다려주세요. 당신의 이야기를 아름답게 담아내고 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 
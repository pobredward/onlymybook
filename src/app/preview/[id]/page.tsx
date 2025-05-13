'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getStory } from '@/lib/db';
import { Story } from '@/types';

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;
  
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const storyData = await getStory(storyId);
        if (!storyData) {
          throw new Error('자서전을 찾을 수 없습니다.');
        }
        setStory(storyData);
      } catch (err) {
        console.error('Error fetching story:', err);
        setError(err instanceof Error ? err.message : '자서전을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  const handlePurchase = () => {
    router.push(`/purchase/${storyId}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="자서전 미리보기를 불러오는 중입니다..." />
        </div>
      </MainLayout>
    );
  }

  if (error || !story) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600 mb-8">{error || '자서전을 불러올 수 없습니다.'}</p>
          <Button onClick={() => router.push('/write')}>
            다시 시도하기
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="나의 디지털 자서전 미리보기 - 디지털 자서전"
      description="당신의 이야기를 바탕으로 생성된 자서전 미리보기입니다. 완성된 자서전을 확인해보세요."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl font-serif">
            {story.title}
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            이 두 문장으로, 당신의 삶이 이렇게 기록될 수 있어요.
          </p>
          <p className="mt-2 text-lg text-indigo-600">
            단 몇 분 만에, 당신의 인생이 한 권의 책이 됩니다.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="prose prose-lg max-w-none font-serif leading-relaxed">
            <div
              className="animate-fade-in"
              dangerouslySetInnerHTML={{ __html: story.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <Button
            onClick={handlePurchase}
            variant="primary"
            size="lg"
            className="animate-pulse-subtle w-full max-w-md py-4 text-lg"
          >
            나의 디지털 자서전 완성하기 (900원)
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            전체 자서전에는 총 10개의 챕터가 포함됩니다.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 
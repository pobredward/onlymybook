'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getStory } from '@/lib/db';
import { Story } from '@/types';

export default function StoryPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;
  
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

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

  const copyShareLink = () => {
    const url = `${window.location.origin}/story/${storyId}`;
    
    navigator.clipboard.writeText(url)
      .then(() => {
        setShareSuccess('링크가 클립보드에 복사되었습니다!');
        setTimeout(() => setShareSuccess(null), 3000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        setError('링크 복사에 실패했습니다.');
      });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="자서전을 불러오는 중입니다..." />
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
          <Button onClick={() => router.push('/')}>
            홈으로 돌아가기
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`${story.title} - 디지털 자서전`}
      description="당신의 이야기를 담은 디지털 자서전입니다."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl font-serif">
            {story.title}
          </h1>
          <p className="mt-4 text-lg text-gray-600 italic font-serif">
            당신의 인생을 담은 디지털 자서전
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            <Button onClick={copyShareLink} variant="secondary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
              링크 복사하기
            </Button>
            
            <Button 
              onClick={() => router.push('/mypage')} 
              variant="ghost" 
              size="sm"
            >
              내 자서전 목록으로
            </Button>
          </div>
        </div>

        {shareSuccess && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-center">
            {shareSuccess}
          </div>
        )}

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div className="prose prose-lg max-w-none font-serif leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: story.content.replace(/\n/g, '<br />') }} />
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-700 mb-4">당신의 소중한 인생 이야기를 읽어주셔서 감사합니다.</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => router.push('/')} variant="secondary">
              홈으로
            </Button>
            <Button onClick={() => router.push('/write')} variant="primary">
              새 자서전 작성하기
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
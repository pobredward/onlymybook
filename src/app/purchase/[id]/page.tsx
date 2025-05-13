'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getStory } from '@/lib/db';
import { Story } from '@/types';

export default function PurchasePage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;
  
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const storyData = await getStory(storyId);
        if (!storyData) {
          throw new Error('자서전을 찾을 수 없습니다.');
        }
        
        if (!storyData.isPreview) {
          // 이미 전체 버전을 구매한 경우
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
      } catch (err) {
        console.error('Error fetching story:', err);
        setError(err instanceof Error ? err.message : '자서전을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [storyId, router]);

  const handlePayment = async () => {
    setIsPaying(true);
    
    // 결제 시뮬레이션 (실제로는 포트원이나 토스페이먼츠 같은 결제 서비스 연동)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 결제 성공 후 전체 질문 작성 페이지로 이동
      router.push(`/write/full/${storyId}`);
    } catch (err) {
      console.error('Payment error:', err);
      setError('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsPaying(false);
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

  if (error || !story) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600 mb-8">{error || '자서전 정보를 불러올 수 없습니다.'}</p>
          <Button onClick={() => router.push('/write')}>
            처음으로 돌아가기
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="자서전 구매하기 - 디지털 자서전"
      description="당신만의 완전한 디지털 자서전을 완성하세요."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl font-serif">
            나의 디지털 자서전 완성하기
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            전체 자서전을 작성하여 당신의 인생 이야기를 완성하세요.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 bg-indigo-50 border-b border-indigo-100">
            <h2 className="text-xl font-semibold text-indigo-800">디지털 자서전 전체 버전</h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">10개 챕터 자서전 작성</h3>
                <p className="mt-1 text-sm text-gray-500">미리보기에서 본 2개 챕터를 포함한 총 10개의 챕터로 구성된 완전한 자서전</p>
              </div>
              <div className="mt-2 sm:mt-0 text-right">
                <p className="text-2xl font-bold text-indigo-600">900원</p>
                <p className="text-xs text-gray-500">부가세 포함</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">포함 사항:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  완전한 10개 챕터 자서전
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  영구 저장 및 접근
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  소셜 미디어 공유 기능
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={handlePayment}
            variant="primary"
            size="lg"
            isLoading={isPaying}
            disabled={isPaying}
            className="w-full sm:w-auto px-12"
          >
            {isPaying ? '결제 처리 중...' : '900원 결제하기'}
          </Button>
          
          <p className="mt-4 text-sm text-gray-500">
            결제 후 8개의 추가 질문에 답하여 완전한 자서전을 생성할 수 있습니다.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MainLayout } from '@/components/layout/MainLayout';

export default function RedirectFromGeneratingStory() {
  const router = useRouter();
  
  // 이 페이지는 더 이상 params를 사용하지 않고, 리다이렉트 전용으로 사용됨
  useEffect(() => {
    // 이전 페이지로 돌아가기
    router.replace('/');
  }, [router]);
  
  return (
    <MainLayout title="리다이렉트 중..." description="홈으로 이동 중입니다.">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">홈으로 이동 중입니다...</p>
      </div>
    </MainLayout>
  );
} 
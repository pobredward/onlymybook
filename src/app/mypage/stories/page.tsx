'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { getUserStories } from '@/lib/db';
import { Story } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function StoriesPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'views' | 'reactions'>('date-desc');

  // 로그인 상태 확인 후 리다이렉트
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth/login?redirect=/mybook');
    }
  }, [currentUser, loading, router]);

  // /mypage/stories에 접근 시 /mybook으로 리다이렉트
  useEffect(() => {
    router.push('/mybook');
  }, [router]);

  // 사용자 스토리 로드
  useEffect(() => {
    const loadStories = async () => {
      if (currentUser?.uid) {
        try {
          setIsLoading(true);
          const userStories = await getUserStories(currentUser.uid);
          setStories(userStories);
        } catch (error) {
          console.error('스토리 로드 중 오류:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (currentUser) {
      loadStories();
    }
  }, [currentUser]);

  // 정렬 옵션에 따라 스토리 배열 정렬
  const sortedStories = [...stories].sort((a, b) => {
    switch (sortOption) {
      case 'date-desc':
        return b.createdAt - a.createdAt;
      case 'date-asc':
        return a.createdAt - b.createdAt;
      case 'views':
        return (b.viewCount || 0) - (a.viewCount || 0);
      case 'reactions':
        return (b.reactionCount || 0) - (a.reactionCount || 0);
      default:
        return 0;
    }
  });

  // 로딩 중이면 로딩 UI 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      title="내 자서전 목록"
      description="작성한 모든 자서전을 확인할 수 있습니다."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">내 자서전 목록</h1>
            <p className="mt-1 text-gray-600">
              총 {stories.length}개의 자서전을 작성했습니다.
            </p>
          </div>
          <Button onClick={() => router.push('/write')}>
            새 자서전 작성
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">정렬 옵션</h2>
            <div className="flex space-x-2">
              <Button
                variant={sortOption === 'date-desc' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSortOption('date-desc')}
              >
                최신순
              </Button>
              <Button
                variant={sortOption === 'date-asc' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSortOption('date-asc')}
              >
                오래된순
              </Button>
              <Button
                variant={sortOption === 'views' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSortOption('views')}
              >
                조회수
              </Button>
              <Button
                variant={sortOption === 'reactions' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSortOption('reactions')}
              >
                반응
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white shadow rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <h3 className="text-lg font-medium mb-2">아직 작성한 자서전이 없습니다</h3>
            <p className="text-gray-500 mb-6">첫 번째 자서전을 작성해보세요!</p>
            <Button onClick={() => router.push('/write')}>
              자서전 작성하러 가기
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedStories.map((story) => (
              <div
                key={story.id}
                className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <Link href={`/story/${story.id}`}>
                    <h3 className="text-xl font-medium mb-2 hover:text-blue-600 transition">
                      {story.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {story.content.substring(0, 200)}...
                  </p>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
                    <span className="flex items-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatDistanceToNow(new Date(story.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                    <span className="flex items-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      조회 {story.viewCount || 0}
                    </span>
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      반응 {story.reactionCount || 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/story/${story.id}`}>
                      <Button variant="outline" size="sm">
                        읽기
                      </Button>
                    </Link>
                    <Link href={`/story/${story.id}/edit`}>
                      <Button variant="outline" size="sm">
                        수정하기
                      </Button>
                    </Link>
                    <Link href={`/story/${story.id}/share`}>
                      <Button variant="outline" size="sm">
                        공유하기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 
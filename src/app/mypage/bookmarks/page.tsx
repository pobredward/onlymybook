'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { getBookmarkedStories } from '@/lib/db';
import { Story } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function BookmarksPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [bookmarkedStories, setBookmarkedStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'views' | 'reactions'>('date-desc');

  // 로그인 상태 확인 후 리다이렉트
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth/login?redirect=/mypage/bookmarks');
    }
  }, [currentUser, loading, router]);

  // 북마크한 스토리 로드
  useEffect(() => {
    const loadBookmarks = async () => {
      if (currentUser?.uid) {
        try {
          setIsLoading(true);
          // 이 함수는 아직 구현되지 않았을 수 있으므로, 실제 구현 시 수정이 필요할 수 있습니다.
          const bookmarks = await getBookmarkedStories(currentUser.uid);
          setBookmarkedStories(bookmarks);
        } catch (error) {
          console.error('북마크 로드 중 오류:', error);
          setBookmarkedStories([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (currentUser) {
      loadBookmarks();
    }
  }, [currentUser]);

  // 정렬 옵션에 따라 스토리 배열 정렬
  const sortedStories = [...bookmarkedStories].sort((a, b) => {
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
      title="북마크한 자서전"
      description="내가 북마크한 자서전을 확인할 수 있습니다."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">북마크한 자서전</h1>
            <p className="mt-1 text-gray-600">
              총 {bookmarkedStories.length}개의 자서전을 북마크했습니다.
            </p>
          </div>
          <Button onClick={() => router.push('/library')}>
            서재 둘러보기
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white shadow rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : bookmarkedStories.length === 0 ? (
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
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <h3 className="text-lg font-medium mb-2">아직 북마크한 자서전이 없습니다</h3>
            <p className="text-gray-500 mb-6">서재에서 마음에 드는 자서전을 북마크해보세요!</p>
            <Button onClick={() => router.push('/library')}>
              서재 둘러보기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedStories.map((story) => (
              <div
                key={story.id}
                className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <div className="h-40 bg-gray-100 relative">
                  <div className="w-full h-full flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-12 w-12 text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                      />
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <Link href={`/story/${story.id}`}>
                    <h3 className="text-xl font-medium hover:text-blue-600 transition line-clamp-1">
                      {story.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {story.content.substring(0, 150)}...
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3 w-3 mr-1" 
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
                      </div>
                      <div className="flex items-center mt-1">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3 w-3 mr-1" 
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
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/story/${story.id}`)}
                    >
                      읽기
                    </Button>
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
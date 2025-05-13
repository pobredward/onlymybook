'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getOrCreateUser, getUserStories } from '@/lib/db';
import { Story } from '@/types';

export default function MyPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        const userId = await getOrCreateUser();
        const userStories = await getUserStories(userId);
        setStories(userStories);
      } catch (err) {
        console.error('Error fetching user stories:', err);
        setError(err instanceof Error ? err.message : '자서전 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStories();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="자서전 목록을 불러오는 중입니다..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="내 서재 - 디지털 자서전"
      description="내가 작성한 디지털 자서전 목록을 확인하세요."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            내 서재
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            내가 작성한 디지털 자서전 목록
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {stories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">작성한 자서전이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">첫 번째 자서전을 작성해보세요.</p>
            <div className="mt-6">
              <Button onClick={() => router.push('/write')}>
                자서전 작성하기
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <div 
                key={story.id} 
                className="bg-white shadow overflow-hidden rounded-lg border border-gray-200"
              >
                <div className="px-6 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {story.title}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    작성일: {formatDate(story.createdAt)}
                  </p>
                </div>
                <div className="px-6 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        상태: {story.isPaid ? '완성된 자서전' : '미리보기'}
                      </p>
                      {!story.isPaid && (
                        <p className="mt-1 text-xs text-indigo-600">
                          아직 완성되지 않은 자서전입니다. 결제 후 완성해보세요.
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {story.isPreview ? (
                        <>
                          <Link 
                            href={`/preview/${story.id}`}
                            passHref
                            legacyBehavior
                          >
                            <a>
                              <Button variant="secondary" size="sm">
                                미리보기
                              </Button>
                            </a>
                          </Link>
                          <Link
                            href={`/purchase/${story.id}`}
                            passHref
                            legacyBehavior
                          >
                            <a>
                              <Button variant="primary" size="sm">
                                완성하기
                              </Button>
                            </a>
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/story/${story.id}`}
                          passHref
                          legacyBehavior
                        >
                          <a>
                            <Button variant="primary" size="sm">
                              읽기
                            </Button>
                          </a>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center mt-8">
              <Button onClick={() => router.push('/write')} variant="secondary">
                새 자서전 작성하기
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 
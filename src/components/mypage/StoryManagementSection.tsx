'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { getUserStories, updateStory } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Story } from '@/types';

interface StoryManagementSectionProps {
  stories?: string[];
}

const StoryManagementSection: React.FC<StoryManagementSectionProps> = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts');
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Firebase에서 사용자의 자서전 목록 가져오기
  useEffect(() => {
    const fetchUserStories = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const stories = await getUserStories(currentUser.uid);
        console.log('가져온 실제 자서전 목록:', stories);
        setUserStories(stories);
      } catch (err) {
        console.error('자서전 목록을 가져오는 중 오류 발생:', err);
        setError('자서전 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStories();
  }, [currentUser]);

  // 작성 중인 자서전 필터링 (isPreview=true 또는 isPaid=false)
  const drafts = userStories.filter(story => story.isPreview || !story.isPaid);
  
  // 발행된 자서전 필터링 (isPreview=false 그리고 isPaid=true)
  const published = userStories.filter(story => !story.isPreview && story.isPaid);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCopyShareLink = (shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('공유 링크가 복사되었습니다.');
      })
      .catch(() => {
        alert('링크 복사에 실패했습니다. 다시 시도해주세요.');
      });
  };

  // 스토리 공개 설정 변경 함수 추가
  const togglePublicStatus = async (storyId: string, isCurrentlyPublic: boolean) => {
    try {
      await updateStory(storyId, { isPublic: !isCurrentlyPublic });
      
      // 상태 업데이트
      setUserStories(prevStories => 
        prevStories.map(story => 
          story.id === storyId 
            ? { ...story, isPublic: !isCurrentlyPublic } 
            : story
        )
      );
      
      alert(isCurrentlyPublic ? '자서전이 비공개로 설정되었습니다.' : '자서전이 서재에 공개되었습니다.');
    } catch (error) {
      console.error('자서전 공개 설정 변경 중 오류 발생:', error);
      alert('설정 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">나의 자서전 관리</h2>
        
        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex -mb-px">
            <button
              className={`py-2 px-4 text-sm font-medium mr-8 border-b-2 ${
                activeTab === 'drafts'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('drafts')}
            >
              작성 중인 자서전
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'published'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('published')}
            >
              발행된 자서전
            </button>
          </div>
        </div>
        
        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="lg" text="자서전 목록을 불러오는 중입니다..." />
          </div>
        )}
        
        {/* 오류 메시지 */}
        {error && !loading && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => router.refresh()}
            >
              다시 시도
            </Button>
          </div>
        )}
        
        {/* 작성 중인 자서전 탭 */}
        {!loading && !error && activeTab === 'drafts' && (
          <div className="space-y-6">
            {drafts.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-md">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">작성 중인 자서전이 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">새로운 자서전을 작성해보세요.</p>
                <div className="mt-6">
                  <Button onClick={() => router.push('/write')} variant="primary">
                    자서전 작성하기
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {drafts.map(story => (
                  <div
                    key={story.id}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-medium text-gray-900">{story.title || '제목 없음'}</h3>
                        <div className="mt-1 flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            마지막 작성: {formatDate(story.createdAt)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            작성 중
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Link href={story.shareUrl || 
                                    (story.userId && story.storyNumber 
                                     ? `/story/${story.userId}/${story.storyNumber}` 
                                     : `/story/${story.id}`)}>
                          <Button variant="secondary" size="sm">
                            미리보기
                          </Button>
                        </Link>
                        <Link href={`/write`}>
                          <Button variant="primary" size="sm">
                            이어쓰기
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-6 text-center">
                  <Button onClick={() => router.push('/write')} variant="secondary">
                    새 자서전 작성하기
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* 발행된 자서전 탭 */}
        {!loading && !error && activeTab === 'published' && (
          <div className="space-y-6">
            {published.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-md">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">발행된 자서전이 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">자서전을 작성하고 완성해보세요.</p>
                <div className="mt-6">
                  <Button onClick={() => router.push('/write')} variant="primary">
                    자서전 작성하기
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {published.map(story => (
                  <div
                    key={story.id}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-medium text-gray-900">{story.title || '제목 없음'}</h3>
                        <div className="mt-1 flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            발행일: {formatDate(story.createdAt)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            발행됨
                          </span>
                          {/* 공개 상태 표시 */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            story.isPublic 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {story.isPublic ? '공개' : '비공개'}
                          </span>
                        </div>
                        {story.shareUrl && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-500">
                              공유 링크: {story.shareUrl}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        <Link href={story.shareUrl || 
                                    (story.userId && story.storyNumber 
                                     ? `/story/${story.userId}/${story.storyNumber}` 
                                     : `/story/${story.id}`)}>
                          <Button variant="secondary" size="sm">
                            보기
                          </Button>
                        </Link>
                        {story.shareUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCopyShareLink(story.shareUrl!)}
                          >
                            공유 링크 복사
                          </Button>
                        )}
                        {/* 공개 설정 버튼 추가 */}
                        <Button 
                          variant={story.isPublic ? "outline" : "primary"} 
                          size="sm"
                          onClick={() => togglePublicStatus(story.id, story.isPublic || false)}
                        >
                          {story.isPublic ? '비공개로 변경' : '서재에 공개'}
                        </Button>
                      </div>
                    </div>
                    
                    {/* 공유 통계 정보 */}
                    <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">공유 통계</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">열람 수</p>
                          <p className="text-lg font-semibold text-gray-900">{story.viewCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">댓글 수</p>
                          <p className="text-lg font-semibold text-gray-900">{story.reactionCount || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryManagementSection; 
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getStoryByUserIdAndNumber } from '@/lib/db';
import { MainLayout } from '@/components/layout/MainLayout';
import { Story } from '@/types';
import { StoryViewer } from '@/components/story/StoryViewer';
import { useAuth } from '@/contexts/AuthContext';
import { Pencil } from 'lucide-react';

export default function StoryByUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const storyNumber = params.storyNumber as string;
  const { currentUser } = useAuth();
  
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'modern' | 'classic'>('modern');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        // userId와 storyNumber로 스토리 가져오기
        const storyData = await getStoryByUserIdAndNumber(userId, Number(storyNumber));

        if (!storyData) {
          throw new Error('자서전을 찾을 수 없습니다.');
        }

        setStory(storyData);
        
        // 현재 로그인한 사용자가 작성자인지 확인
        if (currentUser && currentUser.uid === storyData.userId) {
          setIsOwner(true);
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        setError(err instanceof Error ? err.message : '자서전을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [userId, storyNumber, currentUser]);

  // 링크 공유
  const copyShareLink = () => {
    if (!story) return;

    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy share link:', err);
      });
  };
  
  // 편집 모드로 이동
  const handleEdit = () => {
    // 먼저 클래식 뷰로 변경
    setViewMode('classic');
    // 수정 페이지로 이동
    router.push(`/story/${userId}/${storyNumber}/edit`);
  };

  // 단락 나누기
  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, idx) => {
      if (!paragraph.trim()) return null;
      
      return (
        <p key={idx} className="mb-6 leading-relaxed">
          {paragraph.split('\n').map((line, lineIdx) => (
            <React.Fragment key={lineIdx}>
              {line}
              {lineIdx < paragraph.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  // 예상 읽기 시간 계산 (내용 길이에 따라 대략적으로 계산)
  const calculateReadingTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // 일반적으로 1분에 200단어 읽는다고 가정
    return minutes;
  };

  if (isLoading) {
    return (
      <MainLayout title="자서전 로딩 중" description="자서전을 불러오고 있습니다.">
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error || !story) {
    return (
      <MainLayout title="자서전을 찾을 수 없음" description="요청하신 자서전을 찾을 수 없습니다.">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">자서전을 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-8">{error || '요청하신 자서전이 존재하지 않거나 접근할 수 없습니다.'}</p>
          <Button onClick={() => router.push('/')} variant="primary">홈으로 돌아가기</Button>
        </div>
      </MainLayout>
    );
  }

  const readingTime = calculateReadingTime(story.content);

  // 모바일용 메뉴 컴포넌트 생성
  const MobileMenuActions = () => (
    <div className="flex justify-between items-center w-full">
      <div className="flex rounded-md overflow-hidden border">
        <button 
          className={`px-2 py-1 text-xs ${viewMode === 'modern' ? 'bg-indigo-100 font-medium' : 'bg-white hover:bg-gray-50'}`}
          onClick={() => setViewMode('modern')}
        >
          모던 뷰
        </button>
        <button 
          className={`px-2 py-1 text-xs ${viewMode === 'classic' ? 'bg-indigo-100 font-medium' : 'bg-white hover:bg-gray-50'}`}
          onClick={() => setViewMode('classic')}
        >
          클래식 뷰
        </button>
      </div>
      
      <div className="flex space-x-2">
        {isOwner && (
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1 px-2 py-1"
            title="자서전 수정하기"
          >
            <Pencil size={12} />
            <span className="text-xs">수정</span>
          </Button>
        )}
        
        <Button
          onClick={copyShareLink}
          variant="secondary"
          size="sm"
          className="flex items-center space-x-1 px-2 py-1"
          title={shareSuccess ? '링크가 복사되었습니다' : '자서전 공유하기'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-xs">{shareSuccess ? '복사됨!' : '공유'}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <MainLayout
      title={`${story.title || '디지털 자서전'}`}
      description="소중한 당신만의 이야기를 담은 디지털 자서전입니다."
    >
      <div className="mb-4 bg-white shadow-sm border-b">
        {/* 데스크탑 버전 헤더 */}
        <div className="hidden md:flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{story.title || '디지털 자서전'}</h1>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              약 {readingTime}분
            </div>
            
            <div className="flex items-center space-x-2">
              {isOwner && (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 px-3 py-1.5"
                  title="자서전 수정하기"
                >
                  <Pencil size={14} />
                  <span>수정</span>
                </Button>
              )}
              
              <Button
                onClick={copyShareLink}
                variant="secondary"
                size="sm"
                className="flex items-center space-x-1 px-3 py-1.5"
                title={shareSuccess ? '링크가 복사되었습니다' : '자서전 공유하기'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>{shareSuccess ? '복사됨!' : '공유'}</span>
              </Button>
              
              <div className="flex rounded-md overflow-hidden border">
                <button 
                  className={`px-3 py-1.5 text-xs ${viewMode === 'modern' ? 'bg-indigo-100 font-medium' : 'bg-white hover:bg-gray-50'}`}
                  onClick={() => setViewMode('modern')}
                >
                  모던 뷰
                </button>
                <button 
                  className={`px-3 py-1.5 text-xs ${viewMode === 'classic' ? 'bg-indigo-100 font-medium' : 'bg-white hover:bg-gray-50'}`}
                  onClick={() => setViewMode('classic')}
                >
                  클래식 뷰
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 모바일 버전 헤더 - 제목만 표시 */}
        <div className="md:hidden">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-900">{story.title || '디지털 자서전'}</h1>
          </div>
        </div>
      </div>
      
      {viewMode === 'modern' ? (
        // 모던 뷰 (새로운 디자인)
        <StoryViewer 
          story={story} 
          viewMode={viewMode} 
          hasHeader={true}
          mobileMenuComponent={<MobileMenuActions />}
        />
      ) : (
        // 클래식 뷰 (기존 디자인)
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* 헤더 */}
          <div className="mb-12">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{story.title}</h1>
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <span className="mr-2">
                    {new Date(story.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="mx-2">•</span>
                  <span>읽는 시간 약 {readingTime}분</span>
                  {story.viewCount && (
                    <>
                      <span className="mx-2">•</span>
                      <span>조회 {story.viewCount}회</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded"></div>
          </div>
          
          {/* 본문 */}
          <div className="prose prose-lg max-w-none">
            {renderContent(story.content)}
          </div>
          
          {/* 태그 섹션 */}
          {story.tags && story.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 작업 버튼 */}
          <div className="mt-12 flex justify-end space-x-4">
            <Button 
              onClick={() => router.push('/')}
              variant="secondary"
            >
              홈으로
            </Button>
          </div>
        </div>
      )}
    </MainLayout>
  );
} 
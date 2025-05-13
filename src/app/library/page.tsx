'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { getPublicStories, getRandomStories, bookmarkStory, getStoriesByTag } from '@/lib/db';
import { Story, User } from '@/types';
import { StoryDetail } from './StoryDetail';

// 자서전 감성 태그 목록
const EMOTION_TAGS = [
  { id: 'all', name: '전체', icon: '📚' },
  { id: 'growth', name: '성장', icon: '🌱' },
  { id: 'challenge', name: '도전', icon: '🔥' },
  { id: 'love', name: '사랑', icon: '❤️' },
  { id: 'family', name: '가족', icon: '👨‍👩‍👧‍👦' },
  { id: 'loss', name: '상실', icon: '💔' },
  { id: 'hope', name: '희망', icon: '✨' },
  { id: 'healing', name: '치유', icon: '🌿' },
  { id: 'career', name: '경력', icon: '💼' },
  { id: 'travel', name: '여행', icon: '✈️' },
  { id: 'reflection', name: '성찰', icon: '🧘' }
];

// 서재 페이지
export default function LibraryPage() {
  const router = useRouter();
  const { currentUser, userData, loading: authLoading } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [recommendedStories, setRecommendedStories] = useState<Story[]>([]);
  const [bookmarkedStories, setBookmarkedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Story[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      // 100px 이상 스크롤 시 버튼 표시
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 자서전 목록 불러오기
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        let fetchedStories;
        
        if (selectedTag === 'all') {
          fetchedStories = await getPublicStories();
        } else {
          fetchedStories = await getStoriesByTag(selectedTag);
        }
        
        setStories(fetchedStories);
        
        // 추천 자서전 (랜덤 3개)
        const recommended = await getRandomStories(3);
        setRecommendedStories(recommended);
        
        // 로그인한 경우 사용자 정보 및 북마크 가져오기
        if (currentUser && userData) {
          setCurrentUserData(userData);
          
          // 북마크한 자서전 가져오기
          if (userData.bookmarks?.length) {
            const bookmarkedIds = userData.bookmarks;
            const bookmarked = fetchedStories.filter(story => 
              bookmarkedIds.includes(story.id)
            );
            setBookmarkedStories(bookmarked);
          }
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('자서전을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchStories();
    }
  }, [authLoading, currentUser, userData, selectedTag]);

  // 북마크 토글
  const toggleBookmark = async (storyId: string) => {
    if (!currentUserData) {
      router.push('/auth/login?redirect=/library');
      return;
    }

    try {
      // bookmarkStory의 세 번째 인자로 현재 북마크 상태의 반대 값을 전달합니다
      const isCurrentlyBookmarked = isBookmarked(storyId);
      const isSuccess = await bookmarkStory(currentUserData.id, storyId, !isCurrentlyBookmarked);
      
      // 북마크 상태 업데이트
      if (isSuccess) {
        if (!isCurrentlyBookmarked) {
          // 북마크 추가
          const story = stories.find(s => s.id === storyId);
          if (story) {
            setBookmarkedStories(prev => [...prev, story]);
          }
        } else {
          // 북마크 제거
          setBookmarkedStories(prev => prev.filter(s => s.id !== storyId));
        }
      }
    } catch (err) {
      console.error('Error bookmarking story:', err);
      setError('북마크 처리 중 오류가 발생했습니다.');
    }
  };

  // 자서전이 북마크 되어있는지 확인
  const isBookmarked = (storyId: string) => {
    return bookmarkedStories.some(story => story.id === storyId);
  };

  // 상세 모달 열기
  const openStoryDetail = (story: Story) => {
    setSelectedStory(story);
  };

  // 자서전 카드 컴포넌트
  const StoryCard = ({ story }: { story: Story }) => {
    // 서사 톤을 기반으로 색상 결정
    const getToneColor = (tone?: string) => {
      const toneColors: Record<string, string> = {
        growth: 'bg-emerald-100 border-emerald-200',
        challenge: 'bg-red-100 border-red-200',
        love: 'bg-pink-100 border-pink-200',
        family: 'bg-blue-100 border-blue-200',
        loss: 'bg-purple-100 border-purple-200',
        hope: 'bg-yellow-100 border-yellow-200',
        healing: 'bg-green-100 border-green-200',
        career: 'bg-gray-100 border-gray-200',
        travel: 'bg-indigo-100 border-indigo-200',
        reflection: 'bg-cyan-100 border-cyan-200',
      };
      
      return tone && toneColors[tone] ? toneColors[tone] : 'bg-gray-100 border-gray-200';
    };

    // 카드 내용 요약
    const getSummary = (content: string) => {
      if (story.summary) return story.summary;
      const maxLength = 100;
      return content.length > maxLength 
        ? content.substring(0, maxLength) + '...' 
        : content;
    };

    // 북마크 상태 확인
    const storyIsBookmarked = isBookmarked(story.id);

    // 날짜 형식화
    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    // 읽기 예상 시간 계산
    const calculateReadingTime = (content: string) => {
      const wordsPerMinute = 200;
      const wordCount = content.split(/\s+/).length;
      return Math.ceil(wordCount / wordsPerMinute);
    };

    return (
      <div 
        className={`relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all 
          border-2 ${getToneColor(story.tone)} cursor-pointer transform hover:-translate-y-1 hover:scale-[1.01] transition-transform`}
        onClick={() => openStoryDetail(story)}
      >
        {/* 메인 타이틀 영역 */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-800">{story.title || '제목 없음'}</h3>
            {story.createdAt && (
              <span className="text-xs text-gray-500">{formatDate(story.createdAt)}</span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{getSummary(story.content)}</p>
          
          {/* 태그와 통계 */}
          <div className="flex flex-wrap mb-2 gap-1">
            {story.tags?.map(tag => {
              const tagInfo = EMOTION_TAGS.find(t => t.id === tag);
              return (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-60"
                >
                  {tagInfo?.icon} {tagInfo?.name}
                </span>
              );
            })}
          </div>
          
          {/* 메타 정보 */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              {/* 조회수 */}
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                {story.viewCount || 0}
              </span>
              {/* 좋아요 */}
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-pink-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                </svg>
                {story.reactionCount || 0}
              </span>
              {/* 댓글 수 */}
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h-6a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z"></path>
                </svg>
                {story.commentCount || 0}
              </span>
              {/* 스크랩(북마크) 수 */}
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
                </svg>
                {story.bookmarkCount || 0}
              </span>
            </div>
            {/* 읽기 시간 */}
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {calculateReadingTime(story.content)}분
            </span>
          </div>
        </div>
        
        {/* 북마크 버튼 */}
        <button 
          className={`absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 
            transition-transform ${storyIsBookmarked ? 'scale-110' : 'scale-100'}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(story.id);
          }}
          aria-label={storyIsBookmarked ? '북마크 해제' : '북마크 추가'}
          title={storyIsBookmarked ? '북마크 해제' : '북마크 추가'}
        >
          {storyIsBookmarked ? (
            <svg className="w-5 h-5 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400 hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          )}
        </button>
      </div>
    );
  };

  // 빈 상태 컴포넌트
  const EmptyState = ({ message, subMessage }: { message: string; subMessage: string }) => (
    <div className="text-center py-12 bg-gray-50 rounded-lg transition-all hover:bg-gray-100">
      <div className="mx-auto h-20 w-20 text-gray-400 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{message}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{subMessage}</p>
      
      {currentUserData ? (
        <Button
          variant="primary"
          className="mt-6"
          onClick={() => router.push('/write')}
        >
          내 자서전 작성하기
        </Button>
      ) : (
        <div className="mt-6 space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/auth/login')}
          >
            로그인하기
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push('/write')}
          >
            게스트로 시작하기
          </Button>
        </div>
      )}
    </div>
  );

  // 검색 기능
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    
    // 제목과 내용에서 검색어와 일치하는 항목 필터링
    const results = stories.filter(story => 
      (story.title && story.title.toLowerCase().includes(query)) || 
      (story.content && story.content.toLowerCase().includes(query))
    );
    
    setSearchResults(results);
  };

  // 검색 초기화
  const resetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <MainLayout
      title="디지털 자서전 서재"
      description="다양한 사람들의 삶의 이야기를 만나보세요."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 서재 소개 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2">
            이야기 서재
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            한 권 한 권의 자서전 속에는 사람들의 삶의 조각들이 담겨 있습니다. 
            다양한 이야기를 통해 공감과 위로를 느껴보세요.
          </p>
        </div>

        {/* 검색 바 */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex items-center max-w-lg mx-auto">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
                placeholder="제목이나 내용 검색..."
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={resetSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex items-center py-2.5 px-3 ml-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300"
            >
              검색
            </button>
          </form>
        </div>

        {/* 태그 필터 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {EMOTION_TAGS.map((tag) => (
              <button
                key={tag.id}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedTag === tag.id 
                    ? 'bg-indigo-600 text-white shadow-md scale-105' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-102'}`}
                onClick={() => {
                  setSelectedTag(tag.id);
                  resetSearch(); // 태그 선택 시 검색 초기화
                }}
              >
                <span className="mr-1">{tag.icon}</span>
                {tag.name}
                {selectedTag === tag.id && (
                  <span className="ml-1 flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 결과 */}
        {isSearching && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">검색 결과</h2>
              <span className="text-sm text-gray-500">{searchResults.length}개의 자서전 발견</span>
            </div>
            
            {searchResults.length === 0 ? (
              <EmptyState 
                message="검색 결과가 없습니다" 
                subMessage="다른 검색어로 다시 시도해보세요." 
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((story, index) => (
                  <div
                    key={story.id}
                    className="opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <StoryCard story={story} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 메인 자서전 목록 */}
        {!isSearching && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedTag === 'all' ? '최신 자서전' : `${EMOTION_TAGS.find(tag => tag.id === selectedTag)?.name} 자서전`}
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner size="lg" text="자서전을 불러오는 중입니다..." />
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
                <Button
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  다시 시도하기
                </Button>
              </div>
            ) : stories.length === 0 ? (
              <EmptyState 
                message="등록된 자서전이 없습니다" 
                subMessage="곧 새로운 자서전이 등록될 예정입니다. 직접 자서전을 작성해보세요." 
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story, index) => (
                  <div
                    key={story.id}
                    className="opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <StoryCard story={story} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* 북마크한 자서전 섹션 (로그인 시) */}
        {currentUserData && bookmarkedStories.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">내가 찜한 자서전</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedStories.map((story, index) => (
                <div
                  key={story.id}
                  className="opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <StoryCard story={story} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 추천 자서전 섹션 */}
        {!isSearching && recommendedStories.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">이런 자서전은 어떨까요?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedStories.map((story, index) => (
                <div
                  key={story.id}
                  className="opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <StoryCard story={story} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 선택된 자서전 상세 모달 */}
        {selectedStory && (
          <StoryDetail 
            story={selectedStory}
            onClose={() => setSelectedStory(null)}
            onBookmark={toggleBookmark}
            isBookmarked={isBookmarked(selectedStory.id)}
          />
        )}
        
        {/* 맨 위로 스크롤 버튼 */}
        {showScrollTop && (
          <button
            className="fixed bottom-8 right-8 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all transform hover:scale-110 z-50"
            onClick={scrollToTop}
            aria-label="맨 위로 스크롤"
            title="맨 위로 스크롤"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>
          </button>
        )}
      </div>
    </MainLayout>
  );
} 
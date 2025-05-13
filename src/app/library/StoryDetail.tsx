'use client';

import React from 'react';
import { Story } from '@/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface StoryDetailProps {
  story: Story;
  onClose: () => void;
  onBookmark: (storyId: string) => void;
  isBookmarked: boolean;
}

// 자서전 감성 태그 목록 (page.tsx와 일치시켜야 함)
const EMOTION_TAGS = [
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

export const StoryDetail: React.FC<StoryDetailProps> = ({ 
  story, 
  onClose, 
  onBookmark,
  isBookmarked
}) => {
  const router = useRouter();
  
  // 태그 아이콘과 이름 찾기
  const getTagInfo = (tagId: string) => {
    return EMOTION_TAGS.find(tag => tag.id === tagId) || { name: tagId, icon: '📖' };
  };
  
  // 읽기 예상 시간 (단어 기준)
  const calculateReadingTime = () => {
    if (story.readingTime) return story.readingTime;
    
    const wordCount = story.content.split(/\s+/).length;
    const wordsPerMinute = 200; // 분당 읽는 단어 수
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    return minutes;
  };
  
  // 내용 요약 (100단어)
  const getSummary = () => {
    if (story.summary) return story.summary;
    
    const words = story.content.split(/\s+/).slice(0, 100);
    return words.join(' ') + (words.length >= 100 ? '...' : '');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 닫기 버튼 */}
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* 상단 컬러 영역 */}
        <div className={`h-32 w-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center`}>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            {story.title || '제목 없음'}
          </h1>
        </div>
        
        {/* 내용 영역 */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* 메타 정보 */}
          <div className="flex flex-wrap gap-4 mb-6 items-center">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-600">약 {calculateReadingTime()}분 소요</span>
            </div>
            
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <span className="text-sm text-gray-600">{story.viewCount || 0}명이 읽음</span>
            </div>
            
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-sm text-gray-600">반응 {story.reactionCount || 0}개</span>
            </div>
            
            <button
              className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50"
              onClick={() => onBookmark(story.id)}
            >
              {isBookmarked ? (
                <>
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-sm">찜함</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span className="text-sm">찜하기</span>
                </>
              )}
            </button>
          </div>
          
          {/* 태그 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {story.tags?.map(tag => {
              const tagInfo = getTagInfo(tag);
              return (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  {tagInfo.icon} {tagInfo.name}
                </span>
              );
            })}
          </div>
          
          {/* 서문/요약 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">이 자서전은...</h2>
            <p className="text-gray-600">
              {getSummary()}
            </p>
          </div>
          
          {/* 첫 문단 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">첫 문장</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 italic">
              &ldquo;{story.content.split(/[.!?](?:\s|$)/)[0]}...&rdquo;
            </div>
          </div>
        </div>
        
        {/* 하단 버튼 영역 */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
          <Button variant="primary" onClick={() => {
            if (story.shareUrl) {
              router.push(story.shareUrl);
            } else if (story.userId && story.storyNumber) {
              router.push(`/story/${story.userId}/${story.storyNumber}`);
            } else {
              router.push(`/story/${story.id}`);
            }
          }}>
            전체 읽기
          </Button>
        </div>
      </div>
    </div>
  );
}; 
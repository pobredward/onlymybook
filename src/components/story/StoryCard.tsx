import React from 'react';
import { Story } from '@/types';

interface StoryCardProps {
  story: Story;
  rank?: number;
  onClick?: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, rank, onClick }) => {
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
      className={`relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border bg-white border-gray-100 cursor-pointer min-h-[90px] px-4 py-3 flex flex-col justify-between`}
      onClick={onClick}
      style={{ minHeight: 0 }}
    >
      {/* 상단: n위 뱃지 + 제목 + 날짜 */}
      <div className="flex items-start justify-between gap-2 w-full">
        {/* n위 뱃지 + 제목 */}
        <div className="flex items-center flex-wrap min-w-0 gap-2 flex-1">
          {typeof rank === 'number' && (
            <span className="inline-block bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap mr-1" style={{ fontSize: '0.95rem', minWidth: '2.5rem', textAlign: 'center' }}>
              {rank + 1}위
            </span>
          )}
          <span className="text-base font-bold text-gray-800 truncate min-w-0 max-w-full" style={{ lineHeight: 1.3 }}>{story.title || '제목 없음'}</span>
        </div>
        {/* 날짜 */}
        {story.createdAt && (
          <span className="text-xs text-gray-400 ml-2 whitespace-nowrap flex-shrink-0">{formatDate(story.createdAt)}</span>
        )}
      </div>
      {/* 한 줄 소개 */}
      {story.description && (
        <div className="text-sm text-gray-600 mt-1 mb-1 line-clamp-2">
          {story.description}
        </div>
      )}
      {/* 작성자 */}
      <div className="text-xs text-gray-500 mb-1 mt-1">by {story.authorName || '익명'}</div>
      {/* 통계 */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {/* 조회수 */}
          <span className="flex items-center"><svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>{story.viewCount || 0}</span>
          {/* 좋아요 */}
          <span className="flex items-center"><svg className="w-4 h-4 mr-0.5 text-pink-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>{story.reactionCount || 0}</span>
          {/* 댓글 수 */}
          <span className="flex items-center"><svg className="w-4 h-4 mr-0.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h-6a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z"/></svg>{story.commentCount || 0}</span>
          {/* 스크랩(북마크) 수 */}
          <span className="flex items-center"><svg className="w-4 h-4 mr-0.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" /></svg>{story.bookmarkCount || 0}</span>
        </div>
        {/* 읽기 시간 */}
        <span className="flex items-center text-xs text-gray-400 ml-2"><svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{typeof story.content === 'string' ? calculateReadingTime(story.content) : 0}분</span>
      </div>
    </div>
  );
};
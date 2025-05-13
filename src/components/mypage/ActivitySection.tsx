import React from 'react';
import Link from 'next/link';
import { User, Story } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';

interface ActivitySectionProps {
  userData: User;
  stories: Story[];
  totalReactions: number;
  isLoading: boolean;
}

const ActivitySection: React.FC<ActivitySectionProps> = ({ 
  userData, 
  stories, 
  totalReactions,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">내 활동</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">내 활동</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-500 font-medium">작성한 자서전</p>
          <p className="text-2xl font-bold mt-1">{stories.length}개</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-purple-500 font-medium">받은 반응</p>
          <p className="text-2xl font-bold mt-1">{totalReactions}개</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-500 font-medium">북마크한 자서전</p>
          <p className="text-2xl font-bold mt-1">{userData.bookmarks?.length || 0}개</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">최근 작성한 자서전</h3>
          {stories.length > 0 && (
            <Link href="/mybook" className="text-blue-600 text-sm hover:underline">
              전체보기
            </Link>
          )}
        </div>
        
        {stories.length === 0 ? (
          <div className="text-center py-6 border rounded-lg">
            <p className="text-gray-500 mb-4">아직 작성한 자서전이 없습니다</p>
            <Button onClick={() => window.location.href = "/write"}>
              첫 번째 자서전 작성하기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {stories.slice(0, 3).map((story) => (
              <Link 
                key={story.id}
                href={`/story/${story.id}`}
                className="block border rounded-lg p-3 hover:bg-gray-50 transition"
              >
                <h4 className="font-medium">{story.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                  {story.content.substring(0, 100)}...
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {story.viewCount || 0}
                    </span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {story.reactionCount || 0}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true, locale: ko })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitySection; 
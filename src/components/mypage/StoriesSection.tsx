import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Story } from '@/types';
import { Button } from '@/components/ui/Button';

interface StoriesSectionProps {
  stories: Story[];
}

const StoriesSection: React.FC<StoriesSectionProps> = ({ stories }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">내 자서전</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = "/write"}
        >
          새 자서전 작성
        </Button>
      </div>
      
      {stories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">아직 작성한 자서전이 없습니다</p>
          <Button onClick={() => window.location.href = "/write"}>
            첫 번째 자서전 작성하기
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div 
              key={story.id} 
              className="border rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <Link href={`/story/${story.id}`} className="block">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{story.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                      {story.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span className="mr-3">
                        작성일: {formatDistanceToNow(new Date(story.createdAt), { 
                          addSuffix: true, 
                          locale: ko 
                        })}
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                          />
                        </svg>
                        {story.viewCount || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {story.coverImage ? (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        <Image
                          src={story.coverImage}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-8 w-8 text-gray-400" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-1M8 7h1M8 11h1M8 15h1M12 7h1M12 11h1M12 15h1" 
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
              <div className="flex mt-3 pt-3 border-t">
                <Link href={`/story/${story.id}/edit`} className="text-sm text-blue-600 mr-4">수정하기</Link>
                <Link href={`/story/${story.id}/share`} className="text-sm text-blue-600">공유하기</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoriesSection; 
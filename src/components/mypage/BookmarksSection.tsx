import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Story } from '@/types';
import { Button } from '@/components/ui/Button';

interface BookmarksSectionProps {
  bookmarkedStories: Story[];
}

const BookmarksSection: React.FC<BookmarksSectionProps> = ({ bookmarkedStories }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">북마크한 자서전</h2>
      
      {bookmarkedStories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">북마크한 자서전이 없습니다</p>
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/library"}
          >
            서재에서 자서전 둘러보기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarkedStories.map((story) => (
            <Link
              key={story.id}
              href={`/story/${story.id}`}
              className="block border rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <div className="relative w-full h-40">
                {story.coverImage ? (
                  <Image
                    src={story.coverImage}
                    alt={story.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
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
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-1M8 7h1M8 11h1M8 15h1M12 7h1M12 11h1M12 15h1" 
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg truncate">{story.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                  {story.content.substring(0, 80)}...
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span className="flex items-center mr-3">
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
                  <span>작성자: {story.authorName || '익명'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksSection; 
import React from 'react';
import Link from 'next/link';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';

interface CommunitySectionProps {
  userData: User;
  isLoading: boolean;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ userData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">커뮤니티 활동</h2>
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
      <h2 className="text-xl font-semibold mb-4">커뮤니티 활동</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">나의 북마크 모음</h3>
        {!userData.bookmarks || userData.bookmarks.length === 0 ? (
          <div className="text-center py-6 border rounded-lg">
            <p className="text-gray-500 mb-4">아직 북마크한 자서전이 없습니다</p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/library"}
            >
              서재에서 자서전 둘러보기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 여기에 북마크 목록을 보여줄 수 있으나, 실제 데이터는 별도 API 호출이 필요할 수 있음 */}
            <div className="text-center py-4 border rounded-lg">
              <p className="text-gray-500">총 {userData.bookmarks.length}개의 북마크가 있습니다</p>
              <Link href="/mypage/bookmarks" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                자세히 보기
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">추천 자서전</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/library"
            className="flex flex-col items-center justify-center py-6 border rounded-lg hover:bg-gray-50 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-500 mb-2"
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
            <p className="font-medium">서재 둘러보기</p>
            <p className="text-sm text-gray-500 mt-1">다양한 자서전을 탐색해보세요</p>
          </Link>
          <Link
            href="/write"
            className="flex flex-col items-center justify-center py-6 border rounded-lg hover:bg-gray-50 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <p className="font-medium">새 자서전 작성하기</p>
            <p className="text-sm text-gray-500 mt-1">당신의 이야기를 남겨보세요</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunitySection; 
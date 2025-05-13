'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import ProfileSection from '@/components/mypage/ProfileSection';
import ActivitySection from '@/components/mypage/ActivitySection';
import CommunitySection from '@/components/mypage/CommunitySection';
import SettingsSection from '@/components/mypage/SettingsSection';
import { getTotalReactionCount, getUserStories } from '@/lib/db';
import { Story } from '@/types';

export default function MyPage() {
  const { currentUser, userData, loading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [totalReactions, setTotalReactions] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 로그인 상태 확인 후 리다이렉트
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth/login?redirect=/mypage');
    }
  }, [currentUser, loading, router]);

  // 사용자 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser?.uid) {
        try {
          setIsDataLoading(true);
          // 사용자의 스토리 가져오기
          const userStories = await getUserStories(currentUser.uid);
          setStories(userStories);
          
          // 전체 반응 수 계산
          let reactionCount = 0;
          userStories.forEach(story => {
            reactionCount += story.reactionCount || 0;
          });
          setTotalReactions(reactionCount);
        } catch (error) {
          console.error('사용자 데이터 로드 중 오류:', error);
        } finally {
          setIsDataLoading(false);
        }
      }
    };

    if (currentUser && userData) {
      loadUserData();
    }
  }, [currentUser, userData]);

  // 로딩 중이면 로딩 UI 표시
  if (loading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      title="마이페이지"
      description="내 계정 정보 및 활동을 확인할 수 있습니다."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
          <p className="mt-2 text-lg text-gray-600">
            내 계정 정보 및 활동을 확인할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 사이드바: 프로필 및 설정 */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileSection userData={userData} />
            <SettingsSection userData={userData} />
          </div>

          {/* 오른쪽 메인 콘텐츠: 활동 및 커뮤니티 */}
          <div className="lg:col-span-2 space-y-6">
            <ActivitySection 
              userData={userData} 
              stories={stories}
              totalReactions={totalReactions}
              isLoading={isDataLoading}
            />
            <CommunitySection 
              userData={userData}
              isLoading={isDataLoading}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
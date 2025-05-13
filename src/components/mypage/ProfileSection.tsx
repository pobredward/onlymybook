import React from 'react';
import Image from 'next/image';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';

interface ProfileSectionProps {
  userData: User;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ userData }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">프로필</h2>
      
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-24 h-24 mb-3">
          {userData.photoURL ? (
            <Image
              src={userData.photoURL}
              alt={userData.displayName || '사용자'}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-3xl text-gray-500">
                {userData.displayName?.[0] || userData.email?.[0] || '?'}
              </span>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-medium">
          {userData.displayName || '이름 없음'}
        </h3>
        <p className="text-gray-500 text-sm">{userData.email || '이메일 없음'}</p>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">회원 유형</span>
          <span className="text-sm font-medium">
            {userData.isPremium ? '프리미엄 회원' : '일반 회원'}
          </span>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">가입일</span>
          <span className="text-sm">
            {userData.createdAt 
              ? new Date(userData.createdAt).toLocaleDateString('ko-KR')
              : '정보 없음'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">최근 로그인</span>
          <span className="text-sm">
            {userData.lastLogin 
              ? new Date(userData.lastLogin).toLocaleDateString('ko-KR')
              : '정보 없음'}
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.location.href = "/mypage/edit-profile"}
        >
          프로필 수정
        </Button>
      </div>
    </div>
  );
};

export default ProfileSection; 
import React, { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';

interface SettingsSectionProps {
  userData: User;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ userData }) => {
  const [isPromotionSubscribed, setIsPromotionSubscribed] = useState(
    userData.promotionSubscribed || false
  );

  const handleTogglePromotion = async () => {
    try {
      // 여기에 실제 프로모션 구독 상태 토글 API 호출 로직이 들어갈 수 있음
      // await togglePromotionSubscription(userData.id, !isPromotionSubscribed);
      setIsPromotionSubscribed(!isPromotionSubscribed);
    } catch (error) {
      console.error('프로모션 구독 상태 변경 중 오류 발생:', error);
      // 에러 처리 로직
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">설정</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b">
          <div>
            <h3 className="font-medium">알림 설정</h3>
            <p className="text-sm text-gray-500">새로운 소식과 업데이트 알림</p>
          </div>
          <button
            className={`relative inline-flex items-center h-6 rounded-full w-11 ${
              isPromotionSubscribed ? 'bg-blue-600' : 'bg-gray-300'
            } transition-colors focus:outline-none`}
            onClick={handleTogglePromotion}
            role="switch"
            aria-checked={isPromotionSubscribed}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                isPromotionSubscribed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="py-2 border-b">
          <h3 className="font-medium mb-2">계정 보안</h3>
          <Button
            variant="outline"
            size="sm"
            className="mb-2 w-full"
            onClick={() => window.location.href = "/mypage/change-password"}
          >
            비밀번호 변경
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.location.href = "/mypage/security"}
          >
            보안 설정
          </Button>
        </div>
        
        <div className="py-2">
          <h3 className="font-medium mb-2">계정 관리</h3>
          <Button
            variant="outline"
            size="sm"
            className="mb-2 w-full"
            onClick={() => window.location.href = "/mypage/edit-profile"}
          >
            프로필 수정
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="mb-2 w-full"
            onClick={() => window.location.href = "/mypage/privacy"}
          >
            개인정보 설정
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            onClick={() => window.location.href = "/mypage/delete-account"}
          >
            계정 삭제
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection; 
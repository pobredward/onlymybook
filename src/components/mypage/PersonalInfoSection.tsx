'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logout } from '@/lib/auth';
import { User } from '@/types';
import { updateUserCustomId } from '@/lib/db';

interface PersonalInfoSectionProps {
  userData: User;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userData }) => {
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 사용자 ID 관련 상태
  const [isEditingUserId, setIsEditingUserId] = useState(false);
  const [customUserId, setCustomUserId] = useState('');
  const [userIdError, setUserIdError] = useState<string | null>(null);
  
  // 컴포넌트 마운트 시 사용자의 ID 초기화
  useEffect(() => {
    if (userData.customId) {
      setCustomUserId(userData.customId);
    }
  }, [userData]);
  
  // 사용자가 게스트 ID를 가지고 있거나 customId가 없는 경우 확인
  const needsCustomId = !userData.customId || 
                        userData.id.startsWith('guest_') || 
                        userData.customId.startsWith('guest_');

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error);
      setError('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: 비밀번호 변경 API 연동
      // const result = await changePassword(currentPassword, newPassword);
      
      // 임시로 성공했다고 가정
      setSuccessMessage('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (error) {
      console.error('비밀번호 변경 중 오류 발생:', error);
      setError('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 사용자 ID 변경 처리
  const handleUserIdChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserIdError(null);
    setError(null);
    
    // 유효성 검사
    if (!customUserId.trim()) {
      setUserIdError('사용자 ID를 입력해주세요.');
      return;
    }
    
    // 영문자, 숫자, 언더스코어만 허용하는 정규식
    const validIdRegex = /^[a-zA-Z0-9_]+$/;
    if (!validIdRegex.test(customUserId)) {
      setUserIdError('사용자 ID는 영문자, 숫자, 언더스코어(_)만 사용할 수 있습니다.');
      return;
    }
    
    if (customUserId.length < 4 || customUserId.length > 20) {
      setUserIdError('사용자 ID는 4~20자 사이여야 합니다.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 사용자 ID 업데이트 함수 호출
      await updateUserCustomId(userData.id, customUserId);
      
      setSuccessMessage('사용자 ID가 성공적으로 변경되었습니다. 이 ID로 자서전 URL이 생성됩니다.');
      setIsEditingUserId(false);
      
      // 페이지 새로고침 - 변경 내용 반영
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('사용자 ID 변경 중 오류 발생:', error);
      if (error instanceof Error) {
        setUserIdError(error.message || '사용자 ID 변경 중 오류가 발생했습니다.');
      } else {
        setUserIdError('사용자 ID 변경 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCreatedAt = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">내 정보 관리</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">계정 정보</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
                    <span className="text-gray-800">{userData.email || '이메일 정보 없음'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
                    <span className="text-gray-800">{userData.displayName || '이름 정보 없음'}</span>
                  </div>
                </div>
              </div>
              
              {/* 사용자 ID 섹션 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사용자 ID 
                  {needsCustomId && (
                    <span className="ml-2 text-red-500 text-xs font-medium">
                      * 설정 필요
                    </span>
                  )}
                </label>
                
                {isEditingUserId ? (
                  <form onSubmit={handleUserIdChange} className="space-y-3">
                    <div>
                      <Input
                        type="text"
                        value={customUserId}
                        onChange={(e) => setCustomUserId(e.target.value)}
                        placeholder="영문자, 숫자, 언더스코어(_)만 사용 가능"
                        className={userIdError ? "border-red-300" : ""}
                      />
                      {userIdError && (
                        <p className="mt-1 text-sm text-red-600">{userIdError}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        * 이 ID는 자서전 공유 URL에 사용됩니다. (예: /story/yourID/1)
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={isLoading}
                        disabled={isLoading}
                      >
                        저장
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIsEditingUserId(false);
                          // 원래 값으로 복원
                          setCustomUserId(userData.customId || '');
                          setUserIdError(null);
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md bg-gray-50">
                    <span className="text-gray-800">
                      {userData.customId || '설정되지 않음'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingUserId(true)}
                    >
                      {userData.customId ? '수정' : '설정'}
                    </Button>
                  </div>
                )}
                
                {needsCustomId && !isEditingUserId && (
                  <p className="mt-2 text-sm text-amber-600">
                    자서전 URL 생성을 위해 사용자 ID를 설정해주세요. 생성된 자서전의 공유 링크에 이 ID가 사용됩니다.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
                <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-gray-800">{formatCreatedAt(userData.createdAt)}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">가입 방법</label>
                <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-gray-800">{userData.provider === 'email' ? '이메일' : userData.provider}</span>
                </div>
              </div>
            </div>
          </div>
          
          <hr className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">비밀번호 변경</h3>
            {userData.provider === 'email' ? (
              isChangingPassword ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <Input
                    type="password"
                    label="현재 비밀번호"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    label="새 비밀번호"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    label="새 비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      비밀번호 변경
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setError(null);
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsChangingPassword(true)}
                >
                  비밀번호 변경하기
                </Button>
              )
            ) : (
              <p className="text-sm text-gray-500">
                소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.
              </p>
            )}
          </div>
          
          <hr className="my-6" />
          
          <div className="flex flex-col space-y-4">
            <Button variant="outline" onClick={handleLogout}>
              로그아웃
            </Button>
            
            <div className="text-sm text-gray-600 mt-4">
              <h4 className="font-medium text-gray-800 mb-1">계정 탈퇴</h4>
              <p>계정 탈퇴는 곧 제공될 예정입니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection; 
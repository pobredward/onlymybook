'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createOrUpdateUser } from '@/lib/auth';
import { User } from '@/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  error: null
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 인증 상태 변경 리스너 설정
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // 로그인된 사용자의 경우 Firestore에서 사용자 데이터 가져오기
          const userDataObj = await createOrUpdateUser(user);
          setUserData(userDataObj);
          
          // 사용자 인증 정보를 로컬 스토리지에 저장 (자서전 생성 시 사용)
          localStorage.setItem('auth_user_data', JSON.stringify({
            uid: user.uid,
            email: user.email,
            isAnonymous: user.isAnonymous,
            displayName: user.displayName,
            customId: userDataObj?.customId || null
          }));
          console.log('인증 정보 로컬 스토리지에 저장됨:', user.uid);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('사용자 정보를 가져오는 중 오류가 발생했습니다.');
        }
      } else {
        setUserData(null);
        // 로그아웃 시 인증 정보 삭제
        localStorage.removeItem('auth_user_data');
      }
      
      setLoading(false);
    });

    // 컴포넌트 언마운트 시 리스너 해제
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
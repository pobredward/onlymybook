'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginWithEmail, resetPassword } from '@/lib/auth';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 이미 로그인 상태라면 메인 페이지로 리다이렉트
  React.useEffect(() => {
    if (!loading && window.localStorage.getItem('auth_user_data')) {
      router.push('/');
    }
  }, [loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await loginWithEmail(email, password);
      router.push('/');
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      const firebaseError = error as { code?: string; message?: string };
      
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError('비밀번호 재설정을 위해 이메일을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      
      const firebaseError = error as { code?: string; message?: string };
      
      if (firebaseError.code === 'auth/user-not-found') {
        setError('해당 이메일로 등록된 계정을 찾을 수 없습니다.');
      } else {
        setError('비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isResetMode ? '비밀번호 찾기' : '로그인'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isResetMode ? (
              '등록된 이메일로 비밀번호 재설정 링크를 보내드립니다.'
            ) : (
              <>
                아직 계정이 없으신가요?{' '}
                <Link 
                  href="/auth/register" 
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  가입하기
                </Link>
              </>
            )}
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {resetSent && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  비밀번호 재설정 이메일이 전송되었습니다. 이메일을 확인해주세요.
                </h3>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={isResetMode ? handlePasswordReset : handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">이메일</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {!isResetMode && (
              <div>
                <label htmlFor="password" className="sr-only">비밀번호</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {!isResetMode && (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => setIsResetMode(true)}
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              {isResetMode ? '비밀번호 재설정 이메일 보내기' : '로그인'}
            </button>
          </div>
          
          {isResetMode && (
            <div className="text-sm text-center">
              <button
                type="button"
                className="font-medium text-indigo-600 hover:text-indigo-500"
                onClick={() => {
                  setIsResetMode(false);
                  setResetSent(false);
                }}
              >
                로그인으로 돌아가기
              </button>
            </div>
          )}
        </form>
        
        {!isResetMode && (
          <>
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>
            
            <div className="mt-6">
              <SocialLoginButtons 
                onSuccess={() => router.push('/')}
                onError={(error) => setError(error.message)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
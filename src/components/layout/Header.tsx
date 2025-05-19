'use client';

import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, userData, loading } = useAuth();
  const isLoggedIn = !loading && currentUser !== null;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      router.push('/');
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error);
    }
  };
  
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-serif font-semibold tracking-tight text-indigo-600">디지털 자서전</span>
              <span className="ml-2 text-sm text-gray-500 hidden sm:block font-light">
                | 말보다 진한 기억들
              </span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="relative ml-3" ref={dropdownRef}>
              <div>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full bg-gray-100 p-1 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 h-10 w-10"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">사용자 메뉴 열기</span>
                  {isLoggedIn && userData?.photoURL ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={userData.photoURL}
                      alt="사용자 프로필"
                    />
                  ) : (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute right-0 z-40 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {isLoggedIn ? (
                    <>
                      {userData && (
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {userData.displayName || '사용자'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {userData.email || ''}
                          </p>
                        </div>
                      )}
                      <Link
                        href="/mypage"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        마이페이지
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        로그아웃
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        로그인
                      </Link>
                      <Link
                        href="/auth/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        회원가입
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* nav bar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-center gap-2 px-4 py-2 overflow-x-auto">
          <Link href="/write" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/write') ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
            <span className="mr-1">✍️</span>작성
          </Link>
          <Link href="/library" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/library' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
            <span className="mr-1">📚</span>서재
          </Link>
          <Link href="/mybook" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/mybook' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
            <span className="mr-1">📖</span>나의 자서전
          </Link>
        </div>
      </nav>
    </header>
  );
}; 
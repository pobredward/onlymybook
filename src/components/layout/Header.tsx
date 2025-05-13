import Link from 'next/link';
import React from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/router';

export const Header: React.FC = () => {
  const router = useRouter();
  const isLoggedIn = auth.currentUser !== null;
  
  return (
    <header className="bg-white shadow-sm">
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
            <nav className="flex space-x-4">
              <Link 
                href="/write"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                자서전 작성하기
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link 
                    href="/mypage"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    내 서재
                  </Link>
                  <button
                    onClick={() => {
                      auth.signOut();
                      router.push('/');
                    }}
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link 
                  href="/write"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  시작하기
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}; 
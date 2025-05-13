'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CompletePage() {
  const router = useRouter();
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [storyMessage, setStoryMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  useEffect(() => {
    // localStorage에서 생성된 URL 가져오기
    const storedUrl = localStorage.getItem('generated_story_url');
    const message = localStorage.getItem('generated_story_message') || '';
    
    if (!storedUrl) {
      // URL이 없으면 공유 페이지로 리다이렉트
      router.push('/write/share');
      return;
    }
    
    // 메시지 설정
    setStoryMessage(message);
    
    // URL 상태에 저장 (절대 URL로 변환, 이미 절대 URL인 경우는 그대로 사용)
    const absoluteUrl = storedUrl.startsWith('http') 
      ? storedUrl 
      : window.location.origin + storedUrl;
    setGeneratedUrl(absoluteUrl);
    
    // 생성 완료 플래그 제거
    localStorage.removeItem('generation_in_progress');
  }, [router]);
  
  // 클립보드에 링크 복사
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
      });
  };
  
  return (
    <MainLayout
      title="자서전 생성 완료"
      description="당신의 디지털 자서전이 생성되었습니다."
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center text-center">
          {/* 성공 아이콘 */}
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8">
            <svg 
              className="w-12 h-12 text-green-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            자서전 생성 완료!
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-md">
            당신의 디지털 자서전이 성공적으로 생성되었습니다.
            아래 링크를 통해 바로 확인하거나 다른 사람들과 공유할 수 있습니다.
          </p>
          
          {/* 작성자 메시지가 있는 경우 표시 */}
          {storyMessage && (
            <div className="w-full max-w-md mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-sm text-indigo-700 italic">&ldquo;{storyMessage}&rdquo;</p>
            </div>
          )}
          
          {/* 생성된 링크 */}
          <div className="w-full max-w-md mb-8">
            <div className="flex items-center">
              <input
                type="text"
                value={generatedUrl}
                readOnly
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-r-md text-white text-sm font-medium ${
                  copySuccess ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                {copySuccess ? '복사됨!' : '복사'}
              </button>
            </div>
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href={generatedUrl}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              자서전 보기
            </Link>
            <Link 
              href="/"
              className="px-6 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-md shadow hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// CSS 애니메이션
const styles = `
  @keyframes scale-in {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  .animate-scale-in {
    animation: scale-in 0.6s ease-out forwards;
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }
`;

// 스타일 추가
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
} 
'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { getStory } from '@/lib/db';

const AVAILABLE_TAGS = [
  { id: 'growth', emoji: '🌱', name: '성장' },
  { id: 'challenge', emoji: '🔥', name: '도전' },
  { id: 'love', emoji: '❤️', name: '사랑' },
  { id: 'family', emoji: '👨‍👩‍👧‍👦', name: '가족' },
  { id: 'loss', emoji: '💔', name: '상실' },
  { id: 'hope', emoji: '✨', name: '희망' },
  { id: 'healing', emoji: '🌿', name: '치유' },
  { id: 'career', emoji: '💼', name: '경력' },
  { id: 'travel', emoji: '✈️', name: '여행' },
  { id: 'reflection', emoji: '🧘', name: '성찰' }
];

type Story = {
  shareUrl?: string;
  userId?: string;
  storyNumber?: number;
  title?: string;
  authorName?: string;
  tags?: string[];
  description?: string;
};

export default function CompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams?.get('storyId') || searchParams?.get('id');

  const [loading, setLoading] = useState(true);
  const [story, setStory] = useState<Story | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [localData, setLocalData] = useState<{
    title?: string;
    authorName?: string;
    description?: string;
    tags?: string[];
  } | null>(null);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // 1. Firestore에서 fetch (gpt/공유형)
    if (storyId) {
      getStory(storyId)
        .then(data => {
          if (!data) {
            router.replace('/');
          } else {
            setStory(data);
            setLoading(false);
          }
        })
        .catch(() => router.replace('/'));
      // gpt 메시지(있으면)
      const msg = localStorage.getItem('generated_story_message') || '';
      setMessage(msg);
    } else {
      // 2. localStorage에서 직접작성 정보 fetch
      const saved = localStorage.getItem('autobiography_manual_published');
      if (saved) {
        try {
          setLocalData(JSON.parse(saved));
        } catch {}
      }
      setLoading(false);
    }
  }, [storyId, router]);
    
  // 자서전 고유 URL 생성 함수
  const getStoryUrl = () => {
    if (story) {
      if (story.shareUrl && story.shareUrl.startsWith('/story/')) {
        return window.location.origin + story.shareUrl;
      }
      if (story.userId && story.storyNumber) {
        return window.location.origin + `/story/${story.userId}/${story.storyNumber}`;
      }
    }
    // localStorage 기반 (로컬 자서전)
    const personalInfoJson = typeof window !== 'undefined' ? localStorage.getItem('autobiography_personal_info') : null;
    if (personalInfoJson) {
      try {
        const personalInfo = JSON.parse(personalInfoJson);
        const userId = personalInfo.userId;
        const storyNumber = personalInfo.storyNumber;
        if (userId && storyNumber) {
          return window.location.origin + `/story/${userId}/${storyNumber}`;
        }
      } catch {}
    }
    return '';
  };

  // 링크 복사
  const handleCopy = () => {
    const url = getStoryUrl();
    if (!url) {
      alert('공유 가능한 자서전 URL이 없습니다.');
      return;
    }
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
  };

  // 소셜 공유 핸들러
  const handleSocialShare = (platform: 'kakao' | 'instagram' | 'twitter' | 'facebook') => {
    const url = getStoryUrl();
    if (!url) {
      alert('공유 가능한 자서전 URL이 없습니다.');
      return;
    }
    if (platform === 'kakao') {
      navigator.clipboard.writeText(url);
      alert('링크가 복사되었습니다. 카카오톡 대화창에 붙여넣기 하세요!');
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(url);
      alert('링크가 복사되었습니다. 인스타그램 프로필/스토리에 붙여넣기 하세요!');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
  };

  // 자서전 보기 (gpt/공유형, 직접작성 모두 통일)
  const goToStory = () => {
    // Firestore 기반(gpt/공유형)
    if (story) {
      if (story.shareUrl && story.shareUrl.startsWith('/story/')) {
        router.push(story.shareUrl);
        return;
      }
      if (story.userId && story.storyNumber) {
        router.push(`/story/${story.userId}/${story.storyNumber}`);
        return;
      }
    }
    // localStorage에서 userId, latestStoryId, storyNumber 사용
    const personalInfoJson = typeof window !== 'undefined' ? localStorage.getItem('autobiography_personal_info') : null;
    if (personalInfoJson) {
      try {
        const personalInfo = JSON.parse(personalInfoJson);
        const userId = personalInfo.userId;
        const storyNumber = personalInfo.storyNumber;
        if (userId && storyNumber) {
          router.push(`/story/${userId}/${storyNumber}`);
          return;
        }
      } catch {}
    }
    // fallback: 홈으로 이동
    router.push('/');
  };

  // 새 자서전 작성
  const createNewStory = () => {
    router.push('/');
  };

  if (loading) return <MainLayout><div className="text-center py-20">로딩 중...</div></MainLayout>;

  // 직접작성 데이터 fallback
  if (!story && localData) {
    const url = getStoryUrl();
    return (
      <MainLayout title="자서전 완성" description="자서전이 성공적으로 완성되었습니다.">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="mb-8 flex justify-center">
            <svg className="h-20 w-20 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">축하합니다!</h1>
          <p className="text-xl text-gray-600 mb-6"><span className="font-semibold">{localData.title}</span> 자서전이 성공적으로 완성되었습니다.</p>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{localData.title}</h2>
            <p className="text-gray-600 mb-2">작가: {localData.authorName || '작가 미상'}</p>
            {localData.description && (
              <p className="text-indigo-700 mb-4 text-base font-medium">&ldquo;{localData.description}&rdquo;</p>
            )}
            {Array.isArray(localData.tags) && localData.tags.length > 0 && (
              <div className="flex justify-center mb-6 gap-2">
                {localData.tags.map((tagId: string) => {
                  const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
                  return tag ? (
                    <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 border border-indigo-100">
                      <span className="mr-1">{tag.emoji}</span>
                      <span>{tag.name}</span>
                    </span>
                  ) : null;
                })}
              </div>
            )}
            <div className="text-center text-gray-500 italic">&ldquo;자신의 이야기를 써내려간다는 것은 인생을 다시 한번 되돌아보는 귀중한 여정입니다.&rdquo;</div>
            {/* 소셜 공유 버튼 */}
            <div className="flex gap-3 justify-center mt-4">
              <Button onClick={() => handleSocialShare('kakao')} variant="outline" size="sm">
                <span role="img" aria-label="카카오톡">💬</span> 카톡 공유
              </Button>
              <Button onClick={() => handleSocialShare('instagram')} variant="outline" size="sm">
                <span role="img" aria-label="인스타그램">📸</span> 인스타 공유
              </Button>
              <Button onClick={() => handleSocialShare('twitter')} variant="outline" size="sm">
                <span role="img" aria-label="트위터">🐦</span> 트위터
              </Button>
              <Button onClick={() => handleSocialShare('facebook')} variant="outline" size="sm">
                <span role="img" aria-label="페이스북">📘</span> 페이스북
              </Button>
            </div>
            {/* 복사 버튼 */}
            <div className="flex items-center space-x-2 mt-4 justify-center">
              <input type="text" readOnly value={url} className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm max-w-xs" />
              <button onClick={handleCopy} className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition" disabled={!url}>{copySuccess ? '복사됨!' : '복사'}</button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button variant="primary" onClick={goToStory}>자서전 보기</Button>
            <Button variant="outline" onClick={() => router.push('/')}>홈으로 돌아가기</Button>
          </div>
          <p className="text-gray-500 mt-12">소중한 삶의 이야기를 담아주셔서 감사합니다.<br />언제든지 추가로 자서전을 작성하실 수 있습니다.</p>
        </div>
      </MainLayout>
    );
  }

  // Firestore 기반(gpt/공유형)
  const url = story ? window.location.origin + (story.shareUrl || `/story/${story.userId}/${story.storyNumber}`) : '';
  return (
    <MainLayout title="자서전 생성 완료" description="자서전이 성공적으로 생성되었습니다.">
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-block mb-4">
          <div className="success-animation">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2">자서전 생성 완료!</h1>
        <p className="text-lg text-gray-600 mb-6">당신의 이야기가 멋진 디지털 자서전으로 완성되었습니다.<br />아래 링크를 통해 소중한 사람들과 공유해보세요.</p>
        {/* 메시지(있으면) */}
        {message && (
          <div className="w-full max-w-md mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100 mx-auto">
            <p className="text-sm text-indigo-700 italic">&ldquo;{message}&rdquo;</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">자서전 링크</h2>
            <div className="flex items-center space-x-2">
              <input type="text" readOnly value={url} className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm" />
              <button onClick={handleCopy} className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition" disabled={!url}>{copySuccess ? '복사됨!' : '복사'}</button>
            </div>
            {/* 소셜 공유 버튼 */}
            <div className="flex gap-3 justify-center mt-4">
              <Button onClick={() => handleSocialShare('kakao')} variant="outline" size="sm">
                <span role="img" aria-label="카카오톡">💬</span> 카톡 공유
              </Button>
              <Button onClick={() => handleSocialShare('instagram')} variant="outline" size="sm">
                <span role="img" aria-label="인스타그램">📸</span> 인스타 공유
              </Button>
              <Button onClick={() => handleSocialShare('twitter')} variant="outline" size="sm">
                <span role="img" aria-label="트위터">🐦</span> 트위터
              </Button>
              <Button onClick={() => handleSocialShare('facebook')} variant="outline" size="sm">
                <span role="img" aria-label="페이스북">📘</span> 페이스북
              </Button>
            </div>
          </div>
          {/* Firestore 기반 UI에 description, authorName 표시 */}
          <p className="text-gray-600 mb-2">작가: {story?.authorName || '작가 미상'}</p>
          {story?.description && (
            <p className="text-indigo-700 mb-4 text-base font-medium">&ldquo;{story.description}&rdquo;</p>
          )}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button variant="primary" onClick={goToStory}>자서전 보기</Button>
            <Button variant="secondary" size="lg" onClick={createNewStory}>새 자서전 작성하기</Button>
          </div>
        </div>
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-2">💡 자서전 공유 팁</h3>
          <ul className="text-blue-700 space-y-2">
            <li>링크를 메신저(카카오톡, 라인 등)로 전송하여 친구들과 공유하세요.</li>
            <li>SNS에 링크를 포스팅하여 더 많은 사람들과 이야기를 나눠보세요.</li>
            <li>이메일로 링크를 보내 특별한 사람들과 개인적으로 공유할 수 있습니다.</li>
          </ul>
        </div>
      </div>
      <style jsx>{`
        .success-animation {
          margin: 0 auto;
        }
        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #4f46e5;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #4f46e5;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #4f46e5;
          fill: none;
          animation: stroke .6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke .3s cubic-bezier(0.65, 0, 0.45, 1) .8s forwards;
        }
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }
        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 30px #f3f4ff;
          }
        }
      `}</style>
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
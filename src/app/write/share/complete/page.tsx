'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { getStory } from '@/lib/db';

export default function CompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams?.get('id');
  
  const [previewLink, setPreviewLink] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  
  useEffect(() => {
    // 스토리 ID가 없으면 공유 페이지로 리디렉션
    if (!storyId) {
      router.push('/write/share');
      return;
    }
    
    const getStoryLink = async () => {
      try {
        // 스토리 정보 가져오기
        const storyInfo = await getStory(storyId);
        
        if (storyInfo && storyInfo.shareUrl) {
          // shareUrl이 명시적으로 있는 경우 사용
          setPreviewLink(storyInfo.shareUrl);
        } else if (storyInfo && storyInfo.userId && storyInfo.storyNumber) {
          // userId와 storyNumber가 있는 경우 URL 생성
          setPreviewLink(`/story/${storyInfo.userId}/${storyInfo.storyNumber}`);
        } else {
          // 정보가 불충분한 경우 기존 방식 사용
          console.warn('스토리에 완전한 URL 정보가 없습니다. 기존 방식으로 대체합니다.');
          setPreviewLink(`/story/${storyId}`);
        }
      } catch (error) {
        console.error('스토리 정보 가져오기 오류:', error);
        // 오류 발생 시 기존 방식 사용
        setPreviewLink(`/story/${storyId}`);
      }
    };
    
    getStoryLink();
  }, [storyId, router]);

  // 링크 복사
  const copyLink = () => {
    if (!previewLink) return;
    
    const fullLink = window.location.origin + previewLink;
    navigator.clipboard.writeText(fullLink)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('링크 복사 오류:', err);
      });
  };

  // 스토리로 이동
  const goToStory = () => {
    if (previewLink) {
      window.open(previewLink, '_blank');
    }
  };

  // 새 자서전 작성하기
  const createNewStory = () => {
    // 메인 페이지로 이동
    router.push('/');
  };

  return (
    <MainLayout 
      title="자서전 생성 완료" 
      description="자서전이 성공적으로 생성되었습니다."
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="success-animation">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2">
            자서전 생성 완료!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            당신의 이야기가 멋진 디지털 자서전으로 완성되었습니다.
            아래 링크를 통해 소중한 사람들과 공유해보세요.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* 링크 표시 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">자서전 링크</h2>
            <div className="flex items-center space-x-2">
              <input 
                type="text"
                readOnly
                value={previewLink ? window.location.origin + previewLink : '링크 생성 중...'}
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button 
                onClick={copyLink}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                disabled={!previewLink}
              >
                {copySuccess ? '복사됨!' : '복사'}
              </button>
            </div>
          </div>

          {/* 작업 버튼 */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={goToStory}
              disabled={!previewLink}
            >
              자서전 보기
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={createNewStory}
            >
              새 자서전 작성하기
            </Button>
          </div>
        </div>

        {/* 공유 팁 */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-2">
            💡 자서전 공유 팁
          </h3>
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
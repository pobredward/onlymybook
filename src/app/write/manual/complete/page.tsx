'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function ManualCompletePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // 태그 목록 정의
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

  useEffect(() => {
    // 저장된 자서전 정보 불러오기
    const savedContentJson = localStorage.getItem('autobiography_manual_published');
    if (savedContentJson) {
      try {
        const savedContent = JSON.parse(savedContentJson);
        setTitle(savedContent.title || '나의 자서전');
        setAuthorName(savedContent.authorName || '작가님');
        
        // 태그 불러오기
        if (savedContent.tags && Array.isArray(savedContent.tags)) {
          setTags(savedContent.tags);
        }
      } catch (e: unknown) {
        console.error('저장된 내용 파싱 오류:', e);
      }
    } else {
      // 저장된 데이터가 없으면 메인으로 리다이렉트
      router.replace('/');
    }
  }, [router]);

  return (
    <MainLayout
      title="자서전 완성"
      description="자서전이 성공적으로 완성되었습니다."
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mb-8 flex justify-center">
          <CheckCircleIcon className="h-20 w-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
          축하합니다!
        </h1>
        
        <p className="text-xl text-gray-600 mb-6">
          <span className="font-semibold">{title}</span> 자서전이 성공적으로 완성되었습니다.
        </p>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 mb-6">작가: {authorName}</p>
          
          {tags.length > 0 && (
            <div className="flex justify-center mb-6 gap-2">
              {tags.map(tagId => {
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
          
          <div className="text-center text-gray-500 italic">
            "자신의 이야기를 써내려간다는 것은 인생을 다시 한번 되돌아보는 귀중한 여정입니다."
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            variant="primary"
            onClick={() => {
              // TODO: 나중에 실제 자서전 보기 페이지로 연결
              router.push('/');
            }}
          >
            자서전 보기
          </Button>
          
          <Link href="/">
            <Button variant="outline">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
        
        <p className="text-gray-500 mt-12">
          소중한 삶의 이야기를 담아주셔서 감사합니다.
          <br />
          언제든지 추가로 자서전을 작성하실 수 있습니다.
        </p>
      </div>
    </MainLayout>
  );
} 
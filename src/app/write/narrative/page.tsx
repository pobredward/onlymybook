'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { MainLayout } from '@/components/layout/MainLayout';

// 자서전 서사 유형 정의
interface NarrativeType {
  id: string;
  title: string;
  description: string;
  emoji: string;
  label: string;
}

// 서사 유형 목록
const NARRATIVE_TYPES: NarrativeType[] = [
  {
    id: 'type_struggle',
    title: '나는 버티는 법을 배웠다',
    description: '누구보다 힘들었지만, 그만큼 단단해졌습니다.',
    emoji: '🌪️',
    label: '힘든 시간'
  },
  {
    id: 'type_success',
    title: '나의 성공, 그 시작은 이랬다',
    description: '결국 해냈다. 나만의 방식으로.',
    emoji: '🚀',
    label: '성공'
  },
  {
    id: 'type_experience',
    title: '많이 해봤고, 그만큼 배웠다',
    description: '경험으로 쌓은 내 인생의 도서관',
    emoji: '🧭',
    label: '경험'
  },
  {
    id: 'type_wound_heal',
    title: '아픔을 안고 살아가는 법',
    description: '상처는 지워지지 않지만, 덮을 수는 있어요.',
    emoji: '💔',
    label: '상처와 치유'
  },
  {
    id: 'type_values_growth',
    title: '나는 이렇게 성장했다',
    description: '성공보다 더 중요한 건, 매일 조금씩 나아지는 것',
    emoji: '🌱',
    label: '가치와 성장'
  },
  {
    id: 'free_topic',
    title: '자유 주제',
    description: '원하는 주제로 자유롭게 작성할 수 있습니다.',
    emoji: '✍️',
    label: '자유 주제'
  }
];

export default function NarrativePage() {
  const router = useRouter();
  const [selectedNarrativeType, setSelectedNarrativeType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 로컬 스토리지에서 개인 정보 가져오기
  useEffect(() => {
    const savedNarrativeType = localStorage.getItem('autobiography_narrative_type');
    if (savedNarrativeType) {
      setSelectedNarrativeType(savedNarrativeType);
    }
  }, []);

  // 서사 유형 선택 처리
  const handleNarrativeSelection = (narrativeId: string) => {
    setSelectedNarrativeType(narrativeId);
  };

  // 다음 단계로 이동
  const goToNextStep = () => {
    if (!selectedNarrativeType) {
      setError('주제를 선택해주세요.');
      return;
    }
    localStorage.setItem('autobiography_narrative_type', selectedNarrativeType);
    router.push('/write/content');
  };

  // 이전 단계로 이동
  const goToPreviousStep = () => {
    router.push('/write');
  };

  // 단계 표시기 3단계로 변경
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 w-full">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white">
          1
        </div>
        <p className="mt-2 text-sm text-gray-600">주제 선택</p>
      </div>
      <div className="flex-1 h-1 mx-2 sm:mx-4 bg-indigo-600" />
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
          2
        </div>
        <p className="mt-2 text-sm text-gray-600">작성</p>
      </div>
      <div className="flex-1 h-1 mx-2 sm:mx-4 bg-gray-200" />
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
          3
        </div>
        <p className="mt-2 text-sm text-gray-600">공유</p>
      </div>
    </div>
  );

  return (
    <MainLayout 
      title="자서전 작성하기 - 주제 선택" 
      description="자서전의 첫 장을 어떤 이야기로 시작할지 선택하세요."
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl xs:text-3xl font-extrabold text-gray-900 sm:text-4xl">
            당신의 이야기를 어떻게 시작할까요?
          </h1>
          <p className="mt-4 text-base sm:text-xl text-gray-500">
            자서전의 1장은 당신의 인생 이야기가 어떤 방향으로 흘러갈지 결정합니다.
            아래 주제 중 하나를 선택해주세요.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {renderStepIndicator()}
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">자서전 주제 선택</h2>
              {selectedNarrativeType && (
                <span className="text-green-600 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  선택 완료
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-6">
              당신의 자서전은 어떤 이야기로 시작하고 싶나요? 이 선택이 전체 자서전의 톤과 방향성을 결정합니다.
            </p>
            
            <div className="space-y-4">
              {NARRATIVE_TYPES.map((narrative) => (
                <div 
                  key={narrative.id} 
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedNarrativeType === narrative.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-300'
                    }
                  `}
                  onClick={() => handleNarrativeSelection(narrative.id)}
                >
                  <div className="flex items-start">
                    <div className="mr-4">
                      <span className="text-3xl" role="img" aria-label={narrative.label}>{narrative.emoji}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">1장. {narrative.title}</h3>
                      <p className="text-gray-600">{narrative.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                type="button" 
                variant="secondary" 
                size="lg" 
                onClick={goToPreviousStep}
              >
                이전
              </Button>
              
              <Button 
                type="button" 
                variant="primary" 
                size="lg" 
                disabled={!selectedNarrativeType}
                onClick={goToNextStep}
              >
                다음
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
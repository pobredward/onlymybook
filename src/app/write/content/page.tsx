'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { MainLayout } from '@/components/layout/MainLayout';
import { TextArea } from '@/components/ui/TextArea';

// 서사 유형별 질문 정의
interface Question {
  id: string;
  text: string;
  type: string;
  placeholder: string;
  required?: boolean;
}

interface NarrativeType {
  id: string;
  title: string;
  description: string;
  emoji: string;
  questions: Question[];
}

// 서사 유형 목록
const NARRATIVE_TYPES: NarrativeType[] = [
  {
    id: 'type_struggle',
    title: '나는 버티는 법을 배웠다',
    description: '누구보다 힘들었지만, 그만큼 단단해졌습니다.',
    emoji: '🌪️',
    questions: [
      {
        id: 'struggle_hardest_time',
        text: '당신의 인생에서 가장 힘들었던 시기는 언제였나요?',
        type: 'longText',
        placeholder: '예: 대학교 1학년 때 혼자 서울에 올라와 생활했던 시기가 가장 힘들었습니다. 고향에서 멀리 떨어져 모든 것을 스스로 해결해야 했고...',
        required: true
      },
      {
        id: 'struggle_overcome',
        text: '그 시기를 어떻게 견뎌냈나요?',
        type: 'longText',
        placeholder: '예: 매주 주말마다 일기를 쓰면서 감정을 정리했습니다. 또한 같은 처지의 친구들과 함께 공부하고 의지하면서...',
        required: true
      },
      {
        id: 'struggle_message',
        text: '다시 그 시절로 돌아간다면 하고 싶은 말은?',
        type: 'longText',
        placeholder: '예: 지금은 힘들어도 이 모든 경험이 나중에 큰 자산이 될 거야. 너무 스스로를 몰아붙이지 말고...',
        required: true
      },
      {
        id: 'struggle_lesson',
        text: '그 시간을 통해 배운 가장 큰 교훈은 무엇인가요?',
        type: 'longText',
        placeholder: '예: 힘든 시간은 반드시 지나간다는 것을 배웠습니다. 또한 정말 중요한 것이 무엇인지 분별하는 눈을...',
        required: true
      }
    ]
  },
  {
    id: 'type_success',
    title: '나의 성공, 그 시작은 이랬다',
    description: '결국 해냈다. 나만의 방식으로.',
    emoji: '🚀',
    questions: [
      {
        id: 'success_achievement',
        text: '가장 자랑스러운 성취는 무엇인가요?',
        type: 'longText',
        placeholder: '예: 40대에 접어든 나이에 새로운 사업을 시작해 3년 만에 업계에서 인정받는 회사로 성장시킨 것입니다...',
        required: true
      },
      {
        id: 'success_process',
        text: '그 결과를 이루기까지 어떤 과정을 겪었나요?',
        type: 'longText',
        placeholder: '예: 처음에는 아무도 믿어주지 않았습니다. 100군데가 넘는 투자사를 찾아다니며 제안서를 발표했고...',
        required: true
      },
      {
        id: 'success_change',
        text: '성공 이후 삶은 어떻게 달라졌나요?',
        type: 'longText',
        placeholder: '예: 물질적인 풍요보다 더 큰 변화는 자신감이었습니다. 내가 정말 원하는 일을 할 수 있다는 믿음이 생겼고...',
        required: true
      }
    ]
  },
  {
    id: 'type_experience',
    title: '많이 해봤고, 그만큼 배웠다',
    description: '경험으로 쌓은 내 인생의 도서관',
    emoji: '🧭',
    questions: [
      {
        id: 'experience_unique',
        text: '당신이 도전해봤던 일 중 가장 독특한 것은?',
        type: 'longText',
        placeholder: '예: 30대 중반에 모든 것을 정리하고 1년간 세계 일주를 떠났습니다. 총 15개국을 배낭 하나만 메고 여행하면서...',
        required: true
      },
      {
        id: 'experience_change',
        text: '어떤 경험이 당신을 가장 많이 바꿨나요?',
        type: 'longText',
        placeholder: '예: 해외 봉사활동 중에 만난 현지 아이들과의 만남이 저를 가장 많이 변화시켰습니다. 그들의 웃음과 순수함이...',
        required: true
      },
      {
        id: 'experience_meaning',
        text: '삶에서 경험이란 어떤 의미인가요?',
        type: 'longText',
        placeholder: '예: 저에게 경험은 책으로 배울 수 없는 살아있는 지혜입니다. 다양한 경험을 통해 세상을 보는 시야가 넓어지고...',
        required: true
      }
    ]
  },
  {
    id: 'type_wound_heal',
    title: '아픔을 안고 살아가는 법',
    description: '상처는 지워지지 않지만, 덮을 수는 있어요.',
    emoji: '💔',
    questions: [
      {
        id: 'wound_remain',
        text: '아직도 마음속에 남아있는 상처가 있나요?',
        type: 'longText',
        placeholder: '예: 20대 초반에 겪은 이별의 아픔이 아직도 가끔 떠오릅니다. 7년을 함께했던 사람과의 갑작스러운 이별은...',
        required: true
      },
      {
        id: 'wound_change',
        text: '그 아픔은 당신을 어떻게 바꿨나요?',
        type: 'longText',
        placeholder: '예: 그 일 이후로 관계에 더 신중해졌습니다. 동시에 내면의 감정을 더 솔직하게 표현하는 법을 배웠고...',
        required: true
      },
      {
        id: 'wound_now',
        text: '지금의 나에게 그 상처는 어떤 존재인가요?',
        type: 'longText',
        placeholder: '예: 이제는 그 상처가 제 인생에서 중요한 전환점이었다고 생각합니다. 그 경험이 없었다면 지금의 더 단단한 나를...',
        required: true
      },
      {
        id: 'wound_healing',
        text: '어떤 방법으로 치유의 과정을 겪었나요?',
        type: 'longText',
        placeholder: '예: 글쓰기가 가장 큰 치유의 도구였습니다. 또한 비슷한 경험을 가진 사람들의 모임에 참여하면서...',
        required: true
      }
    ]
  },
  {
    id: 'type_values_growth',
    title: '나는 이렇게 성장했다',
    description: '성공보다 더 중요한 건, 매일 조금씩 나아지는 것',
    emoji: '🌱',
    questions: [
      {
        id: 'growth_moment',
        text: '성장했다고 느끼는 순간은 언제였나요?',
        type: 'longText',
        placeholder: '예: 처음으로 큰 프로젝트를 맡아 성공적으로 마쳤을 때, 제가 많이 성장했음을 깨달았습니다. 이전의 저라면...',
        required: true
      },
      {
        id: 'growth_values',
        text: '어떤 가치관이 당신을 이끌어왔나요?',
        type: 'longText',
        placeholder: '예: 정직과 꾸준함이 제 삶의 중심 가치입니다. 어떤 상황에서도 거짓말하지 않고, 하루하루 꾸준히 노력하는 것이...',
        required: true
      },
      {
        id: 'growth_advice',
        text: '예전의 나에게 조언해주고 싶은 말이 있다면?',
        type: 'longText',
        placeholder: '예: 모든 선택에 너무 오래 고민하지 마. 때로는 직감을 믿고 빠르게 결정하는 것도 필요해. 그리고 실패를 두려워하지 마...',
        required: true
      }
    ]
  }
];

export default function ContentPage() {
  const router = useRouter();
  const [selectedNarrativeType, setSelectedNarrativeType] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState<Record<string, unknown>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 가져오기
  useEffect(() => {
    // 서사 유형 불러오기
    const savedNarrativeType = localStorage.getItem('autobiography_narrative_type');
    if (savedNarrativeType) {
      setSelectedNarrativeType(savedNarrativeType);
    } else {
      // 서사 유형이 없으면 이전 단계로 리디렉션
      router.push('/write/narrative');
      return;
    }

    // 개인 정보 불러오기
    const savedPersonalInfo = localStorage.getItem('autobiography_personal_info');
    if (savedPersonalInfo) {
      try {
        setPersonalInfo(JSON.parse(savedPersonalInfo));
      } catch (e) {
        console.error('Failed to parse saved personal info:', e);
      }
    } else {
      // 개인 정보가 없으면 첫 단계로 리디렉션
      router.push('/write/personal');
      return;
    }

    // 기존 답변 불러오기
    const savedAnswers = localStorage.getItem('autobiography_content_answers');
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error('Failed to parse saved answers:', e);
      }
    }
  }, [router]);

  // 폼 작성 완료 여부 확인
  useEffect(() => {
    if (!selectedNarrativeType) return;

    const narrativeType = NARRATIVE_TYPES.find(n => n.id === selectedNarrativeType);
    if (!narrativeType) return;

    const requiredQuestions = narrativeType.questions.filter(q => q.required);
    const isComplete = requiredQuestions.every(q => 
      answers[q.id] !== undefined && answers[q.id].trim() !== ''
    );

    setIsFormComplete(isComplete);
  }, [answers, selectedNarrativeType]);

  // 답변 변경 처리
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // 다음 단계로 이동
  const goToNextStep = () => {
    if (!isFormComplete) {
      setError('모든 필수 질문에 답변해주세요.');
      return;
    }

    // 로컬 스토리지에 답변 저장
    localStorage.setItem('autobiography_content_answers', JSON.stringify(answers));
    
    // 다음 페이지로 이동
    router.push('/write/share');
  };

  // 이전 단계로 이동
  const goToPreviousStep = () => {
    // 현재 답변 저장
    localStorage.setItem('autobiography_content_answers', JSON.stringify(answers));
    
    // 이전 페이지로 이동
    router.push('/write/narrative');
  };

  // 선택된 서사 유형 가져오기
  const selectedNarrative = selectedNarrativeType 
    ? NARRATIVE_TYPES.find(n => n.id === selectedNarrativeType) 
    : null;

  // 단계 표시기
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 w-full">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white">
          1
        </div>
        <p className="mt-2 text-sm text-gray-600">개인 정보</p>
      </div>
      
      <div className="flex-1 h-1 mx-2 sm:mx-4 bg-indigo-600" />
      
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white">
          2
        </div>
        <p className="mt-2 text-sm text-gray-600">1장 주제 선택</p>
      </div>
      
      <div className="flex-1 h-1 mx-2 sm:mx-4 bg-indigo-600" />
      
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white">
          3
        </div>
        <p className="mt-2 text-sm text-gray-600">1장 작성</p>
      </div>
      
      <div className="flex-1 h-1 mx-2 sm:mx-4 bg-gray-200" />
      
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
          4
        </div>
        <p className="mt-2 text-sm text-gray-600">공유</p>
      </div>
    </div>
  );

  if (!selectedNarrative) {
    return (
      <MainLayout 
        title="자서전 작성하기 - 로딩 중" 
        description="자서전 작성 정보를 불러오는 중입니다."
      >
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">정보를 불러오는 중입니다...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`자서전 작성하기 - ${selectedNarrative.title}`} 
      description="자서전의 첫 장을 작성하세요."
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl xs:text-3xl font-extrabold text-gray-900 sm:text-4xl">
            당신의 이야기를 들려주세요
          </h1>
          <p className="mt-4 text-base sm:text-xl text-gray-500">
            질문에 답하면서 자서전의 첫 장을 완성해보세요.
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
            <div className="flex items-center mb-4">
              <div className="mr-3 text-3xl">
                <span role="img" aria-label={selectedNarrative.title}>{selectedNarrative.emoji}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                1장. {selectedNarrative.title} 작성하기
              </h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              이 질문들에 답변하여 자서전의 첫 장을 완성해보세요.
              {selectedNarrative.id === 'type_struggle' && ' 당신의 인생에서 겪은 어려움과 극복 과정에 대해 이야기해주세요.'}
              {selectedNarrative.id === 'type_success' && ' 당신의 성공 스토리와 그 과정에서의 경험을 공유해주세요.'}
              {selectedNarrative.id === 'type_experience' && ' 다양한 경험을 통해 배운 교훈과 인사이트를 들려주세요.'}
              {selectedNarrative.id === 'type_wound_heal' && ' 상처와 아픔을 어떻게 극복하고 치유해왔는지 이야기해주세요.'}
              {selectedNarrative.id === 'type_values_growth' && ' 당신의 성장 과정과 중요한 가치관에 대해 공유해주세요.'}
            </p>
            
            <div className="space-y-6">
              {selectedNarrative.questions.map(question => (
                <div key={question.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <TextArea
                    label={question.text + (question.required ? ' *' : '')}
                    placeholder={question.placeholder}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    required={question.required}
                    rows={6}
                  />
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
                disabled={!isFormComplete}
                onClick={goToNextStep}
              >
                다음
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-start">
                <div className="mr-3 text-2xl">✨</div>
                <div>
                  <h3 className="font-medium text-lg text-indigo-800">미리보기 단계에 가까워지고 있어요!</h3>
                  <p className="text-indigo-600 mt-1">
                    자서전의 가장 중요한 첫 장을 작성하셨습니다. 다음 단계에서는 공유 방식을 설정할 수 있습니다.
                    그 후에 완성된 1장 미리보기를 확인하실 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
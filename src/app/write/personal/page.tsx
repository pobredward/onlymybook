'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { useAuth } from '@/contexts/AuthContext';

// 개인 정보 카테고리 정의 - 생애사 면담(life history interview) 기반 질문 구성
export const PERSONAL_INFO_CATEGORY = {
  id: 'personal_info',
  title: '개인 정보',
  questions: [
    // 필수 정보 (기초 데이터)
    {
      id: 'name',
      text: '이름 (혹은 필명)을 알려주세요',
      type: 'shortText',
      placeholder: '홍길동',
      required: true,
    },
    {
      id: 'birth_year',
      text: '출생연도를 알려주세요',
      type: 'select',
      required: true,
      options: Array.from({ length: 100 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: year.toString(), label: year.toString() + '년' };
      }),
    },
    {
      id: 'gender',
      text: '성별 정체성을 알려주세요',
      type: 'radio',
      required: true,
      options: [
        { value: 'male', label: '남성' },
        { value: 'female', label: '여성' },
        { value: 'other', label: '기타' },
        { value: 'prefer_not_to_say', label: '밝히고 싶지 않음' },
      ],
    },
    {
      id: 'current_residence',
      text: '현재 거주지(도시, 지역)는 어디인가요?',
      type: 'shortText',
      placeholder: '서울특별시 강남구',
      required: true,
    },
    {
      id: 'birthplace',
      text: '출생지(도시, 국가 포함)는 어디인가요?',
      type: 'shortText',
      placeholder: '부산광역시 해운대구',
      required: true,
    },
    
    // 배경 정보 (삶의 맥락을 형성)
    {
      id: 'childhood_place',
      text: '어린 시절을 보낸 장소는 어디인가요?',
      type: 'longText',
      placeholder: '고향 또는 가장 오래 산 동네',
    },
    {
      id: 'family_structure',
      text: '가족 구성은 어떻게 되었나요?',
      type: 'longText',
      placeholder: '예: 부모님, 형제자매, 조부모 등',
    },
    {
      id: 'childhood_atmosphere',
      text: '성장 과정에서 기억에 남는 분위기나 가치관이 있나요?',
      type: 'longText',
      placeholder: '예: 엄격함, 따뜻함, 자유로움 등',
    },
    {
      id: 'childhood_activity',
      text: '어릴 적 가장 좋아했던 활동은 무엇인가요?',
      type: 'longText',
      placeholder: '놀이, 취미, 꿈 등',
    },
    
    // 자기 인식과 정체성
    {
      id: 'self_introduction',
      text: '당신을 한 문장으로 소개한다면 어떻게 말하고 싶나요?',
      type: 'longText',
      placeholder: '예: 나는 언제나 호기심 많은 관찰자입니다.',
    },
    {
      id: 'life_description',
      text: '지금까지 당신의 삶을 가장 잘 설명해주는 단어나 문장은?',
      type: 'shortText',
      placeholder: '예: 그래도, 버텨냈다.',
    },
    {
      id: 'important_values',
      text: '지금 당신에게 중요한 가치는 무엇인가요?',
      type: 'shortText',
      placeholder: '예: 자유, 성실, 사랑, 배려 등',
    },
    
    // 기타 (선택적 감정 유도형)
    {
      id: 'memorable_place',
      text: '당신의 삶에서 가장 자주 떠오르는 장소는 어디인가요?',
      type: 'longText',
      placeholder: '장소명 + 이유',
    },
    {
      id: 'current_thoughts',
      text: '요즘 가장 많이 생각하는 것은 무엇인가요?',
      type: 'longText',
      placeholder: '내면을 꺼내는 질문',
    },
    {
      id: 'current_self',
      text: '누군가에게 소개하고 싶은 \'지금의 나\'는 어떤 모습인가요?',
      type: 'longText',
      placeholder: '자기성찰 기반',
    },
  ],
};

// 질문 타입 정의
interface Question {
  id: string;
  text: string;
  type: 'shortText' | 'longText' | 'radio' | 'checkbox' | 'date' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

// 섹션 타입 정의
interface Section {
  title: string;
  description: string;
  questions: Question[];
}

// 개인 정보 섹션 분류
const personalInfoSections: Section[] = [
  {
    title: '필수 정보',
    description: '자서전의 기본적인 정보를 입력해주세요.',
    questions: PERSONAL_INFO_CATEGORY.questions.filter(q => 
      ['name', 'birth_year', 'gender', 'current_residence', 'birthplace'].includes(q.id)
    ) as Question[]
  },
  {
    title: '배경 정보',
    description: '삶의 맥락을 형성하는 배경에 대해 이야기해주세요.',
    questions: PERSONAL_INFO_CATEGORY.questions.filter(q => 
      ['childhood_place', 'family_structure', 'childhood_atmosphere', 'childhood_activity'].includes(q.id)
    ) as Question[]
  },
  {
    title: '자기 인식과 정체성',
    description: '당신을 특별하게 만드는 정체성과 가치관에 대해 설명해주세요.',
    questions: PERSONAL_INFO_CATEGORY.questions.filter(q => 
      ['self_introduction', 'life_description', 'important_values'].includes(q.id)
    ) as Question[]
  },
  {
    title: '감정과 현재',
    description: '현재의 감정과 생각을 공유해주세요.',
    questions: PERSONAL_INFO_CATEGORY.questions.filter(q => 
      ['memorable_place', 'current_thoughts', 'current_self'].includes(q.id)
    ) as Question[]
  },
];

const WritePersonalInfo = () => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [personalInfoComplete, setPersonalInfoComplete] = useState(false);

  // 저장된 데이터 불러오기
  useEffect(() => {
    const savedAnswers = localStorage.getItem('personalInfoAnswers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  // 로그인 상태 확인 후 리다이렉트
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth/login?redirect=/write/personal');
    }
  }, [currentUser, loading, router]);

  // 필수 질문 답변 확인
  useEffect(() => {
    const requiredQuestions = PERSONAL_INFO_CATEGORY.questions.filter(q => q.required);
    const allRequiredAnswered = requiredQuestions.every(q => {
      // 타입별로 검증 방식 분리
      switch(q.type) {
        case 'radio':
        case 'select':
          // 선택형 필드는 값이 존재하고 빈 문자열이 아닌지 확인
          return answers[q.id] !== undefined && answers[q.id] !== '';
        case 'shortText':
        case 'longText':
          // 텍스트 필드는 값이 존재하고 공백이 아닌 문자가 포함되어 있는지 확인
          return answers[q.id] !== undefined && 
                 typeof answers[q.id] === 'string' && 
                 (answers[q.id] as string).trim() !== '';
        case 'checkbox':
          // 체크박스는 boolean 값이므로 true인지 확인
          return answers[q.id] === true;
        default:
          return answers[q.id] !== undefined && answers[q.id] !== '';
      }
    });
    
    console.log("필수 질문 답변 확인:", requiredQuestions.map(q => ({
      id: q.id,
      value: answers[q.id],
      answered: answers[q.id] !== undefined && answers[q.id] !== ''
    })));
    
    setPersonalInfoComplete(allRequiredAnswered);
  }, [answers]);

  // 답변 변경 처리
  const handleAnswerChange = (questionId: string, value: string | boolean) => {
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('personalInfoAnswers', JSON.stringify(updatedAnswers));
  };

  // 다음 단계로 이동
  const goToNextStep = () => {
    // 로컬 스토리지에 개인 정보 저장
    localStorage.setItem('autobiography_personal_info', JSON.stringify(answers));
    
    // 다음 페이지로 이동 (주제 선택 페이지)
    router.push('/write/narrative');
  };

  // 로딩 중이거나 리다이렉트 중이면 로딩 UI 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }
  
  // 비로그인 상태일 때는 아무것도 렌더링하지 않음 (리다이렉트 처리 중)
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  // 단계 표시기
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 w-full">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white">
          1
        </div>
        <p className="mt-2 text-sm text-gray-600">개인 정보</p>
      </div>
      
      <div className="flex-1 h-1 mx-2 sm:mx-4 bg-gray-200" />
      
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
          2
        </div>
        <p className="mt-2 text-sm text-gray-600">1장 주제 선택</p>
      </div>
      
      <div className="flex-1 h-1 mx-2 sm:mx-4 bg-gray-200" />
      
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
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

  // 질문 렌더링 함수
  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'shortText':
        return (
          <div key={question.id} className="relative">
            <Input
              id={question.id}
              label={question.text}
              value={answers[question.id] as string || ''}
              placeholder={question.placeholder}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
            {question.required && (
              <span className="text-red-500 absolute top-0 left-[calc(100%-10px)]">*</span>
            )}
          </div>
        );
      case 'longText':
        return (
          <div key={question.id} className="relative">
            <TextArea
              id={question.id}
              label={question.text}
              value={answers[question.id] as string || ''}
              placeholder={question.placeholder}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
            {question.required && (
              <span className="text-red-500 absolute top-0 left-[calc(100%-10px)]">*</span>
            )}
          </div>
        );
      case 'radio':
        return (
          <div key={question.id} className="relative">
            <RadioGroup
              name={question.id}
              label={question.text}
              options={question.options || []}
              value={answers[question.id] as string || ''}
              onChange={(value) => handleAnswerChange(question.id, value)}
            />
            {question.required && (
              <span className="text-red-500 absolute top-0 left-[calc(100%-10px)]">*</span>
            )}
          </div>
        );
      case 'checkbox':
        return (
          <div key={question.id} className="relative">
            <Checkbox
              id={question.id}
              label={question.text}
              checked={answers[question.id] as boolean || false}
              onChange={(checked) => handleAnswerChange(question.id, checked)}
            />
            {question.required && (
              <span className="text-red-500 absolute top-0 left-[calc(100%-10px)]">*</span>
            )}
          </div>
        );
      case 'select':
        return (
          <div key={question.id} className="relative">
            <Select
              id={question.id}
              label={question.text}
              options={question.options || []}
              value={answers[question.id] as string || ''}
              onChange={(value) => handleAnswerChange(question.id, value)}
            />
            {question.required && (
              <span className="text-red-500 absolute top-0 left-[calc(100%-10px)]">*</span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout 
      title="자서전 작성하기 - 개인 정보" 
      description="자서전의 주인공인 당신에 대한 정보를 입력해주세요."
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl xs:text-3xl font-extrabold text-gray-900 sm:text-4xl">
            자서전 작성하기
          </h1>
          <p className="mt-4 text-base sm:text-xl text-gray-500">
            자서전의 주인공인 당신에 대한 정보를 입력해주세요.
          </p>
        </div>

        <div className="space-y-8">
          {renderStepIndicator()}
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. 개인 정보</h2>
            <p className="text-gray-700 mb-6">
              이 정보를 바탕으로 풍부한 자서전을 만들어 드립니다.
            </p>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  <span className="font-semibold">TIP:</span> 선택 항목까지 모두 입력하면 더 풍부한 자서전이 만들어집니다.
                  필수 항목(*)만 입력해도 자서전 미리보기를 확인할 수 있습니다.
                </p>
              </div>
              
              {/* 섹션별 질문 렌더링 */}
              {personalInfoSections.map((section, index) => (
                <details key={index} className="border border-gray-200 rounded-lg overflow-hidden" open={index === 0}>
                  <summary className="bg-gray-50 px-4 py-3 cursor-pointer flex items-center">
                    <span className="details-toggle inline-block transform transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-medium text-lg">
                        {section.title}
                        {index === 0 && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                    </div>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-600 mb-4">{section.description}</p>
                    <div className="space-y-4">
                      {section.questions.map(question => (
                        <div key={question.id} className="mb-4">
                          {renderQuestion(question)}
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-8">
          <Button
            variant="primary"
            onClick={goToNextStep}
            disabled={!personalInfoComplete}
          >
            다음
          </Button>
        </div>
      </div>
      
      <style jsx global>{`
        details summary {
          list-style: none;
        }
        details summary::-webkit-details-marker {
          display: none;
        }
        details[open] .details-toggle {
          transform: rotate(180deg);
        }
      `}</style>
    </MainLayout>
  );
}

export default WritePersonalInfo; 
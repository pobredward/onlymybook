import React from 'react';
import { TextArea } from '@/components/ui/TextArea';
import { Input } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

export interface QuestionOption {
  value: string;
  label: string;
}

export type QuestionType = 'shortText' | 'longText' | 'radio' | 'select' | 'checkbox';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  placeholder?: string;
  options?: QuestionOption[];
  required?: boolean;
}

export interface CategoryQuestions {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface QuestionFormProps {
  personalInfoCategory: CategoryQuestions;
  answers: Record<string, string | string[]>;
  onAnswerChange: (questionId: string, value: string | string[]) => void;
  isLoading?: boolean;
  isPersonalInfoCompleted: boolean;
  step: number;
  setStep: (step: number) => void;
  categories?: CategoryQuestions[];
  selectedCategory?: string | null;
  onSelectCategory?: (categoryId: string) => void;
}

// 공유 설정 인터페이스
export interface ShareSettings {
  message: string;
  isPublic: boolean;
  allowComments: boolean;
  allowReactions: boolean;
}

// 자서전 서사 유형 정의
export interface NarrativeType {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

// 서사 유형 목록
export const NARRATIVE_TYPES: NarrativeType[] = [
  {
    id: 'type_struggle',
    title: '나는 버티는 법을 배웠다',
    description: '누구보다 힘들었지만, 그만큼 단단해졌습니다.',
    questions: [
      {
        id: 'struggle_hardest_time',
        text: '당신의 인생에서 가장 힘들었던 시기는 언제였나요?',
        type: 'longText',
        placeholder: '예: 대학교 1학년 때 혼자 서울에 올라와 생활했던 시기가 가장 힘들었습니다. 고향에서 멀리 떨어져 모든 것을 스스로 해결해야 했고...'
      },
      {
        id: 'struggle_overcome',
        text: '그 시기를 어떻게 견뎌냈나요?',
        type: 'longText',
        placeholder: '예: 매주 주말마다 일기를 쓰면서 감정을 정리했습니다. 또한 같은 처지의 친구들과 함께 공부하고 의지하면서...'
      },
      {
        id: 'struggle_message',
        text: '다시 그 시절로 돌아간다면 하고 싶은 말은?',
        type: 'longText',
        placeholder: '예: 지금은 힘들어도 이 모든 경험이 나중에 큰 자산이 될 거야. 너무 스스로를 몰아붙이지 말고...'
      },
      {
        id: 'struggle_lesson',
        text: '그 시간을 통해 배운 가장 큰 교훈은 무엇인가요?',
        type: 'longText',
        placeholder: '예: 힘든 시간은 반드시 지나간다는 것을 배웠습니다. 또한 정말 중요한 것이 무엇인지 분별하는 눈을...'
      }
    ]
  },
  {
    id: 'type_success',
    title: '나의 성공, 그 시작은 이랬다',
    description: '결국 해냈다. 나만의 방식으로.',
    questions: [
      {
        id: 'success_achievement',
        text: '가장 자랑스러운 성취는 무엇인가요?',
        type: 'longText',
        placeholder: '예: 40대에 접어든 나이에 새로운 사업을 시작해 3년 만에 업계에서 인정받는 회사로 성장시킨 것입니다...'
      },
      {
        id: 'success_process',
        text: '그 결과를 이루기까지 어떤 과정을 겪었나요?',
        type: 'longText',
        placeholder: '예: 처음에는 아무도 믿어주지 않았습니다. 100군데가 넘는 투자사를 찾아다니며 제안서를 발표했고...'
      },
      {
        id: 'success_change',
        text: '성공 이후 삶은 어떻게 달라졌나요?',
        type: 'longText',
        placeholder: '예: 물질적인 풍요보다 더 큰 변화는 자신감이었습니다. 내가 정말 원하는 일을 할 수 있다는 믿음이 생겼고...'
      }
    ]
  },
  {
    id: 'type_experience',
    title: '많이 해봤고, 그만큼 배웠다',
    description: '경험으로 쌓은 내 인생의 도서관',
    questions: [
      {
        id: 'experience_unique',
        text: '당신이 도전해봤던 일 중 가장 독특한 것은?',
        type: 'longText',
        placeholder: '예: 30대 중반에 모든 것을 정리하고 1년간 세계 일주를 떠났습니다. 총 15개국을 배낭 하나만 메고 여행하면서...'
      },
      {
        id: 'experience_change',
        text: '어떤 경험이 당신을 가장 많이 바꿨나요?',
        type: 'longText',
        placeholder: '예: 해외 봉사활동 중에 만난 현지 아이들과의 만남이 저를 가장 많이 변화시켰습니다. 그들의 웃음과 순수함이...'
      },
      {
        id: 'experience_meaning',
        text: '삶에서 경험이란 어떤 의미인가요?',
        type: 'longText',
        placeholder: '예: 저에게 경험은 책으로 배울 수 없는 살아있는 지혜입니다. 다양한 경험을 통해 세상을 보는 시야가 넓어지고...'
      }
    ]
  },
  {
    id: 'type_wound_heal',
    title: '아픔을 안고 살아가는 법',
    description: '상처는 지워지지 않지만, 덮을 수는 있어요.',
    questions: [
      {
        id: 'wound_remain',
        text: '아직도 마음속에 남아있는 상처가 있나요?',
        type: 'longText',
        placeholder: '예: 20대 초반에 겪은 이별의 아픔이 아직도 가끔 떠오릅니다. 7년을 함께했던 사람과의 갑작스러운 이별은...'
      },
      {
        id: 'wound_change',
        text: '그 아픔은 당신을 어떻게 바꿨나요?',
        type: 'longText',
        placeholder: '예: 그 일 이후로 관계에 더 신중해졌습니다. 동시에 내면의 감정을 더 솔직하게 표현하는 법을 배웠고...'
      },
      {
        id: 'wound_now',
        text: '지금의 나에게 그 상처는 어떤 존재인가요?',
        type: 'longText',
        placeholder: '예: 이제는 그 상처가 제 인생에서 중요한 전환점이었다고 생각합니다. 그 경험이 없었다면 지금의 더 단단한 나를...'
      },
      {
        id: 'wound_healing',
        text: '어떤 방법으로 치유의 과정을 겪었나요?',
        type: 'longText',
        placeholder: '예: 글쓰기가 가장 큰 치유의 도구였습니다. 또한 비슷한 경험을 가진 사람들의 모임에 참여하면서...'
      }
    ]
  },
  {
    id: 'type_values_growth',
    title: '나는 이렇게 성장했다',
    description: '성공보다 더 중요한 건, 매일 조금씩 나아지는 것',
    questions: [
      {
        id: 'growth_moment',
        text: '성장했다고 느끼는 순간은 언제였나요?',
        type: 'longText',
        placeholder: '예: 처음으로 큰 프로젝트를 맡아 성공적으로 마쳤을 때, 제가 많이 성장했음을 깨달았습니다. 이전의 저라면...'
      },
      {
        id: 'growth_values',
        text: '어떤 가치관이 당신을 이끌어왔나요?',
        type: 'longText',
        placeholder: '예: 정직과 꾸준함이 제 삶의 중심 가치입니다. 어떤 상황에서도 거짓말하지 않고, 하루하루 꾸준히 노력하는 것이...'
      },
      {
        id: 'growth_advice',
        text: '예전의 나에게 조언해주고 싶은 말이 있다면?',
        type: 'longText',
        placeholder: '예: 모든 선택에 너무 오래 고민하지 마. 때로는 직감을 믿고 빠르게 결정하는 것도 필요해. 그리고 실패를 두려워하지 마...'
      }
    ]
  }
];

export const QuestionForm: React.FC<QuestionFormProps> = ({
  personalInfoCategory,
  answers,
  onAnswerChange,
  isLoading = false,
  isPersonalInfoCompleted,
  step,
  setStep,
}) => {
  // 선택된 서사 유형
  const [selectedNarrativeType, setSelectedNarrativeType] = React.useState<string | null>(null);
  
  // 공유 설정
  const [shareSettings, setShareSettings] = React.useState<ShareSettings>({
    message: '',
    isPublic: false,
    allowComments: true,
    allowReactions: true
  });
  
  // 미리보기 모드
  const [previewMode, setPreviewMode] = React.useState<boolean>(false);
  
  // 개인 정보 섹션을 카테고리로 분류
  const personalInfoSections = [
    {
      title: '기본 정보',
      description: '필수 입력 사항입니다.',
      questions: personalInfoCategory.questions.filter(q => q.required)
    },
    {
      title: '출생과 성장 배경',
      description: '당신의 뿌리에 대해 알려주세요.',
      questions: personalInfoCategory.questions.filter(q => 
        ['birthplace', 'childhood_place'].includes(q.id))
    },
    {
      title: '가족 관계',
      description: '가족과의 관계는 당신을 형성한 중요한 요소입니다.',
      questions: personalInfoCategory.questions.filter(q => 
        ['family_members', 'influential_family'].includes(q.id))
    },
    {
      title: '성격과 가치관',
      description: '당신을 이루는 내면의 특성을 소개해주세요.',
      questions: personalInfoCategory.questions.filter(q => 
        ['self_description', 'core_value'].includes(q.id))
    },
    {
      title: '추억과 감정',
      description: '인생의 소중한 순간들을 공유해주세요.',
      questions: personalInfoCategory.questions.filter(q => 
        ['happy_childhood_memory', 'special_moment'].includes(q.id))
    },
    {
      title: '일과 삶',
      description: '일하는 방식과 경험에 대해 알려주세요.',
      questions: personalInfoCategory.questions.filter(q => 
        ['occupation', 'memorable_work'].includes(q.id))
    },
    {
      title: '인생의 전환점',
      description: '삶의 중요한 변화와 결정들을 기록해보세요.',
      questions: personalInfoCategory.questions.filter(q => 
        ['turning_point', 'good_decision'].includes(q.id))
    },
    {
      title: '미래에게',
      description: '미래의 자신에게 남기고 싶은 메시지를 작성해보세요.',
      questions: personalInfoCategory.questions.filter(q => 
        ['message_to_future'].includes(q.id))
    }
  ].filter(section => section.questions.length > 0);

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'shortText':
        return (
          <Input
            label={question.text}
            placeholder={question.placeholder}
            value={answers[question.id] as string || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAnswerChange(question.id, e.target.value)}
            disabled={isLoading}
          />
        );
      case 'longText':
        return (
          <TextArea
            label={question.text}
            placeholder={question.placeholder}
            value={answers[question.id] as string || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            disabled={isLoading}
          />
        );
      case 'radio':
        return (
          <RadioGroup
            label={question.text}
            name={question.id}
            options={question.options || []}
            value={answers[question.id] as string}
            onChange={(value) => onAnswerChange(question.id, value)}
          />
        );
      case 'select':
        return (
          <Select
            label={question.text}
            options={question.options || []}
            value={answers[question.id] as string || ''}
            onChange={(value) => onAnswerChange(question.id, value)}
            disabled={isLoading}
          />
        );
      case 'checkbox':
        if (!question.options) return null;
        
        // 체크박스 그룹 처리
        const checkedValues = (answers[question.id] as string[]) || [];
        
        return (
          <div className="space-y-2">
            <p className="block text-gray-700 font-medium mb-2">{question.text}</p>
            {question.options.map(option => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={checkedValues.includes(option.value)}
                onChange={(checked) => {
                  const currentValues = [...checkedValues];
                  
                  if (checked) {
                    // 값 추가
                    if (!currentValues.includes(option.value)) {
                      currentValues.push(option.value);
                    }
                  } else {
                    // 값 제거
                    const index = currentValues.indexOf(option.value);
                    if (index > -1) {
                      currentValues.splice(index, 1);
                    }
                  }
                  
                  onAnswerChange(question.id, currentValues);
                }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  // 단계 표시기
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 w-full">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <p className="mt-2 text-sm text-gray-600">개인 정보</p>
      </div>
      
      <div className={`flex-1 h-1 mx-2 sm:mx-4 ${
        step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'
      }`} />
      
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
        <p className="mt-2 text-sm text-gray-600">1장 주제 선택</p>
      </div>
      
      <div className={`flex-1 h-1 mx-2 sm:mx-4 ${
        step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'
      }`} />
      
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          3
        </div>
        <p className="mt-2 text-sm text-gray-600">1장 작성</p>
      </div>
      
      <div className={`flex-1 h-1 mx-2 sm:mx-4 ${
        step >= 4 ? 'bg-indigo-600' : 'bg-gray-200'
      }`} />
      
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          step >= 4 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          4
        </div>
        <p className="mt-2 text-sm text-gray-600">공유</p>
      </div>
    </div>
  );
  
  // 공유 메시지 변경 핸들러
  const handleShareMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setShareSettings({
      ...shareSettings,
      message: e.target.value
    });
  };
  
  // 공유 설정 변경 핸들러
  const handleShareSettingChange = (setting: keyof ShareSettings, value: boolean) => {
    setShareSettings({
      ...shareSettings,
      [setting]: value
    });
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        /* 기본 브라우저 화살표 숨기기 */
        details > summary {
          list-style: none;
        }
        details > summary::-webkit-details-marker {
          display: none;
        }
        
        /* 커스텀 화살표 회전 효과 */
        details[open] .details-toggle {
          transform: rotate(180deg);
        }
        
        /* 모바일 최적화 스타일 */
        @media (max-width: 640px) {
          .mobile-friendly-padding {
            padding: 0.75rem !important;
          }
          .mobile-friendly-text {
            font-size: 0.95rem !important;
          }
          .input-container label {
            margin-bottom: 0.25rem !important;
          }
        }
        
        /* 봉투 애니메이션 */
        .envelope {
          transition: all 0.3s ease;
        }
        .envelope:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .envelope-open {
          animation: openEnvelope 1s forwards;
        }
        @keyframes openEnvelope {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 0; }
        }
        
        /* 손글씨 스타일 */
        .handwriting {
          font-family: 'Caveat', cursive, 'Nanum Pen Script', sans-serif;
          line-height: 1.5;
        }
      `}</style>
      
      {renderStepIndicator()}
      
      {/* 1단계: 개인 정보 */}
      <div className={`bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 ${step !== 1 ? 'opacity-70' : ''}`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-900">개인 정보</h2>
          {isPersonalInfoCompleted && (
            <span className="text-green-600 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              완료
            </span>
          )}
        </div>
        <p className="text-gray-600 mb-4">자서전에 포함될 기본 개인 정보를 작성해주세요.</p>
        
        {step === 1 && (
          <div className="space-y-4">
            {personalInfoSections.map((section, idx) => (
              <div key={section.title} className="border border-gray-200 rounded-lg overflow-hidden">
                <details open={idx === 0}>
                  <summary className={`p-3 sm:p-4 cursor-pointer flex items-center justify-between ${idx === 0 ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-600 transition-transform details-toggle flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h3 className="font-medium text-base sm:text-lg text-gray-900">{section.title}</h3>
                        <p className="text-sm sm:text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <span className="text-indigo-600 text-xs font-medium px-2 py-1 bg-indigo-100 rounded ml-2 flex-shrink-0">
                        필수
                      </span>
                    )}
                    {idx > 0 && (
                      <span className="text-gray-600 text-xs font-medium px-2 py-1 bg-gray-100 rounded ml-2 flex-shrink-0">
                        선택
                      </span>
                    )}
                  </summary>
                  <div className="p-3 sm:p-4 border-t border-gray-200 space-y-2">
                    {section.questions.map(question => (
                      <div key={question.id} className="p-1 sm:p-3 input-container">
                        {renderQuestion(question)}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ))}
            
            <div className="p-3 sm:p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-sm text-indigo-800">
                <span className="font-semibold">💡 TIP</span>: 추가 질문에 답할수록 더 풍부한 자서전이 완성됩니다. 
                선택 항목이지만, 자서전에 담기고 싶은 내용이 있다면 자유롭게 작성해주세요.
              </p>
            </div>
            
            <div className="flex justify-center sm:justify-end mt-4">
              <button
                type="button"
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isPersonalInfoCompleted}
                onClick={() => setStep(2)}
              >
                다음 단계
              </button>
            </div>
          </div>
        )}
        
        {step !== 1 && (
          <div className="mt-3">
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-800"
              onClick={() => setStep(1)}
            >
              수정하기
            </button>
          </div>
        )}
      </div>
      
      {/* 2단계: 1장 주제 선택 (서사 유형 선택) */}
      {(step === 2 || step > 2) && (
        <div className={`bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 ${step !== 2 ? 'opacity-70' : ''}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-900">자서전 1장 선택</h2>
            {selectedNarrativeType && (
              <span className="text-green-600 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                완료
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-4">당신의 자서전은 어떤 이야기로 시작하고 싶나요? 이 선택이 전체 자서전의 톤과 방향성을 결정합니다.</p>
          
          {step === 2 && (
            <>
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
                    onClick={() => setSelectedNarrativeType(narrative.id)}
                  >
                    <div className="flex items-start">
                      <div className="mr-4">
                        {narrative.id === 'type_struggle' && (
                          <span className="text-3xl" role="img" aria-label="힘든 시간">🌪️</span>
                        )}
                        {narrative.id === 'type_success' && (
                          <span className="text-3xl" role="img" aria-label="성공">🚀</span>
                        )}
                        {narrative.id === 'type_experience' && (
                          <span className="text-3xl" role="img" aria-label="경험">🧭</span>
                        )}
                        {narrative.id === 'type_wound_heal' && (
                          <span className="text-3xl" role="img" aria-label="상처와 치유">💔</span>
                        )}
                        {narrative.id === 'type_values_growth' && (
                          <span className="text-3xl" role="img" aria-label="가치와 성장">🌱</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">1장. {narrative.title}</h3>
                        <p className="text-gray-600">{narrative.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center sm:justify-end mt-6">
                <button
                  type="button"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedNarrativeType}
                  onClick={() => setStep(3)}
                >
                  다음 단계
                </button>
              </div>
            </>
          )}
          
          {step !== 2 && selectedNarrativeType && (
            <div className="mt-3 flex items-center">
              <div className="mr-2">
                {selectedNarrativeType === 'type_struggle' && (
                  <span className="text-2xl" role="img" aria-label="힘든 시간">🌪️</span>
                )}
                {selectedNarrativeType === 'type_success' && (
                  <span className="text-2xl" role="img" aria-label="성공">🚀</span>
                )}
                {selectedNarrativeType === 'type_experience' && (
                  <span className="text-2xl" role="img" aria-label="경험">🧭</span>
                )}
                {selectedNarrativeType === 'type_wound_heal' && (
                  <span className="text-2xl" role="img" aria-label="상처와 치유">💔</span>
                )}
                {selectedNarrativeType === 'type_values_growth' && (
                  <span className="text-2xl" role="img" aria-label="가치와 성장">🌱</span>
                )}
              </div>
              <div className="flex-1">
                <strong className="text-indigo-700">선택한 주제:</strong> 1장. {NARRATIVE_TYPES.find(n => n.id === selectedNarrativeType)?.title}
              </div>
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800 ml-4"
                onClick={() => setStep(2)}
              >
                변경하기
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 3단계: 1장 작성 */}
      {step === 3 && selectedNarrativeType && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="mr-3">
              {selectedNarrativeType === 'type_struggle' && (
                <span className="text-3xl" role="img" aria-label="힘든 시간">🌪️</span>
              )}
              {selectedNarrativeType === 'type_success' && (
                <span className="text-3xl" role="img" aria-label="성공">🚀</span>
              )}
              {selectedNarrativeType === 'type_experience' && (
                <span className="text-3xl" role="img" aria-label="경험">🧭</span>
              )}
              {selectedNarrativeType === 'type_wound_heal' && (
                <span className="text-3xl" role="img" aria-label="상처와 치유">💔</span>
              )}
              {selectedNarrativeType === 'type_values_growth' && (
                <span className="text-3xl" role="img" aria-label="가치와 성장">🌱</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              1장. {NARRATIVE_TYPES.find(n => n.id === selectedNarrativeType)?.title} 작성하기
            </h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            이 질문들에 답변하여 자서전의 첫 장을 완성해보세요. 
            {selectedNarrativeType === 'type_struggle' && '당신의 인생에서 겪은 어려움과 극복 과정에 대해 이야기해주세요.'}
            {selectedNarrativeType === 'type_success' && '당신의 성공 스토리와 그 과정에서의 경험을 공유해주세요.'}
            {selectedNarrativeType === 'type_experience' && '다양한 경험을 통해 배운 교훈과 인사이트를 들려주세요.'}
            {selectedNarrativeType === 'type_wound_heal' && '상처와 아픔을 어떻게 극복하고 치유해왔는지 이야기해주세요.'}
            {selectedNarrativeType === 'type_values_growth' && '당신의 성장 과정과 중요한 가치관에 대해 공유해주세요.'}
          </p>
          
          <div className="space-y-6">
            {NARRATIVE_TYPES
              .filter(narrative => narrative.id === selectedNarrativeType)
              .map(narrative => (
                <div key={narrative.id} className="space-y-6">
                  {narrative.questions.map(question => (
                    <div key={question.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 input-container">
                      {renderQuestion({
                        ...question,
                        required: true // 서사 질문은 모두 필수로 설정
                      })}
                    </div>
                  ))}
                </div>
              ))
            }
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-8">
            <div className="flex items-start">
              <div className="mr-3 text-2xl">✨</div>
              <div>
                <h3 className="font-medium text-lg text-indigo-800">미리보기 완성!</h3>
                <p className="text-indigo-600 mt-2">
                  축하합니다! 자서전 1장 미리보기를 작성하셨습니다. 
                  결제 후에는 나머지 챕터들도 작성하여 완성된 자서전을 만들 수 있습니다.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    className="px-6 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
                    onClick={() => setPreviewMode(true)}
                  >
                    자서전 미리보기 확인하기
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full sm:w-auto"
                    onClick={() => setStep(4)}
                  >
                    다음: 공유 설정하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 4단계: 공유 설정 */}
      {step === 4 && selectedNarrativeType && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-3 text-2xl">💌</span>
            자서전 공유하기
          </h2>
          
          <p className="text-gray-600 mb-6">
            당신의 자서전을 소중한 사람들과 공유해보세요. 공유 방식과 메시지를 설정할 수 있습니다.
          </p>
          
          {/* 디지털 봉투 미리보기 */}
          <div className="mb-8">
            <h3 className="font-medium text-lg text-gray-900 mb-3">디지털 봉투 미리보기</h3>
            <div className="border-2 border-dashed border-indigo-200 p-4 rounded-lg bg-indigo-50">
              <div className="envelope bg-white rounded-lg p-5 shadow-md text-center max-w-sm mx-auto">
                <div className="text-2xl mb-2">✉️</div>
                <p className="text-lg font-medium">홍길동 님이 당신에게 자서전을 전합니다.</p>
                {shareSettings.message && (
                  <p className="handwriting text-gray-700 italic mt-3 text-sm">&ldquo;{shareSettings.message}&rdquo;</p>
                )}
                <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
                  열어보기
                </button>
              </div>
            </div>
          </div>
          
          {/* 함께 보낼 메시지 */}
          <div className="mb-6">
            <h3 className="font-medium text-lg text-gray-900 mb-3">자서전과 함께 보낼 메시지</h3>
            <div className="space-y-3">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="예: '너한테 제일 먼저 보여주고 싶었어.' 또는 '이 글은 내 지난 10년의 이야기야.'"
                rows={3}
                value={shareSettings.message}
                onChange={handleShareMessageChange}
              ></textarea>
              <p className="text-sm text-gray-500">이 메시지는 자서전 본문 맨 위에 손글씨 스타일로 표시됩니다.</p>
            </div>
          </div>
          
          {/* 공유 설정 */}
          <div className="mb-6">
            <h3 className="font-medium text-lg text-gray-900 mb-3">공유 설정</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowComments"
                  checked={shareSettings.allowComments}
                  onChange={(e) => handleShareSettingChange('allowComments', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="allowComments" className="ml-2 block text-gray-700">
                  친구들이 코멘트를 남길 수 있도록 허용
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowReactions"
                  checked={shareSettings.allowReactions}
                  onChange={(e) => handleShareSettingChange('allowReactions', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="allowReactions" className="ml-2 block text-gray-700">
                  친구들이 이모지 반응을 남길 수 있도록 허용
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={shareSettings.isPublic}
                  onChange={(e) => handleShareSettingChange('isPublic', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-gray-700">
                  링크가 있는 모든 사람이 볼 수 있도록 허용 (체크하지 않으면 초대한 사람만 볼 수 있음)
                </label>
              </div>
            </div>
          </div>
          
          {/* 공유 방법 */}
          <div className="mb-6">
            <h3 className="font-medium text-lg text-gray-900 mb-3">공유 방법 선택</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <button className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <svg className="h-8 w-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 6h-16c-1.104 0-2 0.896-2 2v8c0 1.104 0.896 2 2 2h16c1.104 0 2-0.896 2-2v-8c0-1.104-0.896-2-2-2zm-16 10v-8h16v8h-16z"></path>
                  <path d="M11 6h-5.5l2.751-4.121c0.281-0.421 0.152-0.99-0.269-1.271-0.422-0.281-0.99-0.152-1.271 0.269l-3.375 5.121h-2.336c-0.553 0-1 0.448-1 1s0.447 1 1 1h10v-2z"></path>
                </svg>
                <span className="mt-2 text-sm">링크 복사</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <svg className="h-8 w-8 text-[#FEE500]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0 18c4.411 0 8-3.589 8-8s-3.589-8-8-8-8 3.589-8 8 3.589 8 8 8zm0-3a2 2 0 100-4 2 2 0 000 4z"></path>
                </svg>
                <span className="mt-2 text-sm">카카오톡 공유</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <svg className="h-8 w-8 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.625 0-12 5.375-12 12s5.375 12 12 12 12-5.375 12-12-5.375-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"></path>
                </svg>
                <span className="mt-2 text-sm">인스타그램 이미지</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <svg className="h-8 w-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v18h-18v-18zm19 19v1h-20v-20h1v19h19z"></path>
                  <path d="M4 16h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm-12-3h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm-12-3h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm-12-3h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2z"></path>
                </svg>
                <span className="mt-2 text-sm">QR 코드 생성</span>
              </button>
            </div>
          </div>
          
          {/* QR 코드 섹션 */}
          <div className="mb-8 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-lg text-gray-900 mb-3">QR 코드 자서전</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-32 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h4v4h-4v-4z M10 4h1v1h-1v-1z M12 4h1v1h-1v-1z M15 4h5v5h-5v-5z M4 10h1v1h-1v-1z M6 10h1v1h-1v-1z M8 10h1v1h-1v-1z M9 11h1v1h-1v-1z M12 10h1v1h-1v-1z M15 10h1v1h-1v-1z M17 10h1v1h-1v-1z M19 10h1v1h-1v-1z M4 15h5v5h-5v-5z M10 15h1v1h-1v-1z M12 15h1v1h-1v-1z M14 15h1v1h-1v-1z M16 15h1v1h-1v-1z M10 17h1v1h-1v-1z M12 17h1v1h-1v-1z M14 17h1v1h-1v-1z M16 17h1v1h-1v-1z M18 17h1v1h-1v-1z M10 19h1v1h-1v-1z M12 19h1v1h-1v-1z M14 19h1v1h-1v-1z M16 19h1v1h-1v-1z M18 19h1v1h-1v-1z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-700 mb-2">
                  QR 코드를 생성하면 인쇄하여 편지, 액자, 선물 등에 동봉할 수 있습니다.
                </p>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  QR 코드 PDF 다운로드
                </button>
              </div>
            </div>
          </div>
          
          {/* 완료 버튼 */}
          <div className="flex justify-center sm:justify-end mt-6">
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              공유 링크 생성하기
            </button>
          </div>
        </div>
      )}
      
      {/* 미리보기 모달 (실제 구현 시에는 별도 컴포넌트로 분리하는 것이 좋음) */}
      {previewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">자서전 미리보기</h2>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {shareSettings.message && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="handwriting text-gray-700 italic">{shareSettings.message}</p>
                </div>
              )}
              
              <div className="prose max-w-none">
                <h1>1장. {NARRATIVE_TYPES.find(n => n.id === selectedNarrativeType)?.title}</h1>
                
                {/* 미리보기 내용 - 실제로는 API에서 가져오거나 사용자 입력을 바탕으로 생성 */}
                <p>
                  이곳에 실제 자서전 내용이 들어갑니다. 사용자가 입력한 질문에 대한 답변을 바탕으로
                  자연스럽게 구성된 내용이 표시됩니다.
                </p>
                
                <p>
                  사용자의 감성과 경험, 가치관 등이 잘 드러나는 내용으로 구성되며,
                  선택한 서사 유형({NARRATIVE_TYPES.find(n => n.id === selectedNarrativeType)?.title})에 맞게
                  톤과 스타일이 적용됩니다.
                </p>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setPreviewMode(false)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
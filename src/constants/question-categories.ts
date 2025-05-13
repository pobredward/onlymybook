import { CategoryQuestions } from '@/components/QuestionForm';

// 질문 카테고리 정의 - 10개로 확장
export const QUESTION_CATEGORIES: CategoryQuestions[] = [
  {
    id: 'free_topic',
    title: '자유 주제',
    description: '원하는 주제로 자유롭게 작성',
    questions: [
      {
        id: 'free_topic_content',
        text: '하고 싶은 이야기를 자유롭게 작성해주세요.',
        type: 'longText',
        placeholder: '자서전에 꼭 담고 싶은 이야기, 하고 싶은 말, 남기고 싶은 기록 등 무엇이든 자유롭게 작성해주세요.',
        required: true
      }
    ]
  },
  {
    id: 'childhood',
    title: '어린 시절',
    description: '성장 과정과 어린 시절의 추억',
    questions: [
      {
        id: 'childhood_memory',
        text: '어린 시절의 가장 행복한 기억은 무엇인가요?',
        type: 'longText',
        placeholder: '예: 할머니 집 뒷마당에서 보냈던 여름날들...',
        required: true
      },
      {
        id: 'childhood_friend',
        text: '어린 시절 가장 친했던 친구에 대해 알려주세요.',
        type: 'longText',
        placeholder: '이름, 어떻게 만났는지, 함께한 추억...'
      },
      {
        id: 'school_experience',
        text: '학창 시절은 어땠나요?',
        type: 'radio',
        options: [
          { value: 'very_positive', label: '매우 즐거웠다' },
          { value: 'positive', label: '즐거웠다' },
          { value: 'neutral', label: '보통이었다' },
          { value: 'negative', label: '힘들었다' },
          { value: 'very_negative', label: '매우 힘들었다' }
        ]
      },
      {
        id: 'childhood_additional',
        text: '어린 시절에 대해 추가로 하고 싶은 이야기가 있나요?',
        type: 'longText',
        placeholder: '질문에 없는 내용이나 더 자세히 이야기하고 싶은 내용을 자유롭게 작성해주세요.'
      }
    ]
  },
  {
    id: 'family',
    title: '가족',
    description: '가족과의 관계와 추억',
    questions: [
      {
        id: 'family_member',
        text: '가장 감사한 가족 구성원은 누구인가요? 그 이유는요?',
        type: 'longText',
        placeholder: '예: 저의 어머니는 항상...',
        required: true
      },
      {
        id: 'family_tradition',
        text: '가족만의 특별한 전통이나 행사가 있나요?',
        type: 'longText',
        placeholder: '예: 설날마다 온 가족이 모여서...'
      },
      {
        id: 'family_value',
        text: '가족으로부터 배운 가장 중요한 가치는 무엇인가요?',
        type: 'shortText',
        placeholder: '예: 정직, 근면, 배려...'
      },
      {
        id: 'family_additional',
        text: '가족에 대해 추가로 하고 싶은 이야기가 있나요?',
        type: 'longText',
        placeholder: '질문에 없는 내용이나 더 자세히 이야기하고 싶은 내용을 자유롭게 작성해주세요.'
      }
    ]
  },
  {
    id: 'career',
    title: '경력과 일',
    description: '직업적 경험과 성취',
    questions: [
      {
        id: 'career_start',
        text: '첫 직장에 대한 기억은 어떤가요?',
        type: 'longText',
        placeholder: '첫 출근 날, 첫 월급...',
        required: true
      },
      {
        id: 'career_proud',
        text: '직업적으로 가장 자랑스러운 순간은 언제였나요?',
        type: 'longText',
        placeholder: '특별한 성과나 인정받은 경험...'
      },
      {
        id: 'career_challenge',
        text: '직업 생활에서 가장 큰 도전은 무엇이었나요?',
        type: 'longText',
        placeholder: '어려웠던 프로젝트, 관계 갈등...'
      },
      {
        id: 'career_additional',
        text: '경력이나 일에 대해 추가로 하고 싶은 이야기가 있나요?',
        type: 'longText',
        placeholder: '질문에 없는 내용이나 더 자세히 이야기하고 싶은 내용을 자유롭게 작성해주세요.'
      }
    ]
  },
  {
    id: 'love',
    title: '사랑과 관계',
    description: '연애, 결혼 등 인간관계',
    questions: [
      {
        id: 'first_love',
        text: '첫사랑에 대해 기억나는 것이 있나요?',
        type: 'longText',
        placeholder: '언제, 어떻게 만났는지...',
        required: true
      },
      {
        id: 'relationship_lesson',
        text: '관계에서 배운 가장 중요한 교훈은 무엇인가요?',
        type: 'longText',
        placeholder: '예: 소통의 중요성...'
      },
      {
        id: 'relationship_status',
        text: '현재 결혼/연애 상태는 어떻게 되나요?',
        type: 'radio',
        options: [
          { value: 'single', label: '미혼/솔로' },
          { value: 'relationship', label: '연애 중' },
          { value: 'married', label: '기혼' },
          { value: 'divorced', label: '이혼/별거' },
          { value: 'widowed', label: '사별' },
          { value: 'complicated', label: '복잡함' },
          { value: 'prefer_not_to_say', label: '말하고 싶지 않음' }
        ]
      },
      {
        id: 'love_additional',
        text: '사랑과 관계에 대해 추가로 하고 싶은 이야기가 있나요?',
        type: 'longText',
        placeholder: '질문에 없는 내용이나 더 자세히 이야기하고 싶은 내용을 자유롭게 작성해주세요.'
      }
    ]
  },
  {
    id: 'life_lessons',
    title: '인생의 교훈',
    description: '경험을 통해 배운 지혜',
    questions: [
      {
        id: 'biggest_lesson',
        text: '인생에서 배운 가장 큰 교훈은 무엇인가요?',
        type: 'longText',
        placeholder: '예: 인생에서 가장 중요한 것은...',
        required: true
      },
      {
        id: 'regret',
        text: '과거로 돌아갈 수 있다면 다르게 하고 싶은 일이 있나요?',
        type: 'longText',
        placeholder: '예: 젊은 시절 좀 더 모험적으로...'
      },
      {
        id: 'advice_to_young',
        text: '젊은 세대에게 해주고 싶은 조언이 있다면?',
        type: 'longText',
        placeholder: '예: 두려움에 얽매이지 말고...'
      },
      {
        id: 'life_lessons_additional',
        text: '인생의 교훈에 대해 추가로 하고 싶은 이야기가 있나요?',
        type: 'longText',
        placeholder: '질문에 없는 내용이나 더 자세히 이야기하고 싶은 내용을 자유롭게 작성해주세요.'
      }
    ]
  },
  {
    id: 'education',
    title: '교육과 학업',
    description: '학창시절과 배움의 여정',
    questions: [
      {
        id: 'education_experience',
        text: '학창시절 가장 기억에 남는 경험은 무엇인가요?',
        type: 'longText',
        placeholder: '특별한 수업, 좋았던 선생님, 친구들과의 추억...',
        required: true
      },
      {
        id: 'favorite_subject',
        text: '가장 좋아했던 과목이나 배움의 영역은 무엇인가요?',
        type: 'longText',
        placeholder: '좋아했던 이유와 함께 작성해주세요...'
      },
      {
        id: 'education_achievement',
        text: '교육과 관련해 가장 자랑스러운 성취는 무엇인가요?',
        type: 'longText',
        placeholder: '졸업, 학위, 자격증, 특별한 프로젝트...'
      },
      {
        id: 'education_additional',
        text: '교육과 학업에 대해 추가로 하고 싶은 이야기가 있나요?',
        type: 'longText',
        placeholder: '질문에 없는 내용이나 더 자세히 이야기하고 싶은 내용을 자유롭게 작성해주세요.'
      }
    ]
  },
  {
    id: 'health_challenges',
    title: '건강과 도전',
    description: '건강 관련 경험과 극복 과정',
    questions: [
      {
        id: 'health_story',
        text: '건강과 관련해 특별했던 경험이 있나요?',
        type: 'longText',
        placeholder: '질병 극복, 건강 관리, 생활 습관 변화...',
        required: true
      },
      {
        id: 'health_lesson',
        text: '건강을 통해 배운 인생의 교훈이 있다면?',
        type: 'longText',
        placeholder: '건강의 소중함, 인내심, 감사함...'
      },
      {
        id: 'health_routine',
        text: '현재 건강을 위해 하고 있는 특별한 활동이 있나요?',
        type: 'longText',
        placeholder: '운동, 식이요법, 명상, 취미활동...'
      },
      {
        id: 'health_additional',
        text: '건강과 도전에 대해 추가로 하고 싶은 이야기가 있나요?',
        type: 'longText',
        placeholder: '질문에 없는 내용이나 더 자세히 이야기하고 싶은 내용을 자유롭게 작성해주세요.'
      }
    ]
  },
  {
    id: 'travel_adventures',
    title: '여행과 모험',
    description: '특별한 장소와 경험',
    questions: [
      {
        id: 'memorable_travel',
        text: '가장 기억에 남는 여행이나 모험은 무엇인가요?',
        type: 'longText',
        placeholder: '장소, 시기, 함께한 사람들, 특별했던 순간...',
        required: true
      },
      {
        id: 'travel_discovery',
        text: '여행을 통해 발견한 자신에 대한 새로운 면모가 있나요?',
        type: 'longText',
        placeholder: '모험심, 적응력, 문화적 이해...'
      },
      {
        id: 'dream_destination',
        text: '아직 가보지 못했지만 꼭 가보고 싶은 곳이 있나요?',
        type: 'longText',
        placeholder: '장소와 그 이유...'
      },
      {
        id: 'travel_additional',
        text: '여행과 모험에 대해 추가로 하고 싶은 이야기가 있나요?',
        type: 'longText',
        placeholder: '질문에 없는 내용이나 더 자세히 이야기하고 싶은 내용을 자유롭게 작성해주세요.'
      }
    ]
  },
  {
    id: 'beliefs_values',
    title: '신념과 가치관',
    description: '삶의 철학과 신앙',
    questions: [
      {
        id: 'core_values',
        text: '당신의 삶을 이끄는 핵심 가치나 신념은 무엇인가요?',
        type: 'longText',
        placeholder: '정직, 자유, 가족, 성취, 믿음...',
        required: true
      },
      {
        id: 'belief_change',
        text: '인생을 살면서 크게 바뀐 가치관이나 신념이 있나요?',
        type: 'longText',
        placeholder: '변화의 계기와 배경...'
      },
      {
        id: 'spiritual_practice',
        text: '종교적 믿음이나 영적 수행이 삶에 어떤 영향을 주나요?',
        type: 'radio',
        options: [
          { value: 'very_important', label: '매우 중요한 영향을 준다' },
          { value: 'somewhat_important', label: '어느 정도 영향을 준다' },
          { value: 'neutral', label: '보통이다' },
          { value: 'not_important', label: '큰 영향은 없다' },
          { value: 'not_applicable', label: '해당 사항 없음' }
        ]
      },
      {
        id: 'beliefs_additional',
        text: '신념과 가치관에 대해 추가로 하고 싶은 이야기가 있나요?',
        type: 'longText',
        placeholder: '질문에 없는 내용이나 더 자세히 이야기하고 싶은 내용을 자유롭게 작성해주세요.'
      }
    ]
  }
];
import { Question } from "@/types";

// 미리보기용 질문 (2개)
export const PREVIEW_QUESTIONS: Question[] = [
  {
    id: "childhood_memory",
    text: "어린 시절의 가장 행복한 기억은 무엇인가요?",
    placeholder: "예: 할머니 집 뒷마당에서 보냈던 여름날들..."
  },
  {
    id: "grateful_person",
    text: "인생에서 가장 감사한 사람은 누구인가요? 그 이유는요?",
    placeholder: "예: 저의 첫 선생님이신 김선생님이 계셨기에..."
  }
];

// 전체 자서전용 추가 질문 (8개)
export const FULL_QUESTIONS: Question[] = [
  {
    id: "turning_point",
    text: "당신의 인생에서 가장 큰 전환점은 무엇이었나요?",
    placeholder: "예: 대학 진학을 위해 서울로 올라온 그 날..."
  },
  {
    id: "biggest_challenge",
    text: "가장 큰 도전이나 시련은 무엇이었으며, 어떻게 극복했나요?",
    placeholder: "예: 사업 실패 후 다시 일어서기 위해..."
  },
  {
    id: "proudest_achievement",
    text: "가장 자랑스러운 성취나 결정은 무엇인가요?",
    placeholder: "예: 두려움을 이기고 해외 유학을 결정했을 때..."
  },
  {
    id: "biggest_regret",
    text: "인생에서 가장 후회하는 것이 있다면 무엇인가요?",
    placeholder: "예: 부모님께 더 자주 연락드리지 못한 것..."
  },
  {
    id: "life_lesson",
    text: "삶에서 배운 가장 중요한 교훈은 무엇인가요?",
    placeholder: "예: 진정한 행복은 소유가 아닌 관계에서 온다는 것을..."
  },
  {
    id: "love_story",
    text: "당신의 인생에서 사랑의 이야기를 들려주세요.",
    placeholder: "예: 비 오는 날 우연히 만난 그 사람은..."
  },
  {
    id: "future_hope",
    text: "앞으로의 삶에서 이루고 싶은 꿈이나 희망은 무엇인가요?",
    placeholder: "예: 언젠가는 시골에 작은 카페를 열어..."
  },
  {
    id: "future_generations",
    text: "미래 세대나 사랑하는 사람들에게 남기고 싶은 조언이나 메시지가 있나요?",
    placeholder: "예: 두려움에 발목 잡히지 말고 항상 도전하길 바랍니다..."
  }
];

// 전체 질문 목록
export const ALL_QUESTIONS = [...PREVIEW_QUESTIONS, ...FULL_QUESTIONS]; 
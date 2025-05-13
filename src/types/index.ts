export interface Question {
  id: string;
  text: string;
  placeholder: string;
}

export interface Answer {
  questionId: string;
  text: string;
}

export interface Story {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: number;
  isPreview: boolean;
  isPaid: boolean;
  shareUrl?: string;
}

export interface User {
  id: string;
  stories: string[]; // 스토리 ID 배열
  createdAt: number;
} 
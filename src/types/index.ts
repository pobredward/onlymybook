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
  storyNumber?: number; // 사용자별 스토리 번호
  title: string;
  content: string;
  createdAt: number;
  isPreview: boolean;
  isPaid: boolean;
  isPublic?: boolean; // 스토리가 공개되었는지 여부
  shareUrl?: string;
  tags?: string[];
  reactionCount?: number;
  viewCount?: number;
  bookmarkCount?: number;
  commentCount?: number;
  summary?: string;
  tone?: string;
  keywords?: string[];
  readingTime?: number;
  updatedAt?: number;
  authorName?: string; // 작가 이름
  endingMessage?: string; // 마무리 메시지 커스텀
  endingTitle?: string; // 마무리 제목 커스텀
}

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  stories: string[]; // 스토리 ID 배열
  bookmarks?: string[]; // 북마크한 스토리 ID 배열
  createdAt: number;
  storyCount?: number; // 통계용 스토리 수
  lastLogin?: { seconds: number; nanoseconds: number } | null; // Firestore 타임스탬프
  provider?: string; // 로그인 제공자 (google, facebook, apple, email)
  emailVerified?: boolean;
  phoneNumber?: string;
  customId?: string; // 사용자 정의 ID (URL에 사용)
  promotionSubscribed?: boolean; // 프로모션 이메일 구독 여부
}

export interface UserStory {
  id: string; // 복합 ID: userId_storyId
  userId: string;
  storyId: string;
  createdAt: number;
}

export interface StoryView {
  id: string; // 복합 ID: storyId_timestamp
  storyId: string;
  userId?: string; // 익명 사용자는 없을 수 있음
  createdAt: number;
  userAgent?: string;
  referrer?: string;
}

export interface Reaction {
  id: string;
  userId: string;
  storyId: string;
  reaction: string;
  createdAt: number;
}

export enum AuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  EMAIL = 'email'
}

// 자서전 챕터와 섹션 관련 타입
export interface StorySection {
  id: string;
  title: string;
  content: string;
}

export interface StoryChapter {
  id: string;
  title: string;
  sections: StorySection[];
} 
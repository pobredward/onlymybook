/**
 * 자서전 내용을 챕터와 섹션으로 파싱하는 유틸리티 함수
 */
import { StoryChapter, StorySection } from '@/types';

/**
 * 스토리 텍스트를 챕터와 섹션으로 분리합니다.
 * @param content 자서전 내용 텍스트
 * @returns 파싱된 챕터 및 섹션 배열
 */
export function parseStoryContent(content: string): StoryChapter[] {
  const lines = content.split('\n');
  const chapters: StoryChapter[] = [];
  
  let currentChapter: StoryChapter | null = null;
  let currentSectionContent: string[] = [];
  let currentSectionId = '';
  let currentSectionTitle = '';
  
  // 중복된 ID를 피하기 위한 카운터
  const sectionCounters: Record<string, number> = {};
  
  lines.forEach((line) => {
    // 챕터 제목 감지 (예: "# 1장: 어린 시절", "# 제1장: 어린 시절")
    const chapterMatch = line.match(/^#\s+(제)?(\d+)장:?\s+(.+)$/);
    
    if (chapterMatch) {
      // 이전 섹션이 있으면 저장
      if (currentChapter !== null && currentSectionId && currentSectionTitle) {
        const newSection: StorySection = {
          id: currentSectionId,
          title: currentSectionTitle,
          content: currentSectionContent.join('\n'),
          isQuote: false
        };
        
        currentChapter.sections.push(newSection);
      }
      
      // 이전 챕터가 있으면 저장
      if (currentChapter !== null) {
        chapters.push(currentChapter);
      }
      
      const chapterNum = chapterMatch[2];
      const title = chapterMatch[3];
      const chapterId = `chapter-${chapterNum}`;
      
      // 챕터별 섹션 카운터 초기화
      sectionCounters[chapterId] = 0;
      
      // 새 챕터 생성 (명시적 타입 지정)
      currentChapter = {
        id: chapterId,
        title: `${chapterNum}장: ${title}`,
        sections: []
      };
      
      // 새 섹션 시작 (챕터 소개 섹션)
      currentSectionId = `${chapterId}-section-${sectionCounters[chapterId]}`;
      sectionCounters[chapterId]++;
      currentSectionTitle = '시작';
      currentSectionContent = [];
      return;
    }
    
    // 섹션 제목 감지 (예: "## 첫 번째 기억")
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch && currentChapter !== null) {
      // 이전 섹션이 있으면 저장
      if (currentSectionId && currentSectionTitle) {
        const newSection: StorySection = {
          id: currentSectionId,
          title: currentSectionTitle,
          content: currentSectionContent.join('\n'),
          isQuote: false
        };
        
        currentChapter.sections.push(newSection);
      }
      
      const title = sectionMatch[1];
      currentSectionId = `${currentChapter.id}-section-${sectionCounters[currentChapter.id]}`;
      sectionCounters[currentChapter.id]++;
      currentSectionTitle = title;
      currentSectionContent = [];
      return;
    }
    
    // 현재 챕터에 내용 추가
    if (currentChapter !== null) {
      currentSectionContent.push(line);
    }
  });
  
  // 마지막 섹션 저장
  if (currentChapter !== null && currentSectionId && currentSectionTitle) {
    const newSection: StorySection = {
      id: currentSectionId,
      title: currentSectionTitle,
      content: currentSectionContent.join('\n'),
      isQuote: false
    };
    
    // @ts-expect-error: Typescript에서 sections가 항상 존재한다는 것을 인식하지 못함
    currentChapter.sections.push(newSection);
  }
  
  // 마지막 챕터 저장
  if (currentChapter !== null) {
    chapters.push(currentChapter);
  }
  
  // 챕터가 없으면 전체 내용을 하나의 챕터로
  if (chapters.length === 0 && content.trim()) {
    const defaultChapter: StoryChapter = {
      id: 'chapter-1',
      title: '자서전',
      sections: [{
        id: 'chapter-1-section-0',
        title: '전체 내용',
        content: content,
        isQuote: false
      }]
    };
    chapters.push(defaultChapter);
  }
  
  return chapters;
}

/**
 * 이미지 색상 및 감정에 기반한 배경 CSS 클래스를 반환합니다.
 */
export const getBackgroundClass = (mood: string): string => {
  const moodMap: Record<string, string> = {
    'happy': 'bg-yellow-50',
    'sad': 'bg-blue-50',
    'peaceful': 'bg-green-50',
    'nostalgic': 'bg-amber-50',
    'inspiring': 'bg-indigo-50',
    'exciting': 'bg-rose-50',
    'dark': 'bg-gray-100'
  };
  
  return moodMap[mood] || 'bg-amber-50';
};

/**
 * 텍스트에서 감정 분석 (간단한 키워드 기반)
 */
export const analyzeMood = (text: string): string => {
  type MoodType = 'happy' | 'sad' | 'peaceful' | 'nostalgic' | 'inspiring' | 'exciting' | 'dark';
  
  const keywords: Record<MoodType, string[]> = {
    'happy': ['행복', '기쁨', '웃음', '즐거움', '좋은 날', '환한', '웃는'],
    'sad': ['슬픔', '그리움', '눈물', '아픔', '어두운', '힘든', '외로움'],
    'peaceful': ['평화', '조용한', '고요', '차분', '안정', '휴식', '쉬는'],
    'nostalgic': ['추억', '그때', '옛날', '기억', '어렸을 때', '지난 날', '그리워'],
    'inspiring': ['영감', '감동', '깨달음', '배움', '성장', '변화', '믿음'],
    'exciting': ['설렘', '흥분', '열정', '도전', '새로운', '시작', '꿈'],
    'dark': ['어둠', '공포', '두려움', '죽음', '상실', '실패', '좌절']
  };
  
  // 가장 많이 나타난 감정 키워드 찾기
  const scores: Record<MoodType, number> = {
    'happy': 0,
    'sad': 0,
    'peaceful': 0,
    'nostalgic': 0,
    'inspiring': 0,
    'exciting': 0,
    'dark': 0
  };
  
  // 단순히 키워드 갯수로 감정 판단 (실제로는 더 복잡한 로직 필요)
  Object.entries(keywords).forEach(([mood, wordList]) => {
    wordList.forEach(word => {
      const regex = new RegExp(word, 'g');
      const matches = text.match(regex);
      if (matches) {
        scores[mood as MoodType] += matches.length;
      }
    });
  });
  
  // 가장 높은 점수의 감정 반환
  let maxMood: MoodType = 'nostalgic';
  let maxScore = 0;
  
  Object.entries(scores).forEach(([mood, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxMood = mood as MoodType;
    }
  });
  
  return maxMood;
}; 
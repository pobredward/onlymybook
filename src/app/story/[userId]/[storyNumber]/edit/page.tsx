'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MainLayout } from '@/components/layout/MainLayout';
import { getStoryByUserIdAndNumber, updateStory } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Story } from '@/types';
import { Plus, Trash2, Save, BookOpen, ChevronDown, ChevronUp, GripVertical, Tag, Globe, Info } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Descendant } from 'slate';

interface Section {
  id: string;
  title: string;
  content: string | Descendant[];
  isQuote?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

interface DraggableItem {
  id: string;
  index: number;
}

interface DraggableSectionProps {
  section: Section;
  chapterId: string;
  index: number;
  moveSection: (chapterId: string, fromIndex: number, toIndex: number) => void;
  handleSectionTitleChange: (chapterId: string, sectionId: string, title: string) => void;
  handleSectionContentChange: (chapterId: string, sectionId: string, content: string) => void;
  handleDeleteSection: (chapterId: string, sectionId: string) => void;
}

// 드래그 가능한 섹션 컴포넌트
const DraggableSection = ({ 
  section, 
  chapterId, 
  index,
  moveSection,
  handleSectionTitleChange,
  handleSectionContentChange,
  handleDeleteSection
}: DraggableSectionProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  
  // 드래그 설정
  const [{ isDragging }, drag] = useDrag({
    type: 'SECTION',
    item: { id: section.id, index } as DraggableItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // 드롭 설정
  const [, drop] = useDrop({
    accept: 'SECTION',
    hover(item: DraggableItem) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // 자기 자신 위에 드롭할 경우 무시
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // 섹션 위치 변경 호출
      moveSection(chapterId, dragIndex, hoverIndex);
      
      // 드래그 중인 아이템의 인덱스 업데이트
      // 이것이 없으면 드래그하는 동안 순서가 뒤섞일 수 있음
      item.index = hoverIndex;
    },
    drop(item: DraggableItem) {
      // 드롭 완료 시 콘솔로 확인 (디버깅용)
      console.log(`섹션 이동 완료: ${item.id}를 인덱스 ${item.index}로 이동`);
    }
  });
  
  // drag와 drop 레퍼런스 연결
  drag(drop(ref));
  
  return (
    <div 
      ref={ref}
      className={`mb-6 last:mb-0 p-4 border rounded-md ${
        section.isQuote ? 'border-indigo-200 bg-indigo-50' : 'border-gray-100'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="cursor-move text-gray-400 p-1 hover:text-gray-600">
            <GripVertical size={18} />
          </div>
          {section.isQuote ? (
            <div className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded font-medium">
              인용문
            </div>
          ) : (
            <Input
              value={section.title}
              onChange={(e) => handleSectionTitleChange(chapterId, section.id, e.target.value)}
              className="w-full max-w-md"
              placeholder="섹션 제목"
            />
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteSection(chapterId, section.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      
      <TextArea
        value={typeof section.content === 'string' ? section.content : extractPlainText(section.content)}
        onChange={(e) => handleSectionContentChange(chapterId, section.id, e.target.value)}
        placeholder={section.isQuote ? "인용문 내용을 입력하세요..." : "섹션 내용을 입력하세요..."}
        rows={section.isQuote ? 3 : 6}
        className={section.isQuote ? "font-italic" : ""}
      />
    </div>
  );
};

// Descendant[] → plain text 변환 함수
function extractPlainText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(node => {
      if (typeof node.text === 'string') return node.text;
      if (Array.isArray(node.children)) return extractPlainText(node.children);
      if (typeof node.children === 'object') return extractPlainText(node.children);
      return '';
    }).join(' ');
  }
  return '';
}

export default function EditStoryPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const storyNumber = params.storyNumber as string;
  const { currentUser, loading } = useAuth();
  
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [endingTitle, setEndingTitle] = useState('감사합니다');
  const [endingMessage, setEndingMessage] = useState('이 이야기를 읽어주셔서 감사합니다. 여러분과 함께 나눌 수 있어 행복했습니다.');
  const [authorName, setAuthorName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  
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
  
  // 태그 선택 핸들러
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => {
      // 이미 선택된 태그라면 제거
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      }
      
      // 최대 3개까지만 추가 가능
      if (prev.length >= 3) {
        toast.warning('태그는 최대 3개까지 선택할 수 있습니다.');
        return prev;
      }
      
      // 새 태그 추가
      return [...prev, tagId];
    });
  };
  
  // 사용자가 작성자인지 확인
  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }
      
      if (currentUser.uid !== userId) {
        setError('자서전 작성자만 수정할 수 있습니다.');
        setIsLoading(false);
        // 리다이렉트 대신 에러 메시지만 표시
        // router.push(`/story/${userId}/${storyNumber}`);
        // toast.error('자서전 작성자만 수정할 수 있습니다.');
      }
    }
  }, [currentUser, loading, router, userId, storyNumber]);
  
  // 자서전 데이터 로드
  useEffect(() => {
    const fetchStory = async () => {
      try {
        const storyData = await getStoryByUserIdAndNumber(userId, Number(storyNumber));
        
        if (!storyData) {
          throw new Error('자서전을 찾을 수 없습니다.');
        }
        
        setStory(storyData);
        setTitle(storyData.title || '');
        
        // 저자명 설정
        setAuthorName(storyData.authorName || currentUser?.displayName || '작가님');
        
        // 마무리 메시지와 제목 설정
        if (storyData.endingTitle) setEndingTitle(storyData.endingTitle);
        if (storyData.endingMessage) setEndingMessage(storyData.endingMessage);
        
        // 태그 설정
        if (storyData.tags && storyData.tags.length > 0) {
          setSelectedTags(storyData.tags);
        }
        
        // 공개 여부 설정
        setIsPublic(storyData.isPublic || false);
        
        // 내용을 챕터와 섹션으로 분리
        if (storyData.content) {
          if (typeof storyData.content === 'string') {
            try {
              const parsed = JSON.parse(storyData.content);
              if (parsed.chapters) {
                setChapters(parsed.chapters);
              } else {
                parseContent(storyData.content); // 내부에서 setChapters 호출
              }
            } catch {
              parseContent(storyData.content); // 내부에서 setChapters 호출
            }
          } else if (
            typeof storyData.content === 'object' &&
            storyData.content !== null &&
            'chapters' in storyData.content &&
            Array.isArray((storyData.content as { chapters: Chapter[] }).chapters)
          ) {
            setChapters((storyData.content as { chapters: Chapter[] }).chapters);
          }
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        setError(err instanceof Error ? err.message : '자서전을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // 사용자가 인증됐고 현재 로딩 중이 아닐 때만 데이터 로드
    if (currentUser && !loading) {
      fetchStory();
    }
  }, [currentUser, userId, storyNumber, loading]);
  
  // 내용을 챕터와 섹션으로 분리하는 함수
  const parseContent = (content: string) => {
    if (!content) return;
    
    // 연속된 빈 줄을 하나로 정리
    const normalizedContent = content.replace(/\n{3,}/g, '\n\n');
    
    const lines = normalizedContent.split('\n');
    let currentChapters: Chapter[] = [];
    let currentChapterId = '';
    let currentChapterTitle = '';
    let currentSectionContent: string[] = [];
    let currentSectionId = '';
    let currentSectionTitle = '';
    const expandedState: Record<string, boolean> = {};
    // 중복된 ID를 피하기 위한 카운터 추가
    const sectionCounters: Record<string, number> = {};
    // 인용문 직후 빈 섹션 생성 여부를 추적
    let justAddedQuote = false;
    
    // 이전 라인이 비어있는지 추적
    let prevLineEmpty = false;
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      const isEmptyLine = trimmedLine === '';
      
      // 연속된 빈 줄 스킵
      if (isEmptyLine && prevLineEmpty) {
        return;
      }
      prevLineEmpty = isEmptyLine;
      
      // 챕터 제목 감지 (예: "# 1장: 어린 시절", "# 제1장: 어린 시절")
      const chapterMatch = line.match(/^#\s+(제)?(\d+)장:?\s+(.+)$/);
      if (chapterMatch) {
        // 이전 섹션이 있으면 저장 (내용이 있을 때만)
        if (currentSectionId && currentChapterTitle && currentSectionContent.length > 0) {
          const chapterIndex = currentChapters.findIndex(c => c.id === currentChapterId);
          if (chapterIndex >= 0) {
            // 내용에서 앞뒤 빈 줄 제거
            while (currentSectionContent.length > 0 && currentSectionContent[0].trim() === '') {
              currentSectionContent.shift();
            }
            while (currentSectionContent.length > 0 && currentSectionContent[currentSectionContent.length - 1].trim() === '') {
              currentSectionContent.pop();
            }
            
            // 내용이 있을 때만 섹션 추가
            if (currentSectionContent.length > 0) {
              currentChapters[chapterIndex].sections.push({
                id: currentSectionId,
                title: currentSectionTitle || "섹션",
                content: currentSectionContent.join('\n'),
              });
            }
          }
        }

        const chapterNum = chapterMatch[2];
        const title = chapterMatch[3];
        
        // 유니크한 챕터 ID 생성
        const candidateChapterId = `chapter-${chapterNum}`;
        if (currentChapters.some(c => c.id === candidateChapterId)) {
          // 이미 존재하는 ID라면 suffix 추가
          let suffix = 1;
          while (currentChapters.some(c => c.id === `${candidateChapterId}-${suffix}`)) {
            suffix++;
          }
          currentChapterId = `${candidateChapterId}-${suffix}`;
        } else {
          currentChapterId = candidateChapterId;
        }
        
        currentChapterTitle = `${chapterNum}장: ${title}`;
        
        // 챕터별 섹션 카운터 초기화
        sectionCounters[currentChapterId] = 0;
        
        // 새 챕터 추가
        currentChapters.push({
          id: currentChapterId,
          title: currentChapterTitle,
          sections: []
        });
        expandedState[currentChapterId] = true;

        // 새 섹션 시작
        currentSectionId = `${currentChapterId}-section-${sectionCounters[currentChapterId]}`;
        sectionCounters[currentChapterId]++;
        currentSectionTitle = ''; // 섹션 제목은 명시적으로 나올 때까지 비워둠
        currentSectionContent = [];
        justAddedQuote = false;
        return;
      }

      // 섹션 제목 감지 (예: "## 첫 번째 기억")
      const sectionMatch = line.match(/^##\s+(.+)$/);
      if (sectionMatch && currentChapterId) {
        // 이전 섹션이 있고 내용이 있을 때만 저장
        if (currentSectionId && currentSectionContent.length > 0) {
          const chapterIndex = currentChapters.findIndex(c => c.id === currentChapterId);
          if (chapterIndex >= 0) {
            // 내용에서 앞뒤 빈 줄 제거
            while (currentSectionContent.length > 0 && currentSectionContent[0].trim() === '') {
              currentSectionContent.shift();
            }
            while (currentSectionContent.length > 0 && currentSectionContent[currentSectionContent.length - 1].trim() === '') {
              currentSectionContent.pop();
            }
            
            // 내용이 있을 때만 섹션 추가
            if (currentSectionContent.length > 0) {
              currentChapters[chapterIndex].sections.push({
                id: currentSectionId,
                title: currentSectionTitle || "섹션",
                content: currentSectionContent.join('\n'),
              });
            }
          }
        }

        const title = sectionMatch[1];
        currentSectionId = `${currentChapterId}-section-${sectionCounters[currentChapterId]}`;
        sectionCounters[currentChapterId]++;
        currentSectionTitle = title;
        currentSectionContent = [];
        justAddedQuote = false;
        return;
      }

      // 일반 내용 추가
      if (currentChapterId && currentSectionId) {
        // 내용 추가 (빈 줄도 포함하여 텍스트 형식 유지)
        currentSectionContent.push(line);
        
        // 인용문 직후에 실제 내용이 추가되면 섹션 제목 설정
        if (justAddedQuote && !currentSectionTitle && trimmedLine) {
          currentSectionTitle = "섹션";
          justAddedQuote = false;
        }
      }
    });

    // 마지막 섹션 저장 (내용이 있을 때만)
    if (currentSectionId && currentChapterTitle && currentChapterId && currentSectionContent.length > 0) {
      const chapterIndex = currentChapters.findIndex(c => c.id === currentChapterId);
      if (chapterIndex >= 0) {
        // 내용에서 앞뒤 빈 줄 제거
        while (currentSectionContent.length > 0 && currentSectionContent[0].trim() === '') {
          currentSectionContent.shift();
        }
        while (currentSectionContent.length > 0 && currentSectionContent[currentSectionContent.length - 1].trim() === '') {
          currentSectionContent.pop();
        }
        
        // 내용이 있을 때만 섹션 추가
        if (currentSectionContent.length > 0) {
          currentChapters[chapterIndex].sections.push({
            id: currentSectionId,
            title: currentSectionTitle || "섹션",
            content: currentSectionContent.join('\n'),
          });
        }
      }
    }

    // 챕터가 없으면 전체 내용을 하나의 챕터로
    if (currentChapters.length === 0 && content.trim()) {
      currentChapters = [{
        id: 'chapter-1',
        title: '1장: 자서전',
        sections: [{
          id: 'chapter-1-section-0',
          title: '전체 내용',
          content: content,
        }]
      }];
      expandedState['chapter-1'] = true;
    }
    
    // 최종 챕터 및 섹션 구조 로깅 (디버깅용)
    console.log('파싱 완료된 챕터 및 섹션 구조:', 
      currentChapters.map(c => ({
        id: c.id, 
        title: c.title, 
        sections: c.sections.map(s => ({id: s.id, title: s.title, isQuote: s.isQuote}))
      }))
    );

    setChapters(currentChapters);
    setExpandedChapters(expandedState);
  };
  
  // 타이틀 변경 핸들러
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  // 챕터 제목 변경 핸들러
  const handleChapterTitleChange = (chapterId: string, newTitle: string) => {
    setChapters(prev => 
      prev.map(chapter => 
        chapter.id === chapterId 
          ? { ...chapter, title: newTitle } 
          : chapter
      )
    );
  };
  
  // 섹션 제목 변경 핸들러
  const handleSectionTitleChange = (chapterId: string, sectionId: string, newTitle: string) => {
    setChapters(prev => 
      prev.map(chapter => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            sections: chapter.sections.map(section => {
              if (section.id === sectionId) {
                return { ...section, title: newTitle };
              }
              return section;
            })
          };
        }
        return chapter;
      })
    );
  };
  
  // 섹션 내용 변경 핸들러
  const handleSectionContentChange = (chapterId: string, sectionId: string, newContent: string) => {
    setChapters(prev => 
      prev.map(chapter => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            sections: chapter.sections.map(section => 
              section.id === sectionId 
                ? { ...section, content: newContent } 
                : section
            )
          };
        }
        return chapter;
      })
    );
  };
  
  // 새 챕터 추가
  const handleAddChapter = () => {
    const newChapterNumber = chapters.length + 1;
    let newChapterId = `chapter-${newChapterNumber}`;
    
    // 이미 존재하는 ID인지 확인하고 유니크한 ID 생성
    let index = newChapterNumber;
    while (chapters.some(chapter => chapter.id === newChapterId)) {
      index++;
      newChapterId = `chapter-${index}`;
    }
    
    // 챕터 번호 추출 (ID가 아닌 실제 표시되는 번호)
    const displayNumber = index;
    
    const newChapter: Chapter = {
      id: newChapterId,
      title: `${displayNumber}장: 새 챕터`,
      sections: [{
        id: `${newChapterId}-section-0`,
        title: '새 섹션',
        content: '',
      }]
    };
    
    setChapters(prev => [...prev, newChapter]);
    setExpandedChapters(prev => ({ ...prev, [newChapterId]: true }));
  };
  
  // 챕터 삭제
  const handleDeleteChapter = (chapterId: string) => {
    if (chapters.length <= 1) {
      toast.error('최소 하나의 챕터가 필요합니다.');
      return;
    }
    
    // 먼저 해당 챕터를 필터링하여 제거
    const filteredChapters = chapters.filter(chapter => chapter.id !== chapterId);
    
    // 챕터 번호 재조정 (이제는 map 내에서 state를 사용하지 않음)
    const renumberedChapters = filteredChapters.map((chapter, index) => {
      // 기존 ID에서 숫자 부분만 추출
      const oldChapterId = chapter.id;
      
      // 새 챕터 ID 생성 (순서대로 1부터 다시 번호 부여)
      const newChapterId = `chapter-${index + 1}`;
      
      // 챕터 제목에서 번호 부분 변경
      const titleMatch = chapter.title.match(/^(\d+)장:/);
      let newTitle = chapter.title;
      
      if (titleMatch) {
        newTitle = chapter.title.replace(/^\d+/, (index + 1).toString());
      }
      
      return {
        ...chapter,
        id: newChapterId,
        title: newTitle,
        sections: chapter.sections.map(section => ({
          ...section,
          id: section.id.replace(oldChapterId, newChapterId)
        }))
      };
    });
    
    // 확장 상태 객체 업데이트
    const newExpandedChapters: Record<string, boolean> = {};
    renumberedChapters.forEach((chapter) => {
      // 기존 확장 상태를 유지하되 ID는 새것으로 적용
      const oldIndex = filteredChapters.findIndex(c => c.id === chapter.id);
      if (oldIndex >= 0) {
        const oldChapter = filteredChapters[oldIndex];
        newExpandedChapters[chapter.id] = expandedChapters[oldChapter.id] || false;
      } else {
        newExpandedChapters[chapter.id] = false;
      }
    });
    
    setChapters(renumberedChapters);
    setExpandedChapters(newExpandedChapters);
  };
  
  // 새 섹션 추가
  const handleAddSection = (chapterId: string) => {
    setChapters(prev => 
      prev.map(chapter => {
        if (chapter.id === chapterId) {
          // 모든 섹션 ID를 가져와서 중복을 방지하기 위한 로직
          const sectionIds = chapter.sections.map(s => s.id);
          let nextSectionIndex = 0;
          let newSectionId = `${chapterId}-section-${nextSectionIndex}`;
          
          // 이미 존재하는 ID면 인덱스 증가
          while (sectionIds.includes(newSectionId)) {
            nextSectionIndex++;
            newSectionId = `${chapterId}-section-${nextSectionIndex}`;
          }
          
          // 섹션 번호 계산 (기존 섹션 중 "섹션 X" 형식의 제목을 가진 섹션의 최대 번호 찾기)
          let maxSectionNumber = 0;
          chapter.sections.forEach(section => {
            const match = section.title.match(/^섹션\s+(\d+)$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (!isNaN(num) && num > maxSectionNumber) {
                maxSectionNumber = num;
              }
            }
          });
          
          return {
            ...chapter,
            sections: [
              ...chapter.sections,
              {
                id: newSectionId,
                title: `섹션 ${maxSectionNumber + 1}`,
                content: '',
              }
            ]
          };
        }
        return chapter;
      })
    );
  };
  
  // 섹션 삭제
  const handleDeleteSection = (chapterId: string, sectionId: string) => {
    setChapters(prev => 
      prev.map(chapter => {
        if (chapter.id === chapterId) {
          if (chapter.sections.length <= 1) {
            toast.error('챕터당 최소 하나의 섹션이 필요합니다.');
            return chapter;
          }
          
          return {
            ...chapter,
            sections: chapter.sections.filter(section => section.id !== sectionId)
          };
        }
        return chapter;
      })
    );
  };
  
  // 챕터 펼치기/접기
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };
  
  // 모든 챕터 펼치기
  const expandAllChapters = () => {
    const expanded: Record<string, boolean> = {};
    chapters.forEach(chapter => {
      expanded[chapter.id] = true;
    });
    setExpandedChapters(expanded);
  };
  
  // 모든 챕터 접기
  const collapseAllChapters = () => {
    const collapsed: Record<string, boolean> = {};
    chapters.forEach(chapter => {
      collapsed[chapter.id] = false;
    });
    setExpandedChapters(collapsed);
  };
  
  // 자서전 저장
  const handleSaveStory = async () => {
    if (!story) return;
    try {
      setIsSaving(true);
      setError(null);
      if (!title.trim()) {
        throw new Error('제목을 입력해주세요.');
      }
      // 변경된 필드만 추출
      const updateData: any = {};
      if (title !== story.title) updateData.title = title;
      if (authorName !== story.authorName) updateData.authorName = authorName;
      if (endingTitle !== story.endingTitle) updateData.endingTitle = endingTitle;
      if (endingMessage !== story.endingMessage) updateData.endingMessage = endingMessage;
      if (JSON.stringify(chapters) !== JSON.stringify((story.content as any)?.chapters)) {
        updateData.content = JSON.stringify({ chapters });
      }
      if (JSON.stringify(selectedTags) !== JSON.stringify(story.tags)) updateData.tags = selectedTags;
      if (isPublic !== story.isPublic) updateData.isPublic = isPublic;
      if (Object.keys(updateData).length === 0) {
        toast.info('변경된 내용이 없습니다.');
        setIsSaving(false);
        return;
      }
      await updateStory(story.id, updateData);
      toast.success('자서전이 성공적으로 저장되었습니다.');
      router.push(`/story/${userId}/${storyNumber}`);
    } catch (err) {
      console.error('Error saving story:', err);
      setError(err instanceof Error ? err.message : '자서전 저장 중 오류가 발생했습니다.');
      toast.error(err instanceof Error ? err.message : '자서전 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // 미리보기
  const handlePreview = () => {
    // 저장하지 않고 보기 페이지로 이동
    router.push(`/story/${userId}/${storyNumber}`);
  };
  
  // EditStoryPage 컴포넌트 내부에 moveSection 함수 추가
  const moveSection = (chapterId: string, fromIndex: number, toIndex: number) => {
    setChapters(prev =>
      prev.map(chapter => {
        if (chapter.id === chapterId) {
          const newSections = [...chapter.sections];
          const [movedSection] = newSections.splice(fromIndex, 1);
          newSections.splice(toIndex, 0, movedSection);
          return {
            ...chapter,
            sections: newSections
          };
        }
        return chapter;
      })
    );
  };
  
  const calculateReadingTime = (content: string | Descendant[]) => {
    if (typeof content !== 'string') return 1;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // 일반적으로 1분에 200단어 읽는다고 가정
    return minutes;
  };
  
  if (isLoading || loading) {
    return (
      <MainLayout title="자서전 로딩 중" description="자서전을 불러오고 있습니다.">
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }
  
  if (error && !story) {
    return (
      <MainLayout title="오류" description="자서전을 찾을 수 없습니다.">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">자서전을 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={() => router.push('/')} variant="primary">홈으로 돌아가기</Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <MainLayout
        title="자서전 수정하기"
        description="당신의 자서전을 수정하세요"
      >
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">자서전 수정하기</h1>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="flex items-center gap-1"
              >
                <BookOpen size={16} />
                미리보기
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveStory}
                disabled={isSaving}
                isLoading={isSaving}
                className="flex items-center gap-1"
              >
                <Save size={16} />
                저장하기
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자서전 제목
            </label>
            <Input
              value={title}
              onChange={handleTitleChange}
              placeholder="자서전 제목을 입력하세요"
              className="mb-4"
            />
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                저자명
              </label>
              <Input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="저자명을 입력하세요"
                className="mb-4"
              />
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Globe size={16} className="mr-2" />
                  서재에 공개하기
                  <span className="ml-2 text-xs text-gray-500">(공개하면 다른 사용자가 서재에서 볼 수 있습니다)</span>
                </label>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={() => setIsPublic(!isPublic)}
                    className="sr-only"
                  />
                  <label
                    htmlFor="isPublic"
                    className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer transition-colors ${
                      isPublic ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                        isPublic ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Info size={18} className="text-gray-500" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>공개 설정을 켜면 이 자서전이 서재에서 다른 사용자들에게 노출됩니다.</p>
                    <p className="mt-1">비공개로 유지하면 공유 링크를 통해서만 접근할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <Tag size={16} className="mr-2" />
                태그 선택 <span className="text-xs text-gray-500 ml-2">(최대 3개)</span>
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg
                      transition-all duration-200 border-2
                      ${selectedTags.includes(tag.id) 
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'}
                    `}
                    title={selectedTags.includes(tag.id) ? '클릭하여 태그 제거' : '클릭하여 태그 추가'}
                  >
                    <span className="text-2xl mb-1">{tag.emoji}</span>
                    <span className="text-sm font-medium">{tag.name}</span>
                    {selectedTags.includes(tag.id) && (
                      <span className="absolute top-1 right-1 bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              {selectedTags.length > 0 && (
                <div className="mt-3 p-3 bg-indigo-50 rounded-md border border-indigo-100">
                  <p className="text-sm font-medium text-indigo-700 mb-2">선택된 태그:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tagId => {
                      const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
                      return tag ? (
                        <div key={tag.id} className="flex items-center bg-white px-3 py-1.5 rounded-full border border-indigo-200">
                          <span className="mr-1">{tag.emoji}</span>
                          <span className="text-sm font-medium">{tag.name}</span>
                          <button 
                            onClick={() => handleTagToggle(tag.id)}
                            className="ml-2 text-gray-400 hover:text-red-500"
                            title="태그 제거"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    }).filter(Boolean)}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">챕터 관리</h2>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAllChapters}
              >
                모두 펼치기
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAllChapters}
              >
                모두 접기
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddChapter}
                className="flex items-center gap-1"
              >
                <Plus size={16} />
                새 챕터 추가
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div 
                  className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedChapters[chapter.id] ? 
                      <ChevronDown size={18} className="text-gray-500" /> : 
                      <ChevronUp size={18} className="text-gray-500" />
                    }
                    <Input
                      value={chapter.title}
                      onChange={(e) => handleChapterTitleChange(chapter.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-md"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(chapter.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                
                {expandedChapters[chapter.id] && (
                  <div className="p-4">
                    {chapter.sections.map((section, index) => (
                      <DraggableSection 
                        key={`${section.id}-${index}`}
                        section={section}
                        chapterId={chapter.id} 
                        index={index}
                        moveSection={moveSection}
                        handleSectionTitleChange={handleSectionTitleChange}
                        handleSectionContentChange={handleSectionContentChange}
                        handleDeleteSection={handleDeleteSection}
                      />
                    ))}
                    
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSection(chapter.id)}
                        className="flex items-center gap-1"
                      >
                        <Plus size={16} />
                        새 섹션 추가
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* 마무리 설정 */}
          <div className="bg-white shadow-sm rounded-lg p-6 mt-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">마무리 설정</h2>
            <p className="text-gray-600 text-sm mb-4">자서전의 마지막 페이지에 표시될 내용을 설정합니다.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                마무리 제목
              </label>
              <Input
                value={endingTitle}
                onChange={(e) => setEndingTitle(e.target.value)}
                placeholder="마무리 제목을 입력하세요"
                className="mb-4"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                마무리 메시지
              </label>
              <TextArea
                value={endingMessage}
                onChange={(e) => setEndingMessage(e.target.value)}
                placeholder="마무리 메시지를 입력하세요"
                rows={3}
                className="mb-4"
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-between">
            <Button
              variant="secondary"
              onClick={() => router.push(`/story/${userId}/${storyNumber}`)}
            >
              취소하기
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSaveStory}
              disabled={isSaving}
              isLoading={isSaving}
              className="flex items-center gap-2"
            >
              <Save size={18} />
              자서전 저장하기
            </Button>
          </div>
        </div>
      </MainLayout>
    </DndProvider>
  );
} 
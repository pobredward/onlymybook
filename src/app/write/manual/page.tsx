'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Chapter } from '@/types/manual-editor';
import { DraggableSection } from '@/components/editor/DraggableSection';
import { ChevronDown, ChevronUp, Plus, Trash2, Save, Globe, Tag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { saveFullStory, getOrCreateUser, updateStory } from '@/lib/db';
import { Descendant } from 'slate';

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

// undefined 값 깊게 제거 유틸 함수 (배열 내부 undefined도 제거)
function removeUndefinedDeep<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj
      .map(removeUndefinedDeep)
      .filter((v) => v !== undefined) as unknown as T;
  } else if (obj && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        (acc as Record<string, unknown>)[key] = removeUndefinedDeep(value);
      }
      return acc;
    }, {} as T);
  }
  return obj;
}

export default function ManualWritePage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('나의 자서전');
  const [authorName, setAuthorName] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    // 개인 정보 불러오기 (이름 등)
    const personalInfoJson = localStorage.getItem('autobiography_personal_info');
    if (personalInfoJson) {
      try {
        const personalInfo: { latestStoryId?: string; name?: string } = JSON.parse(personalInfoJson);
        if (personalInfo.name) {
          setAuthorName(personalInfo.name);
        }
      } catch (e: unknown) {
        console.error('개인정보 파싱 오류:', e);
      }
    }

    // 직접 작성 데이터 불러오기 (있으면)
    const savedContentJson = localStorage.getItem('autobiography_manual_content');
    if (savedContentJson) {
      try {
        const savedContent = JSON.parse(savedContentJson);
        if (savedContent.title) {
          setTitle(savedContent.title);
        }
        if (savedContent.description) {
          setDescription(savedContent.description);
        }
        
        // 기존 방식의 단일 content가 있으면 첫 번째 챕터로 변환
        if (savedContent.content && typeof savedContent.content === 'string') {
          initializeChapters(savedContent.content);
        } else if (savedContent.chapters && Array.isArray(savedContent.chapters)) {
          // 이미 챕터 형식으로 저장되어 있으면 그대로 사용
          setChapters(savedContent.chapters);
          
          // 확장 상태 초기화
          const expandedState: Record<string, boolean> = {};
          savedContent.chapters.forEach((chapter: Chapter) => {
            expandedState[chapter.id] = true; // 기본적으로 모두 확장
          });
          setExpandedChapters(expandedState);
        } else {
          // 둘 다 없으면 기본 챕터 생성
          createDefaultChapter();
        }
        
        // 태그 불러오기
        if (savedContent.tags && Array.isArray(savedContent.tags)) {
          setSelectedTags(savedContent.tags);
        }
        
        // 공개 여부 불러오기
        if (savedContent.isPublic !== undefined) {
          setIsPublic(savedContent.isPublic);
        }
      } catch (e: unknown) {
        console.error('저장된 내용 파싱 오류:', e);
        createDefaultChapter();
      }
    } else {
      createDefaultChapter();
    }
  }, []);

  // 기존 단일 content를 챕터로 변환
  const initializeChapters = (content: string) => {
    const chapterId = `chapter-1`;
    const sectionId = `${chapterId}-section-0`;
    
    const initialChapter: Chapter = {
      id: chapterId,
      title: '1장: 나의 이야기',
      sections: [{
        id: sectionId,
        title: '시작',
        content: [{ type: 'paragraph', children: [{ text: content }] }] as unknown as Descendant[],
      }]
    };
    
    setChapters([initialChapter]);
    setExpandedChapters({ [chapterId]: true });
  };
  
  // 기본 챕터 생성
  const createDefaultChapter = () => {
    const chapterId = `chapter-1`;
    const sectionId = `${chapterId}-section-0`;
    
    const defaultChapter: Chapter = {
      id: chapterId,
      title: '1장: 나의 이야기',
      sections: [{
        id: sectionId,
        title: '시작',
        content: [{ type: 'paragraph', children: [{ text: '' }] }] as unknown as Descendant[],
      }]
    };
    
    setChapters([defaultChapter]);
    setExpandedChapters({ [chapterId]: true });
  };

  // 작성 내용 자동 저장
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (title && chapters.length > 0) {
        localStorage.setItem('autobiography_manual_content', JSON.stringify({
          title,
          description,
          chapters,
          authorName,
          tags: selectedTags,
          isPublic,
          timestamp: Date.now()
        }));
      }
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [title, description, chapters, authorName, selectedTags, isPublic]);

  // 태그 토글
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

  // 새 챕터 추가
  const handleAddChapter = () => {
    const newChapterNumber = chapters.length + 1;
    const newChapterId = `chapter-${uuidv4()}`;
    
    const newChapter: Chapter = {
      id: newChapterId,
      title: `${newChapterNumber}장: 새 챕터`,
      sections: [{
        id: `${newChapterId}-section-${uuidv4()}`,
        title: '새 섹션',
        content: [{ type: 'paragraph', children: [{ text: '' }] }] as unknown as Descendant[],
      }]
    };
    
    setChapters(prev => [...prev, newChapter]);
    setExpandedChapters(prev => ({ ...prev, [newChapterId]: true }));
  };
  
  // 챕터 삭제
  const handleDeleteChapter = (chapterId: string) => {
    // 마지막 하나의 챕터는 삭제할 수 없음
    if (chapters.length <= 1) {
      toast.error('최소 하나의 챕터는 유지해야 합니다.');
      return;
    }
    
    if (window.confirm('이 챕터를 삭제하시겠습니까? 모든 내용이 사라집니다.')) {
      setChapters(prev => prev.filter(chapter => chapter.id !== chapterId));
      
      // 확장 상태에서도 제거
      setExpandedChapters(prev => {
        const newState = { ...prev };
        delete newState[chapterId];
        return newState;
      });
    }
  };
  
  // 챕터 제목 변경
  const handleChapterTitleChange = (chapterId: string, newTitle: string) => {
    setChapters(prev => 
      prev.map(chapter => 
        chapter.id === chapterId 
          ? { ...chapter, title: newTitle } 
          : chapter
      )
    );
  };
  
  // 섹션 제목 변경
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
  
  // 섹션 내용 변경
  const handleSectionContentChange = (chapterId: string, sectionId: string, newContent: Descendant[]) => {
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
  
  // 섹션 추가
  const handleAddSection = (chapterId: string) => {
    const newSectionId = `${chapterId}-section-${uuidv4()}`;
    
    setChapters(prev => 
      prev.map(chapter => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            sections: [
              ...chapter.sections,
              {
                id: newSectionId,
                title: '새 섹션',
                content: [{ type: 'paragraph', children: [{ text: '' }] }] as unknown as Descendant[]
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
          // 마지막 하나의 섹션은 삭제할 수 없음
          if (chapter.sections.length <= 1) {
            toast.error('챕터에는 최소 하나의 섹션이 필요합니다.');
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
  
  // 챕터 토글
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };
  
  // 모든 챕터 펼치기
  const expandAllChapters = () => {
    const expandedState: Record<string, boolean> = {};
    chapters.forEach(chapter => {
      expandedState[chapter.id] = true;
    });
    setExpandedChapters(expandedState);
  };
  
  // 모든 챕터 접기
  const collapseAllChapters = () => {
    const expandedState: Record<string, boolean> = {};
    chapters.forEach(chapter => {
      expandedState[chapter.id] = false;
    });
    setExpandedChapters(expandedState);
  };
  
  // 섹션 위치 이동
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

  // 임시 저장
  const handleTempSave = async () => {
    try {
      setIsSaving(true);
      let userId = currentUser?.uid;
      if (!userId) {
        userId = await getOrCreateUser();
      }
      // localStorage에서 latestStoryId 확인
      let latestStoryId = '';
      if (typeof window !== 'undefined') {
        const personalInfoJson = localStorage.getItem('autobiography_personal_info');
        if (personalInfoJson) {
          try {
            const personalInfo: { latestStoryId?: string; name?: string } = JSON.parse(personalInfoJson);
            latestStoryId = personalInfo.latestStoryId || '';
          } catch {}
        }
      }
      const storyData = {
        chapters,
        title,
        description,
        authorName,
        tags: selectedTags,
        isPublic
      };
      const cleanedStoryData = removeUndefinedDeep(storyData);
      if (latestStoryId) {
        try {
          // 기존 임시 스토리 업데이트
          await updateStory(latestStoryId, { content: cleanedStoryData });
          toast.success('임시 저장이 완료되었습니다.');
        } catch (e: unknown) {
          // 문서가 없으면 새로 생성
          const errorMsg = e instanceof Error ? e.message : '';
          if (errorMsg.includes('No document to update')) {
            const { storyId, userId: savedUserId, storyNumber } = await saveFullStory(userId, cleanedStoryData);
            if (typeof window !== 'undefined') {
              localStorage.setItem('autobiography_personal_info', JSON.stringify({
                userId: savedUserId,
                latestStoryId: storyId,
                storyNumber
              }));
            }
            toast.success('임시 저장이 완료되었습니다.');
          } else {
            throw e;
          }
        }
      } else {
        // 새로 생성
        const { storyId, userId: savedUserId, storyNumber } = await saveFullStory(userId, cleanedStoryData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('autobiography_personal_info', JSON.stringify({
            userId: savedUserId,
            latestStoryId: storyId,
            storyNumber
          }));
        }
        toast.success('임시 저장이 완료되었습니다.');
      }
    } catch (e) {
      console.error('임시 저장 오류:', e);
      toast.error('임시 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 작성하기(저장 + 공유 단계 이동)
  const handleWriteAndShare = async () => {
    try {
      setIsSaving(true);
      if (!title.trim()) {
        toast.error('제목을 입력해주세요.');
        setIsSaving(false);
        return;
      }
      if (!description.trim()) {
        toast.error('한줄 설명을 입력해주세요.');
        setIsSaving(false);
        return;
      }
      let hasContent = false;
      for (const chapter of chapters) {
        for (const section of chapter.sections) {
          if (section.content.length > 0) {
            hasContent = true;
            break;
          }
        }
        if (hasContent) break;
      }
      if (!hasContent) {
        toast.error('최소한 하나의 섹션에 내용을 입력해주세요.');
        setIsSaving(false);
        return;
      }
      let userId = currentUser?.uid;
      if (!userId) {
        userId = await getOrCreateUser();
      }
      const storyData = { chapters, title, description, authorName, tags: selectedTags, isPublic };
      const cleanedStoryData = removeUndefinedDeep(storyData);
      await saveFullStory(userId, cleanedStoryData).then(({ storyId, userId: savedUserId, storyNumber }) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('autobiography_personal_info', JSON.stringify({
            userId: savedUserId,
            latestStoryId: storyId,
            storyNumber
          }));
        }
      });
      localStorage.setItem('autobiography_manual_published', JSON.stringify({
        title,
        description,
        authorName,
        tags: selectedTags,
      }));
      router.push('/write/complete');
    } catch (e) {
      console.error('저장 오류:', e);
      toast.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <MainLayout
        title="자서전 직접 작성하기"
        description="자서전을 직접 작성하고 꾸며보세요."
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">자서전 작성하기</h1>
            
            <div className="flex space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleTempSave}
                disabled={isSaving}
                className="flex items-center gap-1"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">저장 중...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    임시 저장
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자서전 제목
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                한줄 설명 <span className="text-xs text-gray-400">(50자 이내)</span>
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 50))}
                placeholder="이 자서전을 한 문장으로 소개해보세요"
                className="mb-4"
                maxLength={50}
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
                    type="button"
                  >
                    <span className="text-2xl mb-1">{tag.emoji}</span>
                    <span className="text-sm font-medium">{tag.name}</span>
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
                            type="button"
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
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => toggleChapter(chapter.id)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      type="button"
                    >
                      {expandedChapters[chapter.id] ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                    <Input
                      value={chapter.title}
                      onChange={(e) => handleChapterTitleChange(chapter.id, e.target.value)}
                      className="w-full max-w-lg border-0 focus:ring-0 p-0 text-lg font-semibold bg-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                
                {expandedChapters[chapter.id] && (
                  <div className="p-4">
                    <div className="space-y-6 mb-6">
                      {chapter.sections.map((section, sectionIndex) => (
                        <DraggableSection
                          key={section.id}
                          section={section}
                          chapterId={chapter.id}
                          index={sectionIndex}
                          moveSection={moveSection}
                          handleSectionTitleChange={handleSectionTitleChange}
                          handleSectionContentChange={handleSectionContentChange}
                          handleDeleteSection={handleDeleteSection}
                        />
                      ))}
                    </div>
                    
                    <div className="flex space-x-3">
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
          
          <div className="mt-8 flex justify-end gap-4">
            <Button
              variant="secondary"
              onClick={handleTempSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">저장 중...</span>
                </>
              ) : (
                '임시 저장'
              )}
            </Button>
            <Button
              variant="primary"
              onClick={handleWriteAndShare}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">저장 중...</span>
                </>
              ) : (
                '배포하기'
              )}
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 text-center mt-6">
            <p>내용은 자동으로 저장됩니다. 브라우저를 닫았다가 다시 열어도 작성 내용이 유지됩니다.</p>
          </div>
        </div>
      </MainLayout>
    </DndProvider>
  );
} 
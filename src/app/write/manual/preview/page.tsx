'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import { Chapter } from '@/types/manual-editor';
import { toast } from 'sonner';
import { Descendant } from 'slate';

export default function ManualPreviewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

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

  useEffect(() => {
    // 직접 작성 데이터 불러오기
    const savedContentJson = localStorage.getItem('autobiography_manual_content');
    if (savedContentJson) {
      try {
        const savedContent = JSON.parse(savedContentJson);
        setTitle(savedContent.title || '');
        setAuthorName(savedContent.authorName || '');
        
        // 태그와 공개 여부 설정
        if (savedContent.tags && Array.isArray(savedContent.tags)) {
          setTags(savedContent.tags);
        }
        
        // 내용 변환: 챕터 형식 -> 마크다운
        if (savedContent.chapters && Array.isArray(savedContent.chapters)) {
          const markdownContent = convertChaptersToMarkdown(savedContent.chapters);
          setContent(markdownContent);
        } else if (savedContent.content) {
          // 레거시 단일 콘텐츠 지원
          setContent(savedContent.content);
        } else {
          throw new Error('저장된 내용을 찾을 수 없습니다.');
        }
      } catch (e: unknown) {
        console.error('저장된 내용 파싱 오류:', e);
        router.replace('/write/manual');
      }
    } else {
      // 저장된 내용이 없으면 작성 페이지로 이동
      router.replace('/write/manual');
    }
    
    setIsLoading(false);
  }, [router]);
  
  // 챕터 형식을 마크다운으로 변환
  const convertChaptersToMarkdown = (chapters: Chapter[]): string => {
    let markdown = '';
    
    chapters.forEach((chapter, chapterIndex) => {
      // 챕터 제목 추가
      markdown += `# ${chapter.title}\n\n`;
      
      // 챕터의 섹션들 추가
      chapter.sections.forEach((section) => {
        // 섹션 제목이 의미있게 지정된 경우에만 추가
        const skipTitles = ['시작', '새 섹션', '내용', ''];
        if (section.title && !skipTitles.includes(section.title)) {
          markdown += `## ${section.title}\n\n`;
        }
        
        // 섹션 내용 추가
        const plain = richTextToPlainText(section.content);
        if (plain.trim()) {
          markdown += `${plain.trim()}

`;
        }
      });
      
      // 마지막 챕터가 아니면 추가 줄 바꿈
      if (chapterIndex < chapters.length - 1) {
        markdown += '\n';
      }
    });
    
    // 연속된 줄바꿈 제거
    return markdown.replace(/\n{3,}/g, '\n\n');
  };

  // Descendant[]를 plain text로 변환하는 함수
  function richTextToPlainText(content: Descendant[]): string {
    if (!Array.isArray(content)) return '';
    return content.map((node: Descendant) => {
      if (typeof node === 'object' && 'text' in node) return node.text as string;
      if (typeof node === 'object' && 'children' in node && Array.isArray(node.children)) {
        return richTextToPlainText(node.children as Descendant[]);
      }
      return '';
    }).join('');
  }

  const handlePreviousStep = () => {
    router.push('/write/manual');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // 현재는 간단히 로컬 스토리지에만 저장
      // TODO: 백엔드 저장 로직 (현재는 로컬 스토리지 데이터만 유지)
      localStorage.setItem('autobiography_manual_published', localStorage.getItem('autobiography_manual_content') || '');
      
      // 자서전 저장 시 userId, latestStoryId, storyNumber도 localStorage에 저장
      if (typeof window !== 'undefined') {
        const userId = 'local_user'; // 미로그인/로컬 작성 구분용
        const latestStoryId = 'local_story';
        const storyNumber = 1; // 여러 개 지원 시 증가 필요
        localStorage.setItem('autobiography_personal_info', JSON.stringify({
          userId,
          latestStoryId,
          storyNumber
        }));
      }
      
      toast.success('자서전이 성공적으로 저장되었습니다.');
      
      // 저장 완료 후 페이지 이동
      setTimeout(() => {
        setIsSaving(false);
        router.push('/write/complete');
      }, 1000);
    } catch (error: unknown) {
      console.error('저장 오류:', error);
      toast.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">자서전 정보를 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`${title} - 미리보기`}
      description="작성한 자서전의 미리보기를 확인하세요."
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl xs:text-3xl font-extrabold text-gray-900 sm:text-4xl">
            자서전 미리보기
          </h1>
          <p className="mt-4 text-base sm:text-xl text-gray-500">
            작성한 자서전의 미리보기를 확인하세요.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8 mb-8">
          <div className="prose max-w-none">
            <h1 className="text-center mb-4">{title}</h1>
            <p className="text-center text-gray-500 mb-8">작가: {authorName}</p>
            
            {tags.length > 0 && (
              <div className="flex justify-center mb-8 gap-2">
                {tags.map(tagId => {
                  const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
                  return tag ? (
                    <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 border border-indigo-100">
                      <span className="mr-1">{tag.emoji}</span>
                      <span>{tag.name}</span>
                    </span>
                  ) : null;
                })}
              </div>
            )}
            
            <div className="mt-8">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
          >
            수정하기
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">저장 중...</span>
              </>
            ) : (
              "자서전 저장하기"
            )}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
} 
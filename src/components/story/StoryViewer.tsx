import React, { useState, useEffect, useRef } from 'react';
import { Story } from '@/types';
import { StoryChapterNavigation } from './StoryChapterNavigation';
import { StoryPage } from './StoryPage';
import { ChapterTitle } from './ChapterTitle';
import { StoryEnding } from './StoryEnding';
import { StoryCover } from './StoryCover';
import { ChevronUp, Tag, MessageSquare, Send, Edit2, Trash2, Save, X, Lock, LogIn } from 'lucide-react';
import { addComment, getComments, deleteComment, updateComment, toggleReaction, bookmarkStory } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

// 색상 테마 정의
const THEMES = [
  { bg: 'bg-amber-50', text: 'text-gray-800' },  // 기본 종이
  { bg: 'bg-blue-50', text: 'text-gray-800' },   // 청량한 느낌
  { bg: 'bg-rose-50', text: 'text-gray-800' },   // 따뜻한 느낌
  { bg: 'bg-emerald-50', text: 'text-gray-800' }, // 자연의 느낌
  { bg: 'bg-gray-50', text: 'text-gray-800' },   // 차분한 느낌
];

// 주요 문장 감지를 위한 키워드
const HIGHLIGHT_KEYWORDS = [
  '가장 중요한', '결정적인', '영원히', '절대로', '항상', 
  '깨달았다', '느꼈다', '배웠다', '변화했다', '꿈꾸었다'
];

interface Chapter {
  id: string;
  title: string;
  sections: {
    id: string;
    title: string;
    content: string;
    isQuote: boolean;
  }[];
}

interface Comment {
  id: string;
  name: string;
  message: string;
  color: string;
  userId?: string | null;
  createdAt: number;
}

interface StoryViewerProps {
  story: Story;
  viewMode?: 'modern' | 'classic';
  hasHeader?: boolean;
  mobileMenuComponent?: React.ReactNode;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ 
  story,
  viewMode = 'modern',
  hasHeader = false,
  mobileMenuComponent
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story.reactionCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(story.bookmarkCount || 0);

  // 내용을 챕터와 섹션으로 분리
  useEffect(() => {
    if (!story || !story.content) return;

    const content = story.content;
    const lines = content.split('\n');
    let currentChapters: Chapter[] = [];
    let currentChapterId = '';
    let currentChapterTitle = '';
    let currentSectionContent: string[] = [];
    let currentSectionId = '';
    let currentSectionTitle = '';

    // 클래식 뷰일 때 로그 출력 (viewMode 사용)
    if (viewMode === 'classic') {
      console.log('클래식 뷰 모드에서 자서전 내용 파싱 중');
    }

    lines.forEach((line) => {
      // 챕터 제목 감지 (예: "# 1장: 어린 시절", "# 제1장: 어린 시절")
      const chapterMatch = line.match(/^#\s+(제)?(\d+)장:?\s+(.+)$/);
      if (chapterMatch) {
        // 이전 섹션이 있으면 저장
        if (currentSectionId && currentSectionTitle) {
          const chapterIndex = currentChapters.findIndex(c => c.id === currentChapterId);
          if (chapterIndex >= 0) {
            currentChapters[chapterIndex].sections.push({
              id: currentSectionId,
              title: currentSectionTitle || '',  // 빈 제목은 그대로 빈 문자열로 유지
              content: currentSectionContent.join('\n'),
              isQuote: false
            });
          }
        }

        const chapterNum = chapterMatch[2];
        const title = chapterMatch[3];
        currentChapterId = `chapter-${chapterNum}`;
        currentChapterTitle = `${chapterNum}장: ${title}`;
        
        // 첫 챕터이거나 새 챕터면 추가
        if (!currentChapters.some(c => c.id === currentChapterId)) {
          currentChapters.push({
            id: currentChapterId,
            title: currentChapterTitle,
            sections: []
          });
        }

        // 새 섹션 시작
        currentSectionId = `${currentChapterId}-intro`;
        currentSectionTitle = '';
        currentSectionContent = [];
        return;
      }

      // 섹션 제목 감지 (예: "## 첫 번째 기억")
      const sectionMatch = line.match(/^##\s+(.+)$/);
      if (sectionMatch && currentChapterId) {
        // 이전 섹션이 있으면 저장
        if (currentSectionId && currentSectionTitle) {
          const chapterIndex = currentChapters.findIndex(c => c.id === currentChapterId);
          if (chapterIndex >= 0) {
            currentChapters[chapterIndex].sections.push({
              id: currentSectionId,
              title: currentSectionTitle || '',  // 빈 제목은 그대로 빈 문자열로 유지
              content: currentSectionContent.join('\n'),
              isQuote: false
            });
          }
        }

        const title = sectionMatch[1];
        currentSectionId = `${currentChapterId}-section-${currentChapters.find(c => c.id === currentChapterId)?.sections.length || 0}`;
        currentSectionTitle = title;
        currentSectionContent = [];
        return;
      }

      // 인용구 감지 (> 로 시작하는 줄)
      const quoteMatch = line.match(/^>\s+(.+)$/);
      if (quoteMatch && currentChapterId) {
        const quoteText = quoteMatch[1];
        const chapterIndex = currentChapters.findIndex(c => c.id === currentChapterId);
        
        if (chapterIndex >= 0) {
          // 이전 내용이 있으면 먼저 저장
          if (currentSectionContent.length > 0) {
            currentChapters[chapterIndex].sections.push({
              id: currentSectionId,
              title: currentSectionTitle || '',
              content: currentSectionContent.join('\n'),
              isQuote: false
            });
            
            // 다음 섹션을 위한 ID 준비
            currentSectionId = `${currentChapterId}-section-${currentChapters[chapterIndex].sections.length}`;
            currentSectionContent = [];
          }
          
          // 인용구 전용 섹션 추가
          const quoteId = `${currentChapterId}-quote-${currentChapters[chapterIndex].sections.length}`;
          currentChapters[chapterIndex].sections.push({
            id: quoteId,
            title: '인용구',
            content: quoteText,
            isQuote: true
          });
          
          // 인용문 이후의 내용을 위한 새 섹션 준비
          currentSectionId = `${currentChapterId}-section-${currentChapters[chapterIndex].sections.length}`;
          currentSectionTitle = '';
          currentSectionContent = [];
        }
        return;
      }

      // 일반 내용 추가
      if (currentChapterId && currentSectionId) {
        currentSectionContent.push(line);
      }
    });

    // 마지막 섹션 저장
    if (currentSectionId && currentChapterTitle && currentChapterId) {
      const chapterIndex = currentChapters.findIndex(c => c.id === currentChapterId);
      if (chapterIndex >= 0 && currentSectionContent.length > 0) {
        currentChapters[chapterIndex].sections.push({
          id: currentSectionId,
          title: currentSectionTitle || '',  // 빈 제목은 그대로 빈 문자열로 유지
          content: currentSectionContent.join('\n'),
          isQuote: false
        });
      }
    }

    // 챕터가 없으면 전체 내용을 하나의 챕터로
    if (currentChapters.length === 0 && content.trim()) {
      currentChapters = [{
        id: 'chapter-1',
        title: '자서전',
        sections: [{
          id: 'chapter-1-section-0',
          title: '전체 내용',
          content: content,
          isQuote: false
        }]
      }];
    }

    // 최종 파싱된 섹션의 순서 확인
    currentChapters.forEach((chapter, chapterIndex) => {
      console.log(`챕터 ${chapterIndex + 1}: ${chapter.title}`);
      chapter.sections.forEach((section, sectionIndex) => {
        console.log(`  섹션 ${sectionIndex + 1}: ${section.title} (인용문: ${section.isQuote ? 'O' : 'X'})`);
      });
    });

    setChapters(currentChapters);
    
    // 초기 챕터와 섹션 설정
    if (currentChapters.length > 0) {
      setCurrentChapter(currentChapters[0].id);
      if (currentChapters[0].sections.length > 0) {
        setCurrentSection(currentChapters[0].sections[0].id);
      }
    }
  }, [story, viewMode]);

  // 댓글 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      if (!story?.id) return;
      
      try {
        setLoading(true);
        const fetchedComments = await getComments(story.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error('댓글 불러오기 오류:', error);
        toast.error('댓글을 불러오는 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [story?.id]);

  // 좋아요/북마크 상태 초기화
  useEffect(() => {
    async function fetchReactionAndBookmark() {
      if (!currentUser || !story?.id) return;
      // 좋아요 여부 확인
      try {
        const res = await fetch(`/api/story/${story.id}/isLiked?userId=${currentUser.uid}`);
        const data = await res.json();
        setIsLiked(data.liked);
      } catch {}
      // 북마크 여부 확인
      try {
        const res = await fetch(`/api/story/${story.id}/isBookmarked?userId=${currentUser.uid}`);
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
      } catch {}
    }
    fetchReactionAndBookmark();
  }, [currentUser, story?.id]);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
      
      // 현재 보이는 섹션 감지
      if (contentRef.current) {
        const sections = contentRef.current.querySelectorAll('[id^="chapter-"]');
        
        for (const section of sections) {
          const rect = section.getBoundingClientRect();
          
          // 화면 중앙에 있는 섹션 찾기
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            const id = section.id;
            const parts = id.split('-');
            const chapterId = parts.length > 0 ? parts[0] + '-' + parts[1] : '';
            
            if (chapterId) {
              setCurrentChapter(chapterId);
              setCurrentSection(id);
            }
            
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 챕터 선택 핸들러
  const handleChapterSelect = (chapterId: string) => {
    setCurrentChapter(chapterId);
    
    // 선택된 챕터의 첫 번째 섹션으로 이동
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter && chapter.sections.length > 0) {
      setCurrentSection(chapter.sections[0].id);
      scrollToSection(chapter.sections[0].id);
    }
  };

  // 섹션 선택 핸들러
  const handleSectionSelect = (chapterId: string, sectionId: string) => {
    setCurrentChapter(chapterId);
    setCurrentSection(sectionId);
    scrollToSection(sectionId);
  };

  // 특정 섹션으로 스크롤
  const scrollToSection = (sectionId: string) => {
    setTimeout(() => {
    const section = document.getElementById(sectionId);
    if (section) {
        // 헤더 높이를 고려한 오프셋 계산 (모바일 메뉴 높이 + 여유 공간)
        const offset = window.innerWidth < 1024 ? 140 : 0;
        const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
          top: sectionTop,
          behavior: 'smooth'
        });
        
        // 콘솔에 로그 추가
        console.log(`스크롤 이동: ${sectionId}, 오프셋: ${offset}px`);
      } else {
        console.warn(`섹션을 찾을 수 없음: ${sectionId}`);
      }
    }, 100); // 약간의 지연 추가
  };

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 특정 문장이 중요한 문장인지 확인
  const isHighlightParagraph = (text: string) => {
    return HIGHLIGHT_KEYWORDS.some(keyword => text.includes(keyword));
  };

  // 댓글 추가 핸들러
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!story?.id) return;
    // 로그인 확인
    if (!currentUser) {
      toast.error('댓글을 작성하려면 로그인이 필요합니다');
      return;
    }
    
    try {
      // 랜덤 색상 생성 (파스텔톤)
      const colors = [
        'bg-yellow-100', 'bg-blue-100', 'bg-green-100', 
        'bg-pink-100', 'bg-purple-100', 'bg-indigo-100'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const commentData = {
        name: commenterName.trim() || '익명',
        message: newComment.trim(),
        color: randomColor,
        userId: currentUser.uid // 로그인 사용자 ID 항상 저장
      };
      
      // DB에 댓글 저장
      const commentId = await addComment(story.id, commentData);
      
      // 댓글 목록에 추가
      setComments(prev => [{
        id: commentId,
        ...commentData,
        createdAt: Date.now()
      }, ...prev]);
      
      // 입력 필드 초기화
      setNewComment('');
      
      toast.success('댓글이 추가되었습니다!');
    } catch (error) {
      console.error('댓글 추가 오류:', error);
      toast.error('댓글을 저장하는 중 문제가 발생했습니다.');
    }
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = async (commentId: string) => {
    if (!story?.id) return;
    
    try {
      // DB에서 댓글 삭제
      const success = await deleteComment(story.id, commentId, currentUser?.uid);
      
      if (success) {
        // 댓글 목록에서 제거
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        toast.success('댓글이 삭제되었습니다.');
      } else {
        toast.error('댓글을 삭제할 권한이 없습니다.');
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      toast.error('댓글을 삭제하는 중 문제가 발생했습니다.');
    }
  };

  // 댓글 수정 모드 시작
  const handleStartEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditCommentText(comment.message);
  };

  // 댓글 수정 취소
  const handleCancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText('');
  };

  // 댓글 수정 완료
  const handleSaveComment = async (commentId: string) => {
    if (!story?.id || !editCommentText.trim()) return;
    
    try {
      // DB에 댓글 수정 사항 저장
      const success = await updateComment(
        story.id,
        commentId,
        { message: editCommentText.trim() },
        currentUser?.uid
      );
      
      if (success) {
        // 댓글 목록 업데이트
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, message: editCommentText.trim() } 
            : comment
        ));
        
        // 수정 모드 종료
        setEditingComment(null);
        setEditCommentText('');
        
        toast.success('댓글이 수정되었습니다.');
      } else {
        toast.error('댓글을 수정할 권한이 없습니다.');
      }
    } catch (error) {
      console.error('댓글 수정 오류:', error);
      toast.error('댓글을 수정하는 중 문제가 발생했습니다.');
    }
  };

  // 사용자가 댓글의 주인인지 확인
  const isCommentOwner = (comment: Comment) => {
    return (
      currentUser?.uid && 
      comment.userId && 
      currentUser.uid === comment.userId
    );
  };

  // 좋아요 토글
  const handleToggleLike = async () => {
    if (!currentUser) {
      toast.error('로그인 후 이용 가능합니다');
      return;
    }
    try {
      const { liked, count } = await toggleReaction(currentUser.uid, story.id, 'like');
      setIsLiked(liked);
      setLikeCount(count);
    } catch {
      toast.error('좋아요 처리 중 오류가 발생했습니다');
    }
  };

  // 북마크 토글
  const handleToggleBookmark = async () => {
    if (!currentUser) {
      toast.error('로그인 후 이용 가능합니다');
      return;
    }
    try {
      await bookmarkStory(currentUser.uid, story.id, !isBookmarked);
      setIsBookmarked(!isBookmarked);
      setBookmarkCount(prev => prev + (isBookmarked ? -1 : 1));
    } catch {
      toast.error('스크랩 처리 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="relative">
      {/* 사이드 네비게이션 */}
      <div className="fixed left-4 top-24 z-40 hidden lg:block">
        <StoryChapterNavigation
          chapters={chapters}
          currentChapter={currentChapter}
          currentSection={currentSection}
          onChapterSelect={handleChapterSelect}
          onSectionSelect={handleSectionSelect}
        />
      </div>
      
      {/* 모바일 네비게이션 - 상단 고정 */}
      <div className={`fixed left-0 right-0 z-50 bg-white shadow-md py-2 px-4 lg:hidden ${hasHeader ? 'top-[60px]' : 'top-0'}`}>
        <div className="flex flex-col space-y-3">
          {mobileMenuComponent && (
            <div className="pb-2 border-b border-gray-100">
              {mobileMenuComponent}
            </div>
          )}
        <StoryChapterNavigation
          chapters={chapters}
          currentChapter={currentChapter}
          currentSection={currentSection}
          onChapterSelect={handleChapterSelect}
          onSectionSelect={handleSectionSelect}
        />
        </div>
      </div>
      
      {/* 콘텐츠 영역 */}
      <div 
        ref={contentRef}
        className={`min-h-screen relative w-full ${hasHeader ? 'pt-[90px]' : 'pt-[90px]'} lg:pt-0`}
      >
        {/* 표지 (첫 페이지) */}
        <StoryCover
          title={story.title}
          authorName={story.authorName || '작가님'}
          readingTime={Math.round(story.content.split(/\s+/).length / 200)} // 읽기 시간 추정
        />
        {chapters.map((chapter) => (
          <React.Fragment key={chapter.id}>
            {/* 챕터 제목 표시 */}
            <ChapterTitle id={chapter.id} title={chapter.title} />
            {chapter.sections
              .filter(section => section.content.trim().length > 0)
              .map((section, sectionIndex) => {
                const themeIndex = Math.floor(Math.random() * THEMES.length);
                const theme = THEMES[themeIndex];
                const isHighlight = isHighlightParagraph(section.content);
                return (
                  <StoryPage
                    key={section.id}
                    sectionId={section.id}
                    title={section.title}
                    content={section.content}
                    backgroundColor={theme.bg}
                    textColor={theme.text}
                    isHighlight={isHighlight}
                    index={sectionIndex}
                  />
                );
              })}
          </React.Fragment>
        ))}
        {/* 마무리 페이지 - 사용자 정의 가능 */}
        <StoryEnding 
          authorName={story.authorName || '작가님'} 
          customMessage={story.endingMessage || '이 이야기를 읽어주셔서 감사합니다. 여러분과 함께 나눌 수 있어 행복했습니다.'}
          customTitle={story.endingTitle || '감사합니다'}
        />
        {/* 태그 섹션 */}
        {story.tags && story.tags.length > 0 && (
          <div className="py-10 px-6 bg-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-4">
                <Tag size={18} className="mr-2 text-indigo-500" />
                <h2 className="text-xl font-medium">태그</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag, index) => {
                  // 태그 별 이모지 매핑 (필요시 수정)
                  const TAG_EMOJI: Record<string, string> = {
                    'growth': '🌱', 'challenge': '🔥', 'love': '❤️',
                    'family': '👨‍👩‍👧‍👦', 'loss': '💔', 'hope': '✨',
                    'healing': '🌿', 'career': '💼', 'travel': '✈️',
                    'reflection': '🧘'
                  };
                  return (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {TAG_EMOJI[tag] ? <span className="mr-1">{TAG_EMOJI[tag]}</span> : '#'}
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {/* 좋아요/스크랩/댓글 버튼 - 자서전 본문 아래로 이동 */}
        <div className="flex justify-center gap-6 my-12">
          {/* 좋아요(리액션) */}
          <button
            className={`flex items-center gap-1 px-4 py-2 rounded-full border font-semibold transition ${isLiked ? 'bg-pink-500 text-white border-pink-500' : 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-600'}`}
            onClick={handleToggleLike}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
            <span>{likeCount}</span>
          </button>
          {/* 스크랩 */}
          <button
            className={`flex items-center gap-1 px-4 py-2 rounded-full border font-semibold transition ${isBookmarked ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-600'}`}
            onClick={handleToggleBookmark}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" /></svg>
            <span>{bookmarkCount}</span>
          </button>
          {/* 댓글 */}
          <button className="flex items-center gap-1 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 font-semibold transition" disabled>
            <MessageSquare className="mr-1" size={18} />
            <span>{story.commentCount || comments.length || 0}</span>
          </button>
        </div>
        {/* 댓글 입력/목록 영역 - 자서전 본문 아래로 이동 */}
        <div className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <MessageSquare size={20} className="mr-2 text-indigo-500" />
              <h2 className="text-xl font-medium">작가에게 응원의 메시지를 남겨보세요</h2>
            </div>
            {/* 댓글 입력 폼 - 로그인 사용자만 표시 */}
            {currentUser ? (
              <div className="mb-10 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex mb-3">
                  <input
                    type="text"
                    value={commenterName}
                    onChange={(e) => setCommenterName(e.target.value)}
                    placeholder="이름 (선택사항)"
                    className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="따뜻한 한마디를 남겨보세요..."
                    className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-r-md hover:bg-indigo-600 focus:outline-none"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-10 bg-white p-6 rounded-lg shadow-sm text-center border border-dashed border-indigo-200">
                <div className="flex flex-col items-center gap-3">
                  <Lock className="text-indigo-400 mb-1" size={24} />
                  <p className="text-gray-600 font-medium">로그인 후 작가에게 응원의 메시지를 남겨보세요</p>
                  <p className="text-gray-500 text-sm mb-2">여러분의 따뜻한 한마디가 작가에게 큰 힘이 됩니다</p>
                  <Link 
                    href="/login" 
                    className="px-5 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors inline-flex items-center gap-2"
                  >
                    <LogIn size={16} />
                    <span>로그인하기</span>
                  </Link>
                </div>
              </div>
            )}
            {/* 포스트잇 스타일 댓글 목록 */}
            {loading ? (
              <div className="text-center text-gray-500 py-6">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500 border-r-2 border-indigo-500 border-b-2 border-transparent"></div>
                <p className="mt-2">댓글을 불러오는 중...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-gray-500 italic py-8">
                아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comments.map(comment => (
                  <div 
                    key={comment.id}
                    className={`${comment.color} p-4 rounded-md shadow-sm transform rotate-[${Math.random() * 2 - 1}deg] transition-transform hover:rotate-0 relative`}
                  >
                    {editingComment === comment.id ? (
                      <>
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleCancelEditComment}
                            className="text-gray-500 hover:text-gray-700 p-1"
                            title="취소"
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={() => handleSaveComment(comment.id)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="저장"
                          >
                            <Save size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mb-2 text-gray-800">{comment.message}</p>
                        <p className="text-right text-sm text-gray-600">- {comment.name}</p>
                        {/* 댓글 작성자만 볼 수 있는 수정/삭제 버튼 */}
                        {isCommentOwner(comment) && (
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <button 
                              onClick={() => handleStartEditComment(comment)}
                              className="text-gray-400 hover:text-indigo-600 p-1"
                              title="수정"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-600 p-1"
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 맨 위로 버튼 */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg z-50 hover:bg-indigo-700 transition-all"
          aria-label="맨 위로 이동"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}; 
import React from 'react';
import { ChevronDown, ChevronUp, Menu, Book } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  sections: {
    id: string;
    title: string;
  }[];
}

interface StoryChapterNavigationProps {
  chapters: Chapter[];
  currentChapter: string;
  currentSection: string | null;
  onChapterSelect: (chapterId: string) => void;
  onSectionSelect: (chapterId: string, sectionId: string) => void;
}

export const StoryChapterNavigation: React.FC<StoryChapterNavigationProps> = ({
  chapters,
  currentChapter,
  currentSection,
  onChapterSelect,
  onSectionSelect,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [expandedChapters, setExpandedChapters] = React.useState<Record<string, boolean>>({});
  const menuRef = React.useRef<HTMLDivElement>(null);
  const isMobile = React.useRef(false);

  // 현재 챕터 자동 펼치기
  React.useEffect(() => {
    if (currentChapter && !expandedChapters[currentChapter]) {
      setExpandedChapters(prev => ({
        ...prev,
        [currentChapter]: true
      }));
    }
  }, [currentChapter, expandedChapters]);

  // 모바일 환경 감지
  React.useEffect(() => {
    const checkIsMobile = () => {
      isMobile.current = window.innerWidth < 768;
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // 메뉴 외부 클릭 감지
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };
  
  // 챕터 선택 핸들러
  const handleChapterSelect = (chapterId: string) => {
    onChapterSelect(chapterId);
    toggleChapter(chapterId);
    
    // 모바일에서는 챕터 선택 시 메뉴를 닫지 않음 (섹션을 선택할 수 있도록)
    // 메뉴가 닫히길 원한다면 여기에 setIsOpen(false) 추가
  };
  
  // 섹션 선택 핸들러
  const handleSectionSelect = (chapterId: string, sectionId: string) => {
    onSectionSelect(chapterId, sectionId);
    
    // 모바일에서만 메뉴 닫기
    if (isMobile.current) {
      setIsOpen(false);
    }
  };

  // 현재 챕터 및 섹션 정보 가져오기
  const currentChapterObj = chapters.find(c => c.id === currentChapter);
  const currentSectionObj = currentChapterObj?.sections.find(s => s.id === currentSection);

  // 모바일 토글 버튼에 사용할 아이콘 및 상태 스타일
  const getToggleButtonStyle = () => {
    return isOpen 
      ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
      : "bg-white text-gray-700";
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 모바일 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden flex items-center gap-2 px-4 py-2.5 border rounded-md shadow-sm w-full transition-colors ${getToggleButtonStyle()}`}
        aria-expanded={isOpen}
        aria-label="목차 열기"
      >
        <Menu size={18} className={isOpen ? "text-indigo-600" : ""} />
        <span className="flex-1 text-left truncate overflow-hidden">
          {currentChapterObj && (
            <span className="font-medium">{currentChapterObj.title}</span>
          )}
          {currentSectionObj && currentSectionObj.title && (
            <span className="text-gray-500 mx-1">›</span>
          )}
          {currentSectionObj && currentSectionObj.title && (
            <span className="text-gray-500 truncate">{currentSectionObj.title}</span>
          )}
        </span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
        />
      </button>

      {/* 네비게이션 메뉴 */}
      <div
        className={`
          absolute md:relative top-full md:top-0 left-0 w-full md:w-64
          bg-white border rounded-md shadow-lg md:shadow-none z-50
          transition-all duration-300 ease-in-out 
          ${isOpen ? 'opacity-100 visible mt-2' : 'opacity-0 invisible md:opacity-100 md:visible'}
        `}
      >
        <div className="p-4 md:p-0 max-h-[70vh] md:max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Book size={16} className="text-indigo-600" />
              <h3 className="font-bold text-lg text-gray-800">목차</h3>
            </div>
            
            {/* 모바일에서만 표시되는 닫기 버튼 */}
            <button 
              className="md:hidden p-1.5 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsOpen(false)}
              aria-label="목차 닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <ul className="space-y-2">
            {chapters.map((chapter) => (
              <li key={chapter.id} className="border-b border-gray-100 pb-2 mb-1">
                <div
                  className={`
                    flex items-center justify-between py-2.5 px-3 rounded-md cursor-pointer
                    ${currentChapter === chapter.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => handleChapterSelect(chapter.id)}
                >
                  <span className="line-clamp-1">{chapter.title}</span>
                  <button 
                    className="p-1.5 rounded-full hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 버블링 방지
                      toggleChapter(chapter.id);
                    }}
                    aria-label={expandedChapters[chapter.id] ? "챕터 접기" : "챕터 펼치기"}
                  >
                    {expandedChapters[chapter.id] ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
                
                {expandedChapters[chapter.id] && chapter.sections.length > 0 && (
                  <ul className="ml-4 mt-2 space-y-1">
                    {chapter.sections
                      .filter(section => section.title)
                      .map((section) => (
                      <li key={section.id}>
                        <button
                          className={`
                            py-2 px-3 text-sm rounded w-full text-left truncate
                            ${
                              currentChapter === chapter.id && currentSection === section.id
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'hover:bg-gray-50 text-gray-700'
                            }
                          `}
                          onClick={() => handleSectionSelect(chapter.id, section.id)}
                        >
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}; 
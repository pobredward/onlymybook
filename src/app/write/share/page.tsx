'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { MainLayout } from '@/components/layout/MainLayout';
import { TextArea } from '@/components/ui/TextArea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData } from '@/lib/db';

// 공유 설정 인터페이스
interface ShareSettings {
  authorName: string;
  endingTitle: string;
  endingMessage: string;
  allowComments: boolean;
  allowReactions: boolean;
}

const PreviewPanel = ({
  preview,
  selectedPersonalInfo,
  selectedNarrationType,
  contentAnswers,
  isLoading,
}: {
  preview: string;
  selectedPersonalInfo: string[];
  selectedNarrationType: string;
  contentAnswers: Record<string, string>;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="preview-panel bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">미리보기를 생성하는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 선택된 내용에 따라 다른 스타일이나 추가 요소 표시 가능
  return (
    <div className="preview-panel bg-white p-6 rounded-lg shadow-md h-full overflow-auto">
      <div className="prose prose-lg mx-auto">
        <div className="text-xl font-semibold mb-6 text-gray-800">미리보기</div>
        <div className="whitespace-pre-line">
          {preview || "미리보기를 생성하려면 '미리보기 생성' 버튼을 클릭하세요."}
        </div>
      </div>
    </div>
  );
};

const ShareSection = ({
  previewUrl,
  fullStoryUrl,
  handleGenerateLink,
  isGenerating,
  isShared,
  setIsSettingsVisible,
}: {
  previewUrl: string | null;
  fullStoryUrl: string | null;
  handleGenerateLink: () => void;
  isGenerating: boolean;
  isShared: boolean;
  setIsSettingsVisible: (visible: boolean) => void;
}) => {
  const router = useRouter();
  
  const copyLink = (link: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("링크가 복사되었습니다!");
  };

  const shareKakao = (link: string) => {
    if (!link || !window.Kakao) return;
    
    // 카카오 공유하기 구현
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '나의 디지털 자서전',
        description: '나의 특별한 이야기를 확인해보세요.',
        imageUrl: 'https://your-site.com/images/preview-image.jpg',
        link: {
          mobileWebUrl: link,
          webUrl: link,
        },
      },
      buttons: [
        {
          title: '자서전 읽기',
          link: {
            mobileWebUrl: link,
            webUrl: link,
          },
        },
      ],
    });
  };

  return (
    <div className="share-section bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">자서전 링크 생성</h2>
      
      {!isShared ? (
        <div className="mb-8">
          <p className="text-gray-600 mb-6">
            자서전 링크를 생성하면 다른 사람들과 공유할 수 있습니다.
          </p>
          
          <Button
            onClick={handleGenerateLink}
            isLoading={isGenerating}
            className="w-full py-3"
          >
            자서전 생성 및 링크 만들기
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            * 링크 생성 후에는 내용을 수정할 수 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">공유 링크</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={previewUrl || ""}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <Button
                onClick={() => previewUrl && copyLink(previewUrl)}
                variant="outline"
                size="sm"
              >
                복사
              </Button>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <Button
                onClick={() => previewUrl && shareKakao(previewUrl)}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                <Image 
                  src="/images/kakao-icon.png" 
                  alt="Kakao" 
                  width={20} 
                  height={20} 
                />
                카카오로 공유하기
              </Button>
              
              <Button
                onClick={() => previewUrl && window.open(previewUrl, "_blank")}
                variant="outline"
              >
                미리보기 보기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SharePage() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();
  const [personalInfo, setPersonalInfo] = useState<Record<string, unknown>>({});
  const [narrativeType, setNarrativeType] = useState<string | null>(null);
  const [contentAnswers, setContentAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewLink, setPreviewLink] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  
  // 공유 설정
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    authorName: '',
    endingTitle: '감사합니다',
    endingMessage: '이 이야기를 읽어주셔서 감사합니다. 여러분과 함께 나눌 수 있어 행복했습니다.',
    allowComments: true,
    allowReactions: true
  });
  
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [needsUserIdSetup, setNeedsUserIdSetup] = useState(false);

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 가져오기
  useEffect(() => {
    // 저장된 공유 설정 불러오기
    const savedShareSettings = localStorage.getItem('autobiography_share_settings');
    if (savedShareSettings) {
      try {
        setShareSettings({
          authorName: '',
          endingTitle: '감사합니다',
          endingMessage: '이 이야기를 읽어주셔서 감사합니다. 여러분과 함께 나눌 수 있어 행복했습니다.',
          allowComments: true,
          allowReactions: true,
          ...JSON.parse(savedShareSettings)
        });
      } catch (e) {
        console.error('Failed to parse saved share settings:', e);
      }
    }

    // 서사 유형 불러오기
    const savedNarrativeType = localStorage.getItem('autobiography_narrative_type');
    if (savedNarrativeType) {
      setNarrativeType(savedNarrativeType);
    } else {
      // 서사 유형이 없으면 이전 단계로 리디렉션
      router.push('/write/narrative');
      return;
    }

    // 내용 답변 불러오기
    const savedContentAnswers = localStorage.getItem('autobiography_content_answers');
    if (savedContentAnswers) {
      try {
        setContentAnswers(JSON.parse(savedContentAnswers));
      } catch (e) {
        console.error('Failed to parse saved content answers:', e);
      }
    } else {
      // 내용 답변이 없으면 이전 단계로 리디렉션
      router.push('/write/content');
      return;
    }

    // 개인 정보 불러오기
    const savedPersonalInfo = localStorage.getItem('autobiography_personal_info');
    if (savedPersonalInfo) {
      try {
        setPersonalInfo(JSON.parse(savedPersonalInfo));
      } catch (e) {
        console.error('Failed to parse saved personal info:', e);
      }
    } else {
      // 개인 정보가 없으면 첫 단계로 리디렉션
      router.push('/write/personal');
      return;
    }

    // 사용자 ID 확인
    const checkUserCustomId = async () => {
      if (currentUser && !currentUser.isAnonymous) {
        try {
          const userData = await getUserData(currentUser.uid);
          // 커스텀 ID가 없거나 게스트 ID인 경우
          if (!userData?.customId || userData.customId.startsWith('guest_')) {
            setNeedsUserIdSetup(true);
          }
        } catch (error) {
          console.error('사용자 정보 확인 중 오류:', error);
        }
      }
    };

    if (!authLoading && currentUser) {
      checkUserCustomId();
    }
  }, [router, currentUser, authLoading]);

  // 공유 입력 핸들러
  const handleAuthorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShareSettings({
      ...shareSettings,
      authorName: e.target.value
    });
  };
  const handleEndingTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShareSettings({
      ...shareSettings,
      endingTitle: e.target.value
    });
  };
  const handleEndingMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setShareSettings({
      ...shareSettings,
      endingMessage: e.target.value
    });
  };

  // 이전 단계로 이동
  const goToPreviousStep = () => {
    // 현재 공유 설정 저장
    localStorage.setItem('autobiography_share_settings', JSON.stringify(shareSettings));
    
    // 이전 페이지로 이동
    router.push('/write/content');
  };

  // 자서전 미리보기 생성 및 링크 생성
  const generatePreviewStory = async () => {
    // 필수 정보 체크
    if (!personalInfo || !narrativeType || Object.keys(contentAnswers).length === 0) {
      setShowWarning(true);
      return;
    }

    // 로그인한 사용자이고 사용자 ID가 필요한 경우 설정하도록 안내
    if (currentUser && !currentUser.isAnonymous && needsUserIdSetup) {
      const confirmResult = window.confirm(
        '자서전 공유를 위해 사용자 ID 설정이 필요합니다.\n마이페이지로 이동하여 ID를 설정하시겠습니까?\n(나중에 설정해도 자서전은 저장됩니다.)'
      );
      
      if (confirmResult) {
        // 현재 입력 정보를 로컬 스토리지에 임시 저장
        saveDataToLocalStorage();
        router.push('/mypage');
        return;
      }
    }

    setIsGenerating(true);
    
    try {
      // 새로운 스토리 생성을 위해 기존 URL과 생성 중 플래그 제거
      localStorage.removeItem('generated_story_url');
      localStorage.removeItem('generation_in_progress');
      
      // 모든 데이터를 로컬 스토리지에 저장
      localStorage.setItem('autobiography_share_settings', JSON.stringify(shareSettings));
      
      // 필요한 정보를 모두 로컬 스토리지에 저장
      const allAnswers: Record<string, string> = {};
      
      // 개인 정보를 문자열로 변환하여 추가
      Object.entries(personalInfo).forEach(([key, value]) => {
        if (typeof value === 'string') {
          allAnswers[`개인정보_${key}`] = value;
        } else if (value !== null && value !== undefined) {
          allAnswers[`개인정보_${key}`] = String(value);
        }
      });
      
      // 내용 답변 추가
      Object.entries(contentAnswers).forEach(([key, value]) => {
        allAnswers[key] = value;
      });
      
      // 서사 유형 추가
      if (narrativeType) {
        allAnswers['서사유형'] = narrativeType;
      }
      
      // 작성자 이름, 마무리 멘트 저장
      localStorage.setItem('temp_story_author', shareSettings.authorName);
      localStorage.setItem('temp_story_ending_title', shareSettings.endingTitle);
      localStorage.setItem('temp_story_ending_message', shareSettings.endingMessage);
      
      // 모든 답변 저장
      localStorage.setItem('temp_story_answers', JSON.stringify(allAnswers));
      
      // 자서전 생성 페이지로 이동
      router.push('/write/generating-story');
    } catch (e) {
      console.error('자서전 정보 저장 오류:', e);
      setError('자서전 정보 저장 중 오류가 발생했습니다.');
      setIsGenerating(false);
    }
  };

  // 로컬 스토리지에 데이터 저장
  const saveDataToLocalStorage = () => {
    const dataToSave = {
      personalInfo,
      narrativeType,
      contentAnswers,
      timestamp: Date.now()
    };
    
    localStorage.setItem('autobiography_generation_data', JSON.stringify(dataToSave));
  };

  // 링크 복사
  const copyLink = () => {
    if (!previewLink) return;
    
    const fullLink = window.location.origin + previewLink;
    navigator.clipboard.writeText(fullLink)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        setError('링크 복사에 실패했습니다.');
      });
  };

  // 링크로 이동
  const goToPreview = () => {
    if (previewLink) {
      window.open(previewLink, '_blank');
    }
  };

  // 단계 표시기
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 w-full">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white">
          1
        </div>
        <p className="mt-2 text-sm text-gray-600">개인 정보</p>
      </div>
      
      <div className="flex-1 h-1 mx-2 sm:mx-4 bg-indigo-600" />
      
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white">
          2
        </div>
        <p className="mt-2 text-sm text-gray-600">1장 주제 선택</p>
      </div>
      
      <div className="flex-1 h-1 mx-2 sm:mx-4 bg-indigo-600" />
      
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white">
          3
        </div>
        <p className="mt-2 text-sm text-gray-600">1장 작성</p>
      </div>
      
      <div className="flex-1 h-1 mx-2 sm:mx-4 bg-indigo-600" />
      
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white">
          4
        </div>
        <p className="mt-2 text-sm text-gray-600">공유</p>
      </div>
    </div>
  );

  return (
    <MainLayout 
      title="자서전 작성하기 - 공유 설정" 
      description="자서전 공유 방식을 설정하세요."
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl xs:text-3xl font-extrabold text-gray-900 sm:text-4xl">
            당신의 이야기를 소중한 사람들과 공유하세요
          </h1>
          <p className="mt-4 text-base sm:text-xl text-gray-500">
            자서전을 생성하고 공유해보세요.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {renderStepIndicator()}
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-3 text-2xl">💌</span>
              자서전 공유하기
            </h2>
            
            <p className="text-gray-600 mb-6">
              당신의 자서전을 소중한 사람들과 공유해보세요. 개인적인 메시지를 남길 수 있습니다.
            </p>
            
            {/* UI 영역 - 메시지 입력란 삭제, 작가 이름/마무리 멘트 입력란 추가 */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg text-gray-900 mb-3">작가 이름</h3>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                  placeholder="예: 홍길동"
                  value={shareSettings.authorName}
                  onChange={handleAuthorNameChange}
                  maxLength={20}
                />
                <p className="text-sm text-gray-500 mt-1">자서전 표지와 마지막에 표시됩니다.</p>
              </div>
              <div>
                <h3 className="font-medium text-lg text-gray-900 mb-3">마무리 제목</h3>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                  placeholder="예: 감사합니다"
                  value={shareSettings.endingTitle}
                  onChange={handleEndingTitleChange}
                  maxLength={20}
                />
                <p className="text-sm text-gray-500 mt-1">마무리 영역의 제목으로 사용됩니다.</p>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-medium text-lg text-gray-900 mb-3">마무리 멘트</h3>
              <TextArea
                placeholder="예: 이 이야기를 읽어주셔서 감사합니다. 여러분과 함께 나눌 수 있어 행복했습니다."
                rows={3}
                value={shareSettings.endingMessage}
                onChange={handleEndingMessageChange}
              />
              <p className="text-sm text-gray-500">자서전 마지막에 표시됩니다.</p>
            </div>
            
            {/* 사용자 ID 설정 안내 알림 */}
            {needsUserIdSetup && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-md">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">알림: 사용자 ID 설정이 필요합니다</h3>
                <p className="text-amber-700 mb-2">
                  자서전 공유를 위한 고유 URL 생성에 사용자 ID가 필요합니다. 
                  마이페이지에서 사용자 ID를 설정하시면 더 깔끔한 공유 링크가 생성됩니다.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    saveDataToLocalStorage();
                    router.push('/mypage');
                  }}
                  className="bg-white text-amber-700 border-amber-400 hover:bg-amber-100"
                >
                  사용자 ID 설정하기
                </Button>
              </div>
            )}
            
            {/* 링크 생성 결과 */}
            {previewLink && (
              <div className="mt-8 bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">자서전 링크가 생성되었습니다!</h3>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text"
                    readOnly
                    value={window.location.origin + previewLink}
                    className="flex-1 p-2 border border-gray-300 rounded-md bg-white text-sm"
                  />
                  <button 
                    onClick={copyLink}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                  >
                    {copySuccess ? '복사됨!' : '복사'}
                  </button>
                </div>
                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="primary" 
                    onClick={goToPreview}
                  >
                    새 탭에서 보기
                  </Button>
                </div>
              </div>
            )}
            
            {/* 완료 버튼 */}
            {!previewLink && (
              <div className="flex justify-between mt-8">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="lg" 
                  onClick={goToPreviousStep}
                >
                  이전
                </Button>
                
                <Button 
                  type="button" 
                  variant="primary" 
                  size="lg" 
                  onClick={generatePreviewStory}
                  disabled={isGenerating}
                >
                  {isGenerating ? '처리 중...' : '자서전 생성 및 링크 만들기'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
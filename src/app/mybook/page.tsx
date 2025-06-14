'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyStories, getStory } from '@/lib/db';
import { Story } from '@/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { BookOpen, Heart, MessageSquare, Plus, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { StoryDetail } from '@/app/library/StoryDetail';
import { StoryCard } from '@/components/story/StoryCard';

export default function MyBookPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [bookmarks, setBookmarks] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, userData, loading } = useAuth();
  const router = useRouter();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    async function fetchMyStories() {
      if (loading) return;
      
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }
      
      setIsLoading(true);
      try {
        const myStories = await getMyStories(currentUser.uid);
        setStories(myStories);
        
        // 북마크 가져오기
        if (userData?.bookmarks && userData.bookmarks.length > 0) {
          const bookmarkedStories = await Promise.all(
            userData.bookmarks.map((id: string) => getStory(id))
          );
          setBookmarks(bookmarkedStories.filter(Boolean) as Story[]);
        }
      } catch (error) {
        console.error('내 스토리 가져오기 오류:', error);
        toast.error('스토리를 가져오는데 문제가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyStories();
  }, [currentUser, loading, router, userData]);

  const handleCreateNew = () => {
    router.push('/write');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <MainLayout title="나의 자서전 - 디지털 자서전" description="내가 작성한 자서전과 북마크한 자서전을 관리합니다.">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">나만의 책장</h1>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">내가 작성한 자서전</h2>
            <Button onClick={handleCreateNew} className="flex items-center gap-2">
              <Plus size={16} />
              새 자서전 작성하기
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={{...story, canEdit: true}} onClick={() => setSelectedStory({...story, canEdit: true} as Story)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
              <BookOpen size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">아직 작성한 자서전이 없습니다</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                당신만의 특별한 이야기를 작성하고 소중한 순간들을 기록해보세요.
              </p>
              <Button onClick={handleCreateNew} className="flex items-center gap-2">
                <Plus size={16} />
                자서전 작성 시작하기
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">북마크한 자서전</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((story) => (
                <StoryCard key={story.id} story={story} onClick={() => setSelectedStory(story as Story)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
              <Heart size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">북마크한 자서전이 없습니다</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                서재에서 마음에 드는 자서전을 찾아 북마크해보세요.
              </p>
              <Button className="bg-white" onClick={() => router.push('/library')}>
                서재 둘러보기
              </Button>
            </div>
          )}
        </div>
        {/* StoryDetail 모달 */}
        {selectedStory && (
          <StoryDetail
            story={selectedStory}
            onClose={() => setSelectedStory(null)}
            onBookmark={() => {}}
            isBookmarked={false}
          />
        )}
      </div>
    </MainLayout>
  );
} 
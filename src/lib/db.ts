import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc
} from 'firebase/firestore';
import { Story, User } from '@/types';
import { signInAnonymously } from 'firebase/auth';

// 익명 사용자 로그인 (or 이미 로그인된 경우 현재 사용자 반환)
export const getOrCreateUser = async (): Promise<string> => {
  if (!auth.currentUser) {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user.uid;
  }
  return auth.currentUser.uid;
};

// 사용자 데이터 가져오기
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      // 사용자가 존재하지 않으면 생성
      const newUser: User = {
        id: userId,
        stories: [],
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'users', userId), newUser);
      return newUser;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// 미리보기 스토리 저장
export const savePreviewStory = async (userId: string, content: string): Promise<string> => {
  try {
    const storyData: Omit<Story, 'id'> = {
      userId,
      title: '나의 디지털 자서전 (미리보기)',
      content,
      createdAt: Date.now(),
      isPreview: true,
      isPaid: false
    };
    
    const docRef = await addDoc(collection(db, 'stories'), storyData);
    
    // 사용자 문서에 스토리 ID 추가
    const userRef = doc(db, 'users', userId);
    const userData = await getDoc(userRef);
    
    if (userData.exists()) {
      const user = userData.data() as User;
      await updateDoc(userRef, {
        stories: [...user.stories, docRef.id]
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving preview story:', error);
    throw new Error('스토리 저장 중 오류가 발생했습니다.');
  }
};

// 전체 스토리 저장
export const saveFullStory = async (userId: string, content: string, previewStoryId?: string): Promise<string> => {
  try {
    const storyData: Omit<Story, 'id'> = {
      userId,
      title: '나의 디지털 자서전',
      content,
      createdAt: Date.now(),
      isPreview: false,
      isPaid: true
    };
    
    let storyId = '';
    
    if (previewStoryId) {
      // 미리보기 스토리를 업데이트
      const storyRef = doc(db, 'stories', previewStoryId);
      await updateDoc(storyRef, {
        ...storyData,
        updatedAt: Date.now()
      });
      storyId = previewStoryId;
    } else {
      // 새 스토리 생성
      const docRef = await addDoc(collection(db, 'stories'), storyData);
      storyId = docRef.id;
      
      // 사용자 문서에 스토리 ID 추가
      const userRef = doc(db, 'users', userId);
      const userData = await getDoc(userRef);
      
      if (userData.exists()) {
        const user = userData.data() as User;
        await updateDoc(userRef, {
          stories: [...user.stories, storyId]
        });
      }
    }
    
    return storyId;
  } catch (error) {
    console.error('Error saving full story:', error);
    throw new Error('스토리 저장 중 오류가 발생했습니다.');
  }
};

// 스토리 가져오기
export const getStory = async (storyId: string): Promise<Story | null> => {
  try {
    const storyDoc = await getDoc(doc(db, 'stories', storyId));
    if (storyDoc.exists()) {
      return storyDoc.data() as Story;
    }
    return null;
  } catch (error) {
    console.error('Error getting story:', error);
    return null;
  }
};

// 사용자의 모든 스토리 가져오기
export const getUserStories = async (userId: string): Promise<Story[]> => {
  try {
    const q = query(collection(db, 'stories'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const stories: Story[] = [];
    querySnapshot.forEach((doc) => {
      stories.push({ id: doc.id, ...doc.data() } as Story);
    });
    
    return stories.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting user stories:', error);
    return [];
  }
}; 
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
  updateDoc,
  writeBatch,
  documentId,
  orderBy,
  limit as firestoreLimit,
  increment,
  QueryConstraint,
  serverTimestamp,
  startAfter,
  deleteDoc
} from 'firebase/firestore';
import { Story, User, Reaction } from '@/types';
import { signInAnonymously, getAuth } from 'firebase/auth';
import { getGuestId, getCookie } from '@/lib/cookies';
import { setCookie } from 'cookies-next';

// 익명 사용자 로그인 (or 이미 로그인된 경우 현재 사용자 반환)
export const getOrCreateUser = async (): Promise<string> => {
  try {
    if (!auth.currentUser) {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user.uid;
    }
    return auth.currentUser.uid;
  } catch (error) {
    console.error('Error creating anonymous user:', error);
    // 익명 ID 반환 (로그인 실패 시)
    return `anonymous_${Date.now()}`;
  }
};

// 사용자의 스토리 개수 가져오기
export const getUserStoryCount = async (userId: string): Promise<number> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      return userData.storyCount || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting user story count:', error);
    return 0;
  }
};

// 인증된 사용자인지 확인
export const isAuthenticatedUser = (): boolean => {
  const auth = getAuth();
  const user = auth.currentUser;
  return !!user && !user.isAnonymous;
};

// 사용자 커스텀 ID 업데이트
export const updateUserCustomId = async (userId: string, customId: string): Promise<boolean> => {
  try {
    // customId 중복 확인
    const usersWithCustomId = await getDocs(
      query(collection(db, 'users'), where('customId', '==', customId))
    );
    
    if (!usersWithCustomId.empty) {
      // 중복 ID 확인 - 자신의 ID인 경우는 제외
      const existingUser = usersWithCustomId.docs[0];
      if (existingUser.id !== userId) {
        throw new Error('이미 사용 중인 ID입니다. 다른 ID를 선택해주세요.');
      }
    }
    
    // 사용자 문서 업데이트
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      customId: customId,
      updatedAt: Date.now()
    });
    
    console.log(`사용자 ID 업데이트 완료: ${userId} -> ${customId}`);
    
    // 게스트 ID인 경우 사용자의 모든 스토리의 shareUrl 업데이트
    if (userId.startsWith('guest_')) {
      const userStories = await getUserStories(userId);
      console.log(`${userStories.length}개의 스토리 URL 업데이트 예정`);
      
      // 각 스토리 업데이트
      for (const story of userStories) {
        const newShareUrl = `/story/${customId}/${story.storyNumber || 1}`;
        await updateDoc(doc(db, 'stories', story.id), {
          shareUrl: newShareUrl,
          customUserId: customId
        });
        console.log(`스토리 URL 업데이트: ${story.id} -> ${newShareUrl}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('사용자 ID 업데이트 중 오류:', error);
    throw error;
  }
};

// 로그인 없이 미리보기 스토리 저장 (임시 ID 사용) 수정
export const savePreviewStoryWithoutLogin = async (content: string): Promise<string> => {
  try {
    // 현재 인증 상태 확인
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    // 인증 여부 확인 및 로깅
    const isAuthenticated = !!(currentUser && !currentUser.isAnonymous);
    console.log(`User authentication status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    
    // Firebase uid 또는 게스트 ID
    let userId = (currentUser && !currentUser.isAnonymous) 
      ? currentUser.uid 
      : `guest_${Date.now()}`;
    
    console.log(`Base userId: ${userId} for story creation`);
    
    // 사용자 데이터 가져오기 - 커스텀 ID 확인
    let userCustomId = '';
    let userData = null;
    
    if (isAuthenticated && currentUser) {
      try {
        userData = await getUserData(userId);
        userCustomId = userData?.customId || '';
        console.log(`사용자 데이터 가져옴, customId: ${userCustomId}`);
        
        // customId가 없으면 사용자에게 알리는 로그 출력
        if (!userCustomId) {
          console.log('경고: 로그인된 사용자이지만 customId가 설정되지 않았습니다. 마이페이지에서 설정이 필요합니다.');
        }
      } catch (error) {
        console.error('사용자 데이터 가져오기 실패:', error);
      }
    }
    
    // 게스트 ID인 경우 쿠키에 저장 (나중에 연결 목적)
    if (userId.startsWith('guest_')) {
      console.log('Saving guest ID to cookie for future linking');
      setCookie('guest_id', userId, { 
        maxAge: 60 * 60 * 24 * 30, // 30일 유효기간
        path: '/'
      });
    }
    
    // 인증된 사용자인 경우 스토리 번호를 확인하고, 아니면 1 사용
    let storyNumber = 1;
    
    // 사용자의 실제 스토리 수 확인하여 번호 할당
    const userStoryCount = await getUserStoryCount(userId);
    storyNumber = userStoryCount + 1;
    console.log(`Assigning story number: ${storyNumber}`);
    
    // 공유 설정(작가명, 마무리 등) 로컬스토리지에서 불러오기
    let authorName = '작가님';
    let endingTitle = '감사합니다';
    let endingMessage = '이 이야기를 읽어주셔서 감사합니다. 여러분과 함께 나눌 수 있어 행복했습니다.';
    let allowComments = true;
    let allowReactions = true;
    if (typeof window !== 'undefined') {
      try {
        const shareSettingsJson = localStorage.getItem('autobiography_share_settings');
        if (shareSettingsJson) {
          const shareSettings = JSON.parse(shareSettingsJson);
          authorName = shareSettings.authorName || authorName;
          endingTitle = shareSettings.endingTitle || endingTitle;
          endingMessage = shareSettings.endingMessage || endingMessage;
          allowComments = typeof shareSettings.allowComments === 'boolean' ? shareSettings.allowComments : allowComments;
          allowReactions = typeof shareSettings.allowReactions === 'boolean' ? shareSettings.allowReactions : allowReactions;
        }
      } catch (e) {
        console.error('공유 설정 파싱 오류:', e);
      }
    }

    // Firebase에 저장할 스토리 데이터
    const storyData = {
      userId,
      storyNumber,
      title: '디지털 자서전',
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPreview: true,
      isPaid: false,
      isPublic: false, // 기본값 false로 설정
      isAuthenticated, // 인증 상태 저장
      customUserId: userCustomId || null, // customId도 직접 저장
      authorName,
      endingTitle,
      endingMessage,
      allowComments,
      allowReactions
    };
    
    // Firebase가 ID를 자동 생성하도록 addDoc 사용
    const storyRef = await addDoc(collection(db, 'stories'), storyData);
    console.log(`Story created with ID: ${storyRef.id}`);
    
    // URL에 사용할 ID 결정 로직:
    // 1. 인증된 사용자 + customId 있음 = customId 사용
    // 2. 인증된 사용자 + customId 없음 = userId 사용 (Firebase UID)
    // 3. 비인증 사용자 = 게스트 ID 사용
    let urlUserId = userId; // 기본값은 원래 ID
    
    if (isAuthenticated) {
      if (userCustomId) {
        urlUserId = userCustomId;
        console.log(`인증된 사용자의 customId 사용: ${urlUserId}`);
      } else {
        console.log(`인증된 사용자이지만 customId가 없어 userId 사용: ${urlUserId}`);
      }
    } else {
      console.log(`게스트 사용자 ID 사용: ${urlUserId}`);
    }
    
    // 일관된 URL 형식 사용: /story/[userId]/[storyNumber]
    const shareUrl = `/story/${urlUserId}/${storyNumber}`;
    console.log(`Final share URL: ${shareUrl}`);
    
    // shareUrl 업데이트
    await updateDoc(storyRef, {
      shareUrl,
      customUserId: userCustomId || null
    });
    
    // 사용자 정보 업데이트 (게스트 사용자도 documents에 포함)
    await updateUserStory(userId, storyRef.id);
    
    // 개인정보에 스토리 ID 저장 (로컬 스토리지) - 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      try {
        const personalInfoJson = localStorage.getItem('autobiography_personal_info');
        if (personalInfoJson) {
          const personalInfo = JSON.parse(personalInfoJson);
          personalInfo.userId = userId; // 사용자 ID 추가
          personalInfo.latestStoryId = storyRef.id; // 최신 스토리 ID 추가
          localStorage.setItem('autobiography_personal_info', JSON.stringify(personalInfo));
          console.log('Updated personal info with user ID and story ID');
        }
      } catch (e) {
        console.error('Error updating personal info:', e);
        // 진행은 계속함
      }
    }
    
    return storyRef.id;
  } catch (error) {
    console.error('Error saving preview story:', error);
    throw new Error('스토리 저장 중 오류가 발생했습니다.');
  }
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
        storyCount: 0,
        createdAt: Date.now(),
        promotionSubscribed: false // 기본적으로 프로모션 구독 안 함
      };
      await setDoc(doc(db, 'users', userId), newUser);
      return newUser;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// 미리보기 스토리 저장 (수정)
export const savePreviewStory = async (userId: string, content: string): Promise<string> => {
  try {
    // 사용자 데이터 가져와서 커스텀 ID 확인
    const userData = await getUserData(userId);
    const userCustomId = userData?.customId || '';
    
    // 사용자의 스토리 개수 확인 (스토리 번호 부여)
    const userStoryCount = await getUserStoryCount(userId);
    const storyNumber = userStoryCount + 1;
    
    // 스토리 데이터 생성
    const storyData = {
      userId,
      storyNumber,
      title: '디지털 자서전',
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPreview: true,
      isPaid: false
    };
    
    // Firebase가 ID를 자동 생성하도록 addDoc 사용
    const storyRef = await addDoc(collection(db, 'stories'), storyData);
    const storyId = storyRef.id;
    
    // 공유 URL에 사용할 ID 결정: 커스텀 ID가 있으면 사용, 없으면 원래 ID
    const urlUserId = userCustomId || userId;
    
    // shareUrl 업데이트
    const shareUrl = `/story/${urlUserId}/${storyNumber}`;
    await updateDoc(storyRef, {
      shareUrl,
      customUserId: userCustomId || null
    });
    
    // 사용자 문서 업데이트
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      await updateDoc(userRef, {
        stories: [...(userData.stories || []), storyId],
        storyCount: (userData.storyCount || 0) + 1
      });
    } else {
      // 사용자가 없으면 생성
      const newUser: User = {
        id: userId,
        stories: [storyId],
        storyCount: 1,
        createdAt: Date.now(),
        promotionSubscribed: false // 기본적으로 프로모션 구독 안 함
      };
      await setDoc(userRef, newUser);
    }
    
    return storyId;
  } catch (error) {
    console.error('Error saving preview story:', error);
    throw new Error('스토리 저장 중 오류가 발생했습니다.');
  }
};

// 전체 스토리 저장
export const saveFullStory = async (userId: string, content: string, previewStoryId?: string): Promise<string> => {
  try {
    // 사용자의 스토리 개수 확인
    let storyNumber = 1;
    if (previewStoryId) {
      // 기존 스토리인 경우 번호 유지
      const storyDoc = await getDoc(doc(db, 'stories', previewStoryId));
      if (storyDoc.exists()) {
        const storyData = storyDoc.data() as Story;
        storyNumber = storyData.storyNumber || 1;
      }
    } else {
      // 새 스토리인 경우 번호 증가
      const userStoryCount = await getUserStoryCount(userId);
      storyNumber = userStoryCount + 1;
    }
    
    const storyData = {
      userId,
      storyNumber,
      title: '디지털 자서전',
      content,
      updatedAt: Date.now(),
      isPreview: false,
      isPaid: true,
      isPublic: false // 기본값 false로 설정
    };
    
    let storyId: string;
    
    if (previewStoryId) {
      // 미리보기 스토리 업데이트
      storyId = previewStoryId;
      const storyRef = doc(db, 'stories', previewStoryId);
      const storyDoc = await getDoc(storyRef);
      
      if (storyDoc.exists()) {
        const existingStory = storyDoc.data() as Story;
        
        // 게스트 사용자였다면 유저ID 변경
        if (existingStory.userId.startsWith('guest_') && existingStory.userId !== userId) {
          // 새 shareUrl 생성 (인증된 사용자 형식으로)
          const shareUrl = `/story/${userId}/${storyNumber}`;
          
          await updateDoc(storyRef, {
            ...storyData,
            shareUrl
          });
          
          // 사용자 문서 업데이트
          await updateUserStory(userId, storyId);
        } else {
          // 같은 사용자의 스토리 업데이트 (shareUrl 형식이 이전 형식이면 업데이트)
          let shareUrl = existingStory.shareUrl;
          if (!shareUrl || !shareUrl.startsWith(`/story/${userId}/`)) {
            shareUrl = `/story/${userId}/${storyNumber}`;
          }
          
          await updateDoc(storyRef, {
            ...storyData,
            shareUrl
          });
        }
      } else {
        throw new Error('미리보기 스토리를 찾을 수 없습니다.');
      }
    } else {
      // 새 스토리 생성 - Firebase가 ID를 자동 생성하도록 addDoc 사용
      const storyRef = await addDoc(collection(db, 'stories'), {
        ...storyData,
        createdAt: Date.now()
      });
      storyId = storyRef.id;
      
      // shareUrl 업데이트
      const shareUrl = `/story/${userId}/${storyNumber}`;
      await updateDoc(storyRef, {
        shareUrl
      });
      
      // 사용자 문서 업데이트
      await updateUserStory(userId, storyId);
    }
    
    return storyId;
  } catch (error) {
    console.error('Error saving full story:', error);
    throw new Error('스토리 저장 중 오류가 발생했습니다.');
  }
};

// 사용자 문서에 스토리 추가 헬퍼 함수
async function updateUserStory(userId: string, storyId: string) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const userData = userDoc.data() as User;
    const stories = userData.stories || [];
    
    if (!stories.includes(storyId)) {
      await updateDoc(userRef, {
        stories: [...stories, storyId],
        storyCount: (userData.storyCount || 0) + 1
      });
    }
  } else {
    // 사용자가 없으면 생성
    await setDoc(userRef, {
      id: userId,
      stories: [storyId],
      storyCount: 1,
      createdAt: Date.now(),
      promotionSubscribed: false // 기본적으로 프로모션 구독 안 함
    });
  }
}

// ID로 스토리 가져오기
export async function getStory(id: string): Promise<Story | null> {
  try {
    const storyRef = doc(db, "stories", id);
    const storySnapshot = await getDoc(storyRef);
    
    if (!storySnapshot.exists()) {
      console.log(`Story with id ${id} not found`);
      return null;
    }
    
    // 여기서 storyData 제거하고 바로 반환
    return {
      id: storySnapshot.id,
      ...storySnapshot.data()
    } as Story;
  } catch (error) {
    console.error("Error getting story:", error);
    return null;
  }
}

// userId와 storyNumber로 스토리 가져오기
export const getStoryByUserIdAndNumber = async (userId: string, storyNumber: number): Promise<Story | null> => {
  try {
    console.log(`스토리 조회: userId=${userId}, storyNumber=${storyNumber}`);
    
    // 1. 먼저 직접 userId와 storyNumber로 조회
    let queryRef = query(
      collection(db, 'stories'),
      where('userId', '==', userId),
      where('storyNumber', '==', storyNumber)
    );
    let querySnapshot = await getDocs(queryRef);
    
    // 일치하는 문서가 없으면, customUserId로 검색
    if (querySnapshot.empty) {
      console.log(`직접 userId로 찾지 못함. customUserId로 검색 시도`);
      
      queryRef = query(
        collection(db, 'stories'),
        where('customUserId', '==', userId),
        where('storyNumber', '==', storyNumber)
      );
      querySnapshot = await getDocs(queryRef);
    }
    
    // 여전히 문서가 없으면, 다른 사용자들의 customId 확인
    if (querySnapshot.empty) {
      console.log(`customUserId로도 찾지 못함. 모든 사용자의 customId 확인`);
      
      // 해당 customId를 가진 사용자 찾기
      const userQueryRef = query(
        collection(db, 'users'),
        where('customId', '==', userId)
      );
      const userQuerySnapshot = await getDocs(userQueryRef);
      
      if (!userQuerySnapshot.empty) {
        const userData = userQuerySnapshot.docs[0].data() as User;
        const actualUserId = userData.id;
        
        // 해당 사용자의 스토리 검색
        queryRef = query(
          collection(db, 'stories'),
          where('userId', '==', actualUserId),
          where('storyNumber', '==', storyNumber)
        );
        querySnapshot = await getDocs(queryRef);
      }
    }
    
    // 스토리 문서가 있으면 첫 번째 문서 반환
    if (!querySnapshot.empty) {
      const storyData = querySnapshot.docs[0].data() as Story;
      const storyId = querySnapshot.docs[0].id;
      
      // 조회수 증가
      await increaseViewCount(storyId);
      
      return {
        id: storyId,
        ...storyData,
        viewCount: (storyData.viewCount || 0) + 1
      } as Story;
    }
    
    console.log('일치하는 스토리를 찾지 못함');
    return null;
  } catch (error) {
    console.error('Error getting story by userId and number:', error);
    return null;
  }
};

// 조회수 증가 (비동기 호출용)
async function increaseViewCount(storyId: string): Promise<void> {
  try {
    // 스토리 문서 조회수 증가
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (storyDoc.exists()) {
      const storyData = storyDoc.data() as Story;
      await updateDoc(storyRef, {
        viewCount: (storyData.viewCount || 0) + 1
      });
    }
  } catch (error) {
    console.error('Error increasing view count:', error);
  }
}

// 사용자의 모든 스토리 가져오기
export const getUserStories = async (userId: string): Promise<Story[]> => {
  try {
    console.log('Fetching stories for user:', userId);
    
    // 사용자 문서 가져오기
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data() as User;
    const storyIds = userData.stories || [];
    
    if (storyIds.length === 0) {
      return [];
    }
    
    // 스토리 ID 배열을 통해 실제 스토리 데이터 가져오기
    const stories: Story[] = [];
    
    // Firebase는 한 번에 최대 10개의 'in' 조건만 지원
    // 배열을 청크로 나누어 여러 번 쿼리
    const chunkSize = 10;
    for (let i = 0; i < storyIds.length; i += chunkSize) {
      const chunk = storyIds.slice(i, i + chunkSize);
      
      if (chunk.length > 0) {
        const storiesQuery = query(
          collection(db, 'stories'),
          where(documentId(), 'in', chunk)
        );
        
        const storiesSnapshot = await getDocs(storiesQuery);
        storiesSnapshot.forEach(doc => {
          stories.push({ 
            id: doc.id, 
            ...doc.data() 
          } as Story);
        });
      }
    }
    
    // 최신순으로 정렬
    return stories.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
  } catch (error) {
    console.error('Error getting user stories:', error);
    return [];
  }
};

// 사용자가 작성한 모든 스토리 가져오기 (대체 방법)
export const getUserStoriesByQuery = async (userId: string): Promise<Story[]> => {
  try {
    console.log('Fetching stories by query for user:', userId);
    
    // userId로 직접 쿼리
    const q = query(
      collection(db, 'stories'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const stories: Story[] = [];
    querySnapshot.forEach((doc) => {
      stories.push({ 
        id: doc.id, 
        ...doc.data() 
      } as Story);
    });
    
    // 사용자 문서 업데이트 (일치하지 않는 경우를 대비해 동기화)
    if (stories.length > 0) {
      syncUserStories(userId, stories).catch(console.error);
    }
    
    return stories;
  } catch (error) {
    console.error('Error getting user stories by query:', error);
    return [];
  }
};

// 사용자 문서의 스토리 목록을 동기화하는 헬퍼 함수
async function syncUserStories(userId: string, stories: Story[]): Promise<void> {
  try {
    const storyIds = stories.map(story => story.id);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        stories: storyIds,
        storyCount: storyIds.length
      });
    } else {
      await setDoc(userRef, {
        id: userId,
        stories: storyIds,
        storyCount: storyIds.length,
        createdAt: Date.now()
      });
    }
  } catch (error) {
    console.error('Error syncing user stories:', error);
  }
}

// 게스트 자서전을 로그인한 계정으로 연결하기
export const linkGuestStories = async (guestId: string, userId: string): Promise<number> => {
  try {
    console.log(`Linking guest stories from ${guestId} to ${userId}`);
    
    // 게스트 ID로 작성한 스토리 찾기
    const q = query(collection(db, 'stories'), where('userId', '==', guestId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No guest stories found to link');
      return 0;
    }
    
    // 현재 사용자의 스토리 개수 확인 (번호 부여용)
    const userStoryCount = await getUserStoryCount(userId);
    let storyNumberCounter = userStoryCount;
    
    // 배치 처리 시작
    const batch = writeBatch(db);
    const storyIds = querySnapshot.docs.map(doc => doc.id);
    console.log(`Found ${storyIds.length} guest stories to link`);
    
    // 각 스토리에 대한 작업 수행
    const updatedStories: { id: string, storyNumber: number }[] = [];
    
    querySnapshot.forEach((storyDoc) => {
      const storyRef = storyDoc.ref;
      const storyData = storyDoc.data() as Story;
      
      // 스토리 번호 부여
      storyNumberCounter++;
      const storyNumber = storyNumberCounter;
      
      // shareUrl 업데이트 (새 형식으로)
      const shareUrl = `/story/${userId}/${storyNumber}`;
      
      // 스토리 문서 업데이트
      batch.update(storyRef, { 
        userId,
        storyNumber,
        shareUrl,
        updatedAt: Date.now()
      });
      
      updatedStories.push({
        id: storyDoc.id,
        storyNumber
      });
      
      console.log(`Prepared update for story: ${storyDoc.id} (new number: ${storyNumber})`);
    });
    
    // 사용자 문서 업데이트
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      
      // 이미 있는 ID는 중복 추가하지 않음
      const existingIds = userData.stories || [];
      const newIds = storyIds.filter(id => !existingIds.includes(id));
      const updatedStories = [...existingIds, ...newIds];
      
      batch.update(userRef, {
        stories: updatedStories,
        storyCount: updatedStories.length
      });
      
      console.log(`Updating user document with ${newIds.length} new stories`);
    } else {
      // 사용자가 없는 경우 새로 생성
      batch.set(userRef, {
        id: userId,
        stories: storyIds,
        storyCount: storyIds.length,
        createdAt: Date.now()
      });
      
      console.log(`Creating new user document with ${storyIds.length} stories`);
    }
    
    // 배치 커밋
    await batch.commit();
    console.log(`Successfully linked ${storyIds.length} guest stories to user ${userId}`);
    
    return storyIds.length;
  } catch (error) {
    console.error('Error linking guest stories:', error);
    throw new Error('게스트 자서전 연결 중 오류가 발생했습니다.');
  }
};

// 모든 공개 스토리 가져오기
export const getPublicStories = async (limit = 20): Promise<Story[]> => {
  try {
    const storiesRef = collection(db, "stories");
    const q = query(
      storiesRef,
      where("isPublic", "==", true),
      orderBy("createdAt", "desc"),
      firestoreLimit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const stories: Story[] = [];
    
    querySnapshot.forEach((doc) => {
      stories.push({
        ...doc.data() as Story,
        id: doc.id,
      });
    });
    
    return stories;
  } catch (error) {
    console.error("Error getting public stories:", error);
    return [];
  }
};

// 태그로 스토리 필터링
export const getStoriesByTag = async (tag: string, limit = 20): Promise<Story[]> => {
  try {
    const storiesRef = collection(db, "stories");
    const q = query(
      storiesRef,
      where("tags", "array-contains", tag),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc"),
      firestoreLimit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const stories: Story[] = [];
    
    querySnapshot.forEach((doc) => {
      stories.push({
        ...doc.data() as Story,
        id: doc.id,
      });
    });
    
    return stories;
  } catch (error) {
    console.error("Error getting stories by tag:", error);
    return [];
  }
};

// 감정 타입으로 자서전 필터링
export const getStoriesByEmotion = async (emotion: string, limitCount: number = 20): Promise<Story[]> => {
  try {
    const q = query(
      collection(db, 'stories'),
      where('tone', '==', emotion),
      where('isPreview', '==', false),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const stories: Story[] = [];
    
    querySnapshot.forEach(doc => {
      stories.push({ 
        id: doc.id, 
        ...doc.data() 
      } as Story);
    });
    
    console.log(`감정 '${emotion}'으로 필터링된 자서전 ${stories.length}개 검색 완료`);
    return stories;
  } catch (error) {
    console.error('Error getting stories by emotion:', error);
    return [];
  }
};

// 랜덤 스토리 가져오기
export const getRandomStories = async (limit = 5): Promise<Story[]> => {
  try {
    const storiesRef = collection(db, "stories");
    const q = query(
      storiesRef,
      where("isPublic", "==", true),
      firestoreLimit(limit * 3) // 더 많은 항목을 가져와서 랜덤하게 선택
    );
    
    const querySnapshot = await getDocs(q);
    const allStories: Story[] = [];
    
    querySnapshot.forEach((doc) => {
      allStories.push({
        ...doc.data() as Story,
        id: doc.id,
      });
    });
    
    // 랜덤하게 섞기
    for (let i = allStories.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allStories[i], allStories[j]] = [allStories[j], allStories[i]];
    }
    
    return allStories.slice(0, limit);
  } catch (error) {
    console.error("Error getting random stories:", error);
    return [];
  }
};

// 사용자 스토리 북마크
export const bookmarkStory = async (userId: string, storyId: string, bookmark: boolean): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error("User not found");
      return false;
    }
    
    const userData = userDoc.data() as User;
    const bookmarks = userData.bookmarks || [];
    
    let updatedBookmarks;
    if (bookmark) {
      // 이미 북마크되어 있지 않은 경우에만 추가
      if (!bookmarks.includes(storyId)) {
        updatedBookmarks = [...bookmarks, storyId];
      } else {
        updatedBookmarks = bookmarks;
      }
    } else {
      // 북마크 제거
      updatedBookmarks = bookmarks.filter(id => id !== storyId);
    }
    
    await updateDoc(userRef, {
      bookmarks: updatedBookmarks
    });
    
    return true;
  } catch (error) {
    console.error("Error bookmarking story:", error);
    return false;
  }
};

// 사용자의 북마크 스토리 가져오기
export const getBookmarkedStories = async (userId: string): Promise<Story[]> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data() as User;
    const bookmarks = userData.bookmarks || [];
    
    if (bookmarks.length === 0) {
      return [];
    }
    
    const stories: Story[] = [];
    
    // 각 북마크된 스토리를 가져옴
    for (const storyId of bookmarks) {
      const storyRef = doc(db, "stories", storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (storyDoc.exists()) {
        stories.push({
          ...storyDoc.data() as Story,
          id: storyDoc.id
        });
      }
    }
    
    return stories;
  } catch (error) {
    console.error("Error getting bookmarked stories:", error);
    return [];
  }
};

// 자서전에 대한 감상/반응 저장
export const addReaction = async (userId: string, storyId: string, reaction: string): Promise<void> => {
  try {
    // 리액션 저장을 위한 하위 컬렉션 사용 (stories/[storyId]/reactions)
    await addDoc(collection(db, `stories/${storyId}/reactions`), {
      userId,
      storyId,
      reaction,
      createdAt: Date.now()
    });
    
    // 스토리 문서의 reactionCount 필드 업데이트
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (storyDoc.exists()) {
      const storyData = storyDoc.data() as Story;
      await updateDoc(storyRef, {
        reactionCount: (storyData.reactionCount || 0) + 1
      });
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw new Error('감상 저장 중 오류가 발생했습니다.');
  }
};

// 자서전의 감상/반응 가져오기
export const getReactions = async (storyId: string, limitCount: number = 10): Promise<Reaction[]> => {
  try {
    const q = query(
      collection(db, `stories/${storyId}/reactions`),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    const reactions: Reaction[] = [];
    querySnapshot.forEach((doc) => {
      const reactionData = doc.data();
      reactions.push({
        id: doc.id,
        userId: reactionData.userId,
        storyId: reactionData.storyId,
        reaction: reactionData.reaction,
        createdAt: reactionData.createdAt
      } as Reaction);
    });
    
    return reactions;
  } catch (error) {
    console.error('Error getting reactions:', error);
    return [];
  }
};

// 여러 태그, 감정, 카테고리로 자서전 필터링
export const getStoriesByTags = async (
  options: {
    tags?: string[], 
    emotion?: string,
    category?: string,
    limit?: number
  }
): Promise<Story[]> => {
  try {
    console.log('필터링 요청:', options);
    
    // 기본 쿼리 조건
    let constraints: QueryConstraint[] = [
      where('isPreview', '==', false),
      orderBy('createdAt', 'desc'),
      firestoreLimit(options.limit || 20)
    ];
    
    // 태그 필터 적용 (AND 조건)
    if (options.tags && options.tags.length > 0) {
      // Firestore는 array-contains를 여러 번 사용할 수 없으므로
      // 첫 번째 태그만 쿼리에 사용하고 나머지는 메모리에서 필터링
      constraints.push(where('tags', 'array-contains', options.tags[0]));
    }
    
    // 감정 필터 적용
    if (options.emotion) {
      constraints.push(where('tone', '==', options.emotion));
    }
    
    // 카테고리 필터 적용
    if (options.category) {
      constraints.push(where('category', '==', options.category));
    }
    
    // 쿼리 실행
    const q = query(collection(db, 'stories'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    // 결과 처리
    let stories: Story[] = [];
    querySnapshot.forEach(doc => {
      stories.push({ 
        id: doc.id, 
        ...doc.data() 
      } as Story);
    });
    
    // 여러 태그에 대한 추가 필터링 (메모리 내에서)
    if (options.tags && options.tags.length > 1) {
      stories = stories.filter(story => {
        if (!story.tags) return false;
        
        // 모든 검색 태그가 포함되어 있는지 확인 (AND 조건)
        return options.tags!.every(tag => story.tags!.includes(tag));
      });
    }
    
    console.log(`필터링된 자서전 ${stories.length}개 검색 완료`);
    return stories;
  } catch (error) {
    console.error('자서전 필터링 오류:', error);
    return [];
  }
};

/**
 * 임시(익명) 유저와 연결된 스토리를 실제 로그인된 유저로 연결
 * @param anonymousUserId 익명 유저 ID
 * @param actualUserId 실제 유저 ID
 */
export const linkAnonymousUser = async (anonymousUserId: string, actualUserId: string) => {
  try {
    console.log(`링크 시작: 익명 유저 ${anonymousUserId}를 실제 유저 ${actualUserId}로 연결 중`);
    
    // 익명 유저로 작성된 스토리 찾기
    const storiesQuery = query(
      collection(db, "stories"),
      where("userId", "==", anonymousUserId)
    );
    
    const storiesSnapshot = await getDocs(storiesQuery);
    const storiesCount = storiesSnapshot.docs.length;
    
    console.log(`연결할 스토리 ${storiesCount}개 발견`);
    
    if (storiesCount === 0) {
      console.log("연결할 스토리가 없습니다.");
      return 0;
    }
    
    // 실제 유저 문서 가져오기
    const userDocRef = doc(db, "users", actualUserId);
    const userDoc = await getDoc(userDocRef);
    
    // 유저 문서가 없으면 생성
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        id: actualUserId,
        createdAt: serverTimestamp(),
        stories: [],
        isTemporary: false
      });
      console.log(`새 유저 문서 생성: ${actualUserId}`);
    }
    
    // 유저의 현재 스토리 수 가져오기
    const userData = userDoc.exists() ? userDoc.data() : { stories: [] };
    const userStoriesCount = userData.stories?.length || 0;
    
    // 모든 스토리 업데이트
    const batch = writeBatch(db);
    let updatedCount = 0;
    
    for (let i = 0; i < storiesSnapshot.docs.length; i++) {
      const storyDoc = storiesSnapshot.docs[i];
      const storyId = storyDoc.id;
      
      // 새 스토리 번호 계산 (유저의 기존 스토리 수 + 현재 인덱스 + 1)
      const newStoryNumber = userStoriesCount + i + 1;
      
      // 공유 URL 업데이트
      const newShareUrl = `/story/${actualUserId}/${newStoryNumber}`;
      
      // 스토리 문서 업데이트
      batch.update(doc(db, "stories", storyId), {
        userId: actualUserId,
        shareUrl: newShareUrl
      });
      
      updatedCount++;
      console.log(`스토리 업데이트 중: ${storyId}, 새 URL: ${newShareUrl}`);
    }
    
    // 유저 문서 업데이트
    const userRef = doc(db, "users", actualUserId);
    
    // 유저의 stories 배열 업데이트
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentStories = userData.stories || [];
      
      // 새 스토리 ID 추가
      const newStoryIds = storiesSnapshot.docs.map(doc => doc.id);
      const updatedStories = [...currentStories, ...newStoryIds];
      
      // 유저 문서 업데이트
      batch.update(userRef, {
        stories: updatedStories
      });
    }
    
    // 일괄 업데이트 실행
    await batch.commit();
    
    console.log(`익명 유저 ${anonymousUserId}의 스토리 ${updatedCount}개가 유저 ${actualUserId}로 성공적으로 연결되었습니다.`);
    return updatedCount;
  } catch (error) {
    console.error("스토리 연결 중 오류 발생:", error);
    throw error;
  }
};

export async function getMyStories(userId: string): Promise<Story[]> {
  if (!userId) {
    console.error('사용자 ID가 제공되지 않았습니다.');
    return [];
  }

  try {
    // 사용자가 작성한 스토리 가져오기
    const storiesQuery = query(
      collection(db, 'stories'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const storiesSnapshot = await getDocs(storiesQuery);
    const stories: Story[] = [];

    storiesSnapshot.forEach((doc) => {
      const storyData = doc.data() as Story;
      stories.push({
        ...storyData,
        id: doc.id,
        createdAt: storyData.createdAt || new Date().toISOString(),
      });
    });

    return stories;
  } catch (error) {
    console.error('내 스토리 가져오기 오류:', error);
    return [];
  }
}

/**
 * 사용자의 프로모션 구독 상태 업데이트
 * @param userId 사용자 ID
 * @param subscribed 구독 여부 (true: 구독, false: 구독 취소)
 * @returns 성공 여부
 */
export const updatePromotionSubscription = async (userId: string, subscribed: boolean): Promise<boolean> => {
  try {
    if (!userId) {
      console.error('사용자 ID가 필요합니다');
      return false;
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('사용자를 찾을 수 없습니다:', userId);
      return false;
    }
    
    await updateDoc(userRef, {
      promotionSubscribed: subscribed,
      updatedAt: Date.now()
    });
    
    console.log(`프로모션 구독 상태 업데이트: ${userId}, 구독=${subscribed}`);
    return true;
  } catch (error) {
    console.error('프로모션 구독 상태 업데이트 중 오류:', error);
    return false;
  }
};

/**
 * 사용자의 프로모션 구독 상태 확인
 * @param userId 사용자 ID
 * @returns 구독 여부 (true: 구독 중, false: 구독 안 함 또는 사용자 없음)
 */
export const isPromotionSubscribed = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) {
      return false;
    }
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data() as User;
    return userData.promotionSubscribed === true;
  } catch (error) {
    console.error('프로모션 구독 상태 확인 중 오류:', error);
    return false;
  }
};

// 스토리 업데이트 함수
export const updateStory = async (storyId: string, updateData: Partial<Story>): Promise<boolean> => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      ...updateData,
      updatedAt: Date.now()
    });
    console.log(`스토리 업데이트 완료: ${storyId}`);
    return true;
  } catch (error) {
    console.error('스토리 업데이트 중 오류:', error);
    throw error;
  }
};

// === 포스트잇 댓글 관련 함수 ===

/**
 * 스토리에 댓글 추가
 * @param storyId 스토리 ID
 * @param comment 댓글 데이터
 * @returns 생성된 댓글 ID
 */
export const addComment = async (
  storyId: string, 
  comment: { 
    name: string; 
    message: string; 
    color: string;
    userId?: string;
  }
): Promise<string> => {
  try {
    // 댓글 저장 (stories/[storyId]/comments)
    const commentRef = await addDoc(collection(db, `stories/${storyId}/comments`), {
      ...comment,
      createdAt: Date.now(),
      isDeleted: false
    });
    
    // 스토리 문서의 commentCount 필드 업데이트
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (storyDoc.exists()) {
      const storyData = storyDoc.data() as Story;
      await updateDoc(storyRef, {
        commentCount: (storyData.commentCount || 0) + 1
      });
    }
    
    return commentRef.id;
  } catch (error) {
    console.error('댓글 추가 중 오류:', error);
    throw new Error('댓글 저장 중 오류가 발생했습니다.');
  }
};

/**
 * 스토리의 댓글 목록 가져오기
 * @param storyId 스토리 ID
 * @returns 댓글 목록
 */
export const getComments = async (storyId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, `stories/${storyId}/comments`),
      where('isDeleted', '==', false),  // 삭제되지 않은 댓글만
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const comments: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const commentData = doc.data();
      comments.push({
        id: doc.id,
        name: commentData.name,
        message: commentData.message,
        color: commentData.color,
        userId: commentData.userId || null,
        createdAt: commentData.createdAt
      });
    });
    
    return comments;
  } catch (error) {
    console.error('댓글 가져오기 오류:', error);
    return [];
  }
};

/**
 * 댓글 삭제
 * @param storyId 스토리 ID
 * @param commentId 댓글 ID
 * @param userId 사용자 ID (소유자만 삭제 가능)
 * @returns 성공 여부
 */
export const deleteComment = async (
  storyId: string, 
  commentId: string, 
  userId?: string
): Promise<boolean> => {
  try {
    const commentRef = doc(db, `stories/${storyId}/comments`, commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (!commentDoc.exists()) {
      return false;
    }
    
    const commentData = commentDoc.data();
    
    // 권한 확인 (관리자나 댓글 작성자만 삭제 가능)
    if (userId && commentData.userId && commentData.userId !== userId) {
      // 작성자가 아닌 경우 삭제 불가
      return false;
    }
    
    // 실제로 삭제하지 않고 isDeleted 플래그 설정
    await updateDoc(commentRef, {
      isDeleted: true,
      deletedAt: Date.now()
    });
    
    // 스토리의 댓글 수 감소
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (storyDoc.exists()) {
      const storyData = storyDoc.data() as Story;
      const currentCount = storyData.commentCount || 0;
      
      if (currentCount > 0) {
        await updateDoc(storyRef, {
          commentCount: currentCount - 1
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    return false;
  }
};

/**
 * 댓글 수정
 * @param storyId 스토리 ID
 * @param commentId 댓글 ID
 * @param updates 업데이트할 데이터
 * @param userId 사용자 ID (소유자만 수정 가능)
 * @returns 성공 여부
 */
export const updateComment = async (
  storyId: string,
  commentId: string,
  updates: { message?: string, color?: string },
  userId?: string
): Promise<boolean> => {
  try {
    const commentRef = doc(db, `stories/${storyId}/comments`, commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (!commentDoc.exists()) {
      return false;
    }
    
    const commentData = commentDoc.data();
    
    // 권한 확인 (관리자나 댓글 작성자만 수정 가능)
    if (userId && commentData.userId && commentData.userId !== userId) {
      // 작성자가 아닌 경우 수정 불가
      return false;
    }
    
    await updateDoc(commentRef, {
      ...updates,
      updatedAt: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('댓글 수정 오류:', error);
    return false;
  }
};

// 좋아요(리액션) 토글 함수
export const toggleReaction = async (userId: string, storyId: string, reaction: string): Promise<{ liked: boolean; count: number }> => {
  try {
    const reactionsRef = collection(db, `stories/${storyId}/reactions`);
    const q = query(reactionsRef, where('userId', '==', userId), where('reaction', '==', reaction));
    const snapshot = await getDocs(q);
    const storyRef = doc(db, 'stories', storyId);
    let liked = false;
    let count = 0;

    if (!snapshot.empty) {
      // 이미 좋아요를 눌렀으면 삭제
      await Promise.all(snapshot.docs.map(docSnap => deleteDoc(docSnap.ref)));
      liked = false;
    } else {
      // 없으면 추가
      await addDoc(reactionsRef, {
        userId,
        storyId,
        reaction,
        createdAt: Date.now()
      });
      liked = true;
    }

    // 최신 카운트 반영
    const allReactions = await getDocs(query(reactionsRef, where('reaction', '==', reaction)));
    count = allReactions.size;
    await updateDoc(storyRef, { reactionCount: count });
    return { liked, count };
  } catch (error) {
    console.error('toggleReaction 오류:', error);
    throw error;
  }
}; 
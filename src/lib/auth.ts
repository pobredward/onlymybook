import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  UserCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, FieldValue } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, AuthProvider } from '@/types';
import { linkGuestStories } from './db'; // 게스트 자서전 연결 함수 임포트
import { setCookie, getCookie } from 'cookies-next';

// 사용자 상태를 로컬 스토리지에 저장
export const saveUserToLocalStorage = (user: FirebaseUser) => {
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
  localStorage.setItem('auth_user_data', JSON.stringify(userData));
};

// 게스트 ID 가져오기 (로컬 스토리지에서)
export const getGuestId = (): string | null => {
  const id = getCookie('guest_id');
  return id ? String(id) : null;
};

// 게스트 ID 저장하기 (로컬 스토리지에)
export function saveGuestId(id: string): void {
  setCookie('guest_id', id, { 
    maxAge: 60 * 60 * 24 * 30, // 30일 유효기간
    path: '/'
  });
}

// 게스트 ID 삭제하기
export const clearGuestId = () => {
  try {
    localStorage.removeItem('guestId');
  } catch (error) {
    console.error('게스트 ID 삭제 오류:', error);
  }
};

// Google 로그인
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    
    // Firestore에 사용자 정보 저장/업데이트
    await handleSocialLoginSuccess(result, AuthProvider.GOOGLE);
    
    // 게스트 자서전 연결 처리
    await handleGuestStoryConnection(result.user.uid);
    
    return result;
  } catch (error) {
    console.error('구글 로그인 오류:', error);
    throw error;
  }
};

// 이메일/비밀번호로 로그인
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 로그인 타임스탬프 업데이트
    await updateUserDocument(user.uid, {
      lastLogin: serverTimestamp()
    });
    
    saveUserToLocalStorage(user);
    
    // 게스트 자서전 연결 처리
    await handleGuestStoryConnection(user.uid);
    
    return userCredential;
  } catch (error) {
    console.error('이메일 로그인 오류:', error);
    throw error;
  }
};

// 페이스북 로그인
export const signInWithFacebook = async (): Promise<UserCredential> => {
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Firestore에 사용자 정보 저장/업데이트
    await handleSocialLoginSuccess(result, AuthProvider.FACEBOOK);
    
    // 게스트 자서전 연결 처리
    await handleGuestStoryConnection(result.user.uid);
    
    return result;
  } catch (error) {
    console.error('페이스북 로그인 오류:', error);
    throw error;
  }
};

// 애플 로그인
export const signInWithApple = async (): Promise<UserCredential> => {
  try {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const result = await signInWithPopup(auth, provider);
    
    // Firestore에 사용자 정보 저장/업데이트
    await handleSocialLoginSuccess(result, AuthProvider.APPLE);
    
    // 게스트 자서전 연결 처리
    await handleGuestStoryConnection(result.user.uid);
    
    return result;
  } catch (error) {
    console.error('애플 로그인 오류:', error);
    throw error;
  }
};

// 이메일/비밀번호로 회원가입
export const registerWithEmail = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 사용자 프로필 업데이트
    await updateProfile(user, { displayName });
    
    // 이메일 인증 메일 발송
    await sendEmailVerification(user);
    
    // Firestore에 사용자 정보 저장
    await createUserDocument(user.uid, {
      email: user.email,
      displayName,
      provider: AuthProvider.EMAIL,
      lastLogin: serverTimestamp(),
      emailVerified: user.emailVerified,
      photoURL: user.photoURL,
      createdAt: serverTimestamp()
    });
    
    saveUserToLocalStorage(user);
    
    // 게스트 자서전 연결 처리
    await handleGuestStoryConnection(user.uid);
    
    return userCredential;
  } catch (error) {
    console.error('이메일 회원가입 오류:', error);
    throw error;
  }
};

// 로그아웃
export const logout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem('auth_user_data');
    // 게스트 ID는 남겨두어 다음 로그인 시 연결할 수 있도록 함
  } catch (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
};

// 게스트 자서전 연결 처리 함수
async function handleGuestStoryConnection(userId: string): Promise<void> {
  try {
    const guestId = getGuestId();
    
    if (guestId && guestId.startsWith('guest_')) {
      console.log(`게스트 자서전 연결 시도: ${guestId} -> ${userId}`);
      
      // 게스트 자서전 연결 함수 호출
      const linkedCount = await linkGuestStories(guestId, userId);
      
      if (linkedCount > 0) {
        console.log(`${linkedCount}개의 게스트 자서전을 연결했습니다.`);
        // 연결 후에는 게스트 ID 삭제
        clearGuestId();
      }
    }
  } catch (error) {
    console.error('게스트 자서전 연결 오류:', error);
    // 오류 발생해도 로그인 과정은 계속 진행
  }
}

// 비밀번호 재설정 이메일 보내기
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('비밀번호 재설정 이메일 발송 오류:', error);
    throw error;
  }
};

// 사용자 정보 업데이트 또는 생성
export const createOrUpdateUser = async (user: FirebaseUser): Promise<User> => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  // Firestore 타임스탬프를 User 타입에 맞게 변환
  const convertTimestamp = () => {
    return {
      seconds: 0,
      nanoseconds: 0
    };
  };
  
  // 사용자 기본 정보
  const userData = {
    id: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    lastLogin: convertTimestamp(),
  };
  
  if (!userDoc.exists()) {
    // 새 사용자 생성
    const newUser: User = {
      ...userData,
      stories: [],
      createdAt: Date.now()
    };
    
    // Firebase lastLogin은 저장용으로만 사용
    await setDoc(userRef, {
      ...userData,
      lastLogin: serverTimestamp(), // Firestore에는 실제 타임스탬프로 저장
      stories: [],
      createdAt: Date.now()
    });
    
    return newUser;
  } else {
    // 기존 사용자 업데이트
    const existingUser = userDoc.data() as unknown as User;
    const updatedUser: User = {
      ...existingUser,
      ...userData
    };
    
    // Firebase lastLogin은 저장용으로만 사용
    await updateDoc(userRef, {
      ...userData,
      lastLogin: serverTimestamp() // Firestore에는 실제 타임스탬프로 저장
    });
    
    return updatedUser;
  }
};

// 현재 로그인된 사용자 가져오기
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// 소셜 로그인 성공 시 사용자 정보 처리
const handleSocialLoginSuccess = async (result: UserCredential, provider: AuthProvider) => {
  const { user } = result;
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    // 기존 사용자 정보 업데이트
    await updateDoc(userDocRef, {
      lastLogin: serverTimestamp(),
      emailVerified: user.emailVerified,
      photoURL: user.photoURL || null
    });
  } else {
    // 새 사용자 정보 생성
    await createUserDocument(user.uid, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      provider,
      lastLogin: serverTimestamp(),
      emailVerified: user.emailVerified,
      createdAt: serverTimestamp()
    });
  }
  
  saveUserToLocalStorage(user);
};

// Firestore에 사용자 문서 생성
interface UserData {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: AuthProvider;
  lastLogin: FieldValue;
  emailVerified: boolean;
  createdAt: FieldValue;
  [key: string]: unknown;
}

const createUserDocument = async (uid: string, data: UserData) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...data,
      uid,
      stories: [] // 초기 스토리 배열은 빈 배열로 설정
    });
  } catch (error) {
    console.error('사용자 문서 생성 오류:', error);
    throw error;
  }
};

// Firestore 사용자 문서 업데이트
interface UpdateData {
  lastLogin?: FieldValue;
  emailVerified?: boolean;
  photoURL?: string | null;
  [key: string]: unknown;
}

const updateUserDocument = async (uid: string, data: UpdateData) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, data);
  } catch (error) {
    console.error('사용자 문서 업데이트 오류:', error);
    throw error;
  }
};

// 인증 상태 변경 리스너 설정
export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

export { auth }; 
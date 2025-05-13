import { NextResponse } from 'next/server';
import { savePreviewStoryWithoutLogin, savePreviewStory, getUserData, getStory } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { content, authInfo } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '유효한 자서전 내용이 필요합니다' },
        { status: 400 }
      );
    }
    
    // 인증 정보 확인 및 로깅
    console.log('자서전 저장 API - 인증 정보:', authInfo);
    
    let storyId = '';
    
    // 인증된 사용자인 경우 savePreviewStory 함수 사용
    if (authInfo && authInfo.uid && !authInfo.isAnonymous) {
      console.log(`인증된 사용자(${authInfo.uid})로 자서전 저장 시작`);
      
      try {
        // 인증된 사용자의 데이터 확인 (customId 확인용)
        const userData = await getUserData(authInfo.uid);
        console.log('사용자 데이터:', userData);
        
        // 인증된 사용자의 ID로 저장
        storyId = await savePreviewStory(authInfo.uid, content);
        console.log(`인증된 사용자(${authInfo.uid})로 자서전 저장 완료, ID: ${storyId}`);
      } catch (error) {
        // 오류를 기록하고 상위로 전달
        console.error('인증된 사용자 저장 실패:', error);
        throw error; // 오류를 던져서 상위 catch 블록에서 처리
      }
    } else {
      // 인증되지 않은 사용자는 기존 함수 사용
      console.log('비인증 사용자로 자서전 저장 시작');
      storyId = await savePreviewStoryWithoutLogin(content);
      console.log('비인증 사용자로 자서전 저장 완료, ID:', storyId);
    }
    
    if (!storyId) {
      return NextResponse.json(
        { error: '자서전 저장에 실패했습니다' },
        { status: 500 }
      );
    }
    
    // 생성된 스토리 정보 가져오기
    const story = await getStory(storyId);
    
    return NextResponse.json({ 
      storyId,
      shareUrl: story?.shareUrl || null,
      success: true 
    });
  } catch (error) {
    console.error('자서전 저장 중 오류 발생:', error);
    return NextResponse.json(
      { error: '자서전 저장 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 
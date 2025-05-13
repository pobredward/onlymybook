import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 요청 데이터 로깅 추가
    console.log('generate-preview API 호출됨');
    
    const requestData = await request.json();
    console.log('요청 데이터:', JSON.stringify(requestData));
    
    const { answers } = requestData;
    
    if (!answers || typeof answers !== 'object') {
      console.log('유효하지 않은 요청 데이터:', requestData);
      return NextResponse.json(
        { error: '유효한 답변이 필요합니다' },
        { status: 400 }
      );
    }
    
    // /api/generate API로 리다이렉션 (직접 generatePreview 함수 사용 대신)
    console.log('generate API로 요청 전달');
    
    const generateResponse = await fetch(new URL('/api/generate', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'preview',
        answers
      }),
    });
    
    console.log('generate API 응답 상태:', generateResponse.status);
    
    if (!generateResponse.ok) {
      const errorData = await generateResponse.json();
      console.error('generate API 오류:', errorData);
      return NextResponse.json(
        { error: errorData.error || '자서전 생성 중 오류가 발생했습니다' },
        { status: generateResponse.status }
      );
    }
    
    const data = await generateResponse.json();
    console.log('콘텐츠 생성 성공, 길이:', data.content?.length || 0);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('자서전 생성 중 상세 오류 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '자서전 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';

// 이 함수는 모든 라우트에서 실행됩니다.
// 반환값: NextResponse 또는 undefined
export function middleware() {
  // 리다이렉트 메커니즘 제거
  return NextResponse.next();
}

// 미들웨어가 실행될 경로들을 매칭하는 설정
export const config = {
  matcher: [
    // 필요한 경로만 추가 (현재는 리다이렉트 로직이 없으므로 빈 배열도 가능)
    '/story/:path*',
  ],
}; 
# 디지털 자서전 (Digital Memoir)

[onlymybook.com](http://onlymybook.com)에서 서비스 예정인 디지털 자서전 웹 애플리케이션입니다.

## 프로젝트 소개

디지털 자서전은 누구나 몇 분 안에 자신의 인생 이야기를 책으로 만들 수 있는 서비스입니다.

**"누구나, 몇 분 안에, 인생을 책으로."**

AI 기술을 활용하여 간단한 질문에 대한 답변만으로 아름다운 자서전을 생성합니다.

## 주요 기능

- 간단한 2개 질문으로 자서전 미리보기 생성
- 추가 8개 질문으로 완전한 자서전 작성
- 자서전 저장 및 공유 기능
- 모바일 친화적인 반응형 디자인

## 기술 스택

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Firestore + Auth)
- OpenAI API (GPT-4)

## 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/username/onlymybook.git
cd onlymybook
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
OPENAI_API_KEY=
```

4. 개발 서버 시작
```bash
npm run dev
```

5. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 라이선스

MIT

## 운영 및 SEO 가이드

### 1. robots.txt
- 모든 검색엔진 크롤러 허용
- 사이트맵 경로 명시
- `public/robots.txt`에서 관리

### 2. 사이트맵
- `next-sitemap`으로 자동 생성
- `npm run postbuild` 또는 배포 시 자동 생성
- `public/sitemap.xml` 및 세부 사이트맵 파일 확인

### 3. 구글/네이버 웹마스터 도구 등록
- https://search.google.com/search-console/about
- https://searchadvisor.naver.com/robot/registration
- 사이트맵 제출: `https://onlymybook.com/sitemap.xml`
- 소유확인 메타태그는 `src/app/layout.tsx`에 삽입

### 4. SEO 메타데이터
- 핵심/연관 키워드 기반 메타데이터 적용
- `src/app/layout.tsx`, `src/app/page.tsx` 참고

### 5. 기타
- 배포 후 robots.txt, sitemap.xml 정상 노출 확인
- 추가 SEO 자동화, 블로그/콘텐츠 자동화 등은 별도 요청

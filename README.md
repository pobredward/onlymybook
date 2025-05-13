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

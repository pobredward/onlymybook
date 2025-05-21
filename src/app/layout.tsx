import './globals.css';
import type { Metadata } from 'next';
import { Inter, Noto_Serif_KR } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '디지털 자서전 작성법 | 자기소개서와 인생 기록 팁',
  description: '디지털 자서전, 자기소개서 작성법, 인생 기록 방법, 자기계발 스토리, 온라인 자서전 만들기 등 최신 트렌드 기반의 자기표현과 기록 노하우를 제공합니다.',
  keywords: '디지털 자서전, 자기소개서 작성법, 인생 기록 방법, 자기계발 스토리, 온라인 자서전 만들기, 에세이 작성 팁, 자기표현 방법, 디지털 기록 도구, 자기개발 콘텐츠, 개인 브랜딩 전략',
  openGraph: {
    title: '디지털 자서전 작성법 | 자기소개서와 인생 기록 팁',
    description: '디지털 자서전, 자기소개서 작성법, 인생 기록 방법, 자기계발 스토리, 온라인 자서전 만들기 등 최신 트렌드 기반의 자기표현과 기록 노하우를 제공합니다.',
    url: 'https://onlymybook.com',
    siteName: '디지털 자서전',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '디지털 자서전 OG 이미지',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '디지털 자서전 작성법 | 자기소개서와 인생 기록 팁',
    description: '디지털 자서전, 자기소개서 작성법, 인생 기록 방법, 자기계발 스토리, 온라인 자서전 만들기 등 최신 트렌드 기반의 자기표현과 기록 노하우를 제공합니다.',
    images: ['/og-image.png'],
    site: '@onlymybook',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSerifKr.variable}`}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5100840159526765" />
        <meta name="naver-site-verification" content="여기에_네이버_소유확인_코드" />
        <meta name="google-site-verification" content="여기에_구글_소유확인_코드" />
        <meta name="keywords" content="디지털 자서전, 자기소개서 작성법, 인생 기록 방법, 자기계발 스토리, 온라인 자서전 만들기, 에세이 작성 팁, 자기표현 방법, 디지털 기록 도구, 자기개발 콘텐츠, 개인 브랜딩 전략" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="디지털 자서전 작성법 | 자기소개서와 인생 기록 팁" />
        <meta property="og:description" content="디지털 자서전, 자기소개서 작성법, 인생 기록 방법, 자기계발 스토리, 온라인 자서전 만들기 등 최신 트렌드 기반의 자기표현과 기록 노하우를 제공합니다." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://onlymybook.com" />
        <meta property="og:site_name" content="디지털 자서전" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="디지털 자서전 작성법 | 자기소개서와 인생 기록 팁" />
        <meta name="twitter:description" content="디지털 자서전, 자기소개서 작성법, 인생 기록 방법, 자기계발 스토리, 온라인 자서전 만들기 등 최신 트렌드 기반의 자기표현과 기록 노하우를 제공합니다." />
        <meta name="twitter:image" content="/og-image.png" />
        <meta name="twitter:site" content="@onlymybook" />
        <link rel="canonical" href="https://onlymybook.com" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "디지털 자서전",
            "url": "https://onlymybook.com",
            "description": "디지털 자서전, 자기소개서 작성법, 인생 기록 방법, 자기계발 스토리, 온라인 자서전 만들기 등 최신 트렌드 기반의 자기표현과 기록 노하우를 제공합니다."
          }
        `}</script>
      </head>
      <body className="min-h-screen bg-white font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

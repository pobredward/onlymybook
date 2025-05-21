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
  title: '디지털 자서전 - 누구나, 몇 분 안에, 인생을 책으로',
  description: '디지털 자서전으로 여러분의 소중한 인생 이야기를 아름답게 기록하세요. 몇 분 안에 완성되는 당신만의 자서전.',
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

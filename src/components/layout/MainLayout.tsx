import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import Head from 'next/head';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = '디지털 자서전 - 누구나, 몇 분 안에, 인생을 책으로',
  description = '디지털 자서전으로 여러분의 소중한 인생 이야기를 아름답게 기록하세요. 몇 분 안에 완성되는 당신만의 자서전.'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="디지털 자서전" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}; 
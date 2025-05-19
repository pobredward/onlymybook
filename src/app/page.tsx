'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { currentUser, loading } = useAuth();
  const isLoggedIn = !loading && currentUser !== null;
  
  const getStartLink = isLoggedIn ? '/write' : '/auth/login';
  
  return (
    <MainLayout>
      <div className="bg-white">
        {/* 히어로 섹션 */}
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white min-h-[70vh] flex items-center">
          <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between px-4 sm:px-8 py-16 lg:py-32">
            {/* 왼쪽: 텍스트 */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
                <span className="block">나만의 인생,</span>
                <span className="block text-blue-600 drop-shadow-md">디지털 책으로</span>
              </h1>
              <p className="mt-2 text-lg sm:text-xl md:text-2xl text-gray-600 max-w-xl mb-8 animate-fade-in" style={{animationDelay:'0.2s'}}>
                당신의 소중한 이야기를 지금 바로 기록해보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in" style={{animationDelay:'0.4s'}}>
                <Link href={getStartLink}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-10 py-4 text-xl font-bold rounded-full shadow-lg transition-transform hover:scale-105 animate-pulse-subtle bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                  >
                    {isLoggedIn ? '자서전 작성하기' : '로그인 후 시작하기'}
                  </Button>
                </Link>
                {!isLoggedIn && (
                  <Link href="/auth/register">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="px-10 py-4 text-xl font-bold rounded-full border-blue-200 text-blue-700 bg-white hover:bg-blue-50 focus:ring-blue-500"
                    >
                      회원가입하기
                    </Button>
                  </Link>
                )}
              </div>
              
            </div>
            {/* 오른쪽: 이미지/일러스트 */}
            <div className="flex-1 flex justify-center items-center mt-12 lg:mt-0 animate-fade-in" style={{animationDelay:'0.6s'}}>
              <div className="bg-blue-50 rounded-3xl shadow-xl p-8 flex flex-col items-center">
                <span className="block text-4xl font-serif italic text-blue-700 mb-2">말보다 진한 기억들</span>
                <span className="block text-base text-blue-500">당신의 이야기가 여기에 담깁니다</span>
                {/* 향후: 프로필/책 일러스트 등 추가 가능 */}
              </div>
            </div>
          </div>
        </section>


        {/* 스크롤 유도 */}
        <div className="w-full flex justify-center items-center py-8">
                <a href="#how-it-works" className="block">
                  <span className="inline-block text-blue-400 animate-bounce">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </a>
              </div>

        {/* 작동 방식 섹션 */}
        <section id="how-it-works" className="py-20 bg-white overflow-hidden lg:py-32">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            {/* <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">어떻게 작성하나요?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                누구나 쉽고 빠르게, 원하는 방식으로 자서전을 완성할 수 있습니다.<br />
                <span className="text-blue-600 font-semibold">AI 자동 생성</span> 또는 <span className="text-blue-600 font-semibold">직접 작성</span> 중 원하는 방법을 선택하세요.
              </p>
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* GPT로 작성 카드 */}
              <div className="bg-blue-50 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow animate-fade-in">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a5.5 5.5 0 01.5 7.5l-5 5a2 2 0 01-2.8 0l-2-2a2 2 0 010-2.8l5-5a5.5 5.5 0 017.5.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-blue-700 mb-2">AI가 대신 써줘요</h3>
                <span className="inline-block bg-blue-600 text-white text-xs font-semibold rounded-full px-3 py-1 mb-3">추천</span>
                <p className="text-gray-700 mb-4">
                  간단한 질문에 답하면, GPT가 당신만의 자서전을 자동으로 완성해줍니다.<br />
                  <span className="text-blue-600 font-semibold">빠르고, 감성적이며, 누구나 쉽게</span> 멋진 결과물을 얻을 수 있어요.
                </p>
                <ul className="text-left text-sm text-gray-600 space-y-1 mb-6">
                  <li>✔️ 10분 이내 완성</li>
                  <li>✔️ 글쓰기 부담 없이 시작</li>
                  <li>✔️ AI가 문학적으로 다듬어줌</li>
                </ul>
                <Link href={isLoggedIn ? '/write' : '/auth/login'}>
                  <Button variant="primary" size="md" className="w-full font-bold rounded-full mt-2">AI로 자서전 시작하기</Button>
                </Link>
              </div>
              {/* 직접 작성 카드 */}
              <div className="bg-white border border-blue-100 rounded-2xl shadow p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow animate-fade-in" style={{animationDelay:'0.1s'}}>
                <div className="bg-blue-50 rounded-full p-4 mb-4">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8v4H8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-blue-700 mb-2">내 손으로 직접 쓰기</h3>
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold rounded-full px-3 py-1 mb-3">자유도 높음</span>
                <p className="text-gray-700 mb-4">
                  원하는 챕터, 문장, 스타일로 <span className="text-blue-600 font-semibold">자유롭게</span> 직접 작성할 수 있습니다.<br />
                  나만의 개성과 감정을 더해 특별한 자서전을 만들 수 있어요.
                </p>
                <ul className="text-left text-sm text-gray-600 space-y-1 mb-6">
                  <li>✔️ 원하는 만큼 수정/추가</li>
                  <li>✔️ 내 언어, 내 감정 그대로</li>
                  <li>✔️ 챕터별로 자유롭게 관리</li>
                </ul>
                <Link href={isLoggedIn ? '/write?mode=manual' : '/auth/login'}>
                  <Button variant="secondary" size="md" className="w-full font-bold rounded-full mt-2 border-blue-200 text-blue-700 bg-white hover:bg-blue-50 focus:ring-blue-500">직접 작성하러 가기</Button>
                </Link>
              </div>
            </div>
            {/* <div className="text-center mt-14 animate-fade-in" style={{animationDelay:'0.2s'}}>
              <span className="inline-block bg-blue-600 text-white text-sm font-semibold rounded-full px-5 py-2 shadow animate-pulse-subtle">쉽고, 빠르고, 감동적으로. 당신의 이야기를 시작해보세요!</span>
            </div> */}
          </div>
        </section>

        {/* 특징 섹션 삭제, 대신 '왜 자서전을 남겨야 할까요?' 섹션 추가 */}
        <section className="bg-gradient-to-b from-white to-blue-50 py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">왜 자서전을 남겨야 할까요?</h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                인생은 한 번뿐이지만, 기록은 영원합니다.<br />
                당신의 이야기는 누군가에게 큰 힘과 영감이 될 수 있습니다.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 이유 카드 1 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow animate-fade-in">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">인생은 한 번, 기록은 영원히</h3>
                <p className="text-gray-700">지금 남기는 이야기가 미래의 나와 가족, 그리고 세상에 오래도록 남습니다.</p>
              </div>
              {/* 이유 카드 2 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow animate-fade-in" style={{animationDelay:'0.1s'}}>
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">나의 지혜와 경험을 다음 세대에</h3>
                <p className="text-gray-700">내가 살아온 길, 배운 것, 느낀 것들을 자녀와 후손, 그리고 세상에 전할 수 있습니다.</p>
              </div>
              {/* 이유 카드 3 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow animate-fade-in" style={{animationDelay:'0.2s'}}>
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5zm0-10V4m0 6v10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">누군가에게 위로와 영감이 되는 이야기</h3>
                <p className="text-gray-700">내 경험과 스토리가 누군가에게 큰 힘이 되고, 세상을 더 따뜻하게 만들 수 있습니다.</p>
              </div>
            </div>
            <div className="text-center mt-14 animate-fade-in" style={{animationDelay:'0.3s'}}>
              <span className="inline-block bg-blue-600 text-white text-lg font-semibold rounded-full px-8 py-4 shadow animate-pulse-subtle">지금, 당신의 이야기를 세상에 남겨보세요!</span>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              <span className="block">시작할 준비가 되셨나요?</span>
              <span className="block text-indigo-600">지금 바로 자서전을 작성해보세요.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link href={getStartLink}>
                  <Button variant="primary" size="lg">
                    {isLoggedIn ? '자서전 시작하기' : '로그인 후 시작하기'}
                  </Button>
                </Link>
              </div>
              {!isLoggedIn && (
                <div className="ml-3 inline-flex rounded-md shadow">
                  <Link href="/auth/register">
                    <Button variant="secondary" size="lg">
                      회원가입하기
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
    </MainLayout>
  );
}

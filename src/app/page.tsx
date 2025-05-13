'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="bg-white">
      {/* 히어로 섹션 */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">누구나, 몇 분 안에,</span>{' '}
                  <span className="block text-indigo-600 xl:inline">인생을 책으로.</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  디지털 자서전으로 여러분의 소중한 인생 이야기를 아름답게 기록하세요. 
                  단 몇 가지 질문에 답하는 것만으로, AI가 당신만의 특별한 자서전을 만들어 드립니다.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/write" passHref legacyBehavior>
                      <a>
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full flex items-center justify-center"
                        >
                          지금 시작하기
                        </Button>
                      </a>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="#how-it-works" passHref legacyBehavior>
                      <a>
                        <Button
                          variant="secondary"
                          size="lg"
                          className="w-full flex items-center justify-center"
                        >
                          어떻게 작동하나요?
                        </Button>
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full bg-indigo-100 flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <span className="block text-4xl font-serif italic text-indigo-700">말보다 진한 기억들</span>
              <span className="mt-2 block text-sm text-indigo-600">당신의 이야기가 여기에 담깁니다</span>
            </div>
          </div>
        </div>
      </div>

      {/* 작동 방식 섹션 */}
      <div id="how-it-works" className="py-16 bg-white overflow-hidden lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              어떻게 작동하나요?
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
              단 몇 분 만에 당신의 인생이 한 권의 책이 됩니다.
            </p>
          </div>

          <div className="relative mt-12 lg:mt-20 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="mt-10 -mx-4 relative lg:mt-0" aria-hidden="true">
              <div className="relative mx-auto rounded-lg shadow-lg overflow-hidden">
                <div className="relative p-8 bg-indigo-50 h-72 flex items-center justify-center text-center">
                  <div>
                    <p className="text-xl font-medium text-indigo-600 mb-3">미리보기</p>
                    <p className="text-gray-600">간단한 두 가지 질문으로 자서전의 일부를 미리 만나볼 수 있어요.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                2개의 간단한 질문에 답하세요
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                어린 시절의 추억이나 감사한 사람에 대한 간단한 질문에 답하면, 
                AI가 당신의 이야기를 바탕으로 자서전의 미리보기를 생성합니다.
              </p>
            </div>
          </div>

          <div className="relative mt-12 sm:mt-16 lg:mt-24">
            <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="lg:col-start-2">
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                  미리보기 후 전체 자서전으로
                </h3>
                <p className="mt-3 text-lg text-gray-500">
                  마음에 드시면, 추가 질문에 답하고 전체 자서전을 완성하세요.
                  당신만의 디지털 자서전이 완성됩니다.
                </p>
                <div className="mt-10">
                  <Link href="/write" passHref legacyBehavior>
                    <a>
                      <Button variant="primary" size="lg">
                        내 자서전 시작하기
                      </Button>
                    </a>
                  </Link>
                </div>
              </div>

              <div className="mt-10 -mx-4 relative lg:mt-0 lg:col-start-1">
                <div className="relative mx-auto rounded-lg shadow-lg overflow-hidden">
                  <div className="relative p-8 bg-indigo-50 h-72 flex items-center justify-center text-center">
                    <div>
                      <p className="text-xl font-medium text-indigo-600 mb-3">완성된 자서전</p>
                      <p className="text-gray-600">10개의 챕터로 구성된 완전한 자서전을 만나보세요.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 특징 섹션 */}
      <div className="bg-indigo-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">특징</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              당신만의 이야기, 쉽게 기록하세요
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              디지털 자서전은 누구나 쉽게 자신의 이야기를 남길 수 있도록 도와드립니다.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">빠르고 간편합니다</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  복잡한 글쓰기 과정 없이, 몇 가지 질문에 답하는 것만으로 자서전을 완성합니다.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">아름다운 결과물</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  AI가 당신의 답변을 바탕으로 감성적이고 문학적인 자서전을 생성합니다.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">쉽게 공유</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  완성된 자서전을 사랑하는 사람들과 쉽게 공유하세요.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">안전한 보관</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  당신의 이야기는 안전하게 보관되며, 원하는 사람에게만 공유할 수 있습니다.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">시작할 준비가 되셨나요?</span>
            <span className="block text-indigo-600">지금 바로 자서전을 작성해보세요.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/write" passHref legacyBehavior>
                <a>
                  <Button variant="primary" size="lg">
                    자서전 시작하기
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

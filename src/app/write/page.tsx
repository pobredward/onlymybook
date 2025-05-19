'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function WriteMethodSelect() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (method: string) => {
    setSelected(method);
    
    // 선택한 방식을 로컬 스토리지에 저장
    localStorage.setItem('autobiography_writing_method', method);
    
    // 페이지 이동
    if (method === 'ai') {
      router.push('/write/narrative');
    } else {
      router.push('/write/manual');
    }
  };

  return (
    <MainLayout
      title="자서전 작성 방식 선택"
      description="자서전을 작성하는 방식을 선택해주세요."
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl xs:text-3xl font-extrabold text-gray-900 sm:text-4xl">
            자서전 작성하기
          </h1>
          <p className="mt-4 text-base sm:text-xl text-gray-500">
            자서전을 작성하는 방식을 선택해주세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* GPT로 작성하기 */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`
              p-6 rounded-xl border-2 cursor-pointer transition-all
              ${selected === 'ai' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
            `}
            onClick={() => handleSelect('ai')}
          >
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">GPT로 작성하기</h3>
              <p className="text-gray-600 mb-4">
                질문에 답변하면 AI가 자동으로 자서전을 생성해 드립니다. 풍부하고 감성적인 문체로 당신의 이야기를 표현합니다.
              </p>
              <Button 
                variant="primary" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect('ai');
                }}
              >
                선택하기
              </Button>
            </div>
          </motion.div>

          {/* 직접 작성하기 */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`
              p-6 rounded-xl border-2 cursor-pointer transition-all
              ${selected === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
            `}
            onClick={() => handleSelect('manual')}
          >
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">직접 작성하기</h3>
              <p className="text-gray-600 mb-4">
                자신만의 문체와 표현으로 직접 자서전을 작성합니다. 마크다운 편집기를 통해 자유롭게 글을 쓰고 편집할 수 있습니다.
              </p>
              <Button 
                variant="secondary" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect('manual');
                }}
              >
                선택하기
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
} 
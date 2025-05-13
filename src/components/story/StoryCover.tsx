import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface StoryCoverProps {
  title: string;
  authorName: string;
  readingTime?: number;
}

export const StoryCover: React.FC<StoryCoverProps> = ({
  title,
  authorName,
  readingTime
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center py-20 px-6 bg-gradient-to-b from-white via-gray-50 to-indigo-50"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* 장식 요소 */}
        <motion.div
          className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 mx-auto rounded-full mb-12"
          initial={{ width: 0 }}
          animate={isInView ? { width: 80 } : { width: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        
        {/* 제목 */}
        <motion.h1
          className="text-4xl md:text-6xl font-serif font-bold mb-8 text-gray-900 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {title}
        </motion.h1>
        
        {/* 아래 장식선 */}
        <motion.div
          className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 mx-auto rounded-full my-12"
          initial={{ width: 0 }}
          animate={isInView ? { width: 80 } : { width: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        />
        
        {/* 저자 정보 */}
        <motion.div
          className="mt-12 font-serif text-gray-700"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <div className="text-sm mb-2 text-gray-500">
            {readingTime && (
              <span className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                약 {readingTime}분 소요
              </span>
            )}
          </div>
          <div className="text-2xl font-script mt-4">{authorName}</div>
        </motion.div>
      </div>
    </motion.div>
  );
}; 
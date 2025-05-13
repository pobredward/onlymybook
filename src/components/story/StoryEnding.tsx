import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface StoryEndingProps {
  authorName: string;
  customMessage?: string;
  customTitle?: string;
}

export const StoryEnding: React.FC<StoryEndingProps> = ({
  authorName,
  customMessage = '이 이야기를 읽어주셔서 감사합니다. 여러분과 함께 나눌 수 있어 행복했습니다.',
  customTitle = '감사합니다'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });

  return (
    <motion.div
      ref={ref}
      className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-6 bg-gray-100 text-center"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-3xl font-serif font-bold text-gray-800 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {customTitle}
      </motion.h2>
      
      <motion.p
        className="text-lg text-gray-600 max-w-md mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {customMessage}
      </motion.p>
      
      <motion.div
        className="mt-8 font-script text-2xl text-gray-700"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {authorName}
      </motion.div>
    </motion.div>
  );
}; 
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ChapterTitleProps {
  id: string;
  title: string;
}

export const ChapterTitle: React.FC<ChapterTitleProps> = ({ id, title }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.6 });

  return (
    <motion.div
      id={id}
      ref={ref}
      className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-6 bg-gradient-to-b from-white to-gray-50"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center max-w-3xl mx-auto">
        <div className="mb-8 w-20 h-[3px] bg-gradient-to-r from-indigo-500 to-blue-500 mx-auto rounded-full"></div>
        
        <motion.h2
          className="text-4xl md:text-6xl font-serif font-bold mb-6 text-gray-900"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {title}
        </motion.h2>
        
        <motion.div
          className="w-20 h-[3px] bg-gradient-to-r from-indigo-500 to-blue-500 mx-auto rounded-full"
          initial={{ opacity: 0, width: 0 }}
          animate={isInView ? { opacity: 1, width: 80 } : { opacity: 0, width: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        ></motion.div>
      </div>
    </motion.div>
  );
}; 
import Link from 'next/link';
import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="text-indigo-600 font-serif font-semibold text-lg">
              디지털 자서전
            </Link>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-center text-sm text-gray-500">
              &copy; {currentYear} 디지털 자서전. All rights reserved.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-6 justify-center md:justify-end">
            <Link href="/privacy" className="text-gray-500 hover:text-indigo-600 text-sm">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-indigo-600 text-sm">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}; 
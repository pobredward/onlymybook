import React from 'react';
import { signInWithGoogle, signInWithFacebook, signInWithApple } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ 
  onSuccess, 
  onError 
}) => {
  const router = useRouter();

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'facebook':
          await signInWithFacebook();
          break;
        case 'apple':
          await signInWithApple();
          break;
        default:
          throw new Error('지원하지 않는 소셜 로그인입니다.');
      }
      
      // 로그인 성공 시 콜백 실행 또는 메인 페이지로 이동
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
      }
      
    } catch (error) {
      console.error(`${provider} 로그인 중 오류 발생:`, error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <button
        onClick={() => handleSocialLogin('google')}
        className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
          <path fill="none" d="M1 1h22v22H1z" />
        </svg>
        Google로 계속하기
      </button>

      <button
        onClick={() => handleSocialLogin('facebook')}
        className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-[#4267B2] text-sm font-medium text-white hover:bg-[#365899] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4267B2]"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="white">
          <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
        </svg>
        Facebook으로 계속하기
      </button>

      <button
        onClick={() => handleSocialLogin('apple')}
        className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-black text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="white">
          <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.93 2.71-3.43 2.71-1.5 0-1.8-.88-3.63-.88-1.8 0-2.1.88-3.63.88-1.5 0-2.48-1.37-3.42-2.71-1.7-2.53-2.52-7.08-1.06-10.17.76-1.53 2.15-2.52 3.67-2.52 1.5 0 2.4.86 3.63.86 1.2 0 2.1-.86 3.63-.86 1.47 0 2.79.93 3.56 2.4-.08.05-2.17 1.28-2.15 3.81.03 3.02 2.69 4.03 2.69 4.03z" />
        </svg>
        Apple로 계속하기
      </button>
    </div>
  );
};

export default SocialLoginButtons; 
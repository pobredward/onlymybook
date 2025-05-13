/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-noto-serif)'],
      },
      colors: {
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            fontFamily: `${theme('fontFamily.serif')}`,
            h1: {
              fontFamily: `${theme('fontFamily.serif')}`,
            },
            h2: {
              fontFamily: `${theme('fontFamily.serif')}`,
            },
            h3: {
              fontFamily: `${theme('fontFamily.serif')}`,
            },
            h4: {
              fontFamily: `${theme('fontFamily.serif')}`,
            },
          },
        },
      }),
    },
  },
  plugins: [
    typography,
  ],
} 
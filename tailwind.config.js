/** @type {import('tailwindcss').Config} */
module.exports = {
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
          25: '#f6f8ff',
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
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-subtle': 'subtlePulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        subtlePulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-headings": theme("colors.indigo[900]"),
            h1: {
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
              color: theme('colors.indigo[900]'),
            },
            h2: {
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
              color: theme('colors.indigo[900]'),
            },
            h3: {
              fontWeight: '600',
              color: theme('colors.indigo[900]'),
            },
          },
        },
      }),
    },
  },
  plugins: [],
} 
import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B3A6B',
          50:  '#E8EEF7',
          100: '#C5D4EC',
          200: '#9DB6DD',
          300: '#7498CD',
          400: '#4C7ABE',
          500: '#2E5C9E',
          600: '#1B3A6B',
          700: '#152E55',
          800: '#102344',
          900: '#091629',
        },
        gold: {
          DEFAULT: '#B8860B',
          50:  '#FDF6E3',
          100: '#F9E8A8',
          200: '#F3D770',
          300: '#EDC53D',
          400: '#D9AC1F',
          500: '#C49613',
          600: '#B8860B',
          700: '#946B09',
          800: '#7A5907',
          900: '#5C4305',
        },
        surface: '#F9FAFB',
        ink: {
          primary: '#111827',
          secondary: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.375rem',
        xl: '0.5rem',
        '2xl': '0.625rem',
      },
      boxShadow: {
        card:        '0 1px 3px 0 rgba(16, 35, 68, 0.06), 0 1px 2px -1px rgba(16, 35, 68, 0.06)',
        'card-hover':'0 8px 20px -4px rgba(16, 35, 68, 0.14)',
        'card-lg':   '0 16px 40px -8px rgba(16, 35, 68, 0.18)',
      },
      letterSpacing: {
        'wider-luxe': '0.18em',
      },
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(6px)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'bounce-slow': 'bounce-slow 1.8s ease-in-out infinite',
        'fade-in':     'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [typography],
} satisfies Config;

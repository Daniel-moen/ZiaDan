import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        rose: {
          glow: '#ffb3c6',
          deep: '#c1184c',
        },
        ink: '#0b0814',
      },
      animation: {
        'float-slow': 'float 12s ease-in-out infinite',
        'float-slower': 'float 18s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'shimmer': 'shimmer 8s linear infinite',
        'fade-in': 'fadeIn 1.2s ease-out forwards',
        'rise': 'rise 1.2s cubic-bezier(.2,.7,.2,1) forwards',
        'heart-beat': 'heartBeat 2.4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-22px) translateX(8px)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        heartBeat: {
          '0%,100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.18)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.12)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;

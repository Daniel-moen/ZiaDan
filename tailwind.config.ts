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
          glow: '#ff9bb4',
          deep: '#e0436b',
        },
        gold: '#ffcf9e',
        ink: '#08050f',
      },
      animation: {
        'float-slow': 'float 14s ease-in-out infinite',
        'float-slower': 'float 22s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'shimmer': 'shimmer 9s linear infinite',
        'fade-in': 'fadeIn 1.2s ease-out forwards',
        'rise': 'rise 1.2s cubic-bezier(.2,.7,.2,1) forwards',
        'heart-beat': 'heartBeat 2.4s ease-in-out infinite',
        'aurora-1': 'aurora1 26s ease-in-out infinite',
        'aurora-2': 'aurora2 32s ease-in-out infinite',
        'aurora-3': 'aurora3 38s ease-in-out infinite',
        'kenburns': 'kenburns 28s ease-out both',
        'glow-pulse': 'glowPulse 5s ease-in-out infinite',
        'sep-blink': 'sepBlink 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-40px) translateX(14px) rotate(8deg)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '0.5' },
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
        aurora1: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(8%,6%) scale(1.25)' },
        },
        aurora2: {
          '0%,100%': { transform: 'translate(0,0) scale(1.1)' },
          '50%': { transform: 'translate(-10%,-8%) scale(0.9)' },
        },
        aurora3: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(6%,-10%) scale(1.2)' },
        },
        kenburns: {
          '0%': { transform: 'scale(1.12) translate(2%, -1%)' },
          '100%': { transform: 'scale(1.0) translate(0, 0)' },
        },
        glowPulse: {
          '0%,100%': { opacity: '0.4', filter: 'blur(34px)' },
          '50%': { opacity: '0.75', filter: 'blur(42px)' },
        },
        sepBlink: {
          '0%,100%': { opacity: '0.25' },
          '50%': { opacity: '0.85' },
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

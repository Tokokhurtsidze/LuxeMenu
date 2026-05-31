import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F5D077',
          muted: '#9A7D20',
          glow: 'rgba(212,175,55,0.25)',
        },
        obsidian: {
          DEFAULT: '#000000',
          50: '#0A0A0A',
          100: '#111111',
          200: '#1A1A1A',
          300: '#242424',
          400: '#2E2E2E',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '60px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'gold-glow': '0 0 24px rgba(212,175,55,0.3), 0 0 48px rgba(212,175,55,0.1)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.1)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(212,175,55,0.2)' },
          '50%': { boxShadow: '0 0 28px rgba(212,175,55,0.5)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

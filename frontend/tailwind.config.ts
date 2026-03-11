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
        rsk: {
          bg: '#0B0F1A',
          primary: '#F7931A',   // Rootstock / Bitcoin orange
          primaryDark: '#E07D00',
          secondary: '#1B2330',
          accent: '#FFA726',   // Lighter orange / amber
          text: '#FFFFFF',
          muted: '#8A94A6',
          card: '#151B28',
          border: '#252D3D',
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'rsk-shine': 'linear-gradient(135deg, rgba(247,147,26,0.08) 0%, transparent 50%, rgba(255,179,102,0.06) 100%)',
      },
      boxShadow: {
        'rsk': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'rsk-glow': '0 0 20px rgba(247, 147, 26, 0.2)',
        'rsk-glow-accent': '0 0 20px rgba(255, 179, 102, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
export default config

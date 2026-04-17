import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        annie: {
          bg: '#0B1020',
          panel: '#11162A',
          border: 'rgba(255,255,255,0.10)',
          text: '#F8FAFC',
          muted: '#94A3B8',
          purple: '#7C3AED',
          lavender: '#A78BFA',
          cyan: '#22D3EE',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(167,139,250,0.18), 0 16px 48px rgba(124,58,237,0.18)',
        'glow-lg': '0 0 0 1px rgba(167,139,250,0.24), 0 24px 80px rgba(124,58,237,0.28)',
        'cyan-glow': '0 0 0 1px rgba(34,211,238,0.16), 0 18px 56px rgba(34,211,238,0.16)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      backgroundImage: {
        'annie-radial': 'radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 38%)',
        'annie-hero': 'radial-gradient(circle at 20% 0%, rgba(124,58,237,0.24), transparent 30%), radial-gradient(circle at 80% 10%, rgba(34,211,238,0.18), transparent 28%)',
        'annie-grid': 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
} satisfies Config;

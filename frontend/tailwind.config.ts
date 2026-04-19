import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        annie: {
          bg: '#060816',
          panel: '#0C1226',
          border: 'rgba(148,163,184,0.16)',
          text: '#F8FAFC',
          muted: '#94A3B8',
          purple: '#8B5CF6',
          lavender: '#A5B4FC',
          cyan: '#22D3EE',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.14), 0 16px 48px rgba(8,145,178,0.16)',
        'glow-lg': '0 0 0 1px rgba(167,139,250,0.18), 0 24px 80px rgba(59,130,246,0.22)',
        'cyan-glow': '0 0 0 1px rgba(34,211,238,0.18), 0 18px 56px rgba(34,211,238,0.18)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      backgroundImage: {
        'annie-radial': 'radial-gradient(circle at top, rgba(34,211,238,0.18), transparent 38%)',
        'annie-hero': 'radial-gradient(circle at 18% 0%, rgba(34,211,238,0.24), transparent 30%), radial-gradient(circle at 82% 12%, rgba(167,139,250,0.18), transparent 28%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.10), transparent 24%)',
        'annie-grid': 'linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
} satisfies Config;

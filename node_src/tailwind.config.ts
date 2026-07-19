import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        'ink-soft': '#475467',
        'ink-faint': '#98A2B3',
        brand: '#2563EB',
        'brand-soft': '#EEF3FF',
        up: '#0F9D58',
        down: '#E5484D',
      },
      borderRadius: {
        card: '14px',
        't-card': '14px 14px 0 0',
      },
    },
  },
  plugins: [],
};

export default config;

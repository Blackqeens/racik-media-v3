import type { Config } from 'tailwindcss';

/**
 * tailwind.config.ts — Tailwind CSS Configuration
 * Ref: coding-standards.md (utility-first CSS)
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a7a4a',
          50:  '#e6f5ec',
          100: '#c0e6ce',
          200: '#97d6ae',
          300: '#6dc68e',
          400: '#4db975',
          500: '#1a7a4a',
          600: '#166b40',
          700: '#125b36',
          800: '#0e4b2b',
          900: '#093b21',
        },
        accent: '#f59e0b',
        surface: '#f7f8fa',
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;

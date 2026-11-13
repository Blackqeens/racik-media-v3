const path = require('path');

/**
 * next.config.js — Next.js Configuration
 * Ref: deployment-architecture.md, coding-standards.md
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Output standalone untuk Docker/Linux deployment (di Windows symlink standalone butuh Developer Mode/Admin)
  ...(process.platform !== 'win32' || process.env.NEXT_OUTPUT === 'standalone'
    ? { output: 'standalone' }
    : {}),

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },

  // Image domains yang diizinkan (Supabase Storage)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Environment variables yang diekspos ke client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Racik Media V3',
  },
};

module.exports = nextConfig;

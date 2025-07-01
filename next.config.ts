import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Налаштування для Netlify
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Налаштування зображень для статичного експорту
  images: {
    unoptimized: true
  },
  
  // Налаштування базового шляху (залиште порожнім для головного домену)
  basePath: '',
  
  // ESLint налаштування
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // TypeScript налаштування
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

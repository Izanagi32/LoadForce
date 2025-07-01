import type { NextConfig } from "next";
import path from "path";

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

  // Turbopack налаштування
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },

  // Webpack конфігурація для покращення збірки
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Забезпечити правильне розв'язання шляхів
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };

    // Оптимізація для статичного експорту
    if (!dev) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;

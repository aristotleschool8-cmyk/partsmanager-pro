import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Optimize build output size
  swcMinify: true,
  productionBrowserSourceMaps: false,
  
  // Enable compression
  compress: true,
  
  // Reduce .next folder size
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-*',
      'node_modules/esbuild',
      'node_modules/@esbuild/*',
      '.git',
      '.gitignore',
      '.env.example',
    ],
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize image delivery
    formats: ['image/avif', 'image/webp'],
  },
  
  // Enable static optimization
  staticPageGenerationTimeout: 300,
};

export default nextConfig;

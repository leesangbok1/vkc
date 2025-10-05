/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화 설정
  images: {
    domains: ['lh3.googleusercontent.com', 'k.kakaocdn.net'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1년
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 성능 최적화
  experimental: {
    webpackBuildWorker: true,
  },

  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 번들 최적화
  webpack: (config, { isServer }) => {
    // CSS 최적화
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      }
    }

    return config
  },

  // 출력 추적 최적화 (lockfile 경고 해결)
  outputFileTracingRoot: '/Users/bk/Desktop/viet-kconnect',
}

export default nextConfig
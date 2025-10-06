/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화 설정
  images: {
    domains: ['lh3.googleusercontent.com', 'k.kakaocdn.net', 'localhost', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1년
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 성능 최적화 - disabled for debugging
  experimental: {
    webpackBuildWorker: false,
    ppr: false,
    reactCompiler: false,
  },

  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 번들 최적화 - simplified for debugging
  webpack: (config, { dev, isServer }) => {
    return config
  },

  // PWA 및 보안 헤더 (프로덕션)
  ...(process.env.NODE_ENV === 'production' && {
    headers: async () => [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ],
  }),

  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // 출력 추적 최적화 (lockfile 경고 해결)
  outputFileTracingRoot: '/Users/bk/Desktop/viet-kconnect',
}

export default nextConfig
import type { Metadata, Viewport } from 'next'
import './critical.css'
import './globals.css'
import { ClientProviders } from '@/components/providers/ClientProviders'
import StructuredData from '@/components/StructuredData'

export const metadata: Metadata = {
  title: 'VietKConnect - 한국 거주 베트남인을 위한 Q&A 플랫폼',
  description: '한국에서 생활하는 베트남인들을 위한 질문과 답변 커뮤니티. 비자, 생활정보, 취업, 교육 등 다양한 주제로 소통하세요.',
  keywords: ['베트남', '한국', '비자', '취업', '생활정보', 'Q&A', '커뮤니티', 'vietnamese', 'korea', 'visa', 'employment', 'community'],
  authors: [{ name: 'VietKConnect Team' }],
  creator: 'VietKConnect Team',
  publisher: 'VietKConnect',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://vietkconnect.com',
    languages: {
      'ko-KR': 'https://vietkconnect.com',
      'vi-VN': 'https://vietkconnect.com/vi',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: ['vi_VN'],
    url: 'https://vietkconnect.com',
    siteName: 'VietKConnect',
    title: 'VietKConnect - 한국 거주 베트남인 커뮤니티',
    description: '한국에서 생활하는 베트남인들을 위한 질문과 답변 플랫폼',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VietKConnect - 한국 거주 베트남인 커뮤니티',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VietKConnect',
    description: '한국 거주 베트남인을 위한 Q&A 플랫폼',
    images: ['/og-image.png'],
    creator: '@vietkconnect',
    site: '@vietkconnect',
  },
  appLinks: {
    web: {
      url: 'https://vietkconnect.com',
      should_fallback: true,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#EA4335', // Vietnam Red
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full">
      <head>
        {/* 베트남 테마 색상 */}
        <meta name="msapplication-TileColor" content="#EA4335" />

        {/* 폰트 사전 로드 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* 파비콘 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* PWA 지원 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VietKConnect" />

        {/* 소셜 미디어 메타 태그 */}
        <meta property="og:title" content="VietKConnect - 한국 거주 베트남인 커뮤니티" />
        <meta property="og:description" content="한국에서 생활하는 베트남인들을 위한 질문과 답변 플랫폼" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VietKConnect" />
        <meta name="twitter:description" content="한국 거주 베트남인을 위한 Q&A 플랫폼" />
      </head>
      <body className="h-full font-sans antialiased bg-gray-50">
        <a href="#main-content" className="skip-to-main">
          메인 콘텐츠로 건너뛰기
        </a>
        <ClientProviders>
          <div id="root" className="h-full">
            <main id="main-content">
              {children}
            </main>
          </div>
        </ClientProviders>

        {/* Structured Data */}
        <StructuredData />

        {/* 서비스 워커 등록 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                  .then(() => console.log('SW registered'))
                  .catch(() => console.log('SW registration failed'));
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
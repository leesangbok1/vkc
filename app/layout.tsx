import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../src/services/AuthContext'
import { NotificationProvider } from '../src/services/NotificationContext'
import Header from '../src/components/layout/Header'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VietKConnect - 한국 거주 베트남인을 위한 Q&A 플랫폼',
  description: '한국에서 생활하는 베트남인들을 위한 질문과 답변 커뮤니티. 비자, 생활정보, 취업, 교육 등 다양한 주제로 소통하세요.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* External Libraries: Font Awesome for icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

        {/* Google Fonts: Noto Sans KR */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme Color */}
        <meta name="theme-color" content="#007bff" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col bg-background">
              <Header />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
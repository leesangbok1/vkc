import './globals.css'
import type { ReactNode } from 'react'
import HeaderClient from '@/components/layout/HeaderClient'
import ChatbotButtonClient from '@/components/layout/ChatbotButtonClient'
import ClientProviders from '@/components/providers/ClientProviders'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Language" content="ko" />
      </head>
      <body>
        <ClientProviders>
          <HeaderClient />
          <main className="app-main-content" id="main-content">
            {children}
          </main>
          <ChatbotButtonClient />
        </ClientProviders>
      </body>
    </html>
  )
}

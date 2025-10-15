import './globals.css'
import Header from '@/components/layout/Header'
import ChatbotButton from '@/components/chatbot/ChatbotButton'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main className="app-main-content">
          {children}
        </main>
        <ChatbotButton />
      </body>
    </html>
  )
}

'use client'

import { ReactNode } from 'react'
import Header from './Header'
import DesktopSidebar from './DesktopSidebar'
import MobileBottomNav from './MobileBottomNav'

interface ResponsiveLayoutProps {
  children: ReactNode
  showSidebar?: boolean
  showBottomNav?: boolean
}

export default function ResponsiveLayout({
  children,
  showSidebar = true,
  showBottomNav = true
}: ResponsiveLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary">
      {/* Header - 모든 디바이스 */}
      <Header />

      <div className="flex">
        {/* Desktop Sidebar - 1024px+ */}
        {showSidebar && <DesktopSidebar />}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* 컨텐츠 영역 */}
          <div className={`
            container mx-auto px-4 py-6
            ${showSidebar ? 'lg:pr-8' : ''}
            ${showBottomNav ? 'pb-20 md:pb-6' : ''}
          `}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - ~768px */}
      {showBottomNav && <MobileBottomNav />}
    </div>
  )
}

// 특수 레이아웃 변형들
export function FullWidthLayout({ children }: { children: ReactNode }) {
  return (
    <ResponsiveLayout showSidebar={false} showBottomNav={true}>
      {children}
    </ResponsiveLayout>
  )
}

export function MinimalLayout({ children }: { children: ReactNode }) {
  return (
    <ResponsiveLayout showSidebar={false} showBottomNav={false}>
      {children}
    </ResponsiveLayout>
  )
}

// 홈페이지 전용 레이아웃
export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-blue/5 via-primary to-trust/5">
      <Header />

      <div className="flex">
        <DesktopSidebar />

        <main className="flex-1">
          {/* 히어로 섹션 */}
          <section className="bg-gradient-to-r from-primary-blue to-trust text-white py-12 lg:py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                  🇰🇷 한국 생활이 궁금하세요?
                </h1>
                <p className="text-lg lg:text-xl opacity-90 mb-8">
                  베트남인 커뮤니티에서 빠르고 정확한 답변을 받아보세요
                </p>

                {/* 검색/질문 입력 박스 */}
                <div className="max-w-2xl mx-auto bg-primary rounded-xl p-2 shadow-xl">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="비자, 취업, 주거 등 궁금한 것을 물어보세요..."
                      className="flex-1 px-4 py-3 text-primary rounded-lg border-none outline-none bg-primary"
                    />
                    <button className="bg-primary-blue hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-normal whitespace-nowrap">
                      ✍️ 질문하기
                    </button>
                  </div>
                </div>

                {/* 신뢰도 표시 */}
                <div className="mt-6 text-sm opacity-75">
                  💡 AI가 자동으로 <span className="font-semibold">전문가 5명</span>을 매칭해 드립니다
                </div>
              </div>
            </div>
          </section>

          {/* 메인 컨텐츠 */}
          <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  MessageSquare,
  Bell,
  User
} from 'lucide-react'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  emoji: string
  badge?: number
}

const navItems: NavItem[] = [
  {
    icon: Home,
    label: '홈',
    href: '/',
    emoji: '🏠'
  },
  {
    icon: MessageSquare,
    label: '질문',
    href: '/questions',
    emoji: '❓'
  },
  {
    icon: Bell,
    label: '알림',
    href: '/notifications',
    emoji: '🔔',
    badge: 0 // 알림 개수는 나중에 state로 관리
  },
  {
    icon: User,
    label: '프로필',
    href: '/profile',
    emoji: '👤'
  }
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  // 특정 페이지에서는 하단 네비게이션 숨김
  const hiddenPaths = ['/auth', '/onboarding', '/login']
  const isHidden = hiddenPaths.some(path => pathname?.startsWith(path))

  if (isHidden) {
    return null
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0',
        'bg-neutral-0 border-t border-neutral-200',
        'md:hidden shadow-lg safe-area-bottom'
      )}
      style={{ zIndex: 'var(--z-fixed)' }}
      role="navigation"
      aria-label="주요 네비게이션"
    >
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href ||
            (item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center touch-target rounded-lg',
                'text-body-small font-medium transition-fast',
                isActive
                  ? 'text-user'
                  : 'text-neutral-600 hover:text-user'
              )}
              style={{ minHeight: 'var(--touch-target-min)', minWidth: 'var(--touch-target-min)' }}
              aria-label={`${item.label} 페이지로 이동`}
            >
              <div className="relative">
                <div className="text-lg mb-1" aria-hidden="true">
                  {item.emoji}
                </div>

                {/* 알림 배지 */}
                {item.badge && item.badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-error-500 text-neutral-0 text-label-small font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    aria-label={`${item.badge}개의 새 알림`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className="text-label-small">
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* 중앙 질문하기 FAB (Material Design 스타일) */}
        <Link
          href="/questions/new"
          className="bg-primary-500 text-neutral-0 rounded-full p-3 -mt-4 shadow-lg hover:bg-primary-600 transition-normal touch-target"
          aria-label="질문하기"
        >
          <span className="text-xl">➕</span>
        </Link>

        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href ||
            (item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center touch-target rounded-lg',
                'text-body-small font-medium transition-fast',
                isActive
                  ? 'text-user'
                  : 'text-neutral-600 hover:text-user'
              )}
              style={{ minHeight: 'var(--touch-target-min)', minWidth: 'var(--touch-target-min)' }}
              aria-label={`${item.label} 페이지로 이동`}
            >
              <div className="relative">
                <div className="text-lg mb-1" aria-hidden="true">
                  {item.emoji}
                </div>

                {/* 알림 배지 */}
                {item.badge && item.badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-error-500 text-neutral-0 text-label-small font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    aria-label={`${item.badge}개의 새 알림`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className="text-label-small">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// 모바일 전용 컴포넌트 래퍼
export function MobileOnlyBottomNav() {
  return (
    <div className="block md:hidden">
      <MobileBottomNav />
      {/* 컨텐츠 하단 여백 확보 - 네비게이션 높이만큼 */}
      <div className="h-20" />
    </div>
  )
}

// Named export 추가
export { MobileBottomNav }
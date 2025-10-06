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
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-primary border-t border-light',
        'md:hidden shadow-lg'
      )}
      role="navigation"
      aria-label="주요 네비게이션"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-normal min-w-[60px]',
                'hover:bg-secondary active:scale-95',
                isActive
                  ? 'bg-primary-blue text-white shadow-md'
                  : 'text-secondary'
              )}
              aria-label={`${item.label} 페이지로 이동`}
            >
              <div className="relative">
                {isActive ? (
                  <div className="text-lg mb-1" aria-hidden="true">
                    {item.emoji}
                  </div>
                ) : (
                  <item.icon className="w-5 h-5 mb-1" aria-hidden="true" />
                )}

                {/* 알림 배지 */}
                {item.badge && item.badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1"
                    aria-label={`${item.badge}개의 새 알림`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className={cn(
                'text-xs font-medium transition-all',
                isActive ? 'text-white font-semibold' : 'text-secondary'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* 안전 영역 (iPhone 홈 바) - 디자인 토큰 적용 */}
      <div className="h-safe-area-inset-bottom bg-primary" />
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
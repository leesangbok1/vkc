'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Search,
  MessageSquarePlus,
  Bell,
  User,
  Users
} from 'lucide-react'

const navItems = [
  {
    icon: Home,
    label: '홈',
    href: '/',
    emoji: '🏠'
  },
  {
    icon: Search,
    label: '검색',
    href: '/search',
    emoji: '🔍'
  },
  {
    icon: MessageSquarePlus,
    label: '질문',
    href: '/questions/new',
    emoji: '✍️'
  },
  {
    icon: Bell,
    label: '알림',
    href: '/notifications',
    emoji: '🔔'
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden shadow-2xl">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px]',
                'hover:bg-gray-50 active:scale-95',
                isActive
                  ? 'bg-primary-blue text-white shadow-md'
                  : 'text-gray-600'
              )}
            >
              <div className="relative">
                {isActive ? (
                  <div className="text-lg mb-1">
                    {item.emoji}
                  </div>
                ) : (
                  <item.icon className="w-5 h-5 mb-1" />
                )}

                {/* 알림 배지 (알림 탭만) */}
                {item.href === '/notifications' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-blue rounded-full animate-pulse" />
                )}
              </div>

              <span className={cn(
                'text-xs font-medium',
                isActive ? 'text-white' : 'text-gray-600'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* 안전 영역 (iPhone 홈 바) */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  )
}

// 모바일 전용 컴포넌트 래퍼
export function MobileOnlyBottomNav() {
  return (
    <div className="block md:hidden">
      <MobileBottomNav />
      {/* 컨텐츠 하단 여백 확보 */}
      <div className="h-20" />
    </div>
  )
}
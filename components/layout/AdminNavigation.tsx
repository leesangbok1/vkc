'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const adminNavItems = [
  {
    href: '/monitoring',
    label: '실시간 모니터링',
    icon: '📊',
    description: '시스템 상태 및 성능 메트릭'
  },
  {
    href: '/admin/users',
    label: '사용자 관리',
    icon: '👥',
    description: '사용자 계정 및 권한 관리'
  },
  {
    href: '/admin/questions',
    label: '질문 관리',
    icon: '❓',
    description: '질문 모니터링 및 관리'
  },
  {
    href: '/admin/analytics',
    label: '분석',
    icon: '📈',
    description: '사용자 활동 및 성능 분석'
  }
]

interface AdminNavigationProps {
  className?: string
}

export function AdminNavigation({ className }: AdminNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={cn('space-y-2', className)}>
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <div className="flex-1">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </div>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
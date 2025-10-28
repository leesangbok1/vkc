'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  MessageSquare,
  Users,
  TrendingUp,
  Settings,
  ChevronRight,
  Star
} from 'lucide-react'

const categories = [
  {
    id: 'visa',
    name: '비자/법률',
    icon: '🛂',
    color: 'category-visa',
    count: 142,
    href: '/categories/visa'
  },
  {
    id: 'housing',
    name: '주거/부동산',
    icon: '🏠',
    color: 'category-housing',
    count: 89,
    href: '/categories/housing'
  },
  {
    id: 'employment',
    name: '취업/직장',
    icon: '💼',
    color: 'category-employment',
    count: 156,
    href: '/categories/employment'
  },
  {
    id: 'education',
    name: '교육/학업',
    icon: '🎓',
    color: 'category-education',
    count: 73,
    href: '/categories/education'
  },
  {
    id: 'healthcare',
    name: '의료/건강',
    icon: '🏥',
    color: 'category-healthcare',
    count: 45,
    href: '/categories/healthcare'
  },
  {
    id: 'life',
    name: '생활/문화',
    icon: '🍜',
    color: 'category-life',
    count: 201,
    href: '/categories/life'
  }
]

const mainNavItems = [
  {
    icon: Home,
    label: '홈',
    href: '/',
    emoji: '🏠'
  },
  {
    icon: MessageSquare,
    label: '모든 질문',
    href: '/questions',
    emoji: '💬'
  },
  {
    icon: Users,
    label: '전문가',
    href: '/experts',
    emoji: '👨‍💼'
  },
  {
    icon: TrendingUp,
    label: '인기',
    href: '/trending',
    emoji: '🔥'
  },
  {
    icon: Star,
    label: '내 즐겨찾기',
    href: '/bookmarks',
    emoji: '⭐'
  }
]

export default function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-80 h-screen sticky top-16 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        {/* 메인 네비게이션 */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            메뉴
          </h2>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-gray-50 hover:translate-x-1',
                    isActive
                      ? 'bg-primary-blue text-white shadow-md'
                      : 'text-gray-700 hover:text-gray-900'
                  )}
                >
                  <div className="text-lg">
                    {item.emoji}
                  </div>
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* 카테고리 섹션 */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            카테고리
          </h2>
          <nav className="space-y-1">
            {categories.map((category) => {
              const isActive = pathname?.includes(category.href)

              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group',
                    'hover:bg-gray-50 hover:translate-x-1',
                    isActive
                      ? 'bg-primary-green text-gray-900 shadow-md'
                      : 'text-gray-700 hover:text-gray-900'
                  )}
                >
                  <div className={cn(
                    'category-icon w-6 h-6 flex items-center justify-center text-sm rounded',
                    category.color
                  )}>
                    {category.icon}
                  </div>
                  <span className="font-medium flex-1">{category.name}</span>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  )}>
                    {category.count}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* 베트남 커뮤니티 통계 */}
        <div className="bg-gradient-to-br from-primary-blue to-primary-green p-4 rounded-xl text-white">
          <h3 className="font-semibold mb-2">🇰🇷 한국 거주 베트남인</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>활성 사용자</span>
              <span className="font-semibold">2,847명</span>
            </div>
            <div className="flex justify-between">
              <span>답변된 질문</span>
              <span className="font-semibold">94.2%</span>
            </div>
            <div className="flex justify-between">
              <span>평균 응답시간</span>
              <span className="font-semibold">2.4시간</span>
            </div>
          </div>
          <Link
            href="/stats"
            className="inline-flex items-center gap-1 mt-3 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
          >
            자세히 보기
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 설정 */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>설정</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}

// 데스크탑 전용 사이드바 래퍼
export function DesktopOnlySidebar() {
  return (
    <div className="hidden lg:block">
      <DesktopSidebar />
    </div>
  )
}
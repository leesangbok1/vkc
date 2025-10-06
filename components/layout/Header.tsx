'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useSafeAuth } from "@/components/providers/ClientProviders"
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogIn, User, Settings, LogOut, MessageSquare } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/theme-toggle'
import LoginModal from '@/components/LoginModal'
import NotificationCenterMobile from '@/components/notifications/NotificationCenterMobile'
import NotificationErrorBoundary from '@/components/notifications/NotificationErrorBoundary'
import { HeaderBanner } from '@/components/banners/ValuePropositionBanner'
import { ConditionalBanner, RoleBasedWrapper } from '@/components/layout/ConditionalLayout'
import { UserRole, getLayoutConfig } from '@/lib/utils/permissions'

export default function Header() {
  const { user, profile, loading, signOut } = useSafeAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // 4-tier 권한 시스템: 사용자 역할 결정
  const userRole = user ? ((profile as any)?.role || UserRole.USER) : UserRole.GUEST
  const layoutConfig = getLayoutConfig(userRole)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-light bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary/90 transition-normal shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-90 transition-normal"
              aria-label="VietKConnect 홈으로 이동"
            >
              <div className="primary-flag-pattern w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-primary-inverse font-bold text-lg">
                VK
              </div>
              <span className="font-bold text-lg sm:text-xl text-primary-inverse">VietKConnect</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2" role="navigation" aria-label="주요 메뉴">
              <Link href="/questions">
                <Button
                  variant="ghost"
                  className="text-primary-inverse hover:bg-trust hover:text-primary transition-normal"
                  aria-label="질문 목록 보기"
                >
                  💬 질문
                </Button>
              </Link>
              <Link href="/questions/new">
                <Button
                  className="bg-trust hover:bg-secondary-600 text-primary transition-normal"
                  aria-label="새 질문 작성하기"
                >
                  ✍️ 질문하기
                </Button>
              </Link>

              {/* 관리자 전용 메뉴 */}
              {userRole === UserRole.ADMIN && (
                <Button
                  variant="ghost"
                  className="text-primary-inverse hover:bg-warning-500 hover:text-primary transition-normal"
                  aria-label="관리자 패널"
                  onClick={() => {
                    // 관리자 패널 표시
                    const adminPanel = document.getElementById('admin-panel')
                    if (adminPanel) {
                      adminPanel.style.display = 'block'
                    }
                    // 메인 컨텐츠 숨기기
                    const mainContent = document.getElementById('main-content')
                    if (mainContent) {
                      mainContent.style.display = 'none'
                    }
                    // 또는 이벤트 디스패치로 AdminIntegratedPanel에서 처리
                    window.dispatchEvent(new CustomEvent('openAdminPanel'))
                  }}
                >
                  ⚙️ 관리
                </Button>
              )}

              {/* 전문가 전용 메뉴 */}
              {(userRole === UserRole.VERIFIED || userRole === UserRole.ADMIN) && (
                <Link href="/experts">
                  <Button
                    variant="ghost"
                    className="text-primary-inverse hover:bg-success-500 hover:text-primary transition-normal"
                    aria-label="전문가 네트워크"
                  >
                    🎓 전문가
                  </Button>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* 알림 센터 - 로그인한 사용자만 표시 */}
            {user && (
              <NotificationErrorBoundary>
                <NotificationCenterMobile className="flex-shrink-0" />
              </NotificationErrorBoundary>
            )}

            {loading ? (
              <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-trust hover:ring-offset-2 transition-normal"
                    aria-label={`사용자 메뉴 - ${profile?.name || user.user_metadata?.name || user.email}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={profile?.avatar_url || user.user_metadata?.avatar_url}
                        alt={`${profile?.name || user.user_metadata?.name || user.email}의 프로필 이미지`}
                      />
                      <AvatarFallback className="bg-trust text-primary font-medium">
                        {(profile?.name || user.user_metadata?.name || user.email)?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 animate-in fade-in-0 zoom-in-95" align="end" forceMount>
                  <DropdownMenuItem className="flex-col items-start p-3" disabled>
                    <div className="font-medium text-sm">
                      {profile?.name || user.user_metadata?.name || '사용자'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate w-full">{user.email}</div>
                    <div className="trust-badge mt-1">
                      🇰🇷 {profile?.residence_years || 5}년차
                    </div>
                    {/* 4-tier 역할 표시 */}
                    <div className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium mt-1',
                      layoutConfig.badgeColor
                    )}>
                      {layoutConfig.icon} {layoutConfig.label}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      프로필
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      설정
                    </Link>
                  </DropdownMenuItem>
                  {/* 관리자 전용 메뉴 */}
                  {userRole === UserRole.ADMIN && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <span className="mr-2">⚙️</span>
                          관리자 패널
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/monitoring" className="cursor-pointer">
                          <span className="mr-2">📊</span>
                          모니터링
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* 인증 사용자 전용 메뉴 */}
                  {(userRole === UserRole.VERIFIED || userRole === UserRole.ADMIN) && (
                    <DropdownMenuItem asChild>
                      <Link href="/verification" className="cursor-pointer">
                        <span className="mr-2">📄</span>
                        인증 관리
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* 일반 사용자 인증 신청 */}
                  {userRole === UserRole.USER && (
                    <DropdownMenuItem asChild>
                      <Link href="/verification/apply" className="cursor-pointer">
                        <span className="mr-2">✨</span>
                        전문가 인증 신청
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <div className="sm:hidden">
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <ThemeToggle />
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isSigningOut ? '로그아웃 중...' : '로그아웃'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                className="bg-trust hover:bg-secondary-600 text-primary hover:scale-105 transition-normal"
                aria-label="로그인하기"
              >
                <LogIn className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">🇰🇷 로그인</span>
                <span className="sm:hidden">로그인</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 4-tier 권한별 동적 배너 시스템 */}
      <RoleBasedWrapper user={{ role: userRole } as any}>
        <ConditionalBanner
          user={{ role: userRole } as any}
          variant={layoutConfig.bannerVariant}
          position="header"
        />
      </RoleBasedWrapper>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  )
}
'use client'

import React from 'react'
import { UserRole, getLayoutConfig } from '@/lib/utils/permissions'
import { ExtendedUser } from '@/lib/types/permissions'

interface ConditionalLayoutProps {
  user?: ExtendedUser | null
  children: React.ReactNode
  showFor?: UserRole[]
  hideFor?: UserRole[]
  fallback?: React.ReactNode
}

interface ConditionalBannerProps {
  user?: ExtendedUser | null
  showFor?: UserRole[]
  variant: 'registration-cta' | 'expert-network' | 'admin-tools'
  position?: 'header' | 'sidebar' | 'content' | 'floating'
}

/**
 * ConditionalLayout - 권한별 조건부 렌더링 컴포넌트
 */
export function ConditionalLayout({
  user,
  children,
  showFor,
  hideFor,
  fallback = null
}: ConditionalLayoutProps) {
  const userRole = user?.role || UserRole.GUEST

  // showFor 조건 확인
  if (showFor && !showFor.includes(userRole)) {
    return <>{fallback}</>
  }

  // hideFor 조건 확인
  if (hideFor && hideFor.includes(userRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * ConditionalBanner - 권한별 배너 표시 컴포넌트
 */
export function ConditionalBanner({
  user,
  showFor,
  variant,
  position = 'header'
}: ConditionalBannerProps) {
  const userRole = user?.role || UserRole.GUEST
  const layoutConfig = getLayoutConfig(userRole)

  // showFor 조건이 있으면 확인
  if (showFor && !showFor.includes(userRole)) {
    return null
  }

  // 레이아웃 설정에 따라 배너 표시 결정
  const shouldShowBanner = (() => {
    switch (variant) {
      case 'registration-cta':
        return layoutConfig.showGuestBanner || layoutConfig.showVerificationCTA
      case 'expert-network':
        return layoutConfig.showExpertNetwork
      case 'admin-tools':
        return layoutConfig.showAdminPanel
      default:
        return false
    }
  })()

  if (!shouldShowBanner) {
    return null
  }

  return (
    <div
      className={`conditional-banner ${variant} ${position}`}
      data-role={userRole}
      data-variant={variant}
    >
      {renderBannerContent(variant, userRole, position)}
    </div>
  )
}

/**
 * 배너 콘텐츠 렌더링 함수
 */
function renderBannerContent(
  variant: 'registration-cta' | 'expert-network' | 'admin-tools',
  userRole: UserRole,
  position: string
) {
  switch (variant) {
    case 'registration-cta':
      return (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">
                {userRole === UserRole.GUEST
                  ? '🔐 신뢰할 수 있는 Certified User 답변을 받아보세요'
                  : '✨ Certified User 인증을 받고 더 많은 혜택을 누리세요'
                }
              </h4>
              <p className="text-xs text-blue-700 mt-1">
                {userRole === UserRole.GUEST
                  ? '베트남 생활 Certified User들의 검증된 정보를 확인하세요'
                  : '문서 인증을 통해 Certified User 배지와 우선 답변 노출 혜택을 받으세요'
                }
              </p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              {userRole === UserRole.GUEST ? 'Google 로그인' : '인증 신청'}
            </button>
          </div>
        </div>
      )

    case 'expert-network':
      return (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900">
                🎓 Certified User 네트워크에 오신 것을 환영합니다
              </h4>
              <p className="text-xs text-green-700 mt-1">
                검증된 전문성으로 커뮤니티에 기여하고 다른 Certified User들과 네트워킹하세요
              </p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
              Certified User 매칭
            </button>
          </div>
        </div>
      )

    case 'admin-tools':
      return (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-purple-900">
                ⚙️ 관리자 도구
              </h4>
              <p className="text-xs text-purple-700 mt-1">
                사용자 관리, 인증 승인, 플랫폼 통계를 확인하세요
              </p>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
              관리자 패널
            </button>
          </div>
        </div>
      )

    default:
      return null
  }
}

/**
 * RoleBasedWrapper - 권한별 래퍼 컴포넌트
 */
interface RoleBasedWrapperProps {
  user?: ExtendedUser | null
  children: React.ReactNode
  className?: string
}

export function RoleBasedWrapper({ user, children, className = '' }: RoleBasedWrapperProps) {
  const userRole = user?.role || UserRole.GUEST
  const layoutConfig = getLayoutConfig(userRole)

  return (
    <div
      className={`role-based-wrapper ${className}`}
      data-role={userRole}
      data-layout-variant={layoutConfig.bannerVariant}
    >
      {/* 권한별 배너 표시 */}
      <ConditionalBanner
        user={user}
        variant={layoutConfig.bannerVariant}
        position="header"
      />

      {children}
    </div>
  )
}
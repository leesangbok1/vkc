'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ValuePropositionBannerProps {
  position: 'header' | 'sidebar' | 'content' | 'footer' | 'floating'
  target?: 'all' | 'guests' | 'unverified' | 'verified'
  variant?: 'default' | 'compact' | 'detailed' | 'minimal'
  className?: string
  onClose?: () => void
}

export default function ValuePropositionBanner({
  position,
  target = 'all',
  variant = 'default',
  className,
  onClose
}: ValuePropositionBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const getPositionStyles = () => {
    switch (position) {
      case 'header':
        return 'w-full bg-gradient-to-r from-primary-500 to-success-500 text-white'
      case 'sidebar':
        return 'bg-white border border-gray-200 shadow-sm rounded-lg'
      case 'content':
        return 'bg-primary-50 border border-primary-200 rounded-lg'
      case 'footer':
        return 'w-full bg-gray-100 border-t border-gray-200'
      case 'floating':
        return 'fixed bottom-4 right-4 z-50 bg-white shadow-lg border border-gray-200 rounded-lg max-w-sm'
      default:
        return 'bg-white border border-gray-200 rounded-lg'
    }
  }

  const getContentByTarget = () => {
    switch (target) {
      case 'guests':
        return {
          title: '🔐 신뢰할 수 있는 답변을 받아보세요',
          subtitle: '베트남인 한국생활 Certified User들의 검증된 조언',
          features: [
            '✅ 실명 인증된 Certified User',
            '📄 비자타입별 맞춤 정보',
            '🏠 거주년차별 경험 공유',
            '🎯 체계적인 카테고리 분류'
          ],
          cta: '지금 가입하고 질문하기',
          description: '익명 커뮤니티와 달리 실제 신원이 확인된 Certified User들의 답변을 받아보세요.'
        }

      case 'unverified':
        return {
          title: '🎓 인증받고 신뢰도를 높이세요',
          subtitle: '문서 인증으로 더 많은 기회를 얻으세요',
          features: [
            '📋 비자/졸업장 인증',
            '⭐ Certified User 배지 획득',
            '🎯 맞춤형 질문 매칭',
            '💼 네트워킹 기회 확대'
          ],
          cta: '지금 인증하기',
          description: '인증된 회원만이 받을 수 있는 특별한 혜택과 신뢰를 쌓아보세요.'
        }

      case 'verified':
        return {
          title: '👑 Certified User로 활동해보세요',
          subtitle: '경험을 나누고 커뮤니티에 기여하세요',
          features: [
            '🌟 Certified User 인증 신청',
            '💡 답변으로 점수 적립',
            '🏆 베스트 답변자 혜택',
            '🤝 직접 멘토링 기회'
          ],
          cta: 'Certified User 신청하기',
          description: '여러분의 한국생활 경험이 누군가에게는 소중한 도움이 됩니다.'
        }

      default:
        return {
          title: '🇰🇷 베트남인 한국생활 Q&A',
          subtitle: '신뢰할 수 있는 Certified User들의 검증된 답변',
          features: [
            '🔐 실명 인증 시스템',
            '🎯 Certified User분야별 매칭',
            '📊 체계적인 정보 분류',
            '🤝 실제 경험 기반 조언'
          ],
          cta: '지금 시작하기',
          description: '베트남인을 위한 가장 신뢰할 수 있는 한국생활 정보 플랫폼'
        }
    }
  }

  const content = getContentByTarget()

  if (variant === 'compact') {
    return (
      <div className={cn(getPositionStyles(), 'p-3', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-content text-lg">
                🇰🇷
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">
                {content.title}
              </div>
              <div className="text-xs opacity-90 truncate">
                {content.subtitle}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
              시작하기
            </button>
            {onClose && (
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={cn(getPositionStyles(), 'p-4', className)}>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            {content.title}
          </div>
          <div className="text-sm text-gray-600 mb-3">
            {content.description}
          </div>
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {content.cta}
          </button>
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn(getPositionStyles(), 'p-6', className)}>
        {onClose && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        )}

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center text-2xl text-white">
            🇰🇷
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {content.title}
          </h2>
          <p className="text-gray-600">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {content.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                {index + 1}
              </div>
              <div className="text-sm text-gray-700">
                {feature}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-gradient-to-r from-primary-500 to-success-500 hover:from-primary-600 hover:to-success-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all hover:shadow-lg">
            {content.cta}
          </button>
          <div className="text-xs text-gray-500 mt-2">
            {content.description}
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn(getPositionStyles(), 'p-4', className)}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center text-lg text-white">
            🇰🇷
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {content.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {content.subtitle}
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {content.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                <span className="text-primary-500">•</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {content.cta}
            </button>
            {onClose && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
              >
                나중에
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 미리 정의된 배너들
export const HeaderBanner = () => (
  <ValuePropositionBanner
    position="header"
    target="guests"
    variant="compact"
  />
)

export const SidebarPromotionBanner = () => (
  <ValuePropositionBanner
    position="sidebar"
    target="unverified"
    variant="default"
  />
)

export const ContentBanner = () => (
  <ValuePropositionBanner
    position="content"
    target="all"
    variant="minimal"
  />
)

export const FloatingBanner = ({ onClose }: { onClose?: () => void }) => (
  <ValuePropositionBanner
    position="floating"
    target="guests"
    variant="default"
    onClose={onClose}
  />
)

// 배너 관리 컴포넌트
export function BannerManager({
  banners,
  onBannerUpdate,
  className
}: {
  banners: Array<{
    id: string
    position: string
    target: string
    title: string
    content: string
    isActive: boolean
  }>
  onBannerUpdate?: (bannerId: string, updates: any) => void
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        배너 관리
      </h3>

      {banners.map((banner) => (
        <div key={banner.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium text-gray-900">{banner.title}</div>
              <div className="text-sm text-gray-500">
                {banner.position} • {banner.target}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={banner.isActive}
                  onChange={(e) => onBannerUpdate?.(banner.id, { isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-3">
            {banner.content}
          </div>

          <div className="flex items-center gap-2">
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              편집
            </button>
            <button className="text-gray-400 hover:text-gray-600 text-sm">
              미리보기
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
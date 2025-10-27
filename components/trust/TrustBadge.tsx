'use client'

import { cn } from '@/lib/utils'
import {
  UserRole,
  getRoleDisplayInfo,
  getVerificationTypeIcon,
  getVerificationTypeLabel,
  isExperienceBasedVerification
} from '@/lib/utils/permissions'
import { ExtendedUser } from '@/lib/types/permissions'

interface TrustBadgeProps {
  user: {
    residence_years?: number
    visa_type?: string
    company?: string
    trust_score?: number
    verification_type?: 'student' | 'worker' | 'resident' | 'business'
    is_verified?: boolean
    specialties?: string[]
    role?: UserRole
    verification_status?: string
  }
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export default function TrustBadge({
  user,
  variant = 'default',
  className
}: TrustBadgeProps) {
  // 통합된 유틸리티 함수 사용 (permissions.ts에서 import)
  // 이제 경험 기반 인증 타입도 자동으로 지원됩니다:
  // - mentor (👨‍🏫 멘토 인증)
  // - experienced (⭐ 선경험자 인증)
  // - community_leader (👥 커뮤니티 리더)
  // - specialist (🎯 전문가 인증)

  const getTrustLevel = (score: number, role?: UserRole) => {
    // 4-tier 권한 시스템 우선 적용
    if (role) {
      const roleInfo = getRoleDisplayInfo(role)
      return {
        level: roleInfo.label,
        color: roleInfo.badgeColor,
        icon: roleInfo.icon,
        bgClass: roleInfo.bgColor
      }
    }

    // 기존 신뢰도 점수 기반 레벨 (하위 호환성)
    if (score >= 800) return {
      level: 'Certified User',
      color: 'bg-warning-500 text-white',
      icon: '👑',
      bgClass: 'bg-warning-100 border-warning-300'
    }
    if (score >= 600) return {
      level: '인증완료',
      color: 'bg-success-500 text-white',
      icon: '✅',
      bgClass: 'bg-success-100 border-success-300'
    }
    if (score >= 400) return {
      level: '문서인증',
      color: 'bg-primary-500 text-white',
      icon: '📄',
      bgClass: 'bg-primary-100 border-primary-300'
    }
    if (score >= 200) return {
      level: '기본회원',
      color: 'bg-gray-500 text-white',
      icon: '👤',
      bgClass: 'bg-gray-100 border-gray-300'
    }
    return {
      level: '미인증',
      color: 'bg-gray-400 text-white',
      icon: '❓',
      bgClass: 'bg-gray-50 border-gray-200'
    }
  }

  if (variant === 'compact') {
    const roleInfo = user.role ? getRoleDisplayInfo(user.role) : null

    return (
      <div
        data-testid="trust-badge"
        className={cn(
          'inline-flex items-center gap-2 rounded-full text-body-small font-medium transition-fast',
          'px-3 py-1',
          roleInfo ? roleInfo.badgeColor : 'badge-user',
          className
        )}
      >
        {roleInfo && (
          <>
            <span>{roleInfo.icon}</span>
            <span>{roleInfo.label}</span>
          </>
        )}
        <span className="text-label-small opacity-75">
          🇰🇷 {user.residence_years || 0}년차
        </span>
        {user.is_verified && (
          <span className="text-label-small">✓</span>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    const trustInfo = getTrustLevel(user.trust_score || 0, user.role)
    const roleInfo = user.role ? getRoleDisplayInfo(user.role) : null

    return (
      <div className={cn('bg-primary rounded-lg p-6 border border-light shadow-md', className)}>
        {/* 4-tier 역할 표시 (최우선) */}
        {roleInfo && (
          <div className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4',
            roleInfo.badgeColor
          )}>
            <span className="text-lg">{roleInfo.icon}</span>
            <span>{roleInfo.label}</span>
            {user.trust_score && (
              <span className="text-xs opacity-75">⭐{user.trust_score}</span>
            )}
          </div>
        )}

        {/* 거주 정보 */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇰🇷</span>
            <span className="font-medium text-primary">
              한국 {user.residence_years || 0}년차
            </span>
          </div>

          {user.visa_type && (
            <div className="flex items-center gap-2 text-sm text-secondary">
              <span>🛂</span>
              <span>{user.visa_type}</span>
              {user.company && <span className="text-tertiary">• {user.company}</span>}
            </div>
          )}
        </div>

        {/* 인증 정보 */}
        {(user.is_verified || user.role === UserRole.VERIFIED || user.role === UserRole.ADMIN) && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-sm mb-3">
            <span>{getVerificationTypeIcon(user.verification_type || '')}</span>
            <span className="text-primary">{getVerificationTypeLabel(user.verification_type || '')}</span>
            {isExperienceBasedVerification(user.verification_type || '') && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2">
                경험 기반
              </span>
            )}
            {user.verification_status === 'pending' && (
              <span className="text-xs bg-warning-500 text-white px-2 py-1 rounded ml-2">
                심사중
              </span>
            )}
          </div>
        )}

        {/* 신뢰도 점수 */}
        {user.trust_score && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-secondary">신뢰도</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg text-primary">{user.trust_score}</span>
                <span className="text-sm text-tertiary">점</span>
              </div>
            </div>

            {/* 신뢰도 진행바 */}
            <div className="w-full bg-tertiary rounded-full h-2">
              <div
                className="bg-trust h-2 rounded-full transition-all"
                style={{ width: `${Math.min((user.trust_score / 1000) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* 전문 분야 */}
        {user.specialties && user.specialties.length > 0 && (
          <div>
            <span className="text-sm text-secondary block mb-2">전문 분야</span>
            <div className="flex flex-wrap gap-1">
              {user.specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="text-xs bg-tertiary text-primary px-2 py-1 rounded-full"
                >
                  #{specialty}
                </span>
              ))}
              {user.specialties.length > 3 && (
                <span className="text-xs text-tertiary">+{user.specialties.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default variant
  const roleInfo = user.role ? getRoleDisplayInfo(user.role) : null

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 4-tier 역할 배지 (최우선 표시) */}
      {roleInfo && (
        <div className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-normal',
          roleInfo.badgeColor
        )}>
          <span>{roleInfo.icon}</span>
          <span className="hidden sm:inline">{roleInfo.label}</span>
        </div>
      )}

      {/* 거주년차 */}
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs text-primary">
        🇰🇷 <span className="hidden sm:inline">{user.residence_years || 0}년차</span>
      </div>

      {/* 인증 상태 */}
      {(user.is_verified || user.role === UserRole.VERIFIED || user.role === UserRole.ADMIN) && (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-trust text-white rounded-full text-xs">
          {getVerificationTypeIcon(user.verification_type || '')}
          <span className="hidden sm:inline">
            {getVerificationTypeLabel(user.verification_type || '')}
          </span>
        </div>
      )}

      {/* 신뢰도 점수 */}
      {user.trust_score && (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-tertiary text-primary rounded-full text-xs">
          ⭐ <span className="font-medium">{user.trust_score}</span>
        </div>
      )}
    </div>
  )
}

// Certified User 프로필 카드 컴포넌트
export function CertifiedUserCard({
  expert,
  matchScore,
  matchReason,
  onSelect,
  onViewProfile
}: {
  expert: any
  matchScore?: number
  matchReason?: string
  onSelect?: () => void
  onViewProfile?: () => void
}) {
  return (
    <div className="bg-primary rounded-lg p-6 border border-light shadow-md hover:shadow-lg transition-shadow">
      {/* 매칭 점수 */}
      {matchScore && (
        <div className="flex justify-between items-center mb-4">
          <div className="bg-trust text-white px-3 py-1 rounded-full text-sm font-medium">
            매칭도 {matchScore}%
          </div>
          <div className="text-xs text-tertiary">
            {matchScore >= 90 ? '완벽' : matchScore >= 70 ? '높음' : '보통'}
          </div>
        </div>
      )}

      {/* 프로필 */}
      <div className="text-center mb-4">
        <div className="w-20 h-20 mx-auto mb-3 bg-secondary rounded-full flex items-center justify-center text-2xl">
          👤
        </div>
        <h3 className="font-semibold text-primary">{expert.name}</h3>
      </div>

      {/* 신뢰도 정보 */}
      <div className="flex justify-center mb-4">
        <TrustBadge user={expert} variant="compact" />
      </div>

      {/* 매칭 이유 */}
      {matchReason && (
        <div className="bg-secondary rounded-lg p-3 mb-4">
          <p className="text-sm text-secondary">{matchReason}</p>
        </div>
      )}

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div>
          <div className="text-lg font-bold text-primary-blue">{expert.answer_count || 0}</div>
          <div className="text-xs text-tertiary">답변</div>
        </div>
        <div>
          <div className="text-lg font-bold text-trust">{expert.acceptance_rate || 0}%</div>
          <div className="text-xs text-tertiary">채택률</div>
        </div>
        <div>
          <div className="text-lg font-bold text-warning-500">{expert.avg_response_time || 0}h</div>
          <div className="text-xs text-tertiary">응답</div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        {onSelect && (
          <button
            onClick={onSelect}
            className="flex-1 bg-primary-blue hover:bg-primary-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
          >
            선택
          </button>
        )}
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="flex-1 bg-trust hover:bg-secondary-600 text-white text-sm py-2 px-4 rounded-lg transition-colors"
          >
            프로필
          </button>
        )}
      </div>
    </div>
  )
}
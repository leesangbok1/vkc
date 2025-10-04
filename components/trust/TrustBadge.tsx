'use client'

import { cn } from '@/lib/utils'

interface TrustBadgeProps {
  user: {
    residence_years?: number
    visa_type?: string
    company?: string
    trust_score?: number
    verification_type?: 'student' | 'worker' | 'resident' | 'business'
    is_verified?: boolean
    specialties?: string[]
  }
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export default function TrustBadge({
  user,
  variant = 'default',
  className
}: TrustBadgeProps) {
  const getVerificationIcon = (type?: string) => {
    switch (type) {
      case 'student': return '🎓'
      case 'worker': return '💼'
      case 'resident': return '🏠'
      case 'business': return '🏢'
      default: return '✓'
    }
  }

  const getVerificationLabel = (type?: string) => {
    switch (type) {
      case 'student': return '학생 인증'
      case 'worker': return '재직 인증'
      case 'resident': return '거주 인증'
      case 'business': return '사업자 인증'
      default: return '인증됨'
    }
  }

  const getTrustLevel = (score: number) => {
    if (score >= 800) return { level: '전문가', color: 'bg-expert text-white', icon: '👑' }
    if (score >= 600) return { level: '신뢰', color: 'bg-trust text-white', icon: '⭐' }
    if (score >= 400) return { level: '활성', color: 'bg-primary-green text-white', icon: '🌿' }
    if (score >= 200) return { level: '일반', color: 'bg-gray-200 text-gray-700', icon: '🌱' }
    return { level: '새싹', color: 'bg-gray-100 text-gray-600', icon: '🌰' }
  }

  if (variant === 'compact') {
    return (
      <div className={cn('trust-badge trust-badge-compact', className)}>
        🇰🇷 {user.residence_years || 0}년차
        {user.is_verified && (
          <span className="text-trust ml-1">✓</span>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    const trustInfo = getTrustLevel(user.trust_score || 0)

    return (
      <div className={cn('bg-white rounded-xl p-4 border border-gray-200 shadow-sm', className)}>
        {/* 레벨 표시 */}
        <div className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3', trustInfo.color)}>
          <span>{trustInfo.icon}</span>
          <span>{trustInfo.level}</span>
        </div>

        {/* 거주 정보 */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇰🇷</span>
            <span className="font-medium text-gray-900">
              한국 {user.residence_years || 0}년차
            </span>
          </div>

          {user.visa_type && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📄</span>
              <span>{user.visa_type}</span>
              {user.company && <span className="text-gray-400">• {user.company}</span>}
            </div>
          )}
        </div>

        {/* 인증 정보 */}
        {user.is_verified && (
          <div className="trust-badge trust-badge-verified mb-3">
            <span>{getVerificationIcon(user.verification_type)}</span>
            <span>{getVerificationLabel(user.verification_type)}</span>
          </div>
        )}

        {/* 신뢰도 점수 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">신뢰도</span>
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg">{user.trust_score || 0}</span>
            <span className="text-sm text-gray-500">점</span>
          </div>
        </div>

        {/* 전문 분야 */}
        {user.specialties && user.specialties.length > 0 && (
          <div>
            <span className="text-sm text-gray-600 block mb-2">전문 분야</span>
            <div className="flex flex-wrap gap-1">
              {user.specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  #{specialty}
                </span>
              ))}
              {user.specialties.length > 3 && (
                <span className="text-xs text-gray-500">+{user.specialties.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 거주년차 */}
      <div className="trust-badge">
        🇰🇷 {user.residence_years || 0}년차
      </div>

      {/* 인증 상태 */}
      {user.is_verified && (
        <div className="trust-badge trust-badge-verified">
          {getVerificationIcon(user.verification_type)}
          <span className="hidden sm:inline ml-1">
            {getVerificationLabel(user.verification_type)}
          </span>
        </div>
      )}

      {/* 신뢰도 점수 */}
      {user.trust_score && (
        <div className="trust-badge">
          ⭐ {user.trust_score}
        </div>
      )}
    </div>
  )
}

// 전문가 카드 컴포넌트
export function ExpertCard({
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
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* 매칭 점수 */}
      {matchScore && (
        <div className="flex justify-between items-center mb-4">
          <div className="bg-trust text-white px-3 py-1 rounded-full text-sm font-medium">
            매칭도 {matchScore}%
          </div>
          <div className="text-xs text-gray-500">
            {matchScore >= 90 ? '완벽' : matchScore >= 70 ? '높음' : '보통'}
          </div>
        </div>
      )}

      {/* 프로필 */}
      <div className="text-center mb-4">
        <div className="w-20 h-20 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
          👤
        </div>
        <h3 className="font-semibold text-gray-900">{expert.name}</h3>
      </div>

      {/* 신뢰도 정보 */}
      <TrustBadge user={expert} variant="compact" className="justify-center mb-4" />

      {/* 매칭 이유 */}
      {matchReason && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700">{matchReason}</p>
        </div>
      )}

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div>
          <div className="text-lg font-bold text-primary-blue">{expert.answer_count || 0}</div>
          <div className="text-xs text-gray-500">답변</div>
        </div>
        <div>
          <div className="text-lg font-bold text-trust">{expert.acceptance_rate || 0}%</div>
          <div className="text-xs text-gray-500">채택률</div>
        </div>
        <div>
          <div className="text-lg font-bold text-expert">{expert.avg_response_time || 0}h</div>
          <div className="text-xs text-gray-500">응답</div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        {onSelect && (
          <button
            onClick={onSelect}
            className="flex-1 btn-primary-blue text-sm py-2"
          >
            선택
          </button>
        )}
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="flex-1 btn-primary-green text-sm py-2"
          >
            프로필
          </button>
        )}
      </div>
    </div>
  )
}
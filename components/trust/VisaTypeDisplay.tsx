'use client'

import { cn } from '@/lib/utils'

interface VisaTypeDisplayProps {
  visaType?: string
  yearsInKorea?: number
  company?: string
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export default function VisaTypeDisplay({
  visaType,
  yearsInKorea,
  company,
  variant = 'default',
  className
}: VisaTypeDisplayProps) {
  const getVisaTypeIcon = (type?: string) => {
    if (!type) return '📄'

    const visaTypeMap: Record<string, string> = {
      'D-2': '🎓', // 유학생
      'D-4': '📚', // 일반연수
      'D-10': '💼', // 구직
      'E-1': '👨‍🏫', // 교수
      'E-2': '👨‍🏫', // 회화지도
      'E-3': '🔬', // 연구
      'E-4': '🏛️', // 기술지도
      'E-5': '💼', // 전문직업
      'E-6': '🎭', // 예술흥행
      'E-7': '💼', // 특정활동
      'E-9': '🏭', // 비전문취업
      'E-10': '🚢', // 선원취업
      'F-1': '👥', // 방문동거
      'F-2': '🏠', // 거주
      'F-3': '👨‍👩‍👧‍👦', // 동반
      'F-4': '🇰🇷', // 재외동포
      'F-5': '🏡', // 영주
      'F-6': '💍', // 결혼이민
    }

    return visaTypeMap[type.toUpperCase()] || '📄'
  }

  const getVisaTypeDescription = (type?: string) => {
    if (!type) return '비자 정보 없음'

    const visaDescMap: Record<string, string> = {
      'D-2': '유학생',
      'D-4': '일반연수생',
      'D-10': '구직자',
      'E-1': '교수',
      'E-2': '회화지도',
      'E-3': '연구원',
      'E-4': '기술지도',
      'E-5': '전문직',
      'E-6': '예술흥행',
      'E-7': '특정활동',
      'E-9': '비전문취업',
      'E-10': '선원취업',
      'F-1': '방문동거',
      'F-2': '거주',
      'F-3': '동반',
      'F-4': '재외동포',
      'F-5': '영주권',
      'F-6': '결혼이민',
    }

    return visaDescMap[type.toUpperCase()] || type
  }

  const getExperienceLevel = (years?: number) => {
    if (!years || years === 0) return { label: '신규', color: 'bg-gray-100 text-gray-600', icon: '🌱' }
    if (years >= 10) return { label: '베테랑', color: 'bg-warning-100 text-warning-700', icon: '👑' }
    if (years >= 5) return { label: '숙련자', color: 'bg-success-100 text-success-700', icon: '⭐' }
    if (years >= 2) return { label: '경험자', color: 'bg-primary-100 text-primary-700', icon: '📈' }
    return { label: '초보자', color: 'bg-gray-100 text-gray-600', icon: '🌿' }
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <span className="flex items-center gap-1">
          <span>🇰🇷</span>
          <span className="font-medium">{yearsInKorea || 0}년차</span>
        </span>
        {visaType && (
          <span className="flex items-center gap-1">
            <span>{getVisaTypeIcon(visaType)}</span>
            <span className="text-gray-600">{visaType}</span>
          </span>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    const expLevel = getExperienceLevel(yearsInKorea)

    return (
      <div className={cn('bg-white rounded-lg p-4 border border-gray-200', className)}>
        {/* 거주 경험 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇰🇷</span>
            <div>
              <div className="font-semibold text-gray-900">
                한국 거주 {yearsInKorea || 0}년
              </div>
              <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', expLevel.color)}>
                <span>{expLevel.icon}</span>
                <span>{expLevel.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 비자 정보 */}
        {visaType && (
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-lg">
                {getVisaTypeIcon(visaType)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{visaType}</div>
                <div className="text-sm text-gray-600">{getVisaTypeDescription(visaType)}</div>
                {company && (
                  <div className="text-xs text-gray-500 mt-1">
                    <span>🏢</span> {company}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* 거주년차 */}
      <div className="flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
        <span>🇰🇷</span>
        <span>{yearsInKorea || 0}년차</span>
      </div>

      {/* 비자 타입 */}
      {visaType && (
        <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
          <span>{getVisaTypeIcon(visaType)}</span>
          <span>{visaType}</span>
        </div>
      )}

      {/* 회사 정보 */}
      {company && (
        <div className="text-sm text-gray-500">
          <span>🏢</span> {company}
        </div>
      )}
    </div>
  )
}

// 비자 통계 컴포넌트
export function VisaStatsDisplay({
  stats,
  className
}: {
  stats: {
    totalUsers: number
    byVisaType: Record<string, number>
    averageYears: number
  }
  className?: string
}) {
  const topVisaTypes = Object.entries(stats.byVisaType)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  return (
    <div className={cn('bg-white rounded-lg p-4 border border-gray-200', className)}>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>📊</span>
        <span>비자 현황</span>
      </h3>

      {/* 전체 통계 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600">총 회원</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success-600">{stats.averageYears.toFixed(1)}년</div>
          <div className="text-sm text-gray-600">평균 거주</div>
        </div>
      </div>

      {/* 비자 타입별 분포 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">비자 타입별 분포</div>
        {topVisaTypes.map(([visaType, count]) => {
          const percentage = (count / stats.totalUsers * 100).toFixed(1)
          return (
            <div key={visaType} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <VisaTypeDisplay visaType={visaType} variant="compact" className="text-xs" />
              </div>
              <div className="text-sm text-gray-600">
                {count}명 ({percentage}%)
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
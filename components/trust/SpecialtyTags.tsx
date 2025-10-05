'use client'

import { cn } from '@/lib/utils'

interface SpecialtyTagsProps {
  specialties?: string[]
  maxDisplay?: number
  variant?: 'default' | 'compact' | 'colorful'
  className?: string
  onTagClick?: (specialty: string) => void
}

export default function SpecialtyTags({
  specialties = [],
  maxDisplay = 3,
  variant = 'default',
  onTagClick,
  className
}: SpecialtyTagsProps) {
  if (!specialties || specialties.length === 0) {
    return null
  }

  const getSpecialtyColor = (specialty: string) => {
    const specialtyColors: Record<string, { bg: string; text: string; icon: string }> = {
      // 비자 관련
      '비자': { bg: 'bg-primary-100', text: 'text-primary-700', icon: '🛂' },
      '영주권': { bg: 'bg-success-100', text: 'text-success-700', icon: '🏡' },
      '귀화': { bg: 'bg-warning-100', text: 'text-warning-700', icon: '🇰🇷' },
      '입국': { bg: 'bg-primary-100', text: 'text-primary-700', icon: '✈️' },

      // 취업 관련
      '취업': { bg: 'bg-error-100', text: 'text-error-700', icon: '💼' },
      '면접': { bg: 'bg-error-100', text: 'text-error-700', icon: '🤝' },
      '이력서': { bg: 'bg-error-100', text: 'text-error-700', icon: '📄' },
      '회사': { bg: 'bg-error-100', text: 'text-error-700', icon: '🏢' },
      '연봉': { bg: 'bg-warning-100', text: 'text-warning-700', icon: '💰' },

      // 주거 관련
      '주거': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🏠' },
      '전세': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🏘️' },
      '월세': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🏠' },
      '계약': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '📝' },

      // 의료 관련
      '의료': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🏥' },
      '건강보험': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '💊' },
      '병원': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🩺' },

      // 생활 관련
      '생활': { bg: 'bg-green-100', text: 'text-green-700', icon: '🍜' },
      '문화': { bg: 'bg-green-100', text: 'text-green-700', icon: '🎭' },
      '언어': { bg: 'bg-green-100', text: 'text-green-700', icon: '🗣️' },
      '교통': { bg: 'bg-green-100', text: 'text-green-700', icon: '🚇' },
      '은행': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🏦' },
      '통신': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '📱' },

      // 교육 관련
      '교육': { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '📚' },
      '대학': { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '🎓' },
      '한국어': { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '🇰🇷' },

      // 법률/제도
      '법률': { bg: 'bg-gray-100', text: 'text-gray-700', icon: '⚖️' },
      '세금': { bg: 'bg-gray-100', text: 'text-gray-700', icon: '💸' },
      '제도': { bg: 'bg-gray-100', text: 'text-gray-700', icon: '🏛️' },
    }

    // 부분 매칭 검색
    for (const [key, value] of Object.entries(specialtyColors)) {
      if (specialty.includes(key) || key.includes(specialty)) {
        return value
      }
    }

    // 기본 색상
    return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '🏷️' }
  }

  const displayedSpecialties = specialties.slice(0, maxDisplay)
  const remainingCount = specialties.length - maxDisplay

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-1', className)}>
        {displayedSpecialties.map((specialty, index) => (
          <span
            key={index}
            className={cn(
              'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
              'bg-gray-100 text-gray-700',
              onTagClick && 'cursor-pointer hover:bg-gray-200 transition-colors'
            )}
            onClick={() => onTagClick?.(specialty)}
          >
            #{specialty}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-500">
            +{remainingCount}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'colorful') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {displayedSpecialties.map((specialty, index) => {
          const colorInfo = getSpecialtyColor(specialty)
          return (
            <span
              key={index}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border',
                colorInfo.bg,
                colorInfo.text,
                'border-current border-opacity-30',
                onTagClick && 'cursor-pointer hover:scale-105 transition-transform'
              )}
              onClick={() => onTagClick?.(specialty)}
            >
              <span>{colorInfo.icon}</span>
              <span>#{specialty}</span>
            </span>
          )
        })}
        {remainingCount > 0 && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500 border border-gray-300">
            <span>➕</span>
            <span>외 {remainingCount}개</span>
          </span>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayedSpecialties.map((specialty, index) => {
        const colorInfo = getSpecialtyColor(specialty)
        return (
          <span
            key={index}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium',
              colorInfo.bg,
              colorInfo.text,
              onTagClick && 'cursor-pointer hover:opacity-80 transition-opacity'
            )}
            onClick={() => onTagClick?.(specialty)}
          >
            <span className="text-xs">{colorInfo.icon}</span>
            <span>#{specialty}</span>
          </span>
        )
      })}
      {remainingCount > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-500">
          <span className="text-xs">📝</span>
          <span>+{remainingCount}</span>
        </span>
      )}
    </div>
  )
}

// 전문분야 통계 컴포넌트
export function SpecialtyStatsDisplay({
  stats,
  onSpecialtyClick,
  className
}: {
  stats: Record<string, number>
  onSpecialtyClick?: (specialty: string) => void
  className?: string
}) {
  const sortedStats = Object.entries(stats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)

  return (
    <div className={cn('bg-white rounded-lg p-4 border border-gray-200', className)}>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>🏷️</span>
        <span>인기 전문분야</span>
      </h3>

      <div className="space-y-3">
        {sortedStats.map(([specialty, count], index) => {
          const getSpecialtyColor = (specialty: string) => {
            // 간단한 색상 배정 로직
            const colors = [
              'bg-primary-500',
              'bg-success-500',
              'bg-warning-500',
              'bg-error-500',
              'bg-purple-500',
              'bg-blue-500',
              'bg-green-500',
              'bg-yellow-500',
              'bg-indigo-500',
              'bg-gray-500'
            ]
            return colors[index % colors.length]
          }

          const percentage = Math.max(1, (count / Math.max(...Object.values(stats))) * 100)

          return (
            <div
              key={specialty}
              className={cn(
                'group',
                onSpecialtyClick && 'cursor-pointer'
              )}
              onClick={() => onSpecialtyClick?.(specialty)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                  #{specialty}
                </span>
                <span className="text-sm text-gray-500">
                  {count}명
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    getSpecialtyColor(specialty),
                    'group-hover:opacity-80'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 전문분야 입력 컴포넌트
export function SpecialtyInput({
  value = [],
  onChange,
  maxTags = 5,
  placeholder = "전문분야를 입력하세요",
  suggestions = [],
  className
}: {
  value?: string[]
  onChange?: (specialties: string[]) => void
  maxTags?: number
  placeholder?: string
  suggestions?: string[]
  className?: string
}) {
  const handleAddTag = (tag: string) => {
    if (tag.trim() && !value.includes(tag.trim()) && value.length < maxTags) {
      onChange?.([...value, tag.trim()])
    }
  }

  const handleRemoveTag = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const input = e.currentTarget
      handleAddTag(input.value)
      input.value = ''
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* 현재 태그들 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((specialty, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
            >
              <span>#{specialty}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                className="ml-1 hover:text-primary-900 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 입력 필드 */}
      <div className="relative">
        <input
          type="text"
          placeholder={value.length >= maxTags ? `최대 ${maxTags}개까지 가능` : placeholder}
          disabled={value.length >= maxTags}
          onKeyDown={handleKeyPress}
          className={cn(
            'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            value.length >= maxTags && 'bg-gray-50 cursor-not-allowed'
          )}
        />
        <div className="text-xs text-gray-500 mt-1">
          Enter나 쉼표로 구분하세요 ({value.length}/{maxTags})
        </div>
      </div>

      {/* 추천 태그 */}
      {suggestions.length > 0 && value.length < maxTags && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">추천 전문분야</div>
          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter(suggestion => !value.includes(suggestion))
              .slice(0, 8)
              .map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleAddTag(suggestion)}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
                >
                  #{suggestion}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
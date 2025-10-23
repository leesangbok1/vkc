'use client'

import { useState, useEffect, useMemo } from 'react'
import BookmarkButton from './BookmarkButton'
import ShareButton from './ShareButton'

const HELPFUL_STORAGE_PREFIX = 'vk_helpful'

const getHelpfulStorageKey = (targetType: ActionBarProps['targetType'], targetId: string) =>
  `${HELPFUL_STORAGE_PREFIX}:${targetType}:${targetId}`

const readHelpfulStorage = (
  targetType: ActionBarProps['targetType'],
  targetId: string
): { count?: number; isHelpful?: boolean } | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(getHelpfulStorageKey(targetType, targetId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const payload: { count?: number; isHelpful?: boolean } = {}
    if (typeof parsed.count === 'number') payload.count = parsed.count
    if (typeof parsed.isHelpful === 'boolean') payload.isHelpful = parsed.isHelpful
    return payload
  } catch {
    return null
  }
}

const writeHelpfulStorage = (
  targetType: ActionBarProps['targetType'],
  targetId: string,
  state: { count: number; isHelpful: boolean }
) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      getHelpfulStorageKey(targetType, targetId),
      JSON.stringify({
        count: Math.max(0, state.count),
        isHelpful: state.isHelpful,
        updatedAt: Date.now(),
      })
    )
  } catch {
    // ignore storage errors
  }
}

const shouldPersistOffline = (error: unknown) => {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('service') ||
    message.includes('supabase') ||
    message.includes('toggle helpful')
  )
}

interface ActionBarProps {
  // 대상 정보
  targetId: string
  targetType: 'question' | 'post' | 'answer'
  title?: string
  content?: string
  url?: string

  // 도움됨 관련
  helpfulCount?: number
  isHelpful?: boolean
  onHelpfulClick?: () => Promise<{ helpfulCount?: number; isHelpful?: boolean } | void> | void

  // 레이아웃
  compact?: boolean
  showAcceptButton?: boolean
  onAcceptClick?: () => void
  isAccepted?: boolean

  // 로그인 체크
  requireLogin?: boolean
  onLoginRequired?: () => void
}

export default function ActionBar({
  targetId,
  targetType,
  title = '',
  content = '',
  url,
  helpfulCount,
  isHelpful = false,
  onHelpfulClick,
  compact = false,
  showAcceptButton = false,
  onAcceptClick,
  isAccepted = false,
  requireLogin = false,
  onLoginRequired
}: ActionBarProps) {
  const [localHelpfulCount, setLocalHelpfulCount] = useState<number>(helpfulCount ?? 0)
  const [localIsActive, setLocalIsActive] = useState<boolean>(isHelpful)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (targetType === 'answer') return
    if (typeof window === 'undefined') return
    if (typeof helpfulCount === 'number' || typeof isHelpful === 'boolean') return
    const stored = readHelpfulStorage(targetType, targetId)
    if (!stored) return
    if (typeof stored.count === 'number') {
      setLocalHelpfulCount(stored.count)
    }
    if (typeof stored.isHelpful === 'boolean') {
      setLocalIsActive(stored.isHelpful)
    }
  }, [targetId, targetType, helpfulCount, isHelpful])

  // 외부 props 변화에 맞춰 내부 상태 동기화
  useEffect(() => {
    if (typeof helpfulCount === 'number') {
      setLocalHelpfulCount(helpfulCount)
      return
    }

    if (targetType !== 'answer') {
      const stored = readHelpfulStorage(targetType, targetId)
      if (stored && typeof stored.count === 'number') {
        setLocalHelpfulCount(stored.count)
      }
    }
  }, [helpfulCount, targetId, targetType])

  useEffect(() => {
    if (typeof isHelpful === 'boolean') {
      setLocalIsActive(isHelpful)
      return
    }

    if (targetType !== 'answer') {
      const stored = readHelpfulStorage(targetType, targetId)
      if (stored && typeof stored.isHelpful === 'boolean') {
        setLocalIsActive(stored.isHelpful)
      }
    }
  }, [isHelpful, targetId, targetType])

  const defaultHelpfulRequest = useMemo(() => {
    const buildRequest = (apiPath: string) => async () => {
      const response = await fetch(apiPath, {
        method: 'POST',
        cache: 'no-store',
        credentials: 'include',
      })
      if (response.status === 401) {
        throw new Error('로그인이 필요한 기능입니다.')
      }
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        const message = data?.error || '도움됨 처리 중 오류가 발생했습니다.'
        throw new Error(message)
      }
      return {
        helpfulCount: typeof data?.helpfulCount === 'number' ? data.helpfulCount : undefined,
        isHelpful: typeof data?.isHelpful === 'boolean' ? data.isHelpful : undefined,
      }
    }

    if (targetType === 'question') {
      return buildRequest(`/api/questions/${targetId}/helpful`)
    }
    if (targetType === 'post') {
      return buildRequest(`/api/posts/${targetId}/helpful`)
    }
    if (targetType === 'answer') {
      return async () => {
        const response = await fetch(`/api/answers/${targetId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ vote_type: 'helpful' }),
        })
        if (response.status === 401) {
          throw new Error('로그인이 필요한 기능입니다.')
        }
        const data = await response.json().catch(() => null)
        if (!response.ok) {
          const message = data?.error || '도움됨 처리 중 오류가 발생했습니다.'
          throw new Error(message)
        }
        const helpfulCount =
          typeof data?.data?.helpful_count === 'number'
            ? data.data.helpful_count
            : undefined
        const voteType = data?.data?.vote_type
        return {
          helpfulCount,
          isHelpful: voteType === 'helpful',
        }
      }
    }
    return null
  }, [targetId, targetType])

  const handleHelpfulClick = async () => {
    if (pending) return

    if (requireLogin && onLoginRequired) {
      onLoginRequired()
      return
    }

    const handler = onHelpfulClick ?? defaultHelpfulRequest

    if (!handler) {
      return
    }

    const previousActive = localIsActive
    const previousCount = localHelpfulCount

    const optimisticNext = !previousActive
    const optimisticCount = Math.max(0, previousCount + (optimisticNext ? 1 : -1))
    setLocalIsActive(optimisticNext)
    setLocalHelpfulCount(optimisticCount)
    setPending(true)

    let finalIsHelpful = optimisticNext
    let finalCount = optimisticCount

    try {
      const result = await handler()
      if (result && typeof result === 'object') {
        if (typeof result.isHelpful === 'boolean') {
          finalIsHelpful = result.isHelpful
        }
        if (typeof result.helpfulCount === 'number') {
          finalCount = Math.max(0, result.helpfulCount)
        }
      }
    } catch (error) {
      if (!shouldPersistOffline(error)) {
        setLocalIsActive(previousActive)
        setLocalHelpfulCount(previousCount)
        if (error instanceof Error && typeof window !== 'undefined') {
          window.alert(error.message)
        }
        setPending(false)
        return
      }
    }

    setLocalIsActive(finalIsHelpful)
    setLocalHelpfulCount(finalCount)
    if (targetType !== 'answer') {
      writeHelpfulStorage(targetType, targetId, { count: finalCount, isHelpful: finalIsHelpful })
    }

    setPending(false)
  }

  return (
    <div className="action-bar" style={{
      display: 'flex',
      alignItems: 'center',
      gap: compact ? '0.5rem' : '0.75rem',
      padding: compact ? '0.5rem 0' : '0.75rem 0'
    }}>
      {/* 도움됨 버튼 */}
      <button
        onClick={handleHelpfulClick}
        className={`action-btn ${localIsActive ? 'active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: compact ? '0.25rem 0.5rem' : '0.5rem 0.75rem',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: localIsActive ? '#f0fdf4' : 'white',
          color: localIsActive ? '#16a34a' : '#6b7280',
          cursor: pending ? 'default' : 'pointer',
          fontSize: compact ? '0.875rem' : '0.95rem',
          fontWeight: localIsActive ? 600 : 400,
          transition: 'all 0.2s',
          opacity: pending ? 0.6 : 1,
        }}
        disabled={pending}
      >
        <span>{localIsActive ? '✅' : '👍'}</span>
        <span>도움됨</span>
        {localHelpfulCount > 0 && <span>{localHelpfulCount}</span>}
      </button>

      {/* 북마크 버튼 */}
      <BookmarkButton
        targetId={targetId}
        type={targetType}
        title={title}
        content={content}
        compact={compact}
      />

      {/* 공유 버튼 */}
      <ShareButton
        url={url || `/${targetType}s/${targetId}`}
        title={title}
        compact={compact}
      />

      {/* 채택하기 버튼 (옵션) */}
      {showAcceptButton && !isAccepted && (
        <button
          onClick={onAcceptClick}
          className="action-btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: compact ? '0.25rem 0.5rem' : '0.5rem 0.75rem',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            cursor: 'pointer',
            fontSize: compact ? '0.875rem' : '0.95rem',
            fontWeight: 600,
            marginLeft: 'auto',
            transition: 'all 0.2s',
          }}
        >
          <span>✅</span>
          <span>채택하기</span>
        </button>
      )}
    </div>
  )
}

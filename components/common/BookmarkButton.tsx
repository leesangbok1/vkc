'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  toggleBookmark,
  isBookmarked,
  type Bookmark
} from '@/lib/utils/bookmark-manager'

interface BookmarkButtonProps {
  targetId: string
  type: 'question' | 'answer' | 'post'
  title: string
  content: string
  compact?: boolean
}

export default function BookmarkButton({ targetId, type, title, content, compact = false }: BookmarkButtonProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [bookmarked, setBookmarked] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [, setBookmarkRecord] = useState<Bookmark | null>(null)
  const contentPreview = useMemo(() => content.trim().slice(0, 200), [content])
  const sanitizedTitle = useMemo(() => title.trim().slice(0, 200), [title])

  useEffect(() => {
    let ignore = false

    if (isLoggedIn) {
      isBookmarked(targetId, type).then(({ isBookmarked, bookmark }) => {
        if (ignore) return
        setBookmarked(isBookmarked)
        setBookmarkRecord(bookmark)
      })
    } else {
      setBookmarked(false)
      setBookmarkRecord(null)
    }

    return () => {
      ignore = true
    }
  }, [isLoggedIn, targetId, type])

  const handleToggle = async () => {
    if (!isLoggedIn) {
      router.push('/auth/login')
      return
    }

    setIsProcessing(true)

    try {
      const result = await toggleBookmark({
        type,
        targetId,
        title: sanitizedTitle,
        content: contentPreview
      })

      if (!result.success && !result.bookmark) {
        alert('북마크 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

      setBookmarked(result.isBookmarked)
      setBookmarkRecord(result.bookmark ?? null)
    } catch (error) {
      console.error('Bookmark toggle failed:', error)
      alert('북마크 처리 중 오류가 발생했습니다')
    } finally {
      setIsProcessing(false)
    }
  }

  const stateLabel = isProcessing ? '처리 중...' : bookmarked ? '저장됨' : '북마크'

  if (compact) {
    const buttonClassName = [
      'action-btn',
      'action-btn--bookmark',
      'action-btn--compact',
      bookmarked ? 'is-active' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        type="button"
        className={buttonClassName}
        onClick={handleToggle}
        disabled={isProcessing}
        aria-pressed={bookmarked}
        data-loading={isProcessing ? 'true' : undefined}
      >
        <span>{bookmarked ? '⭐' : '🔖'}</span>
        <span>{stateLabel}</span>
      </button>
    )
  }

  const defaultButtonClassName = [
    'bookmark-btn',
    bookmarked ? 'bookmark-btn--active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={defaultButtonClassName}
      onClick={handleToggle}
      disabled={isProcessing}
      aria-pressed={bookmarked}
      data-loading={isProcessing ? 'true' : undefined}
    >
      <span aria-hidden>{bookmarked ? '⭐' : '🔖'}</span>
      <span>{stateLabel}</span>
    </button>
  )
}

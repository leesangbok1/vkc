'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { toggleBookmark, isBookmarked } from '@/lib/utils/bookmark-manager'

interface BookmarkButtonProps {
  targetId: string
  type: 'question' | 'answer'
  title: string
  content: string
  compact?: boolean
}

export default function BookmarkButton({ targetId, type, title, content, compact = false }: BookmarkButtonProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [bookmarked, setBookmarked] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      setBookmarked(isBookmarked(targetId, type))
    }
  }, [isLoggedIn, targetId, type])

  const handleToggle = async () => {
    if (!isLoggedIn) {
      router.push('/auth/login')
      return
    }

    setIsProcessing(true)

    try {
      const result = toggleBookmark({
        type,
        targetId,
        title,
        content: content.substring(0, 200) // Store preview only
      })

      if (result.success) {
        setBookmarked(result.isBookmarked)
      }
    } catch (error) {
      console.error('Bookmark toggle failed:', error)
      alert('북마크 처리 중 오류가 발생했습니다')
    } finally {
      setIsProcessing(false)
    }
  }

  if (compact) {
    return (
      <button
        className={`action-btn ${bookmarked ? 'active' : ''}`}
        onClick={handleToggle}
        disabled={isProcessing}
      >
        <span>{bookmarked ? '🔖' : '🔖'}</span>
        <span>북마크</span>
      </button>
    )
  }

  return (
    <button
      className={`btn ${bookmarked ? 'btn-primary' : 'btn-secondary'}`}
      onClick={handleToggle}
      disabled={isProcessing}
    >
      {isProcessing ? '처리 중...' : bookmarked ? '🔖 저장됨' : '🔖 북마크'}
    </button>
  )
}

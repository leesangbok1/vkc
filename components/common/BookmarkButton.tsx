'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { toggleBookmark, isBookmarked } from '@/lib/utils/bookmark-manager'

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

        // 시각적 피드백: 토스트 알림
        if (result.isBookmarked) {
          alert('✅ 북마크에 저장되었습니다')
        } else {
          alert('🗑️ 북마크에서 제거되었습니다')
        }
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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.5rem',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: bookmarked ? '#fef3c7' : 'white',
          color: bookmarked ? '#d97706' : '#6b7280',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: bookmarked ? 600 : 400,
          transition: 'all 0.2s',
          opacity: isProcessing ? 0.6 : 1
        }}
      >
        <span>{bookmarked ? '⭐' : '🔖'}</span>
        <span>{bookmarked ? '저장됨' : '북마크'}</span>
      </button>
    )
  }

  return (
    <button
      className={`btn ${bookmarked ? 'btn-primary' : 'btn-secondary'}`}
      onClick={handleToggle}
      disabled={isProcessing}
      style={{
        background: bookmarked ? '#fef3c7' : 'white',
        color: bookmarked ? '#d97706' : '#6b7280',
        borderColor: bookmarked ? '#f59e0b' : '#e5e7eb',
        fontWeight: bookmarked ? 600 : 400,
        transition: 'all 0.2s'
      }}
    >
      {isProcessing ? '처리 중...' : bookmarked ? '⭐ 저장됨' : '🔖 북마크'}
    </button>
  )
}

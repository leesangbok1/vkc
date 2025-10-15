'use client'

import { useState } from 'react'
import BookmarkButton from './BookmarkButton'
import ShareButton from './ShareButton'

interface ActionBarProps {
  // 대상 정보
  targetId: string
  targetType: 'question' | 'post' | 'answer'
  title?: string
  content?: string
  url?: string

  // 도움됨 관련
  initialHelpfulCount?: number
  isHelpful?: boolean
  onHelpfulClick?: () => void

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
  initialHelpfulCount = 0,
  isHelpful = false,
  onHelpfulClick,
  compact = false,
  showAcceptButton = false,
  onAcceptClick,
  isAccepted = false,
  requireLogin = false,
  onLoginRequired
}: ActionBarProps) {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount)
  const [isActive, setIsActive] = useState(isHelpful)

  const handleHelpfulClick = () => {
    if (requireLogin && onLoginRequired) {
      onLoginRequired()
      return
    }

    if (onHelpfulClick) {
      onHelpfulClick()
    }

    // Toggle helpful state
    setIsActive(!isActive)
    setHelpfulCount(prev => isActive ? prev - 1 : prev + 1)
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
        className={`action-btn ${isActive ? 'active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: compact ? '0.25rem 0.5rem' : '0.5rem 0.75rem',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: isActive ? '#f0fdf4' : 'white',
          color: isActive ? '#16a34a' : '#6b7280',
          cursor: 'pointer',
          fontSize: compact ? '0.875rem' : '0.95rem',
          fontWeight: isActive ? 600 : 400,
          transition: 'all 0.2s',
        }}
      >
        <span>{isActive ? '✅' : '👍'}</span>
        <span>도움됨</span>
        {helpfulCount > 0 && <span>{helpfulCount}</span>}
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

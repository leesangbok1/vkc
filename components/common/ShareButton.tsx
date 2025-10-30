'use client'

import { type MouseEvent } from 'react'
import { useShareModal } from '@/contexts/ShareModalContext'

interface ShareButtonProps {
  url: string
  title: string
  compact?: boolean
}

export default function ShareButton({ url, title, compact = false }: ShareButtonProps) {
  const { openShareModal } = useShareModal()

  const openModal = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    openShareModal({ url, title })
  }

  if (compact) {
    return (
      <button
        type="button"
        className="action-btn action-btn--share action-btn--compact"
        onClick={openModal}
        aria-label="게시글 공유"
      >
        <span>📤</span>
        <span>공유</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={openModal}
    >
      📤 공유
    </button>
  )
}

'use client'

import { useState } from 'react'

interface ShareButtonProps {
  url: string
  title: string
  compact?: boolean
}

export default function ShareButton({ url, title, compact = false }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${url}`
    : url

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShowModal(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('링크 복사에 실패했습니다')
    }
  }

  const shareOptions = [
    {
      name: 'KakaoTalk',
      icon: '💬',
      action: () => {
        alert('카카오톡 공유 기능은 곧 추가됩니다')
        setShowModal(false)
      }
    },
    {
      name: 'Facebook',
      icon: '📘',
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
          '_blank',
          'width=600,height=400'
        )
        setShowModal(false)
      }
    },
    {
      name: 'Twitter',
      icon: '🐦',
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
          '_blank',
          'width=600,height=400'
        )
        setShowModal(false)
      }
    }
  ]

  if (compact) {
    return (
      <>
        <button
          className="action-btn"
          onClick={() => setShowModal(true)}
        >
          <span>📤</span>
          <span>공유</span>
        </button>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">공유하기</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="share-url-container">
                  <input
                    type="text"
                    value={fullUrl}
                    readOnly
                    className="form-input share-url-input"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="btn btn-primary share-copy-btn"
                  >
                    {copied ? '✅ 복사됨' : '📋 복사'}
                  </button>
                </div>

                <div className="share-options">
                  {shareOptions.map((option) => (
                    <button
                      key={option.name}
                      onClick={option.action}
                      className="share-option-btn"
                    >
                      <span className="share-option-icon">{option.icon}</span>
                      <span className="share-option-name">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <button
      className="btn btn-secondary"
      onClick={() => setShowModal(true)}
    >
      📤 공유
    </button>
  )
}

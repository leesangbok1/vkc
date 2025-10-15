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

  const handleKakaoShare = () => {
    // 카카오톡 공유 - 웹 공유 API 사용 또는 URL 스키마
    const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=YOUR_APP_KEY&validation_action=share&validation_params={"link_ver":"4.0","template_object":{"object_type":"feed","content":{"title":"${encodeURIComponent(title)}","link":{"web_url":"${fullUrl}"}}}}`

    // 모바일에서는 카카오톡 앱으로, 웹에서는 공유 페이지로
    if (typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // 모바일: 카카오톡 앱 실행
      window.location.href = `kakaotalk://share?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
    } else {
      // 웹: 클립보드 복사 후 안내
      handleCopyLink()
      alert('링크가 복사되었습니다. 카카오톡에서 붙여넣기 해주세요.')
    }
    setShowModal(false)
  }

  const shareOptions = [
    {
      name: 'KakaoTalk',
      icon: '💬',
      action: handleKakaoShare
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: 'white',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 400,
            transition: 'all 0.2s'
          }}
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

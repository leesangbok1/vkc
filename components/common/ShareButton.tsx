'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import BaseModal from '../modals/BaseModal'

interface ShareButtonProps {
  url: string
  title: string
  compact?: boolean
}

export default function ShareButton({ url, title, compact = false }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${url}`
    : url

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      if (typeof window !== 'undefined') {
        if (closeTimerRef.current) {
          window.clearTimeout(closeTimerRef.current)
        }
        closeTimerRef.current = window.setTimeout(() => {
          setCopied(false)
          setShowModal(false)
          closeTimerRef.current = null
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('링크 복사에 실패했습니다')
    }
  }

  const handleKakaoShare = async () => {
    // 모바일에서는 카카오톡 앱 공유 시도
    if (typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        // Web Share API 사용 (최신 방식)
        if (navigator.share) {
          await navigator.share({
            title: title,
            url: fullUrl
          })
          setShowModal(false)
          return
        }
      } catch (error) {
        console.log('Web Share API failed, falling back to clipboard')
      }
    }

    // Web Share API가 없거나 실패한 경우: 클립보드 복사
    try {
      await navigator.clipboard.writeText(fullUrl)
      alert('💬 링크가 복사되었습니다!\n카카오톡에서 붙여넣기 해주세요.')
      setShowModal(false)
    } catch (error) {
      console.error('Copy failed:', error)
      alert('링크 복사에 실패했습니다')
    }
  }

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [])

  const openModal = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const triggerOpen = () => setShowModal(true)
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(triggerOpen)
    } else {
      triggerOpen()
    }
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
          type="button"
          className="action-btn"
          onClick={openModal}
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

        <BaseModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          width="500px"
          adaptiveMode={true}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              공유하기
            </h3>
          </div>

          {/* URL Copy Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              링크 주소
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={fullUrl}
                readOnly
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  background: '#f9fafb',
                  color: '#6b7280'
                }}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  background: copied ? '#10b981' : '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {copied ? '✅ 복사됨' : '📋 복사'}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              공유 방법 선택
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem'
            }}>
              {shareOptions.map((option) => (
                <button
                  type="button"
                  key={option.name}
                  onClick={option.action}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                    e.currentTarget.style.borderColor = '#3b82f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{option.icon}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </BaseModal>
      </>
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

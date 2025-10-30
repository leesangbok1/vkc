'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import BaseModal from '@/components/modals/BaseModal'

type ShareModalPayload = {
  url: string
  title: string
}

type ShareModalContextValue = {
  openShareModal: (payload: ShareModalPayload) => void
  closeShareModal: () => void
}

const ShareModalContext = createContext<ShareModalContextValue | undefined>(undefined)

function resolveFullUrl(payload: ShareModalPayload | null): string {
  if (!payload) return ''
  const raw = payload.url.trim()
  if (/^https?:\/\//i.test(raw)) {
    return raw
  }
  if (typeof window === 'undefined') {
    return raw
  }
  const normalized = raw.startsWith('/') ? raw : `/${raw}`
  return `${window.location.origin}${normalized}`
}

export function ShareModalProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<ShareModalPayload | null>(null)
  const [copied, setCopied] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (typeof window !== 'undefined' && closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const closeShareModal = useCallback(() => {
    clearTimer()
    setCopied(false)
    setPayload(null)
  }, [clearTimer])

  const openShareModal = useCallback(
    (next: ShareModalPayload) => {
      clearTimer()
      setCopied(false)
      setPayload(next)
    },
    [clearTimer]
  )

  const fullUrl = useMemo(() => resolveFullUrl(payload), [payload])

  const handleCopyLink = useCallback(async () => {
    if (!fullUrl) return
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      if (typeof window !== 'undefined') {
        clearTimer()
        closeTimerRef.current = window.setTimeout(() => {
          setCopied(false)
          closeShareModal()
          closeTimerRef.current = null
        }, 2000)
      }
    } catch (error) {
      console.error('[ShareModal] failed to copy link', error)
      alert('링크 복사에 실패했습니다')
    }
  }, [closeShareModal, clearTimer, fullUrl])

  const handleKakaoShare = useCallback(async () => {
    if (!fullUrl || !payload) return
    if (typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: payload.title,
            url: fullUrl,
          })
          closeShareModal()
          return
        }
      } catch (error) {
        console.log('[ShareModal] Web Share API failed, falling back to clipboard', error)
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl)
      alert('💬 링크가 복사되었습니다!\n카카오톡에서 붙여넣기 해주세요.')
      closeShareModal()
    } catch (error) {
      console.error('[ShareModal] Kakao fallback copy failed', error)
      alert('링크 복사에 실패했습니다')
    }
  }, [closeShareModal, fullUrl, payload])

  useEffect(() => clearTimer, [clearTimer])

  const contextValue = useMemo(
    () => ({
      openShareModal,
      closeShareModal,
    }),
    [openShareModal, closeShareModal]
  )

  const shareOptions = useMemo(
    () => [
      {
        name: 'KakaoTalk',
        icon: '💬',
        action: handleKakaoShare,
      },
      {
        name: 'Facebook',
        icon: '📘',
        action: () => {
          if (!fullUrl) return
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
            '_blank',
            'width=600,height=400'
          )
          closeShareModal()
        },
      },
      {
        name: 'Twitter',
        icon: '🐦',
        action: () => {
          if (!fullUrl || !payload) return
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(payload.title)}`,
            '_blank',
            'width=600,height=400'
          )
          closeShareModal()
        },
      },
    ],
    [closeShareModal, fullUrl, handleKakaoShare, payload]
  )

  return (
    <ShareModalContext.Provider value={contextValue}>
      {children}

      <BaseModal
        isOpen={!!payload}
        onClose={closeShareModal}
        width="500px"
        adaptiveMode
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
            공유하기
          </h3>
        </div>

        {/* URL Copy Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.5rem',
            }}
          >
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
                color: '#6b7280',
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
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✅ 복사됨' : '📋 복사'}
            </button>
          </div>
        </div>

        {/* Share Options */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.75rem',
            }}
          >
            공유 방법 선택
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
            }}
          >
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
                  transition: 'all 0.2s',
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
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                  {option.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </BaseModal>
    </ShareModalContext.Provider>
  )
}

export function useShareModal() {
  const context = useContext(ShareModalContext)
  if (!context) {
    throw new Error('useShareModal must be used within a ShareModalProvider')
  }
  return context
}

'use client'

import { useState, useEffect } from 'react'

interface EmailCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (email: string) => void
}

export default function EmailCollectionModal({ isOpen, onClose, onSubmit }: EmailCollectionModalProps) {
  const [email, setEmail] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      // 팝업 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setError('')
    setIsValid(validateEmail(value))
  }

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      setError('올바른 이메일 주소를 입력해주세요')
      return
    }
    onSubmit(email)
  }

  const handleSkip3Days = () => {
    const threeDaysLater = new Date()
    threeDaysLater.setDate(threeDaysLater.getDate() + 3)
    localStorage.setItem('vietkconnect_email_modal_skip_until', threeDaysLater.toISOString())
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: '#9ca3af',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* 아이콘 */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M3 8L10.89 13.26C11.57 13.72 12.43 13.72 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"/>
          </svg>
        </div>

        {/* 제목 */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#111827',
          textAlign: 'center',
          marginBottom: '0.5rem'
        }}>
          답변 알림을 받아보세요!
        </h2>

        {/* 설명 */}
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '1.5rem',
          lineHeight: 1.6
        }}>
          질문에 답변이 달리면 이메일로 알려드려요.<br />
          베트남인 커뮤니티의 소식도 함께 받아보실 수 있습니다.
        </p>

        {/* 이메일 입력 */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            placeholder="이메일 주소를 입력하세요"
            value={email}
            onChange={handleEmailChange}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontSize: '1rem',
              border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              if (!error) e.currentTarget.style.borderColor = '#3b82f6'
            }}
            onBlur={(e) => {
              if (!error) e.currentTarget.style.borderColor = '#e5e7eb'
            }}
          />
          {error && (
            <p style={{
              fontSize: '0.875rem',
              color: '#ef4444',
              marginTop: '0.5rem'
            }}>
              {error}
            </p>
          )}
        </div>

        {/* 버튼 그룹 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: isValid ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isValid ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (isValid) e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              if (isValid) e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            알림 받기
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
            <button
              onClick={handleSkip3Days}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af'
                e.currentTarget.style.color = '#374151'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.color = '#6b7280'
              }}
            >
              3일간 보지 않기
            </button>

            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af'
                e.currentTarget.style.color = '#374151'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.color = '#6b7280'
              }}
            >
              닫기
            </button>
          </div>
        </div>

        {/* 개인정보 안내 */}
        <p style={{
          fontSize: '0.75rem',
          color: '#9ca3af',
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          입력하신 이메일은 알림 발송 목적으로만 사용됩니다
        </p>
      </div>
    </div>
  )
}

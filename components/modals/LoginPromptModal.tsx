'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
  redirectTo?: string
}

export default function LoginPromptModal({
  isOpen,
  onClose,
  message = '이 기능은 로그인이 필요합니다',
  redirectTo = '/'
}: LoginPromptModalProps) {
  const router = useRouter()

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // 모달 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleLogin = () => {
    onClose()
    // redirectTo 파라미터와 함께 로그인 페이지로 이동
    const loginUrl = `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
    router.push(loginUrl)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
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
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'modalFadeIn 0.2s ease-out'
        }}
      >
        {/* 아이콘 */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '3rem',
            marginBottom: '1rem'
          }}
        >
          🔐
        </div>

        {/* 제목 */}
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '0.75rem',
            color: 'var(--foreground)'
          }}
        >
          로그인이 필요합니다
        </h2>

        {/* 메시지 */}
        <p
          style={{
            textAlign: 'center',
            color: 'var(--muted-foreground)',
            marginBottom: '2rem',
            fontSize: '0.95rem',
            lineHeight: '1.5'
          }}
        >
          {message}
        </p>

        {/* 버튼들 */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexDirection: 'column'
          }}
        >
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            로그인하기
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              background: 'white',
              color: 'var(--foreground)',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.color = 'var(--primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--foreground)'
            }}
          >
            둘러보기 계속하기
          </button>
        </div>

        {/* 안내 텍스트 */}
        <p
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--muted-foreground)'
          }}
        >
          VietKConnect에 가입하고<br />
          Certified User 답변을 받아보세요
        </p>
      </div>

      {/* 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

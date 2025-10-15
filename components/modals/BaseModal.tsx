'use client'

import { useEffect, useRef, useState } from 'react'

export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode

  // 모바일 지원
  adaptiveMode?: boolean      // 반응형 (Desktop 중앙 / Mobile bottom) - 기본값 true
  fullScreenOnMobile?: boolean // 모바일에서 전체 화면
  showBackButton?: boolean    // 모바일 뒤로가기 버튼

  // Event Modal 스타일 옵션
  width?: string              // default: '500px'
  maxWidth?: string           // default: '90vw'
  borderRadius?: string       // default: '20px'
  showDecorations?: boolean   // 장식 요소 (Event Modal 스타일)

  // 추가 옵션
  className?: string          // 추가 CSS 클래스
  showCloseButton?: boolean   // X 버튼 표시 (기본값 true)
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  adaptiveMode = true,
  fullScreenOnMobile = false,
  showBackButton = false,
  width = '500px',
  maxWidth = '90vw',
  borderRadius = '20px',
  showDecorations = false,
  className = '',
  showCloseButton = true
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  // 터치 제스처 상태
  const [dragStartY, setDragStartY] = useState(0)
  const [dragDistance, setDragDistance] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setViewportHeight(window.innerHeight)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Escape key 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Body scroll 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // 터치 제스처 핸들러 (모바일 스와이프로 닫기)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !adaptiveMode) return

    const modalElement = modalRef.current
    if (!modalElement) return

    // 모달 내부 스크롤이 최상단일 때만 드래그 시작
    const scrollTop = modalElement.scrollTop
    if (scrollTop === 0) {
      setDragStartY(e.touches[0].clientY)
      setIsDragging(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile || !adaptiveMode) return

    const currentY = e.touches[0].clientY
    const diff = currentY - dragStartY

    // 아래로만 드래그 가능
    if (diff > 0) {
      setDragDistance(diff)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging || !isMobile || !adaptiveMode) return

    // 150px 이상 드래그 시 모달 닫기
    if (dragDistance > 150) {
      onClose()
    }

    // 상태 초기화
    setDragDistance(0)
    setIsDragging(false)
  }

  if (!isOpen) return null

  // 스타일 결정
  const isBottomSheet = adaptiveMode && isMobile && !fullScreenOnMobile
  const isFullScreen = fullScreenOnMobile && isMobile

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: isBottomSheet ? 'flex-end' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'modalFadeIn 0.3s ease-out'
      }}
    >
      <div
        ref={modalRef}
        className={`base-modal ${isBottomSheet ? 'bottom-sheet' : ''} ${isFullScreen ? 'full-screen' : ''} ${className}`}
        style={{
          background: 'white',
          borderRadius: isBottomSheet ? '24px 24px 0 0' : isFullScreen ? '0' : borderRadius,
          width: isFullScreen ? '100vw' : isBottomSheet ? '100vw' : width,
          maxWidth: isFullScreen ? '100vw' : maxWidth,
          maxHeight: isFullScreen ? '100vh' : isBottomSheet ? '85vh' : '90vh',
          height: isFullScreen ? '100vh' : 'auto',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: isBottomSheet ? 'slideUpFromBottom 0.3s ease-out' : 'modalSlideIn 0.3s ease-out',
          transform: isDragging ? `translateY(${dragDistance}px)` : 'none',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          // Safe Area 지원
          paddingBottom: isBottomSheet || isFullScreen ? 'env(safe-area-inset-bottom)' : '0',
          paddingTop: isFullScreen ? 'env(safe-area-inset-top)' : '0'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle (Bottom Sheet만) */}
        {isBottomSheet && (
          <div
            style={{
              width: '40px',
              height: '4px',
              background: '#d1d5db',
              borderRadius: '2px',
              margin: '12px auto 8px',
              cursor: 'grab'
            }}
          />
        )}

        {/* 장식 요소 (Event Modal 스타일) */}
        {showDecorations && !isMobile && (
          <div className="event-modal-decorations">
            <div className="decoration-1"></div>
            <div className="decoration-2"></div>
            <div className="decoration-3"></div>
            <div className="decoration-4"></div>
          </div>
        )}

        {/* Close Button */}
        {showCloseButton && (
          <button
            className="modal-close"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#999',
              cursor: 'pointer',
              zIndex: 1001,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.color = '#4b5563'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = '#999'
            }}
            aria-label="모달 닫기"
          >
            ✕
          </button>
        )}

        {/* Back Button (모바일 전체 화면일 때만) */}
        {showBackButton && isFullScreen && (
          <button
            className="modal-back-button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top) + 15px)',
              left: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#999',
              cursor: 'pointer',
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            aria-label="뒤로가기"
          >
            ← 뒤로
          </button>
        )}

        {/* Title (옵션) */}
        {title && (
          <div
            style={{
              padding: '1.5rem 1.5rem 0',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}
          >
            {title}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            padding: title ? '1rem 1.5rem 1.5rem' : '1.5rem',
            overflowY: 'auto',
            maxHeight: isFullScreen
              ? 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 60px)'
              : isBottomSheet
                ? 'calc(85vh - 80px)'
                : 'calc(90vh - 80px)'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

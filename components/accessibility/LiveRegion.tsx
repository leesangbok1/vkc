'use client'

import { useEffect, useRef } from 'react'

interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive' | 'off'
  className?: string
}

export default function LiveRegion({
  message,
  politeness = 'polite',
  className = 'live-region'
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (regionRef.current && message) {
      // Clear and set message to ensure screen readers announce it
      regionRef.current.textContent = ''
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message
        }
      }, 100)
    }
  }, [message])

  return (
    <div
      ref={regionRef}
      aria-live={politeness}
      aria-atomic="true"
      className={className}
      role="status"
    />
  )
}

// Toast notification with accessibility
interface AccessibleToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

export function AccessibleToast({
  message,
  type = 'info',
  onClose,
  autoClose = true,
  duration = 5000
}: AccessibleToastProps) {
  const toastRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose, duration])

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }

  const getTypeClass = () => {
    switch (type) {
      case 'success': return 'color-safe-green'
      case 'error': return 'color-safe-red'
      case 'warning': return 'color-safe-yellow'
      default: return 'color-safe-blue'
    }
  }

  return (
    <>
      <div
        ref={toastRef}
        role="alert"
        aria-live="assertive"
        className={`toast ${getTypeClass()}`}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px',
          borderRadius: '8px',
          color: 'white',
          maxWidth: '400px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <span aria-hidden="true">{getIcon()}</span>
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="알림 닫기"
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              marginLeft: 'auto',
              padding: '0 4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        )}
      </div>
      <LiveRegion message={message} politeness="assertive" />
    </>
  )
}
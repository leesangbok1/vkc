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
      case 'success': return 'bg-trust text-white'
      case 'error': return 'bg-error text-white'
      case 'warning': return 'bg-warning-500 text-primary'
      default: return 'bg-primary-blue text-white'
    }
  }

  return (
    <>
      <div
        ref={toastRef}
        role="alert"
        aria-live="assertive"
        className={`fixed top-5 right-5 p-4 rounded-lg max-w-sm z-50 flex items-center gap-2 shadow-lg transition-normal ${getTypeClass()}`}
      >
        <span aria-hidden="true">{getIcon()}</span>
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="알림 닫기"
            className="bg-transparent border-none text-white text-xl cursor-pointer ml-auto px-1 leading-none hover:opacity-75 transition-normal focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1"
          >
            ×
          </button>
        )}
      </div>
      <LiveRegion message={message} politeness="assertive" />
    </>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type FeedbackType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationFeedback {
  id: string
  type: FeedbackType
  title: string
  message: string
  duration?: number
  persistent?: boolean
  onAction?: () => void
  actionLabel?: string
}

interface NotificationFeedbackProps {
  feedbacks: NotificationFeedback[]
  onDismiss: (id: string) => void
  className?: string
}

const FeedbackIcon = ({ type }: { type: FeedbackType }) => {
  const iconProps = { className: "h-5 w-5" }

  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="h-5 w-5 text-green-600" />
    case 'error':
      return <XCircle {...iconProps} className="h-5 w-5 text-red-600" />
    case 'warning':
      return <AlertCircle {...iconProps} className="h-5 w-5 text-yellow-600" />
    case 'info':
    default:
      return <Info {...iconProps} className="h-5 w-5 text-blue-600" />
  }
}

const FeedbackItem = ({
  feedback,
  onDismiss
}: {
  feedback: NotificationFeedback
  onDismiss: (id: string) => void
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10)

    // Auto-dismiss
    if (!feedback.persistent && feedback.duration) {
      const dismissTimer = setTimeout(() => {
        handleDismiss()
      }, feedback.duration)

      return () => {
        clearTimeout(timer)
        clearTimeout(dismissTimer)
      }
    }

    return () => clearTimeout(timer)
  }, [feedback.duration, feedback.persistent])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(feedback.id)
    }, 300) // Animation duration
  }

  const getBackgroundColor = () => {
    switch (feedback.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (feedback.type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
      default:
        return 'text-blue-800'
    }
  }

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-in-out',
        'border rounded-lg p-4 shadow-sm',
        getBackgroundColor(),
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start space-x-3">
        <FeedbackIcon type={feedback.type} />
        <div className="flex-1 min-w-0">
          <h4 className={cn('text-sm font-medium', getTextColor())}>
            {feedback.title}
          </h4>
          <p className={cn('text-sm mt-1', getTextColor().replace('800', '700'))}>
            {feedback.message}
          </p>
          {feedback.onAction && feedback.actionLabel && (
            <div className="mt-3">
              <Button
                onClick={feedback.onAction}
                size="sm"
                variant="outline"
                className={cn(
                  'text-xs',
                  feedback.type === 'success' && 'border-green-300 text-green-700 hover:bg-green-100',
                  feedback.type === 'error' && 'border-red-300 text-red-700 hover:bg-red-100',
                  feedback.type === 'warning' && 'border-yellow-300 text-yellow-700 hover:bg-yellow-100',
                  feedback.type === 'info' && 'border-blue-300 text-blue-700 hover:bg-blue-100'
                )}
              >
                {feedback.actionLabel}
              </Button>
            </div>
          )}
        </div>
        <Button
          onClick={handleDismiss}
          size="sm"
          variant="ghost"
          className={cn(
            'h-6 w-6 p-0',
            getTextColor().replace('800', '600'),
            'hover:' + getTextColor().replace('800', '800')
          )}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function NotificationFeedback({
  feedbacks,
  onDismiss,
  className
}: NotificationFeedbackProps) {
  if (feedbacks.length === 0) return null

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 w-96 max-w-sm space-y-2',
      className
    )}>
      {feedbacks.map((feedback) => (
        <FeedbackItem
          key={feedback.id}
          feedback={feedback}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

// Hook for managing feedback state
export function useNotificationFeedback() {
  const [feedbacks, setFeedbacks] = useState<NotificationFeedback[]>([])

  const addFeedback = (feedback: Omit<NotificationFeedback, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newFeedback: NotificationFeedback = {
      id,
      duration: 5000, // 5 seconds default
      ...feedback
    }

    setFeedbacks(prev => [...prev, newFeedback])
    return id
  }

  const removeFeedback = (id: string) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id))
  }

  const clearAllFeedbacks = () => {
    setFeedbacks([])
  }

  // Convenience methods
  const showSuccess = (title: string, message: string, options?: Partial<NotificationFeedback>) => {
    return addFeedback({ type: 'success', title, message, ...options })
  }

  const showError = (title: string, message: string, options?: Partial<NotificationFeedback>) => {
    return addFeedback({
      type: 'error',
      title,
      message,
      persistent: true, // Errors should be persistent by default
      ...options
    })
  }

  const showWarning = (title: string, message: string, options?: Partial<NotificationFeedback>) => {
    return addFeedback({ type: 'warning', title, message, ...options })
  }

  const showInfo = (title: string, message: string, options?: Partial<NotificationFeedback>) => {
    return addFeedback({ type: 'info', title, message, ...options })
  }

  return {
    feedbacks,
    addFeedback,
    removeFeedback,
    clearAllFeedbacks,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
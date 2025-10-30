'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import NotificationSetupModal from '@/components/modals/NotificationSetupModal'

type NotificationPromptPayload = {
  email: string
  onComplete?: () => void
  onDismiss?: () => void
}

type NotificationPromptContextValue = {
  openNotificationPrompt: (payload: NotificationPromptPayload) => void
  closeNotificationPrompt: () => void
}

const NotificationPromptContext = createContext<NotificationPromptContextValue | undefined>(
  undefined
)

export function NotificationPromptProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<NotificationPromptPayload | null>(null)

  const closeNotificationPrompt = useCallback(() => {
    setPayload(null)
  }, [])

  const openNotificationPrompt = useCallback((next: NotificationPromptPayload) => {
    setPayload(next)
  }, [])

  const handleClose = useCallback(() => {
    if (payload?.onDismiss) {
      try {
        payload.onDismiss()
      } catch (error) {
        console.error('[NotificationPrompt] onDismiss failed', error)
      }
    }
    closeNotificationPrompt()
  }, [closeNotificationPrompt, payload])

  const handleComplete = useCallback(() => {
    if (payload?.onComplete) {
      try {
        payload.onComplete()
      } catch (error) {
        console.error('[NotificationPrompt] onComplete failed', error)
      }
    }
    closeNotificationPrompt()
  }, [closeNotificationPrompt, payload])

  const contextValue = useMemo(
    () => ({
      openNotificationPrompt,
      closeNotificationPrompt,
    }),
    [openNotificationPrompt, closeNotificationPrompt]
  )

  return (
    <NotificationPromptContext.Provider value={contextValue}>
      {children}
      <NotificationSetupModal
        key={payload?.email ?? 'notification-modal'}
        isOpen={!!payload}
        onClose={handleClose}
        onComplete={handleComplete}
        userEmail={payload?.email ?? ''}
      />
    </NotificationPromptContext.Provider>
  )
}

export function useNotificationPrompt() {
  const context = useContext(NotificationPromptContext)
  if (!context) {
    throw new Error('useNotificationPrompt must be used within a NotificationPromptProvider')
  }
  return context
}

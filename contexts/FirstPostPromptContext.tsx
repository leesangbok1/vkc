'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import FirstPostPromptModal from '@/components/modals/FirstPostPromptModal'
import {
  markFirstPostPromptCompleted,
  markFirstPostPromptDismissed,
} from '@/lib/utils/first-post-prompt'

type FirstPostPromptPayload = {
  userId: string | null
  userEmail?: string | null
  targetUrl?: string
  onSetupComplete?: () => void
  onDismiss?: () => void
}

type FirstPostPromptContextValue = {
  openFirstPostPrompt: (payload: FirstPostPromptPayload) => void
  closeFirstPostPrompt: () => void
}

const FirstPostPromptContext = createContext<FirstPostPromptContextValue | undefined>(undefined)

export function FirstPostPromptProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [payload, setPayload] = useState<FirstPostPromptPayload | null>(null)

  const closeFirstPostPrompt = useCallback(() => {
    setPayload(null)
  }, [])

  const openFirstPostPrompt = useCallback((next: FirstPostPromptPayload) => {
    setPayload(next)
  }, [])

  const handleLater = useCallback(() => {
    if (payload?.userId) {
      markFirstPostPromptDismissed(payload.userId)
    }
    if (payload?.onDismiss) {
      try {
        payload.onDismiss()
      } catch (error) {
        console.error('[FirstPostPrompt] onDismiss callback failed', error)
      }
    }
    closeFirstPostPrompt()
  }, [closeFirstPostPrompt, payload])

  const handleSetup = useCallback(() => {
    if (payload?.userId) {
      markFirstPostPromptCompleted(payload.userId)
    }
    if (payload?.onSetupComplete) {
      try {
        payload.onSetupComplete()
      } catch (error) {
        console.error('[FirstPostPrompt] onSetupComplete callback failed', error)
      }
    }
    const destination = payload?.targetUrl || '/settings?section=notifications&modal=settings'
    router.push(destination)
    closeFirstPostPrompt()
  }, [closeFirstPostPrompt, payload, router])

  const contextValue = useMemo(
    () => ({
      openFirstPostPrompt,
      closeFirstPostPrompt,
    }),
    [openFirstPostPrompt, closeFirstPostPrompt]
  )

  return (
    <FirstPostPromptContext.Provider value={contextValue}>
      {children}
      <FirstPostPromptModal
        isOpen={!!payload}
        userEmail={payload?.userEmail}
        onLater={handleLater}
        onSetup={handleSetup}
      />
    </FirstPostPromptContext.Provider>
  )
}

export function useFirstPostPrompt() {
  const context = useContext(FirstPostPromptContext)
  if (!context) {
    throw new Error('useFirstPostPrompt must be used within a FirstPostPromptProvider')
  }
  return context
}

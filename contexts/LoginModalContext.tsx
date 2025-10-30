'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type LoginModalOptions = {
  redirectTo?: string
  message?: string
  onClose?: () => void
}

type LoginModalState = {
  isOpen: boolean
  redirectTo: string
  message?: string
  onClose?: () => void
}

type LoginModalContextValue = LoginModalState & {
  openLoginModal: (options?: LoginModalOptions) => void
  closeLoginModal: () => void
}

const DEFAULT_STATE: LoginModalState = {
  isOpen: false,
  redirectTo: '/',
  message: undefined,
  onClose: undefined,
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null)

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LoginModalState>(DEFAULT_STATE)

  const openLoginModal = useCallback((options: LoginModalOptions = {}) => {
    const { redirectTo = '/', message, onClose } = options
    setState({
      isOpen: true,
      redirectTo,
      message,
      onClose,
    })
  }, [])

  const closeLoginModal = useCallback(() => {
    setState((prev) => {
      if (prev.onClose) {
        setTimeout(prev.onClose, 0)
      }
      return { ...DEFAULT_STATE }
    })
  }, [])

  const value = useMemo<LoginModalContextValue>(
    () => ({
      ...state,
      openLoginModal,
      closeLoginModal,
    }),
    [state, openLoginModal, closeLoginModal]
  )

  return <LoginModalContext.Provider value={value}>{children}</LoginModalContext.Provider>
}

export function useLoginModal() {
  const context = useContext(LoginModalContext)
  if (!context) {
    throw new Error('useLoginModal must be used within a LoginModalProvider')
  }
  return context
}

'use client'

import { ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ShareModalProvider } from '@/contexts/ShareModalContext'
import { NotificationPromptProvider } from '@/contexts/NotificationPromptContext'
import { FirstPostPromptProvider } from '@/contexts/FirstPostPromptContext'
import { LoginModalProvider } from '@/contexts/LoginModalContext'
import ModalRouterHost from '@/components/modals/ModalRouterHost'
import LoginModal from '@/components/modals/LoginModal'

export const useSafeAuth = useAuth

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LoginModalProvider>
        <ShareModalProvider>
          <NotificationPromptProvider>
            <FirstPostPromptProvider>
              {children}
              <ModalRouterHost />
              <LoginModal />
            </FirstPostPromptProvider>
          </NotificationPromptProvider>
        </ShareModalProvider>
      </LoginModalProvider>
    </AuthProvider>
  )
}

export default ClientProviders

'use client'

import { ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

export const useSafeAuth = useAuth

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

export default ClientProviders

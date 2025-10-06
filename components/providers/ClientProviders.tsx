'use client'

import React from 'react'

// Simplified Auth Context without external dependencies
interface User {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    avatar_url?: string
    [key: string]: any
  }
  [key: string]: any
}

interface Profile {
  name?: string
  avatar_url?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signInWithKakao: () => Promise<void>
  signOut: () => Promise<void>
}

import { createContext, useContext } from 'react'

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: false,
  signInWithGoogle: async () => console.log('Mock Google sign in'),
  signInWithFacebook: async () => console.log('Mock Facebook sign in'),
  signInWithKakao: async () => console.log('Mock Kakao sign in'),
  signOut: async () => console.log('Mock sign out'),
})

export const useSafeAuth = () => useContext(AuthContext)

export function ClientProviders({ children }: { children: React.ReactNode }) {

  const authValue: AuthContextType = {
    user: null,
    profile: null,
    loading: false,
    signInWithGoogle: async () => console.log('Mock Google sign in'),
    signInWithFacebook: async () => console.log('Mock Facebook sign in'),
    signInWithKakao: async () => console.log('Mock Kakao sign in'),
    signOut: async () => console.log('Mock sign out'),
  }

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default ClientProviders
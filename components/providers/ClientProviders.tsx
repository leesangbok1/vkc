'use client'

import { useEffect, useState } from 'react'

// Simplified Auth Context without external dependencies
interface AuthContextType {
  user: null
  profile: null
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

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
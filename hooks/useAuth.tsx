/**
 * 인증 관련 React Hook
 * 베트남 한국 거주자 Q&A 플랫폼
 */

'use client'

import { useEffect, useState, useCallback, createContext, useContext } from 'react'
import { authService, type AuthUser, type AuthProvider } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'

interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isEmailVerified: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signInWithProvider: (provider: AuthProvider) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithKakao: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  refreshUser: () => Promise<void>
}

interface SignUpData {
  email: string
  password: string
  name: string
  visaType?: string
  residenceArea?: string
  yearsInKorea?: number
}

// Auth Context 생성
const AuthContext = createContext<UseAuthReturn | undefined>(undefined)

// AuthProvider 컴포넌트
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authValue = useAuthHook()

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Context hook (내부 사용)
function useAuthHook(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEmailVerified, setIsEmailVerified] = useState(false)

  // 사용자 정보 새로고침
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        const emailVerified = await authService.checkEmailVerification()
        setIsEmailVerified(emailVerified)

        // 마지막 활동 시간 업데이트
        await authService.updateLastActive()
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 로그인
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      await authService.signIn({ email, password })
      await refreshUser()
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }, [refreshUser])

  // 회원가입
  const signUp = useCallback(async (data: SignUpData) => {
    try {
      setIsLoading(true)
      await authService.signUp(data)
      await refreshUser()
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }, [refreshUser])

  // 소셜 로그인 (범용)
  const signInWithProvider = useCallback(async (provider: AuthProvider) => {
    try {
      setIsLoading(true)
      await authService.signInWithProvider(provider)
      // OAuth 리다이렉트로 인해 페이지가 새로고침되므로 refreshUser는 호출하지 않음
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }, [])

  // Google 로그인
  const signInWithGoogle = useCallback(async () => {
    return signInWithProvider('google')
  }, [signInWithProvider])

  // Kakao 로그인
  const signInWithKakao = useCallback(async () => {
    return signInWithProvider('kakao')
  }, [signInWithProvider])

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true)
      await authService.signOut()
      setUser(null)
      setIsEmailVerified(false)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 프로필 업데이트
  const updateProfile = useCallback(async (updates: Partial<AuthUser>) => {
    try {
      const updatedUser = await authService.updateProfile(updates)
      setUser(updatedUser)
    } catch (error) {
      throw error
    }
  }, [])

  // 비밀번호 재설정
  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.resetPassword(email)
    } catch (error) {
      throw error
    }
  }, [])

  // 비밀번호 변경
  const updatePassword = useCallback(async (password: string) => {
    try {
      await authService.updatePassword(password)
    } catch (error) {
      throw error
    }
  }, [])

  // 초기화 및 인증 상태 구독
  useEffect(() => {
    // 현재 사용자 정보 로드
    refreshUser()

    // 인증 상태 변화 구독
    const { data: { subscription } } = authService.onAuthStateChange(async (authUser: User | null) => {
      if (authUser) {
        await refreshUser()
      } else {
        setUser(null)
        setIsEmailVerified(false)
        setIsLoading(false)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [refreshUser])

  // 주기적으로 마지막 활동 시간 업데이트 (5분마다)
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      authService.updateLastActive()
    }, 5 * 60 * 1000) // 5분

    return () => clearInterval(interval)
  }, [user])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isEmailVerified,
    signIn,
    signUp,
    signInWithProvider,
    signInWithGoogle,
    signInWithKakao,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    refreshUser
  }
}

// Public useAuth hook (Context에서 값 가져오기)
function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { useAuth }
export default useAuth
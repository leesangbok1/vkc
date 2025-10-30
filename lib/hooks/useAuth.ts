'use client'

'use client'

import { useMemo, useCallback } from 'react'
import { useSafeAuth } from '@/components/providers/ClientProviders'

export type UserRole = 'GUEST' | 'USER' | 'VERIFIED' | 'ADMIN'

export interface MockUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string | null
  admin_yn?: 'Y' | 'N'
  onboarding_completed?: boolean
  residence?: string | null
  gender?: string | null
  age?: string | null
  interests?: string[]
}

export interface AuthState {
  isLoading: boolean
  isLoggedIn: boolean
  user: MockUser | null
  checkAuth: () => Promise<void>
  login: (user: MockUser) => void
  logout: () => void
  updateUser: (updates: Partial<MockUser>) => void
}

const mapRole = (role: string | null | undefined, adminYn: string | null | undefined): UserRole => {
  if (adminYn === 'Y') return 'ADMIN'
  if (!role) return 'USER'
  const upper = role.toUpperCase()
  if (upper === 'ADMIN') return 'ADMIN'
  if (upper === 'VERIFIED') return 'VERIFIED'
  if (upper === 'GUEST') return 'GUEST'
  return 'USER'
}

export function useAuth(): AuthState {
  const { loading, profile, signOut } = useSafeAuth()

  const user = useMemo<MockUser | null>(() => {
    if (!profile) return null
    const fallbackEmail = typeof profile.email === 'string' ? profile.email : ''
    const fallbackName = typeof profile.name === 'string' && profile.name.trim().length > 0
      ? profile.name.trim()
      : fallbackEmail || '사용자'

    const extendedProfile = profile as typeof profile & {
      onboarding_completed?: boolean | null
      residence?: string | null
      gender?: string | null
      age?: string | null
    }

    return {
      id: profile.id,
      email: fallbackEmail,
      name: fallbackName,
      avatar_url: profile.avatar_url ?? null,
      role: mapRole(profile.role, profile.admin_yn),
      admin_yn: profile.admin_yn ?? 'N',
      onboarding_completed:
        extendedProfile.onboarding_completed === undefined ? true : Boolean(extendedProfile.onboarding_completed),
      residence: extendedProfile.residence ?? null,
      gender: extendedProfile.gender ?? null,
      age: extendedProfile.age ?? null,
      interests: Array.isArray(profile.interests) ? profile.interests.slice() : []
    }
  }, [profile])

  const login = useCallback((_: MockUser) => {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }, [])

  const logout = useCallback(() => {
    void signOut().catch((error) => {
      console.error('Failed to sign out:', error)
    })
  }, [signOut])

  return {
    isLoading: loading,
    isLoggedIn: Boolean(profile),
    user,
    checkAuth: () => Promise.resolve(),
    login,
    logout,
    updateUser: () => {},
  }
}

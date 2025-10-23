'use client'

import { useState, useEffect } from 'react'

export type UserRole = 'GUEST' | 'USER' | 'VERIFIED' | 'ADMIN'

export interface MockUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string
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

/**
 * Unified authentication hook for VietKConnect
 * Uses localStorage-based mock authentication consistently across all pages
 */
export function useAuth(): AuthState {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<MockUser | null>(null)

  const checkAuth = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/profile', { cache: 'no-store' })
      if (!res.ok) {
        setUser(null)
        setIsLoggedIn(false)
        return
      }
      const json = await res.json()
      const data = json.data || {}
      const onboardingCompleted =
        Object.prototype.hasOwnProperty.call(data, 'onboarding_completed')
          ? data.onboarding_completed === false ? false : true
          : true
      const isAdmin = data.admin_yn === 'Y' || data.role?.toLowerCase?.() === 'admin'
      const role = (isAdmin ? 'ADMIN' : (data.role?.toUpperCase?.() as UserRole)) || 'USER'
      setUser({
        id: data.id,
        email: data.email,
        name: data.name || data.email || '사용자',
        role,
        admin_yn: data.admin_yn,
        onboarding_completed: onboardingCompleted,
        residence: data.residence ?? null,
        gender: data.gender ?? null,
        age: data.age ?? null,
        interests: Array.isArray(data.interests) ? data.interests as string[] : []
      })
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  // For compatibility with existing callers; prefer redirect flow in pages
  const login = (_newUser: MockUser) => {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const updateUser = (_updates: Partial<MockUser>) => {
    // no-op for server-backed auth; pages should POST to /api/auth/profile
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    isLoading,
    isLoggedIn,
    user,
    checkAuth,
    login,
    logout,
    updateUser
  }
}

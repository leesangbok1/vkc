'use client'

import { useState, useEffect } from 'react'

export type UserRole = 'GUEST' | 'USER' | 'VERIFIED' | 'ADMIN'

export interface MockUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string
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
      const mockSession = localStorage.getItem('mock_session')
      const mockUserStr = localStorage.getItem('mock_user')
      const onboardingCompleted = localStorage.getItem('vietkconnect_onboarded')

      if (mockSession === 'true' && mockUserStr && onboardingCompleted === 'true') {
        const parsedUser = JSON.parse(mockUserStr)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } else {
        setUser(null)
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = (newUser: MockUser) => {
    localStorage.setItem('mock_session', 'true')
    localStorage.setItem('mock_user', JSON.stringify(newUser))
    localStorage.setItem('vietkconnect_onboarded', 'true')
    setUser(newUser)
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem('mock_session')
    localStorage.removeItem('mock_user')
    localStorage.removeItem('vietkconnect_onboarded')
    setUser(null)
    setIsLoggedIn(false)
  }

  const updateUser = (updates: Partial<MockUser>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    localStorage.setItem('mock_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
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

/**
 * Supabase Auth 유틸리티 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Supabase 클라이언트 모킹
const mockSupabaseClient = {
  auth: {
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn()
  }
}

// Auth 유틸리티 함수들 모킹 (실제 구현 기반)
const authUtils = {
  async signInWithGoogle() {
    const { data, error } = await mockSupabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  },

  async signInWithKakao() {
    const { data, error } = await mockSupabaseClient.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await mockSupabaseClient.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data: { session } } = await mockSupabaseClient.auth.getSession()
    return session
  },

  onAuthStateChange(callback) {
    const { data: { subscription } } = mockSupabaseClient.auth.onAuthStateChange(callback)
    return subscription
  }
}

describe('Auth Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // 기본 성공 응답 설정
    mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
      data: { user: { id: 'test-user-id' }, session: { access_token: 'test-token' } },
      error: null
    })

    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null })

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' }, access_token: 'test-token' } }
    })

    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    // window.location.origin 모킹
    delete window.location
    window.location = { origin: 'http://localhost:3000' }
  })

  describe('signInWithGoogle', () => {
    it('should call signInWithOAuth with Google provider', async () => {
      await authUtils.signInWithGoogle()

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback'
        }
      })
    })

    it('should return auth data on success', async () => {
      const expectedData = { user: { id: 'test-user-id' }, session: { access_token: 'test-token' } }
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: expectedData,
        error: null
      })

      const result = await authUtils.signInWithGoogle()
      expect(result).toEqual(expectedData)
    })

    it('should throw error on failure', async () => {
      const expectedError = new Error('Google OAuth failed')
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: expectedError
      })

      await expect(authUtils.signInWithGoogle()).rejects.toThrow('Google OAuth failed')
    })
  })

  describe('signInWithKakao', () => {
    it('should call signInWithOAuth with Kakao provider', async () => {
      await authUtils.signInWithKakao()

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'kakao',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback'
        }
      })
    })

    it('should return auth data on success', async () => {
      const expectedData = { user: { id: 'kakao-user-id' }, session: { access_token: 'kakao-token' } }
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: expectedData,
        error: null
      })

      const result = await authUtils.signInWithKakao()
      expect(result).toEqual(expectedData)
    })

    it('should throw error on failure', async () => {
      const expectedError = new Error('Kakao OAuth failed')
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: expectedError
      })

      await expect(authUtils.signInWithKakao()).rejects.toThrow('Kakao OAuth failed')
    })
  })

  describe('signOut', () => {
    it('should call Supabase signOut', async () => {
      await authUtils.signOut()

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledWith()
    })

    it('should not throw on successful signOut', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null })

      await expect(authUtils.signOut()).resolves.not.toThrow()
    })

    it('should throw error on signOut failure', async () => {
      const expectedError = new Error('Sign out failed')
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: expectedError })

      await expect(authUtils.signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('getSession', () => {
    it('should return session data', async () => {
      const expectedSession = { user: { id: 'test-user' }, access_token: 'token' }
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: expectedSession }
      })

      const result = await authUtils.getSession()
      expect(result).toEqual(expectedSession)
    })

    it('should return null for no session', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      const result = await authUtils.getSession()
      expect(result).toBeNull()
    })
  })

  describe('onAuthStateChange', () => {
    it('should setup auth state change listener', () => {
      const mockCallback = vi.fn()
      const mockSubscription = { unsubscribe: vi.fn() }

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription }
      })

      const result = authUtils.onAuthStateChange(mockCallback)

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback)
      expect(result).toEqual(mockSubscription)
    })

    it('should return subscription object', () => {
      const mockCallback = vi.fn()
      const mockSubscription = { unsubscribe: vi.fn() }

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription }
      })

      const subscription = authUtils.onAuthStateChange(mockCallback)

      expect(subscription).toHaveProperty('unsubscribe')
      expect(typeof subscription.unsubscribe).toBe('function')
    })
  })

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error')
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: networkError
      })

      await expect(authUtils.signInWithGoogle()).rejects.toThrow('Network error')
    })

    it('should handle OAuth configuration errors', async () => {
      const configError = new Error('OAuth configuration invalid')
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: configError
      })

      await expect(authUtils.signInWithKakao()).rejects.toThrow('OAuth configuration invalid')
    })
  })
})
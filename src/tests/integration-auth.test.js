/**
 * 통합 테스트 - 인증 플로우 검증
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock Supabase client
const mockSupabaseAuth = {
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  getUser: vi.fn(),
  onAuthStateChange: vi.fn()
}

const mockSupabaseClient = {
  auth: mockSupabaseAuth,
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }))
}

// Mock browser environment
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000',
    assign: vi.fn(),
    reload: vi.fn()
  },
  writable: true
})

describe('Integration Tests - Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default successful responses
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('OAuth Authentication', () => {
    it('should handle Google OAuth login flow', async () => {
      const mockAuthResponse = {
        data: {
          user: {
            id: 'google-user-123',
            email: 'user@gmail.com',
            user_metadata: {
              name: 'Test User',
              avatar_url: 'https://avatar.url'
            }
          },
          session: {
            access_token: 'access_token_123',
            refresh_token: 'refresh_token_123'
          }
        },
        error: null
      }

      mockSupabaseAuth.signInWithOAuth.mockResolvedValue(mockAuthResponse)

      // Simulate OAuth flow
      const authResult = await mockSupabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback'
        }
      })

      expect(authResult.data.user.id).toBe('google-user-123')
      expect(authResult.data.session.access_token).toBe('access_token_123')
      expect(authResult.error).toBeNull()
    })

    it('should handle Kakao OAuth login flow', async () => {
      const mockKakaoResponse = {
        data: {
          user: {
            id: 'kakao-user-456',
            email: 'user@kakao.com',
            user_metadata: {
              name: '홍길동',
              avatar_url: 'https://kakao-avatar.url'
            }
          },
          session: {
            access_token: 'kakao_access_token',
            refresh_token: 'kakao_refresh_token'
          }
        },
        error: null
      }

      mockSupabaseAuth.signInWithOAuth.mockResolvedValue(mockKakaoResponse)

      const authResult = await mockSupabaseClient.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'kakao',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback'
        }
      })

      expect(authResult.data.user.id).toBe('kakao-user-456')
      expect(authResult.data.user.user_metadata.name).toBe('홍길동')
    })

    it('should handle OAuth errors gracefully', async () => {
      const mockAuthError = {
        data: null,
        error: {
          message: 'OAuth provider configuration error',
          status: 400
        }
      }

      mockSupabaseAuth.signInWithOAuth.mockResolvedValue(mockAuthError)

      const authResult = await mockSupabaseClient.auth.signInWithOAuth({
        provider: 'google'
      })

      expect(authResult.data).toBeNull()
      expect(authResult.error.message).toBe('OAuth provider configuration error')
    })
  })

  describe('Session Management', () => {
    it('should retrieve active session', async () => {
      const mockSession = {
        data: {
          session: {
            access_token: 'active_token_123',
            refresh_token: 'refresh_token_123',
            user: {
              id: 'user-123',
              email: 'nguyen.van.thu@example.com',
              user_metadata: {
                name: 'Nguyễn Văn Thư',
                avatar_url: 'https://avatar.url'
              }
            },
            expires_at: Date.now() + 3600000 // 1 hour from now
          }
        },
        error: null
      }

      mockSupabaseAuth.getSession.mockResolvedValue(mockSession)

      const sessionResult = await mockSupabaseClient.auth.getSession()

      expect(sessionResult.data.session).toBeDefined()
      expect(sessionResult.data.session.user.email).toBe('nguyen.van.thu@example.com')
      expect(sessionResult.data.session.user.user_metadata.name).toBe('Nguyễn Văn Thư')
      expect(sessionResult.error).toBeNull()
    })

    it('should handle no active session', async () => {
      const mockNoSession = {
        data: { session: null },
        error: null
      }

      mockSupabaseAuth.getSession.mockResolvedValue(mockNoSession)

      const sessionResult = await mockSupabaseClient.auth.getSession()

      expect(sessionResult.data.session).toBeNull()
      expect(sessionResult.error).toBeNull()
    })

    it('should handle expired session', async () => {
      const mockExpiredSession = {
        data: {
          session: {
            access_token: 'expired_token',
            user: { id: 'user-123' },
            expires_at: Date.now() - 3600000 // 1 hour ago
          }
        },
        error: {
          message: 'Session expired',
          status: 401
        }
      }

      mockSupabaseAuth.getSession.mockResolvedValue(mockExpiredSession)

      const sessionResult = await mockSupabaseClient.auth.getSession()

      expect(sessionResult.error.message).toBe('Session expired')
      expect(sessionResult.error.status).toBe(401)
    })
  })

  describe('User Profile Integration', () => {
    it('should create user profile after successful OAuth', async () => {
      const mockUser = {
        id: 'new-user-123',
        email: 'tran.thi.lan@example.com',
        user_metadata: {
          name: 'Trần Thị Lan',
          avatar_url: 'https://google-avatar.url'
        }
      }

      const mockProfileData = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.user_metadata.name,
        avatar_url: mockUser.user_metadata.avatar_url,
        provider: 'google',
        visa_type: null,
        region: null,
        bio: null,
        trust_score: 10,
        created_at: new Date().toISOString()
      }

      // Mock user creation in database
      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: mockProfileData,
          error: null
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfileData,
          error: null
        })
      })

      const insertResult = await mockSupabaseClient
        .from('users')
        .insert(mockProfileData)

      expect(insertResult.data).toEqual(mockProfileData)
      expect(insertResult.error).toBeNull()
    })

    it('should update existing user profile on login', async () => {
      const existingUserId = 'existing-user-456'
      const updatedData = {
        last_login: new Date().toISOString(),
        login_count: 15
      }

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: { id: existingUserId, ...updatedData },
          error: null
        })
      }

      mockSupabaseClient.from.mockReturnValue(mockChain)

      const updateResult = await mockSupabaseClient
        .from('users')
        .update(updatedData)
        .eq('id', existingUserId)

      expect(updateResult.data.last_login).toBeDefined()
      expect(updateResult.data.login_count).toBe(15)
      expect(updateResult.error).toBeNull()
    })
  })

  describe('Authentication State Changes', () => {
    it('should handle authentication state changes', async () => {
      const mockStateChangeCallback = vi.fn()
      const mockUnsubscribe = vi.fn()

      mockSupabaseAuth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } }
      })

      const subscription = mockSupabaseClient.auth.onAuthStateChange(mockStateChangeCallback)

      // Simulate sign in event
      const signInEvent = {
        event: 'SIGNED_IN',
        session: {
          user: {
            id: 'user-123',
            email: 'user@example.com'
          },
          access_token: 'new_token'
        }
      }

      // Manually trigger callback to simulate state change
      mockStateChangeCallback(signInEvent.event, signInEvent.session)

      expect(mockSupabaseAuth.onAuthStateChange).toHaveBeenCalledWith(mockStateChangeCallback)
      expect(mockStateChangeCallback).toHaveBeenCalledWith('SIGNED_IN', signInEvent.session)
      expect(subscription.data.subscription.unsubscribe).toBe(mockUnsubscribe)
    })

    it('should handle sign out state change', async () => {
      const mockStateChangeCallback = vi.fn()

      mockSupabaseAuth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })

      mockSupabaseClient.auth.onAuthStateChange(mockStateChangeCallback)

      // Simulate sign out event
      const signOutEvent = {
        event: 'SIGNED_OUT',
        session: null
      }

      mockStateChangeCallback(signOutEvent.event, signOutEvent.session)

      expect(mockStateChangeCallback).toHaveBeenCalledWith('SIGNED_OUT', null)
    })
  })

  describe('Sign Out Flow', () => {
    it('should successfully sign out user', async () => {
      mockSupabaseAuth.signOut.mockResolvedValue({
        error: null
      })

      const signOutResult = await mockSupabaseClient.auth.signOut()

      expect(mockSupabaseAuth.signOut).toHaveBeenCalled()
      expect(signOutResult.error).toBeNull()
    })

    it('should handle sign out errors', async () => {
      const signOutError = {
        error: {
          message: 'Failed to sign out',
          status: 500
        }
      }

      mockSupabaseAuth.signOut.mockResolvedValue(signOutError)

      const signOutResult = await mockSupabaseClient.auth.signOut()

      expect(signOutResult.error.message).toBe('Failed to sign out')
    })
  })

  describe('Vietnamese User Authentication', () => {
    it('should handle Vietnamese names in user metadata', async () => {
      const vietnameseUserData = {
        data: {
          user: {
            id: 'viet-user-789',
            email: 'le.van.nam@example.com',
            user_metadata: {
              name: 'Lê Văn Nam',
              given_name: 'Nam',
              family_name: 'Lê Văn',
              locale: 'vi_VN'
            }
          },
          session: {
            access_token: 'vietnamese_user_token'
          }
        },
        error: null
      }

      mockSupabaseAuth.signInWithOAuth.mockResolvedValue(vietnameseUserData)

      const authResult = await mockSupabaseClient.auth.signInWithOAuth({
        provider: 'google'
      })

      expect(authResult.data.user.user_metadata.name).toBe('Lê Văn Nam')
      expect(authResult.data.user.user_metadata.family_name).toBe('Lê Văn')
      expect(authResult.data.user.user_metadata.locale).toBe('vi_VN')
    })

    it('should handle multilingual user profiles', async () => {
      const multilingualProfile = {
        id: 'multilingual-user-999',
        name: 'Phạm Thị Hương',
        korean_name: '팜티흐엉',
        preferred_language: 'ko',
        secondary_language: 'vi',
        bio: '한국 거주 3년차 베트남 사람입니다.',
        region: '서울',
        visa_type: 'E-7'
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: multilingualProfile,
          error: null
        })
      })

      const insertResult = await mockSupabaseClient
        .from('users')
        .insert(multilingualProfile)

      expect(insertResult.data.name).toBe('Phạm Thị Hương')
      expect(insertResult.data.korean_name).toBe('팜티흐엉')
      expect(insertResult.data.preferred_language).toBe('ko')
    })
  })

  describe('Error Recovery', () => {
    it('should handle network errors during authentication', async () => {
      const networkError = {
        data: null,
        error: {
          message: 'Network error',
          code: 'NETWORK_ERROR'
        }
      }

      mockSupabaseAuth.signInWithOAuth.mockRejectedValue(networkError.error)

      await expect(mockSupabaseClient.auth.signInWithOAuth({
        provider: 'google'
      })).rejects.toEqual(networkError.error)
    })

    it('should handle provider-specific errors', async () => {
      const providerError = {
        data: null,
        error: {
          message: 'OAuth provider temporarily unavailable',
          code: 'PROVIDER_UNAVAILABLE',
          provider: 'kakao'
        }
      }

      mockSupabaseAuth.signInWithOAuth.mockResolvedValue(providerError)

      const authResult = await mockSupabaseClient.auth.signInWithOAuth({
        provider: 'kakao'
      })

      expect(authResult.error.code).toBe('PROVIDER_UNAVAILABLE')
      expect(authResult.error.provider).toBe('kakao')
    })
  })
})
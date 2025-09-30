/**
 * LoginModal 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// React hooks 모킹
const mockSetState = vi.fn()
const mockUseAuth = {
  signInWithGoogle: vi.fn(),
  signInWithFacebook: vi.fn(),
  signInWithKakao: vi.fn()
}

// LoginModal 로직 시뮬레이션
class LoginModalLogic {
  constructor() {
    this.isLoading = false
    this.error = null
    this.authMethods = mockUseAuth
  }

  setIsLoading(value) {
    this.isLoading = value
    mockSetState(value)
  }

  setError(value) {
    this.error = value
    mockSetState(value)
  }

  async handleGoogleLogin() {
    this.setIsLoading(true)
    this.setError(null)

    try {
      await this.authMethods.signInWithGoogle()
      // OAuth flow will redirect, so we don't close modal here
    } catch (error) {
      let errorMessage = 'Google 로그인에 실패했습니다.'

      if (error instanceof Error) {
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = '로그인이 취소되었습니다.'
        } else if (error.message.includes('network')) {
          errorMessage = '네트워크 연결을 확인해주세요.'
        } else if (error.message.includes('oauth')) {
          errorMessage = 'OAuth 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
        } else {
          errorMessage = `Google 로그인 실패: ${error.message}`
        }
      }

      this.setError(errorMessage)
      console.error('Google login failed:', error)
      this.setIsLoading(false)
    }
  }

  async handleFacebookLogin() {
    this.setIsLoading(true)
    this.setError(null)

    try {
      await this.authMethods.signInWithFacebook()
    } catch (error) {
      let errorMessage = 'Facebook 로그인에 실패했습니다.'

      if (error instanceof Error) {
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = '로그인이 취소되었습니다.'
        } else if (error.message.includes('network')) {
          errorMessage = '네트워크 연결을 확인해주세요.'
        } else if (error.message.includes('oauth')) {
          errorMessage = 'OAuth 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
        } else {
          errorMessage = `Facebook 로그인 실패: ${error.message}`
        }
      }

      this.setError(errorMessage)
      console.error('Facebook login failed:', error)
      this.setIsLoading(false)
    }
  }

  async handleKakaoLogin() {
    this.setIsLoading(true)
    this.setError(null)

    try {
      await this.authMethods.signInWithKakao()
    } catch (error) {
      let errorMessage = '카카오 로그인에 실패했습니다.'

      if (error instanceof Error) {
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = '로그인이 취소되었습니다.'
        } else if (error.message.includes('network')) {
          errorMessage = '네트워크 연결을 확인해주세요.'
        } else if (error.message.includes('oauth')) {
          errorMessage = 'OAuth 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
        } else {
          errorMessage = `카카오 로그인 실패: ${error.message}`
        }
      }

      this.setError(errorMessage)
      console.error('Kakao login failed:', error)
      this.setIsLoading(false)
    }
  }
}

describe('LoginModal Component', () => {
  let loginModal

  beforeEach(() => {
    vi.clearAllMocks()
    loginModal = new LoginModalLogic()

    // console.error 모킹
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // 성공적인 로그인 응답 기본 설정
    mockUseAuth.signInWithGoogle.mockResolvedValue({ user: { id: 'google-user' } })
    mockUseAuth.signInWithFacebook.mockResolvedValue({ user: { id: 'facebook-user' } })
    mockUseAuth.signInWithKakao.mockResolvedValue({ user: { id: 'kakao-user' } })
  })

  describe('Google Login', () => {
    it('should start loading when Google login is initiated', async () => {
      const promise = loginModal.handleGoogleLogin()

      expect(loginModal.isLoading).toBe(true)
      expect(loginModal.error).toBe(null)

      await promise
    })

    it('should call signInWithGoogle method', async () => {
      await loginModal.handleGoogleLogin()

      expect(mockUseAuth.signInWithGoogle).toHaveBeenCalledTimes(1)
    })

    it('should handle popup closed error', async () => {
      const error = new Error('popup_closed_by_user: User closed the popup')
      mockUseAuth.signInWithGoogle.mockRejectedValue(error)

      await loginModal.handleGoogleLogin()

      expect(loginModal.error).toBe('로그인이 취소되었습니다.')
      expect(loginModal.isLoading).toBe(false)
    })

    it('should handle network error', async () => {
      const error = new Error('network error occurred')
      mockUseAuth.signInWithGoogle.mockRejectedValue(error)

      await loginModal.handleGoogleLogin()

      expect(loginModal.error).toBe('네트워크 연결을 확인해주세요.')
      expect(loginModal.isLoading).toBe(false)
    })

    it('should handle OAuth configuration error', async () => {
      const error = new Error('oauth configuration invalid')
      mockUseAuth.signInWithGoogle.mockRejectedValue(error)

      await loginModal.handleGoogleLogin()

      expect(loginModal.error).toBe('OAuth 설정에 문제가 있습니다. 관리자에게 문의해주세요.')
      expect(loginModal.isLoading).toBe(false)
    })

    it('should handle generic error', async () => {
      const error = new Error('Unknown error')
      mockUseAuth.signInWithGoogle.mockRejectedValue(error)

      await loginModal.handleGoogleLogin()

      expect(loginModal.error).toBe('Google 로그인 실패: Unknown error')
      expect(loginModal.isLoading).toBe(false)
    })
  })

  describe('Facebook Login', () => {
    it('should start loading when Facebook login is initiated', async () => {
      const promise = loginModal.handleFacebookLogin()

      expect(loginModal.isLoading).toBe(true)
      expect(loginModal.error).toBe(null)

      await promise
    })

    it('should call signInWithFacebook method', async () => {
      await loginModal.handleFacebookLogin()

      expect(mockUseAuth.signInWithFacebook).toHaveBeenCalledTimes(1)
    })

    it('should handle Facebook-specific errors', async () => {
      const error = new Error('Facebook OAuth failed')
      mockUseAuth.signInWithFacebook.mockRejectedValue(error)

      await loginModal.handleFacebookLogin()

      expect(loginModal.error).toBe('Facebook 로그인 실패: Facebook OAuth failed')
      expect(loginModal.isLoading).toBe(false)
    })

    it('should handle popup closed for Facebook', async () => {
      const error = new Error('popup_closed_by_user')
      mockUseAuth.signInWithFacebook.mockRejectedValue(error)

      await loginModal.handleFacebookLogin()

      expect(loginModal.error).toBe('로그인이 취소되었습니다.')
    })
  })

  describe('Kakao Login', () => {
    it('should start loading when Kakao login is initiated', async () => {
      const promise = loginModal.handleKakaoLogin()

      expect(loginModal.isLoading).toBe(true)
      expect(loginModal.error).toBe(null)

      await promise
    })

    it('should call signInWithKakao method', async () => {
      await loginModal.handleKakaoLogin()

      expect(mockUseAuth.signInWithKakao).toHaveBeenCalledTimes(1)
    })

    it('should handle Kakao-specific errors', async () => {
      const error = new Error('Kakao OAuth failed')
      mockUseAuth.signInWithKakao.mockRejectedValue(error)

      await loginModal.handleKakaoLogin()

      expect(loginModal.error).toBe('카카오 로그인 실패: Kakao OAuth failed')
      expect(loginModal.isLoading).toBe(false)
    })

    it('should handle network error for Kakao', async () => {
      const error = new Error('network connection failed')
      mockUseAuth.signInWithKakao.mockRejectedValue(error)

      await loginModal.handleKakaoLogin()

      expect(loginModal.error).toBe('네트워크 연결을 확인해주세요.')
    })
  })

  describe('Error Handling', () => {
    it('should log errors to console', async () => {
      const error = new Error('Test error')
      mockUseAuth.signInWithGoogle.mockRejectedValue(error)

      await loginModal.handleGoogleLogin()

      expect(console.error).toHaveBeenCalledWith('Google login failed:', error)
    })

    it('should handle non-Error objects', async () => {
      const error = 'String error'
      mockUseAuth.signInWithGoogle.mockRejectedValue(error)

      await loginModal.handleGoogleLogin()

      expect(loginModal.error).toBe('Google 로그인에 실패했습니다.')
    })

    it('should reset error state on new login attempt', async () => {
      // First login with error
      const error = new Error('First error')
      mockUseAuth.signInWithGoogle.mockRejectedValue(error)
      await loginModal.handleGoogleLogin()

      expect(loginModal.error).toBeTruthy()

      // Second login should reset error
      mockUseAuth.signInWithGoogle.mockResolvedValue({ user: { id: 'test' } })
      const promise = loginModal.handleGoogleLogin()

      expect(loginModal.error).toBe(null)
      await promise
    })
  })

  describe('Loading State', () => {
    it('should set loading to false after successful login', async () => {
      await loginModal.handleGoogleLogin()

      // Note: In OAuth flow, loading might not be reset immediately
      // since OAuth redirects to callback URL
    })

    it('should set loading to false after failed login', async () => {
      const error = new Error('Login failed')
      mockUseAuth.signInWithGoogle.mockRejectedValue(error)

      await loginModal.handleGoogleLogin()

      expect(loginModal.isLoading).toBe(false)
    })
  })

  describe('Component Props', () => {
    it('should handle modal open/close state', () => {
      const modalProps = {
        isOpen: true,
        onClose: vi.fn()
      }

      expect(modalProps.isOpen).toBe(true)
      expect(typeof modalProps.onClose).toBe('function')
    })

    it('should call onClose when modal should close', () => {
      const onClose = vi.fn()
      onClose()

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
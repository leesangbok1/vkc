'use client'

import { useState } from 'react'
import BaseModal from './BaseModal'
import { Button } from '@/components/ui/button'
import { BRAND_NAME, BRAND_SHORT_DESCRIPTION, LOGIN_CTA_TEXT } from '@/lib/constants/branding'
import { createClient } from '@/lib/supabase-client'
import { useLoginModal } from '@/contexts/LoginModalContext'

const DEFAULT_MESSAGE = 'Google 계정으로 간편하게 로그인하세요.'

export default function LoginModal() {
  const { isOpen, closeLoginModal, redirectTo, message } = useLoginModal()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
      }
    } catch (err) {
      console.error('[LoginModal] Google login failed:', err)
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setIsLoading(false)
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        closeLoginModal()
        setError(null)
        setIsLoading(false)
      }}
      title={`${BRAND_NAME} 로그인`}
      width="540px"
      maxWidth="95vw"
      className="login-modal-root"
    >
      <div className="login-modal-content">
        <div className="login-modal-header">
          <h2 translate="no" data-no-translate="true">{BRAND_NAME}</h2>
          <p translate="no" data-no-translate="true">{BRAND_SHORT_DESCRIPTION}</p>
          <p className="login-modal-message">{message || DEFAULT_MESSAGE}</p>
        </div>

        {error && (
          <div className="login-modal-error">
            {error}
          </div>
        )}

        <Button
          type="button"
          variant="primary-outline"
          className="login-modal-button"
          disabled={isLoading}
          onClick={handleGoogleLogin}
        >
          <span className="google-icon" aria-hidden />
          <span>{isLoading ? '로그인 중...' : LOGIN_CTA_TEXT}</span>
        </Button>

        <div className="login-modal-divider">
          <span />
          <span>커뮤니티 혜택</span>
          <span />
        </div>

        <ul className="login-modal-benefits">
          <li>
            <span className="benefit-icon" aria-hidden>🛂</span>
            <span>Certified User가 제공하는 신뢰도 높은 답변</span>
          </li>
          <li>
            <span className="benefit-icon" aria-hidden>🇻🇳</span>
            <span>베트남 커뮤니티 맞춤형 정보와 가이드</span>
          </li>
          <li>
            <span className="benefit-icon" aria-hidden>⚡</span>
            <span>중요 알림, 북마크 등 개인화 기능 이용</span>
          </li>
          <li>
            <span className="benefit-icon" aria-hidden>🏆</span>
            <span>미션·랭크 시스템으로 커뮤니티 활동 보상</span>
          </li>
        </ul>

        <p className="login-modal-footer">
          로그인 시 <a href="/terms" target="_blank" rel="noopener noreferrer">이용약관</a>과{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">개인정보처리방침</a>에 동의하게 됩니다.
        </p>
      </div>
    </BaseModal>
  )
}

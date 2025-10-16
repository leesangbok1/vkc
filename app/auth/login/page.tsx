'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🎯 Google 로그인 시작!')
      console.log('🔗 Redirect URL after auth:', redirectTo)

      // Supabase Auth: Google OAuth 로그인
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
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
        console.error('❌ Google 로그인 에러:', signInError)
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      console.log('✅ Google OAuth 리디렉션 시작...')
      // OAuth 리디렉션은 자동으로 이루어짐 (새 창 또는 현재 창)

    } catch (err) {
      console.error('❌ 예상치 못한 에러:', err)
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
      setIsLoading(false)
    }
  }

  return (
    <main className="main-layout login-page-layout">
      <div className="login-container">
        {/* Login Header */}
        <h1 className="login-title">VietKConnect에 오신걸 환영합니다</h1>
        <p className="login-subtitle">한국 생활의 모든 궁금증을 해결하세요</p>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <button
          className="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          style={{
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          <div className="google-icon"></div>
          <span>{isLoading ? '로그인 중...' : 'Google로 계속하기'}</span>
        </button>

        {/* Features Section */}
        <div className="features-section">
          <h3 className="features-title">VietKConnect의 특별한 점</h3>
          <ul className="features-list">
            <li className="feature-item">
              <span className="feature-icon">🛂</span>
              <span>비자, 취업, 법률 Certified User 답변</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">🇻🇳</span>
              <span>베트남 커뮤니티 맞춤 정보</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>빠르고 정확한 실시간 답변</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">🏆</span>
              <span>검증된 Certified User 인증 시스템</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="login-footer">
          로그인하시면 <a href="#">이용약관</a> 및 <a href="#">개인정보보호정책</a>에 동의하는 것으로 간주됩니다.
        </div>
      </div>
    </main>
  )
}

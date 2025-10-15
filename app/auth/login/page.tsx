'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  // 🎭 MOCK: 페이지 플로우 테스트용 - useEffect 제거하고 바로 로그인 폼 표시

  const handleGoogleLogin = () => {
    console.log('🎯 Google 로그인 버튼 클릭!')
    console.log('🔗 Redirect URL:', redirectTo)

    // 🔍 온보딩 완료 여부 체크
    const onboardingCompleted = localStorage.getItem('vietkconnect_onboarded')
    const existingUser = localStorage.getItem('mock_user')

    if (onboardingCompleted === 'true' && existingUser) {
      // ✅ 이미 온보딩 완료한 재방문자 → redirectTo로 이동
      console.log('✅ 온보딩 완료된 사용자 - redirectTo로 이동:', redirectTo)
      localStorage.setItem('mock_session', 'true')
      router.push(redirectTo)
      return
    }

    // 🎭 MOCK ADMIN LOGIN: 개발자 테스트용 - 온보딩 후 ADMIN 권한 부여
    console.log('✅ Mock 로그인 성공! (개발자 모드: 온보딩 후 ADMIN 권한 활성화)')

    // Mock session 저장 - ADMIN 모드로 초기화
    localStorage.setItem('mock_session', 'true')
    localStorage.setItem('mock_user', JSON.stringify({
      id: 'mock-admin-dev',
      email: 'dev@vietkconnect.com',
      name: '관리자 (개발 모드)',
      role: 'USER', // 온보딩 전에는 USER, 온보딩 후 ADMIN으로 업그레이드
      is_dev_mode: true, // 개발자 모드 플래그
      created_at: new Date().toISOString()
    }))

    // redirectTo 파라미터를 온보딩 페이지로 전달
    console.log('→ 온보딩 페이지로 이동 (전체 플로우 체험), 완료 후:', redirectTo)
    router.push(`/onboarding?redirectTo=${encodeURIComponent(redirectTo)}`)
  }

  return (
    <main className="main-layout login-page-layout">
      <div className="login-container">
        {/* Login Header */}
        <h1 className="login-title">VietKConnect에 오신걸 환영합니다</h1>
        <p className="login-subtitle">한국 생활의 모든 궁금증을 해결하세요</p>

        {/* Google Login Button */}
        <button className="google-login-btn" onClick={handleGoogleLogin}>
          <div className="google-icon"></div>
          <span>Google로 계속하기</span>
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

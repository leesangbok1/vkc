'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'

type UserTier = 'GUEST' | 'USER' | 'VERIFIED' | 'ADMIN'

export default function SettingsPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userExpertise, setUserExpertise] = useState('')
  const [userBio, setUserBio] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Notification toggles
  const [notifyNewQuestions, setNotifyNewQuestions] = useState(true)
  const [notifyAnswers, setNotifyAnswers] = useState(true)
  const [notifyExpertMatch, setNotifyExpertMatch] = useState(false)
  const [notifyWeeklySummary, setNotifyWeeklySummary] = useState(true)

  useEffect(() => {
    loadUserProfile()
  }, [])

  async function loadUserProfile() {
    try {
      const res = await fetch('/api/auth/profile', { cache: 'no-store' })
      if (!res.ok) {
        router.push('/auth/login?redirectTo=/settings')
        return
      }
      const { data } = await res.json()
      setUserName(data?.name || '사용자')
      setUserEmail(data?.email || '')
      setUserExpertise('IT 컨설팅')
      setUserBio('10년차 IT 컨설턴트로, 중소기업의 디지털 전환을 도와드립니다.')
    } catch (e) {
      console.error('Failed to load settings profile:', e)
      router.push('/auth/login?redirectTo=/settings')
    }
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setShowSuccess(true)
      setIsLoading(false)

      setTimeout(() => setShowSuccess(false), 3000)
    }, 1500)
  }


  return (
    <PageLayout variant="centered">
        {/* Page Header */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h1 className="card-title">계정 관리</h1>
          </div>
          <div className="card-content">
            <p style={{ color: '#6b7280' }}>
              프로필 정보 및 보안 설정 관리
            </p>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">🛡️ 계정 보안</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <SecurityItem
                title="Google OAuth 연동"
                description="Google 계정으로 안전하게 로그인"
                status="active"
                statusText="✅ 연결됨"
              />

              <SecurityItem
                title="2단계 인증"
                description="추가 보안을 위한 2FA 설정"
                status="inactive"
                statusText="❌ 미설정"
              />

              <SecurityItem
                title="비밀번호 변경"
                description="90일 전 마지막 변경"
                action={
                  <button className="btn-secondary">
                    변경
                  </button>
                }
              />

              <button className="btn-danger" style={{ width: '100%', marginTop: '0.5rem' }}>
                🗑️ 계정 삭제
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">👤 개인정보 관리</h2>
          </div>
          <div className="card-content">
            {showSuccess && (
              <div style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                background: '#d1fae5',
                color: '#065f46',
                border: '1px solid #a7f3d0'
              }}>
                프로필이 성공적으로 업데이트되었습니다!
              </div>
            )}

            {showError && (
              <div style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fecaca'
              }}>
                프로필 업데이트 중 오류가 발생했습니다.
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">이름</label>
                <input
                  type="text"
                  className="form-input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">이메일</label>
                <input
                  type="email"
                  className="form-input"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">전문 분야</label>
                <input
                  type="text"
                  className="form-input"
                  value={userExpertise}
                  onChange={(e) => setUserExpertise(e.target.value)}
                  placeholder="예: IT, 경영, 법률, 의료 등"
                />
              </div>

              <div className="form-group">
                <label className="form-label">자기소개</label>
                <textarea
                  className="form-textarea"
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  placeholder="간단한 자기소개를 작성해주세요"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? '💾 저장 중...' : '💾 프로필 저장'}
              </button>
            </form>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🔔 알림 설정</h2>
          </div>
          <div className="card-content">
            <NotificationItem
              title="새로운 질문 알림"
              description="관심 분야에 새로운 질문이 등록될 때"
              active={notifyNewQuestions}
              onToggle={() => setNotifyNewQuestions(!notifyNewQuestions)}
            />

            <NotificationItem
              title="답변 알림"
              description="내 질문에 새로운 답변이 달릴 때"
              active={notifyAnswers}
              onToggle={() => setNotifyAnswers(!notifyAnswers)}
            />

            <NotificationItem
              title="Certified User 매칭 알림"
              description="내 질문에 적합한 Certified User가 매칭될 때"
              active={notifyExpertMatch}
              onToggle={() => setNotifyExpertMatch(!notifyExpertMatch)}
            />

            <NotificationItem
              title="주간 요약 이메일"
              description="매주 인기 질문과 답변 요약"
              active={notifyWeeklySummary}
              onToggle={() => setNotifyWeeklySummary(!notifyWeeklySummary)}
              isLast
            />
          </div>
        </div>
    </PageLayout>
  )
}

// Notification Item Component
function NotificationItem({
  title,
  description,
  active,
  onToggle,
  isLast = false
}: {
  title: string
  description: string
  active: boolean
  onToggle: () => void
  isLast?: boolean
}) {
  return (
    <div className={`notification-item ${isLast ? '' : ''}`}>
      <div className="notification-item-content">
        <div className="notification-item-title">{title}</div>
        <div className="notification-item-description">{description}</div>
      </div>
      <div
        onClick={onToggle}
        className={`toggle-switch ${active ? 'active' : 'inactive'}`}
      >
        <div className="toggle-switch-handle" />
      </div>
    </div>
  )
}

// Security Item Component
function SecurityItem({
  title,
  description,
  status,
  statusText,
  action
}: {
  title: string
  description: string
  status?: 'active' | 'inactive'
  statusText?: string
  action?: React.ReactNode
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      borderRadius: '8px',
      background: '#f9fafb',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{description}</div>
      </div>
      {status && statusText && (
        <div style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: 600,
          background: status === 'active' ? '#d1fae5' : '#fee2e2',
          color: status === 'active' ? '#065f46' : '#991b1b'
        }}>
          {statusText}
        </div>
      )}
      {action}
    </div>
  )
}

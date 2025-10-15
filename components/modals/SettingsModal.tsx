'use client'

import { useState, useEffect } from 'react'
import BaseModal from './BaseModal'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'profile' | 'notifications' | 'security' | 'account'

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  // Profile states
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userExpertise, setUserExpertise] = useState('')
  const [userBio, setUserBio] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Notification states
  const [notifyNewQuestions, setNotifyNewQuestions] = useState(true)
  const [notifyAnswers, setNotifyAnswers] = useState(true)
  const [notifyExpertMatch, setNotifyExpertMatch] = useState(false)
  const [notifyWeeklySummary, setNotifyWeeklySummary] = useState(true)

  // Load user data
  useEffect(() => {
    if (isOpen) {
      const mockUser = localStorage.getItem('mock_user')
      if (mockUser) {
        const user = JSON.parse(mockUser)
        setUserName(user.name || 'Test User')
        setUserEmail(user.email || 'test@vietkconnect.com')
      }
      setUserExpertise('IT 컨설팅')
      setUserBio('10년차 IT 컨설턴트로, 중소기업의 디지털 전환을 도와드립니다.')
    }
  }, [isOpen])

  // Profile submit handler
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setShowSuccess(true)
      setIsLoading(false)

      setTimeout(() => setShowSuccess(false), 3000)
    }, 1500)
  }

  // Tab button style
  const tabStyle = (tab: TabType) => ({
    flex: 1,
    padding: '0.75rem 1rem',
    border: 'none',
    background: activeTab === tab ? '#3b82f6' : '#f3f4f6',
    color: activeTab === tab ? 'white' : '#6b7280',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  })

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      width="700px"
      adaptiveMode={true}
    >
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          설정
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
          프로필, 알림, 보안 설정을 관리하세요
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb'
      }}>
        <button onClick={() => setActiveTab('profile')} style={tabStyle('profile')}>
          👤 프로필
        </button>
        <button onClick={() => setActiveTab('notifications')} style={tabStyle('notifications')}>
          🔔 알림
        </button>
        <button onClick={() => setActiveTab('security')} style={tabStyle('security')}>
          🛡️ 보안
        </button>
        <button onClick={() => setActiveTab('account')} style={tabStyle('account')}>
          ⚙️ 계정
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              개인정보 관리
            </h2>

            {showSuccess && (
              <div style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                background: '#d1fae5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                fontSize: '0.875rem'
              }}>
                ✅ 프로필이 성공적으로 업데이트되었습니다!
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  이름
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  이메일
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  전문 분야
                </label>
                <input
                  type="text"
                  value={userExpertise}
                  onChange={(e) => setUserExpertise(e.target.value)}
                  placeholder="예: IT, 경영, 법률, 의료 등"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  자기소개
                </label>
                <textarea
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  placeholder="간단한 자기소개를 작성해주세요"
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: 'none',
                  background: isLoading ? '#d1d5db' : '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? '💾 저장 중...' : '💾 프로필 저장'}
              </button>
            </form>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              알림 설정
            </h2>

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
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              계정 보안
            </h2>

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
                <button style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  변경
                </button>
              }
            />
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              계정 관리
            </h2>

            <div style={{
              padding: '1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#991b1b',
                marginBottom: '0.5rem'
              }}>
                ⚠️ 계정 삭제
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#7f1d1d',
                marginBottom: '1rem',
                lineHeight: '1.6'
              }}>
                계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                작성한 질문, 답변, 댓글 등 모든 활동 기록이 삭제됩니다.
              </p>
              <button
                onClick={() => {
                  if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                    alert('계정 삭제 기능은 추후 구현 예정입니다.')
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: 'none',
                  background: '#dc2626',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🗑️ 계정 삭제
              </button>
            </div>

            <div style={{
              padding: '1rem',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px'
            }}>
              <h3 style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#0369a1',
                marginBottom: '0.5rem'
              }}>
                📊 계정 정보
              </h3>
              <div style={{ fontSize: '0.875rem', color: '#075985', lineHeight: '1.8' }}>
                <p>가입일: 2025년 10월 1일</p>
                <p>마지막 로그인: 방금 전</p>
                <p>작성한 질문: 12개</p>
                <p>작성한 답변: 34개</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
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
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      borderRadius: '8px',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      marginBottom: isLast ? 0 : '0.75rem'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {description}
        </div>
      </div>
      <div
        onClick={onToggle}
        style={{
          position: 'relative',
          width: '48px',
          height: '26px',
          borderRadius: '13px',
          background: active ? '#3b82f6' : '#d1d5db',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '3px',
          left: active ? '25px' : '3px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.2s'
        }} />
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
      border: '1px solid #e5e7eb',
      marginBottom: '0.75rem'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {description}
        </div>
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

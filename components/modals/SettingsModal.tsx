'use client'

import { useEffect, useMemo, useState } from 'react'
import BaseModal from './BaseModal'
import { useSafeAuth } from '@/components/providers/ClientProviders'
import {
  useNotificationPreferences
} from '@/lib/hooks/useNotificationPreferences'

type SettingsSection = 'account' | 'notifications'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  initialSection?: SettingsSection
}

export default function SettingsModal({ isOpen, onClose, initialSection }: SettingsModalProps) {
  const { user, profile, signOut } = useSafeAuth()
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection ?? 'account')

  useEffect(() => {
    if (!isOpen) return
    setActiveSection(initialSection ?? 'account')
  }, [initialSection, isOpen])

  const {
    preferences,
    updatePreference,
    savePreferences,
    loading,
    saving,
    dirty,
    error,
    resetError,
    browserPermission,
    requestBrowserPermission
  } = useNotificationPreferences({ enabled: isOpen })

  const accountEmail = user?.email || profile?.email || '이메일 정보 없음'
  const displayName =
    user?.user_metadata?.name ||
    profile?.name ||
    user?.email?.split('@')?.[0] ||
    '커뮤니티 회원'

  const providerLabel = useMemo(() => {
    if (!profile?.provider && !user) return '알 수 없음'
    const provider = (profile?.provider || 'google').toLowerCase()
    const map: Record<string, string> = {
      google: 'Google 계정',
      facebook: 'Facebook 계정',
      kakao: '카카오 계정',
      apple: 'Apple 계정',
      mock: '테스트 계정',
      unknown: '외부 계정'
    }
    return map[provider] ?? '외부 계정'
  }, [profile?.provider, user])

  const sections: Array<{ id: SettingsSection; label: string; emoji: string }> = useMemo(
    () => [
      { id: 'account', label: '계정 연결', emoji: '🔐' },
      { id: 'notifications', label: '알림 설정', emoji: '🔔' }
    ],
    []
  )

  const handleBrowserToggle = async () => {
    if (browserPermission === 'granted') {
      updatePreference('browser_notifications', !preferences.browser_notifications)
      return
    }
    const permission = await requestBrowserPermission()
    if (permission !== 'granted') {
      updatePreference('browser_notifications', false)
    }
  }

  const handleSavePreferences = async () => {
    const ok = await savePreferences()
    if (!ok) return
    resetError()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose()
    } catch (signOutError) {
      console.error('[SettingsModal] signOut failed', signOutError)
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      width="720px"
      maxWidth="95vw"
      borderRadius="24px"
      adaptiveMode
      showCloseButton
    >
      <header
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}
      >
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827', margin: 0 }}>설정</h1>
        <p style={{ marginTop: '0.45rem', color: '#6b7280', fontSize: '0.95rem' }}>
          계정 연동과 알림을 간편하게 관리하세요.
        </p>
      </header>

      <nav
        aria-label="설정 섹션 선택"
        style={{
          display: 'flex',
          gap: '0.75rem',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        {sections.map((section) => {
          const isActive = section.id === activeSection
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: isActive ? '#2563eb' : '#e5e7eb',
                background: isActive ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' : '#fff',
                color: isActive ? '#fff' : '#1f2937',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ marginRight: '0.4rem' }} aria-hidden>
                {section.emoji}
              </span>
              {section.label}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '1.75rem 1.5rem', maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {activeSection === 'account' && (
          <>
            <section
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                background: '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>로그인 정보</h2>
                  <p style={{ marginTop: '0.35rem', color: '#6b7280', fontSize: '0.92rem' }}>
                    {displayName}님은 {providerLabel}으로 로그인 중입니다.
                  </p>
                </div>
                <span
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '999px',
                    border: '1px solid #bfdbfe',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                >
                  연결됨
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: '1rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
                }}
              >
                <InfoCard
                  title="이메일"
                  value={accountEmail}
                  description="알림과 공지 사항을 받을 메일이에요."
                />
                <InfoCard
                  title="로그인 방식"
                  value={providerLabel}
                  description="현재 계정은 소셜 로그인으로 관리돼요."
                />
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  alignSelf: 'flex-start',
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #ef4444',
                  background: '#fff5f5',
                  color: '#b91c1c',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                로그아웃
              </button>
            </section>

            <section
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '1.5rem',
                background: '#f9fafb',
                color: '#4b5563',
                fontSize: '0.9rem',
                lineHeight: 1.6
              }}
            >
              🔒 Viet K-Connect는 지금은 비밀번호 없이 Google 계정으로 로그인합니다. 다른 연동은 준비 중이며, 보안 관련 안내가 있을 경우 이메일로 안내드릴게요.
            </section>
          </>
        )}

        {activeSection === 'notifications' && (
          <>
            <section
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                background: '#fff'
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>알림 채널</h2>
                <p style={{ marginTop: '0.35rem', color: '#6b7280', fontSize: '0.92rem' }}>
                  받아보고 싶은 채널과 유형을 선택하세요.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: '12px',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}
                >
                  {error}
                  <button
                    type="button"
                    onClick={resetError}
                    style={{
                      marginLeft: '0.75rem',
                      border: 'none',
                      background: 'transparent',
                      color: '#b91c1c',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    닫기
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <NotificationToggleRow
                  label="이메일 알림"
                  description="새 답변, 댓글, 인증 알림을 이메일로 받아요."
                  icon="📧"
                  loading={loading}
                  checked={preferences.email_notifications}
                  onToggle={() => updatePreference('email_notifications', !preferences.email_notifications)}
                />

                <NotificationToggleRow
                  label="브라우저 알림"
                  description={
                    browserPermission === 'granted'
                      ? '브라우저에서 실시간 알림이 켜져 있습니다.'
                      : '브라우저 알림 권한을 허용하면 바로 안내해 드려요.'
                  }
                  icon="💻"
                  loading={loading}
                  checked={browserPermission === 'granted' && preferences.browser_notifications}
                  onToggle={handleBrowserToggle}
                  cta={
                    browserPermission !== 'granted'
                      ? {
                          label: '권한 요청',
                          onClick: handleBrowserToggle
                        }
                      : undefined
                  }
                />

                <NotificationToggleRow
                  label="푸시 알림 (베타)"
                  description="PWA 설치 후 모바일 푸시로 받아볼 수 있어요."
                  icon="📱"
                  loading={loading}
                  checked={preferences.push_notifications}
                  onToggle={() => updatePreference('push_notifications', !preferences.push_notifications)}
                />

                <NotificationToggleRow
                  label="주간 요약 이메일"
                  description="한 주간 받은 공감, 인기 글을 요약해 드려요."
                  icon="🗓️"
                  loading={loading}
                  checked={preferences.weekly_digest}
                  onToggle={() => updatePreference('weekly_digest', !preferences.weekly_digest)}
                />
              </div>

              <div
                style={{
                  background: '#eff6ff',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  color: '#1d4ed8',
                  fontSize: '0.9rem'
                }}
              >
                기본적으로 내 질문의 답변, 댓글, 멘션 알림은 켜져 있습니다.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.65rem 1.1rem',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    color: '#4b5563',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={saving || loading || !dirty}
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: dirty ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' : '#e5e7eb',
                    color: dirty ? '#fff' : '#9ca3af',
                    fontWeight: 700,
                    cursor: saving || loading || !dirty ? 'not-allowed' : 'pointer',
                    boxShadow: dirty ? '0 10px 24px rgba(37, 99, 235, 0.2)' : 'none',
                    opacity: saving ? 0.75 : 1
                  }}
                >
                  {saving ? '저장 중...' : '변경 내용 저장'}
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </BaseModal>
  )
}

interface InfoCardProps {
  title: string
  value: string
  description: string
}

function InfoCard({ title, value, description }: InfoCardProps) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        background: '#f9fafb'
      }}
    >
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em' }}>
        {title}
      </span>
      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{value}</span>
      <span style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.5 }}>{description}</span>
    </div>
  )
}

interface NotificationToggleRowProps {
  label: string
  description: string
  icon: string
  checked: boolean
  loading: boolean
  onToggle: () => void
  cta?: { label: string; onClick: () => void }
}

function NotificationToggleRow({
  label,
  description,
  icon,
  checked,
  loading,
  onToggle,
  cta
}: NotificationToggleRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.1rem',
        borderRadius: '14px',
        border: '1px solid #e5e7eb',
        background: '#fff',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', flex: 1 }}>
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }} aria-hidden>
          {icon}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', textAlign: 'left' }}>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>{label}</span>
          <span style={{ fontSize: '0.92rem', color: '#6b7280', lineHeight: 1.5 }}>{description}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {cta && (
          <button
            type="button"
            onClick={cta.onClick}
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '999px',
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {cta.label}
          </button>
        )}
        <button
          type="button"
          onClick={onToggle}
          disabled={loading}
          style={{
            width: '52px',
            height: '30px',
            borderRadius: '999px',
            border: 'none',
            background: checked ? '#2563eb' : '#e5e7eb',
            position: 'relative',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s ease'
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '2px',
              left: checked ? '24px' : '2px',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
              transition: 'left 0.2s ease'
            }}
          />
        </button>
      </div>
    </div>
  )
}

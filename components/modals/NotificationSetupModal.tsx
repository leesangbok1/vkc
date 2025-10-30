'use client'

import BaseModal from './BaseModal'
import { useNotificationPreferences } from '@/lib/hooks/useNotificationPreferences'

interface NotificationSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  userEmail: string
}

export default function NotificationSetupModal({
  isOpen,
  onClose,
  onComplete,
  userEmail
}: NotificationSetupModalProps) {
  const {
    preferences,
    updatePreference,
    savePreferences,
    loading,
    saving,
    error,
    resetError,
    browserPermission,
    requestBrowserPermission
  } = useNotificationPreferences({ enabled: isOpen })

  const handleSave = async () => {
    const ok = await savePreferences()
    if (!ok) return
    onComplete()
  }

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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      width="620px"
      adaptiveMode
      closeOnOverlayClick={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2.6rem', marginBottom: '0.75rem' }}>🔔</div>
        <h3 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          답변 알림을 켜보세요
        </h3>
        <p style={{ marginTop: '0.55rem', color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6 }}>
          커뮤니티 활동 소식을 놓치지 않도록 최소한의 알림을 선택해 드릴게요.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: '1rem',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.92rem',
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

      <div
        style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          textAlign: 'left'
        }}
      >
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4b5563', letterSpacing: '0.05em' }}>
          등록된 이메일
        </span>
        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>
          {userEmail || '이메일 정보가 없습니다'}
        </span>
        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          이메일로 답변과 댓글 소식을 받아볼 수 있어요.
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <NotificationToggle
          label="이메일 알림"
          description="새 답변, 댓글 소식을 이메일로 받을게요."
          icon="📧"
          loading={loading}
          checked={preferences.email_notifications}
          onToggle={() => updatePreference('email_notifications', !preferences.email_notifications)}
        />

        <NotificationToggle
          label="브라우저 알림"
          description={
            browserPermission === 'granted'
              ? '브라우저에서 알림을 허용했어요.'
              : '알림 권한을 허용하면 브라우저에서 바로 알려드려요.'
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

        <NotificationToggle
          label="푸시 알림 (베타)"
          description="PWA 설치 후 푸시 알림을 받아볼 수 있어요."
          icon="📱"
          loading={loading}
          checked={preferences.push_notifications}
          onToggle={() => updatePreference('push_notifications', !preferences.push_notifications)}
        />
      </div>

      <div
        style={{
          background: '#eff6ff',
          borderRadius: '12px',
          padding: '0.85rem 1rem',
          color: '#1d4ed8',
          fontSize: '0.9rem',
          marginBottom: '1.75rem'
        }}
      >
        언제든지 설정 &gt; 알림에서 다시 변경할 수 있어요.
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '999px',
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#4b5563',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
        >
          나중에 할게요
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: saving || loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)',
            opacity: saving || loading ? 0.75 : 1,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          {saving ? '저장 중...' : '알림 설정 완료'}
        </button>
      </div>
    </BaseModal>
  )
}

interface NotificationToggleProps {
  label: string
  description: string
  icon: string
  checked: boolean
  loading: boolean
  onToggle: () => void
  cta?: { label: string; onClick: () => void }
}

function NotificationToggle({
  label,
  description,
  icon,
  checked,
  loading,
  onToggle,
  cta
}: NotificationToggleProps) {
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
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</span>
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

'use client'

import { useState, useEffect } from 'react'
import BaseModal from './BaseModal'

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
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // 기존 설정 로드
    const settings = localStorage.getItem('notification_settings')
    if (settings) {
      const parsed = JSON.parse(settings)
      setEmailNotif(parsed.email_notifications ?? true)
      setPushNotif(parsed.push_notifications ?? false)
    }
  }, [])

  const handleSave = () => {
    setSaving(true)

    // 알림 설정 저장
    const settings = {
      email_notifications: emailNotif,
      push_notifications: pushNotif,
      setup_completed: true,
      setup_date: new Date().toISOString()
    }

    localStorage.setItem('notification_settings', JSON.stringify(settings))

    // TODO: API로 DB 저장
    // await fetch('/api/users/notification-preferences', {
    //   method: 'POST',
    //   body: JSON.stringify(settings)
    // })

    setTimeout(() => {
      setSaving(false)
      onComplete()
    }, 500)
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      width="500px"
      adaptiveMode={true}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔔</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          답변 알림 받기
        </h3>
        <p style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.95rem' }}>
          질문에 답변이 달리면 알림을 보내드려요!
        </p>
      </div>

      {/* 이메일 확인 */}
      <div className="notification-info-box">
        <div className="info-label">이메일</div>
        <div className="info-value">{userEmail}</div>
        <div className="info-status">✅ 확인됨</div>
      </div>

      {/* 알림 옵션 */}
      <div className="notification-options">
        <div className="notification-option">
          <div className="option-left">
            <span className="option-icon">📧</span>
            <div className="option-text">
              <div className="option-title">이메일 알림</div>
              <div className="option-desc">새 답변, 댓글 알림</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={(e) => setEmailNotif(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="notification-option">
          <div className="option-left">
            <span className="option-icon">🔔</span>
            <div className="option-text">
              <div className="option-title">푸시 알림</div>
              <div className="option-desc">실시간 알림 (선택)</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={pushNotif}
              onChange={(e) => setPushNotif(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="notification-notice">
        💡 언제든지 설정에서 변경할 수 있어요
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
          나중에
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ flex: 1 }}
        >
          {saving ? '저장 중...' : '알림 설정 완료'}
        </button>
      </div>
    </BaseModal>
  )
}

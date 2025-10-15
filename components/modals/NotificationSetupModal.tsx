'use client'

import { useState } from 'react'

interface NotificationSetupModalProps {
  isOpen: boolean
  onClose: () => void
  context: 'question' | 'answer'
}

export default function NotificationSetupModal({ isOpen, onClose, context }: NotificationSetupModalProps) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailNotification, setEmailNotification] = useState(true)
  const [kakaoNotification, setKakaoNotification] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!isOpen) return null

  const handleSave = () => {
    // Save to localStorage
    const notificationSettings = {
      email: emailNotification ? email : null,
      phone: kakaoNotification ? phone : null,
      emailEnabled: emailNotification,
      kakaoEnabled: kakaoNotification,
      savedAt: new Date().toISOString()
    }

    localStorage.setItem('vietkconnect_notification_settings', JSON.stringify(notificationSettings))

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 2000)
  }

  const contextText = {
    question: {
      title: '질문 알림 설정',
      description: '이 질문에 새로운 답변이 달리면 알림을 받으시겠습니까?'
    },
    answer: {
      title: '답변 알림 설정',
      description: '답변이 채택되거나 댓글이 달리면 알림을 받으시겠습니까?'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{contextText[context].title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            {contextText[context].description}
          </p>

          {saved ? (
            <div className="alert alert-success">
              ✅ 알림 설정이 저장되었습니다!
            </div>
          ) : (
            <>
              {/* Email Notification */}
              <div className="notification-option">
                <div className="notification-option-header">
                  <label className="notification-option-label">
                    <input
                      type="checkbox"
                      checked={emailNotification}
                      onChange={(e) => setEmailNotification(e.target.checked)}
                      className="notification-checkbox"
                    />
                    <span>📧 이메일로 알림 받기</span>
                  </label>
                </div>

                {emailNotification && (
                  <div className="notification-option-input">
                    <input
                      type="email"
                      className="form-input"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* KakaoTalk Notification */}
              <div className="notification-option">
                <div className="notification-option-header">
                  <label className="notification-option-label">
                    <input
                      type="checkbox"
                      checked={kakaoNotification}
                      onChange={(e) => setKakaoNotification(e.target.checked)}
                      className="notification-checkbox"
                    />
                    <span>💬 카카오톡으로 알림 받기</span>
                  </label>
                </div>

                {kakaoNotification && (
                  <div className="notification-option-input">
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="010-1234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <p className="notification-option-hint">
                      카카오톡 알림은 휴대폰 번호로 전송됩니다
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="modal-footer">
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  나중에
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                  disabled={
                    (!emailNotification && !kakaoNotification) ||
                    (emailNotification && !email) ||
                    (kakaoNotification && !phone)
                  }
                >
                  저장하기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

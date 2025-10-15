'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

type UserTier = 'GUEST' | 'USER' | 'VERIFIED' | 'ADMIN'

export default function SettingsPage() {
  const router = useRouter()
  const [currentTier, setCurrentTier] = useState<UserTier>('USER')
  const [showExpertForm, setShowExpertForm] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userExpertise, setUserExpertise] = useState('')
  const [userBio, setUserBio] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Expert form fields
  const [expertField, setExpertField] = useState('')
  const [expertYears, setExpertYears] = useState('')
  const [expertCredentials, setExpertCredentials] = useState('')
  const [expertReason, setExpertReason] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  // Notification toggles
  const [notifyNewQuestions, setNotifyNewQuestions] = useState(true)
  const [notifyAnswers, setNotifyAnswers] = useState(true)
  const [notifyExpertMatch, setNotifyExpertMatch] = useState(false)
  const [notifyWeeklySummary, setNotifyWeeklySummary] = useState(true)

  useEffect(() => {
    loadUserProfile()
  }, [])

  function loadUserProfile() {
    // Mock user data - 실제로는 API에서 가져옴
    setTimeout(() => {
      const mockUser = localStorage.getItem('mock_user')
      if (mockUser) {
        const user = JSON.parse(mockUser)
        setUserName(user.name || 'Test User')
        setUserEmail(user.email || 'test@vietkconnect.com')
      }
      setUserExpertise('IT 컨설팅')
      setUserBio('10년차 IT 컨설턴트로, 중소기업의 디지털 전환을 도와드립니다.')
    }, 500)
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

  function handleExpertSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!expertField || !expertYears || !expertCredentials || !expertReason) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    if (parseInt(expertYears) < 1) {
      alert('경력 기간은 1년 이상이어야 합니다.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      alert('Certified User 인증 신청이 완료되었습니다!\n심사 결과는 3-5일 내에 이메일로 알려드립니다.')
      setShowExpertForm(false)
      setExpertField('')
      setExpertYears('')
      setExpertCredentials('')
      setExpertReason('')
      setUploadedFiles([])
      setIsLoading(false)
    }, 2000)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const fileList: string[] = []
    const fileDataList: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}의 크기가 10MB를 초과합니다.`)
        continue
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}은 지원하지 않는 파일 형식입니다.`)
        continue
      }

      fileList.push(file.name)

      // Convert file to base64 for localStorage storage
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        fileDataList.push(JSON.stringify({
          name: file.name,
          type: file.type,
          data: base64String
        }))

        // Save to localStorage when all files are processed
        if (fileDataList.length === fileList.length) {
          localStorage.setItem('verification_files', JSON.stringify(fileDataList))
        }
      }
      reader.readAsDataURL(file)
    }

    setUploadedFiles(fileList)
  }

  function getTierConfig(tier: UserTier) {
    const config = {
      'GUEST': { icon: '👁️', text: 'GUEST 권한 - 조회만 가능', class: 'tier-guest' },
      'USER': { icon: '👤', text: 'USER 권한 - 기본 사용자', class: 'tier-user' },
      'VERIFIED': { icon: '🎓', text: 'VERIFIED 권한 - Certified User', class: 'tier-verified' },
      'ADMIN': { icon: '⚙️', text: 'ADMIN 권한 - 시스템 관리자', class: 'tier-admin' }
    }
    return config[tier]
  }

  const tierConfig = getTierConfig(currentTier)

  return (
    <main className="main-layout">
      <div className="main-content">
        {/* Page Header */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h1 className="card-title">계정 관리 및 Certified User 인증</h1>
          </div>
          <div className="card-content">
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              프로필 정보 관리 및 Certified User 권한 신청
            </p>

            {/* Current Tier Badge */}
            <div className={`tier-badge ${tierConfig.class}`}>
              {tierConfig.icon} {tierConfig.text}
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">🚀 바로가기</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <a href="/topics/preferences" className="btn-secondary">
                💖 관심 토픽 설정
              </a>
              <a href="/profile" className="btn-secondary">
                👤 내 프로필 보기
              </a>
              <a href="/questions" className="btn-secondary">
                📝 내 질문 관리
              </a>
              <a href="/inbox" className="btn-secondary">
                💬 받은 응원박스
              </a>
            </div>
          </div>
        </div>

        {/* Verification Steps */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">🚀 권한 승급 단계</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <VerificationStep number={1} title="GUEST → USER" description="회원가입 완료 ✅" />
              <VerificationStep number={2} title="USER → VERIFIED" description="Certified User 인증 신청 후 심사" />
              <VerificationStep number={3} title="VERIFIED → ADMIN" description="시스템 관리자 초대" />
            </div>

            {currentTier === 'USER' && (
              <button
                className="btn-primary"
                onClick={() => setShowExpertForm(true)}
                style={{ marginTop: '1rem', width: '100%' }}
              >
                🎓 Certified User 인증 신청하기
              </button>
            )}
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

        {/* Expert Verification Application */}
        {showExpertForm && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2 className="card-title">🎓 Certified User 인증 신청</h2>
            </div>
            <div className="card-content">
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                VERIFIED 권한을 획득하여 Certified User로서 더 많은 기능을 사용하세요!
              </p>

              <form onSubmit={handleExpertSubmit}>
                <div className="form-group">
                  <label className="form-label">전문 분야</label>
                  <input
                    type="text"
                    className="form-input"
                    value={expertField}
                    onChange={(e) => setExpertField(e.target.value)}
                    placeholder="예: 소프트웨어 개발, 마케팅, 법률 상담"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">경력 기간</label>
                  <input
                    type="number"
                    className="form-input"
                    value={expertYears}
                    onChange={(e) => setExpertYears(e.target.value)}
                    placeholder="숫자만 입력 (년)"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">자격증/학위</label>
                  <textarea
                    className="form-textarea"
                    value={expertCredentials}
                    onChange={(e) => setExpertCredentials(e.target.value)}
                    placeholder="보유하신 자격증, 학위, 수상 경력 등을 작성해주세요"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">증빙 서류 업로드</label>
                  <div
                    style={{
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: uploadedFiles.length > 0 ? '#f0fdf4' : '#f9fafb',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => document.getElementById('fileUpload')?.click()}
                  >
                    {uploadedFiles.length > 0 ? (
                      <>
                        <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 600, marginBottom: '0.5rem' }}>
                          📁 업로드된 파일 ({uploadedFiles.length}개)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {uploadedFiles.join(', ')}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 600, marginBottom: '0.5rem' }}>
                          📁 클릭하여 파일 업로드
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          자격증, 학위증, 경력증명서 등 (PDF, JPG, PNG - 최대 10MB)
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    id="fileUpload"
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Certified User 신청 사유</label>
                  <textarea
                    className="form-textarea"
                    value={expertReason}
                    onChange={(e) => setExpertReason(e.target.value)}
                    placeholder="VietKConnect에서 Certified User로 활동하고 싶은 이유와 기여할 수 있는 내용을 작성해주세요"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                  style={{ background: '#10b981' }}
                >
                  {isLoading ? '🚀 신청 중...' : '🚀 Certified User 인증 신청'}
                </button>
              </form>
            </div>
          </div>
        )}

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
      </div>

      {/* Sidebar */}
      <Sidebar />
    </main>
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

// Verification Step Component
function VerificationStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      borderRadius: '8px',
      background: '#f9fafb',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        width: '2rem',
        height: '2rem',
        borderRadius: '50%',
        background: '#5682ef',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        flexShrink: 0
      }}>
        {number}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{description}</div>
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

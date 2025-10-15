'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import NotificationSetupModal from '@/components/modals/NotificationSetupModal'
import { CATEGORIES } from '@/lib/data/categories-mock'

export default function NewQuestionPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // 인증 확인 - Mock 세션 지원
  useEffect(() => {
    const checkAuth = async () => {
      // 🎭 MOCK: localStorage에서 mock session 체크
      const mockSession = localStorage.getItem('mock_session')
      const mockUser = localStorage.getItem('mock_user')
      const onboardingCompleted = localStorage.getItem('vietkconnect_onboarded')

      if (mockSession === 'true' && mockUser && onboardingCompleted === 'true') {
        // Mock 로그인 사용자 - 인증 완료
        setIsAuthenticated(true)
        return
      }

      // Real Supabase 인증 체크 (production용)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // 로그인 안 된 경우 홈으로 리다이렉트 (Header에서 모달 처리)
        // 직접 URL 접근 방지용 백업 체크
        console.warn('직접 URL 접근 감지 - 홈으로 리다이렉트')
        router.push('/')
      } else {
        setIsAuthenticated(true)
      }
    }

    checkAuth()
  }, [router])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('1') // 기본값: 첫 번째 카테고리
  const [submitting, setSubmitting] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  // 사용자 이메일 로드
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('mock_user') || '{}')
    setUserEmail(user.email || '')
  }, [])

  // 문자 카운터 업데이트
  const updateCharCounter = (current: number, max: number) => {
    return `${current} / ${max}`
  }

  // 폼 유효성 검사
  const isValid = title.trim().length >= 5 && content.trim().length >= 10

  // 알림 설정 완료 여부 체크
  const shouldShowNotificationModal = () => {
    const notifSettings = localStorage.getItem('notification_settings')
    if (!notifSettings) {
      return true // 알림 설정 안 함 → 모달 표시
    }

    const settings = JSON.parse(notifSettings)
    return !settings.setup_completed // setup_completed가 false면 모달 표시
  }

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (title.trim().length < 5) {
      alert('제목은 최소 5자 이상 작성해주세요')
      return
    }

    if (content.trim().length < 10) {
      alert('내용은 최소 10자 이상 작성해주세요')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category_id: categoryId,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // 질문 등록 성공 후 알림 설정 모달 표시 여부 확인
        if (shouldShowNotificationModal()) {
          setShowNotificationModal(true)
        } else {
          alert('질문이 성공적으로 등록되었습니다!')
          router.push(`/questions/${data.id}`)
        }
      } else {
        alert('질문 작성 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Question submission failed:', error)
      alert('질문 작성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 알림 설정 완료 핸들러
  const handleNotificationComplete = () => {
    setShowNotificationModal(false)
    alert('질문이 성공적으로 등록되었습니다!\n답변 알림을 받으실 수 있습니다.')
    router.push('/questions')
  }

  // 모달 닫기 핸들러 (나중에 설정)
  const handleNotificationClose = () => {
    setShowNotificationModal(false)
    alert('질문이 성공적으로 등록되었습니다!')
    router.push('/questions')
  }

  // 취소 핸들러
  const handleCancel = () => {
    router.push('/')
  }

  // 인증 확인 중일 때 로딩 표시
  if (isAuthenticated === null) {
    return (
      <main className="main-layout question-form-loading-container">
        <div className="question-form-loading-content">
          <div className="question-form-loading-icon">🔐</div>
          <p className="question-form-loading-text">인증 확인 중...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="main-layout question-form-main-layout">
      <div className="question-form-container">
        <div className="question-form-column">
          {/* Question Form */}
          <form onSubmit={handleSubmit} className="question-form">
            {/* Header */}
            <div className="question-form-header">
              <h1 className="question-form-title">무엇이든 물어보세요</h1>
              <p className="question-form-subtitle">답변은 언제나 무료예요.</p>
            </div>

            {/* Content */}
            <div className="question-form-content">
              {/* Category Selection */}
              <div className="question-field-group">
                <label htmlFor="question-category" className="question-field-label">
                  카테고리<span className="required">*</span>
                </label>
                <select
                  id="question-category"
                  className="question-field-input"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Title */}
              <div className="question-field-group">
                <label htmlFor="question-title" className="question-field-label">
                  질문 제목<span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="question-title"
                  className="question-field-input"
                  placeholder="간단하고 명확한 질문 제목을 작성해주세요"
                  maxLength={80}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <div className={`question-char-counter ${title.length > 72 ? 'warning' : ''}`}>
                  {updateCharCounter(title.length, 80)}
                  {title.length > 0 && title.length < 5 && (
                    <span className="validation-message">
                      (최소 5자)
                    </span>
                  )}
                </div>
              </div>

              {/* Question Content */}
              <div className="question-field-group">
                <label htmlFor="question-content" className="question-field-label">
                  질문 내용<span className="required">*</span>
                </label>
                <div className="question-textarea-container">
                  <div className="question-formatting-toolbar">
                    <button type="button" className="question-format-btn" title="이미지 첨부">📷</button>
                    <button type="button" className="question-format-btn" title="목록">📝</button>
                    <button type="button" className="question-format-btn" title="굵게"><strong>B</strong></button>
                    <button type="button" className="question-format-btn" title="링크">🔗</button>
                  </div>
                  <textarea
                    id="question-content"
                    className="question-field-textarea"
                    placeholder="구체적인 상황과 궁금한 점을 자세히 설명해주세요.

예시:
- 현재 상황은 어떤가요?
- 어떤 도움이 필요한가요?
- 시도해본 방법이 있나요?"
                    maxLength={10000}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
                <div className={`question-char-counter ${content.length > 9000 ? 'warning' : ''}`}>
                  {updateCharCounter(content.length, 10000)}
                  {content.length > 0 && content.length < 10 && (
                    <span className="validation-message">
                      (최소 10자)
                    </span>
                  )}
                </div>
                <div className="question-field-help">
                  구체적이고 자세한 설명일수록 더 정확한 답변을 받을 수 있어요.
                </div>
              </div>

              {/* Form Actions */}
              <div className="question-form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="question-btn-secondary"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="question-btn-primary"
                >
                  {submitting ? '등록 중...' : '질문 등록'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="question-tips-column">
          {/* Tips Section */}
          <div className="question-tips-section">
            <h3 className="question-tips-title">
              💡 좋은 질문 작성 팁
            </h3>
            <ul className="question-tips-list">
              <li>제목은 간단명료하게, 내용에서 구체적인 상황을 설명해주세요</li>
              <li>개인정보는 포함하지 말고, 일반적인 상황으로 질문해주세요</li>
              <li>관련된 토픽을 선택하면 해당 분야 Certified User가 답변해드려요</li>
              <li>이전에 시도해본 방법이나 참고한 자료가 있다면 함께 적어주세요</li>
              <li>예의를 지켜주시면 더 많은 도움을 받을 수 있어요</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Notification Setup Modal */}
      <NotificationSetupModal
        isOpen={showNotificationModal}
        onClose={handleNotificationClose}
        onComplete={handleNotificationComplete}
        userEmail={userEmail}
      />
    </main>
  )
}

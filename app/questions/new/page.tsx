'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import NotificationSetupModal from '@/components/modals/NotificationSetupModal'
import RichEditor from '@/components/editor/RichEditor'
import { EDITOR_USAGE_GUIDE } from '@/lib/constants/editor'

export default function NewQuestionPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [categories, setCategories] = useState<Array<{ id: number; name: string; icon?: string | null }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  // 인증 확인
  useEffect(() => {
    let cancelled = false

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store' })
        if (!res.ok) {
          router.push('/auth/login?redirectTo=/questions/new')
          return
        }
        if (!cancelled) {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('[QuestionNew] auth check failed', error)
        router.push('/auth/login?redirectTo=/questions/new')
      }
    }

    checkAuth()

    return () => {
      cancelled = true
    }
  }, [router])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  // 사용자 이메일 로드
  useEffect(() => {
    async function loadProfileEmail() {
      try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const email = json?.data?.email
        if (typeof email === 'string') {
          setUserEmail(email)
        }
      } catch (profileError) {
        console.warn('[QuestionNew] failed to load user email', profileError)
      }
    }

    loadProfileEmail()
  }, [])

  useEffect(() => {
    if (isAuthenticated === false) return
    let ignore = false

    const loadCategories = async () => {
      setLoadingCategories(true)
      setCategoryError(null)
      try {
        const res = await fetch('/api/categories', { cache: 'no-store', credentials: 'include' })
        if (!res.ok) {
          throw new Error(`failed ${res.status}`)
        }
        const json = await res.json().catch(() => null)
        const items = Array.isArray(json?.data) ? json.data : []
        const mapped = items
          .map((item: any) => ({
            id: Number(item?.id),
            name: item?.name ?? '카테고리',
            icon: item?.icon ?? null,
          }))
          .filter((item) => Number.isFinite(item.id))

        if (!ignore) {
          setCategories(mapped)
          setCategoryId((prev) => {
            if (prev) return prev
            const first = mapped[0]
            return first ? String(first.id) : ''
          })
        }
      } catch (error) {
        console.error('[QuestionNew] failed to load categories', error)
        if (!ignore) {
          setCategories([])
          setCategoryError('카테고리를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
          setCategoryId('')
        }
      } finally {
        if (!ignore) setLoadingCategories(false)
      }
    }

    loadCategories()
    return () => {
      ignore = true
    }
  }, [isAuthenticated])

  const MIN_TITLE_LENGTH = 5
  const MIN_CONTENT_LENGTH = 10

  const isValid =
    title.trim().length >= MIN_TITLE_LENGTH &&
    content.trim().length >= MIN_CONTENT_LENGTH &&
    categoryId !== ''

  const persistNotificationSettings = (patch: Record<string, unknown>) => {
    if (typeof window === 'undefined') return
    try {
      const currentRaw = window.localStorage.getItem('notification_settings')
      const current = currentRaw ? JSON.parse(currentRaw) : {}
      const next = {
        ...current,
        ...patch,
      }
      window.localStorage.setItem('notification_settings', JSON.stringify(next))
    } catch (error) {
      console.warn('[QuestionNew] failed to persist notification settings', error)
    }
  }

  // 알림 설정 완료 여부 체크
  const shouldShowNotificationModal = () => {
    if (typeof window === 'undefined') return false
    const notifSettings = window.localStorage.getItem('notification_settings')
    if (!notifSettings) {
      return true // 알림 설정 안 함 → 모달 표시
    }

    try {
      const settings = JSON.parse(notifSettings)
      if (settings?.dismissed) {
        return false
      }
      return !settings?.setup_completed // setup_completed가 false면 모달 표시
    } catch (error) {
      console.warn('[QuestionNew] failed to parse notification settings', error)
      return true
    }
  }

  const submitQuestion = async () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (trimmedTitle.length < MIN_TITLE_LENGTH) {
      alert(`제목은 최소 ${MIN_TITLE_LENGTH}자 이상 작성해주세요`)
      return
    }

    if (trimmedContent.length < MIN_CONTENT_LENGTH) {
      alert(`내용은 최소 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요`)
      return
    }

    if (!categoryId) {
      alert('카테고리를 선택해주세요')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          category_id: Number(categoryId),
        }),
      })

      const json = await response.json().catch(() => null)

      if (response.ok) {
        // 질문 등록 성공 후 알림 설정 모달 표시 여부 확인
        if (shouldShowNotificationModal()) {
          setShowNotificationModal(true)
          persistNotificationSettings({
            last_prompted_at: new Date().toISOString(),
          })
        } else {
          alert('질문이 성공적으로 등록되었습니다!')
          router.push('/my-questions?tab=questions')
        }
      } else {
        const message = json?.error || '질문 작성 중 오류가 발생했습니다.'
        const details = json?.details || json?.hint
        alert(details ? `${message}\n세부 정보: ${details}` : message)
      }
    } catch (error) {
      console.error('Question submission failed:', error)
      alert('질문 작성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    await submitQuestion()
  }

  // 알림 설정 완료 핸들러
  const handleNotificationComplete = () => {
    persistNotificationSettings({
      setup_completed: true,
      dismissed: false,
      completed_at: new Date().toISOString(),
    })
    setShowNotificationModal(false)
    alert('질문이 성공적으로 등록되었습니다!\n답변 알림을 받으실 수 있습니다.')
    router.push('/my-questions?tab=questions')
  }

  // 모달 닫기 핸들러 (나중에 설정)
  const handleNotificationClose = () => {
    persistNotificationSettings({
      dismissed: true,
      dismissed_at: new Date().toISOString(),
      setup_completed: false,
    })
    setShowNotificationModal(false)
    alert('질문이 성공적으로 등록되었습니다!')
    router.push('/my-questions?tab=questions')
  }

  // 취소 핸들러
  const handleCancel = () => {
    router.push('/')
  }

  // 인증 확인 중일 때 로딩 표시
  if (isAuthenticated === null) {
    return (
      <PageLayout variant="centered">
        <div className="question-form-loading-content">
          <div className="question-form-loading-icon">🔐</div>
          <p className="question-form-loading-text" suppressHydrationWarning>인증 확인 중...</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="centered">
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
                {loadingCategories ? (
                  <div className="question-field-help">카테고리를 불러오는 중입니다...</div>
                ) : categoryError ? (
                  <div className="question-field-error">{categoryError}</div>
                ) : (
                  <select
                    id="question-category"
                    className="question-field-input"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="">카테고리를 선택하세요</option>
                    {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.icon ?? '🏷️'} {category.name}
                      </option>
                    ))}
                  </select>
                )}
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
                  {`${title.length} / 80`}
                  {title.length > 0 && title.length < MIN_TITLE_LENGTH && (
                    <span className="validation-message">
                      (최소 {MIN_TITLE_LENGTH}자)
                    </span>
                  )}
                </div>
              </div>

              {/* Question Content */}
              <div className="question-field-group">
                <label htmlFor="question-content" className="question-field-label">
                  질문 내용<span className="required">*</span>
                </label>
                <RichEditor
                  value={content}
                  onChange={setContent}
                  minRows={12}
                  maxLength={10000}
                  disabled={submitting}
                  placeholder={`구체적인 상황과 궁금한 점을 자세히 설명해주세요.

예시:
- 현재 상황은 어떤가요?
- 어떤 도움이 필요한가요?
- 시도해본 방법이 있나요?`}
                  onSubmitShortcut={submitQuestion}
                  helperText={EDITOR_USAGE_GUIDE}
                />
                <div className={`question-char-counter ${content.length > 9000 ? 'warning' : ''}`}>
                  {`${content.length} / 10000`}
                  {content.trim().length > 0 && content.trim().length < MIN_CONTENT_LENGTH && (
                    <span className="validation-message">
                      (최소 {MIN_CONTENT_LENGTH}자)
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
    </PageLayout>
  )
}

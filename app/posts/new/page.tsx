'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import RichEditor from '@/components/editor/RichEditor'
import { EDITOR_USAGE_GUIDE } from '@/lib/constants/editor'

export default function NewPostPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [categories, setCategories] = useState<Array<{ id: number; name: string; icon?: string | null }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store', credentials: 'include' })
        if (!res.ok) {
          router.push('/auth/login?redirectTo=/posts/new')
          return
        }
        setIsAuthenticated(true)
      } catch (error) {
        console.error('[PostNew] auth check failed', error)
        router.push('/auth/login?redirectTo=/posts/new')
      }
    }

    checkAuth()
  }, [router])

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
        console.error('[PostNew] failed to load categories', error)
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

  // 문자 카운터 업데이트
  const updateCharCounter = (current: number, max: number) => {
    return `${current} / ${max}`
  }

  const MIN_TITLE_LENGTH = 5
  const MIN_CONTENT_LENGTH = 10

  // 폼 유효성 검사
  const isValid =
    title.trim().length >= MIN_TITLE_LENGTH &&
    content.trim().length >= MIN_CONTENT_LENGTH &&
    categoryId !== ''

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (title.trim().length < MIN_TITLE_LENGTH) {
      alert(`제목은 최소 ${MIN_TITLE_LENGTH}자 이상 작성해주세요`)
      return
    }

    if (content.trim().length < MIN_CONTENT_LENGTH) {
      alert(`내용은 최소 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요`)
      return
    }

    if (!categoryId) {
      alert('토픽을 선택해주세요')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category_id: Number(categoryId),
        }),
      })

      const json = await response.json().catch(() => null)

      if (response.ok) {
        alert('정보 글이 성공적으로 등록되었습니다!')
        const highlightId = json?.data?.id
        router.push(highlightId ? `/posts?highlight=${highlightId}` : '/posts')
      } else {
        const message = json?.error || '정보 글 작성 중 오류가 발생했습니다.'
        const details = json?.details || json?.hint
        alert(details ? `${message}\n세부 정보: ${details}` : message)
      }
    } catch (error) {
      console.error('Post submission failed:', error)
      alert('정보 글 작성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 취소 핸들러
  const handleCancel = () => {
    router.push('/posts')
  }

  // 인증 확인 중일 때 로딩 표시
  if (isAuthenticated === null) {
    return (
      <PageLayout variant="centered">
        <div className="post-auth-check-container">
          <div className="post-auth-check-icon">🔐</div>
          <p className="post-auth-check-message">인증 확인 중...</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="centered">
      <div className="post-page-container">
        <div className="post-form-column">
          {/* Post Form */}
          <form onSubmit={handleSubmit} className="post-form-container">
            {/* Header */}
            <div className="post-form-header">
              <h1 className="post-form-title">유익한 정보를 공유해주세요</h1>
              <p className="post-form-subtitle">여러분의 정보는 동포들에게 귀중한 자산이 됩니다.</p>
            </div>

            {/* Content */}
            <div className="post-form-content">
              {/* Topic Selection */}
              <div className="post-field-group">
                <label htmlFor="post-category" className="post-field-label">
                  토픽<span className="post-field-required">*</span>
                </label>
                {loadingCategories ? (
                  <div className="post-field-help">토픽을 불러오는 중입니다...</div>
                ) : categoryError ? (
                  <div className="post-field-error">{categoryError}</div>
                ) : (
                  <>
                    <select
                      id="post-category"
                      className="post-field-select"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                    >
                      <option value="">토픽을 선택하세요</option>
                      {categories.map((category) => (
                        <option key={category.id} value={String(category.id)}>
                          {category.icon ?? '🏷️'} {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="post-field-help">
                      정보 글이 속할 토픽을 선택해주세요. 적절한 토픽을 선택하면 더 많은 분들이 찾을 수 있습니다.
                    </div>
                  </>
                )}
              </div>

              {/* Post Title */}
              <div className="post-field-group">
                <label htmlFor="post-title" className="post-field-label">
                  제목<span className="post-field-required">*</span>
                </label>
                <input
                  type="text"
                  id="post-title"
                  className="post-field-input"
                  placeholder="간단하고 명확한 제목을 작성해주세요"
                  maxLength={80}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <div className={`post-char-counter ${title.length > 72 ? 'over-limit' : ''}`}>
                  {updateCharCounter(title.length, 80)}
                </div>
              </div>

              {/* Post Content */}
              <div className="post-field-group">
                <label htmlFor="post-content" className="post-field-label">
                  내용<span className="post-field-required">*</span>
                </label>
                <RichEditor
                  value={content}
                  onChange={setContent}
                  minRows={12}
                  maxLength={10000}
                  placeholder={`유용한 정보를 자세히 공유해주세요.

예시:
- 어떤 정보인가요?
- 언제, 어디서 유용한가요?
- 주의해야 할 점이 있나요?
- 추가로 알아두면 좋은 내용은?`}
                  helperText={EDITOR_USAGE_GUIDE}
                />
                <div className={`post-char-counter ${content.length > 9000 ? 'over-limit' : ''}`}>
                  {updateCharCounter(content.length, 10000)}
                </div>
                <div className="post-field-help">
                  구체적이고 자세한 정보일수록 더 많은 분들에게 도움이 됩니다.
                </div>
              </div>

              {/* Form Actions */}
              <div className="post-form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="post-btn-secondary"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="post-btn-primary"
                >
                  {submitting ? '등록 중...' : '정보 글 등록'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="post-tips-column">
          {/* Tips Section */}
          <div className="post-tips-section">
            <h3 className="post-tips-title">
              💡 좋은 정보 글 작성 팁
            </h3>
            <ul className="post-tips-list">
              <li className="post-tips-item">실제 경험을 바탕으로 작성하면 더 신뢰받을 수 있어요</li>
              <li className="post-tips-item">개인정보는 포함하지 말고, 일반적인 정보로 공유해주세요</li>
              <li className="post-tips-item">구체적인 장소, 시간, 방법 등을 포함하면 더 유용해요</li>
              <li className="post-tips-item">관련 링크나 참고 자료가 있다면 함께 공유해주세요</li>
              <li className="post-tips-item">주의사항이나 팁도 함께 알려주시면 좋아요</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import RichEditor from '@/components/editor/RichEditor'
import { EDITOR_USAGE_GUIDE } from '@/lib/constants/editor'

type CategoryOption = {
  id: number
  name: string
  icon?: string
}

export default function AdminNewsNewPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store' })
        if (!res.ok) {
          router.push('/auth/login?redirectTo=/admin/news/new')
          return
        }
        const profile = await res.json()
        const data = profile?.data
        const admin = data?.admin_yn === 'Y' || data?.role?.toLowerCase?.() === 'admin'
        if (!admin) {
          alert('기사/소식 게시글 작성은 관리자만 가능합니다.')
          router.push('/admin')
          return
        }
        setIsAdmin(true)
      } catch (error) {
        console.error('[AdminNewsNewPage] failed to verify admin', error)
        router.push('/admin')
      } finally {
        setIsChecking(false)
      }
    }

    checkAdmin()
  }, [router])

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true)
      setCategoryError(null)
      try {
        const res = await fetch('/api/categories?include_inactive=false', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`failed ${res.status}`)
        }
        const json = await res.json()
        const items = Array.isArray(json?.data) ? json.data : []
        const mapped = items
          .map((item: any) => ({
            id: Number(item?.id),
            name: item?.name ?? '카테고리',
            icon: item?.icon ?? undefined,
          }))
          .filter((item) => Number.isFinite(item.id))

        setCategories(mapped)
        if (mapped.length > 0) {
          setCategoryId(String(mapped[0].id))
        }
      } catch (error) {
        console.error('[AdminNewsNewPage] failed to load categories', error)
        setCategoryError('카테고리를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        setLoadingCategories(false)
      }
    }

    if (isAdmin) {
      loadCategories()
    }
  }, [isAdmin])

  const MIN_TITLE_LENGTH = 5
  const MIN_CONTENT_LENGTH = 10

  const isValid =
    title.trim().length >= MIN_TITLE_LENGTH &&
    content.trim().length >= MIN_CONTENT_LENGTH &&
    categoryId !== ''

  const submitNews = async () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (trimmedTitle.length < MIN_TITLE_LENGTH || trimmedContent.length < MIN_CONTENT_LENGTH) {
      alert(`제목은 최소 ${MIN_TITLE_LENGTH}자, 내용은 최소 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요.`)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          category_id: Number(categoryId),
          post_type: 'news'
        })
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        const message = payload?.error || '기사 등록에 실패했습니다.'
        alert(message)
        return
      }

      const payload = await res.json().catch(() => null)
      alert('기사/소식 게시글이 등록되었습니다.')
      const highlightId = payload?.data?.id
      router.push(highlightId ? `/posts?highlight=${highlightId}` : '/posts')
    } catch (error) {
      console.error('[AdminNewsNewPage] submit failed', error)
      alert('기사 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return
    await submitNews()
  }

  if (isChecking) {
    return (
      <PageLayout variant="centered">
        <div className="post-auth-check-container">
          <div className="post-auth-check-icon">🔐</div>
          <p className="post-auth-check-message">관리자 권한 확인 중...</p>
        </div>
      </PageLayout>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <PageLayout variant="centered">
      <div className="post-page-container">
        <div className="post-form-column">
          <form onSubmit={handleSubmit} className="post-form-container">
            <div className="post-form-header">
              <h1 className="post-form-title">기사 · 소식 작성</h1>
              <p className="post-form-subtitle">관리자 전용 등록 화면입니다. 확인된 정보를 공유해주세요.</p>
            </div>

            <div className="post-form-content">
              <div className="post-field-group">
                <label htmlFor="news-category" className="post-field-label">
                  토픽<span className="post-field-required">*</span>
                </label>
                {loadingCategories ? (
                  <div className="post-field-loading">카테고리를 불러오는 중...</div>
                ) : categoryError ? (
                  <div className="post-field-error">{categoryError}</div>
                ) : (
                  <select
                    id="news-category"
                    className="post-field-input"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon ?? '🏷️'} {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="post-field-group">
                <label htmlFor="news-title" className="post-field-label">
                  제목<span className="post-field-required">*</span>
                </label>
                <input
                  id="news-title"
                  type="text"
                  className="post-field-input"
                  placeholder="기사 제목을 입력해주세요"
                  value={title}
                  maxLength={120}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
                <div className={`post-char-counter ${title.length > 100 ? 'over-limit' : ''}`}>
                  {`${title.length} / 120`}
                </div>
              </div>

              <div className="post-field-group">
                <label htmlFor="news-content" className="post-field-label">
                  내용<span className="post-field-required">*</span>
                </label>
                <RichEditor
                  value={content}
                  onChange={setContent}
                  minRows={12}
                  maxLength={20000}
                  disabled={submitting}
                  placeholder="기사 본문을 입력해주세요 (최소 10자)"
                  onSubmitShortcut={submitNews}
                  helperText={EDITOR_USAGE_GUIDE}
                />
                <div className={`post-char-counter ${content.length > 18000 ? 'over-limit' : ''}`}>
                  {`${content.length} / 20000`}
                  {content.trim().length > 0 && content.trim().length < MIN_CONTENT_LENGTH && (
                    <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>
                      (최소 {MIN_CONTENT_LENGTH}자)
                    </span>
                  )}
                </div>
              </div>

              <div className="post-form-actions">
                <button
                  type="button"
                  className="post-btn-secondary"
                  onClick={() => router.push('/admin')}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="post-btn-primary"
                  disabled={!isValid || submitting}
                >
                  {submitting ? '등록 중...' : '기사 등록'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="post-tips-column">
          <div className="post-tips-section">
            <h3 className="post-tips-title">📰 기사 작성 가이드</h3>
            <ul className="post-tips-list">
              <li className="post-tips-item">사실 확인 후 검증된 정보만 등록해주세요.</li>
              <li className="post-tips-item">근거 자료나 공식 출처를 함께 첨부하면 신뢰도를 높일 수 있습니다.</li>
              <li className="post-tips-item">카테고리를 정확히 지정하면 독자들이 더 쉽게 찾을 수 있습니다.</li>
              <li className="post-tips-item">민감 정보(개인정보 등)는 포함되지 않도록 주의해주세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

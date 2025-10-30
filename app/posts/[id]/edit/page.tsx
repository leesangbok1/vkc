'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import RichEditor from '@/components/editor/RichEditor'

type CategoryOption = {
  id: number
  name: string
  icon?: string | null
}

const MIN_TITLE_LENGTH = 5
const MIN_CONTENT_LENGTH = 10

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const postId = params?.id ?? ''

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loadingPost, setLoadingPost] = useState(true)
  const [postError, setPostError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [hasLoadedInitialValue, setHasLoadedInitialValue] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/profile', {
          cache: 'no-store',
          credentials: 'include'
        })
        if (!res.ok) {
          router.push(`/auth/login?redirectTo=/posts/${postId}/edit`)
          return
        }
        setIsAuthenticated(true)
      } catch (error) {
        console.error('[PostEdit] auth check failed', error)
        router.push(`/auth/login?redirectTo=/posts/${postId}/edit`)
      }
    }

    checkAuth()
  }, [postId, router])

  useEffect(() => {
    if (isAuthenticated !== true) return
    let ignore = false

    const loadCategories = async () => {
      setLoadingCategories(true)
      setCategoryError(null)
      try {
        const res = await fetch('/api/categories', {
          cache: 'no-store',
          credentials: 'include'
        })
        if (!res.ok) {
          throw new Error(`failed ${res.status}`)
        }
        const json = await res.json().catch(() => null)
        const items = Array.isArray(json?.data) ? json.data : []
        const mapped = items
          .map((item: any) => ({
            id: Number(item?.id),
            name: item?.name ?? '카테고리',
            icon: item?.icon ?? null
          }))
          .filter((item) => Number.isFinite(item.id))

        if (!ignore) {
          setCategories(mapped)
        }
      } catch (error) {
        console.error('[PostEdit] failed to load categories', error)
        if (!ignore) {
          setCategories([])
          setCategoryError('카테고리를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
        }
      } finally {
        if (!ignore) {
          setLoadingCategories(false)
        }
      }
    }

    loadCategories()
    return () => {
      ignore = true
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated !== true || !postId) return
    let ignore = false

    const loadPost = async () => {
      setLoadingPost(true)
      setPostError(null)
      try {
        const res = await fetch(`/api/posts/${postId}`, {
          cache: 'no-store',
          credentials: 'include'
        })

        if (res.status === 404) {
          if (!ignore) {
            setPostError('해당 게시글을 찾을 수 없습니다.')
            setLoadingPost(false)
          }
          return
        }

        const json = await res.json().catch(() => null)

        if (!res.ok || !json?.data) {
          const message = json?.error || '게시글을 불러오지 못했습니다.'
          throw new Error(message)
        }

        if (json?.data?.viewer_can_manage !== true) {
          alert('이 게시글을 수정할 권한이 없습니다.')
          router.replace(`/posts/${postId}`)
          return
        }

        if (!ignore) {
          const data = json.data
          setTitle(data.title ?? '')
          setContent(data.content ?? '')
          const resolvedCategoryId =
            typeof data.category?.id === 'number'
              ? String(data.category.id)
              : data.category_id
                ? String(data.category_id)
                : ''
          setCategoryId(resolvedCategoryId)
          setHasLoadedInitialValue(true)
        }
      } catch (error: any) {
        console.error('[PostEdit] failed to load post', error)
        if (!ignore) {
          setPostError(error?.message || '게시글을 불러오지 못했습니다.')
        }
      } finally {
        if (!ignore) {
          setLoadingPost(false)
        }
      }
    }

    loadPost()
    return () => {
      ignore = true
    }
  }, [isAuthenticated, postId, router])

  const isValid = useMemo(() => {
    return (
      title.trim().length >= MIN_TITLE_LENGTH &&
      content.trim().length >= MIN_CONTENT_LENGTH &&
      categoryId !== ''
    )
  }, [title, content, categoryId])

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      if (!postId) return

      if (title.trim().length < MIN_TITLE_LENGTH) {
        alert(`제목은 최소 ${MIN_TITLE_LENGTH}자 이상 작성해주세요.`)
        return
      }
      if (content.trim().length < MIN_CONTENT_LENGTH) {
        alert(`내용은 최소 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요.`)
        return
      }
      if (!categoryId) {
        alert('토픽을 선택해주세요.')
        return
      }

      setSubmitting(true)
      try {
        const res = await fetch(`/api/posts/${postId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            category_id: Number(categoryId)
          })
        })
        const json = await res.json().catch(() => null)

        if (!res.ok || !json?.success) {
          const message = json?.error || '게시글 수정에 실패했습니다.'
          const details = json?.details || json?.hint
          alert(details ? `${message}\n세부 정보: ${details}` : message)
          return
        }

        alert('게시글이 성공적으로 수정되었습니다.')
        router.push(`/posts/${postId}`)
      } catch (error) {
        console.error('[PostEdit] submit failed', error)
        alert('게시글 수정에 실패했습니다.')
      } finally {
        setSubmitting(false)
      }
    },
    [categoryId, content, postId, router, title]
  )

  const handleCancel = useCallback(() => {
    if (postId) {
      router.push(`/posts/${postId}`)
    } else {
      router.push('/posts')
    }
  }, [postId, router])

  if (isAuthenticated === null || loadingPost) {
    return (
      <PageLayout variant="centered">
        <div className="post-auth-check-container">
          <div className="post-auth-check-icon">⌛</div>
          <p className="post-auth-check-message">게시글 정보를 불러오는 중입니다...</p>
        </div>
      </PageLayout>
    )
  }

  if (postError) {
    return (
      <PageLayout variant="centered">
        <div className="error-container">
          <h1 className="error-title">{postError}</h1>
          <button
            className="btn-primary error-btn"
            onClick={() => router.push('/posts')}
          >
            게시글 목록으로 이동
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="centered">
      <div className="post-page-container">
        <div className="post-form-column">
          <form onSubmit={handleSubmit} className="post-form-container">
            <div className="post-form-header">
              <h1 className="post-form-title">게시글 수정하기</h1>
              <p className="post-form-subtitle">내용을 수정한 뒤 저장을 눌러주세요.</p>
            </div>

            <div className="post-form-content">
              <div className="post-form-field">
                <label htmlFor="post-title" className="post-form-label">
                  제목
                </label>
                <input
                  id="post-title"
                  type="text"
                  className="post-form-input"
                  placeholder="게시글 제목을 입력해주세요"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  required
                />
                <div className="post-input-counter">
                  {title.trim().length} / 120
                </div>
              </div>

              <div className="post-form-field">
                <label htmlFor="post-category" className="post-form-label">
                  토픽 선택
                </label>
                {loadingCategories ? (
                  <div className="post-form-helper">카테고리를 불러오는 중입니다...</div>
                ) : categoryError ? (
                  <div className="post-form-error">{categoryError}</div>
                ) : (
                  <select
                    id="post-category"
                    className="post-form-input"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      토픽을 선택해주세요
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon ? `${category.icon} ` : ''}
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="post-form-field">
                <label className="post-form-label">내용</label>
                <RichEditor
                  value={content}
                  onChange={setContent}
                  placeholder="게시글 내용을 작성해주세요"
                  disabled={!hasLoadedInitialValue}
                />
                <div className="post-form-helper">
                  최소 {MIN_CONTENT_LENGTH}자 이상 작성해주세요.
                </div>
              </div>
            </div>

            <div className="post-form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={submitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isValid || submitting}
              >
                {submitting ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  )
}

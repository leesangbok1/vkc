'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BaseModal from './BaseModal'
import RichEditor from '@/components/editor/RichEditor'
import { EDITOR_USAGE_GUIDE } from '@/lib/constants/editor'
import {
  DEFAULT_QUESTION_CONTENT_GUIDE,
  DEFAULT_QUESTION_TITLE_PLACEHOLDER,
  getRandomQuestionPlaceholders,
} from '@/lib/utils/question-placeholders'

interface CategoryOption {
  id: number | string
  name: string
  icon?: string | null
}

interface QuestionCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (questionId: string) => void
}

export default function QuestionCreateModal({
  isOpen,
  onClose,
  onSuccess
}: QuestionCreateModalProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [titlePlaceholder, setTitlePlaceholder] = useState(DEFAULT_QUESTION_TITLE_PLACEHOLDER)
  const [contentPlaceholder, setContentPlaceholder] = useState(DEFAULT_QUESTION_CONTENT_GUIDE)
  const MIN_TITLE_LENGTH = 5
  const MIN_CONTENT_LENGTH = 10

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true)
      setCategoryError(null)
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || '카테고리를 불러오지 못했습니다.')
        }
        const payload = await res.json()
        const data = Array.isArray(payload?.data) ? payload.data : []
        setCategories(data)
        if (data.length > 0) {
          setCategoryId(String(data[0].id))
        } else {
          setCategoryId('')
        }
      } catch (err: any) {
        console.error('[QuestionCreateModal] loadCategories failed:', err)
        setCategories([])
        setCategoryError(err?.message || '카테고리를 불러오지 못했습니다.')
        setCategoryId('')
      } finally {
        setLoadingCategories(false)
      }
    }

    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const placeholders = getRandomQuestionPlaceholders()
    setTitlePlaceholder(placeholders.title)
    setContentPlaceholder(placeholders.content)
  }, [isOpen])

  // 문자 카운터
  const updateCharCounter = (current: number, max: number) => {
    return `${current} / ${max}`
  }

  // 폼 유효성 검사
  const isValid =
    title.trim().length >= MIN_TITLE_LENGTH &&
    content.trim().length >= MIN_CONTENT_LENGTH &&
    !!categoryId

  const submitQuestion = async () => {
    if (submitting) return

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

    const numericCategoryId = Number(categoryId)
    const normalizedCategoryId = Number.isFinite(numericCategoryId) ? numericCategoryId : categoryId

    setSubmitting(true)

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          category_id: normalizedCategoryId,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        const message = payload?.error || '질문 작성 중 오류가 발생했습니다.'
        const details = payload?.details || payload?.hint
        alert(details ? `${message}\n세부 정보: ${details}` : message)
        return
      }

      const createdIdValue = payload?.data?.id ?? payload?.id
      const createdId = createdIdValue ? String(createdIdValue) : null

      if (!createdId) {
        console.warn('[QuestionCreateModal] Missing question id in response payload:', payload)
        alert('질문은 등록되었지만 상세 페이지 이동에 실패했습니다. 새로고침 후 다시 확인해주세요.')
        onClose()
        return
      }

      if (onSuccess) {
        onSuccess(createdId)
      } else {
        alert('질문이 성공적으로 등록되었습니다!')
        router.push(`/questions/${createdId}`)
      }

      // 모달 닫기
      onClose()

      // 폼 초기화
      setTitle('')
      setContent('')
      setCategoryId(categories.length > 0 ? String(categories[0].id) : '')
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
    await submitQuestion()
  }

  // 취소 핸들러
  const handleCancel = () => {
    // 변경사항이 있으면 확인
    if (title.trim() || content.trim()) {
      if (confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        setTitle('')
        setContent('')
        setCategoryId(categories.length > 0 ? String(categories[0].id) : '')
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      width="800px"
      fullScreenOnMobile={true}
      showBackButton={true}
      adaptiveMode={true}
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} style={{ height: '100%' }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            무엇이든 물어보세요
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>
            답변은 언제나 무료예요
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Category Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="question-category"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}
            >
              카테고리<span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="question-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={loadingCategories || (!!categoryError && categories.length === 0)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.95rem',
                backgroundColor: 'white'
              }}
            >
              {loadingCategories ? (
                <option value="" disabled>
                  카테고리를 불러오는 중입니다...
                </option>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.icon ? `${category.icon} ` : ''}
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {categoryError || '사용 가능한 카테고리가 없습니다.'}
                </option>
              )}
            </select>
            {!loadingCategories && categoryError && (
              <p style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                {categoryError}
              </p>
            )}
          </div>

          {/* Question Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="question-title"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}
            >
              질문 제목<span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              id="question-title"
              placeholder={titlePlaceholder}
              maxLength={80}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
              fontSize: '0.8125rem',
              color: title.length > 72 ? '#ef4444' : '#6b7280'
            }}>
              <span>
                {title.length > 0 && title.length < 5 && (
                  <span style={{ color: '#ef4444' }}>최소 5자</span>
                )}
              </span>
              <span>{updateCharCounter(title.length, 80)}</span>
            </div>
          </div>

          {/* Question Content */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="question-content"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}
            >
              질문 내용<span style={{ color: '#ef4444' }}>*</span>
            </label>
            <RichEditor
              value={content}
              onChange={setContent}
              minRows={12}
              maxLength={10000}
              disabled={submitting}
              placeholder={contentPlaceholder}
              onSubmitShortcut={submitQuestion}
              helperText={EDITOR_USAGE_GUIDE}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: content.trim().length < MIN_CONTENT_LENGTH ? '#ef4444' : '#6b7280'
            }}>
              <span>최소 {MIN_CONTENT_LENGTH}자 이상 작성해주세요.</span>
              <span>Ctrl + Enter로 빠른 등록</span>
            </div>
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.8125rem',
              color: '#6b7280'
            }}>
              구체적이고 자세한 설명일수록 더 정확한 답변을 받을 수 있어요.
            </div>
          </div>

          {/* Tips Section */}
          <div style={{
            padding: '1rem',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#0369a1',
              marginBottom: '0.75rem'
            }}>
              💡 좋은 질문 작성 팁
            </h3>
            <ul style={{
              paddingLeft: '1.25rem',
              margin: 0,
              fontSize: '0.8125rem',
              color: '#075985',
              lineHeight: '1.8'
            }}>
              <li>제목은 간단명료하게, 내용에서 구체적인 상황을 설명해주세요</li>
              <li>개인정보는 포함하지 말고, 일반적인 상황으로 질문해주세요</li>
              <li>이전에 시도해본 방법이나 참고한 자료가 있다면 함께 적어주세요</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                background: 'white',
                color: '#374151',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: isValid && !submitting
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#d1d5db',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: isValid && !submitting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? '등록 중...' : '질문 등록'}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  )
}

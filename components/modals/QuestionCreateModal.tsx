'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BaseModal from './BaseModal'

interface CategoryOption {
  id: number
  name: string
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

  // 문자 카운터
  const updateCharCounter = (current: number, max: number) => {
    return `${current} / ${max}`
  }

  // 폼 유효성 검사
  const isValid = title.trim().length >= 5 && content.trim().length >= 10

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

        // 성공 콜백 실행
        if (onSuccess) {
          onSuccess(data.id)
        } else {
          alert('질문이 성공적으로 등록되었습니다!')
          router.push(`/questions/${data.id}`)
        }

        // 모달 닫기
        onClose()

        // 폼 초기화
        setTitle('')
        setContent('')
        setCategoryId('1')
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

  // 취소 핸들러
  const handleCancel = () => {
    // 변경사항이 있으면 확인
    if (title.trim() || content.trim()) {
      if (confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        setTitle('')
        setContent('')
        setCategoryId('1')
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
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.95rem',
                backgroundColor: 'white'
              }}
            >
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
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
              placeholder="간단하고 명확한 질문 제목을 작성해주세요"
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

            {/* Formatting Toolbar */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0.5rem',
              background: '#f9fafb',
              borderRadius: '8px 8px 0 0',
              border: '1px solid #d1d5db',
              borderBottom: 'none'
            }}>
              <button
                type="button"
                title="이미지 첨부"
                style={{
                  padding: '0.5rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                📷
              </button>
              <button
                type="button"
                title="목록"
                style={{
                  padding: '0.5rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                📝
              </button>
              <button
                type="button"
                title="굵게"
                style={{
                  padding: '0.5rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                B
              </button>
              <button
                type="button"
                title="링크"
                style={{
                  padding: '0.5rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                🔗
              </button>
            </div>

            <textarea
              id="question-content"
              placeholder="구체적인 상황과 궁금한 점을 자세히 설명해주세요.

예시:
- 현재 상황은 어떤가요?
- 어떤 도움이 필요한가요?
- 시도해본 방법이 있나요?"
              maxLength={10000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0 0 8px 8px',
                fontSize: '0.95rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
              fontSize: '0.8125rem',
              color: content.length > 9000 ? '#ef4444' : '#6b7280'
            }}>
              <span>
                {content.length > 0 && content.length < 10 && (
                  <span style={{ color: '#ef4444' }}>최소 10자</span>
                )}
              </span>
              <span>{updateCharCounter(content.length, 10000)}</span>
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

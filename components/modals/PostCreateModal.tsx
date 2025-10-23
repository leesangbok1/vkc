'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BaseModal from './BaseModal'
import RichEditor from '@/components/editor/RichEditor'
import { EDITOR_USAGE_GUIDE } from '@/lib/constants/editor'

interface PostCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (postId: string) => void
}

const POST_CATEGORIES = [
  { id: '비자/이민', name: '비자/이민', icon: '🛂' },
  { id: '교육', name: '교육', icon: '🎓' },
  { id: '취업', name: '취업', icon: '💼' },
  { id: '한국생활', name: '한국생활', icon: '🏠' },
  { id: '법률', name: '법률', icon: '⚖️' },
  { id: '금융', name: '금융', icon: '💰' },
  { id: '의료', name: '의료', icon: '🏥' },
  { id: '교통', name: '교통', icon: '🚗' },
  { id: '부동산', name: '부동산', icon: '🏢' },
  { id: '기타', name: '기타', icon: '📌' }
]

export default function PostCreateModal({
  isOpen,
  onClose,
  onSuccess
}: PostCreateModalProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('기타') // 기본값
  const [submitting, setSubmitting] = useState(false)

  const MIN_TITLE_LENGTH = 5
  const MIN_CONTENT_LENGTH = 20

  const isValid = title.trim().length >= MIN_TITLE_LENGTH && content.trim().length >= MIN_CONTENT_LENGTH

  const submitPost = async () => {
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

    setSubmitting(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          category: category,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // 성공 콜백 실행
        if (onSuccess) {
          onSuccess(data.id)
        } else {
          alert('게시글이 성공적으로 등록되었습니다!')
          router.push(`/posts/${data.id}`)
        }

        // 모달 닫기
        onClose()

        // 폼 초기화
        setTitle('')
        setContent('')
        setCategory('기타')
      } else {
        alert('게시글 작성 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Post submission failed:', error)
      alert('게시글 작성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    await submitPost()
  }

  // 취소 핸들러
  const handleCancel = () => {
    // 변경사항이 있으면 확인
    if (title.trim() || content.trim()) {
      if (confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        setTitle('')
        setContent('')
        setCategory('기타')
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
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            새 게시글 작성
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>
            정보를 공유하고 경험을 나눠보세요
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Category Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="post-category"
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
              id="post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
              {POST_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Post Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="post-title"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}
            >
              제목<span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
                type="text"
                id="post-title"
                placeholder="명확하고 흥미로운 제목을 작성해주세요"
                maxLength={100}
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
              color: title.length > 90 ? '#ef4444' : '#6b7280'
            }}>
              <span>
                {title.length > 0 && title.length < MIN_TITLE_LENGTH && (
                  <span style={{ color: '#ef4444' }}>최소 {MIN_TITLE_LENGTH}자</span>
                )}
              </span>
              <span>{`${title.length} / 100`}</span>
            </div>
          </div>

          {/* Post Content */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="post-content"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}
            >
              내용<span style={{ color: '#ef4444' }}>*</span>
            </label>
            <RichEditor
              value={content}
              onChange={setContent}
              minRows={12}
              maxLength={20000}
              disabled={submitting}
              placeholder="마크다운 형식으로 작성할 수 있습니다.

예시:
# 제목
## 소제목
- 목록 항목
**굵은 글씨**
[링크](https://example.com)"
              onSubmitShortcut={submitPost}
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
          </div>

          {/* Tips Section */}
          <div style={{
            padding: '1rem',
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#78350f',
              marginBottom: '0.75rem'
            }}>
              💡 좋은 게시글 작성 팁
            </h3>
            <ul style={{
              paddingLeft: '1.25rem',
              margin: 0,
              fontSize: '0.8125rem',
              color: '#92400e',
              lineHeight: '1.8'
            }}>
              <li>제목은 내용을 명확하게 표현하세요</li>
              <li>마크다운 문법을 활용하여 구조화된 글을 작성하세요</li>
              <li>출처가 있는 정보는 링크를 함께 제공하세요</li>
              <li>개인정보는 포함하지 마세요</li>
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
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : '#d1d5db',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: isValid && !submitting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? '등록 중...' : '게시글 등록'}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  )
}

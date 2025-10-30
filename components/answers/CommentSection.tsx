'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { DEFAULT_AVATAR_URL } from '@/lib/constants/avatar'
import RichEditor from '@/components/editor/RichEditor'
import { EDITOR_USAGE_GUIDE } from '@/lib/constants/editor'

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  author: {
    id: string
    name: string
    avatar_url: string
    trust_score: number
    badges: Record<string, boolean>
  }
}

interface Profile {
  id: string
  name: string
  avatar_url: string | null
}

interface CommentSectionProps {
  targetId: string
  targetType: 'question' | 'answer'
  currentUser: Profile | null
  onCountChange?: (count: number) => void
}

const MIN_COMMENT_LENGTH = 10
const MAX_COMMENT_LENGTH = 500

export default function CommentSection({
  targetId,
  targetType,
  currentUser,
  onCountChange
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const trimmedCommentLength = useMemo(() => newComment.trim().length, [newComment])
  const remainingToMin = Math.max(0, MIN_COMMENT_LENGTH - trimmedCommentLength)
  const latestOnCountChange = useRef(onCountChange)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/${targetType}s/${targetId}/comments`)
        if (response.ok) {
          const result = await response.json()
          setComments(result.data || [])
        } else {
          console.error('Failed to fetch comments')
        }
      } catch (err) {
        console.error('Error fetching comments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [targetId, targetType])

  useEffect(() => {
    latestOnCountChange.current = onCountChange
  }, [onCountChange])

  useEffect(() => {
    latestOnCountChange.current?.(comments.length)
  }, [comments.length])

  const handleSubmitComment = async (event: FormEvent) => {
    event.preventDefault()

    if (!currentUser) {
      setError('로그인이 필요합니다')
      return
    }

    if (trimmedCommentLength === 0) {
      setError('답글 내용을 입력해주세요')
      return
    }

    if (trimmedCommentLength < MIN_COMMENT_LENGTH) {
      setError(`답글은 최소 ${MIN_COMMENT_LENGTH}자 이상 작성해주세요`)
      return
    }

    if (newComment.length > MAX_COMMENT_LENGTH) {
      setError('답글은 500자 이하로 작성해주세요')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/${targetType}s/${targetId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment.trim()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit comment')
      }

      setComments(prev => [...prev, result.data])
      setNewComment('')
    } catch (err) {
      console.error('Error submitting comment:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.ceil(diffTime / (1000 * 60))
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) {
      return `${diffMinutes}분 전`
    }
    if (diffHours < 24) {
      return `${diffHours}시간 전`
    }
    if (diffDays <= 7) {
      return `${diffDays}일 전`
    }
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderBadges = (badges: Record<string, unknown>) => {
    if (!badges || typeof badges !== 'object') return null

    const adminCustomRaw = badges['admin_custom']
    const adminCustom =
      adminCustomRaw && typeof adminCustomRaw === 'object'
        ? {
            label:
              typeof (adminCustomRaw as any).label === 'string'
                ? (adminCustomRaw as any).label.trim()
                : '',
            icon:
              typeof (adminCustomRaw as any).icon === 'string'
                ? (adminCustomRaw as any).icon.trim()
                : '',
          }
        : null

    const activeBadges = Object.entries(badges).filter(
      ([key, value]) => key !== 'admin_custom' && typeof value === 'boolean' && value
    )

    if (!adminCustom && activeBadges.length === 0) return null

    return (
      <div className="flex gap-1">
        {adminCustom && (adminCustom.label || adminCustom.icon) && (
          <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            {adminCustom.icon && <span className="mr-1" aria-hidden>{adminCustom.icon}</span>}
            {adminCustom.label || '커스텀 배지'}
          </span>
        )}
        {activeBadges.slice(0, 2).map(([badge]) => (
          <span
            key={badge}
            className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
          >
            {badge === 'verified' && <i className="fas fa-check-circle mr-1"></i>}
            {badge === 'expert' && <i className="fas fa-star mr-1"></i>}
            {badge}
          </span>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h4 className="font-medium text-gray-900">
          {targetType === 'answer'
            ? `이 답변에 대한 답글 ${comments.length}개`
            : `댓글 ${comments.length}개`}
        </h4>
        {targetType === 'answer' && (
          <p className="comment-section-subtitle">
            답변을 읽고 느낀 점이나 추가 정보를 자유롭게 남겨주세요.
          </p>
        )}
      </div>

      <div className="comment-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-card">
            <div className="flex items-start gap-3">
              <img
                src={comment.author.avatar_url || DEFAULT_AVATAR_URL}
                alt={comment.author.name ?? '커뮤니티 멤버'}
                className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/users/${comment.author.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm"
                  >
                    {comment.author.name ?? '커뮤니티 멤버'}
                  </Link>
                  <span className={`text-xs ${getTrustScoreColor(comment.author.trust_score)}`}>
                    {comment.author.trust_score}
                  </span>
                  {renderBadges(comment.author.badges)}
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="comment-card-body">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="comment-empty-state">
            아직 답글이 없습니다.
          </div>
        )}
      </div>

      {currentUser && (
        <div className="comment-form-card" id={`comment-form-${targetId}`}>
          <form onSubmit={handleSubmitComment}>
            <div className="mb-3">
              <h5 className="comment-form-title">답글 작성하기</h5>
              <RichEditor
                value={newComment}
                onChange={setNewComment}
                minRows={4}
                maxLength={MAX_COMMENT_LENGTH}
                placeholder="답변에 대한 생각이나 추가 정보를 공유해주세요."
                disabled={isSubmitting}
                helperText={EDITOR_USAGE_GUIDE}
              />
            </div>

            <div className="comment-form-meta">
              <span>
                {trimmedCommentLength >= MIN_COMMENT_LENGTH
                  ? `${trimmedCommentLength}글자`
                  : `${remainingToMin}글자 더 써주세요.`}
              </span>
              <span>{newComment.length}/{MAX_COMMENT_LENGTH}자</span>
            </div>

            <div className="comment-form-actions">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  trimmedCommentLength < MIN_COMMENT_LENGTH ||
                  newComment.length > MAX_COMMENT_LENGTH
                }
                className="comment-submit-button"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-1"></i>
                    등록 중...
                  </>
                ) : (
                  '답글 등록'
                )}
              </button>
            </div>

            {error && (
              <div className="comment-form-error">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {error}
              </div>
            )}
          </form>
        </div>
      )}

      {!currentUser && (
        <div className="comment-login-prompt">
          <p>
            <i className="fas fa-sign-in-alt mr-1"></i>
            답글을 작성하려면 로그인하세요
          </p>
        </div>
      )}
    </div>
  )
}

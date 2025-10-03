'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

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
}

export default function CommentSection({
  targetId,
  targetType,
  currentUser
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Fetch comments
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      setError('로그인이 필요합니다')
      return
    }

    if (!newComment.trim()) {
      setError('댓글 내용을 입력해주세요')
      return
    }

    if (newComment.length > 500) {
      setError('댓글은 500자 이하로 작성해주세요')
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

      // Add new comment to the list
      setComments(prev => [...prev, result.data])
      setNewComment('')
      setShowForm(false)

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
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`
    } else if (diffDays <= 7) {
      return `${diffDays}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderBadges = (badges: Record<string, boolean>) => {
    const activeBadges = Object.entries(badges).filter(([_, active]) => active)
    if (activeBadges.length === 0) return null

    return (
      <div className="flex gap-1">
        {activeBadges.slice(0, 2).map(([badge, _]) => (
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
    <div className="p-4 bg-gray-50">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">
            댓글 {comments.length}개
          </h4>
          {currentUser && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <i className="fas fa-plus mr-1"></i>
              댓글 추가
            </button>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-start gap-3">
              <img
                src={comment.author.avatar_url || '/default-avatar.png'}
                alt={comment.author.name}
                className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/users/${comment.author.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm"
                  >
                    {comment.author.name}
                  </Link>
                  <span className={`text-xs ${getTrustScoreColor(comment.author.trust_score)}`}>
                    {comment.author.trust_score}
                  </span>
                  {renderBadges(comment.author.badges)}
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            아직 댓글이 없습니다.
          </div>
        )}
      </div>

      {/* Comment Form */}
      {showForm && currentUser && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <form onSubmit={handleSubmitComment}>
            <div className="flex gap-3">
              <img
                src={currentUser.avatar_url || '/default-avatar.png'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 작성해주세요..."
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={3}
                  disabled={isSubmitting}
                />

                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">
                    {newComment.length}/500자
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setNewComment('')
                        setError(null)
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      disabled={isSubmitting}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim() || newComment.length > 500}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                          등록 중...
                        </>
                      ) : (
                        '등록'
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mt-2 text-sm text-red-600">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    {error}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Login prompt for non-authenticated users */}
      {!currentUser && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-blue-700">
            <i className="fas fa-sign-in-alt mr-1"></i>
            댓글을 작성하려면 로그인하세요
          </p>
        </div>
      )}
    </div>
  )
}
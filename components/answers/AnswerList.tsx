'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import VoteButtons from '../questions/VoteButtons'
import CommentSection from './CommentSection'
import { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['users']['Row']

type Answer = Database['public']['Tables']['answers']['Row'] & {
  author: Profile
  is_helpful: boolean
  vote_score: number
}

interface AnswerListProps {
  answers: Answer[]
  questionAuthorId: string
  currentUser: Profile | null
  onAnswerUpdate: () => void
}

type SortOption = 'accepted' | 'helpful' | 'newest' | 'oldest' | 'votes'

export default function AnswerList({
  answers,
  questionAuthorId,
  currentUser,
  onAnswerUpdate
}: AnswerListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('accepted')
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set())
  const [showComments, setShowComments] = useState<Set<string>>(new Set())

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
        year: 'numeric',
        month: 'long',
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
      <div className="flex flex-wrap gap-1">
        {activeBadges.slice(0, 3).map(([badge, _]) => (
          <span
            key={badge}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
          >
            {badge === 'verified' && <i className="fas fa-check-circle mr-1"></i>}
            {badge === 'expert' && <i className="fas fa-star mr-1"></i>}
            {badge === 'helper' && <i className="fas fa-hands-helping mr-1"></i>}
            {badge === 'mentor' && <i className="fas fa-graduation-cap mr-1"></i>}
            {badge}
          </span>
        ))}
      </div>
    )
  }

  const sortAnswers = (answers: Answer[]) => {
    const sorted = [...answers]

    switch (sortBy) {
      case 'accepted':
        return sorted.sort((a, b) => {
          if (a.is_accepted && !b.is_accepted) return -1
          if (!a.is_accepted && b.is_accepted) return 1
          if (a.is_helpful && !b.is_helpful) return -1
          if (!a.is_helpful && b.is_helpful) return 1
          return (b.vote_score || 0) - (a.vote_score || 0)
        })
      case 'helpful':
        return sorted.sort((a, b) => {
          if (a.is_helpful && !b.is_helpful) return -1
          if (!a.is_helpful && b.is_helpful) return 1
          return (b.vote_score || 0) - (a.vote_score || 0)
        })
      case 'votes':
        return sorted.sort((a, b) => (b.vote_score || 0) - (a.vote_score || 0))
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      default:
        return sorted
    }
  }

  const toggleAnswerExpansion = (answerId: string) => {
    const newExpanded = new Set(expandedAnswers)
    if (newExpanded.has(answerId)) {
      newExpanded.delete(answerId)
    } else {
      newExpanded.add(answerId)
    }
    setExpandedAnswers(newExpanded)
  }

  const toggleComments = (answerId: string) => {
    const newShowComments = new Set(showComments)
    if (newShowComments.has(answerId)) {
      newShowComments.delete(answerId)
    } else {
      newShowComments.add(answerId)
    }
    setShowComments(newShowComments)
  }

  const handleAcceptAnswer = async (answerId: string) => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        onAnswerUpdate()
      } else {
        console.error('Failed to accept answer')
      }
    } catch (error) {
      console.error('Error accepting answer:', error)
    }
  }

  const handleMarkHelpful = async (answerId: string) => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/answers/${answerId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        onAnswerUpdate()
      } else {
        console.error('Failed to mark as helpful')
      }
    } catch (error) {
      console.error('Error marking as helpful:', error)
    }
  }

  const sortedAnswers = sortAnswers(answers)
  const isQuestionAuthor = currentUser?.id === questionAuthorId

  if (answers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
        <i className="fas fa-comments text-4xl text-gray-400 mb-4"></i>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 답변이 없습니다</h3>
        <p className="text-gray-600">이 질문에 첫 번째 답변을 남겨보세요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Answers Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          답변 {answers.length}개
        </h2>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">정렬:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="accepted">채택순</option>
            <option value="helpful">도움순</option>
            <option value="votes">추천순</option>
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </div>
      </div>

      {/* Answers List */}
      {sortedAnswers.map((answer) => {
        const shouldTruncate = answer.content.length > 600
        const isExpanded = expandedAnswers.has(answer.id)
        const displayContent = shouldTruncate && !isExpanded
          ? answer.content.substring(0, 600) + '...'
          : answer.content
        const isOwner = currentUser?.id === answer.author.id

        return (
          <div
            key={answer.id}
            className={`bg-white border-2 rounded-lg shadow-sm ${
              answer.is_accepted
                ? 'border-green-200 bg-green-50'
                : answer.is_helpful
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            {/* Answer Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {answer.is_accepted && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <i className="fas fa-check-circle mr-1"></i>
                      채택된 답변
                    </span>
                  )}
                  {answer.is_helpful && !answer.is_accepted && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <i className="fas fa-thumbs-up mr-1"></i>
                      도움이 되는 답변
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isOwner && (
                    <button className="text-gray-600 hover:text-blue-600 p-1 rounded hover:bg-gray-100 transition-colors">
                      <i className="fas fa-edit"></i>
                    </button>
                  )}
                  <span className="text-sm text-gray-600">
                    {formatDate(answer.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Answer Content and Voting */}
            <div className="p-6">
              <div className="flex gap-6">
                {/* Vote Buttons */}
                <div className="flex-shrink-0">
                  <VoteButtons
                    targetId={answer.id}
                    targetType="answer"
                    initialVoteScore={answer.vote_score}
                    currentUser={currentUser}
                    disabled={isOwner}
                  />
                </div>

                {/* Answer Content */}
                <div className="flex-1">
                  <div className="prose max-w-none">
                    <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {displayContent}
                    </div>

                    {shouldTruncate && (
                      <button
                        onClick={() => toggleAnswerExpansion(answer.id)}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {isExpanded ? '접기' : '더 보기'}
                      </button>
                    )}
                  </div>

                  {/* Answer Actions */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    {isQuestionAuthor && !answer.is_accepted && (
                      <button
                        onClick={() => handleAcceptAnswer(answer.id)}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        <i className="fas fa-check mr-1"></i>
                        답변 채택
                      </button>
                    )}

                    {currentUser && !isOwner && !answer.is_helpful && (
                      <button
                        onClick={() => handleMarkHelpful(answer.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <i className="fas fa-thumbs-up mr-1"></i>
                        도움됨
                      </button>
                    )}

                    <button
                      onClick={() => toggleComments(answer.id)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <i className="fas fa-comment mr-1"></i>
                      댓글
                    </button>

                    <button className="text-gray-600 hover:text-gray-700">
                      <i className="fas fa-share mr-1"></i>
                      공유
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={answer.author.avatar_url || '/default-avatar.png'}
                    alt={answer.author.name}
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/users/${answer.author.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {answer.author.name}
                      </Link>
                      <span className={`text-sm font-medium ${getTrustScoreColor(answer.author.trust_score)}`}>
                        신뢰도 {answer.author.trust_score}
                      </span>
                    </div>

                    {renderBadges(answer.author.badges)}

                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-4">
                        {answer.author.visa_type && (
                          <span>
                            <i className="fas fa-passport mr-1"></i>
                            {answer.author.visa_type}
                          </span>
                        )}
                        {answer.author.years_in_korea && (
                          <span>
                            <i className="fas fa-calendar-alt mr-1"></i>
                            한국 거주 {answer.author.years_in_korea}년
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {showComments.has(answer.id) && (
              <div className="border-t border-gray-100">
                <CommentSection
                  targetId={answer.id}
                  targetType="answer"
                  currentUser={currentUser}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
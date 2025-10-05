'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import VoteButtons from './VoteButtons'
import { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['users']['Row']

type Question = Database['public']['Tables']['questions']['Row'] & {
  category: Database['public']['Tables']['categories']['Row']
  author: Profile
  vote_score: number
}

interface QuestionDetailProps {
  question: Question
  currentUser: Profile | null
  onVoteUpdate: (newVoteScore: number) => void
}

export default function QuestionDetail({
  question,
  currentUser,
  onVoteUpdate
}: QuestionDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return '오늘'
    } else if (diffDays === 2) {
      return '어제'
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

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <i className="fas fa-exclamation-circle mr-1"></i>
            긴급
          </span>
        )
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <i className="fas fa-clock mr-1"></i>
            중요
          </span>
        )
      case 'normal':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <i className="fas fa-info-circle mr-1"></i>
            일반
          </span>
        )
      default:
        return null
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
        {activeBadges.map(([badge, _]) => (
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

  const isOwner = currentUser?.id === question.author.id
  const shouldTruncate = question.content.length > 500
  const displayContent = shouldTruncate && !isExpanded
    ? question.content.substring(0, 500) + '...'
    : question.content

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Question Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${question.category.color}20`,
                  color: question.category.color
                }}
              >
                <i className={`${question.category.icon} mr-2`}></i>
                {question.category.name}
              </span>
              {question.urgency && getUrgencyBadge(question.urgency)}
              {question.status !== 'open' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {question.status}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {question.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                <i className="fas fa-eye mr-1"></i>
                조회 {formatNumber(question.view_count)}
              </span>
              <span>
                <i className="fas fa-comments mr-1"></i>
                답변 {question.answer_count}
              </span>
              <span>
                <i className="fas fa-calendar mr-1"></i>
                {formatDate(question.created_at)}
              </span>
              {question.created_at !== question.updated_at && (
                <span>
                  <i className="fas fa-edit mr-1"></i>
                  수정됨 {formatDate(question.updated_at)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            {isOwner && (
              <>
                <Link href={`/questions/${question.id}/edit`}>
                  <button className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <i className="fas fa-edit"></i>
                  </button>
                </Link>
                <button className="text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <i className="fas fa-trash"></i>
                </button>
              </>
            )}
            <button className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <i className="fas fa-share"></i>
            </button>
            <button className="text-gray-600 hover:text-yellow-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <i className="fas fa-bookmark"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Question Content and Voting */}
      <div className="p-6">
        <div className="flex gap-6">
          {/* Vote Buttons */}
          <div className="flex-shrink-0">
            <VoteButtons
              targetId={question.id}
              targetType="question"
              initialVoteScore={question.vote_score}
              currentUser={currentUser}
              disabled={isOwner}
              onVoteUpdate={onVoteUpdate}
            />
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <div className="prose max-w-none">
              <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {displayContent}
              </div>

              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isExpanded ? '접기' : '더 보기'}
                </button>
              )}
            </div>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/questions?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      <i className="fas fa-tag mr-1 text-xs"></i>
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Author Info */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <img
              src={question.author.avatar_url || '/default-avatar.png'}
              alt={question.author.name}
              className="w-12 h-12 rounded-full border-2 border-gray-200"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/users/${question.author.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {question.author.name}
                </Link>
                <span className={`text-sm font-medium ${getTrustScoreColor(question.author.trust_score)}`}>
                  신뢰도 {question.author.trust_score}
                </span>
              </div>

              {renderBadges(question.author.badges)}

              <div className="mt-2 text-sm text-gray-600">
                <div className="flex flex-wrap gap-4">
                  {question.author.visa_type && (
                    <span>
                      <i className="fas fa-passport mr-1"></i>
                      {question.author.visa_type}
                    </span>
                  )}
                  {question.author.company && (
                    <span>
                      <i className="fas fa-building mr-1"></i>
                      {question.author.company}
                    </span>
                  )}
                  {question.author.years_in_korea && (
                    <span>
                      <i className="fas fa-calendar-alt mr-1"></i>
                      한국 거주 {question.author.years_in_korea}년
                    </span>
                  )}
                  {question.author.region && (
                    <span>
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {question.author.region}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
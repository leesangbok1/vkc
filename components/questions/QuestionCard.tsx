'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Database } from '@/lib/supabase'
import { Avatar } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'

type Question = Database['public']['Tables']['questions']['Row'] & {
  author: Database['public']['Tables']['users']['Row']
  category: Database['public']['Tables']['categories']['Row']
  _count: { count: number }
}

interface QuestionCardProps {
  question: Question
  className?: string
  compact?: boolean
}

export function QuestionCard({ question, className, compact = false }: QuestionCardProps) {
  const {
    id,
    title,
    content,
    tags,
    urgency,
    view_count,
    answer_count,
    upvote_count,
    status,
    is_pinned,
    is_featured,
    created_at,
    author,
    category
  } = question

  // Calculate vote score
  const voteScore = upvote_count - (question.downvote_count || 0)

  // Format date
  const timeAgo = formatDistanceToNow(new Date(created_at), {
    addSuffix: true,
    locale: ko
  })

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'resolved': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get urgency label
  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return '긴급'
      case 'high': return '높음'
      case 'normal': return '보통'
      case 'low': return '낮음'
      default: return urgency
    }
  }

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return '진행중'
      case 'closed': return '종료'
      case 'resolved': return '해결됨'
      case 'archived': return '보관됨'
      default: return status
    }
  }

  // Truncate content for preview
  const truncatedContent = content.length > 200
    ? content.substring(0, 200) + '...'
    : content

  return (
    <article
      className={cn(
        'border rounded-lg bg-white hover:shadow-md transition-shadow duration-200',
        is_pinned && 'ring-2 ring-blue-200 border-blue-300',
        is_featured && 'bg-gradient-to-r from-yellow-50 to-orange-50',
        className
      )}
    >
      <div className={cn('p-6', compact && 'p-4')}>
        {/* Header with badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap gap-2">
            {is_pinned && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                📌 고정
              </Badge>
            )}
            {is_featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                ⭐ 주목
              </Badge>
            )}
            <Badge
              variant="outline"
              className={getUrgencyColor(urgency)}
            >
              {getUrgencyLabel(urgency)}
            </Badge>
            <Badge
              variant="outline"
              className={getStatusColor(status)}
            >
              {getStatusLabel(status)}
            </Badge>
          </div>

          {/* Vote score */}
          <div className="flex items-center gap-1 text-sm">
            <span className={cn(
              'font-medium',
              voteScore > 0 && 'text-green-600',
              voteScore < 0 && 'text-red-600',
              voteScore === 0 && 'text-gray-500'
            )}>
              {voteScore > 0 ? '+' : ''}{voteScore}
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className={cn(
          'font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors',
          compact ? 'text-base' : 'text-lg'
        )}>
          <Link href={`/questions/${id}`}>
            {title}
          </Link>
        </h3>

        {/* Content preview */}
        {!compact && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {truncatedContent}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Category */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <Link
            href={`/categories/${category.slug}`}
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            {category.name}
          </Link>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Author info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <img
                src={author.avatar_url || '/default-avatar.png'}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            </Avatar>
            <div>
              <Link
                href={`/users/${author.id}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                {author.name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>신뢰도 {author.trust_score}</span>
                {author.badges.verified && (
                  <span className="text-blue-500">✓ 인증됨</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats and timestamp */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{answer_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{view_count}</span>
            </div>
            <time dateTime={created_at} title={new Date(created_at).toLocaleString('ko-KR')}>
              {timeAgo}
            </time>
          </div>
        </div>
      </div>
    </article>
  )
}

// Compact variant for sidebars or small spaces
export function CompactQuestionCard({ question, className }: Omit<QuestionCardProps, 'compact'>) {
  return (
    <QuestionCard
      question={question}
      className={className}
      compact={true}
    />
  )
}
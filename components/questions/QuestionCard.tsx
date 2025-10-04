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

  // Truncate content for preview
  const truncatedContent = content.length > 200
    ? content.substring(0, 200) + '...'
    : content

  return (
    <article
      className={cn(
        'question-card hover-shadow hover-lift',
        is_pinned && 'ring-2 ring-primary-blue border-primary-blue',
        is_featured && 'primary-flag-pattern text-white',
        className
      )}
    >
      <div className="question-card-content grid grid-cols-12 gap-4">
        {/* 좌측: 투표 영역 */}
        <div className="col-span-2 flex flex-col items-center space-y-2">
          <button className="text-gray-400 hover:text-primary-blue transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div className={cn(
            'text-lg font-bold',
            voteScore > 0 && 'text-trust',
            voteScore < 0 && 'text-error',
            voteScore === 0 && 'text-gray-500'
          )}>
            {voteScore > 0 ? '+' : ''}{voteScore}
          </div>
          <button className="text-gray-400 hover:text-primary-blue transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-primary-green transition-colors mt-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* 중앙: 메인 컨텐츠 */}
        <div className="col-span-8">
          {/* Header with badges */}
          <div className="question-card-header">
            <div className="flex flex-wrap gap-2">
              {is_pinned && (
                <Badge className="bg-primary-blue text-white">
                  📌 고정
                </Badge>
              )}
              {is_featured && (
                <Badge className="bg-primary-green text-gray-900">
                  ⭐ 주목
                </Badge>
              )}
              <Badge className={`urgency-${urgency === 'urgent' ? '1' : urgency === 'high' ? '2' : urgency === 'normal' ? '3' : urgency === 'low' ? '4' : '5'}`}>
                {getUrgencyLabel(urgency)}
              </Badge>
            </div>
          </div>

          {/* Title */}
          <h3 className={cn(
            'font-semibold text-primary mb-3 hover:text-primary-blue transition-colors',
            compact ? 'text-base' : 'text-lg leading-tight'
          )}>
            <Link href={`/questions/${id}`}>
              {title}
            </Link>
          </h3>

          {/* Content preview */}
          {!compact && (
            <p className="text-secondary mb-4 leading-relaxed">
              {truncatedContent}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 hover:bg-primary-green hover:text-gray-900 cursor-pointer transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Category */}
          <div className="flex items-center gap-2 mb-4">
            <div className={cn(
              'category-icon',
              category.name.includes('비자') && 'category-icon-visa',
              category.name.includes('생활') && 'category-icon-life',
              category.name.includes('교육') && 'category-icon-education',
              category.name.includes('취업') && 'category-icon-employment',
              category.name.includes('주거') && 'category-icon-housing',
              category.name.includes('의료') && 'category-icon-healthcare'
            )}>
              {category.name.includes('비자') ? '🛂' :
               category.name.includes('생활') ? '🍜' :
               category.name.includes('교육') ? '🎓' :
               category.name.includes('취업') ? '💼' :
               category.name.includes('주거') ? '🏠' :
               category.name.includes('의료') ? '🏥' : '📋'}
            </div>
            <Link
              href={`/categories/${category.slug}`}
              className="text-sm text-secondary hover:text-primary-blue transition-colors"
            >
              {category.name}
            </Link>
          </div>
        </div>

        {/* 우측: 상태 영역 */}
        <div className="col-span-2 flex flex-col items-end space-y-2">
          {status === 'resolved' && (
            <Badge className="bg-trust text-white">
              ✓ 해결됨
            </Badge>
          )}
          {author.badges?.verified && (
            <div className="trust-badge trust-badge-verified">
              🇰🇷 {author.residence_years || 5}년차
            </div>
          )}
          {answer_count > 0 && (
            <div className="text-xs text-tertiary">
              💬 {answer_count}개 답변
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="question-card-footer col-span-12">
          {/* Author info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <img
                src={author.avatar_url || '/default-avatar.png'}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            </Avatar>
            <div>
              <Link
                href={`/users/${author.id}`}
                className="text-sm font-medium text-primary hover:text-primary-blue transition-colors"
              >
                {author.name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-tertiary">
                <span className="trust-badge">
                  ⭐ {author.trust_score}
                </span>
                {author.badges?.verified && (
                  <span className="text-trust">✓ 인증됨</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats and timestamp */}
          <div className="flex items-center gap-4 text-sm text-tertiary">
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
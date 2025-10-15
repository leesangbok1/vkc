'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Database } from '@/lib/supabase'
import { Avatar } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'
import SpecialtyTags from '../trust/SpecialtyTags'
import { UserRole, getRoleDisplayInfo } from '@/lib/utils/permissions'

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
      data-testid="question-card"
      className={cn(
        // 🎨 Material Design 3.0 디자인 토큰 기반 스타일링
        'card interactive surface-1',
        'rounded-lg border border-neutral-200 bg-neutral-0',
        'transition-normal hover:shadow-md hover:border-neutral-300',
        is_pinned && 'ring-2 ring-primary-500 border-primary-500',
        is_featured && 'bg-gradient-to-r from-primary-500 to-verified-color text-neutral-0',
        className
      )}
      style={{
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-lg)'
      }}
      role="article"
      aria-labelledby={`question-title-${id}`}
      aria-describedby={`question-content-${id}`}
    >
      <div className="question-card-content grid grid-cols-12 gap-4">
        {/* 좌측: 투표 영역 */}
        <div className="col-span-2 flex flex-col items-center space-y-2" role="group" aria-label="질문 투표 및 북마크">
          <button
            className="text-gray-400 hover:text-primary-blue transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue rounded p-1"
            aria-label={`질문 찬성 투표 (현재 점수: ${voteScore})`}
            type="button"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div
            className={cn(
              'text-lg font-bold',
              voteScore > 0 && 'text-trust',
              voteScore < 0 && 'text-error',
              voteScore === 0 && 'text-gray-500'
            )}
            aria-label={`총 투표 점수: ${voteScore}점`}
            role="status"
          >
            {voteScore > 0 ? '+' : ''}{voteScore}
          </div>
          <button
            className="text-gray-400 hover:text-primary-blue transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue rounded p-1"
            aria-label="질문 반대 투표"
            type="button"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            className="text-gray-400 hover:text-primary-green transition-colors focus:outline-none focus:ring-2 focus:ring-primary-green rounded p-1 mt-2"
            aria-label="질문 북마크에 추가"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
          <h3
            id={`question-title-${id}`}
            className={cn(
              'text-title-large font-semibold text-neutral-900 mb-3',
              compact ? 'text-title-medium' : 'text-title-large'
            )}
            aria-describedby={`question-meta-${id}`}
          >
            <Link
              href={`/questions/${id}`}
              className="hover:text-primary-500 transition-fast focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              {title}
            </Link>
          </h3>

          {/* Content preview */}
          {!compact && (
            <p
              id={`question-content-${id}`}
              className="text-body-medium text-neutral-700 mb-4 leading-relaxed"
              aria-label="질문 내용 미리보기"
            >
              {truncatedContent}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-4" role="list" aria-label="질문 태그">
              <SpecialtyTags
                specialties={tags}
                maxDisplay={4}
                variant="compact"
              />
            </div>
          )}

          {/* Category */}
          <div className="flex items-center gap-2 mb-4" role="navigation" aria-label="카테고리 네비게이션">
            <div
              className={cn(
                'category-icon',
                category.name.includes('비자') && 'category-icon-visa',
                category.name.includes('생활') && 'category-icon-life',
                category.name.includes('교육') && 'category-icon-education',
                category.name.includes('취업') && 'category-icon-employment',
                category.name.includes('주거') && 'category-icon-housing',
                category.name.includes('의료') && 'category-icon-healthcare'
              )}
              aria-hidden="true"
            >
              {category.name.includes('비자') ? '🛂' :
               category.name.includes('생활') ? '🍜' :
               category.name.includes('교육') ? '🎓' :
               category.name.includes('취업') ? '💼' :
               category.name.includes('주거') ? '🏠' :
               category.name.includes('의료') ? '🏥' : '📋'}
            </div>
            <Link
              href={`/categories/${category.slug}`}
              className="text-sm text-secondary hover:text-primary-blue transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue rounded"
              aria-label={`${category.name} 카테고리로 이동`}
            >
              {category.name}
            </Link>
          </div>
        </div>

        {/* 우측: 상태 영역 */}
        <div className="col-span-2 flex flex-col items-end space-y-2">
          {status === 'resolved' && (
            <div className="verified-answer-badge">
              <div className="verified-answer-icon">✅</div>
              <div className="verified-answer-text">
                <div className="verified-answer-label">검증된 답변</div>
                <div className="verified-answer-sublabel">Certified User 답변 완료</div>
              </div>
            </div>
          )}
          {answer_count > 0 && (
            <div className="answer-count-badge">
              <span className="answer-count-icon">💬</span>
              <span className="answer-count-text">{answer_count}개 답변</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer
          className="question-card-footer col-span-12"
          id={`question-meta-${id}`}
          aria-label="질문 작성자 정보 및 통계"
        >
          {/* Author info - 간결한 형태 (프로필 사진 제거) */}
          <div className="flex items-center gap-2" role="group" aria-label="작성자 정보">
            <Link
              href={`/users/${author.id}`}
              className="text-sm font-medium text-primary hover:text-primary-blue transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue rounded"
              aria-label={`작성자 ${author.name}의 프로필 보기`}
            >
              {author.name}
            </Link>

            {/* 인증 정보 박스: 일반/인증 사용자 구분 */}
            <span className={`author-verification-box ${(author as any).role === 'verified' || (author as any).role === 'admin' ? 'verified' : ''}`} aria-label="작성자 인증 정보">
              <span className="verification-text">
                {author.visa_type || '( )'}
                {author.years_in_korea ? `, 한국 ${author.years_in_korea}년차` : ''}
              </span>
            </span>
          </div>

          {/* Stats and timestamp */}
          <div className="flex items-center gap-4 text-sm text-tertiary" role="group" aria-label="질문 통계">
            <div className="flex items-center gap-1" role="status" aria-label={`답변 수: ${answer_count}개`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{answer_count}</span>
            </div>
            <div className="flex items-center gap-1" role="status" aria-label={`조회 수: ${view_count}회`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{view_count}</span>
            </div>
            <time
              dateTime={created_at}
              title={new Date(created_at).toLocaleString('ko-KR')}
              aria-label={`질문 작성 시간: ${new Date(created_at).toLocaleString('ko-KR')}`}
            >
              {timeAgo}
            </time>
          </div>
        </footer>
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
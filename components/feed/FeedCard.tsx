'use client'

import { MouseEvent, KeyboardEvent, ReactNode, useCallback, useMemo } from 'react'
import ActionBar from '@/components/common/ActionBar'
import { renderMarkdownLite } from '@/lib/utils/markdown'

export type FeedCardItemType = 'question' | 'post' | 'answer'

export interface FeedCardAuthor {
  id: string
  name?: string | null
  role?: string | null
  visaType?: string | null
  yearsInKorea?: number | null
}

export interface FeedCardActionProps {
  targetType: FeedCardItemType
  helpfulCount?: number
  isHelpful?: boolean
  onHelpfulClick?: () => Promise<{ helpfulCount?: number; isHelpful?: boolean } | void> | void
  requireLogin?: boolean
  onLoginRequired?: () => void
  compact?: boolean
}

export interface FeedCardProps {
  id: string
  itemType: FeedCardItemType
  title: string
  body: string
  href: string
  createdAt: string
  topic?: string
  author?: FeedCardAuthor
  stats?: ReactNode
  badge?: ReactNode
  actionProps?: FeedCardActionProps
  onNavigate?: (href: string) => void
  onAuthorClick?: (authorId: string) => void
  showFollowButton?: boolean
  isFollowing?: boolean
  onToggleFollow?: () => void | Promise<void>
  followLabels?: { follow: string; following: string }
  showReportButton?: boolean
  onReportClick?: () => void
  mediaUrls?: string[]
}

const defaultFollowLabels = {
  follow: '팔로우',
  following: '팔로잉'
}

export default function FeedCard({
  id,
  itemType,
  title,
  body,
  href,
  createdAt,
  topic,
  author,
  stats,
  badge,
  actionProps,
  onNavigate,
  onAuthorClick,
  showFollowButton = false,
  isFollowing = false,
  onToggleFollow,
  followLabels = defaultFollowLabels,
  showReportButton = false,
  onReportClick,
  mediaUrls = []
}: FeedCardProps) {
  const handleNavigate = useCallback(() => {
    if (onNavigate) {
      onNavigate(href)
    } else if (typeof window !== 'undefined') {
      window.location.href = href
    }
  }, [href, onNavigate])

  const handleAuthorClick = useCallback(
    (event: MouseEvent<HTMLDivElement | HTMLSpanElement>) => {
      event.stopPropagation()
      if (author?.id) {
        if (onAuthorClick) {
          onAuthorClick(author.id)
        } else if (typeof window !== 'undefined') {
          window.location.href = `/users/${author.id}`
        }
      }
    },
    [author, onAuthorClick]
  )

  const handleFollowToggle = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      if (onToggleFollow) {
        await onToggleFollow()
      }
    },
    [onToggleFollow]
  )

  const plainBody = useMemo(() => {
    if (typeof window === 'undefined') return body
    const temp = document.createElement('div')
    temp.innerHTML = renderMarkdownLite(body)
    return temp.textContent || temp.innerText || body
  }, [body])

  const excerpt = plainBody.length > 200 ? `${plainBody.slice(0, 200)}...` : plainBody

  const roleClass =
    author?.role && ['verified', 'admin', 'VERIFIED', 'ADMIN'].includes(author.role)
      ? 'verified'
      : undefined

  const statsContent = stats ?? null
  const mediaList = Array.isArray(mediaUrls) ? mediaUrls.filter((url) => typeof url === 'string' && url.length > 0) : []
  const limitedMedia = mediaList.slice(0, 4)
  const extraMediaCount = mediaList.length - limitedMedia.length
  const gridClass = `question-images-count-${Math.min(limitedMedia.length, 4)}`

  const handleReportClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onReportClick?.()
    },
    [onReportClick]
  )

  return (
    <div
      key={id}
      className="question-card"
      role="article"
      onClick={handleNavigate}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleNavigate()
        }
      }}
      tabIndex={0}
      data-item-type={itemType}
    >
      <div className="question-header">
        <div className="question-meta">
          <div className="question-author-row">
            <div
              className="author-avatar-small"
              aria-hidden="true"
              onClick={handleAuthorClick}
            ></div>
            <div className="question-author-info">
              {topic && (
                <span className="question-topic-label" aria-label="게시글 토픽">
                  {topic}
                </span>
              )}
              <div className="author-primary-row">
                <div className="author-meta-group">
                  <span
                    className="question-author-link"
                    onClick={handleAuthorClick}
                  >
                    {author?.name || '커뮤니티 멤버'}
                  </span>
                  <span className="question-time">{formatRelativeTime(createdAt)}</span>
                  {showFollowButton && (
                    <button
                      className={`follow-btn-compact ${isFollowing ? 'following' : ''}`}
                      onClick={handleFollowToggle}
                    >
                      {isFollowing ? followLabels.following : followLabels.follow}
                    </button>
                  )}
                </div>
              </div>
              {author && (author.visaType || author.yearsInKorea) && (
                <div className="author-extra-row">
                  <span className={`author-verification-box ${roleClass ?? ''}`}>
                    <span className="verification-text">
                      {author.visaType || ''}
                      {author.yearsInKorea ? `, 한국 ${author.yearsInKorea}년차` : ''}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="question-card-controls">
          {showReportButton && (
            <button
              className="question-report-btn"
              type="button"
              aria-label="신고하기"
              onClick={handleReportClick}
            >
              <span aria-hidden>!</span>
            </button>
          )}
          <button
            className="question-more-btn"
            type="button"
            aria-label="게시글 상세 보기"
            onClick={(event) => {
              event.stopPropagation()
              handleNavigate()
            }}
          >
            <span aria-hidden>···</span>
          </button>
        </div>
      </div>

      <h3 className="question-title">{title}</h3>
      <p className="question-content">{excerpt}</p>

      {limitedMedia.length > 0 && (
        <div className={`question-images-grid ${gridClass}`}>
          {limitedMedia.map((src, index) => (
            <div key={`${id}-media-${index}`} className="question-image-wrapper">
              <img src={src} alt={`${title} 첨부 이미지 ${index + 1}`} loading="lazy" />
              {extraMediaCount > 0 && index === limitedMedia.length - 1 && (
                <span className="question-image-more">+{extraMediaCount}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="question-stats">
        {statsContent && (
          <div className="question-stats-comments">
            <span className="answer-expert-icon" aria-hidden="true">
              🎯
            </span>
            <span>{statsContent}</span>
          </div>
        )}
        {badge && <div className="question-status-badge">{badge}</div>}
      </div>

      {actionProps && (
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            event.stopPropagation()
          }}
          role="presentation"
        >
          <ActionBar
            targetId={id}
            targetType={actionProps.targetType}
            title={title}
            content={body}
            url={href}
            helpfulCount={actionProps.helpfulCount}
            isHelpful={actionProps.isHelpful}
            onHelpfulClick={actionProps.onHelpfulClick}
            requireLogin={actionProps.requireLogin}
            onLoginRequired={actionProps.onLoginRequired}
            compact={actionProps.compact ?? true}
          />
        </div>
      )}
    </div>
  )
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (Number.isNaN(diffMs)) return '방금 전'

  if (diffMs < minute) return '방금 전'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}분 전`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}시간 전`
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}일 전`
  return date.toLocaleDateString('ko-KR')
}

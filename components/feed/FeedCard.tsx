'use client'

import { MouseEvent, ReactNode, useCallback, useMemo, useState, useEffect } from 'react'
import ActionBar from '@/components/common/ActionBar'
import { DEFAULT_AVATAR_URL } from '@/lib/constants/avatar'
import { renderMarkdownLite } from '@/lib/utils/markdown'
import { useAuth } from '@/lib/hooks/useAuth'
import ReportContentModal from '@/components/modals/ReportContentModal'
import LoginPromptModal from '@/components/modals/LoginPromptModal'
import { ReportTargetType } from '@/lib/constants/reports'

export type FeedCardItemType = 'question' | 'post' | 'answer'

export interface FeedCardAuthor {
  id: string
  name?: string | null
  role?: string | null
  visaType?: string | null
  yearsInKorea?: number | null
  avatarUrl?: string | null
  badges?: Record<string, unknown> | null
  customBadgeLabel?: string | null
  customBadgeIcon?: string | null
}

export interface FeedCardActionProps {
  targetType: FeedCardItemType
  helpfulCount?: number
  isHelpful?: boolean
  onHelpfulClick?: () => Promise<{ helpfulCount?: number; isHelpful?: boolean } | void> | void
  requireLogin?: boolean
  onLoginRequired?: () => void
  compact?: boolean
  showAcceptButton?: boolean
  onAcceptClick?: () => void
  isAccepted?: boolean
}

export interface FeedCardOwnerActions {
  onEdit?: () => void
  onDelete?: () => void
  editLabel?: string
  deleteLabel?: string
  isEditing?: boolean
  isDeleting?: boolean
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
  fullBody?: boolean
  interactive?: boolean
  ownerActions?: FeedCardOwnerActions
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
  mediaUrls = [],
  fullBody = false,
  interactive = true,
  ownerActions
}: FeedCardProps) {
  const { isLoggedIn } = useAuth()
  const [isReportModalOpen, setReportModalOpen] = useState(false)
  const [isLoginPromptOpen, setLoginPromptOpen] = useState(false)
  const [hasReported, setHasReported] = useState(false)

  const authorDisplayName = useMemo(() => {
    if (!author) return '커뮤니티 멤버'
    const display = typeof author.name === 'string' ? author.name : null
    if (display && display.trim().length > 0) {
      return display.trim()
    }
    return '커뮤니티 멤버'
  }, [author])

  useEffect(() => {
    setHasReported(false)
    setReportModalOpen(false)
    setLoginPromptOpen(false)
  }, [id])

  const handleNavigate = useCallback(() => {
    if (onNavigate) {
      onNavigate(href)
    } else if (typeof window !== 'undefined') {
      window.location.href = href
    }
  }, [href, onNavigate])

  const goToAuthorProfile = useCallback(() => {
    if (!author?.id) return
    if (onAuthorClick) {
      onAuthorClick(author.id)
    } else if (typeof window !== 'undefined') {
      window.location.href = `/users/${author.id}`
    }
  }, [author, onAuthorClick])

  const handleAuthorClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.stopPropagation()
      if (onAuthorClick) {
        event.preventDefault?.()
        goToAuthorProfile()
      }
    },
    [onAuthorClick, goToAuthorProfile]
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

  const renderedBody = useMemo(() => renderMarkdownLite(body), [body])

  const plainBody = useMemo(() => {
    if (typeof window === 'undefined') return body
    const temp = document.createElement('div')
    temp.innerHTML = renderedBody
    return temp.textContent || temp.innerText || body
  }, [body, renderedBody])

  const excerpt = plainBody.length > 200 ? `${plainBody.slice(0, 200)}...` : plainBody
  const authorId = author?.id ?? null
  const reportTargetType = itemType as ReportTargetType
  const reportMetadata = useMemo(
    () => ({
      source: 'feed-card',
      href,
      topic,
      itemType,
      authorId
    }),
    [href, topic, itemType, authorId]
  )

  const roleClass =
    author?.role && ['verified', 'admin', 'VERIFIED', 'ADMIN'].includes(author.role)
      ? 'verified'
      : undefined

  const statsContent = stats ?? null
  const mediaList = Array.isArray(mediaUrls)
    ? mediaUrls.filter((url) => typeof url === 'string' && url.length > 0)
    : []
  const limitedMedia = mediaList.slice(0, 4)
  const extraMediaCount = mediaList.length - limitedMedia.length
  const gridClass = `question-images-count-${Math.min(limitedMedia.length || 1, 4)}`
  const handleReportClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      if (onReportClick) {
        onReportClick()
        return
      }
      if (!isLoggedIn) {
        setLoginPromptOpen(true)
        return
      }
      setReportModalOpen(true)
    },
    [onReportClick, isLoggedIn]
  )
  const handleReportSuccess = useCallback(() => {
    setHasReported(true)
  }, [])

  const bodyContent = fullBody ? (
    <div
      className="question-content question-content--full"
      dangerouslySetInnerHTML={{ __html: renderedBody }}
    />
  ) : (
    <p className="question-content">{excerpt}</p>
  )

  return (
    <>
      <div
        key={id}
        className={`question-card${interactive ? '' : ' question-card-static'}`}
        role="article"
        onClick={interactive ? handleNavigate : undefined}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (!interactive) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleNavigate()
          }
        }}
        tabIndex={interactive ? 0 : -1}
        data-item-type={itemType}
      >
      <div className="question-header">
        <div className="question-meta">
          <div className="question-author-row">
            {author?.id ? (
              <a
                className="author-avatar-small"
                href={`/users/${author.id}`}
                onClick={handleAuthorClick}
                aria-label={`${authorDisplayName} 프로필 보기`}
              >
                <img
                  src={author.avatarUrl || DEFAULT_AVATAR_URL}
                  alt={`${authorDisplayName}의 프로필 사진`}
                  loading="lazy"
                />
              </a>
            ) : (
              <div
                className="author-avatar-small"
                aria-label={`${authorDisplayName} 프로필`}
              >
                <img
                  src={author?.avatarUrl || DEFAULT_AVATAR_URL}
                  alt={`${authorDisplayName}의 프로필 사진`}
                  loading="lazy"
                />
              </div>
            )}
            <div className="question-author-info">
              {(badge || topic) && (
                <div className="question-topic-row">
                  {badge && (
                    <span className="question-topic-badge" aria-label="질문 상태">
                      {badge}
                    </span>
                  )}
                  {topic && (
                    <span className="question-topic-label" aria-label="게시글 토픽">
                      {topic}
                    </span>
                  )}
                </div>
              )}
              <div className="author-primary-row">
                <div className="author-meta-group">
                  {author?.id ? (
                    <a
                      className="question-author-link"
                      href={`/users/${author.id}`}
                      onClick={handleAuthorClick}
                    >
                      {authorDisplayName}
                    </a>
                  ) : (
                    <span className="question-author-link">
                      {authorDisplayName}
                    </span>
                  )}
                  {author?.customBadgeIcon || author?.customBadgeLabel ? (
                    <span className="author-custom-badge">
                      {author.customBadgeIcon && <span aria-hidden>{author.customBadgeIcon}</span>}
                      {author.customBadgeLabel && <span>{author.customBadgeLabel}</span>}
                    </span>
                  ) : null}
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
          {ownerActions && (ownerActions.onEdit || ownerActions.onDelete) && (
            <div className="question-owner-actions" aria-label="게시글 관리 도구">
              {ownerActions.onEdit && (
                <button
                  type="button"
                  className="question-owner-btn edit"
                  onClick={(event) => {
                    event.stopPropagation()
                    ownerActions.onEdit?.()
                  }}
                  disabled={ownerActions.isEditing}
                >
                  {ownerActions.isEditing
                    ? '수정 중...'
                    : ownerActions.editLabel ?? '수정'}
                </button>
              )}
              {ownerActions.onDelete && (
                <button
                  type="button"
                  className="question-owner-btn delete"
                  onClick={(event) => {
                    event.stopPropagation()
                    ownerActions.onDelete?.()
                  }}
                  disabled={ownerActions.isDeleting}
                >
                  {ownerActions.isDeleting
                    ? '삭제 중...'
                    : ownerActions.deleteLabel ?? '삭제'}
                </button>
              )}
            </div>
          )}
          {showReportButton && (
            <button
              className={`question-report-btn${hasReported ? ' reported' : ''}`}
              type="button"
              aria-label={hasReported ? '이미 신고된 콘텐츠' : '신고하기'}
              title={hasReported ? '이미 신고되었습니다' : '신고하기'}
              onClick={handleReportClick}
              disabled={hasReported}
            >
              <span className="question-report-icon" aria-hidden="true">
                {hasReported ? '✅' : '🚨'}
              </span>
            </button>
          )}
        </div>
      </div>

      {title.trim().length > 0 && (
        <h3 className="question-title">{title}</h3>
      )}
      {bodyContent}

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
            showAcceptButton={actionProps.showAcceptButton}
            onAcceptClick={actionProps.onAcceptClick}
            isAccepted={actionProps.isAccepted}
          />
        </div>
      )}
    </div>

      {showReportButton && !onReportClick && (
        <>
          <ReportContentModal
            isOpen={isReportModalOpen}
            onClose={() => setReportModalOpen(false)}
            targetId={id}
            targetType={reportTargetType}
            targetTitle={title}
            targetExcerpt={excerpt}
            targetUrl={href}
            metadata={reportMetadata}
            onSuccess={handleReportSuccess}
          />
          <LoginPromptModal
            isOpen={isLoginPromptOpen}
            onClose={() => setLoginPromptOpen(false)}
            redirectTo={href}
            message="신고 기능은 로그인 후 이용할 수 있습니다."
          />
        </>
      )}
    </>
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

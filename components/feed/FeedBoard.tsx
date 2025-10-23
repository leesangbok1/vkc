'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import FeedCard from '@/components/feed/FeedCard'
import type { FeedCardItemType, FeedCardAuthor, FeedCardActionProps } from '@/components/feed/FeedCard'
import { FeedSkeleton } from '@/components/questions/FeedSkeleton'
import { FeedEmptyState } from '@/components/questions/FeedEmptyState'
import StatusBadge from '@/components/common/StatusBadge'

type FeedMode = 'all' | 'questions'
type FeedSort = 'all' | 'popular' | 'recent'

export interface FeedBoardItem {
  id: string
  type: FeedCardItemType
  title: string
  body: string
  createdAt: string
  author: FeedCardAuthor
  votes: number
  answerCount?: number
  helpfulCount?: number
  isHelpful?: boolean
  status?: string | null
  categoryName?: string | null
  attachments?: string[]
}

interface FollowControlsConfig {
  followedIds: string[]
  onToggleFollow?: (authorId: string, isFollowing: boolean) => Promise<void> | void
  labels?: { follow: string; following: string }
}

interface FeedBoardProps {
  mode: FeedMode
  title?: string
  emptyState?: {
    icon: string
    title: string
    description?: string
    actionLabel?: string
    actionHref?: string
  }
  followControls?: FollowControlsConfig
  renderStats?: (item: FeedBoardItem) => ReactNode
  highlightId?: string | null
}

const SORT_TABS: { value: FeedSort; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'popular', label: '인기' },
  { value: 'recent', label: '최신' }
]

const DEFAULT_EMPTY_STATE = {
  icon: '📭',
  title: '게시글이 없습니다',
  description: '첫 게시글을 작성해 커뮤니티를 시작해보세요.',
  actionHref: '/posts/new',
  actionLabel: '정보 글 작성하기'
}

const DEFAULT_FOLLOW_LABELS = {
  follow: '팔로우',
  following: '팔로잉'
}

const extractMediaUrls = (source: any): string[] => {
  if (!source) return []
  const candidates = [
    source.attachments,
    source.images,
    source.image_urls,
    source.media_urls,
    source.media
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((value) => typeof value === 'string' && value.length > 0)
    }
  }

  if (typeof source.imageUrl === 'string') {
    return [source.imageUrl]
  }

  return []
}

export default function FeedBoard({
  mode,
  title,
  emptyState = DEFAULT_EMPTY_STATE,
  followControls,
  renderStats,
  highlightId,
}: FeedBoardProps) {
  const [sort, setSort] = useState<FeedSort>('all')
  const [items, setItems] = useState<FeedBoardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [consumedHighlightId, setConsumedHighlightId] = useState<string | null>(null)
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadFeed() {
      setLoading(true)
      setError(null)

      try {
        const apiSort = sort === 'popular' ? 'popular' : 'recent'

        const [questionsRes, postsRes] = await Promise.all([
          fetch(`/api/questions?sort=${apiSort}&limit=30`, { cache: 'no-store', credentials: 'include' }),
          mode === 'all'
            ? fetch(`/api/posts?sort=${apiSort}&limit=30`, { cache: 'no-store', credentials: 'include' })
            : Promise.resolve(null)
        ])

        if (!questionsRes.ok) {
          throw new Error(`/api/questions failed ${questionsRes.status}`)
        }

        const [questionsJson, postsJson] = await Promise.all([
          questionsRes.json().catch(() => null),
          postsRes ? postsRes.json().catch(() => null) : Promise.resolve(null)
        ])

        const questionItems = mapQuestionsToFeedItems(questionsJson)
        const postItems = mode === 'all' ? mapPostsToFeedItems(postsJson) : []

        const combined = mode === 'all'
          ? sortFeedItems([...questionItems, ...postItems], sort, mode)
          : sortFeedItems(questionItems, sort, mode)

        if (!ignore) {
          setItems(combined)
        }
      } catch (err: any) {
        console.error('[FeedBoard] load failed', err)
        if (!ignore) {
          setItems([])
          setError(err?.message || '피드를 불러오는 중 오류가 발생했습니다.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadFeed()
    return () => {
      ignore = true
    }
  }, [mode, sort, reloadKey])

  useEffect(() => {
    if (!highlightId) {
      if (consumedHighlightId !== null) {
        setConsumedHighlightId(null)
      }
      return
    }

    if (highlightId === consumedHighlightId) {
      return
    }

    const exists = items.some((item) => item.id === highlightId)
    if (!exists) {
      return
    }

    setConsumedHighlightId(highlightId)
    setActiveHighlightId(highlightId)
  }, [highlightId, consumedHighlightId, items])

  useEffect(() => {
    if (!activeHighlightId) return
    if (typeof window === 'undefined') return

    const element = document.querySelector<HTMLElement>(
      `[data-feed-item-id="${activeHighlightId}"]`
    )

    if (!element) return

    element.scrollIntoView({ behavior: 'smooth', block: 'center' })

    const timer = window.setTimeout(() => {
      setActiveHighlightId(null)
    }, 4000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [activeHighlightId])

  const headerTitle = useMemo(() => title, [title])

  return (
    <section className="feed-container">
      {headerTitle && (
        <header className="all-posts-header">
          <h1 className="section-title" translate="no">
            {headerTitle}
          </h1>
        </header>
      )}

      <div className="all-posts-sort-tabs">
        {SORT_TABS.map((option) => (
          <button
            key={option.value}
            className={`category-tab ${sort === option.value ? 'active' : ''}`}
            onClick={() => setSort(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <FeedSkeleton count={4} />
      ) : error ? (
        <div className="section all-posts-error">
          <div className="all-posts-error-icon">⚠️</div>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => setReloadKey((prev) => prev + 1)}>
            다시 시도하기
          </button>
        </div>
      ) : items.length === 0 ? (
        <FeedEmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          description={emptyState.description}
          actionHref={emptyState.actionHref}
          actionLabel={emptyState.actionLabel}
        />
      ) : (
        items.map((item) => {
          const stats = renderStats ? renderStats(item) : buildStatsLabel(item)
          const badge = item.type === 'question'
            ? <StatusBadge resolved={item.status === 'resolved'} compact />
            : undefined

          const actionProps: FeedCardActionProps = {
            targetType: item.type,
            helpfulCount: item.helpfulCount ?? item.votes,
            isHelpful: item.isHelpful,
            requireLogin: false,
            compact: true,
          }

          const authorId = item.author?.id
          const followedIds = followControls?.followedIds ?? []
          const enableFollow = Boolean(
            followControls &&
            item.type === 'question' &&
            authorId &&
            authorId !== 'unknown'
          )
          const isFollowing = enableFollow && authorId ? followedIds.includes(authorId) : false
          const followLabels = followControls?.labels ?? DEFAULT_FOLLOW_LABELS

          const isHighlighted = activeHighlightId === item.id

          return (
            <div
              key={`${item.type}-${item.id}`}
              data-feed-item-id={item.id}
              className={`feed-item-wrapper${isHighlighted ? ' feed-item-highlight' : ''}`}
            >
              <FeedCard
                id={item.id}
                itemType={item.type}
                title={item.title}
                body={item.body}
                href={item.type === 'question' ? `/questions/${item.id}` : `/posts/${item.id}`}
                createdAt={item.createdAt}
                topic={item.categoryName || (item.type === 'post' ? '정보글' : '질문')}
                author={item.author}
                stats={stats}
                badge={badge}
                mediaUrls={item.attachments}
                showReportButton
                showFollowButton={Boolean(enableFollow)}
                isFollowing={isFollowing}
                followLabels={followLabels}
                onToggleFollow={
                  enableFollow && followControls?.onToggleFollow && authorId
                    ? () => followControls.onToggleFollow?.(authorId, isFollowing)
                    : undefined
                }
                actionProps={actionProps}
                onNavigate={(href) => {
                  window.location.href = href
                }}
                onAuthorClick={(authorId) => {
                  if (authorId && authorId !== 'unknown') {
                    window.location.href = `/users/${authorId}`
                  }
                }}
              />
            </div>
          )
        })
      )}
    </section>
  )
}

const readLocalHelpfulStateForFeed = (targetType: 'question' | 'post', id: string) => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(`vk_helpful:${targetType}:${id}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return {
      count: typeof parsed.count === 'number' ? parsed.count : undefined,
      isHelpful: typeof parsed.isHelpful === 'boolean' ? parsed.isHelpful : undefined,
    }
  } catch {
    return null
  }
}

function mapQuestionsToFeedItems(payload: any): FeedBoardItem[] {
  const source = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.items) ? payload.items : []

  return source
    .filter((q: any) => q?.id)
    .map((q: any) => ({
      id: String(q.id),
      type: 'question' as const,
      title: q.title ?? '제목 없음',
      body: q.content ?? '',
      createdAt: q.created_at ?? new Date().toISOString(),
      author: normalizeAuthor(q.author),
      votes: (() => {
        const stored = readLocalHelpfulStateForFeed('question', String(q.id))
        if (typeof stored?.count === 'number') return stored.count
        return q.upvote_count ?? 0
      })(),
      answerCount: q.answer_count ?? 0,
      helpfulCount: (() => {
        const stored = readLocalHelpfulStateForFeed('question', String(q.id))
        if (typeof stored?.count === 'number') return stored.count
        return q.helpful_count ?? 0
      })(),
      isHelpful: (() => {
        const stored = readLocalHelpfulStateForFeed('question', String(q.id))
        if (typeof stored?.isHelpful === 'boolean') return stored.isHelpful
        return Boolean(q.is_helpful_by_viewer)
      })(),
      status: q.status ?? null,
      categoryName: q.category?.name ?? null,
    }))
}

function mapPostsToFeedItems(payload: any): FeedBoardItem[] {
  const source = Array.isArray(payload?.items) ? payload.items : []

  return source
    .filter((p: any) => p?.id)
    .map((p: any) => {
      const normalizedAuthor = normalizeAuthor(p.author)
      const fallbackName = p.category?.name ? `${p.category.name} 정보` : '정보 글'
      const hasKnownAuthor = normalizedAuthor.id && normalizedAuthor.id !== 'unknown'

      return {
        id: String(p.id),
        type: 'post' as const,
        title: p.title ?? '제목 없음',
        body: p.content ?? '',
        createdAt: p.created_at ?? new Date().toISOString(),
        author: {
          ...normalizedAuthor,
          name: hasKnownAuthor ? (normalizedAuthor.name || '커뮤니티 멤버') : fallbackName,
        },
        votes: (() => {
          const stored = readLocalHelpfulStateForFeed('post', String(p.id))
          if (typeof stored?.count === 'number') return stored.count
          return p.helpful_count ?? 0
        })(),
        helpfulCount: (() => {
          const stored = readLocalHelpfulStateForFeed('post', String(p.id))
          if (typeof stored?.count === 'number') return stored.count
          return p.helpful_count ?? 0
        })(),
        isHelpful: (() => {
          const stored = readLocalHelpfulStateForFeed('post', String(p.id))
          if (typeof stored?.isHelpful === 'boolean') return stored.isHelpful
          return Boolean(p.is_helpful_by_viewer)
        })(),
        categoryName: p.category?.name ?? null,
        attachments: extractMediaUrls(p),
      }
    })
}

function normalizeAuthor(raw: any): FeedCardAuthor {
  if (!raw) {
    return {
      id: 'unknown',
      name: '익명',
    }
  }

  return {
    id: raw.id ?? 'unknown',
    name: raw.name ?? '익명',
    role: raw.role ?? null,
    visaType: raw.visa_type ?? raw.visaType ?? null,
    yearsInKorea: raw.years_in_korea ?? raw.yearsInKorea ?? null,
  }
}

function sortFeedItems(items: FeedBoardItem[], sort: FeedSort, mode: FeedMode) {
  if (sort === 'popular') {
    return [...items].sort((a, b) => {
      const aScore = a.votes ?? 0
      const bScore = b.votes ?? 0
      if (bScore !== aScore) return bScore - aScore
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  if (sort === 'recent' || mode === 'questions') {
    return [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // sort === 'all' for mode === 'all'
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

function buildStatsLabel(item: FeedBoardItem) {
  if (item.type === 'question') {
    if (item.answerCount && item.answerCount > 0) {
      return (
        <span>
          답변 {item.answerCount}개
        </span>
      )
    }
    return null
  }

  if (item.categoryName) {
    return item.categoryName
  }

  return (
    <span>
      도움됨 {item.helpfulCount ?? 0}
    </span>
  )
}

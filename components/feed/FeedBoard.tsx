'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import FeedCard from '@/components/feed/FeedCard'
import type { FeedCardItemType, FeedCardAuthor, FeedCardActionProps } from '@/components/feed/FeedCard'
import { FeedSkeleton } from '@/components/questions/FeedSkeleton'
import { FeedEmptyState } from '@/components/questions/FeedEmptyState'
import { extractMediaUrls } from '@/lib/utils/media'

type FeedMode = 'all' | 'questions' | 'posts'
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
  viewerCanManage?: boolean
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
  defaultSort?: FeedSort
  showSortTabs?: boolean
  questionsQuery?: Record<string, string | number | boolean>
  postsQuery?: Record<string, string | number | boolean>
  includeCredentials?: boolean
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

export default function FeedBoard({
  mode,
  title,
  emptyState = DEFAULT_EMPTY_STATE,
  followControls,
  renderStats,
  highlightId,
  defaultSort = 'all',
  showSortTabs = true,
  questionsQuery,
  postsQuery,
  includeCredentials = true,
}: FeedBoardProps) {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [sort, setSort] = useState<FeedSort>(defaultSort)
  const [items, setItems] = useState<FeedBoardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [consumedHighlightId, setConsumedHighlightId] = useState<string | null>(null)
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const handleEditPost = useCallback(
    (postId: string) => {
      router.push(`/posts/${postId}/edit`)
    },
    [router]
  )

  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (pendingDeleteId === postId) return

      if (typeof window !== 'undefined') {
        const confirmed = window.confirm('게시글을 삭제하면 복구할 수 없습니다. 계속하시겠습니까?')
        if (!confirmed) {
          return
        }
      }

      setPendingDeleteId(postId)
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
          ...(includeCredentials ? { credentials: 'include' as const } : {}),
        })
        const json = await response.json().catch(() => null)

        if (!response.ok || !json?.success) {
          const message = json?.error || '게시글 삭제에 실패했습니다.'
          alert(message)
          return
        }

        setItems((prev) =>
          prev.filter((item) => !(item.type === 'post' && item.id === postId))
        )
      } catch (error) {
        console.error('[FeedBoard] delete post failed', error)
        alert('게시글 삭제 중 오류가 발생했습니다.')
      } finally {
        setPendingDeleteId((current) => (current === postId ? null : current))
      }
    },
    [includeCredentials, pendingDeleteId]
  )

  useEffect(() => {
    setSort(defaultSort)
  }, [defaultSort])

  useEffect(() => {
    let ignore = false

    async function loadFeed() {
      setLoading(true)
      setError(null)

      try {
        const apiSort = sort === 'popular' ? 'popular' : 'recent'

        const questionParams = new URLSearchParams({ sort: apiSort, limit: '30' })
        if (questionsQuery) {
          Object.entries(questionsQuery).forEach(([key, value]) => {
            if (value === undefined || value === null) return
            questionParams.set(key, String(value))
          })
        }

        const postParams = new URLSearchParams({ sort: apiSort, limit: '30' })
        if (postsQuery) {
          Object.entries(postsQuery).forEach(([key, value]) => {
            if (value === undefined || value === null) return
            postParams.set(key, String(value))
          })
        }

        const shouldFetchQuestions = mode !== 'posts'
        const shouldFetchPosts = mode !== 'questions'

        const questionFetchOptions: RequestInit = {
          cache: 'no-store',
          ...(includeCredentials ? { credentials: 'include' as const } : {}),
        }
        const postFetchOptions: RequestInit = {
          cache: 'no-store',
          ...(includeCredentials ? { credentials: 'include' as const } : {}),
        }

        const [questionsRes, postsRes] = await Promise.all([
          shouldFetchQuestions
            ? fetch(`/api/questions?${questionParams.toString()}`, questionFetchOptions)
            : Promise.resolve(null),
          shouldFetchPosts
            ? fetch(`/api/posts?${postParams.toString()}`, postFetchOptions)
            : Promise.resolve(null)
        ])

        if (shouldFetchQuestions && questionsRes && !questionsRes.ok) {
          throw new Error(`/api/questions failed ${questionsRes.status}`)
        }

        if (shouldFetchPosts && postsRes && !postsRes.ok) {
          throw new Error(`/api/posts failed ${postsRes.status}`)
        }

        const [questionsJson, postsJson] = await Promise.all([
          shouldFetchQuestions && questionsRes
            ? questionsRes.json().catch(() => null)
            : Promise.resolve(null),
          shouldFetchPosts && postsRes
            ? postsRes.json().catch(() => null)
            : Promise.resolve(null)
        ])

        const questionItems = shouldFetchQuestions ? mapQuestionsToFeedItems(questionsJson) : []
        const postItems = shouldFetchPosts ? mapPostsToFeedItems(postsJson) : []

        let combined: FeedBoardItem[]
        if (mode === 'questions') {
          combined = sortFeedItems(questionItems, sort, mode)
        } else if (mode === 'posts') {
          combined = sortFeedItems(postItems, sort, mode)
        } else {
          combined = sortFeedItems([...questionItems, ...postItems], sort, mode)
        }

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

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string; avatar_url?: string | null; name?: string }>).detail
      if (!detail?.id) return
      const nextDisplayName = detail.name

      setItems((prev) =>
        prev.map((item) => {
          if (!item.author || item.author.id !== detail.id) {
            return item
          }

          return {
            ...item,
            author: {
              ...item.author,
              avatarUrl: detail.avatar_url ?? item.author.avatarUrl ?? null,
              name: nextDisplayName ?? item.author.name,
            },
          }
        })
      )
    }

    window.addEventListener('vk-profile-updated', handleProfileUpdated)
    return () => {
      window.removeEventListener('vk-profile-updated', handleProfileUpdated)
    }
  }, [])

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

      {showSortTabs && (
        <div className="all-posts-sort-tabs inline-sort-tabs">
          {SORT_TABS.map((option, index) => (
            <span key={option.value} className="inline-sort-segment">
              <button
                type="button"
                className={`inline-sort-btn${sort === option.value ? ' active' : ''}`}
                onClick={() => setSort(option.value)}
                aria-pressed={sort === option.value}
              >
                {option.label}
              </button>
              {index < SORT_TABS.length - 1 && (
                <span className="inline-sort-divider" aria-hidden="true">
                  /
                </span>
              )}
            </span>
          ))}
        </div>
      )}

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

          const actionProps: FeedCardActionProps = {
            targetType: item.type,
            helpfulCount: item.helpfulCount ?? item.votes,
            isHelpful: item.isHelpful,
            requireLogin: !isLoggedIn,
            onLoginRequired: () => {
              const redirectTo =
                typeof window !== 'undefined'
                  ? window.location.pathname + window.location.search
                  : '/'
              router.push(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`)
            },
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
          const ownerActions =
            item.type === 'post' && item.viewerCanManage
              ? {
                  onEdit: () => handleEditPost(item.id),
                  onDelete: () => handleDeletePost(item.id),
                  isDeleting: pendingDeleteId === item.id,
                }
              : undefined

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
                  router.push(href)
                }}
                onAuthorClick={(authorId) => {
                  if (authorId && authorId !== 'unknown') {
                    router.push(`/users/${authorId}`)
                  }
                }}
                ownerActions={ownerActions}
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
        if (typeof q.metrics?.score === 'number') {
          return Number(q.metrics.score)
        }
        const stored = readLocalHelpfulStateForFeed('question', String(q.id))
        if (typeof stored?.count === 'number') return stored.count
        return q.helpful_count ?? q.upvote_count ?? 0
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
      attachments: extractMediaUrls(q),
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
          name: hasKnownAuthor
            ? normalizedAuthor.name || '커뮤니티 멤버'
            : fallbackName,
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
        viewerCanManage: Boolean(p.viewer_can_manage),
      }
    })
}

function normalizeAuthor(raw: any): FeedCardAuthor {
  if (!raw) {
    return {
      id: 'unknown',
      name: '익명',
      avatarUrl: null,
    }
  }

  const nickname =
    typeof raw.name === 'string' && raw.name.length > 0
      ? raw.name
      : '익명'

  return {
    id: raw.id ?? 'unknown',
    name: nickname,
    role: raw.role ?? null,
    visaType: raw.visa_type ?? raw.visaType ?? null,
    yearsInKorea: raw.years_in_korea ?? raw.yearsInKorea ?? null,
    avatarUrl:
      typeof raw.avatar_url === 'string'
        ? raw.avatar_url
        : typeof raw.avatarUrl === 'string'
          ? raw.avatarUrl
          : null,
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

  if (sort === 'recent' || mode === 'questions' || mode === 'posts') {
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

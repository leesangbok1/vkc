'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import FeedCard from '@/components/feed/FeedCard'
import { FeedSkeleton } from '@/components/questions/FeedSkeleton'
import { FeedEmptyState } from '@/components/questions/FeedEmptyState'
import { truncateToSentences } from '@/lib/utils/text-utils'
import { getFollowedUsers, toggleFollowUser } from '@/lib/utils/follow-manager'
import { extractMediaUrls } from '@/lib/utils/media'

type FeedQuestion = {
  id: string
  title: string
  content: string
  created_at?: string
  answer_count?: number
  category?: { name?: string | null } | null
  helpful_count?: number
  is_helpful_by_viewer?: boolean
  author?: {
    id?: string
    name?: string | null
    role?: string | null
    avatar_url?: string | null
    visaType?: string | null
    yearsInKorea?: number | null
  }
}

type RecommendedUser = {
  id: string
  name: string
  role: string
  avatar_url?: string | null
  helpful_answer_count?: number | null
  answer_count?: number | null
  trust_score?: number | null
  score?: number | null
  specialties?: string[] | null
  interests?: string[] | null
}

export default function FollowingPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [viewerId, setViewerId] = useState<string | null>(null)
  const [feed, setFeed] = useState<FeedQuestion[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [feedError, setFeedError] = useState<string | null>(null)

  const [viewerTopics, setViewerTopics] = useState<string[]>([])
  const [recommended, setRecommended] = useState<RecommendedUser[]>([])
  const [recommendedLoading, setRecommendedLoading] = useState(true)
  const [recommendedError, setRecommendedError] = useState<string | null>(null)

  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const fallbackAttemptedRef = useRef(false)
  const handleLoginRedirect = useCallback(() => {
    const redirectTarget = encodeURIComponent('/following')
    router.push(`/auth/login?redirectTo=${redirectTarget}`)
  }, [router])

  useEffect(() => {
    let ignore = false

    async function bootstrap() {
      try {
        const profileRes = await fetch('/api/auth/profile', { cache: 'no-store' })
        if (!profileRes.ok) {
          if (!ignore) {
            setIsLoggedIn(false)
            const redirect = encodeURIComponent('/following')
            router.push(`/auth/login?redirectTo=${redirect}`)
          }
          return
        }

        const profileJson = await profileRes.json()
        const profileData = profileJson?.data || {}
        const interests: string[] = Array.isArray(profileData.interests)
          ? profileData.interests
          : []

        let followingSet = new Set<string>()
        try {
          const followed = await getFollowedUsers(true)
          followingSet = new Set(followed.map((user) => user.id))
        } catch (followError) {
          console.error('[FollowingPage] failed to load following list', followError)
        }

        if (!ignore) {
          setIsLoggedIn(true)
          setViewerId(profileData.id ?? null)
          setViewerTopics(interests)
          setFollowingIds(followingSet)
        }
      } catch (error) {
        console.error('[FollowingPage] profile load failed', error)
        if (!ignore) {
          setIsLoggedIn(false)
          setViewerId(null)
        }
      }
    }

    bootstrap()
    return () => {
      ignore = true
    }
  }, [router])

  useEffect(() => {
    if (!isLoggedIn) return

    let ignore = false

    async function loadFeed() {
      setFeedLoading(true)
      setFeedError(null)

      try {
        const feedRes = await fetch('/api/questions?following=true&sort=popular&limit=20', { cache: 'no-store' })
        if (feedRes.status === 401) {
          if (!ignore) {
            const redirect = encodeURIComponent('/following')
            router.push(`/auth/login?redirectTo=${redirect}`)
          }
          return
        }

        if (!feedRes.ok) {
          throw new Error(`follow feed failed ${feedRes.status}`)
        }

        const json = await feedRes.json()
        const items = Array.isArray(json?.items) ? json.items : []

        if (!ignore) {
          setFeed(
            items.map((q: any) => ({
              id: q.id,
              title: q.title,
              content: q.content,
              author: q.author,
              answer_count: q.answer_count,
              created_at: q.created_at,
              helpful_count: q.helpful_count ?? q.helpfulCount ?? 0,
              is_helpful_by_viewer: q.is_helpful_by_viewer,
              category: q.category ?? null,
            }))
          )
        }
      } catch (error: any) {
        if (!ignore) {
          setFeed([])
          setFeedError(error?.message || '팔로잉 피드를 불러오지 못했습니다.')
        }
      } finally {
        if (!ignore) setFeedLoading(false)
      }
    }

    loadFeed()
    return () => { ignore = true }
  }, [isLoggedIn, router])

  useEffect(() => {
    if (!isLoggedIn) return

    let ignore = false

    const fetchFallbackUsers = async (): Promise<RecommendedUser[]> => {
      const fallbackRes = await fetch('/api/users/popular?limit=50', { cache: 'no-store' })
      const fallbackPayload = await fallbackRes.json().catch(() => null)
      if (!fallbackRes.ok) {
        const fallbackMessage =
          fallbackPayload?.error ||
          fallbackPayload?.details ||
          `popular users failed ${fallbackRes.status}`
        throw new Error(fallbackMessage)
      }
      const fallbackUsers = Array.isArray(fallbackPayload?.data) ? fallbackPayload.data : []
      return fallbackUsers.map((user: any) => ({
        id: user.id,
        name: typeof user.name === 'string' && user.name.length > 0 ? user.name : '사용자',
        role: user.role,
        avatar_url: user.avatar_url ?? null,
        helpful_answer_count: user.helpful_answer_count ?? null,
        answer_count: user.answer_count ?? null,
        trust_score: user.trust_score ?? null,
        score: typeof user.score === 'number' ? user.score : null,
        specialties: Array.isArray(user.specialties) ? user.specialties : null,
        interests: Array.isArray(user.interests) ? user.interests : null,
      }))
    }

    const fetchPrimaryUsers = async (): Promise<RecommendedUser[]> => {
      const res = await fetch('/api/users/recommended?limit=50', { cache: 'no-store' })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        const message =
          payload?.error || payload?.details || `recommended users failed ${res.status}`
        throw new Error(message)
      }
      return Array.isArray(payload?.data) ? payload.data : []
    }

    async function loadRecommended() {
      fallbackAttemptedRef.current = false
      setRecommendedLoading(true)
      setRecommendedError(null)

      const applyUsers = (users: RecommendedUser[] | null | undefined) => {
        if (ignore) return
        setRecommended(Array.isArray(users) ? users : [])
        setRecommendedError(null)
      }

      try {
        let users = await fetchPrimaryUsers()
        if ((!users || users.length === 0) && !fallbackAttemptedRef.current) {
          fallbackAttemptedRef.current = true
          users = await fetchFallbackUsers()
        }
        applyUsers(users)
      } catch (error: any) {
        console.error('[FollowingPage] recommended load failed', error)
        if (!fallbackAttemptedRef.current) {
          try {
            fallbackAttemptedRef.current = true
            const fallbackUsers = await fetchFallbackUsers()
            applyUsers(fallbackUsers)
            return
          } catch (fallbackError: any) {
            console.error('[FollowingPage] fallback popular load failed', fallbackError)
            if (!ignore) {
              setRecommended([])
              setRecommendedError(fallbackError?.message || '추천 사용자를 불러오지 못했습니다.')
            }
            return
          }
        }
        if (!ignore) {
          setRecommended([])
          setRecommendedError(error?.message || '추천 사용자를 불러오지 못했습니다.')
        }
      } finally {
        if (!ignore) setRecommendedLoading(false)
      }
    }

    loadRecommended()
    return () => { ignore = true }
  }, [isLoggedIn, viewerTopics])

  const toggleFollow = async (userId: string) => {
    if (!userId) return
    if (viewerId && viewerId === userId) {
      alert('내 계정은 팔로우할 수 없습니다.')
      return
    }

    const alreadyFollowing = followingIds.has(userId)
    const previous = new Set(followingIds)
    const optimistic = new Set(followingIds)
    if (alreadyFollowing) {
      optimistic.delete(userId)
    } else {
      optimistic.add(userId)
    }
    setFollowingIds(optimistic)

    try {
      const { success, isFollowing, error } = await toggleFollowUser(userId, {
        viewerId,
      })
      if (!success) {
        if (error === 'SELF_FOLLOW') {
          setFollowingIds(previous)
          alert('내 계정은 팔로우할 수 없습니다.')
          return
        }
        throw new Error(error || 'follow toggle failed')
      }
      setFollowingIds((prev) => {
        const update = new Set(prev)
        if (isFollowing) update.add(userId)
        else update.delete(userId)
        return update
      })
    } catch (error) {
      console.error('toggleFollow error', error)
      setFollowingIds(new Set(previous))
      alert('팔로우 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const hasRecommended = useMemo(() => recommended.length > 0, [recommended])

  if (!isLoggedIn) {
    return (
      <PageLayout variant="centered">
        <FeedSkeleton count={3} />
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="withSidebar" showSidebar={false}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 320px) 1fr',
          gap: '2rem',
          alignItems: 'flex-start',
          width: '100%'
        }}
      >
        <aside
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '1.5rem',
            maxHeight: 'calc(100vh - 160px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              팔로잉 추천
              <span className="sr-only"> · 개인 관심사와 인기 지표를 활용한 추천</span>
            </h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            {recommendedLoading ? (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '1.5rem 0' }}>추천 사용자를 불러오는 중...</div>
            ) : recommendedError ? (
              <div style={{ textAlign: 'center', color: '#ef4444', padding: '1.5rem 0' }}>{recommendedError}</div>
            ) : !hasRecommended ? (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '1.5rem 0' }}>추천할 사용자가 없습니다.</div>
            ) : (
              recommended.slice(0, 12).map((user) => {
                const isFollowing = followingIds.has(user.id)
                const displayName = user.name || '커뮤니티 멤버'
                const helpfulCount = user.helpful_answer_count ?? 0
                const answerCount = user.answer_count ?? 0
                const trustScore =
                  typeof user.trust_score === 'number'
                    ? Math.round(user.trust_score)
                    : null
                const tagCandidates = [
                  ...(Array.isArray(user.specialties) ? user.specialties : []),
                  ...(Array.isArray(user.interests) ? user.interests : []),
                ]
                const tags = Array.from(
                  new Set(
                    tagCandidates
                      .filter((tag) => typeof tag === 'string' && tag.trim().length > 0)
                      .map((tag) => tag.trim())
                  )
                ).slice(0, 3)

                const navigateToProfile = () => {
                  router.push(`/users/${user.id}`)
                }

                const showPlaceholder = !user.avatar_url

                return (
                  <div key={user.id} className="recommended-user-card">
                    <div
                      className="recommended-user-main"
                      role="button"
                      tabIndex={0}
                      onClick={navigateToProfile}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigateToProfile()
                        }
                      }}
                    >
                      <div
                        className="recommended-user-avatar"
                        role={showPlaceholder ? 'img' : undefined}
                        aria-label={showPlaceholder ? `${displayName} 프로필 이미지` : undefined}
                      >
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={`${displayName} 프로필 이미지`} />
                        ) : (
                          <span aria-hidden>👤</span>
                        )}
                      </div>
                      <div className="recommended-user-body">
                        <div className="recommended-user-name-row">
                          <span className="recommended-user-name">{displayName}</span>
                          {user.role === 'verified' && (
                            <span className="recommended-user-badge">인증</span>
                          )}
                        </div>
                        <div className="recommended-user-stats">
                          도움됨 {helpfulCount.toLocaleString()} · 답변 {answerCount.toLocaleString()}
                          {typeof trustScore === 'number' ? ` · 신뢰 ${trustScore}` : ''}
                        </div>
                        {tags.length > 0 && (
                          <div className="recommended-user-tags">
                            {tags.map((tag) => (
                              <span key={tag}>#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} recommended-user-follow ${isFollowing ? 'is-following' : ''}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleFollow(user.id)
                      }}
                      onKeyDown={(event) => {
                        event.stopPropagation()
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          toggleFollow(user.id)
                        }
                      }}
                    >
                      {isFollowing ? '팔로잉' : '팔로우'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </aside>

        <section>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            👥 팔로잉 피드
          </h1>

          {feedLoading ? (
            <FeedSkeleton count={3} />
          ) : feedError ? (
            <div className="section all-posts-error">
              <div className="all-posts-error-icon">⚠️</div>
              <p>{feedError}</p>
            </div>
          ) : feed.length === 0 ? (
            <FeedEmptyState
              icon="📭"
              title="팔로우한 사용자의 게시글이 없습니다"
              description="왼쪽에서 추천 사용자를 팔로우해 보세요."
            />
          ) : (
            feed.map((item) => {
              const authorId = item.author?.id ?? ''
              const isFollowing = authorId ? followingIds.has(authorId) : false
              const helpfulCount = typeof item.helpful_count === 'number' ? item.helpful_count : 0
              const isHelpful = Boolean(item.is_helpful_by_viewer)

              return (
                <FeedCard
                  key={item.id}
                  id={item.id}
                  itemType="question"
                  title={item.title}
                  body={truncateToSentences(item.content, 2)}
                href={`/questions/${item.id}`}
                createdAt={item.created_at || new Date().toISOString()}
                topic={item.category?.name || '팔로잉 피드'}
                author={{
                  id: authorId || 'unknown',
                  name: item.author?.name,
                  role: item.author?.role,
                  visaType: item.author?.visaType ?? null,
                  yearsInKorea: item.author?.yearsInKorea ?? null,
                  avatarUrl: item.author?.avatar_url ?? null,
                }}
                stats={
                  item.answer_count && item.answer_count > 0
                    ? <span>답변 {item.answer_count}개</span>
                    : <span>아직 답변이 없어요</span>
                }
                  mediaUrls={extractMediaUrls(item)}
                  showReportButton
                  showFollowButton={Boolean(authorId)}
                  isFollowing={Boolean(authorId && isFollowing)}
                  onToggleFollow={authorId ? () => toggleFollow(authorId) : undefined}
                  followLabels={{ follow: '팔로우', following: '팔로잉' }}
                  actionProps={{
                    targetType: 'question',
                    helpfulCount,
                    isHelpful,
                    requireLogin: !isLoggedIn,
                    onLoginRequired: handleLoginRedirect,
                    compact: true,
                  }}
                  onNavigate={(href) => {
                    router.push(href)
                  }}
                  onAuthorClick={(id) => {
                    router.push(`/users/${id}`)
                  }}
                />
              )
            })
          )}
        </section>
      </div>
    </PageLayout>
  )
}

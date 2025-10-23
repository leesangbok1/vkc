'use client'

import { useEffect, useMemo, useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import FeedCard from '@/components/feed/FeedCard'
import { FeedSkeleton } from '@/components/questions/FeedSkeleton'
import { FeedEmptyState } from '@/components/questions/FeedEmptyState'
import { truncateToSentences } from '@/lib/utils/text-utils'

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

type FeedQuestion = {
  id: string
  title: string
  content: string
  created_at?: string
  answer_count?: number
  category?: { name?: string | null } | null
  author?: {
    id?: string
    name?: string | null
    role?: string | null
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [feed, setFeed] = useState<FeedQuestion[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [feedError, setFeedError] = useState<string | null>(null)

  const [viewerTopics, setViewerTopics] = useState<string[]>([])
  const [recommended, setRecommended] = useState<RecommendedUser[]>([])
  const [recommendedLoading, setRecommendedLoading] = useState(true)
  const [recommendedError, setRecommendedError] = useState<string | null>(null)

  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let ignore = false

    async function bootstrap() {
      try {
        const profileRes = await fetch('/api/auth/profile', { cache: 'no-store' })
        if (!profileRes.ok) {
          if (!ignore) {
            setIsLoggedIn(false)
            const redirect = encodeURIComponent('/following')
            if (typeof window !== 'undefined') {
              window.location.href = `/auth/login?redirectTo=${redirect}`
            }
          }
          return
        }

        const profileJson = await profileRes.json()
        const profileData = profileJson?.data || {}
        const interests: string[] = Array.isArray(profileData.interests)
          ? profileData.interests
          : []

        const followingRes = await fetch('/api/users/following', { cache: 'no-store' })
        let followingSet = new Set<string>()
        if (followingRes.ok) {
          const followingJson = await followingRes.json()
          const followingData: string[] = Array.isArray(followingJson?.data) ? followingJson.data : []
          followingSet = new Set(followingData)
        }

        if (!ignore) {
          setIsLoggedIn(true)
          setViewerTopics(interests)
          setFollowingIds(followingSet)
        }
      } catch (error) {
        console.error('[FollowingPage] profile load failed', error)
        if (!ignore) {
          setIsLoggedIn(false)
        }
      }
    }

    bootstrap()
    return () => {
      ignore = true
    }
  }, [])

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
            window.location.href = `/auth/login?redirectTo=${redirect}`
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
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) return

    let ignore = false

    async function loadRecommended() {
      setRecommendedLoading(true)
      setRecommendedError(null)

      try {
        const res = await fetch('/api/users/popular?limit=50', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`popular users failed ${res.status}`)
        }

        const json = await res.json()
        const users: RecommendedUser[] = Array.isArray(json?.data) ? json.data : []
        const ranked = rankRecommendedUsers(users, viewerTopics)
        if (!ignore) setRecommended(ranked)
      } catch (error: any) {
        console.error('[FollowingPage] recommended load failed', error)
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

    const alreadyFollowing = followingIds.has(userId)
    const next = new Set(followingIds)
    if (alreadyFollowing) {
      next.delete(userId)
    } else {
      next.add(userId)
    }
    setFollowingIds(next)

    try {
      const method = alreadyFollowing ? 'DELETE' : 'POST'
      const res = await fetch(`/api/users/${userId}/follow`, { method })
      if (!res.ok) {
        throw new Error('follow toggle failed')
      }
      const data = await res.json().catch(() => null)
      if (typeof data?.isFollowing === 'boolean') {
        setFollowingIds((prev) => {
          const update = new Set(prev)
          if (data.isFollowing) update.add(userId)
          else update.delete(userId)
          return update
        })
      }
    } catch (error) {
      console.error('toggleFollow error', error)
      // rollback
      setFollowingIds((prev) => {
        const rollback = new Set(prev)
        if (alreadyFollowing) rollback.add(userId)
        else rollback.delete(userId)
        return rollback
      })
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
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>팔로잉 추천</h2>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>내 토픽과 인기순 기반</span>
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
                return (
                  <div
                    key={user.id}
                    className="question-card"
                    style={{ marginBottom: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onClick={() => window.location.href = `/users/${user.id}`}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div className="author-avatar-small" aria-hidden="true"></div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                          {user.name}
                          {user.role === 'verified' && (
                            <span className="badge" style={{ background: '#2563eb', color: 'white', padding: '2px 6px', borderRadius: 12, fontSize: '0.75rem' }}>
                              인증
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          도움됨 {user.helpful_answer_count ?? 0} · 답변 {user.answer_count ?? 0} · 신뢰 {user.trust_score ?? 0}
                        </div>
                        {user.specialties && user.specialties.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.4rem' }}>
                            #{user.specialties.slice(0, 3).join(' #')}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleFollow(user.id)
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
                    helpfulCount: 0,
                    requireLogin: false,
                    compact: true,
                  }}
                  onNavigate={(href) => {
                    window.location.href = href
                  }}
                  onAuthorClick={(id) => {
                    window.location.href = `/users/${id}`
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

function rankRecommendedUsers(users: RecommendedUser[], viewerTopics: string[]): RecommendedUser[] {
  const topicSet = new Set((viewerTopics || []).map((topic) => topic.toLowerCase()))

  return [...users]
    .map((user) => {
      const specialties = Array.isArray(user.specialties) ? user.specialties : []
      const interests = Array.isArray(user.interests) ? user.interests : []
      const tags = [...specialties, ...interests].map((tag) => String(tag).toLowerCase())
      const overlap = tags.filter((tag) => topicSet.has(tag)).length
      const baseScore = user.score ?? 0
      const boostedScore = baseScore + overlap * 3
      return { ...user, score: boostedScore }
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

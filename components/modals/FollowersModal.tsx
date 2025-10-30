'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BaseModal from '@/components/modals/BaseModal'
import { DEFAULT_AVATAR_URL } from '@/lib/constants/avatar'
import { safeJsonFetch } from '@/lib/utils/fetcher'
import { useAuth } from '@/lib/hooks/useAuth'

type FollowUser = {
  id: string
  name: string
  avatar_url: string | null
  role: string | null
  verification_status: string | null
  specialty_areas: string[]
  interests: string[]
  bio: string | null
  followedAt: string
  score?: number
  isFollowed?: boolean
}

type FollowersModalProps = {
  isOpen: boolean
  onClose: () => void
}

type TabKey = 'followers' | 'following' | 'recommended'

export default function FollowersModal({ isOpen, onClose }: FollowersModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('followers')
  const [followers, setFollowers] = useState<FollowUser[]>([])
  const [following, setFollowing] = useState<FollowUser[]>([])
  const [recommended, setRecommended] = useState<FollowUser[]>([])
  const [loading, setLoading] = useState(false)
  const [recommendedLoading, setRecommendedLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendedError, setRecommendedError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const section = searchParams.get('section')
      if (section === 'following') setActiveTab('following')
      else if (section === 'recommended') setActiveTab('recommended')
      else setActiveTab('followers')
    }
  }, [isOpen, searchParams])

  useEffect(() => {
    if (!isOpen || !isLoggedIn) return

    let ignore = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { ok, status, data, error: fetchError } = await safeJsonFetch<any>(
          '/api/users/followers',
          { cache: 'no-store' }
        )
        if (!ok) {
          const message = fetchError || '팔로워 정보를 불러오지 못했습니다.'
          console.warn('[FollowersModal] follower request failed', status, message)
          setError(status === 401 ? '로그인이 필요합니다.' : message)
          setFollowers([])
          setFollowing([])
          return
        }
        if (!data?.data || ignore) return

        const sanitize = (list: unknown): FollowUser[] => {
          if (!Array.isArray(list)) return []
          return list
            .map((item) => {
              if (!item || typeof item !== 'object') return null
              const data = item as any
              return {
                id: typeof data.id === 'string' ? data.id : '',
                name:
                  typeof data.name === 'string' && data.name.trim().length > 0
                    ? data.name.trim()
                    : '커뮤니티 멤버',
                avatar_url:
                  typeof data.avatar_url === 'string' && data.avatar_url.length > 0
                    ? data.avatar_url
                    : null,
                role: typeof data.role === 'string' ? data.role : null,
                verification_status:
                  typeof data.verification_status === 'string'
                    ? data.verification_status
                    : null,
                specialty_areas: Array.isArray(data.specialty_areas)
                  ? data.specialty_areas.filter((value: unknown): value is string => typeof value === 'string')
                  : [],
                interests: Array.isArray(data.interests)
                  ? data.interests.filter((value: unknown): value is string => typeof value === 'string')
                  : [],
                bio: typeof data.bio === 'string' ? data.bio : null,
                followedAt:
                  typeof data.followedAt === 'string'
                    ? data.followedAt
                    : new Date().toISOString(),
              }
            })
            .filter((entry): entry is FollowUser => Boolean(entry))
        }

        const followerList = sanitize(data.data.followers)
        const followingList = sanitize(data.data.following)
        setFollowers(followerList)
        setFollowing(followingList)
      } catch (err: any) {
        console.error('[FollowersModal] load failed', err)
        if (!ignore) {
          setError(err?.message || '팔로워 정보를 불러오지 못했습니다.')
          setFollowers([])
          setFollowing([])
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !isLoggedIn) return
    let ignore = false
    const loadRecommended = async () => {
      setRecommendedLoading(true)
      setRecommendedError(null)
      try {
        const { ok, status, data, error: fetchError } = await safeJsonFetch<any>(
          '/api/users/recommended?limit=30',
          { cache: 'no-store' }
        )
        if (!ok) {
          if (status === 401) {
            setRecommendedError('로그인이 필요합니다.')
            return
          }
          throw new Error(fetchError || '추천 사용자를 불러오지 못했습니다.')
        }
        if (!data?.data || ignore) return
        setRecommended(
          data.data.map((item: any) => ({
            id: String(item.id ?? ''),
            name:
              typeof item.name === 'string' && item.name.trim().length > 0
                ? item.name.trim()
                : '커뮤니티 멤버',
            avatar_url:
              typeof item.avatar_url === 'string' && item.avatar_url.length > 0
                ? item.avatar_url
                : null,
            role: typeof item.role === 'string' ? item.role : null,
            verification_status: null,
            specialty_areas: Array.isArray(item.specialties) ? item.specialties : [],
            interests: Array.isArray(item.interests) ? item.interests : [],
            bio: null,
            followedAt: new Date().toISOString(),
            score: typeof item.score === 'number' ? item.score : undefined,
          }))
        )
      } catch (err: any) {
        console.error('[FollowersModal] recommended load failed', err)
        if (!ignore) {
          setRecommendedError(err?.message || '추천 사용자를 불러오지 못했습니다.')
          setRecommended([])
        }
      } finally {
        if (!ignore) setRecommendedLoading(false)
      }
    }

    loadRecommended()
    return () => {
      ignore = true
    }
  }, [isOpen])

  const currentList = useMemo(
    () => {
      if (activeTab === 'followers') return followers
      if (activeTab === 'following') return following
      return recommended
    },
    [activeTab, followers, following, recommended]
  )

  const followingIds = useMemo(
    () => new Set(following.map((item) => item.id)),
    [following]
  )

  useEffect(() => {
    setRecommended((prev) =>
      prev.map((item) => ({
        ...item,
        isFollowed: followingIds.has(item.id),
      }))
    )
  }, [followingIds])

  const toggleFollow = async (targetId: string, isFollowing: boolean) => {
    if (!targetId) return
    if (user?.id && user.id === targetId) {
      alert('내 계정은 팔로우할 수 없습니다.')
      return
    }

    const previousFollowing = [...following]

    try {
      const { success, isFollowing: nextStatus, error } = await toggleFollowUser(targetId, {
        viewerId: user?.id ?? null,
      })

      if (!success) {
        if (error === 'SELF_FOLLOW') {
          alert('내 계정은 팔로우할 수 없습니다.')
          return
        }
        throw new Error(error || '팔로우 처리에 실패했습니다.')
      }

      setFollowing((prev) => {
        if (nextStatus) {
          if (prev.some((item) => item.id === targetId)) return prev
          const source =
            recommended.find((item) => item.id === targetId) ||
            followers.find((item) => item.id === targetId) ||
            null
          if (!source) return prev
          return [{ ...source, followedAt: new Date().toISOString() }, ...prev]
        }
        return prev.filter((item) => item.id !== targetId)
      })

      setRecommended((prev) =>
        prev.map((item) =>
          item.id === targetId ? { ...item, isFollowed: nextStatus } : item
        )
      )
    } catch (error: any) {
      console.error('[FollowersModal] toggleFollow failed', error)
      setFollowing(previousFollowing)
      alert(error?.message || '팔로우 처리 중 오류가 발생했습니다.')
    }
  }

  const handleViewAll = () => {
    onClose()
    router.push('/following')
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="팔로워 · 팔로잉"
      width="720px"
      maxWidth="95vw"
      borderRadius="24px"
      showCloseButton
    >
      <div className="followers-modal">
        <div className="followers-tabs">
          <button
            type="button"
            className={`followers-tab ${activeTab === 'followers' ? 'active' : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            팔로워
            <span className="tab-count">{followers.length}</span>
          </button>
          <button
            type="button"
            className={`followers-tab ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            팔로잉
            <span className="tab-count">{following.length}</span>
          </button>
          <button
            type="button"
            className={`followers-tab ${activeTab === 'recommended' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommended')}
          >
            추천
            <span className="tab-count">{recommended.length}</span>
          </button>
          <button type="button" className="followers-view-all" onClick={handleViewAll}>
            전체 보기
          </button>
        </div>

        {activeTab === 'recommended' ? (
          recommendedLoading ? (
            <div className="followers-state">추천 사용자를 불러오는 중...</div>
          ) : recommendedError ? (
            <div className="followers-state error">{recommendedError}</div>
          ) : recommended.length === 0 ? (
            <div className="followers-state">맞춤 추천 사용자가 없습니다.</div>
          ) : (
            <div className="followers-list">
              {recommended.map((item) => {
                const normalizedRole = (item.role || '').toUpperCase()
                const isVerifiedBadge =
                  normalizedRole === 'VERIFIED' ||
                  (item.verification_status || '').toUpperCase() === 'APPROVED'
                const isAdminBadge = normalizedRole === 'ADMIN'
                const topics = Array.from(
                  new Set([...(item.specialty_areas || []), ...(item.interests || [])])
                )
                const isFollowingUser = followingIds.has(item.id) || item.isFollowed

                return (
                  <div key={`recommended-${item.id}`} className="followers-item">
                    <div className="followers-avatar">
                      <img
                        src={item.avatar_url || DEFAULT_AVATAR_URL}
                        alt={`${item.name} 아바타`}
                        loading="lazy"
                      />
                    </div>
                    <div className="followers-details">
                      <div className="followers-name-row">
                        <span className="followers-name">{item.name}</span>
                        {isVerifiedBadge && (
                          <span className="followers-badge verified">✅ Certified</span>
                        )}
                        {isAdminBadge && <span className="followers-badge admin">👑 Admin</span>}
                      </div>
                      {topics.length > 0 && (
                        <div className="followers-topics">
                          {topics.slice(0, 3).map((topic) => (
                            <span key={topic} className="followers-topic">#{topic}</span>
                          ))}
                          {topics.length > 3 && (
                            <span className="followers-topic more">+{topics.length - 3}</span>
                          )}
                        </div>
                      )}
                      {typeof item.score === 'number' && (
                        <div className="followers-score">추천 점수 {item.score.toFixed(1)}</div>
                      )}
                    </div>
                    <div className="followers-meta">
                      <button
                        type="button"
                        className={`followers-view-button ${isFollowingUser ? 'following' : ''}`}
                        onClick={() => toggleFollow(item.id, isFollowingUser)}
                      >
                        {isFollowingUser ? '팔로잉' : '팔로우'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : loading ? (
          <div className="followers-state">목록을 불러오는 중...</div>
        ) : error ? (
          <div className="followers-state error">{error}</div>
        ) : currentList.length === 0 ? (
          <div className="followers-state">
            {activeTab === 'followers'
              ? '아직 나를 팔로우한 사용자가 없습니다.'
              : '팔로우한 사용자가 없습니다.'}
          </div>
        ) : (
          <div className="followers-list">
            {currentList.map((item) => {
              const normalizedRole = (item.role || '').toUpperCase()
              const isVerified =
                normalizedRole === 'VERIFIED' ||
                (item.verification_status || '').toUpperCase() === 'APPROVED'
              const isAdmin = normalizedRole === 'ADMIN'
              const topics = Array.from(
                new Set([...(item.specialty_areas || []), ...(item.interests || [])])
              )

              return (
                <div key={`${activeTab}-${item.id}`} className="followers-item">
                  <div className="followers-avatar">
                    <img
                      src={item.avatar_url || DEFAULT_AVATAR_URL}
                      alt={`${item.name} 아바타`}
                      loading="lazy"
                    />
                  </div>
                  <div className="followers-details">
                    <div className="followers-name-row">
                      <span className="followers-name">{item.name}</span>
                      {isVerified && <span className="followers-badge verified">✅ Certified</span>}
                      {isAdmin && <span className="followers-badge admin">👑 Admin</span>}
                    </div>
                    {item.bio && <p className="followers-bio">{item.bio}</p>}
                    {topics.length > 0 && (
                      <div className="followers-topics">
                        {topics.slice(0, 3).map((topic) => (
                          <span key={topic} className="followers-topic">
                            #{topic}
                          </span>
                        ))}
                        {topics.length > 3 && (
                          <span className="followers-topic more">+{topics.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="followers-meta">
                    <span>{formatRelativeTime(item.followedAt)}</span>
                    <div className="followers-meta-actions">
                      <button
                        type="button"
                        className="followers-view-button"
                        onClick={() => {
                          onClose()
                          router.push(`/users/${item.id}`)
                        }}
                      >
                        프로필
                      </button>
                      <button
                        type="button"
                        className={`followers-view-button secondary ${followingIds.has(item.id) ? 'following' : ''}`}
                        onClick={() => toggleFollow(item.id, followingIds.has(item.id))}
                      >
                        {followingIds.has(item.id) ? '팔로잉' : '팔로우'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .followers-modal {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .followers-tabs {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .followers-tab {
          background: none;
          border: none;
          padding: 0.5rem 0.75rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #64748b;
          position: relative;
          cursor: pointer;
        }

        .followers-tab.active {
          color: #1f2937;
        }

        .followers-tab.active::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -0.35rem;
          width: 100%;
          height: 2px;
          border-radius: 999px;
          background: #4f6de6;
        }

        .tab-count {
          margin-left: 0.35rem;
          color: #4f6de6;
          font-size: 0.85rem;
        }

        .followers-view-all {
          margin-left: auto;
          border: 1px solid rgba(79, 109, 230, 0.2);
          background: rgba(79, 109, 230, 0.08);
          color: #1d4ed8;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.45rem 0.8rem;
          border-radius: 999px;
          cursor: pointer;
        }

        .followers-state {
          padding: 2.5rem 1rem;
          text-align: center;
          color: #6b7280;
          font-size: 0.95rem;
          background: #f8fafc;
          border-radius: 16px;
        }

        .followers-state.error {
          color: #b91c1c;
          background: #fef2f2;
        }

        .followers-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          max-height: 360px;
          overflow-y: auto;
        }

        .followers-item {
          display: flex;
          gap: 1rem;
          align-items: center;
          background: #f8fafc;
          border-radius: 16px;
          padding: 0.9rem 1rem;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .followers-avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .followers-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .followers-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .followers-name-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .followers-name {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .followers-badge {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
        }

        .followers-badge.verified {
          background: rgba(52, 211, 153, 0.18);
          color: #047857;
        }

        .followers-badge.admin {
          background: rgba(251, 191, 36, 0.22);
          color: #b45309;
        }

        .followers-bio {
          margin: 0;
          font-size: 0.85rem;
          color: #475569;
          line-height: 1.4;
        }

        .followers-score {
          font-size: 0.78rem;
          color: #64748b;
        }

        .followers-topics {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
        }

        .followers-topic {
          background: rgba(96, 165, 250, 0.15);
          color: #1d4ed8;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
        }

        .followers-topic.more {
          background: rgba(226, 232, 240, 0.8);
          color: #475569;
        }

        .followers-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: #94a3b8;
        }

        .followers-meta-actions {
          display: flex;
          gap: 0.4rem;
        }

        .followers-view-button {
          border: 1px solid rgba(79, 109, 230, 0.4);
          background: white;
          color: #1d4ed8;
          border-radius: 999px;
          padding: 0.35rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .followers-view-button.secondary {
          border-color: rgba(148, 163, 184, 0.6);
          color: #475569;
        }

        .followers-view-button.following,
        .followers-view-button.secondary.following {
          background: rgba(79, 109, 230, 0.12);
          color: #1d4ed8;
          border-color: rgba(79, 109, 230, 0.2);
        }

        @media (max-width: 600px) {
          .followers-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .followers-meta {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.5rem;
          }

          .followers-meta-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </BaseModal>
  )
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / (1000 * 60))
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}개월 전`
  const years = Math.floor(days / 365)
  return `${years}년 전`
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'
import { DEFAULT_AVATAR_URL } from '@/lib/constants/avatar'
import { safeJsonFetch } from '@/lib/utils/fetcher'
import { toggleFollowUser } from '@/lib/utils/follow-manager'

type PopularUser = {
  id: string
  name: string
  role: string
  avatar_url?: string | null
  trust_score?: number | null
  answer_count?: number | null
  helpful_answer_count?: number | null
  follower_count?: number | null
  score?: number | null
}

export default function DiscoverUsersPage() {
  const [users, setUsers] = useState<PopularUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [following, setFollowing] = useState<Record<string, boolean>>({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [viewerId, setViewerId] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const profileRes = await safeJsonFetch<any>('/api/auth/profile', { cache: 'no-store' })
        setIsLoggedIn(profileRes.ok)
        setViewerId(profileRes.ok ? profileRes.data?.data?.id ?? null : null)

        const popularRes = await safeJsonFetch<any>('/api/users/popular?limit=30', {
          cache: 'no-store',
        })
        if (!popularRes.ok || !popularRes.data) {
          throw new Error(popularRes.error || '인기 사용자를 불러오지 못했습니다.')
        }
        const list: PopularUser[] = Array.isArray(popularRes.data?.data) ? popularRes.data.data : []
        if (!ignore) setUsers(list)

        if (profileRes.ok) {
          const followRes = await safeJsonFetch<any>('/api/users/following', {
            cache: 'no-store',
            credentials: 'include',
          })
          if (followRes.ok && Array.isArray(followRes.data?.data)) {
            const ids: string[] = followRes.data.data
            const map = ids.reduce<Record<string, boolean>>((acc, id) => {
              acc[id] = true
              return acc
            }, {})
            if (!ignore) setFollowing(map)
          }
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || '인기 사용자를 불러오지 못했습니다.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  async function toggleFollow(userId: string) {
    if (!isLoggedIn) {
      window.location.href = '/auth/login?redirectTo=/users/discover'
      return
    }
    const isFollowing = !!following[userId]
    // optimistic
    setFollowing((prev) => ({ ...prev, [userId]: !isFollowing }))
    try {
      const { success, isFollowing: nextStatus, error } = await toggleFollowUser(userId, {
        viewerId,
      })
      if (!success) {
        if (error === 'SELF_FOLLOW') {
          alert('내 계정은 팔로우할 수 없습니다.')
        } else {
          alert('팔로우 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
        }
        setFollowing((prev) => ({ ...prev, [userId]: isFollowing }))
        return
      }
      setFollowing((prev) => ({ ...prev, [userId]: nextStatus }))
    } catch (error) {
      console.error('[DiscoverUsers] toggleFollow failed', error)
      setFollowing((prev) => ({ ...prev, [userId]: isFollowing }))
      alert('팔로우 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <PageLayout variant="centered">
      <div className="feed-container">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🌟 인기 사용자
        </h1>

        {loading && (
          <div className="feed-loading notranslate" translate="no" suppressHydrationWarning>
            불러오는 중...
          </div>
        )}

        {!loading && error && (
          <div className="feed-empty">
            <div className="feed-empty-icon">⚠️</div>
            <h3>인기 사용자를 불러오지 못했습니다</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>새로고침</button>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="feed-empty">
            <div className="feed-empty-icon">👤</div>
            <h3>표시할 사용자가 없습니다</h3>
            <p>잠시 후 다시 확인해 주세요.</p>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="grid" style={{ display: 'grid', gap: '12px' }}>
            {users.map((u) => {
              const displayName = u.name || '커뮤니티 멤버'
              return (
              <div key={u.id} className="question-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="author-avatar-small">
                    <img
                      src={u.avatar_url || DEFAULT_AVATAR_URL}
                      alt={`${displayName}의 프로필 사진`}
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Link href={`/users/${u.id}`} className="question-author-link">
                        {displayName}
                      </Link>
                      {u.role === 'verified' && (
                        <span className="badge" style={{ background: '#2d6cdf', color: 'white', padding: '2px 6px', borderRadius: 8, fontSize: 12 }}>인증</span>
                      )}
                    </div>
                    <div className="question-time" style={{ marginTop: 4, color: '#666' }}>
                      도움됨 {u.helpful_answer_count ?? 0} · 답변 {u.answer_count ?? 0} · 신뢰 {u.trust_score ?? 0}
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    className={`btn ${following[u.id] ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => toggleFollow(u.id)}
                  >
                    {following[u.id] ? '팔로잉' : '팔로우'}
                  </button>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

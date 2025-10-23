'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'

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

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const profileRes = await fetch('/api/auth/profile', { cache: 'no-store' })
        setIsLoggedIn(profileRes.ok)

        const res = await fetch('/api/users/popular?limit=30', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed: ${res.status}`)
        const json = await res.json()
        const list: PopularUser[] = Array.isArray(json?.data) ? json.data : []
        if (!ignore) setUsers(list)

        if (profileRes.ok) {
          const f = await fetch('/api/users/following', { cache: 'no-store' })
          if (f.ok) {
            const fj = await f.json()
            const ids: string[] = Array.isArray(fj?.data) ? fj.data : []
            const map = ids.reduce<Record<string, boolean>>((acc, id) => { acc[id] = true; return acc }, {})
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
      const method = isFollowing ? 'DELETE' : 'POST'
      const res = await fetch(`/api/users/${userId}/follow`, { method })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setFollowing((prev) => ({ ...prev, [userId]: !!data?.isFollowing }))
    } catch (_) {
      // rollback
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
            {users.map((u) => (
              <div key={u.id} className="question-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="author-avatar-small"></div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Link href={`/users/${u.id}`} className="question-author-link">
                        {u.name}
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
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

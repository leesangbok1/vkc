'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import ActionBar from '@/components/common/ActionBar'
import { MOCK_QUESTIONS, MOCK_POSTS, MOCK_USERS, type Question, type Post, type User } from '@/lib/data/mockData'
import { truncateToSentences } from '@/lib/utils/text-utils'

type FeedItem = (Question | Post) & {
  type: 'question' | 'post'
}

export default function FollowingPage() {
  const router = useRouter()
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [followedUsers, setFollowedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Check login status
    const mockSession = localStorage.getItem('mock_session')
    setIsLoggedIn(mockSession === 'true')

    // Get followed users from localStorage
    const stored = localStorage.getItem('followed_users')
    const followed = stored ? JSON.parse(stored) : []
    setFollowedUsers(followed)

    // Combine questions and posts into unified feed
    const questions: FeedItem[] = MOCK_QUESTIONS.map(q => ({ ...q, type: 'question' as const }))
    const posts: FeedItem[] = MOCK_POSTS.map(p => ({ ...p, type: 'post' as const }))
    const allFeed = [...questions, ...posts]

    // Filter feed to show only followed users' posts
    if (followed.length > 0) {
      const filteredFeed = allFeed.filter(item => followed.includes(item.author.id))
      // Randomize order
      const shuffled = filteredFeed.sort(() => Math.random() - 0.5)
      setFeed(shuffled)
    } else {
      setFeed([])
    }

    setLoading(false)
  }, [])

  const handleFollow = (userId: string) => {
    if (!isLoggedIn) {
      router.push('/auth/login?redirectTo=/following')
      return
    }

    const updated = [...followedUsers, userId]
    localStorage.setItem('followed_users', JSON.stringify(updated))
    setFollowedUsers(updated)

    // Update feed with new user's posts
    const questions: FeedItem[] = MOCK_QUESTIONS.map(q => ({ ...q, type: 'question' as const }))
    const posts: FeedItem[] = MOCK_POSTS.map(p => ({ ...p, type: 'post' as const }))
    const allFeed = [...questions, ...posts]
    const filteredFeed = allFeed.filter(item => updated.includes(item.author.id))
    const shuffled = filteredFeed.sort(() => Math.random() - 0.5)
    setFeed(shuffled)
  }

  const handleUnfollow = (userId: string) => {
    const updated = followedUsers.filter(id => id !== userId)
    localStorage.setItem('followed_users', JSON.stringify(updated))
    setFollowedUsers(updated)

    // Update feed
    const filteredFeed = feed.filter(item => item.author.id !== userId)
    setFeed(filteredFeed)
  }

  const handleCardClick = (item: FeedItem) => {
    if (item.type === 'question') {
      router.push(`/questions/${item.id}`)
    } else {
      router.push(`/posts/${item.id}`)
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return '방금 전'
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return '방금 전'
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
    const days = Math.floor(diff / 86400)
    if (days === 1) return '1일 전'
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  // Get followed user objects
  const followedUserObjects = useMemo(() => {
    return MOCK_USERS.filter(user => followedUsers.includes(user.id))
  }, [followedUsers])

  // Get suggested users (not followed yet)
  const suggestedUsers = useMemo(() => {
    return MOCK_USERS.filter(user => !followedUsers.includes(user.id)).slice(0, 10)
  }, [followedUsers])

  // Filter suggested users by search
  const filteredSuggestedUsers = useMemo(() => {
    if (!searchQuery) return suggestedUsers
    return suggestedUsers.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.visaType?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [suggestedUsers, searchQuery])

  if (loading) {
    return (
      <main className="main-layout">
        <div className="container">
          <div className="main-content">
            <div className="feed-loading">로딩 중...</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-layout">
      {/* Mobile Category Grid */}
      <div className="mobile-category-grid">
        <a href="/categories/visa" className="mobile-category-item">
          <div className="mobile-category-icon">💼</div>
          <div className="mobile-category-label">한국 취업</div>
        </a>
        <a href="/categories/visa" className="mobile-category-item">
          <div className="mobile-category-icon">✈️</div>
          <div className="mobile-category-label">한국 비자</div>
        </a>
        <a href="/categories/life" className="mobile-category-item">
          <div className="mobile-category-icon">🏠</div>
          <div className="mobile-category-label">한국 생활</div>
        </a>
        <a href="/categories/legal" className="mobile-category-item">
          <div className="mobile-category-icon">⚖️</div>
          <div className="mobile-category-label">한국 법률</div>
        </a>
      </div>

      <div className="container">
        {/* 좌우 분할 레이아웃 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* 왼쪽: 팔로잉 관리 */}
          <div style={{ width: '100%' }}>
            {/* Page Header */}
            <div className="section" style={{ marginBottom: '1.5rem' }}>
              <h1 className="section-title">👥 Following</h1>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                관심 있는 사용자를 팔로우하고 최신 게시글을 확인하세요
              </p>
            </div>

            {/* 팔로잉 중인 사용자 */}
            <div className="section" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                팔로잉 중인 사용자 ({followedUserObjects.length})
              </h3>

              {followedUserObjects.length === 0 ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  background: '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    아직 팔로우한 사용자가 없습니다
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {followedUserObjects.map((user) => (
                    <div
                      key={user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}
                        onClick={() => router.push(`/users/${user.id}`)}
                      >
                        <div className="author-avatar-small">👤</div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user.name}</div>
                          {user.visaType && (
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              {user.visaType}
                              {user.yearsInKorea && `, 한국 ${user.yearsInKorea}년차`}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUnfollow(user.id)
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151',
                          cursor: 'pointer'
                        }}
                      >
                        언팔로우
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 팔로우 사용자 찾기 */}
            <div className="section">
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                팔로우 사용자 찾기
              </h3>

              {/* Search */}
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="사용자 이름 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Suggested Users */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredSuggestedUsers.length === 0 ? (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: '#f9fafb',
                    borderRadius: '12px'
                  }}>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      {searchQuery ? '검색 결과가 없습니다' : '모든 사용자를 팔로우 중입니다'}
                    </p>
                  </div>
                ) : (
                  filteredSuggestedUsers.map((user) => (
                    <div
                      key={user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}
                        onClick={() => router.push(`/users/${user.id}`)}
                      >
                        <div className="author-avatar-small">👤</div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user.name}</div>
                          {user.visaType && (
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              {user.visaType}
                              {user.yearsInKorea && `, 한국 ${user.yearsInKorea}년차`}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFollow(user.id)
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#3b82f6',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        팔로우
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 팔로잉 피드 */}
          <div style={{ width: '100%', position: 'sticky', top: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              📰 팔로잉 피드
            </h3>

            {followedUsers.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  팔로우한 사용자가 없습니다
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  왼쪽에서 사용자를 팔로우하면<br />
                  이곳에서 최신 게시글을 확인할 수 있습니다
                </p>
              </div>
            ) : feed.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  게시글이 없습니다
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  팔로우한 사용자들의 게시글이 없습니다
                </p>
              </div>
            ) : (
              <div className="feed-container">
                {feed.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="question-card"
                    onClick={() => handleCardClick(item)}
                  >
                    <div className="question-header">
                      <div className="question-meta">
                        <div className="question-author-row">
                          <div
                            className="author-avatar-small"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/users/${item.author.id}`)
                            }}
                          ></div>

                          <div className="question-author-info">
                            <div className="question-author">
                              <span
                                className="question-author-link"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/users/${item.author.id}`)
                                }}
                              >
                                {item.author.name}
                              </span>
                              {(item.author.visaType || item.author.yearsInKorea) && (
                                <span className={`author-verification-box ${item.author.role === 'verified' || item.author.role === 'admin' ? 'verified' : ''}`}>
                                  <span className="verification-text">
                                    {item.author.visaType || ''}
                                    {item.author.yearsInKorea ? `, 한국 ${item.author.yearsInKorea}년차` : ''}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="question-time-row">
                              <div className="question-time">
                                {formatDate(item.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        className="question-more-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCardClick(item)
                        }}
                        aria-label="게시글 상세 보기"
                      >
                        자세히
                      </button>
                    </div>

                    <h3 className="question-title">{item.title}</h3>
                    <p className="question-content">
                      {truncateToSentences(item.content, 2)}
                    </p>

                    <div className="question-stats">
                      <div className="question-stats-comments">
                        <span className="answer-expert-icon">🎓</span>
                        <span>
                          {item.type === 'question' ? (
                            item.answerCount === 0 ? (
                              <span>아직 답변이 없어요</span>
                            ) : (
                              <><strong>{item.answerCount}명</strong>이 답변했어요</>
                            )
                          ) : (
                            (item as Post).commentCount === 0 ? (
                              <span>아직 댓글이 없어요</span>
                            ) : (
                              <><strong>{(item as Post).commentCount}명</strong>이 댓글했어요</>
                            )
                          )}
                        </span>
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <ActionBar
                        targetId={item.id}
                        targetType={item.type === 'question' ? 'question' : 'post'}
                        title={item.title}
                        content={item.content}
                        url={item.type === 'question' ? `/questions/${item.id}` : `/posts/${item.id}`}
                        initialHelpfulCount={item.votes}
                        compact={true}
                        requireLogin={!isLoggedIn}
                        onLoginRequired={() => {
                          router.push('/auth/login?redirectTo=/following')
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

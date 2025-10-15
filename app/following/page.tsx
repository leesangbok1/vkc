'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import ActionBar from '@/components/common/ActionBar'
import { MOCK_QUESTIONS, MOCK_POSTS, type Question, type Post } from '@/lib/data/mockData'

type FeedItem = (Question | Post) & {
  type: 'question' | 'post'
}

export default function FollowingPage() {
  const router = useRouter()
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [followedUsers, setFollowedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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
      // Sort by date
      filteredFeed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setFeed(filteredFeed)
    } else {
      setFeed([])
    }

    setLoading(false)
  }, [])

  const handleUnfollow = (userId: string, userName: string) => {
    const updated = followedUsers.filter(id => id !== userId)
    localStorage.setItem('followed_users', JSON.stringify(updated))
    setFollowedUsers(updated)

    // Update feed
    const filteredFeed = feed.filter(item => item.author.id !== userId)
    setFeed(filteredFeed)

    alert(`${userName}님을 언팔로우했습니다`)
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
        <div className="main-content">
          {/* Page Header */}
          <div className="section" style={{ marginBottom: '1.5rem' }}>
            <h1 className="section-title">Following</h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              팔로우한 사용자들의 최신 게시글
            </p>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs">
            <a href="/" className="category-tab">Popular</a>
            <a href="/topics" className="category-tab">Topic</a>
            <a href="/following" className="category-tab active">Following</a>
          </div>

          {/* Feed Container */}
          <div className="feed-container">
            {followedUsers.length === 0 ? (
              // Empty state - no users followed
              <div className="feed-empty">
                <div className="feed-empty-icon">👥</div>
                <h3>팔로우한 사용자가 없습니다</h3>
                <p>흥미로운 게시글을 올리는 사용자를 팔로우해보세요</p>
                <button
                  className="btn-primary"
                  onClick={() => router.push('/questions')}
                >
                  팔로우 사용자 찾아보기
                </button>
              </div>
            ) : feed.length === 0 ? (
              // Empty state - users followed but no content
              <div className="feed-empty">
                <div className="feed-empty-icon">📭</div>
                <h3>모든 게시글을 확인했습니다</h3>
                <p>팔로우한 사용자들의 최근 게시글이 없습니다</p>
                <button
                  className="btn-primary"
                  onClick={() => router.push('/questions')}
                >
                  더 많은 콘텐츠 보기
                </button>
              </div>
            ) : (
              // Feed with followed users' posts
              <>
                {feed.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="question-card"
                    onClick={() => handleCardClick(item)}
                  >
                    <div className="question-header">
                      {/* Author Info */}
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

                      {/* More Button */}
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
                      {item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content}
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

                    {/* ActionBar */}
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
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </main>
  )
}

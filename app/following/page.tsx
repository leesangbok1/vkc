'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_QUESTIONS, MOCK_POSTS, type Question, type Post } from '@/lib/data/mockData'

type FeedItem = (Question | Post) & {
  type: 'question' | 'post'
}

export default function FollowingPage() {
  const router = useRouter()
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [followedUsers, setFollowedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  if (loading) {
    return (
      <main className="main-layout">
        <div className="following-loading">로딩 중...</div>
      </main>
    )
  }

  return (
    <main className="main-layout">
      <div className="following-container">
        <div className="following-header">
          <h1 className="following-title">Following</h1>
          <p className="following-subtitle">
            팔로우한 사용자들의 최신 게시글
          </p>
        </div>

        {followedUsers.length === 0 ? (
          // Empty state - no users followed
          <div className="following-empty-state">
            <div className="empty-state-icon">👥</div>
            <h2 className="empty-state-title">You're all caught up</h2>
            <p className="empty-state-message">
              팔로우한 사용자가 없습니다.<br />
              흥미로운 게시글을 올리는 사용자를 팔로우해보세요.
            </p>
            <button
              className="empty-state-button"
              onClick={() => router.push('/questions')}
            >
              팔로우 사용자 찾아보기
            </button>
          </div>
        ) : feed.length === 0 ? (
          // Empty state - users followed but no content
          <div className="following-empty-state">
            <div className="empty-state-icon">📭</div>
            <h2 className="empty-state-title">You're all caught up</h2>
            <p className="empty-state-message">
              팔로우한 사용자들의 최근 게시글이 없습니다.<br />
              더 많은 콘텐츠를 확인해보세요.
            </p>
            <button
              className="empty-state-button"
              onClick={() => router.push('/questions')}
            >
              팔로우 사용자 찾아보기
            </button>
          </div>
        ) : (
          // Feed with followed users' posts
          <div className="following-feed">
            {feed.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="feed-item-card"
                onClick={() => handleCardClick(item)}
              >
                {/* Author Info */}
                <div className="feed-item-author">
                  <div className="author-avatar">
                    {item.author.name[0]}
                  </div>
                  <div className="author-details">
                    <div className="author-name-row">
                      <span className="author-name">{item.author.name}</span>
                      {item.author.isExpert && (
                        <span className="expert-badge">✅ Certified User</span>
                      )}
                    </div>
                    <p className="author-meta">
                      {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <button
                    className="unfollow-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnfollow(item.author.id, item.author.name)
                    }}
                  >
                    팔로잉
                  </button>
                </div>

                {/* Content */}
                <div className="feed-item-content">
                  <h2 className="feed-item-title">{item.title}</h2>
                  <p className="feed-item-excerpt">
                    {item.content.length > 150
                      ? `${item.content.substring(0, 150)}...`
                      : item.content}
                  </p>
                </div>

                {/* Stats */}
                <div className="feed-item-stats">
                  <div className="stat-item">
                    <span className="stat-icon">👍</span>
                    <span className="stat-value">{item.votes}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">💬</span>
                    <span className="stat-value">
                      {item.type === 'question' ? item.answerCount : (item as Post).commentCount}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">👁️</span>
                    <span className="stat-value">{item.views}</span>
                  </div>
                  <div className="stat-item stat-type">
                    <span className="type-badge">
                      {item.type === 'question' ? '질문' : '포스트'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .following-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .following-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .following-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }

        .following-subtitle {
          font-size: 1rem;
          color: var(--muted-foreground);
        }

        .following-empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 1rem;
        }

        .empty-state-message {
          font-size: 1rem;
          color: var(--muted-foreground);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .empty-state-button {
          background: var(--color-blue-600);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .empty-state-button:hover {
          background: var(--color-blue-700);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .following-feed {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feed-item-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s;
        }

        .feed-item-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .feed-item-author {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-blue-400), var(--color-blue-600));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .author-details {
          flex: 1;
        }

        .author-name-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .author-name {
          font-weight: 600;
          color: var(--foreground);
        }

        .expert-badge {
          font-size: 0.75rem;
          color: var(--color-green-600);
          background: var(--color-green-50);
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .author-meta {
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }

        .unfollow-btn {
          background: var(--color-blue-600);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .unfollow-btn:hover {
          background: var(--color-red-600);
        }

        .unfollow-btn:hover::after {
          content: ' (언팔로우)';
        }

        .feed-item-content {
          margin-bottom: 1rem;
        }

        .feed-item-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .feed-item-excerpt {
          font-size: 0.938rem;
          color: var(--muted-foreground);
          line-height: 1.6;
        }

        .feed-item-stats {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }

        .stat-icon {
          font-size: 1rem;
        }

        .stat-type {
          margin-left: auto;
        }

        .type-badge {
          background: var(--color-blue-50);
          color: var(--color-blue-600);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .following-loading {
          text-align: center;
          padding: 4rem 2rem;
          font-size: 1.125rem;
          color: var(--muted-foreground);
        }

        @media (max-width: 768px) {
          .following-container {
            padding: 1rem;
          }

          .following-title {
            font-size: 1.5rem;
          }

          .feed-item-card {
            padding: 1rem;
          }

          .feed-item-stats {
            gap: 1rem;
          }
        }
      `}</style>
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import { MOCK_QUESTIONS, MOCK_POSTS, MOCK_ANSWERS, type User, type Question, type Post, type Answer } from '@/lib/data/mockData'

type UserActivity = {
  questions: Question[]
  posts: Post[]
  answers: Answer[]
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [activity, setActivity] = useState<UserActivity>({ questions: [], posts: [], answers: [] })
  const [activeTab, setActiveTab] = useState<'questions' | 'posts' | 'answers'>('questions')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    loadUserProfile()
  }, [userId])

  async function checkAuth() {
    try {
      const mockSession = localStorage.getItem('mock_session')
      const mockUser = localStorage.getItem('mock_user')
      const onboardingCompleted = localStorage.getItem('vietkconnect_onboarded')

      if (mockSession === 'true' && mockUser && onboardingCompleted === 'true') {
        setIsLoggedIn(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  function loadUserProfile() {
    try {
      // Find user from questions, posts, or answers
      let foundUser: User | null = null

      // Search in questions
      const userQuestion = MOCK_QUESTIONS.find(q => q.author?.id === userId)
      if (userQuestion) {
        foundUser = userQuestion.author
      }

      // Search in posts
      if (!foundUser) {
        const userPost = MOCK_POSTS.find(p => p.author?.id === userId)
        if (userPost) {
          foundUser = userPost.author
        }
      }

      // Search in answers
      if (!foundUser) {
        const userAnswer = MOCK_ANSWERS.find(a => a.author?.id === userId)
        if (userAnswer) {
          foundUser = userAnswer.author
        }
      }

      if (!foundUser) {
        console.error('User not found:', userId)
        setLoading(false)
        return
      }

      setUser(foundUser)

      // Load user activity
      const userQuestions = MOCK_QUESTIONS.filter(q => q.author?.id === userId)
      const userPosts = MOCK_POSTS.filter(p => p.author?.id === userId)
      const userAnswers = MOCK_ANSWERS.filter(a => a.author?.id === userId)

      setActivity({
        questions: userQuestions,
        posts: userPosts,
        answers: userAnswers
      })

      // Check follow status
      const followedUsers = JSON.parse(localStorage.getItem('followed_users') || '[]')
      setIsFollowing(followedUsers.includes(userId))

      setLoading(false)
    } catch (error) {
      console.error('Failed to load user profile:', error)
      setLoading(false)
    }
  }

  function handleFollow() {
    if (!isLoggedIn) {
      const currentUrl = window.location.pathname
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentUrl)}`
      return
    }

    const followedUsers = JSON.parse(localStorage.getItem('followed_users') || '[]')

    if (isFollowing) {
      // Unfollow
      const updated = followedUsers.filter((id: string) => id !== userId)
      localStorage.setItem('followed_users', JSON.stringify(updated))
      setIsFollowing(false)
      alert(`${user?.name}님을 언팔로우했습니다`)
    } else {
      // Follow
      followedUsers.push(userId)
      localStorage.setItem('followed_users', JSON.stringify(followedUsers))
      setIsFollowing(true)
      alert(`${user?.name}님을 팔로우했습니다`)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <PageLayout variant="centered">
        <div className="section profile-loading">로딩 중...</div>
      </PageLayout>
    )
  }

  if (!user) {
    return (
      <PageLayout variant="centered">
        <div className="section profile-error">
          <div className="profile-error-icon">👤</div>
          <h1 className="profile-error-title">사용자를 찾을 수 없습니다</h1>
          <p className="profile-error-message">요청하신 사용자가 존재하지 않습니다.</p>
          <button onClick={() => router.push('/')} className="btn btn-primary">
            홈으로 돌아가기
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="centered">
      <div className="container">
        <div className="main-content">
        <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-large"></div>
            <div className="profile-info">
              <h1 className="profile-name">{user.name}</h1>
              <div className="profile-meta">
                {user.visaType && <span className="profile-meta-item">📋 {user.visaType}</span>}
                {user.yearsInKorea && <span className="profile-meta-item">🇰🇷 한국 {user.yearsInKorea}년차</span>}
                {user.role === 'verified' && <span className="profile-meta-item">✅ Certified User</span>}
                {user.role === 'admin' && <span className="profile-meta-item">👑 관리자</span>}
              </div>
            </div>
            <button
              className={`profile-follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat-item">
            <div className="profile-stat-value">{activity.questions.length}</div>
            <div className="profile-stat-label">질문</div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value">{activity.posts.length}</div>
            <div className="profile-stat-label">정보글</div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value">{activity.answers.length}</div>
            <div className="profile-stat-label">답변</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            질문 ({activity.questions.length})
          </button>
          <button
            className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            정보글 ({activity.posts.length})
          </button>
          <button
            className={`profile-tab ${activeTab === 'answers' ? 'active' : ''}`}
            onClick={() => setActiveTab('answers')}
          >
            답변 ({activity.answers.length})
          </button>
        </div>

        {/* Activity Content */}
        <div className="profile-activity">
          {activeTab === 'questions' && (
            <div className="activity-list">
              {activity.questions.length === 0 ? (
                <div className="activity-empty">작성한 질문이 없습니다</div>
              ) : (
                activity.questions.map((question) => (
                  <div
                    key={question.id}
                    className="activity-card"
                    onClick={() => router.push(`/questions/${question.id}`)}
                  >
                    <h3 className="activity-title">{question.title}</h3>
                    <p className="activity-content">
                      {question.content.length > 150
                        ? question.content.substring(0, 150) + '...'
                        : question.content}
                    </p>
                    <div className="activity-meta">
                      <span>👍 {question.votes}</span>
                      <span>💬 {question.answerCount}개 답변</span>
                      <span>👁️ {question.views}</span>
                      <span className="activity-date">{formatDate(question.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="activity-list">
              {activity.posts.length === 0 ? (
                <div className="activity-empty">작성한 정보글이 없습니다</div>
              ) : (
                activity.posts.map((post) => (
                  <div
                    key={post.id}
                    className="activity-card"
                    onClick={() => router.push(`/posts/${post.id}`)}
                  >
                    <h3 className="activity-title">{post.title}</h3>
                    <p className="activity-content">
                      {post.content.length > 150
                        ? post.content.substring(0, 150) + '...'
                        : post.content}
                    </p>
                    <div className="activity-meta">
                      <span>👍 {post.votes}</span>
                      <span>💬 {post.commentCount}개 댓글</span>
                      <span>👁️ {post.views}</span>
                      <span className="activity-date">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'answers' && (
            <div className="activity-list">
              {activity.answers.length === 0 ? (
                <div className="activity-empty">작성한 답변이 없습니다</div>
              ) : (
                activity.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="activity-card"
                    onClick={() => router.push(`/questions/${answer.questionId}`)}
                  >
                    <p className="activity-content">{answer.content}</p>
                    <div className="activity-meta">
                      <span>👍 {answer.helpful}</span>
                      <span>💬 {answer.commentCount}개 댓글</span>
                      <span className="activity-date">{formatDate(answer.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        </div>
        </div>

        {/* Sidebar */}
        <Sidebar showContent={false} />
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .profile-header {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .profile-avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #e4e6eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #65676b;
          font-weight: 400;
          font-size: 3rem;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        .profile-avatar-large::before {
          content: '👤';
          display: block;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-size: 1.75rem;
          font-weight: 700;
          color: #262626;
          margin-bottom: 0.5rem;
        }

        .profile-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .profile-meta-item {
          font-size: 0.875rem;
          color: #666;
        }

        .profile-follow-btn {
          padding: 0.75rem 2rem;
          border-radius: 24px;
          border: 2px solid #5682ef;
          background: white;
          color: #5682ef;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .profile-follow-btn:hover {
          background: #5682ef;
          color: white;
        }

        .profile-follow-btn.following {
          background: #5682ef;
          color: white;
        }

        .profile-follow-btn.following:hover {
          background: #dc2626;
          border-color: #dc2626;
        }

        .profile-stats {
          display: flex;
          gap: 2rem;
          background: white;
          border-radius: 12px;
          padding: 1.5rem 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-stat-item {
          text-align: center;
        }

        .profile-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #5682ef;
          margin-bottom: 0.25rem;
        }

        .profile-stat-label {
          font-size: 0.875rem;
          color: #666;
        }

        .profile-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .profile-tab {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }

        .profile-tab:hover {
          color: #5682ef;
        }

        .profile-tab.active {
          color: #5682ef;
          border-bottom-color: #5682ef;
        }

        .profile-activity {
          min-height: 400px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s;
        }

        .activity-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .activity-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #262626;
          margin-bottom: 0.75rem;
        }

        .activity-content {
          font-size: 0.938rem;
          color: #666;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .activity-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.875rem;
          color: #999;
        }

        .activity-date {
          margin-left: auto;
        }

        .activity-empty {
          text-align: center;
          padding: 4rem 2rem;
          color: #999;
          font-size: 1rem;
        }

        .profile-loading,
        .profile-error {
          text-align: center;
          padding: 4rem 2rem;
        }

        .profile-error h1 {
          font-size: 1.5rem;
          color: #666;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .profile-container {
            padding: 1rem;
          }

          .profile-header {
            padding: 1.5rem;
          }

          .profile-header-content {
            flex-direction: column;
            text-align: center;
          }

          .profile-avatar-large {
            width: 64px;
            height: 64px;
            font-size: 2.5rem;
          }

          .profile-name {
            font-size: 1.5rem;
          }

          .profile-meta {
            justify-content: center;
          }

          .profile-follow-btn {
            width: 100%;
          }

          .profile-stats {
            gap: 1rem;
            padding: 1rem;
          }

          .activity-card {
            padding: 1rem;
          }
        }
      `}</style>
    </PageLayout>
  )
}

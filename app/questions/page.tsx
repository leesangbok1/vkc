'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import ActionBar from '@/components/common/ActionBar'
import { MOCK_QUESTIONS, type Question } from '@/lib/data/mockData'
import { getSubscribedTopics } from '@/lib/utils/follow-manager'

export default function QuestionsPage() {
  const [filter, setFilter] = useState<'all' | 'latest' | 'myTopics'>('all')
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [subscribedTopics, setSubscribedTopics] = useState<any[]>([])

  // localStorage에서 로그인 상태와 구독 토픽 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mockSession = localStorage.getItem('mock_session')
      setIsLoggedIn(mockSession === 'true')

      // Load subscribed topics
      if (mockSession === 'true') {
        const topics = getSubscribedTopics()
        setSubscribedTopics(topics)
      }
    }
  }, [])

  useEffect(() => {
    loadQuestions()
  }, [filter])

  async function loadQuestions() {
    try {
      setLoading(true)
      const response = await fetch('/api/questions?limit=20&sort=created_at')
      if (response.ok) {
        const data = await response.json()
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions)
        }
      }
    } catch (error) {
      console.error('Failed to load questions:', error)
      // API 실패 시 Mock 데이터 사용
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort questions
  const filteredQuestions = questions
    .filter(q => {
      // My Topics filter - show only questions from subscribed topics
      if (filter === 'myTopics') {
        if (!isLoggedIn || subscribedTopics.length === 0) {
          return false
        }

        // Check if question's topic matches any subscribed topic
        // subscribedTopics array has objects with {id, name, slug, icon}
        // questions have topic field with slug value
        const subscribedSlugs = subscribedTopics.map(t => t.slug)

        // Match question topic with subscribed topics
        if (q.topic && subscribedSlugs.includes(q.topic)) {
          return true
        }

        // Also match by category name if no specific topic
        const subscribedNames = subscribedTopics.map(t => t.name)
        if (subscribedNames.includes(q.category)) {
          return true
        }

        return false
      }
      return true
    })
    .sort((a, b) => {
      if (filter === 'latest') {
        // Latest first (newest to oldest)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        // All (popular): sort by votes
        return b.votes - a.votes
      }
    })

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

  return (
    <main className="main-layout">
      {/* Mobile Category Grid (Mobile Only) */}
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
        {/* Main Content Area */}
        <div className="main-content">
          {/* Desktop Hero Section */}
          {!isLoggedIn && (
            // 로그인 전: 플랫폼 가치 강조
            <div className="desktop-hero">
              <div className="hero-badge">
                <span>🛡️</span>
                <span>검증된 선경험자의 진짜 답변</span>
              </div>
              <h1 className="hero-title">
                비자, 유학, 취업 등 한국생활 관련 질문을<br />
                실제 경험으로 인증받은 Certified User가 답변합니다
              </h1>
              <div className="hero-actions">
                <button
                  className="hero-btn-primary"
                  onClick={() => window.location.href = '/auth/login'}
                >
                  🚀 Google로 시작하기
                </button>
              </div>
            </div>
          )}

          {/* Categories Tabs */}
          <div className="category-tabs">
            <a href="/" className={`category-tab ${filter !== 'myTopics' ? 'active' : ''}`}>Popular</a>
            <button
              className={`category-tab ${filter === 'myTopics' ? 'active' : ''}`}
              onClick={() => {
                if (!isLoggedIn) {
                  window.location.href = '/auth/login?redirectTo=/questions'
                  return
                }
                setFilter('myTopics')
              }}
            >
              My Topic
            </button>
            <a href="/following" className="category-tab">Following</a>
          </div>

          {/* Filter Buttons - Separate Group */}
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              전체
            </button>
            <button
              className={`filter-btn ${filter === 'latest' ? 'active' : ''}`}
              onClick={() => setFilter('latest')}
            >
              최신
            </button>
          </div>

          {/* Questions Feed */}
          <div className="feed-container">
            {loading && (
              <div className="feed-loading">
                로딩 중...
              </div>
            )}

            {!loading && filteredQuestions.length === 0 && (
              <div className="feed-empty">
                <div className="feed-empty-icon">📝</div>
                <h3>아직 질문이 없습니다</h3>
                <p>첫 번째 질문을 작성해보세요!</p>
                <a href="/questions/new" className="btn-primary feed-empty-link">질문 작성하기</a>
              </div>
            )}

            {!loading && filteredQuestions.map((question) => {
              const author = question.author || { id: 'unknown', name: '익명', role: 'user' }

              return (
                <div
                  key={question.id}
                  className="question-card"
                  onClick={() => window.location.href = `/questions/${question.id}`}
                >
                  <div className="question-header">
                    {/* 작성자 정보 with 프로필 아바타 */}
                    <div className="question-meta">
                      <div className="question-author-row">
                        {/* 프로필 아바타 */}
                        <div
                          className="author-avatar-small"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (author.id !== 'unknown') {
                              window.location.href = `/users/${author.id}`
                            }
                          }}
                        ></div>

                        {/* 작성자 정보 */}
                        <div className="question-author-info">
                          <div className="question-author">
                            <span
                              className="question-author-link"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (author.id !== 'unknown') {
                                  window.location.href = `/users/${author.id}`
                                }
                              }}
                            >
                              {author.name}
                            </span>
                            {/* 인증 정보 박스: 정보가 있을 때만 표시 */}
                            {(author.visaType || author.yearsInKorea) && (
                              <span className={`author-verification-box ${author.role === 'verified' || author.role === 'admin' ? 'verified' : ''}`}>
                                <span className="verification-text">
                                  {author.visaType || ''}
                                  {author.yearsInKorea ? `, 한국 ${author.yearsInKorea}년차` : ''}
                                </span>
                              </span>
                            )}
                          </div>
                          <div className="question-time-row">
                            <div className="question-time">
                              {formatDate(question.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 더보기 버튼 (오른쪽 상단) */}
                    <button
                      className="question-more-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `/questions/${question.id}`
                      }}
                      aria-label="게시글 상세 보기"
                    >
                      자세히
                    </button>
                  </div>

                  <h3 className="question-title">{question.title}</h3>
                  <p className="question-content">
                    {question.content.length > 200 ? question.content.substring(0, 200) + '...' : question.content}
                  </p>

                  <div className="question-stats">
                    <div className="question-stats-comments">
                      <span className="answer-expert-icon">🎓</span>
                      <span>
                        {(() => {
                          const totalCount = question.answerCount
                          const expertCount = Math.max(1, Math.floor(totalCount * 0.4))
                          const othersCount = totalCount - expertCount

                          if (totalCount === 0) {
                            return <span>아직 답변이 없어요</span>
                          }

                          if (expertCount > 0 && othersCount > 0) {
                            return (
                              <>
                                <strong className="expert-highlight">Certified User {expertCount}명</strong> 외 <strong>{othersCount}명</strong>이 답변했어요
                              </>
                            )
                          }

                          if (expertCount > 0) {
                            return (
                              <>
                                <strong className="expert-highlight">Certified User {expertCount}명</strong>이 답변했어요
                              </>
                            )
                          }

                          return (
                            <>
                              <strong>{totalCount}명</strong>이 답변했어요
                            </>
                          )
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* ActionBar: 도움됨/북마크/공유 버튼 */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <ActionBar
                      targetId={question.id}
                      targetType="question"
                      title={question.title}
                      content={question.content}
                      url={`/questions/${question.id}`}
                      initialHelpfulCount={question.votes}
                      compact={true}
                      requireLogin={!isLoggedIn}
                      onLoginRequired={() => {
                        window.location.href = `/auth/login?redirectTo=/questions`
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </main>
  )
}

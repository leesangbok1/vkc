'use client'

import { useState, useEffect } from 'react'
import TopicSelectionModal from '@/components/modals/TopicSelectionModal'
import Sidebar from '@/components/layout/Sidebar'
import { MOCK_QUESTIONS, type Question } from '@/lib/data/mockData'
import { questionMatchesTopics } from '@/lib/data/topic-category-mapping'

export default function QuestionsPage() {
  const [activeTab, setActiveTab] = useState<'popular' | 'interest' | 'answers'>('popular')
  const [filter, setFilter] = useState<'all' | 'first-answer'>('all')
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS)
  const [loading, setLoading] = useState(false)
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [followedUsers, setFollowedUsers] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  // localStorage에서 팔로우 목록 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('followed_users')
      setFollowedUsers(stored ? JSON.parse(stored) : [])

      const mockSession = localStorage.getItem('mock_session')
      setIsLoggedIn(mockSession === 'true')
    }
  }, [])

  useEffect(() => {
    loadQuestions()
  }, [activeTab, filter, selectedTopics])

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

  // Filter questions by selected topics
  const filteredQuestions = questions.filter(question => {
    // If no topics selected, show all
    if (selectedTopics.length === 0) return true

    // Filter by category if question has category field
    if (question.category) {
      return questionMatchesTopics(question.category, selectedTopics)
    }

    // Fallback: show all if no category
    return true
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
      <div className="container">
        <div className="main-content">
          {/* 탭 네비게이션 */}
          <div className="tab-navigation">
            <button
              className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveTab('popular')}
            >
              인기
            </button>
            <button
              className={`tab ${activeTab === 'interest' ? 'active' : ''}`}
              onClick={() => setActiveTab('interest')}
            >
              관심
            </button>
            <button
              className={`tab ${activeTab === 'answers' ? 'active' : ''}`}
              onClick={() => setActiveTab('answers')}
            >
              답변
            </button>
          </div>

          {/* 필터 바 */}
          <div className="filter-bar">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                전체 ▼
              </button>
              <button
                className={`filter-btn ${filter === 'first-answer' ? 'active' : ''}`}
                onClick={() => setFilter('first-answer')}
              >
                👍 첫 답변 받기
              </button>
            </div>

            <button
              className="topic-trigger-btn"
              onClick={() => setShowTopicModal(true)}
            >
              {selectedTopics.length > 0
                ? `선택된 토픽 (${selectedTopics.length})`
                : '누구나 토픽 전체'}
            </button>
          </div>

          {/* 이벤트 배너 */}
          <a href="/events/beta" className="event-banner">
            <div className="event-banner-content">
              <div className="event-banner-title">답변 작성 챌린지 이벤트</div>
              <div className="event-banner-subtitle">
                미션 달성하고 혜택을 받아보세요! 9월 15일 ~ 10월 31일
              </div>
            </div>
            <div className="event-banner-icons">
              <span>💬</span>
              <span>🎁</span>
            </div>
          </a>

          {/* 질문 목록 */}
          <div className="questions-list">
            {loading && (
              <div className="loading-state">
                로딩 중...
              </div>
            )}

            {!loading && filteredQuestions.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>아직 질문이 없습니다</h3>
                <p>첫 번째 질문을 작성해보세요!</p>
                <a href="/questions/new" className="btn-primary">질문 작성하기</a>
              </div>
            )}

            {!loading && filteredQuestions.map((question) => {
              // Safe author access with fallback
              const author = question.author || { id: 'unknown', name: '익명', role: 'user' }

              return (<div
                key={question.id}
                className="question-card"
                onClick={() => window.location.href = `/questions/${question.id}`}
              >
                <div className="question-card-header">
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
                          {/* 인증 정보 박스 */}
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
                          {/* Follow 버튼 */}
                          {author.id !== 'unknown' && (
                          <button
                            className={`follow-btn-compact ${followedUsers.includes(author.id) ? 'following' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!isLoggedIn) {
                                window.location.href = `/auth/login?redirectTo=/questions`
                                return
                              }

                              const isFollowing = followedUsers.includes(author.id)
                              if (isFollowing) {
                                const updated = followedUsers.filter((id: string) => id !== author.id)
                                localStorage.setItem('followed_users', JSON.stringify(updated))
                                setFollowedUsers(updated)
                                alert(`${author.name}님을 언팔로우했습니다`)
                              } else {
                                const updated = [...followedUsers, author.id]
                                localStorage.setItem('followed_users', JSON.stringify(updated))
                                setFollowedUsers(updated)
                                alert(`${author.name}님을 팔로우했습니다`)
                              }
                            }}
                          >
                            {followedUsers.includes(author.id) ? 'Following' : 'Follow'}
                          </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 더보기 버튼 */}
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
                  <div className="question-stats-actions">
                    <button
                      className="vote-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isLoggedIn) {
                          window.location.href = `/auth/login?redirectTo=/questions`
                          return
                        }
                        alert('투표 기능 구현 예정')
                      }}
                    >
                      👍 <span>{question.votes}</span>
                    </button>
                    <button
                      className="vote-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isLoggedIn) {
                          window.location.href = `/auth/login?redirectTo=/questions`
                          return
                        }
                        alert('투표 기능 구현 예정')
                      }}
                    >
                      👎
                    </button>
                    <span className="view-count">
                      👁️ <span>{question.views}</span>
                    </span>
                  </div>
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
                              <strong className="expert-highlight">Certified {expertCount}명</strong> 외 <strong>{othersCount}명</strong>이 답변했어요
                            </>
                          )
                        }

                        if (expertCount > 0) {
                          return (
                            <>
                              <strong className="expert-highlight">Certified {expertCount}명</strong>이 답변했어요
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
              </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>

      {/* 토픽 선택 모달 */}
      <TopicSelectionModal
        isOpen={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        onConfirm={(topics) => {
          console.log('Selected topics:', topics)
          setSelectedTopics(topics)
          // Auto-close modal after selection
          setShowTopicModal(false)
        }}
      />
    </main>
  )
}

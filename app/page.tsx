'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import Sidebar from '@/components/layout/Sidebar'
import { MOCK_QUESTIONS, MOCK_POSTS, type Question, type Post, type User } from '@/lib/data/mockData'

// Type alias for Author (compatibility with existing code)
type Author = User

type FeedItem = Question | Post

// 통합 피드 데이터 - 인증된 사용자 우선, 그 다음 최신순
const MOCK_FEED: FeedItem[] = [
  ...MOCK_POSTS.slice(0, 5),  // 최신 정보글 5개
  ...MOCK_QUESTIONS.slice(0, 5)  // 최신 질문 5개
].sort((a, b) => {
  // 1순위: 인증 상태 (verified/admin 우선)
  const aVerified = a.author.role === 'verified' || a.author.role === 'admin' ? 1 : 0
  const bVerified = b.author.role === 'verified' || b.author.role === 'admin' ? 1 : 0

  if (aVerified !== bVerified) {
    return bVerified - aVerified // 인증 사용자가 먼저
  }

  // 2순위: 최신순
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
})

export default function HomePage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>(MOCK_FEED)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [isDevAdmin, setIsDevAdmin] = useState(false)
  const [userRole, setUserRole] = useState<'guest' | 'user' | 'verified' | 'admin'>('guest')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true) // 초기 로딩 상태
  const [showEventModal, setShowEventModal] = useState(false) // 이벤트 모달 상태
  const [followedUsers, setFollowedUsers] = useState<string[]>([]) // 팔로우한 사용자 목록

  useEffect(() => {
    checkAuth()
    loadFeed()
  }, [])

  // localStorage에서 팔로우 목록 로드 (클라이언트 사이드만)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('followed_users')
      setFollowedUsers(stored ? JSON.parse(stored) : [])
    }
  }, [])

  // 로그인 후 이벤트 모달 자동 오픈 (한 번만)
  useEffect(() => {
    if (isLoggedIn && !isCheckingAuth) {
      const hasSeenModal = localStorage.getItem('vietkconnect_event_modal_seen')
      if (!hasSeenModal) {
        // 1초 후 모달 오픈 (부드러운 UX)
        const timer = setTimeout(() => {
          setShowEventModal(true)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [isLoggedIn, isCheckingAuth])

  async function checkAuth() {
    try {
      // 🎭 MOCK: localStorage에서 mock session 체크
      const mockSession = localStorage.getItem('mock_session')
      const mockUser = localStorage.getItem('mock_user')
      const onboardingCompleted = localStorage.getItem('vietkconnect_onboarded')

      if (mockSession === 'true' && mockUser && onboardingCompleted === 'true') {
        const user = JSON.parse(mockUser)
        setIsLoggedIn(true)
        setUserName(user.name || user.email || '사용자')
        setUserRole(user.role || 'user')

        // 개발자 ADMIN 모드 확인
        if (user.is_dev_mode && user.role === 'admin') {
          setIsDevAdmin(true)
          console.log('👑 개발자 ADMIN 모드 활성화!')
          console.log('✅ 모든 페이지 및 기능 접근 가능')
        }

        console.log('✅ 로그인 상태 확인:', user.name, '| 권한:', user.role)
      } else {
        // 로그인 안됨 또는 온보딩 미완료
        setIsLoggedIn(false)
        setUserRole('guest')
        setIsDevAdmin(false)
        console.log('❌ 로그인 안됨 또는 온보딩 미완료')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsLoggedIn(false)
    } finally {
      setIsCheckingAuth(false) // 로딩 완료
    }
  }

  async function loadFeed() {
    try {
      setLoading(true)
      // TODO: API 구현 시 실제 데이터 로드
      // const response = await fetch('/api/feed?limit=10&sort=created_at')
      // if (response.ok) {
      //   const data = await response.json()
      //   setFeedItems(data.items)
      // }
    } catch (error) {
      console.error('Failed to load feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'verified':
        return <span className="expert-badge expert-badge-verified expert-badge-inline">✅</span>
      case 'admin':
        return <span className="expert-badge expert-badge-admin expert-badge-inline">👑</span>
      default:
        return null
    }
  }

  // 질문/정보글 구분 배지 제거 - 내부 분류용으로만 사용
  // const getContentTypeBadge = (type: 'question' | 'post') => {
  //   if (type === 'post') {
  //     return (
  //       <span className="content-type-badge content-type-badge-post">
  //         📝 정보글
  //       </span>
  //     )
  //   }
  //   return (
  //     <span className="content-type-badge content-type-badge-question">
  //       ❓ 질문
  //     </span>
  //   )
  // }

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
          {!isLoggedIn ? (
            // 로그인 전: 플랫폼 가치 강조
            <div className="desktop-hero">
              <div className="hero-badge">
                <span>🛡️</span>
                <span>검증된 선경험자의 진짜 답변</span>
              </div>
              <h1 className="hero-title">
                비자, 유학, 취업 등 한국생활 관련 질문을<br />
                실제 경험으로 인증받은 Certified가 답변합니다
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
          ) : (
            // 로그인 후: 컴팩트 입력창
            <div className="desktop-hero-compact">
              <div className="hero-input-row">
                <div className="profile-avatar-medium">
                  👤
                </div>
                <input
                  type="text"
                  placeholder="비자, 유학, 취업 등 한국생활 관련 궁금한 점을 질문해보세요"
                  className="hero-search-input"
                  onClick={() => window.location.href = '/questions/new'}
                  readOnly
                />
              </div>
              <div className="hero-action-buttons">
                <button
                  className="hero-action-btn"
                  onClick={() => window.location.href = '/questions/new'}
                >
                  ❓ Ask
                </button>
                <button
                  className="hero-action-btn"
                  onClick={() => window.location.href = '/following'}
                >
                  👥 Following
                </button>
                <button
                  className="hero-action-btn"
                  onClick={() => window.location.href = '/posts/new'}
                >
                  📝 Post
                </button>
              </div>
            </div>
          )}

          {/* Event Banner - 베타 오픈 챌린지 */}
          {isLoggedIn && (
            <div
              className="event-banner-horizontal"
              onClick={() => setShowEventModal(true)}
            >
              <div className="event-banner-left">
                <h3 className="event-banner-main-title">
                  한국생활 질문에 답변하고 리워드 받아가세요
                </h3>
                <p className="event-banner-description">
                  Certified 인증 후 답변 작성 시 최대 50,000원 상품권 지급
                </p>
              </div>
              <div className="event-banner-center">
                <div className="event-banner-date">~11월 30일</div>
              </div>
              <div className="event-banner-right">
                <div className="event-banner-icons-compact">
                  <span className="event-icon-compact">🎁</span>
                  <span className="event-icon-compact">💰</span>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tabs */}
          <div className="category-tabs">
            <a href="/" className="category-tab active">Popular</a>
            <a href="/topics" className="category-tab">Topic</a>
            <a href="/following" className="category-tab">Following</a>
          </div>

          {/* Unified Feed (Questions + Posts) */}
          <div className="feed-container">
            {loading && (
              <div className="feed-loading">
                로딩 중...
              </div>
            )}

            {!loading && feedItems.length === 0 && (
              <div className="feed-empty">
                <div className="feed-empty-icon">📝</div>
                <h3>아직 게시물이 없습니다</h3>
                <p>첫 번째 게시물을 작성해보세요!</p>
                <a href="/questions/new" className="btn-primary feed-empty-link">질문 작성하기</a>
              </div>
            )}

            {!loading && feedItems.map((item) => (
              <div
                key={item.id}
                className="question-card"
                onClick={() => {
                  if (item.type === 'question') {
                    window.location.href = `/questions/${item.id}`
                  } else {
                    window.location.href = `/posts/${item.id}`
                  }
                }}
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
                          window.location.href = `/users/${item.author.id}`
                        }}
                      ></div>

                      {/* 작성자 정보 */}
                      <div className="question-author-info">
                        <div className="question-author">
                          <span
                            className="question-author-link"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = `/users/${item.author.id}`
                            }}
                          >
                            {item.author.name}
                          </span>
                          {/* 인증 정보 박스: 정보가 있을 때만 표시 */}
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
                          {/* Follow 버튼 - 날짜 옆에 배치 */}
                          <button
                            className={`follow-btn-compact ${followedUsers.includes(item.author.id) ? 'following' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (typeof window === 'undefined') return

                              if (!isLoggedIn) {
                                const currentUrl = window.location.pathname
                                window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentUrl)}`
                                return
                              }

                              const isFollowing = followedUsers.includes(item.author.id)

                              if (isFollowing) {
                                // Unfollow
                                const updated = followedUsers.filter((id: string) => id !== item.author.id)
                                localStorage.setItem('followed_users', JSON.stringify(updated))
                                setFollowedUsers(updated)
                                alert(`${item.author.name}님을 언팔로우했습니다`)
                              } else {
                                // Follow
                                const updated = [...followedUsers, item.author.id]
                                localStorage.setItem('followed_users', JSON.stringify(updated))
                                setFollowedUsers(updated)
                                alert(`${item.author.name}님을 팔로우했습니다`)
                              }
                            }}
                          >
                            {followedUsers.includes(item.author.id) ? 'Following' : 'Follow'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 더보기 버튼 (오른쪽 상단) */}
                  <button
                    className="question-more-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (item.type === 'question') {
                        window.location.href = `/questions/${item.id}`
                      } else {
                        window.location.href = `/posts/${item.id}`
                      }
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
                  <div className="question-stats-actions">
                    <button
                      className="vote-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isLoggedIn) {
                          const currentUrl = window.location.pathname
                          window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentUrl)}`
                          return
                        }
                        alert('투표 기능 구현 예정')
                      }}
                    >
                      👍 <span>{item.votes}</span>
                    </button>
                    <button
                      className="vote-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isLoggedIn) {
                          const currentUrl = window.location.pathname
                          window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentUrl)}`
                          return
                        }
                        alert('투표 기능 구현 예정')
                      }}
                    >
                      👎
                    </button>
                    <span className="view-count">
                      👁️ <span>{item.views}</span>
                    </span>
                  </div>
                  <div className="question-stats-comments">
                    <span className="answer-expert-icon">
                      🎓
                    </span>
                    <span>
                      {(() => {
                        const totalCount = item.type === 'question' ? item.answerCount : item.commentCount
                        // Mock: Certified Expert 비율 30-50%로 가정
                        const expertCount = Math.max(1, Math.floor(totalCount * 0.4))
                        const othersCount = totalCount - expertCount

                        if (totalCount === 0) {
                          return <span>아직 {item.type === 'question' ? '답변' : '댓글'}이 없어요</span>
                        }

                        if (expertCount > 0 && othersCount > 0) {
                          return (
                            <>
                              <strong className="expert-highlight">Certified {expertCount}명</strong> 외 <strong>{othersCount}명</strong>이 {item.type === 'question' ? '답변' : '댓글'}했어요
                            </>
                          )
                        }

                        if (expertCount > 0) {
                          return (
                            <>
                              <strong className="expert-highlight">Certified {expertCount}명</strong>이 {item.type === 'question' ? '답변' : '댓글'}했어요
                            </>
                          )
                        }

                        return (
                          <>
                            <strong>{totalCount}명</strong>이 {item.type === 'question' ? '답변' : '댓글'}했어요
                          </>
                        )
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>

      {/* Event Modal - 베타 오픈 이벤트 팝업 */}
      {showEventModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEventModal(false)
              // 모달을 본 것으로 기록
              localStorage.setItem('vietkconnect_event_modal_seen', 'true')
            }
          }}
        >
          <div className="event-modal">
            <button
              className="modal-close"
              onClick={() => {
                setShowEventModal(false)
                // 모달을 본 것으로 기록
                localStorage.setItem('vietkconnect_event_modal_seen', 'true')
              }}
            >
              ×
            </button>
            <div className="event-modal-content">
              {/* Decorative Elements */}
              <div className="event-modal-decorations">
                <div className="decoration-1"></div>
                <div className="decoration-2"></div>
                <div className="decoration-3"></div>
                <div className="decoration-4"></div>
                <div className="decoration-dots"></div>
                <div className="decoration-dots-bottom"></div>
              </div>

              {/* Content */}
              <h2 className="event-modal-title">
                VietKConnect 베타 오픈<br />챌린지 이벤트
              </h2>
              <p className="event-modal-subtitle">
                한국 생활 질문답변 하고 적립금 받아가세요!
              </p>
              <div className="event-modal-period">10월 9일 ~ 11월 30일</div>

              <p className="event-modal-description">
                모든 미션은 미션 기간 안에 달성해야 혜택 대상자가 됩니다.
              </p>

              {/* Certified Mission Section */}
              <div className="event-modal-section">
                <h3 className="event-modal-section-title">
                  🔥 Certified 답변 분야
                </h3>

                <div className="event-modal-mission">
                  <div className="event-modal-mission-title">
                    첫 번째 미션: Certified 답변 10개 작성하기
                  </div>
                  <div className="event-modal-mission-reward">
                    💰 미션 혜택: 달성하면 네이버페이 10,000원 지급
                  </div>
                </div>

                <div className="event-modal-mission">
                  <div className="event-modal-mission-title">
                    두 번째 미션: Certified 답변 20개 작성하기
                  </div>
                  <div className="event-modal-mission-reward">
                    💰 미션 혜택: 20명 추첨 후, 네이버페이 10,000원 지급
                  </div>
                </div>

                <div className="event-modal-mission">
                  <div className="event-modal-mission-title">
                    세 번째 미션: 10일 이상 Certified 답변 활동하고, 60개 이상 답변 완료하기
                  </div>
                  <div className="event-modal-mission-reward">
                    💰 미션 혜택: 40명 추첨 후, 신세계 상품권 50,000원 지급
                  </div>
                </div>
              </div>

              {/* Newcomer Mission Section */}
              <div className="event-modal-section">
                <h3 className="event-modal-section-title">
                  🆕 누구나 답변 분야
                </h3>

                <div className="event-modal-mission">
                  <div className="event-modal-mission-title">
                    첫 번째 미션: 누구나 답변 10개 작성하기
                  </div>
                  <div className="event-modal-mission-reward">
                    💰 미션 혜택: 달성하면 네이버페이 1,000원 지급
                  </div>
                </div>

                <div className="event-modal-mission">
                  <div className="event-modal-mission-title">
                    두 번째 미션: 누구나 답변 20개 작성하기
                  </div>
                  <div className="event-modal-mission-reward">
                    💰 미션 혜택: 전체 회원 대상
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="event-modal-section">
                <h3 className="event-modal-section-title">
                  📅 이벤트 일정
                </h3>
                <p className="event-modal-detail-item">
                  <strong>[이벤트 기간]</strong><br />
                  10월 9일 ~ 11월 30일
                </p>
                <p className="event-modal-detail-item">
                  <strong>[혜택 대상자 발표]</strong><br />
                  12월 7일 (금)
                </p>
                <p className="event-modal-detail-item">
                  <strong>[보상 지급 날짜]</strong><br />
                  12월 10일 (월)
                </p>
                <p className="event-modal-detail-item event-modal-detail-item-last">
                  <strong>[보상 지급 방식]</strong><br />
                  카카오톡 혹은 문자로 쿠폰 발송
                </p>
              </div>

              {/* Actions */}
              <div className="event-modal-actions">
                <button
                  className="event-btn event-btn-secondary"
                  onClick={() => {
                    setShowEventModal(false)
                    // 모달을 본 것으로 기록
                    localStorage.setItem('vietkconnect_event_modal_seen', 'true')
                  }}
                >
                  닫기
                </button>
                <button
                  className="event-btn event-btn-primary"
                  onClick={() => {
                    setShowEventModal(false)
                    // 모달을 본 것으로 기록
                    localStorage.setItem('vietkconnect_event_modal_seen', 'true')
                    window.location.href = '/questions'
                  }}
                >
                  미션 달성하러 가기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

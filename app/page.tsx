'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import Sidebar from '@/components/layout/Sidebar'
import PageLayout from '@/components/layout/PageLayout'
import ActionBar from '@/components/common/ActionBar'
import BannerCarousel from '@/components/banners/BannerCarousel'
import CertificationModal from '@/components/modals/CertificationModal'
import { MOCK_QUESTIONS, MOCK_POSTS, MOCK_BANNERS, type Question, type Post, type User } from '@/lib/data/mockData'
import QuickTour from '@/components/tour/QuickTour'
import { useQuickTour, defaultTourSteps } from '@/lib/hooks/useQuickTour'
import { truncateToSentences } from '@/lib/utils/text-utils'

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
  const [showCertificationModal, setShowCertificationModal] = useState(false) // 인증 신청 모달 상태
  const [followedUsers, setFollowedUsers] = useState<string[]>([]) // 팔로우한 사용자 목록
  const [banners, setBanners] = useState(MOCK_BANNERS) // 배너 목록 (localStorage 오버라이드 지원)

  // Quick Tour state (only for logged-in users, wait for event modal to close)
  const { isOpen: isTourOpen, handleComplete: completeTour, handleSkip: skipTour } = useQuickTour(isLoggedIn, showEventModal)

  useEffect(() => {
    checkAuth()
    loadFeed()

    // Load banner overrides from localStorage if any
    const overrides = localStorage.getItem('banner_overrides')
    if (overrides) {
      try {
        const parsed = JSON.parse(overrides)
        setBanners(parsed)
      } catch (error) {
        console.error('Failed to load banner overrides:', error)
      }
    }
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

  // URL 파라미터로 인증 모달 오픈 제어
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    if (params.get('modal') === 'certification') {
      setShowCertificationModal(true)
    }

    // Listen for custom event from Sidebar or other components
    const handleOpenCertificationModal = () => {
      setShowCertificationModal(true)
      // Update URL
      const url = new URL(window.location.href)
      url.searchParams.set('modal', 'certification')
      window.history.pushState({}, '', url)
    }

    window.addEventListener('openCertificationModal', handleOpenCertificationModal)
    return () => {
      window.removeEventListener('openCertificationModal', handleOpenCertificationModal)
    }
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/profile', { cache: 'no-store' })
      if (!res.ok) {
        setIsLoggedIn(false)
        setUserRole('guest')
        setIsDevAdmin(false)
        return
      }
      const json = await res.json()
      const profile = json.data
      if (!profile?.onboarding_completed) {
        setIsLoggedIn(false)
        setUserRole('guest')
        setIsDevAdmin(false)
        return
      }
      setIsLoggedIn(true)
      setUserName(profile.name || '사용자')
      setUserRole((profile.role as any) || 'user')
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsLoggedIn(false)
      setUserRole('guest')
      setIsDevAdmin(false)
    } finally {
      setIsCheckingAuth(false)
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

  // 인증 체크 중일 때 로딩 화면 표시 (FOUC 방지)
  if (isCheckingAuth) {
    return (
      <PageLayout variant="centered">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
            <p>로딩 중...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="withSidebar">
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

      {/* Main Content Area */}
      <div>
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
                  data-tour="ask-question"
                >
                  ❓ Ask
                </button>
                <button
                  className="hero-action-btn"
                  onClick={() => window.location.href = '/questions'}
                >
                  💬 Answer
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

          {/* Banner Carousel - 미션/이벤트 배너 */}
          {isLoggedIn && (
            <BannerCarousel banners={banners} />
          )}

          {/* Categories Tabs */}
          <div className="category-tabs">
            <a href="/" className="category-tab active">Popular</a>
            <a href="/topics" className="category-tab" data-tour="topics">Topic</a>
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
                            <span
                              className={`author-verification-box ${item.author.role === 'verified' || item.author.role === 'admin' ? 'verified' : ''}`}
                              data-tour="certified-badge"
                            >
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
                  {truncateToSentences(item.content, 2)}
                </p>

                <div className="question-stats">
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
                              <strong className="expert-highlight">Certified User {expertCount}명</strong> 외 <strong>{othersCount}명</strong>이 {item.type === 'question' ? '답변' : '댓글'}했어요
                            </>
                          )
                        }

                        if (expertCount > 0) {
                          return (
                            <>
                              <strong className="expert-highlight">Certified User {expertCount}명</strong>이 {item.type === 'question' ? '답변' : '댓글'}했어요
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

                {/* ActionBar: 도움됨/북마크/공유 버튼 */}
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
                      const currentUrl = window.location.pathname
                      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentUrl)}`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
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
                  🔥 Certified User 답변 분야
                </h3>

                <div className="event-modal-mission">
                  <div className="event-modal-mission-title">
                    첫 번째 미션: Certified User 답변 10개 작성하기
                  </div>
                  <div className="event-modal-mission-reward">
                    💰 미션 혜택: 달성하면 네이버페이 10,000원 지급
                  </div>
                </div>

                <div className="event-modal-mission">
                  <div className="event-modal-mission-title">
                    두 번째 미션: Certified User 답변 20개 작성하기
                  </div>
                  <div className="event-modal-mission-reward">
                    💰 미션 혜택: 20명 추첨 후, 네이버페이 10,000원 지급
                  </div>
                </div>

                <div className="event-modal-mission">
                  <div className="event-modal-mission-title">
                    세 번째 미션: 10일 이상 Certified User 답변 활동하고, 60개 이상 답변 완료하기
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

      {/* Quick Tour */}
      <QuickTour
        steps={defaultTourSteps}
        isOpen={isTourOpen}
        onComplete={completeTour}
        onSkip={skipTour}
      />

      {/* Certification Modal */}
      <CertificationModal
        isOpen={showCertificationModal}
        onClose={() => {
          setShowCertificationModal(false)
          // Remove URL parameter
          const url = new URL(window.location.href)
          url.searchParams.delete('modal')
          window.history.pushState({}, '', url)
        }}
      />
    </PageLayout>
  )
}

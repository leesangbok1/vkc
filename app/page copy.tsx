'use client'

import { useState, useEffect, useMemo, type ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import PageLayout from '@/components/layout/PageLayout'
import FeedBoard, { type FeedBoardItem } from '@/components/feed/FeedBoard'
import CertificationModal from '@/components/modals/CertificationModal'
import QuestionCreateModal from '@/components/modals/QuestionCreateModal'
import PostCreateModal from '@/components/modals/PostCreateModal'
import QuickTour from '@/components/tour/QuickTour'
import { useQuickTour, defaultTourSteps } from '@/lib/hooks/useQuickTour'
import { BRAND_NAME } from '@/lib/constants/branding'
import { useModalNavigation } from '@/lib/hooks/useModalNavigation'
import { getFollowedUsers, toggleFollowUser } from '@/lib/utils/follow-manager'

const EVENT_MODAL_STORAGE_KEY = 'vietkconnect_event_modal_state'
const EVENT_MODAL_SNOOZE_DAYS = 7
const LEGACY_EVENT_MODAL_STORAGE_KEY = 'vietkconnect_event_modal_state'

type EventModalState = {
  lastSeen?: string
  snoozedUntil?: string
  showCount?: number
}

type Banner = {
  id: string
  title: string
  description: string
  imageUrl?: string
  linkUrl: string
  backgroundColor?: string
}

const DEFAULT_EVENT_BANNER: Banner = {
  id: 'beta-open-event',
  title: `${BRAND_NAME} 베타 오픈 챌린지 이벤트`,
  description: '한국생활 질문에 답변하고 최대 50,000원 상품권 받아가세요! (~11월 30일)',
  linkUrl: '/questions',
  backgroundColor: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)'
}

const BANNER_GRADIENTS = [
  'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
]

export default function HomePage() {
  // 초기 SSR 단계에서는 번역 확장으로 인한 hydration mismatch를 막기 위해 빈 상태로 시작
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [isDevAdmin, setIsDevAdmin] = useState(false)
  const [userRole, setUserRole] = useState<'guest' | 'user' | 'verified' | 'admin'>('guest')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true) // 초기 로딩 상태
  const [showEventModal, setShowEventModal] = useState(false) // 이벤트 모달 상태
  const [showCertificationModal, setShowCertificationModal] = useState(false) // 인증 신청 모달 상태
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const [followedUsers, setFollowedUsers] = useState<string[]>([]) // 팔로우한 사용자 목록
  const [banners, setBanners] = useState<Banner[]>([]) // 배너 목록

  const sidebarBanners = useMemo<Banner[]>(() => {
    if (banners.length > 0) {
      return banners.slice(0, 4)
    }
    return [DEFAULT_EVENT_BANNER]
  }, [banners])

  const getEventModalStorageKey = () => {
    if (userId) return `${EVENT_MODAL_STORAGE_KEY}_${userId}`
    return EVENT_MODAL_STORAGE_KEY
  }

  const readEventModalState = (): EventModalState => {
    if (typeof window === 'undefined') return {}
    try {
      const storageKey = getEventModalStorageKey()
      if (userId && window.localStorage.getItem(LEGACY_EVENT_MODAL_STORAGE_KEY) && !window.localStorage.getItem(storageKey)) {
        try {
          window.localStorage.setItem(storageKey, window.localStorage.getItem(LEGACY_EVENT_MODAL_STORAGE_KEY) || '')
        } finally {
          window.localStorage.removeItem(LEGACY_EVENT_MODAL_STORAGE_KEY)
        }
      }
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return { showCount: 0 }
      const parsed = JSON.parse(raw)
      return {
        lastSeen: parsed.lastSeen ?? undefined,
        snoozedUntil: parsed.snoozedUntil ?? undefined,
        showCount: typeof parsed.showCount === 'number' ? parsed.showCount : 0,
      }
    } catch (error) {
      console.error('Failed to parse event modal state:', error)
      return { showCount: 0 }
    }
  }

  const updateEventModalState = (patch: EventModalState) => {
    if (typeof window === 'undefined') return
    try {
      const current = readEventModalState()
      const nextState = { ...current, ...patch }
      window.localStorage.setItem(getEventModalStorageKey(), JSON.stringify(nextState))
    } catch (error) {
      console.error('Failed to persist event modal state:', error)
    }
  }

  const markEventModalShown = () => {
    const current = readEventModalState()
    updateEventModalState({
      lastSeen: new Date().toISOString(),
      showCount: Math.min((current.showCount ?? 0) + 1, 1),
    })
  }

  const dismissEventModal = () => {
    updateEventModalState({ lastSeen: new Date().toISOString() })
    setShowEventModal(false)
  }

  const snoozeEventModal = () => {
    const now = new Date()
    const snoozeUntil = new Date(now)
    snoozeUntil.setDate(snoozeUntil.getDate() + EVENT_MODAL_SNOOZE_DAYS)
    updateEventModalState({
      lastSeen: now.toISOString(),
      snoozedUntil: snoozeUntil.toISOString(),
      showCount: Math.max(readEventModalState().showCount ?? 0, 1),
    })
    setShowEventModal(false)
  }

  const allowQuickTour = isLoggedIn && onboardingCompleted

  async function loadBanners() {
    try {
      const res = await fetch('/api/posts?post_type=news&limit=4', { cache: 'no-store' })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || `배너 데이터를 불러오지 못했습니다. (status: ${res.status})`)
      }
      const payload = await res.json()
      const items = Array.isArray(payload?.items) ? payload.items : []
      const mapped: Banner[] = items.map((item: any, index: number) => ({
        id: String(item.id),
        title: String(item.title || '소식'),
        description: typeof item.content === 'string'
          ? item.content.slice(0, 120)
          : '',
        imageUrl: undefined,
        linkUrl: `/posts/${item.id}`,
        backgroundColor: BANNER_GRADIENTS[index % BANNER_GRADIENTS.length],
      }))
      setBanners(mapped)
    } catch (error) {
      console.error('[HomePage] loadBanners failed:', error)
      setBanners([])
    }
  }

  // Quick Tour state (only for 온보딩 완료 사용자, 이벤트 모달 종료 후 진행)
  const { isOpen: isTourOpen, handleComplete: completeTour, handleSkip: skipTour } = useQuickTour(
    allowQuickTour,
    showEventModal,
    userId
  )

  useEffect(() => {
    checkAuth()
    loadBanners()
  }, [])

  // 로그인하면 서버에서 팔로잉 목록 로드
  useEffect(() => {
    if (!isLoggedIn) {
      setFollowedUsers([])
      return
    }

    let ignore = false

    const loadFollowing = async () => {
      try {
        const followed = await getFollowedUsers(true)
        if (!ignore) {
          setFollowedUsers(followed.map((user) => user.id))
        }
      } catch (error) {
        console.error('[Home] failed to load follow list', error)
      }
    }

    loadFollowing()
    return () => {
      ignore = true
    }
  }, [isLoggedIn])

  // 로그인 후 이벤트 모달 자동 오픈 (한 번만)
  useEffect(() => {
    if (!isLoggedIn || isCheckingAuth || !userId) {
      return
    }

    const timer = setTimeout(() => {
      const state = readEventModalState()
      const hasShownOnce = (state.showCount ?? 0) >= 1
      const snoozedUntil = state?.snoozedUntil ? new Date(state.snoozedUntil) : null
      const snoozeExpired = snoozedUntil ? snoozedUntil.getTime() <= Date.now() : false

      if (!hasShownOnce || snoozeExpired) {
        markEventModalShown()
        setShowEventModal(true)
      }
    }, 1000) // 1초 후 모달 오픈 (부드러운 UX)

    return () => clearTimeout(timer)
  }, [isLoggedIn, isCheckingAuth, userId])

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
        setUserId(null)
        setOnboardingCompleted(false)
        return
      }
      const json = await res.json()
      const profile = json.data
      setUserId(profile?.id ?? null)
      if (!profile) {
        setIsLoggedIn(false)
        setUserRole('guest')
        setIsDevAdmin(false)
        setOnboardingCompleted(false)
        return
      }

      const completed = Object.prototype.hasOwnProperty.call(profile, 'onboarding_completed')
        ? profile.onboarding_completed !== false
        : true
      setOnboardingCompleted(completed)

      if (!completed) {
        console.info('ℹ️ Onboarding not completed – continuing in logged-in mode')
      }

      setIsLoggedIn(true)
      setUserName(profile.name || '사용자')
      setUserRole((profile.role as any) || 'user')
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsLoggedIn(false)
      setUserRole('guest')
      setIsDevAdmin(false)
      setUserId(null)
      setOnboardingCompleted(false)
    } finally {
      setIsCheckingAuth(false)
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

  const renderFeedStats = (item: FeedBoardItem): ReactNode => {
    if (item.type !== 'question') {
      return null
    }
    const totalCount = item.answerCount ?? 0
    const label = '답변'

    if (totalCount === 0) {
      return <span>아직 {label}이 없어요</span>
    }

    const expertCount = Math.max(1, Math.floor(totalCount * 0.4))
    const othersCount = Math.max(0, totalCount - expertCount)

    if (expertCount > 0 && othersCount > 0) {
      return (
        <>
          <strong className="expert-highlight">Certified User {expertCount}명</strong> 외 <strong>{othersCount}명</strong>이 {label}했어요
        </>
      )
    }

    if (expertCount > 0) {
      return (
        <>
          <strong className="expert-highlight">Certified User {expertCount}명</strong>이 {label}했어요
        </>
      )
    }

    return (
      <>
        <strong>{totalCount}명</strong>이 {label}했어요
      </>
    )
  }

  const handleFollowToggle = async (authorId: string, isCurrentlyFollowing: boolean) => {
    if (!authorId) {
      return
    }

    if (!isLoggedIn) {
      const currentUrl = window.location.pathname
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentUrl)}`
      return
    }

    const previous = [...followedUsers]
    setFollowedUsers((prev) => {
      if (isCurrentlyFollowing) {
        return prev.filter((id) => id !== authorId)
      }
      return [...prev, authorId]
    })

    try {
      const { success, isFollowing } = await toggleFollowUser(authorId)
      if (!success) {
        throw new Error('follow request failed')
      }
      setFollowedUsers((prev) => {
        const next = new Set(prev)
        if (isFollowing) {
          next.add(authorId)
        } else {
          next.delete(authorId)
        }
        return Array.from(next)
      })
    } catch (error) {
      console.error('follow toggle failed', error)
      setFollowedUsers(previous)
      alert('팔로우 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const goToLogin = (redirectTo: string) => {
    const encodedPath = encodeURIComponent(redirectTo)
    window.location.href = `/auth/login?redirectTo=${encodedPath}`
  }

  const openQuestionComposer = () => {
    if (!isLoggedIn) {
      goToLogin('/questions/new')
      return
    }
    setShowQuestionModal(true)
  }

  const openPostComposer = () => {
    if (!isLoggedIn) {
      goToLogin('/posts/new')
      return
    }
    setShowPostModal(true)
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
            <p className="notranslate" translate="no" suppressHydrationWarning>로딩 중...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      variant="withSidebar"
      sidebar={<Sidebar showContent={true} banners={sidebarBanners} />}
    >
      {/* Main Content Area */}
      <div className="home-page">
        <section className="home-hero-grid">
          <div className="home-hero-card">
            <div className="home-hero-combined" role="group" aria-label="빠른 작성 및 탐색">
              <button
                type="button"
                className="home-hero-trigger"
                onClick={openQuestionComposer}
                data-tour="ask-question"
                aria-label="질문 작성하기"
              >
                <span className="home-hero-avatar" aria-hidden>👤</span>
                <span className="home-hero-placeholder" aria-hidden="true">
                  비자, 유학, 취업 등 궁금한 점을 질문해보세요!
                </span>
              </button>
              <div className="home-hero-chip-group">
                <button
                  className="vk-chip vk-chip--lg vk-chip--interactive home-hero-action-button home-hero-action-question"
                  type="button"
                  onClick={openQuestionComposer}
                >
                  <span className="vk-chip__icon" aria-hidden>❓</span>
                  <span className="vk-chip__label">Ask</span>
                </button>
                <button
                  className="vk-chip vk-chip--lg vk-chip--interactive home-hero-action-button home-hero-action-post"
                  type="button"
                  onClick={openPostComposer}
                >
                  <span className="vk-chip__icon" aria-hidden>📝</span>
                  <span className="vk-chip__label">Post</span>
                </button>
                <button
                  className="vk-chip vk-chip--lg vk-chip--interactive home-hero-action-button home-hero-action-feed"
                  type="button"
                  onClick={() => { window.location.href = '/posts' }}
                >
                  <span className="vk-chip__icon" aria-hidden>📰</span>
                  <span className="vk-chip__label">게시글</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Tabs */}
        <div className="feed-filter-bar">
          <div className="feed-filter-scroll">
            <a href="/" className="category-tab active">Popular</a>
            <a href="/topics" className="category-tab" data-tour="topics">Topic</a>
            <a href="/following" className="category-tab">Following</a>
          </div>
        </div>

        <FeedBoard
          mode="all"
          renderStats={renderFeedStats}
          defaultSort="popular"
          showSortTabs={false}
          followControls={{
            followedIds: followedUsers,
            onToggleFollow: handleFollowToggle,
            labels: { follow: '팔로우', following: '팔로잉' }
          }}
          emptyState={{
            icon: '📝',
            title: '아직 게시물이 없습니다',
            description: '첫 번째 게시물을 작성해보세요!',
            actionHref: '/questions/new',
            actionLabel: '질문 작성하기'
          }}
        />
      </div>

      {/* Event Modal - 베타 오픈 이벤트 팝업 */}
      {showEventModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              dismissEventModal()
            }
          }}
        >
          <div className="event-modal">
            <button
              className="modal-close"
              onClick={dismissEventModal}
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
                {BRAND_NAME} 베타 오픈<br />챌린지 이벤트
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
                  onClick={dismissEventModal}
                >
                  닫기
                </button>
                <button
                  className="event-btn event-btn-secondary"
                  onClick={snoozeEventModal}
                >
                  7일 동안 안 보기
                </button>
                <button
                  className="event-btn event-btn-primary"
                  onClick={() => {
                    dismissEventModal()
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
      {allowQuickTour && (
        <QuickTour
          steps={defaultTourSteps}
          isOpen={isTourOpen}
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}

      <QuestionCreateModal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
      />
      <PostCreateModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
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

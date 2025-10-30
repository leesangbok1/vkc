'use client'

import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import PageLayout from '@/components/layout/PageLayout'
import FeedBoard, { type FeedBoardItem } from '@/components/feed/FeedBoard'
import CertificationModal from '@/components/modals/CertificationModal'
import QuestionCreateModal from '@/components/modals/QuestionCreateModal'
import PostCreateModal from '@/components/modals/PostCreateModal'
import QuickTour from '@/components/tour/QuickTour'
import { useQuickTour, defaultTourSteps } from '@/lib/hooks/useQuickTour'
import { useEventModalState } from '@/lib/hooks/useEventModalState'
import { useNewsBanners, type NewsBanner } from '@/lib/hooks/useNewsBanners'
import { BRAND_NAME } from '@/lib/constants/branding'
import { getFollowedUsers, toggleFollowUser } from '@/lib/utils/follow-manager'
import { safeJsonFetch } from '@/lib/utils/fetcher'

export default function HomePage() {
  const router = useRouter()
  // 초기 SSR 단계에서는 번역 확장으로 인한 hydration mismatch를 막기 위해 빈 상태로 시작
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [isDevAdmin, setIsDevAdmin] = useState(false)
  const [userRole, setUserRole] = useState<'guest' | 'user' | 'verified' | 'admin'>('guest')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true) // 초기 로딩 상태
  const [showCertificationModal, setShowCertificationModal] = useState(false) // 인증 신청 모달 상태
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const searchParams = useSearchParams()
  const viewParam = (searchParams.get('view') || '').toLowerCase()
  const highlightId = searchParams.get('highlight')
  const initialTab: 'popular' | 'topics' | 'following' =
    viewParam === 'topics' ? 'topics' : viewParam === 'following' ? 'following' : 'popular'
  const initialPopularFeedMode: 'all' | 'questions' = viewParam === 'answers' ? 'questions' : 'all'
  const [activeTab, setActiveTab] = useState<'popular' | 'topics' | 'following'>(initialTab)
  const popularFeedMode: 'all' | 'questions' = initialPopularFeedMode
  const [followedUsers, setFollowedUsers] = useState<string[]>([]) // 팔로우한 사용자 목록
  const { banners: newsBanners } = useNewsBanners({ limit: 4 })
  const {
    isOpen: showEventModal,
    dismiss: dismissEventModal,
    snooze: snoozeEventModal,
  } = useEventModalState({
    userId,
    isLoggedIn,
    isAuthLoading: isCheckingAuth,
  })

  const sidebarBanners = useMemo<NewsBanner[]>(() => newsBanners.slice(0, 4), [newsBanners])

  const allowQuickTour = isLoggedIn && onboardingCompleted

  // Quick Tour state (only for 온보딩 완료 사용자, 이벤트 모달 종료 후 진행)
  const { isOpen: isTourOpen, handleComplete: completeTour, handleSkip: skipTour } = useQuickTour(
    allowQuickTour,
    showEventModal,
    userId
  )

  useEffect(() => {
    checkAuth()
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
      const { ok, data, error } = await safeJsonFetch<any>('/api/auth/profile', {
        cache: 'no-store',
      })
      if (!ok || !data?.data) {
        if (error) {
          console.warn('[Home] auth profile load failed:', error)
        }
        setIsLoggedIn(false)
        setUserRole('guest')
        setIsDevAdmin(false)
        setUserId(null)
        setOnboardingCompleted(false)
        return
      }
      const profile = data.data
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

    if (userId && userId === authorId) {
      alert('내 계정은 팔로우할 수 없습니다.')
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
      const { success, isFollowing, error } = await toggleFollowUser(authorId, {
        viewerId: userId ?? null,
      })
      if (!success) {
        if (error === 'SELF_FOLLOW') {
          setFollowedUsers(previous)
          alert('내 계정은 팔로우할 수 없습니다.')
          return
        }
        throw new Error(error || 'follow request failed')
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
          <div className="feed-filter-scroll feed-filter-scroll--plain">
            <button
              type="button"
              className={`category-tab ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveTab('popular')}
            >
              Popular
            </button>
            <button
              type="button"
              className={`category-tab ${activeTab === 'topics' ? 'active' : ''}`}
              onClick={() => setActiveTab('topics')}
              data-tour="topics"
            >
              Topic
            </button>
            <button
              type="button"
              className={`category-tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </button>
            {activeTab === 'following' && isLoggedIn && (
              <button
                type="button"
                className="feed-filter-action-btn"
                onClick={() => router.push('/?modal=followers&section=recommended')}
              >
                <span aria-hidden>✨</span>
                <span>팔로잉 추천 멤버 찾아보기</span>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'popular' && (
          <FeedBoard
            mode={popularFeedMode}
            renderStats={renderFeedStats}
            defaultSort={popularFeedMode === 'questions' ? 'recent' : 'popular'}
            showSortTabs={false}
            highlightId={highlightId}
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
            includeCredentials={isLoggedIn}
          />
        )}

        {activeTab === 'topics' && (
          <TopicsTabContent
            isLoggedIn={isLoggedIn}
            onLoginRequired={() => goToLogin('/?view=topics')}
            renderStats={renderFeedStats}
            followedIds={followedUsers}
            onToggleFollow={handleFollowToggle}
          />
        )}

        {activeTab === 'following' && (
          isLoggedIn ? (
            <div
              className="home-following-section"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
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
                icon: '🤝',
                title: '팔로우한 멤버의 활동이 아직 없습니다',
                description: '관심 있는 전문가를 팔로우하면 업데이트를 모아볼 수 있어요.',
                actionHref: '/users/discover',
                actionLabel: '사람 둘러보기'
              }}
              questionsQuery={{ following: 'true' }}
              postsQuery={{ following: 'true' }}
              includeCredentials={isLoggedIn}
            />
            </div>
          ) : (
            <div
              className="home-following-prompt"
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '2.5rem',
                textAlign: 'center',
                background: '#f8fafc',
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                팔로우한 멤버들의 피드를 보려면 로그인하세요
              </h3>
              <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
                관심 있는 전문가를 팔로우하면 질문과 답변을 한 곳에서 확인할 수 있어요.
              </p>
              <button
                type="button"
                className="vk-chip vk-chip--lg vk-chip--interactive vk-chip--primary home-hero-action-button"
                onClick={() => goToLogin('/following')}
              >
                <span className="vk-chip__icon" aria-hidden>🔑</span>
                <span className="vk-chip__label">로그인하고 보기</span>
              </button>
            </div>
          )
        )}
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

type TopicsPreviewItem = {
  id: number | string
  name: string
  icon?: string | null
  description?: string | null
  slug?: string | null
  questionCount: number
}

type TopicsTabContentProps = {
  isLoggedIn: boolean
  onLoginRequired: () => void
  renderStats: (item: FeedBoardItem) => ReactNode
  followedIds: string[]
  onToggleFollow: (authorId: string, isFollowing: boolean) => Promise<void> | void
}

function TopicsTabContent({
  isLoggedIn,
  onLoginRequired,
  renderStats,
  followedIds,
  onToggleFollow
}: TopicsTabContentProps) {
  const [topics, setTopics] = useState<TopicsPreviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<TopicsPreviewItem | null>(null)
  const [subscribedTopicIds, setSubscribedTopicIds] = useState<Set<number>>(new Set())
  const [pendingTopicId, setPendingTopicId] = useState<number | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadTopics() {
      setLoading(true)
      setError(null)
      try {
        const { ok, data, error } = await safeJsonFetch<any>(
          '/api/categories?include_count=true&limit=18',
          {
            cache: 'no-store',
            credentials: 'include',
          }
        )

        if (!ok) {
          throw new Error(error || '토픽을 불러오지 못했습니다.')
        }

        const dataArray = Array.isArray(data?.data) ? data.data : []
        if (ignore) return

        const mapped: TopicsPreviewItem[] = dataArray.map((item: any, index: number) => {
          const fallbackId =
            typeof item?.id !== 'undefined' && item?.id !== null
              ? item.id
              : `topic-${index}-${Date.now()}`
          return {
            id: fallbackId,
            name: typeof item?.name === 'string' && item.name.length > 0 ? item.name : '이름 없는 토픽',
            icon: typeof item?.icon === 'string' && item.icon.length > 0 ? item.icon : null,
            description:
              typeof item?.description === 'string' && item.description.length > 0
                ? item.description
                : '추가 설명이 아직 없습니다.',
            slug: typeof item?.slug === 'string' && item.slug.length > 0 ? item.slug : null,
            questionCount: Number(item?.question_count ?? item?.questionCount ?? 0)
          }
        })

        setTopics(mapped)
      } catch (err) {
        console.error('[HomePage] failed to load topics preview', err)
        if (!ignore) {
          setError(err instanceof Error ? err.message : '토픽을 불러오지 못했습니다.')
          setTopics([])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadTopics()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setSubscribedTopicIds(new Set())
      return
    }

    let ignore = false

    async function loadSubscriptions() {
      try {
        const { ok, data, error } = await safeJsonFetch<any>(
          '/api/topics/subscriptions',
          {
            method: 'GET',
            cache: 'no-store',
            credentials: 'include',
          }
        )

        if (!ok) {
          throw new Error(error || '토픽 구독 정보를 불러오지 못했습니다.')
        }

        if (ignore) return
        const entries = Array.isArray(data?.data) ? data.data : []
        const next = new Set<number>()
        entries.forEach((entry: any) => {
          const value =
            typeof entry?.category_id === 'number'
              ? entry.category_id
              : typeof entry?.category?.id === 'number'
                ? entry.category.id
                : null
          if (typeof value === 'number' && Number.isFinite(value)) {
            next.add(value)
          }
        })
        setSubscribedTopicIds(next)
      } catch (err) {
        console.warn('[HomePage] failed to load topic subscriptions', err)
      }
    }

    loadSubscriptions()
    return () => {
      ignore = true
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (!selectedTopic || topics.length === 0) return
    const matched = topics.find((topic) => {
      if (selectedTopic.slug && topic.slug) {
        return topic.slug === selectedTopic.slug
      }
      return String(selectedTopic.id) === String(topic.id)
    })
    if (matched && matched !== selectedTopic) {
      setSelectedTopic(matched)
    }
  }, [topics, selectedTopic])

  const topicQueryParams = useMemo(() => {
    if (!selectedTopic) return undefined
    const categoryValue =
      selectedTopic.slug && selectedTopic.slug.length > 0
        ? selectedTopic.slug
        : String(selectedTopic.id)
    return { category: categoryValue }
  }, [selectedTopic])

  const handleTopicSelect = async (topic: TopicsPreviewItem) => {
    setSelectedTopic(topic)

    const resolvedId =
      typeof topic.id === 'number'
        ? topic.id
        : Number.isFinite(Number(topic.id))
          ? Number(topic.id)
          : null
    const resolvedSlug = typeof topic.slug === 'string' && topic.slug.length > 0 ? topic.slug : null

    if (!isLoggedIn) {
      return
    }

    if (resolvedId !== null && subscribedTopicIds.has(resolvedId)) {
      return
    }

    if (resolvedId === null && !resolvedSlug) {
      console.warn('[HomePage] missing topic id/slug', topic)
      return
    }

    if (resolvedId !== null) {
      setPendingTopicId(resolvedId)
    }

    try {
      const body: Record<string, unknown> = {}
      if (resolvedId !== null) {
        body.category_id = resolvedId
      } else if (resolvedSlug) {
        body.category_slug = resolvedSlug
      }

      const res = await fetch('/api/topics/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          window.setTimeout(() => onLoginRequired(), 200)
        } else {
          onLoginRequired()
        }
        return
      }

      let payload: any = null
      try {
        payload = await res.json()
      } catch {
        payload = null
      }

      if (!res.ok && res.status !== 409) {
        const message = payload?.error || '토픽 구독에 실패했습니다.'
        throw new Error(message)
      }

      const subscribedId = (() => {
        const dataId = payload?.data?.category_id ?? payload?.category?.id ?? resolvedId
        return typeof dataId === 'number'
          ? dataId
          : Number.isFinite(Number(dataId))
            ? Number(dataId)
            : resolvedId
      })()

      if (typeof subscribedId === 'number' && Number.isFinite(subscribedId)) {
        setSubscribedTopicIds((prev) => {
          const next = new Set(prev)
          next.add(subscribedId)
          return next
        })
      }

      const alreadySubscribed = res.status === 409
      if (!alreadySubscribed) {
        console.info('[HomePage] topic subscribed', {
          id: subscribedId,
          name: topic.name
        })
      }
    } catch (err) {
      console.error('[HomePage] topic subscribe failed', err)
    } finally {
      setPendingTopicId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div className="topics-spinner" aria-hidden>⏳</div>
        <p style={{ color: '#64748b', marginTop: '0.75rem' }}>토픽을 불러오는 중입니다...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          border: '1px solid #fecaca',
          background: '#fef2f2',
          color: '#b91c1c',
          padding: '1.5rem',
          borderRadius: '16px',
          textAlign: 'center'
        }}
      >
        <p>{error}</p>
        <button
          type="button"
          className="vk-chip vk-chip--interactive"
          style={{ marginTop: '1rem' }}
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/topics'
            }
          }}
        >
          <span className="vk-chip__label">토픽 페이지 열기</span>
        </button>
      </div>
    )
  }

  if (topics.length === 0) {
    return (
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          background: '#f8fafc',
          color: '#475569'
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>표시할 토픽이 없습니다</p>
        <p style={{ fontSize: '0.95rem' }}>관심 있는 주제를 찾으러 토픽 페이지로 이동해보세요.</p>
        <button
          type="button"
          className="vk-chip vk-chip--interactive"
          style={{ marginTop: '1rem' }}
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/topics'
            }
          }}
        >
          <span className="vk-chip__label">토픽 둘러보기</span>
        </button>
      </div>
    )
  }

  const MAX_VISIBLE_TOPICS = 10
  const visibleTopics = topics.slice(0, MAX_VISIBLE_TOPICS)
  const hasMoreTopics = topics.length > MAX_VISIBLE_TOPICS

  const followControls = isLoggedIn
    ? {
        followedIds,
        onToggleFollow,
        labels: { follow: '팔로우', following: '팔로잉' }
      }
    : undefined

  return (
    <div className="home-topics-section">
      <div className="topics-chip-row" role="list">
        {visibleTopics.map((topic) => {
          const numericId =
            typeof topic.id === 'number'
              ? topic.id
              : Number.isFinite(Number(topic.id))
                ? Number(topic.id)
                : null
          const isSubscribed =
            typeof numericId === 'number' && subscribedTopicIds.has(numericId)
          const isActive =
            selectedTopic != null &&
            (selectedTopic.slug && topic.slug
              ? selectedTopic.slug === topic.slug
              : String(selectedTopic.id) === String(topic.id))
          const isPending =
            typeof numericId === 'number' && pendingTopicId === numericId

          return (
            <button
              key={String(topic.id)}
              type="button"
              className={[
                'topic-chip-button',
                isActive ? 'active' : '',
                isSubscribed ? 'subscribed' : '',
                isPending ? 'pending' : ''
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleTopicSelect(topic)}
              aria-pressed={isActive}
              disabled={isPending}
              title={`${topic.name} 토픽 보기`}
            >
              <span className="topic-chip-icon" aria-hidden>
                {topic.icon || '📌'}
              </span>
              <span className="topic-chip-text">
                <span className="topic-chip-label">{topic.name}</span>
                <span className="topic-chip-count">
                  질문 {topic.questionCount.toLocaleString()}개
                </span>
              </span>
              {isSubscribed && (
                <span className="topic-chip-status" aria-label="구독 중">✓</span>
              )}
            </button>
          )
        })}
        {hasMoreTopics && (
          <button
            type="button"
            className="topic-chip-button topic-chip-more"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/topics'
              }
            }}
            title="모든 토픽 보기"
          >
            <span className="topic-chip-icon" aria-hidden>➕</span>
            <span className="topic-chip-text">
              <span className="topic-chip-label">더 많은 토픽</span>
              <span className="topic-chip-count">전체 보기</span>
            </span>
          </button>
        )}
      </div>

      {!selectedTopic && (
        <div className="topics-feed-placeholder">
          <strong>토픽을 선택해보세요</strong>
          <p>관심 있는 토픽 버튼을 누르면 관련 질문과 정보글을 한 곳에서 모아볼 수 있습니다.</p>
        </div>
      )}

      {selectedTopic && topicQueryParams && (
        <div className="topics-feed-wrapper">
          <div className="topics-feed-header">
            <h3>
              <span aria-hidden style={{ marginRight: '0.35rem' }}>
                {selectedTopic.icon || '📌'}
              </span>
              {selectedTopic.name} 토픽 최신 콘텐츠
            </h3>
            <p>토픽을 구독하면 맞춤형 질문과 정보글을 더 빠르게 확인할 수 있어요.</p>
          </div>
          <FeedBoard
            key={`${selectedTopic.slug ?? selectedTopic.id}`}
            mode="all"
            renderStats={renderStats}
            defaultSort="popular"
            showSortTabs
            questionsQuery={topicQueryParams}
            postsQuery={topicQueryParams}
            followControls={followControls}
            emptyState={{
              icon: '📭',
              title: `${selectedTopic.name} 토픽에 아직 게시글이 없습니다`,
              description: '첫 질문을 남겨보거나 경험을 공유해보세요.',
              actionHref: '/questions/new',
              actionLabel: '질문 작성하기'
            }}
            includeCredentials={isLoggedIn}
          />
        </div>
      )}
    </div>
  )
}

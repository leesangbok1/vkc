'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import Sidebar from '@/components/layout/Sidebar'
import FeedCard, { type FeedCardActionProps } from '@/components/feed/FeedCard'
import StatusBadge from '@/components/common/StatusBadge'
import { DEFAULT_AVATAR_URL } from '@/lib/constants/avatar'
import { toggleFollowUser } from '@/lib/utils/follow-manager'
import {
  type ActivityQuestion,
  type ActivityPost,
  type ActivityAnswer,
  type UserActivity,
  type ProfileUser,
  mapQuestionActivity,
  mapPostActivity,
  mapAnswerActivity,
  mapToFeedCardAuthor,
} from '@/lib/profile/profile-utils'

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<ProfileUser | null>(null)
  const [activity, setActivity] = useState<UserActivity>({ questions: [], posts: [], answers: [] })
  const [activeTab, setActiveTab] = useState<'questions' | 'posts' | 'answers'>('questions')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [viewerIsAdmin, setViewerIsAdmin] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    void loadUserProfile()
  }, [userId])

  useEffect(() => {
    if (!userId || !isLoggedIn) return
    void refreshFollowStatus()
  }, [isLoggedIn, userId])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/profile', { cache: 'no-store' })
      if (!res.ok) {
        setIsLoggedIn(false)
        setCurrentUserId(null)
        setViewerIsAdmin(false)
        return
      }

      const json = await res.json().catch(() => null)
      const profile = json?.data
      setIsLoggedIn(true)
      setCurrentUserId(profile?.id ?? null)
      const role = typeof profile?.role === 'string' ? profile.role.toLowerCase() : ''
      const adminYn = typeof profile?.admin_yn === 'string' ? profile.admin_yn.toUpperCase() : ''
      setViewerIsAdmin(adminYn === 'Y' || role === 'admin')
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsLoggedIn(false)
      setCurrentUserId(null)
      setViewerIsAdmin(false)
    }
  }

  const handleEditPost = useCallback(
    (postId: string) => {
      router.push(`/posts/${postId}/edit`)
    },
    [router]
  )

  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (pendingDeleteId === postId) return

      if (typeof window !== 'undefined') {
        const confirmed = window.confirm('게시글을 삭제하면 되돌릴 수 없습니다. 계속하시겠습니까?')
        if (!confirmed) {
          return
        }
      }

      setPendingDeleteId(postId)
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        const json = await response.json().catch(() => null)

        if (!response.ok || !json?.success) {
          const message = json?.error || '게시글 삭제에 실패했습니다.'
          alert(message)
          return
        }

        setActivity((prev) => ({
          ...prev,
          posts: prev.posts.filter((item) => item.id !== postId),
        }))
        alert('게시글이 삭제되었습니다.')
      } catch (error) {
        console.error('[UserProfile] delete post failed', error)
        alert('게시글 삭제 중 오류가 발생했습니다.')
      } finally {
        setPendingDeleteId((current) => (current === postId ? null : current))
      }
    },
    [pendingDeleteId, router]
  )

  async function loadUserProfile(): Promise<void> {
    try {
      setLoading(true)
      const res = await fetch(`/api/users/${userId}`, { cache: 'no-store' })
      if (!res.ok) {
        setUser(null)
        setActivity({ questions: [], posts: [], answers: [] })
        return
      }

      const json = await res.json().catch(() => null)
      const apiUser = json?.data?.user
      if (!apiUser) {
        setUser(null)
        return
      }

      setUser({
        id: apiUser.id,
        name: apiUser.name || apiUser.email || '사용자',
        email: apiUser.email ?? null,
        role: apiUser.role ?? null,
        avatar_url: apiUser.avatar_url ?? null,
        bio: apiUser.bio ?? null,
        visa_type: apiUser.visa_type ?? null,
        years_in_korea: apiUser.years_in_korea ?? null,
        region: apiUser.region ?? null,
        company: apiUser.company ?? null,
        trust_score: apiUser.trust_score ?? null,
        question_count: apiUser.question_count ?? null,
        answer_count: apiUser.answer_count ?? null,
        helpful_answer_count: apiUser.helpful_answer_count ?? null,
        verification_status: apiUser.verification_status ?? null,
        verification_type: apiUser.verification_type ?? null,
        preferred_language: apiUser.preferred_language ?? null,
        last_active: apiUser.last_active ?? null,
        created_at: apiUser.created_at ?? null,
        updated_at: apiUser.updated_at ?? null,
        specialty_areas: Array.isArray(apiUser.specialty_areas)
          ? apiUser.specialty_areas.filter((value: unknown): value is string => typeof value === 'string')
          : null,
        interests: Array.isArray(apiUser.interests)
          ? apiUser.interests.filter((value: unknown): value is string => typeof value === 'string')
          : null,
        badges:
          apiUser.badges && typeof apiUser.badges === 'object'
            ? (apiUser.badges as Record<string, unknown>)
            : null,
      })

      const apiActivity = json?.data?.activity ?? {}
      const mappedQuestions: ActivityQuestion[] = Array.isArray(apiActivity.questions)
        ? apiActivity.questions.map(mapQuestionActivity)
        : []

      const mappedPosts: ActivityPost[] = Array.isArray(apiActivity.posts)
        ? apiActivity.posts.map(mapPostActivity)
        : []

      const mappedAnswers: ActivityAnswer[] = Array.isArray(apiActivity.answers)
        ? apiActivity.answers.map(mapAnswerActivity)
        : []

      setActivity({
        questions: mappedQuestions,
        posts: mappedPosts,
        answers: mappedAnswers,
      })
    } catch (error) {
      console.error('Failed to load user profile:', error)
      setUser(null)
      setActivity({ questions: [], posts: [], answers: [] })
    } finally {
      setLoading(false)
    }
  }

  async function refreshFollowStatus() {
    try {
      const res = await fetch('/api/users/following', { cache: 'no-store' })
      if (!res.ok) {
        setIsFollowing(false)
        return
      }
      const json = await res.json().catch(() => null)
      const followedIds: string[] = Array.isArray(json?.data) ? json.data : []
      setIsFollowing(followedIds.includes(userId))
    } catch (error) {
      console.error('Failed to refresh follow status:', error)
      setIsFollowing(false)
    }
  }

  function handleFollow() {
    if (!isLoggedIn) {
      const currentUrl = window.location.pathname
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentUrl)}`
      return
    }

    if (currentUserId && currentUserId === userId) {
      alert('자기 자신은 팔로우할 수 없습니다.')
      return
    }

    toggleFollowUser(userId, { viewerId: currentUserId })
      .then(({ success, isFollowing: nextStatus, error }) => {
        if (!success) {
          const message =
            error === 'SELF_FOLLOW'
              ? '자기 자신은 팔로우할 수 없습니다.'
              : '팔로우 처리 중 오류가 발생했습니다.'
          alert(message)
          return
        }
        setIsFollowing(nextStatus)
        alert(
          nextStatus
            ? `${user?.name ?? '사용자'}님을 팔로우했습니다`
            : `${user?.name ?? '사용자'}님을 언팔로우했습니다`
        )
      })
      .catch((error) => {
        console.error('Follow toggle failed:', error)
        alert('팔로우 처리 중 오류가 발생했습니다.')
      })
  }

  const isOwnProfile = Boolean(currentUserId && user && currentUserId === user.id)
  const normalizedRole = (user?.role || '').toLowerCase()
  const isVerified = normalizedRole === 'verified' || user?.verification_status === 'approved'
  const isAdminRole = normalizedRole === 'admin'

  const heroSubtitle = useMemo(() => {
    if (!user) return '커뮤니티 멤버'
    if (typeof user.bio === 'string' && user.bio.trim().length > 0) {
      return user.bio.trim()
    }

    const descriptors: string[] = []
    if (user.company) descriptors.push(user.company)
    if (user.region) descriptors.push(user.region)
    if (user.visa_type) descriptors.push(`비자 ${user.visa_type}`)
    if (user.years_in_korea) descriptors.push(`한국 ${user.years_in_korea}년차`)

    return descriptors.length > 0 ? descriptors.join(' • ') : '커뮤니티 멤버'
  }, [user])

  const customAdminBadge = useMemo(() => {
    if (!user || !user.badges || typeof user.badges !== 'object') return null
    const source = user.badges as Record<string, unknown>
    const raw = source['admin_custom']
    if (!raw || typeof raw !== 'object') return null
    const label = typeof (raw as any).label === 'string' ? (raw as any).label.trim() : ''
    const icon = typeof (raw as any).icon === 'string' ? (raw as any).icon.trim() : ''
    if (!label && !icon) return null
    return { label, icon }
  }, [user])

  const heroTags = useMemo(() => {
    if (!user) return []
    const tags: string[] = []

    if (user.visa_type) tags.push(`비자 ${user.visa_type}`)
    if (user.region) tags.push(user.region)
    if (user.company) tags.push(user.company)
    if (user.preferred_language)
      tags.push(`언어 ${String(user.preferred_language).toUpperCase()}`)
    if (user.years_in_korea) tags.push(`한국 ${user.years_in_korea}년차`)
    if (Array.isArray(user.interests)) {
      user.interests
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .slice(0, 3)
        .forEach((interest) => tags.push(`#${interest.trim()}`))
    }

    return Array.from(new Set(tags)).slice(0, 4)
  }, [user])

  const specialtyTags = useMemo(() => {
    if (!user) return []
    const sources = [
      Array.isArray(user.specialty_areas) ? user.specialty_areas : [],
      Array.isArray(user.interests) ? user.interests : [],
    ]
    return Array.from(
      new Set(
        sources
          .flat()
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map((item) => item.trim())
      )
    ).slice(0, 6)
  }, [user])

  const metricCards = useMemo(() => {
    if (!user) return []

    const answerCount =
      typeof user.answer_count === 'number' ? user.answer_count : activity.answers.length
    const helpfulCount =
      typeof user.helpful_answer_count === 'number'
        ? user.helpful_answer_count
        : activity.answers.reduce((sum, answer) => sum + (answer.helpful || 0), 0)
    const questionCount =
      typeof user.question_count === 'number' ? user.question_count : activity.questions.length

    const certificationValue = (() => {
      if (isAdminRole) return '플랫폼 관리자'
      if (isVerified) return 'Certified User'
      const status = (user.verification_status || '').toLowerCase()
      if (status === 'pending') return '인증 심사 중'
      if (status === 'rejected') return '인증 보류'
      return '일반 회원'
    })()

    const certificationHelper = (() => {
      if (isAdminRole) return '플랫폼 운영팀 계정'
      const type = (user.verification_type || '').toLowerCase()
      if (isVerified && type) {
        const labels: Record<string, string> = {
          work: '경력 인증',
          student: '유학생 인증',
          resident: '거주 인증',
          family: '가족 동반',
          business: '비즈니스 전문',
          mentor: '멘토 인증',
          specialist: '전문가 인증',
        }
        return labels[type] ?? `인증 유형: ${user.verification_type}`
      }
      return isVerified ? '커뮤니티 공식 인증 회원' : '인증 정보 미등록'
    })()

    const primaryTopic =
      specialtyTags[0] ||
      (heroTags.length > 0 ? heroTags[0] : null)

    const rankingBadge = (() => {
      if (helpfulCount >= 50) return 'Top 5%'
      if (helpfulCount >= 20) return 'Top 15%'
      if (helpfulCount >= 10) return 'Top 30%'
      if (helpfulCount >= 5) return 'Rising'
      return null
    })()

    const topicValue = primaryTopic ? primaryTopic.replace(/^#/, '') : '토픽 미설정'
    const additionalTopics =
      specialtyTags.slice(1).length > 0 ? ` · +${specialtyTags.slice(1).length}개` : ''
    const baseTopicHelper = specialtyTags.length
      ? `관심 토픽 ${specialtyTags.map((tag) => tag.replace(/^#/, '')).join(', ')}`
      : heroTags.length
        ? `활동 토픽 ${heroTags.join(', ')}`
        : '관심 토픽을 설정해보세요'
    const topicHelper = helpfulCount > 0
      ? `${baseTopicHelper} · 도움됨 ${formatNumber(helpfulCount)}회`
      : baseTopicHelper

    const activityValue = `답변 ${formatNumber(answerCount)}개`
    const activityHelper =
      answerCount > 0
        ? `도움됨 ${formatNumber(helpfulCount)}회 · 질문 ${formatNumber(questionCount)}건`
        : '아직 답변 활동이 없습니다'

    return [
      {
        key: 'certification',
        label: '인증 현황',
        value: certificationValue,
        helper: certificationHelper,
      },
      {
        key: 'topics',
        label: '대표 토픽',
        value: `${rankingBadge ? `${rankingBadge} · ` : ''}${topicValue}${additionalTopics}`,
        helper: topicHelper,
      },
      {
        key: 'activity',
        label: '활동 하이라이트',
        value: activityValue,
        helper: activityHelper,
      },
      {
        key: 'recent',
        label: '최근 활동',
        value: formatRelativeTime(user.last_active),
        helper: `가입일 ${formatDateKorean(user.created_at)}`,
      },
    ]
  }, [user, activity, isVerified, isAdminRole, specialtyTags, heroTags])

  const topAnswers = useMemo(() => {
    if (!activity.answers.length) return []
    return [...activity.answers]
      .sort((a, b) => {
        if (b.helpful !== a.helpful) return b.helpful - a.helpful
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      .slice(0, 3)
  }, [activity.answers])

  const topQuestions = useMemo(() => {
    if (!activity.questions.length) return []
    return [...activity.questions]
      .sort((a, b) => {
        if (b.answerCount !== a.answerCount) return b.answerCount - a.answerCount
        if (b.helpfulCount !== a.helpfulCount) return b.helpfulCount - a.helpfulCount
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      .slice(0, 3)
  }, [activity.questions])

  const handleShareProfile = () => {
    if (!user || typeof window === 'undefined') return
    const shareUrl = `${window.location.origin}/users/${user.id}`
    const shareTitle = `${user.name}님의 Viet K-Connect 프로필`

    if (navigator.share) {
      navigator
        .share({ title: shareTitle, url: shareUrl })
        .catch(() => {
          // 공유 취소는 무시합니다.
        })
      return
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => alert('프로필 링크를 복사했습니다.'))
        .catch(() => alert(`프로필 링크: ${shareUrl}`))
      return
    }

    alert(`프로필 링크: ${shareUrl}`)
  }

  if (loading) {
    return (
      <PageLayout variant="centered">
        <div className="section profile-loading notranslate" translate="no" suppressHydrationWarning>
          로딩 중...
        </div>
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
      <div className="profile-page">
        <div className="profile-main">
          <div className="profile-wrapper">
            <section className="profile-hero-card">
              <div className="profile-hero-main">
                <div className="profile-hero-avatar">
                  <img
                    src={user.avatar_url || DEFAULT_AVATAR_URL}
                    alt={`${user.name}의 프로필 이미지`}
                    loading="lazy"
                  />
                </div>
                <div className="profile-hero-text">
                  <div className="profile-name-row">
                    <h1 className="profile-name">{user.name}</h1>
                    {isVerified && <span className="profile-badge verified">✅ Certified User</span>}
                    {isAdminRole && <span className="profile-badge admin">👑 관리자</span>}
                    {customAdminBadge && (
                      <span className="profile-badge custom">
                        {customAdminBadge.icon && <span aria-hidden>{customAdminBadge.icon}</span>}
                        {customAdminBadge.label}
                      </span>
                    )}
                  </div>
                  <p className="profile-hero-subtitle">{heroSubtitle}</p>
                  {heroTags.length > 0 && (
                    <div className="profile-hero-tags">
                      {heroTags.map((tag) => (
                        <span key={tag} className="profile-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  {specialtyTags.length > 0 && (
                    <div className="profile-specialties">
                      {specialtyTags.map((tag) => (
                        <span key={tag} className="specialty-chip">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="profile-hero-actions">
                  {!isOwnProfile && (
                    <button
                      className={`profile-action-btn primary ${isFollowing ? 'following' : ''}`}
                      onClick={handleFollow}
                    >
                      {isFollowing ? '팔로잉' : '팔로우'}
                    </button>
                  )}
                  <button className="profile-action-btn ghost" onClick={handleShareProfile}>
                    공유
                  </button>
                </div>
              </div>
              <div className="profile-hero-meta">
                <div>
                  <span className="meta-label">최근 활동</span>
                  <span className="meta-value">{formatRelativeTime(user.last_active)}</span>
                </div>
                <div>
                  <span className="meta-label">가입일</span>
                  <span className="meta-value">{formatDateKorean(user.created_at)}</span>
                </div>
              </div>
            </section>

            <section className="profile-metrics-grid">
              {metricCards.map((metric) => (
                <div key={metric.key} className="metric-card">
                  <span className="metric-label">{metric.label}</span>
                  <span className="metric-value">{metric.value}</span>
                  {metric.helper && <span className="metric-helper">{metric.helper}</span>}
                </div>
              ))}
            </section>

            <section className="profile-highlight-section">
              <div className="highlight-column">
                <div className="highlight-header">
                  <h2>대표 답변</h2>
                  {activity.answers.length > 0 && (
                    <button className="highlight-link" onClick={() => setActiveTab('answers')}>
                      전체 보기
                    </button>
                  )}
                </div>
                {topAnswers.length === 0 ? (
                  <p className="highlight-empty">아직 대표 답변이 없습니다.</p>
                ) : (
                  topAnswers.map((answer) => (
                    <button
                      key={answer.id}
                      className="highlight-card"
                      onClick={() => router.push(`/questions/${answer.questionId}`)}
                    >
                      <div className="highlight-score">👍 {formatNumber(answer.helpful)}</div>
                      {answer.questionTitle && (
                        <h3 className="highlight-title">{answer.questionTitle}</h3>
                      )}
                      <p className="highlight-excerpt">{trimContent(answer.content, 160)}</p>
                      <span className="highlight-date">{formatRelativeTime(answer.createdAt)}</span>
                    </button>
                  ))
                )}
              </div>
              <div className="highlight-column">
                <div className="highlight-header">
                  <h2>대표 질문</h2>
                  {activity.questions.length > 0 && (
                    <button className="highlight-link" onClick={() => setActiveTab('questions')}>
                      전체 보기
                    </button>
                  )}
                </div>
                {topQuestions.length === 0 ? (
                  <p className="highlight-empty">작성한 질문이 아직 없습니다.</p>
                ) : (
                  topQuestions.map((question) => (
                    <button
                      key={question.id}
                      className="highlight-card"
                      onClick={() => router.push(`/questions/${question.id}`)}
                    >
                      <div className="highlight-score">🗳️ {formatNumber(question.votes)}</div>
                      <h3 className="highlight-title">{question.title}</h3>
                      <p className="highlight-excerpt">{trimContent(question.content, 160)}</p>
                      <div className="highlight-meta-row">
                        <span>답변 {formatNumber(question.answerCount)}개</span>
                        {typeof question.views === 'number' && (
                          <span>조회 {formatNumber(question.views)}회</span>
                        )}
                        <span>{formatRelativeTime(question.createdAt)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="profile-activity-section">
              <div className="profile-tabs">
                <button
                  className={`profile-tab ${activeTab === 'questions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('questions')}
                >
                  질문 ({formatNumber(activity.questions.length)})
                </button>
                <button
                  className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  정보글 ({formatNumber(activity.posts.length)})
                </button>
                <button
                  className={`profile-tab ${activeTab === 'answers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('answers')}
                >
                  답변 ({formatNumber(activity.answers.length)})
                </button>
              </div>
              <div className="profile-activity-body">
                {activeTab === 'questions' && (
                  <div className="activity-list">
                    {activity.questions.length === 0 ? (
                      <div className="activity-empty">작성한 질문이 없습니다</div>
                    ) : (
                      activity.questions.map((question) => {
                        const author =
                          question.author ??
                          (user
                            ? {
                                id: user.id,
                                name: user.name,
                                role: user.role,
                              }
                            : { id: userId, name: '커뮤니티 멤버' })

                        const stats =
                          question.answerCount > 0 ? (
                            <span>답변 {formatNumber(question.answerCount)}개</span>
                          ) : (
                            <span>아직 답변이 없어요</span>
                          )

                        const actionProps: FeedCardActionProps = {
                          targetType: 'question',
                          helpfulCount: question.helpfulCount,
                          isHelpful: question.isHelpful,
                          requireLogin: !isLoggedIn,
                          compact: true,
                          onLoginRequired: () =>
                            router.push(`/auth/login?redirectTo=/users/${userId}`),
                        }

                        return (
                          <div key={question.id} className="activity-card">
                            <FeedCard
                              id={question.id}
                              itemType="question"
                              title={question.title}
                              body={question.content}
                              href={`/questions/${question.id}`}
                              createdAt={question.createdAt}
                              topic={question.categoryName ?? undefined}
                              author={author}
                              stats={stats}
                              badge={
                                <StatusBadge resolved={question.status === 'resolved'} compact />
                              }
                              actionProps={actionProps}
                              showReportButton
                              onNavigate={(href) => router.push(href)}
                              onAuthorClick={(authorId) => router.push(`/users/${authorId}`)}
                            />
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {activeTab === 'posts' && (
                  <div className="activity-list">
                    {activity.posts.length === 0 ? (
                      <div className="activity-empty">작성한 정보글이 없습니다</div>
                    ) : (
                      activity.posts.map((post) => {
                        const author =
                          post.author ??
                          (user
                            ? {
                                id: user.id,
                                name: user.name,
                                role: user.role,
                              }
                            : { id: userId, name: '커뮤니티 멤버' })

                        const canManagePost = post.viewerCanManage ?? Boolean(isOwnProfile || viewerIsAdmin)

                        const actionProps: FeedCardActionProps = {
                          targetType: 'post',
                          helpfulCount: post.helpfulCount,
                          isHelpful: post.isHelpful,
                          requireLogin: !isLoggedIn,
                          compact: true,
                          onLoginRequired: () =>
                            router.push(`/auth/login?redirectTo=/users/${userId}`),
                        }

                        return (
                          <div key={post.id} className="activity-card">
                            <FeedCard
                              id={post.id}
                              itemType="post"
                              title={post.title}
                              body={post.content}
                              href={`/posts/${post.id}`}
                              createdAt={post.createdAt}
                              topic={post.categoryName ?? undefined}
                              author={author}
                              stats={
                                post.commentCount > 0 ? (
                                  <span>댓글 {formatNumber(post.commentCount)}개</span>
                                ) : null
                              }
                              actionProps={actionProps}
                              showReportButton
                              onNavigate={(href) => router.push(href)}
                              onAuthorClick={(authorId) => router.push(`/users/${authorId}`)}
                              ownerActions={
                                canManagePost
                                  ? {
                                      onEdit: () => handleEditPost(post.id),
                                      onDelete: () => handleDeletePost(post.id),
                                      isDeleting: pendingDeleteId === post.id,
                                    }
                                  : undefined
                              }
                            />
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {activeTab === 'answers' && (
                  <div className="activity-list">
                    {activity.answers.length === 0 ? (
                      <div className="activity-empty">작성한 답변이 없습니다</div>
                    ) : (
                      activity.answers.map((answer) => (
                        <button
                          key={answer.id}
                          className="activity-card answer-card"
                          onClick={() => router.push(`/questions/${answer.questionId}`)}
                        >
                          <div className="answer-card-score">👍 {formatNumber(answer.helpful)}</div>
                          {answer.questionTitle && (
                            <h3 className="answer-card-title">{answer.questionTitle}</h3>
                          )}
                          <p className="answer-card-excerpt">{trimContent(answer.content, 220)}</p>
                          <div className="answer-card-meta">
                            <span>{formatRelativeTime(answer.createdAt)}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
        <Sidebar showContent={false} />
      </div>

      <style jsx>{`
        .profile-page {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 2rem;
          width: 100%;
        }

        .profile-main {
          width: 100%;
        }

        .profile-wrapper {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .profile-hero-card {
          background: linear-gradient(180deg, rgba(86, 130, 239, 0.12) 0%, rgba(86, 130, 239, 0) 100%);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 18px 30px rgba(86, 130, 239, 0.12);
          position: relative;
          overflow: hidden;
        }

        .profile-hero-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(86, 130, 239, 0.25), transparent 55%);
          pointer-events: none;
        }

        .profile-hero-main {
          display: flex;
          gap: 1.75rem;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .profile-hero-avatar {
          width: 92px;
          height: 92px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(86, 130, 239, 0.6);
          box-shadow: 0 12px 20px rgba(86, 130, 239, 0.2);
          flex-shrink: 0;
        }

        .profile-hero-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-hero-text {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .profile-name-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .profile-name {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.02em;
          color: #111827;
        }

        .profile-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .profile-badge.verified {
          background: rgba(52, 211, 153, 0.18);
          color: #047857;
        }

        .profile-badge.admin {
          background: rgba(249, 115, 22, 0.18);
          color: #b45309;
        }

        .profile-badge.custom {
          background: rgba(129, 140, 248, 0.18);
          color: #4338ca;
        }

        .profile-hero-subtitle {
          font-size: 1rem;
          color: #374151;
          margin: 0;
        }

        .profile-hero-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .profile-tag {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          background: rgba(17, 24, 39, 0.06);
          color: #1f2937;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .profile-specialties {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .specialty-chip {
          background: rgba(86, 130, 239, 0.15);
          color: #1d4ed8;
          border-radius: 999px;
          padding: 0.3rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .profile-hero-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .profile-action-btn {
          height: 42px;
          padding: 0 1.4rem;
          border-radius: 999px;
          border: 1px solid rgba(86, 130, 239, 0.4);
          background: white;
          color: #1f2937;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease, color 0.2s ease;
        }

        .profile-action-btn.primary {
          background: #4f6de6;
          color: #fff;
          border-color: transparent;
          box-shadow: 0 14px 28px rgba(79, 109, 230, 0.25);
        }

        .profile-action-btn.primary.following {
          background: #e0e7ff;
          color: #1d4ed8;
        }

        .profile-action-btn.ghost {
          background: rgba(255, 255, 255, 0.85);
        }

        .profile-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(79, 109, 230, 0.18);
        }

        .profile-hero-meta {
          margin-top: 2rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(148, 163, 184, 0.3);
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          z-index: 1;
          position: relative;
        }

        .profile-hero-meta > div {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .meta-label {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .meta-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .profile-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          background: #fff;
          border-radius: 18px;
          padding: 1.5rem;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .metric-label {
          font-size: 0.85rem;
          color: #64748b;
        }

        .metric-value {
          font-size: 1.65rem;
          font-weight: 700;
          color: #111827;
        }

        .metric-helper {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .profile-highlight-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .highlight-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .highlight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .highlight-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .highlight-link {
          background: none;
          border: none;
          color: #4f6de6;
          font-weight: 600;
          cursor: pointer;
        }

        .highlight-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: left;
          background: #fff;
          border-radius: 16px;
          padding: 1.25rem;
          border: 1px solid rgba(148, 163, 184, 0.25);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .highlight-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
        }

        .highlight-score {
          font-size: 0.85rem;
          color: #1d4ed8;
          font-weight: 600;
        }

        .highlight-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .highlight-excerpt {
          font-size: 0.93rem;
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }

        .highlight-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          font-size: 0.82rem;
          color: #64748b;
        }

        .highlight-date {
          font-size: 0.82rem;
          color: #64748b;
        }

        .highlight-empty {
          font-size: 0.95rem;
          color: #94a3b8;
        }

        .profile-activity-section {
          background: #fff;
          border-radius: 20px;
          padding: 1.75rem;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
        }

        .profile-tabs {
          display: flex;
          gap: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .profile-tab {
          background: none;
          border: none;
          padding: 0.5rem 0;
          font-size: 0.98rem;
          color: #64748b;
          cursor: pointer;
          position: relative;
          font-weight: 600;
        }

        .profile-tab::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -0.75rem;
          width: 100%;
          height: 3px;
          border-radius: 999px;
          background: #4f6de6;
          opacity: 0;
          transform: translateY(4px);
          transition: all 0.2s ease;
        }

        .profile-tab.active {
          color: #1f2937;
        }

        .profile-tab.active::after {
          opacity: 1;
          transform: translateY(0);
        }

        .profile-activity-body {
          min-height: 320px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-card {
          background: #f8fafc;
          border-radius: 16px;
          padding: 1.2rem 1.3rem;
          border: 1px solid rgba(148, 163, 184, 0.2);
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          text-align: left;
        }

        .activity-card:hover {
          background: #fff;
          transform: translateY(-3px);
          box-shadow: 0 14px 24px rgba(148, 163, 184, 0.22);
        }

        .activity-empty {
          text-align: center;
          padding: 4rem 2rem;
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .answer-card {
          border: none;
          cursor: pointer;
        }

        .answer-card-score {
          font-size: 0.85rem;
          color: #1d4ed8;
          font-weight: 600;
        }

        .answer-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .answer-card-excerpt {
          font-size: 0.92rem;
          color: #4b5563;
          margin: 0.15rem 0 0.5rem;
          line-height: 1.6;
        }

        .answer-card-meta {
          font-size: 0.82rem;
          color: #64748b;
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

        @media (max-width: 1200px) {
          .profile-page {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 768px) {
          .profile-hero-card {
            padding: 1.5rem;
          }

          .profile-hero-main {
            flex-direction: column;
            align-items: flex-start;
          }

          .profile-hero-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .profile-action-btn {
            flex: 1;
            text-align: center;
          }

          .profile-metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .profile-highlight-section {
            grid-template-columns: 1fr;
          }

          .profile-tabs {
            gap: 1rem;
            overflow-x: auto;
          }
        }
      `}</style>
    </PageLayout>
  )
}

function formatNumber(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0'
  }
  return value.toLocaleString('ko-KR')
}

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return '정보 없음'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '정보 없음'

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / (1000 * 60))
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}개월 전`
  const years = Math.floor(days / 365)
  return `${years}년 전`
}

function formatDateKorean(dateString?: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function trimContent(text?: string | null, limit = 160): string {
  if (!text) return ''
  const plain = text.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim()
  if (plain.length <= limit) return plain
  return `${plain.slice(0, limit)}…`
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import BaseModal from '@/components/modals/BaseModal'
import FeedCard, { type FeedCardActionProps } from '@/components/feed/FeedCard'
import StatusBadge from '@/components/common/StatusBadge'
import { DEFAULT_AVATAR_URL } from '@/lib/constants/avatar'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  type ProfileUser,
  type UserActivity,
  type ActivityQuestion,
  type ActivityPost,
  type ActivityAnswer,
  mapQuestionActivity,
  mapPostActivity,
  mapAnswerActivity,
  mapToFeedCardAuthor,
} from '@/lib/profile/profile-utils'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const router = useRouter()
  const { user: authUser, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<ProfileUser | null>(null)
  const [activity, setActivity] = useState<UserActivity>({ questions: [], posts: [], answers: [] })
  const [activeTab, setActiveTab] = useState<'questions' | 'posts' | 'answers'>('questions')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setActiveTab('questions')
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (!authUser?.id || authLoading) return

    setLoading(true)
    setError(null)

    fetch(`/api/users/${authUser.id}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('프로필 정보를 불러오지 못했습니다.')
        }
        const json = await res.json().catch(() => null)
        const apiUser = json?.data?.user
        if (!apiUser) throw new Error('프로필 데이터를 찾을 수 없습니다.')

        setProfile({
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
          preferred_language: apiUser.preferred_language ?? null,
          last_active: apiUser.last_active ?? null,
          created_at: apiUser.created_at ?? null,
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

        setActivity({ questions: mappedQuestions, posts: mappedPosts, answers: mappedAnswers })
      })
      .catch((fetchError: unknown) => {
        console.error('[ProfileModal] failed to load profile', fetchError)
        setError((fetchError as Error)?.message ?? '프로필 정보를 불러오지 못했습니다.')
      })
      .finally(() => setLoading(false))
  }, [isOpen, authUser?.id, authLoading])

  const heroSubtitle = useMemo(() => {
    if (!profile) return '커뮤니티 멤버'
    if (typeof profile.bio === 'string' && profile.bio.trim().length > 0) {
      return profile.bio.trim()
    }

    const descriptors: string[] = []
    if (profile.company) descriptors.push(profile.company)
    if (profile.region) descriptors.push(profile.region)
    if (profile.visa_type) descriptors.push(`비자 ${profile.visa_type}`)
    if (profile.years_in_korea) descriptors.push(`한국 ${profile.years_in_korea}년차`)

    return descriptors.length > 0 ? descriptors.join(' • ') : '커뮤니티 멤버'
  }, [profile])

  const customAdminBadge = useMemo(() => {
    if (!profile || !profile.badges || typeof profile.badges !== 'object') return null
    const source = profile.badges as Record<string, unknown>
    const raw = source['admin_custom']
    if (!raw || typeof raw !== 'object') return null
    const label = typeof (raw as any).label === 'string' ? (raw as any).label.trim() : ''
    const icon = typeof (raw as any).icon === 'string' ? (raw as any).icon.trim() : ''
    if (!label && !icon) return null
    return { label, icon }
  }, [profile])

  const { isAdmin, isVerified } = useMemo(() => {
    if (!profile) return { isAdmin: false, isVerified: false }
    const normalized = (profile.role || '').toLowerCase()
    return {
      isAdmin: normalized === 'admin',
      isVerified: normalized === 'verified' || profile.verification_status === 'approved',
    }
  }, [profile])

  const metricCards = useMemo(() => {
    if (!profile) return []

    const answerCount =
      typeof profile.answer_count === 'number' ? profile.answer_count : activity.answers.length
    const helpfulCount =
      typeof profile.helpful_answer_count === 'number'
        ? profile.helpful_answer_count
        : activity.answers.reduce((sum, answer) => sum + (answer.helpful || 0), 0)
    const questionCount =
      typeof profile.question_count === 'number' ? profile.question_count : activity.questions.length

    const certificationValue = (() => {
      if (isAdmin) return '플랫폼 관리자'
      if (isVerified) return 'Certified User'
      const status = (profile.verification_status || '').toLowerCase()
      if (status === 'pending') return '인증 심사 중'
      if (status === 'rejected') return '인증 보류'
      return '일반 회원'
    })()

    const certificationHelper = (() => {
      if (isAdmin) return '플랫폼 운영팀 계정'
      const type = (profile.verification_type || '').toLowerCase()
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
        return labels[type] ?? `인증 유형: ${profile.verification_type}`
      }
      return isVerified ? '커뮤니티 공식 인증 회원' : '인증 정보 미등록'
    })()

    const specialtyList = Array.from(
      new Set(
        [
          ...(Array.isArray(profile.specialty_areas) ? profile.specialty_areas : []),
          ...(Array.isArray(profile.interests) ? profile.interests : []),
        ]
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map((item) => item.trim())
      )
    )
    const rankingBadge = (() => {
      if (helpfulCount >= 50) return 'Top 5%'
      if (helpfulCount >= 20) return 'Top 15%'
      if (helpfulCount >= 10) return 'Top 30%'
      if (helpfulCount >= 5) return 'Rising'
      return null
    })()

    const topicValue = specialtyList.length > 0 ? specialtyList[0] : '토픽 미설정'
    const baseTopicHelper =
      specialtyList.length > 1
        ? `관심 토픽 ${specialtyList.join(', ')}`
        : specialtyList.length === 1
          ? `관심 토픽 ${specialtyList[0]}`
          : '관심 토픽을 설정해보세요'
    const topicHelper =
      helpfulCount > 0
        ? `${baseTopicHelper} · 도움됨 ${formatNumber(helpfulCount)}회`
        : baseTopicHelper

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
        value: `${rankingBadge ? `${rankingBadge} · ` : ''}${topicValue}`,
        helper: topicHelper,
      },
      {
        key: 'activity',
        label: '활동 하이라이트',
        value: `답변 ${formatNumber(answerCount)}개`,
        helper:
          answerCount > 0
            ? `도움됨 ${formatNumber(helpfulCount)}회 · 질문 ${formatNumber(questionCount)}건`
            : '아직 답변 활동이 없습니다',
      },
    ]
  }, [profile, activity, isAdmin, isVerified])

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

  const topAnswers = useMemo(() => {
    if (!activity.answers.length) return []
    return [...activity.answers]
      .sort((a, b) => {
        if (b.helpful !== a.helpful) return b.helpful - a.helpful
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      .slice(0, 3)
  }, [activity.answers])

  const handleNavigateFullProfile = () => {
    if (!profile) return
    onClose()
    router.push(`/users/${profile.id}`)
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="내 프로필 미리보기"
      width="860px"
      maxWidth="95vw"
      borderRadius="24px"
      showCloseButton
    >
      <div className="profile-modal">
        {loading ? (
          <div className="profile-modal-loading">프로필을 불러오는 중...</div>
        ) : error ? (
          <div className="profile-modal-error">{error}</div>
        ) : !profile ? (
          <div className="profile-modal-error">로그인이 필요합니다.</div>
        ) : (
          <>
            <section className="profile-hero">
              <div className="profile-hero-left">
                <div className="profile-avatar">
                  <img
                    src={profile.avatar_url || DEFAULT_AVATAR_URL}
                    alt={`${profile.name}의 프로필 사진`}
                    loading="lazy"
                  />
                </div>
                <div className="profile-hero-text">
                  <div className="profile-hero-title">
                    <h2>{profile.name}</h2>
                    {isVerified && <span className="hero-badge">✅ Certified User</span>}
                    {isAdmin && <span className="hero-badge admin">👑 Admin</span>}
                    {customAdminBadge && (
                      <span className="hero-badge custom">
                        {customAdminBadge.icon && <span className="hero-badge-icon" aria-hidden>{customAdminBadge.icon}</span>}
                        {customAdminBadge.label}
                      </span>
                    )}
                  </div>
                  <p className="profile-hero-subtitle">{heroSubtitle}</p>
                  <div className="profile-hero-meta">
                    <span>최근 활동 {formatRelativeTime(profile.last_active)}</span>
                    <span>가입일 {formatDateKorean(profile.created_at)}</span>
                  </div>
                </div>
              </div>
              <button className="profile-hero-action" onClick={handleNavigateFullProfile}>
                전체 프로필 보기
              </button>
            </section>

            <section className="profile-metrics">
              {metricCards.map((metric) => (
                <div key={metric.key} className="metric-item">
                  <span className="metric-label">{metric.label}</span>
                  <span className="metric-value">{metric.value}</span>
                  {metric.helper && <span className="metric-helper">{metric.helper}</span>}
                </div>
              ))}
            </section>

            <section className="profile-activity">
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

              <div className="profile-tab-content">
                {activeTab === 'questions' && (
                  topQuestions.length === 0 ? (
                    <div className="empty">작성한 질문이 없습니다.</div>
                  ) : (
                    topQuestions.map((question) => {
                      const author =
                        question.author ??
                        mapToFeedCardAuthor({
                          id: profile.id,
                          name: profile.name,
                          role: profile.role,
                          avatar_url: profile.avatar_url,
                        })

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
                        compact: true,
                        requireLogin: false,
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
                            author={author ?? undefined}
                            stats={stats}
                            badge={<StatusBadge resolved={question.status === 'resolved'} compact />}
                            actionProps={actionProps}
                            showReportButton={false}
                            onNavigate={(href) => {
                              onClose()
                              router.push(href)
                            }}
                          />
                        </div>
                      )
                    })
                  )
                )}

                {activeTab === 'posts' && (
                  activity.posts.length === 0 ? (
                    <div className="empty">작성한 정보글이 없습니다.</div>
                  ) : (
                    activity.posts.slice(0, 3).map((post) => {
                      const author =
                        post.author ??
                        mapToFeedCardAuthor({
                          id: profile.id,
                          name: profile.name,
                          role: profile.role,
                          avatar_url: profile.avatar_url,
                        })

                      const actionProps: FeedCardActionProps = {
                        targetType: 'post',
                        helpfulCount: post.helpfulCount,
                        isHelpful: post.isHelpful,
                        compact: true,
                        requireLogin: false,
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
                            author={author ?? undefined}
                            stats={post.commentCount > 0 ? <span>댓글 {formatNumber(post.commentCount)}개</span> : null}
                            actionProps={actionProps}
                            showReportButton={false}
                            onNavigate={(href) => {
                              onClose()
                              router.push(href)
                            }}
                          />
                        </div>
                      )
                    })
                  )
                )}

                {activeTab === 'answers' && (
                  topAnswers.length === 0 ? (
                    <div className="empty">작성한 답변이 없습니다.</div>
                  ) : (
                    topAnswers.map((answer) => (
                      <button
                        key={answer.id}
                        className="answer-card"
                        onClick={() => {
                          onClose()
                          router.push(`/questions/${answer.questionId}`)
                        }}
                      >
                        <div className="answer-score">👍 {formatNumber(answer.helpful)}</div>
                        {answer.questionTitle && (
                          <h3 className="answer-title">{answer.questionTitle}</h3>
                        )}
                        <p className="answer-excerpt">{trimContent(answer.content, 180)}</p>
                        <span className="answer-meta">{formatRelativeTime(answer.createdAt)}</span>
                      </button>
                    ))
                  )
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <style jsx>{`
        .profile-modal {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .profile-modal-loading,
        .profile-modal-error,
        .empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #6b7280;
        }

        .profile-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          background: linear-gradient(120deg, rgba(79, 109, 230, 0.12), rgba(79, 109, 230, 0));
          border-radius: 16px;
          padding: 1.5rem;
        }

        .profile-hero-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(79, 109, 230, 0.35);
          flex-shrink: 0;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-hero-text {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .profile-hero-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .profile-hero-title h2 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 700;
          color: #111827;
        }

        .hero-badge {
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          background: rgba(52, 211, 153, 0.2);
          color: #047857;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .hero-badge.admin {
          background: rgba(251, 191, 36, 0.22);
          color: #b45309;
        }

        .hero-badge.custom {
          background: rgba(129, 140, 248, 0.18);
          color: #4338ca;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .hero-badge-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .profile-hero-subtitle {
          margin: 0;
          font-size: 0.95rem;
          color: #475569;
        }

        .profile-hero-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.82rem;
          color: #6b7280;
        }

        .profile-hero-action {
          border: none;
          background: #4f6de6;
          color: #fff;
          border-radius: 12px;
          padding: 0.6rem 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .profile-hero-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 18px rgba(79, 109, 230, 0.25);
        }

        .profile-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .metric-item {
          background: #f8fafc;
          border-radius: 14px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .metric-label {
          font-size: 0.8rem;
          color: #64748b;
        }

        .metric-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #111827;
        }

        .metric-helper {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .profile-activity {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .profile-tabs {
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }

        .profile-tab {
          background: none;
          border: none;
          padding: 0.4rem 0;
          font-size: 0.9rem;
          color: #64748b;
          cursor: pointer;
          position: relative;
          font-weight: 600;
        }

        .profile-tab::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -0.55rem;
          width: 100%;
          height: 2px;
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

        .profile-tab-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 420px;
          overflow-y: auto;
        }

        .activity-card {
          background: #f1f5f9;
          border-radius: 14px;
          padding: 1rem;
        }

        .answer-card {
          text-align: left;
          border: 1px solid transparent;
          background: #f8fafc;
          border-radius: 14px;
          padding: 1rem;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border 0.15s ease;
        }

        .answer-card:hover {
          transform: translateY(-2px);
          border-color: rgba(79, 109, 230, 0.3);
          box-shadow: 0 12px 24px rgba(79, 109, 230, 0.18);
        }

        .answer-score {
          font-size: 0.8rem;
          color: #1d4ed8;
          font-weight: 600;
        }

        .answer-title {
          margin: 0.35rem 0;
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
        }

        .answer-excerpt {
          margin: 0;
          font-size: 0.88rem;
          color: #475569;
          line-height: 1.5;
        }

        .answer-meta {
          display: block;
          margin-top: 0.35rem;
          font-size: 0.78rem;
          color: #94a3b8;
        }

        @media (max-width: 640px) {
          .profile-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .profile-hero-action {
            width: 100%;
          }
        }
      `}</style>
    </BaseModal>
  )
}

function formatNumber(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0'
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
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function trimContent(text?: string | null, limit = 160): string {
  if (!text) return ''
  const plain = text.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim()
  if (plain.length <= limit) return plain
  return `${plain.slice(0, limit)}…`
}

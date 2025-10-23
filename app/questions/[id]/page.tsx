'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import ActionBar from '@/components/common/ActionBar'
import PageLayout from '@/components/layout/PageLayout'
import RichEditor from '@/components/editor/RichEditor'
import { EDITOR_USAGE_GUIDE } from '@/lib/constants/editor'
import { notifyAnswerAccepted } from '@/lib/utils/notification-manager'
import CertificationPromptModal from '@/components/modals/CertificationPromptModal'

type QuestionDisplay = {
  id: string
  title: string
  content: string
  createdAt: string
  answerCount: number
  viewCount: number
  helpfulCount: number
  isHelpfulByViewer: boolean
  author: {
    id: string | null
    name: string
    role: string | null
  }
  categoryName?: string | null
}

type AnswerItem = {
  id: string
  content: string
  createdAt: string
  helpfulCount: number
  upvoteCount: number
  isAccepted: boolean
  isHelpfulByViewer: boolean
  author: {
    id: string | null
    name: string
    role: string | null
    visaType?: string | null
    yearsInKorea?: number | null
  }
  isExpert: boolean
}

const MIN_ANSWER_LENGTH = 10
const CERT_PROMPT_STORAGE_KEY = 'certification_prompt_data'
const ANSWER_COUNT_STORAGE_KEY = 'user_answer_count'

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params.id as string
  const { isLoggedIn, user } = useAuth()
  const isAuthenticated = isLoggedIn

  const [question, setQuestion] = useState<QuestionDisplay | null>(null)
  const [answers, setAnswers] = useState<AnswerItem[]>([])
  const [activeHelpfulAnswerIds, setActiveHelpfulAnswerIds] = useState<Set<string>>(new Set())
  const [acceptedAnswerId, setAcceptedAnswerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [answerText, setAnswerText] = useState('')
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)
  const [showCertificationModal, setShowCertificationModal] = useState(false)
  const [certificationTrigger, setCertificationTrigger] = useState<'first_answer' | 'third_answer' | 'manual'>('first_answer')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let ignore = false

    const loadQuestion = async () => {
      if (!questionId) return
      setLoading(true)

      try {
        const response = await fetch(`/api/questions/${questionId}`, {
          cache: 'no-store',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`질문을 불러오지 못했습니다. (${response.status})`)
        }

        const payload = await response.json().catch(() => null)
        if (ignore) return

        const apiQuestion = payload?.question
        const apiAnswers: any[] = Array.isArray(payload?.answers) ? payload.answers : []

        if (apiQuestion) {
          setQuestion({
            id: apiQuestion.id,
            title: apiQuestion.title ?? '제목 없음',
            content: apiQuestion.content ?? '',
            createdAt: apiQuestion.created_at ?? new Date().toISOString(),
            answerCount: Number(apiQuestion.answer_count ?? apiAnswers.length ?? 0),
            viewCount: Number(apiQuestion.view_count ?? 0),
            helpfulCount: Number(apiQuestion.helpful_count ?? 0),
            isHelpfulByViewer: Boolean(apiQuestion.is_helpful_by_viewer),
            author: {
              id: apiQuestion.author?.id ?? null,
              name: apiQuestion.author?.name ?? '작성자',
              role: apiQuestion.author?.role ?? null,
            },
            categoryName: apiQuestion.category?.name ?? null,
          })
        } else {
          setQuestion(null)
        }

        const normalizedAnswers = apiAnswers.map(mapApiAnswerToItem)
        setAnswers(normalizedAnswers)
        setAcceptedAnswerId(normalizedAnswers.find((answer) => answer.isAccepted)?.id ?? null)

        if (isAuthenticated) {
          await refreshAnswerHelpfulStates(normalizedAnswers)
        } else {
          setActiveHelpfulAnswerIds(new Set())
        }
      } catch (error) {
        console.error('[QuestionDetail] failed to load question', error)
        if (!ignore) {
          setQuestion(null)
          setAnswers([])
          setAcceptedAnswerId(null)
          setActiveHelpfulAnswerIds(new Set())
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadQuestion()

    return () => {
      ignore = true
    }
  }, [questionId, isAuthenticated, reloadToken])

  const refreshAnswerHelpfulStates = async (items: AnswerItem[]) => {
    if (!isAuthenticated || items.length === 0) {
      setActiveHelpfulAnswerIds(new Set())
      setAnswers((prev) =>
        prev.map((answer) => ({
          ...answer,
          isHelpfulByViewer: false,
        }))
      )
      return
    }

    try {
      const voteStatuses = await Promise.all(
        items.map(async (answer) => {
          try {
            const res = await fetch(`/api/answers/${answer.id}/vote/status`, {
              cache: 'no-store',
              credentials: 'include',
            })
            if (!res.ok) return { id: answer.id, isHelpful: false }
            const json = await res.json().catch(() => null)
            return {
              id: answer.id,
              isHelpful: json?.data?.user_vote === 'helpful',
            }
          } catch {
            return { id: answer.id, isHelpful: false }
          }
        })
      )

      const helpfulIds = new Set<string>()
      voteStatuses.forEach(({ id, isHelpful }) => {
        if (isHelpful) helpfulIds.add(id)
      })

      setActiveHelpfulAnswerIds(helpfulIds)
      setAnswers((prev) =>
        prev.map((answer) => ({
          ...answer,
          isHelpfulByViewer: helpfulIds.has(answer.id),
        }))
      )
    } catch (error) {
      console.error('[QuestionDetail] failed to refresh answer vote states', error)
    }
  }

  const sortedAnswers = useMemo(() => {
    return [...answers].sort((a, b) => {
      if (a.isAccepted !== b.isAccepted) return a.isAccepted ? -1 : 1
      if (a.isExpert !== b.isExpert) return a.isExpert ? -1 : 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [answers])

  const charCountNeeded = Math.max(0, MIN_ANSWER_LENGTH - answerText.trim().length)

  const reloadQuestion = () => setReloadToken((prev) => prev + 1)

  const handleQuestionHelpfulToggle = async () => {
    if (!question) return
    const response = await fetch(`/api/questions/${questionId}/helpful`, {
      method: 'POST',
      cache: 'no-store',
      credentials: 'include',
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const message = data?.error || '도움됨 처리 중 오류가 발생했습니다.'
      throw new Error(message)
    }

    const helpfulCount = typeof data?.helpfulCount === 'number' ? data.helpfulCount : question.helpfulCount
    const isHelpful = typeof data?.isHelpful === 'boolean' ? data.isHelpful : !question.isHelpfulByViewer

    setQuestion((prev) =>
      prev
        ? {
            ...prev,
            helpfulCount: helpfulCount,
            isHelpfulByViewer: isHelpful,
          }
        : prev
    )

    return {
      helpfulCount,
      isHelpful,
    }
  }

  const handleToggleAnswerHelpful = async (answerId: string) => {
    const response = await fetch(`/api/answers/${answerId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ vote_type: 'helpful' }),
    })
    const json = await response.json().catch(() => null)

    if (!response.ok) {
      const message = json?.error || '도움됨 처리 중 오류가 발생했습니다.'
      throw new Error(message)
    }

    const data = json?.data ?? {}
    const helpfulCount = Number(data?.helpful_count ?? 0)
    const isHelpful = data?.vote_type === 'helpful'

    setAnswers((prev) =>
      prev.map((answer) =>
        answer.id === answerId
          ? {
              ...answer,
              helpfulCount,
              isHelpfulByViewer: isHelpful,
            }
          : answer
      )
    )

    setActiveHelpfulAnswerIds((prev) => {
      const next = new Set(prev)
      if (isHelpful) next.add(answerId)
      else next.delete(answerId)
      return next
    })

    return { helpfulCount, isHelpful }
  }

  const handleSubmitAnswer = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirectTo=/questions/${questionId}`)
      return
    }

    const trimmed = answerText.trim()
    if (trimmed.length < MIN_ANSWER_LENGTH) {
      alert(`답변은 최소 ${MIN_ANSWER_LENGTH}자 이상 작성해주세요.`)
      return
    }

    setIsSubmittingAnswer(true)

    try {
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: trimmed }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        const message = payload?.error || '답변 등록 중 오류가 발생했습니다.'
        const details = payload?.details
        alert(details ? `${message}\n세부 정보: ${details}` : message)
        return
      }

      setAnswerText('')
      const newAnswerCount = incrementAnswerCount()
      if (shouldShowCertificationPrompt(newAnswerCount)) {
        const trigger = newAnswerCount === 1 ? 'first_answer' : 'third_answer'
        setCertificationTrigger(trigger)
        setShowCertificationModal(true)
      } else {
        alert('답변이 등록되었습니다!')
      }

      reloadQuestion()
    } catch (error) {
      console.error('[QuestionDetail] answer submit failed', error)
      alert('답변 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSubmittingAnswer(false)
    }
  }

  const handleAcceptAnswer = async (answerId: string) => {
    if (!isAuthenticated || !user) {
      alert('로그인이 필요합니다')
      return
    }

    if (!question) {
      alert('질문 정보를 찾을 수 없습니다.')
      return
    }

    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'POST',
        credentials: 'include',
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        const message = payload?.error || '답변을 채택하지 못했습니다.'
        alert(message)
        return
      }

      setAcceptedAnswerId(answerId)
      setAnswers((prev) =>
        prev.map((answer) => ({
          ...answer,
          isAccepted: answer.id === answerId,
        }))
      )
      const acceptedAnswer = answers.find((answer) => answer.id === answerId)
      if (acceptedAnswer?.author?.id) {
        notifyAnswerAccepted({
          targetUserId: acceptedAnswer.author.id,
          questionId,
          answerId,
          questionTitle: question.title
        })
      }
      alert('답변이 채택되었습니다! 🎉')
      reloadQuestion()
    } catch (error) {
      console.error('[QuestionDetail] accept answer failed', error)
      alert('답변을 채택하지 못했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const sortedAnswerList = sortedAnswers
  const answerCountLabel = sortedAnswerList.length

  if (loading) {
    return (
      <PageLayout variant="centered">
        <div className="loading-container">
          <div>로딩 중...</div>
        </div>
      </PageLayout>
    )
  }

  if (!question) {
    return (
      <PageLayout variant="centered">
        <div className="error-container">
          <h1 className="error-title">질문을 찾을 수 없습니다</h1>
          <a href="/" className="btn-primary error-btn">홈으로 돌아가기</a>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="withSidebar">
    <div className="question-detail-page">
      <div className="question-detail-header">
          <span className="back-link" onClick={() => router.back()}>
            ← 목록으로
          </span>

        <div className="question-detail-meta">
            <span>{question.categoryName ?? '카테고리 없음'}</span>
            <span>•</span>
            <span>{new Date(question.createdAt).toLocaleDateString('ko-KR')}</span>
            <span>•</span>
            <span>조회 {question.viewCount.toLocaleString()}회</span>
          </div>
        </div>

      <div className="question-detail-title-block">
        <h1 className="question-detail-title">{question.title}</h1>
        <div className="question-detail-author">
          <div className="author-avatar" aria-hidden="true"></div>
            <div>
            <div className="author-name">{question.author.name}</div>
            <div className="author-role">{question.author.role ?? '일반 회원'}</div>
            </div>
          </div>
        </div>

      <div className="question-content-card question-card">
        <div className="question-detail-content">
            {question.content}
          </div>

          <ActionBar
            targetId={question.id}
            targetType="question"
            title={question.title}
            content={question.content}
            url={`/questions/${question.id}`}
            helpfulCount={question.helpfulCount}
            isHelpful={question.isHelpfulByViewer}
            onHelpfulClick={handleQuestionHelpfulToggle}
            compact
            requireLogin={!isAuthenticated}
            onLoginRequired={() => router.push(`/auth/login?redirectTo=/questions/${questionId}`)}
          />
        </div>

        {!isAuthenticated ? (
          <div className="answer-form answer-form-login-compact">
            <div className="answer-form-compact-content">
              <div className="answer-form-icon-small">💬</div>
              <div className="answer-form-text">
                <h3 className="answer-form-title-compact">이 질문에 답변해보세요</h3>
                <p className="answer-form-subtitle-compact">
                  인증된 Certified User가 되어 커뮤니티에 기여하세요
                </p>
              </div>
              <button
                onClick={() => router.push(`/auth/login?redirectTo=/questions/${questionId}`)}
                className="google-login-btn-compact"
              >
                <span className="google-icon-small"></span>
                Google로 계속하기
              </button>
            </div>
          </div>
        ) : (
          <div className="answer-form">
            <h3 className="form-title">답변 작성하기</h3>

            <RichEditor
              value={answerText}
              onChange={setAnswerText}
              minRows={10}
              maxLength={10000}
              placeholder="답변의 지식을 공유해 보세요."
              helperText={EDITOR_USAGE_GUIDE}
            />

            <div className="char-count">
              {answerText.trim().length >= MIN_ANSWER_LENGTH
                ? `${answerText.trim().length}글자`
                : `${charCountNeeded}글자 더 써주세요.`}
            </div>

            <div className="answer-form-footer">
              <div className="answer-count-info">
                <span>🅰️</span>
                <span>{sortedAnswerList.length}개의 답변이 있어요!</span>
              </div>
              <button
                onClick={handleSubmitAnswer}
                disabled={answerText.trim().length < MIN_ANSWER_LENGTH || isSubmittingAnswer}
                className="submit-btn"
              >
                {isSubmittingAnswer ? '등록 중...' : '답변 등록'}
              </button>
            </div>
          </div>
        )}

        <div className="answers-section">
          <h2 className="section-title">
            답변 <span className="section-title-count">{answerCountLabel}</span>개
          </h2>

          <div id="answers-container">
            {sortedAnswerList.map((answer) => (
              <div
                key={answer.id}
                className={`answer-card ${answer.isExpert ? 'expert-answer' : ''} ${acceptedAnswerId === answer.id ? 'accepted-answer' : ''}`}
                id={`answer-${answer.id}`}
              >
                {acceptedAnswerId === answer.id && (
                  <div className="accepted-badge-corner">
                    <span className="accepted-badge-icon">✅</span>
                    채택된 답변
                  </div>
                )}
                {answer.isExpert && acceptedAnswerId !== answer.id && (
                  <div className="expert-badge-corner">
                    <span className="expert-badge-icon">✨</span>
                    Certified User 답변
                  </div>
                )}

                <div className="author-info">
                  <div className="author-avatar-small"></div>
                  <div className="author-details">
                    <div className="author-name-row">
                      <h3 className="author-name">{answer.author.name}</h3>
                      {answer.isExpert && (
                        <span className="expert-badge-inline" style={{ color: '#2563eb', background: 'transparent' }}>
                          <span style={{ color: '#84cc16' }}>✅</span> Certified User <span style={{ fontWeight: 700 }}>인증 완료</span>
                        </span>
                      )}
                    </div>
                    <p className="author-meta">
                      {answer.author.role || '일반 회원'} • {new Date(answer.createdAt).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="answer-content">
                  {answer.content}
                </div>

                <ActionBar
                  targetId={answer.id}
                  targetType="answer"
                  title={`${question.title}의 답변`}
                  content={answer.content}
                  url={`/questions/${questionId}#answer-${answer.id}`}
                  helpfulCount={answer.helpfulCount}
                  isHelpful={activeHelpfulAnswerIds.has(answer.id)}
                  onHelpfulClick={() => handleToggleAnswerHelpful(answer.id)}
                  compact
                  showAcceptButton={isAuthenticated && !acceptedAnswerId}
                  onAcceptClick={() => handleAcceptAnswer(answer.id)}
                  isAccepted={acceptedAnswerId === answer.id}
                  requireLogin={!isAuthenticated}
                  onLoginRequired={() => router.push(`/auth/login?redirectTo=/questions/${questionId}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <CertificationPromptModal
        isOpen={showCertificationModal}
        onClose={() => {
          setShowCertificationModal(false)
          alert('답변이 등록되었습니다!')
        }}
        trigger={certificationTrigger}
      />
    </PageLayout>
  )
}

function mapApiAnswerToItem(raw: any): AnswerItem {
  const author = raw?.author ?? {}
  const badges = typeof author?.badges === 'object' && author?.badges !== null ? author.badges : {}
  const role = typeof author?.role === 'string' ? author.role : null
  const isExpert =
    Boolean(
      (typeof role === 'string' && role.toLowerCase() === 'verified') ||
        badges?.verified ||
        badges?.expert
    )

  return {
    id: String(raw?.id ?? ''),
    content: raw?.content ?? '',
    createdAt: raw?.created_at ?? new Date().toISOString(),
    helpfulCount: Number(raw?.helpful_count ?? 0),
    upvoteCount: Number(raw?.upvote_count ?? 0),
    isAccepted: Boolean(raw?.is_accepted),
    isHelpfulByViewer: false,
    author: {
      id: author?.id ?? null,
      name: author?.name ?? '사용자',
      role,
      visaType: author?.visa_type ?? null,
      yearsInKorea: author?.years_in_korea ?? null,
    },
    isExpert,
  }
}

function shouldShowCertificationPrompt(answerCount: number): boolean {
  if (typeof window === 'undefined') return false

  const mockUser = JSON.parse(localStorage.getItem('mock_user') || '{}')
  if (mockUser.role === 'VERIFIED' || mockUser.role === 'ADMIN' || mockUser.is_certified) {
    return false
  }

  if (answerCount !== 1) {
    return false
  }

  const promptDataRaw = localStorage.getItem(CERT_PROMPT_STORAGE_KEY)
  if (!promptDataRaw) {
    return true
  }

  try {
    const data = JSON.parse(promptDataRaw)
    if (data?.completed) {
      return false
    }
    if (data?.dismissed) {
      return false
    }
    if (data?.status === 'applied' || data?.status === 'dismissed') {
      return false
    }
  } catch (error) {
    console.warn('[QuestionDetail] failed to parse certification prompt data', error)
    return true
  }

  return true
}

function incrementAnswerCount(): number {
  if (typeof window === 'undefined') return 0

  const currentRaw = localStorage.getItem(ANSWER_COUNT_STORAGE_KEY)
  const current = currentRaw ? parseInt(currentRaw, 10) : 0
  const next = Number.isFinite(current) ? current + 1 : 1
  localStorage.setItem(ANSWER_COUNT_STORAGE_KEY, String(next))

  try {
    const existingRaw = localStorage.getItem(CERT_PROMPT_STORAGE_KEY)
    const existing = existingRaw ? JSON.parse(existingRaw) : {}
    const updated = {
      ...existing,
      count: next,
      last_count: next,
      last_triggered_at: new Date().toISOString(),
    }
    localStorage.setItem(CERT_PROMPT_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.warn('[QuestionDetail] failed to update certification prompt metadata', error)
  }

  return next
}

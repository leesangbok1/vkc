'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import ActionBar from '@/components/common/ActionBar'
import Sidebar from '@/components/layout/Sidebar'
import { MOCK_QUESTIONS, MOCK_ANSWERS, getAnswersByQuestionId, type Question, type Answer } from '@/lib/data/mockData'
import { notifyAnswerAccepted } from '@/lib/utils/notification-manager'
import CertificationPromptModal from '@/components/modals/CertificationPromptModal'

// Type for adapted question that combines API and mock data formats
interface QuestionDisplay {
  id: string
  title: string
  content: string
  author: {
    name: string
    role?: string
  }
  view_count: number
  upvote_count: number
  answer_count: number
  created_at: string
}

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params.id as string
  const { isLoggedIn, user } = useAuth()
  const isAuthenticated = isLoggedIn

  const [question, setQuestion] = useState<QuestionDisplay | null>(null)
  const [loading, setLoading] = useState(true)
  const [answerText, setAnswerText] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [activeVotes, setActiveVotes] = useState<Set<string>>(new Set())
  const [acceptedAnswerId, setAcceptedAnswerId] = useState<string | null>(null)
  const [showCertificationModal, setShowCertificationModal] = useState(false)
  const [certificationTrigger, setCertificationTrigger] = useState<'first_answer' | 'third_answer' | 'manual'>('first_answer')

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/questions/${questionId}`)
        if (response.ok) {
          const data = await response.json()
          setQuestion(data.question)

          // Get answers for this question from centralized mock data
          const questionAnswers = getAnswersByQuestionId(questionId)
          setAnswers(questionAnswers)
        } else {
          // API 실패 시 중앙집중식 Mock 데이터 사용
          const mockQuestion = MOCK_QUESTIONS.find(q => q.id === questionId)
          if (mockQuestion) {
            // Adapt Question type to match expected format
            setQuestion({
              id: mockQuestion.id,
              title: mockQuestion.title,
              content: mockQuestion.content,
              author: mockQuestion.author,
              view_count: mockQuestion.views,
              upvote_count: mockQuestion.votes,
              answer_count: mockQuestion.answerCount,
              created_at: mockQuestion.createdAt
            })

            // Get answers for this question from centralized mock data
            const questionAnswers = getAnswersByQuestionId(questionId)
            setAnswers(questionAnswers)
          } else {
            console.error('Question not found in mock data:', questionId)
          }
        }
      } catch (error) {
        console.error('Failed to fetch question:', error)
        // 에러 발생 시에도 중앙집중식 Mock 데이터 사용
        const mockQuestion = MOCK_QUESTIONS.find(q => q.id === questionId)
        if (mockQuestion) {
          setQuestion({
            id: mockQuestion.id,
            title: mockQuestion.title,
            content: mockQuestion.content,
            author: mockQuestion.author,
            view_count: mockQuestion.views,
            upvote_count: mockQuestion.votes,
            answer_count: mockQuestion.answerCount,
            created_at: mockQuestion.createdAt
          })

          // Get answers for this question from centralized mock data
          const questionAnswers = getAnswersByQuestionId(questionId)
          setAnswers(questionAnswers)
        } else {
          console.error('Question not found in mock data:', questionId)
        }
      } finally {
        setLoading(false)
      }
    }

    if (questionId) {
      fetchQuestion()
    }
  }, [questionId])

  // 답변 정렬 함수 - 항상 Certified User 우선
  const sortAnswers = (answersToSort: Answer[]) => {
    const sorted = [...answersToSort].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime()
      const bTime = new Date(b.createdAt).getTime()

      // Certified User 답변은 항상 위로
      if (a.isExpert && !b.isExpert) return -1
      if (!a.isExpert && b.isExpert) return 1

      // 같은 그룹 내에서는 최신순
      return bTime - aTime
    })
    return sorted
  }

  // Check if user should see certification prompt
  const shouldShowCertificationPrompt = (answerCount: number): boolean => {
    // Don't show if user is already certified
    const mockUser = JSON.parse(localStorage.getItem('mock_user') || '{}')
    if (mockUser.role === 'VERIFIED' || mockUser.role === 'ADMIN' || mockUser.is_certified) {
      return false
    }

    // Check 24-hour cooldown
    const promptData = localStorage.getItem('certification_prompt_data')
    if (promptData) {
      const data = JSON.parse(promptData)
      const lastShown = new Date(data.last_shown)
      const now = new Date()
      const hoursSinceLastShown = (now.getTime() - lastShown.getTime()) / (1000 * 60 * 60)

      // Don't show if shown within 24 hours
      if (hoursSinceLastShown < 24) {
        return false
      }
    }

    // Show on 1st or 3rd answer
    return answerCount === 1 || answerCount === 3
  }

  // Get user's total answer count
  const getUserAnswerCount = (): number => {
    const answerCount = localStorage.getItem('user_answer_count')
    return answerCount ? parseInt(answerCount) : 0
  }

  // Increment user's answer count
  const incrementAnswerCount = (): number => {
    const currentCount = getUserAnswerCount()
    const newCount = currentCount + 1
    localStorage.setItem('user_answer_count', newCount.toString())
    return newCount
  }

  // 투표 토글
  const toggleHelpful = (answerId: string) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirectTo=/questions/${questionId}`)
      return
    }
    setAnswers(prev => prev.map(answer => {
      if (answer.id === answerId) {
        const isActive = activeVotes.has(answerId)
        const newVotes = new Set(activeVotes)

        if (isActive) {
          newVotes.delete(answerId)
          setActiveVotes(newVotes)
          return { ...answer, helpful: answer.helpful - 1 }
        } else {
          newVotes.add(answerId)
          setActiveVotes(newVotes)
          return { ...answer, helpful: answer.helpful + 1 }
        }
      }
      return answer
    }))
  }

  // 답변 제출
  const handleSubmitAnswer = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirectTo=/questions/${questionId}`)
      return
    }

    if (answerText.trim().length < 55) {
      alert('답변은 최소 10자 이상 작성해주세요')
      return
    }

    const newAnswer: Answer = {
      id: `answer-${Date.now()}`,
      questionId: questionId,
      content: answerText.trim(),
      author: {
        id: user?.id || 'current-user',
        name: user?.name || '나의 답변',
        role: user?.role || 'user',
        avatar: user?.name?.[0] || '나'
      },
      isExpert: user?.role === 'VERIFIED' || user?.role === 'ADMIN',
      createdAt: new Date().toISOString(),
      helpful: 0,
      commentCount: 0
    }

    setAnswers(prev => [...prev, newAnswer])
    setAnswerText('')

    // Increment answer count and check if certification prompt should show
    const newAnswerCount = incrementAnswerCount()

    if (shouldShowCertificationPrompt(newAnswerCount)) {
      // Determine trigger type
      const trigger = newAnswerCount === 1 ? 'first_answer' : 'third_answer'
      setCertificationTrigger(trigger)
      setShowCertificationModal(true)
    } else {
      alert('답변이 등록되었습니다!')
    }
  }

  // 답변 채택
  const handleAcceptAnswer = (answerId: string) => {
    if (!isAuthenticated || !user) {
      alert('로그인이 필요합니다')
      return
    }

    // Check if current user is the question author
    // For mock, we'll allow any logged-in user to accept
    const confirmed = window.confirm('이 답변을 채택하시겠습니까? 채택 후에는 변경할 수 없습니다.')

    if (confirmed) {
      setAcceptedAnswerId(answerId)

      // Save to localStorage
      localStorage.setItem(`question_${questionId}_accepted_answer`, answerId)

      // Update question status to resolved
      const questionsKey = 'mock_questions'
      const questions = JSON.parse(localStorage.getItem(questionsKey) || '[]')
      const updatedQuestions = questions.map((q: any) => {
        if (q.id === questionId) {
          return { ...q, status: 'resolved', accepted_answer_id: answerId }
        }
        return q
      })
      localStorage.setItem(questionsKey, JSON.stringify(updatedQuestions))

      // Send notification to answer author
      if (question) {
        notifyAnswerAccepted(questionId, answerId, question.title)
      }

      alert('답변이 채택되었습니다! 🎉')
    }
  }

  const sortedAnswers = sortAnswers(answers)
  const charCountNeeded = Math.max(0, 55 - answerText.length)

  if (loading) {
    return (
      <div className="main-layout loading-container">
        <div>로딩 중...</div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="main-layout error-container">
        <h1 className="error-title">질문을 찾을 수 없습니다</h1>
        <a href="/" className="btn-primary error-btn">
          홈으로 돌아가기
        </a>
      </div>
    )
  }

  return (
    <main className="main-layout">
      <div className="container">
        <div className="main-content">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <a href="/" className="breadcrumb-link">홈</a>
            <span>›</span>
            <a href="/" className="breadcrumb-link">질문</a>
            <span>›</span>
            <span>비자</span>
          </nav>

          {/* Question Header */}
          <div className="question-header">
            <h1 className="question-title">
              {question.title}
            </h1>
            <div className="question-meta">
              <span className="question-tag">
                비자
              </span>
              <span className="question-stats">
                답변 {answers.length}개
              </span>
            </div>
          </div>

          {/* Question Card */}
          <div className="question-detail-card">
            <div className="author-info">
              <div className="author-avatar-small"></div>
              <div className="author-details">
                <h3>{question.author?.name || '익명'}</h3>
                <p>
                  {question.created_at ? new Date(question.created_at).toLocaleDateString('ko-KR') : '날짜 미상'}
                </p>
              </div>
            </div>

            <div className="question-content">
              {question.content}
            </div>

            <ActionBar
              targetId={questionId}
              targetType="question"
              title={question.title}
              content={question.content}
              url={`/questions/${questionId}`}
              compact={true}
              requireLogin={!isAuthenticated}
              onLoginRequired={() => router.push(`/auth/login?redirectTo=/questions/${questionId}`)}
            />
          </div>

          {/* Answer Form */}
          {!isAuthenticated ? (
            <div className="answer-form answer-form-login-compact">
              <div className="answer-form-compact-content">
                <div className="answer-form-icon-small">💬</div>
                <div className="answer-form-text">
                  <h3 className="answer-form-title-compact">
                    이 질문에 답변해보세요
                  </h3>
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

            <div className="editor-container">
              <div className="editor-toolbar">
                <button type="button" className="toolbar-btn" title="굵게">B</button>
                <button type="button" className="toolbar-btn" title="목록">☰</button>
                <button type="button" className="toolbar-btn" title="이미지">🖼️</button>
              </div>
              <div className="editor-textarea-container">
                <textarea
                  className="editor-textarea"
                  placeholder="답변의 지식을 공유해 보세요."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                />
              </div>
            </div>

            <div className="char-count">
              {answerText.length >= 55 ? `${answerText.length}글자` : `${charCountNeeded}글자 더 써주세요.`}
            </div>

            <div className="answer-form-footer">
              <div className="answer-count-info">
                <span>🅰️</span>
                <span>{answers.length}개의 답변이 있어요!</span>
              </div>
              <button
                onClick={handleSubmitAnswer}
                disabled={answerText.length < 55}
                className="submit-btn"
              >
                답변하기
              </button>
            </div>
          </div>
          )}

          {/* Answers Section */}
          <div className="answers-section">
            <h2 className="section-title">
              답변 <span className="section-title-count">{answers.length}</span>개
            </h2>

            <div id="answers-container">
              {sortedAnswers.map((answer) => (
                <div
                  key={answer.id}
                  className={`answer-card ${answer.isExpert ? 'expert-answer' : ''} ${acceptedAnswerId === answer.id ? 'accepted-answer' : ''}`}
                >
                  {acceptedAnswerId === answer.id && (
                    <div className="accepted-badge-corner">
                      <span className="accepted-badge-icon">✅</span>
                      채택된 답변
                    </div>
                  )}
                  {answer.isExpert && !acceptedAnswerId && (
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
                    initialHelpfulCount={answer.helpful}
                    isHelpful={activeVotes.has(answer.id)}
                    onHelpfulClick={() => toggleHelpful(answer.id)}
                    compact={true}
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

        {/* Sidebar */}
        <Sidebar />
      </div>

      {/* Certification Prompt Modal */}
      <CertificationPromptModal
        isOpen={showCertificationModal}
        onClose={() => {
          setShowCertificationModal(false)
          alert('답변이 등록되었습니다!')
        }}
        trigger={certificationTrigger}
      />
    </main>
  )
}

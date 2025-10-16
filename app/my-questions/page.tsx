'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'

type Question = {
  id: number
  title: string
  content: string
  topics: string[]
  createdAt: string
  views: number
  votes: number
  answerCount: number
  status: 'open' | 'resolved'
}

export default function MyQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')
  const [loading, setLoading] = useState(true)

  // Load questions from localStorage (mock data)
  useEffect(() => {
    const savedQuestions = localStorage.getItem('vietkconnect_questions')
    const currentUser = JSON.parse(localStorage.getItem('vietkconnect_user') || '{}')

    if (savedQuestions) {
      const allQuestions: Question[] = JSON.parse(savedQuestions)
      // Filter questions by current user (in mock, we'll just show all for demo)
      const userQuestions = allQuestions.map((q: any) => ({
        id: q.id,
        title: q.title,
        content: q.content,
        topics: q.topics || [],
        createdAt: q.createdAt,
        views: q.views || 0,
        votes: q.votes || 0,
        answerCount: q.answerCount || 0,
        status: q.answerCount > 0 && Math.random() > 0.5 ? 'resolved' : 'open'
      }))
      setQuestions(userQuestions)
    }
    setLoading(false)
  }, [])

  const filteredQuestions = filter === 'all'
    ? questions
    : questions.filter(q => q.status === filter)

  const openCount = questions.filter(q => q.status === 'open').length
  const resolvedCount = questions.filter(q => q.status === 'resolved').length

  function getTimeAgo(dateString: string) {
    const now = new Date()
    const past = new Date(dateString)
    const diff = now.getTime() - past.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    if (minutes > 0) return `${minutes}분 전`
    return '방금 전'
  }

  function deleteQuestion(id: number) {
    if (confirm('정말로 이 질문을 삭제하시겠습니까?')) {
      const updated = questions.filter(q => q.id !== id)
      setQuestions(updated)
      localStorage.setItem('vietkconnect_questions', JSON.stringify(updated))
    }
  }

  return (
    <PageLayout variant="centered">
      <div className="my-questions-container">
        {/* Page Header */}
        <div className="section my-questions-header-section">
          <div className="my-questions-header-row">
            <div className="my-questions-header-info">
              <h1 className="section-title my-questions-title">
                📝 내 질문
              </h1>
              <p className="my-questions-subtitle">
                {loading ? '질문을 불러오는 중...' : `총 ${questions.length}개의 질문 (미해결 ${openCount} / 해결 ${resolvedCount})`}
              </p>
            </div>
            <Link href="/questions/new">
              <button className="btn btn-primary">
                + 질문하기
              </button>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="category-tabs my-questions-tabs">
            <button
              className={`category-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              전체 ({questions.length})
            </button>
            <button
              className={`category-tab ${filter === 'open' ? 'active' : ''}`}
              onClick={() => setFilter('open')}
            >
              미해결 ({openCount})
            </button>
            <button
              className={`category-tab ${filter === 'resolved' ? 'active' : ''}`}
              onClick={() => setFilter('resolved')}
            >
              해결됨 ({resolvedCount})
            </button>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="section my-questions-loading">
            <div className="spinner my-questions-loading-spinner"></div>
            <p className="my-questions-loading-text">
              질문을 불러오는 중...
            </p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="section my-questions-empty">
            <div className="my-questions-empty-icon">📝</div>
            <h3 className="my-questions-empty-title">
              {filter === 'all' ? '아직 작성한 질문이 없습니다' :
               filter === 'open' ? '미해결 질문이 없습니다' :
               '해결된 질문이 없습니다'}
            </h3>
            <p className="my-questions-empty-text">
              {filter === 'all' ? '첫 질문을 작성해보세요!' : '다른 탭을 확인해보세요.'}
            </p>
            <Link href="/questions/new">
              <button className="btn btn-primary">
                질문 작성하기
              </button>
            </Link>
          </div>
        ) : (
          <div className="my-questions-list">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="question-card">
                {/* Status Badge */}
                {question.status === 'resolved' && (
                  <div className="my-question-status-badge">
                    ✓ 해결됨
                  </div>
                )}

                {/* Question Title */}
                <Link href={`/questions/${question.id}`}>
                  <h3 className="question-title my-question-title-link">
                    {question.title}
                  </h3>
                </Link>

                {/* Question Content Preview */}
                <p className="question-content my-question-content-preview">
                  {question.content.length > 150
                    ? question.content.substring(0, 150) + '...'
                    : question.content}
                </p>

                {/* Topics */}
                {question.topics && question.topics.length > 0 && (
                  <div className="my-question-topics">
                    {question.topics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="tag-pill my-question-topic-tag"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats & Actions */}
                <div className="my-question-stats-actions">
                  <div className="question-stats">
                    <div className="stat-item">
                      <span>👁️</span>
                      <span>{question.views}</span>
                    </div>
                    <div className="stat-item">
                      <span>👍</span>
                      <span>{question.votes}</span>
                    </div>
                    <div className="stat-item">
                      <span>💬</span>
                      <span>{question.answerCount}개 답변</span>
                    </div>
                    <div className="stat-item">
                      <span className="my-question-time-stat">
                        {getTimeAgo(question.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="my-question-actions">
                    <Link href={`/questions/${question.id}`}>
                      <button
                        className="btn btn-secondary my-question-btn"
                      >
                        자세히 보기
                      </button>
                    </Link>
                    <button
                      className="btn btn-secondary my-question-btn-delete"
                      onClick={() => deleteQuestion(question.id)}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

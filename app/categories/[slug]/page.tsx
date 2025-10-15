'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import ActionBar from '@/components/common/ActionBar'

const categoryMap: Record<string, { name: string; icon: string; description: string }> = {
  visa: {
    name: '비자',
    icon: '🛂',
    description: '비자 신청, 연장, 변경에 대한 모든 정보'
  },
  employment: {
    name: '취업',
    icon: '💼',
    description: '구직, 이직, 워킹비자 관련 정보'
  },
  legal: {
    name: '법률',
    icon: '⚖️',
    description: '한국 생활 관련 법률 상담'
  },
  life: {
    name: '생활',
    icon: '🍜',
    description: '일상생활 팁과 정보'
  },
  education: {
    name: '교육',
    icon: '🎓',
    description: '교육 기관, 학업 관련 정보'
  },
  housing: {
    name: '주거',
    icon: '🏠',
    description: '주택, 임대 관련 정보'
  },
  healthcare: {
    name: '의료',
    icon: '🏥',
    description: '병원, 건강보험 관련 정보'
  }
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const category = categoryMap[slug]

  // Check login status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mockSession = localStorage.getItem('mock_session')
      setIsLoggedIn(mockSession === 'true')
    }
  }, [])

  // Format date helper
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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/questions?category=${slug}`)
        if (response.ok) {
          const data = await response.json()
          setQuestions(data.questions || [])
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchQuestions()
    }
  }, [slug])

  if (!category) {
    return (
      <main className="main-layout">
        <div className="container">
          <div className="main-content">
            <div className="section category-error-state">
              <div className="category-error-icon">🔍</div>
              <h1 className="category-error-title">카테고리를 찾을 수 없습니다</h1>
              <p className="category-error-message">요청하신 카테고리가 존재하지 않습니다.</p>
              <button
                onClick={() => router.push('/')}
                className="btn btn-primary"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
          <Sidebar showContent={false} />
        </div>
      </main>
    )
  }

  return (
    <main className="main-layout">
      {/* Mobile Category Grid */}
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
        <div className="main-content">
        {/* Category Header */}
        <div className="section card category-header">
          <div className="category-header-content">
            <span className="category-header-icon">{category.icon}</span>
            <div className="category-header-text">
              <h1 className="section-title">{category.name}</h1>
              <p className="category-description">{category.description}</p>
            </div>
          </div>

          <div className="category-header-actions">
            <Link href="/questions/new">
              <button className="btn btn-primary">
                {category.name} 질문하기
              </button>
            </Link>
            <Link href="/">
              <button className="btn btn-secondary">
                다른 카테고리 보기
              </button>
            </Link>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          <a href="/" className="category-tab">Popular</a>
          <a href="/topics" className="category-tab">Topic</a>
          <a href="/following" className="category-tab">Following</a>
        </div>

        {/* Questions List */}
        <div className="section">
          <h2 className="section-title">
            {category.name} 관련 질문들
          </h2>
          <p className="section-subtitle">
            {loading ? '질문을 불러오는 중...' : `${questions.length}개의 질문이 있습니다.`}
          </p>
        </div>

        {loading ? (
          <div className="section">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card loading-card">
                <div className="loading-line loading-line-title"></div>
                <div className="loading-line loading-line-subtitle"></div>
                <div className="loading-line loading-line-small"></div>
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="section card category-empty-state">
            <div className="category-empty-icon">{category.icon}</div>
            <h3 className="category-empty-title">
              아직 {category.name} 질문이 없습니다
            </h3>
            <p className="category-empty-message">
              첫 번째 {category.name} 질문을 작성해보세요!
            </p>
            <Link href="/questions/new">
              <button className="btn btn-primary">
                첫 질문 작성하기
              </button>
            </Link>
          </div>
        ) : (
          <div className="feed-container">
            {questions.map((question: any) => (
              <div
                key={question.id}
                className="question-card"
                onClick={() => router.push(`/questions/${question.id}`)}
              >
                <div className="question-header">
                  {/* Author Info */}
                  <div className="question-meta">
                    <div className="question-author-row">
                      <div
                        className="author-avatar-small"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (question.author?.id) {
                            router.push(`/users/${question.author.id}`)
                          }
                        }}
                      ></div>

                      <div className="question-author-info">
                        <div className="question-author">
                          <span
                            className="question-author-link"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (question.author?.id) {
                                router.push(`/users/${question.author.id}`)
                              }
                            }}
                          >
                            {question.author?.name || '익명'}
                          </span>
                          {question.author && (question.author.visaType || question.author.yearsInKorea) && (
                            <span className={`author-verification-box ${question.author.role === 'verified' || question.author.role === 'admin' ? 'verified' : ''}`}>
                              <span className="verification-text">
                                {question.author.visaType || ''}
                                {question.author.yearsInKorea ? `, 한국 ${question.author.yearsInKorea}년차` : ''}
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="question-time-row">
                          <div className="question-time">
                            {formatDate(question.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* More Button */}
                  <button
                    className="question-more-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/questions/${question.id}`)
                    }}
                    aria-label="게시글 상세 보기"
                  >
                    자세히
                  </button>
                </div>

                <h3 className="question-title">{question.title}</h3>
                <p className="question-content">
                  {question.content?.length > 200 ? question.content.substring(0, 200) + '...' : question.content}
                </p>

                <div className="question-stats">
                  <div className="question-stats-comments">
                    <span className="answer-expert-icon">🎓</span>
                    <span>
                      {question.answer_count === 0 ? (
                        <span>아직 답변이 없어요</span>
                      ) : (
                        <><strong>{question.answer_count}명</strong>이 답변했어요</>
                      )}
                    </span>
                  </div>
                  {question.status === 'resolved' && (
                    <span className="status-badge status-badge-resolved">
                      ✓ 해결됨
                    </span>
                  )}
                </div>

                {/* ActionBar */}
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionBar
                    targetId={question.id}
                    targetType="question"
                    title={question.title}
                    content={question.content}
                    url={`/questions/${question.id}`}
                    initialHelpfulCount={question.votes || 0}
                    compact={true}
                    requireLogin={!isLoggedIn}
                    onLoginRequired={() => {
                      router.push(`/auth/login?redirectTo=/categories/${slug}`)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

        {/* Sidebar */}
        <Sidebar showContent={false} />
      </div>
    </main>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { getSubscribedTopics, toggleSubscribeTopic } from '@/lib/utils/follow-manager'
import PageLayout from '@/components/layout/PageLayout'

type TopicInfo = {
  id: number
  name: string
  icon: string
  description: string
  questionCount: number
  slug: string
}

type Question = {
  id: number
  title: string
  content: string
  author: string
  answerCount: number
  views: number
  createdAt: string
  topicSlug: string
}

const TOPIC_DATA: Record<string, TopicInfo> = {
  'visa': {
    id: 1,
    name: '한국 비자·체류',
    icon: '🛂',
    description: '비자 신청·연장, 체류 자격 변경 (베트남인)',
    questionCount: 245,
    slug: 'visa'
  },
  'employment': {
    id: 2,
    name: '한국 직장생활',
    icon: '💼',
    description: '취업, 한국 직장 문화, 근로계약 가이드',
    questionCount: 189,
    slug: 'employment'
  },
  'legal': {
    id: 3,
    name: '외국인 근로자 권리',
    icon: '⚖️',
    description: '법률 상담, 권리 보호, 분쟁 해결',
    questionCount: 156,
    slug: 'legal'
  },
  'daily-life': {
    id: 4,
    name: '한국 생활 정착',
    icon: '🌏',
    description: '한국 생활 초기 적응, 문화 차이 극복',
    questionCount: 432,
    slug: 'daily-life'
  },
  'education': {
    id: 5,
    name: '다문화 가정 육아',
    icon: '👶',
    description: '자녀 교육, 다문화 가정 지원',
    questionCount: 203,
    slug: 'education'
  },
  'housing': {
    id: 6,
    name: '한국에서 집 구하기',
    icon: '🏠',
    description: '전월세 계약, 외국인 주거 정보',
    questionCount: 178,
    slug: 'housing'
  },
  'healthcare': {
    id: 7,
    name: '한국 의료 이용',
    icon: '🏥',
    description: '병원 이용법, 건강보험 가입',
    questionCount: 134,
    slug: 'healthcare'
  },
  'finance': {
    id: 8,
    name: '베트남 송금·금융',
    icon: '💰',
    description: '베트남 송금, 한국 은행 이용법',
    questionCount: 167,
    slug: 'finance'
  }
}

// Mock questions for each topic
const MOCK_QUESTIONS: Record<string, Question[]> = {
  'visa': [
    {
      id: 1,
      title: 'E-9 비자에서 F-4 비자로 변경 가능한가요?',
      content: '현재 E-9 비자로 일하고 있는데, F-4 비자로 변경하고 싶습니다. 어떤 조건이 필요한가요?',
      author: 'Nguyen Van A',
      answerCount: 5,
      views: 234,
      createdAt: '2일 전',
      topicSlug: 'visa'
    },
    {
      id: 2,
      title: '비자 연장 신청은 언제 해야 하나요?',
      content: '비자가 3개월 후에 만료됩니다. 미리 신청해야 하나요?',
      author: 'Tran Thi B',
      answerCount: 3,
      views: 189,
      createdAt: '1주 전',
      topicSlug: 'visa'
    }
  ],
  'employment': [
    {
      id: 3,
      title: '한국 회사의 야근 문화가 궁금합니다',
      content: '베트남과 다른 야근 문화에 대해 알고 싶습니다.',
      author: 'Le Van C',
      answerCount: 7,
      views: 456,
      createdAt: '1일 전',
      topicSlug: 'employment'
    }
  ],
  'legal': [
    {
      id: 4,
      title: '임금 체불 시 어떻게 대처해야 하나요?',
      content: '회사에서 두 달째 월급을 주지 않고 있습니다.',
      author: 'Pham Thi D',
      answerCount: 4,
      views: 312,
      createdAt: '3일 전',
      topicSlug: 'legal'
    }
  ],
  'daily-life': [
    {
      id: 5,
      title: '한국에서 휴대폰 개통하는 방법',
      content: '외국인이 휴대폰 개통할 때 필요한 서류가 궁금합니다.',
      author: 'Hoang Van E',
      answerCount: 6,
      views: 523,
      createdAt: '4일 전',
      topicSlug: 'daily-life'
    }
  ],
  'education': [
    {
      id: 6,
      title: '한국 초등학교 입학 절차',
      content: '자녀를 한국 초등학교에 입학시키려고 합니다.',
      author: 'Nguyen Thi F',
      answerCount: 5,
      views: 267,
      createdAt: '5일 전',
      topicSlug: 'education'
    }
  ],
  'housing': [
    {
      id: 7,
      title: '전세와 월세의 차이점',
      content: '전세 제도가 베트남에는 없어서 이해가 어렵습니다.',
      author: 'Tran Van G',
      answerCount: 8,
      views: 678,
      createdAt: '2일 전',
      topicSlug: 'housing'
    }
  ],
  'healthcare': [
    {
      id: 8,
      title: '건강보험 가입 방법',
      content: '외국인 건강보험 가입 절차를 알고 싶습니다.',
      author: 'Le Thi H',
      answerCount: 4,
      views: 345,
      createdAt: '6일 전',
      topicSlug: 'healthcare'
    }
  ],
  'finance': [
    {
      id: 9,
      title: '베트남으로 송금할 때 수수료가 가장 저렴한 곳은?',
      content: '여러 송금 방법 중 어떤 것이 제일 좋을까요?',
      author: 'Pham Van I',
      answerCount: 6,
      views: 489,
      createdAt: '1일 전',
      topicSlug: 'finance'
    }
  ]
}

export default function TopicDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])

  const topicInfo = TOPIC_DATA[params.slug]

  useEffect(() => {
    if (!topicInfo) {
      router.push('/topics')
      return
    }

    // Load follow status
    if (isLoggedIn && !isLoading) {
      const subscribedTopics = getSubscribedTopics()
      const isSubscribed = subscribedTopics.some(t => t.slug === params.slug)
      setIsFollowing(isSubscribed)
    }

    // Load mock questions
    setQuestions(MOCK_QUESTIONS[params.slug] || [])
  }, [isLoggedIn, isLoading, params.slug, topicInfo, router])

  if (!topicInfo) {
    return null
  }

  function handleToggleFollow() {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirectTo=/topics/${params.slug}`)
      return
    }

    const result = toggleSubscribeTopic({
      id: topicInfo.id,
      name: topicInfo.name,
      slug: topicInfo.slug,
      icon: topicInfo.icon
    })

    if (result.success) {
      setIsFollowing(result.isFollowing)
    }
  }

  return (
    <PageLayout variant="centered">
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

      <div>
        <div>
          {/* Topic Header */}
          <div className="section" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '3rem' }}>{topicInfo.icon}</span>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {topicInfo.name}
                </h1>
                <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                  {topicInfo.description}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{topicInfo.questionCount}</span>
                <span style={{ fontSize: '0.875rem', opacity: 0.8, marginLeft: '0.5rem' }}>개의 질문</span>
              </div>

              <button
                onClick={handleToggleFollow}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: isFollowing ? 'white' : 'rgba(255, 255, 255, 0.2)',
                  color: isFollowing ? '#667eea' : 'white',
                  border: isFollowing ? 'none' : '2px solid white',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isFollowing) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFollowing) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                {isFollowing ? '✓ 구독중' : '+ 구독하기'}
              </button>

              <a
                href="/topics"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                ← 모든 토픽 보기
              </a>
            </div>
          </div>

          {/* Questions List */}
          <div className="section">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
              최신 질문
            </h2>

            {questions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                  아직 질문이 없습니다
                </p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  첫 번째 질문을 작성해보세요!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {questions.map((question) => (
                  <a
                    key={question.id}
                    href={`/questions/${question.id}`}
                    className="card"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem'
                    }}>
                      {question.title}
                    </h3>

                    <p style={{
                      fontSize: '0.95rem',
                      color: '#6b7280',
                      lineHeight: '1.6',
                      marginBottom: '1rem'
                    }}>
                      {question.content}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: '#9ca3af'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>{question.author}</span>
                        <span>•</span>
                        <span>{question.createdAt}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>💬 {question.answerCount}개 답변</span>
                        <span>👁️ {question.views} 조회</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

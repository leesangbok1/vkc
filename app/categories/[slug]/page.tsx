'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import FeedCard from '@/components/feed/FeedCard'
import { FeedSkeleton } from '@/components/questions/FeedSkeleton'
import { FeedEmptyState } from '@/components/questions/FeedEmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import { extractMediaUrls } from '@/lib/utils/media'

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
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store', credentials: 'include' })
        setIsLoggedIn(res.ok)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/questions?category=${slug}&sort=recent`, {
          cache: 'no-store',
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setQuestions(Array.isArray(data.items) ? data.items : [])
        } else {
          setQuestions([])
        }
      } catch (error) {
        console.error('Failed to fetch questions:', { slug, error })
        setQuestions([])
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
      <PageLayout variant="centered">
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
      </PageLayout>
    )
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
        <div className="feed-filter-bar">
          <div className="feed-filter-scroll">
            <a href="/" className="category-tab">Popular</a>
            <a href="/topics" className="category-tab">Topic</a>
            <a href="/following" className="category-tab">Following</a>
          </div>
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
          <FeedSkeleton count={4} />
        ) : questions.length === 0 ? (
          <FeedEmptyState
            icon={category.icon}
            title={`아직 ${category.name} 질문이 없습니다`}
            description={`첫 번째 ${category.name} 질문을 작성해보세요!`}
            actionHref="/questions/new"
            actionLabel="첫 질문 작성하기"
          />
        ) : (
          <div className="feed-container">
            {questions.map((question: any) => (
              <FeedCard
                key={question.id}
                id={question.id}
                itemType="question"
                title={question.title}
                body={question.content}
                href={`/questions/${question.id}`}
                createdAt={question.created_at}
                topic={category.name}
                author={{
                  id: question.author?.id ?? 'unknown',
                  name: question.author?.name,
                  role: question.author?.role,
                  visaType: question.author?.visaType ?? null,
                  yearsInKorea: question.author?.yearsInKorea ?? null,
                }}
                stats={
                  question.answer_count && question.answer_count > 0
                    ? (
                        <span>
                          <strong>{question.answer_count}명</strong>이 답변했어요
                        </span>
                      )
                    : <span>아직 답변이 없어요</span>
                }
                badge={<StatusBadge resolved={question.status === 'resolved'} compact />}
                mediaUrls={extractMediaUrls(question)}
                showReportButton
                actionProps={{
                  targetType: 'question',
                  helpfulCount: question.votes || 0,
                  requireLogin: !isLoggedIn,
                  onLoginRequired: () => {
                    router.push(`/auth/login?redirectTo=/categories/${slug}`)
                  },
                  compact: true,
                }}
                onNavigate={(href) => router.push(href)}
                onAuthorClick={(authorId) => router.push(`/users/${authorId}`)}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </PageLayout>
  )
}

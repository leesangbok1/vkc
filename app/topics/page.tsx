'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { getSubscribedTopics, toggleSubscribeTopic } from '@/lib/utils/follow-manager'
import Sidebar from '@/components/layout/Sidebar'
import RelatedQuestionsFeed from '@/components/topics/RelatedQuestionsFeed'

type Topic = {
  id: number
  name: string
  icon: string
  description: string
  questionCount: number
  isFollowing: boolean
  slug?: string
}

export default function TopicsPage() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()
  const isAuthenticated = isLoggedIn

  const [topics, setTopics] = useState<Topic[]>([
    {
      id: 1,
      name: '한국 비자·체류',
      icon: '🛂',
      slug: 'visa',
      description: '비자 신청·연장, 체류 자격 변경 (베트남인)',
      questionCount: 245,
      isFollowing: false
    },
    {
      id: 2,
      name: '한국 직장생활',
      icon: '💼',
      slug: 'employment',
      description: '취업, 한국 직장 문화, 근로계약 가이드',
      questionCount: 189,
      isFollowing: false
    },
    {
      id: 3,
      name: '외국인 근로자 권리',
      icon: '⚖️',
      slug: 'legal',
      description: '법률 상담, 권리 보호, 분쟁 해결',
      questionCount: 156,
      isFollowing: false
    },
    {
      id: 4,
      name: '한국 생활 정착',
      icon: '🌏',
      slug: 'daily-life',
      description: '한국 생활 초기 적응, 문화 차이 극복',
      questionCount: 432,
      isFollowing: false
    },
    {
      id: 5,
      name: '다문화 가정 육아',
      icon: '👶',
      slug: 'education',
      description: '자녀 교육, 다문화 가정 지원',
      questionCount: 203,
      isFollowing: false
    },
    {
      id: 6,
      name: '한국에서 집 구하기',
      icon: '🏠',
      slug: 'housing',
      description: '전월세 계약, 외국인 주거 정보',
      questionCount: 178,
      isFollowing: false
    },
    {
      id: 7,
      name: '한국 의료 이용',
      icon: '🏥',
      slug: 'healthcare',
      description: '병원 이용법, 건강보험 가입',
      questionCount: 134,
      isFollowing: false
    },
    {
      id: 8,
      name: '베트남 송금·금융',
      icon: '💰',
      slug: 'finance',
      description: '베트남 송금, 한국 은행 이용법',
      questionCount: 167,
      isFollowing: false
    },
    {
      id: 9,
      name: '한국어 배우기',
      icon: '📚',
      slug: 'korean-language',
      description: '베트남어 화자를 위한 한국어 학습',
      questionCount: 298,
      isFollowing: false
    },
    {
      id: 10,
      name: '한국 문화 탐방',
      icon: '🎎',
      slug: 'culture-tour',
      description: '한국 문화 체험, 여행지 추천',
      questionCount: 145,
      isFollowing: false
    },
    {
      id: 11,
      name: '베트남 음식·물품',
      icon: '🍜',
      slug: 'food',
      description: '한국 내 베트남 식당·마트 정보',
      questionCount: 112,
      isFollowing: false
    },
    {
      id: 12,
      name: '한-베 문화 교류',
      icon: '🎉',
      slug: 'cultural-exchange',
      description: '베트남 커뮤니티, 문화 행사',
      questionCount: 189,
      isFollowing: false
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'following'>('all')

  // Load subscribed topics from localStorage on mount
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const subscribedTopics = getSubscribedTopics()
      const followedIds = new Set(subscribedTopics.map(t => t.id))

      setTopics(prev => prev.map(topic => ({
        ...topic,
        isFollowing: followedIds.has(topic.id)
      })))
    }
  }, [isAuthenticated, isLoading])

  function toggleFollow(topicId: number) {
    // 로그인 체크
    if (!isAuthenticated) {
      router.push('/auth/login?redirectTo=/topics')
      return
    }

    const topic = topics.find(t => t.id === topicId)
    if (!topic) return

    // Toggle subscribe in localStorage
    const result = toggleSubscribeTopic({
      id: topic.id,
      name: topic.name,
      slug: topic.slug || topic.name.toLowerCase(),
      icon: topic.icon
    })

    if (result.success) {
      setTopics(prev => prev.map(t =>
        t.id === topicId ? { ...t, isFollowing: result.isFollowing } : t
      ))
    }
  }

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || topic.isFollowing

    return matchesSearch && matchesFilter
  })

  const followingCount = topics.filter(t => t.isFollowing).length

  // 구독 중인 토픽 목록 (RelatedQuestionsFeed에 전달)
  const followingTopics = useMemo(
    () => topics.filter(t => t.isFollowing),
    [topics]
  )

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
        {/* 좌우 분할 레이아웃 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* 왼쪽: 토픽 설정 */}
          <div style={{ width: '100%' }}>
            {/* Page Header */}
            <div className="section topics-page-header">
              <div className="topics-page-title-section">
                <h1 className="section-title topics-page-title">
                  💖 관심 토픽
                </h1>
                <p className="topics-page-subtitle">
                  관심있는 토픽을 구독하면 맞춤형 질문과 답변을 받을 수 있습니다
                </p>
              </div>

              {/* Search & Filter */}
              <div className="topics-search-filter-row">
                {/* Search Input */}
                <div className="topics-search-wrapper">
                  <div className="topics-search-icon">
                    🔍
                  </div>
                  <input
                    type="text"
                    className="form-input topics-search-input"
                    placeholder="토픽 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter Tabs */}
                <div className="category-tabs topics-filter-tabs">
                  <button
                    className={`category-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    전체 ({topics.length})
                  </button>
                  <button
                    className={`category-tab ${filter === 'following' ? 'active' : ''}`}
                    onClick={() => setFilter('following')}
                  >
                    구독중 ({followingCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="category-tabs">
              <a href="/" className="category-tab">Popular</a>
              <a href="/topics" className="category-tab active">Topic</a>
              <a href="/following" className="category-tab">Following</a>
            </div>

            {/* Login prompt for non-authenticated users */}
            {!isAuthenticated && filteredTopics.length > 0 && (
              <div className="section topics-login-prompt" style={{ marginBottom: '1.5rem' }}>
                <div className="topics-login-icon">💬</div>
                <h3 className="topics-login-title">
                  로그인하고<br />나만의 맞춤형 콘텐츠를 만나보세요
                </h3>
                <button
                  onClick={() => router.push('/auth/login?redirectTo=/topics')}
                  className="btn btn-primary topics-login-btn"
                >
                  로그인·회원가입
                </button>
              </div>
            )}

            {/* Topics Grid */}
            {filteredTopics.length === 0 ? (
              <div className="section topics-empty-state">
                <div className="topics-empty-icon">🔍</div>
                <h3 className="topics-empty-title">
                  {searchQuery ? '검색 결과가 없습니다' : filter === 'following' ? '구독 중인 토픽이 없습니다' : '토픽이 없습니다'}
                </h3>
                <p className="topics-empty-description">
                  {searchQuery ? '다른 검색어를 시도해보세요' : filter === 'following' ? '관심있는 토픽을 구독해보세요' : ''}
                </p>
              </div>
            ) : (
              <div className="topics-grid">
                {filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`card topic-card ${topic.isFollowing ? 'topic-card-following' : ''}`}
                  >
                    {/* Topic Icon & Name */}
                    <div className="topic-card-header">
                      <div className="topic-icon-wrapper">
                        {topic.icon}
                      </div>
                      <div className="topic-info-wrapper">
                        <h3 className="topic-name">
                          {topic.name}
                        </h3>
                        <p className="topic-question-count">
                          {topic.questionCount}개의 질문
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="topic-description">
                      {topic.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="topic-actions">
                      <button
                        className={`btn ${topic.isFollowing ? 'btn-primary' : 'btn-secondary'} topic-action-btn`}
                        onClick={() => toggleFollow(topic.id)}
                      >
                        {topic.isFollowing ? '✓ 구독중' : '+ 구독'}
                      </button>
                      <Link href={`/topics/${topic.slug}`} className="topic-action-link">
                        <button className="btn btn-secondary topic-action-btn-full">
                          더보기
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 구독 토픽의 최신 질문 */}
          <div style={{ width: '100%', position: 'sticky', top: '1rem' }}>
            {/* Following Topics Summary */}
            {isAuthenticated && followingCount > 0 ? (
              <>
                <div className="section topics-following-banner" style={{ marginBottom: '1.5rem' }}>
                  <div className="topics-following-content">
                    <div>
                      <h3 className="topics-following-title">
                        💖 {followingCount}개의 토픽을 구독 중입니다
                      </h3>
                      <p className="topics-following-subtitle">
                        구독 중인 토픽의 최신 질문을 확인하세요
                      </p>
                    </div>
                  </div>
                </div>

                {/* Related Questions Feed */}
                <RelatedQuestionsFeed followingTopics={followingTopics} />
              </>
            ) : (
              <div className="section" style={{
                padding: '2rem',
                textAlign: 'center',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📌</div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  토픽 구독 시 맞춤형 질문 추천
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  왼쪽에서 관심있는 토픽을 구독하면<br />
                  이곳에서 최신 질문을 확인할 수 있습니다
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

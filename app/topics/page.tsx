'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  getSubscribedTopics,
  toggleSubscribeTopic,
  type SubscribedTopic
} from '@/lib/utils/follow-manager'
import PageLayout from '@/components/layout/PageLayout'
import ClientOnly from '@/components/common/ClientOnly'
import RelatedQuestionsFeed from '@/components/topics/RelatedQuestionsFeed'

type Topic = {
  id: number
  name: string
  icon?: string
  description: string
  questionCount: number
  slug: string
  isFollowing: boolean
}

export default function TopicsPage() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()
  const isAuthenticated = isLoggedIn

  const [topics, setTopics] = useState<Topic[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscribedTopic[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'following'>('all')
  const [isLoadingTopics, setIsLoadingTopics] = useState(true)
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false)
  const [processingTopicId, setProcessingTopicId] = useState<number | null>(null)

  useEffect(() => {
    loadTopics()
  }, [])

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadSubscriptions(true)
    } else if (!isAuthenticated) {
      setSubscriptions([])
      setTopics(prev => prev.map(topic => ({ ...topic, isFollowing: false })))
    }
  }, [isAuthenticated, isLoading])

  async function loadTopics() {
    setIsLoadingTopics(true)
    try {
      const res = await fetch('/api/categories?include_count=true', { cache: 'no-store' })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '토픽 정보를 불러오지 못했습니다.')
      }

      const json = await res.json()
      const data = Array.isArray(json?.data) ? json.data : []

      setTopics(data.map((category: any) => ({
        id: Number(category.id),
        name: String(category.name || '이름 없는 토픽'),
        icon: typeof category.icon === 'string' && category.icon.length > 0 ? category.icon : undefined,
        description: typeof category.description === 'string' && category.description.length > 0
          ? category.description
          : '추가 설명이 아직 없습니다.',
        questionCount: Number(category.question_count ?? 0),
        slug: String(category.slug || category.id),
        isFollowing: false
      })))
    } catch (error) {
      console.error('[TopicsPage] loadTopics failed:', error)
      setTopics([])
    } finally {
      setIsLoadingTopics(false)
    }
  }

  async function loadSubscriptions(forceRefresh = false) {
    setIsLoadingSubscriptions(true)
    try {
      const list = await getSubscribedTopics(forceRefresh)
      setSubscriptions(list)
      setTopics(prev => prev.map(topic => ({
        ...topic,
        isFollowing: list.some(sub => sub.id === topic.id)
      })))
    } catch (error) {
      console.error('[TopicsPage] loadSubscriptions failed:', error)
    } finally {
      setIsLoadingSubscriptions(false)
    }
  }

  async function toggleFollow(topic: Topic) {
    if (!isAuthenticated) {
      router.push('/auth/login?redirectTo=/topics')
      return
    }

    setProcessingTopicId(topic.id)
    try {
      const result = await toggleSubscribeTopic({ id: topic.id, slug: topic.slug })
      if (!result.success) {
        alert('토픽 구독 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

      setTopics(prev => prev.map(item => (
        item.id === topic.id ? { ...item, isFollowing: result.isSubscribed } : item
      )))

      setSubscriptions(prev => {
        if (result.isSubscribed && result.topic) {
          return [result.topic, ...prev.filter(sub => sub.id !== topic.id)]
        }
        if (!result.isSubscribed) {
          return prev.filter(sub => sub.id !== topic.id)
        }
        return prev
      })
    } catch (error) {
      console.error('[TopicsPage] toggleFollow failed:', error)
      alert('토픽 구독 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setProcessingTopicId(null)
    }
  }

  const filteredTopics = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim()
    return topics.filter(topic => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        topic.name.toLowerCase().includes(normalizedQuery) ||
        topic.description.toLowerCase().includes(normalizedQuery)

      const matchesFilter = filter === 'all' || topic.isFollowing
      return matchesSearch && matchesFilter
    })
  }, [topics, searchQuery, filter])

  const followingCount = subscriptions.length
  const followingTopics = useMemo(
    () => topics.filter(topic => topic.isFollowing),
    [topics]
  )

  return (
    <PageLayout variant="centered">
      <div className="topics-page-container">
        {/* Hero Section */}
        <section className="topics-hero">
          <div className="topics-hero-content">
            <h1 className="topics-title">🎯 관심 있는 주제를 팔로우하세요</h1>
            <p className="topics-subtitle">
              베트남 커뮤니티가 자주 찾는 질문을 모았습니다. 관심있는 토픽을 구독하면 관련 질문과 답변을 빠르게 확인할 수 있습니다.
            </p>

            <div className="topics-actions">
              <div className="topics-search">
                <span className="topics-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="원하는 토픽을 검색해보세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="topics-filter-tabs">
                <button
                  className={`topics-filter-tab ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  전체 토픽
                </button>
                <button
                  className={`topics-filter-tab ${filter === 'following' ? 'active' : ''}`}
                  onClick={() => setFilter('following')}
                  disabled={!isAuthenticated}
                >
                  팔로잉 ({followingCount})
                </button>
              </div>
            </div>
          </div>

          <div className="topics-stats">
            <div className="topics-stat-card">
              <div className="topics-stat-icon">📚</div>
              <div>
                <div className="topics-stat-value">{topics.length}</div>
                <div className="topics-stat-label">등록된 토픽</div>
              </div>
            </div>
            <div className="topics-stat-card">
              <div className="topics-stat-icon">⭐</div>
              <div>
                <div className="topics-stat-value">{followingCount}</div>
                <div className="topics-stat-label">나의 팔로잉</div>
              </div>
            </div>
            <div className="topics-stat-card">
              <div className="topics-stat-icon">💬</div>
              <div>
                <div className="topics-stat-value">
                  {topics.reduce((sum, topic) => sum + topic.questionCount, 0)}
                </div>
                <div className="topics-stat-label">누적 질문 수</div>
              </div>
            </div>
          </div>
        </section>

        {/* Topics Grid */}
        <section className="topics-grid-section">
          {isLoadingTopics || isLoadingSubscriptions ? (
            <div className="topics-loading-state">
              <div className="topics-spinner">⏳</div>
              <p>토픽 정보를 불러오는 중입니다...</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="topics-empty-state">
              <div className="topics-empty-icon">🔎</div>
              <h3>조건에 맞는 토픽이 없습니다</h3>
              <p>검색어나 필터를 변경해보세요.</p>
            </div>
          ) : (
            <div className="topics-grid">
              {filteredTopics.map((topic) => (
                <div key={topic.id} className={`topic-card ${topic.isFollowing ? 'following' : ''}`}>
                  <div className="topic-card-header">
                    <div className="topic-icon">{topic.icon || '📌'}</div>
                    <button
                      className={`topic-follow-btn ${topic.isFollowing ? 'following' : ''}`}
                      onClick={() => toggleFollow(topic)}
                      disabled={processingTopicId === topic.id}
                    >
                      {processingTopicId === topic.id
                        ? '처리 중...'
                        : topic.isFollowing ? '팔로잉' : '팔로우'}
                    </button>
                  </div>

                  <h3 className="topic-name">{topic.name}</h3>
                  <p className="topic-description">{topic.description}</p>

                  <div className="topic-meta">
                    <span>질문 {topic.questionCount.toLocaleString()}개</span>
                    <Link href={`/topics/${topic.slug}`} className="topic-detail-link">
                      자세히 보기 →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related feed */}
        <ClientOnly>
          <RelatedQuestionsFeed followingTopics={followingTopics} />
        </ClientOnly>
      </div>
    </PageLayout>
  )
}

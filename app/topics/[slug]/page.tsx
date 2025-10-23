'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  getSubscribedTopics,
  toggleSubscribeTopic,
  type SubscribedTopic
} from '@/lib/utils/follow-manager'
import PageLayout from '@/components/layout/PageLayout'

interface TopicInfo {
  id: number
  name: string
  icon?: string
  description: string
  questionCount: number
  slug: string
}

interface QuestionInfo {
  id: string
  title: string
  content: string
  authorName: string
  answerCount: number
  createdAt: string
}

export default function TopicDetailPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()
  const isAuthenticated = isLoggedIn

  const [topic, setTopic] = useState<TopicInfo | null>(null)
  const [questions, setQuestions] = useState<QuestionInfo[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscribedTopic[]>([])
  const [isLoadingTopic, setIsLoadingTopic] = useState(true)
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false)
  const [isProcessingFollow, setIsProcessingFollow] = useState(false)

  const slug = typeof params?.slug === 'string' ? params.slug : ''

  useEffect(() => {
    if (!slug) return
    loadTopic()
  }, [slug])

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadSubscriptions(true)
    } else if (!isAuthenticated) {
      setSubscriptions([])
    }
  }, [isAuthenticated, isLoading])

  async function loadTopic() {
    setIsLoadingTopic(true)
    try {
      const res = await fetch(`/api/topics/${slug}?limit=20`, { cache: 'no-store' })
      if (res.status === 404) {
        router.replace('/topics')
        return
      }

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '토픽 정보를 불러오지 못했습니다.')
      }

      const payload = await res.json()
      const category = payload?.data?.category
      const questionList = Array.isArray(payload?.data?.questions) ? payload.data.questions : []

      setTopic({
        id: Number(category?.id ?? 0),
        name: String(category?.name || '이름 없는 토픽'),
        icon: typeof category?.icon === 'string' ? category.icon : undefined,
        description: typeof category?.description === 'string' && category.description.length > 0
          ? category.description
          : '추가 설명이 아직 없습니다.',
        questionCount: Number(category?.questionCount ?? questionList.length),
        slug: String(category?.slug || slug)
      })

      setQuestions(questionList.map((question: any) => ({
        id: String(question.id),
        title: String(question.title || '제목 없는 질문'),
        content: typeof question.content === 'string' ? question.content : '',
        authorName: String(question?.author?.name || '익명 회원'),
        answerCount: Number(question.answer_count ?? 0),
        createdAt: typeof question.created_at === 'string'
          ? question.created_at
          : new Date().toISOString()
      })))
    } catch (error) {
      console.error('[TopicDetailPage] loadTopic failed:', error)
      setTopic(null)
      setQuestions([])
    } finally {
      setIsLoadingTopic(false)
    }
  }

  async function loadSubscriptions(forceRefresh = false) {
    setIsLoadingSubscriptions(true)
    try {
      const list = await getSubscribedTopics(forceRefresh)
      setSubscriptions(list)
    } catch (error) {
      console.error('[TopicDetailPage] loadSubscriptions failed:', error)
    } finally {
      setIsLoadingSubscriptions(false)
    }
  }

  const isFollowing = topic ? subscriptions.some(sub => sub.id === topic.id) : false

  async function handleToggleFollow() {
    if (!topic) return
    if (!isAuthenticated) {
      router.push(`/auth/login?redirectTo=/topics/${topic.slug}`)
      return
    }

    setIsProcessingFollow(true)
    try {
      const result = await toggleSubscribeTopic({ id: topic.id, slug: topic.slug })
      if (!result.success) {
        alert('토픽 구독 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

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
      console.error('[TopicDetailPage] handleToggleFollow failed:', error)
      alert('토픽 구독 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsProcessingFollow(false)
    }
  }

  if (isLoadingTopic) {
    return (
      <PageLayout variant="centered">
        <div className="topics-topic-loading">
          <div>토픽 정보를 불러오는 중입니다...</div>
        </div>
      </PageLayout>
    )
  }

  if (!topic) {
    return (
      <PageLayout variant="centered">
        <div className="topics-topic-loading">
          <div>토픽 정보를 찾을 수 없습니다.</div>
          <button className="topics-back-btn" onClick={() => router.push('/topics')}>
            토픽 목록으로 돌아가기
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="centered">
      <div className="topic-detail-container">
        <div className="topic-detail-header">
          <div className="topic-detail-icon">{topic.icon || '📌'}</div>
          <div>
            <h1>{topic.name}</h1>
            <p>{topic.description}</p>
            <div className="topic-detail-stats">
              <span>질문 {topic.questionCount.toLocaleString()}개</span>
              <span>팔로워 {subscriptions.filter(sub => sub.id === topic.id).length}명</span>
            </div>
          </div>
          <button
            className={`topic-detail-follow-btn ${isFollowing ? 'following' : ''}`}
            onClick={handleToggleFollow}
            disabled={isProcessingFollow || isLoadingSubscriptions}
          >
            {isProcessingFollow ? '처리 중...' : isFollowing ? '팔로잉' : '팔로우' }
          </button>
        </div>

        <section className="topic-detail-questions">
          <h2>최근 질문</h2>
          {questions.length === 0 ? (
            <div className="topic-detail-empty">
              <div>아직 등록된 질문이 없습니다.</div>
              <button onClick={() => router.push('/questions/new')} className="topic-detail-ask-btn">
                첫 질문 남기기
              </button>
            </div>
          ) : (
            <div className="topic-detail-question-list">
              {questions.map(question => (
                <a key={question.id} href={`/questions/${question.id}`} className="topic-detail-question">
                  <h3>{question.title}</h3>
                  <p>
                    {question.content.length > 160
                      ? `${question.content.slice(0, 160)}...`
                      : question.content}
                  </p>
                  <div className="topic-detail-question-meta">
                    <span>{question.authorName}</span>
                    <span>답변 {question.answerCount}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  )
}

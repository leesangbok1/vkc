'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface TopicSummary {
  id: number
  name: string
  slug?: string
}

interface QuestionSummary {
  id: string
  title: string
  content: string
  authorName: string
  answerCount: number
  createdAt: string
}

interface RelatedQuestionsFeedProps {
  followingTopics: TopicSummary[]
}

type TopicQuestionsEntry = {
  questions: QuestionSummary[]
  total: number
}

const DEFAULT_LIMIT = 3
const LOAD_MORE_STEP = 4

export default function RelatedQuestionsFeed({ followingTopics }: RelatedQuestionsFeedProps) {
  const [topicData, setTopicData] = useState<Map<number, TopicQuestionsEntry>>(new Map())
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [loadingTopicId, setLoadingTopicId] = useState<number | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadQuestions() {
      if (followingTopics.length === 0) {
        setTopicData(new Map())
        return
      }

      setIsInitialLoading(true)
      try {
        const entries = await Promise.all(
          followingTopics.map(async (topic) => {
            const slug = topic.slug ?? topic.id
            try {
              const res = await fetch(`/api/topics/${slug}?limit=${DEFAULT_LIMIT}`, { cache: 'no-store' })
              if (!res.ok) {
                throw new Error(`Failed to load questions for topic ${slug}`)
              }

              const payload = await res.json()
              const questions = Array.isArray(payload?.data?.questions) ? payload.data.questions : []
              const mapped: QuestionSummary[] = questions.map((question: any) => ({
                id: String(question.id),
                title: String(question.title || '제목 없는 질문'),
                content: typeof question.content === 'string' ? question.content : '',
                authorName: String(question?.author?.name || '익명 회원'),
                answerCount: Number(question.answer_count ?? 0),
                createdAt: typeof question.created_at === 'string'
                  ? question.created_at
                  : new Date().toISOString()
              }))

              const total = Number(payload?.data?.category?.questionCount ?? mapped.length)

              return [topic.id, { questions: mapped, total }] as const
            } catch (error) {
              console.error('[RelatedQuestionsFeed] loadQuestions failed:', error)
              return [topic.id, { questions: [], total: 0 }] as const
            }
          })
        )

        if (!ignore) {
          const next = new Map<number, TopicQuestionsEntry>()
          entries.forEach(([id, data]) => {
            next.set(id, data)
          })
          setTopicData(next)
        }
      } finally {
        if (!ignore) {
          setIsInitialLoading(false)
        }
      }
    }

    loadQuestions()
    return () => {
      ignore = true
    }
  }, [followingTopics])

  const handleLoadMore = async (topic: TopicSummary) => {
    const current = topicData.get(topic.id)
    const currentCount = current?.questions.length ?? 0
    const totalAvailable = current?.total ?? 0

    if (totalAvailable !== 0 && currentCount >= totalAvailable) {
      return
    }

    const nextLimit = totalAvailable > 0
      ? Math.min(totalAvailable, currentCount + LOAD_MORE_STEP)
      : currentCount + LOAD_MORE_STEP

    setLoadingTopicId(topic.id)
    try {
      const slug = topic.slug ?? topic.id
      const res = await fetch(`/api/topics/${slug}?limit=${nextLimit}`, { cache: 'no-store' })
      if (!res.ok) {
        throw new Error(`Failed to load more questions for topic ${slug}`)
      }

      const payload = await res.json()
      const questions = Array.isArray(payload?.data?.questions) ? payload.data.questions : []
      const mapped: QuestionSummary[] = questions.map((question: any) => ({
        id: String(question.id),
        title: String(question.title || '제목 없는 질문'),
        content: typeof question.content === 'string' ? question.content : '',
        authorName: String(question?.author?.name || '익명 회원'),
        answerCount: Number(question.answer_count ?? 0),
        createdAt: typeof question.created_at === 'string'
          ? question.created_at
          : new Date().toISOString()
      }))
      const total = Number(payload?.data?.category?.questionCount ?? mapped.length)

      setTopicData((prev) => {
        const next = new Map(prev)
        next.set(topic.id, { questions: mapped, total })
        return next
      })
    } catch (error) {
      console.error('[RelatedQuestionsFeed] loadMore failed:', error)
    } finally {
      setLoadingTopicId(null)
    }
  }

  if (followingTopics.length === 0) {
    return (
      <section className="topics-related-section">
        <div className="topics-related-container">
          <h2 className="topics-related-title">맞춤 질문 피드</h2>
          <p className="topics-related-subtitle">관심있는 토픽을 팔로우하면 관련 질문을 빠르게 볼 수 있습니다.</p>
          <div className="topics-related-empty">
            <div className="topics-related-empty-icon">✨</div>
            <p>토픽을 팔로우하고 개인화된 질문 피드를 받아보세요.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="topics-related-section">
      <div className="topics-related-container">
        <div className="topics-related-header">
          <div>
            <h2 className="topics-related-title">팔로우 중인 토픽의 최신 질문</h2>
            <p className="topics-related-subtitle">관심있는 주제의 질문을 바로 확인하세요.</p>
          </div>
          <Link href="/questions" className="topics-related-more">
            전체 질문 보기 →
          </Link>
        </div>

        {isInitialLoading ? (
          <div className="topics-related-loading">질문을 불러오는 중입니다...</div>
        ) : (
          <div className="topics-related-grid">
            {followingTopics.map((topic) => {
              const entry = topicData.get(topic.id)
              const questions = entry?.questions ?? []
              const total = entry?.total ?? 0
              const hasMore = total > questions.length

              return (
                <div key={topic.id} className="topics-related-card">
                  <div className="topics-related-card-header">
                    <h3>{topic.name}</h3>
                    <div className="topics-related-actions">
                      {hasMore && (
                        <button
                          type="button"
                          className="topics-related-load-more"
                          onClick={() => handleLoadMore(topic)}
                          disabled={loadingTopicId === topic.id}
                        >
                          {loadingTopicId === topic.id ? '불러오는 중...' : '더 보기'}
                        </button>
                      )}
                      <Link
                        href={`/topics/${topic.slug ?? topic.id}`}
                        className="topics-related-card-link"
                        aria-label={`${topic.name} 토픽 페이지로 이동`}
                      >
                        토픽 페이지 →
                      </Link>
                    </div>
                  </div>

                  {questions.length === 0 ? (
                    <div className="topics-related-empty">
                      <div className="topics-related-empty-icon">📭</div>
                      <p>아직 등록된 질문이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="topics-related-list">
                      {questions.map((question) => (
                        <Link key={question.id} href={`/questions/${question.id}`} className="topics-related-question">
                          <div className="topics-related-question-meta">
                            <span className="topics-related-author">{question.authorName}</span>
                            <span className="topics-related-time">
                              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true, locale: ko })}
                            </span>
                          </div>
                          <h4 className="topics-related-question-title">{question.title}</h4>
                          <p className="topics-related-question-excerpt">
                            {question.content.length > 120
                              ? `${question.content.slice(0, 120)}...`
                              : question.content}
                          </p>
                          <div className="topics-related-stats">
                            <span>답변 {question.answerCount}</span>
                          </div>
                        </Link>
                      ))}

                      {!hasMore && questions.length > 0 && (
                        <div className="topics-related-footer">더 볼 질문이 없습니다.</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

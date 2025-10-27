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

export default function RelatedQuestionsFeed({ followingTopics }: RelatedQuestionsFeedProps) {
  const [topicQuestions, setTopicQuestions] = useState<Map<number, QuestionSummary[]>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadQuestions() {
      if (followingTopics.length === 0) {
        setTopicQuestions(new Map())
        return
      }

      setIsLoading(true)
      try {
        const entries = await Promise.all(
          followingTopics.map(async (topic) => {
            const slug = topic.slug ?? topic.id
            try {
              const res = await fetch(`/api/topics/${slug}?limit=3`, { cache: 'no-store' })
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

              return [topic.id, mapped] as const
            } catch (error) {
              console.error('[RelatedQuestionsFeed] loadQuestions failed:', error)
              return [topic.id, []] as const
            }
          })
        )

        if (!ignore) {
          setTopicQuestions(new Map(entries))
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadQuestions()
    return () => {
      ignore = true
    }
  }, [followingTopics])

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

        {isLoading ? (
          <div className="topics-related-loading">질문을 불러오는 중입니다...</div>
        ) : (
          <div className="topics-related-grid">
            {followingTopics.map((topic) => {
              const questions = topicQuestions.get(topic.id) || []

              return (
                <div key={topic.id} className="topics-related-card">
                  <div className="topics-related-card-header">
                    <h3>{topic.name}</h3>
                    <Link href={`/topics/${topic.slug ?? topic.id}`} className="topics-related-card-link">
                      더보기 →
                    </Link>
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

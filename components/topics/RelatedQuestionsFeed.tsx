'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Topic {
  id: number
  name: string
  icon: string
  slug?: string
}

interface Question {
  id: string
  title: string
  excerpt: string
  author: string
  answerCount: number
  viewCount: number
  createdAt: Date
  topicId: number
}

interface RelatedQuestionsFeedProps {
  followingTopics: Topic[]
}

// Mock 질문 데이터 (베트남인 관련)
const MOCK_QUESTIONS: Question[] = [
  // 비자 관련
  { id: '1', topicId: 1, title: 'E-9 비자 연장할 때 꼭 필요한 서류가 뭔가요?', excerpt: '제조업체에서 일하고 있는데 비자 연장 준비를 하려고 합니다...', author: '응우옌', answerCount: 5, viewCount: 234, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '2', topicId: 1, title: 'F-6 결혼비자로 변경하는 절차 알려주세요', excerpt: '한국인과 결혼했는데 F-6 비자로 바꾸고 싶어요...', author: '쩐티', answerCount: 8, viewCount: 456, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: '3', topicId: 1, title: '체류자격 변경 신청은 언제까지 해야 하나요?', excerpt: '지금 D-2 비자인데 E-7로 바꾸려고 하는데...', author: '레', answerCount: 3, viewCount: 189, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8) },

  // 취업 관련
  { id: '4', topicId: 2, title: '한국 회사 면접 볼 때 주의할 점 있나요?', excerpt: '다음 주에 면접이 있는데 한국 회사 면접 문화를 잘 몰라서...', author: '팜', answerCount: 12, viewCount: 678, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
  { id: '5', topicId: 2, title: '근로계약서에서 확인해야 할 항목은?', excerpt: '처음 일자리를 구했는데 계약서를 잘 이해 못해서요...', author: '도', answerCount: 7, viewCount: 423, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) },
  { id: '6', topicId: 2, title: '직장에서 부당한 대우 받을 때 어디에 신고하나요?', excerpt: '월급도 제대로 안주고 차별도 심한데...', author: '흐엉', answerCount: 15, viewCount: 892, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1) },

  // 법률 관련
  { id: '7', topicId: 3, title: '보증금 안 돌려주는 집주인 어떻게 해야 하나요?', excerpt: '계약 끝났는데 집주인이 보증금을 안 돌려줘요...', author: '린', answerCount: 9, viewCount: 567, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) },
  { id: '8', topicId: 3, title: '외국인도 무료 법률 상담 받을 수 있나요?', excerpt: '법률 문제가 있는데 돈이 없어서...', author: '민', answerCount: 6, viewCount: 345, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7) },
  { id: '9', topicId: 3, title: '근로계약 위반으로 소송하려면?', excerpt: '회사가 계약을 안 지키고 있어요...', author: '투이', answerCount: 4, viewCount: 278, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10) },

  // 생활 관련
  { id: '10', topicId: 4, title: '한국 지하철 환승하는 방법 알려주세요', excerpt: '서울 지하철이 너무 복잡해서 어렵네요...', author: '카잉', answerCount: 11, viewCount: 723, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '11', topicId: 4, title: '외국인도 핸드폰 할부로 살 수 있나요?', excerpt: '새 핸드폰 사고 싶은데 외국인도 할부가 되나요...', author: '탄', answerCount: 8, viewCount: 512, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: '12', topicId: 4, title: '한국 겨울 날씨 대비 어떻게 해야 하나요?', excerpt: '베트남은 따뜻한데 한국 겨울이 너무 추워요...', author: '리엔', answerCount: 14, viewCount: 891, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1) },

  // 한국어 학습
  { id: '13', topicId: 9, title: 'TOPIK 3급 합격하려면 어떻게 공부해야 하나요?', excerpt: '다음 달에 시험인데 준비 방법 좀 알려주세요...', author: '부이', answerCount: 18, viewCount: 1234, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
  { id: '14', topicId: 9, title: '직장에서 쓰는 한국어 존댓말 배우고 싶어요', excerpt: '회사에서 말할 때 실수가 많아서...', author: '쯩', answerCount: 10, viewCount: 678, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) },
  { id: '15', topicId: 9, title: '무료로 한국어 배울 수 있는 곳 있나요?', excerpt: '돈이 없어서 무료 한국어 교육 찾고 있어요...', author: '둥', answerCount: 13, viewCount: 945, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) }
]

export default function RelatedQuestionsFeed({ followingTopics }: RelatedQuestionsFeedProps) {
  const [topicQuestions, setTopicQuestions] = useState<Map<number, Question[]>>(new Map())

  useEffect(() => {
    // 구독 중인 토픽별로 관련 질문 필터링 (각 토픽당 최신 3개)
    const questionsMap = new Map<number, Question[]>()

    followingTopics.forEach(topic => {
      const relatedQuestions = MOCK_QUESTIONS
        .filter(q => q.topicId === topic.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3)

      if (relatedQuestions.length > 0) {
        questionsMap.set(topic.id, relatedQuestions)
      }
    })

    setTopicQuestions(questionsMap)
  }, [followingTopics])

  if (followingTopics.length === 0 || topicQuestions.size === 0) {
    return null
  }

  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <h2 className="section-title" style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
        🔥 구독 중인 토픽의 최신 질문
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {followingTopics.map(topic => {
          const questions = topicQuestions.get(topic.id)
          if (!questions || questions.length === 0) return null

          return (
            <div key={topic.id} className="section" style={{ padding: 'var(--space-md)' }}>
              {/* 토픽 헤더 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-md)',
                paddingBottom: 'var(--space-sm)',
                borderBottom: '2px solid var(--color-blue-100)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{topic.icon}</span>
                  <h3 style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 600,
                    color: 'var(--foreground)'
                  }}>
                    {topic.name}
                  </h3>
                  <span style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--muted-foreground)',
                    background: 'var(--muted)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {questions.length}개 질문
                  </span>
                </div>
                <Link
                  href={`/categories/${topic.slug || topic.name.toLowerCase()}`}
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-blue-600)',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                  className="hover:underline"
                >
                  더보기 →
                </Link>
              </div>

              {/* 질문 목록 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {questions.map(question => (
                  <Link
                    key={question.id}
                    href={`/questions/${question.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                        e.currentTarget.style.borderColor = '#d1d5db'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
                        e.currentTarget.style.borderColor = '#e5e7eb'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* 왼쪽: 아바타 */}
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#93c5fd"/>
                            <path d="M12 14C6.48 14 2 16.48 2 19.5V22H22V19.5C22 16.48 17.52 14 12 14Z" fill="#93c5fd"/>
                          </svg>
                        </div>

                        {/* 중앙: 콘텐츠 */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* 카테고리 */}
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            marginBottom: '0.25rem',
                            fontWeight: 500
                          }}>
                            {topic.name}
                          </div>

                          {/* 사용자명 + 시간 */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem',
                            fontSize: '0.875rem'
                          }}>
                            <span style={{ color: '#3b82f6', fontWeight: 500 }}>
                              {question.author}
                            </span>
                            <span style={{ color: '#9ca3af' }}>·</span>
                            <span style={{ color: '#9ca3af' }}>
                              {formatDistanceToNow(question.createdAt, {
                                addSuffix: true,
                                locale: ko
                              })}
                            </span>
                          </div>

                          {/* 질문 제목 */}
                          <h4 style={{
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: '#111827',
                            marginBottom: '0.5rem',
                            lineHeight: 1.4
                          }}>
                            {question.title}
                          </h4>

                          {/* 질문 내용 미리보기 */}
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '1rem',
                            lineHeight: 1.6,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {question.excerpt}
                          </p>

                          {/* 하단: 답변 정보 */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 2C5.58172 2 2 5.58172 2 10C2 12.3869 3.00258 14.5515 4.60645 16.0571L3.5 18L5.44355 16.8936C6.85645 17.5936 8.3768 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 4C13.3375 4 16 6.66246 16 10C16 13.3375 13.3375 16 10 16C8.66246 16 7.40129 15.5515 6.37097 14.8065L4 16L4.69355 14.1294C3.68817 13.0451 3 11.5936 3 10C3 6.66246 5.66246 4 10 4Z"/>
                              </svg>
                              <span style={{
                                fontSize: '0.875rem',
                                color: '#3b82f6',
                                fontWeight: 500
                              }}>
                                {question.answerCount}명의 Certified User 답변했어요
                              </span>
                            </div>

                            {/* 우측: 액션 아이콘들 */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <button
                                style={{
                                  padding: '0.5rem',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#9ca3af',
                                  transition: 'color 0.2s'
                                }}
                                onClick={(e) => e.preventDefault()}
                              >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 10.5C2 10.224 2.224 10 2.5 10H9.5C9.776 10 10 10.224 10 10.5V17.5C10 17.776 9.776 18 9.5 18H2.5C2.224 18 2 17.776 2 17.5V10.5ZM10 2.5C10 2.224 10.224 2 10.5 2H17.5C17.776 2 18 2.224 18 2.5V9.5C18 9.776 17.776 10 17.5 10H10.5C10.224 10 10 9.776 10 9.5V2.5Z"/>
                                </svg>
                              </button>
                              <button
                                style={{
                                  padding: '0.5rem',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#9ca3af',
                                  transition: 'color 0.2s'
                                }}
                                onClick={(e) => e.preventDefault()}
                              >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M18 10C18 5.582 14.418 2 10 2C5.582 2 2 5.582 2 10C2 14.418 5.582 18 10 18C14.418 18 18 14.418 18 10ZM10 4C13.314 4 16 6.686 16 10C16 13.314 13.314 16 10 16C6.686 16 4 13.314 4 10C4 6.686 6.686 4 10 4Z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

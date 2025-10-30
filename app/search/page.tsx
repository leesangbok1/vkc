'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'
import FeedCard, { type FeedCardActionProps, type FeedCardAuthor } from '@/components/feed/FeedCard'

type SearchResult = {
  id: string
  type: 'question' | 'post'
  title: string
  content: string
  created_at: string
  answer_count?: number
  helpful_count?: number
  comment_count?: number
  category?: { name?: string | null; slug?: string | null }
  author?: {
    id: string
    name: string | null
    role: string | null
    avatar_url?: string | null
  } | null
}

function SearchPageInner() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(Array.isArray(data.results) ? data.results : [])
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  return (
    <PageLayout variant="centered">
      <div className="search-page-container">
        {/* Search Results Header */}
        <div className="search-page-header">
          <h1 className="search-page-title section-title">
            🔍 '{query}' 검색 결과
          </h1>
          <p className="search-page-subtitle">
            {loading ? '검색 중...' : `${results.length}개의 결과를 찾았습니다.`}
          </p>
        </div>

        {loading ? (
          <div className="search-skeleton-list">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card skeleton search-skeleton-card">
                <div className="search-skeleton-title"></div>
                <div className="search-skeleton-subtitle"></div>
                <div className="search-skeleton-meta"></div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty-state">
            <div className="search-empty-icon">🔍</div>
            <h3 className="search-empty-title">
              검색 결과가 없습니다
            </h3>
            <p className="search-empty-message">
              '{query}'에 대한 질문을 찾을 수 없습니다.
            </p>
            <Link href="/questions/new">
              <button className="btn btn-primary">
                새 질문하기
              </button>
            </Link>
          </div>
        ) : (
          <div className="feed-container search-results-list">
            {results.map((result, index) => {
              const isQuestion = result.type !== 'post'
              const answerCount = Number(result.answer_count ?? 0)
              const commentCount = Number(result.comment_count ?? 0)
              const stats = isQuestion
                ? <span>답변 {answerCount.toLocaleString()}개</span>
                : <span>댓글 {commentCount.toLocaleString()}개</span>
              const author: FeedCardAuthor | undefined =
                result.author && typeof result.author === 'object'
                  ? {
                      id: result.author.id,
                      name: result.author.name ?? '커뮤니티 멤버',
                      role: result.author.role ?? undefined,
                      avatarUrl: result.author.avatar_url ?? undefined,
                    }
                  : undefined
              const actionProps: FeedCardActionProps = {
                targetType: result.type,
                helpfulCount: Number(result.helpful_count ?? 0),
              }

              return (
                <FeedCard
                  key={`${result.id}-${index}`}
                  id={result.id}
                  itemType={isQuestion ? 'question' : 'post'}
                  title={result.title ?? '제목 없음'}
                  body={result.content ?? ''}
                  href={isQuestion ? `/questions/${result.id}` : `/posts/${result.id}`}
                  createdAt={result.created_at ?? new Date().toISOString()}
                  topic={result.category?.name ?? undefined}
                  author={author}
                  stats={stats}
                  badge={undefined}
                  actionProps={actionProps}
                  showReportButton={isQuestion}
                />
              )
            })}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<PageLayout variant="centered"><div className="search-page-container">로딩 중...</div></PageLayout>}>
      <SearchPageInner />
    </Suspense>
  )
}

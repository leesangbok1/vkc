'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
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
          setResults(data.results || [])
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
            {results.map((result: any, index: number) => (
              <div key={index} className="question-card">
                <h3 className="question-title">
                  <Link href={`/questions/${result.id}`} className="question-link">
                    {result.title}
                  </Link>
                </h3>
                <p className="question-content">
                  {result.content}
                </p>
                <div className="question-stats">
                  <div className="stat-item">
                    <span>💬</span>
                    <span>답변 {result.answer_count || 0}개</span>
                  </div>
                  <div className="stat-item">
                    <span>👁️</span>
                    <span>조회 {result.view_count || 0}회</span>
                  </div>
                  <div className="stat-item">
                    <span>{result.created_at ? new Date(result.created_at).toLocaleDateString('ko-KR') : '날짜 미상'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

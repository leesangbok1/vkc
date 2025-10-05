'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/lib/supabase'
import { QuestionCard } from './QuestionCard'
import { SearchBox } from '../search/SearchBox'
import { CategoryFilter } from './CategoryFilter'
import { Pagination } from '../ui/Pagination'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { Alert } from '../ui/alert'
import { SidebarPromotionBanner, ContentBanner } from '../banners/ValuePropositionBanner'

type Question = Database['public']['Tables']['questions']['Row'] & {
  author: Database['public']['Tables']['users']['Row']
  category: Database['public']['Tables']['categories']['Row']
}

interface QuestionListResponse {
  data: Question[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface QuestionListProps {
  initialData?: QuestionListResponse
  className?: string
}

export function QuestionList({ initialData, className }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>(initialData?.data || [])
  const [pagination, setPagination] = useState(initialData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<'created_at' | 'popularity' | 'views' | 'answers'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Fetch questions with current filters
  const fetchQuestions = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sort: sortBy,
        order: sortOrder,
      })

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      if (selectedCategory) {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/questions?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }

      const data: QuestionListResponse = await response.json()
      setQuestions(data.data)
      setPagination(data.pagination)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Effect for initial load and filter changes
  useEffect(() => {
    if (!initialData) {
      fetchQuestions(1)
    }
  }, [searchQuery, selectedCategory, sortBy, sortOrder])

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Handle category filter
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  // Handle sorting
  const handleSortChange = (sort: typeof sortBy) => {
    setSortBy(sort)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchQuestions(page)
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchQuestions(pagination.page)
  }

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <h4 className="font-medium">오류가 발생했습니다</h4>
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
            다시 시도
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <SearchBox
              onSearch={handleSearch}
              placeholder="질문을 검색하세요..."
              defaultValue={searchQuery}
            />

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />

              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="created_at">최신순</option>
                  <option value="popularity">인기순</option>
                  <option value="views">조회순</option>
                  <option value="answers">답변순</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {!loading && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                총 {pagination.total.toLocaleString()}개의 질문
                {searchQuery && ` · "${searchQuery}" 검색 결과`}
                {selectedCategory && ` · ${selectedCategory} 카테고리`}
              </p>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                새로고침
              </Button>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-4">
            {loading ? (
              // Loading skeleton
              <>
                {Array.from({ length: pagination.limit }).map((_, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-14" />
                    </div>
                  </div>
                ))}
              </>
            ) : questions.length > 0 ? (
              // Question cards with intermittent content banners
              <>
                {questions.map((question, index) => (
                  <div key={question.id}>
                    <QuestionCard question={question} />
                    {/* 매 5번째 질문 후에 콘텐츠 배너 */}
                    {(index + 1) % 5 === 0 && index < questions.length - 1 && (
                      <div className="my-4">
                        <ContentBanner />
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              // Empty state
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || selectedCategory ? '검색 결과가 없습니다' : '아직 등록된 질문이 없습니다'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || selectedCategory
                    ? '다른 검색어나 카테고리로 시도해보세요.'
                    : '첫 번째 질문을 등록해보세요!'
                  }
                </p>
                {!searchQuery && !selectedCategory && (
                  <Button>
                    질문 등록하기
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-6">
            {/* Sidebar Promotion Banner */}
            <SidebarPromotionBanner />
          </div>
        </div>
      </div>
    </div>
  )
}
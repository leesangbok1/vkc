'use client'
import { useState, useEffect } from 'react'
import { QuestionCard } from './QuestionCard'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface Question {
  id: string
  title: string
  content: string
  created_at: string
  view_count: number
  category: string
  tags: string[] | null
  users: {
    id: string
    name: string
    avatar_url: string
  }
}

interface QuestionListProps {
  searchParams: {
    page?: string
    category?: string
    search?: string
    sort?: string
    order?: string
  }
}

export function QuestionList({ searchParams }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchQuestions = async () => {
    setLoading(true)

    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    try {
      const response = await fetch(`/api/questions?${params}`)
      const data = await response.json()

      if (response.ok) {
        setQuestions(data.questions)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching questions:', data.error)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [searchParams])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">질문이 없습니다.</p>
        <Button onClick={fetchQuestions} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 질문 카드 목록 */}
      <div className="space-y-4">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => {
              const params = new URLSearchParams(window.location.search)
              params.set('page', (pagination.page - 1).toString())
              window.history.pushState(null, '', `?${params}`)
            }}
          >
            이전
          </Button>

          <span className="flex items-center px-4">
            {pagination.page} / {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => {
              const params = new URLSearchParams(window.location.search)
              params.set('page', (pagination.page + 1).toString())
              window.history.pushState(null, '', `?${params}`)
            }}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )
}
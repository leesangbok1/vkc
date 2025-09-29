'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

interface QuestionFiltersProps {
  categories: Category[]
}

export function QuestionFilters({ categories }: QuestionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const currentCategory = searchParams.get('category')
  const currentSort = searchParams.get('sort') || 'created_at'
  const currentOrder = searchParams.get('order') || 'desc'

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // 페이지는 1로 리셋
    params.set('page', '1')

    router.push(`/questions?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', searchTerm.trim() || null)
  }

  const clearFilters = () => {
    setSearchTerm('')
    router.push('/questions')
  }

  const sortOptions = [
    { value: 'created_at:desc', label: '최신순' },
    { value: 'created_at:asc', label: '오래된순' },
    { value: 'view_count:desc', label: '조회수순' },
    { value: 'title:asc', label: '제목순' },
  ]

  return (
    <div className="space-y-6">
      {/* 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">검색</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-3">
            <Input
              placeholder="질문 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              검색
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 카테고리 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">카테고리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <button
              onClick={() => updateFilters('category', null)}
              className={`w-full text-left p-2 rounded-md transition-colors ${
                !currentCategory
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-100'
              }`}
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => updateFilters('category', category.id)}
                className={`w-full text-left p-2 rounded-md transition-colors ${
                  currentCategory === category.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 정렬 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">정렬</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortOptions.map((option) => {
              const [sort, order] = option.value.split(':')
              const isActive = currentSort === sort && currentOrder === order

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    updateFilters('sort', sort)
                    updateFilters('order', order)
                  }}
                  className={`w-full text-left p-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 필터 초기화 */}
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full"
      >
        <X className="mr-2 h-4 w-4" />
        필터 초기화
      </Button>
    </div>
  )
}
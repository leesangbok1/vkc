import { createSupabaseServerClient } from '@/lib/supabase'
import { QuestionList } from '@/components/features/questions/QuestionList'
import { QuestionFilters } from '@/components/features/questions/QuestionFilters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

interface QuestionsPageProps {
  searchParams: {
    page?: string
    category?: string
    search?: string
    sort?: string
    order?: string
  }
}

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  const supabase = createSupabaseServerClient()

  // 카테고리 목록 조회 (현재 스키마에서는 단순한 문자열이므로 고정 값 사용)
  const categories = [
    { id: '일반', name: '일반', icon: '📝', color: '#6B7280' },
    { id: '취업', name: '취업', icon: '💼', color: '#3B82F6' },
    { id: '비자', name: '비자', icon: '📄', color: '#10B981' },
    { id: '주거', name: '주거', icon: '🏠', color: '#F59E0B' },
    { id: '교육', name: '교육', icon: '📚', color: '#8B5CF6' },
    { id: '문화', name: '문화', icon: '🎭', color: '#EF4444' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">질문 목록</h1>
        <Link href="/questions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            질문하기
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 필터 사이드바 */}
        <div className="lg:col-span-1">
          <QuestionFilters categories={categories} />
        </div>

        {/* 질문 목록 */}
        <div className="lg:col-span-3">
          <Suspense fallback={<QuestionListSkeleton />}>
            <QuestionList searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function QuestionListSkeleton() {
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
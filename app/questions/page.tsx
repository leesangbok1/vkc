import { Suspense } from 'react'
import Link from 'next/link'
import { QuestionList } from '@/components/questions/QuestionList'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

// Loading skeleton component
function QuestionListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search and filters skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Question cards skeleton */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border rounded-lg p-6 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-14" />
          </div>
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function QuestionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">질문과 답변</h1>
                <p className="text-muted-foreground">
                  베트남인들을 위한 한국 생활 질문과 답변을 찾아보세요.
                </p>
              </div>
              <Link href="/questions/new" className="mt-4 sm:mt-0">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  질문하기
                </Button>
              </Link>
            </div>

            {/* Question List with integrated search and filters */}
            <Suspense fallback={<QuestionListSkeleton />}>
              <QuestionList className="space-y-6" />
            </Suspense>
          </main>

          {/* Sidebar */}
          <aside className="lg:w-80 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">빠른 질문하기</h3>
              <div className="space-y-3">
                <Link href="/questions/new">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    새 질문 등록
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  자주 묻는 질문
                </Button>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">인기 태그</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  '비자', '취업', '보험', '주거', '교육',
                  '의료', '쇼핑', '교통', '언어', '문화'
                ].map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">최근 활동</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>새로운 답변 5개</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>새로운 질문 12개</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>해결된 문제 8개</span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">도움이 필요하신가요?</h3>
              <p className="text-blue-700 text-sm mb-4">
                질문 작성 가이드를 확인하여 더 나은 답변을 받아보세요.
              </p>
              <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                가이드 보기
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
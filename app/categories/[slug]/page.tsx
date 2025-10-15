'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const categoryMap: Record<string, { name: string; icon: string; description: string }> = {
  visa: {
    name: '비자',
    icon: '🛂',
    description: '비자 신청, 연장, 변경에 대한 모든 정보'
  },
  employment: {
    name: '취업',
    icon: '💼',
    description: '구직, 이직, 워킹비자 관련 정보'
  },
  legal: {
    name: '법률',
    icon: '⚖️',
    description: '한국 생활 관련 법률 상담'
  },
  life: {
    name: '생활',
    icon: '🍜',
    description: '일상생활 팁과 정보'
  },
  education: {
    name: '교육',
    icon: '🎓',
    description: '교육 기관, 학업 관련 정보'
  },
  housing: {
    name: '주거',
    icon: '🏠',
    description: '주택, 임대 관련 정보'
  },
  healthcare: {
    name: '의료',
    icon: '🏥',
    description: '병원, 건강보험 관련 정보'
  }
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  const category = categoryMap[slug]

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/questions?category=${slug}`)
        if (response.ok) {
          const data = await response.json()
          setQuestions(data.questions || [])
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchQuestions()
    }
  }, [slug])

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">카테고리를 찾을 수 없습니다</h1>
          <Link href="/">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              홈으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-gray-900">
              VietKConnect
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/questions/new">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  질문하기
                </button>
              </Link>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                로그인
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-4">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-lg text-gray-600 mt-2">{category.description}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link href="/questions/new">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {category.name} 질문하기
              </button>
            </Link>
            <Link href="/">
              <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                다른 카테고리 보기
              </button>
            </Link>
          </div>
        </div>

        {/* Questions List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {category.name} 관련 질문들
          </h2>
          <p className="text-gray-600">
            {loading ? '질문을 불러오는 중...' : `${questions.length}개의 질문이 있습니다.`}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="mb-4">
              <span className="text-6xl">{category.icon}</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              아직 {category.name} 질문이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              첫 번째 {category.name} 질문을 작성해보세요!
            </p>
            <Link href="/questions/new">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                첫 질문 작성하기
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <Link href={`/questions/${question.id}`} className="hover:text-blue-600">
                        {question.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {question.content}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>답변 {question.answer_count || 0}개</span>
                      <span>조회 {question.view_count || 0}회</span>
                      <span>{question.created_at ? new Date(question.created_at).toLocaleDateString('ko-KR') : '날짜 미상'}</span>
                      {question.author && (
                        <span>작성자: {question.author.name}</span>
                      )}
                    </div>
                  </div>
                  {question.status === 'resolved' && (
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ 해결됨
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
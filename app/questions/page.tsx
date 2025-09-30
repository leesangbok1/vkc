'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../src/services/AuthContext'

interface Question {
  id: string
  title: string
  content: string
  category: string
  author: string
  created_at: string
  view_count: number
  answer_count: number
}

export default function QuestionsPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: '전체', icon: 'fas fa-list' },
    { id: 'visa', name: '비자/체류', icon: 'fas fa-passport' },
    { id: 'employment', name: '취업/직장', icon: 'fas fa-briefcase' },
    { id: 'education', name: '교육/학습', icon: 'fas fa-graduation-cap' },
    { id: 'life', name: '생활정보', icon: 'fas fa-home' },
    { id: 'health', name: '의료/건강', icon: 'fas fa-heartbeat' },
    { id: 'finance', name: '금융/세금', icon: 'fas fa-won-sign' },
    { id: 'culture', name: '문화/여행', icon: 'fas fa-map-marked-alt' },
    { id: 'other', name: '기타', icon: 'fas fa-ellipsis-h' }
  ]

  // Mock data for demonstration
  useEffect(() => {
    const mockQuestions: Question[] = [
      {
        id: '1',
        title: '한국에서 비자 연장 신청 방법이 궁금합니다',
        content: '학생비자(D-2)에서 취업비자(E-7)로 변경하려고 하는데 필요한 서류와 절차를 알고 싶습니다.',
        category: 'visa',
        author: '베트남학생',
        created_at: '2024-01-15T10:30:00Z',
        view_count: 127,
        answer_count: 3
      },
      {
        id: '2',
        title: '서울에서 베트남 음식 재료 구매할 수 있는 곳',
        content: '베트남 요리를 해먹고 싶은데 어디서 재료를 구할 수 있을까요?',
        category: 'life',
        author: '호치민출신',
        created_at: '2024-01-14T15:20:00Z',
        view_count: 89,
        answer_count: 5
      },
      {
        id: '3',
        title: '한국 회사에서 일할 때 주의사항',
        content: '한국 회사 문화와 업무 방식에 대해 조언 부탁드립니다.',
        category: 'employment',
        author: '신입사원',
        created_at: '2024-01-13T09:45:00Z',
        view_count: 203,
        answer_count: 7
      }
    ]

    setTimeout(() => {
      setQuestions(mockQuestions)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredQuestions = selectedCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">질문과 답변</h1>
            <p className="text-muted-foreground">
              궁금한 것이 있으면 언제든 질문하고 도움을 받으세요
            </p>
          </div>
          {user && (
            <Link href="/questions/new" className="mt-4 sm:mt-0">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                <i className="fas fa-plus mr-2"></i>
                질문하기
              </button>
            </Link>
          )}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">카테고리</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <i className={`${category.icon} mr-2`}></i>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="p-8 text-center">
                <i className="fas fa-question-circle text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">
                  {selectedCategory === 'all'
                    ? '아직 질문이 없습니다. 첫 번째 질문을 올려보세요!'
                    : '이 카테고리에는 아직 질문이 없습니다.'
                  }
                </p>
                {user && (
                  <Link href="/questions/new" className="inline-block mt-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">질문하기</button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div key={question.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/questions/${question.id}`}>
                        <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors cursor-pointer">
                          {question.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>
                          <i className="fas fa-user mr-1"></i>
                          {question.author}
                        </span>
                        <span>
                          <i className="fas fa-calendar mr-1"></i>
                          {formatDate(question.created_at)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          categories.find(c => c.id === question.category)?.name === '비자/체류' ? 'bg-blue-100 text-blue-800' :
                          categories.find(c => c.id === question.category)?.name === '생활정보' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {categories.find(c => c.id === question.category)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {question.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      <i className="fas fa-eye mr-1"></i>
                      조회 {question.view_count}
                    </span>
                    <span>
                      <i className="fas fa-comments mr-1"></i>
                      답변 {question.answer_count}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination would go here */}
        {filteredQuestions.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <button className="border border-gray-300 text-gray-500 px-3 py-1 rounded text-sm" disabled>
                이전
              </button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                1
              </button>
              <button className="border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded text-sm">
                2
              </button>
              <button className="border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded text-sm">
                3
              </button>
              <button className="border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded text-sm">
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
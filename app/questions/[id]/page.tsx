'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSafeAuth } from "@/components/providers/ClientProviders"
import QuestionDetail from '@/components/questions/QuestionDetail'
import AnswerList from '@/components/answers/AnswerList'
import AnswerForm from '@/components/answers/AnswerForm'
import { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['users']['Row']

type Question = Database['public']['Tables']['questions']['Row'] & {
  category: Database['public']['Tables']['categories']['Row']
  author: Profile
  vote_score: number
  answers: Answer[]
}

type Answer = Database['public']['Tables']['answers']['Row'] & {
  author: Profile
  is_helpful: boolean
  vote_score: number
}

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useSafeAuth()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const questionId = params.id as string

  // Fetch question details
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/questions/${questionId}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch question')
        }

        setQuestion(result.data)
      } catch (err) {
        console.error('Error fetching question:', err)
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    if (questionId) {
      fetchQuestion()
    }
  }, [questionId, refreshKey])

  // Handle new answer submission
  const handleNewAnswer = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Handle vote update
  const handleVoteUpdate = (newVoteScore: number) => {
    if (question) {
      setQuestion(prev => prev ? { ...prev, vote_score: newVoteScore } : null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h2 className="text-xl font-semibold text-red-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                다시 시도
              </button>
              <Link href="/questions">
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                  목록으로 돌아가기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <i className="fas fa-question-circle text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">질문을 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">요청하신 질문이 존재하지 않거나 삭제되었습니다.</p>
            <Link href="/questions">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                목록으로 돌아가기
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              홈
            </Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <Link href="/questions" className="hover:text-blue-600 transition-colors">
              질문과 답변
            </Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-gray-900">{question.title}</span>
          </div>
        </nav>

        {/* Question Detail */}
        <QuestionDetail
          question={question}
          currentUser={profile as Profile | null}
          onVoteUpdate={handleVoteUpdate}
        />

        {/* Answer Form (for authenticated users) */}
        {user && profile && (
          <div className="mt-8">
            <AnswerForm
              questionId={question.id}
              onAnswerSubmitted={handleNewAnswer}
            />
          </div>
        )}

        {/* Login prompt for non-authenticated users */}
        {!user && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <i className="fas fa-sign-in-alt text-3xl text-blue-600 mb-3"></i>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">답변을 작성하려면 로그인하세요</h3>
            <p className="text-blue-600 mb-4">
              이 질문에 도움이 되는 답변을 남겨주세요. 로그인 후 답변을 작성할 수 있습니다.
            </p>
            <button
              onClick={() => {
                // You would trigger the login modal here
                // This would connect with the existing LoginModal component
                console.log('Trigger login modal')
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              로그인하기
            </button>
          </div>
        )}

        {/* Answers List */}
        <div className="mt-8">
          <AnswerList
            answers={question.answers || []}
            questionAuthorId={question.author.id}
            currentUser={profile as Profile | null}
            onAnswerUpdate={handleNewAnswer}
          />
        </div>

        {/* Related Questions (placeholder for future implementation) */}
        <div className="mt-12 border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">관련 질문</h3>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">관련 질문 기능은 곧 추가될 예정입니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
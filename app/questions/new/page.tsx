'use client'

import { Suspense } from 'react'
import QuestionForm from '@/components/questions/QuestionForm'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function NewQuestionPage() {
  const handleSuccess = () => {
    // This will be called when question is successfully created
    // The QuestionForm component will handle navigation to the question page
  }

  const handleCancel = () => {
    // Navigate back to questions list
    window.history.back()
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/questions"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  질문 목록으로
                </Link>
                <div className="flex items-center">
                  <HelpCircle className="w-6 h-6 text-primary-500 mr-2" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    새 질문 작성
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            💡 좋은 질문을 위한 가이드라인
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">✅ 이렇게 해주세요</h3>
              <ul className="space-y-1">
                <li>• 구체적인 상황을 설명해주세요</li>
                <li>• 시도해본 것들을 알려주세요</li>
                <li>• 궁금한 점을 명확히 적어주세요</li>
                <li>• 관련 서류나 기관 정보를 포함해주세요</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">❌ 피해주세요</h3>
              <ul className="space-y-1">
                <li>• 너무 짧거나 모호한 질문</li>
                <li>• 개인정보 노출 (여권번호, 주소 등)</li>
                <li>• 중복된 질문 (검색 먼저 해보세요)</li>
                <li>• 법적 조언이 필요한 복잡한 사안</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Question Form */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-3 text-gray-600">질문 작성 폼을 불러오는 중...</span>
              </div>
            }>
              <QuestionForm
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </Suspense>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🆘 도움이 필요하신가요?
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">자주 묻는 질문들</h4>
              <ul className="space-y-1">
                <li>• <Link href="/questions?category=visa-legal" className="text-primary-600 hover:underline">비자 관련 질문들</Link></li>
                <li>• <Link href="/questions?category=job-business" className="text-primary-600 hover:underline">취업/창업 관련</Link></li>
                <li>• <Link href="/questions?category=life-info" className="text-primary-600 hover:underline">생활정보 관련</Link></li>
                <li>• <Link href="/questions?category=education-language" className="text-primary-600 hover:underline">교육/언어 관련</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">커뮤니티 규칙</h4>
              <ul className="space-y-1">
                <li>• 서로 존중하고 도움이 되는 답변을 해주세요</li>
                <li>• 정확하지 않은 정보는 피해주세요</li>
                <li>• 개인적인 공격이나 차별은 금지입니다</li>
                <li>• 궁금한 점은 언제든 문의해주세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
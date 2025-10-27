'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSafeAuth } from '@/components/providers/ClientProviders'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Send, Tag } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  icon: string
  color: string
}

interface QuestionFormProps {
  categories?: Category[]
  onSuccess?: () => void
  onCancel?: () => void
}

// Mock categories for development
const defaultCategories: Category[] = [
  { id: 1, name: '비자/법률', slug: 'visa-legal', icon: '🛂', color: '#EA4335' },
  { id: 2, name: '취업/창업', slug: 'job-business', icon: '💼', color: '#4285F4' },
  { id: 3, name: '생활정보', slug: 'life-info', icon: '🏠', color: '#34A853' },
  { id: 4, name: '교육/언어', slug: 'education-language', icon: '📚', color: '#FBBC04' },
  { id: 5, name: '의료/건강', slug: 'health-medical', icon: '🏥', color: '#FF6D01' },
  { id: 6, name: '금융/세금', slug: 'finance-tax', icon: '💰', color: '#9AA0A6' },
  { id: 7, name: '부동산', slug: 'real-estate', icon: '🏢', color: '#AB47BC' },
  { id: 8, name: '문화/여행', slug: 'culture-travel', icon: '🎭', color: '#FF7043' },
  { id: 9, name: '기술/IT', slug: 'tech-it', icon: '💻', color: '#26C6DA' },
  { id: 10, name: '기타', slug: 'others', icon: '❓', color: '#78909C' }
]

export default function QuestionForm({
  categories = defaultCategories,
  onSuccess,
  onCancel
}: QuestionFormProps) {
  const router = useRouter()
  const { user } = useSafeAuth()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    tags: '',
    urgency: 'normal'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('질문을 작성하려면 로그인이 필요합니다.')
      return
    }

    if (!formData.title.trim() || !formData.content.trim() || !formData.category_id) {
      setError('제목, 내용, 카테고리를 모두 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5) // 최대 5개 태그

      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category_id: parseInt(formData.category_id),
          tags,
          urgency: formData.urgency
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '질문 작성에 실패했습니다.')
      }

      const result = await response.json()

      // 성공 처리
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/questions/${result.data.id}`)
      }

    } catch (error) {
      console.error('Question submission error:', error)
      setError(error instanceof Error ? error.message : '질문 작성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            질문을 작성하려면 로그인이 필요합니다.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            질문 제목 *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="예: E-7 비자 신청 시 필요한 서류가 궁금합니다"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            maxLength={200}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/200자
          </p>
        </div>

        {/* 카테고리 */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
            카테고리 *
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">카테고리를 선택하세요</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 내용 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            질문 내용 *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="구체적인 상황과 질문 내용을 자세히 적어주세요.

예시:
- 현재 상황: D-2 비자로 한국에 거주 중, 대학원 졸업 예정
- 궁금한 점: E-7 비자 신청을 위해 제가 개인적으로 준비해야 할 서류
- 특히 알고 싶은 것: 베트남에서 가져와야 하는 서류나 번역이 필요한 것들

자세한 정보를 제공해주시면 더 정확한 답변을 받을 수 있습니다."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={8}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            최소 10자 이상 작성해주세요. (현재: {formData.content.length}자)
          </p>
        </div>

        {/* 태그 */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="inline w-4 h-4 mr-1" />
            태그 (선택사항)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="E-7비자, 서류, 취업 (콤마로 구분, 최대 5개)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            콤마(,)로 구분하여 최대 5개까지 입력 가능
          </p>
        </div>

        {/* 긴급도 */}
        <div>
          <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
            긴급도
          </label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="low">🟢 낮음 - 여유 있게 답변 받고 싶어요</option>
            <option value="normal">🟡 보통 - 일반적인 질문입니다</option>
            <option value="high">🟠 높음 - 빠른 답변이 필요해요</option>
            <option value="urgent">🔴 긴급 - 매우 급해요!</option>
          </select>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 버튼 */}
        <div className="flex justify-end space-x-4 pt-6">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || formData.title.length < 10 || formData.content.length < 10}
            className="bg-primary-500 hover:bg-primary-600"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                질문 등록 중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                질문 등록하기
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
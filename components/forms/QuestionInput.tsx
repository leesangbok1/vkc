'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSafeAuth } from "@/components/providers/ClientProviders"
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import LoginModal from '@/components/LoginModal'
import { MessageCircleQuestion, Send } from 'lucide-react'

interface QuestionFormData {
  title: string
  content: string
  category: string
  tags: string[]
}

interface QuestionInputProps {
  onSubmit?: (data: QuestionFormData) => void
  className?: string
}

export function QuestionInput({ onSubmit, className = '' }: QuestionInputProps) {
  const { user } = useSafeAuth()
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [formData, setFormData] = useState<QuestionFormData>({
    title: '',
    content: '',
    category: '',
    tags: []
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 핵심 UX 로직: 첫 타이핑 시에만 로그인 확인
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    // 사용자가 처음 타이핑할 때 (첫 글자 입력)
    if (!hasUserInteracted && value.length === 1) {
      setHasUserInteracted(true)

      // 로그인하지 않은 경우 모달 표시하고 입력 중단
      if (!user) {
        setShowLoginModal(true)
        // 입력값을 초기화하여 실제로 입력되지 않도록 함
        e.target.value = ''
        return
      }
    }

    // 로그인된 사용자만 입력 진행
    if (user) {
      setFormData(prev => ({ ...prev, content: value }))
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // 제목 입력 시에도 로그인 확인
    if (!hasUserInteracted && value.length === 1) {
      setHasUserInteracted(true)

      if (!user) {
        setShowLoginModal(true)
        e.target.value = ''
        return
      }
    }

    if (user) {
      setFormData(prev => ({ ...prev, title: value }))
    }
  }

  // 사용자 상태 변화 감지해서 로그인 성공 시 모달 자동 닫기
  useEffect(() => {
    if (user && showLoginModal) {
      setShowLoginModal(false)
      // 로그인 후 포커스를 다시 textarea로 이동
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [user, showLoginModal])

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    // 로그인 후 포커스를 다시 textarea로 이동
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (formData.title.trim() && formData.content.trim()) {
      onSubmit?.(formData)
      // 폼 초기화
      setFormData({
        title: '',
        content: '',
        category: '',
        tags: []
      })
      setHasUserInteracted(false)
    }
  }

  const isFormValid = formData.title.trim().length > 0 && formData.content.trim().length > 0

  return (
    <>
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircleQuestion className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">질문하기</h2>
              <p className="text-sm text-gray-600">
                {user
                  ? '궁금한 것이 있으시면 자유롭게 질문해보세요'
                  : '궁금한 것이 있으시면 자유롭게 질문해보세요'
                }
              </p>
            </div>
          </div>
        </div>

        {/* 폼 컨텐츠 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 제목 입력 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              제목
            </Label>
            <input
              id="title"
              type="text"
              placeholder="질문의 제목을 간단히 써주세요"
              onChange={handleTitleChange}
              value={user ? formData.title : ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-500"
              maxLength={200}
            />
          </div>

          {/* 내용 입력 */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-gray-700">
              질문 내용
            </Label>
            <Textarea
              ref={textareaRef}
              id="content"
              placeholder="궁금한 것이 있으시면 자유롭게 질문해보세요...

예시:
• 비자 연장은 어떻게 하나요?
• 한국에서 은행 계좌 개설하는 방법
• 서울에서 베트남 음식점 추천해주세요"
              onChange={handleContentChange}
              value={user ? formData.content : ''}
              className="min-h-[150px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>구체적으로 작성할수록 더 정확한 답변을 받을 수 있어요</span>
              <span>{user ? formData.content.length : 0}/2000</span>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button
              type="submit"
              disabled={!user || !isFormValid}
              variant="primary"
              className="px-8 py-3 touch-target hover-primary click-primary"
              aria-label="질문 올리기"
            >
              <Send className="w-4 h-4" />
              질문 올리기
            </Button>
          </div>
        </form>
      </div>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  )
}

export default QuestionInput
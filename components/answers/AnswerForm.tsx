'use client'

import React, { useEffect, useState } from 'react'
import NotificationSetupModal from '@/components/modals/NotificationSetupModal'
import RichEditor from '@/components/editor/RichEditor'
import { EDITOR_USAGE_GUIDE } from '@/lib/constants/editor'

interface AnswerFormProps {
  questionId: string
  onAnswerSubmitted: () => void
}

export default function AnswerForm({ questionId, onAnswerSubmitted }: AnswerFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    async function loadProfileEmail() {
      try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const email = json?.data?.email
        if (typeof email === 'string') {
          setUserEmail(email)
        }
      } catch (profileError) {
        console.warn('[AnswerForm] failed to load profile email', profileError)
      }
    }

    loadProfileEmail()
  }, [])

  const MIN_CONTENT_LENGTH = 10

  const submitAnswer = async () => {
    const trimmed = content.trim()
    if (!trimmed) {
      setError('답변 내용을 입력해주세요')
      return
    }

    if (trimmed.length < MIN_CONTENT_LENGTH) {
      setError(`답변은 최소 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed })
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        const message = payload?.error || '답변 등록 중 오류가 발생했습니다.'
        const details = payload?.details || payload?.hint
        throw new Error(details ? `${message}\n${details}` : message)
      }

      // refresh answers
      setContent('')
      onAnswerSubmitted()

      setShowNotificationModal(true)

    } catch (err) {
      console.error('Error submitting answer:', err)
      setError(err instanceof Error ? err.message : '답변 등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await submitAnswer()
  }

  const handleNotificationComplete = () => {
    setShowNotificationModal(false)
    alert('답변이 등록되었습니다! 알림 설정이 완료되었습니다.')
  }

  const handleNotificationClose = () => {
    setShowNotificationModal(false)
    alert('답변이 등록되었습니다!')
  }

  return (
    <div className="form-answer-container">
      <div className="form-answer-header">
        답변 작성
      </div>
      <div className="form-answer-content">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 sr-only">답변 작성</h3>

        <form onSubmit={handleSubmit}>
          <RichEditor
            value={content}
            onChange={setContent}
            placeholder="이 질문에 대한 답변을 작성해주세요.&#10;&#10;• 구체적이고 명확한 설명을 제공하세요&#10;• 개인 경험이나 사례를 포함하면 더욱 도움이 됩니다&#10;• 관련 링크나 참고 자료를 추가해보세요&#10;• 정중하고 친근한 톤으로 작성해주세요"
            minRows={8}
            maxLength={5000}
            disabled={isSubmitting}
            onSubmitShortcut={submitAnswer}
            helperText={EDITOR_USAGE_GUIDE}
          />

          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>최소 {MIN_CONTENT_LENGTH}자 이상 작성해주세요.</span>
            <span>Ctrl + Enter로 빠른 등록</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="form-primary-error">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              <i className="fas fa-info-circle mr-1"></i>
              답변은 등록 후 수정할 수 있습니다
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setContent('')
                  setError(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                초기화
              </button>

              <button
                type="submit"
                disabled={isSubmitting || content.trim().length < MIN_CONTENT_LENGTH}
                className="form-answer-submit px-6 py-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    답변 등록 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    답변 등록
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Writing Guidelines */}
        <div className="form-primary-guidelines">
          <h4>
            <i className="fas fa-lightbulb"></i>
            좋은 답변을 위한 가이드라인
          </h4>
          <ul>
            <li>• 질문에 직접적으로 답변하되, 구체적인 방법이나 단계를 제시하세요</li>
            <li>• 개인적인 경험이나 실제 사례를 포함하면 더욱 도움이 됩니다</li>
            <li>• 관련 웹사이트, 문서, 또는 연락처 정보를 제공해주세요</li>
            <li>• 정확하지 않은 정보보다는 모르겠다고 솔직히 말하는 것이 좋습니다</li>
            <li>• 정중하고 친근한 톤으로 작성해주세요</li>
          </ul>
        </div>
      </div>

      {/* Notification Setup Modal */}
      <NotificationSetupModal
        isOpen={showNotificationModal}
        onClose={handleNotificationClose}
        onComplete={handleNotificationComplete}
        userEmail={userEmail}
      />
    </div>
  )
}

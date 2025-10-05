'use client'

import React, { useState, useRef } from 'react'

interface AnswerFormProps {
  questionId: string
  onAnswerSubmitted: () => void
}

export default function AnswerForm({ questionId, onAnswerSubmitted }: AnswerFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('답변 내용을 입력해주세요')
      return
    }

    if (content.length < 10) {
      setError('답변은 최소 10자 이상 작성해주세요')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question_id: questionId,
          content: content.trim()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit answer')
      }

      // Success
      setContent('')
      setIsPreview(false)
      onAnswerSubmitted()

      // Show success message briefly
      const successMessage = document.createElement('div')
      successMessage.className = 'fixed top-4 right-4 bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg z-50'
      successMessage.textContent = '답변이 성공적으로 등록되었습니다!'
      document.body.appendChild(successMessage)

      setTimeout(() => {
        document.body.removeChild(successMessage)
      }, 3000)

    } catch (err) {
      console.error('Error submitting answer:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const value = textarea.value
        const newValue = value.substring(0, start) + '    ' + value.substring(end)
        setContent(newValue)

        // Set cursor position after the inserted tab
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4
        }, 0)
      }
    }

    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = before + selectedText + after
    const newContent = content.substring(0, start) + newText + content.substring(end)

    setContent(newContent)

    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const formatButtons = [
    { icon: 'fas fa-bold', action: () => insertText('**', '**'), title: '굵게 (Ctrl+B)' },
    { icon: 'fas fa-italic', action: () => insertText('*', '*'), title: '기울임 (Ctrl+I)' },
    { icon: 'fas fa-code', action: () => insertText('`', '`'), title: '인라인 코드' },
    { icon: 'fas fa-link', action: () => insertText('[', '](url)'), title: '링크' },
    { icon: 'fas fa-list-ul', action: () => insertText('\n- ', ''), title: '목록' },
    { icon: 'fas fa-list-ol', action: () => insertText('\n1. ', ''), title: '번호 목록' },
    { icon: 'fas fa-quote-right', action: () => insertText('\n> ', ''), title: '인용' }
  ]

  return (
    <div className="form-answer-container">
      <div className="form-answer-header">
        답변 작성
      </div>
      <div className="form-answer-content">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 sr-only">답변 작성</h3>

        <form onSubmit={handleSubmit}>
          {/* Formatting Toolbar */}
          <div className="form-answer-toolbar">
            {formatButtons.map((button, index) => (
              <button
                key={index}
                type="button"
                onClick={button.action}
                title={button.title}
                className="p-2 text-primary-blue hover:text-white hover:bg-primary-blue rounded transition-colors"
              >
                <i className={button.icon}></i>
              </button>
            ))}

            <div className="separator"></div>

            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`form-answer-preview-btn ${
                isPreview ? 'active' : ''
              }`}
            >
              {isPreview ? '편집' : '미리보기'}
            </button>
          </div>

          {/* Content Area */}
          {isPreview ? (
            // Preview Mode
            <div className="form-answer-preview">
              <div className="prose max-w-none">
                <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {content || '미리보기할 내용이 없습니다.'}
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="이 질문에 대한 답변을 작성해주세요.&#10;&#10;도움이 되는 답변을 위한 팁:&#10;• 구체적이고 명확한 설명을 제공하세요&#10;• 개인 경험이나 사례를 포함하면 더욱 도움이 됩니다&#10;• 관련 링크나 참고 자료를 추가해보세요&#10;• 정중하고 친근한 톤으로 작성해주세요"
              className="form-answer-textarea"
              disabled={isSubmitting}
            />
          )}

          {/* Character Count */}
          <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
            <div>
              <span className={content.length < 10 ? 'text-red-500' : 'text-gray-600'}>
                {content.length}자
              </span>
              <span className="ml-1">/ 최소 10자</span>
            </div>
            <div className="text-xs text-gray-500">
              Ctrl + Enter로 빠른 등록
            </div>
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
                  setIsPreview(false)
                  setError(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                초기화
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !content.trim() || content.length < 10}
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
    </div>
  )
}
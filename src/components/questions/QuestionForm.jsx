import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@services/AuthContext'
import { createQuestion } from "@services/firebase-api"

/**
 * 질문 작성 폼 컴포넌트
 * PRD 요구사항에 따른 핵심 기능 구현
 */
const QuestionForm = ({ onSubmit, onCancel, className = '' }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const textareaRef = useRef(null)

  // 카테고리 옵션 (PRD 기준)
  const categories = [
    { value: 'visa', label: '비자/체류', icon: '📄' },
    { value: 'life', label: '생활정보', icon: '🏠' },
    { value: 'work', label: '취업/근로', icon: '💼' },
    { value: 'education', label: '교육/학업', icon: '📚' },
    { value: 'health', label: '의료/건강', icon: '🏥' },
    { value: 'finance', label: '금융/세금', icon: '💰' },
    { value: 'culture', label: '문화/적응', icon: '🌍' },
    { value: 'legal', label: '법률/행정', icon: '⚖️' }
  ]

  // 자동 크기 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [formData.content])

  // AI 자동 분류 (모의 구현)
  useEffect(() => {
    if (formData.content.length > 20) {
      const timer = setTimeout(() => {
        // 실제로는 OpenAI API 호출
        const mockAiSuggestion = {
          category: 'visa',
          confidence: 0.85,
          tags: ['F-2', '비자연장', '서류'],
          improvedTitle: formData.content.slice(0, 30) + '에 대해 질문드립니다'
        }
        setAiSuggestions(mockAiSuggestion)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [formData.content])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = e.target.value.trim()
      if (tag && !formData.tags.includes(tag)) {
        handleInputChange('tags', [...formData.tags, tag])
        e.target.value = ''
      }
    }
  }

  const removeTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const applyAiSuggestion = (field, value) => {
    handleInputChange(field, value)
    setAiSuggestions(null)
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      return '제목을 입력해주세요.'
    }
    if (!formData.content.trim()) {
      return '질문 내용을 입력해주세요.'
    }
    if (!formData.category) {
      return '카테고리를 선택해주세요.'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!user) {
      setError('로그인이 필요합니다.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Firebase API 호출
      const questionData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags,
        authorId: user.id
      }

      await createQuestion(
        questionData.title,
        questionData.content,
        user,
        questionData.category,
        questionData.tags
      )

      // 성공 처리
      setFormData({ title: '', content: '', category: '', tags: [] })
      setShowForm(false)

      if (onSubmit) {
        onSubmit(questionData)
      }

      // 성공 알림
      const notification = document.createElement('div')
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `
      notification.textContent = '✅ 질문이 성공적으로 등록되었습니다!'
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 3000)

    } catch (err) {
      console.error('질문 등록 실패:', err)
      setError('질문 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className={`question-form-container ${className}`}>
        <div className="login-prompt">
          <div className="prompt-content">
            <i className="fa-solid fa-user-circle"></i>
            <h3>질문을 작성하려면 로그인이 필요합니다</h3>
            <p>베트남인 커뮤니티에 참여하여 궁금한 점을 해결해보세요!</p>
            <button className="login-btn" onClick={() => window.dispatchEvent(new CustomEvent('openLoginModal'))}>
              <i className="fa-solid fa-sign-in-alt"></i>
              로그인하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 폼이 닫혀있는 경우 (CTA 버튼만 표시)
  if (!showForm) {
    return (
      <div className={`question-form-container ${className}`}>
        <div className="question-cta">
          <div className="cta-content">
            <div className="cta-text">
              <h3>
                <i className="fa-solid fa-question-circle"></i>
                궁금한 것이 있으신가요?
              </h3>
              <p>한국 생활의 모든 궁금증을 베트남인 커뮤니티에서 해결하세요!</p>
            </div>
            <button
              className="cta-button"
              onClick={() => setShowForm(true)}
            >
              <i className="fa-solid fa-edit"></i>
              질문 작성하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`question-form-container ${className}`}>
      <form className="question-form" onSubmit={handleSubmit}>
        {/* 헤더 */}
        <div className="form-header">
          <h3>
            <i className="fa-solid fa-edit"></i>
            새 질문 작성
          </h3>
          <button
            type="button"
            className="close-btn"
            onClick={() => {
              setShowForm(false)
              if (onCancel) onCancel()
            }}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="error-message">
            <i className="fa-solid fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {/* AI 제안 */}
        {aiSuggestions && (
          <div className="ai-suggestions">
            <div className="suggestion-header">
              <i className="fa-solid fa-robot"></i>
              <span>AI 추천</span>
              <small>(신뢰도: {Math.round(aiSuggestions.confidence * 100)}%)</small>
            </div>

            {aiSuggestions.improvedTitle && (
              <div className="suggestion-item">
                <label>제목 개선:</label>
                <div className="suggestion-content">
                  {aiSuggestions.improvedTitle}
                  <button
                    type="button"
                    onClick={() => applyAiSuggestion('title', aiSuggestions.improvedTitle)}
                  >
                    적용
                  </button>
                </div>
              </div>
            )}

            {aiSuggestions.category && (
              <div className="suggestion-item">
                <label>카테고리 추천:</label>
                <div className="suggestion-content">
                  {categories.find(c => c.value === aiSuggestions.category)?.label}
                  <button
                    type="button"
                    onClick={() => applyAiSuggestion('category', aiSuggestions.category)}
                  >
                    적용
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 제목 */}
        <div className="form-group">
          <label htmlFor="question-title">
            <i className="fa-solid fa-heading"></i>
            제목 *
          </label>
          <input
            id="question-title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="질문을 한 줄로 요약해주세요"
            maxLength={100}
            required
          />
          <div className="char-count">{formData.title.length}/100</div>
        </div>

        {/* 카테고리 */}
        <div className="form-group">
          <label htmlFor="question-category">
            <i className="fa-solid fa-folder"></i>
            카테고리 *
          </label>
          <select
            id="question-category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            required
          >
            <option value="">카테고리를 선택하세요</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* 내용 */}
        <div className="form-group">
          <label htmlFor="question-content">
            <i className="fa-solid fa-align-left"></i>
            질문 내용 *
          </label>
          <textarea
            id="question-content"
            ref={textareaRef}
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="구체적인 상황과 궁금한 점을 자세히 작성해주세요&#10;&#10;예시:&#10;- 현재 상황&#10;- 시도해본 방법&#10;- 구체적으로 알고 싶은 내용"
            maxLength={2000}
            rows={4}
            required
          />
          <div className="char-count">{formData.content.length}/2000</div>
        </div>

        {/* 태그 */}
        <div className="form-group">
          <label htmlFor="question-tags">
            <i className="fa-solid fa-tags"></i>
            태그 (선택사항)
          </label>
          <div className="tags-container">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <i className="fa-solid fa-times"></i>
                </button>
              </span>
            ))}
            <input
              id="question-tags"
              type="text"
              placeholder="태그 입력 후 Enter (예: F-2, 비자연장)"
              onKeyDown={handleTagInput}
              disabled={formData.tags.length >= 5}
            />
          </div>
          <small>최대 5개까지 추가 가능합니다</small>
        </div>

        {/* 작성 가이드 */}
        <div className="writing-guide">
          <h4>
            <i className="fa-solid fa-lightbulb"></i>
            좋은 질문 작성 팁
          </h4>
          <ul>
            <li>구체적인 상황을 설명해주세요</li>
            <li>이미 시도해본 방법이 있다면 함께 적어주세요</li>
            <li>정확한 답변을 위해 관련 서류나 조건을 명시해주세요</li>
            <li>긴급도가 높다면 '급함' 태그를 추가해주세요</li>
          </ul>
        </div>

        {/* 제출 버튼 */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setShowForm(false)
              if (onCancel) onCancel()
            }}
          >
            취소
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                등록 중...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane"></i>
                질문 등록
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .question-form-container {
          margin: 20px 0;
        }

        .login-prompt, .question-cta {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 30px;
          color: white;
          text-align: center;
        }

        .cta-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .cta-text h3 {
          margin: 0 0 8px 0;
          font-size: 1.2em;
        }

        .cta-text p {
          margin: 0;
          opacity: 0.9;
        }

        .cta-button, .login-btn {
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.3);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .cta-button:hover, .login-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        .question-form {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-header h3 {
          margin: 0;
          color: #374151;
          font-size: 1.25em;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.2em;
          cursor: pointer;
          color: #6b7280;
          padding: 8px;
          border-radius: 4px;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .ai-suggestions {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .suggestion-header {
          font-weight: 600;
          color: #0369a1;
          margin-bottom: 12px;
        }

        .suggestion-item {
          margin-bottom: 8px;
        }

        .suggestion-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin-top: 4px;
        }

        .suggestion-content button {
          background: #0369a1;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8em;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .char-count {
          text-align: right;
          font-size: 0.8em;
          color: #6b7280;
          margin-top: 4px;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          min-height: 40px;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
        }

        .tag {
          background: #3b82f6;
          color: white;
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 0.8em;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tag button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0;
          font-size: 0.7em;
        }

        .tags-container input {
          border: none;
          outline: none;
          flex: 1;
          min-width: 120px;
          padding: 4px;
        }

        .writing-guide {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .writing-guide h4 {
          margin: 0 0 12px 0;
          color: #374151;
          font-size: 1em;
        }

        .writing-guide ul {
          margin: 0;
          padding-left: 20px;
        }

        .writing-guide li {
          margin-bottom: 4px;
          color: #6b7280;
          font-size: 0.9em;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .submit-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .cta-content {
            flex-direction: column;
            text-align: center;
          }

          .question-form {
            padding: 16px;
          }

          .form-actions {
            flex-direction: column;
          }

          .cancel-btn,
          .submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default QuestionForm
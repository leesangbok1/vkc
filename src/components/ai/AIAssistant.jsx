import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import aiService from '@services/AIService'

const AIAssistant = ({
  mode = 'suggestion', // 'suggestion' | 'categorize' | 'improve' | 'translate'
  question = {},
  onResult,
  autoTrigger = false,
  className = ''
}) => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (autoTrigger && question.title && question.content) {
      handleAIAnalysis()
    }
  }, [question.title, question.content, autoTrigger])

  const handleAIAnalysis = async () => {
    if (!question.title || !question.content) {
      setError('분석할 질문 내용이 필요합니다.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let analysisResult

      switch (mode) {
        case 'categorize':
          analysisResult = await aiService.categorizeQuestion(question.title, question.content)
          break
        case 'improve':
          analysisResult = await aiService.suggestImprovements(question.title, question.content)
          break
        case 'translate':
          analysisResult = await aiService.detectAndTranslate(
            `${question.title}\n\n${question.content}`,
            'ko'
          )
          break
        case 'suggestion':
        default:
          analysisResult = await aiService.recommendSimilarQuestions(
            question.title,
            question.content,
            question.similarQuestions || []
          )
          break
      }

      setResult(analysisResult)
      if (onResult) {
        onResult(analysisResult)
      }
    } catch (err) {
      console.error('AI 분석 실패:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="ai-loading">
          <div className="loading-spinner"></div>
          <span>AI가 분석 중입니다...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="ai-error">
          <i className="fa-solid fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button className="retry-btn" onClick={handleAIAnalysis}>
            다시 시도
          </button>
        </div>
      )
    }

    if (!result) {
      return (
        <div className="ai-prompt">
          <i className="fa-solid fa-robot"></i>
          <span>AI 분석을 시작하려면 버튼을 클릭하세요</span>
          <button className="analyze-btn" onClick={handleAIAnalysis}>
            {getAnalyzeButtonText()}
          </button>
        </div>
      )
    }

    return renderResult()
  }

  const getAnalyzeButtonText = () => {
    switch (mode) {
      case 'categorize':
        return 'AI 카테고리 분류'
      case 'improve':
        return 'AI 개선 제안'
      case 'translate':
        return 'AI 번역'
      case 'suggestion':
      default:
        return 'AI 관련 질문 찾기'
    }
  }

  const renderResult = () => {
    switch (mode) {
      case 'categorize':
        return renderCategorizeResult()
      case 'improve':
        return renderImproveResult()
      case 'translate':
        return renderTranslateResult()
      case 'suggestion':
      default:
        return renderSuggestionResult()
    }
  }

  const renderCategorizeResult = () => (
    <div className="ai-categorize-result">
      <div className="result-header">
        <i className="fa-solid fa-tags"></i>
        <h4>AI 카테고리 분류</h4>
        <span className="confidence">신뢰도: {(result.confidence * 100).toFixed(0)}%</span>
      </div>

      <div className="category-suggestion">
        <span className="category-badge">{result.category}</span>
        <p className="reasoning">{result.reasoning}</p>
      </div>

      {result.tags && result.tags.length > 0 && (
        <div className="tags-suggestion">
          <h5>추천 태그:</h5>
          <div className="tags-list">
            {result.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderImproveResult = () => (
    <div className="ai-improve-result">
      <div className="result-header">
        <i className="fa-solid fa-lightbulb"></i>
        <h4>AI 개선 제안</h4>
        <span className="score">점수: {(result.improvementScore * 100).toFixed(0)}/100</span>
      </div>

      <div className="improvement-summary">
        <p>{result.summary}</p>
      </div>

      {result.suggestions && result.suggestions.length > 0 && (
        <div className="suggestions-list">
          {result.suggestions.map((suggestion, index) => (
            <div key={index} className={`suggestion-item ${suggestion.type}`}>
              <div className="suggestion-header">
                <i className={getSuggestionIcon(suggestion.type)}></i>
                <span className="suggestion-type">{getSuggestionTypeText(suggestion.type)}</span>
              </div>
              <p className="suggestion-message">{suggestion.message}</p>
              {suggestion.example && (
                <div className="suggestion-example">
                  <strong>예시:</strong> {suggestion.example}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderTranslateResult = () => (
    <div className="ai-translate-result">
      <div className="result-header">
        <i className="fa-solid fa-language"></i>
        <h4>AI 번역</h4>
        <span className="detected-lang">
          감지된 언어: {getLanguageName(result.detectedLanguage)}
        </span>
      </div>

      <div className="translation-content">
        <div className="original-text">
          <h5>원문:</h5>
          <p>{result.originalText}</p>
        </div>
        <div className="translated-text">
          <h5>번역:</h5>
          <p>{result.translation}</p>
        </div>
      </div>
    </div>
  )

  const renderSuggestionResult = () => (
    <div className="ai-suggestion-result">
      <div className="result-header">
        <i className="fa-solid fa-search"></i>
        <h4>관련 질문 추천</h4>
      </div>

      {result.length === 0 ? (
        <div className="no-suggestions">
          <p>유사한 질문을 찾지 못했습니다.</p>
        </div>
      ) : (
        <div className="suggestions-list">
          {result.map((suggestion, index) => (
            <div key={index} className="suggestion-item">
              <div className="suggestion-header">
                <span className="similarity">유사도: {(suggestion.similarity * 100).toFixed(0)}%</span>
              </div>
              <h5 className="suggestion-title">{suggestion.title}</h5>
              <p className="suggestion-reason">{suggestion.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'title':
        return 'fa-solid fa-heading'
      case 'content':
        return 'fa-solid fa-align-left'
      case 'structure':
        return 'fa-solid fa-list'
      case 'additional_info':
        return 'fa-solid fa-info-circle'
      default:
        return 'fa-solid fa-lightbulb'
    }
  }

  const getSuggestionTypeText = (type) => {
    switch (type) {
      case 'title':
        return '제목 개선'
      case 'content':
        return '내용 개선'
      case 'structure':
        return '구조 개선'
      case 'additional_info':
        return '추가 정보'
      default:
        return '일반 제안'
    }
  }

  const getLanguageName = (code) => {
    const languages = {
      'ko': '한국어',
      'vi': '베트남어',
      'en': '영어'
    }
    return languages[code] || code
  }

  const getStatusClass = () => {
    if (loading) return 'loading'
    if (error) return 'error'
    if (result) return 'success'
    return 'idle'
  }

  return (
    <div className={`ai-assistant ${mode} ${getStatusClass()} ${className}`}>
      <div className="ai-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ai-title">
          <i className="fa-solid fa-robot"></i>
          <span>AI 어시스턴트</span>
          {!autoTrigger && (
            <button className="manual-trigger" onClick={(e) => {
              e.stopPropagation()
              handleAIAnalysis()
            }}>
              <i className="fa-solid fa-play"></i>
            </button>
          )}
        </div>
        <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
      </div>

      {isExpanded && (
        <div className="ai-content">
          {renderContent()}
        </div>
      )}
    </div>
  )
}

// CSS Styles
const styles = `
/* AI Assistant Styles */
.ai-assistant {
  background: white;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.ai-assistant.loading {
  border-color: #007bff;
}

.ai-assistant.error {
  border-color: #dc3545;
}

.ai-assistant.success {
  border-color: #28a745;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  user-select: none;
}

.ai-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.manual-trigger {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 10px;
  transition: background 0.2s ease;
}

.manual-trigger:hover {
  background: rgba(255, 255, 255, 0.3);
}

.ai-content {
  padding: 16px;
}

/* Loading State */
.ai-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
  font-style: italic;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Error State */
.ai-error {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #dc3545;
  background: #f8d7da;
  padding: 12px;
  border-radius: 6px;
}

.retry-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

/* Prompt State */
.ai-prompt {
  text-align: center;
  padding: 20px;
  color: #666;
}

.analyze-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 12px;
  transition: background 0.2s ease;
}

.analyze-btn:hover {
  background: #0056b3;
}

/* Result Headers */
.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.result-header h4 {
  margin: 0;
  color: #333;
  flex: 1;
}

.confidence,
.score {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.detected-lang {
  background: #6f42c1;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* Categorize Result */
.category-suggestion {
  margin-bottom: 16px;
}

.category-badge {
  background: #007bff;
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
  margin-bottom: 8px;
}

.reasoning {
  color: #666;
  font-style: italic;
  margin: 0;
}

.tags-suggestion h5 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #f8f9fa;
  color: #666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #e0e0e0;
}

/* Improve Result */
.improvement-summary {
  background: #e7f3ff;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.improvement-summary p {
  margin: 0;
  color: #0066cc;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.suggestion-item.title {
  border-left-color: #28a745;
}

.suggestion-item.content {
  border-left-color: #ffc107;
}

.suggestion-item.structure {
  border-left-color: #6f42c1;
}

.suggestion-item.additional_info {
  border-left-color: #17a2b8;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.suggestion-type {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.suggestion-message {
  margin: 0 0 8px 0;
  color: #666;
  line-height: 1.5;
}

.suggestion-example {
  background: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}

/* Translate Result */
.translation-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.original-text,
.translated-text {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
}

.original-text h5,
.translated-text h5 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
}

.original-text p,
.translated-text p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

/* Suggestion Result */
.no-suggestions {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.ai-suggestion-result .suggestion-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-left: 4px solid #007bff;
}

.similarity {
  background: #28a745;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.suggestion-title {
  margin: 8px 0 4px 0;
  color: #007bff;
  font-size: 14px;
  cursor: pointer;
}

.suggestion-title:hover {
  text-decoration: underline;
}

.suggestion-reason {
  margin: 0;
  color: #666;
  font-size: 13px;
  font-style: italic;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .ai-header {
    padding: 10px 12px;
  }

  .ai-content {
    padding: 12px;
  }

  .translation-content {
    gap: 12px;
  }

  .result-header {
    flex-wrap: wrap;
    gap: 6px;
  }

  .result-header h4 {
    width: 100%;
  }
}

/* Dark mode support */
[data-theme="dark"] .ai-assistant {
  background: #2d2d2d;
  border-color: #555;
}

[data-theme="dark"] .ai-content {
  background: #2d2d2d;
}

[data-theme="dark"] .result-header {
  border-bottom-color: #555;
}

[data-theme="dark"] .suggestion-item,
[data-theme="dark"] .improvement-summary,
[data-theme="dark"] .original-text,
[data-theme="dark"] .translated-text {
  background: #404040;
  color: #ffffff;
}

[data-theme="dark"] .tag {
  background: #555;
  border-color: #666;
  color: #ffffff;
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

AIAssistant.propTypes = {
  mode: PropTypes.oneOf(['suggestion', 'categorize', 'improve', 'translate']),
  question: PropTypes.object,
  onResult: PropTypes.func,
  autoTrigger: PropTypes.bool,
  className: PropTypes.string
}

export default AIAssistant
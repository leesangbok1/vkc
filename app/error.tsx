'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="error-page-layout">
      <div className="error-page-container">
        <div className="error-page-content">
          <div className="error-icon-container">
            <svg className="error-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h2 className="error-page-title section-title">문제가 발생했습니다</h2>

          <p className="error-page-message">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>

        <div className="error-page-actions">
          <button onClick={reset} className="btn-primary">
            다시 시도
          </button>

          <div className="error-page-links">
            <a href="/" className="error-page-link">
              홈으로 돌아가기
            </a>
            {' • '}
            <a href="/questions" className="error-page-link">
              질문 보기
            </a>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="error-dev-details">
            <summary className="error-dev-summary">
              개발자 정보 (개발 모드에서만 표시)
            </summary>
            <pre className="error-dev-pre">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

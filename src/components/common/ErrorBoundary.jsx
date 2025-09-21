import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // You can also log the error to an error reporting service here
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      })
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1 className="error-title">
              <i className="fa-solid fa-triangle-exclamation"></i>
              오류가 발생했습니다
            </h1>

            <p className="error-message">
              죄송합니다. 예상치 못한 오류가 발생했습니다.
              페이지를 새로고침하거나 홈으로 돌아가 주세요.
            </p>

            <div className="error-actions">
              <button onClick={this.handleReload} className="error-btn primary">
                <i className="fa-solid fa-refresh"></i>
                페이지 새로고침
              </button>

              <button onClick={this.handleGoHome} className="error-btn secondary">
                <i className="fa-solid fa-home"></i>
                홈으로 가기
              </button>
            </div>

            {/* 개발 환경에서만 상세 오류 정보 표시 */}
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>개발자용 오류 정보</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{this.state.error && this.state.error.toString()}</pre>

                  <h4>Component Stack:</h4>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// CSS Styles
const styles = `
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f8f9fa;
}

.error-content {
  max-width: 600px;
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.error-title {
  color: #dc3545;
  font-size: 2rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.error-message {
  color: #6c757d;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.error-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-btn.primary {
  background-color: #007bff;
  color: white;
}

.error-btn.primary:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.error-btn.secondary {
  background-color: #6c757d;
  color: white;
}

.error-btn.secondary:hover {
  background-color: #545b62;
  transform: translateY(-1px);
}

.error-details {
  margin-top: 30px;
  text-align: left;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
}

.error-stack h4 {
  color: #343a40;
  margin: 15px 0 10px 0;
}

.error-stack pre {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  font-size: 14px;
  overflow-x: auto;
  color: #dc3545;
}

@media (max-width: 768px) {
  .error-content {
    padding: 30px 20px;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-btn {
    width: 100%;
    justify-content: center;
  }
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default ErrorBoundary
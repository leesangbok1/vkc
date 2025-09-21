import React from 'react'
import { enhancedTokenManager } from '../../utils/enhancedTokenManager.js'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isTokenRelated: false,
      isImageRelated: false
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error,
      errorInfo: null
    }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Check if error is token-related or image-related
    const isTokenRelated = this.isTokenRelatedError(error)
    const isImageRelated = this.isImageProcessingError(error)

    this.setState({
      error: error,
      errorInfo: errorInfo,
      isTokenRelated,
      isImageRelated
    })

    // Handle token-related errors
    if (isTokenRelated) {
      this.handleTokenError(error)
    }

    // Handle image-related errors
    if (isImageRelated) {
      this.handleImageError(error)
    }

    // You can also log the error to an error reporting service here
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
        custom_parameters: {
          token_related: isTokenRelated
        }
      })
    }
  }

  /**
   * Check if error is related to token exhaustion
   */
  isTokenRelatedError(error) {
    const errorMessage = error.message || error.toString()
    const tokenErrorIndicators = [
      'rate limit',
      'rate_limit',
      'token',
      'quota',
      'usage limit',
      '429',
      'too many requests',
      'throttle'
    ]

    return tokenErrorIndicators.some(indicator =>
      errorMessage.toLowerCase().includes(indicator.toLowerCase())
    )
  }

  /**
   * Check if error is related to image processing
   */
  isImageProcessingError(error) {
    const errorMessage = error.message || error.toString()
    const imageErrorIndicators = [
      'could not process image',
      'image processing',
      'invalid image',
      'image upload',
      'image format',
      'image size',
      'unsupported image'
    ]

    return imageErrorIndicators.some(indicator =>
      errorMessage.toLowerCase().includes(indicator.toLowerCase())
    )
  }

  /**
   * Handle token-related errors
   */
  handleTokenError(error) {
    console.log('🚨 Token-related error detected in ErrorBoundary')

    // Determine which service might be affected
    const errorMessage = error.message || error.toString()
    let serviceId = 'claude' // default

    if (errorMessage.includes('github') || errorMessage.includes('GitHub')) {
      serviceId = 'github'
    } else if (errorMessage.includes('firebase') || errorMessage.includes('Firebase')) {
      serviceId = 'firebase'
    }

    // Notify token manager
    try {
      enhancedTokenManager.onTokenExhausted(serviceId, {
        source: 'ErrorBoundary',
        error: errorMessage,
        component: this.props.componentName || 'Unknown'
      })
    } catch (tokenError) {
      console.warn('Failed to notify token manager:', tokenError)
    }
  }

  /**
   * Handle image processing errors
   */
  handleImageError(error) {
    console.log('🖼️ Image processing error detected in ErrorBoundary')

    const errorMessage = error.message || error.toString()
    console.error('Image processing error details:', {
      error: errorMessage,
      component: this.props.componentName || 'Unknown',
      timestamp: new Date().toISOString()
    })

    // Log to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: 'Image processing error: ' + errorMessage,
        fatal: false,
        custom_parameters: {
          error_type: 'image_processing',
          component: this.props.componentName || 'Unknown'
        }
      })
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleRetryWithTokenManager = async () => {
    try {
      await enhancedTokenManager.retryNow()
      this.setState({ hasError: false, error: null, errorInfo: null, isTokenRelated: false })
    } catch (error) {
      console.warn('Token manager retry failed:', error)
      window.location.reload()
    }
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
              {this.state.isTokenRelated ? (
                <>
                  토큰 사용량 한도에 도달했습니다.
                  자동 재개 시스템이 활성화되었습니다.
                </>
              ) : (
                <>
                  죄송합니다. 예상치 못한 오류가 발생했습니다.
                  페이지를 새로고침하거나 홈으로 돌아가 주세요.
                </>
              )}
            </p>

            <div className="error-actions">
              {this.state.isTokenRelated ? (
                <button onClick={this.handleRetryWithTokenManager} className="error-btn token-retry">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  토큰 복구 재시도
                </button>
              ) : (
                <button onClick={this.handleReload} className="error-btn primary">
                  <i className="fa-solid fa-refresh"></i>
                  페이지 새로고침
                </button>
              )}

              <button onClick={this.handleGoHome} className="error-btn secondary">
                <i className="fa-solid fa-home"></i>
                홈으로 가기
              </button>
            </div>

            {/* 개발 환경에서만 상세 오류 정보 표시 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>개발자용 오류 정보</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{this.state.error.toString()}</pre>

                  <h4>Component Stack:</h4>
                  <pre>{this.state.errorInfo?.componentStack || 'Component stack not available'}</pre>
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

.error-btn.token-retry {
  background-color: #17a2b8;
  color: white;
}

.error-btn.token-retry:hover {
  background-color: #138496;
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
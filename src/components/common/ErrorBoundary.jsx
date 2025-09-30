import React from 'react'
import { enhancedTokenManager } from '../../utils/enhancedTokenManager.js'
import logger from '../../utils/logger.js'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isTokenRelated: false,
      isImageRelated: false,
      isNetworkRelated: false,
      retryCount: 0,
      lastErrorTime: null
    }
    this.maxRetries = 3
    this.retryDelay = 1000 // 1초
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
    // Log error details using enhanced logger
    logger.error('ErrorBoundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      component: this.props.componentName || 'Unknown'
    })

    // Check error types
    const isTokenRelated = this.isTokenRelatedError(error)
    const isImageRelated = this.isImageProcessingError(error)
    const isNetworkRelated = this.isNetworkError(error)

    this.setState({
      error: error,
      errorInfo: errorInfo,
      isTokenRelated,
      isImageRelated,
      isNetworkRelated,
      lastErrorTime: Date.now()
    })

    // Handle different error types
    if (isTokenRelated) {
      this.handleTokenError(error)
    }

    if (isImageRelated) {
      this.handleImageError(error)
    }

    if (isNetworkRelated) {
      this.handleNetworkError(error)
    }

    // Attempt automatic recovery for recoverable errors
    if (this.isRecoverableError(error) && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry()
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
   * Check if error is related to network issues
   */
  isNetworkError(error) {
    const errorMessage = error.message || error.toString()
    const networkErrorIndicators = [
      'network error',
      'fetch failed',
      'connection failed',
      'timeout',
      'no internet',
      'offline',
      'cors error',
      'failed to fetch',
      'net::err',
      'connection refused'
    ]

    return networkErrorIndicators.some(indicator =>
      errorMessage.toLowerCase().includes(indicator.toLowerCase())
    ) || error.name === 'NetworkError' || error.code === 'NETWORK_ERROR'
  }

  /**
   * Check if error is recoverable (can be retried)
   */
  isRecoverableError(error) {
    return this.isNetworkError(error) ||
           this.isTokenRelated ||
           error.name === 'TimeoutError' ||
           error.message?.includes('temporary')
  }

  /**
   * Handle token-related errors
   */
  handleTokenError(error) {
    logger.warn('Token-related error detected', {
      error: error.message,
      component: this.props.componentName || 'Unknown'
    })

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
      logger.info('Token manager notified successfully', { serviceId })
    } catch (tokenError) {
      logger.error('Failed to notify token manager', { tokenError: tokenError.message })
    }
  }

  /**
   * Handle image processing errors
   */
  handleImageError(error) {
    logger.warn('Image processing error detected', {
      error: error.message,
      component: this.props.componentName || 'Unknown',
      errorType: 'image_processing'
    })
  }

  /**
   * Handle network-related errors
   */
  handleNetworkError(error) {
    const isOffline = !navigator.onLine

    logger.warn('Network error detected', {
      error: error.message,
      component: this.props.componentName || 'Unknown',
      errorType: 'network',
      online: navigator.onLine,
      isOffline
    })

    if (isOffline) {
      logger.warn('Device is offline - network functionality unavailable')
    }
  }

  /**
   * Schedule automatic retry for recoverable errors
   */
  scheduleRetry() {
    const retryAttempt = this.state.retryCount + 1
    const delay = this.retryDelay * retryAttempt

    logger.info(`Scheduling automatic retry ${retryAttempt}/${this.maxRetries}`, {
      delay,
      component: this.props.componentName || 'Unknown'
    })

    setTimeout(() => {
      logger.info(`Executing retry ${retryAttempt}/${this.maxRetries}`)

      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isTokenRelated: false,
        isImageRelated: false,
        isNetworkRelated: false
      }))
    }, delay)
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
              ) : this.state.isNetworkRelated ? (
                <>
                  네트워크 연결에 문제가 있습니다.
                  {!navigator.onLine ? ' 인터넷 연결을 확인해주세요.' : ' 잠시 후 다시 시도해주세요.'}
                  {this.state.retryCount > 0 && ` (재시도 ${this.state.retryCount}/${this.maxRetries})`}
                </>
              ) : this.state.isImageRelated ? (
                <>
                  이미지 처리 중 문제가 발생했습니다.
                  다른 이미지를 시도하거나 잠시 후 다시 시도해주세요.
                </>
              ) : (
                <>
                  죄송합니다. 예상치 못한 오류가 발생했습니다.
                  페이지를 새로고침하거나 홈으로 돌아가 주세요.
                  {this.state.retryCount > 0 && ` (재시도 ${this.state.retryCount}/${this.maxRetries})`}
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
            {import.meta.env.DEV && this.state.error && (
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
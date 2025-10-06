'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
  onRetry?: () => void | Promise<void>
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
}

export class QueryErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `query_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Query/API 관련 에러 로깅
    console.error('[Query Error Boundary]', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      retryCount: this.retryCount
    })

    // 부모에게 에러 전달
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 에러 리포팅 API 호출
    this.reportQueryError(error, errorInfo)
  }

  private async reportQueryError(error: Error, errorInfo: any) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'query_error',
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          retryCount: this.retryCount
        })
      })
    } catch (reportError) {
      console.error('Failed to report query error:', reportError)
    }
  }

  private handleRetry = async () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++

      // 외부 onRetry 함수 호출 (데이터 새로고침 등)
      if (this.props.onRetry) {
        try {
          await this.props.onRetry()
        } catch (retryError) {
          console.error('External retry function failed:', retryError)
        }
      }

      this.setState({
        hasError: false,
        error: null,
        errorId: null
      })
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 기본 에러 UI
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            데이터를 불러오는 중 오류가 발생했습니다
          </h3>
          <p className="text-red-700 text-center mb-4 max-w-md">
            {this.state.error?.message || '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
          </p>

          <div className="flex gap-2">
            {this.retryCount < this.maxRetries && (
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도 ({this.maxRetries - this.retryCount}회 남음)
              </Button>
            )}

            <Button
              onClick={this.handleReload}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              페이지 새로고침
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.errorId && (
            <div className="mt-4 text-xs text-gray-500">
              Error ID: {this.state.errorId}
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
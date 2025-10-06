'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotificationErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

interface NotificationErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export default class NotificationErrorBoundary extends Component<
  NotificationErrorBoundaryProps,
  NotificationErrorBoundaryState
> {
  private maxRetries = 3

  constructor(props: NotificationErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<NotificationErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NotificationErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to external service if needed
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // This would typically send to a logging service
    console.log('Logging error to service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    })
  }

  private handleDismiss = () => {
    this.setState({
      hasError: false
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-red-800">
                알림 시스템에 오류가 발생했습니다
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>알림을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">기술적 세부사항</summary>
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono">
                      <p><strong>Error:</strong> {this.state.error.message}</p>
                      {this.state.error.stack && (
                        <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                      )}
                    </div>
                  </details>
                )}
              </div>
              <div className="mt-4 flex items-center space-x-2">
                {this.state.retryCount < this.maxRetries ? (
                  <Button
                    onClick={this.handleRetry}
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    다시 시도 ({this.maxRetries - this.state.retryCount}회 남음)
                  </Button>
                ) : (
                  <Button
                    onClick={this.handleReset}
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    재설정
                  </Button>
                )}
                <Button
                  onClick={this.handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4 mr-1" />
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
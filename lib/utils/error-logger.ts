'use client'

/**
 * 중앙화된 에러 로깅 시스템
 * 프로덕션과 개발 환경에서 다른 로깅 전략 사용
 */

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  url?: string
  userAgent?: string
  timestamp?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  category?: 'ui' | 'api' | 'auth' | 'system' | 'performance'
  retryCount?: number
  // Notification-specific context
  notificationId?: string
  notificationIds?: string[]
  notificationCount?: number
  notificationData?: any
  statusCode?: number
  responseData?: string
  // API-specific context
  answerId?: string
  questionId?: string
  commentId?: string
  targetUserId?: string
  targetId?: string
  authorId?: string
  voteType?: string
  // Service-specific context
  permission?: string
  options?: any
  digestData?: any
  userCount?: number
  mentionedUserId?: string
  // Notification service context
  type?: string
  isRead?: boolean
  priority?: string
  expertId?: string
  targetType?: string
  contentType?: string
  targetAuthorId?: string
  questionAuthorId?: string
  contentId?: string
  newVoteScore?: number
  mentionerId?: string
}

export interface ErrorLogEntry {
  message: string
  error?: Error
  context: ErrorContext
  stackTrace?: string
  errorId: string
}

class ErrorLogger {
  private static instance: ErrorLogger
  private errorQueue: ErrorLogEntry[] = []
  private isFlushingQueue = false

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  private constructor() {
    // Browser 환경에서만 실행
    if (typeof window !== 'undefined') {
      // 페이지 언로드 시 남은 에러 로그 전송
      window.addEventListener('beforeunload', () => {
        this.flush(true)
      })

      // 5초마다 큐를 비우기
      setInterval(() => {
        this.flush()
      }, 5000)
    }
  }

  /**
   * 에러 로깅 (개발/프로덕션 환경 자동 감지)
   */
  log(message: string, context: ErrorContext = {}, error?: Error): void {
    const errorId = this.generateErrorId()

    const logEntry: ErrorLogEntry = {
      message,
      error,
      context: {
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        severity: 'medium',
        category: 'ui',
        ...context
      },
      stackTrace: error?.stack,
      errorId
    }

    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      this.logToDeveloper(logEntry)
    }

    // 프로덕션 환경에서는 큐에 추가
    if (process.env.NODE_ENV === 'production') {
      this.errorQueue.push(logEntry)

      // 중요한 에러는 즉시 전송
      if (context.severity === 'critical' || context.severity === 'high') {
        this.flush(true)
      }
    }
  }

  /**
   * 개발자 콘솔 출력
   */
  private logToDeveloper(entry: ErrorLogEntry): void {
    const prefix = `[${entry.context.category?.toUpperCase()}] ${entry.context.component || 'Unknown'}`

    console.group(`🐛 ${prefix} - ${entry.message}`)
    console.error('Error:', entry.error)
    console.log('Context:', entry.context)
    console.log('Error ID:', entry.errorId)
    if (entry.stackTrace) {
      console.log('Stack Trace:', entry.stackTrace)
    }
    console.groupEnd()
  }

  /**
   * 에러 ID 생성
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 큐에 있는 에러들을 서버로 전송
   */
  private async flush(immediate = false): Promise<void> {
    if (this.isFlushingQueue || this.errorQueue.length === 0) {
      return
    }

    this.isFlushingQueue = true
    const errors = [...this.errorQueue]
    this.errorQueue = []

    try {
      const method = immediate && 'sendBeacon' in navigator ? 'beacon' : 'fetch'

      if (method === 'beacon') {
        navigator.sendBeacon('/api/errors', JSON.stringify({ errors }))
      } else {
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ errors }),
          keepalive: immediate
        })
      }
    } catch (error) {
      // 전송 실패 시 다시 큐에 추가 (최대 3회까지)
      const retryableErrors = errors.filter(e => !e.context.retryCount || e.context.retryCount < 3)
      retryableErrors.forEach(e => {
        e.context.retryCount = (e.context.retryCount || 0) + 1
        this.errorQueue.push(e)
      })
    } finally {
      this.isFlushingQueue = false
    }
  }

  /**
   * 컴포넌트별 로거 팩토리
   */
  createComponentLogger(componentName: string, category: ErrorContext['category'] = 'ui') {
    return {
      error: (message: string, error?: Error, additionalContext: Partial<ErrorContext> = {}) => {
        this.log(message, {
          component: componentName,
          category,
          severity: 'high',
          ...additionalContext
        }, error)
      },
      warn: (message: string, context: Partial<ErrorContext> = {}) => {
        this.log(message, {
          component: componentName,
          category,
          severity: 'medium',
          ...context
        })
      },
      info: (message: string, context: Partial<ErrorContext> = {}) => {
        this.log(message, {
          component: componentName,
          category,
          severity: 'low',
          ...context
        })
      },
      critical: (message: string, error?: Error, context: Partial<ErrorContext> = {}) => {
        this.log(message, {
          component: componentName,
          category,
          severity: 'critical',
          ...context
        }, error)
      }
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const errorLogger = ErrorLogger.getInstance()

// 편의 함수들
export const logError = (message: string, context?: ErrorContext, error?: Error) => {
  errorLogger.log(message, context, error)
}

export const createLogger = (componentName: string, category?: ErrorContext['category']) => {
  return errorLogger.createComponentLogger(componentName, category)
}

// React 컴포넌트용 훅
export const useErrorLogger = (componentName: string, category?: ErrorContext['category']) => {
  return errorLogger.createComponentLogger(componentName, category)
}
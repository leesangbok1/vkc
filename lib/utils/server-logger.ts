/**
 * 서버 사이드 전용 에러 로깅 시스템
 */

export interface ServerErrorContext {
  component?: string
  action?: string
  userId?: string
  url?: string
  timestamp?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  category?: 'ui' | 'api' | 'auth' | 'system' | 'performance'
  retryCount?: number
  // API-specific context
  answerId?: string
  questionId?: string
  commentId?: string
  targetUserId?: string
  targetId?: string
  authorId?: string
  voteType?: string
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
  // Notification-specific context
  notificationId?: string
  notificationIds?: string[]
  notificationCount?: number
  notificationData?: any
  statusCode?: number
  responseData?: string
  // Service-specific context
  permission?: string
  options?: any
  digestData?: any
  userCount?: number
  mentionedUserId?: string
}

export interface ServerErrorLogEntry {
  message: string
  error?: Error
  context: ServerErrorContext
  stackTrace?: string
  errorId: string
}

class ServerErrorLogger {
  private static instance: ServerErrorLogger

  static getInstance(): ServerErrorLogger {
    if (!ServerErrorLogger.instance) {
      ServerErrorLogger.instance = new ServerErrorLogger()
    }
    return ServerErrorLogger.instance
  }

  private constructor() {}

  info(message: string, context: Partial<ServerErrorContext> = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, context)
    }
  }

  warn(message: string, context: Partial<ServerErrorContext> = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, context)
    }
  }

  error(message: string, error?: Error, context: Partial<ServerErrorContext> = {}) {
    const errorEntry: ServerErrorLogEntry = {
      message,
      error,
      context: {
        timestamp: new Date().toISOString(),
        severity: context.severity || 'medium',
        category: context.category || 'system',
        ...context
      },
      stackTrace: error?.stack,
      errorId: Date.now().toString()
    }

    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, errorEntry)
    }

    // 프로덕션에서는 외부 로깅 서비스로 전송 (예: Sentry, LogRocket)
    if (process.env.NODE_ENV === 'production') {
      // TODO: 프로덕션 로깅 서비스 통합
      console.error(`[PROD ERROR] ${message}`, errorEntry)
    }
  }
}

export function createServerLogger(component: string, category: ServerErrorContext['category'] = 'system') {
  const logger = ServerErrorLogger.getInstance()

  return {
    info: (message: string, context: Partial<ServerErrorContext> = {}) => {
      logger.info(message, { component, category, ...context })
    },
    warn: (message: string, context: Partial<ServerErrorContext> = {}) => {
      logger.warn(message, { component, category, ...context })
    },
    error: (message: string, error?: Error, context: Partial<ServerErrorContext> = {}) => {
      logger.error(message, error, { component, category, ...context })
    }
  }
}
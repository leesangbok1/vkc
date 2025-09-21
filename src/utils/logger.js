/**
 * 통합 로깅 시스템
 * 개발/프로덕션 환경별 로그 레벨 관리
 */

// 로그 레벨 정의
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
}

const LOG_LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG',
  4: 'TRACE'
}

const LOG_COLORS = {
  ERROR: '#dc3545',
  WARN: '#ffc107',
  INFO: '#17a2b8',
  DEBUG: '#6c757d',
  TRACE: '#6f42c1'
}

class Logger {
  constructor() {
    // 환경별 로그 레벨 설정
    this.currentLevel = this.getLogLevel()
    this.isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development'
    this.logs = [] // 로그 히스토리
    this.maxLogs = 1000 // 최대 저장 로그 수

    // 외부 로그 서비스 설정
    this.externalLoggers = []

    this.setupErrorTracking()
  }

  /**
   * 환경별 로그 레벨 결정
   */
  getLogLevel() {
    // 환경 변수에서 로그 레벨 읽기
    const envLevel = import.meta.env.VITE_LOG_LEVEL
    if (envLevel && LOG_LEVELS[envLevel.toUpperCase()] !== undefined) {
      return LOG_LEVELS[envLevel.toUpperCase()]
    }

    // 개발 환경: DEBUG, 프로덕션: INFO
    return this.isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO
  }

  /**
   * 전역 에러 추적 설정
   */
  setupErrorTracking() {
    // 처리되지 않은 Promise 에러
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise,
        stack: event.reason?.stack
      })
    })

    // 전역 JavaScript 에러
    window.addEventListener('error', (event) => {
      this.error('Global JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      })
    })

    // 리소스 로딩 에러
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.warn('Resource Loading Error:', {
          type: event.target.tagName,
          source: event.target.src || event.target.href,
          message: 'Failed to load resource'
        })
      }
    }, true)
  }

  /**
   * 로그 저장 및 관리
   */
  storeLog(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: LOG_LEVEL_NAMES[level],
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    // 메모리에 저장
    this.logs.push(logEntry)

    // 최대 로그 수 제한
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // localStorage에 최근 로그 저장 (개발 환경에서만)
    if (this.isDevelopment) {
      try {
        const recentLogs = this.logs.slice(-100) // 최근 100개만
        localStorage.setItem('app_logs', JSON.stringify(recentLogs))
      } catch (error) {
        // localStorage 저장 실패 시 무시
      }
    }

    // 외부 로거로 전송
    this.sendToExternalLoggers(logEntry)
  }

  /**
   * 외부 로깅 서비스로 전송
   */
  sendToExternalLoggers(logEntry) {
    this.externalLoggers.forEach(logger => {
      try {
        logger(logEntry)
      } catch (error) {
        console.warn('External logger failed:', error)
      }
    })
  }

  /**
   * 외부 로거 추가
   */
  addExternalLogger(loggerFunction) {
    this.externalLoggers.push(loggerFunction)
  }

  /**
   * 콘솔 출력 형식화
   */
  formatConsoleOutput(level, message, data) {
    const timestamp = new Date().toLocaleTimeString()
    const levelName = LOG_LEVEL_NAMES[level]
    const color = LOG_COLORS[levelName]

    if (data) {
      console.groupCollapsed(
        `%c[${timestamp}] ${levelName}: ${message}`,
        `color: ${color}; font-weight: bold;`
      )
      console.log('Data:', data)
      console.groupEnd()
    } else {
      console.log(
        `%c[${timestamp}] ${levelName}: ${message}`,
        `color: ${color}; font-weight: bold;`
      )
    }
  }

  /**
   * 기본 로깅 메소드
   */
  log(level, message, data = null) {
    if (level <= this.currentLevel) {
      this.formatConsoleOutput(level, message, data)
      this.storeLog(level, message, data)
    }
  }

  /**
   * ERROR 레벨 로그
   */
  error(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data)

    // 에러는 항상 추가 처리
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: message,
        fatal: false
      })
    }
  }

  /**
   * WARN 레벨 로그
   */
  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data)
  }

  /**
   * INFO 레벨 로그
   */
  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data)
  }

  /**
   * DEBUG 레벨 로그
   */
  debug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data)
  }

  /**
   * TRACE 레벨 로그 (가장 상세한 로그)
   */
  trace(message, data = null) {
    this.log(LOG_LEVELS.TRACE, message, data)
  }

  /**
   * 성능 측정 시작
   */
  startTimer(label) {
    if (this.currentLevel >= LOG_LEVELS.DEBUG) {
      console.time(label)
      this.debug(`Timer started: ${label}`)
    }
  }

  /**
   * 성능 측정 종료
   */
  endTimer(label) {
    if (this.currentLevel >= LOG_LEVELS.DEBUG) {
      console.timeEnd(label)
      this.debug(`Timer ended: ${label}`)
    }
  }

  /**
   * API 요청 로깅
   */
  logApiRequest(method, url, data = null) {
    this.info(`API Request: ${method} ${url}`, {
      method,
      url,
      data: data ? JSON.stringify(data).substring(0, 200) : null,
      timestamp: Date.now()
    })
  }

  /**
   * API 응답 로깅
   */
  logApiResponse(method, url, status, responseTime, data = null) {
    const level = status >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO
    this.log(level, `API Response: ${method} ${url} (${status}) - ${responseTime}ms`, {
      method,
      url,
      status,
      responseTime,
      data: data ? JSON.stringify(data).substring(0, 200) : null
    })
  }

  /**
   * 사용자 액션 로깅
   */
  logUserAction(action, details = null) {
    this.info(`User Action: ${action}`, details)
  }

  /**
   * 로그 히스토리 가져오기
   */
  getLogs(level = null, limit = 100) {
    let filteredLogs = this.logs

    if (level !== null) {
      filteredLogs = this.logs.filter(log =>
        LOG_LEVELS[log.level] <= level
      )
    }

    return filteredLogs.slice(-limit)
  }

  /**
   * 로그 히스토리 지우기
   */
  clearLogs() {
    this.logs = []
    if (this.isDevelopment) {
      localStorage.removeItem('app_logs')
    }
    this.info('Log history cleared')
  }

  /**
   * 로그 내보내기 (디버깅용)
   */
  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: this.logs
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `app-logs-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    this.info('Logs exported successfully')
  }

  /**
   * 상태 정보 가져오기
   */
  getStatus() {
    return {
      currentLevel: this.currentLevel,
      currentLevelName: LOG_LEVEL_NAMES[this.currentLevel],
      isDevelopment: this.isDevelopment,
      logCount: this.logs.length,
      maxLogs: this.maxLogs,
      externalLoggers: this.externalLoggers.length
    }
  }
}

// 싱글톤 인스턴스 생성
const logger = new Logger()

// 개발 환경에서 전역 접근 허용
if (logger.isDevelopment) {
  window.logger = logger
}

export default logger
export { LOG_LEVELS }
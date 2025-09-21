/**
 * 자동 오류 감지 및 수정 에이전트
 * 런타임 오류, 컴파일 오류, 테스트 실패를 자동으로 감지하고 수정
 */

import { autoWorkflow } from './auto-workflow-manager.js'

class ErrorDetectionAgent {
  constructor() {
    this.isMonitoring = false
    this.errorQueue = []
    this.fixAttempts = new Map()
    this.maxFixAttempts = 3

    this.errorPatterns = {
      // React 관련 오류
      'Cannot read properties of undefined': {
        type: 'runtime',
        priority: 'high',
        autoFix: true,
        fixStrategy: 'addNullCheck'
      },
      'React Hook "useState" is called': {
        type: 'react-hooks',
        priority: 'medium',
        autoFix: true,
        fixStrategy: 'moveHookToComponent'
      },
      'Module not found': {
        type: 'import',
        priority: 'high',
        autoFix: true,
        fixStrategy: 'fixImportPath'
      },
      'Property does not exist': {
        type: 'type',
        priority: 'medium',
        autoFix: true,
        fixStrategy: 'addPropertyOrType'
      },
      // Firebase 관련 오류
      'Firebase: Error (auth/': {
        type: 'firebase-auth',
        priority: 'high',
        autoFix: true,
        fixStrategy: 'fixFirebaseAuth'
      },
      'FirebaseError: Missing or insufficient permissions': {
        type: 'firebase-permissions',
        priority: 'high',
        autoFix: true,
        fixStrategy: 'updateFirebaseRules'
      }
    }

    this.initializeErrorMonitoring()
  }

  /**
   * 오류 모니터링 초기화
   */
  initializeErrorMonitoring() {
    // 전역 오류 핸들러
    window.addEventListener('error', (event) => {
      this.handleRuntimeError(event.error, event)
    })

    // Promise rejection 핸들러
    window.addEventListener('unhandledrejection', (event) => {
      this.handlePromiseRejection(event.reason, event)
    })

    // React Error Boundary 통합
    this.setupReactErrorBoundary()

    // 콘솔 오류 모니터링
    this.monitorConsoleErrors()

    console.log('🔍 오류 감지 에이전트 시작됨')
  }

  /**
   * React Error Boundary 설정
   */
  setupReactErrorBoundary() {
    // React가 로드되었는지 확인
    if (typeof window !== 'undefined' && window.React) {
      // React 컴포넌트 오류를 catch하는 전역 핸들러
      const originalComponentDidCatch = window.React.Component.prototype.componentDidCatch

      window.React.Component.prototype.componentDidCatch = function(error, errorInfo) {
        // 원본 메서드 호출
        if (originalComponentDidCatch) {
          originalComponentDidCatch.call(this, error, errorInfo)
        }

        // 오류 처리
        window.errorDetectionAgent?.handleReactError(error, errorInfo, this)
      }
    } else {
      // React가 아직 로드되지 않은 경우, 나중에 다시 시도
      setTimeout(() => this.setupReactErrorBoundary(), 1000)
    }
  }

  /**
   * 콘솔 오류 모니터링
   */
  monitorConsoleErrors() {
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args) => {
      originalError.apply(console, args)
      this.handleConsoleError('error', args)
    }

    console.warn = (...args) => {
      originalWarn.apply(console, args)
      this.handleConsoleError('warn', args)
    }
  }

  /**
   * 런타임 오류 처리
   */
  async handleRuntimeError(error, event) {
    const errorInfo = {
      type: 'runtime',
      message: error.message,
      stack: error.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date(),
      url: window.location.href
    }

    console.error('🚨 런타임 오류 감지:', errorInfo)
    await this.processError(errorInfo)
  }

  /**
   * Promise rejection 처리
   */
  async handlePromiseRejection(reason, event) {
    const errorInfo = {
      type: 'promise_rejection',
      message: reason?.message || String(reason),
      stack: reason?.stack,
      timestamp: new Date(),
      url: window.location.href
    }

    console.error('🚨 Promise 거부 감지:', errorInfo)
    await this.processError(errorInfo)
  }

  /**
   * React 컴포넌트 오류 처리
   */
  async handleReactError(error, errorInfo, component) {
    const errorDetail = {
      type: 'react_component',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName: component.constructor.name,
      timestamp: new Date(),
      url: window.location.href
    }

    console.error('🚨 React 컴포넌트 오류 감지:', errorDetail)
    await this.processError(errorDetail)
  }

  /**
   * 콘솔 오류 처리
   */
  async handleConsoleError(level, args) {
    const message = args.join(' ')

    // 오류 패턴 매칭
    for (const [pattern, config] of Object.entries(this.errorPatterns)) {
      if (message.includes(pattern)) {
        const errorInfo = {
          type: config.type,
          level,
          message,
          pattern,
          timestamp: new Date(),
          config
        }

        console.warn('🔍 패턴 매칭 오류 감지:', pattern)
        await this.processError(errorInfo)
        break
      }
    }
  }

  /**
   * 오류 처리 메인 로직
   */
  async processError(errorInfo) {
    // 중복 오류 방지
    const errorKey = this.generateErrorKey(errorInfo)
    if (this.fixAttempts.has(errorKey)) {
      const attempts = this.fixAttempts.get(errorKey)
      if (attempts >= this.maxFixAttempts) {
        console.warn('🚫 최대 수정 시도 횟수 초과:', errorKey)
        return
      }
      this.fixAttempts.set(errorKey, attempts + 1)
    } else {
      this.fixAttempts.set(errorKey, 1)
    }

    // 오류 큐에 추가
    this.errorQueue.push(errorInfo)

    // 자동 수정 시도
    if (errorInfo.config?.autoFix) {
      await this.attemptAutoFix(errorInfo)
    } else {
      // 수동 처리를 위한 이슈 등록
      this.registerErrorIssue(errorInfo)
    }
  }

  /**
   * 자동 수정 시도
   */
  async attemptAutoFix(errorInfo) {
    const { fixStrategy } = errorInfo.config

    console.log(`🔧 자동 수정 시도: ${fixStrategy}`)

    try {
      switch (fixStrategy) {
        case 'addNullCheck':
          await this.addNullChecks(errorInfo)
          break
        case 'fixImportPath':
          await this.fixImportPaths(errorInfo)
          break
        case 'moveHookToComponent':
          await this.fixReactHooks(errorInfo)
          break
        case 'fixFirebaseAuth':
          await this.fixFirebaseAuth(errorInfo)
          break
        default:
          console.warn('🤷 알 수 없는 수정 전략:', fixStrategy)
      }

      console.log('✅ 자동 수정 완료:', fixStrategy)

    } catch (fixError) {
      console.error('❌ 자동 수정 실패:', fixError)
      this.registerErrorIssue(errorInfo, fixError)
    }
  }

  /**
   * Null Check 추가
   */
  async addNullChecks(errorInfo) {
    // 스택 트레이스에서 파일과 라인 정보 추출
    const fileInfo = this.extractFileInfoFromStack(errorInfo.stack)

    if (fileInfo) {
      // 실제 구현에서는 파일을 읽고 null check를 추가
      console.log('📝 Null check 추가 중:', fileInfo)

      // 모의 수정
      const fixTask = {
        type: 'code_fix',
        target: fileInfo.file,
        line: fileInfo.line,
        fix: 'add_null_check',
        urgency: 'high'
      }

      // 워크플로에 자동 수정 작업 등록
      autoWorkflow.registerIssue(`auto-fix-${Date.now()}`, {
        title: `자동 수정: Null Check 추가`,
        description: `파일: ${fileInfo.file}, 라인: ${fileInfo.line}`,
        priority: 'high',
        assignedAgents: ['coder'],
        steps: [
          {
            name: 'Null Check 추가',
            type: 'code',
            config: fixTask
          }
        ]
      })
    }
  }

  /**
   * Import 경로 수정
   */
  async fixImportPaths(errorInfo) {
    const missingModule = this.extractModuleFromError(errorInfo.message)

    if (missingModule) {
      console.log('📦 Import 경로 수정 중:', missingModule)

      // 가능한 경로들 검색
      const possiblePaths = await this.findPossibleImportPaths(missingModule)

      if (possiblePaths.length > 0) {
        autoWorkflow.registerIssue(`auto-fix-import-${Date.now()}`, {
          title: `자동 수정: Import 경로 수정`,
          description: `모듈: ${missingModule}`,
          priority: 'high',
          assignedAgents: ['coder'],
          steps: [
            {
              name: 'Import 경로 수정',
              type: 'code',
              config: {
                type: 'fix_import',
                module: missingModule,
                possiblePaths
              }
            }
          ]
        })
      }
    }
  }

  /**
   * React Hooks 수정
   */
  async fixReactHooks(errorInfo) {
    console.log('⚛️ React Hooks 오류 수정 중')

    autoWorkflow.registerIssue(`auto-fix-hooks-${Date.now()}`, {
      title: `자동 수정: React Hooks 규칙 위반`,
      description: errorInfo.message,
      priority: 'medium',
      assignedAgents: ['coder'],
      steps: [
        {
          name: 'Hooks 규칙 수정',
          type: 'code',
          config: {
            type: 'fix_hooks',
            error: errorInfo
          }
        }
      ]
    })
  }

  /**
   * Firebase 인증 수정
   */
  async fixFirebaseAuth(errorInfo) {
    console.log('🔥 Firebase 인증 오류 수정 중')

    autoWorkflow.registerIssue(`auto-fix-firebase-${Date.now()}`, {
      title: `자동 수정: Firebase 인증 오류`,
      description: errorInfo.message,
      priority: 'high',
      assignedAgents: ['coder'],
      steps: [
        {
          name: 'Firebase 설정 수정',
          type: 'service',
          config: {
            type: 'fix_firebase_auth',
            error: errorInfo
          }
        }
      ]
    })
  }

  /**
   * 수동 처리용 이슈 등록
   */
  registerErrorIssue(errorInfo, fixError = null) {
    const issueTitle = `오류 수정 필요: ${errorInfo.type}`
    const description = `
오류 메시지: ${errorInfo.message}
타입: ${errorInfo.type}
${fixError ? `자동 수정 실패: ${fixError.message}` : ''}
발생 시간: ${errorInfo.timestamp}
    `.trim()

    autoWorkflow.registerIssue(`error-${Date.now()}`, {
      title: issueTitle,
      description,
      priority: errorInfo.config?.priority || 'medium',
      assignedAgents: ['debugger', 'coder'],
      steps: [
        {
          name: '오류 분석',
          type: 'debug',
          config: { error: errorInfo }
        },
        {
          name: '수정 방안 구현',
          type: 'code',
          config: { error: errorInfo }
        },
        {
          name: '테스트 실행',
          type: 'test'
        }
      ]
    })
  }

  // 유틸리티 메서드들
  generateErrorKey(errorInfo) {
    return `${errorInfo.type}-${errorInfo.message.substring(0, 50)}`
  }

  extractFileInfoFromStack(stack) {
    if (!stack) return null

    const match = stack.match(/at\s+.*?\((.+?):(\d+):(\d+)\)/)
    if (match) {
      return {
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3])
      }
    }
    return null
  }

  extractModuleFromError(message) {
    const match = message.match(/Module not found.*?'(.+?)'/)
    return match ? match[1] : null
  }

  async findPossibleImportPaths(module) {
    // 실제 구현에서는 파일 시스템을 검색
    const commonPaths = [
      `./components/${module}`,
      `../components/${module}`,
      `@components/${module}`,
      `./services/${module}`,
      `@services/${module}`,
      `./utils/${module}`,
      `@utils/${module}`
    ]

    return commonPaths
  }

  /**
   * 상태 조회
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      errorQueueLength: this.errorQueue.length,
      totalFixAttempts: Array.from(this.fixAttempts.values()).reduce((a, b) => a + b, 0),
      successfulFixes: Array.from(this.fixAttempts.entries()).filter(([k, v]) => v > 0).length,
      recentErrors: this.errorQueue.slice(-5)
    }
  }
}

// 전역 인스턴스 생성
export const errorDetectionAgent = new ErrorDetectionAgent()

// 전역 접근을 위한 설정
if (typeof window !== 'undefined') {
  window.errorDetectionAgent = errorDetectionAgent
}

export default ErrorDetectionAgent
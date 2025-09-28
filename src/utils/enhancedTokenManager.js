/**
 * Enhanced Token Manager with Multi-API Support and Auto-Resume
 * Supports Claude API, Firebase, GitHub API token management
 */

class EnhancedTokenManager {
  constructor() {
    this.isActive = false
    this.services = new Map()
    this.taskQueue = []
    this.currentTask = null
    this.retryState = new Map()
    this.indexedDB = null // IndexedDB 매니저 참조

    // Configuration
    this.config = {
      checkInterval: 30000, // 30초마다 체크
      maxRetries: 5,
      baseDelay: 1000, // 1초 기본 지연
      maxDelay: 300000, // 5분 최대 지연
      priorityLevels: ['critical', 'high', 'normal', 'low'],
      persistenceKey: 'enhanced-token-manager-state',
      useIndexedDB: true // IndexedDB 사용 여부
    }

    this.initializeServices()
    this.loadPersistedState()
    this.startMonitoring()
  }

  /**
   * 서비스 초기화
   */
  initializeServices() {
    // Claude API 서비스
    this.services.set('claude', {
      name: 'Claude API',
      apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
      baseUrl: 'https://api.anthropic.com/v1',
      status: 'unknown',
      lastCheck: null,
      rateLimitInfo: {},
      dailyUsage: 0,
      monthlyUsage: 0,
      resetTime: null
    })

    // Firebase 서비스
    this.services.set('firebase', {
      name: 'Firebase',
      status: 'unknown',
      lastCheck: null,
      rateLimitInfo: {},
      quotaUsage: 0
    })

    // GitHub API 서비스
    this.services.set('github', {
      name: 'GitHub API',
      apiKey: import.meta.env.VITE_GITHUB_TOKEN,
      baseUrl: 'https://api.github.com',
      status: 'unknown',
      lastCheck: null,
      rateLimitInfo: {},
      remainingCalls: 5000,
      resetTime: null
    })

    console.log('🔧 Enhanced Token Manager 서비스 초기화 완료')
  }

  /**
   * 모니터링 시작
   */
  startMonitoring() {
    if (this.isActive) return

    this.isActive = true
    console.log('📊 Enhanced Token Manager 모니터링 시작')

    // 주기적 상태 체크
    this.monitoringInterval = setInterval(() => {
      this.checkAllServices()
      this.processTaskQueue()
    }, this.config.checkInterval)

    // 페이지 가시성 변경 시 즉시 체크
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.checkAllServices()
        }
      })
    }

    // 초기 체크
    this.checkAllServices()
  }

  /**
   * 모니터링 중지
   */
  stopMonitoring() {
    this.isActive = false

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    console.log('🛑 Enhanced Token Manager 모니터링 중지')
  }

  /**
   * 모든 서비스 상태 확인
   */
  async checkAllServices() {
    const checkPromises = Array.from(this.services.keys()).map(serviceId =>
      this.checkServiceStatus(serviceId)
    )

    try {
      await Promise.allSettled(checkPromises)
      this.persistState()
    } catch (error) {
      console.warn('⚠️ 서비스 상태 확인 중 일부 오류:', error)
    }
  }

  /**
   * 특정 서비스 상태 확인
   */
  async checkServiceStatus(serviceId) {
    const service = this.services.get(serviceId)
    if (!service) return

    try {
      let result
      switch (serviceId) {
        case 'claude':
          result = await this.checkClaudeStatus(service)
          break
        case 'firebase':
          result = await this.checkFirebaseStatus(service)
          break
        case 'github':
          result = await this.checkGitHubStatus(service)
          break
        default:
          return
      }

      service.status = result.available ? 'available' : 'limited'
      service.lastCheck = Date.now()
      service.rateLimitInfo = result.rateLimitInfo || {}

      if (result.resetTime) {
        service.resetTime = result.resetTime
      }

      console.log(`✅ ${service.name} 상태: ${service.status}`)

    } catch (error) {
      service.status = 'error'
      service.lastCheck = Date.now()
      service.error = error.message

      console.warn(`⚠️ ${service.name} 상태 확인 실패:`, error.message)
    }
  }

  /**
   * Claude API 상태 확인
   */
  async checkClaudeStatus(service) {
    if (!service.apiKey) {
      console.log('🔧 Claude API 키가 설정되지 않음 - 개발 모드로 실행')
      return { available: false, rateLimitInfo: {} }
    }

    // 간단한 사용량 확인 요청
    const response = await fetch(`${service.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': service.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      })
    })

    const rateLimitInfo = {
      requestsLimit: response.headers.get('anthropic-ratelimit-requests-limit'),
      requestsRemaining: response.headers.get('anthropic-ratelimit-requests-remaining'),
      requestsReset: response.headers.get('anthropic-ratelimit-requests-reset'),
      tokensLimit: response.headers.get('anthropic-ratelimit-tokens-limit'),
      tokensRemaining: response.headers.get('anthropic-ratelimit-tokens-remaining'),
      tokensReset: response.headers.get('anthropic-ratelimit-tokens-reset')
    }

    let resetTime = null
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after')
      resetTime = retryAfter ? Date.now() + (parseInt(retryAfter) * 1000) : null
    }

    return {
      available: response.status !== 429,
      rateLimitInfo,
      resetTime,
      response: response.status === 429 ? null : await response.json()
    }
  }

  /**
   * Firebase 상태 확인
   */
  async checkFirebaseStatus(service) {
    try {
      const { testFirebaseConnection } = await import('../config/firebase.js')
      const result = await testFirebaseConnection()

      return {
        available: result.success && result.connected,
        rateLimitInfo: {
          mode: result.mode,
          connected: result.connected
        }
      }
    } catch (error) {
      return {
        available: false,
        rateLimitInfo: { error: error.message }
      }
    }
  }

  /**
   * GitHub API 상태 확인
   */
  async checkGitHubStatus(service) {
    if (!service.apiKey) {
      console.log('🔧 GitHub API 키가 설정되지 않음 - 개발 모드로 실행')
      return { available: false, rateLimitInfo: {} }
    }

    const response = await fetch(`${service.baseUrl}/rate_limit`, {
      headers: {
        'Authorization': `token ${service.apiKey}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const data = await response.json()
    const core = data.rate || data.resources?.core || {}

    return {
      available: core.remaining > 100, // 100개 이상 남았을 때만 사용 가능으로 판단
      rateLimitInfo: {
        limit: core.limit,
        remaining: core.remaining,
        used: core.used,
        reset: core.reset
      },
      resetTime: core.reset ? core.reset * 1000 : null
    }
  }

  /**
   * 작업 추가
   */
  addTask(task) {
    const enhancedTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...task,
      createdAt: Date.now(),
      status: 'pending',
      priority: task.priority || 'normal',
      serviceId: task.serviceId || 'claude',
      retryCount: 0,
      lastAttempt: null,
      context: task.context || {}
    }

    // 우선순위에 따라 정렬하여 삽입
    const priorityIndex = this.config.priorityLevels.indexOf(enhancedTask.priority)
    let insertIndex = this.taskQueue.length

    for (let i = 0; i < this.taskQueue.length; i++) {
      const existingPriority = this.config.priorityLevels.indexOf(this.taskQueue[i].priority)
      if (priorityIndex < existingPriority) {
        insertIndex = i
        break
      }
    }

    this.taskQueue.splice(insertIndex, 0, enhancedTask)
    this.persistState()

    console.log(`📝 작업 추가됨 (${enhancedTask.priority}): ${enhancedTask.id}`)

    // 현재 작업이 없으면 즉시 처리 시도
    if (!this.currentTask) {
      this.processTaskQueue()
    }

    return enhancedTask.id
  }

  /**
   * 작업 큐 처리
   */
  async processTaskQueue() {
    if (this.currentTask || this.taskQueue.length === 0) {
      return
    }

    // 실행 가능한 첫 번째 작업 찾기
    let taskIndex = -1
    for (let i = 0; i < this.taskQueue.length; i++) {
      const task = this.taskQueue[i]
      const service = this.services.get(task.serviceId)

      if (service && service.status === 'available') {
        taskIndex = i
        break
      }
    }

    if (taskIndex === -1) {
      console.log('⏳ 실행 가능한 작업 없음 - 토큰 복구 대기 중')
      return
    }

    this.currentTask = this.taskQueue.splice(taskIndex, 1)[0]
    this.currentTask.status = 'running'
    this.currentTask.lastAttempt = Date.now()

    console.log(`🚀 작업 실행 시작: ${this.currentTask.id}`)

    try {
      const result = await this.executeTask(this.currentTask)

      this.currentTask.status = 'completed'
      this.currentTask.result = result
      this.currentTask.completedAt = Date.now()

      console.log(`✅ 작업 완료: ${this.currentTask.id}`)

      // 완료된 작업을 히스토리에 추가
      if (this.indexedDB) {
        try {
          await this.indexedDB.addToHistory(this.currentTask)
        } catch (historyError) {
          console.warn('히스토리 저장 실패:', historyError)
        }
      }

      // 완료된 작업 정리
      this.currentTask = null
      await this.persistState()

      // 다음 작업 처리
      setTimeout(() => this.processTaskQueue(), 100)

    } catch (error) {
      console.error(`❌ 작업 실행 실패: ${this.currentTask.id}`, error)
      await this.handleTaskFailure(this.currentTask, error)
    }
  }

  /**
   * 작업 실행
   */
  async executeTask(task) {
    switch (task.type) {
      case 'claude_api_call':
        return await this.executeClaudeTask(task)
      case 'firebase_operation':
        return await this.executeFirebaseTask(task)
      case 'github_api_call':
        return await this.executeGitHubTask(task)
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  /**
   * Claude 작업 실행
   */
  async executeClaudeTask(task) {
    const service = this.services.get('claude')
    const { prompt, model = 'claude-3-sonnet-20240229', maxTokens = 4000 } = task.data

    const response = await fetch(`${service.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': service.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED')
      }
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Firebase 작업 실행
   */
  async executeFirebaseTask(task) {
    // Firebase 작업 구현 (실제 Firebase 작업에 따라 달라짐)
    console.log('Firebase 작업 실행:', task.data)
    return { success: true, data: task.data }
  }

  /**
   * GitHub 작업 실행
   */
  async executeGitHubTask(task) {
    const service = this.services.get('github')
    const { endpoint, method = 'GET', data } = task.data

    const response = await fetch(`${service.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `token ${service.apiKey}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
        throw new Error('RATE_LIMIT_EXCEEDED')
      }
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * 작업 실패 처리
   */
  async handleTaskFailure(task, error) {
    const isRateLimit = error.message.includes('RATE_LIMIT_EXCEEDED')

    if (isRateLimit) {
      // Rate limit 에러는 재시도 카운트에 포함하지 않음
      console.log(`⏳ Rate limit 감지, 작업 큐에 다시 추가: ${task.id}`)
      task.status = 'pending'
      this.taskQueue.unshift(task) // 우선순위를 위해 앞쪽에 추가
    } else {
      task.retryCount++

      if (task.retryCount <= this.config.maxRetries) {
        // 지수 백오프로 재시도
        const delay = this.calculateBackoffDelay(task.retryCount)
        console.log(`🔄 작업 재시도 예정 (${task.retryCount}/${this.config.maxRetries}): ${task.id}, ${delay}ms 후`)

        task.status = 'retrying'
        setTimeout(() => {
          task.status = 'pending'
          this.taskQueue.unshift(task)
          this.processTaskQueue()
        }, delay)
      } else {
        console.error(`💀 작업 최종 실패: ${task.id}`)
        task.status = 'failed'
        task.error = error.message
        task.failedAt = Date.now()
      }
    }

    this.currentTask = null
    this.persistState()

    // Rate limit이 아닌 경우에만 다음 작업 즉시 처리 시도
    if (!isRateLimit) {
      setTimeout(() => this.processTaskQueue(), 100)
    }
  }

  /**
   * 지수 백오프 지연 시간 계산
   */
  calculateBackoffDelay(attempt) {
    const delay = this.config.baseDelay * Math.pow(2, attempt - 1)
    const jitter = Math.random() * 0.1 * delay // 10% 지터 추가
    return Math.min(delay + jitter, this.config.maxDelay)
  }

  /**
   * 상태 저장
   */
  async persistState() {
    try {
      const state = {
        taskQueue: this.taskQueue,
        currentTask: this.currentTask,
        services: Object.fromEntries(this.services),
        timestamp: Date.now()
      }

      // IndexedDB 사용 (우선)
      if (this.config.useIndexedDB && this.indexedDB) {
        await this.indexedDB.saveTaskQueue(this.taskQueue)
        await this.indexedDB.saveFullState(state)
      } else {
        // localStorage 폴백
        localStorage.setItem(this.config.persistenceKey, JSON.stringify(state))
      }
    } catch (error) {
      console.warn('⚠️ 상태 저장 실패:', error)
      // IndexedDB 실패 시 localStorage로 폴백
      try {
        const state = {
          taskQueue: this.taskQueue,
          currentTask: this.currentTask,
          services: Object.fromEntries(this.services),
          timestamp: Date.now()
        }
        localStorage.setItem(this.config.persistenceKey, JSON.stringify(state))
      } catch (localError) {
        console.error('localStorage 저장도 실패:', localError)
      }
    }
  }

  /**
   * 저장된 상태 로드
   */
  async loadPersistedState() {
    try {
      let state = null

      // IndexedDB에서 먼저 시도
      if (this.config.useIndexedDB && this.indexedDB) {
        try {
          state = await this.indexedDB.getFullState()
        } catch (indexedError) {
          console.warn('IndexedDB 로드 실패, localStorage로 폴백:', indexedError)
        }
      }

      // localStorage 폴백
      if (!state) {
        const saved = localStorage.getItem(this.config.persistenceKey)
        if (saved) {
          state = JSON.parse(saved)
        }
      }

      if (!state) return

      // 24시간 이내 데이터만 복원
      if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
        this.taskQueue = state.taskQueue || []
        this.currentTask = state.currentTask || null

        // 서비스 상태 복원
        if (state.services) {
          Object.entries(state.services).forEach(([id, serviceData]) => {
            if (this.services.has(id)) {
              Object.assign(this.services.get(id), serviceData)
            }
          })
        }

        console.log(`🔄 상태 복원됨: ${this.taskQueue.length}개 작업 대기 중`)
      } else {
        console.log('⏰ 저장된 상태가 너무 오래됨 - 새로 시작')
        if (this.indexedDB) {
          await this.indexedDB.clearStore('tokenStates')
        }
        localStorage.removeItem(this.config.persistenceKey)
      }
    } catch (error) {
      console.warn('⚠️ 상태 로드 실패:', error)
    }
  }

  /**
   * 토큰 소진 감지 시 호출
   */
  onTokenExhausted(serviceId, currentContext = {}) {
    console.log(`🚨 ${serviceId} 토큰 소진 감지!`)

    const service = this.services.get(serviceId)
    if (service) {
      service.status = 'limited'
      service.lastExhausted = Date.now()
    }

    // 현재 실행 중인 작업이 있으면 큐에 다시 추가
    if (this.currentTask && this.currentTask.serviceId === serviceId) {
      console.log(`💾 현재 작업 저장: ${this.currentTask.id}`)
      this.currentTask.status = 'pending'
      this.currentTask.context = { ...this.currentTask.context, ...currentContext }
      this.taskQueue.unshift(this.currentTask)
      this.currentTask = null
    }

    this.persistState()
    this.showTokenExhaustedNotification(serviceId, service)
  }

  /**
   * 토큰 소진 알림 표시
   */
  showTokenExhaustedNotification(serviceId, service) {
    if (typeof window === 'undefined') return

    const serviceName = service?.name || serviceId
    const resetTime = service?.resetTime

    // 커스텀 이벤트 발생으로 UI 컴포넌트에 알림
    const event = new CustomEvent('tokenExhausted', {
      detail: {
        serviceId,
        serviceName,
        resetTime,
        queueLength: this.taskQueue.length
      }
    })

    window.dispatchEvent(event)
  }

  /**
   * 서비스별 상태 조회
   */
  getServiceStatus(serviceId) {
    return this.services.get(serviceId)
  }

  /**
   * 전체 상태 조회
   */
  getStatus() {
    return {
      isActive: this.isActive,
      services: Object.fromEntries(this.services),
      taskQueue: this.taskQueue,
      currentTask: this.currentTask,
      queueLength: this.taskQueue.length,
      config: this.config
    }
  }

  /**
   * 작업 큐 초기화
   */
  clearQueue() {
    this.taskQueue = []
    this.currentTask = null
    this.persistState()
    console.log('🗑️ 작업 큐 초기화됨')
  }

  /**
   * 특정 작업 취소
   */
  cancelTask(taskId) {
    // 현재 실행 중인 작업인지 확인
    if (this.currentTask && this.currentTask.id === taskId) {
      this.currentTask = null
      console.log(`🚫 현재 작업 취소됨: ${taskId}`)
      return true
    }

    // 큐에서 작업 제거
    const index = this.taskQueue.findIndex(task => task.id === taskId)
    if (index !== -1) {
      this.taskQueue.splice(index, 1)
      this.persistState()
      console.log(`🚫 큐에서 작업 제거됨: ${taskId}`)
      return true
    }

    return false
  }

  /**
   * 수동 재시도 트리거
   */
  async retryNow() {
    console.log('🖱️ 수동 재시도 요청됨')
    await this.checkAllServices()
    this.processTaskQueue()
  }
}

// 전역 인스턴스 생성 및 내보내기
export const enhancedTokenManager = new EnhancedTokenManager()

// 개발 모드에서 전역 접근 가능
if (typeof window !== 'undefined') {
  window.enhancedTokenManager = enhancedTokenManager
}

export default EnhancedTokenManager
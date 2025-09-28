/**
 * Background Token Monitor Worker
 * 백그라운드에서 토큰 상태를 모니터링하고 자동 재개 처리
 */

// Worker 전역 상태
let isMonitoring = false
let monitoringInterval = null
let services = new Map()
let taskQueue = []
let config = {
  checkInterval: 30000, // 30초
  apiTimeout: 10000,   // 10초
  maxRetries: 3
}

// 메시지 핸들러
self.onmessage = async function(e) {
  const { type, data } = e.data

  try {
    switch (type) {
      case 'INIT':
        await initialize(data)
        break
      case 'START_MONITORING':
        startMonitoring()
        break
      case 'STOP_MONITORING':
        stopMonitoring()
        break
      case 'UPDATE_CONFIG':
        updateConfig(data)
        break
      case 'CHECK_SERVICES':
        await checkAllServices()
        break
      case 'UPDATE_SERVICES':
        updateServices(data)
        break
      case 'UPDATE_QUEUE':
        updateQueue(data)
        break
      case 'GET_STATUS':
        sendStatus()
        break
      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      timestamp: Date.now()
    })
  }
}

/**
 * Worker 초기화
 */
async function initialize(initData) {
  config = { ...config, ...initData.config }
  services = new Map(Object.entries(initData.services || {}))
  taskQueue = initData.taskQueue || []

  self.postMessage({
    type: 'INITIALIZED',
    timestamp: Date.now()
  })

  console.log('🤖 Token Monitor Worker 초기화됨')
}

/**
 * 모니터링 시작
 */
function startMonitoring() {
  if (isMonitoring) return

  isMonitoring = true

  monitoringInterval = setInterval(async () => {
    await checkAllServices()
    await processTokenRecovery()
  }, config.checkInterval)

  self.postMessage({
    type: 'MONITORING_STARTED',
    timestamp: Date.now()
  })

  console.log('📊 백그라운드 토큰 모니터링 시작')
}

/**
 * 모니터링 중지
 */
function stopMonitoring() {
  isMonitoring = false

  if (monitoringInterval) {
    clearInterval(monitoringInterval)
    monitoringInterval = null
  }

  self.postMessage({
    type: 'MONITORING_STOPPED',
    timestamp: Date.now()
  })

  console.log('🛑 백그라운드 토큰 모니터링 중지')
}

/**
 * 설정 업데이트
 */
function updateConfig(newConfig) {
  config = { ...config, ...newConfig }

  // 모니터링 중이면 재시작
  if (isMonitoring) {
    stopMonitoring()
    startMonitoring()
  }

  self.postMessage({
    type: 'CONFIG_UPDATED',
    config,
    timestamp: Date.now()
  })
}

/**
 * 서비스 정보 업데이트
 */
function updateServices(servicesData) {
  services = new Map(Object.entries(servicesData))

  self.postMessage({
    type: 'SERVICES_UPDATED',
    timestamp: Date.now()
  })
}

/**
 * 작업 큐 업데이트
 */
function updateQueue(queueData) {
  taskQueue = queueData

  self.postMessage({
    type: 'QUEUE_UPDATED',
    queueLength: taskQueue.length,
    timestamp: Date.now()
  })
}

/**
 * 모든 서비스 상태 확인
 */
async function checkAllServices() {
  const results = {}

  for (const [serviceId, service] of services) {
    try {
      const status = await checkServiceStatus(serviceId, service)
      results[serviceId] = status

      // 서비스 상태 업데이트
      service.status = status.available ? 'available' : 'limited'
      service.lastCheck = Date.now()
      if (status.rateLimitInfo) {
        service.rateLimitInfo = status.rateLimitInfo
      }
      if (status.resetTime) {
        service.resetTime = status.resetTime
      }
    } catch (error) {
      results[serviceId] = {
        available: false,
        error: error.message
      }
      service.status = 'error'
      service.lastCheck = Date.now()
      service.error = error.message
    }
  }

  self.postMessage({
    type: 'SERVICE_STATUS_UPDATE',
    results,
    timestamp: Date.now()
  })
}

/**
 * 특정 서비스 상태 확인
 */
async function checkServiceStatus(serviceId, service) {
  switch (serviceId) {
    case 'claude':
      return await checkClaudeStatus(service)
    case 'github':
      return await checkGitHubStatus(service)
    case 'firebase':
      return await checkFirebaseStatus(service)
    default:
      throw new Error(`Unknown service: ${serviceId}`)
  }
}

/**
 * Claude API 상태 확인
 */
async function checkClaudeStatus(service) {
  if (!service.apiKey) {
    throw new Error('Claude API key not configured')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout)

  try {
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
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

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
      statusCode: response.status
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

/**
 * GitHub API 상태 확인
 */
async function checkGitHubStatus(service) {
  if (!service.apiKey) {
    throw new Error('GitHub API key not configured')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout)

  try {
    const response = await fetch(`${service.baseUrl}/rate_limit`, {
      headers: {
        'Authorization': `token ${service.apiKey}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const data = await response.json()
    const core = data.rate || data.resources?.core || {}

    return {
      available: core.remaining > 100,
      rateLimitInfo: {
        limit: core.limit,
        remaining: core.remaining,
        used: core.used,
        reset: core.reset
      },
      resetTime: core.reset ? core.reset * 1000 : null
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

/**
 * Firebase 상태 확인 (Worker에서는 간단한 핑 체크)
 */
async function checkFirebaseStatus(service) {
  // Worker에서는 Firebase SDK를 사용할 수 없으므로
  // 메인 스레드에 확인 요청
  return new Promise((resolve) => {
    const messageId = Date.now()

    const handleResponse = (e) => {
      if (e.data.type === 'FIREBASE_STATUS_RESPONSE' && e.data.messageId === messageId) {
        self.removeEventListener('message', handleResponse)
        resolve(e.data.result)
      }
    }

    self.addEventListener('message', handleResponse)

    self.postMessage({
      type: 'REQUEST_FIREBASE_STATUS',
      messageId,
      timestamp: Date.now()
    })

    // 5초 후 타임아웃
    setTimeout(() => {
      self.removeEventListener('message', handleResponse)
      resolve({
        available: false,
        error: 'Firebase status check timeout'
      })
    }, 5000)
  })
}

/**
 * 토큰 복구 처리
 */
async function processTokenRecovery() {
  const availableServices = []
  const limitedServices = []

  for (const [serviceId, service] of services) {
    if (service.status === 'available') {
      availableServices.push(serviceId)
    } else if (service.status === 'limited' && service.resetTime && Date.now() >= service.resetTime) {
      // 리셋 시간이 지났으면 다시 확인
      await checkServiceStatus(serviceId, service)
      if (service.status === 'available') {
        availableServices.push(serviceId)
      }
    } else if (service.status === 'limited') {
      limitedServices.push(serviceId)
    }
  }

  // 복구된 서비스가 있고 대기 중인 작업이 있으면 알림
  if (availableServices.length > 0 && taskQueue.length > 0) {
    self.postMessage({
      type: 'TOKEN_RECOVERY_DETECTED',
      availableServices,
      queueLength: taskQueue.length,
      timestamp: Date.now()
    })
  }

  // 제한된 서비스 정보 전송
  if (limitedServices.length > 0) {
    const limitedInfo = limitedServices.map(serviceId => {
      const service = services.get(serviceId)
      return {
        serviceId,
        serviceName: service.name,
        resetTime: service.resetTime,
        timeUntilReset: service.resetTime ? service.resetTime - Date.now() : null
      }
    })

    self.postMessage({
      type: 'SERVICES_LIMITED',
      services: limitedInfo,
      timestamp: Date.now()
    })
  }
}

/**
 * 현재 상태 전송
 */
function sendStatus() {
  self.postMessage({
    type: 'STATUS_RESPONSE',
    status: {
      isMonitoring,
      services: Object.fromEntries(services),
      queueLength: taskQueue.length,
      config
    },
    timestamp: Date.now()
  })
}

// Worker 종료 시 정리
self.addEventListener('beforeunload', () => {
  stopMonitoring()
})

console.log('🔧 Token Monitor Worker 로드됨')
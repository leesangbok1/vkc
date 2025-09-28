import { useState, useEffect, useCallback, useRef } from 'react'
import { enhancedTokenManager } from '../utils/enhancedTokenManager.js'

/**
 * React Hook for Enhanced Token Manager
 * Provides reactive state management and easy integration
 */
export function useTokenManager() {
  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const statusIntervalRef = useRef(null)

  // 상태 업데이트 함수
  const updateStatus = useCallback(() => {
    try {
      const currentStatus = enhancedTokenManager.getStatus()
      setStatus(currentStatus)
      setError(null)
    } catch (err) {
      console.error('토큰 매니저 상태 업데이트 실패:', err)
      setError(err.message)
    }
  }, [])

  // 초기화 및 구독
  useEffect(() => {
    updateStatus()

    // 주기적 상태 업데이트
    statusIntervalRef.current = setInterval(updateStatus, 2000)

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
      }
    }
  }, [updateStatus])

  // 작업 추가
  const addTask = useCallback(async (taskData) => {
    setIsLoading(true)
    setError(null)

    try {
      const taskId = enhancedTokenManager.addTask(taskData)
      updateStatus() // 즉시 상태 업데이트
      return taskId
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [updateStatus])

  // Claude API 작업 추가 (편의 함수)
  const addClaudeTask = useCallback(async (prompt, options = {}) => {
    return addTask({
      type: 'claude_api_call',
      serviceId: 'claude',
      priority: options.priority || 'normal',
      data: {
        prompt,
        model: options.model || 'claude-3-sonnet-20240229',
        maxTokens: options.maxTokens || 4000
      },
      context: options.context || {}
    })
  }, [addTask])

  // GitHub API 작업 추가 (편의 함수)
  const addGitHubTask = useCallback(async (endpoint, options = {}) => {
    return addTask({
      type: 'github_api_call',
      serviceId: 'github',
      priority: options.priority || 'normal',
      data: {
        endpoint,
        method: options.method || 'GET',
        data: options.data
      },
      context: options.context || {}
    })
  }, [addTask])

  // Firebase 작업 추가 (편의 함수)
  const addFirebaseTask = useCallback(async (operation, options = {}) => {
    return addTask({
      type: 'firebase_operation',
      serviceId: 'firebase',
      priority: options.priority || 'normal',
      data: operation,
      context: options.context || {}
    })
  }, [addTask])

  // 작업 취소
  const cancelTask = useCallback((taskId) => {
    try {
      const success = enhancedTokenManager.cancelTask(taskId)
      updateStatus()
      return success
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [updateStatus])

  // 큐 초기화
  const clearQueue = useCallback(() => {
    try {
      enhancedTokenManager.clearQueue()
      updateStatus()
    } catch (err) {
      setError(err.message)
    }
  }, [updateStatus])

  // 수동 재시도
  const retryNow = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await enhancedTokenManager.retryNow()
      updateStatus()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [updateStatus])

  // 서비스별 상태 조회
  const getServiceStatus = useCallback((serviceId) => {
    return enhancedTokenManager.getServiceStatus(serviceId)
  }, [])

  // 토큰 소진 감지 알림
  const notifyTokenExhausted = useCallback((serviceId, context = {}) => {
    enhancedTokenManager.onTokenExhausted(serviceId, context)
    updateStatus()
  }, [updateStatus])

  return {
    // 상태
    status,
    isLoading,
    error,

    // 작업 관리
    addTask,
    addClaudeTask,
    addGitHubTask,
    addFirebaseTask,
    cancelTask,
    clearQueue,

    // 컨트롤
    retryNow,
    notifyTokenExhausted,

    // 유틸리티
    getServiceStatus,
    updateStatus
  }
}

/**
 * 특정 서비스 모니터링 Hook
 */
export function useServiceStatus(serviceId) {
  const [serviceStatus, setServiceStatus] = useState(null)
  const statusIntervalRef = useRef(null)

  const updateServiceStatus = useCallback(() => {
    const status = enhancedTokenManager.getServiceStatus(serviceId)
    setServiceStatus(status)
  }, [serviceId])

  useEffect(() => {
    updateServiceStatus()

    statusIntervalRef.current = setInterval(updateServiceStatus, 5000)

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
      }
    }
  }, [updateServiceStatus])

  return serviceStatus
}

/**
 * 작업 큐 모니터링 Hook
 */
export function useTaskQueue() {
  const [queue, setQueue] = useState([])
  const [currentTask, setCurrentTask] = useState(null)
  const queueIntervalRef = useRef(null)

  const updateQueue = useCallback(() => {
    const status = enhancedTokenManager.getStatus()
    setQueue(status.taskQueue || [])
    setCurrentTask(status.currentTask)
  }, [])

  useEffect(() => {
    updateQueue()

    queueIntervalRef.current = setInterval(updateQueue, 1000)

    return () => {
      if (queueIntervalRef.current) {
        clearInterval(queueIntervalRef.current)
      }
    }
  }, [updateQueue])

  return {
    queue,
    currentTask,
    queueLength: queue.length
  }
}

/**
 * 토큰 소진 이벤트 리스너 Hook
 */
export function useTokenExhaustedListener(callback) {
  useEffect(() => {
    const handleTokenExhausted = (event) => {
      if (callback) {
        callback(event.detail)
      }
    }

    window.addEventListener('tokenExhausted', handleTokenExhausted)

    return () => {
      window.removeEventListener('tokenExhausted', handleTokenExhausted)
    }
  }, [callback])
}

/**
 * 자동 재시도 Hook
 */
export function useAutoRetry(options = {}) {
  const {
    interval = 30000, // 30초마다 재시도
    maxAttempts = 10,
    enabled = true
  } = options

  const [attempts, setAttempts] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const retryIntervalRef = useRef(null)
  const { retryNow, status } = useTokenManager()

  const startAutoRetry = useCallback(() => {
    if (!enabled || isRetrying) return

    setIsRetrying(true)
    setAttempts(0)

    retryIntervalRef.current = setInterval(async () => {
      setAttempts(prev => {
        const newAttempts = prev + 1

        if (newAttempts >= maxAttempts) {
          setIsRetrying(false)
          if (retryIntervalRef.current) {
            clearInterval(retryIntervalRef.current)
          }
          return newAttempts
        }

        return newAttempts
      })

      try {
        await retryNow()

        // 모든 서비스가 사용 가능하면 중지
        const allAvailable = Object.values(status?.services || {}).every(
          service => service.status === 'available'
        )

        if (allAvailable) {
          setIsRetrying(false)
          if (retryIntervalRef.current) {
            clearInterval(retryIntervalRef.current)
          }
        }
      } catch (error) {
        console.warn('자동 재시도 실패:', error)
      }
    }, interval)
  }, [enabled, isRetrying, maxAttempts, interval, retryNow, status])

  const stopAutoRetry = useCallback(() => {
    setIsRetrying(false)
    setAttempts(0)

    if (retryIntervalRef.current) {
      clearInterval(retryIntervalRef.current)
      retryIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current)
      }
    }
  }, [])

  // 토큰 소진 시 자동 재시도 시작
  useTokenExhaustedListener(() => {
    if (enabled) {
      startAutoRetry()
    }
  })

  return {
    isRetrying,
    attempts,
    startAutoRetry,
    stopAutoRetry
  }
}

export default useTokenManager
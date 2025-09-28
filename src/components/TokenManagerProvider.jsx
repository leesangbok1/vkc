import React, { createContext, useContext, useEffect, useState } from 'react'
import { enhancedTokenManager } from '../utils/enhancedTokenManager.js'
import { indexedDBManager } from '../utils/indexedDBManager.js'
import TokenStatusIndicator from './TokenStatusIndicator.jsx'

// Context for token manager
const TokenManagerContext = createContext(null)

/**
 * Token Manager Provider Component
 * Provides centralized token management for the entire application
 */
export const TokenManagerProvider = ({
  children,
  showIndicator = true,
  indicatorPosition = 'bottom-right',
  autoStart = true,
  config = {}
}) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [worker, setWorker] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let workerInstance = null

    const initializeTokenManager = async () => {
      try {
        console.log('🚀 Token Manager Provider 초기화 중...')

        // IndexedDB 초기화
        await indexedDBManager.init()

        // Enhanced Token Manager에 IndexedDB 연결
        enhancedTokenManager.indexedDB = indexedDBManager

        // Web Worker 초기화 (지원되는 경우)
        if (typeof Worker !== 'undefined') {
          try {
            workerInstance = new Worker(
              new URL('../workers/tokenMonitor.worker.js', import.meta.url),
              { type: 'module' }
            )

            // Worker 메시지 핸들러 설정
            setupWorkerHandlers(workerInstance)

            // Worker 초기화
            workerInstance.postMessage({
              type: 'INIT',
              data: {
                services: Object.fromEntries(enhancedTokenManager.services),
                taskQueue: enhancedTokenManager.taskQueue,
                config: { ...enhancedTokenManager.config, ...config }
              }
            })

            setWorker(workerInstance)
            console.log('👷 Background Worker 초기화됨')

          } catch (workerError) {
            console.warn('⚠️ Worker 초기화 실패, 메인 스레드 모드로 동작:', workerError)
          }
        }

        // 자동 시작 설정
        if (autoStart) {
          enhancedTokenManager.startMonitoring()
          if (workerInstance) {
            workerInstance.postMessage({ type: 'START_MONITORING' })
          }
        }

        setIsInitialized(true)
        console.log('✅ Token Manager Provider 초기화 완료')

      } catch (initError) {
        console.error('❌ Token Manager Provider 초기화 실패:', initError)
        setError(initError.message)
      }
    }

    initializeTokenManager()

    // 클린업
    return () => {
      if (workerInstance) {
        workerInstance.postMessage({ type: 'STOP_MONITORING' })
        workerInstance.terminate()
      }
      enhancedTokenManager.stopMonitoring()
    }
  }, [autoStart, config])

  /**
   * Worker 메시지 핸들러 설정
   */
  const setupWorkerHandlers = (workerInstance) => {
    workerInstance.onmessage = (e) => {
      const { type, data, error: workerError } = e.data

      switch (type) {
        case 'INITIALIZED':
          console.log('👷 Worker 초기화 완료')
          break

        case 'SERVICE_STATUS_UPDATE':
          // 메인 스레드의 서비스 상태 동기화
          Object.entries(data.results).forEach(([serviceId, status]) => {
            const service = enhancedTokenManager.services.get(serviceId)
            if (service) {
              service.status = status.available ? 'available' : 'limited'
              service.lastCheck = Date.now()
              if (status.rateLimitInfo) {
                service.rateLimitInfo = status.rateLimitInfo
              }
              if (status.resetTime) {
                service.resetTime = status.resetTime
              }
            }
          })
          break

        case 'TOKEN_RECOVERY_DETECTED':
          console.log('🔄 Worker에서 토큰 복구 감지:', data.availableServices)
          enhancedTokenManager.processTaskQueue()
          break

        case 'REQUEST_FIREBASE_STATUS':
          // Firebase 상태 확인 요청 처리
          handleFirebaseStatusRequest(workerInstance, data.messageId)
          break

        case 'ERROR':
          console.error('👷 Worker 오류:', workerError)
          break

        default:
          console.log('👷 Worker 메시지:', type, data)
      }
    }

    workerInstance.onerror = (error) => {
      console.error('👷 Worker 오류:', error)
    }
  }

  /**
   * Firebase 상태 확인 요청 처리
   */
  const handleFirebaseStatusRequest = async (workerInstance, messageId) => {
    try {
      const { testFirebaseConnection } = await import('../config/firebase.js')
      const result = await testFirebaseConnection()

      workerInstance.postMessage({
        type: 'FIREBASE_STATUS_RESPONSE',
        messageId,
        result: {
          available: result.success && result.connected,
          rateLimitInfo: {
            mode: result.mode,
            connected: result.connected
          }
        }
      })
    } catch (error) {
      workerInstance.postMessage({
        type: 'FIREBASE_STATUS_RESPONSE',
        messageId,
        result: {
          available: false,
          error: error.message
        }
      })
    }
  }

  // Context 값 준비
  const contextValue = {
    isInitialized,
    worker,
    error,
    tokenManager: enhancedTokenManager,
    indexedDB: indexedDBManager
  }

  if (error) {
    return (
      <div className="token-manager-error">
        <h3>Token Manager 초기화 오류</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          페이지 새로고침
        </button>
      </div>
    )
  }

  return (
    <TokenManagerContext.Provider value={contextValue}>
      {children}
      {showIndicator && isInitialized && (
        <TokenStatusIndicator position={indicatorPosition} />
      )}
    </TokenManagerContext.Provider>
  )
}

/**
 * Hook to use Token Manager Context
 */
export const useTokenManagerContext = () => {
  const context = useContext(TokenManagerContext)
  if (!context) {
    throw new Error('useTokenManagerContext must be used within TokenManagerProvider')
  }
  return context
}

/**
 * HOC for components that need token management
 */
export const withTokenManager = (WrappedComponent) => {
  return function WithTokenManagerComponent(props) {
    const tokenManagerContext = useTokenManagerContext()

    return (
      <WrappedComponent
        {...props}
        tokenManager={tokenManagerContext.tokenManager}
        isTokenManagerReady={tokenManagerContext.isInitialized}
      />
    )
  }
}

/**
 * Hook for automatic error handling with token manager
 */
export const useTokenErrorHandler = () => {
  const { tokenManager } = useTokenManagerContext()

  return {
    handleError: (error, serviceId = 'claude', context = {}) => {
      const errorMessage = error.message || error.toString()
      const isTokenError = [
        'rate limit', 'rate_limit', 'token', 'quota',
        'usage limit', '429', 'too many requests', 'throttle'
      ].some(indicator =>
        errorMessage.toLowerCase().includes(indicator.toLowerCase())
      )

      if (isTokenError) {
        console.log('🚨 Token error detected, notifying token manager')
        tokenManager.onTokenExhausted(serviceId, {
          ...context,
          error: errorMessage,
          timestamp: Date.now()
        })
        return true
      }

      return false
    }
  }
}

export default TokenManagerProvider
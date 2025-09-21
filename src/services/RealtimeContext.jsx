import React, { createContext, useContext, useState, useEffect } from 'react'
import { listenerManager } from '../api/realtime-firebase.js'
import { isFirebaseConnected } from '../config/firebase-config.js'

// 실시간 컨텍스트 생성
const RealtimeContext = createContext()

// 실시간 훅
export const useRealtime = () => {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

// 실시간 제공자 컴포넌트
export const RealtimeProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [activeListeners, setActiveListeners] = useState(0)

  // 연결 상태 모니터링
  useEffect(() => {
    const checkConnection = async () => {
      const connected = isFirebaseConnected()
      setIsConnected(connected)
      setConnectionStatus(connected ? 'connected' : 'disconnected')
    }

    checkConnection()

    // 주기적으로 연결 상태 확인 (30초마다)
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  // 활성 리스너 수 업데이트
  useEffect(() => {
    const updateListenerCount = () => {
      const count = listenerManager.getActiveListenerCount()
      setActiveListeners(count)
    }

    // 1초마다 리스너 수 업데이트
    const interval = setInterval(updateListenerCount, 1000)

    return () => clearInterval(interval)
  }, [])

  // 연결 재시도
  const reconnect = async () => {
    setConnectionStatus('connecting')
    try {
      // 연결 재시도 로직
      const connected = isFirebaseConnected()
      setIsConnected(connected)
      setConnectionStatus(connected ? 'connected' : 'failed')
    } catch (error) {
      setConnectionStatus('failed')
      console.error('실시간 연결 재시도 실패:', error)
    }
  }

  // 모든 리스너 정리
  const clearAllListeners = () => {
    listenerManager.removeAllListeners()
    setActiveListeners(0)
  }

  // 연결 상태에 따른 스타일 클래스
  const getStatusClass = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'status-connected'
      case 'connecting':
        return 'status-connecting'
      case 'failed':
        return 'status-failed'
      default:
        return 'status-disconnected'
    }
  }

  // 컨텍스트 값
  const value = {
    isConnected,
    connectionStatus,
    activeListeners,
    reconnect,
    clearAllListeners,
    getStatusClass,
    listenerManager
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}
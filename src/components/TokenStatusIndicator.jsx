import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { enhancedTokenManager } from '../utils/enhancedTokenManager.js'
import './TokenStatusIndicator.css'

const TokenStatusIndicator = ({ position = 'bottom-right', compact = false }) => {
  const [status, setStatus] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    let statusInterval

    const updateStatus = () => {
      const currentStatus = enhancedTokenManager.getStatus()
      setStatus(currentStatus)

      // 토큰 문제가 있으면 표시
      const hasIssues = Object.values(currentStatus.services).some(
        service => service.status === 'limited' || service.status === 'error'
      )
      setIsVisible(hasIssues || currentStatus.queueLength > 0)
    }

    const handleTokenExhausted = (event) => {
      const { serviceId, serviceName, resetTime, queueLength } = event.detail

      setNotification({
        type: 'exhausted',
        serviceId,
        serviceName,
        resetTime,
        queueLength,
        timestamp: Date.now()
      })

      setTimeout(() => setNotification(null), 10000)
    }

    // 초기 상태 업데이트
    updateStatus()

    // 주기적 상태 업데이트
    statusInterval = setInterval(updateStatus, 5000)

    // 토큰 소진 이벤트 리스너
    window.addEventListener('tokenExhausted', handleTokenExhausted)

    return () => {
      clearInterval(statusInterval)
      window.removeEventListener('tokenExhausted', handleTokenExhausted)
    }
  }, [])

  const getServiceStatusIcon = (service) => {
    switch (service.status) {
      case 'available':
        return '🟢'
      case 'limited':
        return '🟡'
      case 'error':
        return '🔴'
      default:
        return '⚪'
    }
  }

  const getServiceStatusText = (service) => {
    switch (service.status) {
      case 'available':
        return '사용 가능'
      case 'limited':
        return '제한됨'
      case 'error':
        return '오류'
      default:
        return '확인 중'
    }
  }

  const formatResetTime = (resetTime) => {
    if (!resetTime) return '알 수 없음'

    const now = Date.now()
    const diff = resetTime - now

    if (diff <= 0) return '곧 복구'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 후`
    }
    return `${minutes}분 후`
  }

  const handleRetryNow = () => {
    enhancedTokenManager.retryNow()
  }

  const handleClearQueue = () => {
    enhancedTokenManager.clearQueue()
    setNotification(null)
  }

  if (!status || (!isVisible && !notification)) {
    return null
  }

  return (
    <>
      {/* 메인 상태 인디케이터 */}
      {isVisible && (
        <div className={`token-status-indicator ${position} ${compact ? 'compact' : ''}`}>
          <div className="status-header">
            <span className="status-icon">🤖</span>
            <span className="status-title">Token Status</span>
            {status.queueLength > 0 && (
              <span className="queue-badge">{status.queueLength}</span>
            )}
          </div>

          {!compact && (
            <div className="status-content">
              {Object.entries(status.services).map(([serviceId, service]) => (
                <div key={serviceId} className="service-status">
                  <span className="service-icon">{getServiceStatusIcon(service)}</span>
                  <span className="service-name">{service.name}</span>
                  <span className="service-text">{getServiceStatusText(service)}</span>
                  {service.resetTime && service.status === 'limited' && (
                    <span className="reset-time">{formatResetTime(service.resetTime)}</span>
                  )}
                </div>
              ))}

              {status.currentTask && (
                <div className="current-task">
                  <span className="task-icon">⚡</span>
                  <span className="task-text">실행 중: {status.currentTask.type}</span>
                </div>
              )}

              {status.queueLength > 0 && (
                <div className="queue-status">
                  <span className="queue-icon">📋</span>
                  <span className="queue-text">{status.queueLength}개 작업 대기</span>
                </div>
              )}

              <div className="status-actions">
                <button
                  onClick={handleRetryNow}
                  className="action-btn retry"
                  title="수동 재시도"
                >
                  🔄
                </button>
                <button
                  onClick={handleClearQueue}
                  className="action-btn clear"
                  title="큐 초기화"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 토큰 소진 알림 */}
      {notification && notification.type === 'exhausted' && (
        <div className="token-exhausted-notification">
          <div className="notification-content">
            <div className="notification-icon">🚨</div>
            <div className="notification-body">
              <h3>{notification.serviceName} 토큰 소진</h3>
              <p>
                현재 {notification.queueLength}개 작업이 대기 중입니다.
                {notification.resetTime && (
                  <><br />{formatResetTime(notification.resetTime)}에 자동 재개됩니다.</>
                )}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="notification-close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}

TokenStatusIndicator.propTypes = {
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
  compact: PropTypes.bool
}

export default TokenStatusIndicator
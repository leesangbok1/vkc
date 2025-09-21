import React, { useState, useEffect } from 'react'
import { enhancedTokenManager } from '../utils/enhancedTokenManager.js'

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

      <style jsx>{`
        .token-status-indicator {
          position: fixed;
          z-index: 10000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          min-width: 200px;
          max-width: 350px;
        }

        .token-status-indicator.bottom-right {
          bottom: 20px;
          right: 20px;
        }

        .token-status-indicator.bottom-left {
          bottom: 20px;
          left: 20px;
        }

        .token-status-indicator.top-right {
          top: 20px;
          right: 20px;
        }

        .token-status-indicator.top-left {
          top: 20px;
          left: 20px;
        }

        .token-status-indicator.compact {
          min-width: auto;
          padding: 8px 12px;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          font-weight: 600;
          color: #333;
        }

        .compact .status-header {
          padding: 4px 8px;
          border-bottom: none;
          font-size: 12px;
        }

        .status-icon {
          font-size: 16px;
        }

        .status-title {
          flex: 1;
        }

        .queue-badge {
          background: #ff6b6b;
          color: white;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 700;
        }

        .status-content {
          padding: 12px 16px;
        }

        .service-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .service-status:last-of-type {
          margin-bottom: 12px;
        }

        .service-icon {
          font-size: 12px;
        }

        .service-name {
          font-weight: 500;
          min-width: 60px;
        }

        .service-text {
          flex: 1;
          color: #666;
        }

        .reset-time {
          font-size: 11px;
          color: #999;
          font-style: italic;
        }

        .current-task,
        .queue-status {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          font-size: 12px;
          color: #666;
        }

        .task-icon,
        .queue-icon {
          font-size: 10px;
        }

        .status-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .action-btn {
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          padding: 6px 8px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
        }

        .action-btn.retry:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
        }

        .action-btn.clear:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
        }

        .token-exhausted-notification {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10001;
          background: linear-gradient(135deg, #ff6b6b, #ff8787);
          color: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
          animation: slideDown 0.5s ease-out;
          max-width: 500px;
          width: 90%;
        }

        .notification-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 20px;
        }

        .notification-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .notification-body {
          flex: 1;
        }

        .notification-body h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .notification-body p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
          line-height: 1.4;
        }

        .notification-close {
          background: transparent;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .notification-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @media (max-width: 768px) {
          .token-status-indicator {
            max-width: 280px;
            font-size: 13px;
          }

          .token-exhausted-notification {
            margin: 0 10px;
            width: calc(100% - 20px);
          }

          .notification-content {
            padding: 16px;
          }

          .notification-body h3 {
            font-size: 16px;
          }

          .notification-body p {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  )
}

export default TokenStatusIndicator
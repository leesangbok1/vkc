/**
 * 통합 알림 시스템
 * 베트남인 한국 거주자를 위한 Q&A 플랫폼 특화
 */

import logger from './logger.js'
import environment from './environment.js'

class NotificationService {
  constructor() {
    this.isEnabled = environment.FEATURE_FLAGS.enableErrorReporting !== false

    // 알림 채널 설정
    this.channels = {
      browser: { enabled: true, priority: ['urgent', 'high'] },
      mcp: { enabled: false, priority: ['urgent', 'high', 'normal'] },
      firebase: { enabled: false, priority: ['urgent', 'high'] },
      email: { enabled: false, priority: ['urgent'] }
    }

    // 알림 큐
    this.notificationQueue = []
    this.isProcessing = false
    this.maxQueueSize = 100

    // 알림 설정
    this.settings = {
      urgentThreshold: 5 * 60 * 1000,     // 5분 내 긴급 알림
      batchDelay: 2000,                    // 2초 배치 지연
      retryAttempts: 3,                    // 재시도 횟수
      retryDelay: 5000                     // 재시도 지연
    }

    // 통계
    this.stats = {
      sent: 0,
      failed: 0,
      queued: 0,
      channelStats: {},
      priorityStats: {}
    }

    // 우선순위 정의
    this.priorities = {
      urgent: { level: 4, color: '#dc3545', icon: '🚨' },
      high: { level: 3, color: '#fd7e14', icon: '⚠️' },
      normal: { level: 2, color: '#0d6efd', icon: 'ℹ️' },
      low: { level: 1, color: '#6c757d', icon: '💡' }
    }

    logger.info('알림 서비스 초기화', {
      enabled: this.isEnabled,
      channels: Object.keys(this.channels).filter(ch => this.channels[ch].enabled),
      priorities: Object.keys(this.priorities)
    })

    // 자동 처리 시작
    this.startQueueProcessor()
  }

  /**
   * 알림 전송 (메인 메소드)
   */
  async sendNotification(notification) {
    try {
      if (!this.isEnabled) {
        logger.debug('알림 서비스가 비활성화됨', { notification: notification.title })
        return false
      }

      // 알림 검증 및 보강
      const enrichedNotification = this.enrichNotification(notification)

      // 우선순위에 따른 즉시 처리 또는 큐 추가
      if (enrichedNotification.priority === 'urgent') {
        return await this.processNotificationImmediate(enrichedNotification)
      } else {
        return this.queueNotification(enrichedNotification)
      }

    } catch (error) {
      logger.error('알림 전송 실패', {
        error: error.message,
        notification: notification.title
      })
      this.stats.failed++
      return false
    }
  }

  /**
   * 알림 데이터 보강
   */
  enrichNotification(notification) {
    const now = Date.now()

    return {
      id: notification.id || `notif_${now}_${Math.random().toString(36).substr(2, 9)}`,
      title: notification.title || '알림',
      message: notification.message || '',
      priority: notification.priority || 'normal',
      category: notification.category || 'general',
      timestamp: now,
      channels: notification.channels || this.getDefaultChannels(notification.priority),
      metadata: {
        source: notification.source || 'system',
        actionRequired: notification.actionRequired || false,
        expiresAt: notification.expiresAt || (now + 24 * 60 * 60 * 1000), // 24시간
        ...notification.metadata
      },
      data: notification.data || {}
    }
  }

  /**
   * 우선순위별 기본 채널 결정
   */
  getDefaultChannels(priority) {
    const availableChannels = []

    for (const [channel, config] of Object.entries(this.channels)) {
      if (config.enabled && config.priority.includes(priority)) {
        availableChannels.push(channel)
      }
    }

    return availableChannels.length > 0 ? availableChannels : ['browser']
  }

  /**
   * 즉시 알림 처리 (긴급 알림)
   */
  async processNotificationImmediate(notification) {
    logger.info('긴급 알림 즉시 처리', {
      id: notification.id,
      title: notification.title,
      priority: notification.priority
    })

    const results = []

    for (const channel of notification.channels) {
      try {
        const result = await this.sendToChannel(channel, notification)
        results.push({ channel, success: result })

        if (result) {
          this.updateChannelStats(channel, true)
        } else {
          this.updateChannelStats(channel, false)
        }
      } catch (error) {
        logger.error(`${channel} 채널 전송 실패`, {
          notificationId: notification.id,
          error: error.message
        })
        results.push({ channel, success: false, error: error.message })
        this.updateChannelStats(channel, false)
      }
    }

    const success = results.some(r => r.success)
    if (success) {
      this.stats.sent++
      this.updatePriorityStats(notification.priority, true)
    } else {
      this.stats.failed++
      this.updatePriorityStats(notification.priority, false)
    }

    return success
  }

  /**
   * 알림 큐 추가
   */
  queueNotification(notification) {
    if (this.notificationQueue.length >= this.maxQueueSize) {
      // 오래된 낮은 우선순위 알림 제거
      this.notificationQueue = this.notificationQueue
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            return this.priorities[b.priority].level - this.priorities[a.priority].level
          }
          return b.timestamp - a.timestamp
        })
        .slice(0, this.maxQueueSize - 1)

      logger.warn('알림 큐 크기 제한으로 오래된 알림 제거', {
        queueSize: this.notificationQueue.length
      })
    }

    this.notificationQueue.push(notification)
    this.stats.queued++

    logger.debug('알림이 큐에 추가됨', {
      id: notification.id,
      priority: notification.priority,
      queueSize: this.notificationQueue.length
    })

    return true
  }

  /**
   * 큐 처리기 시작
   */
  startQueueProcessor() {
    setInterval(async () => {
      if (this.isProcessing || this.notificationQueue.length === 0) {
        return
      }

      this.isProcessing = true

      try {
        await this.processQueue()
      } catch (error) {
        logger.error('큐 처리 중 오류', { error: error.message })
      } finally {
        this.isProcessing = false
      }
    }, this.settings.batchDelay)
  }

  /**
   * 큐 처리
   */
  async processQueue() {
    if (this.notificationQueue.length === 0) return

    // 우선순위별로 정렬
    this.notificationQueue.sort((a, b) => {
      const priorityDiff = this.priorities[b.priority].level - this.priorities[a.priority].level
      if (priorityDiff !== 0) return priorityDiff
      return a.timestamp - b.timestamp // 같은 우선순위면 오래된 것부터
    })

    // 배치 처리 (최대 5개씩)
    const batch = this.notificationQueue.splice(0, 5)

    logger.debug('알림 배치 처리 시작', {
      batchSize: batch.length,
      remainingQueue: this.notificationQueue.length
    })

    for (const notification of batch) {
      // 만료된 알림 확인
      if (Date.now() > notification.metadata.expiresAt) {
        logger.debug('만료된 알림 건너뛰기', { id: notification.id })
        continue
      }

      await this.processNotificationImmediate(notification)

      // 배치 간 간격
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  /**
   * 채널별 전송
   */
  async sendToChannel(channel, notification) {
    switch (channel) {
      case 'browser':
        return this.sendBrowserNotification(notification)

      case 'mcp':
        return this.sendMCPNotification(notification)

      case 'firebase':
        return this.sendFirebaseNotification(notification)

      case 'email':
        return this.sendEmailNotification(notification)

      default:
        logger.warn('알 수 없는 알림 채널', { channel })
        return false
    }
  }

  /**
   * 브라우저 알림
   */
  async sendBrowserNotification(notification) {
    try {
      // 웹 푸시 알림 지원 확인
      if ('Notification' in window) {
        // 권한 요청
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission()
          if (permission !== 'granted') {
            logger.warn('브라우저 알림 권한이 거부됨')
            return false
          }
        }

        if (Notification.permission === 'granted') {
          const priorityConfig = this.priorities[notification.priority]

          const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            tag: notification.id,
            data: notification.data,
            silent: notification.priority === 'low'
          })

          // 클릭 이벤트 처리
          browserNotification.onclick = () => {
            this.handleNotificationClick(notification)
            browserNotification.close()
          }

          // 자동 닫기 (우선순위에 따라)
          const autoCloseDelay = notification.priority === 'urgent' ? 10000 : 5000
          setTimeout(() => {
            browserNotification.close()
          }, autoCloseDelay)

          logger.debug('브라우저 알림 전송 성공', {
            id: notification.id,
            title: notification.title
          })

          return true
        }
      }

      // 폴백: 콘솔 알림
      const priorityConfig = this.priorities[notification.priority]
      console.log(`${priorityConfig.icon} ${notification.title}: ${notification.message}`)

      return true

    } catch (error) {
      logger.error('브라우저 알림 전송 실패', {
        error: error.message,
        notificationId: notification.id
      })
      return false
    }
  }

  /**
   * MCP 서버 알림 (아이폰 연동)
   */
  async sendMCPNotification(notification) {
    try {
      // MCP 서버가 실행 중인지 확인
      const mcpServerEndpoint = environment.API_CONFIG.mcp?.endpoint
      if (!mcpServerEndpoint) {
        logger.debug('MCP 서버 엔드포인트가 설정되지 않음')
        return false
      }

      // MCP 서버를 통해 아이폰에 알림 전송
      const priorityConfig = this.priorities[notification.priority]
      const message = `${priorityConfig.icon} ${notification.title}\n${notification.message}`

      // 실제 MCP 서버 호출 (구현 예정)
      logger.info('MCP 알림 전송 준비', {
        id: notification.id,
        title: notification.title,
        priority: notification.priority
      })

      // TODO: 실제 MCP 서버 호출 구현
      return true

    } catch (error) {
      logger.error('MCP 알림 전송 실패', {
        error: error.message,
        notificationId: notification.id
      })
      return false
    }
  }

  /**
   * Firebase 알림 (모바일 푸시)
   */
  async sendFirebaseNotification(notification) {
    try {
      if (!environment.API_CONFIG.firebase.enabled) {
        logger.debug('Firebase가 설정되지 않음')
        return false
      }

      // Firebase Cloud Messaging 구현 예정
      logger.info('Firebase 알림 전송 준비', {
        id: notification.id,
        title: notification.title
      })

      // TODO: Firebase FCM 구현
      return true

    } catch (error) {
      logger.error('Firebase 알림 전송 실패', {
        error: error.message,
        notificationId: notification.id
      })
      return false
    }
  }

  /**
   * 이메일 알림
   */
  async sendEmailNotification(notification) {
    try {
      // 이메일 서비스가 설정되어 있는지 확인
      logger.info('이메일 알림 전송 준비', {
        id: notification.id,
        title: notification.title
      })

      // TODO: 이메일 서비스 구현
      return true

    } catch (error) {
      logger.error('이메일 알림 전송 실패', {
        error: error.message,
        notificationId: notification.id
      })
      return false
    }
  }

  /**
   * 알림 클릭 처리
   */
  handleNotificationClick(notification) {
    logger.info('알림 클릭됨', {
      id: notification.id,
      category: notification.category
    })

    // 카테고리별 처리
    switch (notification.category) {
      case 'error':
        // 에러 페이지로 이동
        if (notification.data.errorId) {
          window.location.hash = `#/errors/${notification.data.errorId}`
        }
        break

      case 'question':
        // 질문 페이지로 이동
        if (notification.data.questionId) {
          window.location.hash = `#/questions/${notification.data.questionId}`
        }
        break

      case 'expert':
        // 전문가 매칭 페이지로 이동
        if (notification.data.matchId) {
          window.location.hash = `#/matches/${notification.data.matchId}`
        }
        break

      case 'system':
        // 설정 페이지로 이동
        window.location.hash = '#/settings'
        break

      default:
        // 기본 동작
        if (notification.data.url) {
          window.open(notification.data.url, '_blank')
        }
    }
  }

  /**
   * 미리 정의된 알림 생성 헬퍼 메소드들
   */

  // 오류 알림
  async notifyError(error, context = {}) {
    return this.sendNotification({
      title: '오류 발생',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      priority: 'high',
      category: 'error',
      source: 'error-handler',
      data: {
        errorType: error.name,
        context,
        timestamp: Date.now()
      }
    })
  }

  // 새 질문 알림
  async notifyNewQuestion(question) {
    return this.sendNotification({
      title: '새로운 질문이 등록되었습니다',
      message: `${question.title} - ${question.category}`,
      priority: 'normal',
      category: 'question',
      source: 'question-service',
      data: {
        questionId: question.id,
        category: question.category
      }
    })
  }

  // 전문가 매칭 알림
  async notifyExpertMatch(match) {
    return this.sendNotification({
      title: '전문가가 매칭되었습니다',
      message: `${match.expert.name}님이 귀하의 질문에 답변할 수 있습니다.`,
      priority: 'high',
      category: 'expert',
      source: 'expert-matching',
      data: {
        matchId: match.id,
        expertId: match.expert.id,
        expertName: match.expert.name
      }
    })
  }

  // 토큰 소진 알림
  async notifyTokenExhaustion(service) {
    return this.sendNotification({
      title: 'API 토큰 소진',
      message: `${service} 서비스의 토큰이 소진되었습니다. 자동 재개 시스템이 활성화됩니다.`,
      priority: 'urgent',
      category: 'system',
      source: 'token-manager',
      actionRequired: true,
      data: {
        service,
        timestamp: Date.now()
      }
    })
  }

  // 시스템 상태 알림
  async notifySystemStatus(status, message) {
    return this.sendNotification({
      title: `시스템 상태: ${status}`,
      message,
      priority: status === 'error' ? 'urgent' : 'normal',
      category: 'system',
      source: 'system-monitor',
      data: {
        status,
        timestamp: Date.now()
      }
    })
  }

  /**
   * 통계 업데이트
   */
  updateChannelStats(channel, success) {
    if (!this.stats.channelStats[channel]) {
      this.stats.channelStats[channel] = { sent: 0, failed: 0 }
    }

    if (success) {
      this.stats.channelStats[channel].sent++
    } else {
      this.stats.channelStats[channel].failed++
    }
  }

  updatePriorityStats(priority, success) {
    if (!this.stats.priorityStats[priority]) {
      this.stats.priorityStats[priority] = { sent: 0, failed: 0 }
    }

    if (success) {
      this.stats.priorityStats[priority].sent++
    } else {
      this.stats.priorityStats[priority].failed++
    }
  }

  /**
   * 채널 설정 관리
   */
  enableChannel(channel, priorities = []) {
    if (this.channels[channel]) {
      this.channels[channel].enabled = true
      if (priorities.length > 0) {
        this.channels[channel].priority = priorities
      }
      logger.info(`${channel} 채널 활성화`, { priorities: this.channels[channel].priority })
    }
  }

  disableChannel(channel) {
    if (this.channels[channel]) {
      this.channels[channel].enabled = false
      logger.info(`${channel} 채널 비활성화`)
    }
  }

  /**
   * 통계 조회
   */
  getStats() {
    const totalSent = this.stats.sent
    const totalFailed = this.stats.failed
    const total = totalSent + totalFailed
    const successRate = total > 0 ? (totalSent / total * 100).toFixed(2) + '%' : '0%'

    return {
      total: {
        sent: totalSent,
        failed: totalFailed,
        queued: this.stats.queued,
        successRate
      },
      channels: this.stats.channelStats,
      priorities: this.stats.priorityStats,
      queue: {
        size: this.notificationQueue.length,
        maxSize: this.maxQueueSize,
        isProcessing: this.isProcessing
      },
      settings: this.settings
    }
  }

  /**
   * 서비스 상태 확인
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      channels: this.channels,
      priorities: this.priorities,
      queue: {
        size: this.notificationQueue.length,
        maxSize: this.maxQueueSize,
        isProcessing: this.isProcessing
      },
      stats: this.getStats()
    }
  }

  /**
   * 큐 및 통계 초기화
   */
  reset() {
    this.notificationQueue = []
    this.stats = {
      sent: 0,
      failed: 0,
      queued: 0,
      channelStats: {},
      priorityStats: {}
    }
    logger.info('알림 서비스 초기화 완료')
  }
}

// 싱글톤 인스턴스 생성
const notificationService = new NotificationService()

export default notificationService
export { NotificationService }
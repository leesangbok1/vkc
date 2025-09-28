/**
 * 우선순위 큐 및 자동 전문가 배정 시스템
 * 베트남인 한국 거주자를 위한 Q&A 플랫폼 특화
 */

import logger from './logger.js'
import questionClassificationService from './questionClassificationService.js'
import expertMatchingService from './expertMatchingService.js'
import answerQualityService from './answerQualityService.js'
import notificationService from './notificationService.js'

class PriorityQueueService {
  constructor() {
    // 우선순위 큐들
    this.queues = {
      urgent: [],      // 긴급 (즉시 처리)
      high: [],        // 높음 (1시간 내)
      normal: [],      // 보통 (24시간 내)
      low: []          // 낮음 (72시간 내)
    }

    // 큐 설정
    this.settings = {
      maxQueueSize: 500,
      processingInterval: 30000,        // 30초마다 처리
      urgentProcessingDelay: 0,         // 긴급: 즉시
      highProcessingDelay: 5 * 60 * 1000,    // 높음: 5분
      normalProcessingDelay: 30 * 60 * 1000, // 보통: 30분
      lowProcessingDelay: 60 * 60 * 1000,    // 낮음: 1시간

      // SLA 시간 (밀리초)
      urgentSLA: 30 * 60 * 1000,        // 30분
      highSLA: 2 * 60 * 60 * 1000,      // 2시간
      normalSLA: 24 * 60 * 60 * 1000,   // 24시간
      lowSLA: 72 * 60 * 60 * 1000       // 72시간
    }

    // 자동 배정 설정
    this.autoAssignment = {
      enabled: true,
      maxConcurrentAssignments: 10,
      reassignmentDelay: 60 * 60 * 1000,  // 1시간 후 재배정
      escalationEnabled: true,
      escalationThreshold: 0.5 // SLA 50% 초과 시 에스컬레이션
    }

    // 처리 중인 질문들
    this.processingItems = new Map()
    this.assignedItems = new Map()

    // 통계
    this.stats = {
      totalQueued: 0,
      totalProcessed: 0,
      totalAssigned: 0,
      slaViolations: 0,
      queueStats: {
        urgent: { added: 0, processed: 0 },
        high: { added: 0, processed: 0 },
        normal: { added: 0, processed: 0 },
        low: { added: 0, processed: 0 }
      },
      averageProcessingTime: 0,
      expertWorkload: new Map()
    }

    // 우선순위 계산 가중치
    this.priorityWeights = {
      category: {
        visa: 0.9,      // 비자 관련 높은 우선순위
        medical: 0.85,  // 의료 응급
        legal: 0.8,     // 법률 문제
        work: 0.7,      // 취업 관련
        education: 0.6, // 교육
        life: 0.5,      // 생활
        culture: 0.3,   // 문화
        other: 0.4      // 기타
      },
      urgency: {
        urgent: 1.0,
        high: 0.8,
        normal: 0.5,
        low: 0.2
      },
      timeDecay: 0.1 // 시간이 지날수록 우선순위 증가
    }

    this.isProcessing = false

    logger.info('우선순위 큐 서비스 초기화', {
      queueCount: Object.keys(this.queues).length,
      processingInterval: this.settings.processingInterval,
      autoAssignmentEnabled: this.autoAssignment.enabled
    })

    // 자동 처리 시작
    this.startQueueProcessor()
  }

  /**
   * 질문을 우선순위 큐에 추가
   */
  async addToQueue(questionData) {
    try {
      const startTime = Date.now()

      logger.info('질문을 우선순위 큐에 추가', {
        questionId: questionData.id,
        title: questionData.title?.substring(0, 50)
      })

      // 질문 분류 및 우선순위 계산
      let classification
      try {
        classification = await questionClassificationService.classifyQuestion(
          questionData.title,
          questionData.content
        )
      } catch (error) {
        logger.warn('질문 분류 실패, 기본값 사용', { error: error.message })
        classification = {
          category: 'other',
          urgency: 'normal',
          confidence: 0.1
        }
      }

      // 우선순위 점수 계산
      const priorityScore = this.calculatePriorityScore(questionData, classification)
      const priority = this.determinePriority(priorityScore, classification)

      // 큐 아이템 생성
      const queueItem = {
        id: questionData.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        questionData,
        classification,
        priority,
        priorityScore,
        addedAt: startTime,
        slaDeadline: startTime + this.settings[`${priority}SLA`],
        processAttempts: 0,
        assignmentAttempts: 0,
        status: 'queued',
        assignedExpert: null,
        lastProcessedAt: null
      }

      // 해당 우선순위 큐에 추가
      this.queues[priority].push(queueItem)

      // 큐 크기 제한 확인
      this.enforceQueueLimits()

      // 통계 업데이트
      this.stats.totalQueued++
      this.stats.queueStats[priority].added++

      // 우선순위별 정렬
      this.sortQueue(priority)

      logger.info('질문이 큐에 추가됨', {
        questionId: queueItem.id,
        priority,
        priorityScore: priorityScore.toFixed(3),
        category: classification.category,
        urgency: classification.urgency,
        queueSize: this.queues[priority].length,
        slaDeadline: new Date(queueItem.slaDeadline).toISOString()
      })

      // 긴급 질문은 즉시 처리
      if (priority === 'urgent') {
        setImmediate(() => this.processQueue())
      }

      // 알림 전송
      await notificationService.notifyNewQuestion({
        id: queueItem.id,
        title: questionData.title,
        category: classification.category,
        priority
      })

      return queueItem

    } catch (error) {
      logger.error('큐 추가 실패', {
        error: error.message,
        questionId: questionData.id
      })
      throw error
    }
  }

  /**
   * 우선순위 점수 계산
   */
  calculatePriorityScore(questionData, classification) {
    let score = 0

    // 카테고리 가중치
    const categoryWeight = this.priorityWeights.category[classification.category] || 0.4
    score += categoryWeight * 0.4

    // 긴급도 가중치
    const urgencyWeight = this.priorityWeights.urgency[classification.urgency] || 0.5
    score += urgencyWeight * 0.3

    // 분류 신뢰도
    score += (classification.confidence || 0.5) * 0.1

    // 질문 길이 (더 자세한 질문이 높은 우선순위)
    const contentLength = (questionData.content || '').length
    const lengthScore = Math.min(contentLength / 500, 1) * 0.1
    score += lengthScore

    // 키워드 기반 긴급도 체크
    const urgentKeywords = ['응급', '급함', '긴급', '도움', '빨리', '즉시', '위급', '사고']
    const hasUrgentKeywords = urgentKeywords.some(keyword =>
      (questionData.title + ' ' + questionData.content).toLowerCase().includes(keyword)
    )
    if (hasUrgentKeywords) {
      score += 0.1
    }

    return Math.min(score, 1) // 최대 1.0으로 제한
  }

  /**
   * 우선순위 결정
   */
  determinePriority(priorityScore, classification) {
    // 분류된 긴급도가 우선
    if (classification.urgency === 'urgent') return 'urgent'

    // 점수 기반 우선순위
    if (priorityScore >= 0.8) return 'urgent'
    if (priorityScore >= 0.6) return 'high'
    if (priorityScore >= 0.4) return 'normal'
    return 'low'
  }

  /**
   * 큐 크기 제한 적용
   */
  enforceQueueLimits() {
    for (const [priority, queue] of Object.entries(this.queues)) {
      if (queue.length > this.settings.maxQueueSize) {
        // 오래된 낮은 우선순위 항목 제거
        const removed = queue.splice(this.settings.maxQueueSize)
        logger.warn(`${priority} 큐 크기 제한으로 ${removed.length}개 항목 제거`)
      }
    }
  }

  /**
   * 큐 정렬 (우선순위 점수와 시간 기반)
   */
  sortQueue(priority) {
    this.queues[priority].sort((a, b) => {
      // 시간 가중치 (오래될수록 우선순위 증가)
      const timeWeight = this.priorityWeights.timeDecay
      const currentTime = Date.now()

      const aTimeBonus = (currentTime - a.addedAt) / (60 * 60 * 1000) * timeWeight
      const bTimeBonus = (currentTime - b.addedAt) / (60 * 60 * 1000) * timeWeight

      const aFinalScore = a.priorityScore + aTimeBonus
      const bFinalScore = b.priorityScore + bTimeBonus

      // 높은 점수 우선, 같으면 오래된 것 우선
      if (Math.abs(aFinalScore - bFinalScore) < 0.01) {
        return a.addedAt - b.addedAt
      }
      return bFinalScore - aFinalScore
    })
  }

  /**
   * 큐 처리기 시작
   */
  startQueueProcessor() {
    // 주기적 처리
    setInterval(async () => {
      if (!this.isProcessing) {
        await this.processQueue()
      }
    }, this.settings.processingInterval)

    // SLA 모니터링
    setInterval(() => {
      this.monitorSLA()
    }, 60 * 1000) // 1분마다

    // 전문가 워크로드 재조정
    setInterval(() => {
      this.rebalanceExpertWorkload()
    }, 5 * 60 * 1000) // 5분마다
  }

  /**
   * 큐 처리 (메인 처리 로직)
   */
  async processQueue() {
    if (this.isProcessing) return

    this.isProcessing = true

    try {
      const currentTime = Date.now()
      let processedCount = 0

      // 우선순위 순서로 처리
      for (const priority of ['urgent', 'high', 'normal', 'low']) {
        const queue = this.queues[priority]
        const processingDelay = this.settings[`${priority}ProcessingDelay`]

        // 처리 가능한 항목들 찾기
        const readyItems = queue.filter(item =>
          item.status === 'queued' &&
          (currentTime - item.addedAt) >= processingDelay
        )

        if (readyItems.length === 0) continue

        // 큐 정렬 업데이트
        this.sortQueue(priority)

        // 처리 (배치 크기 제한)
        const batchSize = priority === 'urgent' ? 5 : 3
        const batch = readyItems.slice(0, batchSize)

        for (const item of batch) {
          try {
            await this.processQueueItem(item)
            processedCount++

            // 배치 간 간격
            if (priority !== 'urgent') {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          } catch (error) {
            logger.error('큐 항목 처리 실패', {
              itemId: item.id,
              error: error.message
            })
          }
        }

        // 긴급 우선순위면 다른 큐는 나중에 처리
        if (priority === 'urgent' && processedCount > 0) {
          break
        }
      }

      if (processedCount > 0) {
        logger.info('큐 처리 완료', {
          processedCount,
          queueSizes: Object.entries(this.queues).map(([p, q]) => `${p}: ${q.length}`).join(', ')
        })
      }

    } catch (error) {
      logger.error('큐 처리 중 오류', { error: error.message })
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 개별 큐 항목 처리
   */
  async processQueueItem(item) {
    const startTime = Date.now()

    logger.info('큐 항목 처리 시작', {
      itemId: item.id,
      priority: item.priority,
      attempts: item.processAttempts + 1
    })

    try {
      item.status = 'processing'
      item.processAttempts++
      item.lastProcessedAt = startTime
      this.processingItems.set(item.id, item)

      // 전문가 매칭 수행
      if (this.autoAssignment.enabled) {
        await this.performAutoAssignment(item)
      }

      // 처리 완료
      item.status = 'processed'
      this.stats.totalProcessed++
      this.stats.queueStats[item.priority].processed++

      // 큐에서 제거
      const queue = this.queues[item.priority]
      const index = queue.findIndex(q => q.id === item.id)
      if (index !== -1) {
        queue.splice(index, 1)
      }

      // 처리 시간 통계 업데이트
      const processingTime = Date.now() - startTime
      this.updateAverageProcessingTime(processingTime)

      logger.info('큐 항목 처리 완료', {
        itemId: item.id,
        processingTime,
        finalStatus: item.status
      })

    } catch (error) {
      item.status = 'error'
      logger.error('큐 항목 처리 중 오류', {
        itemId: item.id,
        error: error.message,
        attempts: item.processAttempts
      })

      // 재시도 로직
      if (item.processAttempts < 3) {
        item.status = 'queued'
        logger.info('큐 항목 재시도 예약', {
          itemId: item.id,
          nextAttempt: item.processAttempts + 1
        })
      }
    } finally {
      this.processingItems.delete(item.id)
    }
  }

  /**
   * 자동 전문가 배정
   */
  async performAutoAssignment(item) {
    try {
      // 현재 처리 중인 배정 수 확인
      if (this.assignedItems.size >= this.autoAssignment.maxConcurrentAssignments) {
        logger.debug('동시 배정 한도 초과', {
          current: this.assignedItems.size,
          max: this.autoAssignment.maxConcurrentAssignments
        })
        return
      }

      // 전문가 매칭
      const matchResult = await expertMatchingService.matchExperts(
        item.questionData.title + ' ' + item.questionData.content,
        item.classification.category,
        { maxResults: 3 }
      )

      if (!matchResult.matches || matchResult.matches.length === 0) {
        logger.warn('매칭된 전문가가 없음', {
          itemId: item.id,
          category: item.classification.category
        })
        return
      }

      // 최적 전문가 선택 (워크로드 고려)
      const bestExpert = this.selectBestExpert(matchResult.matches)

      if (bestExpert) {
        // 전문가 배정
        item.assignedExpert = bestExpert.expert
        item.status = 'assigned'
        this.assignedItems.set(item.id, item)

        // 전문가 워크로드 업데이트
        this.updateExpertWorkload(bestExpert.expert.id, 1)

        // 통계 업데이트
        this.stats.totalAssigned++

        // 알림 전송
        await notificationService.notifyExpertMatch({
          id: item.id,
          expert: bestExpert.expert,
          matchScore: bestExpert.matchScore
        })

        logger.info('전문가 배정 완료', {
          itemId: item.id,
          expertId: bestExpert.expert.id,
          expertName: bestExpert.expert.name,
          matchScore: bestExpert.matchScore
        })

        // 재배정 타이머 설정
        setTimeout(() => {
          this.checkReassignment(item.id)
        }, this.autoAssignment.reassignmentDelay)
      }

    } catch (error) {
      logger.error('자동 배정 실패', {
        itemId: item.id,
        error: error.message
      })
    }
  }

  /**
   * 최적 전문가 선택 (워크로드 고려)
   */
  selectBestExpert(matches) {
    return matches
      .map(match => ({
        ...match,
        workload: this.getExpertWorkload(match.expert.id),
        adjustedScore: this.calculateAdjustedMatchScore(match)
      }))
      .sort((a, b) => b.adjustedScore - a.adjustedScore)[0]
  }

  /**
   * 워크로드를 고려한 매칭 점수 조정
   */
  calculateAdjustedMatchScore(match) {
    const baseScore = match.matchScore
    const workload = this.getExpertWorkload(match.expert.id)

    // 워크로드가 높을수록 점수 감소
    const workloadPenalty = Math.min(workload * 0.1, 0.3) // 최대 30% 감소

    return Math.max(baseScore - workloadPenalty, 0.1)
  }

  /**
   * 전문가 워크로드 조회
   */
  getExpertWorkload(expertId) {
    return this.stats.expertWorkload.get(expertId) || 0
  }

  /**
   * 전문가 워크로드 업데이트
   */
  updateExpertWorkload(expertId, delta) {
    const current = this.getExpertWorkload(expertId)
    const updated = Math.max(current + delta, 0)
    this.stats.expertWorkload.set(expertId, updated)
  }

  /**
   * 재배정 확인
   */
  checkReassignment(itemId) {
    const item = this.assignedItems.get(itemId)
    if (!item) return

    // 답변이 완료되었는지 확인 (실제 구현에서는 답변 상태 체크)
    const isAnswered = false // TODO: 실제 답변 상태 확인

    if (!isAnswered) {
      logger.info('재배정 시도', { itemId })

      // 전문가 워크로드 감소
      if (item.assignedExpert) {
        this.updateExpertWorkload(item.assignedExpert.id, -1)
      }

      // 재배정
      item.assignmentAttempts++
      item.assignedExpert = null
      item.status = 'queued'

      // 우선순위 상승
      if (item.priority === 'low') item.priority = 'normal'
      else if (item.priority === 'normal') item.priority = 'high'

      // 다시 큐에 추가
      this.queues[item.priority].push(item)
      this.assignedItems.delete(itemId)

      logger.info('재배정 완료', {
        itemId,
        newPriority: item.priority,
        attempts: item.assignmentAttempts
      })
    }
  }

  /**
   * SLA 모니터링
   */
  monitorSLA() {
    const currentTime = Date.now()
    let violations = 0

    for (const [priority, queue] of Object.entries(this.queues)) {
      for (const item of queue) {
        if (currentTime > item.slaDeadline) {
          violations++

          // 에스컬레이션
          if (this.autoAssignment.escalationEnabled) {
            this.escalateItem(item)
          }
        } else if (currentTime > item.slaDeadline * this.autoAssignment.escalationThreshold) {
          // SLA 임계점 근접 시 알림
          notificationService.notifySystemStatus('warning',
            `질문 ${item.id}의 SLA 임계점 접근 (${priority} 우선순위)`
          )
        }
      }
    }

    if (violations > 0) {
      this.stats.slaViolations += violations
      logger.warn('SLA 위반 감지', { violations })
    }
  }

  /**
   * 항목 에스컬레이션
   */
  escalateItem(item) {
    const oldPriority = item.priority

    // 우선순위 상승
    if (item.priority === 'low') item.priority = 'normal'
    else if (item.priority === 'normal') item.priority = 'high'
    else if (item.priority === 'high') item.priority = 'urgent'

    // 큐 이동
    if (oldPriority !== item.priority) {
      const oldQueue = this.queues[oldPriority]
      const newQueue = this.queues[item.priority]

      const index = oldQueue.findIndex(q => q.id === item.id)
      if (index !== -1) {
        oldQueue.splice(index, 1)
        newQueue.push(item)
        this.sortQueue(item.priority)
      }

      logger.info('항목 에스컬레이션', {
        itemId: item.id,
        oldPriority,
        newPriority: item.priority
      })

      // 긴급 알림
      notificationService.notifySystemStatus('urgent',
        `질문 ${item.id}가 SLA 위반으로 ${item.priority} 우선순위로 에스컬레이션됨`
      )
    }
  }

  /**
   * 전문가 워크로드 재조정
   */
  rebalanceExpertWorkload() {
    // 워크로드가 높은 전문가들의 부하 조정
    for (const [expertId, workload] of this.stats.expertWorkload) {
      if (workload > 10) { // 임계값
        logger.info('높은 워크로드 감지', { expertId, workload })

        // 해당 전문가에게 배정된 낮은 우선순위 항목들 재배정 고려
        for (const item of this.assignedItems.values()) {
          if (item.assignedExpert?.id === expertId && item.priority === 'low') {
            this.checkReassignment(item.id)
            break // 한 번에 하나씩
          }
        }
      }
    }
  }

  /**
   * 평균 처리 시간 업데이트
   */
  updateAverageProcessingTime(newTime) {
    const total = this.stats.totalProcessed
    const current = this.stats.averageProcessingTime
    this.stats.averageProcessingTime = (current * (total - 1) + newTime) / total
  }

  /**
   * 큐 상태 조회
   */
  getQueueStatus() {
    const queueSizes = {}
    const queueOldest = {}

    for (const [priority, queue] of Object.entries(this.queues)) {
      queueSizes[priority] = queue.length
      queueOldest[priority] = queue.length > 0
        ? Math.max(...queue.map(item => Date.now() - item.addedAt))
        : 0
    }

    return {
      sizes: queueSizes,
      oldest: queueOldest,
      processing: this.processingItems.size,
      assigned: this.assignedItems.size,
      totalQueued: Object.values(queueSizes).reduce((sum, size) => sum + size, 0)
    }
  }

  /**
   * 통계 조회
   */
  getStats() {
    return {
      ...this.stats,
      queues: this.getQueueStatus(),
      settings: this.settings,
      autoAssignment: this.autoAssignment,
      expertWorkload: Object.fromEntries(this.stats.expertWorkload)
    }
  }

  /**
   * 설정 업데이트
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }
    logger.info('우선순위 큐 설정 업데이트', { newSettings })
  }

  /**
   * 자동 배정 설정 업데이트
   */
  updateAutoAssignmentSettings(newSettings) {
    this.autoAssignment = { ...this.autoAssignment, ...newSettings }
    logger.info('자동 배정 설정 업데이트', { newSettings })
  }

  /**
   * 큐 및 통계 초기화
   */
  reset() {
    for (const priority in this.queues) {
      this.queues[priority] = []
    }

    this.processingItems.clear()
    this.assignedItems.clear()

    this.stats = {
      totalQueued: 0,
      totalProcessed: 0,
      totalAssigned: 0,
      slaViolations: 0,
      queueStats: {
        urgent: { added: 0, processed: 0 },
        high: { added: 0, processed: 0 },
        normal: { added: 0, processed: 0 },
        low: { added: 0, processed: 0 }
      },
      averageProcessingTime: 0,
      expertWorkload: new Map()
    }

    logger.info('우선순위 큐 서비스 초기화 완료')
  }
}

// 싱글톤 인스턴스 생성
const priorityQueueService = new PriorityQueueService()

export default priorityQueueService
export { PriorityQueueService }
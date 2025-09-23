/**
 * AI 서비스 통합 및 테스트 모듈
 * 모든 AI 서비스를 연결하고 통합 테스트 제공
 */

import logger from './logger.js'
import environment from './environment.js'
import questionClassificationService from './questionClassificationService.js'
import imageProcessingService from './imageProcessingService.js'
import answerQualityService from './answerQualityService.js'
import expertMatchingService from './expertMatchingService.js'

class AIServiceIntegration {
  constructor() {
    this.services = {
      classification: questionClassificationService,
      imageProcessing: imageProcessingService,
      answerQuality: answerQualityService,
      expertMatching: expertMatchingService
    }

    this.isInitialized = false
    this.serviceStatus = {}

    // 통합 통계
    this.integrationStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      serviceUsage: {}
    }

    logger.info('AI 서비스 통합 모듈 초기화')
  }

  /**
   * 모든 서비스 상태 확인 및 초기화
   */
  async initialize() {
    const startTime = Date.now()

    try {
      logger.info('AI 서비스 통합 초기화 시작')

      // 각 서비스 상태 확인
      for (const [serviceName, service] of Object.entries(this.services)) {
        try {
          const status = service.getStatus()
          this.serviceStatus[serviceName] = {
            enabled: status.enabled !== false,
            hasApiKey: status.hasApiKey !== false,
            lastChecked: new Date().toISOString(),
            error: null
          }

          logger.info(`${serviceName} 서비스 상태`, {
            enabled: this.serviceStatus[serviceName].enabled,
            hasApiKey: this.serviceStatus[serviceName].hasApiKey
          })
        } catch (error) {
          this.serviceStatus[serviceName] = {
            enabled: false,
            hasApiKey: false,
            lastChecked: new Date().toISOString(),
            error: error.message
          }

          logger.warn(`${serviceName} 서비스 초기화 실패`, { error: error.message })
        }
      }

      this.isInitialized = true

      const initTime = Date.now() - startTime
      logger.info('AI 서비스 통합 초기화 완료', {
        initTime,
        enabledServices: Object.values(this.serviceStatus).filter(s => s.enabled).length,
        totalServices: Object.keys(this.serviceStatus).length
      })

      return {
        success: true,
        initTime,
        serviceStatus: this.serviceStatus
      }

    } catch (error) {
      logger.error('AI 서비스 통합 초기화 실패', { error: error.message })
      throw error
    }
  }

  /**
   * 질문 처리 파이프라인 (전체 워크플로우)
   */
  async processQuestion(questionData) {
    const startTime = Date.now()
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    this.integrationStats.totalRequests++

    try {
      logger.info('질문 처리 파이프라인 시작', {
        requestId,
        hasTitle: !!questionData.title,
        hasContent: !!questionData.content,
        hasImage: !!questionData.image
      })

      const result = {
        requestId,
        questionData: {
          title: questionData.title,
          content: questionData.content
        },
        steps: {},
        processingTime: 0,
        success: false
      }

      // 1단계: 이미지 처리 (있는 경우)
      if (questionData.image) {
        try {
          logger.info('1단계: 이미지 처리 시작', { requestId })
          const imageAnalysis = await this.services.imageProcessing.analyzeImage(
            questionData.image,
            "이 이미지의 내용을 설명하고, 베트남인 한국 거주자에게 도움이 될 수 있는 정보를 추출해주세요."
          )

          result.steps.imageProcessing = {
            success: true,
            content: imageAnalysis.content,
            processingTime: imageAnalysis.processingTime,
            cached: imageAnalysis.cached
          }

          // 이미지에서 추출한 내용을 질문에 추가
          result.questionData.content += `\n\n[이미지 분석 결과]\n${imageAnalysis.content}`

          logger.info('이미지 처리 완료', {
            requestId,
            processingTime: imageAnalysis.processingTime,
            cached: imageAnalysis.cached
          })

          this.updateServiceUsage('imageProcessing')
        } catch (imageError) {
          logger.warn('이미지 처리 실패', { requestId, error: imageError.message })
          result.steps.imageProcessing = {
            success: false,
            error: imageError.message
          }
        }
      }

      // 2단계: 질문 분류
      try {
        logger.info('2단계: 질문 분류 시작', { requestId })
        const classification = await this.services.classification.classifyQuestion(
          questionData.title,
          result.questionData.content
        )

        result.steps.classification = {
          success: true,
          category: classification.category,
          categoryName: classification.categoryName,
          confidence: classification.confidence,
          urgency: classification.urgency,
          tags: classification.tags,
          processingTime: classification.processingTime,
          cached: classification.cached
        }

        logger.info('질문 분류 완료', {
          requestId,
          category: classification.category,
          confidence: classification.confidence
        })

        this.updateServiceUsage('classification')
      } catch (classificationError) {
        logger.error('질문 분류 실패', { requestId, error: classificationError.message })
        result.steps.classification = {
          success: false,
          error: classificationError.message,
          category: 'other' // 폴백
        }
      }

      // 3단계: 전문가 매칭
      try {
        logger.info('3단계: 전문가 매칭 시작', { requestId })
        const category = result.steps.classification?.category || 'other'
        const expertMatching = await this.services.expertMatching.matchExperts(
          questionData.title + ' ' + result.questionData.content,
          category,
          { maxResults: 3 }
        )

        result.steps.expertMatching = {
          success: true,
          matches: expertMatching.matches,
          totalCandidates: expertMatching.totalCandidates,
          processingTime: expertMatching.processingTime,
          cached: expertMatching.cached
        }

        logger.info('전문가 매칭 완료', {
          requestId,
          matchCount: expertMatching.matches.length,
          topScore: expertMatching.matches[0]?.matchScore || 0
        })

        this.updateServiceUsage('expertMatching')
      } catch (expertError) {
        logger.warn('전문가 매칭 실패', { requestId, error: expertError.message })
        result.steps.expertMatching = {
          success: false,
          error: expertError.message,
          matches: []
        }
      }

      // 4단계: 답변 품질 평가 (샘플 답변이 있는 경우)
      if (questionData.sampleAnswer) {
        try {
          logger.info('4단계: 답변 품질 평가 시작', { requestId })
          const category = result.steps.classification?.category || 'other'
          const qualityEvaluation = await this.services.answerQuality.evaluateAnswer(
            questionData.title + ' ' + questionData.content,
            questionData.sampleAnswer,
            category
          )

          result.steps.answerQuality = {
            success: true,
            overallScore: qualityEvaluation.overallScore,
            grade: qualityEvaluation.grade,
            metrics: qualityEvaluation.metrics,
            feedback: qualityEvaluation.feedback,
            flags: qualityEvaluation.flags,
            processingTime: qualityEvaluation.processingTime,
            cached: qualityEvaluation.cached
          }

          logger.info('답변 품질 평가 완료', {
            requestId,
            score: qualityEvaluation.overallScore,
            grade: qualityEvaluation.grade
          })

          this.updateServiceUsage('answerQuality')
        } catch (qualityError) {
          logger.warn('답변 품질 평가 실패', { requestId, error: qualityError.message })
          result.steps.answerQuality = {
            success: false,
            error: qualityError.message
          }
        }
      }

      // 결과 정리
      const processingTime = Date.now() - startTime
      result.processingTime = processingTime
      result.success = true

      this.integrationStats.successfulRequests++
      this.updateAverageResponseTime(processingTime)

      logger.info('질문 처리 파이프라인 완료', {
        requestId,
        processingTime,
        successfulSteps: Object.values(result.steps).filter(s => s.success).length,
        totalSteps: Object.keys(result.steps).length
      })

      return result

    } catch (error) {
      this.integrationStats.failedRequests++
      const processingTime = Date.now() - startTime

      logger.error('질문 처리 파이프라인 실패', {
        requestId,
        error: error.message,
        processingTime
      })

      return {
        requestId,
        success: false,
        error: error.message,
        processingTime,
        steps: {}
      }
    }
  }

  /**
   * 서비스 사용량 업데이트
   */
  updateServiceUsage(serviceName) {
    if (!this.integrationStats.serviceUsage[serviceName]) {
      this.integrationStats.serviceUsage[serviceName] = 0
    }
    this.integrationStats.serviceUsage[serviceName]++
  }

  /**
   * 평균 응답 시간 업데이트
   */
  updateAverageResponseTime(newTime) {
    const successfulRequests = this.integrationStats.successfulRequests
    const currentAvg = this.integrationStats.averageResponseTime
    this.integrationStats.averageResponseTime =
      (currentAvg * (successfulRequests - 1) + newTime) / successfulRequests
  }

  /**
   * 통합 테스트 실행
   */
  async runIntegrationTests() {
    logger.info('통합 테스트 시작')

    const testCases = [
      {
        name: 'Visa Question Test',
        data: {
          title: 'F-2-7 비자 연장 방법',
          content: '안녕하세요. 현재 F-2-7 비자를 가지고 있는데 연장 방법을 알고 싶습니다. 어떤 서류가 필요한가요?'
        }
      },
      {
        name: 'Medical Question Test',
        data: {
          title: '응급실 이용 방법',
          content: '밤에 갑자기 아파서 응급실에 가야 하는데, 건강보험 없이도 이용할 수 있나요?'
        }
      },
      {
        name: 'Life Question Test',
        data: {
          title: '은행 계좌 개설',
          content: '한국에서 은행 계좌를 만들려고 하는데 어떤 서류가 필요하고 어느 은행이 좋을까요?'
        }
      }
    ]

    const results = []

    for (const testCase of testCases) {
      try {
        logger.info(`테스트 실행: ${testCase.name}`)
        const result = await this.processQuestion(testCase.data)
        results.push({
          testName: testCase.name,
          success: result.success,
          processingTime: result.processingTime,
          steps: Object.keys(result.steps).map(step => ({
            step,
            success: result.steps[step].success
          }))
        })
      } catch (error) {
        logger.error(`테스트 실패: ${testCase.name}`, { error: error.message })
        results.push({
          testName: testCase.name,
          success: false,
          error: error.message
        })
      }
    }

    const successfulTests = results.filter(r => r.success).length
    const successRate = (successfulTests / results.length * 100).toFixed(2)

    logger.info('통합 테스트 완료', {
      totalTests: results.length,
      successfulTests,
      successRate: `${successRate}%`,
      averageTime: results
        .filter(r => r.processingTime)
        .reduce((sum, r) => sum + r.processingTime, 0) / successfulTests || 0
    })

    return {
      summary: {
        totalTests: results.length,
        successfulTests,
        successRate: `${successRate}%`
      },
      results
    }
  }

  /**
   * 개별 서비스 테스트
   */
  async testService(serviceName, testData = {}) {
    if (!this.services[serviceName]) {
      throw new Error(`서비스를 찾을 수 없습니다: ${serviceName}`)
    }

    const service = this.services[serviceName]
    const startTime = Date.now()

    try {
      let result
      switch (serviceName) {
        case 'classification':
          result = await service.classifyQuestion(
            testData.title || '테스트 질문',
            testData.content || '테스트 내용입니다.'
          )
          break
        case 'expertMatching':
          result = await service.matchExperts(
            testData.question || '테스트 질문입니다.',
            testData.category || 'other'
          )
          break
        case 'answerQuality':
          result = await service.evaluateAnswer(
            testData.question || '테스트 질문입니다.',
            testData.answer || '테스트 답변입니다.',
            testData.category || 'other'
          )
          break
        case 'imageProcessing':
          if (!testData.image) {
            throw new Error('이미지 처리 테스트에는 이미지가 필요합니다.')
          }
          result = await service.analyzeImage(testData.image)
          break
        default:
          throw new Error(`지원되지 않는 서비스입니다: ${serviceName}`)
      }

      const processingTime = Date.now() - startTime

      logger.info(`${serviceName} 서비스 테스트 성공`, { processingTime })

      return {
        success: true,
        serviceName,
        result,
        processingTime
      }

    } catch (error) {
      const processingTime = Date.now() - startTime

      logger.error(`${serviceName} 서비스 테스트 실패`, {
        error: error.message,
        processingTime
      })

      return {
        success: false,
        serviceName,
        error: error.message,
        processingTime
      }
    }
  }

  /**
   * 통합 상태 정보
   */
  getIntegrationStatus() {
    return {
      initialized: this.isInitialized,
      serviceStatus: this.serviceStatus,
      stats: this.integrationStats,
      environment: {
        isDevelopment: environment.isDevelopment,
        isProduction: environment.isProduction,
        debugMode: environment.isDebugMode
      },
      lastChecked: new Date().toISOString()
    }
  }

  /**
   * 모든 서비스 통계 조회
   */
  getAllServiceStats() {
    const serviceStats = {}

    for (const [serviceName, service] of Object.entries(this.services)) {
      try {
        serviceStats[serviceName] = service.getStats()
      } catch (error) {
        serviceStats[serviceName] = { error: error.message }
      }
    }

    return serviceStats
  }

  /**
   * 캐시 관리
   */
  clearAllCaches() {
    for (const [serviceName, service] of Object.entries(this.services)) {
      try {
        if (typeof service.clearCache === 'function') {
          service.clearCache()
          logger.info(`${serviceName} 캐시 지우기 완료`)
        }
      } catch (error) {
        logger.warn(`${serviceName} 캐시 지우기 실패`, { error: error.message })
      }
    }
  }

  /**
   * 통계 초기화
   */
  resetAllStats() {
    // 통합 통계 초기화
    this.integrationStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      serviceUsage: {}
    }

    // 각 서비스 통계 초기화
    for (const [serviceName, service] of Object.entries(this.services)) {
      try {
        if (typeof service.resetStats === 'function') {
          service.resetStats()
          logger.info(`${serviceName} 통계 초기화 완료`)
        }
      } catch (error) {
        logger.warn(`${serviceName} 통계 초기화 실패`, { error: error.message })
      }
    }

    logger.info('모든 서비스 통계 초기화 완료')
  }
}

// 싱글톤 인스턴스 생성
const aiServiceIntegration = new AIServiceIntegration()

export default aiServiceIntegration
export { AIServiceIntegration }
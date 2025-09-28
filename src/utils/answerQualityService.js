/**
 * AI 기반 답변 품질 평가 서비스
 * 베트남인 한국 거주자를 위한 Q&A 플랫폼 특화
 */

import logger from './logger.js'
import environment from './environment.js'

class AnswerQualityService {
  constructor() {
    this.apiKey = environment.API_CONFIG.openai.apiKey
    this.apiUrl = environment.API_CONFIG.openai.baseUrl
    this.model = environment.API_CONFIG.openai.model
    this.isEnabled = !!this.apiKey

    // 품질 평가 기준
    this.qualityMetrics = {
      accuracy: { weight: 0.3, description: '정확성' },
      completeness: { weight: 0.25, description: '완전성' },
      relevance: { weight: 0.2, description: '연관성' },
      clarity: { weight: 0.15, description: '명확성' },
      helpfulness: { weight: 0.1, description: '유용성' }
    }

    // 카테고리별 특화 기준
    this.categorySpecificCriteria = {
      visa: {
        focus: ['정확한 법령 정보', '최신 규정 반영', '구체적 절차 안내'],
        penalties: ['잘못된 법령 인용', '오래된 정보', '막연한 답변']
      },
      legal: {
        focus: ['법적 근거 제시', '구체적 절차', '주의사항 명시'],
        penalties: ['법적 조언 과도', '불확실한 정보', '개인적 의견']
      },
      medical: {
        focus: ['의료 기관 안내', '보험 정보', '응급 상황 대처'],
        penalties: ['의학적 진단', '약물 추천', '치료법 제시']
      },
      work: {
        focus: ['근로기준법 준수', '실무적 조언', '권리 보호'],
        penalties: ['불법적 조언', '차별적 내용', '안전 무시']
      },
      life: {
        focus: ['실용적 정보', '비용 정보', '이용 방법'],
        penalties: ['개인적 취향', '광고성 내용', '부정확한 정보']
      },
      education: {
        focus: ['교육 기관 정보', '지원 방법', '요구사항'],
        penalties: ['과장된 광고', '불확실한 정보', '편향된 추천']
      },
      culture: {
        focus: ['문화적 맥락', '예절 설명', '참여 방법'],
        penalties: ['문화적 편견', '과도한 일반화', '부정적 고정관념']
      }
    }

    // 캐싱 시스템
    this.cache = new Map()
    this.cacheTimeout = 20 * 60 * 1000 // 20분
    this.maxCacheSize = 100

    // 통계
    this.stats = {
      evaluations: 0,
      cacheHits: 0,
      errors: 0,
      averageScore: 0,
      categoryStats: {}
    }

    logger.info('답변 품질 평가 서비스 초기화', {
      enabled: this.isEnabled,
      model: this.model,
      metrics: Object.keys(this.qualityMetrics)
    })
  }

  /**
   * 답변 품질 평가 (메인 메소드)
   */
  async evaluateAnswer(question, answer, category = 'other', options = {}) {
    const startTime = Date.now()
    this.stats.evaluations++

    try {
      if (!question || !answer) {
        throw new Error('질문과 답변이 모두 필요합니다.')
      }

      // 캐시 확인
      const cacheKey = this.generateCacheKey(question, answer, category)
      const cached = this.cache.get(cacheKey)

      if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
        this.stats.cacheHits++
        logger.debug('캐시에서 품질 평가 결과 반환', { cacheKey })
        return { ...cached.result, cached: true }
      }

      logger.info('답변 품질 평가 시작', {
        questionLength: question.length,
        answerLength: answer.length,
        category
      })

      let evaluationResult

      // AI 기반 평가 (우선순위)
      if (this.isEnabled && !options.useBasicOnly) {
        try {
          evaluationResult = await this.evaluateWithAI(question, answer, category)
        } catch (aiError) {
          logger.warn('AI 품질 평가 실패, 기본 평가로 대체', { error: aiError.message })
          evaluationResult = this.getBasicEvaluation(question, answer, category)
        }
      } else {
        // 기본 평가
        evaluationResult = this.getBasicEvaluation(question, answer, category)
      }

      // 결과 보강
      const result = {
        ...evaluationResult,
        processingTime: Date.now() - startTime,
        cached: false,
        category,
        metadata: {
          questionLength: question.length,
          answerLength: answer.length,
          evaluatedAt: new Date().toISOString()
        }
      }

      // 통계 업데이트
      this.updateStats(result)

      // 캐시에 저장
      this.setCachedResult(cacheKey, result)

      logger.info('답변 품질 평가 완료', {
        overallScore: result.overallScore,
        grade: result.grade,
        category,
        processingTime: result.processingTime
      })

      return result

    } catch (error) {
      this.stats.errors++
      const processingTime = Date.now() - startTime

      logger.error('답변 품질 평가 실패', {
        error: error.message,
        category,
        processingTime,
        totalEvaluations: this.stats.evaluations,
        errorRate: (this.stats.errors / this.stats.evaluations * 100).toFixed(2) + '%'
      })

      // 폴백 결과 반환
      return {
        overallScore: 0.5,
        grade: 'C',
        metrics: this.getDefaultMetrics(),
        feedback: {
          strengths: [],
          improvements: ['평가 처리 중 오류가 발생했습니다.'],
          recommendations: ['답변을 다시 검토해보세요.']
        },
        flags: ['evaluation_error'],
        category,
        method: 'fallback',
        error: error.message,
        processingTime,
        cached: false
      }
    }
  }

  /**
   * AI 기반 품질 평가
   */
  async evaluateWithAI(question, answer, category) {
    const categoryInfo = this.categorySpecificCriteria[category] || this.categorySpecificCriteria.life

    const prompt = `
다음 Q&A의 답변 품질을 평가해주세요.

질문: ${question}
답변: ${answer}
카테고리: ${category}

평가 기준:
1. 정확성 (30%): 사실적으로 정확한가?
2. 완전성 (25%): 질문에 충분히 답했는가?
3. 연관성 (20%): 질문과 관련이 있는가?
4. 명확성 (15%): 이해하기 쉬운가?
5. 유용성 (10%): 실제로 도움이 되는가?

카테고리별 중점 사항:
- 중점: ${categoryInfo.focus.join(', ')}
- 주의: ${categoryInfo.penalties.join(', ')}

응답 형식 (JSON만 반환):
{
  "overallScore": 0.85,
  "grade": "B+",
  "metrics": {
    "accuracy": 0.9,
    "completeness": 0.8,
    "relevance": 0.9,
    "clarity": 0.8,
    "helpfulness": 0.8
  },
  "feedback": {
    "strengths": ["정확한 정보 제공", "구체적 절차 안내"],
    "improvements": ["더 자세한 설명 필요", "예시 추가"],
    "recommendations": ["관련 링크 추가", "주의사항 명시"]
  },
  "flags": ["needs_verification", "good_answer"],
  "reasoning": "평가 이유"
}

점수 기준:
- 0.9-1.0: A (매우 우수)
- 0.8-0.89: B (우수)
- 0.7-0.79: C (보통)
- 0.6-0.69: D (미흡)
- 0.0-0.59: F (부족)

플래그 옵션: excellent_answer, good_answer, needs_improvement, needs_verification, potential_issue, harmful_content
`.trim()

    const requestData = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: '당신은 한국 거주 베트남인을 위한 Q&A 플랫폼의 답변 품질 평가 전문가입니다. 정확하고 공정한 평가를 제공해주세요.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    }

    logger.startTimer('answer-quality-api')

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestData)
    })

    logger.endTimer('answer-quality-api')

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`AI 품질 평가 API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`)
    }

    const result = await response.json()
    const content = result.choices[0]?.message?.content

    if (!content) {
      throw new Error('AI 품질 평가 응답이 비어있습니다.')
    }

    try {
      const parsed = JSON.parse(content)

      // 유효성 검증
      if (typeof parsed.overallScore !== 'number' || parsed.overallScore < 0 || parsed.overallScore > 1) {
        parsed.overallScore = Math.max(0, Math.min(1, parsed.overallScore || 0.5))
      }

      if (!parsed.grade) {
        parsed.grade = this.getGradeFromScore(parsed.overallScore)
      }

      if (!parsed.metrics) {
        parsed.metrics = this.getDefaultMetrics()
      }

      parsed.method = 'ai'
      return parsed
    } catch (parseError) {
      logger.warn('AI 품질 평가 응답 파싱 실패', { content })
      throw new Error('AI 품질 평가 응답을 처리할 수 없습니다.')
    }
  }

  /**
   * 기본 품질 평가 (키워드 및 규칙 기반)
   */
  getBasicEvaluation(question, answer, category) {
    const metrics = {}
    const feedback = { strengths: [], improvements: [], recommendations: [] }
    const flags = []

    // 길이 기반 평가
    const answerLength = answer.length
    metrics.completeness = Math.min(answerLength / 200, 1) * 0.8 + 0.2

    // 연관성 평가 (키워드 매칭)
    const questionKeywords = question.toLowerCase().split(/\s+/)
    const answerLowerCase = answer.toLowerCase()
    const matchedKeywords = questionKeywords.filter(word =>
      word.length > 2 && answerLowerCase.includes(word)
    ).length

    metrics.relevance = Math.min(matchedKeywords / Math.max(questionKeywords.length * 0.3, 1), 1)

    // 명확성 평가 (문장 구조)
    const sentences = answer.split(/[.!?]/).filter(s => s.trim().length > 0)
    const avgSentenceLength = answer.length / sentences.length
    metrics.clarity = avgSentenceLength > 100 ? 0.6 : 0.8

    // 정확성 및 유용성 (기본값)
    metrics.accuracy = 0.7
    metrics.helpfulness = 0.7

    // 카테고리별 조정
    const categoryInfo = this.categorySpecificCriteria[category]
    if (categoryInfo) {
      // 중점 사항 체크
      const focusMatches = categoryInfo.focus.filter(focus =>
        answerLowerCase.includes(focus.toLowerCase())
      ).length
      if (focusMatches > 0) {
        metrics.accuracy += 0.1
        feedback.strengths.push('카테고리에 적합한 내용 포함')
      }

      // 주의사항 체크
      const penaltyMatches = categoryInfo.penalties.filter(penalty =>
        answerLowerCase.includes(penalty.toLowerCase())
      ).length
      if (penaltyMatches > 0) {
        metrics.accuracy -= 0.2
        flags.push('needs_verification')
        feedback.improvements.push('부적절한 내용이 포함될 수 있습니다')
      }
    }

    // 전체 점수 계산
    const overallScore = Object.entries(this.qualityMetrics).reduce((sum, [key, config]) => {
      return sum + (metrics[key] || 0.5) * config.weight
    }, 0)

    // 피드백 생성
    if (metrics.completeness < 0.5) {
      feedback.improvements.push('더 자세한 설명이 필요합니다')
    }
    if (metrics.relevance < 0.6) {
      feedback.improvements.push('질문과 더 관련성 있는 내용이 필요합니다')
    }
    if (answerLength < 50) {
      feedback.recommendations.push('답변을 더 구체적으로 작성해보세요')
    }

    return {
      overallScore: Math.max(0, Math.min(1, overallScore)),
      grade: this.getGradeFromScore(overallScore),
      metrics,
      feedback,
      flags: flags.length > 0 ? flags : ['basic_evaluation'],
      reasoning: '키워드 및 규칙 기반 기본 평가',
      method: 'basic'
    }
  }

  /**
   * 점수에서 등급 계산
   */
  getGradeFromScore(score) {
    if (score >= 0.9) return 'A'
    if (score >= 0.8) return 'B'
    if (score >= 0.7) return 'C'
    if (score >= 0.6) return 'D'
    return 'F'
  }

  /**
   * 기본 메트릭 반환
   */
  getDefaultMetrics() {
    return {
      accuracy: 0.5,
      completeness: 0.5,
      relevance: 0.5,
      clarity: 0.5,
      helpfulness: 0.5
    }
  }

  /**
   * 캐시 키 생성
   */
  generateCacheKey(question, answer, category) {
    const content = `${question}-${answer}-${category}`
    return content.replace(/\s+/g, ' ').trim().substring(0, 200)
  }

  /**
   * 캐시에 결과 저장
   */
  setCachedResult(cacheKey, result) {
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    })
  }

  /**
   * 통계 업데이트
   */
  updateStats(result) {
    // 평균 점수 업데이트
    const currentAvg = this.stats.averageScore
    const newAvg = (currentAvg * (this.stats.evaluations - 1) + result.overallScore) / this.stats.evaluations
    this.stats.averageScore = newAvg

    // 카테고리별 통계
    if (!this.stats.categoryStats[result.category]) {
      this.stats.categoryStats[result.category] = {
        count: 0,
        averageScore: 0,
        grades: { A: 0, B: 0, C: 0, D: 0, F: 0 }
      }
    }

    const categoryStats = this.stats.categoryStats[result.category]
    categoryStats.count++
    categoryStats.averageScore = (categoryStats.averageScore * (categoryStats.count - 1) + result.overallScore) / categoryStats.count
    categoryStats.grades[result.grade]++
  }

  /**
   * 배치 평가 (여러 답변 동시 처리)
   */
  async evaluateAnswers(evaluations, options = {}) {
    logger.info('배치 답변 품질 평가 시작', { count: evaluations.length })

    const results = await Promise.allSettled(
      evaluations.map(e => this.evaluateAnswer(e.question, e.answer, e.category, options))
    )

    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)

    const failed = results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason)

    logger.info('배치 답변 품질 평가 완료', {
      total: evaluations.length,
      successful: successful.length,
      failed: failed.length
    })

    return {
      successful,
      failed,
      stats: {
        total: evaluations.length,
        successRate: (successful.length / evaluations.length * 100).toFixed(2) + '%',
        averageScore: successful.length > 0
          ? (successful.reduce((sum, r) => sum + r.overallScore, 0) / successful.length).toFixed(3)
          : 0
      }
    }
  }

  /**
   * 통계 정보 가져오기
   */
  getStats() {
    const cacheHitRate = this.stats.evaluations > 0
      ? (this.stats.cacheHits / this.stats.evaluations * 100).toFixed(2) + '%'
      : '0%'

    const errorRate = this.stats.evaluations > 0
      ? (this.stats.errors / this.stats.evaluations * 100).toFixed(2) + '%'
      : '0%'

    return {
      evaluations: this.stats.evaluations,
      cacheHits: this.stats.cacheHits,
      cacheHitRate,
      errors: this.stats.errors,
      errorRate,
      averageScore: this.stats.averageScore.toFixed(3),
      categoryStats: this.stats.categoryStats,
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize
    }
  }

  /**
   * 캐시 관리
   */
  clearCache() {
    this.cache.clear()
    logger.info('답변 품질 평가 캐시 지우기 완료')
  }

  /**
   * 통계 초기화
   */
  resetStats() {
    this.stats = {
      evaluations: 0,
      cacheHits: 0,
      errors: 0,
      averageScore: 0,
      categoryStats: {}
    }
    logger.info('답변 품질 평가 통계 초기화 완료')
  }

  /**
   * 서비스 상태 확인
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      hasApiKey: !!this.apiKey,
      model: this.model,
      qualityMetrics: this.qualityMetrics,
      supportedCategories: Object.keys(this.categorySpecificCriteria),
      cache: {
        size: this.cache.size,
        maxSize: this.maxCacheSize,
        timeout: this.cacheTimeout
      },
      stats: this.getStats()
    }
  }
}

// 싱글톤 인스턴스 생성
const answerQualityService = new AnswerQualityService()

export default answerQualityService
export { AnswerQualityService }
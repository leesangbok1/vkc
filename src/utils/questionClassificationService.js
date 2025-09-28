/**
 * AI 기반 질문 분류 서비스
 * 베트남인 한국 거주자를 위한 Q&A 플랫폼 특화
 */

import logger from './logger.js'
import environment from './environment.js'

class QuestionClassificationService {
  constructor() {
    this.apiKey = environment.API_CONFIG.openai.apiKey
    this.apiUrl = environment.API_CONFIG.openai.baseUrl
    this.model = environment.API_CONFIG.openai.model
    this.isEnabled = !!this.apiKey

    // 카테고리 정의
    this.categories = {
      visa: {
        name: '비자/체류',
        keywords: ['비자', '체류', '연장', 'visa', '출입국', '영주권', '귀화', '등록증'],
        priority: 'high'
      },
      life: {
        name: '생활정보',
        keywords: ['생활', '쇼핑', '교통', '주거', '은행', '카드', '휴대폰', '인터넷'],
        priority: 'normal'
      },
      work: {
        name: '취업/근로',
        keywords: ['취업', '일자리', '구직', '근로', '계약', '급여', '아르바이트', '회사'],
        priority: 'high'
      },
      education: {
        name: '교육/학업',
        keywords: ['학교', '대학', '한국어', '토픽', '시험', '학비', '장학금', '어학원'],
        priority: 'normal'
      },
      medical: {
        name: '의료/건강',
        keywords: ['병원', '의료', '건강보험', '약국', '치료', '검진', '의사', '응급실'],
        priority: 'high'
      },
      legal: {
        name: '법률/제도',
        keywords: ['법률', '계약', '분쟁', '변호사', '소송', '권리', '의무', '법원'],
        priority: 'high'
      },
      culture: {
        name: '문화/행사',
        keywords: ['문화', '행사', '축제', '종교', '음식', '전통', '예절', '관습'],
        priority: 'low'
      },
      other: {
        name: '기타',
        keywords: [],
        priority: 'normal'
      }
    }

    // 우선순위 정의
    this.urgencyLevels = ['low', 'normal', 'high', 'urgent']

    // 캐싱 시스템
    this.cache = new Map()
    this.cacheTimeout = 30 * 60 * 1000 // 30분
    this.maxCacheSize = 200

    // 통계
    this.stats = {
      classifications: 0,
      cacheHits: 0,
      errors: 0,
      categoryDistribution: {}
    }

    logger.info('질문 분류 서비스 초기화', {
      enabled: this.isEnabled,
      model: this.model,
      categories: Object.keys(this.categories)
    })
  }

  /**
   * 키워드 기반 예비 분류
   */
  getPreClassification(title, content) {
    const text = `${title} ${content}`.toLowerCase()

    for (const [categoryId, category] of Object.entries(this.categories)) {
      if (categoryId === 'other') continue

      const keywordMatches = category.keywords.filter(keyword =>
        text.includes(keyword.toLowerCase())
      ).length

      if (keywordMatches > 0) {
        return {
          category: categoryId,
          confidence: Math.min(keywordMatches * 0.3, 0.9),
          method: 'keyword'
        }
      }
    }

    return {
      category: 'other',
      confidence: 0.1,
      method: 'fallback'
    }
  }

  /**
   * AI 기반 정밀 분류
   */
  async classifyWithAI(title, content) {
    const prompt = `
다음 질문을 분석하여 가장 적절한 카테고리를 선택하고 관련 정보를 제공해주세요.

제목: ${title}
내용: ${content}

사용 가능한 카테고리:
- visa: 비자, 체류, 출입국 관련
- life: 일상생활, 쇼핑, 교통, 주거 관련
- work: 취업, 근로, 아르바이트 관련
- education: 교육, 학업, 한국어 학습 관련
- medical: 의료, 건강, 병원 관련
- legal: 법률, 계약, 권리 관련
- culture: 문화, 행사, 관습 관련
- other: 위 카테고리에 속하지 않는 경우

응답 형식 (JSON만 반환):
{
  "category": "카테고리ID",
  "confidence": 0.95,
  "urgency": "normal",
  "tags": ["태그1", "태그2"],
  "reasoning": "분류 이유",
  "suggested_experts": ["전문가유형1", "전문가유형2"]
}

urgency 레벨: low, normal, high, urgent
`.trim()

    const requestData = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: '당신은 한국 거주 베트남인을 위한 Q&A 플랫폼의 질문 분류 전문가입니다. 정확하고 유용한 분류를 제공해주세요.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 600
    }

    logger.startTimer('question-classification-api')

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestData)
    })

    logger.endTimer('question-classification-api')

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`AI 분류 API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`)
    }

    const result = await response.json()
    const content_text = result.choices[0]?.message?.content

    if (!content_text) {
      throw new Error('AI 분류 응답이 비어있습니다.')
    }

    try {
      const parsed = JSON.parse(content_text)

      // 유효성 검증
      if (!this.categories[parsed.category]) {
        parsed.category = 'other'
      }

      if (!this.urgencyLevels.includes(parsed.urgency)) {
        parsed.urgency = 'normal'
      }

      parsed.method = 'ai'
      return parsed
    } catch (parseError) {
      logger.warn('AI 분류 응답 파싱 실패', { content: content_text })
      throw new Error('AI 분류 응답을 처리할 수 없습니다.')
    }
  }

  /**
   * 캐시 키 생성
   */
  generateCacheKey(title, content) {
    return `${title}-${content}`.replace(/\s+/g, ' ').trim().substring(0, 200)
  }

  /**
   * 질문 분류 (메인 메소드)
   */
  async classifyQuestion(title, content, options = {}) {
    const startTime = Date.now()
    this.stats.classifications++

    try {
      if (!title && !content) {
        throw new Error('제목 또는 내용이 필요합니다.')
      }

      // 캐시 확인
      const cacheKey = this.generateCacheKey(title, content)
      const cached = this.cache.get(cacheKey)

      if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
        this.stats.cacheHits++
        logger.debug('캐시에서 분류 결과 반환', { cacheKey })
        return { ...cached.result, cached: true }
      }

      logger.info('질문 분류 시작', {
        title: title?.substring(0, 50),
        contentLength: content?.length || 0
      })

      let classificationResult

      // AI 분류 시도 (우선순위)
      if (this.isEnabled && !options.useKeywordOnly) {
        try {
          classificationResult = await this.classifyWithAI(title, content)
        } catch (aiError) {
          logger.warn('AI 분류 실패, 키워드 분류로 대체', { error: aiError.message })
          classificationResult = this.getPreClassification(title, content)
        }
      } else {
        // 키워드 기반 분류
        classificationResult = this.getPreClassification(title, content)
      }

      // 결과 보강
      const categoryInfo = this.categories[classificationResult.category]
      const result = {
        ...classificationResult,
        categoryName: categoryInfo.name,
        categoryPriority: categoryInfo.priority,
        processingTime: Date.now() - startTime,
        cached: false
      }

      // 통계 업데이트
      if (!this.stats.categoryDistribution[result.category]) {
        this.stats.categoryDistribution[result.category] = 0
      }
      this.stats.categoryDistribution[result.category]++

      // 캐시에 저장
      if (this.cache.size >= this.maxCacheSize) {
        const oldestKey = this.cache.keys().next().value
        this.cache.delete(oldestKey)
      }

      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      })

      logger.info('질문 분류 완료', {
        category: result.category,
        confidence: result.confidence,
        method: result.method,
        processingTime: result.processingTime
      })

      return result

    } catch (error) {
      this.stats.errors++
      const processingTime = Date.now() - startTime

      logger.error('질문 분류 실패', {
        error: error.message,
        title: title?.substring(0, 50),
        processingTime,
        totalClassifications: this.stats.classifications,
        errorRate: (this.stats.errors / this.stats.classifications * 100).toFixed(2) + '%'
      })

      // 폴백 결과 반환
      return {
        category: 'other',
        categoryName: '기타',
        confidence: 0.1,
        urgency: 'normal',
        tags: [],
        reasoning: '분류 실패로 기본 카테고리 적용',
        method: 'fallback',
        error: error.message,
        processingTime: Date.now() - startTime,
        cached: false
      }
    }
  }

  /**
   * 배치 분류 (여러 질문 동시 처리)
   */
  async classifyQuestions(questions, options = {}) {
    logger.info('배치 질문 분류 시작', { count: questions.length })

    const results = await Promise.allSettled(
      questions.map(q => this.classifyQuestion(q.title, q.content, options))
    )

    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)

    const failed = results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason)

    logger.info('배치 질문 분류 완료', {
      total: questions.length,
      successful: successful.length,
      failed: failed.length
    })

    return {
      successful,
      failed,
      stats: {
        total: questions.length,
        successRate: (successful.length / questions.length * 100).toFixed(2) + '%'
      }
    }
  }

  /**
   * 카테고리 정보 가져오기
   */
  getCategories() {
    return Object.entries(this.categories).map(([id, info]) => ({
      id,
      name: info.name,
      keywords: info.keywords,
      priority: info.priority
    }))
  }

  /**
   * 통계 정보 가져오기
   */
  getStats() {
    const cacheHitRate = this.stats.classifications > 0
      ? (this.stats.cacheHits / this.stats.classifications * 100).toFixed(2) + '%'
      : '0%'

    const errorRate = this.stats.classifications > 0
      ? (this.stats.errors / this.stats.classifications * 100).toFixed(2) + '%'
      : '0%'

    return {
      classifications: this.stats.classifications,
      cacheHits: this.stats.cacheHits,
      cacheHitRate,
      errors: this.stats.errors,
      errorRate,
      categoryDistribution: this.stats.categoryDistribution,
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize
    }
  }

  /**
   * 캐시 관리
   */
  clearCache() {
    this.cache.clear()
    logger.info('질문 분류 캐시 지우기 완료')
  }

  /**
   * 통계 초기화
   */
  resetStats() {
    this.stats = {
      classifications: 0,
      cacheHits: 0,
      errors: 0,
      categoryDistribution: {}
    }
    logger.info('질문 분류 통계 초기화 완료')
  }

  /**
   * 서비스 상태 확인
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      hasApiKey: !!this.apiKey,
      model: this.model,
      categories: this.getCategories(),
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
const questionClassificationService = new QuestionClassificationService()

export default questionClassificationService
export { QuestionClassificationService }
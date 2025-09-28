/**
 * 질문-전문가 매칭 서비스
 * 베트남인 한국 거주자를 위한 Q&A 플랫폼 특화
 */

import logger from './logger.js'
import questionClassificationService from './questionClassificationService.js'

class ExpertMatchingService {
  constructor() {
    // 전문가 타입 정의
    this.expertTypes = {
      visa_specialist: {
        name: '비자/출입국 전문가',
        categories: ['visa'],
        keywords: ['비자', '체류', '연장', '출입국', '영주권', '귀화', '등록증'],
        priority: 'high',
        requiredExperience: 3
      },
      legal_advisor: {
        name: '법률 상담사',
        categories: ['legal', 'visa'],
        keywords: ['법률', '계약', '분쟁', '변호사', '소송', '권리', '의무'],
        priority: 'high',
        requiredExperience: 5
      },
      medical_guide: {
        name: '의료 안내사',
        categories: ['medical'],
        keywords: ['병원', '의료', '건강보험', '약국', '치료', '검진', '응급실'],
        priority: 'high',
        requiredExperience: 2
      },
      employment_counselor: {
        name: '취업 상담사',
        categories: ['work'],
        keywords: ['취업', '일자리', '구직', '근로', '계약', '급여', '아르바이트'],
        priority: 'high',
        requiredExperience: 3
      },
      life_assistant: {
        name: '생활 도우미',
        categories: ['life'],
        keywords: ['생활', '쇼핑', '교통', '주거', '은행', '카드', '휴대폰'],
        priority: 'normal',
        requiredExperience: 1
      },
      education_coordinator: {
        name: '교육 코디네이터',
        categories: ['education'],
        keywords: ['학교', '대학', '한국어', '토픽', '시험', '학비', '장학금'],
        priority: 'normal',
        requiredExperience: 2
      },
      cultural_interpreter: {
        name: '문화 해설사',
        categories: ['culture'],
        keywords: ['문화', '행사', '축제', '종교', '음식', '전통', '예절'],
        priority: 'low',
        requiredExperience: 1
      },
      community_volunteer: {
        name: '커뮤니티 자원봉사자',
        categories: ['other', 'life', 'culture'],
        keywords: ['도움', '지원', '커뮤니티', '소통'],
        priority: 'normal',
        requiredExperience: 0
      }
    }

    // 전문가 데이터베이스 (실제로는 외부 DB에서 가져올 예정)
    this.experts = new Map()

    // 매칭 가중치
    this.matchingWeights = {
      categoryMatch: 0.4,        // 카테고리 일치
      keywordRelevance: 0.25,    // 키워드 연관성
      experienceLevel: 0.15,     // 경험 수준
      availability: 0.1,         // 가용성
      responseTime: 0.05,        // 응답 시간
      rating: 0.05              // 평점
    }

    // 캐싱 시스템
    this.cache = new Map()
    this.cacheTimeout = 15 * 60 * 1000 // 15분
    this.maxCacheSize = 150

    // 통계
    this.stats = {
      matches: 0,
      cacheHits: 0,
      errors: 0,
      expertTypeDistribution: {},
      averageMatchScore: 0
    }

    logger.info('전문가 매칭 서비스 초기화', {
      expertTypes: Object.keys(this.expertTypes).length,
      weights: this.matchingWeights
    })

    // 샘플 전문가 데이터 초기화
    this.initializeSampleExperts()
  }

  /**
   * 샘플 전문가 데이터 초기화 (개발용)
   */
  initializeSampleExperts() {
    const sampleExperts = [
      {
        id: 'expert_001',
        name: '김비자',
        type: 'visa_specialist',
        experience: 5,
        rating: 4.8,
        availability: 'online',
        responseTime: 120, // 분
        specialties: ['F-2-7', 'F-5', '영주권', '귀화'],
        languages: ['ko', 'vi'],
        isActive: true
      },
      {
        id: 'expert_002',
        name: '이법률',
        type: 'legal_advisor',
        experience: 7,
        rating: 4.9,
        availability: 'busy',
        responseTime: 240,
        specialties: ['근로계약', '임대차', '분쟁조정'],
        languages: ['ko', 'vi', 'en'],
        isActive: true
      },
      {
        id: 'expert_003',
        name: '박의료',
        type: 'medical_guide',
        experience: 4,
        rating: 4.7,
        availability: 'online',
        responseTime: 90,
        specialties: ['건강보험', '응급실', '약국이용'],
        languages: ['ko', 'vi'],
        isActive: true
      },
      {
        id: 'expert_004',
        name: '최취업',
        type: 'employment_counselor',
        experience: 6,
        rating: 4.6,
        availability: 'online',
        responseTime: 180,
        specialties: ['구직활동', '근로기준법', '4대보험'],
        languages: ['ko', 'vi'],
        isActive: true
      },
      {
        id: 'expert_005',
        name: '정생활',
        type: 'life_assistant',
        experience: 2,
        rating: 4.5,
        availability: 'online',
        responseTime: 60,
        specialties: ['은행업무', '교통카드', '온라인쇼핑'],
        languages: ['ko', 'vi'],
        isActive: true
      }
    ]

    sampleExperts.forEach(expert => {
      this.experts.set(expert.id, expert)
    })

    logger.debug('샘플 전문가 데이터 초기화 완료', { count: sampleExperts.length })
  }

  /**
   * 질문에 적합한 전문가 매칭 (메인 메소드)
   */
  async matchExperts(question, category = null, options = {}) {
    const startTime = Date.now()
    this.stats.matches++

    try {
      if (!question) {
        throw new Error('질문이 필요합니다.')
      }

      // 캐시 확인
      const cacheKey = this.generateCacheKey(question, category, options)
      const cached = this.cache.get(cacheKey)

      if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
        this.stats.cacheHits++
        logger.debug('캐시에서 전문가 매칭 결과 반환', { cacheKey })
        return { ...cached.result, cached: true }
      }

      logger.info('전문가 매칭 시작', {
        questionLength: question.length,
        category,
        optionsCount: Object.keys(options).length
      })

      // 카테고리가 없으면 질문 분류 실행
      if (!category) {
        try {
          const classification = await questionClassificationService.classifyQuestion(question, '')
          category = classification.category
          logger.debug('질문 분류 결과', { category, confidence: classification.confidence })
        } catch (classificationError) {
          logger.warn('질문 분류 실패, 기본 카테고리 사용', { error: classificationError.message })
          category = 'other'
        }
      }

      // 전문가 매칭 실행
      const matchResults = this.findMatchingExperts(question, category, options)

      // 결과 정렬 및 제한
      const maxResults = options.maxResults || 5
      const sortedMatches = matchResults
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, maxResults)

      const result = {
        question: question.substring(0, 100),
        category,
        matches: sortedMatches,
        totalCandidates: matchResults.length,
        processingTime: Date.now() - startTime,
        cached: false,
        metadata: {
          weights: this.matchingWeights,
          maxResults,
          evaluatedAt: new Date().toISOString()
        }
      }

      // 통계 업데이트
      this.updateStats(result)

      // 캐시에 저장
      this.setCachedResult(cacheKey, result)

      logger.info('전문가 매칭 완료', {
        category,
        matchCount: sortedMatches.length,
        topScore: sortedMatches[0]?.matchScore || 0,
        processingTime: result.processingTime
      })

      return result

    } catch (error) {
      this.stats.errors++
      const processingTime = Date.now() - startTime

      logger.error('전문가 매칭 실패', {
        error: error.message,
        category,
        processingTime,
        totalMatches: this.stats.matches,
        errorRate: (this.stats.errors / this.stats.matches * 100).toFixed(2) + '%'
      })

      // 폴백 결과 반환
      return {
        question: question.substring(0, 100),
        category: category || 'other',
        matches: [],
        totalCandidates: 0,
        error: error.message,
        processingTime,
        cached: false
      }
    }
  }

  /**
   * 매칭 전문가 찾기
   */
  findMatchingExperts(question, category, options = {}) {
    const questionLower = question.toLowerCase()
    const results = []

    for (const [expertId, expert] of this.experts) {
      if (!expert.isActive) continue

      // 가용성 필터
      if (options.requireOnline && expert.availability !== 'online') continue

      // 언어 필터
      if (options.language && !expert.languages.includes(options.language)) continue

      // 매칭 점수 계산
      const matchScore = this.calculateMatchScore(expert, questionLower, category)

      if (matchScore > 0.1) { // 최소 임계값
        results.push({
          expert: {
            id: expert.id,
            name: expert.name,
            type: expert.type,
            typeName: this.expertTypes[expert.type]?.name || expert.type,
            experience: expert.experience,
            rating: expert.rating,
            availability: expert.availability,
            responseTime: expert.responseTime,
            specialties: expert.specialties,
            languages: expert.languages
          },
          matchScore: Math.round(matchScore * 1000) / 1000,
          matchReasons: this.getMatchReasons(expert, questionLower, category)
        })
      }
    }

    return results
  }

  /**
   * 매칭 점수 계산
   */
  calculateMatchScore(expert, questionLower, category) {
    const expertType = this.expertTypes[expert.type]
    if (!expertType) return 0

    let score = 0

    // 1. 카테고리 매칭 (40%)
    const categoryScore = expertType.categories.includes(category) ? 1 :
                          expertType.categories.includes('other') ? 0.3 : 0
    score += categoryScore * this.matchingWeights.categoryMatch

    // 2. 키워드 연관성 (25%)
    const keywordMatches = expertType.keywords.filter(keyword =>
      questionLower.includes(keyword.toLowerCase())
    ).length
    const keywordScore = Math.min(keywordMatches / expertType.keywords.length, 1)
    score += keywordScore * this.matchingWeights.keywordRelevance

    // 3. 경험 수준 (15%)
    const experienceScore = Math.min(expert.experience / 5, 1) // 5년을 최대로 정규화
    score += experienceScore * this.matchingWeights.experienceLevel

    // 4. 가용성 (10%)
    const availabilityScore = expert.availability === 'online' ? 1 :
                              expert.availability === 'busy' ? 0.5 : 0.2
    score += availabilityScore * this.matchingWeights.availability

    // 5. 응답 시간 (5%)
    const responseScore = Math.max(0, 1 - (expert.responseTime / 480)) // 8시간을 최대로 정규화
    score += responseScore * this.matchingWeights.responseTime

    // 6. 평점 (5%)
    const ratingScore = expert.rating / 5 // 5점 만점 정규화
    score += ratingScore * this.matchingWeights.rating

    return Math.max(0, Math.min(1, score))
  }

  /**
   * 매칭 이유 생성
   */
  getMatchReasons(expert, questionLower, category) {
    const reasons = []
    const expertType = this.expertTypes[expert.type]

    // 카테고리 매칭
    if (expertType.categories.includes(category)) {
      reasons.push(`${expertType.name} 전문 분야와 일치`)
    }

    // 키워드 매칭
    const matchedKeywords = expertType.keywords.filter(keyword =>
      questionLower.includes(keyword.toLowerCase())
    )
    if (matchedKeywords.length > 0) {
      reasons.push(`관련 키워드 매칭: ${matchedKeywords.slice(0, 3).join(', ')}`)
    }

    // 경험
    if (expert.experience >= 3) {
      reasons.push(`${expert.experience}년 경험`)
    }

    // 가용성
    if (expert.availability === 'online') {
      reasons.push('현재 온라인 상태')
    }

    // 높은 평점
    if (expert.rating >= 4.5) {
      reasons.push(`높은 평점 (${expert.rating}/5.0)`)
    }

    // 빠른 응답
    if (expert.responseTime <= 120) {
      reasons.push('빠른 응답 시간')
    }

    return reasons.slice(0, 4) // 최대 4개 이유
  }

  /**
   * 전문가 등록
   */
  registerExpert(expertData) {
    const expert = {
      id: expertData.id || `expert_${Date.now()}`,
      name: expertData.name,
      type: expertData.type,
      experience: expertData.experience || 0,
      rating: expertData.rating || 3.0,
      availability: expertData.availability || 'offline',
      responseTime: expertData.responseTime || 480,
      specialties: expertData.specialties || [],
      languages: expertData.languages || ['ko'],
      isActive: expertData.isActive !== false,
      registeredAt: new Date().toISOString()
    }

    // 유효성 검증
    if (!expert.name || !this.expertTypes[expert.type]) {
      throw new Error('전문가 정보가 유효하지 않습니다.')
    }

    this.experts.set(expert.id, expert)

    logger.info('새 전문가 등록', {
      id: expert.id,
      name: expert.name,
      type: expert.type
    })

    return expert
  }

  /**
   * 전문가 정보 업데이트
   */
  updateExpert(expertId, updates) {
    const expert = this.experts.get(expertId)
    if (!expert) {
      throw new Error('전문가를 찾을 수 없습니다.')
    }

    const updatedExpert = { ...expert, ...updates, updatedAt: new Date().toISOString() }
    this.experts.set(expertId, updatedExpert)

    logger.info('전문가 정보 업데이트', {
      id: expertId,
      updates: Object.keys(updates)
    })

    return updatedExpert
  }

  /**
   * 캐시 키 생성
   */
  generateCacheKey(question, category, options) {
    const content = `${question}-${category}-${JSON.stringify(options)}`
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
    // 평균 매칭 점수 업데이트
    if (result.matches.length > 0) {
      const topScore = result.matches[0].matchScore
      const currentAvg = this.stats.averageMatchScore
      const newAvg = (currentAvg * (this.stats.matches - 1) + topScore) / this.stats.matches
      this.stats.averageMatchScore = newAvg
    }

    // 전문가 타입 분포
    result.matches.forEach(match => {
      const expertType = match.expert.type
      if (!this.stats.expertTypeDistribution[expertType]) {
        this.stats.expertTypeDistribution[expertType] = 0
      }
      this.stats.expertTypeDistribution[expertType]++
    })
  }

  /**
   * 전문가 목록 가져오기
   */
  getExperts(filters = {}) {
    let experts = Array.from(this.experts.values())

    // 필터 적용
    if (filters.type) {
      experts = experts.filter(expert => expert.type === filters.type)
    }
    if (filters.availability) {
      experts = experts.filter(expert => expert.availability === filters.availability)
    }
    if (filters.minRating) {
      experts = experts.filter(expert => expert.rating >= filters.minRating)
    }
    if (filters.isActive !== undefined) {
      experts = experts.filter(expert => expert.isActive === filters.isActive)
    }

    return experts
  }

  /**
   * 전문가 타입 정보 가져오기
   */
  getExpertTypes() {
    return Object.entries(this.expertTypes).map(([id, info]) => ({
      id,
      name: info.name,
      categories: info.categories,
      keywords: info.keywords,
      priority: info.priority,
      requiredExperience: info.requiredExperience
    }))
  }

  /**
   * 통계 정보 가져오기
   */
  getStats() {
    const cacheHitRate = this.stats.matches > 0
      ? (this.stats.cacheHits / this.stats.matches * 100).toFixed(2) + '%'
      : '0%'

    const errorRate = this.stats.matches > 0
      ? (this.stats.errors / this.stats.matches * 100).toFixed(2) + '%'
      : '0%'

    return {
      matches: this.stats.matches,
      cacheHits: this.stats.cacheHits,
      cacheHitRate,
      errors: this.stats.errors,
      errorRate,
      averageMatchScore: this.stats.averageMatchScore.toFixed(3),
      expertTypeDistribution: this.stats.expertTypeDistribution,
      totalExperts: this.experts.size,
      activeExperts: this.getExperts({ isActive: true }).length,
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize
    }
  }

  /**
   * 캐시 관리
   */
  clearCache() {
    this.cache.clear()
    logger.info('전문가 매칭 캐시 지우기 완료')
  }

  /**
   * 통계 초기화
   */
  resetStats() {
    this.stats = {
      matches: 0,
      cacheHits: 0,
      errors: 0,
      expertTypeDistribution: {},
      averageMatchScore: 0
    }
    logger.info('전문가 매칭 통계 초기화 완료')
  }

  /**
   * 서비스 상태 확인
   */
  getStatus() {
    return {
      expertTypes: this.getExpertTypes(),
      totalExperts: this.experts.size,
      activeExperts: this.getExperts({ isActive: true }).length,
      matchingWeights: this.matchingWeights,
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
const expertMatchingService = new ExpertMatchingService()

export default expertMatchingService
export { ExpertMatchingService }
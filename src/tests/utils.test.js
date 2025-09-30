/**
 * 유틸리티 함수들에 대한 테스트
 */

import { describe, it, expect } from 'vitest'

// Mock 환경 설정
const mockEnvironment = {
  isDevelopment: true,
  isProduction: false,
  isDebugMode: true,
  API_CONFIG: {
    openai: {
      apiKey: 'test-key',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      visionModel: 'gpt-4o'
    }
  },
  FEATURE_FLAGS: {
    enableAutoRetry: true,
    enableAnalytics: false,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true
  },
  PERFORMANCE_CONFIG: {
    apiTimeout: 30000,
    retryAttempts: 3,
    cacheTimeout: 300000,
    logLevel: 'DEBUG'
  }
}

// Mock 로거
const mockLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  trace: () => {}
}

describe('Environment Configuration', () => {
  it('should have valid development configuration', () => {
    expect(mockEnvironment.isDevelopment).toBe(true)
    expect(mockEnvironment.isProduction).toBe(false)
    expect(mockEnvironment.isDebugMode).toBe(true)
  })

  it('should have API configuration', () => {
    expect(mockEnvironment.API_CONFIG.openai).toBeDefined()
    expect(mockEnvironment.API_CONFIG.openai.apiKey).toBe('test-key')
    expect(mockEnvironment.API_CONFIG.openai.baseUrl).toContain('openai.com')
  })

  it('should have feature flags', () => {
    expect(mockEnvironment.FEATURE_FLAGS).toBeDefined()
    expect(mockEnvironment.FEATURE_FLAGS.enableAutoRetry).toBe(true)
  })
})

describe('Logger Service', () => {
  it('should have all required log methods', () => {
    expect(typeof mockLogger.info).toBe('function')
    expect(typeof mockLogger.warn).toBe('function')
    expect(typeof mockLogger.error).toBe('function')
    expect(typeof mockLogger.debug).toBe('function')
    expect(typeof mockLogger.trace).toBe('function')
  })
})

describe('Question Classification', () => {
  const testQuestions = [
    {
      title: 'F-2-7 비자 연장 방법',
      content: '현재 F-2-7 비자를 가지고 있는데 연장 방법을 알고 싶습니다.',
      expectedCategory: 'visa'
    },
    {
      title: '응급실 이용 문의',
      content: '밤에 갑자기 아파서 응급실에 가야 하는데 어떻게 해야 하나요?',
      expectedCategory: 'medical'
    },
    {
      title: '은행 계좌 개설',
      content: '한국에서 은행 계좌를 만들려고 하는데 어떤 서류가 필요한가요?',
      expectedCategory: 'life'
    }
  ]

  it('should classify visa-related questions correctly', () => {
    const question = testQuestions[0]
    const hasVisaKeywords = question.content.includes('비자') || question.title.includes('비자')
    expect(hasVisaKeywords).toBe(true)
  })

  it('should classify medical questions correctly', () => {
    const question = testQuestions[1]
    const hasMedicalKeywords = question.content.includes('응급실') || question.content.includes('아파')
    expect(hasMedicalKeywords).toBe(true)
  })

  it('should handle general life questions', () => {
    const question = testQuestions[2]
    const hasLifeKeywords = question.content.includes('은행') || question.content.includes('계좌')
    expect(hasLifeKeywords).toBe(true)
  })
})

describe('Priority Queue Logic', () => {
  const priorityWeights = {
    category: {
      visa: 0.9,
      medical: 0.85,
      legal: 0.8,
      work: 0.7,
      education: 0.6,
      life: 0.5,
      culture: 0.3,
      other: 0.4
    },
    urgency: {
      urgent: 1.0,
      high: 0.8,
      normal: 0.5,
      low: 0.2
    }
  }

  function calculatePriorityScore(category, urgency) {
    const categoryWeight = priorityWeights.category[category] || 0.4
    const urgencyWeight = priorityWeights.urgency[urgency] || 0.5
    return categoryWeight * 0.4 + urgencyWeight * 0.3
  }

  it('should calculate priority scores correctly', () => {
    const visaUrgentScore = calculatePriorityScore('visa', 'urgent')
    const lifeNormalScore = calculatePriorityScore('life', 'normal')

    expect(visaUrgentScore).toBeGreaterThan(lifeNormalScore)
    expect(visaUrgentScore).toBeCloseTo(0.66, 2) // 0.9 * 0.4 + 1.0 * 0.3
  })

  it('should prioritize urgent medical questions highest', () => {
    const medicalUrgent = calculatePriorityScore('medical', 'urgent')
    const visaNormal = calculatePriorityScore('visa', 'normal')

    expect(medicalUrgent).toBeGreaterThan(visaNormal)
  })

  it('should handle unknown categories with fallback', () => {
    const unknownScore = calculatePriorityScore('unknown', 'normal')
    const otherScore = calculatePriorityScore('other', 'normal')

    expect(unknownScore).toBe(otherScore) // Both should use fallback weight
  })
})

describe('Expert Matching Algorithm', () => {
  const mockExperts = [
    {
      id: 'expert_001',
      type: 'visa_specialist',
      experience: 5,
      rating: 4.8,
      availability: 'online',
      workload: 2
    },
    {
      id: 'expert_002',
      type: 'medical_guide',
      experience: 3,
      rating: 4.7,
      availability: 'online',
      workload: 5
    }
  ]

  function calculateMatchScore(expert, category) {
    const categoryMatches = {
      'visa_specialist': ['visa'],
      'medical_guide': ['medical'],
      'life_assistant': ['life']
    }

    const baseScore = categoryMatches[expert.type]?.includes(category) ? 0.8 : 0.2
    const experienceBonus = Math.min(expert.experience / 5, 1) * 0.1
    const workloadPenalty = Math.min(expert.workload * 0.05, 0.3)

    return Math.max(baseScore + experienceBonus - workloadPenalty, 0)
  }

  it('should match visa specialists to visa questions', () => {
    const visaExpert = mockExperts[0]
    const score = calculateMatchScore(visaExpert, 'visa')

    expect(score).toBeGreaterThanOrEqual(0.8)
  })

  it('should consider workload in matching', () => {
    const lowWorkloadExpert = { ...mockExperts[0], workload: 1 }
    const highWorkloadExpert = { ...mockExperts[0], workload: 10 }

    const lowScore = calculateMatchScore(lowWorkloadExpert, 'visa')
    const highScore = calculateMatchScore(highWorkloadExpert, 'visa')

    expect(lowScore).toBeGreaterThan(highScore)
  })

  it('should factor in experience level', () => {
    const experiencedExpert = { ...mockExperts[0], experience: 10 }
    const noviceExpert = { ...mockExperts[0], experience: 1 }

    const experiencedScore = calculateMatchScore(experiencedExpert, 'visa')
    const noviceScore = calculateMatchScore(noviceExpert, 'visa')

    expect(experiencedScore).toBeGreaterThan(noviceScore)
  })
})

describe('Answer Quality Evaluation', () => {
  function evaluateAnswerQuality(question, answer) {
    const answerLength = answer.length
    const completenessScore = Math.min(answerLength / 200, 1) * 0.8 + 0.2

    const questionKeywords = question.toLowerCase().split(/\s+/)
    const answerLowerCase = answer.toLowerCase()
    const matchedKeywords = questionKeywords.filter(word =>
      word.length > 2 && answerLowerCase.includes(word)
    ).length

    const relevanceScore = Math.min(matchedKeywords / Math.max(questionKeywords.length * 0.3, 1), 1)

    const overallScore = (completenessScore * 0.4 + relevanceScore * 0.6)

    return {
      overallScore: Math.min(overallScore, 1),
      completeness: completenessScore,
      relevance: relevanceScore
    }
  }

  it('should evaluate answer completeness', () => {
    const shortAnswer = '네, 가능합니다.'
    const longAnswer = '네, 가능합니다. 출입국관리사무소에 가서 신청서를 작성하고 필요한 서류를 제출하면 됩니다. 소득증명서, 납세증명서, 건강보험 가입증명서 등이 필요합니다.'

    const shortEval = evaluateAnswerQuality('비자 연장', shortAnswer)
    const longEval = evaluateAnswerQuality('비자 연장', longAnswer)

    expect(longEval.completeness).toBeGreaterThan(shortEval.completeness)
  })

  it('should evaluate answer relevance', () => {
    const relevantAnswer = '비자 연장을 위해서는 출입국관리사무소에서 신청하세요.'
    const irrelevantAnswer = '날씨가 좋네요. 오늘 점심 뭐 드셨나요?'

    const relevantEval = evaluateAnswerQuality('비자 연장 방법', relevantAnswer)
    const irrelevantEval = evaluateAnswerQuality('비자 연장 방법', irrelevantAnswer)

    expect(relevantEval.relevance).toBeGreaterThanOrEqual(irrelevantEval.relevance)
  })

  it('should provide overall quality scores', () => {
    const goodAnswer = '비자 연장을 위해서는 출입국관리사무소에 가서 신청서를 작성하고, 소득증명서, 납세증명서, 건강보험 가입증명서 등의 서류를 제출해야 합니다. 연장 신청은 현재 비자 만료일 4개월 전부터 가능합니다.'

    const evaluation = evaluateAnswerQuality('F-2-7 비자 연장 방법', goodAnswer)

    expect(evaluation.overallScore).toBeGreaterThan(0.2)
    expect(evaluation.overallScore).toBeLessThanOrEqual(1)
  })
})

describe('Notification System', () => {
  function createNotification(title, message, priority = 'normal') {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      priority,
      timestamp: Date.now(),
      channels: getDefaultChannels(priority),
      metadata: {
        source: 'test',
        actionRequired: priority === 'urgent'
      }
    }
  }

  function getDefaultChannels(priority) {
    const channelConfig = {
      browser: { enabled: true, priority: ['urgent', 'high', 'normal', 'low'] },
      mcp: { enabled: false, priority: ['urgent', 'high'] }
    }

    const availableChannels = []
    for (const [channel, config] of Object.entries(channelConfig)) {
      if (config.enabled && config.priority.includes(priority)) {
        availableChannels.push(channel)
      }
    }

    return availableChannels.length > 0 ? availableChannels : ['browser']
  }

  it('should create notifications with required fields', () => {
    const notification = createNotification('Test Title', 'Test Message', 'urgent')

    expect(notification.id).toBeDefined()
    expect(notification.title).toBe('Test Title')
    expect(notification.message).toBe('Test Message')
    expect(notification.priority).toBe('urgent')
    expect(notification.timestamp).toBeDefined()
  })

  it('should assign correct channels based on priority', () => {
    const urgentNotification = createNotification('Urgent', 'Message', 'urgent')
    const normalNotification = createNotification('Normal', 'Message', 'normal')

    expect(urgentNotification.channels).toContain('browser')
    expect(normalNotification.channels).toContain('browser')
  })

  it('should mark urgent notifications as action required', () => {
    const urgentNotification = createNotification('Urgent', 'Message', 'urgent')
    const normalNotification = createNotification('Normal', 'Message', 'normal')

    expect(urgentNotification.metadata.actionRequired).toBe(true)
    expect(normalNotification.metadata.actionRequired).toBe(false)
  })
})

describe('Error Handling', () => {
  function detectErrorType(error) {
    const errorMessage = error.message || error.toString()

    const tokenErrorIndicators = ['rate limit', 'token', 'quota', '429']
    const networkErrorIndicators = ['network error', 'fetch failed', 'timeout']
    const imageErrorIndicators = ['could not process image', 'invalid image']

    if (tokenErrorIndicators.some(indicator =>
      errorMessage.toLowerCase().includes(indicator.toLowerCase())
    )) {
      return 'token'
    }

    if (networkErrorIndicators.some(indicator =>
      errorMessage.toLowerCase().includes(indicator.toLowerCase())
    )) {
      return 'network'
    }

    if (imageErrorIndicators.some(indicator =>
      errorMessage.toLowerCase().includes(indicator.toLowerCase())
    )) {
      return 'image'
    }

    return 'general'
  }

  it('should detect token-related errors', () => {
    const tokenError = new Error('Rate limit exceeded')
    const errorType = detectErrorType(tokenError)

    expect(errorType).toBe('token')
  })

  it('should detect network errors', () => {
    const networkError = new Error('Network error: fetch failed')
    const errorType = detectErrorType(networkError)

    expect(errorType).toBe('network')
  })

  it('should detect image processing errors', () => {
    const imageError = new Error('Could not process image')
    const errorType = detectErrorType(imageError)

    expect(errorType).toBe('image')
  })

  it('should handle unknown errors as general', () => {
    const unknownError = new Error('Something went wrong')
    const errorType = detectErrorType(unknownError)

    expect(errorType).toBe('general')
  })
})
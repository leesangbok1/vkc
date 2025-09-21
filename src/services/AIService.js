// AI 서비스 - OpenAI API 통합
class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
    this.apiUrl = 'https://api.openai.com/v1'
    this.model = 'gpt-3.5-turbo'
    this.isEnabled = !!this.apiKey

    // 요청 캐시 (동일한 질문에 대한 중복 API 호출 방지)
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5분

    // 요청 제한 (Rate limiting)
    this.requestQueue = []
    this.isProcessing = false
    this.requestDelay = 1000 // 1초 간격

    console.log('🤖 AI 서비스 초기화:', this.isEnabled ? '활성화됨' : '비활성화됨 (API 키 없음)')
  }

  // API 요청 래퍼
  async makeRequest(endpoint, data, retries = 3) {
    if (!this.isEnabled) {
      throw new Error('AI 서비스가 활성화되지 않았습니다. API 키를 확인하세요.')
    }

    const cacheKey = JSON.stringify({ endpoint, data })
    const cached = this.cache.get(cacheKey)

    // 캐시된 응답이 있고 만료되지 않았으면 반환
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      console.log('🗄️ AI 캐시에서 응답 반환')
      return cached.response
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`AI API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`)
        }

        const result = await response.json()

        // 성공한 응답을 캐시에 저장
        this.cache.set(cacheKey, {
          response: result,
          timestamp: Date.now()
        })

        // 캐시 크기 관리 (최대 100개)
        if (this.cache.size > 100) {
          const firstKey = this.cache.keys().next().value
          this.cache.delete(firstKey)
        }

        return result
      } catch (error) {
        console.error(`🤖 AI API 요청 실패 (시도 ${attempt}/${retries}):`, error.message)

        if (attempt === retries) {
          throw error
        }

        // 재시도 전 대기
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  // 질문 분류 및 카테고리 추천
  async categorizeQuestion(title, content) {
    try {
      const prompt = `
다음 질문을 분석하여 가장 적절한 카테고리를 선택하고, 관련 태그를 추천해주세요.

제목: ${title}
내용: ${content}

사용 가능한 카테고리:
- 비자: 비자 신청, 연장, 변경 등
- 생활정보: 일상생활, 쇼핑, 교통 등
- 취업: 구직, 이직, 근로 조건 등
- 교육: 학업, 한국어 학습, 시험 등
- 의료: 병원, 건강보험, 의료 서비스 등
- 법률: 법적 문제, 계약, 권리 등
- 문화: 한국 문화, 행사, 관습 등
- 기타: 위 카테고리에 속하지 않는 경우

응답 형식 (JSON):
{
  "category": "카테고리명",
  "confidence": 0.95,
  "tags": ["태그1", "태그2", "태그3"],
  "reasoning": "분류 이유 설명"
}
`

      const data = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '당신은 한국 거주 베트남인을 위한 Q&A 플랫폼의 AI 분류 도우미입니다. 질문을 정확하게 분류하고 유용한 태그를 제안해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }

      const response = await this.makeRequest('/chat/completions', data)
      const result = response.choices[0]?.message?.content

      if (result) {
        try {
          const parsed = JSON.parse(result)
          console.log('🤖 질문 분류 완료:', parsed)
          return parsed
        } catch (parseError) {
          console.error('🤖 AI 응답 파싱 실패:', parseError)
          throw new Error('AI 응답을 처리할 수 없습니다.')
        }
      }

      throw new Error('AI 응답이 비어있습니다.')
    } catch (error) {
      console.error('🤖 질문 분류 실패:', error)

      // 폴백: 기본 분류
      return {
        category: '기타',
        confidence: 0.1,
        tags: [],
        reasoning: 'AI 분류 실패로 기본 카테고리 적용'
      }
    }
  }

  // 질문 개선 제안
  async suggestImprovements(title, content) {
    try {
      const prompt = `
다음 질문을 분석하여 더 좋은 답변을 받을 수 있도록 개선점을 제안해주세요.

제목: ${title}
내용: ${content}

다음 관점에서 분석해주세요:
1. 제목의 명확성
2. 내용의 구체성
3. 필요한 추가 정보
4. 질문의 구조

응답 형식 (JSON):
{
  "suggestions": [
    {
      "type": "title" | "content" | "structure" | "additional_info",
      "message": "개선 제안 내용",
      "example": "개선 예시 (옵션)"
    }
  ],
  "improvementScore": 0.7,
  "summary": "전체 개선점 요약"
}
`

      const data = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '당신은 질문 개선을 도와주는 AI 어시스턴트입니다. 한국 거주 베트남인들이 더 좋은 답변을 받을 수 있도록 질문을 개선하는 방법을 제안해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      }

      const response = await this.makeRequest('/chat/completions', data)
      const result = response.choices[0]?.message?.content

      if (result) {
        try {
          const parsed = JSON.parse(result)
          console.log('🤖 질문 개선 제안 완료:', parsed)
          return parsed
        } catch (parseError) {
          console.error('🤖 AI 응답 파싱 실패:', parseError)
          return null
        }
      }

      return null
    } catch (error) {
      console.error('🤖 질문 개선 제안 실패:', error)
      return null
    }
  }

  // 답변 품질 평가
  async evaluateAnswer(question, answer) {
    try {
      const prompt = `
다음 질문과 답변을 평가하여 답변의 품질을 분석해주세요.

질문: ${question}
답변: ${answer}

평가 기준:
1. 정확성: 답변이 질문에 정확히 대답하는가?
2. 완성도: 답변이 충분히 상세한가?
3. 도움 정도: 질문자에게 실질적 도움이 되는가?
4. 명확성: 답변이 이해하기 쉬운가?
5. 전문성: 전문적 지식이 반영되었는가?

응답 형식 (JSON):
{
  "score": 0.85,
  "evaluation": {
    "accuracy": 0.9,
    "completeness": 0.8,
    "helpfulness": 0.9,
    "clarity": 0.8,
    "expertise": 0.7
  },
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선점1", "개선점2"],
  "summary": "전체 평가 요약"
}
`

      const data = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '당신은 답변 품질을 평가하는 AI 전문가입니다. 한국 생활 관련 질문과 답변의 품질을 객관적으로 평가해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      }

      const response = await this.makeRequest('/chat/completions', data)
      const result = response.choices[0]?.message?.content

      if (result) {
        try {
          const parsed = JSON.parse(result)
          console.log('🤖 답변 평가 완료:', parsed)
          return parsed
        } catch (parseError) {
          console.error('🤖 AI 응답 파싱 실패:', parseError)
          return null
        }
      }

      return null
    } catch (error) {
      console.error('🤖 답변 평가 실패:', error)
      return null
    }
  }

  // 관련 질문 추천
  async recommendSimilarQuestions(title, content, existingQuestions = []) {
    try {
      const prompt = `
다음 질문과 유사한 질문들을 기존 질문 목록에서 찾아 추천해주세요.

현재 질문:
제목: ${title}
내용: ${content}

기존 질문들:
${existingQuestions.map((q, index) =>
  `${index + 1}. [${q.category}] ${q.title}`
).join('\n')}

응답 형식 (JSON):
{
  "recommendations": [
    {
      "index": 1,
      "title": "질문 제목",
      "similarity": 0.8,
      "reason": "유사한 이유"
    }
  ]
}
`

      const data = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '당신은 질문 추천 시스템입니다. 유사한 질문들을 찾아 사용자에게 도움이 될 만한 질문들을 추천해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 500
      }

      const response = await this.makeRequest('/chat/completions', data)
      const result = response.choices[0]?.message?.content

      if (result) {
        try {
          const parsed = JSON.parse(result)
          console.log('🤖 관련 질문 추천 완료:', parsed)
          return parsed.recommendations || []
        } catch (parseError) {
          console.error('🤖 AI 응답 파싱 실패:', parseError)
          return []
        }
      }

      return []
    } catch (error) {
      console.error('🤖 관련 질문 추천 실패:', error)
      return []
    }
  }

  // 자동 답변 생성 (전문가 승인 필요)
  async generateAutoAnswer(title, content, category) {
    try {
      const prompt = `
다음 질문에 대해 도움이 될 만한 답변을 생성해주세요.
이 답변은 전문가 검토 후 게시되며, 정확하고 실용적인 정보를 제공해야 합니다.

제목: ${title}
내용: ${content}
카테고리: ${category}

답변 작성 가이드라인:
1. 정확한 정보만 제공
2. 단계별로 명확하게 설명
3. 필요한 경우 주의사항 명시
4. 추가 도움을 받을 수 있는 기관이나 연락처 안내
5. 한국의 최신 법령과 정책 반영

응답 형식 (JSON):
{
  "answer": "상세한 답변 내용",
  "confidence": 0.8,
  "sources": ["정보 출처1", "정보 출처2"],
  "warnings": ["주의사항1", "주의사항2"],
  "relatedResources": [
    {
      "name": "기관명 또는 웹사이트",
      "url": "링크",
      "description": "설명"
    }
  ]
}
`

      const data = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '당신은 한국 거주 외국인을 위한 전문 상담사입니다. 정확하고 도움이 되는 답변을 제공하되, 법적 조언이 필요한 경우 전문가 상담을 권하세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1200
      }

      const response = await this.makeRequest('/chat/completions', data)
      const result = response.choices[0]?.message?.content

      if (result) {
        try {
          const parsed = JSON.parse(result)
          console.log('🤖 자동 답변 생성 완료:', parsed)
          return parsed
        } catch (parseError) {
          console.error('🤖 AI 응답 파싱 실패:', parseError)
          return null
        }
      }

      return null
    } catch (error) {
      console.error('🤖 자동 답변 생성 실패:', error)
      return null
    }
  }

  // 텍스트 요약
  async summarizeText(text, maxLength = 100) {
    try {
      const prompt = `
다음 텍스트를 ${maxLength}자 이내로 요약해주세요:

${text}

요약은 핵심 내용을 포함하되 간결해야 합니다.
`

      const data = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '당신은 텍스트 요약 전문가입니다. 핵심 내용을 놓치지 않으면서 간결하게 요약해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: Math.min(Math.floor(maxLength * 1.5), 200)
      }

      const response = await this.makeRequest('/chat/completions', data)
      const result = response.choices[0]?.message?.content

      return result?.trim() || text.substring(0, maxLength) + '...'
    } catch (error) {
      console.error('🤖 텍스트 요약 실패:', error)
      return text.substring(0, maxLength) + '...'
    }
  }

  // 언어 감지 및 번역
  async detectAndTranslate(text, targetLanguage = 'ko') {
    try {
      const prompt = `
다음 텍스트의 언어를 감지하고 ${targetLanguage === 'ko' ? '한국어' : '베트남어'}로 번역해주세요:

"${text}"

응답 형식 (JSON):
{
  "detectedLanguage": "언어코드",
  "confidence": 0.95,
  "translation": "번역된 텍스트",
  "originalText": "${text}"
}
`

      const data = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '당신은 언어 감지 및 번역 전문가입니다. 한국어와 베트남어 간의 정확한 번역을 제공해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }

      const response = await this.makeRequest('/chat/completions', data)
      const result = response.choices[0]?.message?.content

      if (result) {
        try {
          const parsed = JSON.parse(result)
          console.log('🤖 언어 감지 및 번역 완료:', parsed)
          return parsed
        } catch (parseError) {
          console.error('🤖 AI 응답 파싱 실패:', parseError)
          return null
        }
      }

      return null
    } catch (error) {
      console.error('🤖 언어 감지 및 번역 실패:', error)
      return null
    }
  }

  // 캐시 관리
  clearCache() {
    this.cache.clear()
    console.log('🗄️ AI 캐시 정리 완료')
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: 100,
      timeout: this.cacheTimeout
    }
  }

  // 서비스 상태 확인
  getStatus() {
    return {
      enabled: this.isEnabled,
      hasApiKey: !!this.apiKey,
      model: this.model,
      cacheSize: this.cache.size,
      queueSize: this.requestQueue.length
    }
  }
}

// 싱글톤 인스턴스 생성
const aiService = new AIService()

export default aiService
export { AIService }
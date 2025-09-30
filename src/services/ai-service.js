// AI 서비스 - 질문 분류, 답변 추천, 번역 등
class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseURL = 'https://api.openai.com/v1';
    this.model = 'gpt-3.5-turbo';
    this.isEnabled = !!this.apiKey;
    this.requestQueue = [];
    this.isProcessing = false;
    this.rateLimitDelay = 1000; // 1초 간격

    this.init();
  }

  async init() {
    if (!this.isEnabled) {
      console.warn('⚠️ OpenAI API 키가 설정되지 않음. AI 기능이 비활성화됩니다.');
      return;
    }

    console.log('🤖 AI 서비스 초기화됨');
  }

  // === 질문 분류 AI ===

  async classifyQuestion(title, content) {
    if (!this.isEnabled) {
      return this.getFallbackClassification(title, content);
    }

    const prompt = `
베트남인 한국 거주자를 위한 Q&A 플랫폼의 질문을 분류해주세요.

질문 제목: "${title}"
질문 내용: "${content}"

다음 카테고리 중 하나로 분류하고, 관련 태그와 우선순위를 제공해주세요:

카테고리:
- Visa/Legal: 비자, 법률, 행정 관련
- Life: 일상생활, 문화, 쇼핑 관련
- Education: 교육, 언어학습, 시험 관련
- Employment: 취업, 직업, 노동 관련
- Housing: 주거, 부동산, 계약 관련
- Healthcare: 건강, 의료, 보험 관련
- General: 기타

응답 형식 (JSON):
{
  "category": "카테고리명",
  "confidence": 0.85,
  "tags": ["태그1", "태그2", "태그3"],
  "priority": "high|medium|low",
  "reason": "분류 이유",
  "suggestedExperts": ["전문가 유형1", "전문가 유형2"],
  "estimatedDifficulty": "beginner|intermediate|advanced"
}
`;

    try {
      const response = await this.makeAPIRequest([
        { role: 'system', content: '당신은 한국 거주 베트남인을 위한 질문 분류 전문가입니다.' },
        { role: 'user', content: prompt }
      ]);

      const result = JSON.parse(response);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error('질문 분류 AI 오류:', error);
      return this.getFallbackClassification(title, content);
    }
  }

  getFallbackClassification(title, content) {
    const text = (title + ' ' + content).toLowerCase();

    // 키워드 기반 간단한 분류
    const categories = {
      'Visa/Legal': ['비자', '법률', '체류', '영주권', 'f-2', 'f-5', '귀화', '행정사', '변호사'],
      'Life': ['생활', '문화', '음식', '쇼핑', '교통', '은행', '핸드폰'],
      'Education': ['교육', '학교', '대학', 'topik', '한국어', '공부', '시험'],
      'Employment': ['취업', '일자리', '직장', '면접', '이력서', '회사', '급여'],
      'Housing': ['집', '주거', '전세', '월세', '부동산', '계약', '이사'],
      'Healthcare': ['병원', '의료', '건강보험', '치료', '약국', '의사']
    };

    let bestCategory = 'General';
    let maxScore = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (text.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    return {
      success: true,
      category: bestCategory,
      confidence: maxScore > 0 ? 0.7 : 0.3,
      tags: [],
      priority: 'medium',
      reason: '키워드 기반 분류',
      suggestedExperts: [],
      estimatedDifficulty: 'intermediate'
    };
  }

  // === 답변 품질 분석 ===

  async analyzeAnswerQuality(answer, questionContext) {
    if (!this.isEnabled) {
      return this.getFallbackQualityAnalysis(answer);
    }

    const prompt = `
다음 답변의 품질을 분석해주세요:

질문 맥락: "${questionContext}"
답변 내용: "${answer}"

다음 기준으로 분석해주세요:
1. 정확성 (0-100)
2. 완성도 (0-100)
3. 도움 정도 (0-100)
4. 명확성 (0-100)

응답 형식 (JSON):
{
  "overallScore": 85,
  "accuracy": 90,
  "completeness": 80,
  "helpfulness": 85,
  "clarity": 90,
  "strengths": ["구체적인 예시", "단계별 설명"],
  "improvements": ["더 많은 정보 필요", "출처 제공"],
  "isRecommended": true,
  "expertReviewNeeded": false
}
`;

    try {
      const response = await this.makeAPIRequest([
        { role: 'system', content: '당신은 답변 품질 분석 전문가입니다.' },
        { role: 'user', content: prompt }
      ]);

      return {
        success: true,
        ...JSON.parse(response)
      };
    } catch (error) {
      console.error('답변 품질 분석 오류:', error);
      return this.getFallbackQualityAnalysis(answer);
    }
  }

  getFallbackQualityAnalysis(answer) {
    const length = answer.length;
    const hasExamples = /예시|예를 들어|예:|사례/.test(answer);
    const hasSteps = /첫째|둘째|1\.|2\.|단계/.test(answer);
    const hasUrls = /http|www\./.test(answer);

    let score = 50;
    if (length > 100) score += 10;
    if (length > 300) score += 10;
    if (hasExamples) score += 15;
    if (hasSteps) score += 15;
    if (hasUrls) score += 10;

    return {
      success: true,
      overallScore: Math.min(score, 100),
      accuracy: score,
      completeness: score,
      helpfulness: score,
      clarity: score,
      strengths: [],
      improvements: [],
      isRecommended: score > 60,
      expertReviewNeeded: score < 40
    };
  }

  // === 답변 추천 AI ===

  async generateAnswerSuggestions(questionTitle, questionContent, category) {
    if (!this.isEnabled) {
      return this.getFallbackSuggestions(category);
    }

    const prompt = `
한국 거주 베트남인의 다음 질문에 대한 답변 제안을 만들어주세요:

카테고리: ${category}
제목: "${questionTitle}"
내용: "${questionContent}"

3가지 다른 관점의 답변 초안을 제공해주세요:
1. 기본적인 정보 제공
2. 실무적인 팁과 경험
3. 추가 리소스와 연락처

각 답변은 200-300자 내외로 작성해주세요.

응답 형식 (JSON):
{
  "suggestions": [
    {
      "type": "basic_info",
      "title": "기본 정보",
      "content": "답변 내용...",
      "confidence": 0.8
    },
    {
      "type": "practical_tips",
      "title": "실무 팁",
      "content": "답변 내용...",
      "confidence": 0.7
    },
    {
      "type": "resources",
      "title": "추가 자료",
      "content": "답변 내용...",
      "confidence": 0.6
    }
  ],
  "relatedQuestions": ["관련 질문1", "관련 질문2"],
  "expertConsultationNeeded": false
}
`;

    try {
      const response = await this.makeAPIRequest([
        { role: 'system', content: '당신은 한국 거주 베트남인을 위한 답변 작성 도우미입니다.' },
        { role: 'user', content: prompt }
      ]);

      return {
        success: true,
        ...JSON.parse(response)
      };
    } catch (error) {
      console.error('답변 추천 생성 오류:', error);
      return this.getFallbackSuggestions(category);
    }
  }

  getFallbackSuggestions(category) {
    const suggestions = {
      'Visa/Legal': [
        {
          type: 'basic_info',
          title: '기본 정보',
          content: '관련 법령과 절차를 확인하시고, 필요 서류를 준비하시기 바랍니다. 출입국사무소나 관련 기관에 문의하시면 정확한 정보를 얻을 수 있습니다.',
          confidence: 0.7
        }
      ],
      'Life': [
        {
          type: 'practical_tips',
          title: '생활 팁',
          content: '한국 생활에서 비슷한 경험을 가진 베트남 커뮤니티에 문의해보시면 실용적인 조언을 얻을 수 있습니다.',
          confidence: 0.6
        }
      ]
    };

    return {
      success: true,
      suggestions: suggestions[category] || suggestions['Life'],
      relatedQuestions: [],
      expertConsultationNeeded: true
    };
  }

  // === 실시간 번역 ===

  async translateText(text, targetLanguage = 'ko') {
    if (!this.isEnabled) {
      return this.getFallbackTranslation(text, targetLanguage);
    }

    const languageMap = {
      'ko': '한국어',
      'vi': '베트남어',
      'en': '영어'
    };

    const prompt = `다음 텍스트를 ${languageMap[targetLanguage]}로 자연스럽게 번역해주세요:

"${text}"

번역 시 주의사항:
- 문화적 맥락 고려
- 자연스러운 표현 사용
- 전문용어는 원문 병기

응답 형식 (JSON):
{
  "translatedText": "번역된 텍스트",
  "confidence": 0.9,
  "alternativeTranslations": ["대안 번역1", "대안 번역2"],
  "detectedLanguage": "감지된 원문 언어"
}`;

    try {
      const response = await this.makeAPIRequest([
        { role: 'system', content: '당신은 한국어-베트남어 전문 번역가입니다.' },
        { role: 'user', content: prompt }
      ]);

      return {
        success: true,
        ...JSON.parse(response)
      };
    } catch (error) {
      console.error('번역 오류:', error);
      return this.getFallbackTranslation(text, targetLanguage);
    }
  }

  getFallbackTranslation(text, targetLanguage) {
    // 간단한 폴백 번역 (실제로는 Google Translate API 등 사용)
    return {
      success: false,
      translatedText: text,
      confidence: 0.1,
      alternativeTranslations: [],
      detectedLanguage: 'unknown',
      error: 'AI 번역을 사용할 수 없습니다. 온라인 번역기를 이용해주세요.'
    };
  }

  // === 스마트 검색 ===

  async enhanceSearchQuery(query, context = {}) {
    if (!this.isEnabled) {
      return this.getFallbackSearchEnhancement(query);
    }

    const prompt = `
사용자의 검색 쿼리를 개선하여 더 나은 검색 결과를 얻을 수 있도록 도와주세요.

원본 쿼리: "${query}"
검색 맥락: ${JSON.stringify(context)}

개선사항:
1. 동의어 추가
2. 관련 키워드 제안
3. 검색 의도 파악
4. 카테고리 추천

응답 형식 (JSON):
{
  "enhancedQuery": "개선된 검색어",
  "synonyms": ["동의어1", "동의어2"],
  "relatedKeywords": ["관련어1", "관련어2"],
  "searchIntent": "정보 찾기|문제 해결|경험 공유",
  "suggestedCategories": ["카테고리1", "카테고리2"],
  "filters": {
    "category": "추천 카테고리",
    "timeRange": "recent|all",
    "contentType": "question|answer|all"
  }
}`;

    try {
      const response = await this.makeAPIRequest([
        { role: 'system', content: '당신은 검색 최적화 전문가입니다.' },
        { role: 'user', content: prompt }
      ]);

      return {
        success: true,
        ...JSON.parse(response)
      };
    } catch (error) {
      console.error('검색 쿼리 개선 오류:', error);
      return this.getFallbackSearchEnhancement(query);
    }
  }

  getFallbackSearchEnhancement(query) {
    return {
      success: true,
      enhancedQuery: query,
      synonyms: [],
      relatedKeywords: [],
      searchIntent: '정보 찾기',
      suggestedCategories: ['General'],
      filters: {
        category: null,
        timeRange: 'all',
        contentType: 'all'
      }
    };
  }

  // === 감정 분석 ===

  async analyzeSentiment(text) {
    if (!this.isEnabled) {
      return this.getFallbackSentiment(text);
    }

    const prompt = `
다음 텍스트의 감정을 분석해주세요:

"${text}"

응답 형식 (JSON):
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.85,
  "emotions": {
    "joy": 0.2,
    "sadness": 0.1,
    "anger": 0.0,
    "fear": 0.3,
    "surprise": 0.1
  },
  "urgency": "low|medium|high",
  "supportNeeded": true
}`;

    try {
      const response = await this.makeAPIRequest([
        { role: 'system', content: '당신은 감정 분석 전문가입니다.' },
        { role: 'user', content: prompt }
      ]);

      return {
        success: true,
        ...JSON.parse(response)
      };
    } catch (error) {
      console.error('감정 분석 오류:', error);
      return this.getFallbackSentiment(text);
    }
  }

  getFallbackSentiment(text) {
    const negativeWords = ['문제', '어려움', '힘들', '걱정', '급해'];
    const positiveWords = ['감사', '좋은', '만족', '기쁜', '도움'];

    const negCount = negativeWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    const posCount = positiveWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);

    let sentiment = 'neutral';
    if (posCount > negCount) sentiment = 'positive';
    else if (negCount > posCount) sentiment = 'negative';

    return {
      success: true,
      sentiment,
      confidence: 0.6,
      emotions: { joy: 0.2, sadness: 0.2, anger: 0.2, fear: 0.2, surprise: 0.2 },
      urgency: negCount > 1 ? 'high' : 'medium',
      supportNeeded: negCount > 0
    };
  }

  // === API 요청 관리 ===

  async makeAPIRequest(messages, options = {}) {
    if (!this.isEnabled) {
      throw new Error('AI 서비스가 비활성화되어 있습니다.');
    }

    // 요청 큐에 추가
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        messages,
        options,
        resolve,
        reject
      });

      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();

      try {
        const result = await this.executeAPIRequest(request.messages, request.options);
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }

      // 레이트 리미트 준수
      await this.delay(this.rateLimitDelay);
    }

    this.isProcessing = false;
  }

  async executeAPIRequest(messages, options = {}) {
    const requestBody = {
      model: options.model || this.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      ...options
    };

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === 유틸리티 메서드 ===

  isAvailable() {
    return this.isEnabled;
  }

  getQueueStatus() {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing
    };
  }

  // === 배치 처리 ===

  async batchProcess(requests, batchSize = 3) {
    const results = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(request =>
        this.makeAPIRequest(request.messages, request.options)
          .catch(error => ({ error: error.message }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // 배치 간 딜레이
      if (i + batchSize < requests.length) {
        await this.delay(this.rateLimitDelay * batchSize);
      }
    }

    return results;
  }
}

// 싱글톤 인스턴스 생성
export const aiService = new AIService();

// 전역에서 접근 가능하도록 설정 (디버깅용)
if (typeof window !== 'undefined') {
  window.aiService = aiService;
}

export default AIService;
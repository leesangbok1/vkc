// 스마트 검색 서비스 - AI 기반 검색 최적화
import { aiService } from './ai-service.js';
import { isFirebaseConnected } from '../config/firebase-config.js';
import {
  ref,
  get,
  query,
  orderByChild,
  startAt,
  endAt,
  limitToFirst
} from 'firebase/database';
import { database } from '../config/firebase-config.js';

class SmartSearchService {
  constructor() {
    this.searchHistory = new Map();
    this.popularSearches = new Map();
    this.searchCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5분
    this.maxCacheSize = 100;
    this.searchAnalytics = {
      totalSearches: 0,
      uniqueQueries: 0,
      avgResultsPerSearch: 0
    };

    this.init();
  }

  async init() {
    // 검색 히스토리 로드
    this.loadSearchHistory();

    // 인기 검색어 로드
    this.loadPopularSearches();

    console.log('🔍 스마트 검색 서비스 초기화됨');
  }

  // === 메인 검색 함수 ===

  async smartSearch(query, options = {}) {
    const searchId = this.generateSearchId();
    const startTime = Date.now();

    try {
      // 검색 쿼리 전처리
      const processedQuery = await this.preprocessQuery(query, options);

      // 캐시 확인
      const cacheKey = this.getCacheKey(processedQuery, options);
      const cachedResults = this.getFromCache(cacheKey);

      if (cachedResults) {
        console.log('📦 캐시에서 검색 결과 반환');
        this.recordSearch(query, cachedResults.length, Date.now() - startTime, true);
        return cachedResults;
      }

      // AI 기반 쿼리 개선
      const enhancedQuery = await this.enhanceQuery(processedQuery, options);

      // 다중 검색 실행
      const results = await this.executeMultiSearch(enhancedQuery, options);

      // 결과 후처리 및 랭킹
      const rankedResults = await this.rankResults(results, processedQuery, options);

      // 캐시에 저장
      this.saveToCache(cacheKey, rankedResults);

      // 검색 기록 저장
      this.recordSearch(query, rankedResults.length, Date.now() - startTime, false);

      return rankedResults;

    } catch (error) {
      console.error('스마트 검색 오류:', error);

      // 폴백: 기본 검색
      return this.fallbackSearch(query, options);
    }
  }

  // === 쿼리 전처리 ===

  async preprocessQuery(query, options) {
    // 공백 정리 및 소문자 변환
    let processed = query.trim().toLowerCase();

    // 특수 문자 처리
    processed = processed.replace(/[^\w\s가-힣]/g, ' ');

    // 연속 공백 제거
    processed = processed.replace(/\s+/g, ' ');

    // 불용어 제거 (선택적)
    if (options.removeStopWords) {
      const stopWords = ['은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로'];
      const words = processed.split(' ');
      processed = words.filter(word => !stopWords.includes(word)).join(' ');
    }

    // 동의어 확장
    if (options.expandSynonyms) {
      processed = await this.expandSynonyms(processed);
    }

    return processed;
  }

  async expandSynonyms(query) {
    const synonymMap = {
      '비자': ['체류허가', '거류허가', 'visa'],
      '일자리': ['취업', '직업', '구인'],
      '집': ['주택', '주거', '거주지'],
      '병원': ['의료기관', '클리닉', '진료소'],
      '학교': ['교육기관', '대학', '학원']
    };

    let expanded = query;
    for (const [original, synonyms] of Object.entries(synonymMap)) {
      if (expanded.includes(original)) {
        synonyms.forEach(synonym => {
          if (!expanded.includes(synonym)) {
            expanded += ` ${synonym}`;
          }
        });
      }
    }

    return expanded;
  }

  // === AI 기반 쿼리 개선 ===

  async enhanceQuery(query, options) {
    if (!aiService.isAvailable()) {
      return {
        originalQuery: query,
        enhancedQuery: query,
        searchTerms: query.split(' '),
        categories: [],
        intent: 'general'
      };
    }

    try {
      const enhancement = await aiService.enhanceSearchQuery(query, {
        userContext: options.userContext,
        searchHistory: this.getRecentSearches(5),
        preferredLanguage: options.language || 'ko'
      });

      if (enhancement.success) {
        return {
          originalQuery: query,
          enhancedQuery: enhancement.enhancedQuery,
          searchTerms: [query, ...enhancement.synonyms, ...enhancement.relatedKeywords],
          categories: enhancement.suggestedCategories,
          intent: enhancement.searchIntent,
          filters: enhancement.filters
        };
      }
    } catch (error) {
      console.warn('AI 쿼리 개선 실패:', error);
    }

    // 폴백: 기본 개선
    return this.basicQueryEnhancement(query);
  }

  basicQueryEnhancement(query) {
    const words = query.split(' ');
    const categories = this.inferCategories(query);

    return {
      originalQuery: query,
      enhancedQuery: query,
      searchTerms: words,
      categories,
      intent: 'general',
      filters: {}
    };
  }

  inferCategories(query) {
    const categoryKeywords = {
      'Visa/Legal': ['비자', '법률', '체류', '영주권', '귀화', '행정사'],
      'Life': ['생활', '문화', '음식', '쇼핑', '교통'],
      'Education': ['교육', '학교', 'topik', '한국어', '공부'],
      'Employment': ['취업', '일자리', '직장', '면접'],
      'Housing': ['집', '주거', '전세', '월세', '부동산'],
      'Healthcare': ['병원', '의료', '건강보험', '치료']
    };

    const inferredCategories = [];
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        inferredCategories.push(category);
      }
    }

    return inferredCategories.length > 0 ? inferredCategories : ['General'];
  }

  // === 다중 검색 실행 ===

  async executeMultiSearch(enhancedQuery, options) {
    const searchPromises = [
      this.searchQuestions(enhancedQuery, options),
      this.searchAnswers(enhancedQuery, options),
      this.searchUsers(enhancedQuery, options)
    ];

    // 외부 검색 (선택적)
    if (options.includeExternal) {
      searchPromises.push(this.searchExternal(enhancedQuery, options));
    }

    const results = await Promise.allSettled(searchPromises);

    return {
      questions: results[0].status === 'fulfilled' ? results[0].value : [],
      answers: results[1].status === 'fulfilled' ? results[1].value : [],
      users: results[2].status === 'fulfilled' ? results[2].value : [],
      external: results[3]?.status === 'fulfilled' ? results[3].value : []
    };
  }

  async searchQuestions(enhancedQuery, options) {
    if (!isFirebaseConnected()) {
      return this.mockQuestionSearch(enhancedQuery);
    }

    try {
      const questionsRef = ref(database, 'questions');
      let searchQuery = questionsRef;

      // 카테고리 필터링
      if (enhancedQuery.categories.length > 0) {
        const category = enhancedQuery.categories[0];
        searchQuery = query(questionsRef, orderByChild('category'), startAt(category), endAt(category));
      }

      if (options.limit) {
        searchQuery = query(searchQuery, limitToFirst(options.limit));
      }

      const snapshot = await get(searchQuery);
      const data = snapshot.val();

      if (!data) return [];

      const questions = Object.keys(data).map(key => ({
        id: key,
        type: 'question',
        ...data[key]
      }));

      // 텍스트 매칭 필터링
      return this.filterByTextMatch(questions, enhancedQuery.searchTerms, ['title', 'content']);
    } catch (error) {
      console.error('질문 검색 오류:', error);
      return [];
    }
  }

  async searchAnswers(enhancedQuery, options) {
    if (!isFirebaseConnected()) {
      return [];
    }

    try {
      const answersRef = ref(database, 'answers');
      const snapshot = await get(answersRef);
      const data = snapshot.val();

      if (!data) return [];

      const answers = [];
      Object.keys(data).forEach(questionId => {
        const questionAnswers = data[questionId];
        Object.keys(questionAnswers).forEach(answerId => {
          answers.push({
            id: answerId,
            questionId,
            type: 'answer',
            ...questionAnswers[answerId]
          });
        });
      });

      return this.filterByTextMatch(answers, enhancedQuery.searchTerms, ['content']);
    } catch (error) {
      console.error('답변 검색 오류:', error);
      return [];
    }
  }

  async searchUsers(enhancedQuery, options) {
    // 사용자 검색은 개인정보 보호로 제한적으로 구현
    return [];
  }

  async searchExternal(enhancedQuery, options) {
    // 외부 검색 API 연동 (예: 정부 사이트, 공식 문서)
    // 현재는 미구현
    return [];
  }

  // === 텍스트 매칭 ===

  filterByTextMatch(items, searchTerms, fields) {
    return items.filter(item => {
      return searchTerms.some(term => {
        return fields.some(field => {
          const fieldValue = item[field];
          return fieldValue && fieldValue.toLowerCase().includes(term.toLowerCase());
        });
      });
    }).map(item => ({
      ...item,
      matchScore: this.calculateMatchScore(item, searchTerms, fields)
    }));
  }

  calculateMatchScore(item, searchTerms, fields) {
    let score = 0;
    const totalTerms = searchTerms.length;

    searchTerms.forEach(term => {
      fields.forEach(field => {
        const fieldValue = item[field];
        if (fieldValue && fieldValue.toLowerCase().includes(term.toLowerCase())) {
          // 정확한 매치에 더 높은 점수
          const exactMatch = fieldValue.toLowerCase() === term.toLowerCase();
          score += exactMatch ? 10 : 5;

          // 제목 필드에 더 높은 가중치
          if (field === 'title') {
            score += 3;
          }
        }
      });
    });

    return score / totalTerms;
  }

  // === 결과 랭킹 ===

  async rankResults(results, processedQuery, options) {
    const allResults = [
      ...results.questions,
      ...results.answers,
      ...results.users,
      ...results.external
    ];

    // 점수 기반 정렬
    allResults.sort((a, b) => {
      // 기본 매치 점수
      let scoreA = a.matchScore || 0;
      let scoreB = b.matchScore || 0;

      // 타입별 가중치
      const typeWeights = {
        question: 1.0,
        answer: 0.8,
        user: 0.3,
        external: 0.5
      };

      scoreA *= typeWeights[a.type] || 1;
      scoreB *= typeWeights[b.type] || 1;

      // 인기도 점수 추가
      if (a.likes) scoreA += a.likes * 0.1;
      if (b.likes) scoreB += b.likes * 0.1;

      // 최신성 점수 추가
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      if (a.createdAt) {
        const ageA = (now - a.createdAt) / dayMs;
        scoreA += Math.max(0, 5 - ageA * 0.1);
      }

      if (b.createdAt) {
        const ageB = (now - b.createdAt) / dayMs;
        scoreB += Math.max(0, 5 - ageB * 0.1);
      }

      return scoreB - scoreA;
    });

    // 결과 수 제한
    const maxResults = options.maxResults || 50;
    return allResults.slice(0, maxResults);
  }

  // === 폴백 검색 ===

  mockQuestionSearch(enhancedQuery) {
    // 목 데이터에서 검색
    const mockQuestions = [
      {
        id: 'q1',
        type: 'question',
        title: 'F-2-R 비자 신청 방법',
        content: 'F-2-R 비자 신청에 필요한 서류와 절차가 궁금합니다',
        category: 'Visa/Legal',
        matchScore: 8
      },
      {
        id: 'q2',
        type: 'question',
        title: '한국 생활 팁',
        content: '한국에서 생활하면서 알아두면 좋은 팁들을 공유해주세요',
        category: 'Life',
        matchScore: 6
      }
    ];

    return this.filterByTextMatch(mockQuestions, enhancedQuery.searchTerms, ['title', 'content']);
  }

  fallbackSearch(query, options) {
    console.log('📋 기본 검색 모드로 전환');

    const words = query.toLowerCase().split(' ');
    return this.mockQuestionSearch({
      searchTerms: words,
      categories: ['General']
    });
  }

  // === 캐시 관리 ===

  getCacheKey(query, options) {
    const keyData = {
      query: JSON.stringify(query),
      category: options.category || 'all',
      sortBy: options.sortBy || 'relevance',
      limit: options.limit || 50
    };
    return btoa(JSON.stringify(keyData));
  }

  getFromCache(key) {
    const cached = this.searchCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.results;
    }
    this.searchCache.delete(key);
    return null;
  }

  saveToCache(key, results) {
    // 캐시 크기 제한
    if (this.searchCache.size >= this.maxCacheSize) {
      const oldestKey = this.searchCache.keys().next().value;
      this.searchCache.delete(oldestKey);
    }

    this.searchCache.set(key, {
      results,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.searchCache.clear();
    console.log('🗑️ 검색 캐시 정리됨');
  }

  // === 검색 기록 관리 ===

  recordSearch(query, resultCount, duration, fromCache) {
    const searchRecord = {
      query,
      resultCount,
      duration,
      fromCache,
      timestamp: Date.now()
    };

    // 검색 히스토리 저장
    this.searchHistory.set(Date.now().toString(), searchRecord);

    // 인기 검색어 업데이트
    const normalizedQuery = query.toLowerCase().trim();
    const currentCount = this.popularSearches.get(normalizedQuery) || 0;
    this.popularSearches.set(normalizedQuery, currentCount + 1);

    // 분석 데이터 업데이트
    this.searchAnalytics.totalSearches++;
    if (!this.hasSearchedBefore(normalizedQuery)) {
      this.searchAnalytics.uniqueQueries++;
    }

    // 히스토리 크기 제한 (최근 1000개)
    if (this.searchHistory.size > 1000) {
      const oldestKey = this.searchHistory.keys().next().value;
      this.searchHistory.delete(oldestKey);
    }

    // 로컬 스토리지에 저장
    this.saveSearchHistory();
  }

  hasSearchedBefore(query) {
    return Array.from(this.searchHistory.values()).some(record =>
      record.query.toLowerCase().trim() === query
    );
  }

  getRecentSearches(count = 10) {
    const searches = Array.from(this.searchHistory.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
    return searches.map(s => s.query);
  }

  getPopularSearches(count = 10) {
    return Array.from(this.popularSearches.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([query, count]) => ({ query, count }));
  }

  // === 자동완성 ===

  async getAutoCompletions(partialQuery, maxSuggestions = 5) {
    const suggestions = new Set();

    // 검색 히스토리에서 매칭
    this.searchHistory.forEach(record => {
      if (record.query.toLowerCase().startsWith(partialQuery.toLowerCase())) {
        suggestions.add(record.query);
      }
    });

    // 인기 검색어에서 매칭
    this.popularSearches.forEach((count, query) => {
      if (query.toLowerCase().includes(partialQuery.toLowerCase())) {
        suggestions.add(query);
      }
    });

    // AI 기반 제안 (선택적)
    if (aiService.isAvailable() && partialQuery.length > 2) {
      try {
        const aiSuggestions = await this.getAISuggestions(partialQuery);
        aiSuggestions.forEach(s => suggestions.add(s));
      } catch (error) {
        console.warn('AI 자동완성 실패:', error);
      }
    }

    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  async getAISuggestions(partialQuery) {
    // AI 서비스를 통한 검색어 제안
    // 현재는 기본 제안 반환
    return [
      `${partialQuery} 방법`,
      `${partialQuery} 절차`,
      `${partialQuery} 조건`,
      `${partialQuery} 경험`
    ];
  }

  // === 데이터 저장/로드 ===

  saveSearchHistory() {
    try {
      const historyData = {
        history: Array.from(this.searchHistory.entries()),
        popular: Array.from(this.popularSearches.entries()),
        analytics: this.searchAnalytics
      };
      localStorage.setItem('smart_search_data', JSON.stringify(historyData));
    } catch (error) {
      console.warn('검색 히스토리 저장 실패:', error);
    }
  }

  loadSearchHistory() {
    try {
      const saved = localStorage.getItem('smart_search_data');
      if (saved) {
        const data = JSON.parse(saved);
        this.searchHistory = new Map(data.history || []);
        this.popularSearches = new Map(data.popular || []);
        this.searchAnalytics = { ...this.searchAnalytics, ...data.analytics };
      }
    } catch (error) {
      console.warn('검색 히스토리 로드 실패:', error);
    }
  }

  loadPopularSearches() {
    // 초기 인기 검색어 설정
    const defaultPopular = [
      '비자 연장', 'F-2-R 비자', '운전면허', 'TOPIK 시험',
      '전세 계약', '건강보험', '취업', '한국어 공부'
    ];

    defaultPopular.forEach(query => {
      if (!this.popularSearches.has(query)) {
        this.popularSearches.set(query, 1);
      }
    });
  }

  // === 유틸리티 ===

  generateSearchId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getSearchAnalytics() {
    return {
      ...this.searchAnalytics,
      cacheHitRate: this.calculateCacheHitRate(),
      popularSearches: this.getPopularSearches(5),
      recentSearches: this.getRecentSearches(5)
    };
  }

  calculateCacheHitRate() {
    const recentSearches = Array.from(this.searchHistory.values()).slice(-100);
    const cacheHits = recentSearches.filter(s => s.fromCache).length;
    return recentSearches.length > 0 ? (cacheHits / recentSearches.length) * 100 : 0;
  }

  clearSearchHistory() {
    this.searchHistory.clear();
    this.popularSearches.clear();
    this.searchAnalytics = {
      totalSearches: 0,
      uniqueQueries: 0,
      avgResultsPerSearch: 0
    };
    localStorage.removeItem('smart_search_data');
    console.log('🗑️ 검색 히스토리 정리됨');
  }
}

// 싱글톤 인스턴스 생성
export const smartSearchService = new SmartSearchService();

// 전역에서 접근 가능하도록 설정 (디버깅용)
if (typeof window !== 'undefined') {
  window.smartSearchService = smartSearchService;
}

export default SmartSearchService;
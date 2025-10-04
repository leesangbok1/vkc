// Redis-like caching service (using memory cache as fallback)
class CacheService {
  private cache = new Map<string, { data: any, expireAt: number }>()
  private defaultTTL = 5 * 60 * 1000 // 5분 기본 TTL

  // 캐시 저장
  set(key: string, data: any, ttlMs?: number): void {
    const expireAt = Date.now() + (ttlMs || this.defaultTTL)
    this.cache.set(key, { data, expireAt })
  }

  // 캐시 조회
  get<T = any>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    if (Date.now() > item.expireAt) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  // 캐시 삭제
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // 패턴으로 캐시 삭제
  deletePattern(pattern: string): number {
    let deletedCount = 0
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deletedCount++
      }
    }

    return deletedCount
  }

  // 캐시 존재 여부 확인
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.expireAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // 만료된 캐시 정리
  cleanup(): number {
    let cleanedCount = 0
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireAt) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  // 캐시 크기 조회
  size(): number {
    return this.cache.size
  }

  // 캐시 전체 삭제
  clear(): void {
    this.cache.clear()
  }

  // 캐시 통계
  stats() {
    const now = Date.now()
    let validCount = 0
    let expiredCount = 0

    for (const item of this.cache.values()) {
      if (now > item.expireAt) {
        expiredCount++
      } else {
        validCount++
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      memoryUsage: this.getMemoryUsage()
    }
  }

  private getMemoryUsage(): string {
    try {
      // Node.js 환경에서의 메모리 사용량 추정
      const size = JSON.stringify(Array.from(this.cache.entries())).length
      return `~${Math.round(size / 1024)}KB`
    } catch {
      return 'unknown'
    }
  }
}

// 특화된 캐시 키 생성기
export class CacheKeyGenerator {
  static question(id: string): string {
    return `question:${id}`
  }

  static questionList(page: number, limit: number, category?: string, sort?: string): string {
    return `questions:page:${page}:limit:${limit}:cat:${category || 'all'}:sort:${sort || 'latest'}`
  }

  static userProfile(userId: string): string {
    return `user:${userId}`
  }

  static searchResults(query: string, type: string, page: number): string {
    return `search:${encodeURIComponent(query)}:${type}:${page}`
  }

  static categoryList(): string {
    return 'categories:all'
  }

  static siteStats(): string {
    return 'stats:site'
  }

  static userStats(userId: string): string {
    return `stats:user:${userId}`
  }

  static expertRecommendations(questionId: string): string {
    return `experts:${questionId}`
  }

  static notifications(userId: string, page: number): string {
    return `notifications:${userId}:${page}`
  }
}

// 베트남 Q&A 플랫폼 특화 캐시 매니저
export class VietnamQACacheManager {
  private cache: CacheService

  constructor() {
    this.cache = new CacheService()

    // 주기적으로 만료된 캐시 정리 (5분마다)
    setInterval(() => {
      const cleaned = this.cache.cleanup()
      if (cleaned > 0) {
        console.log(`Cleaned ${cleaned} expired cache entries`)
      }
    }, 5 * 60 * 1000)
  }

  // 질문 캐싱 (1시간)
  cacheQuestion(id: string, question: any): void {
    this.cache.set(CacheKeyGenerator.question(id), question, 60 * 60 * 1000)
  }

  getQuestion(id: string): any | null {
    return this.cache.get(CacheKeyGenerator.question(id))
  }

  // 질문 목록 캐싱 (5분)
  cacheQuestionList(page: number, limit: number, questions: any[], category?: string, sort?: string): void {
    const key = CacheKeyGenerator.questionList(page, limit, category, sort)
    this.cache.set(key, questions, 5 * 60 * 1000)
  }

  getQuestionList(page: number, limit: number, category?: string, sort?: string): any[] | null {
    const key = CacheKeyGenerator.questionList(page, limit, category, sort)
    return this.cache.get(key)
  }

  // 사용자 프로필 캐싱 (30분)
  cacheUserProfile(userId: string, profile: any): void {
    this.cache.set(CacheKeyGenerator.userProfile(userId), profile, 30 * 60 * 1000)
  }

  getUserProfile(userId: string): any | null {
    return this.cache.get(CacheKeyGenerator.userProfile(userId))
  }

  // 검색 결과 캐싱 (10분)
  cacheSearchResults(query: string, type: string, page: number, results: any): void {
    const key = CacheKeyGenerator.searchResults(query, type, page)
    this.cache.set(key, results, 10 * 60 * 1000)
  }

  getSearchResults(query: string, type: string, page: number): any | null {
    const key = CacheKeyGenerator.searchResults(query, type, page)
    return this.cache.get(key)
  }

  // 카테고리 목록 캐싱 (1시간)
  cacheCategories(categories: any[]): void {
    this.cache.set(CacheKeyGenerator.categoryList(), categories, 60 * 60 * 1000)
  }

  getCategories(): any[] | null {
    return this.cache.get(CacheKeyGenerator.categoryList())
  }

  // 사이트 통계 캐싱 (15분)
  cacheSiteStats(stats: any): void {
    this.cache.set(CacheKeyGenerator.siteStats(), stats, 15 * 60 * 1000)
  }

  getSiteStats(): any | null {
    return this.cache.get(CacheKeyGenerator.siteStats())
  }

  // 전문가 추천 캐싱 (1시간)
  cacheExpertRecommendations(questionId: string, recommendations: any): void {
    const key = CacheKeyGenerator.expertRecommendations(questionId)
    this.cache.set(key, recommendations, 60 * 60 * 1000)
  }

  getExpertRecommendations(questionId: string): any | null {
    const key = CacheKeyGenerator.expertRecommendations(questionId)
    return this.cache.get(key)
  }

  // 알림 캐싱 (5분)
  cacheNotifications(userId: string, page: number, notifications: any): void {
    const key = CacheKeyGenerator.notifications(userId, page)
    this.cache.set(key, notifications, 5 * 60 * 1000)
  }

  getNotifications(userId: string, page: number): any | null {
    const key = CacheKeyGenerator.notifications(userId, page)
    return this.cache.get(key)
  }

  // 캐시 무효화
  invalidateQuestion(id: string): void {
    this.cache.delete(CacheKeyGenerator.question(id))
    // 관련된 질문 목록 캐시도 무효화
    this.cache.deletePattern('questions:page:*')
  }

  invalidateUser(userId: string): void {
    this.cache.delete(CacheKeyGenerator.userProfile(userId))
    this.cache.delete(CacheKeyGenerator.userStats(userId))
    // 해당 사용자의 알림 캐시도 무효화
    this.cache.deletePattern(`notifications:${userId}:*`)
  }

  invalidateSearch(): void {
    this.cache.deletePattern('search:*')
  }

  invalidateCategories(): void {
    this.cache.delete(CacheKeyGenerator.categoryList())
  }

  invalidateStats(): void {
    this.cache.delete(CacheKeyGenerator.siteStats())
    this.cache.deletePattern('stats:user:*')
  }

  // 캐시 워밍업 (자주 사용되는 데이터 미리 로드)
  async warmup(supabase: any): Promise<void> {
    try {
      // 인기 카테고리 미리 로드
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('question_count', { ascending: false })

      if (categories) {
        this.cacheCategories(categories)
      }

      // 인기 질문 목록 미리 로드
      const { data: popularQuestions } = await supabase
        .from('questions')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(20)

      if (popularQuestions) {
        this.cacheQuestionList(1, 20, popularQuestions, undefined, 'popular')
      }

      console.log('Cache warmup completed')
    } catch (error) {
      console.error('Cache warmup failed:', error)
    }
  }

  // 캐시 상태 조회
  getStatus() {
    return this.cache.stats()
  }

  // 캐시 전체 초기화
  reset(): void {
    this.cache.clear()
  }
}

// 글로벌 캐시 인스턴스
export const cacheManager = new VietnamQACacheManager()

// 캐시 데코레이터 (함수 결과 캐싱)
export function withCache<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttlMs: number = 5 * 60 * 1000
): T {
  const cache = new CacheService()

  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args)

    // 캐시에서 조회
    const cached = cache.get(key)
    if (cached) {
      return cached
    }

    // 캐시 미스시 함수 실행
    const result = fn(...args)

    // Promise 처리
    if (result instanceof Promise) {
      return result.then(data => {
        cache.set(key, data, ttlMs)
        return data
      })
    } else {
      cache.set(key, result, ttlMs)
      return result
    }
  }) as T
}

export default cacheManager
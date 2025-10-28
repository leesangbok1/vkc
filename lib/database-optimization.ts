/**
 * 베트남 커뮤니티 특화 데이터베이스 성능 최적화 유틸리티
 */

import { Database } from '@/lib/supabase'

// 쿼리 성능 최적화 설정
export const QUERY_CONFIGS = {
  // 질문 목록 조회 최적화
  QUESTIONS_LIST: {
    select: `
      id, title, content, tags, status, urgency, vote_score, view_count, answer_count,
      created_at, updated_at, is_pinned, is_featured,
      author:users!author_id(id, name, avatar_url, trust_score, residence_years, badges),
      category:categories!category_id(id, name, slug, icon, color),
      _count:answers(count)
    `,
    limit: 20,
    cache_ttl: 5 * 60, // 5분 캐시
  },

  // 답변 목록 조회 최적화
  ANSWERS_LIST: {
    select: `
      id, content, is_accepted, helpful_count, vote_score, quality_score,
      expertise_match, response_time_hours, created_at, updated_at,
      author:users!author_id(id, name, avatar_url, trust_score, residence_years, specialties, badges),
      question:questions!question_id(id, title, category_id)
    `,
    limit: 10,
    cache_ttl: 3 * 60, // 3분 캐시
  },

  // 전문가 매칭 최적화
  EXPERT_MATCHING: {
    select: `
      id, name, avatar_url, trust_score, residence_years, specialties, badges,
      answer_count, helpful_answer_count, last_active, bio, languages
    `,
    filters: {
      trust_score: 'gte.300',
      is_verified: 'eq.true',
      last_active: `gte.${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()}` // 90일 이내
    },
    cache_ttl: 10 * 60, // 10분 캐시
  }
}

// 베트남 사용자 특화 인덱스 힌트
export const INDEX_HINTS = {
  // 카테고리별 질문 검색 최적화
  questions_by_category: 'category_id, created_at DESC',

  // 긴급도별 질문 정렬 최적화
  questions_by_urgency: 'urgency, created_at DESC',

  // 신뢰도 기반 사용자 검색
  users_by_trust: 'trust_score DESC, residence_years DESC',

  // 전문 분야별 사용자 검색
  users_by_specialty: 'specialties, trust_score DESC',

  // 태그 기반 검색 최적화
  questions_by_tags: 'tags, vote_score DESC',

  // 거주 기간별 사용자 분류
  users_by_experience: 'residence_years DESC, trust_score DESC'
}

// 쿼리 성능 모니터링
export class QueryPerformanceMonitor {
  private static instance: QueryPerformanceMonitor
  private queryTimes: Map<string, number[]> = new Map()

  static getInstance(): QueryPerformanceMonitor {
    if (!QueryPerformanceMonitor.instance) {
      QueryPerformanceMonitor.instance = new QueryPerformanceMonitor()
    }
    return QueryPerformanceMonitor.instance
  }

  startTimer(queryName: string): () => void {
    const startTime = Date.now()

    return () => {
      const endTime = Date.now()
      const duration = endTime - startTime

      if (!this.queryTimes.has(queryName)) {
        this.queryTimes.set(queryName, [])
      }

      const times = this.queryTimes.get(queryName)!
      times.push(duration)

      // 최근 100개 기록만 유지
      if (times.length > 100) {
        times.shift()
      }

      // 성능 경고 (500ms 이상)
      if (duration > 500) {
        console.warn(`⚠️ Slow query detected: ${queryName} took ${duration}ms`)
      }
    }
  }

  getStats(queryName: string) {
    const times = this.queryTimes.get(queryName) || []
    if (times.length === 0) return null

    const sorted = [...times].sort((a, b) => a - b)
    return {
      count: times.length,
      avg: Math.round(times.reduce((sum, t) => sum + t, 0) / times.length),
      min: Math.min(...times),
      max: Math.max(...times),
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    }
  }

  getAllStats() {
    const stats = {}
    for (const [queryName] of this.queryTimes) {
      stats[queryName] = this.getStats(queryName)
    }
    return stats
  }
}

// 베트남 특화 캐싱 전략
export class VietnameseCommunityCache {
  private static cache = new Map<string, { data: any; expires: number }>()

  static set(key: string, data: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000
    })
  }

  static get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')

    return `${prefix}:${sortedParams}`
  }

  static clear() {
    this.cache.clear()
  }

  static getStats() {
    return {
      size: this.cache.size,
      items: Array.from(this.cache.keys())
    }
  }
}

// 베트남 사용자 활동 패턴 분석
export function analyzeUserActivity(user: any) {
  const analysis = {
    activity_level: 'low',
    community_engagement: 0,
    expertise_areas: [] as string[],
    trust_growth_potential: 0,
    recommended_actions: [] as string[]
  }

  // 활동 수준 분석
  const totalActivity = (user.question_count || 0) + (user.answer_count || 0)
  if (totalActivity >= 50) analysis.activity_level = 'high'
  else if (totalActivity >= 20) analysis.activity_level = 'medium'

  // 커뮤니티 참여도 계산
  const helpfulRatio = user.answer_count > 0
    ? (user.helpful_answer_count || 0) / user.answer_count
    : 0
  analysis.community_engagement = Math.round(helpfulRatio * 100)

  // 전문 분야 식별
  if (user.specialties && user.specialties.length > 0) {
    analysis.expertise_areas = user.specialties
  }

  // 신뢰도 성장 잠재력
  const baseScore = user.trust_score || 0
  const experienceBonus = (user.residence_years || 0) * 50
  const activityBonus = totalActivity * 5
  analysis.trust_growth_potential = Math.min(1000 - baseScore, experienceBonus + activityBonus)

  // 추천 액션
  if (analysis.activity_level === 'low') {
    analysis.recommended_actions.push('더 많은 질문과 답변 참여')
  }
  if (analysis.community_engagement < 70) {
    analysis.recommended_actions.push('도움되는 답변 작성하기')
  }
  if (!user.is_verified) {
    analysis.recommended_actions.push('이메일 인증 완료')
  }
  if (analysis.expertise_areas.length === 0) {
    analysis.recommended_actions.push('전문 분야 설정')
  }

  return analysis
}

// 데이터베이스 건강도 체크
export async function performHealthCheck() {
  const monitor = QueryPerformanceMonitor.getInstance()
  const cacheStats = VietnameseCommunityCache.getStats()

  return {
    timestamp: new Date().toISOString(),
    query_performance: monitor.getAllStats(),
    cache_status: cacheStats,
    optimization_suggestions: [
      'Consider adding indexes for frequently queried fields',
      'Implement query result caching for read-heavy operations',
      'Monitor slow queries and optimize them',
      'Use pagination for large result sets'
    ],
    vietnamese_community_metrics: {
      recommended_cache_ttl: {
        questions: '5 minutes',
        answers: '3 minutes',
        users: '10 minutes',
        experts: '10 minutes'
      },
      query_patterns: {
        peak_hours: '20:00-23:00 KST',
        common_categories: ['비자/법률', '취업/직장', '주거/부동산'],
        optimization_priority: ['category filtering', 'trust score sorting', 'expert matching']
      }
    }
  }
}
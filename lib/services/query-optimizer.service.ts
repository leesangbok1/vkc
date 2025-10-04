import { createSupabaseServerClient } from '@/lib/supabase'
import { cacheManager, CacheKeyGenerator } from './cache.service'

// 쿼리 최적화 서비스
export class QueryOptimizerService {
  private supabase = await createSupabaseServerClient()

  // 질문 목록 최적화된 조회
  async getOptimizedQuestions(options: {
    page?: number
    limit?: number
    category?: string
    sortBy?: string
    useCache?: boolean
  }) {
    const {
      page = 1,
      limit = 20,
      category,
      sortBy = 'latest',
      useCache = true
    } = options

    // 캐시 확인
    if (useCache) {
      const cached = cacheManager.getQuestionList(page, limit, category, sortBy)
      if (cached) {
        return { data: cached, fromCache: true }
      }
    }

    // 최적화된 쿼리 구성
    let query = this.supabase
      .from('questions')
      .select(`
        id,
        title,
        content,
        created_at,
        updated_at,
        view_count,
        vote_score,
        answer_count,
        is_resolved,
        urgency_level,
        tags,
        author:users!author_id(
          id,
          display_name,
          avatar_url,
          trust_score
        ),
        category:categories!category_id(
          id,
          name,
          slug,
          icon
        )
      `, { count: 'exact' })
      .neq('status', 'deleted')

    // 카테고리 필터
    if (category && category !== 'all') {
      query = query.eq('categories.slug', category)
    }

    // 정렬 최적화
    switch (sortBy) {
      case 'popular':
        query = query.order('view_count', { ascending: false })
        break
      case 'votes':
        query = query.order('vote_score', { ascending: false })
        break
      case 'answers':
        query = query.order('answer_count', { ascending: false })
        break
      case 'urgent':
        query = query
          .eq('urgency_level', 'high')
          .order('created_at', { ascending: false })
        break
      case 'unanswered':
        query = query
          .eq('answer_count', 0)
          .order('created_at', { ascending: false })
        break
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // 페이지네이션
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Questions query failed: ${error.message}`)
    }

    const result = {
      data: data || [],
      count: count || 0,
      fromCache: false
    }

    // 캐시 저장
    if (useCache && data) {
      cacheManager.cacheQuestionList(page, limit, data, category, sortBy)
    }

    return result
  }

  // 검색 최적화
  async getOptimizedSearch(options: {
    query: string
    type?: string
    page?: number
    limit?: number
    filters?: any
    useCache?: boolean
  }) {
    const {
      query: searchQuery,
      type = 'questions',
      page = 1,
      limit = 20,
      filters = {},
      useCache = true
    } = options

    // 캐시 확인
    if (useCache) {
      const cached = cacheManager.getSearchResults(searchQuery, type, page)
      if (cached) {
        return { ...cached, fromCache: true }
      }
    }

    let results: any = {}

    if (type === 'questions' || type === 'all') {
      results.questions = await this.searchQuestions(searchQuery, page, limit, filters)
    }

    if (type === 'answers' || type === 'all') {
      results.answers = await this.searchAnswers(searchQuery, page, limit, filters)
    }

    if (type === 'users' || type === 'all') {
      results.users = await this.searchUsers(searchQuery, page, limit, filters)
    }

    const searchResults = {
      query: searchQuery,
      type,
      results,
      fromCache: false
    }

    // 캐시 저장
    if (useCache) {
      cacheManager.cacheSearchResults(searchQuery, type, page, searchResults)
    }

    return searchResults
  }

  // 질문 검색 최적화
  private async searchQuestions(query: string, page: number, limit: number, filters: any) {
    const offset = (page - 1) * limit

    let questionQuery = this.supabase
      .from('questions')
      .select(`
        id,
        title,
        content,
        created_at,
        view_count,
        vote_score,
        answer_count,
        is_resolved,
        tags,
        author:users!author_id(id, display_name, avatar_url),
        category:categories!category_id(name, slug, icon)
      `, { count: 'exact' })
      .neq('status', 'deleted')

    // 텍스트 검색 최적화 (PostgreSQL의 텍스트 검색 기능 활용)
    if (query.length > 0) {
      // 여러 키워드 검색 지원
      const searchTerms = query.split(' ').filter(term => term.length > 1)

      if (searchTerms.length > 1) {
        // AND 검색: 모든 키워드가 포함된 결과
        const conditions = searchTerms.map(term => `title.ilike.%${term}%`).join(',')
        questionQuery = questionQuery.or(conditions)
      } else {
        // 단일 키워드 검색
        questionQuery = questionQuery.or(`
          title.ilike.%${query}%,
          content.ilike.%${query}%,
          tags.cs.{${query}}
        `)
      }
    }

    // 필터 적용
    if (filters.category) {
      questionQuery = questionQuery.eq('categories.slug', filters.category)
    }

    if (filters.timeRange) {
      const startDate = this.getDateFromTimeRange(filters.timeRange)
      questionQuery = questionQuery.gte('created_at', startDate)
    }

    if (filters.minVotes) {
      questionQuery = questionQuery.gte('vote_score', filters.minVotes)
    }

    if (filters.hasAnswers === 'true') {
      questionQuery = questionQuery.gt('answer_count', 0)
    } else if (filters.hasAnswers === 'false') {
      questionQuery = questionQuery.eq('answer_count', 0)
    }

    if (filters.isResolved === 'true') {
      questionQuery = questionQuery.eq('is_resolved', true)
    } else if (filters.isResolved === 'false') {
      questionQuery = questionQuery.eq('is_resolved', false)
    }

    // 정렬 및 페이지네이션
    questionQuery = questionQuery
      .order('vote_score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await questionQuery

    if (error) {
      console.error('Question search error:', error)
      return { data: [], count: 0 }
    }

    return { data: data || [], count: count || 0 }
  }

  // 답변 검색 최적화
  private async searchAnswers(query: string, page: number, limit: number, filters: any) {
    const offset = (page - 1) * limit

    let answerQuery = this.supabase
      .from('answers')
      .select(`
        id,
        content,
        created_at,
        vote_score,
        is_accepted,
        is_helpful,
        author:users!author_id(id, display_name, avatar_url),
        question:questions!question_id(
          id,
          title,
          category:categories(name, slug)
        )
      `, { count: 'exact' })
      .ilike('content', `%${query}%`)

    // 필터 적용
    if (filters.isAccepted === 'true') {
      answerQuery = answerQuery.eq('is_accepted', true)
    }

    if (filters.isHelpful === 'true') {
      answerQuery = answerQuery.eq('is_helpful', true)
    }

    // 정렬 및 페이지네이션
    answerQuery = answerQuery
      .order('is_accepted', { ascending: false })
      .order('vote_score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await answerQuery

    if (error) {
      console.error('Answer search error:', error)
      return { data: [], count: 0 }
    }

    return { data: data || [], count: count || 0 }
  }

  // 사용자 검색 최적화
  private async searchUsers(query: string, page: number, limit: number, filters: any) {
    const offset = (page - 1) * limit

    let userQuery = this.supabase
      .from('users')
      .select(`
        id,
        display_name,
        avatar_url,
        bio,
        trust_score,
        total_answers,
        helpful_answers,
        location,
        expertise_areas,
        created_at
      `, { count: 'exact' })
      .or(`display_name.ilike.%${query}%, bio.ilike.%${query}%`)

    // 필터 적용
    if (filters.minTrustScore) {
      userQuery = userQuery.gte('trust_score', filters.minTrustScore)
    }

    if (filters.location) {
      userQuery = userQuery.eq('location', filters.location)
    }

    if (filters.expertiseArea) {
      userQuery = userQuery.contains('expertise_areas', [filters.expertiseArea])
    }

    // 정렬 및 페이지네이션
    userQuery = userQuery
      .order('trust_score', { ascending: false })
      .order('helpful_answers', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await userQuery

    if (error) {
      console.error('User search error:', error)
      return { data: [], count: 0 }
    }

    return { data: data || [], count: count || 0 }
  }

  // 사용자 프로필 최적화된 조회
  async getOptimizedUserProfile(userId: string, useCache: boolean = true) {
    // 캐시 확인
    if (useCache) {
      const cached = cacheManager.getUserProfile(userId)
      if (cached) {
        return { ...cached, fromCache: true }
      }
    }

    const { data, error } = await this.supabase
      .from('users')
      .select(`
        *,
        recent_questions:questions!author_id(
          id,
          title,
          created_at,
          view_count,
          answer_count,
          vote_score,
          category:categories(name, slug)
        ),
        recent_answers:answers!author_id(
          id,
          content,
          created_at,
          vote_score,
          is_accepted,
          question:questions(id, title)
        )
      `)
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(`User profile query failed: ${error.message}`)
    }

    const profile = {
      ...data,
      fromCache: false
    }

    // 캐시 저장
    if (useCache && data) {
      cacheManager.cacheUserProfile(userId, profile)
    }

    return profile
  }

  // 사이트 통계 최적화된 조회
  async getOptimizedSiteStats(useCache: boolean = true) {
    // 캐시 확인
    if (useCache) {
      const cached = cacheManager.getSiteStats()
      if (cached) {
        return { ...cached, fromCache: true }
      }
    }

    // 병렬로 통계 조회
    const [
      { count: questionCount },
      { count: answerCount },
      { count: userCount },
      { data: topCategories }
    ] = await Promise.all([
      this.supabase.from('questions').select('*', { count: 'exact', head: true }),
      this.supabase.from('answers').select('*', { count: 'exact', head: true }),
      this.supabase.from('users').select('*', { count: 'exact', head: true }),
      this.supabase
        .from('categories')
        .select('name, question_count')
        .order('question_count', { ascending: false })
        .limit(5)
    ])

    const stats = {
      total_questions: questionCount || 0,
      total_answers: answerCount || 0,
      total_users: userCount || 0,
      top_categories: topCategories || [],
      last_updated: new Date().toISOString(),
      fromCache: false
    }

    // 캐시 저장
    if (useCache) {
      cacheManager.cacheSiteStats(stats)
    }

    return stats
  }

  // 시간 범위를 날짜로 변환
  private getDateFromTimeRange(timeRange: string): string {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(0)
    }

    return startDate.toISOString()
  }

  // 배치 작업으로 여러 질문 조회
  async getBatchQuestions(questionIds: string[], useCache: boolean = true) {
    const results: any[] = []
    const uncachedIds: string[] = []

    // 캐시에서 조회
    if (useCache) {
      for (const id of questionIds) {
        const cached = cacheManager.getQuestion(id)
        if (cached) {
          results.push(cached)
        } else {
          uncachedIds.push(id)
        }
      }
    } else {
      uncachedIds.push(...questionIds)
    }

    // 캐시되지 않은 질문들을 배치로 조회
    if (uncachedIds.length > 0) {
      const { data, error } = await this.supabase
        .from('questions')
        .select(`
          id,
          title,
          content,
          created_at,
          view_count,
          vote_score,
          answer_count,
          author:users!author_id(id, display_name, avatar_url),
          category:categories!category_id(name, slug, icon)
        `)
        .in('id', uncachedIds)

      if (error) {
        throw new Error(`Batch questions query failed: ${error.message}`)
      }

      if (data) {
        results.push(...data)

        // 개별 캐시 저장
        if (useCache) {
          for (const question of data) {
            cacheManager.cacheQuestion(question.id, question)
          }
        }
      }
    }

    return results
  }
}

// 글로벌 쿼리 최적화 서비스 인스턴스
export const queryOptimizer = new QueryOptimizerService()
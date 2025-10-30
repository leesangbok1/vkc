import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'
import { QUERY_CONFIGS, QueryPerformanceMonitor, VietnameseCommunityCache } from '@/lib/database-optimization'

// GET /api/answers - 답변 목록 조회 (전체 또는 특정 사용자)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return NextResponse.json(
        { error: 'Mock mode is no longer supported for /api/answers. Disable NEXT_PUBLIC_MOCK_MODE to use this endpoint.' },
        { status: 503 }
      )
    }

    const supabase = await createClient()

    // 쿼리 파라미터 파싱
    const { page, limit } = ValidationUtils.validatePagination(searchParams)
    const author_id = searchParams.get('author_id')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    // 캐시 키 생성
    const cacheKey = VietnameseCommunityCache.generateKey('answers_list', {
      page,
      limit,
      author_id: author_id || 'all',
      sort,
      order
    })

    // 캐시에서 확인
    const cachedData = VietnameseCommunityCache.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // 성능 모니터링 시작
    const monitor = QueryPerformanceMonitor.getInstance()
    const stopTimer = monitor.startTimer('answers_list')

    // 오프셋 계산
    const offset = (page - 1) * limit

    // 최적화된 쿼리 구성 (선택적 필드만)
    let query = supabase
      .from('answers')
      .select(QUERY_CONFIGS.ANSWERS_LIST.select)

    // 필터링 적용
    if (author_id) {
      query = query.eq('author_id', author_id)
    }

    // 정렬 적용
    if (sort === 'popularity') {
      query = query.order('vote_score', { ascending: order === 'asc' })
    } else if (sort === 'helpful') {
      query = query.order('is_helpful', { ascending: order === 'asc' })
                   .order('vote_score', { ascending: false })
    } else {
      query = query.order(sort, { ascending: order === 'asc' })
    }

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1)

    const { data: answers, error, count } = await query

    // 성능 모니터링 종료
    stopTimer()

    if (error) {
      console.error('Answers fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch answers' },
        { status: 500 }
      )
    }

    // 총 페이지 수 계산
    const totalPages = count ? Math.ceil(count / limit) : 0

    const responseData = {
      data: answers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }

    // 캐시에 저장 (3분 TTL)
    VietnameseCommunityCache.set(cacheKey, responseData, QUERY_CONFIGS.ANSWERS_LIST.cache_ttl)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Answers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

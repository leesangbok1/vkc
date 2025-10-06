import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'
import { QUERY_CONFIGS, QueryPerformanceMonitor, VietnameseCommunityCache } from '@/lib/database-optimization'

// GET /api/answers - 답변 목록 조회 (전체 또는 특정 사용자)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Mock mode check
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
      console.log('Answers API running in mock mode')

      const mockAnswers = [
        {
          id: '1',
          question_id: '1',
          author_id: 'user2',
          content: 'E-7 비자 신청 시 필요한 서류는 다음과 같습니다:\n\n1. 비자 신청서 (본인 작성)\n2. 여권용 사진 1매\n3. 여권 원본 및 사본\n4. 재직증명서 (회사에서 발급)\n5. 근로계약서 사본\n6. 사업자등록증 사본 (회사)\n7. **베트남에서 준비할 서류:**\n   - 학위증명서 + 아포스티유 또는 영사확인\n   - 무범죄증명서 + 아포스티유 또는 영사확인\n   - 건강검진서 (최근 3개월 이내)\n\n**팁:** 모든 베트남 서류는 한국어 번역공증이 필요하며, 번역은 한국에서도 가능합니다.',
          is_accepted: true,
          is_ai_generated: false,
          helpful_count: 45,
          vote_score: 28,
          status: 'published',
          quality_score: 95, // 답변 품질 점수 추가
          expertise_match: true, // 전문가 매칭 여부
          response_time_hours: 2.5, // 응답 시간
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user2',
            name: '팜티란',
            avatar_url: '',
            trust_score: 892,
            residence_years: 4,
            specialties: ['비자', '취업', '법률'], // 전문 분야 추가
            badges: { verified: true, expert: true, helpful: true },
            email: '',
            created_at: '',
            updated_at: ''
          },
          question: {
            id: '1',
            title: 'E-7 비자 신청 시 필요한 서류가 궁금합니다',
            author_id: 'user1',
            category: '비자/법률'
          }
        },
        {
          id: '2',
          question_id: '2',
          author_id: 'user3',
          content: '출입국 관리사무소에 방문하기 전에 먼저 온라인으로 체류 기간 연장 신청을 할 수 있습니다. Hi Korea 사이트를 이용하시면 됩니다.',
          is_accepted: true,
          is_ai_generated: false,
          helpful_count: 25,
          vote_score: 15,
          status: 'published',
          created_at: '2024-01-14T16:45:00Z',
          updated_at: '2024-01-14T16:45:00Z',
          author: {
            id: 'user3',
            name: '박정민',
            avatar_url: null,
            trust_score: 92,
            badges: { 'verified': true, 'expert': true }
          },
          question: {
            id: '2',
            title: '한국어 공부 방법 추천해주세요',
            author_id: 'user2'
          }
        }
      ]

      // 쿼리 파라미터 파싱
      const { page, limit } = ValidationUtils.validatePagination(searchParams)
      const author_id = searchParams.get('author_id')
      const sort = searchParams.get('sort') || 'created_at'
      const order = searchParams.get('order') || 'desc'

      // 필터링 적용
      let filteredAnswers = mockAnswers

      if (author_id) {
        filteredAnswers = filteredAnswers.filter(answer => answer.author_id === author_id)
      }

      // 정렬 적용
      if (sort === 'helpful_count') {
        filteredAnswers.sort((a, b) => order === 'asc' ? a.helpful_count - b.helpful_count : b.helpful_count - a.helpful_count)
      } else if (sort === 'vote_score') {
        filteredAnswers.sort((a, b) => order === 'asc' ? a.vote_score - b.vote_score : b.vote_score - a.vote_score)
      } else {
        filteredAnswers.sort((a, b) => {
          const aDate = new Date(a.created_at).getTime()
          const bDate = new Date(b.created_at).getTime()
          return order === 'asc' ? aDate - bDate : bDate - aDate
        })
      }

      // 페이지네이션 적용
      const offset = (page - 1) * limit
      const paginatedAnswers = filteredAnswers.slice(offset, offset + limit)
      const total = filteredAnswers.length
      const totalPages = Math.ceil(total / limit)

      return NextResponse.json({
        data: paginatedAnswers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      })
    }

    const supabase = await createClient()

    // If supabase is null (mock mode), return error
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

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


import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'
import { applyRateLimit } from '@/lib/middleware/rate-limit'

// GET /api/questions - 질문 목록 조회 (페이지네이션, 필터링, 정렬)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Mock mode check
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
      console.log('Questions API running in mock mode')

      const mockQuestions = [
        {
          id: '1',
          title: 'E-7 비자 신청 시 필요한 서류가 궁금합니다',
          content: '회사에서 E-7 비자 신청을 도와준다고 하는데, 제가 준비해야 할 서류들이 무엇인지 알고 싶습니다. 특히 베트남에서 가져와야 하는 서류가 있을까요?',
          author_id: 'user1',
          category_id: 1,
          tags: ['E-7비자', '서류', '취업'],
          status: 'open',
          urgency: 'high',
          upvote_count: 12,
          downvote_count: 0,
          helpful_count: 5,
          view_count: 45,
          answer_count: 3,
          ai_category_confidence: null,
          ai_tags: [],
          matched_experts: [],
          expert_notifications_sent: false,
          is_pinned: false,
          is_featured: false,
          is_reported: false,
          is_approved: true,
          moderated_by: null,
          moderated_at: null,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          last_activity_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved_at: null,
          search_vector: null,
          author: {
            id: 'user1',
            email: 'letuan@example.com',
            name: '레투안',
            avatar_url: null,
            bio: null,
            provider: 'google',
            provider_id: 'google_user1',
            visa_type: 'E-7',
            company: 'Tech Company',
            years_in_korea: 3,
            region: 'Seoul',
            preferred_language: 'ko',
            is_verified: true,
            verification_date: '2024-01-15T00:00:00Z',
            trust_score: 324,
            badges: { verified: true, expert: false, senior: false, helper: false },
            question_count: 5,
            answer_count: 12,
            helpful_answer_count: 8,
            last_active: new Date().toISOString(),
            created_at: '2024-01-01T00:00:00Z',
            updated_at: new Date().toISOString()
          },
          category: {
            id: 1,
            name: '비자/법률',
            slug: 'visa',
            description: '비자 신청, 법률 상담, 행정 업무 관련 질문',
            icon: '🛂',
            color: '#4285F4',
            parent_id: null,
            sort_order: 1,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        },
        {
          id: '2',
          title: '서울에서 저렴한 원룸 구하는 방법',
          content: '대학원생이라 예산이 많지 않은데, 서울에서 월 40만원 정도로 살 수 있는 원룸이 있을까요? 어떤 지역을 추천하시나요?',
          author_id: 'user2',
          category_id: 2,
          tags: ['원룸', '부동산', '서울', '대학원생'],
          status: 'resolved',
          urgency: 'normal',
          upvote_count: 23,
          downvote_count: 2,
          helpful_count: 8,
          view_count: 89,
          answer_count: 7,
          ai_category_confidence: null,
          ai_tags: [],
          matched_experts: [],
          expert_notifications_sent: false,
          is_pinned: false,
          is_featured: false,
          is_reported: false,
          is_approved: true,
          moderated_by: null,
          moderated_at: null,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          last_activity_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          resolved_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          search_vector: null,
          author: {
            id: 'user2',
            email: 'phamthilan@example.com',
            name: '팜티란',
            avatar_url: null,
            bio: '대학원생입니다',
            provider: 'kakao',
            provider_id: 'kakao_user2',
            visa_type: 'D-2',
            company: null,
            years_in_korea: 4,
            region: 'Seoul',
            preferred_language: 'ko',
            is_verified: true,
            verification_date: '2024-02-01T00:00:00Z',
            trust_score: 567,
            badges: { verified: true, expert: false, senior: false, helper: true },
            question_count: 8,
            answer_count: 25,
            helpful_answer_count: 18,
            last_active: new Date().toISOString(),
            created_at: '2023-09-01T00:00:00Z',
            updated_at: new Date().toISOString()
          },
          category: {
            id: 2,
            name: '주거/부동산',
            slug: 'housing',
            description: '집 구하기, 부동산, 임대 계약 관련 질문',
            icon: '🏠',
            color: '#9C27B0',
            parent_id: null,
            sort_order: 2,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        },
        {
          id: '3',
          title: '한국 회사 면접 준비 팁',
          content: '다음 주에 한국 회사 면접이 있는데, 베트남과 다른 문화적 차이점이나 준비해야 할 것들이 있을까요?',
          author_id: 'user3',
          category_id: 3,
          tags: ['면접', '취업', '회사문화'],
          status: 'open',
          urgency: 'urgent',
          upvote_count: 34,
          downvote_count: 1,
          helpful_count: 15,
          view_count: 156,
          answer_count: 12,
          ai_category_confidence: null,
          ai_tags: [],
          matched_experts: ['user2', 'user5'],
          expert_notifications_sent: true,
          is_pinned: true,
          is_featured: false,
          is_reported: false,
          is_approved: true,
          moderated_by: null,
          moderated_at: null,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          last_activity_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          resolved_at: null,
          search_vector: null,
          author: {
            id: 'user3',
            email: 'nguyenminh@example.com',
            name: '응우옌민',
            avatar_url: null,
            bio: '6년차 직장인',
            provider: 'google',
            provider_id: 'google_user3',
            visa_type: 'F-2',
            company: 'Samsung Electronics',
            years_in_korea: 6,
            region: 'Suwon',
            preferred_language: 'ko',
            is_verified: true,
            verification_date: '2023-06-01T00:00:00Z',
            trust_score: 892,
            badges: { verified: true, expert: true, senior: true, helper: true },
            question_count: 15,
            answer_count: 45,
            helpful_answer_count: 38,
            last_active: new Date().toISOString(),
            created_at: '2019-03-01T00:00:00Z',
            updated_at: new Date().toISOString()
          },
          category: {
            id: 3,
            name: '취업/직장',
            slug: 'employment',
            description: '취업, 면접, 직장 생활, 이직 관련 질문',
            icon: '💼',
            color: '#EA4335',
            parent_id: null,
            sort_order: 3,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        },
        {
          id: '4',
          title: '한국 의료보험 신청 방법',
          content: 'D-2 비자로 있는데 의료보험에 가입할 수 있나요? 절차와 비용이 궁금합니다.',
          author_id: 'user4',
          category_id: 4,
          tags: ['의료보험', 'D-2비자', '건강보험'],
          status: 'open',
          urgency: 'high',
          upvote_count: 8,
          downvote_count: 0,
          helpful_count: 2,
          view_count: 32,
          answer_count: 2,
          ai_category_confidence: null,
          ai_tags: [],
          matched_experts: [],
          expert_notifications_sent: false,
          is_pinned: false,
          is_featured: false,
          is_reported: false,
          is_approved: true,
          moderated_by: null,
          moderated_at: null,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          last_activity_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          resolved_at: null,
          search_vector: null,
          author: {
            id: 'user4',
            email: 'butiha@example.com',
            name: '부티하',
            avatar_url: null,
            bio: null,
            provider: 'google',
            provider_id: 'google_user4',
            visa_type: 'D-2',
            company: null,
            years_in_korea: 1,
            region: 'Seoul',
            preferred_language: 'vi',
            is_verified: false,
            verification_date: null,
            trust_score: 156,
            badges: { verified: false, expert: false, senior: false, helper: false },
            question_count: 3,
            answer_count: 1,
            helpful_answer_count: 0,
            last_active: new Date().toISOString(),
            created_at: '2024-08-01T00:00:00Z',
            updated_at: new Date().toISOString()
          },
          category: {
            id: 4,
            name: '의료/건강',
            slug: 'healthcare',
            description: '건강보험, 병원, 의료비, 건강 관리 관련 질문',
            icon: '🏥',
            color: '#F44336',
            parent_id: null,
            sort_order: 4,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        },
        {
          id: '5',
          title: '베트남 음식 재료 어디서 살 수 있나요?',
          content: '한국에서 베트남 요리를 해먹고 싶은데, 쌀국수나 피쉬소스 같은 재료를 어디서 구할 수 있을까요?',
          author_id: 'user5',
          category_id: 5,
          tags: ['베트남음식', '재료', '쇼핑'],
          status: 'open',
          urgency: 'low',
          upvote_count: 15,
          downvote_count: 1,
          helpful_count: 6,
          view_count: 78,
          answer_count: 8,
          ai_category_confidence: null,
          ai_tags: [],
          matched_experts: ['user3'],
          expert_notifications_sent: true,
          is_pinned: false,
          is_featured: false,
          is_reported: false,
          is_approved: true,
          moderated_by: null,
          moderated_at: null,
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          last_activity_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          resolved_at: null,
          search_vector: null,
          author: {
            id: 'user5',
            email: 'levanduc@example.com',
            name: '레반둑',
            avatar_url: null,
            bio: '요리를 좋아합니다',
            provider: 'facebook',
            provider_id: 'facebook_user5',
            visa_type: 'H-2',
            company: 'Restaurant',
            years_in_korea: 2,
            region: 'Busan',
            preferred_language: 'ko',
            is_verified: true,
            verification_date: '2024-03-01T00:00:00Z',
            trust_score: 445,
            badges: { verified: true, expert: false, senior: false, helper: true },
            question_count: 12,
            answer_count: 28,
            helpful_answer_count: 22,
            last_active: new Date().toISOString(),
            created_at: '2023-01-01T00:00:00Z',
            updated_at: new Date().toISOString()
          },
          category: {
            id: 5,
            name: '생활/문화',
            slug: 'life',
            description: '일상 생활, 문화 차이, 쇼핑, 음식 관련 질문',
            icon: '🍜',
            color: '#4CAF50',
            parent_id: null,
            sort_order: 5,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        }
      ]

      // 쿼리 파라미터 파싱
      const { page, limit } = ValidationUtils.validatePagination(searchParams)
      const category = searchParams.get('category')
      const tag = searchParams.get('tag')
      const sort = searchParams.get('sort') || 'created_at'
      const order = searchParams.get('order') || 'desc'
      const search = ValidationUtils.sanitizeFilterParam(searchParams.get('search'))
      const urgency = searchParams.get('urgency')
      const status = searchParams.get('status')
      const visa_type = searchParams.get('visa_type') // 베트남 특화: 비자 타입별 필터링
      const residence_years = ValidationUtils.safeParseInt(searchParams.get('residence_years'), 0, 0, 50)

      // 필터링 적용
      let filteredQuestions = mockQuestions

      if (category) {
        filteredQuestions = filteredQuestions.filter(q => q.category.slug === category)
      }

      if (tag) {
        filteredQuestions = filteredQuestions.filter(q => q.tags.includes(tag))
      }

      if (search) {
        const searchLower = search.toLowerCase()
        filteredQuestions = filteredQuestions.filter(q =>
          q.title.toLowerCase().includes(searchLower) ||
          q.content.toLowerCase().includes(searchLower) ||
          q.tags.some(t => t.toLowerCase().includes(searchLower)) ||
          q.author.name.toLowerCase().includes(searchLower)
        )
      }

      // 베트남 특화 필터링
      if (urgency) {
        filteredQuestions = filteredQuestions.filter(q => q.urgency === urgency)
      }

      if (status) {
        filteredQuestions = filteredQuestions.filter(q => q.status === status)
      }

      if (visa_type) {
        filteredQuestions = filteredQuestions.filter(q =>
          q.tags.some(tag => tag.toLowerCase().includes(visa_type.toLowerCase())) ||
          q.title.toLowerCase().includes(visa_type.toLowerCase()) ||
          q.content.toLowerCase().includes(visa_type.toLowerCase())
        )
      }

      if (residence_years > 0) {
        filteredQuestions = filteredQuestions.filter(q =>
          q.author.years_in_korea && q.author.years_in_korea >= residence_years
        )
      }

      // 정렬 적용 (베트남 특화 정렬 포함)
      if (sort === 'popularity') {
        filteredQuestions.sort((a, b) => order === 'asc' ? (a.upvote_count - a.downvote_count) - (b.upvote_count - b.downvote_count) : (b.upvote_count - b.downvote_count) - (a.upvote_count - a.downvote_count))
      } else if (sort === 'views') {
        filteredQuestions.sort((a, b) => order === 'asc' ? a.view_count - b.view_count : b.view_count - a.view_count)
      } else if (sort === 'answers') {
        filteredQuestions.sort((a, b) => order === 'asc' ? a.answer_count - b.answer_count : b.answer_count - a.answer_count)
      } else if (sort === 'urgency') {
        // 긴급도 기반 정렬 (urgent -> high -> normal -> low)
        const urgencyOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 }
        filteredQuestions.sort((a, b) => {
          const aUrgency = urgencyOrder[a.urgency] || 0
          const bUrgency = urgencyOrder[b.urgency] || 0
          return order === 'asc' ? aUrgency - bUrgency : bUrgency - aUrgency
        })
      } else if (sort === 'trust_score') {
        // 작성자 신뢰도 기반 정렬
        filteredQuestions.sort((a, b) => {
          const aTrust = a.author.trust_score || 0
          const bTrust = b.author.trust_score || 0
          return order === 'asc' ? aTrust - bTrust : bTrust - aTrust
        })
      } else if (sort === 'residence_years') {
        // 거주 기간 기반 정렬 (경험 많은 사용자 우선)
        filteredQuestions.sort((a, b) => {
          const aYears = a.author.years_in_korea || 0
          const bYears = b.author.years_in_korea || 0
          return order === 'asc' ? aYears - bYears : bYears - aYears
        })
      } else {
        // 기본: 생성일 기준 정렬
        filteredQuestions.sort((a, b) => {
          const aDate = new Date(a.created_at).getTime()
          const bDate = new Date(b.created_at).getTime()
          return order === 'asc' ? aDate - bDate : bDate - aDate
        })
      }

      // 핀 고정된 질문을 맨 위로 이동
      filteredQuestions.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return 0
      })

      // 페이지네이션 적용
      const offset = (page - 1) * limit
      const paginatedQuestions = filteredQuestions.slice(offset, offset + limit)
      const total = filteredQuestions.length
      const totalPages = Math.ceil(total / limit)

      return NextResponse.json({
        data: paginatedQuestions,
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
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // 쿼리 파라미터 파싱
    const { page, limit } = ValidationUtils.validatePagination(searchParams)
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    const search = ValidationUtils.sanitizeFilterParam(searchParams.get('search'))

    // 오프셋 계산
    const offset = (page - 1) * limit

    // 기본 쿼리 구성
    let query = supabase
      .from('questions')
      .select(`
        *,
        author:users!author_id(id, name, avatar_url, trust_score, badges),
        category:categories!category_id(id, name, slug, icon, color),
        _count:answers(count)
      `)

    // 필터링 적용
    if (category) {
      query = query.eq('categories.slug', category)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,tags.cs.{${search}}`)
    }

    // 정렬 적용
    if (sort === 'popularity') {
      query = query.order('vote_score', { ascending: order === 'asc' })
    } else if (sort === 'views') {
      query = query.order('view_count', { ascending: order === 'asc' })
    } else if (sort === 'answers') {
      query = query.order('answer_count', { ascending: order === 'asc' })
    } else {
      query = query.order(sort, { ascending: order === 'asc' })
    }

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1)

    const { data: questions, error, count } = await query

    if (error) {
      console.error('Questions fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    // 총 페이지 수 계산
    const totalPages = count ? Math.ceil(count / limit) : 0

    return NextResponse.json({
      data: questions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Questions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/questions - 새 질문 작성 (인증 필요)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Rate limiting 체크
    const rateLimitResponse = await applyRateLimit(request, user.id, 'post')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // 요청 본문 파싱
    const body = await request.json()
    const { title, content, category_id, tags = [], urgency = 'normal' } = body

    // 입력값 검증
    if (!title || !content || !category_id) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      )
    }

    // 카테고리 유효성 확인
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single()

    if (!category) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // 질문 생성
    const { data: question, error: insertError } = await supabase
      .from('questions')
      .insert([{
        title,
        content,
        author_id: user.id,
        category_id,
        tags,
        urgency,
        status: 'open',
        is_anonymous: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        author:users!author_id(id, name, avatar_url, trust_score, badges),
        category:categories!category_id(id, name, slug, icon, color)
      `)
      .single()

    if (insertError) {
      console.error('Question creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create question' },
        { status: 500 }
      )
    }

    // 사용자 질문 카운트 업데이트
    await supabase
      .from('users')
      .update({
        question_count: supabase.rpc('increment_question_count'),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json(
      { data: question, message: 'Question created successfully' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Question creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
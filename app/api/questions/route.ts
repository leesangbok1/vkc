import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'
import { applyRateLimit } from '@/lib/middleware/rate-limit'
import { Question, Category } from '@/lib/types/api'

// GET /api/questions - 질문 목록 조회 (페이지네이션, 필터링, 정렬)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Mock mode 체크 (테스트 환경)
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return getMockQuestions(searchParams)
    }

    // 실제 Supabase 클라이언트 생성
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // 쿼리 파라미터 파싱
    const { page, limit } = ValidationUtils.validatePagination(searchParams)
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    const search = ValidationUtils.sanitizeFilterParam(searchParams.get('search'))
    const urgency = searchParams.get('urgency')
    const status = searchParams.get('status') || 'open'

    // Supabase 쿼리 시작
    let query = supabase
      .from('questions')
      .select(`
        *,
        author:users!questions_author_id_fkey(
          id, name, avatar_url, role, verification_status,
          visa_type, years_in_korea, region
        ),
        category:categories!questions_category_id_fkey(
          id, name, slug, icon, color
        )
      `)
      .eq('is_approved', true)

    // 필터링 적용
    if (category) {
      // 카테고리 slug로 필터링을 위해 categories 테이블과 조인
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()

      if (categoryData) {
        query = query.eq('category_id', (categoryData as Category).id)
      }
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    if (urgency) {
      query = query.eq('urgency', urgency)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // 정렬
    const sortColumn = sort === 'popularity' ? 'upvote_count' : sort
    query = query.order(sortColumn, { ascending: order === 'asc' })

    // 페이지네이션
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: questions, error, count } = await query

    if (error) {
      console.error('Questions query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    // 전체 개수 조회 (별도 쿼리)
    const { count: totalCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true)

    const total = totalCount || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: questions || [],
      pagination: {
        page,
        limit,
        total,
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

// POST /api/questions - 새 질문 작성
export async function POST(request: NextRequest) {
  try {
    // Mock mode 체크 (테스트 환경)
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return postMockQuestion(request)
    }

    // Rate limiting 적용
    const rateLimitResult = await applyRateLimit(request, null, 'post') // Post rate limiting
    if (rateLimitResult) {
      return rateLimitResult // Rate limit exceeded, return error response
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { title, content, category_id, tags = [], urgency = 'normal' } = body

    // 입력 검증
    if (!title || !content || !category_id) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

    // 사용자 인증 확인 (현재는 임시로 기본값 설정)
    const author_id = 'temp-user-id' // TODO: 실제 인증 시스템 연결

    // 질문 생성
    // @ts-expect-error - Supabase type issue
    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        title: ValidationUtils.sanitizeInput(title),
        content: ValidationUtils.sanitizeInput(content),
        author_id,
        category_id,
        tags: Array.isArray(tags) ? tags.slice(0, 10) : [], // 최대 10개 태그
        urgency,
        status: 'open',
        is_approved: true, // TODO: 관리자 승인 시스템 연결
        view_count: 0,
        answer_count: 0,
        upvote_count: 0,
        downvote_count: 0,
        helpful_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Question creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create question' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: question,
      message: 'Question created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('POST questions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock 함수들 (테스트 환경용)
function getMockQuestions(searchParams: URLSearchParams) {
  const { page, limit } = ValidationUtils.validatePagination(searchParams)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const mockQuestions = [
    {
      id: '1',
      title: 'E-7 비자 신청 시 필요한 서류가 궁금합니다',
      content: '회사에서 E-7 비자 신청을 도와준다고 하는데, 제가 준비해야 할 서류들이 무엇인지 알고 싶습니다.',
      author_id: 'user1',
      category_id: 1,
      tags: ['E-7비자', '서류', '취업'],
      urgency: 'high',
      view_count: 45,
      answer_count: 3,
      upvote_count: 12,
      downvote_count: 0,
      status: 'open',
      is_pinned: false,
      is_featured: false,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      author: {
        id: 'user1',
        name: '레투안',
        avatar_url: null,
        role: 'user',
        verification_status: 'approved',
        visa_type: 'E-7',
        years_in_korea: 3,
        region: '서울'
      },
      category: {
        id: 1,
        name: '비자/법률',
        slug: 'visa',
        icon: '🛂',
        color: '#3B82F6'
      }
    },
    {
      id: '2',
      title: 'F-2 비자로 한국에서 창업할 수 있나요?',
      content: 'F-2 비자를 가지고 있는데 한국에서 회사를 설립하고 사업을 할 수 있는지 궁금합니다.',
      author_id: 'user2',
      category_id: 1,
      tags: ['F-2비자', '창업', '사업'],
      urgency: 'normal',
      view_count: 23,
      answer_count: 2,
      upvote_count: 8,
      downvote_count: 0,
      status: 'open',
      is_pinned: false,
      is_featured: true,
      created_at: '2024-01-14T15:30:00Z',
      updated_at: '2024-01-14T15:30:00Z',
      author: {
        id: 'user2',
        name: '응우옌',
        avatar_url: null,
        role: 'verified',
        verification_status: 'approved',
        visa_type: 'F-2',
        years_in_korea: 5,
        region: '부산'
      },
      category: {
        id: 1,
        name: '비자/법률',
        slug: 'visa',
        icon: '🛂',
        color: '#3B82F6'
      }
    }
  ]

  // 필터링 적용
  let filteredQuestions = mockQuestions

  if (category === 'visa') {
    filteredQuestions = mockQuestions.filter(q => q.category.slug === 'visa')
  }

  if (search) {
    filteredQuestions = filteredQuestions.filter(q =>
      q.title.includes(search) || q.content.includes(search)
    )
  }

  // 페이지네이션
  const total = filteredQuestions.length
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const paginatedQuestions = filteredQuestions.slice(offset, offset + limit)

  return NextResponse.json({
    success: true,
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

async function postMockQuestion(request: NextRequest) {
  try {
    const body = await request.json()

    // 필수 필드 검증
    if (!body.title || !body.content || !body.category_id) {
      return NextResponse.json(
        {
          success: false,
          error: '제목, 내용, 카테고리는 필수 입력 항목입니다.'
        },
        { status: 400 }
      )
    }

    // 내용 검증 및 정리
    const sanitizedTitle = ValidationUtils.sanitizeInput(body.title, 200)
    const sanitizedContent = ValidationUtils.sanitizeInput(body.content, 5000)

    if (sanitizedTitle.length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: '제목은 최소 5자 이상이어야 합니다.'
        },
        { status: 400 }
      )
    }

    // Mock 질문 생성
    const mockQuestion = {
      id: `mock-${Date.now()}`,
      title: sanitizedTitle,
      content: sanitizedContent,
      author_id: body.author_id || 'test-user',
      category_id: body.category_id,
      tags: body.tags || [],
      urgency: body.urgency || 'normal',
      view_count: 0,
      answer_count: 0,
      upvote_count: 0,
      downvote_count: 0,
      status: 'open',
      is_pinned: false,
      is_featured: false,
      is_answered: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: mockQuestion,
      message: 'Question created successfully'
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request body'
      },
      { status: 400 }
    )
  }
}
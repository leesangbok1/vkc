import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/questions - 질문 목록 조회 (페이지네이션, 필터링, 정렬)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    const search = searchParams.get('search')

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

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
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
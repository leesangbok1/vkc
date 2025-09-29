import { createSupabaseServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

// GET /api/questions - 질문 목록 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'created_at'
  const order = searchParams.get('order') || 'desc'

  const supabase = createSupabaseServerClient()

  try {
    let query = supabase
      .from('questions')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `)

    // 필터링
    if (category) {
      query = query.eq('category', category)
    }

    // 검색
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // 정렬
    const validSorts = ['created_at', 'updated_at', 'view_count', 'title']
    if (validSorts.includes(sort)) {
      query = query.order(sort, { ascending: order === 'asc' })
    }

    // 페이지네이션
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: questions, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/questions - 새 질문 생성
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient()

  try {
    // 인증 확인
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, category, tags } = body

    // 유효성 검사
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // 질문 생성
    const { data: question, error } = await supabase
      .from('questions')
      .insert([
        {
          user_id: session.user.id,
          title: title.trim(),
          content: content.trim(),
          category: category || '일반',
          tags: tags || [],
        },
      ])
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
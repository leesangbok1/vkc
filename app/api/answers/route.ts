import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/answers - 답변 목록 조회 (전체 또는 특정 사용자)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const author_id = searchParams.get('author_id')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    // 오프셋 계산
    const offset = (page - 1) * limit

    // 기본 쿼리 구성
    let query = supabase
      .from('answers')
      .select(`
        *,
        author:users!author_id(id, name, avatar_url, trust_score, badges),
        question:questions!question_id(id, title, status, category_id,
          category:categories!category_id(name, slug, icon)
        )
      `)

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

    if (error) {
      console.error('Answers fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch answers' },
        { status: 500 }
      )
    }

    // 총 페이지 수 계산
    const totalPages = count ? Math.ceil(count / limit) : 0

    return NextResponse.json({
      data: answers || [],
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
    console.error('Answers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
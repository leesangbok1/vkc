import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'

// GET /api/search - 기본 검색 (제목 + 내용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const category = searchParams.get('category')
    const { page, limit } = ValidationUtils.validatePagination(searchParams)

    // 검색어 검증
    if (!q || q.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // 질문 검색 쿼리
    let query = supabase
      .from('questions')
      .select(`
        id, title, content, tags, view_count, answer_count,
        created_at, updated_at,
        author:users!questions_author_id_fkey(id, name, avatar_url),
        category:categories!questions_category_id_fkey(id, name, slug, icon, color)
      `)
      .eq('is_approved', true)
      .eq('status', 'open')

    // 제목과 내용에서 검색
    const searchQuery = q.trim()
    query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)

    // 카테고리 필터
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()

      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      }
    }

    // 정렬 및 페이지네이션
    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    const { data: questions, error } = await query

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    // 전체 개수 조회
    let countQuery = supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true)
      .eq('status', 'open')
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)

    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()

      if (categoryData) {
        countQuery = countQuery.eq('category_id', categoryData.id)
      }
    }

    const { count } = await countQuery
    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      query: searchQuery,
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
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
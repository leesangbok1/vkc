import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'

// GET /api/categories - 카테고리 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 실제 Supabase 클라이언트 생성
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // 쿼리 파라미터 파싱
    const includeInactive = searchParams.get('include_inactive') === 'true'
    const parentId = searchParams.get('parent_id')

    // Supabase 쿼리 구성
    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    // 활성 카테고리만 조회 (기본값)
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    // 부모 카테고리 필터링
    if (parentId) {
      query = query.eq('parent_id', parseInt(parentId))
    } else {
      // 최상위 카테고리만 조회 (parent_id가 null인 것들)
      query = query.is('parent_id', null)
    }

    const { data: categories, error } = await query

    if (error) {
      console.error('Categories query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // 각 카테고리별 질문 수 조회 (선택적)
    const includeQuestionCount = searchParams.get('include_count') === 'true'
    if (includeQuestionCount && categories) {
      for (const category of categories) {
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('is_approved', true)
          .eq('status', 'open')

        category.question_count = count || 0
      }
    }

    return NextResponse.json({
      success: true,
      data: categories || [],
      meta: {
        total: categories?.length || 0,
        include_inactive: includeInactive,
        include_count: includeQuestionCount
      }
    })

  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/categories - 새 카테고리 생성 (관리자 전용)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request)
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      icon,
      color,
      parent_id = null,
      sort_order = 1,
      is_active = true
    } = body

    // 입력 검증
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // slug 중복 확인
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      )
    }

    // 카테고리 생성
    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: ValidationUtils.sanitizeInput(name),
        slug: ValidationUtils.sanitizeInput(slug),
        description: description ? ValidationUtils.sanitizeInput(description) : null,
        icon,
        color,
        parent_id,
        sort_order,
        is_active
      })
      .select()
      .single()

    if (error) {
      console.error('Category creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('POST categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
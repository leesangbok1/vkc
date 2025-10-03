import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/categories - 카테고리 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // 쿼리 파라미터 파싱
    const includeInactive = searchParams.get('include_inactive') === 'true'
    const parentId = searchParams.get('parent_id')

    // 기본 쿼리 구성
    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    // 활성 카테고리만 조회 (기본값)
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    // 특정 부모 카테고리의 하위 카테고리만 조회
    if (parentId) {
      if (parentId === 'null') {
        query = query.is('parent_id', null)
      } else {
        query = query.eq('parent_id', parseInt(parentId))
      }
    }

    const { data: categories, error } = await query

    if (error) {
      console.error('Categories fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: categories || [],
      total: categories?.length || 0
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

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
    const { data: isAdmin } = await supabase.rpc('is_moderator', {
      user_id: user.id
    })

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // 요청 본문 파싱
    const body = await request.json()
    const {
      name,
      slug,
      description,
      icon,
      color = '#3B82F6',
      parent_id,
      sort_order = 0
    } = body

    // 입력값 검증
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // 슬러그 중복 확인
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category slug already exists' },
        { status: 400 }
      )
    }

    // 부모 카테고리 유효성 확인
    if (parent_id) {
      const { data: parentCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('id', parent_id)
        .single()

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Invalid parent category' },
          { status: 400 }
        )
      }
    }

    // 카테고리 생성
    const { data: category, error: insertError } = await supabase
      .from('categories')
      .insert([{
        name,
        slug,
        description,
        icon,
        color,
        parent_id,
        sort_order,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Category creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data: category, message: 'Category created successfully' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Category creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
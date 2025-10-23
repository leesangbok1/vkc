import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { listPosts } from '@/lib/services/posts.service'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const authorId = url.searchParams.get('author')
    const categoryParam = url.searchParams.get('category')
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam) || 20)) : 20
    const offsetParam = url.searchParams.get('offset')
    const offset = offsetParam ? Math.max(0, Number(offsetParam) || 0) : 0

    const sortParam = (url.searchParams.get('sort') || '').toLowerCase()
    const sort: 'popular' | 'recent' = sortParam === 'popular' ? 'popular' : 'recent'
    const allowedTypes = new Set(['community', 'news'])
    const requestedType = (url.searchParams.get('post_type') || '').toLowerCase()
    const filterPostType = allowedTypes.has(requestedType) ? requestedType : null
    const following = url.searchParams.get('following') === 'true'

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (following && !user?.id) {
      return NextResponse.json(
        { success: false, error: '팔로우한 작성자의 게시글을 보려면 로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { items } = await listPosts({
      sort,
      limit,
      offset,
      postType: filterPostType as 'community' | 'news' | undefined,
      authorId: authorId || undefined,
      category: categoryParam || undefined,
      following,
      userId: user?.id ?? null,
    })

    return NextResponse.json({
      success: true,
      items,
    })
  } catch (error: any) {
    console.error('[/api/posts] unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load posts',
        details: error?.message,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => null)
    const rawTitle = body?.title
    const rawContent = body?.content
    const rawCategoryId = body?.category_id ?? body?.categoryId
    const rawPostType = typeof body?.post_type === 'string' ? body.post_type.toLowerCase() : undefined
    const tags = Array.isArray(body?.tags) ? body.tags.slice(0, 10) : []

    const MIN_TITLE_LENGTH = 5
    const MIN_CONTENT_LENGTH = 10
    const allowedTypes = new Set(['community', 'news'])
    const postType: 'community' | 'news' = allowedTypes.has(rawPostType || '') ? (rawPostType as 'community' | 'news') : 'community'

    if (typeof rawTitle !== 'string' || rawTitle.trim().length < MIN_TITLE_LENGTH) {
      return NextResponse.json(
        { success: false, error: `제목은 최소 ${MIN_TITLE_LENGTH}자 이상 작성해주세요.` },
        { status: 400 }
      )
    }

    if (typeof rawContent !== 'string' || rawContent.trim().length < MIN_CONTENT_LENGTH) {
      return NextResponse.json(
        { success: false, error: `내용은 최소 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요.` },
        { status: 400 }
      )
    }

    const parsedCategoryId = Number(rawCategoryId)
    if (!Number.isFinite(parsedCategoryId)) {
      return NextResponse.json(
        { success: false, error: 'category_id는 필수 항목입니다.' },
        { status: 400 }
      )
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, admin_yn')
      .eq('id', user.id)
      .maybeSingle()

    const isAdmin = profile?.admin_yn === 'Y' || profile?.role === 'admin'

    if (postType === 'news' && !isAdmin) {
      return NextResponse.json(
        { success: false, error: '관리자만 기사/소식 게시글을 작성할 수 있습니다.' },
        { status: 403 }
      )
    }

    const sanitizedTitle = rawTitle.trim().slice(0, 120)
    const sanitizedContent = rawContent.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').trim()

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: sanitizedTitle,
        content: sanitizedContent,
        category_id: parsedCategoryId,
        author_id: user.id,
        post_type: postType,
        tags,
        is_published: true,
      })
      .select(
        `
          id,
          created_at,
          updated_at,
          helpful_count,
          comment_count,
          tags,
          post_type,
          category:categories (
            id,
            name,
            slug,
            icon
          )
        `
      )
      .single()

    if (error) {
      console.error('[/api/posts] insert error:', error)
      return NextResponse.json(
        {
          success: false,
          error: '정보 글 등록에 실패했습니다.',
          code: error.code,
          details: error.message,
          hint: error.hint,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[/api/posts] unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '정보 글 등록에 실패했습니다.',
        details: error?.message,
      },
      { status: 500 }
    )
  }
}

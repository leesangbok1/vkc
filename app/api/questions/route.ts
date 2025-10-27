import { NextRequest, NextResponse } from 'next/server'
import { listQuestions } from '@/lib/services/questions.service'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const rawSort = url.searchParams.get('sort')
    const allowedSorts = new Set(['popular','recent'])
    const sort = (rawSort && allowedSorts.has(rawSort)) ? (rawSort as 'popular'|'recent') : (rawSort ? undefined : 'popular')
    if (!sort) {
      return NextResponse.json({ error: 'Invalid sort parameter', allowed: Array.from(allowedSorts) }, { status: 400 })
    }
    const category = url.searchParams.get('category') || undefined
    const author = url.searchParams.get('author') || undefined
    const following = url.searchParams.get('following') === 'true'
    const limit = Number(url.searchParams.get('limit') || 20)
    const offset = Number(url.searchParams.get('offset') || 0)
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    let userId: string | null = user?.id || null
    if (following && !userId) {
      return NextResponse.json({ error: 'Authentication required for following feed' }, { status: 401 })
    }

    const baseParams = { sort, category, authorId: author, following, limit, offset, userId }
    let { items, page, limit: pageSize, total } = await listQuestions(baseParams)
    let appliedSort: 'popular' | 'recent' = sort

    if (sort === 'popular' && items.length > 0) {
      const hasMeaningfulScore = items.some((item) => (item.metrics?.score ?? 0) >= 0.1)
      if (!hasMeaningfulScore) {
        const fallback = await listQuestions({ ...baseParams, sort: 'recent' })
        items = fallback.items
        page = fallback.page
        pageSize = fallback.limit
        total = fallback.total
        appliedSort = 'recent'
      }
    }

    return NextResponse.json({
      success: true,
      data: items,
      items,
      sort: appliedSort,
      pagination: {
        page,
        limit: pageSize,
        count: typeof total === 'number' ? total : items.length,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error: any) {
    console.error('[/api/questions] error:', {
      query: Object.fromEntries(new URL(request.url).searchParams.entries()),
      message: error?.message,
      code: error?.code,
    })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch questions',
        code: error?.code,
        details: error?.message,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const rawTitle = body?.title
    const rawContent = body?.content
    const rawCategoryId = body?.category_id ?? body?.categoryId

    if (typeof rawTitle !== 'string' || rawTitle.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: '제목은 최소 5자 이상 입력해야 하는 필수 항목입니다.' },
        { status: 400 }
      )
    }

    if (typeof rawContent !== 'string' || rawContent.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: '본문은 최소 10자 이상 입력해야 하는 필수 항목입니다.' },
        { status: 400 }
      )
    }

    const parsedCategory = parseInt(String(rawCategoryId), 10)
    if (Number.isNaN(parsedCategory)) {
      return NextResponse.json(
        { success: false, error: 'category_id는 필수 항목입니다.' },
        { status: 400 }
      )
    }

    const sanitizedTitle = rawTitle.trim().slice(0, 120)
    const sanitizedContent = rawContent.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').trim()
    const tags = Array.isArray(body?.tags) ? body.tags.slice(0, 10) : []

    const basePayload = {
      id: crypto.randomUUID(),
      title: sanitizedTitle,
      content: sanitizedContent,
      category_id: parsedCategory,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('questions')
      .insert({
        title: sanitizedTitle,
        content: sanitizedContent,
        category_id: parsedCategory,
        author_id: user.id,
        tags,
        status: 'open',
        is_approved: true,
      })
      .select('id, created_at, updated_at')
      .single()

    if (error) {
      console.error('[POST /api/questions] insert error', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create question',
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
        data: {
          ...basePayload,
          id: data.id,
          created_at: data.created_at ?? basePayload.created_at,
          updated_at: data.updated_at ?? basePayload.updated_at,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[POST /api/questions] unexpected error', { message: error?.message })
    return NextResponse.json(
      { success: false, error: 'Failed to create question', details: error?.message },
      { status: 500 }
    )
  }
}

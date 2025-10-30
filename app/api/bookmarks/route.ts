import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'

const ALLOWED_TARGET_TYPES = new Set(['question', 'answer', 'post'])
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS })
    }

    const url = new URL(request.url)
    const filterTargetId = url.searchParams.get('target_id')
    const filterTargetTypeRaw = url.searchParams.get('target_type')
    const filterTargetType = filterTargetTypeRaw
      ? filterTargetTypeRaw.trim().toLowerCase()
      : null

    let query = supabase
      .from('bookmarks')
      .select('id, target_id, target_type, title, content, created_at')
      .eq('user_id', user.id)

    if (filterTargetId) {
      query = query.eq('target_id', filterTargetId)
    }

    if (filterTargetType && ALLOWED_TARGET_TYPES.has(filterTargetType)) {
      query = query.eq('target_type', filterTargetType)
    }

    if (!filterTargetId && !filterTargetType) {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Forbidden', details: 'Bookmark access is restricted by policy.' },
          { status: 403, headers: NO_CACHE_HEADERS }
        )
      }
      console.error('[GET /api/bookmarks] failed', error)
      return NextResponse.json(
        { error: 'Failed to load bookmarks', details: error.message },
        { status: 500, headers: NO_CACHE_HEADERS }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: data ?? [],
      },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    console.error('[GET /api/bookmarks] unexpected error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const targetId = typeof body?.target_id === 'string' ? body.target_id.trim() : ''
    const targetType = typeof body?.target_type === 'string' ? body.target_type.trim().toLowerCase() : ''
    const rawTitle = typeof body?.title === 'string' ? body.title : null
    const rawContent = typeof body?.content === 'string' ? body.content : null

    if (!targetId || !ALLOWED_TARGET_TYPES.has(targetType)) {
      return NextResponse.json(
        { error: 'target_id and valid target_type are required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS })
    }

    const sanitizedTitle = rawTitle ? ValidationUtils.sanitizeInput(rawTitle, 200) : null
    const sanitizedContent = rawContent ? ValidationUtils.sanitizeContent(rawContent, 2000) : null

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        target_id: targetId,
        target_type: targetType as 'question' | 'answer' | 'post',
        title: sanitizedTitle,
        content: sanitizedContent
      })
      .select('id, target_id, target_type, title, content, created_at')
      .single()

    if (error) {
      const message = String(error.message || '')
      if (message.includes('duplicate') || message.includes('unique')) {
        // Fetch existing row to return consistent payload
        const { data: existing } = await supabase
          .from('bookmarks')
          .select('id, target_id, target_type, title, content, created_at')
          .eq('user_id', user.id)
          .eq('target_id', targetId)
          .eq('target_type', targetType)
          .maybeSingle()

        if (existing) {
          return NextResponse.json(
            { success: true, data: existing },
            { status: 200, headers: NO_CACHE_HEADERS }
          )
        }

        return NextResponse.json(
          { error: 'Bookmark already exists' },
          { status: 409, headers: NO_CACHE_HEADERS }
        )
      }

      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Forbidden', details: 'Bookmark write blocked by policy.' },
          { status: 403, headers: NO_CACHE_HEADERS }
        )
      }

      console.error('[POST /api/bookmarks] insert failed', error)
      return NextResponse.json(
        { error: 'Failed to add bookmark', details: error.message },
        { status: 500, headers: NO_CACHE_HEADERS }
      )
    }

    return NextResponse.json({ success: true, data }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('[POST /api/bookmarks] unexpected error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}

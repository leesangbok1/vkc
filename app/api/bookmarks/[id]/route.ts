import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!ValidationUtils.validateId(id)) {
      return NextResponse.json({ error: 'Invalid bookmark id' }, { status: 400, headers: NO_CACHE_HEADERS })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS })
    }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Forbidden', details: 'Bookmark delete blocked by policy.' },
          { status: 403, headers: NO_CACHE_HEADERS }
        )
      }
      console.error('[DELETE /api/bookmarks/:id] failed', error)
      return NextResponse.json(
        { error: 'Failed to remove bookmark', details: error.message },
        { status: 500, headers: NO_CACHE_HEADERS }
      )
    }

    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('[DELETE /api/bookmarks/:id] unexpected error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}

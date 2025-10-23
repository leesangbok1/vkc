import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const trimmedId = id.trim()

    if (!trimmedId || !UUID_REGEX.test(trimmedId)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        post_type,
        helpful_count,
        comment_count,
        tags,
        created_at,
        updated_at,
        is_published,
        category:categories!posts_category_id_fkey (
          id,
          name,
          slug,
          icon
        ),
        author:users!posts_author_id_fkey (
          id,
          name,
          role,
          avatar_url,
          visa_type,
          years_in_korea
        )
      `)
      .eq('id', trimmedId)
      .maybeSingle()

    if (error) {
      console.error('[GET /api/posts/:id] failed', error)
      return NextResponse.json({ error: 'Failed to load post' }, { status: 500 })
    }

    if (!post || post.is_published === false) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    console.error('[GET /api/posts/:id] unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

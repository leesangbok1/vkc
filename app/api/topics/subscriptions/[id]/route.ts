import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const identifier = id.trim()

    if (!identifier) {
      return NextResponse.json({ error: 'Invalid identifier' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('topic_subscriptions')
      .delete()
      .eq('user_id', user.id)

    if (UUID_REGEX.test(identifier)) {
      query = query.eq('id', identifier)
    } else if (/^\d+$/.test(identifier)) {
      query = query.eq('category_id', Number(identifier))
    } else {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', identifier.toLowerCase())
        .maybeSingle()

      if (categoryError) {
        console.error('[DELETE /api/topics/subscriptions/:id] category lookup failed', categoryError)
        return NextResponse.json({ error: 'Failed to resolve category' }, { status: 400 })
      }

      if (!category?.id) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      query = query.eq('category_id', category.id)
    }

    const { error } = await query

    if (error) {
      console.error('[DELETE /api/topics/subscriptions/:id] failed', error)
      return NextResponse.json({ error: 'Failed to unsubscribe from topic' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/topics/subscriptions/:id] unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

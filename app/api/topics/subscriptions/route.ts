import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('topic_subscriptions')
      .select(`
        id,
        category_id,
        created_at,
        category:categories!topic_subscriptions_category_id_fkey (
          id,
          name,
          slug,
          description,
          icon
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/topics/subscriptions] failed', error)
      return NextResponse.json({ error: 'Failed to load subscriptions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data ?? []
    })
  } catch (error) {
    console.error('[GET /api/topics/subscriptions] unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const categoryIdRaw = body?.category_id ?? body?.categoryId
    const categorySlugRaw = typeof body?.category_slug === 'string' ? body.category_slug : body?.slug

    let categoryId: number | null = null
    if (typeof categoryIdRaw === 'number') {
      categoryId = categoryIdRaw
    } else if (typeof categoryIdRaw === 'string') {
      const parsed = Number(categoryIdRaw)
      if (Number.isFinite(parsed)) {
        categoryId = parsed
      }
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve category by slug if necessary
    if (!categoryId && typeof categorySlugRaw === 'string' && categorySlugRaw.trim().length > 0) {
      const slug = ValidationUtils.sanitizeInput(categorySlugRaw, 60).toLowerCase()
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (categoryError) {
        console.error('[POST /api/topics/subscriptions] category lookup failed', categoryError)
        return NextResponse.json({ error: 'Failed to resolve category' }, { status: 400 })
      }

      categoryId = category?.id ?? null
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'category_id or valid category_slug is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('topic_subscriptions')
      .insert({ user_id: user.id, category_id: categoryId })
      .select(`
        id,
        category_id,
        created_at,
        category:categories!topic_subscriptions_category_id_fkey (
          id,
          name,
          slug,
          description,
          icon
        )
      `)
      .single()

    if (error) {
      const message = String(error.message || '')
      if (message.includes('duplicate') || message.includes('unique')) {
        const { data: existing } = await supabase
          .from('topic_subscriptions')
          .select(`
            id,
            category_id,
            created_at,
            category:categories!topic_subscriptions_category_id_fkey (
              id,
              name,
              slug,
              description,
              icon
            )
          `)
          .eq('user_id', user.id)
          .eq('category_id', categoryId)
          .maybeSingle()

        if (existing) {
          return NextResponse.json({ success: true, data: existing }, { status: 200 })
        }

        return NextResponse.json(
          { error: 'Subscription already exists' },
          { status: 409 }
        )
      }

      console.error('[POST /api/topics/subscriptions] insert failed', error)
      return NextResponse.json({ error: 'Failed to subscribe to topic' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[POST /api/topics/subscriptions] unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

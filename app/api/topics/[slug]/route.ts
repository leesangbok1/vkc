import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const sanitizedSlug = ValidationUtils.sanitizeInput(slug, 80).toLowerCase()
    if (!sanitizedSlug) {
      return NextResponse.json({ error: 'Invalid topic slug' }, { status: 400 })
    }

    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(Number(limitParam) || 0, 1), 50) : 20
    const sort = (url.searchParams.get('sort') || 'recent').toLowerCase()

    const supabase = await createSupabaseServerClient()

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, slug, description, icon, color, parent_id, sort_order')
      .eq('slug', sanitizedSlug)
      .maybeSingle()

    if (categoryError) {
      console.error('[GET /api/topics/:slug] category lookup failed', categoryError)
      return NextResponse.json({ error: 'Failed to load topic' }, { status: 500 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    const { count: totalQuestions, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)

    if (countError) {
      console.warn('[GET /api/topics/:slug] question count failed', countError)
    }

    let questionQuery = supabase
      .from('questions')
      .select(`
        id,
        title,
        content,
        author_id,
        answer_count,
        view_count,
        helpful_count,
        created_at,
        updated_at,
        status,
        author:users!questions_author_id_fkey (
          id,
          name,
          role,
          avatar_url
        )
      `)
      .eq('category_id', category.id)
      .eq('is_approved', true)
      .limit(limit)

    if (sort === 'popular') {
      questionQuery = questionQuery
        .order('helpful_count', { ascending: false, nullsLast: true })
        .order('view_count', { ascending: false })
        .order('created_at', { ascending: false })
    } else {
      questionQuery = questionQuery.order('created_at', { ascending: false })
    }

    const { data: questions, error: questionError } = await questionQuery

    if (questionError) {
      console.error('[GET /api/topics/:slug] question query failed', questionError)
      return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        category: {
          ...category,
          questionCount: totalQuestions ?? 0
        },
        questions: questions ?? []
      }
    })
  } catch (error) {
    console.error('[GET /api/topics/:slug] unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase-server'

type RouteParams = { id: string }

export async function GET(_request: NextRequest, { params }: { params: Promise<RouteParams> }) {
  try {
    const { id } = await params
    const supabase = createSupabaseServiceClient()

    const {
      data: userRow,
      error: userError,
    } = await supabase
      .from('users')
      .select(
        `
          id,
          email,
          name,
          avatar_url,
          bio,
          role,
          verification_status,
          verification_type,
          visa_type,
          company,
          years_in_korea,
          region,
          specialty_areas,
          preferred_language,
          verified_at,
          verification_expires_at,
          is_verified,
          trust_score,
          question_count,
          answer_count,
          helpful_answer_count,
          last_active,
          created_at,
          updated_at
        `
      )
      .eq('id', id)
      .maybeSingle()

    if (userError) {
      console.error('[GET /api/users/:id] user query failed', userError)
      return NextResponse.json(
        { success: false, error: 'Failed to load user', details: userError.message },
        { status: 500 }
      )
    }

    if (!userRow) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const { data: questionRows, error: questionsError } = await supabase
      .from('questions')
      .select(
        `
          id,
          title,
          content,
          created_at,
          answer_count,
          upvote_count,
          view_count
        `
      )
      .eq('author_id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (questionsError) {
      console.error('[GET /api/users/:id] question query failed', questionsError)
    }

    let postsRows: any[] = []
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(
          `
            id,
            title,
            content,
            created_at,
            helpful_count,
            comment_count,
            view_count
          `
        )
        .eq('author_id', id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (postsError) {
        console.warn('[GET /api/users/:id] posts query failed', postsError.message)
      } else {
        postsRows = postsData || []
      }
    } catch (error: any) {
      console.warn('[GET /api/users/:id] posts query threw', error?.message)
    }

    const { data: answersRows, error: answersError } = await supabase
      .from('answers')
      .select(
        `
          id,
          content,
          created_at,
          helpful_count,
          upvote_count,
          question_id,
          question:questions!answers_question_id_fkey (
            id,
            title
          )
        `
      )
      .eq('author_id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (answersError) {
      console.error('[GET /api/users/:id] answers query failed', answersError)
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userRow,
        activity: {
          questions: (questionRows || []).map((row) => ({
            id: row.id,
            title: row.title,
            content: row.content,
            answerCount: row.answer_count ?? 0,
            votes: row.upvote_count ?? 0,
            views: row.view_count ?? 0,
            createdAt: row.created_at,
          })),
          posts: postsRows.map((row) => ({
            id: row.id,
            title: row.title,
            content: row.content,
            votes: row.helpful_count ?? 0,
            commentCount: row.comment_count ?? 0,
            views: row.view_count ?? 0,
            createdAt: row.created_at,
          })),
          answers: (answersRows || []).map((row) => ({
            id: row.id,
            content: row.content,
            helpful: row.helpful_count ?? row.upvote_count ?? 0,
            questionId: row.question_id,
            questionTitle: row.question?.title ?? null,
            createdAt: row.created_at,
          })),
        },
      },
    })
  } catch (error: any) {
    console.error('[GET /api/users/:id] unexpected error', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}

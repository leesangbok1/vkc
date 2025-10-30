import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server'

interface RouteParams {
  params: Promise<{ id: string }>
}

type HelpfulResponse = {
  success: boolean
  isHelpful: boolean
  helpfulCount: number
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id: questionId } = await params

    if (!questionId) {
      return NextResponse.json({ error: 'Invalid question id' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: questionRow, error: questionError } = await supabase
      .from('questions')
      .select('author_id')
      .eq('id', questionId)
      .maybeSingle()

    if (questionError) {
      return NextResponse.json(
        { error: 'Failed to load question', details: questionError.message },
        { status: 500 }
      )
    }

    if (questionRow?.author_id === user.id) {
      return NextResponse.json(
        { error: '자신의 질문에는 도움됨을 표시할 수 없습니다.' },
        { status: 400 }
      )
    }

    const {
      data: existingVote,
      error: voteError,
    } = await supabase
      .from('votes')
      .select('id, vote_type')
      .eq('user_id', user.id)
      .eq('target_id', questionId)
      .eq('target_type', 'question')
      .maybeSingle()

    if (voteError) {
      return NextResponse.json(
        { error: 'Failed to fetch vote', details: voteError.message },
        { status: 500 }
      )
    }

    let isHelpful = false

    if (existingVote?.vote_type === 'helpful') {
      const { error: deleteError } = await supabase.from('votes').delete().eq('id', existingVote.id)
      if (deleteError) {
        return NextResponse.json(
          { error: 'Failed to remove vote', details: deleteError.message },
          { status: 500 }
        )
      }
    } else if (existingVote) {
      const { error: updateError } = await supabase
        .from('votes')
        .update({ vote_type: 'helpful' })
        .eq('id', existingVote.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update vote', details: updateError.message },
          { status: 500 }
        )
      }
      isHelpful = true
    } else {
      const { error: insertError } = await supabase.from('votes').insert({
        user_id: user.id,
        target_id: questionId,
        target_type: 'question',
        vote_type: 'helpful',
      })

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to record vote', details: insertError.message },
          { status: 500 }
        )
      }
      isHelpful = true
    }

    let serviceClient
    try {
      serviceClient = createSupabaseServiceClient()
    } catch (serviceError) {
      console.warn('[questions helpful] service client unavailable, falling back', serviceError)
      serviceClient = supabase
    }
    const {
      count: helpfulCount,
      error: countError,
    } = await serviceClient
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('target_id', questionId)
      .eq('target_type', 'question')
      .eq('vote_type', 'helpful')

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to aggregate helpful count', details: countError.message },
        { status: 500 }
      )
    }

    const totalHelpful = helpfulCount ?? 0

    const { error: updateQuestionError } = await serviceClient
      .from('questions')
      .update({ helpful_count: totalHelpful })
      .eq('id', questionId)

    if (updateQuestionError) {
      return NextResponse.json(
        { error: 'Failed to update question helpful count', details: updateQuestionError.message },
        { status: 500 }
      )
    }

    const payload: HelpfulResponse = {
      success: true,
      isHelpful,
      helpfulCount: totalHelpful,
    }

    return NextResponse.json(payload)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to toggle helpful state', details: error?.message },
      { status: 500 }
    )
  }
}

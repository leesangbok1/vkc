import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server'

type RouteParams = {
  params: Promise<{ id: string }>
}

type HelpfulToggleResponse = {
  success: boolean
  helpfulCount: number
  isHelpful: boolean
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params
    if (!postId) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: postRow, error: postError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .maybeSingle()

    if (postError) {
      return NextResponse.json(
        { error: '게시글 정보를 불러오지 못했습니다.', details: postError.message },
        { status: 500 }
      )
    }

    if (!postRow) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (postRow.author_id === user.id) {
      return NextResponse.json(
        { error: '자신의 게시글에는 도움됨을 표시할 수 없습니다.' },
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
      .eq('target_id', postId)
      .eq('target_type', 'post')
      .maybeSingle()

    if (voteError) {
      return NextResponse.json(
        { error: '도움됨 정보를 불러오지 못했습니다.', details: voteError.message },
        { status: 500 }
      )
    }

    let isHelpful = false

    if (existingVote?.vote_type === 'helpful') {
      const { error: deleteError } = await supabase.from('votes').delete().eq('id', existingVote.id)
      if (deleteError) {
        return NextResponse.json(
          { error: '도움됨 취소 중 오류가 발생했습니다.', details: deleteError.message },
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
          { error: '도움됨 업데이트 중 오류가 발생했습니다.', details: updateError.message },
          { status: 500 }
        )
      }
      isHelpful = true
    } else {
      const { error: insertError } = await supabase.from('votes').insert({
        user_id: user.id,
        target_id: postId,
        target_type: 'post',
        vote_type: 'helpful',
      })
      if (insertError) {
        return NextResponse.json(
          { error: '도움됨 등록 중 오류가 발생했습니다.', details: insertError.message },
          { status: 500 }
        )
      }
      isHelpful = true
    }

    let helpfulCount = 0
    try {
      let serviceClient: ReturnType<typeof createSupabaseServiceClient> | null = null
      try {
        serviceClient = createSupabaseServiceClient()
      } catch (serviceClientError) {
        console.warn('[posts/helpful] service client unavailable; falling back to session client', serviceClientError)
      }

      const aggregateClient = serviceClient ?? supabase

      const { count, error: countError } = await aggregateClient
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', postId)
        .eq('target_type', 'post')
        .eq('vote_type', 'helpful')

      if (countError) {
        throw countError
      }

      helpfulCount = count ?? 0

      if (serviceClient) {
        const { error: updatePostError } = await serviceClient
          .from('posts')
          .update({ helpful_count: helpfulCount })
          .eq('id', postId)

        if (updatePostError) {
          console.warn('[posts/helpful] failed to update post helpful_count', updatePostError)
        }
      }
    } catch (aggregateError) {
      console.warn('[posts/helpful] aggregation failed', aggregateError)
    }

    const payload: HelpfulToggleResponse = {
      success: true,
      helpfulCount,
      isHelpful,
    }

    return NextResponse.json(payload)
  } catch (error: any) {
    console.error('[posts/helpful] unexpected error', error)
    return NextResponse.json(
      { error: '도움됨 처리 중 오류가 발생했습니다.', details: error?.message },
      { status: 500 }
    )
  }
}

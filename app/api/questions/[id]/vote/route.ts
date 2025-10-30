import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/questions/[id]/vote - 질문에 투표하기
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: questionId } = await params

    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return NextResponse.json(
        { error: 'Mock mode is no longer supported for /api/questions/[id]/vote. Disable NEXT_PUBLIC_MOCK_MODE to use this endpoint.' },
        { status: 503 }
      )
    }

    const { user, error: authError } = await getUser(request)
    if (!user) {
      return NextResponse.json(
        { error: authError || 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    const body = await request.json()
    const { vote_type } = body // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(vote_type)) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be "upvote" or "downvote"' },
        { status: 400 }
      )
    }

    // 질문이 존재하는지 확인
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, author_id, upvote_count, downvote_count')
      .eq('id', questionId)
      .single()

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // 자신의 질문에는 투표할 수 없음
    if (question.author_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot vote on your own question' },
        { status: 400 }
      )
    }

    // 기존 투표 확인
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_id', questionId)
      .eq('target_type', 'question')
      .single()

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      console.error('Vote check error:', voteCheckError)
      return NextResponse.json(
        { error: 'Failed to check existing vote' },
        { status: 500 }
      )
    }

    let newUpvoteCount = question.upvote_count
    let newDownvoteCount = question.downvote_count

    if (existingVote) {
      // 기존 투표가 있는 경우
      if (existingVote.vote_type === vote_type) {
        // 같은 투표 타입이면 투표 취소
        await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('target_id', questionId)
          .eq('target_type', 'question')

        // 카운트 감소
        if (vote_type === 'upvote') {
          newUpvoteCount = Math.max(0, newUpvoteCount - 1)
        } else {
          newDownvoteCount = Math.max(0, newDownvoteCount - 1)
        }
      } else {
        // 다른 투표 타입이면 투표 변경
        await supabase
          .from('votes')
          .update({ vote_type, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('target_id', questionId)
          .eq('target_type', 'question')

        // 카운트 조정
        if (vote_type === 'upvote') {
          newUpvoteCount += 1
          newDownvoteCount = Math.max(0, newDownvoteCount - 1)
        } else {
          newDownvoteCount += 1
          newUpvoteCount = Math.max(0, newUpvoteCount - 1)
        }
      }
    } else {
      // 새로운 투표
      await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          target_id: questionId,
          target_type: 'question',
          vote_type
        })

      // 카운트 증가
      if (vote_type === 'upvote') {
        newUpvoteCount += 1
      } else {
        newDownvoteCount += 1
      }
    }

    // 질문의 투표 수 업데이트
    const { error: updateError } = await supabase
      .from('questions')
      .update({
        upvote_count: newUpvoteCount,
        downvote_count: newDownvoteCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)

    if (updateError) {
      console.error('Question vote count update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update vote count' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        question_id: questionId,
        vote_type: existingVote?.vote_type === vote_type ? null : vote_type,
        upvote_count: newUpvoteCount,
        downvote_count: newDownvoteCount,
        vote_score: newUpvoteCount - newDownvoteCount
      },
      message: existingVote?.vote_type === vote_type ? 'Vote removed' : 'Vote recorded'
    })

  } catch (error) {
    console.error('Vote API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/questions/[id]/vote/status - 사용자의 투표 상태 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: questionId } = await params

    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return NextResponse.json(
        { error: 'Mock mode is no longer supported for /api/questions/[id]/vote/status. Disable NEXT_PUBLIC_MOCK_MODE to use this endpoint.' },
        { status: 503 }
      )
    }

    const { user, error: authError } = await getUser(request)
    if (!user) {
      return NextResponse.json(
        { error: authError || 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // 사용자의 투표 상태 조회
    const { data: vote, error } = await supabase
      .from('votes')
      .select('vote_type, created_at')
      .eq('user_id', user.id)
      .eq('target_id', questionId)
      .eq('target_type', 'question')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Vote status check error:', error)
      return NextResponse.json(
        { error: 'Failed to check vote status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        question_id: questionId,
        user_vote: vote?.vote_type || null,
        voted_at: vote?.created_at || null
      }
    })

  } catch (error) {
    console.error('Vote status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

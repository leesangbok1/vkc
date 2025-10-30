// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import type { Database } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ id: string }>
}

type AnswersTable = Database['public']['Tables']['answers']
type VotesTable = Database['public']['Tables']['votes']
type AnswerCountsRow = Pick<AnswersTable['Row'], 'id' | 'author_id' | 'upvote_count' | 'downvote_count' | 'helpful_count'>
type VoteRow = VotesTable['Row']
type VoteInsert = VotesTable['Insert']
type VoteUpdate = VotesTable['Update']
type AnswersUpdate = AnswersTable['Update']
type VoteStatusRow = Pick<VoteRow, 'vote_type' | 'created_at'>

// POST /api/answers/[id]/vote - 답변에 투표하기
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: answerId } = await params

    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return NextResponse.json(
        { error: 'Mock mode is no longer supported for /api/answers/[id]/vote. Disable NEXT_PUBLIC_MOCK_MODE to use this endpoint.' },
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
    const { vote_type } = body // 'upvote', 'downvote', or 'helpful'

    if (!['upvote', 'downvote', 'helpful'].includes(vote_type)) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be "upvote", "downvote", or "helpful"' },
        { status: 400 }
      )
    }

    // 답변이 존재하는지 확인
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .select('id, author_id, upvote_count, downvote_count, helpful_count')
      .eq('id', answerId)
      .single<AnswerCountsRow>()

    if (answerError || !answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    // 자신의 답변에는 투표할 수 없음
    if (answer.author_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot vote on your own answer' },
        { status: 400 }
      )
    }

    // 기존 투표 확인
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_id', answerId)
      .eq('target_type', 'answer')
      .maybeSingle()

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      console.error('Vote check error:', voteCheckError)
      return NextResponse.json(
        { error: 'Failed to check existing vote' },
        { status: 500 }
      )
    }

    let newUpvoteCount = answer.upvote_count ?? 0
    let newDownvoteCount = answer.downvote_count ?? 0
    let newHelpfulCount = answer.helpful_count ?? 0

    if (existingVote) {
      // 기존 투표가 있는 경우
      if (existingVote.vote_type === vote_type) {
        // 같은 투표 타입이면 투표 취소
      await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('target_id', answerId)
          .eq('target_type', 'answer')

        // 카운트 감소
        if (vote_type === 'upvote') {
          newUpvoteCount = Math.max(0, newUpvoteCount - 1)
        } else if (vote_type === 'downvote') {
          newDownvoteCount = Math.max(0, newDownvoteCount - 1)
        } else if (vote_type === 'helpful') {
          newHelpfulCount = Math.max(0, newHelpfulCount - 1)
        }
      } else {
        // 다른 투표 타입이면 투표 변경
        const updateVotePayload: VoteUpdate = {
          vote_type,
          updated_at: new Date().toISOString()
        }

        await supabase
          .from('votes')
          .update(updateVotePayload)
          .eq('user_id', user.id)
          .eq('target_id', answerId)
          .eq('target_type', 'answer')

        // 기존 투표 카운트 감소
        if (existingVote.vote_type === 'upvote') {
          newUpvoteCount = Math.max(0, newUpvoteCount - 1)
        } else if (existingVote.vote_type === 'downvote') {
          newDownvoteCount = Math.max(0, newDownvoteCount - 1)
        } else if (existingVote.vote_type === 'helpful') {
          newHelpfulCount = Math.max(0, newHelpfulCount - 1)
        }

        // 새 투표 카운트 증가
        if (vote_type === 'upvote') {
          newUpvoteCount += 1
        } else if (vote_type === 'downvote') {
          newDownvoteCount += 1
        } else if (vote_type === 'helpful') {
          newHelpfulCount += 1
        }
      }
    } else {
      // 새로운 투표
      const newVote: VoteInsert = {
        user_id: user.id,
        target_id: answerId,
        target_type: 'answer',
        vote_type,
        created_at: new Date().toISOString()
      }

      await supabase
        .from('votes')
        .insert(newVote)

      // 카운트 증가
      if (vote_type === 'upvote') {
        newUpvoteCount += 1
      } else if (vote_type === 'downvote') {
        newDownvoteCount += 1
      } else if (vote_type === 'helpful') {
        newHelpfulCount += 1
      }
    }

    // 답변의 투표 수 업데이트
    const answerUpdate: AnswersUpdate = {
      upvote_count: newUpvoteCount,
      downvote_count: newDownvoteCount,
      helpful_count: newHelpfulCount,
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('answers')
      .update(answerUpdate)
      .eq('id', answerId)

    if (updateError) {
      console.error('Answer vote count update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update vote count' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        answer_id: answerId,
        vote_type: existingVote?.vote_type === vote_type ? null : vote_type,
        upvote_count: newUpvoteCount,
        downvote_count: newDownvoteCount,
        helpful_count: newHelpfulCount,
        vote_score: newUpvoteCount - newDownvoteCount
      },
      message: existingVote?.vote_type === vote_type ? 'Vote removed' : 'Vote recorded'
    })

  } catch (error) {
    console.error('Answer vote API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/answers/[id]/vote/status - 사용자의 답변 투표 상태 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: answerId } = await params

    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return NextResponse.json(
        { error: 'Mock mode is no longer supported for /api/answers/[id]/vote/status. Disable NEXT_PUBLIC_MOCK_MODE to use this endpoint.' },
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
      .eq('target_id', answerId)
      .eq('target_type', 'answer')
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Answer vote status check error:', error)
      return NextResponse.json(
        { error: 'Failed to check vote status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        answer_id: answerId,
        user_vote: vote?.vote_type || null,
        voted_at: vote?.created_at || null
      }
    })

  } catch (error) {
    console.error('Answer vote status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

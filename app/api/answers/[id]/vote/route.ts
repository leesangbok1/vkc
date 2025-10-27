import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/answers/[id]/vote - 답변에 투표하기
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: answerId } = await params

    // Mock mode 체크 (테스트 환경)
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return postMockVote(request, answerId)
    }

    const { user, error: authError } = await getUser(request)
    if (!user) {
      return NextResponse.json(
        { error: authError || 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

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
      .single()

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
      .single()

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      console.error('Vote check error:', voteCheckError)
      return NextResponse.json(
        { error: 'Failed to check existing vote' },
        { status: 500 }
      )
    }

    let newUpvoteCount = answer.upvote_count
    let newDownvoteCount = answer.downvote_count
    let newHelpfulCount = answer.helpful_count

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
        await supabase
          .from('votes')
          .update({ vote_type, updated_at: new Date().toISOString() })
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
      await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          target_id: answerId,
          target_type: 'answer',
          vote_type
        })

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
    const { error: updateError } = await supabase
      .from('answers')
      .update({
        upvote_count: newUpvoteCount,
        downvote_count: newDownvoteCount,
        helpful_count: newHelpfulCount,
        updated_at: new Date().toISOString()
      })
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

    // Mock mode 체크 (테스트 환경)
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return getMockVoteStatus(answerId)
    }

    const { user, error: authError } = await getUser(request)
    if (!user) {
      return NextResponse.json(
        { error: authError || 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // 사용자의 투표 상태 조회
    const { data: vote, error } = await supabase
      .from('votes')
      .select('vote_type, created_at')
      .eq('user_id', user.id)
      .eq('target_id', answerId)
      .eq('target_type', 'answer')
      .single()

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

// Mock 함수들 (테스트 환경용)
async function postMockVote(request: NextRequest, answerId: string) {
  try {
    const body = await request.json()
    const { vote_type } = body

    if (!['upvote', 'downvote', 'helpful'].includes(vote_type)) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be "upvote", "downvote", or "helpful"' },
        { status: 400 }
      )
    }

    // Mock 투표 결과
    const mockVoteResult = {
      answer_id: answerId,
      vote_type,
      upvote_count: vote_type === 'upvote' ? 9 : 8,
      downvote_count: vote_type === 'downvote' ? 1 : 0,
      helpful_count: vote_type === 'helpful' ? 7 : 6,
      vote_score: vote_type === 'upvote' ? 9 : (vote_type === 'downvote' ? 7 : 8)
    }

    return NextResponse.json({
      success: true,
      data: mockVoteResult,
      message: 'Vote recorded'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

function getMockVoteStatus(answerId: string) {
  const mockVoteStatus = {
    answer_id: answerId,
    user_vote: 'helpful', // 사용자가 이미 helpful 표시했다고 가정
    voted_at: '2024-01-15T14:30:00Z'
  }

  return NextResponse.json({
    success: true,
    data: mockVoteStatus
  })
}
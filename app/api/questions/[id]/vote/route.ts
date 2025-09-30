import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// POST /api/questions/[id]/vote - 질문 추천/비추천 토글
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const questionId = params.id

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 요청 본문 파싱
    const body = await request.json()
    const { vote_type } = body // 'up' | 'down' | 'cancel'

    if (!vote_type || !['up', 'down', 'cancel'].includes(vote_type)) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be "up", "down", or "cancel"' },
        { status: 400 }
      )
    }

    // 질문 존재 확인
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, author_id, vote_score')
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
        { error: 'You cannot vote on your own question' },
        { status: 400 }
      )
    }

    // 기존 투표 확인
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id, vote_type')
      .eq('target_id', questionId)
      .eq('target_type', 'question')
      .eq('user_id', user.id)
      .single()

    let voteScoreChange = 0
    let newVoteType = vote_type

    // 투표 로직 처리
    if (vote_type === 'cancel') {
      // 투표 취소
      if (existingVote) {
        // 기존 투표 삭제
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id)

        if (deleteError) {
          console.error('Vote deletion error:', deleteError)
          return NextResponse.json(
            { error: 'Failed to cancel vote' },
            { status: 500 }
          )
        }

        // 점수 변화 계산
        voteScoreChange = existingVote.vote_type === 'up' ? -1 : 1
        newVoteType = null
      } else {
        return NextResponse.json(
          { error: 'No vote to cancel' },
          { status: 400 }
        )
      }
    } else {
      // 추천/비추천
      if (existingVote) {
        if (existingVote.vote_type === vote_type) {
          // 같은 투표 타입이면 취소
          const { error: deleteError } = await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id)

          if (deleteError) {
            console.error('Vote deletion error:', deleteError)
            return NextResponse.json(
              { error: 'Failed to update vote' },
              { status: 500 }
            )
          }

          voteScoreChange = vote_type === 'up' ? -1 : 1
          newVoteType = null
        } else {
          // 다른 투표 타입이면 변경
          const { error: updateError } = await supabase
            .from('votes')
            .update({
              vote_type,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingVote.id)

          if (updateError) {
            console.error('Vote update error:', updateError)
            return NextResponse.json(
              { error: 'Failed to update vote' },
              { status: 500 }
            )
          }

          // up -> down: -2점, down -> up: +2점
          voteScoreChange = vote_type === 'up' ? 2 : -2
        }
      } else {
        // 새 투표 생성
        const { error: insertError } = await supabase
          .from('votes')
          .insert([{
            target_id: questionId,
            target_type: 'question',
            user_id: user.id,
            vote_type,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (insertError) {
          console.error('Vote creation error:', insertError)
          return NextResponse.json(
            { error: 'Failed to create vote' },
            { status: 500 }
          )
        }

        voteScoreChange = vote_type === 'up' ? 1 : -1
      }
    }

    // 질문의 투표 점수 업데이트
    const newVoteScore = (question.vote_score || 0) + voteScoreChange
    const { error: updateQuestionError } = await supabase
      .from('questions')
      .update({
        vote_score: newVoteScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)

    if (updateQuestionError) {
      console.error('Question vote score update error:', updateQuestionError)
      return NextResponse.json(
        { error: 'Failed to update question score' },
        { status: 500 }
      )
    }

    // 질문 작성자의 신뢰도 점수 업데이트 (추천시 +2, 비추천시 -1)
    if (voteScoreChange !== 0) {
      const trustScoreChange = vote_type === 'up' ? 2 : (vote_type === 'down' ? -1 : 0)

      if (trustScoreChange !== 0) {
        await supabase
          .from('users')
          .update({
            trust_score: supabase.rpc('adjust_trust_score', { adjustment: trustScoreChange }),
            updated_at: new Date().toISOString()
          })
          .eq('id', question.author_id)
      }
    }

    // 현재 투표 상태 조회
    const { data: voteStats } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('target_id', questionId)
      .eq('target_type', 'question')

    const upVotes = voteStats?.filter(v => v.vote_type === 'up').length || 0
    const downVotes = voteStats?.filter(v => v.vote_type === 'down').length || 0

    return NextResponse.json({
      data: {
        vote_type: newVoteType,
        vote_score: newVoteScore,
        up_votes: upVotes,
        down_votes: downVotes,
        user_vote: newVoteType
      },
      message: 'Vote updated successfully'
    })

  } catch (error) {
    console.error('Vote API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// POST /api/answers/[id]/helpful - 답변을 도움이 되는 답변으로 표시
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    const answerId = id

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 답변 정보 조회
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .select('id, author_id, is_helpful')
      .eq('id', answerId)
      .single()

    if (answerError || !answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    // 자신의 답변은 도움이 되는 답변으로 표시할 수 없음
    if (answer.author_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot mark your own answer as helpful' },
        { status: 400 }
      )
    }

    // 이미 도움이 되는 답변으로 표시된 경우
    if (answer.is_helpful) {
      return NextResponse.json(
        { error: 'Answer is already marked as helpful' },
        { status: 400 }
      )
    }

    // 도움이 되는 답변으로 표시
    const { data: updatedAnswer, error: updateError } = await supabase
      .from('answers')
      .update({
        is_helpful: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', answerId)
      .select()
      .single()

    if (updateError) {
      console.error('Answer helpful update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to mark answer as helpful' },
        { status: 500 }
      )
    }

    // 답변 작성자의 신뢰도 점수 증가 (+5)
    await supabase
      .from('users')
      .update({
        trust_score: supabase.rpc('adjust_trust_score', { adjustment: 5 }),
        updated_at: new Date().toISOString()
      })
      .eq('id', answer.author_id)

    return NextResponse.json({
      data: updatedAnswer,
      message: 'Answer marked as helpful successfully'
    })

  } catch (error) {
    console.error('Answer helpful API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
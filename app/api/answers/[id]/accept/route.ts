import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// POST /api/answers/[id]/accept - 답변 채택
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const answerId = params.id

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
      .select(`
        id, question_id, author_id, is_accepted,
        question:questions!question_id(id, author_id)
      `)
      .eq('id', answerId)
      .single()

    if (answerError || !answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    // 질문 작성자만 답변을 채택할 수 있음
    if (answer.question.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the question author can accept answers' },
        { status: 403 }
      )
    }

    // 이미 채택된 답변인지 확인
    if (answer.is_accepted) {
      return NextResponse.json(
        { error: 'Answer is already accepted' },
        { status: 400 }
      )
    }

    // 기존에 채택된 답변이 있는지 확인하고 해제
    const { error: unacceptError } = await supabase
      .from('answers')
      .update({
        is_accepted: false,
        updated_at: new Date().toISOString()
      })
      .eq('question_id', answer.question_id)
      .eq('is_accepted', true)

    if (unacceptError) {
      console.error('Error unaccepting previous answer:', unacceptError)
    }

    // 새 답변 채택
    const { data: updatedAnswer, error: acceptError } = await supabase
      .from('answers')
      .update({
        is_accepted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', answerId)
      .select()
      .single()

    if (acceptError) {
      console.error('Answer accept error:', acceptError)
      return NextResponse.json(
        { error: 'Failed to accept answer' },
        { status: 500 }
      )
    }

    // 질문 상태를 'answered'로 변경
    await supabase
      .from('questions')
      .update({
        status: 'answered',
        updated_at: new Date().toISOString()
      })
      .eq('id', answer.question_id)

    // 답변 작성자의 신뢰도 점수 증가 (+10)
    await supabase
      .from('users')
      .update({
        trust_score: supabase.rpc('adjust_trust_score', { adjustment: 10 }),
        helpful_answer_count: supabase.rpc('increment_helpful_count'),
        updated_at: new Date().toISOString()
      })
      .eq('id', answer.author_id)

    return NextResponse.json({
      data: updatedAnswer,
      message: 'Answer accepted successfully'
    })

  } catch (error) {
    console.error('Answer accept API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
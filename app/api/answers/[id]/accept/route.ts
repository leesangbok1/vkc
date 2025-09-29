import { createSupabaseServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// PUT /api/answers/[id]/accept - 답변 채택
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()

  try {
    // 인증 확인
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 답변 정보 조회
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .select(`
        id,
        question_id,
        questions!inner (
          user_id
        )
      `)
      .eq('id', params.id)
      .single()

    if (answerError || !answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    // 질문 작성자만 답변을 채택할 수 있음
    if (answer.questions.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Only question author can accept answers' }, { status: 403 })
    }

    // 기존에 채택된 답변이 있다면 채택 해제
    await supabase
      .from('answers')
      .update({ is_accepted: false })
      .eq('question_id', answer.question_id)
      .eq('is_accepted', true)

    // 현재 답변을 채택
    const { data: updatedAnswer, error: updateError } = await supabase
      .from('answers')
      .update({ is_accepted: true })
      .eq('id', params.id)
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `)
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updatedAnswer)
  } catch (error) {
    console.error('Error accepting answer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
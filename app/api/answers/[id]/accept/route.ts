import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { AnswerWithAuthor, ApiResponse, Answer, Question, User } from '@/lib/types/api'

// POST /api/answers/[id]/accept - 답변 채택
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

    // 답변 정보 조회 (상세 정보 포함)
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .select(`
        id, question_id, author_id, is_accepted,
        question:questions!question_id(id, title, author_id),
        author:users!author_id(id, name, email, trust_score)
      `)
      .eq('id', answerId)
      .single() as {
        data: AnswerWithAuthor | null
        error: unknown
      }

    if (answerError || !answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    // 질문 작성자만 답변을 채택할 수 있음
    if (answer.question?.author_id !== user.id) {
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
    // @ts-ignore - Supabase type inference issue with schema
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
    // @ts-ignore - Supabase type inference issue with schema
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

    // 질문 상태를 '해결됨'으로 변경
    // @ts-ignore - Supabase type inference issue with schema
    await supabase
      .from('questions')
      .update({
        status: 'resolved',
        updated_at: new Date().toISOString()
      })
      .eq('id', answer.question_id)

    // 답변 작성자의 신뢰도 점수 증가 (+10)
    // @ts-ignore - Supabase type inference issue with schema
    await supabase
      .from('users')
      .update({
        // @ts-ignore - Supabase RPC type inference issue
        trust_score: supabase.rpc('adjust_trust_score', { adjustment: 10 }),
        // @ts-ignore - Supabase RPC type inference issue
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
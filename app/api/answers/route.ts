import { createSupabaseServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/answers - 새 답변 생성
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  try {
    // 인증 확인
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { question_id, content } = body

    // 유효성 검사
    if (!question_id || !content?.trim()) {
      return NextResponse.json(
        { error: 'Question ID and content are required' },
        { status: 400 }
      )
    }

    // 질문이 존재하는지 확인
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id')
      .eq('id', question_id)
      .single()

    if (questionError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // 답변 생성
    const { data: answer, error } = await supabase
      .from('answers')
      .insert([
        {
          question_id,
          user_id: session.user.id,
          content: content.trim(),
        },
      ])
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(answer, { status: 201 })
  } catch (error) {
    console.error('Error creating answer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
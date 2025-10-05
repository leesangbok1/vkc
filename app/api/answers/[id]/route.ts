import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'

// GET /api/answers/[id] - 특정 답변 조회
export async function GET(
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

    // 답변 조회 (상세 정보 포함)
    const { data: answer, error } = await supabase
      .from('answers')
      .select(`
        *,
        author:users!author_id(
          id, name, avatar_url, trust_score, badges,
          visa_type, company, years_in_korea, region,
          answer_count, helpful_answer_count
        ),
        question:questions!question_id(
          id, title, author_id,
          author:users!author_id(id, name)
        ),
        comments(
          id, content, created_at, updated_at,
          author:users!author_id(id, name, avatar_url)
        )
      `)
      .eq('id', answerId)
      .single()

    if (error || !answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: answer })

  } catch (error) {
    console.error('Answer fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/answers/[id] - 답변 수정 (소유자만)
export async function PUT(
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

    // 요청 본문 파싱
    const body = await request.json()
    const { content } = body

    // 답변 존재 및 소유권 확인
    const { data: existingAnswer, error: fetchError } = await supabase
      .from('answers')
      .select('id, author_id, question_id')
      .eq('id', answerId)
      .single()

    if (fetchError || !existingAnswer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    if (existingAnswer.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied. You can only edit your own answers' },
        { status: 403 }
      )
    }

    // 입력값 검증
    const sanitizedContent = ValidationUtils.sanitizeContent(content)
    if (!sanitizedContent) {
      return NextResponse.json(
        { error: 'Content cannot be empty' },
        { status: 400 }
      )
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Content must be 10,000 characters or less' },
        { status: 400 }
      )
    }

    // 답변 업데이트
    const { data: updatedAnswer, error: updateError } = await supabase
      .from('answers')
      .update({
        content: sanitizedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', answerId)
      .select(`
        *,
        author:users!author_id(id, name, avatar_url, trust_score, badges),
        question:questions!question_id(id, title)
      `)
      .single()

    if (updateError) {
      console.error('Answer update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update answer' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: updatedAnswer,
      message: 'Answer updated successfully'
    })

  } catch (error) {
    console.error('Answer update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/answers/[id] - 답변 삭제 (소유자만)
export async function DELETE(
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

    // 답변 존재 및 소유권 확인
    const { data: existingAnswer, error: fetchError } = await supabase
      .from('answers')
      .select('id, author_id, question_id, is_accepted')
      .eq('id', answerId)
      .single()

    if (fetchError || !existingAnswer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    if (existingAnswer.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied. You can only delete your own answers' },
        { status: 403 }
      )
    }

    // 채택된 답변은 삭제 불가
    if (existingAnswer.is_accepted) {
      return NextResponse.json(
        { error: 'Cannot delete an accepted answer' },
        { status: 400 }
      )
    }

    // 답변 삭제
    const { error: deleteError } = await supabase
      .from('answers')
      .delete()
      .eq('id', answerId)

    if (deleteError) {
      console.error('Answer delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete answer' },
        { status: 500 }
      )
    }

    // 질문의 답변 카운트 감소
    await supabase
      .from('questions')
      .update({
        answer_count: supabase.rpc('decrement_answer_count'),
        updated_at: new Date().toISOString()
      })
      .eq('id', existingAnswer.question_id)

    // 사용자 답변 카운트 감소
    await supabase
      .from('users')
      .update({
        answer_count: supabase.rpc('decrement_answer_count'),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json({
      message: 'Answer deleted successfully'
    })

  } catch (error) {
    console.error('Answer delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
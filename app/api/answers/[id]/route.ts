import { createSupabaseServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// PUT /api/answers/[id] - 답변 수정
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

    const body = await request.json()
    const { content } = body

    // 권한 확인 (작성자 또는 관리자만 수정 가능)
    const { data: existingAnswer, error: fetchError } = await supabase
      .from('answers')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    if (existingAnswer.user_id !== session.user.id) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (user?.role !== 'admin' && user?.role !== 'moderator') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // 답변 업데이트
    const updateData: any = { updated_at: new Date().toISOString() }
    if (content !== undefined) updateData.content = content.trim()

    const { data: answer, error } = await supabase
      .from('answers')
      .update(updateData)
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(answer)
  } catch (error) {
    console.error('Error updating answer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/answers/[id] - 답변 삭제
export async function DELETE(
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

    // 권한 확인
    const { data: existingAnswer, error: fetchError } = await supabase
      .from('answers')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    if (existingAnswer.user_id !== session.user.id) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (user?.role !== 'admin' && user?.role !== 'moderator') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // 답변 삭제
    const { error } = await supabase
      .from('answers')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Answer deleted successfully' })
  } catch (error) {
    console.error('Error deleting answer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/answers/[id]/comments - 답변의 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const answerId = params.id

    // Mock mode check
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
      console.log('Answer comments API running in mock mode')
      const mockComments = [
        {
          id: '1',
          content: '도움이 되는 답변이네요!',
          target_id: answerId,
          target_type: 'answer',
          author_id: 'user4',
          created_at: '2024-01-15T12:00:00Z',
          author: {
            id: 'user4',
            name: '최영희',
            avatar_url: null,
            trust_score: 90
          }
        }
      ]

      return NextResponse.json({ data: mockComments })
    }

    // 댓글 조회
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!author_id(
          id, name, avatar_url, trust_score, badges
        )
      `)
      .eq('target_id', answerId)
      .eq('target_type', 'answer')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Comments fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: comments || [] })

  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/answers/[id]/comments - 답변에 댓글 추가
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

    // 요청 본문 파싱
    const body = await request.json()
    const { content } = body

    // 입력값 검증
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content cannot be empty' },
        { status: 400 }
      )
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Content must be 500 characters or less' },
        { status: 400 }
      )
    }

    // 답변 존재 확인
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .select('id')
      .eq('id', answerId)
      .single()

    if (answerError || !answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    // 댓글 생성
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert([{
        target_id: answerId,
        target_type: 'answer',
        author_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        author:users!author_id(
          id, name, avatar_url, trust_score, badges
        )
      `)
      .single()

    if (insertError) {
      console.error('Comment creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: comment,
      message: 'Comment created successfully'
    })

  } catch (error) {
    console.error('Comment creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
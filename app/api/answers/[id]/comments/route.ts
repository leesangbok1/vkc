import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'
import { triggerAnswerCommentNotification } from '@/lib/services/notification-triggers'
import { createServerLogger } from '@/lib/utils/server-logger'

// GET /api/answers/[id]/comments - 답변의 댓글 목록 조회
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

const logger = createServerLogger('AnswerCommentsAPI', 'api')

// POST /api/answers/[id]/comments - 답변에 댓글 추가
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

    // 요청 본문 파싱
    const body = await request.json()
    const { content } = body

    // 입력값 검증
    const sanitizedContent = ValidationUtils.sanitizeContent(content, 2000)
    if (!sanitizedContent) {
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

    // 답변 정보 조회 (알림을 위한 상세 정보 포함)
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .select(`
        id, author_id,
        question:questions!question_id(id, title, author_id)
      `)
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
        content: sanitizedContent,
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
      logger.error('Comment creation error', insertError as Error, {
        action: 'createAnswerComment',
        answerId,
        severity: 'medium'
      })
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    // 댓글 알림 전송 (백그라운드)
    try {
      await triggerAnswerCommentNotification(
        comment,
        answer,
        answer.question as any,
        comment.author as any
      )

      logger.info('Answer comment notification triggered', {
        action: 'createAnswerComment',
        commentId: comment.id,
        answerId,
        questionId: (answer.question as any)?.id
      })
    } catch (notificationError) {
      // 알림 실패는 주요 기능에 영향을 주지 않음
      logger.error('Failed to send answer comment notification', notificationError as Error, {
        action: 'answerCommentNotification',
        commentId: comment.id,
        severity: 'low'
      })
    }

    return NextResponse.json({
      data: comment,
      message: 'Comment created successfully'
    })

  } catch (error) {
    logger.error('Comment creation API error', error as Error, {
      action: 'createAnswerCommentAPI',
      severity: 'high'
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
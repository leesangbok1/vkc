import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/questions/[id]/answers - 특정 질문의 답변 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const questionId = params.id
    const { searchParams } = new URL(request.url)

    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'best'

    // 오프셋 계산
    const offset = (page - 1) * limit

    // 질문 존재 확인
    const { data: question } = await supabase
      .from('questions')
      .select('id, title')
      .eq('id', questionId)
      .single()

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // 답변 쿼리 구성
    let query = supabase
      .from('answers')
      .select(`
        *,
        author:users!author_id(
          id, name, avatar_url, trust_score, badges,
          visa_type, company, years_in_korea, region,
          answer_count, helpful_answer_count
        ),
        comments(
          id, content, created_at,
          author:users!author_id(id, name, avatar_url)
        )
      `)
      .eq('question_id', questionId)

    // 정렬 적용
    if (sort === 'best') {
      // 최적 정렬: 채택된 답변 > 도움이 되는 답변 > 투표 점수 > 생성일
      query = query.order('is_accepted', { ascending: false })
                   .order('is_helpful', { ascending: false })
                   .order('vote_score', { ascending: false })
                   .order('created_at', { ascending: true })
    } else if (sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (sort === 'votes') {
      query = query.order('vote_score', { ascending: false })
    }

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1)

    const { data: answers, error, count } = await query

    if (error) {
      console.error('Answers fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch answers' },
        { status: 500 }
      )
    }

    // 총 페이지 수 계산
    const totalPages = count ? Math.ceil(count / limit) : 0

    return NextResponse.json({
      data: answers || [],
      question: {
        id: question.id,
        title: question.title
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Answers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/questions/[id]/answers - 새 답변 작성 (인증 필요)
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
    const { content, is_anonymous = false } = body

    // 입력값 검증
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Answer content is required' },
        { status: 400 }
      )
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Answer content must be 10,000 characters or less' },
        { status: 400 }
      )
    }

    // 질문 존재 확인
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, author_id, status')
      .eq('id', questionId)
      .single()

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // 질문 상태 확인 (닫힌 질문에는 답변 불가)
    if (question.status === 'closed' || question.status === 'deleted') {
      return NextResponse.json(
        { error: 'Cannot answer a closed or deleted question' },
        { status: 400 }
      )
    }

    // 자신의 질문에는 답변할 수 없음 (선택적 제한)
    if (question.author_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot answer your own question' },
        { status: 400 }
      )
    }

    // 중복 답변 확인 (같은 사용자가 같은 질문에 답변했는지)
    const { data: existingAnswer } = await supabase
      .from('answers')
      .select('id')
      .eq('question_id', questionId)
      .eq('author_id', user.id)
      .single()

    if (existingAnswer) {
      return NextResponse.json(
        { error: 'You have already answered this question' },
        { status: 400 }
      )
    }

    // 답변 생성
    const { data: answer, error: insertError } = await supabase
      .from('answers')
      .insert([{
        content: content.trim(),
        question_id: questionId,
        author_id: user.id,
        is_anonymous,
        vote_score: 0,
        is_helpful: false,
        is_accepted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        author:users!author_id(
          id, name, avatar_url, trust_score, badges,
          visa_type, company, years_in_korea, region
        )
      `)
      .single()

    if (insertError) {
      console.error('Answer creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create answer' },
        { status: 500 }
      )
    }

    // 질문의 답변 카운트 증가
    await supabase
      .from('questions')
      .update({
        answer_count: supabase.rpc('increment_answer_count'),
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)

    // 사용자 답변 카운트 증가
    await supabase
      .from('users')
      .update({
        answer_count: supabase.rpc('increment_answer_count'),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // 질문 작성자에게 알림 생성 (자신의 질문이 아닌 경우)
    if (question.author_id !== user.id) {
      await supabase
        .from('notifications')
        .insert([{
          user_id: question.author_id,
          type: 'answer',
          title: '새로운 답변이 등록되었습니다',
          message: `회원님의 질문에 새로운 답변이 등록되었습니다.`,
          data: {
            question_id: questionId,
            answer_id: answer.id,
            answerer_name: is_anonymous ? '익명' : answer.author?.name
          },
          is_read: false,
          created_at: new Date().toISOString()
        }])
    }

    return NextResponse.json(
      {
        data: answer,
        message: 'Answer created successfully'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Answer creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
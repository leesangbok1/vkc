import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/questions/[id] - 특정 질문 조회 + 조회수 증가
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const questionId = id

    // Mock mode check
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
      console.log('Question detail API running in mock mode')

      const mockQuestion = {
        id: '1',
        title: '한국에서 비자 연장하는 방법이 궁금합니다',
        content: '베트남인이 한국에서 비자를 연장하려면 어떤 서류가 필요한지 알고 싶습니다. 특히 E-9 비자 소지자인데, 체류 기간이 곧 만료됩니다. 준비해야 할 서류와 절차에 대해 자세히 알고 싶습니다.',
        author_id: 'user1',
        category_id: 'visa',
        tags: ['비자', '연장', '서류', 'E-9'],
        status: 'open',
        urgency: 'normal',
        vote_score: 5,
        view_count: 24,
        answer_count: 3,
        is_anonymous: false,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        author: {
          id: 'user1',
          name: '강민수',
          avatar_url: null,
          trust_score: 75,
          badges: { 'verified': true },
          visa_type: 'E-9',
          company: 'ABC 제조업체',
          years_in_korea: 2,
          region: '경기도',
          question_count: 5,
          answer_count: 12,
          helpful_answer_count: 8,
          created_at: '2023-03-15T00:00:00Z'
        },
        category: {
          id: 'visa',
          name: '비자/법률',
          slug: 'visa',
          icon: '📄',
          color: '#3B82F6',
          description: '비자, 체류 허가, 법률 관련 질문'
        },
        answers: [
          {
            id: '1',
            content: '출입국 관리사무소에 방문하기 전에 먼저 온라인으로 체류 기간 연장 신청을 할 수 있습니다. Hi Korea 사이트를 이용하시면 됩니다.',
            is_helpful: true,
            vote_score: 15,
            is_accepted: true,
            created_at: '2024-01-15T12:00:00Z',
            updated_at: '2024-01-15T12:00:00Z',
            author: {
              id: 'user3',
              name: '박정민',
              avatar_url: null,
              trust_score: 92,
              badges: { 'verified': true, 'expert': true }
            }
          }
        ]
      }

      if (questionId === '1') {
        return NextResponse.json({
          data: mockQuestion,
          message: 'Question retrieved successfully'
        })
      } else {
        return NextResponse.json(
          { error: 'Question not found' },
          { status: 404 }
        )
      }
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // 질문 조회 (상세 정보 포함)
    const { data: question, error } = await supabase
      .from('questions')
      .select(`
        *,
        author:users!author_id(
          id, name, avatar_url, trust_score, badges,
          visa_type, company, years_in_korea, region,
          question_count, answer_count, helpful_answer_count,
          created_at
        ),
        category:categories!category_id(id, name, slug, icon, color, description),
        answers!left(
          id, content, is_helpful, vote_score, is_accepted,
          created_at, updated_at,
          author:users!author_id(
            id, name, avatar_url, trust_score, badges,
            visa_type, company, years_in_korea, region
          )
        )
      `)
      .eq('id', questionId)
      .single()

    if (error || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // 조회수 증가 (비동기로 처리하여 응답 속도 최적화)
    supabase
      .from('questions')
      .update({
        view_count: (question.view_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)
      .then() // 에러는 무시 (조회수 증가 실패가 전체 요청을 실패시키지 않도록)

    // 답변을 생성 시간순으로 정렬 (채택된 답변이 있으면 맨 위로)
    if (question.answers) {
      question.answers.sort((a: any, b: any) => {
        // 채택된 답변이 맨 위
        if (a.is_accepted && !b.is_accepted) return -1
        if (!a.is_accepted && b.is_accepted) return 1

        // 그 다음은 도움이 되는 답변 순
        if (a.is_helpful && !b.is_helpful) return -1
        if (!a.is_helpful && b.is_helpful) return 1

        // 마지막으로 투표 점수순
        return (b.vote_score || 0) - (a.vote_score || 0)
      })
    }

    return NextResponse.json({ data: question })

  } catch (error) {
    console.error('Question fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/questions/[id] - 질문 수정 (소유자만)
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
    const questionId = id

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
    const { title, content, category_id, tags, urgency } = body

    // 질문 존재 및 소유권 확인
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('id, author_id')
      .eq('id', questionId)
      .single()

    if (fetchError || !existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    if (existingQuestion.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied. You can only edit your own questions' },
        { status: 403 }
      )
    }

    // 입력값 검증
    if (title !== undefined && (!title || title.length > 200)) {
      return NextResponse.json(
        { error: 'Title must be between 1 and 200 characters' },
        { status: 400 }
      )
    }

    if (content !== undefined && !content) {
      return NextResponse.json(
        { error: 'Content cannot be empty' },
        { status: 400 }
      )
    }

    // 카테고리 유효성 확인 (카테고리가 변경되는 경우)
    if (category_id !== undefined) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .single()

      if (!category) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }
    }

    // 업데이트할 필드만 포함하는 객체 생성
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (category_id !== undefined) updateData.category_id = category_id
    if (tags !== undefined) updateData.tags = tags
    if (urgency !== undefined) updateData.urgency = urgency

    // 질문 업데이트
    const { data: updatedQuestion, error: updateError } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', questionId)
      .select(`
        *,
        author:users!author_id(id, name, avatar_url, trust_score, badges),
        category:categories!category_id(id, name, slug, icon, color)
      `)
      .single()

    if (updateError) {
      console.error('Question update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update question' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: updatedQuestion,
      message: 'Question updated successfully'
    })

  } catch (error) {
    console.error('Question update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/questions/[id] - 질문 삭제 (소유자만)
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
    const questionId = id

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 질문 존재 및 소유권 확인
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('id, author_id, answer_count')
      .eq('id', questionId)
      .single()

    if (fetchError || !existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    if (existingQuestion.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied. You can only delete your own questions' },
        { status: 403 }
      )
    }

    // 답변이 있는 질문은 삭제하지 않고 상태만 변경
    if (existingQuestion.answer_count > 0) {
      const { error: updateError } = await supabase
        .from('questions')
        .update({
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId)

      if (updateError) {
        console.error('Question soft delete error:', updateError)
        return NextResponse.json(
          { error: 'Failed to delete question' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Question has been marked as deleted'
      })
    }

    // 답변이 없는 질문은 완전 삭제
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)

    if (deleteError) {
      console.error('Question delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete question' },
        { status: 500 }
      )
    }

    // 사용자 질문 카운트 감소
    await supabase
      .from('users')
      .update({
        question_count: supabase.rpc('decrement_question_count'),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json({
      message: 'Question deleted successfully'
    })

  } catch (error) {
    console.error('Question delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
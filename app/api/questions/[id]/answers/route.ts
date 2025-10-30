import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient, createSupabaseServiceClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'
import { applyRateLimit } from '@/lib/middleware/rate-limit'
import { buildMockAnswers, getMockQuestionById, isMockModeEnabled } from '../../mock-data'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>
type ServiceClient = ReturnType<typeof createSupabaseServiceClient> | null
type SupabaseAnyClient = SupabaseClient | NonNullable<ServiceClient>

type QuestionRecord = {
  id: string
  title: string
  author_id: string
  status?: string | null
  answer_count?: number | null
  last_activity_at?: string | null
  is_approved?: boolean | null
}

// GET /api/questions/[id]/answers - 특정 질문의 답변 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const serviceClient = tryCreateServiceClient()
    const { searchParams } = new URL(request.url)

    if (isMockModeEnabled()) {
      const { page, limit } = ValidationUtils.validatePagination(searchParams)
      const mockAnswers = buildMockAnswers(questionId)
      const mockQuestion = getMockQuestionById(questionId)
      return NextResponse.json({
        data: mockAnswers,
        question: { id: mockQuestion.id, title: mockQuestion.title },
        pagination: {
          page,
          limit,
          total: mockAnswers.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      })
    }

    const { page, limit } = ValidationUtils.validatePagination(searchParams)
    const sort = normalizeSort(searchParams.get('sort'))
    const offset = (page - 1) * limit

    const questionRecord = await fetchQuestionWithFallback(
      questionId,
      'id, title',
      supabase,
      serviceClient
    )

    if (!questionRecord) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const primaryResult = await buildAnswersQuery(supabase, questionId, sort)
      .range(offset, offset + limit - 1)

    let answers = primaryResult.data
    let count = primaryResult.count

    if (primaryResult.error) {
      console.error('[answers route] primary answer fetch failed', primaryResult.error)
      if (!serviceClient) {
        return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 })
      }

      const fallbackResult = await buildAnswersQuery(serviceClient, questionId, sort)
        .range(offset, offset + limit - 1)

      if (fallbackResult.error) {
        console.error('[answers route] fallback answer fetch failed', fallbackResult.error)
        return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 })
      }

      answers = fallbackResult.data
      count = fallbackResult.count
    }

    const total = typeof count === 'number' ? count : (answers?.length ?? 0)
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0

    return NextResponse.json({
      data: answers ?? [],
      question: {
        id: questionRecord.id,
        title: questionRecord.title
      },
      pagination: {
        page,
        limit,
        total,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    const serviceClient = tryCreateServiceClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const rateLimitResponse = await applyRateLimit(request, user.id, 'post')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await request.json()
    const { content, is_anonymous = false } = body

    const sanitizedContent = ValidationUtils.sanitizeContent(content)
    if (!sanitizedContent) {
      return NextResponse.json({ error: 'Answer content is required' }, { status: 400 })
    }

    if (sanitizedContent.length > 10000) {
      return NextResponse.json(
        { error: 'Answer content must be 10,000 characters or less' },
        { status: 400 }
      )
    }

    const questionRecord = await fetchQuestionWithFallback(
      questionId,
      'id, title, author_id, status, answer_count, last_activity_at, is_approved',
      supabase,
      serviceClient
    )

    if (!questionRecord) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    if (questionRecord.status === 'closed' || questionRecord.status === 'deleted') {
      return NextResponse.json(
        { error: 'Cannot answer a closed or deleted question' },
        { status: 400 }
      )
    }

    const { data: answer, error: insertError } = await supabase
      .from('answers')
      .insert([{
        content: sanitizedContent,
        question_id: questionId,
        author_id: user.id,
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
      return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 })
    }

    const nowIso = new Date().toISOString()
    const writeClient = serviceClient ?? supabase

    try {
      await writeClient
        .from('questions')
        .update({
          answer_count: safeNumber(questionRecord.answer_count) + 1,
          last_activity_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', questionId)
    } catch (updateError) {
      console.error('Failed to update question answer count:', updateError)
    }

    if (questionRecord.author_id !== user.id) {
      try {
        await writeClient
          .from('notifications')
          .insert([{
            user_id: questionRecord.author_id,
            type: 'answer',
            title: '새로운 답변이 등록되었습니다',
            message: '회원님의 질문에 새로운 답변이 등록되었습니다.',
            data: {
              question_id: questionId,
              answer_id: answer.id,
              answerer_name: is_anonymous ? '익명' : answer.author?.name
            },
            is_read: false,
            created_at: nowIso
          }])
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError)
      }
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

function tryCreateServiceClient(): ServiceClient {
  try {
    return createSupabaseServiceClient()
  } catch (error) {
    console.warn('[answers route] service client unavailable', error)
    return null
  }
}

async function fetchQuestionWithFallback(
  questionId: string,
  columns: string,
  supabase: SupabaseClient,
  serviceClient: ServiceClient
): Promise<QuestionRecord | null> {
  if (serviceClient) {
    const { data, error } = await serviceClient
      .from('questions')
      .select(columns)
      .eq('id', questionId)
      .maybeSingle()

    if (data) {
      return data as QuestionRecord
    }

    if (error && error.code !== 'PGRST116') {
      console.error('[answers route] service question fetch failed', error)
    }
  }

  const { data, error } = await supabase
    .from('questions')
    .select(columns)
    .eq('id', questionId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('[answers route] question fetch failed', error)
  }

  return (data ?? null) as QuestionRecord | null
}

function buildAnswersQuery(
  client: SupabaseAnyClient,
  questionId: string,
  sort: 'best' | 'newest' | 'oldest' | 'votes'
) {
  let query = client
    .from('answers')
    .select(`
      id, content, is_accepted, upvote_count, downvote_count, helpful_count, created_at, updated_at,
      author:users!author_id(
        id, name, avatar_url, trust_score, badges,
        visa_type, company, years_in_korea, region,
        answer_count, helpful_answer_count
      )
    `, { count: 'exact' })
    .eq('question_id', questionId)

  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'votes':
      query = query.order('upvote_count', { ascending: false })
      break
    case 'best':
    default:
      query = query
        .order('is_accepted', { ascending: false })
        .order('helpful_count', { ascending: false })
        .order('upvote_count', { ascending: false })
        .order('created_at', { ascending: true })
  }

  return query
}

function normalizeSort(sortParam: string | null): 'best' | 'newest' | 'oldest' | 'votes' {
  if (sortParam === 'newest' || sortParam === 'oldest' || sortParam === 'votes') {
    return sortParam
  }
  return 'best'
}

function safeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

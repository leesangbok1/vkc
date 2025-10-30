import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { listQuestions } from '@/lib/services/questions.service'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type MockQuestion = {
  id: string
  title: string
  content: string
  category_id: number
  category: {
    id: number
    slug: string
    name: string
    icon: string
  }
  tags: string[]
  author: {
    id: string
    name: string
    role: string
    avatar_url: string | null
  }
  upvote_count: number
  answer_count: number
  helpful_count: number
  view_count: number
  created_at: string
  updated_at: string
  last_activity_at: string
  is_answered: boolean
  metrics?: Record<string, unknown>
}

const MOCK_CATEGORIES: Record<number, MockQuestion['category']> = {
  1: { id: 1, slug: 'visa', name: '비자/법률', icon: '🛂' },
  2: { id: 2, slug: 'employment', name: '취업/커리어', icon: '💼' },
  3: { id: 3, slug: 'life', name: '한국생활', icon: '🏠' }
}

const INITIAL_MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 'mock-question-1',
    title: 'E-7 비자 연장 절차가 궁금해요',
    content: 'E-7 비자 연장을 준비 중인데 필요한 서류와 기간이 어떻게 되는지 알려주세요.',
    category_id: 1,
    category: MOCK_CATEGORIES[1],
    tags: ['E-7', '비자', '연장'],
    author: {
      id: 'mock-user-1',
      name: '응우옌 안',
      role: 'verified',
      avatar_url: null
    },
    upvote_count: 18,
    answer_count: 4,
    helpful_count: 6,
    view_count: 256,
    created_at: '2024-10-20T08:30:00.000Z',
    updated_at: '2024-10-21T06:12:00.000Z',
    last_activity_at: '2024-10-21T06:12:00.000Z',
    is_answered: true,
    metrics: {
      score: 0.86,
      breakdown: {
        views: 0.3,
        answers: 0.25,
        accepted: 0.15,
        helpful: 0.08,
        recentAnswers: 0.03,
        recency: 0.03,
        activity: 0.02,
        following: 0,
        interest: 0
      }
    }
  },
  {
    id: 'mock-question-2',
    title: '한국 스타트업 취업 준비 팁이 있을까요?',
    content: '베트남에서 IT 경력을 쌓고 한국 스타트업에 지원하려고 합니다. 준비해야 할 포트폴리오와 면접 질문이 궁금해요.',
    category_id: 2,
    category: MOCK_CATEGORIES[2],
    tags: ['취업', '스타트업', '면접'],
    author: {
      id: 'mock-user-2',
      name: '쩐 투안',
      role: 'user',
      avatar_url: null
    },
    upvote_count: 9,
    answer_count: 2,
    helpful_count: 3,
    view_count: 142,
    created_at: '2024-10-18T12:45:00.000Z',
    updated_at: '2024-10-19T09:20:00.000Z',
    last_activity_at: '2024-10-19T09:20:00.000Z',
    is_answered: false
  },
  {
    id: 'mock-question-3',
    title: '서울 생활비 절약 노하우 알려주세요',
    content: '서울에서 월세와 생활비를 어떻게 아끼는지, 베트남 커뮤니티에서 통용되는 팁이 있으면 공유해주세요.',
    category_id: 3,
    category: MOCK_CATEGORIES[3],
    tags: ['생활', '서울', '재테크'],
    author: {
      id: 'mock-user-3',
      name: '레 화',
      role: 'verified',
      avatar_url: null
    },
    upvote_count: 5,
    answer_count: 1,
    helpful_count: 1,
    view_count: 98,
    created_at: '2024-10-15T07:10:00.000Z',
    updated_at: '2024-10-16T02:05:00.000Z',
    last_activity_at: '2024-10-16T02:05:00.000Z',
    is_answered: false
  }
]

const mockStore = {
  questions: structuredClone(INITIAL_MOCK_QUESTIONS),
  reset() {
    this.questions = structuredClone(INITIAL_MOCK_QUESTIONS)
  }
}

const isMockMode = () => process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

const cloneQuestion = (question: MockQuestion) => ({
  ...question,
  category: { ...question.category },
  author: { ...question.author },
  tags: [...question.tags],
  metrics: question.metrics ? { ...question.metrics } : undefined
})

function getMockResponse(url: URL) {
  const sort = url.searchParams.get('sort') === 'recent' ? 'recent' : 'popular'
  const categoryParam = url.searchParams.get('category') || undefined
  const limit = Number.parseInt(url.searchParams.get('limit') ?? '20', 10)
  const page = Math.max(Number.parseInt(url.searchParams.get('page') ?? '1', 10), 1)
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 20
  const offset = (page - 1) * safeLimit

  let items = mockStore.questions

  if (categoryParam) {
    items = items.filter((question) =>
      question.category.slug === categoryParam || String(question.category_id) === categoryParam
    )
  }

  const sorted = [...items].sort((a, b) => {
    if (sort === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return (b.metrics?.score as number | undefined ?? b.view_count) - (a.metrics?.score as number | undefined ?? a.view_count)
  })

  const paged = sorted.slice(offset, offset + safeLimit).map(cloneQuestion)

  return NextResponse.json(
    {
      success: true,
      data: paged,
      items: paged,
      sort,
      pagination: {
        page,
        limit: safeLimit,
        count: items.length
      }
    },
    {
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  )
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (isMockMode()) {
      const url = new URL(request.url)
      if (process.env.NODE_ENV === 'test') {
        mockStore.reset()
      }
      return getMockResponse(url)
    }

    const url = new URL(request.url)
    const rawSort = url.searchParams.get('sort')
    const allowedSorts = new Set(['popular','recent'])
    const sort = (rawSort && allowedSorts.has(rawSort)) ? (rawSort as 'popular'|'recent') : (rawSort ? undefined : 'popular')
    if (!sort) {
      return NextResponse.json({ error: 'Invalid sort parameter', allowed: Array.from(allowedSorts) }, { status: 400 })
    }
    const category = url.searchParams.get('category') || undefined
    const author = url.searchParams.get('author') || undefined
    const following = url.searchParams.get('following') === 'true'
    const limit = Number(url.searchParams.get('limit') || 20)
    const offset = Number(url.searchParams.get('offset') || 0)
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    let userId: string | null = user?.id || null
    if (following && !userId) {
      return NextResponse.json({ error: 'Authentication required for following feed' }, { status: 401 })
    }

    const baseParams = { sort, category, authorId: author, following, limit, offset, userId }
    let { items, page, limit: pageSize, total } = await listQuestions(baseParams)
    let appliedSort: 'popular' | 'recent' = sort

    if (sort === 'popular' && items.length > 0) {
      const hasMeaningfulScore = items.some((item) => (item.metrics?.score ?? 0) >= 0.1)
      if (!hasMeaningfulScore) {
        const fallback = await listQuestions({ ...baseParams, sort: 'recent' })
        items = fallback.items
        page = fallback.page
        pageSize = fallback.limit
        total = fallback.total
        appliedSort = 'recent'
      }
    }

    return NextResponse.json({
      success: true,
      data: items,
      items,
      sort: appliedSort,
      pagination: {
        page,
        limit: pageSize,
        count: typeof total === 'number' ? total : items.length,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error: unknown) {
    console.error('[/api/questions] error:', {
      query: Object.fromEntries(new URL(request.url).searchParams.entries()),
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch questions',
        code: error instanceof Error ? (error as { code?: string }).code ?? null : null,
        details: error instanceof Error ? error.message : null,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (isMockMode()) {
      const body = await request.json().catch(() => null)
      const rawTitle = body?.title
      const rawContent = body?.content
      const rawCategoryId = body?.category_id ?? body?.categoryId

      if (typeof rawTitle !== 'string' || rawTitle.trim().length < 5) {
        return NextResponse.json(
          { success: false, error: '제목은 최소 5자 이상 입력해야 하는 필수 항목입니다.' },
          { status: 400 }
        )
      }

      if (typeof rawContent !== 'string' || rawContent.trim().length < 10) {
        return NextResponse.json(
          { success: false, error: '본문은 최소 10자 이상 입력해야 하는 필수 항목입니다.' },
          { status: 400 }
        )
      }

      const parsedCategory = Number.parseInt(String(rawCategoryId), 10)
      if (!MOCK_CATEGORIES[parsedCategory]) {
        return NextResponse.json(
          { success: false, error: '유효한 카테고리를 선택해 주세요.' },
          { status: 400 }
        )
      }

      const sanitizedTitle = rawTitle.trim().slice(0, 120)
      const sanitizedContent = rawContent.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').trim()
      const tags = Array.isArray(body?.tags)
        ? body.tags.slice(0, 10).map((tag: unknown) => String(tag).slice(0, 30))
        : []

      const now = new Date().toISOString()
      const newQuestion: MockQuestion = {
        id: crypto.randomUUID(),
        title: sanitizedTitle,
        content: sanitizedContent,
        category_id: parsedCategory,
        category: MOCK_CATEGORIES[parsedCategory],
        tags,
        author: {
          id: 'mock-author',
          name: '베트남 커넥터',
          role: 'user',
          avatar_url: null
        },
        upvote_count: 0,
        answer_count: 0,
        helpful_count: 0,
        view_count: 0,
        created_at: now,
        updated_at: now,
        last_activity_at: now,
        is_answered: false
      }

      mockStore.questions.unshift(cloneQuestion(newQuestion))

      return NextResponse.json(
        {
          success: true,
          data: {
            ...newQuestion,
            is_answered: newQuestion.is_answered
          }
        },
        { status: 201 }
      )
    }

    const body = await request.json().catch(() => null)
    const rawTitle = body?.title
    const rawContent = body?.content
    const rawCategoryId = body?.category_id ?? body?.categoryId

    if (typeof rawTitle !== 'string' || rawTitle.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: '제목은 최소 5자 이상 입력해야 하는 필수 항목입니다.' },
        { status: 400 }
      )
    }

    if (typeof rawContent !== 'string' || rawContent.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: '본문은 최소 10자 이상 입력해야 하는 필수 항목입니다.' },
        { status: 400 }
      )
    }

    const parsedCategory = parseInt(String(rawCategoryId), 10)
    if (Number.isNaN(parsedCategory)) {
      return NextResponse.json(
        { success: false, error: 'category_id는 필수 항목입니다.' },
        { status: 400 }
      )
    }

    const sanitizedTitle = rawTitle.trim().slice(0, 120)
    const sanitizedContent = rawContent.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').trim()
    const tags = Array.isArray(body?.tags) ? body.tags.slice(0, 10) : []

    const basePayload = {
      id: crypto.randomUUID(),
      title: sanitizedTitle,
      content: sanitizedContent,
      category_id: parsedCategory,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('questions')
      .insert({
        title: sanitizedTitle,
        content: sanitizedContent,
        category_id: parsedCategory,
        author_id: user.id,
        tags,
        status: 'open',
        is_approved: true,
      })
      .select('id, created_at, updated_at')
      .single()

    if (error) {
      console.error('[POST /api/questions] insert error', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create question',
          code: error.code,
          details: error.message,
          hint: error.hint,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...basePayload,
          id: data.id,
          created_at: data.created_at ?? basePayload.created_at,
          updated_at: data.updated_at ?? basePayload.updated_at,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('[POST /api/questions] unexpected error', {
      message: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create question',
        details: error instanceof Error ? error.message : null
      },
      { status: 500 }
    )
  }
}

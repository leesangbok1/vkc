import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server'

const isMockMode = () => process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
const MAX_RESULTS_PER_TYPE = 15

// 임시 mock 데이터 - 실제 DB 연결 시 교체
const mockQuestions = [
  {
    id: '1',
    title: '비자 연장 관련 질문입니다',
    content: '현재 E-2 비자를 가지고 있는데 연장 신청을 어떻게 해야 하나요? 필요한 서류가 무엇인지 알고 싶습니다.',
    category: { name: '비자', slug: 'visa' },
    author: { name: '김민수' },
    answer_count: 3,
    view_count: 125,
    created_at: '2024-01-15T09:30:00Z',
    status: 'open'
  },
  {
    id: '2',
    title: '한국에서 취업비자 신청 방법',
    content: '대학 졸업 후 한국에서 취업하고 싶은데 어떤 비자를 신청해야 하나요?',
    category: { name: '취업', slug: 'employment' },
    author: { name: '박지영' },
    answer_count: 7,
    view_count: 234,
    created_at: '2024-01-14T14:20:00Z',
    status: 'resolved'
  },
  {
    id: '3',
    title: '건강보험 가입 문의',
    content: '외국인도 국민건강보험에 가입할 수 있나요? 절차가 어떻게 되는지 궁금합니다.',
    category: { name: '의료', slug: 'healthcare' },
    author: { name: '레투안' },
    answer_count: 5,
    view_count: 189,
    created_at: '2024-01-13T11:45:00Z',
    status: 'open'
  }
]

type QuestionResult = {
  id: string
  type: 'question'
  title: string
  content: string
  created_at: string
  answer_count: number
  helpful_count: number | null
  category?: { id?: number; name?: string | null; slug?: string | null; icon?: string | null } | null
  author?: { id: string; name: string | null; role: string | null; avatar_url?: string | null } | null
}

type PostResult = {
  id: string
  type: 'post'
  title: string
  content: string
  created_at: string
  helpful_count: number | null
  comment_count: number | null
  category?: { id?: number; name?: string | null; slug?: string | null; icon?: string | null } | null
  author?: { id: string; name: string | null; role: string | null; avatar_url?: string | null } | null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawQuery = searchParams.get('q') ?? ''
    const query = rawQuery.trim()

    if (!query) {
      return NextResponse.json(
        { success: true, query, results: [], total: 0 },
        { status: 200 }
      )
    }

    if (isMockMode()) {
      const lowered = query.toLowerCase()
      const filtered = mockQuestions.filter((question) =>
        question.title.toLowerCase().includes(lowered) ||
        question.content.toLowerCase().includes(lowered) ||
        question.category.name.includes(query)
      )

      const mapped: QuestionResult[] = filtered.map((item) => ({
        id: item.id,
        type: 'question',
        title: item.title,
        content: item.content,
        created_at: item.created_at,
        answer_count: item.answer_count ?? 0,
        helpful_count: null,
        category: item.category,
        author: item.author ? { id: item.author.name, name: item.author.name, role: null } : null,
      }))

      return NextResponse.json({
        success: true,
        query,
        results: mapped,
        total: mapped.length,
      })
    }

    const supabase = await createSupabaseServerClient()
    let serviceClient = supabase
    try {
      serviceClient = createSupabaseServiceClient()
    } catch (error) {
      console.warn('[search] service client unavailable, falling back to user session client.')
    }

    const escapedQuery = query.replace(/[%_]/g, (match) => `\\${match}`)
    const likePattern = `%${escapedQuery}%`

    const questionPromise = serviceClient
      .from('questions')
      .select(`
        id,
        title,
        content,
        created_at,
        answer_count,
        helpful_count,
        category:categories (
          id,
          name,
          slug,
          icon
        ),
        author:users!questions_author_id_fkey (
          id,
          name,
          role,
          avatar_url
        )
      `)
      .or(`title.ilike.${likePattern},content.ilike.${likePattern}`)
      .order('created_at', { ascending: false })
      .limit(MAX_RESULTS_PER_TYPE)

    const postPromise = serviceClient
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        helpful_count,
        comment_count,
        category:categories (
          id,
          name,
          slug,
          icon
        ),
        author:users!posts_author_id_fkey (
          id,
          name,
          role,
          avatar_url
        )
      `)
      .eq('is_published', true)
      .or(`title.ilike.${likePattern},content.ilike.${likePattern}`)
      .order('created_at', { ascending: false })
      .limit(MAX_RESULTS_PER_TYPE)

    const [{ data: questionRows, error: questionError }, { data: postRows, error: postError }] =
      await Promise.all([questionPromise, postPromise])

    if (questionError) {
      console.error('[search] question query failed:', questionError)
    }
    if (postError) {
      console.error('[search] post query failed:', postError)
    }

    const questionResults: QuestionResult[] = Array.isArray(questionRows)
      ? questionRows.map((row: any) => ({
          id: String(row.id),
          type: 'question' as const,
          title: String(row.title ?? ''),
          content: String(row.content ?? ''),
          created_at: row.created_at ?? new Date().toISOString(),
          answer_count: Number(row.answer_count ?? 0),
          helpful_count: row.helpful_count ?? null,
          category: row.category ?? null,
          author: row.author
            ? {
                id: String(row.author.id ?? ''),
                name: row.author.name ?? null,
                role: row.author.role ?? null,
                avatar_url: row.author.avatar_url ?? null,
              }
            : null,
        }))
      : []

    const postResults: PostResult[] = Array.isArray(postRows)
      ? postRows.map((row: any) => ({
          id: String(row.id),
          type: 'post' as const,
          title: String(row.title ?? ''),
          content: String(row.content ?? ''),
          created_at: row.created_at ?? new Date().toISOString(),
          helpful_count: row.helpful_count ?? null,
          comment_count: row.comment_count ?? null,
          category: row.category ?? null,
          author: row.author
            ? {
                id: String(row.author.id ?? ''),
                name: row.author.name ?? null,
                role: row.author.role ?? null,
                avatar_url: row.author.avatar_url ?? null,
              }
            : null,
        }))
      : []

    const results = [...questionResults, ...postResults].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      query,
      results,
      total: results.length,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { ValidationUtils } from '@/lib/validation'

// GET /api/search - 통합 검색 (제목, 내용, 태그)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    const { searchParams } = new URL(request.url)

    // Mock mode check
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
      console.log('Search API running in mock mode')
      const q = ValidationUtils.validateSearchQuery(searchParams.get('q'))

      if (!q || q.length < 2) {
        return NextResponse.json(
          { error: 'Search query must be at least 2 characters' },
          { status: 400 }
        )
      }

      const mockResults = {
        questions: {
          data: [
            {
              id: '1',
              title: '비자 연장 방법에 대해 알려주세요',
              content: '비자가 곧 만료되는데 연장하려면 어떻게 해야 하나요?',
              tags: ['비자', '연장'],
              vote_score: 12,
              answer_count: 3,
              created_at: '2024-01-15T09:00:00Z',
              author: { id: 'user1', name: '이지훈', avatar_url: null },
              category: { id: 1, name: '비자/체류', slug: 'visa', icon: '📝' }
            }
          ],
          count: 1
        },
        answers: {
          data: [],
          count: 0
        },
        users: {
          data: [],
          count: 0
        }
      }

      return NextResponse.json({
        query: q,
        type: 'all',
        results: mockResults
      })
    }

    // 쿼리 파라미터 파싱
    const q = ValidationUtils.validateSearchQuery(searchParams.get('q'))
    const type = searchParams.get('type') || 'all' // 'questions', 'answers', 'users', 'all'
    const category = searchParams.get('category')
    const { page, limit } = ValidationUtils.validatePagination(searchParams)

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const offset = (page - 1) * limit
    const results: any = {}

    // 질문 검색
    if (type === 'questions' || type === 'all') {
      let questionQuery = supabase
        .from('questions')
        .select(`
          id, title, content, tags, created_at, view_count, vote_score, answer_count,
          author:users!author_id(id, name, avatar_url, trust_score),
          category:categories!category_id(id, name, slug, icon, color)
        `)
        .neq('status', 'deleted')

      // 텍스트 검색 (제목, 내용, 태그)
      questionQuery = questionQuery.or(`
        title.ilike.%${q}%,
        content.ilike.%${q}%,
        tags.cs.{${q}}
      `)

      // 카테고리 필터
      if (category) {
        questionQuery = questionQuery.eq('categories.slug', category)
      }

      // 정렬 (관련성 우선: 제목 일치 > 투표 점수 > 생성일)
      questionQuery = questionQuery
        .order('title', { ascending: true }) // 제목 일치가 먼저 오도록
        .order('vote_score', { ascending: false })
        .order('created_at', { ascending: false })

      if (type === 'questions') {
        questionQuery = questionQuery.range(offset, offset + limit - 1)
      } else {
        questionQuery = questionQuery.limit(10) // 전체 검색시에는 각 타입별로 제한
      }

      const { data: questions, error: questionError, count: questionCount } = await questionQuery

      if (questionError) {
        console.error('Question search error:', questionError)
      } else {
        results.questions = {
          data: questions || [],
          count: questionCount || 0
        }
      }
    }

    // 답변 검색
    if (type === 'answers' || type === 'all') {
      let answerQuery = supabase
        .from('answers')
        .select(`
          id, content, is_helpful, is_accepted, vote_score, created_at,
          author:users!author_id(id, name, avatar_url, trust_score),
          question:questions!question_id(
            id, title, status,
            category:categories!category_id(name, slug, icon)
          )
        `)
        .ilike('content', `%${q}%`)

      // 정렬 (관련성 우선: 채택된 답변 > 도움이 되는 답변 > 투표 점수)
      answerQuery = answerQuery
        .order('is_accepted', { ascending: false })
        .order('is_helpful', { ascending: false })
        .order('vote_score', { ascending: false })
        .order('created_at', { ascending: false })

      if (type === 'answers') {
        answerQuery = answerQuery.range(offset, offset + limit - 1)
      } else {
        answerQuery = answerQuery.limit(10)
      }

      const { data: answers, error: answerError, count: answerCount } = await answerQuery

      if (answerError) {
        console.error('Answer search error:', answerError)
      } else {
        results.answers = {
          data: answers || [],
          count: answerCount || 0
        }
      }
    }

    // 사용자 검색
    if (type === 'users' || type === 'all') {
      let userQuery = supabase
        .from('users')
        .select(`
          id, name, avatar_url, bio, trust_score, badges,
          visa_type, company, years_in_korea, region,
          question_count, answer_count, helpful_answer_count,
          created_at
        `)
        .or(`name.ilike.%${q}%, bio.ilike.%${q}%, company.ilike.%${q}%`)

      // 정렬 (신뢰도 점수 순)
      userQuery = userQuery
        .order('trust_score', { ascending: false })
        .order('helpful_answer_count', { ascending: false })

      if (type === 'users') {
        userQuery = userQuery.range(offset, offset + limit - 1)
      } else {
        userQuery = userQuery.limit(5)
      }

      const { data: users, error: userError, count: userCount } = await userQuery

      if (userError) {
        console.error('User search error:', userError)
      } else {
        results.users = {
          data: users || [],
          count: userCount || 0
        }
      }
    }

    // 검색 통계 업데이트 (비동기)
    supabase
      .from('search_logs')
      .insert([{
        query: q,
        type,
        category,
        result_count: Object.values(results).reduce((total: number, result: any) =>
          total + (result.count || 0), 0),
        created_at: new Date().toISOString()
      }])
      .then() // 에러 무시

    // 페이지네이션 정보 계산
    const totalCount = type === 'all'
      ? Object.values(results).reduce((total: number, result: any) => total + (result.count || 0), 0)
      : results[type]?.count || 0

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      query: q,
      type,
      results,
      pagination: type !== 'all' ? {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      } : undefined
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
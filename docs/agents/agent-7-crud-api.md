# Agent 7: 질문 CRUD API 개발 담당

## 🎯 브랜치
`feature/question-crud`

## 📋 작업 내용
1. API Routes 구현 (GET, POST, PUT, DELETE)
2. 서버 컴포넌트 개발
3. 클라이언트 컴포넌트 구현
4. 데이터 페칭 최적화
5. 캐싱 전략 구현

## 🚀 실행 명령어

### 1. 브랜치 생성
```bash
git checkout -b feature/question-crud
```

### 2. 의존성 확인
```bash
# DB 스키마가 완료되었는지 확인
# Agent 4의 작업이 완료된 후 시작
```

## 📁 생성할 파일

### app/api/questions/route.ts
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

// GET /api/questions - 질문 목록 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'created_at'
  const order = searchParams.get('order') || 'desc'

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    let query = supabase
      .from('questions')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role,
          residence_years
        ),
        categories:category_id (
          id,
          name,
          icon,
          color
        ),
        _count: (
          answers:answers(count),
          votes:votes(count),
          bookmarks:bookmarks(count)
        )
      `)

    // 필터링
    if (category) {
      query = query.eq('category_id', category)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // 검색
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // 정렬
    const validSorts = ['created_at', 'updated_at', 'vote_count', 'view_count', 'answer_count']
    if (validSorts.includes(sort)) {
      query = query.order(sort, { ascending: order === 'asc' })
    }

    // 페이지네이션
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: questions, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/questions - 새 질문 생성
export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // 인증 확인
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, category_id, tags, urgency_level } = body

    // 유효성 검사
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // 질문 생성
    const { data: question, error } = await supabase
      .from('questions')
      .insert([
        {
          user_id: session.user.id,
          title: title.trim(),
          content: content.trim(),
          category_id,
          tags: tags || [],
          urgency_level: urgency_level || 1,
        },
      ])
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url
        ),
        categories:category_id (
          id,
          name,
          icon,
          color
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### app/api/questions/[id]/route.ts
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

// GET /api/questions/[id] - 질문 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // 조회수 증가
    await supabase.rpc('increment_view_count', { question_id: params.id })

    // 질문 상세 정보 조회
    const { data: question, error } = await supabase
      .from('questions')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url,
          role,
          residence_years,
          expertise_areas
        ),
        categories:category_id (
          id,
          name,
          icon,
          color
        ),
        answers (
          *,
          users:user_id (
            id,
            name,
            avatar_url,
            role,
            residence_years
          ),
          comments (
            *,
            users:user_id (
              id,
              name,
              avatar_url
            )
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/questions/[id] - 질문 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // 인증 확인
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, category_id, tags, status } = body

    // 권한 확인 (작성자 또는 관리자만 수정 가능)
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    if (existingQuestion.user_id !== session.user.id) {
      // 관리자 권한 확인
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (user?.role !== 'admin' && user?.role !== 'moderator') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // 질문 업데이트
    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (content !== undefined) updateData.content = content.trim()
    if (category_id !== undefined) updateData.category_id = category_id
    if (tags !== undefined) updateData.tags = tags
    if (status !== undefined) updateData.status = status

    const { data: question, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url
        ),
        categories:category_id (
          id,
          name,
          icon,
          color
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/questions/[id] - 질문 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // 인증 확인
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 권한 확인
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    if (existingQuestion.user_id !== session.user.id) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (user?.role !== 'admin' && user?.role !== 'moderator') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // 질문 삭제 (CASCADE로 관련 데이터도 함께 삭제됨)
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### app/questions/page.tsx
```typescript
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { QuestionList } from '@/components/questions/QuestionList'
import { QuestionFilters } from '@/components/questions/QuestionFilters'
import { Suspense } from 'react'

interface QuestionsPageProps {
  searchParams: {
    page?: string
    category?: string
    status?: string
    search?: string
    sort?: string
    order?: string
  }
}

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  const supabase = createSupabaseServerClient()

  // 카테고리 목록 조회
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('order_index')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">질문 목록</h1>
        <Link href="/questions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            질문하기
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 필터 사이드바 */}
        <div className="lg:col-span-1">
          <QuestionFilters categories={categories || []} />
        </div>

        {/* 질문 목록 */}
        <div className="lg:col-span-3">
          <Suspense fallback={<QuestionListSkeleton />}>
            <QuestionList searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function QuestionListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
          <div className="flex space-x-4">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### app/questions/[id]/page.tsx
```typescript
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { QuestionDetail } from '@/components/questions/QuestionDetail'
import { AnswerList } from '@/components/answers/AnswerList'
import { AnswerForm } from '@/components/answers/AnswerForm'
import { notFound } from 'next/navigation'

interface QuestionPageProps {
  params: { id: string }
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const supabase = createSupabaseServerClient()

  // 질문 상세 정보 조회
  const { data: question, error } = await supabase
    .from('questions')
    .select(`
      *,
      users:user_id (
        id,
        name,
        avatar_url,
        role,
        residence_years,
        expertise_areas
      ),
      categories:category_id (
        id,
        name,
        icon,
        color
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !question) {
    notFound()
  }

  // 답변 목록 조회
  const { data: answers } = await supabase
    .from('answers')
    .select(`
      *,
      users:user_id (
        id,
        name,
        avatar_url,
        role,
        residence_years
      )
    `)
    .eq('question_id', params.id)
    .order('is_accepted', { ascending: false })
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <QuestionDetail question={question} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          답변 {answers?.length || 0}개
        </h2>

        {answers && answers.length > 0 && (
          <AnswerList answers={answers} questionId={params.id} />
        )}

        <div className="mt-8">
          <AnswerForm questionId={params.id} />
        </div>
      </div>
    </div>
  )
}
```

### components/questions/QuestionList.tsx
```typescript
'use client'
import { useState, useEffect } from 'react'
import { QuestionCard } from './QuestionCard'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface Question {
  id: string
  title: string
  content: string
  created_at: string
  view_count: number
  vote_count: number
  answer_count: number
  status: string
  users: {
    id: string
    name: string
    avatar_url: string
  }
  categories: {
    id: string
    name: string
    icon: string
    color: string
  }
}

interface QuestionListProps {
  searchParams: {
    page?: string
    category?: string
    status?: string
    search?: string
    sort?: string
    order?: string
  }
}

export function QuestionList({ searchParams }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchQuestions = async () => {
    setLoading(true)

    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    try {
      const response = await fetch(`/api/questions?${params}`)
      const data = await response.json()

      if (response.ok) {
        setQuestions(data.questions)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching questions:', data.error)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [searchParams])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">질문이 없습니다.</p>
        <Button onClick={fetchQuestions} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 질문 카드 목록 */}
      <div className="space-y-4">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => {
            const params = new URLSearchParams(window.location.search)
            params.set('page', page.toString())
            window.history.pushState(null, '', `?${params}`)
          }}
        />
      )}
    </div>
  )
}
```

### components/questions/QuestionCard.tsx
```typescript
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, MessageCircle, ThumbsUp, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface QuestionCardProps {
  question: {
    id: string
    title: string
    content: string
    created_at: string
    view_count: number
    vote_count: number
    answer_count: number
    status: string
    users: {
      id: string
      name: string
      avatar_url: string
    }
    categories: {
      id: string
      name: string
      icon: string
      color: string
    }
  }
}

export function QuestionCard({ question }: QuestionCardProps) {
  const statusColors = {
    open: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    resolved: 'bg-blue-100 text-blue-800',
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* 사용자 아바타 */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={question.users.avatar_url} />
            <AvatarFallback>
              {question.users.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* 제목 */}
            <Link
              href={`/questions/${question.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
            >
              {question.title}
            </Link>

            {/* 내용 미리보기 */}
            <p className="text-gray-600 mt-2 line-clamp-2">
              {question.content}
            </p>

            {/* 메타 정보 */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {/* 카테고리 */}
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: question.categories.color + '20' }}
                >
                  {question.categories.icon} {question.categories.name}
                </Badge>

                {/* 상태 */}
                <Badge className={statusColors[question.status as keyof typeof statusColors]}>
                  {question.status === 'open' && '진행중'}
                  {question.status === 'closed' && '종료'}
                  {question.status === 'resolved' && '해결됨'}
                </Badge>

                {/* 작성자 */}
                <span>{question.users.name}</span>

                {/* 작성 시간 */}
                <span className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(new Date(question.created_at), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>

              {/* 통계 */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Eye className="mr-1 h-4 w-4" />
                  {question.view_count}
                </span>
                <span className="flex items-center">
                  <ThumbsUp className="mr-1 h-4 w-4" />
                  {question.vote_count}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  {question.answer_count}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

## 📝 추가 생성할 컴포넌트

### app/questions/new/page.tsx (질문 작성 페이지)
### components/questions/QuestionForm.tsx (질문 작성 폼)
### components/questions/QuestionDetail.tsx (질문 상세)
### components/questions/QuestionFilters.tsx (필터링)
### lib/api/questions.ts (API 클라이언트)

## ✅ 완료 기준
1. ✅ Questions API Routes 구현 완료
2. ✅ 질문 목록 페이지 구현 완료
3. ✅ 질문 상세 페이지 구현 완료
4. ✅ 질문 작성 페이지 구현 완료
5. ✅ 필터링 및 검색 기능 구현
6. ✅ 페이지네이션 구현
7. ✅ 캐싱 전략 적용
8. ✅ CRUD 기능 테스트 통과

## 📅 예상 소요 시간
**총 4시간**
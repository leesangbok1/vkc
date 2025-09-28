# Agent 8: React 컴포넌트 마이그레이션 담당

## 🎯 브랜치
`feature/component-migration`

## 📋 작업 내용
1. 기존 React 컴포넌트 이동 및 변환
2. JavaScript → TypeScript 변환
3. Firebase → Supabase API 변경
4. Vite 설정 → Next.js 설정으로 변경
5. 스타일 및 라우팅 조정

## 🚀 실행 명령어

### 1. 브랜치 생성
```bash
git checkout -b feature/component-migration
```

### 2. 의존성 확인
```bash
# Next.js 프로젝트 구조가 완료되었는지 확인
# Agent 2의 작업이 완료된 후 시작
```

## 📁 마이그레이션 대상 파일

### 기존 구조 (src/)
```
src/
├── components/
│   ├── layout/Header.jsx
│   ├── questions/QuestionCard.jsx
│   ├── home/HomePage.jsx
│   └── auth/AuthContext.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── AllPostsPage.jsx
│   └── PostDetailPage.jsx
├── services/
│   ├── firebase-api.js
│   ├── AuthContext.jsx
│   └── RealtimeContext.jsx
└── config/firebase.js
```

### 새 구조 (Next.js)
```
components/
├── layout/Header.tsx
├── questions/QuestionCard.tsx
├── auth/AuthProvider.tsx
└── home/HomePage.tsx

app/
├── page.tsx (HomePage)
├── questions/page.tsx (AllPostsPage)
└── questions/[id]/page.tsx (PostDetailPage)

lib/
├── supabase.ts
└── api/questions.ts
```

## 📝 마이그레이션 계획

### 1. Header 컴포넌트 마이그레이션

#### 기존: src/components/layout/Header.jsx
```jsx
import React, { useContext } from 'react'
import { AuthContext } from '../../services/AuthContext'
import { database } from '../../config/firebase'

export default function Header() {
  const { user, logout } = useContext(AuthContext)

  return (
    <header style={{ padding: '1rem', backgroundColor: '#blue' }}>
      <nav>
        <a href="/">홈</a>
        {user ? (
          <button onClick={logout}>로그아웃</button>
        ) : (
          <a href="/login">로그인</a>
        )}
      </nav>
    </header>
  )
}
```

#### 새로운: components/layout/Header.tsx
```typescript
'use client'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Viet K-Connect
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/questions">
              <Button variant="ghost">질문 보기</Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">대시보드</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">프로필</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-2">
                <Link href="/login">
                  <Button variant="outline">로그인</Button>
                </Link>
                <Link href="/register">
                  <Button>회원가입</Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
```

### 2. QuestionCard 컴포넌트 마이그레이션

#### 기존: src/components/questions/QuestionCard.jsx
```jsx
import React from 'react'
import { formatDistanceToNow } from 'date-fns'

export default function QuestionCard({ question }) {
  const handleClick = () => {
    window.location.href = `/questions/${question.id}`
  }

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '1rem',
        margin: '1rem',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      <h3>{question.title}</h3>
      <p>{question.content}</p>
      <div>
        <span>조회수: {question.viewCount}</span>
        <span>답변: {question.answerCount}</span>
        <span>{formatDistanceToNow(question.createdAt)} 전</span>
      </div>
    </div>
  )
}
```

#### 새로운: components/questions/QuestionCard.tsx
```typescript
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, MessageCircle, ThumbsUp, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Question {
  id: string
  title: string
  content: string
  created_at: string
  view_count: number
  vote_count: number
  answer_count: number
  users: {
    name: string
    avatar_url: string
  }
  categories: {
    name: string
    color: string
    icon: string
  }
}

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={question.users.avatar_url} />
            <AvatarFallback>
              {question.users.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <Link
              href={`/questions/${question.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
            >
              {question.title}
            </Link>

            <p className="text-gray-600 mt-2 line-clamp-2">
              {question.content}
            </p>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <Badge style={{ backgroundColor: question.categories.color + '20' }}>
                  {question.categories.icon} {question.categories.name}
                </Badge>

                <span>{question.users.name}</span>

                <span className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(new Date(question.created_at), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>

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

### 3. API 서비스 마이그레이션

#### 기존: src/services/firebase-api.js
```javascript
import { database } from '../config/firebase'
import { ref, get, push, set, remove } from 'firebase/database'

export const questionsApi = {
  getAll: async () => {
    const questionsRef = ref(database, 'questions')
    const snapshot = await get(questionsRef)
    return snapshot.val() || {}
  },

  create: async (questionData) => {
    const questionsRef = ref(database, 'questions')
    return await push(questionsRef, {
      ...questionData,
      createdAt: Date.now()
    })
  },

  update: async (id, updates) => {
    const questionRef = ref(database, `questions/${id}`)
    return await set(questionRef, updates)
  },

  delete: async (id) => {
    const questionRef = ref(database, `questions/${id}`)
    return await remove(questionRef)
  }
}
```

#### 새로운: lib/api/questions.ts
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

type Question = Database['public']['Tables']['questions']['Row']
type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type QuestionUpdate = Database['public']['Tables']['questions']['Update']

export class QuestionsApi {
  private supabase = createClientComponentClient<Database>()

  async getAll(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }) {
    let query = this.supabase
      .from('questions')
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

    if (params?.category) {
      query = query.eq('category_id', params.category)
    }

    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,content.ilike.%${params.search}%`)
    }

    query = query.order('created_at', { ascending: false })

    if (params?.page && params?.limit) {
      const offset = (params.page - 1) * params.limit
      query = query.range(offset, offset + params.limit - 1)
    }

    const { data, error, count } = await query

    if (error) throw error

    return { questions: data, total: count }
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
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
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async create(questionData: QuestionInsert) {
    const { data, error } = await this.supabase
      .from('questions')
      .insert([questionData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: QuestionUpdate) {
    const { data, error } = await this.supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async incrementViewCount(id: string) {
    const { error } = await this.supabase.rpc('increment_view_count', {
      question_id: id
    })

    if (error) throw error
  }
}

export const questionsApi = new QuestionsApi()
```

### 4. 페이지 컴포넌트 마이그레이션

#### 기존: src/pages/HomePage.jsx
```jsx
import React, { useState, useEffect } from 'react'
import { questionsApi } from '../services/firebase-api'
import QuestionCard from '../components/questions/QuestionCard'

export default function HomePage() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await questionsApi.getAll()
        setQuestions(Object.values(data))
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  if (loading) return <div>로딩 중...</div>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Viet K-Connect</h1>
      <div>
        {questions.map(question => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  )
}
```

#### 새로운: app/page.tsx
```typescript
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createSupabaseServerClient()

  // 최신 질문들 조회
  const { data: recentQuestions } = await supabase
    .from('questions')
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
    .order('created_at', { ascending: false })
    .limit(5)

  // 인기 질문들 조회
  const { data: trendingQuestions } = await supabase
    .from('questions')
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
    .order('vote_count', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Viet K-Connect
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            베트남 한인 커뮤니티의 모든 궁금증을 해결하는 Q&A 플랫폼
          </p>
          <div className="space-x-4">
            <Link href="/questions/new">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Plus className="mr-2 h-5 w-5" />
                질문하기
              </Button>
            </Link>
            <Link href="/questions">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                질문 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최신 질문 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Clock className="mr-2 h-6 w-6 text-blue-600" />
                최신 질문
              </h2>
              <Link href="/questions?sort=created_at">
                <Button variant="outline" size="sm">
                  전체 보기
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentQuestions?.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          </section>

          {/* 인기 질문 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-red-600" />
                인기 질문
              </h2>
              <Link href="/questions?sort=vote_count">
                <Button variant="outline" size="sm">
                  전체 보기
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {trendingQuestions?.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          </section>
        </div>

        {/* 통계 섹션 */}
        <section className="mt-16 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-8">
            커뮤니티 현황
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1,234</div>
              <div className="text-gray-600">전체 질문</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">2,567</div>
              <div className="text-gray-600">답변</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">456</div>
              <div className="text-gray-600">활성 사용자</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
```

## 🔧 마이그레이션 스크립트

### scripts/migrate-components.sh
```bash
#!/bin/bash

echo "🚀 Starting component migration..."

# 1. Create new directories
mkdir -p components/layout
mkdir -p components/questions
mkdir -p components/auth
mkdir -p components/ui
mkdir -p lib/api

# 2. Migrate Header component
echo "📝 Migrating Header component..."
# (Manual conversion as shown above)

# 3. Migrate QuestionCard component
echo "📝 Migrating QuestionCard component..."
# (Manual conversion as shown above)

# 4. Migrate API services
echo "📝 Migrating API services..."
# (Manual conversion as shown above)

# 5. Update imports in all files
echo "🔄 Updating imports..."
find components -name "*.tsx" -exec sed -i 's/..\/..\/services/..\/..\/lib\/api/g' {} \;

# 6. Clean up old files
echo "🧹 Cleaning up old files..."
# Keep original files for reference during migration

echo "✅ Migration completed!"
```

## 📋 마이그레이션 체크리스트

### 컴포넌트 변환
- [ ] Header.jsx → Header.tsx
- [ ] QuestionCard.jsx → QuestionCard.tsx
- [ ] AuthContext.jsx → AuthProvider.tsx
- [ ] HomePage.jsx → app/page.tsx
- [ ] AllPostsPage.jsx → app/questions/page.tsx
- [ ] PostDetailPage.jsx → app/questions/[id]/page.tsx

### API 서비스 변환
- [ ] firebase-api.js → lib/api/questions.ts
- [ ] Firebase Realtime DB → Supabase
- [ ] Firebase Auth → Supabase Auth

### 스타일링 변환
- [ ] 인라인 스타일 → Tailwind CSS
- [ ] CSS 모듈 → Tailwind 클래스
- [ ] 반응형 디자인 추가

### 라우팅 변환
- [ ] React Router → Next.js App Router
- [ ] 클라이언트 사이드 라우팅 → 서버 사이드 라우팅
- [ ] 동적 라우팅 설정

## ✅ 완료 기준
1. ✅ 모든 컴포넌트 TypeScript로 변환
2. ✅ Firebase → Supabase API 교체
3. ✅ Tailwind CSS 스타일링 적용
4. ✅ Next.js 라우팅 구조 적용
5. ✅ 기존 기능 모두 정상 작동
6. ✅ 타입 안정성 확보
7. ✅ 빌드 및 테스트 통과

## 📅 예상 소요 시간
**총 3시간**
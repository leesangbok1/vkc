# Viet K-Connect API Documentation

## 개요
Viet K-Connect는 베트남 관련 질문과 답변을 위한 커뮤니티 플랫폼으로, **Supabase PostgreSQL**을 백엔드로 사용합니다. 이는 Firebase에서 Supabase로 마이그레이션한 최신 아키텍처입니다.

## 주요 기능

### 🚀 Supabase 서비스
- **Authentication**: 소셜 로그인 (Google, Facebook, Kakao)
- **PostgreSQL**: 질문/답변 데이터 저장 + RLS 보안
- **Storage**: 파일 업로드 (필요시)
- **Edge Functions**: 서버리스 함수

### 🤖 AI 서비스 (OpenAI)
- **질문 분류**: GPT 기반 카테고리 자동 분류
- **전문가 매칭**: AI 기반 최적 답변자 추천
- **긴급도 분류**: 질문 우선순위 자동 판단
- **번역**: 한국어-베트남어 자동 번역

## 데이터 모델

### User (사용자)
```typescript
interface User {
  id: string // UUID
  email: string
  name: string
  avatar_url?: string
  bio?: string

  // OAuth 정보
  provider: 'kakao' | 'google' | 'facebook'
  provider_id: string

  // 베트남인 특화 정보
  visa_type?: 'E-1' | 'E-2' | 'E-7' | 'F-2' | 'F-4' | 'F-5' | 'etc'
  company?: string
  years_in_korea?: number // 0-50
  region?: string // Seoul, Busan, Daegu, etc.
  preferred_language: 'ko' | 'vi' | 'en'

  // 신뢰도 시스템
  is_verified: boolean
  verification_date?: Date
  trust_score: number // 0-1000

  // 커뮤니티 뱃지
  badges: {
    senior: boolean      // 5년 이상 거주
    expert: boolean      // 전문 답변자
    verified: boolean    // 신원 인증
    helper: boolean      // 도움 제공자
    moderator: boolean   // 모더레이터
  }

  // 활동 통계
  question_count: number
  answer_count: number
  helpful_answer_count: number
  last_active: Date
  created_at: Date
  updated_at: Date
}
```

### Question (질문)
```typescript
interface Question {
  id: string // UUID
  title: string
  content: string
  user_id: string
  category_id: string

  // AI 분류 정보
  ai_category: string
  ai_confidence: number // 0.0-1.0
  ai_tags: string[]
  urgency_level: 'low' | 'medium' | 'high' | 'urgent'

  // 전문가 매칭
  expert_match_needed: boolean
  suggested_experts: string[] // user_ids

  // 상태 관리
  status: 'open' | 'answered' | 'closed' | 'pending_review'
  is_approved: boolean // 모더레이션

  // 통계
  view_count: number
  answer_count: number
  vote_score: number

  // 메타데이터
  tags: string[]
  language: 'ko' | 'vi' | 'en'
  created_at: Date
  updated_at: Date
}
```

### Answer (답변)
```typescript
interface Answer {
  id: string // UUID
  question_id: string
  user_id: string
  content: string

  // AI 품질 평가
  ai_helpfulness_score: number // 0.0-1.0
  ai_accuracy_confidence: number // 0.0-1.0
  is_ai_generated: boolean

  // 커뮤니티 평가
  is_accepted: boolean // 질문자가 채택
  vote_score: number
  helpful_count: number

  // 상태
  is_approved: boolean
  status: 'published' | 'pending' | 'flagged'

  created_at: Date
  updated_at: Date
}
```

### Category (카테고리)
```typescript
interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string

  // 베트남인 특화 카테고리
  parent_id?: string
  is_featured: boolean
  question_count: number
  expert_count: number

  created_at: Date
}

// 기본 카테고리 (10개)
const CATEGORIES = [
  'visa-immigration',    // 비자/출입국
  'work-employment',     // 취업/근로
  'life-living',         // 생활정보
  'education-study',     // 교육/학업
  'health-medical',      // 의료/건강
  'legal-law',          // 법률/제도
  'culture-language',   // 문화/언어
  'business-startup',   // 사업/창업
  'finance-banking',    // 금융/은행
  'community-social'    // 커뮤니티/사교
]
```

### Vote (투표)
```typescript
interface Vote {
  id: string
  user_id: string
  target_id: string // question_id or answer_id
  target_type: 'question' | 'answer'
  vote_type: 'up' | 'down' | 'helpful'

  created_at: Date
}
```

### Comment (댓글)
```typescript
interface Comment {
  id: string
  content: string
  user_id: string
  target_id: string // question_id or answer_id
  target_type: 'question' | 'answer'
  parent_id?: string // 중첩 댓글용

  is_approved: boolean
  vote_score: number

  created_at: Date
  updated_at: Date
}
```

## API 엔드포인트

### 인증 (Authentication)
```typescript
// Supabase Auth 활용
import { createClient } from '@supabase/supabase-js'

// Google 로그인
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

// Kakao 로그인
const signInWithKakao = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

// Facebook 로그인
const signInWithFacebook = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

// 로그아웃
const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}
```

### 질문 관리 (Questions)
```typescript
// Next.js API Routes

// GET /api/questions - 질문 목록 조회
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  let query = supabase
    .from('questions')
    .select(`
      *,
      users(name, avatar_url, badges),
      categories(name, icon, color),
      votes(vote_type)
    `)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (category) {
    query = query.eq('category_id', category)
  }

  const { data, error } = await query
  return Response.json({ data, error })
}

// POST /api/questions - 질문 생성
export async function POST(request: Request) {
  const body = await request.json()
  const user = await getUser(request) // JWT 토큰 검증

  // AI 분류 실행
  const aiClassification = await aiService.categorizeQuestion(
    body.title,
    body.content
  )

  const { data, error } = await supabase
    .from('questions')
    .insert({
      ...body,
      user_id: user.id,
      ai_category: aiClassification.category,
      ai_confidence: aiClassification.confidence,
      ai_tags: aiClassification.tags,
      urgency_level: aiClassification.urgency,
      expert_match_needed: aiClassification.needsExpert,
      suggested_experts: aiClassification.experts
    })
    .select()

  return Response.json({ data, error })
}

// GET /api/questions/[id] - 질문 상세 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 조회수 증가
  await supabase.rpc('increment_view_count', { question_id: params.id })

  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      users(name, avatar_url, badges, trust_score),
      categories(name, icon, color),
      answers(*, users(name, avatar_url, badges)),
      votes(vote_type, user_id)
    `)
    .eq('id', params.id)
    .single()

  return Response.json({ data, error })
}
```

### 답변 관리 (Answers)
```typescript
// POST /api/answers - 답변 생성
export async function POST(request: Request) {
  const body = await request.json()
  const user = await getUser(request)

  // AI 품질 평가
  const aiEvaluation = await aiService.evaluateAnswer(
    body.content,
    body.question_id
  )

  const { data, error } = await supabase
    .from('answers')
    .insert({
      ...body,
      user_id: user.id,
      ai_helpfulness_score: aiEvaluation.helpfulness,
      ai_accuracy_confidence: aiEvaluation.accuracy
    })
    .select()

  // 질문자에게 알림 전송
  await notificationService.sendAnswerNotification(
    body.question_id,
    user.id
  )

  return Response.json({ data, error })
}

// PUT /api/answers/[id]/accept - 답변 채택
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser(request)

  // 질문 작성자인지 확인
  const { data: question } = await supabase
    .from('questions')
    .select('user_id')
    .eq('id', params.question_id)
    .single()

  if (question.user_id !== user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('answers')
    .update({ is_accepted: true })
    .eq('id', params.id)
    .select()

  return Response.json({ data, error })
}
```

### 투표 시스템 (Votes)
```typescript
// POST /api/votes - 투표하기
export async function POST(request: Request) {
  const body = await request.json()
  const user = await getUser(request)

  // 자신의 글에는 투표 불가
  const isOwnContent = await checkIfOwnContent(
    user.id,
    body.target_id,
    body.target_type
  )

  if (isOwnContent) {
    return Response.json(
      { error: 'Cannot vote on your own content' },
      { status: 400 }
    )
  }

  // 기존 투표 확인 및 업데이트/삽입
  const { data, error } = await supabase
    .from('votes')
    .upsert({
      user_id: user.id,
      target_id: body.target_id,
      target_type: body.target_type,
      vote_type: body.vote_type
    })
    .select()

  return Response.json({ data, error })
}
```

### 검색 (Search)
```typescript
// GET /api/search - 통합 검색
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'all' // questions, answers, users

  if (type === 'questions' || type === 'all') {
    const { data: questions } = await supabase
      .from('questions')
      .select(`
        *,
        users(name, avatar_url),
        categories(name, icon)
      `)
      .textSearch('title_content_fts', query, {
        type: 'websearch',
        config: 'korean'
      })
      .eq('is_approved', true)
      .limit(20)
  }

  return Response.json({ questions, answers, users })
}
```

### 통계 (Statistics)
```typescript
// GET /api/stats - 사이트 통계
export async function GET() {
  const stats = await Promise.all([
    supabase.from('users').select('count', { count: 'exact' }),
    supabase.from('questions').select('count', { count: 'exact' }),
    supabase.from('answers').select('count', { count: 'exact' }),
    supabase.from('questions').select('*').gte('created_at', '1 week ago')
  ])

  return Response.json({
    total_users: stats[0].count,
    total_questions: stats[1].count,
    total_answers: stats[2].count,
    weekly_questions: stats[3].data?.length || 0
  })
}
```

## Row Level Security (RLS) 정책

### 사용자 (Users)
```sql
-- 읽기: 모든 사용자 (단, 민감 정보 제외)
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- 수정: 본인만
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 질문 (Questions)
```sql
-- 읽기: 승인된 질문만 모든 사용자
CREATE POLICY "Approved questions are viewable" ON questions
  FOR SELECT USING (is_approved = true);

-- 생성: 인증된 사용자
CREATE POLICY "Authenticated users can create questions" ON questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 수정: 작성자 + 24시간 제한
CREATE POLICY "Authors can edit questions within 24h" ON questions
  FOR UPDATE USING (
    auth.uid() = user_id AND
    created_at > NOW() - INTERVAL '24 hours'
  );
```

### 답변 (Answers)
```sql
-- 읽기: 승인된 답변만
CREATE POLICY "Approved answers are viewable" ON answers
  FOR SELECT USING (is_approved = true);

-- 생성: 인증된 사용자
CREATE POLICY "Authenticated users can create answers" ON answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 투표 (Votes)
```sql
-- 생성/수정: 인증된 사용자 (자신의 컨텐츠 제외)
CREATE POLICY "Users can vote on others content" ON votes
  FOR ALL USING (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM questions q WHERE q.id = target_id AND q.user_id = auth.uid()
      UNION
      SELECT 1 FROM answers a WHERE a.id = target_id AND a.user_id = auth.uid()
    )
  );
```

## 에러 처리

### Supabase 에러 코드
- `PGRST116`: Row Level Security 위반
- `23505`: 고유 제약 조건 위반 (중복)
- `23503`: 외래 키 제약 조건 위반
- `42501`: 권한 부족

### API 에러 응답 형식
```typescript
interface ApiError {
  error: {
    code: string
    message: string
    details?: any
  }
  status: number
}

// 예시
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "로그인이 필요합니다.",
    "details": "JWT token is missing or invalid"
  },
  "status": 401
}
```

## 성능 최적화

### 데이터베이스 인덱스
```sql
-- 질문 검색 최적화
CREATE INDEX idx_questions_category_created ON questions(category_id, created_at DESC);
CREATE INDEX idx_questions_user_created ON questions(user_id, created_at DESC);
CREATE INDEX idx_questions_status_approved ON questions(status, is_approved);

-- 전문 검색 (Korean)
CREATE INDEX idx_questions_fts ON questions
  USING gin(to_tsvector('korean', title || ' ' || content));

-- 투표 집계 최적화
CREATE INDEX idx_votes_target ON votes(target_id, target_type, vote_type);
```

### 캐싱 전략
- **질문 목록**: 5분 캐시 (ISR)
- **질문 상세**: 10분 캐시, 답변 추가시 무효화
- **사용자 정보**: 30분 캐시
- **카테고리**: 1시간 캐시 (자주 변경되지 않음)
- **통계**: 1시간 캐시

### 페이지네이션
```typescript
// 커서 기반 페이지네이션 (무한 스크롤)
const getQuestionsWithCursor = async (
  cursor?: string,
  limit: number = 10
) => {
  let query = supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query

  return {
    data,
    nextCursor: data?.[data.length - 1]?.created_at,
    hasMore: data?.length === limit
  }
}
```

## MVP 범위 (1:1 대화 제외)

### ✅ 포함된 기능
- 질문/답변 시스템
- 소셜 로그인 (Google, Facebook, Kakao)
- 투표/추천 시스템
- 댓글 시스템
- 카테고리별 분류
- 검색 기능
- AI 분류 및 전문가 매칭
- 사용자 프로필 및 뱃지 시스템

### ❌ MVP에서 제외된 기능
- **1:1 실시간 채팅** - 향후 버전에서 구현
- **화상 통화** - 향후 버전에서 구현
- **파일 업로드** - 기본 텍스트만 지원
- **알림 푸시** - 이메일 알림만 지원
- **모바일 앱** - 웹 반응형만 지원

## 모니터링 및 분석

### 핵심 지표
- **사용자 참여**: DAU, MAU, 세션 시간
- **콘텐츠 품질**: 질문 답변률, 채택률, AI 정확도
- **성능**: API 응답시간, 페이지 로드 시간
- **비즈니스**: 신규 가입, 활성 사용자, 콘텐츠 생산량

### 로깅
```typescript
// 구조화된 로깅
const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }))
  },

  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...meta
    }))
  }
}
```

## 배포 및 환경 설정

### 환경 변수
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NEXT_PUBLIC_FACEBOOK_APP_ID=xxx
NEXT_PUBLIC_KAKAO_CLIENT_ID=xxx

# AI Services
OPENAI_API_KEY=sk-...
OPENAI_ORGANIZATION=org-...

# App Config
NEXT_PUBLIC_BASE_URL=https://viet-kconnect.vercel.app
NEXT_PUBLIC_APP_NAME="Viet K-Connect"
```

### Vercel 배포 설정
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```
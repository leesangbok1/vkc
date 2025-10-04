import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/answers - 답변 목록 조회 (전체 또는 특정 사용자)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Mock mode check
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
      console.log('Answers API running in mock mode')

      const mockAnswers = [
        {
          id: '1',
          question_id: '1',
          author_id: 'user2',
          content: 'E-7 비자 신청 시 필요한 서류는 다음과 같습니다:\n\n1. 비자 신청서 (본인 작성)\n2. 여권용 사진 1매\n3. 여권 원본 및 사본\n4. 재직증명서 (회사에서 발급)\n5. 근로계약서 사본\n6. 사업자등록증 사본 (회사)\n7. **베트남에서 준비할 서류:**\n   - 학위증명서 + 아포스티유 또는 영사확인\n   - 무범죄증명서 + 아포스티유 또는 영사확인\n   - 건강검진서 (최근 3개월 이내)\n\n**팁:** 모든 베트남 서류는 한국어 번역공증이 필요하며, 번역은 한국에서도 가능합니다.',
          is_accepted: true,
          is_ai_generated: false,
          helpful_count: 45,
          vote_score: 28,
          status: 'published',
          quality_score: 95, // 답변 품질 점수 추가
          expertise_match: true, // 전문가 매칭 여부
          response_time_hours: 2.5, // 응답 시간
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user2',
            name: '팜티란',
            avatar_url: '',
            trust_score: 892,
            residence_years: 4,
            specialties: ['비자', '취업', '법률'], // 전문 분야 추가
            badges: { verified: true, expert: true, helpful: true },
            email: '',
            created_at: '',
            updated_at: ''
          },
          question: {
            id: '1',
            title: 'E-7 비자 신청 시 필요한 서류가 궁금합니다',
            author_id: 'user1',
            category: '비자/법률'
          }
        },
        {
          id: '2',
          question_id: '2',
          author_id: 'user3',
          content: '출입국 관리사무소에 방문하기 전에 먼저 온라인으로 체류 기간 연장 신청을 할 수 있습니다. Hi Korea 사이트를 이용하시면 됩니다.',
          is_accepted: true,
          is_ai_generated: false,
          helpful_count: 25,
          vote_score: 15,
          status: 'published',
          created_at: '2024-01-14T16:45:00Z',
          updated_at: '2024-01-14T16:45:00Z',
          author: {
            id: 'user3',
            name: '박정민',
            avatar_url: null,
            trust_score: 92,
            badges: { 'verified': true, 'expert': true }
          },
          question: {
            id: '2',
            title: '한국어 공부 방법 추천해주세요',
            author_id: 'user2'
          }
        }
      ]

      // 쿼리 파라미터 파싱
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const author_id = searchParams.get('author_id')
      const sort = searchParams.get('sort') || 'created_at'
      const order = searchParams.get('order') || 'desc'

      // 필터링 적용
      let filteredAnswers = mockAnswers

      if (author_id) {
        filteredAnswers = filteredAnswers.filter(answer => answer.author_id === author_id)
      }

      // 정렬 적용
      if (sort === 'helpful_count') {
        filteredAnswers.sort((a, b) => order === 'asc' ? a.helpful_count - b.helpful_count : b.helpful_count - a.helpful_count)
      } else if (sort === 'vote_score') {
        filteredAnswers.sort((a, b) => order === 'asc' ? a.vote_score - b.vote_score : b.vote_score - a.vote_score)
      } else {
        filteredAnswers.sort((a, b) => {
          const aDate = new Date(a.created_at).getTime()
          const bDate = new Date(b.created_at).getTime()
          return order === 'asc' ? aDate - bDate : bDate - aDate
        })
      }

      // 페이지네이션 적용
      const offset = (page - 1) * limit
      const paginatedAnswers = filteredAnswers.slice(offset, offset + limit)
      const total = filteredAnswers.length
      const totalPages = Math.ceil(total / limit)

      return NextResponse.json({
        data: paginatedAnswers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      })
    }

    const supabase = await createClient()

    // If supabase is null (mock mode), return error
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const author_id = searchParams.get('author_id')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    // 오프셋 계산
    const offset = (page - 1) * limit

    // 기본 쿼리 구성
    let query = supabase
      .from('answers')
      .select(`
        *,
        author:users!author_id(id, name, avatar_url, trust_score, badges),
        question:questions!question_id(id, title, status, category_id,
          category:categories!category_id(name, slug, icon)
        )
      `)

    // 필터링 적용
    if (author_id) {
      query = query.eq('author_id', author_id)
    }

    // 정렬 적용
    if (sort === 'popularity') {
      query = query.order('vote_score', { ascending: order === 'asc' })
    } else if (sort === 'helpful') {
      query = query.order('is_helpful', { ascending: order === 'asc' })
                   .order('vote_score', { ascending: false })
    } else {
      query = query.order(sort, { ascending: order === 'asc' })
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

// 베트남 커뮤니티 전문가 매칭 알고리즘
export function findExpertMatches(question: any, availableExperts: any[]) {
  const matches = availableExperts.map(expert => {
    let score = 0

    // 1. 전문 분야 매칭 (40점)
    if (expert.specialties && question.category) {
      const categoryMatch = expert.specialties.some((specialty: string) =>
        question.category.toLowerCase().includes(specialty.toLowerCase()) ||
        question.title.toLowerCase().includes(specialty.toLowerCase()) ||
        question.tags?.some((tag: string) => tag.toLowerCase().includes(specialty.toLowerCase()))
      )
      if (categoryMatch) score += 40
    }

    // 2. 신뢰도 점수 (20점)
    const trustRatio = (expert.trust_score || 0) / 1000
    score += Math.min(trustRatio * 20, 20)

    // 3. 거주 기간 (경험) (15점)
    const yearsScore = Math.min((expert.residence_years || 0) * 3, 15)
    score += yearsScore

    // 4. 답변 활동성 (10점)
    const answerRatio = (expert.helpful_answer_count || 0) / Math.max(expert.answer_count || 1, 1)
    score += answerRatio * 10

    // 5. 배지 보너스 (10점)
    if (expert.badges?.expert) score += 5
    if (expert.badges?.verified) score += 3
    if (expert.badges?.helpful) score += 2

    // 6. 최근 활동성 (5점)
    const lastActive = new Date(expert.last_active || 0)
    const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceActive <= 7) score += 5
    else if (daysSinceActive <= 30) score += 3
    else if (daysSinceActive <= 90) score += 1

    return {
      expert,
      score: Math.round(score),
      match_reasons: generateMatchReasons(expert, question, score)
    }
  })

  // 점수 기준 정렬 후 상위 5명 반환
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .filter(match => match.score >= 30) // 최소 30점 이상만
}

// 매칭 이유 생성
function generateMatchReasons(expert: any, question: any, score: number) {
  const reasons = []

  if (expert.specialties?.some((s: string) =>
    question.category?.toLowerCase().includes(s.toLowerCase())
  )) {
    reasons.push(`${question.category} 전문가`)
  }

  if (expert.residence_years >= 5) {
    reasons.push(`한국 거주 ${expert.residence_years}년 경험`)
  }

  if (expert.badges?.expert) {
    reasons.push('인증된 전문가')
  }

  if (expert.trust_score >= 800) {
    reasons.push('높은 신뢰도')
  }

  if (expert.helpful_answer_count >= 50) {
    reasons.push('활발한 답변 활동')
  }

  return reasons
}

// 답변 품질 평가 알고리즘
export function evaluateAnswerQuality(answer: any, question: any) {
  let qualityScore = 0

  // 1. 답변 길이 (최대 20점)
  const contentLength = answer.content?.length || 0
  if (contentLength >= 500) qualityScore += 20
  else if (contentLength >= 200) qualityScore += 15
  else if (contentLength >= 100) qualityScore += 10
  else if (contentLength >= 50) qualityScore += 5

  // 2. 구조화된 답변 (최대 15점)
  const hasNumbering = /\d+\.|•|▪|→/.test(answer.content)
  const hasFormatting = /\*\*|\n\n|###|##/.test(answer.content)
  if (hasNumbering) qualityScore += 10
  if (hasFormatting) qualityScore += 5

  // 3. 전문성 키워드 (최대 15점)
  const expertKeywords = ['서류', '신청', '절차', '방법', '팁', '주의', '경험', '추천']
  const keywordMatches = expertKeywords.filter(keyword =>
    answer.content?.toLowerCase().includes(keyword)
  ).length
  qualityScore += Math.min(keywordMatches * 2, 15)

  // 4. 베트남 특화 정보 (최대 10점)
  const vietnamKeywords = ['베트남', '아포스티유', '영사확인', '번역공증', '한국어']
  const vietnamMatches = vietnamKeywords.filter(keyword =>
    answer.content?.toLowerCase().includes(keyword.toLowerCase())
  ).length
  qualityScore += Math.min(vietnamMatches * 2, 10)

  // 5. 작성자 신뢰도 (최대 20점)
  const authorTrust = (answer.author?.trust_score || 0) / 1000
  qualityScore += Math.min(authorTrust * 20, 20)

  // 6. 전문가 여부 (최대 10점)
  if (answer.author?.badges?.expert) qualityScore += 10
  else if (answer.author?.badges?.verified) qualityScore += 5

  // 7. 응답 속도 보너스 (최대 10점)
  if (answer.response_time_hours <= 1) qualityScore += 10
  else if (answer.response_time_hours <= 6) qualityScore += 7
  else if (answer.response_time_hours <= 24) qualityScore += 5
  else if (answer.response_time_hours <= 72) qualityScore += 3

  return Math.min(Math.round(qualityScore), 100)
}
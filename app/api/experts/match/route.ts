import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'
import { findExpertMatches } from '@/app/api/answers/route'

// POST /api/experts/match - AI 전문가 매칭 시스템
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, category, tags = [], urgency = 'normal' } = body

    // 입력값 검증
    if (!question || !category) {
      return NextResponse.json(
        { error: 'Question and category are required' },
        { status: 400 }
      )
    }

    // Mock mode check
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
      console.log('Expert matching API running in mock mode')

      // 베트남 커뮤니티 전문가 Mock 데이터
      const mockExperts = [
        {
          id: 'expert1',
          name: '팜티란',
          avatar_url: '',
          trust_score: 892,
          residence_years: 4,
          specialties: ['비자', '취업', '법률'],
          badges: { verified: true, expert: true, helpful: true },
          answer_count: 145,
          helpful_answer_count: 132,
          last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
          bio: '한국 거주 4년차, 베트남인 취업 및 비자 전문가입니다.',
          languages: ['Vietnamese', 'Korean', 'English'],
          response_rate: 94.2,
          avg_response_time: 2.5 // hours
        },
        {
          id: 'expert2',
          name: '응우옌민',
          avatar_url: '',
          trust_score: 756,
          residence_years: 6,
          specialties: ['취업', '회사문화', '면접'],
          badges: { verified: true, expert: true },
          answer_count: 98,
          helpful_answer_count: 89,
          last_active: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1시간 전
          bio: '한국 IT 회사 6년 경력, 면접 및 취업 컨설팅 전문가입니다.',
          languages: ['Vietnamese', 'Korean'],
          response_rate: 88.7,
          avg_response_time: 4.2
        },
        {
          id: 'expert3',
          name: '레반둑',
          avatar_url: '',
          trust_score: 634,
          residence_years: 3,
          specialties: ['주거', '부동산', '생활정보'],
          badges: { verified: true, helpful: true },
          answer_count: 67,
          helpful_answer_count: 61,
          last_active: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5시간 전
          bio: '서울 부동산 및 생활정보 전문가, 원룸/오피스텔 전문',
          languages: ['Vietnamese', 'Korean'],
          response_rate: 91.0,
          avg_response_time: 6.8
        },
        {
          id: 'expert4',
          name: '부티하',
          avatar_url: '',
          trust_score: 445,
          residence_years: 2,
          specialties: ['의료', '건강보험', '병원'],
          badges: { verified: true },
          answer_count: 34,
          helpful_answer_count: 29,
          last_active: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12시간 전
          bio: '의료 통역사, 건강보험 및 병원 이용 가이드 전문가',
          languages: ['Vietnamese', 'Korean'],
          response_rate: 85.3,
          avg_response_time: 8.5
        },
        {
          id: 'expert5',
          name: '쩐반남',
          avatar_url: '',
          trust_score: 578,
          residence_years: 5,
          specialties: ['교육', '한국어', '대학원'],
          badges: { verified: true, helpful: true },
          answer_count: 78,
          helpful_answer_count: 71,
          last_active: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3시간 전
          bio: '한국 대학원 졸업, 한국어 교육 및 유학 상담 전문가',
          languages: ['Vietnamese', 'Korean', 'English'],
          response_rate: 92.3,
          avg_response_time: 5.2
        }
      ]

      // 질문 객체 구성
      const questionData = {
        title: question,
        category,
        tags,
        urgency
      }

      // 전문가 매칭 알고리즘 실행
      const matches = findExpertMatches(questionData, mockExperts)

      // AI 매칭 분석 결과 추가
      const matchingAnalysis = {
        total_experts_analyzed: mockExperts.length,
        matches_found: matches.length,
        avg_match_score: matches.length > 0
          ? Math.round(matches.reduce((sum, m) => sum + m.score, 0) / matches.length)
          : 0,
        category_experts: mockExperts.filter(expert =>
          expert.specialties.some(specialty =>
            category.toLowerCase().includes(specialty.toLowerCase())
          )
        ).length,
        matching_criteria: {
          specialty_match: '40%',
          trust_score: '20%',
          experience: '15%',
          activity: '10%',
          badges: '10%',
          recent_activity: '5%'
        }
      }

      // 각 매치에 대한 상세 정보 추가
      const enhancedMatches = matches.map(match => ({
        ...match,
        expert: {
          ...match.expert,
          estimated_response_time: `${match.expert.avg_response_time}시간`,
          match_confidence: `${match.score}%`,
          success_rate: `${match.expert.response_rate}%`
        }
      }))

      return NextResponse.json({
        success: true,
        data: {
          matches: enhancedMatches,
          analysis: matchingAnalysis,
          question_summary: {
            category,
            urgency,
            tags,
            ai_confidence: matches.length > 0 ? 'high' : 'medium'
          }
        },
        message: `${matches.length}명의 전문가를 찾았습니다`
      })
    }

    // 실제 Supabase 모드 (향후 구현)
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    // TODO: 실제 Supabase에서 전문가 데이터 조회 및 매칭
    return NextResponse.json({
      success: false,
      message: 'Real-time expert matching not yet implemented'
    })

  } catch (error) {
    console.error('Expert matching API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
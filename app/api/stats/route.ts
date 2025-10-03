import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/stats - 사이트 실시간 통계
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 병렬로 모든 통계 쿼리 실행
    const [
      usersResult,
      questionsResult,
      answersResult,
      categoriesResult,
      votesResult,
      recentActivityResult
    ] = await Promise.all([
      // 전체 사용자 수
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true }),

      // 질문 통계
      supabase
        .from('questions')
        .select(`
          id, status, created_at, vote_score, view_count, answer_count
        `)
        .neq('status', 'deleted'),

      // 답변 통계
      supabase
        .from('answers')
        .select('id, created_at, is_helpful, is_accepted, vote_score'),

      // 카테고리별 질문 수
      supabase
        .from('questions')
        .select(`
          category_id,
          category:categories!category_id(name, slug, icon)
        `)
        .neq('status', 'deleted'),

      // 투표 통계
      supabase
        .from('votes')
        .select('vote_type, created_at'),

      // 최근 활동 (최근 24시간)
      supabase
        .from('questions')
        .select(`
          id, title, created_at,
          author:users!author_id(name, avatar_url),
          category:categories!category_id(name, icon)
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    // 사용자 통계
    const totalUsers = usersResult.count || 0

    // 질문 통계 계산
    const questions = questionsResult.data || []
    const totalQuestions = questions.length
    const openQuestions = questions.filter(q => q.status === 'open').length
    const solvedQuestions = questions.filter(q => q.status === 'solved').length
    const totalViews = questions.reduce((sum, q) => sum + (q.view_count || 0), 0)
    const avgViewsPerQuestion = totalQuestions > 0 ? Math.round(totalViews / totalQuestions) : 0

    // 답변 통계 계산
    const answers = answersResult.data || []
    const totalAnswers = answers.length
    const helpfulAnswers = answers.filter(a => a.is_helpful).length
    const acceptedAnswers = answers.filter(a => a.is_accepted).length
    const avgAnswersPerQuestion = totalQuestions > 0 ? Math.round(totalAnswers / totalQuestions * 10) / 10 : 0

    // 카테고리별 통계
    const categoryStats = (categoriesResult.data || []).reduce((acc: any, item: any) => {
      if (item.category) {
        const key = item.category.slug
        if (!acc[key]) {
          acc[key] = {
            name: item.category.name,
            icon: item.category.icon,
            count: 0
          }
        }
        acc[key].count++
      }
      return acc
    }, {})

    // 투표 통계
    const votes = votesResult.data || []
    const totalVotes = votes.length
    const upVotes = votes.filter(v => v.vote_type === 'up').length
    const downVotes = votes.filter(v => v.vote_type === 'down').length

    // 최근 7일간 활동 통계
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const dailyActivity = last7Days.map(date => {
      const dayQuestions = questions.filter(q =>
        q.created_at.startsWith(date)
      ).length

      const dayAnswers = answers.filter(a =>
        a.created_at.startsWith(date)
      ).length

      return {
        date,
        questions: dayQuestions,
        answers: dayAnswers
      }
    })

    // 최고 신뢰도 사용자 (상위 5명)
    const { data: topUsers } = await supabase
      .from('users')
      .select('id, name, avatar_url, trust_score, badges, helpful_answer_count')
      .order('trust_score', { ascending: false })
      .limit(5)

    // 인기 질문 (최근 7일, 투표 점수 기준)
    const { data: popularQuestions } = await supabase
      .from('questions')
      .select(`
        id, title, vote_score, view_count, answer_count, created_at,
        author:users!author_id(name, avatar_url),
        category:categories!category_id(name, icon)
      `)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('vote_score', { ascending: false })
      .limit(5)

    const stats = {
      // 기본 통계
      overview: {
        totalUsers,
        totalQuestions,
        totalAnswers,
        totalVotes,
        openQuestions,
        solvedQuestions,
        helpfulAnswers,
        acceptedAnswers,
        avgAnswersPerQuestion,
        avgViewsPerQuestion
      },

      // 카테고리별 통계
      categories: Object.entries(categoryStats)
        .map(([slug, data]: [string, any]) => ({
          slug,
          ...data
        }))
        .sort((a, b) => b.count - a.count),

      // 투표 통계
      votes: {
        total: totalVotes,
        up: upVotes,
        down: downVotes,
        ratio: totalVotes > 0 ? Math.round(upVotes / totalVotes * 100) : 0
      },

      // 일별 활동
      dailyActivity,

      // 최고 사용자
      topUsers: topUsers || [],

      // 인기 질문
      popularQuestions: popularQuestions || [],

      // 최근 활동
      recentActivity: recentActivityResult.data || [],

      // 메타데이터
      generatedAt: new Date().toISOString(),
      generatedBy: 'viet-kconnect-api'
    }

    return NextResponse.json({
      data: stats,
      message: 'Statistics retrieved successfully'
    })

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type PopularUser = {
  id: string
  name: string
  role: string
  avatar_url?: string | null
  trust_score?: number | null
  answer_count?: number | null
  helpful_answer_count?: number | null
  follower_count?: number | null
  score?: number
  specialties?: string[] | null
  interests?: string[] | null
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '30', 10), 1), 50)
    const supabase = await createSupabaseServerClient()

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, role, trust_score, answer_count, helpful_answer_count')
      .neq('role', 'guest')
      .limit(limit)

    if (error) throw error

    // follower_count는 뷰/집계가 없으므로 2차 계산(선택)
    // 초기 버전: follower_count 없이 점수 계산 → 후속에서 뷰/집계 추가
    const ranked = (users || [])
      .map((u) => ({
        id: u.id,
        name: u.name || '사용자',
        role: u.role || 'user',
        avatar_url: u.avatar_url,
        trust_score: u.trust_score ?? 0,
        answer_count: u.answer_count ?? 0,
        helpful_answer_count: u.helpful_answer_count ?? 0,
        follower_count: null,
      }))
      .map(applyScore)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit)

    return NextResponse.json({ success: true, data: ranked })
  } catch (e: any) {
    console.error('[/api/users/popular] error', e?.message)
    return NextResponse.json({ success: false, error: 'Failed to load popular users', details: e?.message }, { status: 500 })
  }
}

function applyScore(u: PopularUser): PopularUser {
  const verifiedBoost = (u.role === 'verified' ? 5 : 0)
  const score =
    2 * (u.helpful_answer_count || 0) +
    1 * (u.answer_count || 0) +
    (u.trust_score || 0) / 10 +
    2 * (u.follower_count || 0) +
    verifiedBoost
  return { ...u, score }
}

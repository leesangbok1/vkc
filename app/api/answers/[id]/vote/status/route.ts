import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/answers/[id]/vote/status - 사용자의 답변 투표 상태 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const answerId = params.id

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: { user_vote: null } })
    }

    // 사용자의 투표 상태 조회
    const { data: vote } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('target_id', answerId)
      .eq('target_type', 'answer')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      data: {
        user_vote: vote?.vote_type || null
      }
    })

  } catch (error) {
    console.error('Vote status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
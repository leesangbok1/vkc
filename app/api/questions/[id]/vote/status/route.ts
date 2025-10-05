import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/questions/[id]/vote/status - 사용자의 질문 투표 상태 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    const questionId = id

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: { user_vote: null } })
    }

    // 사용자의 투표 상태 조회
    const { data: vote } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('target_id', questionId)
      .eq('target_type', 'question')
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
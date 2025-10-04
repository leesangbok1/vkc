import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

// GET /api/notifications/unread-count - 읽지 않은 알림 개수 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase?.auth.getUser()
    if (authError || !user) {
      return NextResponse?.json({ error: 'Unauthorized' }, { status: 401 } as any)
    }

    // 읽지 않은 알림 개수 조회
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true } as any)
      .eq('user_id', user?.id as any)
      .eq('read', false as any)

    if (error) {
      console?.error('읽지 않은 알림 개수 조회 오류:', error)
      return NextResponse?.json({ error: 'Failed to fetch unread count' }, { status: 500 } as any)
    }

    return NextResponse?.json({
      unreadCount: count || 0
    } as any)

  } catch (error) {
    console?.error('읽지 않은 알림 개수 API 오류:', error)
    return NextResponse?.json({ error: 'Internal server error' }, { status: 500 } as any)
  }
}
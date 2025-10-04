import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

// POST /api/notifications/mark-all-read - 모든 알림 읽음 처리
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase?.auth.getUser()
    if (authError || !user) {
      return NextResponse?.json({ error: 'Unauthorized' }, { status: 401 } as any)
    }

    // 사용자의 모든 읽지 않은 알림을 읽음 처리
    const { data: notifications, error } = await supabase
      .from('notifications')
      .update({ read: true } as any)
      .eq('user_id', user?.id as any)
      .eq('read', false as any)
      .select('id' as any) as any

    if (error) {
      console?.error('모든 알림 읽음 처리 오류:', error)
      return NextResponse?.json({ error: 'Failed to mark notifications as read' }, { status: 500 } as any)
    }

    const updatedCount = (notifications as any)?.length || 0

    return NextResponse?.json({
      message: `${updatedCount} notifications marked as read`,
      updatedCount
    })

  } catch (error) {
    console?.error('모든 알림 읽음 처리 API 오류:', error)
    return NextResponse?.json({ error: 'Internal server error' }, { status: 500 } as any)
  }
}
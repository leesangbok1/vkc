import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

// PUT /api/notifications/[id] - 알림 읽음 처리
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request?.json()
    const { read } = body

    const supabase = await createSupabaseServerClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase?.auth.getUser()
    if (authError || !user) {
      return NextResponse?.json({ error: 'Unauthorized' }, { status: 401 } as any)
    }

    // 자신의 알림만 수정 가능
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read } as any)
      .eq('id', id as any)
      .eq('user_id', user?.id as any)
      .select('*')
      .single() as any

    if (error) {
      console?.error('알림 업데이트 오류:', error)
      return NextResponse?.json({ error: 'Failed to update notification' }, { status: 500 } as any)
    }

    if (!notification) {
      return NextResponse?.json({ error: 'Notification not found' }, { status: 404 } as any)
    }

    return NextResponse?.json({ notification } as any)

  } catch (error) {
    console?.error('알림 업데이트 API 오류:', error)
    return NextResponse?.json({ error: 'Internal server error' }, { status: 500 } as any)
  }
}

// DELETE /api/notifications/[id] - 알림 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createSupabaseServerClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase?.auth.getUser()
    if (authError || !user) {
      return NextResponse?.json({ error: 'Unauthorized' }, { status: 401 } as any)
    }

    // 자신의 알림만 삭제 가능
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id as any)
      .eq('user_id', user?.id as any)

    if (error) {
      console?.error('알림 삭제 오류:', error)
      return NextResponse?.json({ error: 'Failed to delete notification' }, { status: 500 } as any)
    }

    return NextResponse?.json({ message: 'Notification deleted successfully' } as any)

  } catch (error) {
    console?.error('알림 삭제 API 오류:', error)
    return NextResponse?.json({ error: 'Internal server error' }, { status: 500 } as any)
  }
}
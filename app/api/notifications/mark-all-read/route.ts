import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { createServerLogger } from '@/lib/utils/server-logger'

const logger = createServerLogger('NotificationMarkAllReadAPI', 'api')

// POST /api/notifications/mark-all-read - 모든 알림 읽음 처리
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const { user } = await getUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 사용자의 모든 읽지 않은 알림을 읽음 처리
    const { data: notifications, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select('id')

    if (error) {
      logger.error('Mark all notifications as read error', error as Error, {
        action: 'markAllNotificationsAsRead',
        userId: user.id,
        severity: 'medium'
      })
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
    }

    const updatedCount = notifications?.length || 0

    logger.info('All notifications marked as read', {
      action: 'markAllNotificationsAsRead',
      userId: user.id,
      notificationCount: updatedCount
    })

    return NextResponse.json({
      message: `${updatedCount} notifications marked as read`,
      updated_count: updatedCount
    })

  } catch (error) {
    logger.error('Mark all notifications as read API error', error as Error, {
      action: 'markAllNotificationsAsReadAPI',
      severity: 'high'
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
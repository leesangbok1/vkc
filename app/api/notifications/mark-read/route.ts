import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { createServerLogger } from '@/lib/utils/server-logger'

const logger = createServerLogger('NotificationMarkReadAPI', 'api')

export async function POST(request: NextRequest) {
  try {
    const { user } = await getUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notification_ids } = body

    // Validate required fields
    if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
      return NextResponse.json(
        { error: 'notification_ids array is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // Mark notifications as read
    const { data: updatedNotifications, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .in('id', notification_ids)
      .eq('user_id', user.id) // Security: only update user's own notifications
      .select('id, is_read, read_at')

    if (error) {
      logger.error('Mark notifications as read error', error as Error, {
        action: 'markNotificationsAsRead',
        userId: user.id,
        notificationIds: notification_ids,
        severity: 'medium'
      })
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
    }

    logger.info('Notifications marked as read', {
      action: 'markNotificationsAsRead',
      userId: user.id,
      notificationCount: updatedNotifications?.length || 0
    })

    return NextResponse.json({
      updated_notifications: updatedNotifications,
      count: updatedNotifications?.length || 0
    })
  } catch (error) {
    logger.error('Mark notifications as read API error', error as Error, {
      action: 'markNotificationsAsReadAPI',
      severity: 'high'
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
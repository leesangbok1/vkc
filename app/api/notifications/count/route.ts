import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { createServerLogger } from '@/lib/utils/server-logger'

const logger = createServerLogger('NotificationCountAPI', 'api')

export async function GET(request: NextRequest) {
  try {
    const { user } = await getUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // Get count of unread notifications
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .gt('expires_at', new Date().toISOString())

    if (error) {
      logger.error('Get notification count error', error as Error, {
        action: 'getNotificationCount',
        userId: user.id,
        severity: 'medium'
      })
      return NextResponse.json({ error: 'Failed to get notification count' }, { status: 500 })
    }

    return NextResponse.json({
      unread_count: count || 0
    })
  } catch (error) {
    logger.error('Notification count API error', error as Error, {
      action: 'notificationCountAPI',
      severity: 'medium'
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
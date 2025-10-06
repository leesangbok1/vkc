import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { ValidationUtils } from '@/lib/validation'
import { createServerLogger } from '@/lib/utils/server-logger'

const logger = createServerLogger('NotificationsAPI', 'api')

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

    const { searchParams } = new URL(request.url)
    const { page, limit } = ValidationUtils.validatePagination(searchParams)
    const unreadOnly = searchParams.get('unread') === 'true'
    const offset = (page - 1) * limit

    let query = supabase
      .from('notifications')
      .select(`
        id,
        type,
        title,
        message,
        priority,
        related_id,
        related_type,
        action_url,
        metadata,
        is_read,
        channels,
        read_at,
        expires_at,
        created_at,
        user_id
      `)
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error, count } = await query

    if (error) {
      logger.error('Notifications fetch error', error as Error, {
        action: 'fetchNotifications',
        userId: user.id,
        severity: 'medium'
      })
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      notifications: notifications || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    })
  } catch (error) {
    logger.error('Notifications API error', error as Error, {
      action: 'notificationsAPI',
      severity: 'high'
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      target_user_id,
      type,
      title,
      message,
      priority = 'medium',
      related_id = null,
      related_type = null,
      action_url = null,
      metadata = {},
      expires_at = null,
      channels = ['in_app']
    } = body

    // Validate required fields
    if (!target_user_id || !type || !title || !message) {
      return NextResponse.json(
        { error: 'target_user_id, type, title, and message are required' },
        { status: 400 }
      )
    }

    // Validate priority
    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return NextResponse.json(
        { error: 'priority must be one of: low, medium, high, urgent' },
        { status: 400 }
      )
    }

    // Set default expiration (30 days from now)
    const defaultExpiration = new Date()
    defaultExpiration.setDate(defaultExpiration.getDate() + 30)

    const supabase = await createSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: target_user_id,
        type,
        title,
        message,
        priority,
        related_id,
        related_type,
        action_url,
        metadata,
        expires_at: expires_at || defaultExpiration.toISOString(),
        is_read: false,
        is_email_sent: false,
        is_push_sent: false,
        is_kakao_sent: false,
        channels
      })
      .select('*')
      .single()

    if (error) {
      logger.error('Notification creation error', error as Error, {
        action: 'createNotification',
        targetUserId: target_user_id,
        severity: 'high'
      })
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    // TODO: Send real-time notification via Firebase
    // TODO: Send push notification if user has enabled it
    // TODO: Send email notification if configured

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    logger.error('Notification creation API error', error as Error, {
      action: 'createNotificationAPI',
      severity: 'critical'
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
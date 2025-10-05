import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { ValidationUtils } from '@/lib/validation'

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
        related_id,
        related_type,
        is_read,
        channels,
        read_at,
        created_at,
        user_id
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error, count } = await query

    if (error) {
      console.error('Notifications fetch error:', error)
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
    console.error('Notifications API error:', error)
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
    const { target_user_id, type, title, message, related_id = null, related_type = null, channels = {} } = body

    // Validate required fields
    if (!target_user_id || !type || !title || !message) {
      return NextResponse.json(
        { error: 'target_user_id, type, title, and message are required' },
        { status: 400 }
      )
    }

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
        related_id,
        related_type,
        is_read: false,
        is_email_sent: false,
        is_push_sent: false,
        is_kakao_sent: false,
        channels
      })
      .select('*')
      .single()

    if (error) {
      console.error('Notification creation error:', error)
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    // TODO: Send real-time notification via Firebase
    // TODO: Send push notification if user has enabled it
    // TODO: Send email notification if configured

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Notification creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
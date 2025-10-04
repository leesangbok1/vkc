import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user } = await getUser(request)

    if (!user) {
      return NextResponse?.json({ error: 'Unauthorized' }, { status: 401 } as any)
    }

    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL((request as any).url)
    const page = parseInt(searchParams?.get('page') || '1')
    const limit = parseInt(searchParams?.get('limit') || '20')
    const unreadOnly = searchParams?.get('unread') === 'true'
    const offset = (page - 1) * limit

    let query = supabase
      .from('notifications')
      .select(`
        id,
        type,
        title,
        message,
        data,
        read_at,
        created_at,
        user_id
      ` as any)
      .eq('user_id', user?.id as any)
      .order('created_at', { ascending: false } as any)
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query?.is('read_at', null)
    }

    const { data: notifications, error, count } = await query

    if (error) {
      console?.error('Notifications fetch error:', error)
      return NextResponse?.json({ error: 'Failed to fetch notifications' }, { status: 500 } as any)
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true } as any)
      .eq('user_id', user?.id as any)

    return NextResponse?.json({
      notifications: notifications || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math?.ceil((totalCount || 0) / limit)
      }
    })
  } catch (error) {
    console?.error('Notifications API error:', error)
    return NextResponse?.json({ error: 'Internal server error' }, { status: 500 } as any)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getUser(request)

    if (!user) {
      return NextResponse?.json({ error: 'Unauthorized' }, { status: 401 } as any)
    }

    const body = await request?.json()
    const { target_user_id, type, title, message, data = {} } = body

    // Validate required fields
    if (!target_user_id || !type || !title || !message) {
      return NextResponse?.json(
        { error: 'target_user_id, type, title, and message are required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: target_user_id,
        type,
        title,
        message,
        data,
        created_by: user?.id
      } as any)
      .select('*')
      .single() as any

    if (error) {
      console?.error('Notification creation error:', error)
      return NextResponse?.json({ error: 'Failed to create notification' }, { status: 500 } as any)
    }

    // TODO: Send real-time notification via Firebase
    // TODO: Send push notification if user has enabled it
    // TODO: Send email notification if configured

    return NextResponse?.json({ notification }, { status: 201 } as any)
  } catch (error) {
    console?.error('Notification creation API error:', error)
    return NextResponse?.json({ error: 'Internal server error' }, { status: 500 } as any)
  }
}
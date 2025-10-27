import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { createServerLogger } from '@/lib/utils/server-logger'

const logger = createServerLogger('NotificationPreferencesAPI', 'api')

interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  browser_notifications: boolean
  question_answers: boolean
  answer_comments: boolean
  question_comments: boolean
  expert_matches: boolean
  vote_updates: boolean
  weekly_digest: boolean
  mentions: boolean
  priority_threshold: 'low' | 'medium' | 'high' | 'urgent'
}

// GET /api/users/notification-preferences - 사용자 알림 설정 조회
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

    // 사용자 프로필에서 알림 설정 조회 (JSON 컬럼 사용)
    const { data: profile, error } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', user.id)
      .single()

    if (error) {
      logger.error('Failed to fetch notification preferences', error as Error, {
        action: 'getNotificationPreferences',
        userId: user.id,
        severity: 'medium'
      })
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    // 기본값과 병합
    const defaultPreferences: NotificationPreferences = {
      email_notifications: true,
      push_notifications: false,
      browser_notifications: true,
      question_answers: true,
      answer_comments: true,
      question_comments: true,
      expert_matches: true,
      vote_updates: false,
      weekly_digest: true,
      mentions: true,
      priority_threshold: 'medium'
    }

    const preferences = profile?.notification_preferences || defaultPreferences

    return NextResponse.json({
      preferences: { ...defaultPreferences, ...preferences }
    })

  } catch (error) {
    logger.error('Notification preferences API error', error as Error, {
      action: 'getNotificationPreferencesAPI',
      severity: 'high'
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/users/notification-preferences - 사용자 알림 설정 저장
export async function POST(request: NextRequest) {
  try {
    const { user } = await getUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { preferences } = body

    // 설정 유효성 검사
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'preferences object is required' },
        { status: 400 }
      )
    }

    // 우선순위 유효성 검사
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    if (preferences.priority_threshold && !validPriorities.includes(preferences.priority_threshold)) {
      return NextResponse.json(
        { error: 'Invalid priority_threshold' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // 사용자 프로필에 알림 설정 저장
    const { error } = await supabase
      .from('users')
      .update({
        notification_preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      logger.error('Failed to save notification preferences', error as Error, {
        action: 'saveNotificationPreferences',
        userId: user.id,
        severity: 'medium'
      })
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
    }

    logger.info('Notification preferences saved successfully', {
      action: 'saveNotificationPreferences',
      userId: user.id
    })

    return NextResponse.json({
      message: 'Preferences saved successfully',
      preferences
    })

  } catch (error) {
    logger.error('Save notification preferences API error', error as Error, {
      action: 'saveNotificationPreferencesAPI',
      severity: 'high'
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
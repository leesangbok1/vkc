import { NextRequest, NextResponse } from 'next/server'
import { getServerDbClient, getServiceDbClient } from '@/lib/server/supabase-clients'
import type { Database } from '@/lib/supabase'

type RouteParams = { type: string; id: string }

const TABLE_CONFIG = {
  question: {
    table: 'questions',
    hideColumn: 'is_approved',
    supportsModerationMeta: true,
  },
  answer: {
    table: 'answers',
    hideColumn: 'is_approved',
    supportsModerationMeta: true,
  },
  comment: {
    table: 'comments',
    hideColumn: 'is_approved',
    supportsModerationMeta: true,
  },
  post: {
    table: 'posts',
    hideColumn: 'is_published',
    supportsModerationMeta: false,
  },
} satisfies Record<string, { table: keyof Database['public']['Tables']; hideColumn: string; supportsModerationMeta: boolean }>

const isAdminProfile = (profile: { role?: string | null; admin_yn?: string | null } | null) => {
  if (!profile) return false
  if ((profile.admin_yn || '').toUpperCase() === 'Y') return true
  return (profile.role || '').toLowerCase() === 'admin'
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { type, id } = await params
    if (!type || !id) {
      return NextResponse.json({ success: false, error: 'Invalid content target' }, { status: 400 })
    }

    const config = TABLE_CONFIG[type]
    if (!config) {
      return NextResponse.json({ success: false, error: 'Unsupported target type' }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const action = typeof body?.action === 'string' ? body.action.trim().toLowerCase() : ''
    const reportId = typeof body?.reportId === 'string' ? body.reportId.trim() : ''
    if (!['hide', 'unhide'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 })
    }

    const supabase = await getServerDbClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, admin_yn')
      .eq('id', user.id)
      .maybeSingle()

    if (!isAdminProfile(profile)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    let service = supabase
    try {
      service = getServiceDbClient()
    } catch (serviceError) {
      console.warn('[PATCH /api/admin/content] service client unavailable, falling back', serviceError)
    }

    const hideValue = action === 'hide' ? false : true
    const updates: Record<string, unknown> = {
      [config.hideColumn]: hideValue,
    }

    if (config.supportsModerationMeta) {
      updates.moderated_by = user.id
      updates.moderated_at = new Date().toISOString()
    }

    const { error } = await service
      .from(config.table)
      .update(updates as never)
      .eq('id', id)

    if (error) {
      throw error
    }

    if (reportId) {
      await logModerationEvent(service, reportId, {
        action,
        moderatorId: user.id,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      data: { id, action },
    })
  } catch (error) {
    console.error('[PATCH /api/admin/content] failed', error)
    return NextResponse.json({ success: false, error: 'Failed to update content' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { type, id } = await params
    if (!type || !id) {
      return NextResponse.json({ success: false, error: 'Invalid content target' }, { status: 400 })
    }

    const config = TABLE_CONFIG[type]
    if (!config) {
      return NextResponse.json({ success: false, error: 'Unsupported target type' }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const reportId = typeof body?.reportId === 'string' ? body.reportId.trim() : ''

    const supabase = await getServerDbClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, admin_yn')
      .eq('id', user.id)
      .maybeSingle()

    if (!isAdminProfile(profile)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    let service = supabase
    try {
      service = getServiceDbClient()
    } catch (serviceError) {
      console.warn('[DELETE /api/admin/content] service client unavailable, falling back', serviceError)
    }

    const { error } = await service
      .from(config.table)
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    if (reportId) {
      await logModerationEvent(service, reportId, {
        action: 'delete',
        moderatorId: user.id,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, data: { id, action: 'delete' } })
  } catch (error) {
    console.error('[DELETE /api/admin/content] failed', error)
    return NextResponse.json({ success: false, error: 'Failed to delete content' }, { status: 500 })
  }
}

type SupabaseClientType = Awaited<ReturnType<typeof getServiceDbClient>>

type ModerationLog = {
  action: string
  moderatorId: string
  timestamp: string
}

const logModerationEvent = async (
  client: SupabaseClientType,
  reportId: string,
  entry: ModerationLog
) => {
  try {
    const { data: reportRow, error: fetchError } = await client
      .from('content_reports')
      .select('metadata')
      .eq('id', reportId)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    const reportMetadata = (reportRow as { metadata: Record<string, unknown> | null } | null)?.metadata

    const metadata = reportMetadata && typeof reportMetadata === 'object'
      ? { ...reportMetadata }
      : {}

    const historyRaw = Array.isArray(metadata.moderationHistory)
      ? (metadata.moderationHistory as ModerationLog[])
      : []

    const nextHistory = [...historyRaw, entry].slice(-20)
    metadata.moderationHistory = nextHistory

    const { error: updateError } = await client
      .from('content_reports')
      .update({ metadata } as never)
      .eq('id', reportId)

    if (updateError) {
      throw updateError
    }
  } catch (error) {
    console.warn('[logModerationEvent] failed to update metadata', error)
  }
}

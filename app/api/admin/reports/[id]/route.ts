// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerDbClient, getServiceDbClient } from '@/lib/server/supabase-clients'
import { isReportStatus, ReportStatus, ReportTargetType } from '@/lib/constants/reports'
import { setTargetReportedFlag } from '@/lib/server/reporting'
import type { Database } from '@/lib/supabase'

type UsersTable = Database['public']['Tables']['users']
type ContentReportsTable = Database['public']['Tables']['content_reports']
type UserRow = UsersTable['Row']
type AdminCheckRow = Pick<UserRow, 'role' | 'admin_yn' | 'badges'>
type ReportRow = Pick<
  Database['public']['Tables']['content_reports']['Row'],
  'id' | 'status' | 'target_id' | 'target_type' | 'metadata'
>

interface RouteParams {
  params: Promise<{ id: string }>
}

const hasModeratorRights = (profile?: Pick<UserRow, 'role' | 'admin_yn' | 'badges'> | null) => {
  if (!profile) return false
  const role = (profile.role ?? '').toLowerCase()
  if (profile.admin_yn === 'Y' || role === 'admin') return true
  const badges = (profile.badges ?? {}) as Record<string, boolean>
  return Boolean(badges.moderator || badges.admin)
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const UNRESOLVED_STATUSES: ReportStatus[] = ['pending', 'in_review']

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Report id is required' }, { status: 400 })
    }

    const supabase = await getServerDbClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id, role, admin_yn, badges')
      .eq('id', user.id)
      .maybeSingle()

    if (!hasModeratorRights(profile)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload = await request.json().catch(() => null)
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const nextStatusRaw = typeof payload.status === 'string' ? payload.status.trim() : ''
    if (!isReportStatus(nextStatusRaw)) {
      return NextResponse.json({ error: 'Invalid report status' }, { status: 400 })
    }

    const reviewNote =
      typeof payload.reviewNote === 'string' ? payload.reviewNote.trim().slice(0, 1000) : ''
    const metadataOverride = isPlainObject(payload.metadata) ? payload.metadata : null

    const serviceClient = getServiceDbClient()

    const { data: report, error: fetchError } = await serviceClient
      .from('content_reports')
      .select('id, status, target_id, target_type, metadata')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const now = new Date().toISOString()
    const updates: Database['public']['Tables']['content_reports']['Update'] = {
      status: nextStatusRaw,
      updated_at: now
    }

    if (metadataOverride || reviewNote) {
      const existingMetadata =
        report.metadata && typeof report.metadata === 'object' && !Array.isArray(report.metadata)
          ? (report.metadata as Record<string, unknown>)
          : {}
      updates.metadata = {
        ...existingMetadata,
        ...(metadataOverride ?? {}),
        ...(reviewNote ? { reviewNote, reviewNoteUpdatedAt: now, reviewNoteBy: user.id } : {})
      }
    }

    if (nextStatusRaw === 'resolved' || nextStatusRaw === 'dismissed') {
      updates.reviewed_at = now
      updates.reviewed_by = user.id
    } else if (nextStatusRaw === 'in_review') {
      updates.reviewed_at = now
      updates.reviewed_by = user.id
    } else if (nextStatusRaw === 'pending') {
      updates.reviewed_at = null
      updates.reviewed_by = null
    }

    const { error: updateError } = await serviceClient
      .from('content_reports')
      .update(updates)
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    const { data: unresolved, error: unresolvedError } = await serviceClient
      .from('content_reports')
      .select('id')
      .eq('target_type', report.target_type)
      .eq('target_id', report.target_id)
      .in('status', UNRESOLVED_STATUSES)

    if (unresolvedError && unresolvedError.code !== 'PGRST116') {
      console.warn('[AdminReportUpdate] unresolved lookup failed', unresolvedError)
    }

    try {
      await setTargetReportedFlag(
        serviceClient,
        report.target_id,
        report.target_type as ReportTargetType,
        Array.isArray(unresolved) ? unresolved.length > 0 : false
      )
    } catch (flagError) {
      console.warn('[AdminReportUpdate] target flag update failed', flagError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        status: nextStatusRaw,
        reviewedAt: updates.reviewed_at ?? null,
        reviewedBy: updates.reviewed_by ?? null,
        metadata: updates.metadata ?? report.metadata ?? {}
      }
    })
  } catch (error) {
    console.error('[AdminReportUpdate] failed to update report', error)
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }
}

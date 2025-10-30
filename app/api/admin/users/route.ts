import { NextRequest, NextResponse } from 'next/server'
import { getServerDbClient, getServiceDbClient } from '@/lib/server/supabase-clients'
import type { Database } from '@/lib/supabase'

type UsersTable = Database['public']['Tables']['users']

type RawAdminUserRow = {
  id: string
  email: string | null
  name: string | null
  role: string | null
  verification_status: string | null
  created_at: string | null
  last_active: string | null
  question_count: number | null
  answer_count: number | null
  helpful_answer_count: number | null
  badges: Record<string, unknown> | null
}

type AdminCheckRow = Pick<Database['public']['Tables']['users']['Row'], 'role' | 'admin_yn'>

const DEFAULT_LIMIT = 200
const MAX_LIMIT = 500
const ACTIVE_THRESHOLD_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

const clampLimit = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_LIMIT
  return Math.min(Math.max(Math.floor(value), 1), MAX_LIMIT)
}

const isAdminProfile = (profile: { role?: string | null; admin_yn?: string | null } | null) => {
  if (!profile) return false
  if ((profile.admin_yn || '').toUpperCase() === 'Y') return true
  return (profile.role || '').toLowerCase() === 'admin'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerDbClient()
    const {
      data: { user },
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
      console.warn('[GET /api/admin/users] service client unavailable, falling back', serviceError)
      service = supabase
    }
    const url = new URL(request.url)
    const limit = clampLimit(parseInt(url.searchParams.get('limit') || '', 10))

    const { data, error } = await service
      .from('users')
      .select(
        `
          id,
          email,
          name,
          role,
          verification_status,
          created_at,
          last_active,
          question_count,
          answer_count,
          helpful_answer_count,
          badges
        `
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    const activeCutoff = Date.now() - ACTIVE_THRESHOLD_DAYS * MS_PER_DAY

    const rows = (data ?? []) as RawAdminUserRow[]
    const normalized = rows.map((row) => {
      const lastActiveTime = row.last_active ? Date.parse(row.last_active) : NaN
      const isActive = Number.isFinite(lastActiveTime) && lastActiveTime >= activeCutoff
      const badgeSource = row.badges && typeof row.badges === 'object'
        ? (row.badges as Record<string, unknown>)
        : null
      const adminCustomRaw = badgeSource && typeof badgeSource['admin_custom'] === 'object'
        ? (badgeSource['admin_custom'] as { label?: unknown; icon?: unknown })
        : null
      const customBadgeLabel = typeof adminCustomRaw?.label === 'string' ? adminCustomRaw.label.trim() : ''
      const customBadgeIcon = typeof adminCustomRaw?.icon === 'string' ? adminCustomRaw.icon.trim() : ''

      return {
        id: row.id,
        email: row.email ?? '',
        name: row.name ?? null,
        role: (row.role || 'user').toLowerCase(),
        verification_status: row.verification_status ?? null,
        created_at: row.created_at ?? null,
        last_active: row.last_active ?? null,
        questions_count: row.question_count ?? 0,
        answers_count: row.answer_count ?? 0,
        helpful_answers: row.helpful_answer_count ?? 0,
        is_active: isActive,
        custom_badge_label: customBadgeLabel,
        custom_badge_icon: customBadgeIcon,
      }
    })

    return NextResponse.json({
      success: true,
      data: normalized,
      meta: { count: normalized.length, limit },
    })
  } catch (error: unknown) {
    console.error('[GET /api/admin/users] failed', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: 'Failed to load users', details: message },
      { status: 500 }
    )
  }
}

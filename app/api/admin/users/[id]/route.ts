import { NextRequest, NextResponse } from 'next/server'
import { getServerDbClient, getServiceDbClient } from '@/lib/server/supabase-clients'
import type { Database } from '@/lib/supabase'

type RouteParams = { id: string }

type UsersTable = Database['public']['Tables']['users']
type AdminCheckRow = Pick<UsersTable['Row'], 'role' | 'admin_yn'>
type RoleValue = UsersTable['Row']['role']

const ALLOWED_ROLES = new Set(['guest', 'user', 'verified', 'admin'])

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
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Invalid user id' }, { status: 400 })
    }

    const payload = await request.json().catch(() => null)
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
    }

    const rawRole = typeof payload.role === 'string' ? payload.role.trim().toLowerCase() : undefined
    if (rawRole && !ALLOWED_ROLES.has(rawRole)) {
      return NextResponse.json({ success: false, error: 'Invalid role value' }, { status: 400 })
    }

    const rawBadgeLabel =
      typeof payload.customBadgeLabel === 'string' ? payload.customBadgeLabel.trim() : undefined
    const rawBadgeIcon =
      typeof payload.customBadgeIcon === 'string' ? payload.customBadgeIcon.trim() : undefined

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
      console.warn('[PATCH /api/admin/users/:id] service client unavailable, falling back', serviceError)
      service = supabase
    }
    const updates: UsersTable['Update'] = {}

    if (rawRole) {
      updates.role = rawRole as RoleValue
    }

    if (rawBadgeLabel !== undefined || rawBadgeIcon !== undefined) {
      const { data: badgesRow, error: badgesError } = await service
        .from('users')
        .select('badges')
        .eq('id', id)
        .maybeSingle()

      if (badgesError) {
        throw badgesError
      }

      const badgeData = (badgesRow as { badges: Record<string, unknown> | null } | null)?.badges

      const currentBadges = badgeData && typeof badgeData === 'object'
        ? badgeData
        : {}

      const adminCustom = typeof currentBadges['admin_custom'] === 'object'
        ? (currentBadges['admin_custom'] as { label?: unknown; icon?: unknown })
        : {}

      const nextLabel = rawBadgeLabel !== undefined ? rawBadgeLabel : typeof adminCustom.label === 'string' ? adminCustom.label : ''
      const nextIcon = rawBadgeIcon !== undefined ? rawBadgeIcon : typeof adminCustom.icon === 'string' ? adminCustom.icon : ''

      const nextBadges = { ...currentBadges }
      if (nextLabel || nextIcon) {
        nextBadges['admin_custom'] = {
          label: nextLabel,
          icon: nextIcon,
        }
      } else {
        delete nextBadges['admin_custom']
      }

      updates.badges = nextBadges
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields provided' }, { status: 400 })
    }

    const { data: updatedUser, error } = await service
      .from('users')
      .update(updates as never)
      .eq('id', id)
      .select('id, role, badges')
      .maybeSingle()

    if (error) {
      throw error
    }

    const updatedUserRow = updatedUser as { id: string; role: string | null; badges: Record<string, unknown> | null } | null

    return NextResponse.json({
      success: true,
      data: updatedUserRow,
    })
  } catch (error: unknown) {
    console.error('[PATCH /api/admin/users/:id] failed', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: 'Failed to update user', details: message },
      { status: 500 }
    )
  }
}

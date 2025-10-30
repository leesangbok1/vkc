import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Database } from '@/lib/supabase'

type AdminCheckRow = Pick<Database['public']['Tables']['users']['Row'], 'role' | 'admin_yn'>
type TableName = keyof Database['public']['Tables']

type CountBuilder = {
  eq: (column: string, value: unknown) => CountBuilder
  gte: (column: string, value: unknown) => CountBuilder
  gt: (column: string, value: unknown) => CountBuilder
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    // Authn/role check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Attempt to read role
    const { data: profile } = await supabase
      .from('users')
      .select('role, admin_yn')
      .eq('id', user.id)
      .maybeSingle()
    const adminProfile = profile as AdminCheckRow | null
    const isAdmin =
      adminProfile?.admin_yn === 'Y' ||
      (adminProfile?.role || '').toLowerCase() === 'admin'
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const safeCount = async (
      table: TableName,
      applyFilters?: (builder: CountBuilder) => CountBuilder
    ) => {
      const tableName = table as string
      try {
        let query = supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        if (applyFilters) {
          const nextQuery = applyFilters(query as unknown as CountBuilder)
          if (nextQuery) {
            query = nextQuery as unknown as typeof query
          }
        }
        const { count } = await query
        return count || 0
      } catch (countError) {
        console.warn(`[admin/overview] count failed for ${tableName}`, countError)
        return 0
      }
    }

    const [
      totalUsers,
      guestUsers,
      standardUsers,
      verifiedUsers,
      adminUsers,
      newUsersToday,
      activeUsers24h,
      totalQuestions,
      answeredQuestions,
      totalAnswers,
      pendingCerts,
    ] = await Promise.all([
      safeCount('users'),
      safeCount('users', (q) => q.eq('role', 'guest')),
      safeCount('users', (q) => q.eq('role', 'user')),
      safeCount('users', (q) => q.eq('role', 'verified')),
      safeCount('users', (q) => q.eq('role', 'admin')),
      safeCount('users', (q) => q.gte('created_at', startOfDay.toISOString())),
      safeCount('users', (q) => q.gte('last_active', last24Hours.toISOString())),
      safeCount('questions'),
      safeCount('questions', (q) => q.gt('answer_count', 0)),
      safeCount('answers'),
      safeCount('certification_requests', (q) => q.eq('status', 'pending')),
    ])

    const responseRate =
      totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : null

    return NextResponse.json({
      stats: {
        totalUsers,
        totalQuestions,
        totalAnswers,
        pendingCertifications: pendingCerts,
        activeUsers24h,
        newUsersToday,
        responseRate,
        satisfactionScore: null,
      },
      userRoles: {
        guest: guestUsers,
        user: standardUsers,
        verified: verifiedUsers,
        admin: adminUsers,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to load admin overview', details: message }, { status: 500 })
  }
}

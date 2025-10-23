import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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
    const isAdmin =
      profile?.admin_yn === 'Y' ||
      (profile?.role || '').toLowerCase() === 'admin'
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const safeCount = async (
      table: string,
      applyFilters?: (builder: any) => any
    ) => {
      try {
        let query: any = supabase.from(table).select('*', { count: 'exact', head: true })
        if (applyFilters) {
          query = applyFilters(query)
        }
        const { count } = await query
        return count || 0
      } catch (countError) {
        console.warn(`[admin/overview] count failed for ${table}`, countError)
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
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to load admin overview', details: error?.message }, { status: 500 })
  }
}

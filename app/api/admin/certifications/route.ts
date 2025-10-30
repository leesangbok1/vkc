import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase'
import { getServerDbClient } from '@/lib/server/supabase-clients'

type UsersTable = Database['public']['Tables']['users']
type CertificationRequestsTable = Database['public']['Tables']['certification_requests']
type AdminCheckRow = Pick<Database['public']['Tables']['users']['Row'], 'role' | 'admin_yn'>
type CertificationRequestRow = Database['public']['Tables']['certification_requests']['Row']
type RequestWithUser = CertificationRequestRow & {
  user: Pick<Database['public']['Tables']['users']['Row'], 'id' | 'name' | 'email' | 'role' | 'admin_yn'> | null
}

export async function GET(request: NextRequest) {
  try {
    // Get session to verify admin access
    const supabase = await getServerDbClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, admin_yn')
      .eq('id', session.user.id)
      .maybeSingle()

    const adminProfile = userData as AdminCheckRow | null

    const isAdmin =
      adminProfile?.admin_yn === 'Y' ||
      adminProfile?.role === 'admin'

    if (userError || !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('certification_requests')
      .select(`
        *,
        user:users!user_id(
          id,
          name,
          email,
          role,
          admin_yn
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: certRequests, error: queryError } = await query

    if (queryError) {
      console.error('Failed to fetch certification requests:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch certification requests' },
        { status: 500 }
      )
    }

    // Get total count
    let countQuery = supabase
      .from('certification_requests')
      .select('id', { count: 'exact', head: true })

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }

    const { count } = await countQuery

    return NextResponse.json({
      success: true,
      requests: (certRequests ?? []) as RequestWithUser[],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      }
    })

  } catch (error) {
    console.error('Get certifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

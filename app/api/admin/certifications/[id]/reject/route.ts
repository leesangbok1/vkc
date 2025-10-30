import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase'
import { getServerDbClient } from '@/lib/server/supabase-clients'

interface RouteParams {
  params: Promise<{ id: string }>
}

type UsersTable = Database['public']['Tables']['users']
type CertificationRequestsTable = Database['public']['Tables']['certification_requests']
type AdminCheckRow = Pick<UsersTable['Row'], 'role' | 'admin_yn'>
type CertificationRequestRow = CertificationRequestsTable['Row']
type CertificationRequestUpdate = CertificationRequestsTable['Update']

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: certificationId } = await params
    const body = await request.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

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

    // Update certification request status to rejected
    const certUpdate: CertificationRequestUpdate = {
      status: 'rejected',
      rejection_reason: reason,
      reviewed_by: session.user.id,
      reviewed_at: new Date().toISOString()
    }

    const { data: certRequest, error: updateError } = await supabase
      .from('certification_requests')
      .update<CertificationRequestUpdate>(certUpdate)
      .eq('id', certificationId)
      .select()
      .maybeSingle()

    const certRequestRow = certRequest as CertificationRequestRow | null

    if (updateError || !certRequestRow) {
      console.error('Failed to reject certification:', updateError)
      return NextResponse.json(
        { error: 'Failed to reject certification' },
        { status: 500 }
      )
    }

    // TODO: Send notification to user about rejection
    // await sendCertificationRejectedNotification(certRequest.user_id, reason)

    return NextResponse.json({
      success: true,
      message: 'Certification rejected successfully',
      certification: certRequestRow
    })

  } catch (error) {
    console.error('Certification rejection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

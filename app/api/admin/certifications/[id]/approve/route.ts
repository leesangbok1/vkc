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
type UserUpdate = UsersTable['Update']

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: certificationId } = await params

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

    // Update certification request status to approved
    const certUpdate: CertificationRequestUpdate = {
      status: 'approved',
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
      console.error('Failed to approve certification:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve certification' },
        { status: 500 }
      )
    }

    // Update user profile to VERIFIED role
    const allowedVerificationTypes = new Set<Exclude<UserUpdate['verification_type'], null>>([
      'student',
      'work',
      'family',
      'resident',
      'other'
    ])
    const rawVerificationType = certRequestRow.verification_type
    const derivedVerificationType: UserUpdate['verification_type'] =
      rawVerificationType && allowedVerificationTypes.has(rawVerificationType as Exclude<UserUpdate['verification_type'], null>)
        ? (rawVerificationType as Exclude<UserUpdate['verification_type'], null>)
        : 'other'

    const profileUpdate: UserUpdate = {
      role: 'verified',
      is_verified: true,
      verification_type: derivedVerificationType,
      verified_at: new Date().toISOString()
    }

    const { error: profileError } = await supabase
      .from('users')
      .update<UserUpdate>(profileUpdate)
      .eq('id', certRequestRow.user_id)

    if (profileError) {
      console.error('Failed to update user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    // TODO: Send notification to user about approval
    // await sendCertificationApprovedNotification(certRequest.user_id)

    return NextResponse.json({
      success: true,
      message: 'Certification approved successfully',
      certification: certRequestRow
    })

  } catch (error) {
    console.error('Certification approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

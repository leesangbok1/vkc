import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: certificationId } = await params

    // Get session to verify admin access
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || userData?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Update certification request status to approved
    const { data: certRequest, error: updateError } = await supabase
      .from('certification_requests')
      .update({
        status: 'approved',
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', certificationId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to approve certification:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve certification' },
        { status: 500 }
      )
    }

    // Update user profile to VERIFIED role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'VERIFIED',
        is_verified: true,
        verification_type: certRequest.verification_type,
        verified_at: new Date().toISOString()
      })
      .eq('id', certRequest.user_id)

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
      certification: certRequest
    })

  } catch (error) {
    console.error('Certification approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

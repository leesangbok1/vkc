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
    const body = await request.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

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

    // Update certification request status to rejected
    const { data: certRequest, error: updateError } = await supabase
      .from('certification_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', certificationId)
      .select()
      .single()

    if (updateError) {
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
      certification: certRequest
    })

  } catch (error) {
    console.error('Certification rejection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

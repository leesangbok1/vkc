import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: certificationId } = await params
    const body = await request.json()
    const { notes } = body

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

    // Update admin notes
    const { data: certRequest, error: updateError } = await supabase
      .from('certification_requests')
      .update({
        admin_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', certificationId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update admin notes:', updateError)
      return NextResponse.json(
        { error: 'Failed to update admin notes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin notes updated successfully',
      certification: certRequest
    })

  } catch (error) {
    console.error('Admin notes update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

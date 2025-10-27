import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id)

    if (error) throw error

    const ids = (data || []).map((row) => row.following_id)
    return NextResponse.json({ success: true, data: ids })
  } catch (error: any) {
    console.error('[GET /api/users/following] failed', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load following ids', details: error?.message },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[/api/auth/logout] signOut error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to sign out.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[/api/auth/logout] unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Unexpected server error.' },
      { status: 500 }
    )
  }
}

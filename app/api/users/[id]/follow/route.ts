import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: followingId } = await params
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (followingId === user.id) {
      return NextResponse.json(
        { error: 'You cannot follow yourself.' },
        { status: 400 }
      )
    }

    // insert follow (RLS should allow only follower_id = auth.uid())
    const { error } = await supabase
      .from('user_follows')
      .insert({ follower_id: user.id, following_id: followingId })

    if (error) {
      const msg = String(error.message || '')
      const isDuplicate = msg.includes('duplicate') || msg.includes('unique')
      const status = isDuplicate ? 409 : 400
      return NextResponse.json({ error: 'Failed to follow', details: error.message }, { status })
    }
    return NextResponse.json({ success: true, isFollowing: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to follow', details: e?.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: followingId } = await params
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)

    if (error) return NextResponse.json({ error: 'Failed to unfollow', details: error.message }, { status: 400 })
    return NextResponse.json({ success: true, isFollowing: false })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to unfollow', details: e?.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server'

const USER_SELECT_COLUMNS =
  'id, name, avatar_url, role, verification_status, specialty_areas, interests, bio'

type FollowRow = {
  id: string
  created_at: string
  target?: Record<string, any> | null
  origin?: Record<string, any> | null
  follower_id?: string | null
  following_id?: string | null
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let queryClient = supabase
    try {
      queryClient = createSupabaseServiceClient()
    } catch (serviceError) {
      console.warn('[followers] service client unavailable, fallback to session client', serviceError)
    }

    const fetchRows = async (mode: 'following' | 'followers') => {
      const isFollowingList = mode === 'following'
      const { data, error } = (await queryClient
        .from('user_follows')
        .select(
          `
            id,
            created_at,
            follower_id,
            following_id,
            ${isFollowingList
              ? `target:users!user_follows_following_id_fkey(${USER_SELECT_COLUMNS})`
              : `origin:users!user_follows_follower_id_fkey(${USER_SELECT_COLUMNS})`
            }
          `
        )
        .eq(isFollowingList ? 'follower_id' : 'following_id', user.id)
        .order('created_at', { ascending: false })) as unknown as {
        data: FollowRow[] | null
        error: any
      }

      if (error && error.code === '42501') {
        const fallback = await queryClient
          .from('user_follows')
          .select('id, created_at, follower_id, following_id')
          .eq(isFollowingList ? 'follower_id' : 'following_id', user.id)
          .order('created_at', { ascending: false })
        return {
          data: Array.isArray(fallback.data) ? (fallback.data as FollowRow[]) : [],
          error: fallback.error && fallback.error.code !== 'PGRST116' ? fallback.error : null,
        }
      }

      return { data: Array.isArray(data) ? data : [], error }
    }

    const [followingResult, followersResult] = await Promise.all([
      fetchRows('following'),
      fetchRows('followers'),
    ])

    if (followingResult.error && followingResult.error.code !== '42501') {
      throw followingResult.error
    }
    if (followersResult.error && followersResult.error.code !== '42501') {
      throw followersResult.error
    }

    const serialize = (entry: FollowRow, key: 'target' | 'origin') => {
      const payload = entry[key]
      const fallbackId = key === 'target' ? entry.following_id : entry.follower_id
      const base = {
        id: typeof fallbackId === 'string' ? fallbackId : '',
        name: '커뮤니티 멤버',
        avatar_url: null,
        role: null as string | null,
        verification_status: null as string | null,
        specialty_areas: [] as string[],
        interests: [] as string[],
        bio: null as string | null,
        followedAt: entry.created_at,
      }

      if (!payload || typeof payload !== 'object') {
        return base
      }

      const result = {
        ...base,
        id: typeof payload.id === 'string' ? payload.id : base.id,
        name:
          typeof payload.name === 'string' && payload.name.trim().length > 0
            ? payload.name.trim()
            : base.name,
        avatar_url:
          typeof payload.avatar_url === 'string' && payload.avatar_url.length > 0
            ? payload.avatar_url
            : base.avatar_url,
        role: typeof payload.role === 'string' ? payload.role : base.role,
        verification_status:
          typeof payload.verification_status === 'string'
            ? payload.verification_status
            : base.verification_status,
        specialty_areas: Array.isArray(payload.specialty_areas)
          ? payload.specialty_areas.filter((value: unknown): value is string => typeof value === 'string')
          : base.specialty_areas,
        interests: Array.isArray(payload.interests)
          ? payload.interests.filter((value: unknown): value is string => typeof value === 'string')
          : base.interests,
        bio: typeof payload.bio === 'string' ? payload.bio : base.bio,
      }
      return result.id ? result : null
    }

    const following = (followingResult.data || [])
      .map((entry) => serialize(entry, 'target'))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
    const followers = (followersResult.data || [])
      .map((entry) => serialize(entry, 'origin'))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))

    return NextResponse.json({
      success: true,
      data: {
        following,
        followers,
      },
    })
  } catch (error: any) {
    console.error('[GET /api/users/followers] failed', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load follower data', details: error?.message },
      { status: 500 }
    )
  }
}

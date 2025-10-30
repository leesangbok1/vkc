import { NextRequest, NextResponse } from 'next/server'
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from '@/lib/supabase-server'
import {
  buildViewerContext,
  computeExpDecay,
  computeTopicMatches,
} from '@/lib/services/feed-utils'

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 20

const clampLimit = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_LIMIT
  return Math.min(Math.max(Math.floor(value), 1), MAX_LIMIT)
}

type CandidateUser = {
  id: string
  name: string | null
  role: string | null
  avatar_url?: string | null
  trust_score?: number | null
  answer_count?: number | null
  helpful_answer_count?: number | null
  specialty_areas?: string[] | null
  interests?: string[] | null
  last_active?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = clampLimit(parseInt(url.searchParams.get('limit') || '', 10))

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const viewerContext = await buildViewerContext(supabase as any, user.id)

    let serviceClient
    try {
      serviceClient = createSupabaseServiceClient()
    } catch (serviceError) {
      console.warn('[GET /api/users/recommended] service client unavailable, falling back', serviceError)
      serviceClient = supabase
    }

    const { data: rawUsers, error } = await serviceClient
      .from('users')
      .select(
        `
          id,
          name,
          role,
          avatar_url,
          trust_score,
          answer_count,
          helpful_answer_count,
          specialty_areas,
          interests,
          last_active
        `
      )
      .neq('id', user.id)
      .neq('role', 'guest')
      .limit(200)

    if (error) {
      if ((error as any)?.code === '42501') {
        console.warn('[GET /api/users/recommended] insufficient privileges, returning empty list')
        return NextResponse.json({ success: true, data: [] })
      }
      throw error
    }

    const recommended = (rawUsers as CandidateUser[] | null | undefined)?.filter(
      (candidate) => candidate?.id && !viewerContext.followingSet.has(candidate.id)
    )

    if (!recommended || recommended.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const ranked = recommended
      .map((candidate) => {
        const topics = [
          ...(Array.isArray(candidate.specialty_areas) ? candidate.specialty_areas : []),
          ...(Array.isArray(candidate.interests) ? candidate.interests : []),
        ]

        const topicMatchScore = computeTopicMatches(topics, null, viewerContext.topicSet)
        const recencyBoost = computeExpDecay(candidate.last_active ?? null, 14) * 5
        const roleBoost =
          candidate.role === 'admin' ? 8 : candidate.role === 'verified' ? 5 : 0

        const baseScore =
          2 * (candidate.helpful_answer_count ?? 0) +
          1 * (candidate.answer_count ?? 0) +
          (candidate.trust_score ?? 0) / 10

        const score = baseScore + topicMatchScore * 4 + recencyBoost + roleBoost

        return {
          id: candidate.id,
          name: candidate.name || '사용자',
          role: candidate.role || 'user',
          avatar_url: candidate.avatar_url ?? null,
          trust_score: candidate.trust_score ?? 0,
          answer_count: candidate.answer_count ?? 0,
          helpful_answer_count: candidate.helpful_answer_count ?? 0,
          specialties: Array.isArray(candidate.specialty_areas)
            ? candidate.specialty_areas
            : [],
          interests: Array.isArray(candidate.interests) ? candidate.interests : [],
          last_active: candidate.last_active ?? null,
          score,
        }
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, limit)

    return NextResponse.json({ success: true, data: ranked })
  } catch (error: any) {
    console.error('[GET /api/users/recommended] failed', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load recommended users', details: error?.message },
      { status: 500 }
    )
  }
}

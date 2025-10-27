import type { SupabaseClient } from '@supabase/supabase-js'

export type ViewerContext = {
  topicSet: Set<string>
  followingSet: Set<string>
  helpfulQuestionIds: Set<string>
  helpfulPostIds: Set<string>
}

export async function buildViewerContext(
  client: SupabaseClient,
  userId: string | null
): Promise<ViewerContext> {
  if (!userId) {
    return {
      topicSet: new Set(),
      followingSet: new Set(),
      helpfulQuestionIds: new Set(),
      helpfulPostIds: new Set(),
    }
  }

  try {
    const [
      { data: userProfile },
      { data: followRows },
      { data: helpfulRows },
    ] = await Promise.all([
      client
        .from('users')
        .select('id, interests, specialty_areas')
        .eq('id', userId)
        .maybeSingle(),
      client
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId),
      client
        .from('votes')
        .select('target_id, target_type')
        .eq('user_id', userId)
        .eq('vote_type', 'helpful'),
    ])

    const topicSet = new Set<string>()
    const rawTopics: unknown[] = [
      ...(Array.isArray(userProfile?.interests) ? userProfile!.interests : []),
      ...(Array.isArray(userProfile?.specialty_areas) ? userProfile!.specialty_areas : []),
    ]
    rawTopics
      .map((item) => normalizeTopic(item))
      .filter((value): value is string => Boolean(value))
      .forEach((value) => topicSet.add(value))

    const followingSet = new Set<string>(
      Array.isArray(followRows) ? followRows.map((row) => row.following_id) : []
    )

    const helpfulQuestionIds = new Set<string>()
    const helpfulPostIds = new Set<string>()
    if (Array.isArray(helpfulRows)) {
      helpfulRows.forEach((vote: any) => {
        const targetId = vote?.target_id ? String(vote.target_id) : null
        if (!targetId) return
        if (vote?.target_type === 'question') helpfulQuestionIds.add(targetId)
        else if (vote?.target_type === 'post') helpfulPostIds.add(targetId)
      })
    }

    return { topicSet, followingSet, helpfulQuestionIds, helpfulPostIds }
  } catch (error) {
    console.warn('[feed-utils] failed to build viewer context', error)
    return {
      topicSet: new Set(),
      followingSet: new Set(),
      helpfulQuestionIds: new Set(),
      helpfulPostIds: new Set(),
    }
  }
}

export function computeExpDecay(dateString: string | null, halfLifeDays: number): number {
  if (!dateString) return 0
  const diffDays = getDiffInDays(dateString)
  if (diffDays <= 0) return 1
  return Math.exp(-Math.max(diffDays, 0) / Math.max(halfLifeDays, 1))
}

export function getDiffInDays(dateString: string): number {
  const target = new Date(dateString).getTime()
  if (!Number.isFinite(target)) return Number.POSITIVE_INFINITY
  const diffMs = Date.now() - target
  return diffMs / (1000 * 60 * 60 * 24)
}

export function computeTopicMatches(
  tags: string[] | null,
  categorySlug: string | null,
  viewerTopics: Set<string>
): number {
  if (!viewerTopics || viewerTopics.size === 0) return 0
  const pool = new Set<string>()
  if (Array.isArray(tags)) {
    tags
      .map((tag) => normalizeTopic(tag))
      .filter((value): value is string => Boolean(value))
      .forEach((value) => pool.add(value))
  }
  if (categorySlug) {
    const normalized = normalizeTopic(categorySlug)
    if (normalized) pool.add(normalized)
  }

  let matches = 0
  pool.forEach((topic) => {
    if (viewerTopics.has(topic)) {
      matches += 1
    }
  })
  return matches
}

export function normalizeTopic(value: unknown): string | null {
  if (typeof value !== 'string') return null
  return value.trim().toLowerCase()
}

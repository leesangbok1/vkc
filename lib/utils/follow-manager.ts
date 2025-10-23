/**
 * Follow & Topic Subscription utilities backed by Supabase APIs.
 * These helpers abstract fetch calls for client components.
 */

export interface FollowedUser {
  id: string
  name?: string
  email?: string
  role?: string
  avatar_url?: string
  followed_at: string
}

export interface SubscribedTopic {
  /** Category identifier */
  id: number
  name: string
  slug?: string
  icon?: string
  subscribed_at: string
  /** Supabase topic_subscriptions row id */
  subscriptionId: string
}

const TOPIC_ENDPOINT = '/api/topics/subscriptions'
const USER_FOLLOW_ENDPOINT = '/api/users'

let topicCache: SubscribedTopic[] | null = null
let followingCache: Set<string> | null = null

function mapTopic(row: any): SubscribedTopic {
  const category = row?.category ?? {}
  const categoryId = Number(row?.category_id ?? category?.id ?? 0)

  return {
    id: Number.isFinite(categoryId) ? categoryId : 0,
    name: typeof category?.name === 'string' && category.name.length > 0
      ? category.name
      : '이름 없는 토픽',
    slug: typeof category?.slug === 'string' ? category.slug : undefined,
    icon: typeof category?.icon === 'string' ? category.icon : undefined,
    subscribed_at: typeof row?.created_at === 'string'
      ? row.created_at
      : new Date().toISOString(),
    subscriptionId: String(row?.id ?? crypto.randomUUID())
  }
}

async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init)
  if (res.status === 401) {
    throw new Error('Unauthorized')
  }
  return res
}

export async function getSubscribedTopics(forceRefresh = false): Promise<SubscribedTopic[]> {
  if (!forceRefresh && topicCache) {
    return topicCache
  }

  try {
    const res = await fetchWithAuth(TOPIC_ENDPOINT, { cache: 'no-store' })
    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || 'Failed to load topic subscriptions')
    }

    const payload = await res.json()
    const data = Array.isArray(payload?.data) ? payload.data : []
    topicCache = data.map(mapTopic)
    return topicCache
  } catch (error) {
    console.error('[follow-manager] getSubscribedTopics failed:', error)
    topicCache = []
    return []
  }
}

export async function subscribeTopic(topic: { id: number; slug?: string }): Promise<SubscribedTopic | null> {
  try {
    const res = await fetchWithAuth(TOPIC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: topic.id, category_slug: topic.slug })
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || 'Failed to subscribe to topic')
    }

    const payload = await res.json()
    const subscription = payload?.data ? mapTopic(payload.data) : null

    if (subscription) {
      topicCache = topicCache ? [subscription, ...topicCache.filter(t => t.id !== subscription.id)] : [subscription]
    }

    return subscription
  } catch (error) {
    console.error('[follow-manager] subscribeTopic failed:', error)
    return null
  }
}

export async function unsubscribeTopic(topicIdentifier: number | string): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${TOPIC_ENDPOINT}/${topicIdentifier}`, {
      method: 'DELETE'
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || 'Failed to unsubscribe from topic')
    }

    if (topicCache) {
      topicCache = topicCache.filter(topic => topic.subscriptionId !== topicIdentifier && topic.id !== Number(topicIdentifier))
    }
    return true
  } catch (error) {
    console.error('[follow-manager] unsubscribeTopic failed:', error)
    return false
  }
}

export async function toggleSubscribeTopic(topic: { id: number; slug?: string }): Promise<{ success: boolean; isSubscribed: boolean; topic: SubscribedTopic | null }> {
  const current = await getSubscribedTopics()
  const existing = current.find(item => item.id === topic.id)

  if (existing) {
    const removed = await unsubscribeTopic(existing.subscriptionId)
    return { success: removed, isSubscribed: !removed, topic: removed ? null : existing }
  }

  const created = await subscribeTopic(topic)
  const success = Boolean(created)
  return { success, isSubscribed: success, topic: created }
}

function mapFollowIds(ids: string[]): FollowedUser[] {
  return ids.map(id => ({
    id,
    followed_at: new Date().toISOString()
  }))
}

export async function getFollowedUsers(forceRefresh = false): Promise<FollowedUser[]> {
  if (!forceRefresh && followingCache) {
    return mapFollowIds(Array.from(followingCache))
  }

  try {
    const res = await fetchWithAuth(`${USER_FOLLOW_ENDPOINT}/following`, { cache: 'no-store' })
    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || 'Failed to load following users')
    }

    const payload = await res.json()
    const ids = Array.isArray(payload?.data) ? payload.data : []
    followingCache = new Set(ids.map(String))
    return mapFollowIds(ids.map(String))
  } catch (error) {
    console.error('[follow-manager] getFollowedUsers failed:', error)
    followingCache = new Set()
    return []
  }
}

export async function followUser(userId: string): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${USER_FOLLOW_ENDPOINT}/${userId}/follow`, { method: 'POST' })
    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || 'Failed to follow user')
    }

    if (followingCache) {
      followingCache.add(userId)
    }
    return true
  } catch (error) {
    console.error('[follow-manager] followUser failed:', error)
    return false
  }
}

export async function unfollowUser(userId: string): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${USER_FOLLOW_ENDPOINT}/${userId}/follow`, { method: 'DELETE' })
    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || 'Failed to unfollow user')
    }

    if (followingCache) {
      followingCache.delete(userId)
    }
    return true
  } catch (error) {
    console.error('[follow-manager] unfollowUser failed:', error)
    return false
  }
}

export async function isFollowingUser(userId: string): Promise<boolean> {
  const cache = followingCache
  if (cache && cache.size > 0) {
    return cache.has(userId)
  }

  const users = await getFollowedUsers()
  return users.some(user => user.id === userId)
}

export async function toggleFollowUser(userId: string): Promise<{ success: boolean; isFollowing: boolean }> {
  const currentlyFollowing = await isFollowingUser(userId)

  if (currentlyFollowing) {
    const success = await unfollowUser(userId)
    return { success, isFollowing: !success }
  }

  const success = await followUser(userId)
  return { success, isFollowing: success }
}

export function clearFollowCaches() {
  topicCache = null
  followingCache = null
}

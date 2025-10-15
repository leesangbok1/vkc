/**
 * Follow Management Utility
 * Handles localStorage-based follow functionality for users and topics
 */

export interface FollowedUser {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string
  followed_at: string
}

export interface SubscribedTopic {
  id: number
  name: string
  slug: string
  icon: string
  subscribed_at: string
}

// Legacy type for backward compatibility
export type FollowedTopic = SubscribedTopic

const FOLLOWED_USERS_KEY = 'vietkconnect_followed_users'
const SUBSCRIBED_TOPICS_KEY = 'vietkconnect_subscribed_topics'
const LEGACY_FOLLOWED_TOPICS_KEY = 'vietkconnect_followed_topics' // For migration

// User Following Functions
export function getFollowedUsers(): FollowedUser[] {
  try {
    const followedStr = localStorage.getItem(FOLLOWED_USERS_KEY)
    return followedStr ? JSON.parse(followedStr) : []
  } catch (error) {
    console.error('Failed to load followed users:', error)
    return []
  }
}

export function followUser(user: Omit<FollowedUser, 'followed_at'>): boolean {
  try {
    const followed = getFollowedUsers()

    // Check if already following
    const exists = followed.some(u => u.id === user.id)
    if (exists) {
      return false
    }

    const newFollow: FollowedUser = {
      ...user,
      followed_at: new Date().toISOString()
    }

    followed.unshift(newFollow)
    localStorage.setItem(FOLLOWED_USERS_KEY, JSON.stringify(followed))
    return true
  } catch (error) {
    console.error('Failed to follow user:', error)
    return false
  }
}

export function unfollowUser(userId: string): boolean {
  try {
    const followed = getFollowedUsers()
    const filtered = followed.filter(u => u.id !== userId)

    if (filtered.length === followed.length) {
      return false // Nothing was removed
    }

    localStorage.setItem(FOLLOWED_USERS_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Failed to unfollow user:', error)
    return false
  }
}

export function isFollowingUser(userId: string): boolean {
  const followed = getFollowedUsers()
  return followed.some(u => u.id === userId)
}

export function toggleFollowUser(user: Omit<FollowedUser, 'followed_at'>): { success: boolean; isFollowing: boolean } {
  const currentlyFollowing = isFollowingUser(user.id)

  if (currentlyFollowing) {
    const success = unfollowUser(user.id)
    return { success, isFollowing: false }
  } else {
    const success = followUser(user)
    return { success, isFollowing: true }
  }
}

// Topic Subscription Functions
export function getSubscribedTopics(): SubscribedTopic[] {
  try {
    // Try new key first
    let subscribedStr = localStorage.getItem(SUBSCRIBED_TOPICS_KEY)

    // Migration: Check legacy key if new key doesn't exist
    if (!subscribedStr) {
      const legacyStr = localStorage.getItem(LEGACY_FOLLOWED_TOPICS_KEY)
      if (legacyStr) {
        const legacyTopics = JSON.parse(legacyStr)
        // Migrate followed_at to subscribed_at
        const migratedTopics = legacyTopics.map((topic: any) => ({
          ...topic,
          subscribed_at: topic.followed_at || new Date().toISOString()
        }))
        // Save to new key
        localStorage.setItem(SUBSCRIBED_TOPICS_KEY, JSON.stringify(migratedTopics))
        // Remove legacy key
        localStorage.removeItem(LEGACY_FOLLOWED_TOPICS_KEY)
        return migratedTopics
      }
      return []
    }

    return JSON.parse(subscribedStr)
  } catch (error) {
    console.error('Failed to load subscribed topics:', error)
    return []
  }
}

// Legacy function for backward compatibility
export function getFollowedTopics(): SubscribedTopic[] {
  return getSubscribedTopics()
}

export function subscribeTopic(topic: Omit<SubscribedTopic, 'subscribed_at'>): boolean {
  try {
    const subscribed = getSubscribedTopics()

    // Check if already subscribed
    const exists = subscribed.some(t => t.id === topic.id)
    if (exists) {
      return false
    }

    const newSubscription: SubscribedTopic = {
      ...topic,
      subscribed_at: new Date().toISOString()
    }

    subscribed.unshift(newSubscription)
    localStorage.setItem(SUBSCRIBED_TOPICS_KEY, JSON.stringify(subscribed))
    return true
  } catch (error) {
    console.error('Failed to subscribe topic:', error)
    return false
  }
}

export function unsubscribeTopic(topicId: number): boolean {
  try {
    const subscribed = getSubscribedTopics()
    const filtered = subscribed.filter(t => t.id !== topicId)

    if (filtered.length === subscribed.length) {
      return false // Nothing was removed
    }

    localStorage.setItem(SUBSCRIBED_TOPICS_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Failed to unsubscribe topic:', error)
    return false
  }
}

export function isSubscribedToTopic(topicId: number): boolean {
  const subscribed = getSubscribedTopics()
  return subscribed.some(t => t.id === topicId)
}

export function toggleSubscribeTopic(topic: Omit<SubscribedTopic, 'subscribed_at'>): { success: boolean; isSubscribed: boolean } {
  const currentlySubscribed = isSubscribedToTopic(topic.id)

  if (currentlySubscribed) {
    const success = unsubscribeTopic(topic.id)
    return { success, isSubscribed: false }
  } else {
    const success = subscribeTopic(topic)
    return { success, isSubscribed: true }
  }
}

// Legacy functions for backward compatibility
export function followTopic(topic: Omit<SubscribedTopic, 'subscribed_at'>): boolean {
  return subscribeTopic(topic)
}

export function unfollowTopic(topicId: number): boolean {
  return unsubscribeTopic(topicId)
}

export function isFollowingTopic(topicId: number): boolean {
  return isSubscribedToTopic(topicId)
}

export function toggleFollowTopic(topic: Omit<SubscribedTopic, 'subscribed_at'>): { success: boolean; isFollowing: boolean } {
  const result = toggleSubscribeTopic(topic)
  return { success: result.success, isFollowing: result.isSubscribed }
}

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

export interface FollowedTopic {
  id: number
  name: string
  slug: string
  icon: string
  followed_at: string
}

const FOLLOWED_USERS_KEY = 'vietkconnect_followed_users'
const FOLLOWED_TOPICS_KEY = 'vietkconnect_followed_topics'

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

// Topic Following Functions
export function getFollowedTopics(): FollowedTopic[] {
  try {
    const followedStr = localStorage.getItem(FOLLOWED_TOPICS_KEY)
    return followedStr ? JSON.parse(followedStr) : []
  } catch (error) {
    console.error('Failed to load followed topics:', error)
    return []
  }
}

export function followTopic(topic: Omit<FollowedTopic, 'followed_at'>): boolean {
  try {
    const followed = getFollowedTopics()

    // Check if already following
    const exists = followed.some(t => t.id === topic.id)
    if (exists) {
      return false
    }

    const newFollow: FollowedTopic = {
      ...topic,
      followed_at: new Date().toISOString()
    }

    followed.unshift(newFollow)
    localStorage.setItem(FOLLOWED_TOPICS_KEY, JSON.stringify(followed))
    return true
  } catch (error) {
    console.error('Failed to follow topic:', error)
    return false
  }
}

export function unfollowTopic(topicId: number): boolean {
  try {
    const followed = getFollowedTopics()
    const filtered = followed.filter(t => t.id !== topicId)

    if (filtered.length === followed.length) {
      return false // Nothing was removed
    }

    localStorage.setItem(FOLLOWED_TOPICS_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Failed to unfollow topic:', error)
    return false
  }
}

export function isFollowingTopic(topicId: number): boolean {
  const followed = getFollowedTopics()
  return followed.some(t => t.id === topicId)
}

export function toggleFollowTopic(topic: Omit<FollowedTopic, 'followed_at'>): { success: boolean; isFollowing: boolean } {
  const currentlyFollowing = isFollowingTopic(topic.id)

  if (currentlyFollowing) {
    const success = unfollowTopic(topic.id)
    return { success, isFollowing: false }
  } else {
    const success = followTopic(topic)
    return { success, isFollowing: true }
  }
}

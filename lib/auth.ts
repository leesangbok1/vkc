import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from './supabase-server'
import { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  [key: string]: any
}

/**
 * Get authenticated user from request
 * Used in API routes to verify authentication
 */
export async function getUser(request: NextRequest): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()

    // Return mock user in mock mode
    if (!supabase) {
      return {
        user: {
          id: 'mock-user-123',
          email: 'mock@example.com',
          name: 'Mock User',
          avatar_url: undefined
        }
      }
    }

    // Get user from Supabase auth
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Auth error:', error)
      return { user: null, error: error.message }
    }

    if (!user) {
      return { user: null, error: 'No authenticated user' }
    }

    // Get additional user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users').select('*').eq('id', user.id).single() as any

    if (userError) {
      console.error('User data fetch error:', userError)
      // Return basic auth user if database user doesn't exist
      return {
        user: {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          avatar_url: user.user_metadata?.avatar_url || null
        }
      }
    }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar_url: userData.avatar_url,
        ...userData
      }
    }
  } catch (error) {
    console.error('getUser error:', error)
    return { user: null, error: 'Authentication failed' }
  }
}

/**
 * Require authenticated user - throws if not authenticated
 */
export async function requireUser(request: NextRequest): Promise<AuthUser> {
  const { user, error } = await getUser(request)

  if (!user) {
    throw new Error(error || 'Authentication required')
  }

  return user
}

/**
 * Check if user has specific role or permission
 */
export async function hasPermission(user: AuthUser, permission: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient()

    // Return true for mock user to allow testing
    if (!supabase) {
      return true
    }

    // Check user permissions in database
    const { data, error } = await supabase
      .from('users').select('badges').eq('id', user.id).single() as any

    if (error || !data) {
      return false
    }

    const badges = data.badges || {}
    return badges[permission] === true || badges.admin === true
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

/**
 * Check if user is moderator
 */
export async function isModerator(user: AuthUser): Promise<boolean> {
  return hasPermission(user, 'moderator')
}

/**
 * Check if user is admin
 */
export async function isAdmin(user: AuthUser): Promise<boolean> {
  return hasPermission(user, 'admin')
}
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Database } from '@/lib/supabase'

interface User {
  id: string
  email: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

type Profile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signInWithKakao: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = React.useMemo(() => {
    try {
      return createSupabaseBrowserClient()
    } catch (error) {
      console.error('Supabase client initialization failed:', error)
      throw error
    }
  }, [])

  // Helper function to create or fetch user profile
  const handleUserSession = async (user: any) => {
    setUser(user as User)

    try {
      // Try to fetch existing profile
      const { data: profileData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        // Profile exists, set it directly
        setProfile(profileData)

        // TODO: Update last_active when Supabase types are properly configured
        // const { error: updateError } = await supabase
        //   .from('users')
        //   .update({ last_active: new Date().toISOString() })
        //   .eq('id', user.id)
      } else {
        // Profile doesn't exist, create new one
        const newProfile: Database['public']['Tables']['users']['Insert'] = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.display_name || user.user_metadata?.nickname || user.user_metadata?.name || user.user_metadata?.full_name || '커넥터',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          provider: user.app_metadata?.provider || 'unknown',
          provider_id: user.user_metadata?.sub || user.id,
          preferred_language: 'ko',
          is_verified: false,
          trust_score: 10,
          badges: {},
          question_count: 0,
          answer_count: 0,
          helpful_answer_count: 0,
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert(newProfile as any)
          .select()
          .single()

        if (createdProfile && !createError) {
          setProfile(createdProfile)
        } else {
          console.error('Error creating user profile:', createError)
        }
      }
    } catch (error) {
      console.error('Error handling user session:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await handleUserSession(session.user)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await handleUserSession(session.user)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ avatar_url?: string | null; name?: string }>).detail
      if (!detail) return
      setProfile((prev) => {
        if (!prev) return prev
        const nextDisplayName = detail.name
        return {
          ...prev,
          ...(detail.avatar_url !== undefined ? { avatar_url: detail.avatar_url ?? null } : {}),
          ...(nextDisplayName ? { name: nextDisplayName } : {})
        }
      })
    }

    window.addEventListener('vk-profile-updated', handleProfileUpdated)
    return () => {
      window.removeEventListener('vk-profile-updated', handleProfileUpdated)
    }
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  const signInWithKakao = async () => {
    // Note: Kakao OAuth would need to be configured in Supabase
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    signInWithKakao,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

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

  // Check if we're in mock mode
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
                     !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')

  const supabase = React.useMemo(() => {
    if (isMockMode) {
      console.log('AuthProvider running in mock mode - Supabase disabled')
      return null
    }

    // Check if required environment variables exist
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Missing Supabase environment variables, using mock mode')
      return null
    }

    try {
      const client = createSupabaseBrowserClient()
      if (!client) {
        console.warn('Supabase client creation returned null, using mock mode')
        return null
      }
      return client
    } catch (error) {
      console.warn('Supabase client initialization failed:', error)
      return null
    }
  }, [isMockMode])

  // Helper function to create or fetch user profile
  const handleUserSession = async (user: any) => {
    setUser(user as User)

    if (!supabase) {
      console.log('AuthProvider: Mock mode - skipping profile operations')
      // In mock mode, create a basic profile from user data
      const mockProfile = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || 'Mock User',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        bio: null,
        provider: user.app_metadata?.provider || 'mock',
        provider_id: user.user_metadata?.sub || user.id,
        visa_type: null,
        company: null,
        years_in_korea: null,
        region: null,
        preferred_language: 'ko',
        is_verified: false,
        verification_date: null,
        trust_score: 10,
        badges: {},
        question_count: 0,
        answer_count: 0,
        helpful_answer_count: 0,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setProfile(mockProfile as Profile)
      return
    }

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
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Unknown User',
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
    if (!supabase) {
      console.log('AuthProvider: Mock mode - no auth operations')
      setLoading(false)
      return
    }

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

  const signInWithGoogle = async () => {
    if (!supabase) {
      console.log('AuthProvider: Mock mode - Google sign in not available')
      throw new Error('Authentication not available in mock mode')
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  const signInWithFacebook = async () => {
    if (!supabase) {
      console.log('AuthProvider: Mock mode - Facebook sign in not available')
      throw new Error('Authentication not available in mock mode')
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  const signInWithKakao = async () => {
    if (!supabase) {
      console.log('AuthProvider: Mock mode - Kakao sign in not available')
      throw new Error('Authentication not available in mock mode')
    }
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
    if (!supabase) {
      console.log('AuthProvider: Mock mode - sign out not available')
      setUser(null)
      setProfile(null)
      return
    }
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
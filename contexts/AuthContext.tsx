'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

interface Profile {
  id: string
  email: string
  name: string
  avatar_url: string | null
  bio: string | null
  provider: string | null
  provider_id: string | null
  visa_type: string | null
  company: string | null
  years_in_korea: number | null
  region: string | null
  preferred_language: string
  is_verified: boolean
  verification_date: string | null
  trust_score: number
  badges: Record<string, boolean>
  question_count: number
  answer_count: number
  helpful_answer_count: number
  last_active: string
  created_at: string
  updated_at: string
}

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
  const supabase = createClient()

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
        // Profile exists, update last_active
        const { error: updateError } = await supabase
          .from('users')
          .update({
            last_active: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (!updateError) {
          setProfile(profileData)
        }
      } else {
        // Profile doesn't exist, create new one
        const newProfile = {
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
          .insert([newProfile])
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
'use client'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

export interface AuthUser extends User {
  user_metadata: {
    name?: string
    avatar_url?: string
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user as AuthUser ?? null)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user as AuthUser ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN') {
          // 사용자 프로필 생성/업데이트
          await upsertUserProfile(session?.user)
        }

        router.refresh()
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const upsertUserProfile = async (user: User | undefined) => {
    if (!user) return

    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error updating user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { data, error }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    })

    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/')
    }
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    return { data, error }
  }

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })

    return { data, error }
  }

  const updateProfile = async (updates: {
    name?: string
    avatar_url?: string
  }) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (!error && user) {
      // users 테이블도 업데이트
      await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
    }

    return { data, error }
  }

  const isAdmin = () => {
    if (!user) return false
    // users 테이블에서 role 정보를 가져와야 하지만,
    // 현재는 간단히 user_metadata를 확인
    return user.user_metadata?.role === 'admin'
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }

  const signInWithFacebook = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAdmin,
    signInWithGoogle,
    signInWithFacebook,
  }
}
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './supabase'

// Browser-side client for Client Components and user interactions
export const createSupabaseBrowserClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton instance for client-side usage
let supabaseClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

export const getSupabaseBrowserClient = () => {
  if (!supabaseClient) {
    supabaseClient = createSupabaseBrowserClient()
  }
  return supabaseClient
}

// Authentication utilities for client-side
export const authUtils = {
  async signInWithGoogle() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  },

  async signInWithKakao() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  },

  async signOut() {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const supabase = getSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = getSupabaseBrowserClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
    return subscription
  }
}
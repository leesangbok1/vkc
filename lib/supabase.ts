import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Database types will be updated when schema is ready
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          provider: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          provider?: string | null
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          tags: string[]
          user_id: string
          created_at: string
          updated_at: string
          views: number
          upvotes: number
          status: 'open' | 'closed' | 'resolved'
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: string
          tags?: string[]
          user_id: string
          created_at?: string
          updated_at?: string
          views?: number
          upvotes?: number
          status?: 'open' | 'closed' | 'resolved'
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          tags?: string[]
          updated_at?: string
          views?: number
          upvotes?: number
          status?: 'open' | 'closed' | 'resolved'
        }
      }
      answers: {
        Row: {
          id: string
          content: string
          question_id: string
          user_id: string
          created_at: string
          updated_at: string
          upvotes: number
          is_accepted: boolean
        }
        Insert: {
          id?: string
          content: string
          question_id: string
          user_id: string
          created_at?: string
          updated_at?: string
          upvotes?: number
          is_accepted?: boolean
        }
        Update: {
          id?: string
          content?: string
          updated_at?: string
          upvotes?: number
          is_accepted?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Main client for browser-side operations
export const createSupabaseClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server client for server-side operations
export const createSupabaseServerClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Read-only server client (doesn't need cookies)
export const createSupabaseServerReadClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() {
          return null
        },
        set() {
          // No-op for read-only client
        },
        remove() {
          // No-op for read-only client
        },
      },
    }
  )
}
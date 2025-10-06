import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Complete Database types matching 4-tier permission system
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          bio: string | null
          provider: string | null
          provider_id: string | null

          // 4-Tier Permission System
          role: 'guest' | 'user' | 'verified' | 'admin'
          verification_status: 'none' | 'pending' | 'approved' | 'rejected' | 'expired'
          verification_type: 'student' | 'work' | 'family' | 'resident' | 'other' | null

          // Profile Info (verification에 사용)
          visa_type: string | null
          company: string | null
          years_in_korea: number | null
          region: string | null
          specialty_areas: string[] | null
          preferred_language: string

          // Verification Timestamps
          verified_at: string | null
          verification_expires_at: string | null

          // Legacy Compatibility
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
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          bio?: string | null
          provider?: string | null
          provider_id?: string | null

          // 4-Tier Permission System
          role?: 'guest' | 'user' | 'verified' | 'admin'
          verification_status?: 'none' | 'pending' | 'approved' | 'rejected' | 'expired'
          verification_type?: 'student' | 'work' | 'family' | 'resident' | 'other' | null

          // Profile Info
          visa_type?: string | null
          company?: string | null
          years_in_korea?: number | null
          region?: string | null
          specialty_areas?: string[] | null
          preferred_language?: string

          // Verification Timestamps
          verified_at?: string | null
          verification_expires_at?: string | null

          // Legacy Compatibility
          is_verified?: boolean
          verification_date?: string | null
          trust_score?: number
          badges?: Record<string, boolean>
          question_count?: number
          answer_count?: number
          helpful_answer_count?: number
          last_active?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          bio?: string | null
          provider?: string | null
          provider_id?: string | null
          visa_type?: string | null
          company?: string | null
          years_in_korea?: number | null
          region?: string | null
          preferred_language?: string
          is_verified?: boolean
          verification_date?: string | null
          trust_score?: number
          badges?: Record<string, boolean>
          question_count?: number
          answer_count?: number
          helpful_answer_count?: number
          last_active?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string
          parent_id: number | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string
          parent_id?: number | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string
          parent_id?: number | null
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          category_id: number
          tags: string[]
          ai_category_confidence: number | null
          ai_tags: string[]
          urgency: string
          matched_experts: string[]
          expert_notifications_sent: boolean
          view_count: number
          answer_count: number
          helpful_count: number
          upvote_count: number
          downvote_count: number
          status: 'open' | 'closed' | 'resolved' | 'archived'
          is_pinned: boolean
          is_featured: boolean
          is_reported: boolean
          is_approved: boolean
          moderated_by: string | null
          moderated_at: string | null
          created_at: string
          updated_at: string
          last_activity_at: string
          resolved_at: string | null
          search_vector: unknown | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          category_id: number
          tags?: string[]
          ai_category_confidence?: number | null
          ai_tags?: string[]
          urgency?: string
          matched_experts?: string[]
          expert_notifications_sent?: boolean
          view_count?: number
          answer_count?: number
          helpful_count?: number
          upvote_count?: number
          downvote_count?: number
          status?: 'open' | 'closed' | 'resolved' | 'archived'
          is_pinned?: boolean
          is_featured?: boolean
          is_reported?: boolean
          is_approved?: boolean
          moderated_by?: string | null
          moderated_at?: string | null
          created_at?: string
          updated_at?: string
          last_activity_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          category_id?: number
          tags?: string[]
          ai_category_confidence?: number | null
          ai_tags?: string[]
          urgency?: string
          matched_experts?: string[]
          expert_notifications_sent?: boolean
          view_count?: number
          answer_count?: number
          helpful_count?: number
          upvote_count?: number
          downvote_count?: number
          status?: 'open' | 'closed' | 'resolved' | 'archived'
          is_pinned?: boolean
          is_featured?: boolean
          is_reported?: boolean
          is_approved?: boolean
          moderated_by?: string | null
          moderated_at?: string | null
          updated_at?: string
          last_activity_at?: string
          resolved_at?: string | null
        }
      }
      answers: {
        Row: {
          id: string
          content: string
          question_id: string
          author_id: string
          parent_answer_id: string | null
          is_accepted: boolean
          accepted_at: string | null
          accepted_by: string | null
          upvote_count: number
          downvote_count: number
          helpful_count: number
          is_reported: boolean
          is_approved: boolean
          moderated_by: string | null
          moderated_at: string | null
          ai_helpfulness_score: number | null
          ai_sentiment: string | null
          created_at: string
          updated_at: string
          search_vector: unknown | null
        }
        Insert: {
          id?: string
          content: string
          question_id: string
          author_id: string
          parent_answer_id?: string | null
          is_accepted?: boolean
          accepted_at?: string | null
          accepted_by?: string | null
          upvote_count?: number
          downvote_count?: number
          helpful_count?: number
          is_reported?: boolean
          is_approved?: boolean
          moderated_by?: string | null
          moderated_at?: string | null
          ai_helpfulness_score?: number | null
          ai_sentiment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          question_id?: string
          author_id?: string
          parent_answer_id?: string | null
          is_accepted?: boolean
          accepted_at?: string | null
          accepted_by?: string | null
          upvote_count?: number
          downvote_count?: number
          helpful_count?: number
          is_reported?: boolean
          is_approved?: boolean
          moderated_by?: string | null
          moderated_at?: string | null
          ai_helpfulness_score?: number | null
          ai_sentiment?: string | null
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          target_id: string
          target_type: string
          vote_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_id: string
          target_type: string
          vote_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_id?: string
          target_type?: string
          vote_type?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          target_id: string
          target_type: string
          author_id: string
          parent_comment_id: string | null
          upvote_count: number
          downvote_count: number
          is_reported: boolean
          is_approved: boolean
          moderated_by: string | null
          moderated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          target_id: string
          target_type: string
          author_id: string
          parent_comment_id?: string | null
          upvote_count?: number
          downvote_count?: number
          is_reported?: boolean
          is_approved?: boolean
          moderated_by?: string | null
          moderated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          target_id?: string
          target_type?: string
          author_id?: string
          parent_comment_id?: string | null
          upvote_count?: number
          downvote_count?: number
          is_reported?: boolean
          is_approved?: boolean
          moderated_by?: string | null
          moderated_at?: string | null
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          related_id: string | null
          related_type: string | null
          is_read: boolean
          is_email_sent: boolean
          is_push_sent: boolean
          is_kakao_sent: boolean
          channels: Record<string, any>
          created_at: string
          read_at: string | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          related_id?: string | null
          related_type?: string | null
          is_read?: boolean
          is_email_sent?: boolean
          is_push_sent?: boolean
          is_kakao_sent?: boolean
          channels?: Record<string, any>
          created_at?: string
          read_at?: string | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          related_id?: string | null
          related_type?: string | null
          is_read?: boolean
          is_email_sent?: boolean
          is_push_sent?: boolean
          is_kakao_sent?: boolean
          channels?: Record<string, any>
          read_at?: string | null
          sent_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_moderator: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_question_author: {
        Args: { question_id: string; user_id: string }
        Returns: boolean
      }
      can_edit_content: {
        Args: { content_type: string; content_id: string; user_id: string }
        Returns: boolean
      }
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
export const createSupabaseServerClient = async () => {
  // Validate required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing required Supabase environment variables')
  }

  try {
    const cookieStore = await cookies()

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
  } catch (error) {
    console.error('Supabase server client creation failed:', error)
    throw error
  }
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
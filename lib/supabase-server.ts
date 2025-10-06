import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './supabase'

// 서버 사이드 Supabase 클라이언트 (API Routes, Server Components용)
export const createSupabaseServerClient = async () => {
  // 환경변수 검증
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
          set(name: string, value: string, options: any) {
            // API Routes에서는 쿠키 설정 가능
            try {
              cookieStore.set({ name, value, ...options })
            } catch {
              // Server Components에서는 쿠키 설정 불가 (예상된 동작)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch {
              // Server Components에서는 쿠키 설정 불가 (예상된 동작)
            }
          },
        },
      }
    )
  } catch (error) {
    console.error('Supabase server client creation failed:', error)
    throw error
  }
}

// 읽기 전용 서버 클라이언트 (쿠키 설정 시도 안함)
export const createSupabaseServerReadClient = async () => {
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
          set() {
            // 읽기 전용 클라이언트는 쿠키 설정 안함
          },
          remove() {
            // 읽기 전용 클라이언트는 쿠키 삭제 안함
          },
        },
      }
    )
  } catch (error) {
    console.error('Supabase server read client creation failed:', error)
    throw error
  }
}

// 서비스 롤 클라이언트 (관리자 권한 작업용)
export const createSupabaseServiceClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required Supabase environment variables for service client')
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return null },
        set() {},
        remove() {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
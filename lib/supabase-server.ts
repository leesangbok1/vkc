import type { Database } from './supabase'

// Conditional import system to avoid cookie issues in mock mode
const isMockMode =
  process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
  process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co') ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only import Supabase and cookies if not in mock mode
let createServerClient: typeof import('@supabase/ssr').createServerClient
let cookies: typeof import('next/headers').cookies
let Database: any

if (!isMockMode) {
  try {
    const supabaseSSR = require('@supabase/ssr')
    const nextHeaders = require('next/headers')
    const supabaseTypes = require('./supabase')

    createServerClient = supabaseSSR.createServerClient
    cookies = nextHeaders.cookies
    Database = supabaseTypes.Database
  } catch (error) {
    console.warn('Failed to import Supabase dependencies, using mock mode:', error)
  }
}

// Server-side client for Next.js Server Components and API Routes
export const createSupabaseServerClient = async () => {
  if (isMockMode || !createServerClient || !cookies) {
    console.log('Supabase server client running in mock mode (no cookie access)')
    return null
  }

  try {
    // Only access cookies if not in mock mode and we have valid Supabase config
    const cookieStore = await cookies()

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Server components can't set cookies, this is handled by middleware
            try {
              cookieStore.set({ name, value, ...options })
            } catch {
              // This is expected in server components
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch {
              // This is expected in server components
            }
          },
        },
      }
    )
  } catch (error) {
    console.warn('Supabase server client creation failed, falling back to mock mode:', error)
    return null
  }
}

// Read-only server client (doesn't attempt to set cookies)
export const createSupabaseServerReadClient = async () => {
  if (isMockMode || !createServerClient || !cookies) {
    console.log('Supabase server read client running in mock mode (no cookie access)')
    return null
  }

  try {
    const cookieStore = await cookies()

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
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
  } catch (error) {
    console.warn('Supabase server read client creation failed, falling back to mock mode:', error)
    return null
  }
}

// Service role client for admin operations (use sparingly)
export const createSupabaseServiceClient = () => {
  if (isMockMode || !createServerClient) {
    console.log('Supabase service client running in mock mode (no cookie access)')
    return null
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for service client')
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return null },
        set() {},
        remove() {},
      },
    }
  )
}
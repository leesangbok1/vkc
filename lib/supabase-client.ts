import { createBrowserClient } from '@supabase/ssr'

// Mock client for development when Supabase is not set up
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: any) => {
      callback('SIGNED_OUT', null)
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    signInWithOAuth: () => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    })
  })
})

export const createClient = () => {
  // Use mock client in development if URLs are not properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('mock') || process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    return createMockClient() as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
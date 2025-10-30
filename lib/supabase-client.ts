import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

  if (isMockMode) {
    throw new Error('Supabase client cannot be created while NEXT_PUBLIC_MOCK_MODE is enabled. Disable mock mode to use Supabase.')
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase client cannot be created because NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.')
  }

  if (supabaseUrl.includes('mock')) {
    throw new Error('Supabase client cannot be created because NEXT_PUBLIC_SUPABASE_URL points to a mock endpoint.')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

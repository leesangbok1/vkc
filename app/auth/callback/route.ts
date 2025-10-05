import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Check if we're in mock mode - return success immediately
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
    console.log('Auth callback running in mock mode')
    const response = NextResponse.redirect(`${origin}${next}`)
    response.cookies.set('auth-callback-success', 'true', {
      maxAge: 5, // 5 seconds
      httpOnly: false
    })
    return response
  }

  if (code) {
    try {
      // Dynamic import to avoid cookie issues in mock mode
      const { createServerClient } = await import('@supabase/ssr')
      const { cookies } = await import('next/headers')

      const cookieStore = await cookies()

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              try {
                cookieStore.set({ name, value, ...options })
              } catch {
                // Expected in server components
              }
            },
            remove(name: string, options: any) {
              try {
                cookieStore.set({ name, value: '', ...options })
              } catch {
                // Expected in server components
              }
            },
          },
        }
      )

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        const response = NextResponse.redirect(`${origin}${next}`)

        // Set a success flag for the client to handle
        response.cookies.set('auth-callback-success', 'true', {
          maxAge: 5, // 5 seconds
          httpOnly: false
        })

        return response
      }

      console.error('OAuth callback error:', error)
    } catch (error) {
      console.error('Auth callback failed:', error)
    }
  }

  // Return the user to an error page or login with error
  const errorUrl = new URL('/login', origin)
  errorUrl.searchParams.set('error', 'auth_callback_error')
  return NextResponse.redirect(errorUrl)
}
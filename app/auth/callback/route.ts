import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Set cookie in response
            const response = NextResponse.redirect(`${origin}${next}`)
            response.cookies.set({
              name,
              value,
              ...options,
            })
            return response
          },
          remove(name: string, options: any) {
            const response = NextResponse.redirect(`${origin}${next}`)
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
            return response
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
  }

  // Return the user to an error page or login with error
  const errorUrl = new URL('/login', origin)
  errorUrl.searchParams.set('error', 'auth_callback_error')
  return NextResponse.redirect(errorUrl)
}
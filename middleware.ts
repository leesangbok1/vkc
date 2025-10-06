import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from './lib/supabase'
import { addSecurityHeaders, validateCSRFToken } from '@/lib/middleware/security-headers'
import { systemMetrics } from '@/lib/monitoring/system-metrics'

export async function middleware(request: NextRequest) {
  const start = Date.now()

  // CSRF validation for API routes
  if (request.nextUrl.pathname.startsWith('/api/') && !validateCSRFToken(request)) {
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      )
    )
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client configured to use cookies for SSR
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Apply the cookie to the request
          request.cookies.set({
            name,
            value,
            ...options,
          })

          // Update the response to include the cookie
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // Apply the deletion to the request
          request.cookies.set({
            name,
            value: '',
            ...options,
          })

          // Update the response to include the cookie deletion
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = [
    '/questions/new',
    '/profile',
    '/dashboard',
    '/admin'
  ]

  // Auth routes that authenticated users shouldn't access
  const authRoutes = ['/login', '/register', '/auth/signin']

  const { pathname } = request.nextUrl

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Record API metrics
  const responseTime = Date.now() - start

  systemMetrics.recordApiCall({
    endpoint: request.nextUrl.pathname,
    method: request.method,
    status_code: response.status || 200,
    response_time: responseTime,
    timestamp: new Date().toISOString()
  })

  // Record user activity for page views
  if (request.method === 'GET' && !request.nextUrl.pathname.startsWith('/api')) {
    const sessionId = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'anonymous'
    systemMetrics.recordUserActivity(sessionId, request.nextUrl.pathname)
  }

  // Add monitoring headers
  response.headers.set('X-Response-Time', `${responseTime}ms`)
  response.headers.set('X-Request-ID', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // Add security headers to all responses
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
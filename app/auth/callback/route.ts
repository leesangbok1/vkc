import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase-server'
import { upsertUserWithFallback } from '@/lib/utils/supabase-user'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectParam = searchParams.get('redirectTo')
  const redirectTo = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/'

  if (!code) {
    const errorUrl = new URL('/auth/login', origin)
    errorUrl.searchParams.set('error', 'auth_callback_error')
    return NextResponse.redirect(errorUrl)
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('OAuth exchange failed:', error)
    const errorUrl = new URL('/auth/login', origin)
    errorUrl.searchParams.set('error', 'auth_callback_error')
    return NextResponse.redirect(errorUrl)
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('Unable to load user after exchange:', userError)
    const errorUrl = new URL('/auth/login', origin)
    errorUrl.searchParams.set('error', 'auth_callback_error')
    return NextResponse.redirect(errorUrl)
  }
  const desiredRole = 'user'

  try {
    let service
    try {
      service = createSupabaseServiceClient()
    } catch (serviceError) {
      console.warn('Auth callback: service client unavailable, falling back to user client', serviceError)
      service = supabase
    }

    const { data: existingUser, error: fetchError } = await service
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.error('Failed to fetch existing user:', fetchError)
    }

    if (!existingUser) {
      const upsertResult = await upsertUserWithFallback(service, {
        id: user.id,
        email: user.email!,
        name: (user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'New User') as string,
        avatar_url: (user.user_metadata?.avatar_url || user.user_metadata?.picture) as string | null,
        role: desiredRole,
        verification_status: 'none',
        onboarding_completed: false,
        is_active: true,
        trust_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

      if (upsertResult.error) {
        console.error('Failed to upsert new user profile:', upsertResult.error)
      } else if (upsertResult.removedColumns.length > 0) {
        console.warn('User upsert skipped columns:', upsertResult.removedColumns)
      }

      const onboardingUrl = new URL('/onboarding', origin)
      onboardingUrl.searchParams.set('redirectTo', redirectTo)
      const response = NextResponse.redirect(onboardingUrl)
      response.cookies.set('auth-callback-success', 'true', { maxAge: 5, httpOnly: false })
      return response
    }

    // 기존 프로필이 있으면 admin_yn은 유지 (수동 관리용)

    if ('onboarding_completed' in existingUser && !existingUser.onboarding_completed) {
      const onboardingUrl = new URL('/onboarding', origin)
      onboardingUrl.searchParams.set('redirectTo', redirectTo)
      const response = NextResponse.redirect(onboardingUrl)
      response.cookies.set('auth-callback-success', 'true', { maxAge: 5, httpOnly: false })
      return response
    }
  } catch (serviceError) {
    console.error('Service client error during callback:', serviceError)
  }

  const target = new URL(redirectTo, origin)
  const response = NextResponse.redirect(target)
  response.cookies.set('auth-callback-success', 'true', { maxAge: 5, httpOnly: false })
  return response
}

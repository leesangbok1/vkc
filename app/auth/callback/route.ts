import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/'

  console.log('🔐 OAuth Callback Handler Started')
  console.log('📍 Redirect destination:', redirectTo)
  console.log('🔑 Authorization code received:', code ? 'Yes' : 'No')


  if (code) {
    try {
      const supabase = await (await import('@/lib/supabase-server')).createSupabaseServerClient()

      console.log('🔄 Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.user) {
        console.log('✅ Session created successfully')
        console.log('👤 Authenticated user:', data.user.email)
        // 사용자 프로필 생성 또는 업데이트
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!existingUser) {
          console.log('🆕 New user - inserting into database...')
          // 신규 사용자 생성
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata.full_name || data.user.user_metadata.name || 'New User',
              avatar_url: data.user.user_metadata.avatar_url || data.user.user_metadata.picture,
              role: 'user',
              verification_status: 'unverified',
              onboarding_completed: false,
              visa_type: null,
              years_in_korea: null,
              region: null,
              is_active: true,
              trust_score: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (insertError) {
            console.error('❌ Failed to insert new user:', insertError)
          } else {
            console.log('✅ New user profile created')
          }

          // 신규 사용자는 온보딩 페이지로
          console.log('🎯 Redirecting to onboarding...')
          const response = NextResponse.redirect(`${origin}/onboarding?redirectTo=${encodeURIComponent(redirectTo)}`)
          response.cookies.set('auth-callback-success', 'true', {
            maxAge: 5,
            httpOnly: false
          })
          return response
        } else {
          console.log('👋 Existing user - welcome back:', existingUser.name)
          // 기존 사용자 체크: 온보딩 완료했는지 확인
          if (existingUser.onboarding_completed === false || existingUser.onboarding_completed === null) {
            console.log('⚠️ Onboarding not completed - redirecting to onboarding')
            // 온보딩 미완료 사용자는 온보딩 페이지로
            const response = NextResponse.redirect(`${origin}/onboarding?redirectTo=${encodeURIComponent(redirectTo)}`)
            response.cookies.set('auth-callback-success', 'true', {
              maxAge: 5,
              httpOnly: false
            })
            return response
          } else {
            console.log('🎯 Redirecting to:', redirectTo)
            // 온보딩 완료한 사용자는 원래 목적지로
            const response = NextResponse.redirect(`${origin}${redirectTo}`)
            response.cookies.set('auth-callback-success', 'true', {
              maxAge: 5,
              httpOnly: false
            })
            return response
          }
        }
      }

      console.error('❌ OAuth callback error:', error)
    } catch (error) {
      console.error('❌ Unexpected error in callback handler:', error)
    }
  }

  // Return the user to an error page or login with error
  console.log('⚠️ No authorization code or error occurred - redirecting to login')
  const errorUrl = new URL('/auth/login', origin)
  errorUrl.searchParams.set('error', 'auth_callback_error')
  return NextResponse.redirect(errorUrl)
}
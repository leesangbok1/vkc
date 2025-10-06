import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'


  if (code) {
    try {
      const supabase = await (await import('@/lib/supabase-server')).createSupabaseServerClient()

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.user) {
        // 사용자 프로필 생성 또는 업데이트
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!existingUser) {
          await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata.full_name || data.user.user_metadata.name || 'New User',
              avatar_url: data.user.user_metadata.avatar_url || data.user.user_metadata.picture,
              role: 'user',
              verification_status: 'unverified',
              visa_type: null,
              years_in_korea: null,
              region: null,
              is_active: true,
              trust_score: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
        }

        const response = NextResponse.redirect(`${origin}${next}`)
        response.cookies.set('auth-callback-success', 'true', {
          maxAge: 5,
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
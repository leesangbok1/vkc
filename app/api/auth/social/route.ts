import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// POST /api/auth/social - 소셜 로그인 (Google, Kakao)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, returnTo = '/' } = body

    // 지원되는 provider 확인
    const supportedProviders = ['google', 'kakao']
    if (!provider || !supportedProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Unsupported provider. Use: google, kakao' },
        { status: 400 }
      )
    }


    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 503 }
      )
    }

    // 리다이렉트 URL 설정
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`

    // Supabase 소셜 로그인 URL 생성
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'kakao',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          next: returnTo
        },
        scopes: provider === 'google'
          ? 'openid email profile'
          : 'profile_nickname profile_image account_email'
      }
    })

    if (error) {
      console.error('Social login error:', error)
      return NextResponse.json(
        { error: 'Failed to initiate social login' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        auth_url: data.url,
        provider,
        message: `${provider} 로그인 URL이 생성되었습니다`
      }
    })

  } catch (error) {
    console.error('Social login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/auth/social - 지원되는 소셜 로그인 provider 목록
export async function GET() {
  try {
    const providers = [
      {
        id: 'google',
        name: 'Google',
        icon: '🔗',
        description: 'Google 계정으로 로그인',
        color: '#4285F4',
        popular: true
      },
      {
        id: 'kakao',
        name: 'Kakao',
        icon: '💬',
        description: '카카오 계정으로 로그인',
        color: '#FEE500',
        popular: true
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        providers,
        total: providers.length,
        configuration: {
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          supported_features: [
            'profile_creation',
            'trust_score_initialization',
            'vietnamese_user_onboarding',
            'automatic_profile_setup'
          ]
        }
      }
    })

  } catch (error) {
    console.error('Social providers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
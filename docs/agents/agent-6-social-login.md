# Agent 6: 소셜 로그인 통합 담당

## 🎯 브랜치
`feature/social-login`

## 📋 작업 내용
1. Google OAuth 설정 및 구현
2. 카카오 OAuth 설정 및 구현
3. 소셜 로그인 컴포넌트 구현
4. 프로필 정보 동기화
5. 계정 연결 처리

## 🚀 실행 명령어

### 1. 브랜치 생성
```bash
git checkout -b feature/social-login
```

### 2. OAuth 설정
- Supabase 대시보드에서 Google Provider 설정
- 카카오 개발자 콘솔에서 앱 등록 및 설정

## 📁 생성할 파일

### components/auth/SocialLogin.tsx
```typescript
'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { FcGoogle } from 'react-icons/fc'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { useState } from 'react'
import { Database } from '@/lib/database.types'

interface SocialLoginProps {
  redirectTo?: string
}

export function SocialLogin({ redirectTo = '/dashboard' }: SocialLoginProps) {
  const [loading, setLoading] = useState<'google' | 'kakao' | null>(null)
  const supabase = createClientComponentClient<Database>()

  const handleGoogleLogin = async () => {
    setLoading('google')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Google login error:', error)
      setLoading(null)
    }
  }

  const handleKakaoLogin = async () => {
    setLoading('kakao')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    })

    if (error) {
      console.error('Kakao login error:', error)
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            또는 소셜 계정으로
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={loading === 'google'}
      >
        {loading === 'google' ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        ) : (
          <FcGoogle className="mr-2 h-4 w-4" />
        )}
        Google로 계속하기
      </Button>

      <Button
        variant="outline"
        type="button"
        className="w-full bg-yellow-300 hover:bg-yellow-400 text-black border-yellow-300"
        onClick={handleKakaoLogin}
        disabled={loading === 'kakao'}
      >
        {loading === 'kakao' ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        ) : (
          <RiKakaoTalkFill className="mr-2 h-4 w-4 text-black" />
        )}
        카카오로 계속하기
      </Button>
    </div>
  )
}
```

### app/auth/callback/route.ts
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && session) {
      // 소셜 로그인 시 사용자 프로필 정보 업데이트
      await upsertUserProfile(supabase, session.user)

      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  // 에러 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/login?error=oauth_error', request.url))
}

async function upsertUserProfile(supabase: any, user: any) {
  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id'
    })

  if (error) {
    console.error('Error upserting user profile:', error)
  }
}
```

### lib/auth/oauth-config.ts
```typescript
export const oauthConfig = {
  google: {
    scope: 'openid email profile',
    redirectUri: process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  kakao: {
    redirectUri: process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback',
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
  }
}

// OAuth provider 별 프로필 정보 매핑
export function mapOAuthProfile(provider: string, profile: any) {
  switch (provider) {
    case 'google':
      return {
        name: profile.name || profile.given_name + ' ' + profile.family_name,
        avatar_url: profile.picture,
        email: profile.email,
      }

    case 'kakao':
      return {
        name: profile.kakao_account?.profile?.nickname || profile.properties?.nickname,
        avatar_url: profile.kakao_account?.profile?.profile_image_url || profile.properties?.profile_image,
        email: profile.kakao_account?.email,
      }

    default:
      return {
        name: profile.name || profile.email?.split('@')[0],
        avatar_url: profile.avatar_url || profile.picture,
        email: profile.email,
      }
  }
}
```

### components/auth/AccountLinking.tsx
```typescript
'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/lib/database.types'

export function AccountLinking() {
  const [loading, setLoading] = useState<string | null>(null)
  const [linkedAccounts, setLinkedAccounts] = useState<string[]>([])
  const { user } = useAuth()
  const supabase = createClientComponentClient<Database>()

  const handleLinkAccount = async (provider: 'google' | 'kakao') => {
    if (!user) return

    setLoading(provider)

    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=/profile`,
      },
    })

    if (error) {
      console.error(`Error linking ${provider} account:`, error)
    }

    setLoading(null)
  }

  const handleUnlinkAccount = async (provider: string) => {
    if (!user) return

    setLoading(provider)

    const { error } = await supabase.auth.unlinkIdentity({
      provider: provider as any,
    })

    if (error) {
      console.error(`Error unlinking ${provider} account:`, error)
    } else {
      setLinkedAccounts(prev => prev.filter(p => p !== provider))
    }

    setLoading(null)
  }

  const isLinked = (provider: string) => linkedAccounts.includes(provider)

  return (
    <Card>
      <CardHeader>
        <CardTitle>연결된 계정</CardTitle>
        <CardDescription>
          소셜 계정을 연결하여 간편하게 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google 계정 */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <FcGoogle className="h-6 w-6" />
            <div>
              <p className="font-medium">Google</p>
              <p className="text-sm text-gray-500">
                {isLinked('google') ? '연결됨' : '연결되지 않음'}
              </p>
            </div>
          </div>

          {isLinked('google') ? (
            <Button
              variant="outline"
              onClick={() => handleUnlinkAccount('google')}
              disabled={loading === 'google'}
            >
              {loading === 'google' ? '처리 중...' : '연결 해제'}
            </Button>
          ) : (
            <Button
              onClick={() => handleLinkAccount('google')}
              disabled={loading === 'google'}
            >
              {loading === 'google' ? '연결 중...' : '연결'}
            </Button>
          )}
        </div>

        {/* 카카오 계정 */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <RiKakaoTalkFill className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="font-medium">카카오</p>
              <p className="text-sm text-gray-500">
                {isLinked('kakao') ? '연결됨' : '연결되지 않음'}
              </p>
            </div>
          </div>

          {isLinked('kakao') ? (
            <Button
              variant="outline"
              onClick={() => handleUnlinkAccount('kakao')}
              disabled={loading === 'kakao'}
            >
              {loading === 'kakao' ? '처리 중...' : '연결 해제'}
            </Button>
          ) : (
            <Button
              onClick={() => handleLinkAccount('kakao')}
              disabled={loading === 'kakao'}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              {loading === 'kakao' ? '연결 중...' : '연결'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### app/(auth)/login/page.tsx (수정된 버전)
```typescript
'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { SocialLogin } from '@/components/auth/SocialLogin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()

  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const oauthError = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirectTo)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            Viet K-Connect에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || oauthError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error || '소셜 로그인에 실패했습니다. 다시 시도해주세요.'}
            </div>
          )}

          {/* 소셜 로그인 */}
          <SocialLogin redirectTo={redirectTo} />

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>

            <div className="text-center space-y-2">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                비밀번호를 잊으셨나요?
              </Link>
              <div className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-500">
                  회원가입
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 환경 변수 설정 (.env.local.example 추가)
```env
# OAuth 설정
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# 사이트 URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## ⚙️ OAuth 설정 가이드

### Google OAuth 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services > Credentials 메뉴
4. OAuth 2.0 Client IDs 생성
5. 승인된 리디렉션 URI 추가:
   - `http://localhost:3000/auth/callback` (개발)
   - `https://your-domain.com/auth/callback` (프로덕션)

### 카카오 OAuth 설정
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 플랫폼 설정 > Web 플랫폼 등록
4. 카카오 로그인 > 활성화 설정
5. Redirect URI 등록:
   - `http://localhost:3000/auth/callback` (개발)
   - `https://your-domain.com/auth/callback` (프로덕션)

### Supabase 설정
1. Supabase 대시보드 > Authentication > Providers
2. Google 활성화 및 Client ID/Secret 입력
3. 카카오는 Custom OAuth Provider로 설정

## 🧪 테스트 절차

### 1. 소셜 로그인 테스트
```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 테스트
# 1. http://localhost:3000/login
# 2. Google/카카오 로그인 버튼 클릭
# 3. OAuth 플로우 완료 확인
# 4. 프로필 정보 동기화 확인
```

### 2. 계정 연결 테스트
```bash
# 1. 이메일로 가입한 계정으로 로그인
# 2. 프로필 페이지에서 소셜 계정 연결
# 3. 로그아웃 후 소셜 로그인으로 접속
# 4. 동일한 계정으로 인식되는지 확인
```

## ✅ 완료 기준
1. ✅ Google OAuth 설정 완료
2. ✅ 카카오 OAuth 설정 완료
3. ✅ 소셜 로그인 컴포넌트 구현
4. ✅ OAuth 콜백 처리 구현
5. ✅ 프로필 정보 동기화 구현
6. ✅ 계정 연결 기능 구현
7. ✅ 소셜 로그인 플로우 테스트 통과

## 📅 예상 소요 시간
**총 2.5시간**
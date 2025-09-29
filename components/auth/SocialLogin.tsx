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
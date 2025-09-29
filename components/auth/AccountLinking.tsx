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
'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import { useLoginModal } from '@/contexts/LoginModalContext'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { openLoginModal, isOpen } = useLoginModal()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const message = searchParams.get('message') || undefined
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return
    openLoginModal({
      redirectTo,
      message,
      onClose: () => {
        router.push(redirectTo)
      }
    })
    setInitialized(true)
  }, [initialized, openLoginModal, redirectTo, router, message])

  return (
    <PageLayout variant="centered">
      <div className="login-page-layout" suppressHydrationWarning>
        <div className="login-container">
          {isOpen ? '로그인 창이 열려 있습니다.' : '로그인 창을 준비하고 있습니다.'}
        </div>
      </div>
    </PageLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLayout variant="centered"><div className="login-page-layout"><div className="login-container">로딩 중...</div></div></PageLayout>}>
      <LoginPageInner />
    </Suspense>
  )
}

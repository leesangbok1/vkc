'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function NotificationSettingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!searchParams) return

    const params = new URLSearchParams(searchParams.toString())
    const hasModal = params.get('modal') === 'settings'

    if (hasModal && !initializedRef.current) {
      initializedRef.current = true
    }

    if (!hasModal && !initializedRef.current) {
      params.set('modal', 'settings')
      params.set('section', 'notifications')
      initializedRef.current = true
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      return
    }

    if (!hasModal && initializedRef.current) {
      const returnTo = params.get('returnTo')
      if (returnTo) {
        router.replace(returnTo, { scroll: true })
      } else {
        router.replace('/', { scroll: true })
      }
    }
  }, [pathname, router, searchParams])

  return null
}

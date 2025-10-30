'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const modalInitializedRef = useRef(false)

  useEffect(() => {
    if (!searchParams) return

    const params = new URLSearchParams(searchParams.toString())
    const hasModal = params.get('modal') === 'settings'

    if (hasModal && !modalInitializedRef.current) {
      modalInitializedRef.current = true
    }

    if (!hasModal && !modalInitializedRef.current) {
      params.set('modal', 'settings')
      if (!params.has('section')) {
        params.set('section', 'account')
      }
      modalInitializedRef.current = true
      const query = params.toString()
      router.replace(`${pathname}?${query}`, { scroll: false })
      return
    }

    if (!hasModal && modalInitializedRef.current) {
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

'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type ModalRouteKey = 'question' | 'post' | 'bookmarks' | 'settings' | 'certification'

const MODAL_PARAM = 'modal'

export function useModalNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()

  const updateModalParam = useCallback((value: ModalRouteKey | null, options?: { replace?: boolean }) => {
    const params = new URLSearchParams(searchParamsString)
    if (value) {
      params.set(MODAL_PARAM, value)
    } else {
      params.delete(MODAL_PARAM)
    }

    const query = params.toString()
    const target = `${pathname}${query ? `?${query}` : ''}`
    if (options?.replace) {
      router.replace(target, { scroll: false })
    } else {
      router.push(target, { scroll: false })
    }
  }, [pathname, router, searchParamsString])

  const openModal = useCallback((key: ModalRouteKey, options?: { replace?: boolean }) => {
    updateModalParam(key, options)
  }, [updateModalParam])

  const closeModal = useCallback((options?: { replace?: boolean }) => {
    updateModalParam(null, options)
  }, [updateModalParam])

  const activeModal = (searchParams.get(MODAL_PARAM) ?? null) as ModalRouteKey | null

  return {
    activeModal,
    openModal,
    closeModal,
  }
}

import { useCallback, useEffect, useState } from 'react'

export type NewsBanner = {
  id: string
  title: string
  description: string
  linkUrl: string
  backgroundColor?: string
}

type Options = {
  limit?: number
  enabled?: boolean
}

const DEFAULT_LIMIT = 4
const BANNER_GRADIENTS = [
  'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
]

export const useNewsBanners = ({ limit = DEFAULT_LIMIT, enabled = true }: Options = {}) => {
  const [banners, setBanners] = useState<NewsBanner[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setBanners([])
      return
    }

    let ignore = false
    const controller = new AbortController()

    const fetchBanners = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          post_type: 'news',
          sort: 'recent',
          limit: String(Math.max(1, Math.min(limit, 10))),
        })

        const response = await fetch(`/api/posts?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || `failed with status ${response.status}`)
        }

        const payload = await response.json()
        const items = Array.isArray(payload?.items) ? payload.items : []

        if (!ignore) {
          setBanners(
            items.slice(0, limit).map((item: any, index: number) => ({
              id: String(item?.id ?? ''),
              title: String(item?.title ?? '소식'),
              description: typeof item?.content === 'string'
                ? item.content.slice(0, 120)
                : '',
              linkUrl: `/posts/${item?.id ?? ''}`,
              backgroundColor: BANNER_GRADIENTS[index % BANNER_GRADIENTS.length],
            })).filter((banner: NewsBanner) => banner.id.length > 0)
          )
        }
      } catch (fetchError: any) {
        if (controller.signal.aborted) return
        console.error('[useNewsBanners] failed to load news banners:', fetchError)
        if (!ignore) {
          setBanners([])
          setError(fetchError?.message || '배너 데이터를 불러오지 못했습니다.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchBanners()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [enabled, limit, reloadKey])

  return {
    banners,
    loading,
    error,
    reload,
  }
}

export type UseNewsBannersResult = ReturnType<typeof useNewsBanners>

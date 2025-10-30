import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

interface PlatformStats {
  totalUsers: number
  totalQuestions: number
  totalAnswers: number
  pendingVerifications: number
  activeUsers24h: number
  responseRate?: number | null
  satisfactionScore?: number | null
  newUsersToday: number
}

interface UserStats {
  guest: number
  user: number
  verified: number
  admin: number
}

interface AdminOverviewContextValue {
  stats: PlatformStats | null
  userStats: UserStats | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const AdminOverviewContext = createContext<AdminOverviewContextValue | undefined>(undefined)

async function fetchOverviewData(): Promise<{ stats: PlatformStats; userStats: UserStats }> {
  const res = await fetch('/api/admin/overview', { cache: 'no-store' })
  if (res.status === 401 || res.status === 403) {
    throw new Error('관리자 인증이 필요합니다.')
  }
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.error || '운영 지표를 불러오지 못했습니다.')
  }

  const json = await res.json().catch(() => null)
  const statsPayload = json?.stats || {}
  const rolesPayload = json?.userRoles || json?.roles || {}

  return {
    stats: {
      totalUsers: Number(statsPayload.totalUsers ?? 0),
      totalQuestions: Number(statsPayload.totalQuestions ?? 0),
      totalAnswers: Number(statsPayload.totalAnswers ?? 0),
      pendingVerifications: Number(statsPayload.pendingCertifications ?? statsPayload.pendingVerifications ?? 0),
      activeUsers24h: Number(statsPayload.activeUsers24h ?? 0),
      responseRate: statsPayload.responseRate ?? null,
      satisfactionScore: statsPayload.satisfactionScore ?? null,
      newUsersToday: Number(statsPayload.newUsersToday ?? 0),
    },
    userStats: {
      guest: Number(rolesPayload.guest ?? 0),
      user: Number(rolesPayload.user ?? 0),
      verified: Number(rolesPayload.verified ?? 0),
      admin: Number(rolesPayload.admin ?? 0),
    },
  }
}

interface AdminOverviewProviderProps {
  children: React.ReactNode
}

export function AdminOverviewProvider({ children }: AdminOverviewProviderProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { stats: nextStats, userStats: nextUserStats } = await fetchOverviewData()
      setStats(nextStats)
      setUserStats(nextUserStats)
    } catch (overviewError: any) {
      setError(overviewError?.message || '운영 지표를 불러오지 못했습니다.')
      setStats(null)
      setUserStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      stats,
      userStats,
      loading,
      error,
      refresh,
    }),
    [stats, userStats, loading, error, refresh]
  )

  return <AdminOverviewContext.Provider value={value}>{children}</AdminOverviewContext.Provider>
}

export function useAdminOverview() {
  const ctx = useContext(AdminOverviewContext)
  if (!ctx) {
    throw new Error('useAdminOverview must be used within AdminOverviewProvider')
  }
  return ctx
}

export type { PlatformStats, UserStats }

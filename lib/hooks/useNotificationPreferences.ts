'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { notificationService } from '@/lib/services/notification-service'
import { useSafeAuth } from '@/components/providers/ClientProviders'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  browser_notifications: boolean
  question_answers: boolean
  answer_comments: boolean
  question_comments: boolean
  expert_matches: boolean
  vote_updates: boolean
  weekly_digest: boolean
  mentions: boolean
  priority_threshold: NotificationPriority
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email_notifications: true,
  push_notifications: false,
  browser_notifications: true,
  question_answers: true,
  answer_comments: true,
  question_comments: true,
  expert_matches: true,
  vote_updates: false,
  weekly_digest: true,
  mentions: true,
  priority_threshold: 'medium'
}

const LOCAL_STORAGE_KEY = 'notification_settings'

interface UseNotificationPreferencesOptions {
  enabled?: boolean
}

interface LocalNotificationMeta {
  setup_completed?: boolean
  setup_date?: string
  dismissed?: boolean
}

function readLocalMeta(): LocalNotificationMeta {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return {
      setup_completed: Boolean(parsed.setup_completed),
      setup_date: typeof parsed.setup_date === 'string' ? parsed.setup_date : undefined,
      dismissed: Boolean(parsed.dismissed)
    }
  } catch (error) {
    console.warn('[useNotificationPreferences] failed to parse local notification meta', error)
    return {}
  }
}

function persistLocalPreferences(preferences: NotificationPreferences, options?: { markCompleted?: boolean }) {
  if (typeof window === 'undefined') return
  const previous = readLocalMeta()
  const meta: LocalNotificationMeta = {
    setup_completed: options?.markCompleted ?? previous.setup_completed ?? false,
    setup_date: options?.markCompleted
      ? new Date().toISOString()
      : previous.setup_date,
    dismissed: options?.markCompleted ? false : previous.dismissed ?? false
  }

  try {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        ...preferences,
        ...meta
      })
    )
  } catch (error) {
    console.warn('[useNotificationPreferences] failed to persist preferences locally', error)
  }
}

export function useNotificationPreferences(options: UseNotificationPreferencesOptions = {}) {
  const { enabled = true } = options
  const { user } = useSafeAuth()
  const userId = user?.id ?? null

  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default')

  const mergePreferences = useCallback((incoming?: Partial<NotificationPreferences>) => {
    if (!incoming) return DEFAULT_NOTIFICATION_PREFERENCES
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...incoming
    }
  }, [])

  const loadPreferences = useCallback(async () => {
    if (!enabled) return

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission)
    } else {
      setBrowserPermission('default')
    }

    if (!userId) {
      setPreferences(DEFAULT_NOTIFICATION_PREFERENCES)
      setDirty(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users/notification-preferences', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (response.ok) {
        const payload = await response.json().catch(() => null)
        const next = mergePreferences(payload?.preferences)
        setPreferences(next)
        persistLocalPreferences(next)
        setDirty(false)
      } else {
        const message = await response.text().catch(() => '')
        console.warn('[useNotificationPreferences] failed to load from server', message)
        setError('알림 설정을 불러오는 데 실패했습니다.')
      }
    } catch (loadError) {
      console.error('[useNotificationPreferences] load error', loadError)
      setError('알림 설정을 불러오는 데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [enabled, mergePreferences, userId])

  useEffect(() => {
    if (!enabled) return

    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          setPreferences((prev) => mergePreferences(parsed))
        }
      } catch (error) {
        console.warn('[useNotificationPreferences] failed to read local preferences', error)
      }
    }

    loadPreferences()
  }, [enabled, loadPreferences, mergePreferences])

  const updatePreference = useCallback(
    <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value }
        setDirty(true)
        return next
      })
    },
    []
  )

  const bulkUpdate = useCallback((next: Partial<NotificationPreferences>) => {
    setPreferences((prev) => {
      const merged = { ...prev, ...next }
      setDirty(true)
      return merged
    })
  }, [])

  const savePreferences = useCallback(async () => {
    if (!userId) {
      setError('로그인 후 알림을 설정할 수 있습니다.')
      return false
    }

    setSaving(true)
    setError(null)

    const payload = { preferences }

    try {
      const response = await fetch('/api/users/notification-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const message = await response.text().catch(() => '')
        throw new Error(`Failed to save preferences: ${response.status} ${message}`)
      }

      persistLocalPreferences(preferences, { markCompleted: true })
      setDirty(false)

      if (userId) {
        notificationService.setClientPreferences(userId, {
          browser_notifications: preferences.browser_notifications,
          priority_threshold: preferences.priority_threshold
        })
      } else {
        notificationService.resetPreferenceCache()
      }

      return true
    } catch (saveError) {
      console.error('[useNotificationPreferences] save error', saveError)
      setError('알림 설정 저장 중 문제가 발생했습니다.')
      if (userId) {
        notificationService.resetPreferenceCache(userId)
      } else {
        notificationService.resetPreferenceCache()
      }
      return false
    } finally {
      setSaving(false)
    }
  }, [preferences, userId])

  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setError('브라우저에서 알림을 지원하지 않습니다.')
      return 'denied' as NotificationPermission
    }

    try {
      const permission = await Notification.requestPermission()
      setBrowserPermission(permission)
      if (permission === 'granted') {
        setPreferences((prev) => {
          if (prev.browser_notifications) return prev
          setDirty(true)
          return { ...prev, browser_notifications: true }
        })
      } else if (permission === 'denied') {
        setPreferences((prev) => {
          if (!prev.browser_notifications) return prev
          setDirty(true)
          return { ...prev, browser_notifications: false }
        })
      }
      return permission
    } catch (permissionError) {
      console.error('[useNotificationPreferences] permission request failed', permissionError)
      setError('알림 권한 요청 중 오류가 발생했습니다.')
      return browserPermission
    }
  }, [browserPermission])

  const resetError = useCallback(() => setError(null), [])

  const state = useMemo(
    () => ({
      preferences,
      loading,
      saving,
      error,
      dirty,
      browserPermission
    }),
    [preferences, loading, saving, error, dirty, browserPermission]
  )

  return {
    ...state,
    updatePreference,
    bulkUpdate,
    savePreferences,
    requestBrowserPermission,
    resetError,
    reload: loadPreferences
  }
}

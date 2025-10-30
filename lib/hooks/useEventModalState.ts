import { useCallback, useEffect, useMemo, useState } from 'react'

type EventModalState = {
  lastSeen?: string
  snoozedUntil?: string
  showCount?: number
}

const EVENT_MODAL_STORAGE_KEY = 'vietkconnect_event_modal_state'
const LEGACY_EVENT_MODAL_STORAGE_KEY = 'vietkconnect_event_modal_state'

type Options = {
  userId: string | null
  isLoggedIn: boolean
  isAuthLoading: boolean
  autoOpenDelayMs?: number
  autoOpen?: boolean
}

const DEFAULT_DELAY = 1000

const clampShowCount = (value: number | undefined) => {
  if (!value || Number.isNaN(value)) {
    return 0
  }
  return Math.min(Math.max(value, 0), 1)
}

export const useEventModalState = ({
  userId,
  isLoggedIn,
  isAuthLoading,
  autoOpenDelayMs = DEFAULT_DELAY,
  autoOpen = false,
}: Options) => {
  const [isOpen, setIsOpen] = useState(false)

  const storageKey = useMemo(() => {
    if (userId) return `${EVENT_MODAL_STORAGE_KEY}_${userId}`
    return EVENT_MODAL_STORAGE_KEY
  }, [userId])

  const getLegacyKey = useCallback(() => {
    if (!userId) return LEGACY_EVENT_MODAL_STORAGE_KEY
    return LEGACY_EVENT_MODAL_STORAGE_KEY
  }, [userId])

  const readState = useCallback((): EventModalState => {
    if (typeof window === 'undefined') return {}
    try {
      const currentKey = storageKey
      const legacyKey = getLegacyKey()

      if (userId && window.localStorage.getItem(legacyKey) && !window.localStorage.getItem(currentKey)) {
        try {
          const legacyValue = window.localStorage.getItem(legacyKey)
          if (legacyValue) {
            window.localStorage.setItem(currentKey, legacyValue)
          }
        } finally {
          window.localStorage.removeItem(legacyKey)
        }
      }

      const raw = window.localStorage.getItem(currentKey)
      if (!raw) return { showCount: 0 }
      const parsed = JSON.parse(raw)

      return {
        lastSeen: parsed?.lastSeen ?? undefined,
        snoozedUntil: parsed?.snoozedUntil ?? undefined,
        showCount: clampShowCount(parsed?.showCount),
      }
    } catch (error) {
      console.error('[useEventModalState] failed to read event modal state:', error)
      return { showCount: 0 }
    }
  }, [storageKey, getLegacyKey, userId])

  const writeState = useCallback(
    (patch: EventModalState) => {
      if (typeof window === 'undefined') return
      try {
        const currentState = readState()
        const nextState: EventModalState = {
          ...currentState,
          ...patch,
        }
        window.localStorage.setItem(storageKey, JSON.stringify(nextState))
      } catch (error) {
        console.error('[useEventModalState] failed to persist event modal state:', error)
      }
    },
    [readState, storageKey]
  )

  const markShown = useCallback(() => {
    const current = readState()
    writeState({
      lastSeen: new Date().toISOString(),
      showCount: clampShowCount((current.showCount ?? 0) + 1),
    })
  }, [readState, writeState])

  const dismiss = useCallback(() => {
    writeState({ lastSeen: new Date().toISOString() })
    setIsOpen(false)
  }, [writeState])

  const snooze = useCallback(() => {
    const now = new Date()
    const snoozeUntil = new Date(now)
    snoozeUntil.setDate(snoozeUntil.getDate() + 7)
    const current = readState()
    writeState({
      lastSeen: now.toISOString(),
      snoozedUntil: snoozeUntil.toISOString(),
      showCount: clampShowCount(current.showCount ?? 1),
    })
    setIsOpen(false)
  }, [readState, writeState])

  const open = useCallback(() => {
    markShown()
    setIsOpen(true)
  }, [markShown])

  useEffect(() => {
    if (!autoOpen || !isLoggedIn || isAuthLoading || !userId) {
      return
    }

    const timer = window.setTimeout(() => {
      const state = readState()
      const hasShownOnce = (state.showCount ?? 0) >= 1
      const snoozedUntil = state?.snoozedUntil ? new Date(state.snoozedUntil) : null
      const snoozeExpired = snoozedUntil ? snoozedUntil.getTime() <= Date.now() : false

      if (!hasShownOnce || snoozeExpired) {
        open()
      }
    }, autoOpenDelayMs)

    return () => window.clearTimeout(timer)
  }, [autoOpen, autoOpenDelayMs, isAuthLoading, isLoggedIn, open, readState, userId])

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        open()
        return
      }
      dismiss()
    },
    [dismiss, open]
  )

  return {
    isOpen,
    open,
    dismiss,
    snooze,
    markShown,
    readState,
    setOpen,
  }
}

export type UseEventModalStateResult = ReturnType<typeof useEventModalState>

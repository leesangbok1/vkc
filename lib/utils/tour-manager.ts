/**
 * Tour Management Utility
 * Handles Quick Tour state and localStorage persistence
 */

const TOUR_STATE_KEY_PREFIX = 'vietkconnect_tour_state'
const MAX_SHOW_COUNT = 2

const getStorageKey = (userId?: string | null) => {
  if (userId && userId.trim().length > 0) {
    return `${TOUR_STATE_KEY_PREFIX}_${userId}`
  }
  return TOUR_STATE_KEY_PREFIX
}

const DEFAULT_STATE: TourState = {
  completed: false,
  skipped: false,
  last_shown: null,
  completion_date: null,
  show_count: 0
}

export interface TourState {
  completed: boolean
  skipped: boolean
  last_shown: string | null
  completion_date: string | null
  show_count: number
}

/**
 * Get tour state from localStorage
 */
export function getTourState(userId?: string | null): TourState {
  try {
    const key = getStorageKey(userId)
    const legacyKey = TOUR_STATE_KEY_PREFIX

    if (userId && localStorage.getItem(legacyKey) && !localStorage.getItem(key)) {
      try {
        localStorage.setItem(key, localStorage.getItem(legacyKey) || '')
      } finally {
        localStorage.removeItem(legacyKey)
      }
    }

    const stateStr = localStorage.getItem(key)
    if (stateStr) {
      const parsed = JSON.parse(stateStr)
      return {
        completed: parsed.completed ?? false,
        skipped: parsed.skipped ?? false,
        last_shown: parsed.last_shown ?? null,
        completion_date: parsed.completion_date ?? null,
        show_count: parsed.show_count ?? 0
      }
    }
    return { ...DEFAULT_STATE }
  } catch (error) {
    console.error('Failed to load tour state:', error)
    return { ...DEFAULT_STATE }
  }
}

/**
 * Check if tour should be shown to user
 * Tour shows if:
 * 1. User has never completed the tour
 * 2. User has never skipped the tour
 * 3. Or if user skipped but it's been more than 7 days
 */
export function shouldShowTour(userId?: string | null): boolean {
  const state = getTourState(userId)

  // Never show if completed
  if (state.completed) {
    return false
  }

  // Only show first time
  if ((state.show_count ?? 0) >= MAX_SHOW_COUNT) {
    return false
  }

  return true
}

/**
 * Mark tour as completed
 */
export function completeTour(userId?: string | null): void {
  try {
    const prev = getTourState(userId)
    const state: TourState = {
      completed: true,
      skipped: false,
      last_shown: new Date().toISOString(),
      completion_date: new Date().toISOString(),
      show_count: Math.max(prev.show_count ?? 0, 1)
    }
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save tour completion:', error)
  }
}

/**
 * Mark tour as skipped
 */
export function skipTour(userId?: string | null): void {
  try {
    const prev = getTourState(userId)
    const state: TourState = {
      completed: false,
      skipped: true,
      last_shown: new Date().toISOString(),
      completion_date: null,
      show_count: MAX_SHOW_COUNT
    }
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save tour skip:', error)
  }
}

/**
 * Record that the tour was shown (최대 2회 노출)
 */
export function markTourShown(userId?: string | null): void {
  try {
    const prev = getTourState(userId)
    const now = new Date().toISOString()
    const updated: TourState = {
      completed: prev.completed,
      skipped: false, // 새로 본 경우 skip 해제
      last_shown: now,
      completion_date: prev.completion_date,
      show_count: Math.min((prev.show_count ?? 0) + 1, MAX_SHOW_COUNT)
    }
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to mark tour shown:', error)
  }
}

/**
 * Reset tour state (for testing or user request)
 */
export function resetTour(userId?: string | null): void {
  try {
    localStorage.removeItem(getStorageKey(userId))
  } catch (error) {
    console.error('Failed to reset tour state:', error)
  }
}

/**
 * Get last time tour was shown
 */
export function getLastTourDate(userId?: string | null): Date | null {
  const state = getTourState(userId)
  return state.last_shown ? new Date(state.last_shown) : null
}

/**
 * Check if user completed the tour
 */
export function hasTourCompleted(userId?: string | null): boolean {
  const state = getTourState(userId)
  return state.completed
}

/**
 * Tour Management Utility
 * Handles Quick Tour state and localStorage persistence
 */

const TOUR_STATE_KEY = 'vietkconnect_tour_state'

export interface TourState {
  completed: boolean
  skipped: boolean
  last_shown: string | null
  completion_date: string | null
}

/**
 * Get tour state from localStorage
 */
export function getTourState(): TourState {
  try {
    const stateStr = localStorage.getItem(TOUR_STATE_KEY)
    if (stateStr) {
      return JSON.parse(stateStr)
    }
    return {
      completed: false,
      skipped: false,
      last_shown: null,
      completion_date: null
    }
  } catch (error) {
    console.error('Failed to load tour state:', error)
    return {
      completed: false,
      skipped: false,
      last_shown: null,
      completion_date: null
    }
  }
}

/**
 * Check if tour should be shown to user
 * Tour shows if:
 * 1. User has never completed the tour
 * 2. User has never skipped the tour
 * 3. Or if user skipped but it's been more than 7 days
 */
export function shouldShowTour(): boolean {
  const state = getTourState()

  // Never show if completed
  if (state.completed) {
    return false
  }

  // Show if never skipped
  if (!state.skipped) {
    return true
  }

  // If skipped, check if 7 days have passed
  if (state.last_shown) {
    const lastShown = new Date(state.last_shown)
    const now = new Date()
    const daysSinceSkip = (now.getTime() - lastShown.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceSkip >= 7
  }

  return true
}

/**
 * Mark tour as completed
 */
export function completeTour(): void {
  try {
    const state: TourState = {
      completed: true,
      skipped: false,
      last_shown: new Date().toISOString(),
      completion_date: new Date().toISOString()
    }
    localStorage.setItem(TOUR_STATE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save tour completion:', error)
  }
}

/**
 * Mark tour as skipped
 */
export function skipTour(): void {
  try {
    const state: TourState = {
      completed: false,
      skipped: true,
      last_shown: new Date().toISOString(),
      completion_date: null
    }
    localStorage.setItem(TOUR_STATE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save tour skip:', error)
  }
}

/**
 * Reset tour state (for testing or user request)
 */
export function resetTour(): void {
  try {
    localStorage.removeItem(TOUR_STATE_KEY)
  } catch (error) {
    console.error('Failed to reset tour state:', error)
  }
}

/**
 * Get last time tour was shown
 */
export function getLastTourDate(): Date | null {
  const state = getTourState()
  return state.last_shown ? new Date(state.last_shown) : null
}

/**
 * Check if user completed the tour
 */
export function hasTourCompleted(): boolean {
  const state = getTourState()
  return state.completed
}

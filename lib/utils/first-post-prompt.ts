const POST_COUNT_STORAGE_KEY = 'vietkconnect_post_count'
const FIRST_POST_PROMPT_KEY = 'vietkconnect_first_post_prompt'

type PromptEntry = {
  completed?: boolean
  dismissed?: boolean
  lastCount?: number
  lastPostAt?: string | null
  lastPromptAt?: string | null
  lastAction?: 'completed' | 'dismissed' | 'prompt_shown'
}

type PromptStore = Record<string, PromptEntry>

const getStorageSafe = () => (typeof window !== 'undefined' ? window.localStorage : null)

const NOW = () => new Date().toISOString()

const normalizeKey = (userId: string | null | undefined) => {
  if (typeof userId === 'string' && userId.trim().length > 0) {
    return userId.trim()
  }
  return 'anonymous'
}

const readCountStore = (): Record<string, number> => {
  const storage = getStorageSafe()
  if (!storage) return {}
  try {
    const raw = storage.getItem(POST_COUNT_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.entries(parsed).reduce<Record<string, number>>((acc, [key, value]) => {
        const numericValue = typeof value === 'number' ? value : parseInt(String(value), 10)
        if (Number.isFinite(numericValue)) {
          acc[key] = numericValue
        }
        return acc
      }, {})
    }
    const numeric = parseInt(String(parsed), 10)
    if (Number.isFinite(numeric)) {
      return { anonymous: numeric }
    }
    return {}
  } catch (error) {
    console.warn('[first-post-prompt] failed to parse post count store', error)
    return {}
  }
}

const writeCountStore = (store: Record<string, number>) => {
  const storage = getStorageSafe()
  if (!storage) return
  try {
    storage.setItem(POST_COUNT_STORAGE_KEY, JSON.stringify(store))
  } catch (error) {
    console.warn('[first-post-prompt] failed to persist post count store', error)
  }
}

const readPromptStore = (): PromptStore => {
  const storage = getStorageSafe()
  if (!storage) return {}
  try {
    const raw = storage.getItem(FIRST_POST_PROMPT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as PromptStore
    }
    return {}
  } catch (error) {
    console.warn('[first-post-prompt] failed to parse prompt store', error)
    return {}
  }
}

const writePromptStore = (store: PromptStore) => {
  const storage = getStorageSafe()
  if (!storage) return
  try {
    storage.setItem(FIRST_POST_PROMPT_KEY, JSON.stringify(store))
  } catch (error) {
    console.warn('[first-post-prompt] failed to persist prompt store', error)
  }
}

const getPromptEntry = (userKey: string): PromptEntry => {
  const store = readPromptStore()
  const entry = store[userKey]
  if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
    return entry
  }
  return {}
}

const setPromptEntry = (userKey: string, entry: PromptEntry) => {
  const store = readPromptStore()
  store[userKey] = entry
  writePromptStore(store)
}

const incrementPostCount = (userKey: string): number => {
  const store = readCountStore()
  const current = Number.isFinite(store[userKey]) ? store[userKey] : 0
  const next = current + 1
  store[userKey] = next
  writeCountStore(store)
  return next
}

export function registerFirstPostCreation(userId: string | null | undefined): boolean {
  const storage = getStorageSafe()
  if (!storage) return false

  const userKey = normalizeKey(userId)
  if (userKey === 'anonymous') {
    // 익명 사용자는 안내하지 않음
    return false
  }

  const postCount = incrementPostCount(userKey)
  const previous = getPromptEntry(userKey)
  const shouldPrompt = postCount === 1 && !previous.completed && !previous.dismissed
  const now = NOW()

  const updated: PromptEntry = {
    ...previous,
    lastCount: postCount,
    lastPostAt: now,
    lastPromptAt: shouldPrompt ? now : previous.lastPromptAt ?? null,
    lastAction: shouldPrompt ? 'prompt_shown' : previous.lastAction,
  }

  setPromptEntry(userKey, updated)

  return shouldPrompt
}

export function markFirstPostPromptCompleted(userId: string | null | undefined) {
  const storage = getStorageSafe()
  if (!storage) return
  const userKey = normalizeKey(userId)
  if (userKey === 'anonymous') return
  const previous = getPromptEntry(userKey)
  const now = NOW()
  const entry: PromptEntry = {
    ...previous,
    completed: true,
    dismissed: false,
    lastAction: 'completed',
    lastPromptAt: previous.lastPromptAt ?? now,
  }
  setPromptEntry(userKey, entry)
}

export function markFirstPostPromptDismissed(userId: string | null | undefined) {
  const storage = getStorageSafe()
  if (!storage) return
  const userKey = normalizeKey(userId)
  if (userKey === 'anonymous') return
  const previous = getPromptEntry(userKey)
  const now = NOW()
  const entry: PromptEntry = {
    ...previous,
    dismissed: true,
    lastAction: 'dismissed',
    lastPromptAt: previous.lastPromptAt ?? now,
  }
  setPromptEntry(userKey, entry)
}

export function resetFirstPostPromptState(userId?: string | null) {
  const storage = getStorageSafe()
  if (!storage) return

  if (typeof userId === 'undefined') {
    try {
      storage.removeItem(POST_COUNT_STORAGE_KEY)
      storage.removeItem(FIRST_POST_PROMPT_KEY)
    } catch (error) {
      console.warn('[first-post-prompt] failed to reset prompt state', error)
    }
    return
  }

  const userKey = normalizeKey(userId)
  if (userKey === 'anonymous') return
  const counts = readCountStore()
  delete counts[userKey]
  writeCountStore(counts)

  const prompts = readPromptStore()
  delete prompts[userKey]
  writePromptStore(prompts)
}

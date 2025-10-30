/**
 * Bookmark Management Utilities
 * Interacts with Supabase-backed bookmark APIs.
 */

export interface Bookmark {
  id: string
  type: 'question' | 'answer' | 'post'
  targetId: string
  title: string | null
  content: string | null
  createdAt: string
}

const API_ENDPOINT = '/api/bookmarks'

type BookmarkRow = {
  id?: string | number | null
  target_type?: string | null
  target_id?: string | number | null
  title?: string | null
  content?: string | null
  created_at?: string | null
}

function mapBookmark(payload: BookmarkRow): Bookmark {
  const targetType = typeof payload.target_type === 'string' ? payload.target_type : 'question'
  const targetId = payload.target_id != null ? String(payload.target_id) : ''
  const bookmarkId = payload.id != null ? String(payload.id) : `temp-${targetId || Date.now()}`

  return {
    id: bookmarkId,
    type: targetType === 'answer' || targetType === 'post' ? targetType : 'question',
    targetId,
    title: typeof payload.title === 'string' ? payload.title : null,
    content: typeof payload.content === 'string' ? payload.content : null,
    createdAt: typeof payload.created_at === 'string'
      ? payload.created_at
      : new Date().toISOString()
  }
}

export async function getBookmarks(
  targetId?: string,
  type?: Bookmark['type']
): Promise<Bookmark[]> {
  try {
    const params = new URLSearchParams()
    if (targetId) params.set('target_id', targetId)
    if (type) params.set('target_type', type)

    const url = params.size > 0 ? `${API_ENDPOINT}?${params.toString()}` : API_ENDPOINT
    const res = await fetch(url, { cache: 'no-store', credentials: 'include' })

    if (!res.ok) {
      if (res.status === 401) {
        return []
      }
      const errorPayload = await res.json().catch(() => null)
      console.warn('[bookmark-manager] getBookmarks non-OK', res.status, errorPayload)
      return []
    }

    const json = await res.json()
    const data = Array.isArray(json?.data) ? json.data : []
    return data.map(mapBookmark)
  } catch (error) {
    console.error('[bookmark-manager] getBookmarks failed:', error)
    return []
  }
}

export async function addBookmark(input: {
  targetId: string
  type: Bookmark['type']
  title?: string
  content?: string
}): Promise<Bookmark | null> {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_id: input.targetId,
        target_type: input.type,
        title: input.title ?? null,
        content: input.content ?? null
      })
    })

    if (res.status === 401) {
      return null
    }

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || 'Failed to add bookmark')
    }

    const payload = await res.json()
    return payload?.data ? mapBookmark(payload.data) : null
  } catch (error) {
    console.error('[bookmark-manager] addBookmark failed:', error)
    return null
  }
}

export async function removeBookmark(
  bookmarkIdOrTargetId: string,
  type?: Bookmark['type']
): Promise<boolean> {
  try {
    let bookmarkId = bookmarkIdOrTargetId

    if (type) {
      const [existing] = await getBookmarks(bookmarkIdOrTargetId, type)
      if (!existing) {
        return false
      }
      bookmarkId = existing.id
    }

    const res = await fetch(`${API_ENDPOINT}/${bookmarkId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (res.status === 404) {
      return false
    }

    if (res.status === 401) {
      return false
    }

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || 'Failed to remove bookmark')
    }

    return true
  } catch (error) {
    console.error('[bookmark-manager] removeBookmark failed:', error)
    return false
  }
}

export async function isBookmarked(
  targetId: string,
  type: Bookmark['type']
): Promise<{ isBookmarked: boolean; bookmark: Bookmark | null }> {
  const [existing] = await getBookmarks(targetId, type)
  return {
    isBookmarked: Boolean(existing),
    bookmark: existing ?? null
  }
}

export async function toggleBookmark(input: {
  targetId: string
  type: Bookmark['type']
  title?: string
  content?: string
}): Promise<{ success: boolean; isBookmarked: boolean; bookmark: Bookmark | null }> {
  const { bookmark: existing } = await isBookmarked(input.targetId, input.type)

  if (existing) {
    const removed = await removeBookmark(existing.id)
    return {
      success: removed,
      isBookmarked: !removed,
      bookmark: removed ? null : existing
    }
  }

  const created = await addBookmark(input)
  return {
    success: Boolean(created),
    isBookmarked: Boolean(created),
    bookmark: created ?? null
  }
}

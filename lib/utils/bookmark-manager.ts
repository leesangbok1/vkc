/**
 * Bookmark Management Utility
 * Handles localStorage-based bookmark functionality for questions and answers
 */

export interface Bookmark {
  id: string
  type: 'question' | 'answer'
  targetId: string
  title: string
  content: string
  created_at: string
}

const BOOKMARKS_KEY = 'vietkconnect_bookmarks'

export function getBookmarks(): Bookmark[] {
  try {
    const bookmarksStr = localStorage.getItem(BOOKMARKS_KEY)
    return bookmarksStr ? JSON.parse(bookmarksStr) : []
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
    return []
  }
}

export function addBookmark(bookmark: Omit<Bookmark, 'id' | 'created_at'>): boolean {
  try {
    const bookmarks = getBookmarks()

    // Check if already bookmarked
    const exists = bookmarks.some(b => b.targetId === bookmark.targetId && b.type === bookmark.type)
    if (exists) {
      return false
    }

    const newBookmark: Bookmark = {
      ...bookmark,
      id: `bookmark_${Date.now()}`,
      created_at: new Date().toISOString()
    }

    bookmarks.unshift(newBookmark)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
    return true
  } catch (error) {
    console.error('Failed to add bookmark:', error)
    return false
  }
}

export function removeBookmark(targetId: string, type: 'question' | 'answer'): boolean {
  try {
    const bookmarks = getBookmarks()
    const filtered = bookmarks.filter(b => !(b.targetId === targetId && b.type === type))

    if (filtered.length === bookmarks.length) {
      return false // Nothing was removed
    }

    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Failed to remove bookmark:', error)
    return false
  }
}

export function isBookmarked(targetId: string, type: 'question' | 'answer'): boolean {
  const bookmarks = getBookmarks()
  return bookmarks.some(b => b.targetId === targetId && b.type === type)
}

export function toggleBookmark(bookmark: Omit<Bookmark, 'id' | 'created_at'>): { success: boolean; isBookmarked: boolean } {
  const currentlyBookmarked = isBookmarked(bookmark.targetId, bookmark.type)

  if (currentlyBookmarked) {
    const success = removeBookmark(bookmark.targetId, bookmark.type)
    return { success, isBookmarked: false }
  } else {
    const success = addBookmark(bookmark)
    return { success, isBookmarked: true }
  }
}

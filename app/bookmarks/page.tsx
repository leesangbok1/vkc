'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import FeedCard, { type FeedCardAuthor, type FeedCardItemType } from '@/components/feed/FeedCard'
import { Badge } from '@/components/ui/badge'
import { FeedSkeleton } from '@/components/questions/FeedSkeleton'
import {
  getBookmarks,
  removeBookmark as removeBookmarkUtil,
  type Bookmark,
} from '@/lib/utils/bookmark-manager'

type BookmarkCardModel = {
  bookmarkId: string
  targetId: string
  itemType: FeedCardItemType
  title: string
  body: string
  href: string
  createdAt: string
  topic?: string
  author?: FeedCardAuthor
  statsLabel?: string | null
  badgeLabel?: string | null
}

const BOOKMARK_LABEL: Record<FeedCardItemType, string> = {
  question: '질문',
  post: '게시글',
  answer: '답변',
}

function normalizeAuthor(input: any | null | undefined): FeedCardAuthor | undefined {
  if (!input || typeof input !== 'object') return undefined
  const raw = input as Record<string, any>

  const id =
    typeof raw.id === 'string' && raw.id.trim().length > 0
      ? raw.id.trim()
      : typeof raw.user_id === 'string' && raw.user_id.trim().length > 0
        ? raw.user_id.trim()
        : 'unknown'

  const name =
    typeof raw.name === 'string' && raw.name.trim().length > 0 ? raw.name.trim() : undefined

  const role =
    typeof raw.role === 'string' && raw.role.trim().length > 0 ? raw.role.trim() : undefined

  const avatarUrl =
    typeof raw.avatar_url === 'string' && raw.avatar_url.length > 0
      ? raw.avatar_url
      : typeof raw.avatarUrl === 'string' && raw.avatarUrl.length > 0
        ? raw.avatarUrl
        : undefined

  const visaType =
    typeof raw.visa_type === 'string'
      ? raw.visa_type
      : typeof raw.visaType === 'string'
        ? raw.visaType
        : undefined

  const yearsInKorea =
    typeof raw.years_in_korea === 'number'
      ? raw.years_in_korea
      : typeof raw.yearsInKorea === 'number'
        ? raw.yearsInKorea
        : undefined

  return {
    id,
    name,
    role,
    avatarUrl,
    visaType,
    yearsInKorea,
  }
}

function getDefaultHref(bookmark: Bookmark): string {
  if (bookmark.type === 'post') {
    return `/posts/${bookmark.targetId}`
  }
  if (bookmark.type === 'question') {
    return `/questions/${bookmark.targetId}`
  }
  return `/answers/${bookmark.targetId}`
}

function buildFallbackModel(bookmark: Bookmark): BookmarkCardModel {
  const itemType = bookmark.type as FeedCardItemType
  const label = BOOKMARK_LABEL[itemType]
  const title =
    bookmark.title && bookmark.title.trim().length > 0
      ? bookmark.title
      : `${label} 북마크`
  const body =
    bookmark.content && bookmark.content.trim().length > 0
      ? bookmark.content
      : '저장된 미리보기가 없습니다.'

  return {
    bookmarkId: bookmark.id,
    targetId: bookmark.targetId,
    itemType,
    title,
    body,
    href: getDefaultHref(bookmark),
    createdAt: bookmark.createdAt,
    topic: itemType === 'post' ? '정보글' : undefined,
    statsLabel: null,
    badgeLabel: label,
  }
}

async function hydrateBookmark(bookmark: Bookmark): Promise<BookmarkCardModel> {
  const fallback = buildFallbackModel(bookmark)

  try {
    if (bookmark.type === 'question') {
      const res = await fetch(`/api/questions/${bookmark.targetId}`, { cache: 'no-store' })
      if (!res.ok) return fallback
      const payload = await res.json().catch(() => null)
      const question = payload?.question
      if (!question) return fallback

      const answerCount = Number(question.answer_count ?? 0)

      return {
        bookmarkId: bookmark.id,
        targetId: question.id ?? bookmark.targetId,
        itemType: 'question',
        title: question.title ?? fallback.title,
        body: question.content ?? fallback.body,
        href: `/questions/${question.id}`,
        createdAt: question.created_at ?? bookmark.createdAt,
        topic: question.category?.name ?? fallback.topic,
        author: normalizeAuthor(question.author),
        statsLabel: answerCount > 0 ? `답변 ${answerCount}개` : null,
        badgeLabel: BOOKMARK_LABEL.question,
      }
    }

    if (bookmark.type === 'post') {
      const res = await fetch(`/api/posts/${bookmark.targetId}`, { cache: 'no-store' })
      if (!res.ok) return fallback
      const payload = await res.json().catch(() => null)
      const post = payload?.data
      if (!post) return fallback

      const commentCount = Number(post.comment_count ?? 0)
      const helpfulCount = Number(post.helpful_count ?? 0)
      const statsLabel =
        commentCount > 0
          ? `댓글 ${commentCount}개`
          : helpfulCount > 0
            ? `도움됨 ${helpfulCount}개`
            : null

      return {
        bookmarkId: bookmark.id,
        targetId: post.id ?? bookmark.targetId,
        itemType: 'post',
        title: post.title ?? fallback.title,
        body: post.content ?? fallback.body,
        href: `/posts/${post.id}`,
        createdAt: post.created_at ?? bookmark.createdAt,
        topic: post.category?.name ?? fallback.topic,
        author: normalizeAuthor(post.author),
        statsLabel,
        badgeLabel: BOOKMARK_LABEL.post,
      }
    }

    if (bookmark.type === 'answer') {
      const res = await fetch(`/api/answers/${bookmark.targetId}`, { cache: 'no-store' })
      if (!res.ok) return fallback
      const payload = await res.json().catch(() => null)
      const answer = payload?.data
      if (!answer) return fallback

      const question = answer.question
      const questionId =
        typeof question?.id === 'string' && question.id.length > 0 ? question.id : null

      const helpfulCount = Number(answer.helpful_count ?? 0)

      return {
        bookmarkId: bookmark.id,
        targetId: answer.id ?? bookmark.targetId,
        itemType: 'answer',
        title: question?.title ? `답변: ${question.title}` : fallback.title,
        body: answer.content ?? fallback.body,
        href: questionId ? `/questions/${questionId}#answer-${answer.id}` : fallback.href,
        createdAt: answer.created_at ?? bookmark.createdAt,
        topic: '답변',
        author: normalizeAuthor(answer.author),
        statsLabel: helpfulCount > 0 ? `도움됨 ${helpfulCount}개` : null,
        badgeLabel: BOOKMARK_LABEL.answer,
      }
    }
  } catch (error) {
    console.warn('[BookmarksPage] hydrateBookmark failed', error)
  }

  return fallback
}

export default function BookmarksPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [hydratedBookmarks, setHydratedBookmarks] = useState<BookmarkCardModel[]>([])
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false)
  const [isHydrating, setIsHydrating] = useState(false)

  const loadBookmarks = useCallback(async () => {
    setIsLoadingBookmarks(true)
    try {
      const stored = await getBookmarks()
      setBookmarks(stored)
    } catch (error) {
      console.error('[BookmarksPage] failed to load bookmarks', error)
      setBookmarks([])
    } finally {
      setIsLoadingBookmarks(false)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    setIsCheckingAuth(true)
    try {
      const res = await fetch('/api/auth/profile', { cache: 'no-store' })
      if (!res.ok) {
        router.push('/auth/login?redirectTo=/bookmarks')
        return
      }
      setIsLoggedIn(true)
      await loadBookmarks()
    } catch (error) {
      console.error('[BookmarksPage] auth check failed', error)
      router.push('/auth/login?redirectTo=/bookmarks')
    } finally {
      setIsCheckingAuth(false)
    }
  }, [router, loadBookmarks])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoggedIn) return
    if (bookmarks.length === 0) {
      setHydratedBookmarks([])
      return
    }

    let ignore = false
    setIsHydrating(true)

    Promise.all(bookmarks.map((bookmark) => hydrateBookmark(bookmark)))
      .then((results) => {
        if (ignore) return
        setHydratedBookmarks(results)
      })
      .catch((error) => {
        console.error('[BookmarksPage] hydrate failed', error)
      })
      .finally(() => {
        if (!ignore) {
          setIsHydrating(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [bookmarks, isLoggedIn])

  const handleRemove = useCallback(
    async (bookmarkId: string) => {
      const success = await removeBookmarkUtil(bookmarkId)
      if (!success) {
        alert('북마크 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

      setBookmarks((prev) => prev.filter((item) => item.id !== bookmarkId))
      setHydratedBookmarks((prev) => prev.filter((item) => item.bookmarkId !== bookmarkId))
    },
    []
  )

  if (isCheckingAuth) {
    return (
      <PageLayout variant="centered">
        <div className="loading-container">
          <div>
            <div className="loading-emoji" aria-hidden="true">⏳</div>
            <p>로딩 중...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="withSidebar">
      <div className="bookmarks-page">
        <header className="bookmark-page-header">
          <div>
            <h1 className="bookmark-page-title">🔖 북마크</h1>
            <p className="bookmark-page-subtitle">
              나중에 다시 보고 싶은 질문과 정보글을 한곳에서 확인해보세요.
            </p>
          </div>
          <button
            type="button"
            className="bookmark-explore-btn"
            onClick={() => router.push('/posts')}
          >
            🔍 북마크할 게시글 찾기
          </button>
        </header>

        <section className="bookmark-content">
          {isLoadingBookmarks || isHydrating ? (
            <FeedSkeleton count={3} />
          ) : hydratedBookmarks.length === 0 ? (
            <div className="bookmark-empty-state">
              <div className="text-4xl mb-4" aria-hidden="true">🗂️</div>
              <h3>아직 저장한 북마크가 없어요</h3>
              <p>
                질문이나 게시글에서 북마크 버튼을 누르면 이곳에서 바로 확인할 수 있어요.
                자주 참고하고 싶은 콘텐츠를 북마크로 모아보세요.
              </p>
              <button
                type="button"
                className="bookmark-empty-cta"
                onClick={() => router.push('/posts')}
              >
                <span>지금 둘러보기</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <div className="feed-container bookmark-feed-container">
              {hydratedBookmarks.map((item) => {
                const statsNode = item.statsLabel ? <span>{item.statsLabel}</span> : undefined
                const badgeNode = item.badgeLabel ? (
                  <Badge variant="secondary">{item.badgeLabel}</Badge>
                ) : undefined

                return (
                  <div key={item.bookmarkId} className="bookmark-card-wrapper">
                    <button
                      type="button"
                      className="bookmark-remove-button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleRemove(item.bookmarkId)
                      }}
                    >
                      <span aria-hidden="true">🗑️</span>
                      <span>삭제</span>
                    </button>
                    <FeedCard
                      id={item.targetId}
                      itemType={item.itemType}
                      title={item.title}
                      body={item.body}
                      href={item.href}
                      createdAt={item.createdAt}
                      topic={item.topic}
                      author={item.author}
                      stats={statsNode}
                      badge={badgeNode}
                      showReportButton={false}
                      onNavigate={(href) => router.push(href)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  )
}

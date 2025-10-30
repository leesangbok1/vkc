'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import FeedCard, { type FeedCardActionProps, type FeedCardAuthor } from '@/components/feed/FeedCard'
import { Badge } from '@/components/ui/badge'
import { BRAND_NAME } from '@/lib/constants/branding'

interface PostDetail {
  id: string
  title: string
  content: string
  category?: {
    id?: number | null
    name?: string | null
    icon?: string | null
  }
  author?: {
    id?: string | null
    name?: string | null
    role?: string | null
    visa_type?: string | null
    years_in_korea?: number | null
  }
  post_type?: 'community' | 'news'
  helpful_count?: number | null
  comment_count?: number | null
  tags?: string[] | null
  created_at: string
  view_count?: number | null
  viewer_can_manage?: boolean
}

export default function PostDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const postId = params?.id ?? ''

  const [post, setPost] = useState<PostDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!postId) return
    loadPost()
  }, [postId])


  async function loadPost() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/posts/${postId}`, { cache: 'no-store' })
      if (res.status === 404) {
        setError('해당 게시글을 찾을 수 없습니다.')
        setPost(null)
        return
      }
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || '게시글을 불러오지 못했습니다.')
      }

      const payload = await res.json()
      setPost(payload?.data ?? null)
    } catch (err: any) {
      console.error('[PostDetailPage] loadPost failed:', err)
      setError(err?.message || '게시글을 불러오지 못했습니다.')
      setPost(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <PageLayout variant="centered">
        <div className="loading-container">
          <div>
            <div className="loading-emoji" aria-hidden="true">⌛</div>
            <p>게시글을 불러오는 중입니다...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!post || error) {
    return (
      <PageLayout variant="centered">
        <div className="error-container">
          <h1 className="error-title">{error || '게시글을 불러오지 못했습니다.'}</h1>
          <button
            className="btn-primary error-btn"
            onClick={() => router.push('/posts')}
          >
            게시글 목록으로 이동
          </button>
        </div>
      </PageLayout>
    )
  }

  const createdAt = new Date(post.created_at)
  const tags = Array.isArray(post.tags)
    ? post.tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0)
    : []
  const wordCount = post.content ? post.content.trim().split(/\s+/).length : 0
  const estimatedReadingMinutes = Math.max(1, Math.round(wordCount / 300))
  const commentCount = Number(post.comment_count ?? 0)
  const viewCount = Number(post.view_count ?? 0)

  const author: FeedCardAuthor = {
    id: post.author?.id ?? 'unknown',
    name: post.author?.name ?? `${BRAND_NAME} 관리자`,
    role: post.author?.role ?? undefined,
    visaType: post.author?.visa_type ?? undefined,
    yearsInKorea: post.author?.years_in_korea ?? undefined,
  }

  const statsParts: string[] = []
  if (commentCount > 0) statsParts.push(`댓글 ${commentCount.toLocaleString()}개`)
  if (viewCount > 0) statsParts.push(`조회 ${viewCount.toLocaleString()}회`)
  statsParts.push(`약 ${estimatedReadingMinutes}분 소요`)
  statsParts.push(createdAt.toLocaleString('ko-KR', { dateStyle: 'long', timeStyle: 'short' }))
  const statsText = statsParts.join(' · ')

  const badgeNode = post.post_type === 'news'
    ? <Badge variant="secondary">NEWS</Badge>
    : undefined

  const actionProps: FeedCardActionProps = {
    targetType: 'post',
    helpfulCount: Number(post.helpful_count ?? 0),
    requireLogin: true,
    onLoginRequired: () => router.push(`/auth/login?redirectTo=/posts/${post.id}`),
    compact: false,
  }

  const handleEdit = useCallback(() => {
    router.push(`/posts/${post.id}/edit`)
  }, [post.id, router])

  const handleDelete = useCallback(async () => {
    if (isDeleting) return
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('게시글을 삭제하면 되돌릴 수 없습니다. 계속하시겠습니까?')
      if (!confirmed) {
        return
      }
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        const message = json?.error || '게시글 삭제에 실패했습니다.'
        alert(message)
        return
      }
      alert('게시글이 삭제되었습니다.')
      router.push('/posts')
    } catch (err) {
      console.error('[PostDetailPage] delete failed', err)
      alert('게시글 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }, [isDeleting, post.id, router])

  return (
    <PageLayout variant="withSidebar">
      <div className="post-detail-page">
        <div className="feed-container">
          <FeedCard
            id={post.id}
            itemType="post"
            title={post.title}
            body={post.content ?? ''}
            href={`/posts/${post.id}`}
            createdAt={post.created_at}
            topic={post.category?.name ?? '정보'}
            author={author}
            stats={statsText}
            badge={badgeNode}
            actionProps={actionProps}
            fullBody
            interactive={false}
            showReportButton
            ownerActions={
              post.viewer_can_manage
                ? {
                    onEdit: handleEdit,
                    onDelete: handleDelete,
                    isDeleting,
                  }
                : undefined
            }
          />
        </div>
        {tags.length > 0 && (
          <div className="post-detail-tags-row" aria-label="게시글 태그">
            {tags.map((tag) => (
              <span key={tag} className="post-detail-tag-chip">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

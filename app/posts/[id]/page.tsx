'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import ActionBar from '@/components/common/ActionBar'
import { BRAND_NAME } from '@/lib/constants/branding'
import { renderMarkdownLite } from '@/lib/utils/markdown'

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
}

export default function PostDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const postId = params?.id ?? ''

  const [post, setPost] = useState<PostDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        <div className="post-detail-loading">게시글을 불러오는 중입니다...</div>
      </PageLayout>
    )
  }

  if (!post || error) {
    return (
      <PageLayout variant="centered">
        <div className="post-detail-error">
          <div className="post-detail-error-icon">📄</div>
          <h1>{error || '게시글을 불러오지 못했습니다.'}</h1>
          <button className="btn btn-primary" onClick={() => router.push('/posts')}>
            게시글 목록으로 이동
          </button>
        </div>
      </PageLayout>
    )
  }

  const authorName = post.author?.name || `${BRAND_NAME} 관리자`
  const categoryName = post.category?.name || '정보'
  const categoryIcon = post.category?.icon || '📝'

  const formattedContent = renderMarkdownLite(post.content || '')

  return (
    <PageLayout variant="centered">
      <div className="post-detail-container">
        <header className="post-detail-header">
          <div className="post-detail-category">
            <span className="post-detail-category-icon">{categoryIcon}</span>
            <span>{categoryName}</span>
          </div>
          <h1 className="post-detail-title">{post.title}</h1>
          <div className="post-detail-meta">
            <span>{authorName}</span>
            <span>{new Date(post.created_at).toLocaleString('ko-KR')}</span>
            {typeof post.view_count === 'number' && (
              <span>조회수 {post.view_count.toLocaleString()}</span>
            )}
          </div>
        </header>

        <article className="post-detail-content" dangerouslySetInnerHTML={{ __html: formattedContent }} />

        <ActionBar
          helpfulCount={post.helpful_count ?? 0}
          commentCount={post.comment_count ?? 0}
          onShare={() => navigator.clipboard.writeText(window.location.href)}
          onBookmark={() => router.push(`/posts/${post.id}`)}
        />
      </div>
    </PageLayout>
  )
}

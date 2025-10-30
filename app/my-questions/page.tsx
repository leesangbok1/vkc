'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import BaseModal from '@/components/modals/BaseModal'
import StatusBadge from '@/components/common/StatusBadge'
import FeedCard, { type FeedCardAuthor, type FeedCardActionProps } from '@/components/feed/FeedCard'

type Post = {
  id: string
  title: string
  content: string
  categoryName?: string | null
  createdAt: string
  helpfulCount: number
  isHelpful: boolean
  author?: FeedCardAuthor | null
}

type Question = {
  id: string
  title: string
  content: string
  categoryName: string | null
  createdAt: string
  answerCount: number
  status: 'open' | 'resolved'
  helpfulCount: number
  isHelpful: boolean
  author?: FeedCardAuthor | null
}

type Profile = {
  id: string
  name?: string | null
  email?: string | null
}

const mapToFeedCardAuthor = (raw: any): FeedCardAuthor | null => {
  if (!raw) {
    return null
  }

  return {
    id: typeof raw.id === 'string' ? raw.id : String(raw.id ?? 'unknown'),
    name: typeof raw.name === 'string'
      ? raw.name
      : typeof raw.nickname === 'string'
        ? raw.nickname
        : null,
    role: raw.role ?? null,
    visaType: raw.visa_type ?? raw.visaType ?? null,
    yearsInKorea: raw.years_in_korea ?? raw.yearsInKorea ?? null,
    avatarUrl:
      typeof raw.avatar_url === 'string'
        ? raw.avatar_url
        : typeof raw.avatarUrl === 'string'
          ? raw.avatarUrl
          : null,
  }
}

function mapApiQuestion(raw: any): Question {
  const answerCount = Number(raw?.answer_count ?? 0)
  const status =
    typeof raw?.status === 'string'
      ? (raw.status === 'resolved' ? 'resolved' : 'open')
      : answerCount > 0
        ? 'resolved'
        : 'open'

  return {
    id: String(raw?.id ?? ''),
    title: raw?.title ?? '제목 없음',
    content: raw?.content ?? '',
    categoryName:
      typeof raw?.category?.name === 'string'
        ? raw.category.name
        : typeof raw?.category_name === 'string'
          ? raw.category_name
          : null,
    createdAt: raw?.created_at ?? new Date().toISOString(),
    answerCount,
    status,
    helpfulCount: Number(raw?.helpful_count ?? raw?.helpfulCount ?? 0),
    isHelpful: Boolean(raw?.is_helpful_by_viewer),
    author: mapToFeedCardAuthor(raw?.author),
  }
}

export default function MyQuestionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'questions' | 'posts'>('questions')
  const [questions, setQuestions] = useState<Question[]>([])
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const tab = (searchParams?.get('tab') || '').toLowerCase()
    if (tab === 'posts') {
      setActiveTab('posts')
    } else {
      setActiveTab('questions')
    }
  }, [searchParams])

  useEffect(() => {
    let ignore = false

    async function load() {
      setLoading(true)
      setError(null)
      let authenticated = false

      try {
        const profileRes = await fetch('/api/auth/profile', { cache: 'no-store', credentials: 'include' })
        if (!profileRes.ok) {
          if (!ignore) {
            setIsLoggedIn(false)
            setProfile(null)
            setQuestions([])
            setError('내 질문을 확인하려면 로그인 해주세요.')
          }
          return
        }

        const profileJson = await profileRes.json()
        const profileData: Profile | null = profileJson?.data ?? null

        if (!profileData?.id) {
          if (!ignore) {
            setIsLoggedIn(false)
            setProfile(null)
            setQuestions([])
            setError('내 질문을 확인하려면 로그인 해주세요.')
          }
          return
        }

        authenticated = true

        if (!ignore) {
          setIsLoggedIn(true)
          setProfile(profileData)
        }

        const params = new URLSearchParams({
          sort: 'recent',
          author: profileData.id,
          limit: '50',
        })

        const questionsRes = await fetch(`/api/questions?${params.toString()}`, {
          cache: 'no-store',
          credentials: 'include',
        })
        if (!questionsRes.ok) {
          throw new Error(`questions request failed: ${questionsRes.status}`)
        }

        const payload = await questionsRes.json()
        const rawItems = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : []

        const mapped = rawItems
          .map(mapApiQuestion)
          .filter((item) => item.id.length > 0)

        if (!ignore) {
          setQuestions(mapped)
        }
      } catch (err) {
        console.error('[MyQuestions] load failed', err)
        if (!ignore) {
          setIsLoggedIn(authenticated)
          setQuestions([])
          setError(
            authenticated
              ? '질문을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
              : '내 질문을 확인하려면 로그인 해주세요.'
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [reloadKey])

  useEffect(() => {
    if (!profile?.id) return

    let ignore = false
    async function loadPosts() {
      setPostsLoading(true)
      setPostsError(null)
      try {
        const params = new URLSearchParams({
          author: profile.id,
          limit: '50',
        })
        const res = await fetch(`/api/posts?${params.toString()}`, { cache: 'no-store', credentials: 'include' })
        if (!res.ok) {
          throw new Error(`posts request failed: ${res.status}`)
        }
        const json = await res.json()
        const items = Array.isArray(json?.items) ? json.items : []
        if (!ignore) {
          const mapped = items
            .map((raw: any) => ({
              id: String(raw?.id ?? ''),
              title: raw?.title ?? '제목 없음',
              content: raw?.content ?? '',
              categoryName:
                typeof raw?.category?.name === 'string'
                  ? raw.category.name
                  : typeof raw?.category === 'string'
                    ? raw.category
                    : null,
              createdAt: raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
              helpfulCount: Number(raw?.helpful_count ?? raw?.helpful ?? 0),
              isHelpful: Boolean(raw?.is_helpful_by_viewer),
              author: mapToFeedCardAuthor(raw?.author),
            }))
            .filter((item) => item.id.length > 0)
          setPosts(mapped)
        }
      } catch (err) {
        console.error('[MyPosts] load failed', err)
        if (!ignore) {
          setPosts([])
          setPostsError('정보 글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
        }
      } finally {
        if (!ignore) {
          setPostsLoading(false)
        }
      }
    }

    loadPosts()
    return () => {
      ignore = true
    }
  }, [profile])

  const filteredQuestions = useMemo(() => {
    if (filter === 'all') return questions
    return questions.filter((q) => q.status === filter)
  }, [questions, filter])

  const openCount = useMemo(
    () => questions.filter((q) => q.status === 'open').length,
    [questions]
  )

  const resolvedCount = useMemo(
    () => questions.filter((q) => q.status === 'resolved').length,
    [questions]
  )

  const handleRetry = () => setReloadKey((prev) => prev + 1)

  const handleChangeTab = (tab: 'questions' | 'posts') => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (tab === 'questions') {
      params.delete('tab')
    } else {
      params.set('tab', 'posts')
    }
    const query = params.toString()
    router.replace(query ? `/my-questions?${query}` : '/my-questions')
  }

  const handleEditPost = useCallback(
    (postId: string) => {
      setIsModalOpen(false)
      router.push(`/posts/${postId}/edit`)
    },
    [router, setIsModalOpen]
  )

  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (typeof window !== 'undefined') {
        const confirmed = window.confirm(
          '정말로 이 게시글을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.'
        )
        if (!confirmed) {
          return
        }
      }

      setPendingDeleteId(postId)
      try {
        const res = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.success) {
          const message = json?.error || '게시글 삭제에 실패했습니다.'
          alert(message)
          return
        }
        setPosts((prev) => prev.filter((item) => item.id !== postId))
      } catch (err) {
        console.error('[MyPosts] delete failed', err)
        alert('게시글 삭제 중 오류가 발생했습니다.')
      } finally {
        setPendingDeleteId((current) => (current === postId ? null : current))
      }
    },
    [setPosts, setPendingDeleteId]
  )

  const isQuestionsTab = activeTab === 'questions'
  const currentLoading = isQuestionsTab ? loading : postsLoading
  const currentError = isQuestionsTab ? error : postsError
  const hasItems = isQuestionsTab ? filteredQuestions.length > 0 : posts.length > 0

  const questionsSummary = isLoggedIn
    ? `총 ${questions.length}개의 질문 (미해결 ${openCount} / 해결 ${resolvedCount})`
    : '로그인 후 질문을 확인할 수 있습니다.'

  const postsSummary = isLoggedIn
    ? `총 ${posts.length}개의 정보 글`
    : '로그인 후 정보 글을 확인할 수 있습니다.'

  const handleClose = () => {
    setIsModalOpen(false)
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={handleClose}
      width="960px"
      maxWidth="95vw"
      adaptiveMode={true}
      fullScreenOnMobile={true}
      showBackButton={true}
      className="my-questions-modal"
    >
      <div className="my-questions-container">
        <div className="section my-questions-header-section">
          <div className="my-questions-header-row">
            <div className="my-questions-header-info">
              <h1
                className="section-title my-questions-title"
                translate="no"
                data-no-translate="true"
                suppressHydrationWarning
              >
                📚 내 게시글
              </h1>
              <p className="my-questions-subtitle">
                {isQuestionsTab ? questionsSummary : postsSummary}
              </p>
            </div>
            {isQuestionsTab ? (
              <Link href="/questions/new">
                <button className="btn btn-primary">
                  + 질문하기
                </button>
              </Link>
            ) : (
              <Link href="/posts/new">
                <button className="btn btn-primary">
                  + 정보 글 작성
                </button>
              </Link>
            )}
          </div>

          <div className="category-tabs my-questions-tabs">
            <button
              className={`category-tab ${isQuestionsTab ? 'active' : ''}`}
              onClick={() => handleChangeTab('questions')}
            >
              질문 ({questions.length})
            </button>
            <button
              className={`category-tab ${!isQuestionsTab ? 'active' : ''}`}
              onClick={() => handleChangeTab('posts')}
            >
              정보 글 ({posts.length})
            </button>
          </div>

          {isQuestionsTab && (
            <div className="category-tabs my-questions-tabs secondary">
              <button
                className={`category-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                전체 ({questions.length})
              </button>
              <button
                className={`category-tab ${filter === 'open' ? 'active' : ''}`}
                onClick={() => setFilter('open')}
              >
                미해결 ({openCount})
              </button>
              <button
                className={`category-tab ${filter === 'resolved' ? 'active' : ''}`}
                onClick={() => setFilter('resolved')}
              >
                해결됨 ({resolvedCount})
              </button>
            </div>
          )}
        </div>

        {currentLoading ? (
          <div className="section my-questions-loading">
            <div className="spinner my-questions-loading-spinner"></div>
            <p className="my-questions-loading-text">
              {isQuestionsTab ? '질문을 불러오는 중...' : '정보 글을 불러오는 중...'}
            </p>
          </div>
        ) : !isLoggedIn ? (
          <div className="section my-questions-empty">
            <div className="my-questions-empty-icon">🔐</div>
            <h3 className="my-questions-empty-title">로그인이 필요합니다</h3>
            <p className="my-questions-empty-text">
              내 질문을 확인하려면 로그인 해주세요.
            </p>
            <Link href="/auth/login">
              <button className="btn btn-primary">
                로그인하기
              </button>
            </Link>
          </div>
        ) : currentError ? (
          <div className="section my-questions-empty">
            <div className="my-questions-empty-icon">⚠️</div>
            <h3 className="my-questions-empty-title">
              {isQuestionsTab ? '질문을 불러오지 못했습니다' : '정보 글을 불러오지 못했습니다'}
            </h3>
            <p className="my-questions-empty-text">
              {currentError}
            </p>
            <button className="btn btn-primary" onClick={handleRetry}>
              다시 시도하기
            </button>
          </div>
        ) : !hasItems ? (
          <div className="section my-questions-empty">
            <div className="my-questions-empty-icon">📝</div>
            <h3 className="my-questions-empty-title">
              {isQuestionsTab
                ? filter === 'all'
                  ? '아직 작성한 질문이 없습니다'
                  : filter === 'open'
                  ? '미해결 질문이 없습니다'
                  : '해결된 질문이 없습니다'
                : '아직 작성한 정보 글이 없습니다'}
            </h3>
            <p className="my-questions-empty-text">
              {isQuestionsTab
                ? filter === 'all'
                  ? '첫 질문을 작성해보세요!'
                  : '다른 탭을 확인해보세요.'
                : '첫 정보 글을 작성해보세요!'}
            </p>
            {isQuestionsTab ? (
              <Link href="/questions/new">
                <button className="btn btn-primary">
                  질문 작성하기
                </button>
              </Link>
            ) : (
              <Link href="/posts/new">
                <button className="btn btn-primary">
                  정보 글 작성하기
                </button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {isQuestionsTab ? (
              <div className="feed-container my-questions-list">
                {filteredQuestions.map((question) => {
                  const author =
                    question.author ??
                    (profile
                      ? {
                          id: profile.id,
                          name: profile.name ?? profile.email ?? '나',
                        }
                      : { id: 'unknown', name: '커뮤니티 멤버' })

                  const stats =
                    question.answerCount > 0
                      ? <span>답변 {question.answerCount}개</span>
                      : <span>아직 답변이 없어요</span>

                  const actionProps: FeedCardActionProps = {
                    targetType: 'question',
                    helpfulCount: question.helpfulCount,
                    isHelpful: question.isHelpful,
                    requireLogin: !isLoggedIn,
                    compact: true,
                    onLoginRequired: () => router.push('/auth/login?redirectTo=/my-questions'),
                  }

                  return (
                    <div key={question.id} className="my-questions-feed-card">
                      <FeedCard
                        id={question.id}
                        itemType="question"
                        title={question.title}
                        body={question.content}
                        href={`/questions/${question.id}`}
                        createdAt={question.createdAt}
                        topic={question.categoryName ?? undefined}
                        author={author}
                        stats={stats}
                        badge={<StatusBadge resolved={question.status === 'resolved'} compact />}
                        actionProps={actionProps}
                        showReportButton
                        onNavigate={(href) => {
                          setIsModalOpen(false)
                          router.push(href)
                        }}
                        onAuthorClick={(authorId) => {
                          setIsModalOpen(false)
                          router.push(`/users/${authorId}`)
                        }}
                        ownerActions={{
                          onEdit: () => handleEditPost(post.id),
                          onDelete: () => handleDeletePost(post.id),
                          isDeleting: pendingDeleteId === post.id,
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="feed-container my-questions-list">
                {posts.map((post) => {
                  const author =
                    post.author ??
                    (profile
                      ? {
                          id: profile.id,
                          name: profile.name ?? profile.email ?? '나',
                        }
                      : { id: 'unknown', name: '커뮤니티 멤버' })

                  const actionProps: FeedCardActionProps = {
                    targetType: 'post',
                    helpfulCount: post.helpfulCount,
                    isHelpful: post.isHelpful,
                    requireLogin: !isLoggedIn,
                    compact: true,
                    onLoginRequired: () => router.push('/auth/login?redirectTo=/my-questions?tab=posts'),
                  }

                  return (
                    <div key={post.id} className="my-questions-feed-card">
                      <FeedCard
                        id={post.id}
                        itemType="post"
                        title={post.title}
                        body={post.content}
                        href={`/posts/${post.id}`}
                        createdAt={post.createdAt}
                        topic={post.categoryName ?? undefined}
                        author={author}
                        stats={post.helpfulCount > 0 ? <span>도움됨 {post.helpfulCount}</span> : null}
                        actionProps={actionProps}
                        showReportButton
                        onNavigate={(href) => {
                          setIsModalOpen(false)
                          router.push(href)
                        }}
                        onAuthorClick={(authorId) => {
                          setIsModalOpen(false)
                          router.push(`/users/${authorId}`)
                        }}
                        ownerActions={{
                          onEdit: () => handleEditPost(post.id),
                          onDelete: () => handleDeletePost(post.id),
                          isDeleting: pendingDeleteId === post.id,
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </BaseModal>
  )
}

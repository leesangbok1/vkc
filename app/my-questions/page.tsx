'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import StatusBadge from '@/components/common/StatusBadge'
import { renderMarkdownLite } from '@/lib/utils/markdown'

type Post = {
  id: string
  title: string
  content: string
  categoryName?: string | null
  createdAt: string
  helpfulCount?: number
}

type Question = {
  id: string
  title: string
  content: string
  categoryName: string | null
  createdAt: string
  viewCount: number
  upvoteCount: number
  answerCount: number
  status: 'open' | 'resolved'
}

type Profile = {
  id: string
  name?: string | null
  email?: string | null
}

const markdownToPlainText = (markdown: string): string => {
  if (typeof window === 'undefined') return markdown
  const temp = document.createElement('div')
  temp.innerHTML = renderMarkdownLite(markdown)
  return temp.textContent || temp.innerText || markdown
}

function mapApiQuestion(raw: any): Question {
  const answerCount = Number(raw?.answer_count ?? 0)
  return {
    id: String(raw?.id ?? ''),
    title: raw?.title ?? '제목 없음',
    content: raw?.content ?? '',
    categoryName: raw?.category?.name ?? null,
    createdAt: raw?.created_at ?? new Date().toISOString(),
    viewCount: Number(raw?.view_count ?? 0),
    upvoteCount: Number(raw?.upvote_count ?? 0),
    answerCount,
    status: answerCount > 0 ? 'resolved' : 'open',
  }
}

export default function MyQuestionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
              categoryName: raw?.category?.name ?? raw?.category ?? null,
              createdAt: raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
              helpfulCount: raw?.helpful_count ?? raw?.helpful ?? 0,
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

  function getTimeAgo(dateString: string) {
    const now = new Date()
    const past = new Date(dateString)
    const diff = now.getTime() - past.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    if (minutes > 0) return `${minutes}분 전`
    return '방금 전'
  }

  function deleteQuestion(_id: string) {
    alert('DB 연동 버전에서는 질문 삭제 기능이 준비 중입니다.')
  }

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

  return (
    <PageLayout variant="centered">
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
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="question-card">
                    <div className="my-question-status-badge">
                      <StatusBadge resolved={question.status === 'resolved'} />
                    </div>

                    <Link href={`/questions/${question.id}`}>
                      <h3 className="question-title my-question-title-link">
                        {question.title}
                      </h3>
                    </Link>

                    <p className="question-content my-question-content-preview">
                      {(() => {
                        const text = markdownToPlainText(question.content)
                        return text.length > 150 ? `${text.substring(0, 150)}...` : text
                      })()}
                    </p>

                    {question.categoryName && (
                      <div className="my-question-topics">
                        <span className="tag-pill my-question-topic-tag">
                          {question.categoryName}
                        </span>
                      </div>
                    )}

                    <div className="my-question-stats-actions">
                      <div className="question-stats">
                        <div className="stat-item">
                          <span>👁️</span>
                          <span>{question.viewCount}</span>
                        </div>
                        <div className="stat-item">
                          <span>👍</span>
                          <span>{question.upvoteCount}</span>
                        </div>
                        <div className="stat-item">
                          <span>💬</span>
                          <span>{question.answerCount}개 답변</span>
                        </div>
                        <div className="stat-item">
                          <span className="my-question-time-stat">
                            {getTimeAgo(question.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="my-question-actions">
                        <Link href={`/questions/${question.id}`}>
                          <button className="btn btn-secondary my-question-btn">
                            자세히 보기
                          </button>
                        </Link>
                        <button
                          className="btn btn-secondary my-question-btn-delete"
                          onClick={() => deleteQuestion(question.id)}
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="feed-container my-questions-list">
                {posts.map((post) => (
                  <div key={post.id} className="question-card">
                    <Link href={`/posts/${post.id}`}>
                      <h3 className="question-title my-question-title-link">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="question-content my-question-content-preview">
                      {post.content.length > 150
                        ? `${post.content.substring(0, 150)}...`
                        : post.content}
                    </p>

                    {post.categoryName && (
                      <div className="my-question-topics">
                        <span className="tag-pill my-question-topic-tag">
                          {post.categoryName}
                        </span>
                      </div>
                    )}

                    <div className="my-question-stats-actions">
                      <div className="question-stats">
                        <div className="stat-item">
                          <span>💡</span>
                          <span>{(post.helpfulCount ?? 0)} 도움됨</span>
                        </div>
                        <div className="stat-item">
                          <span className="my-question-time-stat">
                            {getTimeAgo(post.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="my-question-actions">
                        <Link href={`/posts/${post.id}`}>
                          <button className="btn btn-secondary my-question-btn">
                            자세히 보기
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}

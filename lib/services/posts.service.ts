import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server'
import {
  buildViewerContext as buildViewerContextUtil,
  computeExpDecay,
  computeTopicMatches,
  type ViewerContext,
} from '@/lib/services/feed-utils'

type SupabaseClient = any
type SupabaseAnyClient = any

export type PostMetrics = {
  score: number
  breakdown: {
    helpful: number
    comments: number
    recency: number
    updateRecency: number
    following: number
    interest: number
    typeBoost: number
  }
}

export type PostDTO = {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string | null
  post_type: 'community' | 'news'
  helpful_count: number
  comment_count: number
  tags: string[] | null
  author: {
    id: string | null
    name: string | null
    role: string | null
    avatar_url?: string | null
  }
  category: { id: number | null; name?: string | null; slug?: string | null; icon?: string | null } | null
  is_helpful_by_viewer?: boolean
  viewer_can_manage?: boolean
  metrics?: PostMetrics
}

export type PostListParams = {
  sort?: 'popular' | 'recent'
  limit?: number
  offset?: number
  postType?: 'community' | 'news'
  authorId?: string
  category?: string
  following?: boolean
  userId?: string | null
}

const POST_SCORE_WEIGHTS = {
  helpful: 0.7,
  comments: 0.6,
  recency: 1.0,
  updateRecency: 0.4,
  following: 1.2,
  interestPerMatch: 0.6,
  newsBoost: 0.8,
}

export async function listPosts(params: PostListParams) {
  let supabase: SupabaseClient | null = null

  try {
    supabase = await createSupabaseServerClient()
  } catch (error) {
    console.error('[listPosts] Supabase unavailable.', { message: (error as Error)?.message })
    return { items: [], limit: params.limit ?? 20 }
  }

  if (!supabase) {
    console.warn('[listPosts] Supabase client undefined.')
    return { items: [], limit: params.limit ?? 20 }
  }

  let queryClient: SupabaseAnyClient = supabase
  try {
    queryClient = createSupabaseServiceClient()
  } catch (serviceError) {
    console.warn(
      '[listPosts] service client unavailable, using session client instead',
      (serviceError as Error)?.message || serviceError
    )
  }

  const sort = params.sort === 'popular' ? 'popular' : 'recent'
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100)
  const offset = Math.max(params.offset ?? 0, 0)

  let viewerContext: ViewerContext = {
    topicSet: new Set(),
    followingSet: new Set(),
    helpfulQuestionIds: new Set(),
    helpfulPostIds: new Set(),
  }
  let viewerIsAdmin = false
  const viewerId = params.userId ?? null
  if (params.userId) {
    viewerContext = await buildViewerContextUtil(supabase, params.userId)
    try {
      const { data: viewerProfile, error: viewerProfileError } = await supabase
        .from('users')
        .select('role, admin_yn')
        .eq('id', params.userId)
        .maybeSingle()

      if (viewerProfileError) {
        console.warn('[listPosts] failed to load viewer profile', viewerProfileError.message)
      } else {
        const normalizedRole =
          typeof viewerProfile?.role === 'string' ? viewerProfile.role.toLowerCase() : ''
        viewerIsAdmin =
          viewerProfile?.admin_yn === 'Y' || normalizedRole === 'admin'
      }
    } catch (viewerCheckError) {
      console.warn('[listPosts] viewer admin check failed', viewerCheckError)
    }
  }

  let query = queryClient
    .from('posts')
    .select(
      `
        id,
        title,
        content,
        category_id,
        author_id,
        post_type,
        helpful_count,
        comment_count,
        tags,
        is_published,
        created_at,
        updated_at,
        author:users!posts_author_id_fkey (
          id,
          name,
          role,
          avatar_url,
          interests,
          specialty_areas
        ),
        category:categories!posts_category_id_fkey (
          id,
          name,
          slug,
          icon
        )
      `
    )
    .eq('is_published', true)

  if (params.postType) {
    query = query.eq('post_type', params.postType)
  }

  if (params.authorId) {
    query = query.eq('author_id', params.authorId)
  }

  if (params.category) {
    const categoryParam = params.category.trim()
    if (/^\d+$/.test(categoryParam)) {
      query = query.eq('category_id', Number(categoryParam))
    } else {
      const { data: categoryRow, error: categoryError } = await queryClient
        .from('categories')
        .select('id')
        .eq('slug', categoryParam)
        .maybeSingle()

      if (categoryError) {
        console.warn('[listPosts] category lookup failed', {
          category: params.category,
          error: categoryError.message,
        })
        return { items: [], limit }
      }

      if (!categoryRow?.id) {
        console.warn('[listPosts] category not found', { category: params.category })
        return { items: [], limit }
      }

      query = query.eq('category_id', categoryRow.id)
    }
  }

  if (params.following) {
    if (!params.userId) {
      return { items: [], limit }
    }
    const followingIds = Array.from(viewerContext.followingSet)
    if (followingIds.length === 0) {
      return { items: [], limit }
    }
    query = query.in('author_id', followingIds)
  }

  if (sort === 'popular') {
    query = query.order('helpful_count', { ascending: false, nullsLast: true }).order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  let data: unknown
  try {
    const response = await query
    if (response.error) {
      console.error('[listPosts] post query failed', {
        message: response.error.message,
        code: response.error.code,
        details: response.error.details,
        hint: response.error.hint,
      })
      return { items: [], limit }
    }
    data = response.data
  } catch (queryError) {
    const errorMessage = queryError instanceof Error ? queryError.message : String(queryError)
    console.error('[listPosts] post query threw', {
      message: errorMessage,
      error: queryError,
    })
    return { items: [], limit }
  }

  const rawRows: ReadonlyArray<Record<string, unknown>> = Array.isArray(data)
    ? (data as ReadonlyArray<Record<string, unknown>>)
    : []

  const helpfulCountsMap = new Map<string, number>()
  const postIds = rawRows
    .map((row) => (typeof row.id === 'string' ? row.id : null))
    .filter((id): id is string => Boolean(id))

  if (postIds.length > 0) {
    let aggregateClient: SupabaseAnyClient | null = queryClient
    try {
      aggregateClient = createSupabaseServiceClient()
    } catch (serviceError) {
      aggregateClient = supabase
      console.warn(
        '[listPosts] service client unavailable for helpful aggregation',
        (serviceError as Error)?.message
      )
    }

    try {
      const { data: helpfulRows } = await aggregateClient
        .from('votes')
        .select('target_id')
        .in('target_id', postIds)
        .eq('target_type', 'post')
        .eq('vote_type', 'helpful')

      if (Array.isArray(helpfulRows)) {
        helpfulRows.forEach((vote: any) => {
          const targetId = typeof vote?.target_id === 'string' ? vote.target_id : null
          if (!targetId) return
          helpfulCountsMap.set(targetId, (helpfulCountsMap.get(targetId) ?? 0) + 1)
        })
      }
    } catch (aggregationError) {
      console.warn('[listPosts] failed to aggregate helpful votes', aggregationError)
    }
  }

  const items: PostDTO[] = rawRows.map((row) => {
    const author = row.author as Record<string, unknown> | null | undefined
    const category = row.category as Record<string, unknown> | null | undefined
    const rowId =
      typeof row.id === 'string'
        ? (row.id as string)
        : typeof row.id === 'number'
          ? String(row.id)
          : ''

    const aggregatedHelpful = helpfulCountsMap.get(rowId) ?? Number(row.helpful_count ?? 0)

    const metrics = computePostMetrics(
      {
        helpfulCount: aggregatedHelpful,
        commentCount: Number(row.comment_count ?? 0),
        createdAt: typeof row.created_at === 'string' ? (row.created_at as string) : null,
        updatedAt: typeof row.updated_at === 'string' ? (row.updated_at as string) : null,
        postType: (row.post_type ?? 'community') as 'community' | 'news',
        authorId: typeof row.author_id === 'string' ? (row.author_id as string) : null,
        tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
        categorySlug: typeof category?.slug === 'string' ? (category.slug as string) : null,
      },
      viewerContext
    )

    const displayName =
      typeof author?.['name'] === 'string' && (author['name'] as string).length > 0
        ? (author['name'] as string)
        : null

    const authorIdValue =
      typeof author?.['id'] === 'string'
        ? (author['id'] as string)
        : typeof row.author_id === 'string'
          ? (row.author_id as string)
          : null

    const viewerCanManage =
      (viewerId && authorIdValue && viewerId === authorIdValue) || viewerIsAdmin

    return {
      id: rowId,
      title: typeof row.title === 'string' ? (row.title as string) : '',
      content: typeof row.content === 'string' ? (row.content as string) : '',
      created_at: typeof row.created_at === 'string' ? (row.created_at as string) : new Date().toISOString(),
      updated_at: typeof row.updated_at === 'string' ? (row.updated_at as string) : null,
      post_type: (row.post_type ?? 'community') as 'community' | 'news',
      helpful_count: aggregatedHelpful,
      comment_count: Number(row.comment_count ?? 0),
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
        author: {
          id: authorIdValue,
          name: displayName,
          role: typeof author?.['role'] === 'string' ? (author['role'] as string) : null,
          avatar_url:
            typeof author?.['avatar_url'] === 'string' ? (author['avatar_url'] as string) : null,
        },
      category: category
        ? {
            id:
              typeof category.id === 'number'
                ? (category.id as number)
                : typeof row.category_id === 'number'
                  ? (row.category_id as number)
                  : null,
            name: typeof category.name === 'string' ? (category.name as string) : null,
            slug: typeof category.slug === 'string' ? (category.slug as string) : null,
            icon: typeof category.icon === 'string' ? (category.icon as string) : null,
          }
        : null,
      metrics,
      is_helpful_by_viewer: rowId ? viewerContext.helpfulPostIds.has(rowId) : false,
      viewer_can_manage: viewerCanManage,
    }
  })

  let sortedItems = items
  if (sort === 'popular') {
    sortedItems = [...items].sort((a, b) => {
      const aScore = a.metrics?.score ?? 0
      const bScore = b.metrics?.score ?? 0
      if (bScore !== aScore) return bScore - aScore
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  } else {
    sortedItems = [...items].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  return { items: sortedItems, limit }
}

function computePostMetrics(
  input: {
    helpfulCount: number
    commentCount: number
    createdAt: string | null
    updatedAt: string | null
    postType: 'community' | 'news'
    authorId: string | null
    tags: string[] | null
    categorySlug: string | null
  },
  viewerContext: ViewerContext
): PostMetrics {
  const helpfulScore = POST_SCORE_WEIGHTS.helpful * Math.log1p(Math.max(0, input.helpfulCount))
  const commentsScore = POST_SCORE_WEIGHTS.comments * Math.log1p(Math.max(0, input.commentCount))
  const recencyScore = POST_SCORE_WEIGHTS.recency * computeExpDecay(input.createdAt, 4)
  const updateRecencyScore = POST_SCORE_WEIGHTS.updateRecency * computeExpDecay(input.updatedAt, 3)

  let followingScore = 0
  let interestScore = 0

  if (input.authorId && viewerContext.followingSet.has(input.authorId)) {
    followingScore = POST_SCORE_WEIGHTS.following
  }

  const topicMatches = computeTopicMatches(
    input.tags,
    input.categorySlug,
    viewerContext.topicSet
  )
  interestScore = POST_SCORE_WEIGHTS.interestPerMatch * topicMatches

  const typeBoost = input.postType === 'news' ? POST_SCORE_WEIGHTS.newsBoost : 0

  const total =
    helpfulScore +
    commentsScore +
    recencyScore +
    updateRecencyScore +
    followingScore +
    interestScore +
    typeBoost

  return {
    score: Number(total.toFixed(4)),
    breakdown: {
      helpful: Number(helpfulScore.toFixed(4)),
      comments: Number(commentsScore.toFixed(4)),
      recency: Number(recencyScore.toFixed(4)),
      updateRecency: Number(updateRecencyScore.toFixed(4)),
      following: Number(followingScore.toFixed(4)),
      interest: Number(interestScore.toFixed(4)),
      typeBoost: Number(typeBoost.toFixed(4)),
    },
  }
}

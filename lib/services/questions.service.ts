import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server'
import {
  buildViewerContext as buildViewerContextUtil,
  computeExpDecay,
  computeTopicMatches,
  getDiffInDays,
  type ViewerContext,
} from '@/lib/services/feed-utils'

type SupabaseClient = any
type SupabaseAnyClient = any

const NOT_FOUND_ERROR_CODES = new Set(['PGRST116', '22P02', '42501'])

const isNotFoundSupabaseError = (error: any): boolean => {
  if (!error) return false
  const code = typeof error.code === 'string' ? error.code : ''
  const message = String(error.message ?? '')

  return (
    NOT_FOUND_ERROR_CODES.has(code) ||
    /invalid input syntax for type uuid/i.test(message) ||
    /no rows returned/i.test(message) ||
    /permission denied/i.test(message)
  )
}

export type QuestionMetrics = {
  score: number
  breakdown: {
    views: number
    answers: number
    accepted: number
    helpful: number
    recentAnswers: number
    recency: number
    activity: number
    following: number
    interest: number
  }
  recent_answer_count: number
  accepted_answer_count: number
}

export type QuestionDTO = {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string | null
    role: string | null
    avatar_url?: string | null
  }
  category: { id: number; slug?: string | null; name?: string | null; icon?: string | null }
  upvote_count: number
  answer_count: number
  created_at: string
  view_count?: number
  last_activity_at?: string | null
  tags?: string[] | null
  helpful_count?: number
  is_helpful_by_viewer?: boolean
  metrics?: QuestionMetrics
}

export type AnswerDTO = {
  id: string
  content: string
  created_at: string
  updated_at: string | null
  helpful_count: number
  upvote_count: number
  downvote_count: number
  is_accepted: boolean
  comment_count?: number
  author: {
    id: string
    name: string | null
    role: string | null
    avatar_url?: string | null
  }
}

export type ListParams = {
  sort?: 'popular' | 'recent'
  category?: string
  following?: boolean
  limit?: number
  offset?: number
  userId?: string | null
  authorId?: string
}

type AnswerSummary = {
  id: string
  is_accepted: boolean | null
  helpful_count: number | null
  created_at: string | null
}

type PaginationConfig = {
  sort: 'popular' | 'recent'
  limit: number
  offset: number
  page: number
  recentWindowDays: number
}

const SCORE_WEIGHTS = {
  views: 0.35,
  answers: 0.45,
  accepted: 1.2,
  helpful: 0.3,
  recentAnswers: 0.6,
  recency: 1.0,
  activity: 0.5,
  following: 1.5,
  interestPerMatch: 0.6,
}

export async function listQuestions(params: ListParams) {
  let supabase: SupabaseClient | null = null

  try {
    supabase = await createSupabaseServerClient()
  } catch (error) {
    console.error('[listQuestions] Supabase unavailable.', { message: (error as Error)?.message })
    return {
      items: [],
      page: 1,
      limit: params.limit ?? 20,
      total: 0,
    }
  }

  if (!supabase) {
    console.warn('[listQuestions] Supabase client undefined.')
    return {
      items: [],
      page: 1,
      limit: params.limit ?? 20,
      total: 0,
    }
  }

  let queryClient: SupabaseAnyClient = supabase
  try {
    queryClient = createSupabaseServiceClient()
  } catch (serviceError) {
    console.warn(
      '[listQuestions] service client unavailable, using session client instead',
      (serviceError as Error)?.message || serviceError
    )
  }

  const sort = params.sort === 'recent' ? 'recent' : 'popular'
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 50)
  const offset = Math.max(params.offset ?? 0, 0)
  const page = Math.floor(offset / limit) + 1
  const recentWindowDays = 7

  let viewerContext: ViewerContext = {
    topicSet: new Set(),
    followingSet: new Set(),
    helpfulQuestionIds: new Set(),
    helpfulPostIds: new Set(),
  }
  if (params.userId) {
    viewerContext = await buildViewerContextUtil(supabase, params.userId)
  }

  const pagination: PaginationConfig = { sort, limit, offset, page, recentWindowDays }

  const viewResult = await fetchQuestionsFromView(queryClient, params, viewerContext, pagination)
  if (viewResult.success) {
    return viewResult.payload
  }

  console.warn('[listQuestions] falling back to legacy query', viewResult.error)
  return fetchQuestionsLegacy(queryClient, params, viewerContext, pagination)
}

type ViewQuerySuccess = {
  success: true
  payload: { items: QuestionDTO[]; page: number; limit: number; total: number }
}

type ViewQueryFailure = { success: false; error: unknown }
type ViewQueryResult = ViewQuerySuccess | ViewQueryFailure

async function fetchQuestionsFromView(
  supabase: SupabaseAnyClient,
  params: ListParams,
  viewerContext: ViewerContext,
  pagination: PaginationConfig
): Promise<ViewQueryResult> {
  const { sort, limit, offset, page } = pagination

  try {
    let query = supabase
      .from('question_feed_metrics')
      .select(
        `
          question_id,
          title,
          content,
          author_id,
          category_id,
          tags,
          status,
          is_approved,
          view_count,
          total_answers,
          accepted_answers,
          recent_answer_count,
          helpful_votes,
          upvote_count,
          downvote_count,
          created_at,
          updated_at,
          last_activity_at,
          activity_timestamp,
          author,
          category,
          views_score,
          answers_score,
          accepted_score,
          helpful_score,
          recent_answers_score,
          recency_score,
          activity_score,
          base_score
        `,
        { count: 'exact' }
      )

    if (params.category) {
      const cat = params.category
      if (/^\d+$/.test(cat)) {
        query = query.eq('category_id', Number(cat))
      } else {
        query = query.eq('category->>slug', cat)
      }
    }

    if (params.following && params.userId) {
      const followingIds = Array.from(viewerContext.followingSet)
      if (followingIds.length === 0) {
        return { success: true, payload: { items: [], page, limit, total: 0 } }
      }
      query = query.in('author_id', followingIds)
    }

    if (params.authorId) {
      query = query.eq('author_id', params.authorId)
    }

    if (sort === 'popular') {
      query = query
        .order('base_score', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false, nullsFirst: false })
    } else {
      query = query
        .order('created_at', { ascending: false, nullsFirst: false })
        .order('base_score', { ascending: false, nullsFirst: false })
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      return { success: false, error }
    }

    const rows = Array.isArray(data) ? (data as ReadonlyArray<Record<string, unknown>>) : []

    const items: QuestionDTO[] = rows.map(row => {
      const rowId = typeof row.question_id === 'string' ? row.question_id : ''
      const tags = Array.isArray(row.tags) ? (row.tags as string[]) : []
      const authorId = typeof row.author_id === 'string' ? row.author_id : null
      const authorRaw = parseJsonObject<{
        id?: string | null
        name?: string | null
        role?: string | null
        avatar_url?: string | null
      }>(row.author)
      const categoryRaw = parseJsonObject<{
        id?: number | null
        name?: string | null
        slug?: string | null
        icon?: string | null
      }>(row.category)

      const metrics = buildMetricsFromViewRow(
        row,
        viewerContext,
        typeof categoryRaw?.slug === 'string' ? categoryRaw.slug : null,
        tags,
        authorId
      )

      return {
        id: rowId,
        title: typeof row.title === 'string' ? row.title : '',
        content: typeof row.content === 'string' ? row.content : '',
        author: {
          id: authorRaw?.id ?? authorId ?? '',
          name:
            typeof authorRaw?.name === 'string' && authorRaw.name.length > 0
              ? authorRaw.name
              : null,
          role: authorRaw?.role ?? null,
          avatar_url: authorRaw?.avatar_url ?? null,
        },
        category: {
          id:
            typeof categoryRaw?.id === 'number'
              ? categoryRaw.id
              : typeof row.category_id === 'number'
                ? row.category_id
                : 0,
          name: typeof categoryRaw?.name === 'string' ? categoryRaw.name : null,
          slug: typeof categoryRaw?.slug === 'string' ? categoryRaw.slug : null,
          icon: typeof categoryRaw?.icon === 'string' ? categoryRaw.icon : null,
        },
        upvote_count: Number(toNumber(row.upvote_count)),
        answer_count: Number(toNumber(row.total_answers ?? row.answer_count)),
        created_at: typeof row.created_at === 'string' ? row.created_at : new Date().toISOString(),
        view_count: Number(toNumber(row.view_count)),
        last_activity_at:
          typeof row.last_activity_at === 'string' ? row.last_activity_at : null,
        tags,
        helpful_count: Number(toNumber(row.helpful_votes)),
        metrics,
        is_helpful_by_viewer: viewerContext.helpfulQuestionIds.has(rowId),
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

    return {
      success: true,
      payload: {
        items: sortedItems,
        page,
        limit,
        total: typeof count === 'number' ? count : sortedItems.length,
      },
    }
  } catch (error) {
    return { success: false, error }
  }
}

async function fetchQuestionsLegacy(
  supabase: SupabaseAnyClient,
  params: ListParams,
  viewerContext: ViewerContext,
  pagination: PaginationConfig
) {
  const { sort, limit, offset, page, recentWindowDays } = pagination

  let query = supabase
    .from('questions')
    .select(
      `
        id,
        title,
        content,
        author_id,
        category_id,
        tags,
        status,
        is_approved,
        view_count,
        answer_count,
        helpful_count,
        upvote_count,
        downvote_count,
        created_at,
        updated_at,
        last_activity_at,
        author:users!questions_author_id_fkey (
          id,
          name,
          role,
          avatar_url,
          interests,
          specialty_areas
        ),
        category:categories!questions_category_id_fkey (
          id,
          name,
          slug,
          icon
        ),
        answers:answers (
          id,
          is_accepted,
          helpful_count,
          created_at
        )
      `,
      { count: 'exact' }
    )
    .eq('is_approved', true)

  if (params.category) {
    const cat = params.category
    if (/^\d+$/.test(cat)) {
      query = query.eq('category_id', Number(cat))
    } else {
      const { data: categoryRow, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', cat)
        .maybeSingle()

      if (catError) {
        console.warn('[listQuestions][legacy] category lookup failed', {
          slug: cat,
          error: catError.message,
        })
        return { items: [], page, limit, total: 0 }
      }

      if (!categoryRow?.id) {
        console.warn('[listQuestions][legacy] category slug not found', { slug: cat })
        return { items: [], page, limit, total: 0 }
      }

      query = query.eq('category_id', categoryRow.id)
    }
  }

  if (params.following && params.userId) {
    const followingIds = Array.from(viewerContext.followingSet)
    if (followingIds.length === 0) {
      return { items: [], page, limit, total: 0 }
    }
    query = query.in('author_id', followingIds)
  }

  if (params.authorId) {
    query = query.eq('author_id', params.authorId)
  }

  if (sort === 'popular') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)
  if (error) {
    if (isNotFoundSupabaseError(error)) {
      return { items: [], page, limit, total: 0 }
    }
    throw error
  }

  const rawRows = Array.isArray(data) ? (data as ReadonlyArray<Record<string, unknown>>) : []
  const helpfulCountsMap = new Map<string, number>()
  const questionIds = rawRows
    .map(row => (typeof row.id === 'string' ? row.id : null))
    .filter((id): id is string => Boolean(id))

  if (questionIds.length > 0) {
    let aggregateClient: SupabaseAnyClient | null = supabase
    try {
      aggregateClient = createSupabaseServiceClient()
    } catch (serviceError) {
      aggregateClient = supabase
      console.warn(
        '[listQuestions][legacy] service client unavailable for helpful aggregation',
        (serviceError as Error)?.message
      )
    }

    try {
      const { data: helpfulRows } = await aggregateClient
        .from('votes')
        .select('target_id')
        .in('target_id', questionIds)
        .eq('target_type', 'question')
        .eq('vote_type', 'helpful')

      if (Array.isArray(helpfulRows)) {
        helpfulRows.forEach(row => {
          const targetId = typeof row?.target_id === 'string' ? row.target_id : null
          if (!targetId) return
          const current = helpfulCountsMap.get(targetId) ?? 0
          helpfulCountsMap.set(targetId, current + 1)
        })
      }
    } catch (aggregationError) {
      console.warn('[listQuestions][legacy] failed to aggregate helpful votes', aggregationError)
    }
  }

  const items: QuestionDTO[] = rawRows.map(row => {
    const answerRowsRaw = Array.isArray(row.answers)
      ? (row.answers as ReadonlyArray<Record<string, unknown>>)
      : []
    const answerRows: AnswerSummary[] = answerRowsRaw.map(answer => ({
      id: typeof answer.id === 'string' ? answer.id : '',
      is_accepted:
        typeof answer.is_accepted === 'boolean' ? answer.is_accepted : Boolean(answer.is_accepted),
      helpful_count:
        typeof answer.helpful_count === 'number'
          ? answer.helpful_count
          : Number(answer.helpful_count ?? 0),
      created_at:
        typeof answer.created_at === 'string' ? answer.created_at : new Date().toISOString(),
    }))
    const categoryRaw = (row.category as Record<string, unknown> | null) ?? null
    const authorRaw = (row.author as Record<string, unknown> | null) ?? null
    const rowId = typeof row.id === 'string' ? row.id : ''
    const aggregatedHelpful = helpfulCountsMap.get(rowId) ?? Number(row.helpful_count ?? 0)

    const metrics = computeQuestionMetrics(
      {
        viewCount: Number(row.view_count ?? 0),
        answerCount: Number(row.answer_count ?? 0),
        helpfulCount: aggregatedHelpful,
        createdAt: typeof row.created_at === 'string' ? row.created_at : null,
        lastActivityAt: typeof row.last_activity_at === 'string' ? row.last_activity_at : null,
        authorId: typeof row.author_id === 'string' ? row.author_id : null,
        tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
        categorySlug: typeof categoryRaw?.slug === 'string' ? (categoryRaw.slug as string) : null,
      },
      answerRows,
      viewerContext,
      recentWindowDays
    )

    return {
      id: rowId,
      title: typeof row.title === 'string' ? row.title : '',
      content: typeof row.content === 'string' ? row.content : '',
      author: {
        id:
          typeof authorRaw?.id === 'string'
            ? (authorRaw.id as string)
            : typeof row.author_id === 'string'
              ? row.author_id
              : '',
        name: typeof authorRaw?.name === 'string' ? (authorRaw.name as string) : null,
        role: typeof authorRaw?.role === 'string' ? (authorRaw.role as string) : null,
        avatar_url:
          typeof authorRaw?.avatar_url === 'string' ? (authorRaw.avatar_url as string) : null,
      },
      category: {
        id:
          typeof categoryRaw?.id === 'number'
            ? (categoryRaw.id as number)
            : typeof row.category_id === 'number'
              ? row.category_id
              : 0,
        name: typeof categoryRaw?.name === 'string' ? (categoryRaw.name as string) : null,
        slug: typeof categoryRaw?.slug === 'string' ? (categoryRaw.slug as string) : null,
        icon: typeof categoryRaw?.icon === 'string' ? (categoryRaw.icon as string) : null,
      },
      upvote_count: Number(row.upvote_count ?? 0),
      answer_count: Number(row.answer_count ?? 0),
      created_at: typeof row.created_at === 'string' ? row.created_at : new Date().toISOString(),
      view_count: Number(row.view_count ?? 0),
      last_activity_at: typeof row.last_activity_at === 'string' ? row.last_activity_at : null,
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
      helpful_count: aggregatedHelpful,
      metrics,
      is_helpful_by_viewer: viewerContext.helpfulQuestionIds.has(rowId),
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

  return {
    items: sortedItems,
    page,
    limit,
    total: typeof count === 'number' ? count : items.length,
  }
}

function parseJsonObject<T extends Record<string, unknown>>(value: unknown): T | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
  if (typeof value === 'object') {
    return value as T
  }
  return null
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }
  return 0
}

function formatScore(value: unknown): number {
  const num = toNumber(value)
  if (!Number.isFinite(num)) return 0
  return Number(num.toFixed(4))
}

function buildMetricsFromViewRow(
  row: Record<string, unknown>,
  viewerContext: ViewerContext,
  categorySlug: string | null,
  tags: string[],
  authorId: string | null
): QuestionMetrics {
  const breakdownBase = {
    views: formatScore(row.views_score),
    answers: formatScore(row.answers_score),
    accepted: formatScore(row.accepted_score),
    helpful: formatScore(row.helpful_score),
    recentAnswers: formatScore(row.recent_answers_score),
    recency: formatScore(row.recency_score),
    activity: formatScore(row.activity_score),
  }

  let followingScore = 0
  if (authorId && viewerContext.followingSet.has(authorId)) {
    followingScore = Number(SCORE_WEIGHTS.following.toFixed(4))
  }

  const topicMatches = computeTopicMatches(tags, categorySlug, viewerContext.topicSet)
  const interestScoreRaw = SCORE_WEIGHTS.interestPerMatch * topicMatches
  const interestScore = Number(interestScoreRaw.toFixed(4))

  const baseScore = formatScore(row.base_score)
  const totalScore = Number((baseScore + followingScore + interestScore).toFixed(4))

  return {
    score: totalScore,
    breakdown: {
      ...breakdownBase,
      following: followingScore,
      interest: interestScore,
    },
    recent_answer_count: Number(toNumber(row.recent_answer_count)),
    accepted_answer_count: Number(toNumber(row.accepted_answers)),
  }
}

export async function getQuestionById(id: string, viewerId?: string | null) {
  let serviceClient: SupabaseAnyClient
  try {
    serviceClient = createSupabaseServiceClient()
  } catch (error) {
    console.warn('[getQuestionById] service client unavailable, falling back to session client', (error as Error)?.message || error)
    serviceClient = await createSupabaseServerClient()
  }

  const { data: questionRow, error } = await serviceClient
    .from('questions')
    .select(
      `
        id,
        title,
        content,
        author_id,
        category_id,
        tags,
        status,
        created_at,
        updated_at,
        upvote_count,
        answer_count,
        view_count,
        helpful_count,
        last_activity_at,
        author:users!questions_author_id_fkey (id, name, role, avatar_url),
        category:categories!questions_category_id_fkey (id, name, slug, icon)
      `
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    const message = String(error.message ?? '')
    const normalizedCode = typeof error.code === 'string' ? error.code : ''
    const notFound =
      normalizedCode === 'PGRST116' ||
      normalizedCode === '22P02' ||
      /invalid input syntax for type uuid/i.test(message) ||
      /no rows returned/i.test(message)

    if (notFound) {
      throw Object.assign(new Error('Question not found'), { code: 'NOT_FOUND' })
    }

    throw error
  }
  if (!questionRow) throw Object.assign(new Error('Question not found'), { code: 'NOT_FOUND' })

  const dto: QuestionDTO = {
    id: questionRow.id,
    title: questionRow.title,
    content: questionRow.content,
    author: {
      id: questionRow.author?.id ?? questionRow.author_id,
      name:
        typeof questionRow.author?.name === 'string' && questionRow.author.name.length > 0
          ? questionRow.author.name
          : null,
      role: questionRow.author?.role ?? null,
      avatar_url: questionRow.author?.avatar_url ?? null,
    },
    category: {
      id: questionRow.category?.id ?? questionRow.category_id,
      name: questionRow.category?.name ?? null,
      slug: questionRow.category?.slug ?? null,
      icon: questionRow.category?.icon ?? null,
    },
    upvote_count: questionRow.upvote_count || 0,
    answer_count: questionRow.answer_count || 0,
    created_at: questionRow.created_at,
    view_count: questionRow.view_count || 0,
    last_activity_at: questionRow.last_activity_at ?? null,
    tags: Array.isArray(questionRow.tags) ? questionRow.tags : [],
    helpful_count: questionRow.helpful_count ?? 0,
  }

  const { data: answersRows, error: answersError } = await serviceClient
    .from('answers')
    .select(
      `
        id,
        content,
        created_at,
        updated_at,
        helpful_count,
        upvote_count,
        downvote_count,
        is_accepted,
        author:users!answers_author_id_fkey (id, name, role, avatar_url)
      `
    )
    .eq('question_id', id)
    .order('is_accepted', { ascending: false })
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: true })

  if (answersError) {
    if (isNotFoundSupabaseError(answersError)) {
      return { question: dto, answers: [] }
    }
    throw answersError
  }

  const rawAnswers: ReadonlyArray<Record<string, unknown>> = Array.isArray(answersRows)
    ? (answersRows as ReadonlyArray<Record<string, unknown>>)
    : []

  const answerIds = rawAnswers
    .map((answerRow) => {
      const idValue = answerRow.id
      if (typeof idValue === 'string' && idValue.length > 0) return idValue
      if (typeof idValue === 'number') return String(idValue)
      if (typeof answerRow['id'] === 'string') return answerRow['id'] as string
      return null
    })
    .filter((id): id is string => Boolean(id))

  const commentCountByAnswer = new Map<string, number>()

  if (answerIds.length > 0) {
    try {
      const { data: commentRows, error: commentError } = await serviceClient
        .from('comments')
        .select('target_id')
        .in('target_id', answerIds)
        .eq('target_type', 'answer')

      if (commentError) {
        console.warn('[getQuestionById] failed to load answer comment counts', commentError)
      } else if (Array.isArray(commentRows)) {
        commentRows.forEach((row: Record<string, unknown>) => {
          const targetId = typeof row.target_id === 'string' ? row.target_id : null
          if (!targetId) return
          commentCountByAnswer.set(targetId, (commentCountByAnswer.get(targetId) ?? 0) + 1)
        })
      }
    } catch (commentAggregateError) {
      console.warn('[getQuestionById] failed to aggregate answer comment counts', commentAggregateError)
    }
  }

  const answers: AnswerDTO[] = rawAnswers.map((answerRow) => {
    const authorData = (answerRow.author as Record<string, unknown> | null) || null
    const authorId = typeof authorData?.['id'] === 'string'
      ? (authorData['id'] as string)
      : typeof answerRow.author_id === 'string'
        ? (answerRow.author_id as string)
        : ''
    const displayName =
      typeof authorData?.['name'] === 'string' && (authorData['name'] as string).length > 0
        ? (authorData['name'] as string)
        : null

    const answerId = typeof answerRow.id === 'string' ? answerRow.id : String(answerRow.id ?? '')

    return {
      id: answerId,
      content: typeof answerRow.content === 'string' ? answerRow.content : '',
      created_at:
        typeof answerRow.created_at === 'string'
          ? answerRow.created_at
          : new Date().toISOString(),
      updated_at: typeof answerRow.updated_at === 'string' ? answerRow.updated_at : null,
      helpful_count: Number(answerRow.helpful_count ?? 0),
      upvote_count: Number(answerRow.upvote_count ?? 0),
      downvote_count: Number(answerRow.downvote_count ?? 0),
      is_accepted: Boolean(answerRow.is_accepted),
      comment_count: commentCountByAnswer.get(answerId) ?? 0,
      author: {
        id: authorId,
        name: displayName,
        role:
          typeof authorData?.['role'] === 'string' ? (authorData['role'] as string) : null,
        avatar_url:
          typeof authorData?.['avatar_url'] === 'string'
            ? (authorData['avatar_url'] as string)
            : null,
      },
    }
  })

  dto.answer_count = answers.length

  try {
    const { count: helpfulCount } = await serviceClient
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('target_id', id)
      .eq('target_type', 'question')
      .eq('vote_type', 'helpful')

    if (typeof helpfulCount === 'number') {
      dto.helpful_count = helpfulCount
    }
  } catch (aggregateError) {
    console.warn('[questions.service] failed to recalc helpful count', aggregateError)
  }

  if (viewerId) {
    try {
      const { data: voteRow } = await serviceClient
        .from('votes')
        .select('id')
        .eq('user_id', viewerId)
        .eq('target_id', id)
        .eq('target_type', 'question')
        .eq('vote_type', 'helpful')
        .maybeSingle()
      dto.is_helpful_by_viewer = Boolean(voteRow)
    } catch (viewerError) {
      console.warn('[questions.service] failed to resolve viewer helpful state', viewerError)
      dto.is_helpful_by_viewer = false
    }
  }

  return { question: dto, answers }
}
function computeQuestionMetrics(
  input: {
    viewCount: number
    answerCount: number
    helpfulCount: number
    createdAt: string | null
    lastActivityAt: string | null
    authorId: string | null
    tags: string[] | null
    categorySlug: string | null
  },
  answers: AnswerSummary[],
  viewerContext?: ViewerContext,
  recentWindowDays = 7
): QuestionMetrics {
  const acceptedAnswerCount = answers.filter(answer => !!answer.is_accepted).length
  const recentAnswerCount = answers.filter(answer => {
    if (!answer.created_at) return false
    return getDiffInDays(answer.created_at) <= recentWindowDays
  }).length

  const viewsScore = SCORE_WEIGHTS.views * Math.log1p(Math.max(0, input.viewCount))
  const answersScore = SCORE_WEIGHTS.answers * Math.log1p(Math.max(0, input.answerCount))
  const acceptedScore = SCORE_WEIGHTS.accepted * acceptedAnswerCount
  const helpfulScore = SCORE_WEIGHTS.helpful * Math.log1p(Math.max(0, input.helpfulCount))
  const recentAnswersScore = SCORE_WEIGHTS.recentAnswers * recentAnswerCount
  const recencyScore = SCORE_WEIGHTS.recency * computeExpDecay(input.createdAt, 5)
  const activityScore = SCORE_WEIGHTS.activity * computeExpDecay(input.lastActivityAt, 3)

  let followingScore = 0
  let interestScore = 0

  if (viewerContext) {
    if (input.authorId && viewerContext.followingSet.has(input.authorId)) {
      followingScore = SCORE_WEIGHTS.following
    }

    const topicMatches = computeTopicMatches(input.tags, input.categorySlug, viewerContext.topicSet)
    interestScore = SCORE_WEIGHTS.interestPerMatch * topicMatches
  }

  const total =
    viewsScore +
    answersScore +
    acceptedScore +
    helpfulScore +
    recentAnswersScore +
    recencyScore +
    activityScore +
    followingScore +
    interestScore

  return {
    score: Number(total.toFixed(4)),
    breakdown: {
      views: Number(viewsScore.toFixed(4)),
      answers: Number(answersScore.toFixed(4)),
      accepted: Number(acceptedScore.toFixed(4)),
      helpful: Number(helpfulScore.toFixed(4)),
      recentAnswers: Number(recentAnswersScore.toFixed(4)),
      recency: Number(recencyScore.toFixed(4)),
      activity: Number(activityScore.toFixed(4)),
      following: Number(followingScore.toFixed(4)),
      interest: Number(interestScore.toFixed(4)),
    },
    recent_answer_count: recentAnswerCount,
    accepted_answer_count: acceptedAnswerCount,
  }
}

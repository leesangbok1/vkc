// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import {
  createSupabaseServiceClient,
  createSupabaseServerClient
} from '@/lib/supabase-server'
import {
  REPORT_REASON_LABEL_MAP,
  REPORT_STATUSES,
  ReportStatus,
  ReportTargetType,
  isReportStatus,
  isReportTargetType
} from '@/lib/constants/reports'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'
import { PostgrestError } from '@supabase/supabase-js'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200
const EXCERPT_LENGTH = 180

type ContentReportRow = Database['public']['Tables']['content_reports']['Row'] & {
  reporter?: {
    id: string
    name: string | null
    email: string
    role: string | null
  } | null
}

type UserRow = Database['public']['Tables']['users']['Row']
type AdminCheckRow = Pick<UserRow, 'role' | 'admin_yn' | 'badges'>
type AdminReportUser = Pick<UserRow, 'id' | 'name' | 'email' | 'role'>
type SupabaseDbClient = SupabaseClient<Database>
type UsersTable = Database['public']['Tables']['users']
type ContentReportsTable = Database['public']['Tables']['content_reports']
type QuestionsTable = Database['public']['Tables']['questions']
type PostsTable = Database['public']['Tables']['posts']
type AnswersTable = Database['public']['Tables']['answers']
type CommentsTable = Database['public']['Tables']['comments']
type QuestionSummary = Pick<
  Database['public']['Tables']['questions']['Row'],
  'id' | 'title' | 'content' | 'status' | 'is_reported' | 'is_approved' | 'created_at'
>
type PostSummary = Pick<
  Database['public']['Tables']['posts']['Row'],
  'id' | 'title' | 'content' | 'post_type' | 'is_reported' | 'is_published' | 'created_at'
>
type AnswerSummary = Pick<
  Database['public']['Tables']['answers']['Row'],
  'id' | 'content' | 'question_id' | 'is_reported' | 'is_approved' | 'created_at'
>
type CommentSummary = Pick<
  Database['public']['Tables']['comments']['Row'],
  'id' | 'content' | 'target_id' | 'target_type' | 'is_approved' | 'created_at'
>

type QueryResult<T> = {
  data: T[] | null
  error: PostgrestError | null
}

const emptyResult = <T>(): QueryResult<T> => ({
  data: [],
  error: null
})

const toPositiveInt = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, MAX_LIMIT)
}

const normalizeWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim()

const stripFormatting = (text: string) =>
  text
    .replace(/`[^`]*`/g, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__|_([^_]+)_/g, '$1$2')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\(([^)]*)\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')

const buildExcerpt = (text: string | null | undefined, limit = EXCERPT_LENGTH) => {
  if (!text) return ''
  const cleaned = normalizeWhitespace(stripFormatting(text))
  if (cleaned.length <= limit) return cleaned
  return `${cleaned.slice(0, limit)}...`
}

const hasModeratorRights = (profile?: Pick<UserRow, 'role' | 'admin_yn' | 'badges'> | null) => {
  if (!profile) return false
  const role = (profile.role ?? '').toLowerCase()
  if (profile.admin_yn === 'Y' || role === 'admin') return true
  const badges = (profile.badges ?? {}) as Record<string, boolean>
  return Boolean(badges.moderator || badges.admin)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = (await createSupabaseServerClient()) as SupabaseDbClient
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id, role, admin_yn, badges')
      .eq('id', user.id)
      .maybeSingle()

    if (!hasModeratorRights(profile)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const serviceClient: SupabaseDbClient = createSupabaseServiceClient()

    const url = new URL(request.url)
    const limit = toPositiveInt(url.searchParams.get('limit'), DEFAULT_LIMIT)
    const statusParam = url.searchParams.get('status')
    const targetParam = url.searchParams.get('targetType')
    const sinceParam = url.searchParams.get('since')

    const filters: {
      status?: ReportStatus
      target?: ReportTargetType
      since?: string | null
    } = {}

    if (statusParam && isReportStatus(statusParam)) {
      filters.status = statusParam
    }
    if (targetParam && isReportTargetType(targetParam)) {
      filters.target = targetParam
    }
    if (sinceParam && !Number.isNaN(Date.parse(sinceParam))) {
      filters.since = new Date(sinceParam).toISOString()
    } else {
      filters.since = null
    }

    const reportQuery = serviceClient
      .from('content_reports')
      .select(
        `
        id,
        target_id,
        target_type,
        reporter_id,
        reason,
        description,
        status,
        metadata,
        created_at,
        updated_at,
        reviewed_at,
        reviewed_by,
        reporter:users!content_reports_reporter_id_fkey(
          id,
          name,
          email,
          role
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    const countQuery = serviceClient
      .from('content_reports')
      .select('id', { count: 'exact', head: true })

    let filteredReportQuery = reportQuery
    let filteredCountQuery = countQuery

    if (filters.status) {
      filteredReportQuery = filteredReportQuery.eq('status', filters.status)
      filteredCountQuery = filteredCountQuery.eq('status', filters.status)
    }
    if (filters.target) {
      filteredReportQuery = filteredReportQuery.eq('target_type', filters.target)
      filteredCountQuery = filteredCountQuery.eq('target_type', filters.target)
    }
    if (filters.since) {
      filteredReportQuery = filteredReportQuery.gte('created_at', filters.since)
      filteredCountQuery = filteredCountQuery.gte('created_at', filters.since)
    }

    const [{ data: reportRows, error: reportsError }, { count, error: countError }] = await Promise.all([
      filteredReportQuery,
      filteredCountQuery
    ])

    if (reportsError) {
      throw reportsError
    }
    if (countError) {
      throw countError
    }

    const reports = (reportRows ?? []) as ContentReportRow[]

    const questionIds = new Set<string>()
    const postIds = new Set<string>()
    const answerIds = new Set<string>()
    const commentIds = new Set<string>()
    const reviewerIds = new Set<string>()

    reports.forEach((report) => {
      const type = report.target_type as ReportTargetType
      if (type === 'question') questionIds.add(report.target_id)
      if (type === 'post') postIds.add(report.target_id)
      if (type === 'answer') answerIds.add(report.target_id)
      if (type === 'comment') commentIds.add(report.target_id)
      if (report.reviewed_by) reviewerIds.add(report.reviewed_by)
    })

    const [
      questionsResult,
      postsResult,
      answersResult,
      commentsResult,
      reviewersResult
    ] = await Promise.all([
      questionIds.size
        ? serviceClient
            .from('questions')
            .select('id, title, content, status, is_reported, is_approved, created_at')
            .in('id', Array.from(questionIds))
            .then(({ data, error }) => ({ data: data as QuestionSummary[] | null, error }))
        : Promise.resolve(emptyResult<QuestionSummary>()),
      postIds.size
        ? serviceClient
            .from('posts')
            .select('id, title, content, post_type, is_reported, is_published, created_at')
            .in('id', Array.from(postIds))
            .then(({ data, error }) => ({ data: data as PostSummary[] | null, error }))
        : Promise.resolve(emptyResult<PostSummary>()),
      answerIds.size
        ? serviceClient
            .from('answers')
            .select('id, content, question_id, is_reported, is_approved, created_at')
            .in('id', Array.from(answerIds))
            .then(({ data, error }) => ({ data: data as AnswerSummary[] | null, error }))
        : Promise.resolve(emptyResult<AnswerSummary>()),
      commentIds.size
        ? serviceClient
            .from('comments')
            .select('id, content, target_id, target_type, is_approved, created_at')
            .in('id', Array.from(commentIds))
            .then(({ data, error }) => ({ data: data as CommentSummary[] | null, error }))
        : Promise.resolve(emptyResult<CommentSummary>()),
      reviewerIds.size
        ? serviceClient
            .from('users')
            .select('id, name, email, role')
            .in('id', Array.from(reviewerIds))
            .then(({ data, error }) => ({ data: data as AdminReportUser[] | null, error }))
        : Promise.resolve(emptyResult<AdminReportUser>())
    ])

    ;[
      { label: 'questions', error: questionsResult.error },
      { label: 'posts', error: postsResult.error },
      { label: 'answers', error: answersResult.error },
      { label: 'comments', error: commentsResult.error },
      { label: 'users', error: reviewersResult.error }
    ].forEach(({ label, error }) => {
      if (error && error.code !== 'PGRST116') {
        console.warn(`[AdminReports] ${label} fetch failed`, error)
      }
    })

    const questionMap = new Map<string, QuestionSummary>(
      (questionsResult.data ?? []).map((item) => [item.id, item])
    )
    const postMap = new Map<string, PostSummary>(
      (postsResult.data ?? []).map((item) => [item.id, item])
    )
    const answerMap = new Map<string, AnswerSummary>(
      (answersResult.data ?? []).map((item) => [item.id, item])
    )
    const commentMap = new Map<string, CommentSummary>(
      (commentsResult.data ?? []).map((item) => [item.id, item])
    )
    const reviewerMap = new Map<string, AdminReportUser>(
      (reviewersResult.data ?? []).map((item) => [item.id, item])
    )

    const normalizedReports = reports.map((report) => {
      const targetType = (report.target_type as ReportTargetType) || 'question'

      const buildTarget = () => {
        if (targetType === 'question') {
          const question = questionMap.get(report.target_id)
          if (!question) return null
          return {
            title: question.title,
            excerpt: buildExcerpt(question.content),
            url: `/questions/${question.id}`,
            createdAt: question.created_at,
            status: question.status,
            isReported: question.is_reported ?? false,
            isHidden: question.is_approved === false
          }
        }

        if (targetType === 'post') {
          const post = postMap.get(report.target_id)
          if (!post) return null
          return {
            title: post.title,
            excerpt: buildExcerpt(post.content),
            url: `/posts/${post.id}`,
            postType: post.post_type,
            createdAt: post.created_at,
            isReported: post.is_reported ?? false,
            isHidden: post.is_published === false
          }
        }

        if (targetType === 'answer') {
          const answer = answerMap.get(report.target_id)
          if (!answer) return null
          return {
            title: `답변`,
            excerpt: buildExcerpt(answer.content),
            url: answer.question_id ? `/questions/${answer.question_id}#answer-${answer.id}` : null,
            questionId: answer.question_id,
            isReported: answer.is_reported ?? false,
            createdAt: answer.created_at,
            isHidden: answer.is_approved === false
          }
        }

        if (targetType === 'comment') {
          const comment = commentMap.get(report.target_id)
          if (!comment) return null

          let url: string | null = null
          let context = '댓글'

          if (comment.target_type === 'question') {
            url = `/questions/${comment.target_id}#comment-${comment.id}`
            context = '질문 댓글'
          } else if (comment.target_type === 'answer') {
            const parentAnswer = answerMap.get(comment.target_id)
            if (parentAnswer?.question_id) {
              url = `/questions/${parentAnswer.question_id}#comment-${comment.id}`
            }
            context = '답변 댓글'
          }

          return {
            title: context,
            excerpt: buildExcerpt(comment.content),
            url,
            targetType: comment.target_type,
            createdAt: comment.created_at,
            isHidden: comment.is_approved === false
          }
        }

        return null
      }

      const reporter = report.reporter
        ? {
            id: report.reporter.id,
            name: report.reporter.name,
            email: report.reporter.email,
            role: report.reporter.role
          }
        : null

      const reviewer = report.reviewed_by ? reviewerMap.get(report.reviewed_by) : null

      return {
        id: report.id,
        targetId: report.target_id,
        targetType,
        reason: report.reason,
        reasonLabel: REPORT_REASON_LABEL_MAP[report.reason] ?? report.reason,
        description: report.description,
        status: report.status,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
        reviewedAt: report.reviewed_at,
        metadata:
          report.metadata && typeof report.metadata === 'object' && !Array.isArray(report.metadata)
            ? (report.metadata as Record<string, unknown>)
            : {},
        reporter,
        reviewer: reviewer
          ? {
              id: reviewer.id,
              name: reviewer.name,
              email: reviewer.email,
              role: reviewer.role
            }
          : null,
        target: buildTarget()
      }
    })

    const statusSummary = REPORT_STATUSES.reduce<Record<ReportStatus, number>>((acc, status) => {
      acc[status] = 0
      return acc
    }, {} as Record<ReportStatus, number>)

    normalizedReports.forEach((report) => {
      const status = report.status as ReportStatus
      if (REPORT_STATUSES.includes(status)) {
        statusSummary[status] = (statusSummary[status] ?? 0) + 1
      }
    })

    return NextResponse.json({
      reports: normalizedReports,
      summary: {
        total: count ?? 0,
        byStatus: statusSummary,
        filters: {
          status: filters.status ?? null,
          targetType: filters.target ?? null,
          since: filters.since ?? null
        },
        limit
      }
    })
  } catch (error) {
    console.error('[AdminReports] failed to load reports', error)
    return NextResponse.json(
      { error: 'Failed to load reports' },
      { status: 500 }
    )
  }
}

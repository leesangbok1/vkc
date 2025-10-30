import type { FeedCardAuthor } from '@/components/feed/FeedCard'

export type ActivityQuestion = {
  id: string
  title: string
  content: string
  votes: number
  answerCount: number
  createdAt: string
  status?: 'open' | 'resolved'
  helpfulCount: number
  isHelpful: boolean
  categoryName?: string | null
  author?: FeedCardAuthor | null
  views?: number
}

export type ActivityPost = {
  id: string
  title: string
  content: string
  votes: number
  commentCount: number
  createdAt: string
  helpfulCount: number
  isHelpful: boolean
  categoryName?: string | null
  author?: FeedCardAuthor | null
  views?: number
  viewerCanManage?: boolean
}

export type ActivityAnswer = {
  id: string
  content: string
  helpful: number
  questionId: string
  questionTitle: string | null
  createdAt: string
}

export type UserActivity = {
  questions: ActivityQuestion[]
  posts: ActivityPost[]
  answers: ActivityAnswer[]
}

export type ProfileUser = {
  id: string
  name: string
  email?: string | null
  role: string | null
  avatar_url?: string | null
  bio?: string | null
  visa_type?: string | null
  years_in_korea?: number | null
  region?: string | null
  company?: string | null
  trust_score?: number | null
  question_count?: number | null
  answer_count?: number | null
  helpful_answer_count?: number | null
  verification_status?: string | null
  verification_type?: string | null
  preferred_language?: string | null
  last_active?: string | null
  created_at?: string | null
  updated_at?: string | null
  specialty_areas?: string[] | null
  interests?: string[] | null
  badges?: Record<string, unknown> | null
}

export const mapToFeedCardAuthor = (raw: any): FeedCardAuthor | null => {
  if (!raw) return null

  return {
    id: typeof raw.id === 'string' ? raw.id : String(raw.id ?? 'unknown'),
    name:
      typeof raw.name === 'string'
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
    badges:
      raw.badges && typeof raw.badges === 'object'
        ? (raw.badges as Record<string, unknown>)
        : null,
    customBadgeLabel:
      raw.badges && typeof raw.badges === 'object' && (raw.badges as any).admin_custom?.label
        ? String((raw.badges as any).admin_custom.label).trim()
        : null,
    customBadgeIcon:
      raw.badges && typeof raw.badges === 'object' && (raw.badges as any).admin_custom?.icon
        ? String((raw.badges as any).admin_custom.icon).trim()
        : null,
  }
}

export function mapQuestionActivity(raw: any): ActivityQuestion {
  const answerCount = Number(
    raw?.answer_count ?? raw?.answers ?? raw?.answerCount ?? raw?.answer_counts ?? 0
  )
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
    votes: Number(raw?.upvote_count ?? raw?.votes ?? raw?.helpful_count ?? raw?.helpfulCount ?? 0),
    answerCount,
    createdAt:
      raw?.created_at ??
      raw?.createdAt ??
      (typeof raw?.createdAt === 'number' ? new Date(raw.createdAt).toISOString() : new Date().toISOString()),
    status,
    helpfulCount: Number(raw?.helpful_count ?? raw?.helpful ?? raw?.helpfulCount ?? 0),
    isHelpful: Boolean(raw?.is_helpful_by_viewer),
    categoryName:
      typeof raw?.category?.name === 'string'
        ? raw.category.name
        : typeof raw?.category_name === 'string'
          ? raw.category_name
          : typeof raw?.categoryName === 'string'
            ? raw.categoryName
            : null,
    author: mapToFeedCardAuthor(raw?.author),
    views:
      typeof raw?.view_count === 'number'
        ? raw.view_count
        : typeof raw?.views === 'number'
          ? raw.views
          : undefined,
  }
}

export function mapPostActivity(raw: any): ActivityPost {
  return {
    id: String(raw?.id ?? ''),
    title: raw?.title ?? '제목 없음',
    content: raw?.content ?? '',
    votes: Number(raw?.helpful_count ?? raw?.votes ?? raw?.helpfulCount ?? 0),
    commentCount: Number(raw?.comment_count ?? raw?.commentCount ?? 0),
    createdAt:
      raw?.created_at ??
      raw?.createdAt ??
      (typeof raw?.createdAt === 'number' ? new Date(raw.createdAt).toISOString() : new Date().toISOString()),
    helpfulCount: Number(raw?.helpful_count ?? raw?.helpful ?? raw?.helpfulCount ?? 0),
    isHelpful: Boolean(raw?.is_helpful_by_viewer),
    categoryName:
      typeof raw?.category?.name === 'string'
        ? raw.category.name
        : typeof raw?.category === 'string'
          ? raw.category
          : typeof raw?.categoryName === 'string'
            ? raw.categoryName
            : null,
    author: mapToFeedCardAuthor(raw?.author),
    views:
      typeof raw?.view_count === 'number'
        ? raw.view_count
        : typeof raw?.views === 'number'
          ? raw.views
          : undefined,
    viewerCanManage: Boolean(raw?.viewer_can_manage),
  }
}

export function mapAnswerActivity(raw: any): ActivityAnswer {
  return {
    id: String(raw?.id ?? ''),
    content: raw?.content ?? '',
    helpful: Number(
      raw?.helpful_count ?? raw?.helpful ?? raw?.upvote_count ?? raw?.helpfulCount ?? raw?.score ?? 0
    ),
    questionId:
      typeof raw?.question_id === 'string'
        ? raw.question_id
        : raw?.question?.id
          ? String(raw.question.id)
          : '',
    questionTitle:
      typeof raw?.questionTitle === 'string'
        ? raw.questionTitle
        : typeof raw?.question?.title === 'string'
          ? raw.question.title
          : null,
    createdAt:
      raw?.created_at ??
      raw?.createdAt ??
      (typeof raw?.createdAt === 'number' ? new Date(raw.createdAt).toISOString() : new Date().toISOString()),
  }
}

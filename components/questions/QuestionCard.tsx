'use client'

import FeedCard, {
  type FeedCardActionProps,
  type FeedCardAuthor,
} from '@/components/feed/FeedCard'
import StatusBadge from '@/components/common/StatusBadge'
import { Database } from '@/lib/supabase'

type QuestionRow = Database['public']['Tables']['questions']['Row']
type UserRow = Database['public']['Tables']['users']['Row']
type CategoryRow = Database['public']['Tables']['categories']['Row']

type QuestionWithRelations = QuestionRow & {
  author: UserRow
  category: CategoryRow
}

interface QuestionCardProps {
  question: QuestionWithRelations
  className?: string
  compact?: boolean
}

function buildAuthor(question: QuestionWithRelations): FeedCardAuthor | undefined {
  const rawAuthor = question.author
  if (!rawAuthor) return undefined

  const nickname =
    (rawAuthor as any)?.nickname && (rawAuthor as any).nickname.trim().length > 0
      ? (rawAuthor as any).nickname
      : typeof rawAuthor.name === 'string' && rawAuthor.name.trim().length > 0
        ? rawAuthor.name.trim()
        : rawAuthor.email ?? '커뮤니티 멤버'

  return {
    id: rawAuthor.id ?? 'unknown',
    name: nickname,
    role: rawAuthor.role ?? undefined,
    avatarUrl: rawAuthor.avatar_url ?? undefined,
    visaType: (rawAuthor as any)?.visa_type ?? (rawAuthor as any)?.visaType ?? undefined,
    yearsInKorea:
      (rawAuthor as any)?.years_in_korea ??
      (rawAuthor as any)?.yearsInKorea ??
      undefined,
  }
}

export function QuestionCard({ question, className, compact = false }: QuestionCardProps) {
  const answerCount = Number(question.answer_count ?? 0)

  const stats = (
    <span>
      답변 {answerCount.toLocaleString()}개
    </span>
  )

  const badge =
    question.status != null ? (
      <StatusBadge resolved={String(question.status).toLowerCase() === 'resolved'} compact />
    ) : undefined

  const actionProps: FeedCardActionProps = {
    targetType: 'question',
    helpfulCount: Number(question.helpful_count ?? 0),
    compact,
  }

  return (
    <div data-testid="question-card" className={className}>
      <FeedCard
        id={String(question.id)}
        itemType="question"
        title={question.title ?? '제목 없음'}
        body={question.content ?? ''}
        href={`/questions/${question.id}`}
        createdAt={question.created_at ?? new Date().toISOString()}
        topic={question.category?.name ?? undefined}
        author={buildAuthor(question)}
        stats={stats}
        badge={badge}
        actionProps={actionProps}
        showReportButton
      />
    </div>
  )
}

export function CompactQuestionCard({ question, className }: Omit<QuestionCardProps, 'compact'>) {
  return (
    <QuestionCard
      question={question}
      className={className}
      compact
    />
  )
}

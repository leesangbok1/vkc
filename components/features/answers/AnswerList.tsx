'use client'
import { AnswerCard } from './AnswerCard'

interface Answer {
  id: string
  content: string
  is_accepted: boolean
  created_at: string
  users: {
    id: string
    name: string
    avatar_url: string
    role: string
  }
}

interface AnswerListProps {
  answers: Answer[]
  questionId: string
}

export function AnswerList({ answers, questionId }: AnswerListProps) {
  if (answers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 답변이 없습니다. 첫 번째 답변을 작성해보세요!
      </div>
    )
  }

  // 채택된 답변을 맨 위로, 그 다음은 생성 시간순
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.is_accepted && !b.is_accepted) return -1
    if (!a.is_accepted && b.is_accepted) return 1
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  return (
    <div className="space-y-4">
      {sortedAnswers.map((answer) => (
        <AnswerCard
          key={answer.id}
          answer={answer}
          questionId={questionId}
        />
      ))}
    </div>
  )
}
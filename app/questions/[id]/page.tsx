import { createSupabaseServerClient } from '@/lib/supabase'
import { QuestionDetail } from '@/components/features/questions/QuestionDetail'
import { AnswerList } from '@/components/features/answers/AnswerList'
import { AnswerForm } from '@/components/features/answers/AnswerForm'
import { notFound } from 'next/navigation'

interface QuestionPageProps {
  params: { id: string }
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const supabase = createSupabaseServerClient()

  // 질문 상세 정보 조회
  const { data: question, error } = await supabase
    .from('questions')
    .select(`
      *,
      users:user_id (
        id,
        name,
        avatar_url,
        role
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !question) {
    notFound()
  }

  // 답변 목록 조회
  const { data: answers } = await supabase
    .from('answers')
    .select(`
      *,
      users:user_id (
        id,
        name,
        avatar_url,
        role
      )
    `)
    .eq('question_id', params.id)
    .order('is_accepted', { ascending: false })
    .order('created_at', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <QuestionDetail question={question} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          답변 {answers?.length || 0}개
        </h2>

        {answers && answers.length > 0 && (
          <AnswerList answers={answers} questionId={params.id} />
        )}

        <div className="mt-8">
          <AnswerForm questionId={params.id} />
        </div>
      </div>
    </div>
  )
}
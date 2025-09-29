import { QuestionForm } from '@/components/features/questions/QuestionForm'

export default function NewQuestionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">새 질문 작성</h1>
        <QuestionForm />
      </div>
    </div>
  )
}
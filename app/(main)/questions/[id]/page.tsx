interface QuestionDetailPageProps {
  params: {
    id: string
  }
}

export default function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">질문 상세 (ID: {params.id})</h1>
      <div className="bg-white p-8 rounded-lg shadow">
        <p className="text-center text-gray-600">
          질문 상세 내용이 여기에 표시됩니다.
        </p>
      </div>
    </div>
  )
}
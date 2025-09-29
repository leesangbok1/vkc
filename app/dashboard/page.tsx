import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">대시보드</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">환영합니다!</h2>
        <p className="text-gray-600">
          안녕하세요 {profile?.name || session.user.email}님,<br />
          Viet K-Connect에 오신 것을 환영합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">내 질문</h3>
          <p className="text-blue-700">작성한 질문을 관리하세요</p>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">내 답변</h3>
          <p className="text-green-700">작성한 답변을 확인하세요</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="font-semibold text-purple-900 mb-2">북마크</h3>
          <p className="text-purple-700">저장한 게시글을 보세요</p>
        </div>
      </div>
    </div>
  )
}
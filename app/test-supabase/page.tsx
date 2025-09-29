import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function TestSupabasePage() {
  const supabase = createSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)

    if (error) throw error

    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Supabase 연결 테스트</h1>
        <div className="bg-green-100 p-4 rounded">
          ✅ Supabase 연결 성공!
        </div>
        <pre className="mt-4 bg-gray-100 p-4 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Supabase 연결 테스트</h1>
        <div className="bg-red-100 p-4 rounded">
          ❌ Supabase 연결 실패
        </div>
        <pre className="mt-4 bg-gray-100 p-4 rounded">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getQuestionById } from '@/lib/services/questions.service'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const data = await getQuestionById(id, user?.id ?? null)
    return NextResponse.json({ success: true, ...data }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error: any) {
    const status = error?.code === 'NOT_FOUND' ? 404 : 500
    return NextResponse.json({ success: false, error: 'Failed to fetch question', code: error?.code, details: error?.message }, {
      status,
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  }
}

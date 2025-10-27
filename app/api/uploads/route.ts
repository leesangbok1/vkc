import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp'])
const DEFAULT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET || 'user-uploads'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: '업로드할 파일을 찾을 수 없습니다.' }, { status: 400 })
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: '허용되지 않는 파일 형식입니다.' }, { status: 415 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '파일 크기가 5MB를 초과합니다.' }, { status: 413 })
    }

    const serviceClient = createSupabaseServiceClient()
    const extension = getExtension(file)
    const filePath = buildFilePath(user.id, extension)
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await serviceClient.storage
      .from(DEFAULT_BUCKET)
      .upload(filePath, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[POST /api/uploads] upload error', uploadError)
      return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = serviceClient.storage.from(DEFAULT_BUCKET).getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
    })
  } catch (error: any) {
    console.error('[POST /api/uploads] unexpected error', error)
    return NextResponse.json(
      { error: '파일 업로드에 실패했습니다.', details: error?.message },
      { status: 500 }
    )
  }
}

function getExtension(file: File): string {
  const name = file.name || ''
  const byName = name.includes('.') ? name.split('.').pop() : ''
  if (byName) return byName.toLowerCase()

  switch (file.type) {
    case 'image/png':
      return 'png'
    case 'image/jpeg':
      return 'jpg'
    case 'image/webp':
      return 'webp'
    default:
      return 'bin'
  }
}

function buildFilePath(userId: string, ext: string) {
  const now = new Date()
  const stamp = now.toISOString().slice(0, 10) // YYYY-MM-DD
  const unique = randomUUID()
  return `users/${userId}/${stamp}/${unique}.${ext}`
}

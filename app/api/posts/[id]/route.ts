import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MIN_TITLE_LENGTH = 5
const MIN_CONTENT_LENGTH = 10
const SCRIPT_TAG_REGEX = /<script[\s\S]*?>[\s\S]*?<\/script>/gi

const POST_SELECT_FIELDS = `
  id,
  title,
  content,
  post_type,
  helpful_count,
  comment_count,
  tags,
  created_at,
  updated_at,
  is_published,
  author_id,
  category:categories!posts_category_id_fkey (
    id,
    name,
    slug,
    icon
  ),
  author:users!posts_author_id_fkey (
    id,
    name,
    role,
    avatar_url,
    visa_type,
    years_in_korea
  )
`

async function isAdminUser(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from('users')
    .select('role, admin_yn')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.warn('[posts/:id] failed to resolve user role', error)
    return false
  }

  const role = typeof data?.role === 'string' ? data.role.toLowerCase() : ''
  return data?.admin_yn === 'Y' || role === 'admin'
}

function sanitizeContent(raw: string) {
  return raw.replace(SCRIPT_TAG_REGEX, '').trim()
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const trimmedId = id.trim()

    if (!trimmedId || !UUID_REGEX.test(trimmedId)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    const { data: post, error } = await supabase
      .from('posts')
      .select(POST_SELECT_FIELDS)
      .eq('id', trimmedId)
      .maybeSingle()

    if (error) {
      console.error('[GET /api/posts/:id] failed', error)
      return NextResponse.json({ error: 'Failed to load post' }, { status: 500 })
    }

    if (!post || post.is_published === false) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const {
      data: { user }
    } = await supabase.auth.getUser()

    let viewerCanManage = false
    if (user?.id) {
      const authorId =
        typeof post.author?.['id'] === 'string'
          ? (post.author['id'] as string)
          : typeof post['author_id'] === 'string'
            ? (post['author_id'] as string)
            : null

      if (authorId && authorId === user.id) {
        viewerCanManage = true
      } else if (await isAdminUser(supabase, user.id)) {
        viewerCanManage = true
      }
    }

    const payload = {
      ...post,
      viewer_can_manage: viewerCanManage
    }

    return NextResponse.json({ success: true, data: payload })
  } catch (error) {
    console.error('[GET /api/posts/:id] unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const trimmedId = id.trim()

    if (!trimmedId || !UUID_REGEX.test(trimmedId)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 게시글 ID 입니다.' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: '수정할 정보를 전달해주세요.' },
        { status: 400 }
      )
    }

    const rawTitle = body.title
    const rawContent = body.content
    const rawCategory = body.category_id ?? body.categoryId
    const rawTags = body.tags

    const updates: Record<string, unknown> = {}

    if (rawTitle !== undefined) {
      if (typeof rawTitle !== 'string' || rawTitle.trim().length < MIN_TITLE_LENGTH) {
        return NextResponse.json(
          { success: false, error: `제목은 최소 ${MIN_TITLE_LENGTH}자 이상 작성해주세요.` },
          { status: 400 }
        )
      }
      updates.title = rawTitle.trim().slice(0, 120)
    }

    if (rawContent !== undefined) {
      if (typeof rawContent !== 'string') {
        return NextResponse.json(
          { success: false, error: '게시글 내용이 올바르지 않습니다.' },
          { status: 400 }
        )
      }
      const sanitizedContent = sanitizeContent(rawContent)
      if (sanitizedContent.length < MIN_CONTENT_LENGTH) {
        return NextResponse.json(
          { success: false, error: `내용은 최소 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요.` },
          { status: 400 }
        )
      }
      updates.content = sanitizedContent
    }

    if (rawCategory !== undefined) {
      const parsedCategory = Number(rawCategory)
      if (!Number.isFinite(parsedCategory)) {
        return NextResponse.json(
          { success: false, error: '유효한 카테고리를 선택해주세요.' },
          { status: 400 }
        )
      }
      updates.category_id = parsedCategory
    }

    if (rawTags !== undefined) {
      if (!Array.isArray(rawTags)) {
        return NextResponse.json(
          { success: false, error: '태그 형식이 올바르지 않습니다.' },
          { status: 400 }
        )
      }
      updates.tags = rawTags.slice(0, 10)
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: '수정할 항목이 없습니다.' },
        { status: 400 }
      )
    }

    const { data: existing, error: existingError } = await supabase
      .from('posts')
      .select('id, author_id, is_published')
      .eq('id', trimmedId)
      .maybeSingle()

    if (existingError) {
      console.error('[PATCH /api/posts/:id] failed to load post', existingError)
      return NextResponse.json(
        { success: false, error: '게시글 정보를 불러오지 못했습니다.' },
        { status: 500 }
      )
    }

    if (!existing || existing.is_published === false) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const isAuthor = existing.author_id === user.id
    const isAdmin = isAuthor ? false : await isAdminUser(supabase, user.id)

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: '게시글을 수정할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    updates.updated_at = new Date().toISOString()

    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', trimmedId)
      .select(POST_SELECT_FIELDS)
      .maybeSingle()

    if (updateError) {
      console.error('[PATCH /api/posts/:id] update failed', updateError)
      return NextResponse.json(
        { success: false, error: '게시글 수정에 실패했습니다.' },
        { status: 500 }
      )
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: '게시글 수정 결과를 확인할 수 없습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        viewer_can_manage: true,
      },
    })
  } catch (error) {
    console.error('[PATCH /api/posts/:id] unexpected error', error)
    return NextResponse.json(
      { success: false, error: '정보 글 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const trimmedId = id.trim()

    if (!trimmedId || !UUID_REGEX.test(trimmedId)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 게시글 ID 입니다.' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { data: existing, error } = await supabase
      .from('posts')
      .select('id, author_id, is_published')
      .eq('id', trimmedId)
      .maybeSingle()

    if (error) {
      console.error('[DELETE /api/posts/:id] failed to load post', error)
      return NextResponse.json(
        { success: false, error: '게시글 정보를 불러오지 못했습니다.' },
        { status: 500 }
      )
    }

    if (!existing || existing.is_published === false) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const isAuthor = existing.author_id === user.id
    const isAdmin = isAuthor ? false : await isAdminUser(supabase, user.id)

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: '게시글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabase
      .from('posts')
      .update({
        is_published: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trimmedId)

    if (deleteError) {
      console.error('[DELETE /api/posts/:id] deletion failed', deleteError)
      return NextResponse.json(
        { success: false, error: '게시글 삭제에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/posts/:id] unexpected error', error)
    return NextResponse.json(
      { success: false, error: '정보 글 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}

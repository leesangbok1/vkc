import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server'
import { upsertUserWithFallback } from '@/lib/utils/supabase-user'
import type { PostgrestError } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>
type SupabaseServiceClient = ReturnType<typeof createSupabaseServiceClient>
type SupabaseAnyClient = SupabaseServerClient | SupabaseServiceClient
type UserRow = Database['public']['Tables']['users']['Row']
type UserInsertPayload = Database['public']['Tables']['users']['Insert'] & Record<string, unknown>
type UserUpdatePayload = Database['public']['Tables']['users']['Update'] & Record<string, unknown>

// GET /api/auth/profile - 사용자 프로필 조회
export async function GET(request: NextRequest) {
  try {
    // Mock mode 체크 (테스트 환경)
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return getMockProfile()
    }

    const supabase = await createSupabaseServerClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const profile = await ensureUserProfile(supabase, user)
    if (!profile) {
      console.error('Profile fetch error: bootstrap failed')
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile
    })

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/auth/profile - 사용자 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    // Mock mode 체크 (테스트 환경)
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return putMockProfile(request)
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

    const supabase = await createSupabaseServerClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const currentProfile = await ensureUserProfile(supabase, user)
    if (!currentProfile) {
      console.error('Current profile fetch error: bootstrap failed')
      return NextResponse.json({ error: 'Failed to fetch profile for update', code: 'profile_missing' }, { status: 500 })
    }

    // 업데이트 가능한 필드 + 실제 존재하는 컬럼 교집합만 업데이트
    const allowedFields = [
      'name', 'bio', 'visa_type', 'company', 'years_in_korea',
      'region', 'preferred_language', 'specialties', 'interests',
      'languages', 'notification_settings',
      'onboarding_completed', 'residence', 'gender', 'age', 'category',
      'avatar_url'
    ] as const
    const existingColumns = new Set(Object.keys(currentProfile || {}))
    const updateData: UserUpdatePayload = {}

    allowedFields.forEach((key) => {
      if (!existingColumns.has(key)) return
      if (!Object.prototype.hasOwnProperty.call(body, key)) return

      const rawValue = body[key]
      switch (key) {
        case 'avatar_url': {
          const value = typeof rawValue === 'string' ? rawValue.trim() : ''
          updateData.avatar_url = value.length > 0 ? value : null
          break
        }
        case 'name': {
          updateData[key] =
            typeof rawValue === 'string'
              ? (rawValue as string).trim()
              : (rawValue as UserUpdatePayload[typeof key])
          break
        }
        default:
          updateData[key] = rawValue as UserUpdatePayload[typeof key]
      }
    })

    updateData.updated_at = new Date().toISOString()

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, data: currentProfile, message: 'No updatable fields present' })
    }

    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('*')
      .single()

    if (error) {
      console.error('Profile update error:', error)
      const normalized = normalizePostgrestError(error)
      return NextResponse.json(
        { error: 'Failed to update profile', code: normalized.code, details: normalized.details },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: '프로필이 성공적으로 업데이트되었습니다'
    })

  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock 함수들 (테스트 환경용)
function getMockProfile() {
  const mockProfile = {
    id: 'user_mock_123',
    email: 'letuan@example.com',
    name: '레투안',
    avatar_url: null,
    bio: '소프트웨어 개발자로 한국에서 3년째 근무중입니다. 비자 연장과 정착 과정에서 얻은 경험을 나누고 싶습니다.',
    provider: 'email',
    provider_id: 'email_123',
    role: 'user',
    verification_status: 'approved',
    verification_type: 'work',
    visa_type: 'E-7',
    company: '테크 코리아',
    years_in_korea: 3,
    region: '서울',
    specialty_areas: ['웹개발', 'React', 'Node.js'],
    preferred_language: 'ko',
    verified_at: '2024-01-01T00:00:00Z',
    verification_expires_at: '2025-01-01T00:00:00Z',
    is_verified: true,
    verification_date: '2024-01-01T00:00:00Z',
    trust_score: 324,
    badges: {
      verified: true,
      expert: false,
      helpful: true
    },
    question_count: 5,
    answer_count: 12,
    helpful_answer_count: 8,
    last_active: '2024-01-15T10:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    notification_settings: {
      email_notifications: true,
      push_notifications: false,
      sms_notifications: false
    },
    languages: {
      vietnamese: 'native',
      korean: 'advanced',
      english: 'intermediate'
    },
    interests: ['기술', '스타트업', '한국문화'],
    specialties: ['React', 'Node.js', '웹개발']
  }

  return NextResponse.json({
    success: true,
    data: mockProfile
  })
}

async function putMockProfile(request: NextRequest) {
  try {
    const body = await request.json()

    // 업데이트 가능한 필드만 필터링
    const allowedFields = [
      'name', 'bio', 'visa_type', 'company', 'years_in_korea',
      'region', 'preferred_language', 'specialties', 'interests',
      'languages', 'notification_settings'
    ]

    const updateData = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key]
        return obj
      }, {} as Record<string, unknown>)

    // Trust score 보너스 계산
    let trustBonus = 0
    let trustBonusText = ''

    if (updateData.bio && typeof updateData.bio === 'string' && updateData.bio.length > 50) {
      trustBonus += 10
      trustBonusText += '+10 (긴 자기소개) '
    }

    if (updateData.specialties && Array.isArray(updateData.specialties) && updateData.specialties.length > 1) {
      trustBonus += 5
      trustBonusText += '+5 (전문 분야) '
    }

    if (updateData.languages && typeof updateData.languages === 'object') {
      trustBonus += 5
      trustBonusText += '+5 (언어 능력) '
    }

    // Mock 업데이트된 프로필 생성 (허용되지 않은 필드 제외)
    const baseProfile = {
      id: 'user_mock_123',
      name: '슬기로운 한국생활123',
      avatar_url: null,
      provider: 'email',
      provider_id: 'email_123',
      role: 'user',
      verification_status: 'approved',
      verification_type: 'work',
      verified_at: '2024-01-01T00:00:00Z',
      verification_expires_at: '2025-01-01T00:00:00Z',
      is_verified: true,
      verification_date: '2024-01-01T00:00:00Z',
      badges: {
        verified: true,
        expert: false,
        helpful: true
      },
      question_count: 5,
      answer_count: 12,
      helpful_answer_count: 8,
      last_active: new Date().toISOString(),
      created_at: '2024-01-01T00:00:00Z'
    }

    const updatedProfile = {
      ...baseProfile,
      name: updateData.name || '레투안',
      bio: updateData.bio || '소프트웨어 개발자로 한국에서 3년째 근무중입니다.',
      visa_type: updateData.visa_type || 'E-7',
      company: updateData.company || '테크 코리아',
      years_in_korea: updateData.years_in_korea || 3,
      region: updateData.region || '서울',
      specialty_areas: updateData.specialties || ['웹개발', 'React', 'Node.js'],
      preferred_language: updateData.preferred_language || 'ko',
      trust_score: 324 + trustBonus,
      updated_at: new Date().toISOString(),
      notification_settings: updateData.notification_settings || {
        email_notifications: true,
        push_notifications: false,
        sms_notifications: false
      },
      languages: updateData.languages || {
        vietnamese: 'native',
        korean: 'advanced',
        english: 'intermediate'
      },
      interests: updateData.interests || ['기술', '스타트업', '한국문화'],
      specialties: updateData.specialties || ['React', 'Node.js', '웹개발']
    }

    const response: Record<string, unknown> = {
      success: true,
      data: updatedProfile,
      message: '프로필이 성공적으로 업데이트되었습니다'
    }

    // Trust bonus가 있으면 추가
    if (trustBonus > 0) {
      response.trust_bonus = trustBonusText.trim()
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

async function ensureUserProfile(
  supabase: SupabaseServerClient,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }
): Promise<UserRow | null> {
  const rawName =
    user.user_metadata?.nickname ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email ? user.email.split('@')[0] : '') ||
    '커넥터'

  const sanitizedName =
    typeof rawName === 'string' && rawName.trim().length > 0
      ? rawName.trim()
      : `커넥터${String(Math.floor(Math.random() * 900) + 100)}`

  const basePayload: UserInsertPayload = {
    id: user.id,
    email: user.email ?? '',
    name: sanitizedName,
    updated_at: new Date().toISOString(),
  }

  const existing = await supabase
    .from('users')
    .select<UserRow>('*')
    .eq('id', user.id)
    .maybeSingle()

  if (existing.error && existing.error.code !== 'PGRST116') {
    console.error('ensureUserProfile: initial fetch error', existing.error)
    return null
  }
  if (existing.data) {
    return existing.data
  }

  const reread = await supabase
    .from('users')
    .select<UserRow>('*')
    .eq('id', user.id)
    .maybeSingle()

  if (reread.error && reread.error.code !== 'PGRST116') {
    console.error('ensureUserProfile: reread error', reread.error)
    return null
  }

  if (!reread.data) {
    try {
      let service: SupabaseAnyClient
      try {
        service = createSupabaseServiceClient()
      } catch (serviceError) {
        console.warn('ensureUserProfile: service client unavailable, falling back', serviceError)
        service = supabase
      }
      const upsertResult = await upsertUserWithFallback(service, {
        ...basePayload,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' })
      if (upsertResult.error && upsertResult.error.code !== '23505') {
        console.error('ensureUserProfile: upsert error', upsertResult.error)
        return null
      }
    } catch (serviceError) {
      console.error('ensureUserProfile: service upsert exception', serviceError)
      return null
    }

    const recheck = await supabase
      .from('users')
      .select<UserRow>('*')
      .eq('id', user.id)
      .maybeSingle()

    if (recheck.error) {
      console.error('ensureUserProfile: recheck error', recheck.error)
      return null
    }
    return recheck.data ?? null
  }

  return reread.data ?? null
}

function normalizePostgrestError(error: PostgrestError | null | undefined) {
  if (!error) {
    return { code: null, details: null }
  }

  return {
    code: error.code ?? null,
    details: error.details ?? error.message ?? null,
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/auth/profile - 사용자 프로필 조회
export async function GET(request: NextRequest) {
  try {
    // Mock mode 체크 (테스트 환경)
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return getMockProfile()
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 사용자 프로필 조회
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
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

    const body = await request.json()

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

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

    updateData.updated_at = new Date().toISOString()

    // 프로필 업데이트
    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('*')
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
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

    if (updateData.bio && updateData.bio.length > 50) {
      trustBonus += 10
      trustBonusText += '+10 (긴 자기소개) '
    }

    if (updateData.specialties && updateData.specialties.length > 1) {
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
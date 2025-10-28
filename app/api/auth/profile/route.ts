import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient as createClient } from '@/lib/supabase-server'

// GET /api/auth/profile - 사용자 프로필 조회
export async function GET(request: NextRequest) {
  try {
    // Mock mode check
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
      console.log('Profile API running in mock mode')

      // Mock 사용자 데이터 (베트남 사용자 특화)
      const mockProfile = {
        id: 'user_mock_123',
        email: 'letuan@example.com',
        name: '레투안',
        avatar_url: '',
        bio: '한국 거주 3년차 베트남인입니다. IT 업계에서 일하고 있으며, 비자와 취업 관련 정보를 공유하고 있습니다.',
        provider: 'google',
        provider_id: 'google_123456',

        // 베트남 특화 정보
        visa_type: 'E-7',
        company: '삼성전자',
        years_in_korea: 3,
        region: '서울시 강남구',
        preferred_language: 'ko',

        // 커뮤니티 정보
        is_verified: true,
        verification_date: '2023-06-15T10:00:00Z',
        trust_score: 324,
        badges: {
          verified: true,
          expert: false,
          helpful: true,
          early_adopter: true
        },

        // 활동 통계
        question_count: 8,
        answer_count: 15,
        helpful_answer_count: 12,
        last_active: new Date().toISOString(),

        // 전문 분야
        specialties: ['IT', '취업', 'E-7비자'],
        interests: ['프로그래밍', '한국문화', '요리'],

        // 언어 능력
        languages: {
          vietnamese: 'native',
          korean: 'advanced',
          english: 'intermediate'
        },

        // 알림 설정
        notification_settings: {
          email_notifications: true,
          answer_notifications: true,
          expert_match_notifications: true,
          weekly_digest: true
        },

        created_at: '2023-01-15T10:00:00Z',
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: mockProfile
      })
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
    const body = await request.json()

    // Mock mode check
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
      console.log('Profile update API running in mock mode')

      // 업데이트 가능한 필드 검증
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
        }, {} as any)

      // Trust Score 업데이트 로직 (프로필 완성도 기반)
      let trustBonus = 0
      if (updateData.bio && updateData.bio.length > 50) trustBonus += 10
      if (updateData.visa_type) trustBonus += 15
      if (updateData.company) trustBonus += 10
      if (updateData.specialties && updateData.specialties.length > 0) trustBonus += 20
      if (updateData.languages && Object.keys(updateData.languages).length >= 2) trustBonus += 15

      const updatedProfile = {
        ...updateData,
        trust_score: Math.min(324 + trustBonus, 1000), // 기존 점수에 보너스 추가
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: updatedProfile,
        message: '프로필이 성공적으로 업데이트되었습니다',
        trust_bonus: trustBonus > 0 ? `신뢰도 +${trustBonus}점 획득` : null
      })
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
      }, {} as any)

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
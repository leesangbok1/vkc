'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { UserRole, hasPermission } from '@/lib/utils/permissions'

/**
 * 권한별 API 미들웨어
 * 4-tier 권한 시스템에 따른 API 접근 제어
 */

export interface PermissionOptions {
  requiredRole?: UserRole
  requiredPermissions?: string[]
  allowAnonymous?: boolean
  adminOnly?: boolean
  verifiedOnly?: boolean
}

export async function withPermission(
  request: NextRequest,
  options: PermissionOptions = {}
) {
  const {
    requiredRole,
    requiredPermissions = [],
    allowAnonymous = false,
    adminOnly = false,
    verifiedOnly = false
  } = options

  try {
    const supabase = await createSupabaseServerClient()


    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      if (allowAnonymous) {
        return NextResponse.next()
      }
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // 사용자 프로필 및 역할 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, verification_status, verification_type')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Permission middleware: Failed to fetch user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to verify user permissions', code: 'PROFILE_ERROR' },
        { status: 500 }
      )
    }

    const userRole = (profile as any)?.role || UserRole.USER

    // 관리자 전용 확인
    if (adminOnly && userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Admin access required', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      )
    }

    // 인증사용자 전용 확인
    if (verifiedOnly && userRole !== UserRole.VERIFIED && userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Verified user access required', code: 'VERIFIED_REQUIRED' },
        { status: 403 }
      )
    }

    // 특정 역할 요구사항 확인
    if (requiredRole && !hasMinimumRole(userRole, requiredRole)) {
      return NextResponse.json(
        { error: `${requiredRole} role or higher required`, code: 'INSUFFICIENT_ROLE' },
        { status: 403 }
      )
    }

    // 특정 권한 요구사항 확인
    for (const permission of requiredPermissions) {
      if (!hasPermission(userRole, permission)) {
        return NextResponse.json(
          { error: `Permission '${permission}' required`, code: 'INSUFFICIENT_PERMISSION' },
          { status: 403 }
        )
      }
    }

    // 요청 헤더에 사용자 정보 추가 (API 라우트에서 사용 가능)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-role', userRole)
    requestHeaders.set('x-user-email', user.email || '')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('Permission middleware error:', error)
    return NextResponse.json(
      { error: 'Permission check failed', code: 'MIDDLEWARE_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * 최소 역할 요구사항 확인
 */
function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.GUEST]: 0,
    [UserRole.USER]: 1,
    [UserRole.VERIFIED]: 2,
    [UserRole.ADMIN]: 3
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * API 라우트에서 사용할 권한 검사 헬퍼
 */
export function requirePermission(options: PermissionOptions) {
  return async (request: NextRequest) => {
    return withPermission(request, options)
  }
}

/**
 * 사용자 역할별 API 엔드포인트 권한 설정
 */
export const PermissionConfig = {
  // 게스트 허용
  PUBLIC: { allowAnonymous: true },

  // 로그인 사용자 전용
  USER_ONLY: { requiredRole: UserRole.USER },

  // 인증사용자 전용
  VERIFIED_ONLY: { verifiedOnly: true },

  // 관리자 전용
  ADMIN_ONLY: { adminOnly: true },

  // 질문 작성 (일반사용자 이상)
  CREATE_QUESTION: {
    requiredRole: UserRole.USER,
    requiredPermissions: ['create:question']
  },

  // 답변 작성 (일반사용자 이상)
  CREATE_ANSWER: {
    requiredRole: UserRole.USER,
    requiredPermissions: ['create:answer']
  },

  // 전문가 매칭 (인증사용자 이상)
  EXPERT_MATCH: {
    verifiedOnly: true,
    requiredPermissions: ['access:expert_network']
  },

  // 인증 관리 (관리자 전용)
  MANAGE_VERIFICATION: {
    adminOnly: true,
    requiredPermissions: ['manage:verification']
  },

  // 사용자 관리 (관리자 전용)
  MANAGE_USERS: {
    adminOnly: true,
    requiredPermissions: ['manage:users']
  }
} as const

export type PermissionConfigKey = keyof typeof PermissionConfig
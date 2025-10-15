/**
 * Permission System Utilities
 * Core logic for 4-tier permission checking and role management
 */

import { UserRole, VerificationStatus, PermissionChecker, LayoutConfig, ExtendedUser, VerificationType, VerificationMethod } from '../types/permissions'

// Re-export commonly used types
export { UserRole, VerificationStatus, VerificationType, VerificationMethod } from '../types/permissions'

/**
 * Permission checker implementation
 */
export const permissionChecker: PermissionChecker = {
  canCreateQuestion: (role: UserRole): boolean => {
    return role !== UserRole.GUEST
  },

  canCreateAnswer: (role: UserRole): boolean => {
    return role !== UserRole.GUEST
  },

  canVote: (role: UserRole): boolean => {
    return role !== UserRole.GUEST
  },

  canComment: (role: UserRole): boolean => {
    return role !== UserRole.GUEST
  },

  canAccessCertifiedFeatures: (role: UserRole): boolean => {
    return role === UserRole.VERIFIED || role === UserRole.ADMIN
  },

  canManageUsers: (role: UserRole): boolean => {
    return role === UserRole.ADMIN
  },

  canApproveVerifications: (role: UserRole): boolean => {
    return role === UserRole.ADMIN
  },

  hasAccess: (role: UserRole, permission: string): boolean => {
    const permissions = getRolePermissions(role)
    return permissions.includes(permission)
  }
}

/**
 * Check if user can create posts (VERIFIED or ADMIN only)
 */
export function canCreatePost(role: UserRole): boolean {
  return role === UserRole.VERIFIED || role === UserRole.ADMIN
}

/**
 * Get all permissions for a specific role
 */
export function getRolePermissions(role: UserRole): string[] {
  switch (role) {
    case UserRole.GUEST:
      return ['read_only']

    case UserRole.USER:
      return [
        'read_only',
        'question_create',
        'answer_create',
        'vote',
        'comment',
        'basic_profile'
      ]

    case UserRole.VERIFIED:
      return [
        'read_only',
        'question_create',
        'answer_create',
        'vote',
        'comment',
        'basic_profile',
        'certified_badge',
        'priority_display',
        'certified_network',
        'verification_info'
      ]

    case UserRole.ADMIN:
      return [
        'read_only',
        'question_create',
        'answer_create',
        'vote',
        'comment',
        'basic_profile',
        'certified_badge',
        'priority_display',
        'certified_network',
        'verification_info',
        'user_management',
        'verification_approval',
        'platform_stats',
        'admin_panel',
        'content_moderation'
      ]

    default:
      return ['read_only']
  }
}

/**
 * Determine A/B layout configuration based on user role
 */
export function getLayoutConfig(role: UserRole): LayoutConfig {
  const roleInfo = getRoleDisplayInfo(role)

  switch (role) {
    case UserRole.GUEST:
    case UserRole.USER:
      return {
        showGuestBanner: true,
        showVerificationCTA: role === UserRole.USER,
        showCertifiedNetwork: false,
        showAdminPanel: false,
        bannerVariant: 'registration-cta',
        prioritizeContent: 'questions',
        label: roleInfo.label,
        icon: roleInfo.icon,
        badgeColor: roleInfo.badgeColor,
        bgColor: roleInfo.bgColor || roleInfo.badgeColor
      }

    case UserRole.VERIFIED:
      return {
        showGuestBanner: false,
        showVerificationCTA: false,
        showCertifiedNetwork: true,
        showAdminPanel: false,
        bannerVariant: 'certified-network',
        prioritizeContent: 'certified_users',
        label: roleInfo.label,
        icon: roleInfo.icon,
        badgeColor: roleInfo.badgeColor,
        bgColor: roleInfo.bgColor || roleInfo.badgeColor
      }

    case UserRole.ADMIN:
      return {
        showGuestBanner: false,
        showVerificationCTA: false,
        showCertifiedNetwork: true,
        showAdminPanel: true,
        bannerVariant: 'admin-tools',
        prioritizeContent: 'management',
        label: roleInfo.label,
        icon: roleInfo.icon,
        badgeColor: roleInfo.badgeColor,
        bgColor: roleInfo.bgColor || roleInfo.badgeColor
      }

    default:
      const defaultRoleInfo = getRoleDisplayInfo(UserRole.GUEST)
      return {
        showGuestBanner: true,
        showVerificationCTA: false,
        showCertifiedNetwork: false,
        showAdminPanel: false,
        bannerVariant: 'registration-cta',
        prioritizeContent: 'questions',
        label: defaultRoleInfo.label,
        icon: defaultRoleInfo.icon,
        badgeColor: defaultRoleInfo.badgeColor,
        bgColor: defaultRoleInfo.bgColor || defaultRoleInfo.badgeColor
      }
  }
}

/**
 * Check if user can upgrade to next role level
 */
export function canUpgradeRole(currentRole: UserRole, verificationStatus: VerificationStatus): boolean {
  switch (currentRole) {
    case UserRole.GUEST:
      return true // Can always register to become USER

    case UserRole.USER:
      return verificationStatus === VerificationStatus.NONE // Can apply for verification

    case UserRole.VERIFIED:
      return false // Cannot self-upgrade to ADMIN

    case UserRole.ADMIN:
      return false // Already at highest level

    default:
      return false
  }
}

/**
 * Get next upgrade action for user
 */
export function getUpgradeAction(currentRole: UserRole, verificationStatus: VerificationStatus): string | null {
  switch (currentRole) {
    case UserRole.GUEST:
      return 'login_with_google'

    case UserRole.USER:
      if (verificationStatus === VerificationStatus.NONE) {
        return 'apply_for_verification'
      }
      return null

    default:
      return null
  }
}

/**
 * Check if verification is eligible for approval
 */
export function isVerificationEligible(
  user: Partial<ExtendedUser>,
  hasRequiredDocuments: boolean
): boolean {
  return !!(
    user.visa_type &&
    user.years_in_korea &&
    user.specialty_areas?.length &&
    hasRequiredDocuments
  )
}

/**
 * Get notification channels allowed for role
 */
export function getAllowedNotificationChannels(role: UserRole): string[] {
  switch (role) {
    case UserRole.GUEST:
      return []

    case UserRole.USER:
      return ['in_app']

    case UserRole.VERIFIED:
      return ['in_app', 'push', 'email', 'kakao']

    case UserRole.ADMIN:
      return ['in_app', 'push', 'email']

    default:
      return []
  }
}

/**
 * Check if user role is valid
 */
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole)
}

/**
 * Convert legacy is_verified to new role system
 */
export function legacyToNewRole(isVerified: boolean, isAdmin?: boolean): UserRole {
  if (isAdmin) return UserRole.ADMIN
  if (isVerified) return UserRole.VERIFIED
  return UserRole.USER
}

/**
 * Get role display name in Korean
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.GUEST:
      return '게스트'
    case UserRole.USER:
      return '일반사용자'
    case UserRole.VERIFIED:
      return '인증사용자'
    case UserRole.ADMIN:
      return '관리자'
    default:
      return '알 수 없음'
  }
}

/**
 * Get role color for UI display
 */
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case UserRole.GUEST:
      return 'var(--guest-accent)' // #757575
    case UserRole.USER:
      return 'var(--user-accent)' // #1976D2
    case UserRole.VERIFIED:
      return 'var(--verified-accent)' // #4CAF50
    case UserRole.ADMIN:
      return 'var(--admin-accent)' // #9C27B0
    default:
      return 'var(--guest-accent)'
  }
}

/**
 * Role display info interface
 */
export interface RoleDisplayInfo {
  label: string
  icon: string
  badgeColor: string
  bgColor?: string
  permissions: string[]
}

/**
 * Get complete role display information for UI
 */
export function getRoleDisplayInfo(role: UserRole): RoleDisplayInfo {
  switch (role) {
    case UserRole.ADMIN:
      return {
        label: '관리자',
        icon: '👑',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        permissions: getRolePermissions(role)
      }
    case UserRole.VERIFIED:
      return {
        label: '인증됨',
        icon: '✅',
        badgeColor: 'bg-green-100 text-green-800 border-green-200',
        permissions: getRolePermissions(role)
      }
    case UserRole.USER:
      return {
        label: '일반',
        icon: '👤',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        permissions: getRolePermissions(role)
      }
    case UserRole.GUEST:
    default:
      return {
        label: '게스트',
        icon: '🔒',
        badgeColor: 'bg-gray-100 text-gray-800 border-gray-200',
        permissions: getRolePermissions(UserRole.GUEST)
      }
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = getRolePermissions(userRole)
  return permissions.includes(permission)
}

// ============================================================================
// 🌟 경험 기반 인증 시스템 유틸리티 함수 (Experience-based Verification)
// ============================================================================

/**
 * Get verification type icon
 */
export function getVerificationTypeIcon(type: VerificationType | string): string {
  switch (type) {
    // 📄 문서 기반 인증
    case VerificationType.STUDENT:
    case 'student':
      return '🎓'
    case VerificationType.WORK:
    case 'work':
      return '💼'
    case VerificationType.FAMILY:
    case 'family':
      return '👨‍👩‍👧'
    case VerificationType.RESIDENT:
    case 'resident':
      return '🏠'
    case VerificationType.BUSINESS:
    case 'business':
      return '🏢'

    // 🌟 경험 기반 인증 (NEW)
    case VerificationType.MENTOR:
    case 'mentor':
      return '👨‍🏫'
    case VerificationType.EXPERIENCED:
    case 'experienced':
      return '⭐'
    case VerificationType.COMMUNITY_LEADER:
    case 'community_leader':
      return '👥'
    case VerificationType.SPECIALIST:
    case 'specialist':
      return '🎯'

    case VerificationType.OTHER:
    case 'other':
    default:
      return '✓'
  }
}

/**
 * Get verification type label (Korean)
 */
export function getVerificationTypeLabel(type: VerificationType | string): string {
  switch (type) {
    // 📄 문서 기반 인증
    case VerificationType.STUDENT:
    case 'student':
      return '학생 인증'
    case VerificationType.WORK:
    case 'work':
      return '재직 인증'
    case VerificationType.FAMILY:
    case 'family':
      return '가족 인증'
    case VerificationType.RESIDENT:
    case 'resident':
      return '거주 인증'
    case VerificationType.BUSINESS:
    case 'business':
      return '사업자 인증'

    // 🌟 경험 기반 인증 (NEW)
    case VerificationType.MENTOR:
    case 'mentor':
      return '멘토 인증'
    case VerificationType.EXPERIENCED:
    case 'experienced':
      return '선경험자 인증'
    case VerificationType.COMMUNITY_LEADER:
    case 'community_leader':
      return '커뮤니티 리더'
    case VerificationType.SPECIALIST:
    case 'specialist':
      return '전문가 인증'

    case VerificationType.OTHER:
    case 'other':
    default:
      return '기타 인증'
  }
}

/**
 * Get verification method label (Korean)
 */
export function getVerificationMethodLabel(method: VerificationMethod | string): string {
  switch (method) {
    case VerificationMethod.DOCUMENT:
    case 'document':
      return '문서 기반'
    case VerificationMethod.EXPERIENCE:
    case 'experience':
      return '경험 기반'
    case VerificationMethod.HYBRID:
    case 'hybrid':
      return '혼합 인증'
    default:
      return '알 수 없음'
  }
}

/**
 * Check if verification type is experience-based
 */
export function isExperienceBasedVerification(type: VerificationType | string): boolean {
  return [
    VerificationType.MENTOR,
    VerificationType.EXPERIENCED,
    VerificationType.COMMUNITY_LEADER,
    VerificationType.SPECIALIST,
    'mentor',
    'experienced',
    'community_leader',
    'specialist'
  ].includes(type as VerificationType)
}

/**
 * Check if verification type is document-based
 */
export function isDocumentBasedVerification(type: VerificationType | string): boolean {
  return [
    VerificationType.STUDENT,
    VerificationType.WORK,
    VerificationType.FAMILY,
    VerificationType.RESIDENT,
    VerificationType.BUSINESS,
    'student',
    'work',
    'family',
    'resident',
    'business'
  ].includes(type as VerificationType)
}

/**
 * Get estimated review hours based on verification method
 */
export function getEstimatedReviewHours(method: VerificationMethod | string): number {
  switch (method) {
    case VerificationMethod.DOCUMENT:
    case 'document':
      return 24 // Fast track: 24시간
    case VerificationMethod.EXPERIENCE:
    case 'experience':
      return 60 // Portfolio track: 48-72시간 (평균 60)
    case VerificationMethod.HYBRID:
    case 'hybrid':
      return 48 // Mixed: 48시간
    default:
      return 24
  }
}

/**
 * Get verification type description for user guidance
 */
export function getVerificationTypeDescription(type: VerificationType | string): string {
  switch (type) {
    // 📄 문서 기반 인증
    case VerificationType.STUDENT:
    case 'student':
      return '재학증명서를 통한 학생 신분 인증'
    case VerificationType.WORK:
    case 'work':
      return '재직증명서를 통한 재직자 인증'
    case VerificationType.FAMILY:
    case 'family':
      return '가족관계증명서를 통한 가족 비자 인증'
    case VerificationType.RESIDENT:
    case 'resident':
      return '외국인등록증을 통한 거주자 인증'
    case VerificationType.BUSINESS:
    case 'business':
      return '사업자등록증을 통한 사업자 인증'

    // 🌟 경험 기반 인증 (NEW)
    case VerificationType.MENTOR:
    case 'mentor':
      return '한국어 교육, 상담 멘토링 경력 증명'
    case VerificationType.EXPERIENCED:
    case 'experienced':
      return '한국 거주 및 실무 경험 증명'
    case VerificationType.COMMUNITY_LEADER:
    case 'community_leader':
      return '온라인 커뮤니티 활동 및 기여도 증명'
    case VerificationType.SPECIALIST:
    case 'specialist':
      return '특정 분야 전문성 및 포트폴리오 증명'

    default:
      return '기타 인증 방식'
  }
}

/**
 * Get verification requirements (what documents/materials are needed)
 */
export function getVerificationRequirements(type: VerificationType | string): {
  required: string[]
  optional: string[]
  reviewTime: string
} {
  if (isExperienceBasedVerification(type)) {
    // 경험 기반 인증 요구사항
    return {
      required: [
        '경험 포트폴리오 (강의 자료, 블로그, SNS 등)',
        '활동 이력 증명 (추천서, 후기, 인증서 등)',
        '전문 분야 설명'
      ],
      optional: [
        '관련 자격증',
        '수상 경력',
        '미디어 노출 자료'
      ],
      reviewTime: '48-72시간'
    }
  }

  if (isDocumentBasedVerification(type)) {
    // 문서 기반 인증 요구사항
    return {
      required: [
        '외국인등록증 또는 여권 사본',
        '재직/재학 증명서 (해당 시)',
        '비자 정보'
      ],
      optional: [
        '졸업증명서',
        '경력증명서'
      ],
      reviewTime: '24시간'
    }
  }

  // 기타
  return {
    required: ['인증 자료'],
    optional: [],
    reviewTime: '24-48시간'
  }
}
/**
 * Permission System Utilities
 * Core logic for 4-tier permission checking and role management
 */

import { UserRole, VerificationStatus, PermissionChecker, LayoutConfig, ExtendedUser } from '../types/permissions'

// Re-export commonly used types
export { UserRole, VerificationStatus } from '../types/permissions'

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

  canAccessExpertFeatures: (role: UserRole): boolean => {
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
        'expert_badge',
        'priority_display',
        'expert_network',
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
        'expert_badge',
        'priority_display',
        'expert_network',
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
        showExpertNetwork: false,
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
        showExpertNetwork: true,
        showAdminPanel: false,
        bannerVariant: 'expert-network',
        prioritizeContent: 'experts',
        label: roleInfo.label,
        icon: roleInfo.icon,
        badgeColor: roleInfo.badgeColor,
        bgColor: roleInfo.bgColor || roleInfo.badgeColor
      }

    case UserRole.ADMIN:
      return {
        showGuestBanner: false,
        showVerificationCTA: false,
        showExpertNetwork: true,
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
        showExpertNetwork: false,
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
/**
 * 4-Tier Permission System for Viet K-Connect
 * Based on PDF requirements for comprehensive user role management
 */

// Core 4-tier permission enum
export enum UserRole {
  GUEST = 'guest',        // 게스트 - 비로그인 사용자
  USER = 'user',          // 일반사용자 - 기본 로그인 사용자
  VERIFIED = 'verified',  // 인증사용자 - 문서 인증 완료
  ADMIN = 'admin'         // 관리자 - 플랫폼 관리
}

// Verification status for document authentication
export enum VerificationStatus {
  NONE = 'none',           // 인증 신청 안함
  PENDING = 'pending',     // 인증 검토 중
  APPROVED = 'approved',   // 인증 승인
  REJECTED = 'rejected',   // 인증 거부
  EXPIRED = 'expired'      // 인증 만료
}

// Verification document types
export enum VerificationType {
  STUDENT = 'student',     // 학생비자 (D-2)
  WORK = 'work',          // 취업비자 (E-7, E-1, etc.)
  FAMILY = 'family',      // 가족비자 (F-1, F-3)
  RESIDENT = 'resident',  // 거주비자 (F-2, F-5)
  OTHER = 'other'         // 기타
}

// Visa types supported
export type VisaType =
  | 'D-2'   // 유학생
  | 'E-1'   // 교수
  | 'E-2'   // 회화지도
  | 'E-7'   // 특정활동
  | 'F-1'   // 방문동거
  | 'F-2'   // 거주
  | 'F-3'   // 동반
  | 'F-4'   // 재외동포
  | 'F-5'   // 영주
  | 'F-6'   // 결혼이민
  | 'other' // 기타

// Permission matrix for each role
export interface PermissionMatrix {
  [UserRole.GUEST]: {
    access: ['read_only']
    restrictions: ['question_create', 'answer_create', 'vote', 'comment']
    guidance: 'login_required_banner'
  }
  [UserRole.USER]: {
    access: ['question_create', 'answer_create', 'vote', 'comment', 'basic_profile']
    restrictions: ['expert_features', 'priority_display', 'admin_features']
  }
  [UserRole.VERIFIED]: {
    access: ['all_user_features', 'expert_badge', 'priority_display', 'expert_network']
    verification_required: ['document_upload', 'admin_approval']
  }
  [UserRole.ADMIN]: {
    access: ['all_features', 'user_management', 'verification_approval', 'platform_stats']
  }
}

// User verification data structure
export interface UserVerification {
  id: string
  user_id: string
  verification_type: VerificationType
  visa_document_url: string      // 필수: 비자 문서
  diploma_document_url?: string  // 선택: 졸업증명서
  employment_document_url?: string // 선택: 재직증명서
  status: VerificationStatus
  admin_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
}

// Site banner system for dynamic A/B layout
export interface SiteBanner {
  id: string
  title: string
  content: string
  banner_type: 'header' | 'sidebar' | 'content' | 'footer' | 'floating'
  target_roles: UserRole[]
  position: 'top' | 'middle' | 'bottom'
  variant: 'default' | 'compact' | 'detailed' | 'minimal'
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
}

// Extended user type with 4-tier system
export interface ExtendedUser {
  id: string
  email: string
  name: string
  avatar_url?: string

  // Permission system
  role: UserRole
  verification_status: VerificationStatus
  verification_type?: VerificationType

  // Profile information (for verification)
  visa_type?: VisaType
  company?: string
  years_in_korea?: number
  region?: string
  specialty_areas?: string[]
  preferred_language: string

  // Verification timestamps
  verified_at?: string
  verification_expires_at?: string

  // Legacy compatibility
  is_verified: boolean
  trust_score: number
  badges: Record<string, boolean>

  created_at: string
  last_active: string
}

// Permission check utilities
export interface PermissionChecker {
  canCreateQuestion: (role: UserRole) => boolean
  canCreateAnswer: (role: UserRole) => boolean
  canVote: (role: UserRole) => boolean
  canComment: (role: UserRole) => boolean
  canAccessExpertFeatures: (role: UserRole) => boolean
  canManageUsers: (role: UserRole) => boolean
  canApproveVerifications: (role: UserRole) => boolean
  hasAccess: (role: UserRole, permission: string) => boolean
}

// A/B Layout configuration based on user role
export interface LayoutConfig {
  showGuestBanner: boolean
  showVerificationCTA: boolean
  showExpertNetwork: boolean
  showAdminPanel: boolean
  bannerVariant: 'registration-cta' | 'expert-network' | 'admin-tools'
  prioritizeContent: 'questions' | 'experts' | 'management'
  label: string
  icon: string
  badgeColor: string
  bgColor: string
}

// Notification preferences by role
export interface NotificationPreferences {
  channels: ('in_app' | 'email' | 'push' | 'kakao')[]
  types: {
    new_answer: boolean
    expert_match: boolean
    answer_accepted: boolean
    verification_update: boolean
    admin_alert: boolean
    weekly_digest: boolean
  }
}
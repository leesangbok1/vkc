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
  // 📄 문서 기반 인증 (Document-based Verification)
  STUDENT = 'student',     // 학생비자 (D-2) - 재학증명서
  WORK = 'work',          // 취업비자 (E-7, E-1, etc.) - 재직증명서
  FAMILY = 'family',      // 가족비자 (F-1, F-3) - 가족관계증명서
  RESIDENT = 'resident',  // 거주비자 (F-2, F-5) - 외국인등록증
  BUSINESS = 'business',  // 사업비자 - 사업자등록증

  // 🌟 경험 기반 인증 (Experience-based Verification) - NEW
  MENTOR = 'mentor',              // 멘토/강사 - 교육 경력, 멘토링 이력
  EXPERIENCED = 'experienced',    // 선경험자 - 한국 거주 경험, 실무 경력
  COMMUNITY_LEADER = 'community_leader', // 커뮤니티 리더 - 온라인 활동, 기여도
  SPECIALIST = 'specialist',      // 전문가 - 특정 분야 전문성, 포트폴리오

  OTHER = 'other'         // 기타
}

// Verification method (인증 방식)
export enum VerificationMethod {
  DOCUMENT = 'document',    // 문서 기반 (24시간 심사)
  EXPERIENCE = 'experience', // 경험 기반 (48-72시간 심사)
  HYBRID = 'hybrid'         // 혼합 (문서 + 경험)
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

// Experience portfolio item structure (경험 포트폴리오 아이템)
export interface ExperiencePortfolioItem {
  type: 'teaching' | 'blog' | 'sns' | 'community' | 'consulting' | 'other'
  title: string
  url?: string
  description: string
  files?: string[]  // Document URLs
  date: string
  metadata?: {
    students_count?: number
    rating?: number
    duration_months?: number
    mentees?: number
    success_rate?: number
    [key: string]: any
  }
}

// User verification data structure
export interface UserVerification {
  id: string
  user_id: string
  verification_type: VerificationType
  verification_method: VerificationMethod // NEW: 인증 방식

  // 📄 문서 기반 필드 (Document-based fields)
  visa_document_url?: string      // 선택적으로 변경 (경험 기반은 불필요)
  diploma_document_url?: string  // 선택: 졸업증명서
  employment_document_url?: string // 선택: 재직증명서

  // 🌟 경험 기반 필드 (Experience-based fields) - NEW
  experience_portfolio?: ExperiencePortfolioItem[] // 경험 포트폴리오
  mentoring_experience?: string   // 멘토링 경력 요약
  community_stats?: {
    answers: number
    accepted: number
    helpful_votes: number
  }

  status: VerificationStatus
  admin_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  estimated_review_hours?: number // 예상 심사 시간
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
  verification_method?: VerificationMethod // NEW: 인증 방식

  // Profile information (for verification)
  visa_type?: VisaType
  company?: string
  years_in_korea?: number
  region?: string
  specialty_areas?: string[]
  preferred_language: string

  // 🌟 경험 기반 필드 (Experience-based fields) - NEW
  experience_portfolio?: ExperiencePortfolioItem[]
  mentoring_experience?: string
  community_stats?: {
    answers: number
    accepted: number
    helpful_votes: number
  }

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
  canAccessCertifiedFeatures: (role: UserRole) => boolean // renamed for clarity
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
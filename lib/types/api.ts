// API 응답과 Supabase 쿼리를 위한 공통 타입 정의

import { Database } from '@/lib/supabase'

// Supabase 테이블 타입 단축어
export type Tables = Database['public']['Tables']
export type User = Tables['users']['Row']
export type Question = Tables['questions']['Row']
export type Answer = Tables['answers']['Row']
export type Comment = Tables['comments']['Row']
export type Vote = Tables['votes']['Row']
export type Notification = Tables['notifications']['Row']
export type Category = Tables['categories']['Row']

// API 응답 표준 타입
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiErrorResponse {
  error: string
  details?: unknown
  code?: string
}

// 확장된 타입 (관계형 데이터 포함)
export interface QuestionWithRelations extends Question {
  author: User
  category: Category
  answers?: AnswerWithRelations[]
  _count?: {
    answers: number
    votes: number
    comments: number
  }
}

export interface AnswerWithRelations extends Answer {
  author: User
  question?: Question
  votes?: Vote[]
  comments?: CommentWithRelations[]
  _count?: {
    votes: number
    comments: number
  }
}

export interface CommentWithRelations extends Comment {
  author: User
  question?: Question
  answer?: Answer
}

export interface UserWithStats extends User {
  _count?: {
    questions: number
    answers: number
    helpful_answers: number
  }
}

// Supabase 쿼리 응답 타입 헬퍼
export type SupabaseResponse<T> = {
  data: T | null
  error: unknown
}

export type SupabaseArrayResponse<T> = {
  data: T[] | null
  error: unknown
}

// 일반적인 Supabase 쿼리 결과 타입
export type QuestionWithAuthor = {
  id: string
  title: string
  content: string
  author_id: string
  category_id: number
  tags: string[]
  urgency: string
  view_count: number
  answer_count: number
  upvote_count: number
  downvote_count: number
  status: string
  is_pinned: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  author: {
    id: string
    name: string
    email: string
    avatar_url: string | null
    role: string
    verification_status: string
    trust_score: number
    years_in_korea: number | null
    visa_type: string | null
  }
  category: {
    id: number
    name: string
    slug: string
    icon: string | null
    color: string
  }
}

export type AnswerWithAuthor = {
  id: string
  content: string
  question_id: string
  author_id: string
  is_accepted: boolean
  upvote_count: number
  downvote_count: number
  helpful_count: number
  created_at: string
  updated_at: string
  author: {
    id: string
    name: string
    email: string
    avatar_url: string | null
    role: string
    verification_status: string
    trust_score: number
    years_in_korea: number | null
    visa_type: string | null
  }
  question?: {
    id: string
    title: string
    author_id: string
  }
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 검색 타입
export interface SearchParams {
  q?: string
  category?: string
  tags?: string[]
  status?: string
  author?: string
  urgent?: boolean
}

// 투표 타입
export interface VoteData {
  target_id: string
  target_type: 'question' | 'answer' | 'comment'
  vote_type: 'upvote' | 'downvote'
}

// 알림 타입
export interface NotificationData {
  type: 'question_answered' | 'answer_accepted' | 'comment_added' | 'vote_received'
  title: string
  message: string
  data?: Record<string, unknown>
  fromUserId?: string
  questionId?: string
  answerId?: string
  commentId?: string
}

// 사용자 인증 타입
export interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url: string | null
  role: 'guest' | 'user' | 'verified' | 'admin'
  verification_status: 'none' | 'pending' | 'approved' | 'rejected' | 'expired'
  trust_score: number
}

// 폼 데이터 타입
export interface QuestionFormData {
  title: string
  content: string
  category_id: number
  tags: string[]
  urgency: 'low' | 'normal' | 'high' | 'urgent'
}

export interface AnswerFormData {
  content: string
  question_id: string
}

export interface CommentFormData {
  content: string
  target_id: string
  target_type: 'question' | 'answer'
  parent_comment_id?: string
}

// 타입 가드 함수들
export function isQuestionWithRelations(obj: unknown): obj is QuestionWithRelations {
  return typeof obj === 'object' && obj !== null && 'title' in obj && 'author' in obj
}

export function isAnswerWithRelations(obj: unknown): obj is AnswerWithRelations {
  return typeof obj === 'object' && obj !== null && 'content' in obj && 'question_id' in obj && 'author' in obj
}

export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  return typeof obj === 'object' && obj !== null && 'success' in obj
}
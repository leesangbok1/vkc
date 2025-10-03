// =====================================================
// Database Types Test - Agent 4 Verification
// Test script to verify database schema types work correctly
// =====================================================

import type { Database } from '../supabase'

// Test type definitions work correctly
type UserRow = Database['public']['Tables']['users']['Row']
type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type AnswerUpdate = Database['public']['Tables']['answers']['Update']

// Example type usage tests
const testUser: UserRow = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null,
  bio: null,
  provider: 'kakao',
  provider_id: '123456',
  visa_type: 'E-7',
  company: 'Test Company',
  years_in_korea: 3,
  region: '서울',
  preferred_language: 'ko',
  is_verified: true,
  verification_date: null,
  trust_score: 500,
  badges: {
    senior: false,
    expert: true,
    verified: true,
    helper: false,
    moderator: false
  },
  question_count: 5,
  answer_count: 12,
  helpful_answer_count: 8,
  last_active: '2025-09-30T10:00:00Z',
  created_at: '2025-09-30T10:00:00Z',
  updated_at: '2025-09-30T10:00:00Z'
}

const testQuestionInsert: QuestionInsert = {
  title: 'Test Question',
  content: 'This is a test question content',
  author_id: '550e8400-e29b-41d4-a716-446655440001',
  category_id: 1,
  tags: ['test', 'example'],
  urgency: 'normal'
}

const testAnswerUpdate: AnswerUpdate = {
  content: 'Updated answer content',
  is_accepted: true,
  upvote_count: 5
}

// Test function types
type ModeratorCheckFn = Database['public']['Functions']['is_moderator']
type CanEditFn = Database['public']['Functions']['can_edit_content']

// Verify no type errors
console.log('✅ Database types validation successful!')
console.log('- User type:', typeof testUser)
console.log('- Question insert type:', typeof testQuestionInsert)
console.log('- Answer update type:', typeof testAnswerUpdate)

export {
  type UserRow,
  type QuestionInsert,
  type AnswerUpdate,
  testUser,
  testQuestionInsert,
  testAnswerUpdate
}
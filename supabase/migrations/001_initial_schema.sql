-- =====================================================
-- Viet K-Connect Initial Migration
-- Created by Agent 4 - Database Schema Implementation
-- Date: 2025-09-30
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =====================================================
-- SCHEMA CREATION
-- =====================================================

-- 1. Users table (Enhanced)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,

  -- OAuth Provider Info
  provider VARCHAR(50),
  provider_id VARCHAR(255),

  -- K-Connect Specific Fields
  visa_type VARCHAR(20),
  company VARCHAR(100),
  years_in_korea INTEGER CHECK (years_in_korea >= 0 AND years_in_korea <= 50),
  region VARCHAR(50),
  preferred_language VARCHAR(10) DEFAULT 'ko',

  -- Trust & Verification System
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  trust_score INTEGER DEFAULT 0,

  -- Community Badges
  badges JSONB DEFAULT '{
    "senior": false,
    "expert": false,
    "verified": false,
    "helper": false,
    "moderator": false
  }'::jsonb,

  -- Activity Tracking
  question_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  helpful_answer_count INTEGER DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7) DEFAULT '#EA4335',
  parent_id INTEGER REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Questions table (Enhanced)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',

  -- AI Classification
  ai_category_confidence FLOAT CHECK (ai_category_confidence >= 0 AND ai_category_confidence <= 1),
  ai_tags TEXT[] DEFAULT '{}',
  urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),

  -- Expert Matching
  matched_experts UUID[] DEFAULT '{}',
  expert_notifications_sent BOOLEAN DEFAULT false,

  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,

  -- Status Management
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resolved', 'archived')),
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Moderation
  is_reported BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,

  -- Search vector
  search_vector tsvector
);

-- 4. Answers table (Enhanced)
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_answer_id UUID REFERENCES answers(id),

  -- Status
  is_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id),

  -- Engagement Metrics
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,

  -- Moderation
  is_reported BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,

  -- AI Analysis
  ai_helpfulness_score FLOAT CHECK (ai_helpfulness_score >= 0 AND ai_helpfulness_score <= 1),
  ai_sentiment VARCHAR(20) CHECK (ai_sentiment IN ('positive', 'neutral', 'negative')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Search vector
  search_vector tsvector
);

-- 5. Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'answer', 'comment')),
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down', 'helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one vote per user per target
  UNIQUE(user_id, target_id, target_type, vote_type)
);

-- 6. Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'answer')),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id),

  -- Engagement
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,

  -- Moderation
  is_reported BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Notification Details
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'new_answer', 'answer_accepted', 'question_commented',
    'answer_commented', 'expert_matched', 'question_upvoted',
    'answer_upvoted', 'weekly_digest', 'mention'
  )),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,

  -- Related Content
  related_id UUID,
  related_type VARCHAR(20) CHECK (related_type IN ('question', 'answer', 'comment', 'user')),

  -- Delivery Status
  is_read BOOLEAN DEFAULT false,
  is_email_sent BOOLEAN DEFAULT false,
  is_push_sent BOOLEAN DEFAULT false,
  is_kakao_sent BOOLEAN DEFAULT false,

  -- Channel Preferences
  channels JSONB DEFAULT '["in_app"]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users(is_verified, trust_score);
CREATE INDEX IF NOT EXISTS idx_users_activity ON users(last_active);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(region, years_in_korea);

-- Questions table indexes
CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status, is_approved);
CREATE INDEX IF NOT EXISTS idx_questions_activity ON questions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_engagement ON questions(upvote_count DESC, answer_count DESC);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_questions_search ON questions USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_questions_urgency ON questions(urgency, created_at);

-- Answers table indexes
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_answers_accepted ON answers(is_accepted, accepted_at);
CREATE INDEX IF NOT EXISTS idx_answers_engagement ON answers(upvote_count DESC, helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_answers_search ON answers USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_answers_created ON answers(created_at DESC);

-- Votes table indexes
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_type ON votes(vote_type, created_at);

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at) WHERE is_read = false;

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update search vectors
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS trigger AS $$
BEGIN
  IF TG_TABLE_NAME = 'questions' THEN
    NEW.search_vector := to_tsvector('korean',
      COALESCE(NEW.title, '') || ' ' ||
      COALESCE(NEW.content, '') || ' ' ||
      COALESCE(array_to_string(NEW.tags, ' '), '')
    );
  ELSIF TG_TABLE_NAME = 'answers' THEN
    NEW.search_vector := to_tsvector('korean', COALESCE(NEW.content, ''));
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for search vector updates
DROP TRIGGER IF EXISTS update_questions_search_vector ON questions;
CREATE TRIGGER update_questions_search_vector
  BEFORE INSERT OR UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS update_answers_search_vector ON answers;
CREATE TRIGGER update_answers_search_vector
  BEFORE INSERT OR UPDATE ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

-- Function to update question stats
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE questions
    SET answer_count = answer_count + 1,
        last_activity_at = NOW()
    WHERE id = NEW.question_id;

    UPDATE users
    SET answer_count = answer_count + 1
    WHERE id = NEW.author_id;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE questions
    SET answer_count = answer_count - 1,
        last_activity_at = NOW()
    WHERE id = OLD.question_id;

    UPDATE users
    SET answer_count = answer_count - 1
    WHERE id = OLD.author_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for question stats
DROP TRIGGER IF EXISTS update_question_stats_trigger ON answers;
CREATE TRIGGER update_question_stats_trigger
  AFTER INSERT OR DELETE ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_question_stats();

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS trigger AS $$
DECLARE
  vote_change INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    vote_change := 1;
  ELSIF TG_OP = 'DELETE' THEN
    vote_change := -1;
  ELSE
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.target_type, OLD.target_type) = 'question' THEN
    IF COALESCE(NEW.vote_type, OLD.vote_type) = 'up' THEN
      UPDATE questions
      SET upvote_count = upvote_count + vote_change
      WHERE id = COALESCE(NEW.target_id, OLD.target_id);
    ELSIF COALESCE(NEW.vote_type, OLD.vote_type) = 'down' THEN
      UPDATE questions
      SET downvote_count = downvote_count + vote_change
      WHERE id = COALESCE(NEW.target_id, OLD.target_id);
    ELSIF COALESCE(NEW.vote_type, OLD.vote_type) = 'helpful' THEN
      UPDATE questions
      SET helpful_count = helpful_count + vote_change
      WHERE id = COALESCE(NEW.target_id, OLD.target_id);
    END IF;
  ELSIF COALESCE(NEW.target_type, OLD.target_type) = 'answer' THEN
    IF COALESCE(NEW.vote_type, OLD.vote_type) = 'up' THEN
      UPDATE answers
      SET upvote_count = upvote_count + vote_change
      WHERE id = COALESCE(NEW.target_id, OLD.target_id);
    ELSIF COALESCE(NEW.vote_type, OLD.vote_type) = 'down' THEN
      UPDATE answers
      SET downvote_count = downvote_count + vote_change
      WHERE id = COALESCE(NEW.target_id, OLD.target_id);
    ELSIF COALESCE(NEW.vote_type, OLD.vote_type) = 'helpful' THEN
      UPDATE answers
      SET helpful_count = helpful_count + vote_change
      WHERE id = COALESCE(NEW.target_id, OLD.target_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote counts
DROP TRIGGER IF EXISTS update_vote_counts_trigger ON votes;
CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_counts();

-- =====================================================
-- INITIAL DATA - CATEGORIES
-- =====================================================

INSERT INTO categories (name, slug, description, icon, color, sort_order, is_active) VALUES
('비자/법률', 'visa-legal', '비자, 체류, 법률 관련 질문', '🛂', '#EA4335', 1, true),
('취업/창업', 'job-business', '취업, 창업, 사업 관련 질문', '💼', '#4285F4', 2, true),
('생활정보', 'life-info', '일상생활, 쇼핑, 교통 관련 질문', '🏠', '#34A853', 3, true),
('교육/언어', 'education-language', '한국어, 교육, 학습 관련 질문', '📚', '#FBBC04', 4, true),
('의료/건강', 'health-medical', '병원, 보험, 건강 관련 질문', '🏥', '#FF6D01', 5, true),
('금융/세금', 'finance-tax', '은행, 세금, 투자 관련 질문', '💰', '#9AA0A6', 6, true),
('부동산', 'real-estate', '주택, 임대, 부동산 관련 질문', '🏢', '#AB47BC', 7, true),
('문화/여행', 'culture-travel', '문화, 여행, 관광 관련 질문', '🎭', '#FF7043', 8, true),
('기술/IT', 'tech-it', '기술, IT, 디지털 관련 질문', '💻', '#26C6DA', 9, true),
('기타', 'others', '기타 분류되지 않은 질문', '❓', '#78909C', 10, true)
ON CONFLICT (slug) DO NOTHING;
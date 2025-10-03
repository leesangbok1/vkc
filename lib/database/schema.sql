-- =====================================================
-- Viet K-Connect Database Schema
-- Agent 4 Implementation - Complete Database Design
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =====================================================
-- 1. USERS TABLE (Enhanced from existing)
-- =====================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,

  -- OAuth Provider Info
  provider VARCHAR(50), -- 'kakao', 'google', 'facebook'
  provider_id VARCHAR(255),

  -- K-Connect Specific Fields
  visa_type VARCHAR(20), -- E-1, E-2, E-7, F-2, F-4, F-5, etc.
  company VARCHAR(100),
  years_in_korea INTEGER CHECK (years_in_korea >= 0 AND years_in_korea <= 50),
  region VARCHAR(50), -- Seoul, Busan, Daegu, etc.
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

-- =====================================================
-- 2. CATEGORIES TABLE
-- =====================================================

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- emoji or icon name
  color VARCHAR(7) DEFAULT '#EA4335', -- hex color code
  parent_id INTEGER REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. QUESTIONS TABLE (Enhanced)
-- =====================================================

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,

  -- Author Information
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Categorization
  category_id INTEGER NOT NULL REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',

  -- AI Classification Results
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

  -- Search vector for full-text search
  search_vector tsvector
);

-- =====================================================
-- 4. ANSWERS TABLE (Enhanced)
-- =====================================================

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,

  -- Relationships
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_answer_id UUID REFERENCES answers(id), -- for threaded replies

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

-- =====================================================
-- 5. VOTES TABLE (For Questions and Answers)
-- =====================================================

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'answer', 'comment')),
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down', 'helpful')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one vote per user per target
  UNIQUE(user_id, target_id, target_type, vote_type)
);

-- =====================================================
-- 6. COMMENTS TABLE
-- =====================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,

  -- Relationships
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'answer')),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id), -- for nested comments

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

-- =====================================================
-- 7. NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE notifications (
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
  related_id UUID, -- ID of related question/answer/comment
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
-- 8. USER_SESSIONS TABLE (For Auth Management)
-- =====================================================

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session Details
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,

  -- Session Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. EXPERT_PROFILES TABLE (Extended User Info)
-- =====================================================

CREATE TABLE expert_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Expertise Information
  specialties TEXT[] DEFAULT '{}',
  experience_years INTEGER CHECK (experience_years >= 0),
  certifications JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '["ko"]'::jsonb,

  -- Expert Metrics
  response_rate FLOAT DEFAULT 0 CHECK (response_rate >= 0 AND response_rate <= 1),
  avg_response_time_hours INTEGER DEFAULT 24,
  satisfaction_score FLOAT DEFAULT 0 CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5),
  total_helped INTEGER DEFAULT 0,

  -- Availability
  is_available BOOLEAN DEFAULT true,
  availability_schedule JSONB DEFAULT '{}'::jsonb,
  max_questions_per_week INTEGER DEFAULT 10,

  -- Contact Preferences
  notification_preferences JSONB DEFAULT '{
    "new_match": true,
    "urgent_questions": true,
    "weekly_summary": false
  }'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. QUESTION_VIEWS TABLE (For Analytics)
-- =====================================================

CREATE TABLE question_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- null for anonymous views

  -- View Details
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  session_id VARCHAR(255),

  -- View Duration (for engagement metrics)
  view_duration_seconds INTEGER DEFAULT 0,

  -- Timestamps
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. AUDIT_LOGS TABLE (For Security & Compliance)
-- =====================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who & What
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),

  -- Details
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Request Context
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE INDEX idx_users_verification ON users(is_verified, trust_score);
CREATE INDEX idx_users_activity ON users(last_active);
CREATE INDEX idx_users_location ON users(region, years_in_korea);

-- Questions table indexes
CREATE INDEX idx_questions_author ON questions(author_id);
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_status ON questions(status, is_approved);
CREATE INDEX idx_questions_activity ON questions(last_activity_at DESC);
CREATE INDEX idx_questions_engagement ON questions(upvote_count DESC, answer_count DESC);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX idx_questions_search ON questions USING GIN(search_vector);
CREATE INDEX idx_questions_urgency ON questions(urgency, created_at);

-- Answers table indexes
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_answers_author ON answers(author_id);
CREATE INDEX idx_answers_accepted ON answers(is_accepted, accepted_at);
CREATE INDEX idx_answers_engagement ON answers(upvote_count DESC, helpful_count DESC);
CREATE INDEX idx_answers_search ON answers USING GIN(search_vector);
CREATE INDEX idx_answers_created ON answers(created_at DESC);

-- Votes table indexes
CREATE INDEX idx_votes_target ON votes(target_id, target_type);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_type ON votes(vote_type, created_at);

-- Comments table indexes
CREATE INDEX idx_comments_target ON comments(target_id, target_type);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- Notifications table indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(type, created_at);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at) WHERE is_read = false;

-- Question views indexes
CREATE INDEX idx_question_views_question ON question_views(question_id);
CREATE INDEX idx_question_views_user ON question_views(user_id);
CREATE INDEX idx_question_views_date ON question_views(viewed_at);

-- Expert profiles indexes
CREATE INDEX idx_expert_profiles_user ON expert_profiles(user_id);
CREATE INDEX idx_expert_profiles_specialties ON expert_profiles USING GIN(specialties);
CREATE INDEX idx_expert_profiles_availability ON expert_profiles(is_available, response_rate);

-- Categories table indexes
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active, sort_order);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Sessions table indexes
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at);

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
CREATE TRIGGER update_questions_search_vector
  BEFORE INSERT OR UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

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
CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_counts();

-- Function to update user activity
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS trigger AS $$
BEGIN
  UPDATE users
  SET last_active = NOW()
  WHERE id = NEW.author_id OR id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for user activity
CREATE TRIGGER update_user_activity_questions
  AFTER INSERT ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER update_user_activity_answers
  AFTER INSERT ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER update_user_activity_comments
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity();
-- =====================================================
-- Viet K-Connect Row Level Security (RLS) Policies
-- Created by Agent 4 - Security Implementation
-- Date: 2025-09-30
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Public profiles are viewable by everyone
CREATE POLICY "Users profiles are publicly viewable" ON users
  FOR SELECT USING (true);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users cannot delete their profile (only admins)
CREATE POLICY "Only admins can delete user profiles" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND badges->>'moderator' = 'true'
    )
  );

-- =====================================================
-- CATEGORIES TABLE POLICIES
-- =====================================================

-- Categories are viewable by everyone
CREATE POLICY "Categories are publicly viewable" ON categories
  FOR SELECT USING (is_active = true);

-- Only admins can modify categories
CREATE POLICY "Only admins can modify categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND badges->>'moderator' = 'true'
    )
  );

-- =====================================================
-- QUESTIONS TABLE POLICIES
-- =====================================================

-- All approved questions are viewable by everyone
CREATE POLICY "Approved questions are publicly viewable" ON questions
  FOR SELECT USING (is_approved = true);

-- Authenticated users can create questions
CREATE POLICY "Authenticated users can create questions" ON questions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = author_id
  );

-- Users can update their own questions (within 24 hours or if no answers)
CREATE POLICY "Users can update their own questions" ON questions
  FOR UPDATE USING (
    auth.uid() = author_id AND
    (
      created_at > NOW() - INTERVAL '24 hours' OR
      answer_count = 0
    )
  );

-- Question authors can delete their own questions (if no answers)
CREATE POLICY "Users can delete their own questions without answers" ON questions
  FOR DELETE USING (
    auth.uid() = author_id AND
    answer_count = 0
  );

-- Moderators can modify any question
CREATE POLICY "Moderators can modify any question" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND badges->>'moderator' = 'true'
    )
  );

-- =====================================================
-- ANSWERS TABLE POLICIES
-- =====================================================

-- All approved answers are viewable by everyone
CREATE POLICY "Approved answers are publicly viewable" ON answers
  FOR SELECT USING (is_approved = true);

-- Authenticated users can create answers
CREATE POLICY "Authenticated users can create answers" ON answers
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = author_id
  );

-- Users can update their own answers (within 1 hour or if not accepted)
CREATE POLICY "Users can update their own answers" ON answers
  FOR UPDATE USING (
    auth.uid() = author_id AND
    (
      created_at > NOW() - INTERVAL '1 hour' OR
      is_accepted = false
    )
  );

-- Answer authors can delete their own answers (if not accepted)
CREATE POLICY "Users can delete their own non-accepted answers" ON answers
  FOR DELETE USING (
    auth.uid() = author_id AND
    is_accepted = false
  );

-- Question authors can accept/reject answers to their questions
CREATE POLICY "Question authors can accept answers" ON answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM questions
      WHERE id = question_id
      AND author_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions
      WHERE id = question_id
      AND author_id = auth.uid()
    )
  );

-- Moderators can modify any answer
CREATE POLICY "Moderators can modify any answer" ON answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND badges->>'moderator' = 'true'
    )
  );

-- =====================================================
-- VOTES TABLE POLICIES
-- =====================================================

-- Users can view all votes (for displaying counts)
CREATE POLICY "Vote counts are publicly viewable" ON votes
  FOR SELECT USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id AND
    -- Users cannot vote on their own content
    NOT EXISTS (
      SELECT 1 FROM questions
      WHERE id = target_id
      AND target_type = 'question'
      AND author_id = auth.uid()
    ) AND
    NOT EXISTS (
      SELECT 1 FROM answers
      WHERE id = target_id
      AND target_type = 'answer'
      AND author_id = auth.uid()
    )
  );

-- Users can change their own votes
CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can remove their own votes
CREATE POLICY "Users can delete their own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- COMMENTS TABLE POLICIES
-- =====================================================

-- All approved comments are viewable by everyone
CREATE POLICY "Approved comments are publicly viewable" ON comments
  FOR SELECT USING (is_approved = true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = author_id
  );

-- Users can update their own comments (within 5 minutes)
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (
    auth.uid() = author_id AND
    created_at > NOW() - INTERVAL '5 minutes'
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- Moderators can modify any comment
CREATE POLICY "Moderators can modify any comment" ON comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND badges->>'moderator' = 'true'
    )
  );

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- System can create notifications (via service role)
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can mark their notifications as read" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ADDITIONAL SECURITY FUNCTIONS
-- =====================================================

-- Function to check if user is moderator
CREATE OR REPLACE FUNCTION is_moderator(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND badges->>'moderator' = 'true'
  );
$$;

-- Function to check if user is question author
CREATE OR REPLACE FUNCTION is_question_author(question_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM questions
    WHERE id = question_id
    AND author_id = user_id
  );
$$;

-- Function to check if user can edit content
CREATE OR REPLACE FUNCTION can_edit_content(content_type TEXT, content_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT CASE content_type
    WHEN 'question' THEN
      EXISTS (
        SELECT 1 FROM questions
        WHERE id = content_id
        AND author_id = user_id
        AND (created_at > NOW() - INTERVAL '24 hours' OR answer_count = 0)
      )
    WHEN 'answer' THEN
      EXISTS (
        SELECT 1 FROM answers
        WHERE id = content_id
        AND author_id = user_id
        AND (created_at > NOW() - INTERVAL '1 hour' OR is_accepted = false)
      )
    WHEN 'comment' THEN
      EXISTS (
        SELECT 1 FROM comments
        WHERE id = content_id
        AND author_id = user_id
        AND created_at > NOW() - INTERVAL '5 minutes'
      )
    ELSE false
  END OR is_moderator(user_id);
$$;

-- =====================================================
-- GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE, SELECT ON SEQUENCE categories_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE categories_id_seq TO anon;

-- Grant select on all tables to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant insert/update/delete to authenticated users (RLS will control access)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- =====================================================
-- AUDIT TRIGGER SETUP
-- =====================================================

-- Function to log changes for audit
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
BEGIN
  -- Only log for authenticated users
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values,
      metadata
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      CASE
        WHEN TG_OP = 'DELETE' THEN OLD.id::text
        ELSE NEW.id::text
      END,
      CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
      CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', NOW()
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit logs table (if not exists from main schema)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only moderators can view audit logs
CREATE POLICY "Only moderators can view audit logs" ON audit_logs
  FOR SELECT USING (is_moderator(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Create audit triggers for important tables
CREATE TRIGGER audit_questions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON questions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_answers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON answers
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users_trigger
  AFTER UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
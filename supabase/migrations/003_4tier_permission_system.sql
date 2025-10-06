-- =====================================================
-- Viet K-Connect 4-Tier Permission System Migration
-- Upgrading User Schema to Match TypeScript Definitions
-- Date: 2025-10-05
-- =====================================================

-- Add 4-Tier Permission System columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('guest', 'user', 'verified', 'admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected', 'expired'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_type VARCHAR(20) CHECK (verification_type IN ('student', 'work', 'family', 'resident', 'other'));

-- Add Profile Info for verification
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty_areas TEXT[];

-- Add Verification Timestamps
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ;

-- Create index for permission system
CREATE INDEX IF NOT EXISTS idx_users_permission ON users(role, verification_status);

-- Update existing users to have proper role
UPDATE users SET role = 'verified' WHERE is_verified = true;
UPDATE users SET role = 'user' WHERE is_verified = false;

-- =====================================================
-- PERMISSION HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is moderator
CREATE OR REPLACE FUNCTION is_moderator(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND (role = 'admin' OR badges->>'moderator' = 'true')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is question author
CREATE OR REPLACE FUNCTION is_question_author(question_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM questions
    WHERE id = question_id AND author_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check content editing permissions
CREATE OR REPLACE FUNCTION can_edit_content(content_type TEXT, content_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admins and moderators can edit anything
  IF is_moderator(user_id) THEN
    RETURN TRUE;
  END IF;

  -- Users can edit their own content
  IF content_type = 'question' THEN
    RETURN is_question_author(content_id, user_id);
  ELSIF content_type = 'answer' THEN
    RETURN EXISTS (
      SELECT 1 FROM answers
      WHERE id = content_id AND author_id = user_id
    );
  ELSIF content_type = 'comment' THEN
    RETURN EXISTS (
      SELECT 1 FROM comments
      WHERE id = content_id AND author_id = user_id
    );
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE RLS POLICIES FOR 4-TIER SYSTEM
-- =====================================================

-- Drop existing user policies
DROP POLICY IF EXISTS "Only admins can delete user profiles" ON users;

-- Create new 4-tier permission policies for users
CREATE POLICY "Only admins can delete user profiles" ON users
  FOR DELETE USING (is_moderator(auth.uid()));

-- Update questions policies for verified users
DROP POLICY IF EXISTS "Anyone can view approved questions" ON questions;
CREATE POLICY "Anyone can view approved questions" ON questions
  FOR SELECT USING (is_approved = true);

-- Only verified users can create questions
DROP POLICY IF EXISTS "Verified users can create questions" ON questions;
CREATE POLICY "Verified users can create questions" ON questions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('verified', 'admin')
    )
  );

-- Authors and moderators can update their questions
DROP POLICY IF EXISTS "Authors can update their questions" ON questions;
CREATE POLICY "Authors can update their questions" ON questions
  FOR UPDATE USING (
    can_edit_content('question', id, auth.uid())
  );

-- =====================================================
-- SEED DATA FOR TESTING
-- =====================================================

-- Create a test admin user for development
INSERT INTO users (
  id,
  email,
  name,
  role,
  verification_status,
  verification_type,
  visa_type,
  years_in_korea,
  region,
  specialty_areas,
  is_verified,
  badges,
  created_at
) VALUES (
  'admin-test-user-uuid',
  'admin@vietkconnect.com',
  'Admin Test User',
  'admin',
  'approved',
  'work',
  'E-7',
  5,
  'Seoul',
  ARRAY['비자/법률', '취업/창업'],
  true,
  '{"moderator": true, "verified": true, "expert": true}',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create verified test users
INSERT INTO users (
  id,
  email,
  name,
  role,
  verification_status,
  verification_type,
  visa_type,
  years_in_korea,
  region,
  specialty_areas,
  is_verified,
  badges,
  created_at
) VALUES
(
  'verified-user-1-uuid',
  'letuan@vietkconnect.com',
  '레투안',
  'verified',
  'approved',
  'work',
  'E-7',
  3,
  'Seoul',
  ARRAY['취업/창업', '생활정보'],
  true,
  '{"verified": true, "helper": true}',
  NOW()
),
(
  'verified-user-2-uuid',
  'anhpham@vietkconnect.com',
  '안팜',
  'verified',
  'approved',
  'student',
  'D-2',
  2,
  'Busan',
  ARRAY['교육/언어', '생활정보'],
  true,
  '{"verified": true}',
  NOW()
) ON CONFLICT (email) DO NOTHING;
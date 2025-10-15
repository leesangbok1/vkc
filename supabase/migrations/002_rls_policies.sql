-- Row Level Security (RLS) 정책 설정
-- Viet K-Connect 보안 정책

-- RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. Categories 정책 (모든 사용자가 활성 카테고리 조회 가능)
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 2. Users 정책
CREATE POLICY "Users can view verified user profiles" ON users
  FOR SELECT USING (
    role IN ('verified', 'admin') OR 
    id = auth.uid()
  );

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "New users can insert their profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- 3. Questions 정책
CREATE POLICY "Anyone can view approved questions" ON questions
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Authenticated users can create questions" ON questions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    author_id = auth.uid()
  );

CREATE POLICY "Authors can update own questions" ON questions
  FOR UPDATE USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors and admins can delete questions" ON questions
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 4. Answers 정책
CREATE POLICY "Anyone can view approved answers" ON answers
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Authenticated users can create answers" ON answers
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    author_id = auth.uid()
  );

CREATE POLICY "Authors can update own answers" ON answers
  FOR UPDATE USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors, question authors, and admins can delete answers" ON answers
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = answers.question_id AND questions.author_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 5. Votes 정책
CREATE POLICY "Users can view all votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

CREATE POLICY "Users can update own votes" ON votes
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own votes" ON votes
  FOR DELETE USING (user_id = auth.uid());

-- 6. Comments 정책
CREATE POLICY "Anyone can view approved comments" ON comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    author_id = auth.uid()
  );

CREATE POLICY "Authors can update own comments" ON comments
  FOR UPDATE USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors and admins can delete comments" ON comments
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 7. Notifications 정책
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- 시스템에서 생성

-- 유틸리티 함수들
CREATE OR REPLACE FUNCTION is_moderator(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role IN ('admin', 'verified')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_question_author(question_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM questions 
    WHERE id = question_id AND author_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_edit_content(content_type TEXT, content_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF content_type = 'question' THEN
    RETURN is_question_author(content_id, user_id) OR is_moderator(user_id);
  ELSIF content_type = 'answer' THEN
    RETURN EXISTS (
      SELECT 1 FROM answers 
      WHERE id = content_id AND author_id = user_id
    ) OR is_moderator(user_id);
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
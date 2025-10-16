-- Viet K-Connect 초기 데이터베이스 스키마
-- 베트남인 한국생활 Q&A 플랫폼

-- 1. 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  color VARCHAR(7) DEFAULT '#000000',
  parent_id INTEGER REFERENCES categories(id),
  sort_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 사용자 테이블 (4계층 권한 시스템)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  provider VARCHAR(50), -- 'google', 'kakao' 등
  provider_id VARCHAR(255),

  -- 4계층 권한 시스템
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('guest', 'user', 'verified', 'admin')),
  verification_status VARCHAR(20) DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected', 'expired')),
  verification_type VARCHAR(20) CHECK (verification_type IN ('student', 'work', 'family', 'resident', 'other')),

  -- 베트남 특화 프로필 정보
  visa_type VARCHAR(10), -- 'D-2', 'E-7', 'F-2', 'F-5' 등
  company VARCHAR(200),
  years_in_korea INTEGER CHECK (years_in_korea >= 0 AND years_in_korea <= 50),
  region VARCHAR(50), -- '서울', '부산', '대구' 등
  specialty_areas TEXT[], -- ['visa', 'employment', 'housing'] 등
  preferred_language VARCHAR(5) DEFAULT 'ko',

  -- 인증 관련 타임스탬프
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_expires_at TIMESTAMP WITH TIME ZONE,

  -- 레거시 호환성
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  trust_score INTEGER DEFAULT 0,
  badges JSONB DEFAULT '{}',
  question_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  helpful_answer_count INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 질문 테이블
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',

  -- AI 관련 필드
  ai_category_confidence DECIMAL(3,2),
  ai_tags TEXT[] DEFAULT '{}',
  urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  matched_experts TEXT[] DEFAULT '{}',
  expert_notifications_sent BOOLEAN DEFAULT false,

  -- 통계 및 상태
  view_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resolved', 'archived')),

  -- 관리 관련
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_reported BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,

  -- 전문 검색용
  search_vector tsvector
);

-- 4. 답변 테이블
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_answer_id UUID REFERENCES answers(id), -- 대댓글용

  -- 채택 관련
  is_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES users(id),

  -- 투표 및 평가
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,

  -- 관리 관련
  is_reported BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,

  -- AI 관련
  ai_helpfulness_score DECIMAL(3,2),
  ai_sentiment VARCHAR(20),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- 전문 검색용
  search_vector tsvector
);

-- 5. 투표 테이블
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL, -- questions.id 또는 answers.id
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'answer')),
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote', 'helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- 사용자는 같은 대상에 대해 한 번만 투표 가능
  UNIQUE(user_id, target_id, target_type)
);

-- 6. 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  target_id UUID NOT NULL, -- questions.id 또는 answers.id
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'answer')),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id), -- 대댓글용

  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  is_reported BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'new_answer', 'question_commented', etc.
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- 관련 질문/답변 ID
  related_type VARCHAR(20), -- 'question', 'answer', etc.

  is_read BOOLEAN DEFAULT false,
  is_email_sent BOOLEAN DEFAULT false,
  is_push_sent BOOLEAN DEFAULT false,
  is_kakao_sent BOOLEAN DEFAULT false,
  channels JSONB DEFAULT '{}', -- 알림 채널별 설정

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_visa_type ON users(visa_type);

CREATE INDEX IF NOT EXISTS idx_questions_author_id ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_search_vector ON questions USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_answers_is_accepted ON answers(is_accepted);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_votes_user_target ON votes(user_id, target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_id, target_type);

CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- 전문 검색 트리거
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'questions' THEN
    NEW.search_vector := 
      setweight(to_tsvector('korean', COALESCE(NEW.title, '')), 'A') ||
      setweight(to_tsvector('korean', COALESCE(NEW.content, '')), 'B') ||
      setweight(to_tsvector('korean', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  ELSIF TG_TABLE_NAME = 'answers' THEN
    NEW.search_vector := to_tsvector('korean', COALESCE(NEW.content, ''));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_questions_search_vector
  BEFORE INSERT OR UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

CREATE TRIGGER update_answers_search_vector
  BEFORE INSERT OR UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
  BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at
  BEFORE UPDATE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();-- Row Level Security (RLS) 정책 설정
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
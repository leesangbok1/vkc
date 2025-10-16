-- ============================================
-- VietKConnect 완전 초기화 스크립트
-- ============================================
-- 작성일: 2025-01-16
-- 목적: Supabase 리셋 후 전체 재설정
--
-- 포함 내용:
-- 1. 데이터베이스 스키마 (7개 테이블)
-- 2. 카테고리 데이터 (8개, ID: 17-24)
-- 3. 사용자 데이터 (13명)
--
-- 실행 순서: 이 파일을 Supabase SQL Editor에서 전체 실행

-- ============================================
-- PART 1: 데이터베이스 스키마 생성
-- ============================================

-- 기존 테이블 삭제 (있을 경우)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 1. 카테고리 테이블
CREATE TABLE categories (
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
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  provider VARCHAR(50),
  provider_id VARCHAR(255),

  -- 4계층 권한 시스템
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('guest', 'user', 'verified', 'admin')),
  verification_status VARCHAR(20) DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected', 'expired')),
  verification_type VARCHAR(20) CHECK (verification_type IN ('student', 'work', 'family', 'resident', 'other')),

  -- 베트남 특화 프로필 정보
  visa_type VARCHAR(10),
  company VARCHAR(200),
  years_in_korea INTEGER CHECK (years_in_korea >= 0 AND years_in_korea <= 50),
  region VARCHAR(50),
  specialty_areas TEXT[],
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
CREATE TABLE questions (
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
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_answer_id UUID REFERENCES answers(id),

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
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'answer')),
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote', 'helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(user_id, target_id, target_type)
);

-- 6. 댓글 테이블
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'answer')),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id),

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
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  related_type VARCHAR(20),

  is_read BOOLEAN DEFAULT false,
  is_email_sent BOOLEAN DEFAULT false,
  is_push_sent BOOLEAN DEFAULT false,
  is_kakao_sent BOOLEAN DEFAULT false,
  channels JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 인덱스 생성
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verification_status ON users(verification_status);
CREATE INDEX idx_users_visa_type ON users(visa_type);

CREATE INDEX idx_questions_author_id ON questions(author_id);
CREATE INDEX idx_questions_category_id ON questions(category_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_search_vector ON questions USING gin(search_vector);

CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_author_id ON answers(author_id);
CREATE INDEX idx_answers_is_accepted ON answers(is_accepted);
CREATE INDEX idx_answers_created_at ON answers(created_at DESC);

CREATE INDEX idx_votes_user_target ON votes(user_id, target_id, target_type);
CREATE INDEX idx_votes_target ON votes(target_id, target_type);

CREATE INDEX idx_comments_target ON comments(target_id, target_type);
CREATE INDEX idx_comments_author_id ON comments(author_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================
-- 트리거 함수
-- ============================================

-- 전문 검색 트리거 (한국어 → simple로 변경)
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'questions' THEN
    NEW.search_vector :=
      setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE(NEW.content, '')), 'B') ||
      setweight(to_tsvector('simple', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  ELSIF TG_TABLE_NAME = 'answers' THEN
    NEW.search_vector := to_tsvector('simple', COALESCE(NEW.content, ''));
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
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 2: 카테고리 데이터 (8개, ID: 17-24)
-- ============================================

-- 카테고리 ID 시퀀스를 17부터 시작하도록 설정
SELECT setval('categories_id_seq', 16, true);

INSERT INTO categories (name, slug, description, icon, color, parent_id, sort_order, is_active) VALUES
('비자/법률', 'visa', '비자 연장, 체류 자격, 법률 상담', '📋', '#3b82f6', NULL, 1, true),
('취업/창업', 'employment', '구직, 이직, 창업 정보', '💼', '#10b981', NULL, 2, true),
('주거/부동산', 'housing', '전월세, 매매, 부동산 계약', '🏠', '#f59e0b', NULL, 3, true),
('교육/학업', 'education', '대학, 어학원, 자녀 교육', '📚', '#8b5cf6', NULL, 4, true),
('의료/건강', 'medical', '병원, 보험, 건강 관리', '🏥', '#ef4444', NULL, 5, true),
('금융/세금', 'finance', '은행, 송금, 세금 신고', '💰', '#06b6d4', NULL, 6, true),
('문화/생활', 'culture', '한국 생활, 문화 적응', '🎭', '#ec4899', NULL, 7, true),
('교통/통신', 'transportation', '대중교통, 통신사, 면허', '🚇', '#14b8a6', NULL, 8, true);

-- ============================================
-- PART 3: 사용자 데이터 (13명)
-- ============================================

-- 베트남인 전문가 6명
INSERT INTO users (id, email, name, avatar_url, bio, role, verification_status, verification_type, visa_type, years_in_korea, region, specialty_areas, preferred_language, is_verified, verified_at, trust_score, question_count, answer_count, helpful_answer_count) VALUES
('00000000-0000-0000-0000-000000000001', 'nguyen.hung@vietkconnect.com', 'Nguyễn Văn Hùng', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nguyen-hung', '한국 생활 7년차 E-9 비자 전문가입니다. 비자 연장 관련 모든 질문에 답변해드립니다.', 'verified', 'approved', 'work', 'E-9', 7, '경기', ARRAY['visa', 'employment'], 'vi', true, '2023-01-15 10:00:00+00', 95, 3, 42, 38),
('00000000-0000-0000-0000-000000000002', 'tran.duc@vietkconnect.com', 'Trần Minh Đức', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tran-duc', 'F-5 영주권 취득 경험자입니다. 영주권 신청 과정을 상세히 안내해드립니다.', 'verified', 'approved', 'resident', 'F-5', 9, '서울', ARRAY['visa', 'immigration'], 'vi', true, '2022-03-20 10:00:00+00', 98, 5, 56, 52),
('00000000-0000-0000-0000-000000000003', 'le.toan@vietkconnect.com', 'Lê Văn Toàn', 'https://api.dicebear.com/7.x/avataaars/svg?seed=le-toan', 'E-9에서 E-7로 비자 전환 성공! 전환 과정의 모든 노하우를 공유합니다.', 'verified', 'approved', 'work', 'E-7', 6, '인천', ARRAY['visa', 'employment', 'career'], 'vi', true, '2023-06-10 10:00:00+00', 92, 2, 38, 35),
('00000000-0000-0000-0000-000000000004', 'vo.mai@vietkconnect.com', 'Võ Thị Mai', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vo-mai', 'F-6 결혼이민 비자 소지자입니다. 다문화 가정의 생활 조언을 드립니다.', 'verified', 'approved', 'family', 'F-6', 6, '부산', ARRAY['visa', 'family', 'culture'], 'vi', true, '2023-02-25 10:00:00+00', 88, 8, 34, 30),
('00000000-0000-0000-0000-000000000005', 'ngo.linh@vietkconnect.com', 'Ngô Thị Linh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ngo-linh', 'D-4 어학연수 비자로 한국어를 공부하고 있습니다. 어학당 생활 정보 공유합니다.', 'verified', 'approved', 'student', 'D-4', 3, '서울', ARRAY['education', 'language', 'student_life'], 'vi', true, '2024-01-10 10:00:00+00', 75, 12, 25, 20),
('00000000-0000-0000-0000-000000000006', 'nguyen.lan@vietkconnect.com', 'Nguyễn Thị Lan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nguyen-lan', 'E-7 통역·번역사로 일하고 있습니다. 한국 취업과 경력 관리 조언 가능합니다.', 'verified', 'approved', 'work', 'E-7', 6, '서울', ARRAY['employment', 'translation', 'career'], 'ko', true, '2023-04-15 10:00:00+00', 94, 4, 48, 45);

-- 한국인 전문가 3명
INSERT INTO users (id, email, name, avatar_url, bio, role, verification_status, verification_type, specialty_areas, preferred_language, is_verified, verified_at, trust_score, question_count, answer_count, helpful_answer_count) VALUES
('00000000-0000-0000-0000-000000000007', 'lee.minsu@vietkconnect.com', '이민수 변호사', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee-minsu', '법무법인 대표 변호사입니다. 이민법, 체류 자격, 법률 상담을 전문으로 합니다.', 'verified', 'approved', 'other', ARRAY['visa', 'law', 'immigration', 'legal_advice'], 'ko', true, '2022-01-01 10:00:00+00', 99, 0, 120, 115),
('00000000-0000-0000-0000-000000000008', 'kim.taehee@vietkconnect.com', '김태희 노무사', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim-taehee', '노무법인 대표 노무사입니다. 외국인 근로자의 노동 권리와 근로 조건 상담합니다.', 'verified', 'approved', 'other', ARRAY['employment', 'labor_law', 'workplace_rights'], 'ko', true, '2022-06-15 10:00:00+00', 97, 1, 85, 80),
('00000000-0000-0000-0000-000000000009', 'park.sungjun@vietkconnect.com', '박성준 행정사', 'https://api.dicebear.com/7.x/avataaars/svg?seed=park-sungjun', '행정사 자격증 보유. 비자 신청, 체류 자격 변경 등 행정 업무를 도와드립니다.', 'verified', 'approved', 'other', ARRAY['visa', 'administration', 'government_procedures'], 'ko', true, '2023-03-10 10:00:00+00', 93, 2, 67, 62);

-- 일반 사용자 3명
INSERT INTO users (id, email, name, avatar_url, bio, role, verification_status, visa_type, years_in_korea, region, preferred_language, is_verified, trust_score, question_count, answer_count, helpful_answer_count) VALUES
('00000000-0000-0000-0000-000000000010', 'vietnam.worker1@vietkconnect.com', '베트남노동자', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vietnam-worker', '한국에서 일하는 베트남 노동자입니다.', 'user', 'none', 'E-9', 2, '경기', 'vi', false, 35, 15, 8, 3),
('00000000-0000-0000-0000-000000000011', 'longterm.resident@vietkconnect.com', '장기체류자', 'https://api.dicebear.com/7.x/avataaars/svg?seed=longterm', '한국 생활 5년차 장기 체류자입니다.', 'user', 'none', 'F-2', 5, '서울', 'ko', false, 45, 10, 12, 5),
('00000000-0000-0000-0000-000000000012', 'vietnam.student@vietkconnect.com', '베트남유학생', 'https://api.dicebear.com/7.x/avataaars/svg?seed=student', '한국 대학교에 다니는 베트남 유학생입니다.', 'user', 'none', 'D-2', 1, '서울', 'vi', false, 20, 8, 3, 1);

-- 관리자 1명
INSERT INTO users (id, email, name, avatar_url, bio, role, verification_status, specialty_areas, preferred_language, is_verified, trust_score, question_count, answer_count, helpful_answer_count) VALUES
('00000000-0000-0000-0000-000000000099', 'admin@vietkconnect.com', 'VietKConnect 관리자', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'VietKConnect 플랫폼 공식 관리자입니다.', 'admin', 'approved', ARRAY['platform', 'moderation', 'support'], 'ko', true, 100, 0, 0, 0);

-- ============================================
-- 검증 쿼리
-- ============================================

-- 1. 카테고리 확인 (8개)
SELECT COUNT(*) as total_categories FROM categories;
SELECT id, name, slug FROM categories ORDER BY id;

-- 2. 사용자 확인 (13명)
SELECT COUNT(*) as total_users FROM users;
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;

-- 3. 전체 확인
SELECT
  'categories' as table_name,
  COUNT(*)::text as row_count
FROM categories
UNION ALL
SELECT
  'users' as table_name,
  COUNT(*)::text as row_count
FROM users;

-- ============================================
-- 완료 메시지
-- ============================================
SELECT '✅ Database setup complete!' as status,
       '8 categories + 13 users inserted' as result;

# Agent 4: 데이터베이스 스키마 설계 담당

## 🎯 브랜치
`feature/db-schema`

## 📋 작업 내용
1. 테이블 구조 설계
2. RLS (Row Level Security) 정책 작성
3. 인덱스 생성
4. 데이터베이스 함수 및 트리거 생성
5. 초기 데이터 시드

## 🚀 실행 명령어

### 1. 브랜치 생성
```bash
git checkout -b feature/db-schema
```

### 2. 마이그레이션 파일 생성
```bash
# 초기 스키마 마이그레이션
supabase migration new initial_schema

# RLS 정책 마이그레이션
supabase migration new rls_policies

# 인덱스 마이그레이션
supabase migration new create_indexes

# 함수 및 트리거 마이그레이션
supabase migration new functions_and_triggers
```

## 📁 마이그레이션 파일

### supabase/migrations/001_initial_schema.sql
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE question_status AS ENUM ('open', 'closed', 'resolved');
CREATE TYPE notification_type AS ENUM ('new_answer', 'question_accepted', 'comment', 'vote');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    residence_years INTEGER DEFAULT 0,
    visa_type TEXT,
    company TEXT,
    expertise_areas TEXT[],
    bio TEXT,
    trust_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    parent_id UUID REFERENCES categories(id),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    status question_status DEFAULT 'open',
    urgency_level INTEGER DEFAULT 1 CHECK (urgency_level BETWEEN 1 AND 5),
    view_count INTEGER DEFAULT 0,
    vote_count INTEGER DEFAULT 0,
    answer_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answers table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    vote_count INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT comment_target_check CHECK (
        (question_id IS NOT NULL AND answer_id IS NULL) OR
        (question_id IS NULL AND answer_id IS NOT NULL)
    )
);

-- Votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 for downvote, 1 for upvote
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT vote_target_check CHECK (
        (question_id IS NOT NULL AND answer_id IS NULL) OR
        (question_id IS NULL AND answer_id IS NOT NULL)
    ),
    UNIQUE(user_id, question_id),
    UNIQUE(user_id, answer_id)
);

-- Bookmarks table
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User expertise table
CREATE TABLE user_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    expertise_level INTEGER DEFAULT 1 CHECK (expertise_level BETWEEN 1 AND 5),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id)
);

-- Question views table (for analytics)
CREATE TABLE question_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history table
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    clicked_question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at triggers for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### supabase/migrations/002_rls_policies.sql
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Questions policies
CREATE POLICY "Anyone can view questions" ON questions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" ON questions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own questions" ON questions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions" ON questions
    FOR DELETE USING (auth.uid() = user_id);

-- Answers policies
CREATE POLICY "Anyone can view answers" ON answers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create answers" ON answers
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own answers" ON answers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own answers" ON answers
    FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Anyone can view votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own votes" ON votes
    FOR ALL USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- User expertise policies
CREATE POLICY "Anyone can view user expertise" ON user_expertise
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own expertise" ON user_expertise
    FOR ALL USING (auth.uid() = user_id);

-- Question views policies (public read for analytics)
CREATE POLICY "Anyone can view question views" ON question_views
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert question views" ON question_views
    FOR INSERT WITH CHECK (true);

-- Search history policies
CREATE POLICY "Users can view own search history" ON search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own search history" ON search_history
    FOR ALL USING (auth.uid() = user_id);
```

### supabase/migrations/003_create_indexes.sql
```sql
-- Performance indexes
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_category_id ON questions(category_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_vote_count ON questions(vote_count DESC);
CREATE INDEX idx_questions_view_count ON questions(view_count DESC);

-- Full-text search indexes
CREATE INDEX idx_questions_title_gin ON questions USING gin(to_tsvector('korean', title));
CREATE INDEX idx_questions_content_gin ON questions USING gin(to_tsvector('korean', content));
CREATE INDEX idx_questions_tags_gin ON questions USING gin(tags);

-- Answer indexes
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_vote_count ON answers(vote_count DESC);
CREATE INDEX idx_answers_created_at ON answers(created_at DESC);

-- Comment indexes
CREATE INDEX idx_comments_question_id ON comments(question_id);
CREATE INDEX idx_comments_answer_id ON comments(answer_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Vote indexes
CREATE INDEX idx_votes_question_id ON votes(question_id);
CREATE INDEX idx_votes_answer_id ON votes(answer_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Bookmark indexes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_question_id ON bookmarks(question_id);

-- Category indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_order_index ON categories(order_index);

-- User expertise indexes
CREATE INDEX idx_user_expertise_user_id ON user_expertise(user_id);
CREATE INDEX idx_user_expertise_category_id ON user_expertise(category_id);

-- Question views indexes
CREATE INDEX idx_question_views_question_id ON question_views(question_id);
CREATE INDEX idx_question_views_created_at ON question_views(created_at DESC);

-- Search history indexes
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);
```

### supabase/migrations/004_functions_and_triggers.sql
```sql
-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'votes' THEN
        IF NEW.question_id IS NOT NULL THEN
            UPDATE questions
            SET vote_count = (
                SELECT COALESCE(SUM(vote_type), 0)
                FROM votes
                WHERE question_id = NEW.question_id
            )
            WHERE id = NEW.question_id;
        END IF;

        IF NEW.answer_id IS NOT NULL THEN
            UPDATE answers
            SET vote_count = (
                SELECT COALESCE(SUM(vote_type), 0)
                FROM votes
                WHERE answer_id = NEW.answer_id
            )
            WHERE id = NEW.answer_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote count updates
CREATE TRIGGER trigger_update_vote_counts
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Function to update answer counts
CREATE OR REPLACE FUNCTION update_answer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE questions
        SET answer_count = answer_count + 1
        WHERE id = NEW.question_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE questions
        SET answer_count = answer_count - 1
        WHERE id = OLD.question_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for answer count updates
CREATE TRIGGER trigger_update_answer_count
    AFTER INSERT OR DELETE ON answers
    FOR EACH ROW EXECUTE FUNCTION update_answer_count();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    recipient_id UUID,
    notification_type notification_type,
    notification_title TEXT,
    notification_message TEXT DEFAULT NULL,
    notification_data JSONB DEFAULT NULL,
    question_id UUID DEFAULT NULL,
    answer_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id, type, title, message, data, question_id, answer_id
    ) VALUES (
        recipient_id, notification_type, notification_title,
        notification_message, notification_data, question_id, answer_id
    ) RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending questions
CREATE OR REPLACE FUNCTION get_trending_questions(
    time_period INTERVAL DEFAULT '7 days',
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    vote_count INTEGER,
    answer_count INTEGER,
    view_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    trend_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        q.id,
        q.title,
        q.vote_count,
        q.answer_count,
        q.view_count,
        q.created_at,
        (
            q.vote_count * 2.0 +
            q.answer_count * 3.0 +
            q.view_count * 0.1 +
            CASE
                WHEN q.created_at > NOW() - time_period THEN 10.0
                ELSE 0.0
            END
        ) as trend_score
    FROM questions q
    WHERE q.created_at > NOW() - time_period
    ORDER BY trend_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function for full-text search
CREATE OR REPLACE FUNCTION search_questions(
    search_query TEXT,
    category_filter UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        q.id,
        q.title,
        q.content,
        ts_rank(
            to_tsvector('korean', q.title || ' ' || q.content),
            plainto_tsquery('korean', search_query)
        ) as rank
    FROM questions q
    WHERE (
        to_tsvector('korean', q.title || ' ' || q.content) @@
        plainto_tsquery('korean', search_query)
    )
    AND (category_filter IS NULL OR q.category_id = category_filter)
    ORDER BY rank DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;
```

### supabase/seed.sql
```sql
-- Insert default categories
INSERT INTO categories (id, name, description, icon, color, order_index) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '비자/이민', '비자, 영주권, 이민 관련 질문', '📋', '#3B82F6', 1),
    ('550e8400-e29b-41d4-a716-446655440002', '취업/채용', '취업, 이직, 채용 정보', '💼', '#10B981', 2),
    ('550e8400-e29b-41d4-a716-446655440003', '주거/부동산', '집구하기, 부동산, 렌트', '🏠', '#F59E0B', 3),
    ('550e8400-e29b-41d4-a716-446655440004', '생활정보', '일상생활, 쇼핑, 문화', '🛍️', '#EF4444', 4),
    ('550e8400-e29b-41d4-a716-446655440005', '교육/학습', '베트남어, 교육, 스킬', '📚', '#8B5CF6', 5),
    ('550e8400-e29b-41d4-a716-446655440006', '의료/건강', '병원, 건강보험, 의료진', '🏥', '#06B6D4', 6),
    ('550e8400-e29b-41d4-a716-446655440007', '법률/세무', '법률 상담, 세금, 계약', '⚖️', '#84CC16', 7),
    ('550e8400-e29b-41d4-a716-446655440008', '교통/여행', '교통편, 여행, 항공', '✈️', '#F97316', 8),
    ('550e8400-e29b-41d4-a716-446655440009', '음식/요리', '한국음식, 베트남음식', '🍜', '#EC4899', 9),
    ('550e8400-e29b-41d4-a716-44665544000A', '기타', '기타 질문', '💬', '#6B7280', 10);

-- Insert sample admin user (will be replaced with real auth user)
INSERT INTO users (id, email, name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@viet-kconnect.com', '관리자', 'admin');
```

## 🧪 테스트 절차

### 1. 마이그레이션 실행
```bash
# 로컬 Supabase 시작
supabase start

# 마이그레이션 실행
supabase db reset

# 타입 생성
supabase gen types typescript --local > lib/database.types.ts
```

### 2. 데이터 테스트
```bash
# SQL 콘솔에서 테스트
supabase db shell

# 기본 쿼리 테스트
SELECT * FROM categories;
SELECT * FROM users WHERE role = 'admin';
```

## ✅ 완료 기준
1. ✅ 모든 테이블 생성 완료
2. ✅ RLS 정책 적용 완료
3. ✅ 인덱스 생성 완료
4. ✅ 함수/트리거 생성 완료
5. ✅ 시드 데이터 삽입 완료
6. ✅ 타입 파일 업데이트
7. ✅ 마이그레이션 테스트 통과

## 📅 예상 소요 시간
**총 3시간**
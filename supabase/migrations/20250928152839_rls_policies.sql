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
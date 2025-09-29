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
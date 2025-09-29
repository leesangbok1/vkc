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
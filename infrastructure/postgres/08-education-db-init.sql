-- TREUM Education Database Schema with Performance Optimizations
-- Database: treum_education
-- Service: education

\c treum_education;

-- Education-specific optimizations for content delivery and progress tracking
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET work_mem = '8MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET random_page_cost = 1.1;

-- Full-text search optimizations for content
ALTER SYSTEM SET default_text_search_config = 'english';

-- Course and content indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_category_published 
ON courses(category_id, is_published) WHERE is_published = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_difficulty_rating 
ON courses(difficulty_level, rating DESC) WHERE is_published = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_created_at_desc 
ON courses(created_at DESC);

-- Full-text search on course content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_search 
ON courses USING gin(to_tsvector('english', title || ' ' || description));

-- Lesson content and sequencing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_course_order 
ON lessons(course_id, lesson_order) WHERE is_published = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_duration 
ON lessons(estimated_duration) WHERE is_published = true;

-- Full-text search on lesson content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_content_search 
ON lessons USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- User progress tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_course 
ON user_progress(user_id, course_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_completion 
ON user_progress(completion_percentage DESC, updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_active 
ON user_progress(user_id, is_active) WHERE is_active = true;

-- Assessment and quiz performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_lesson_type 
ON assessments(lesson_id, assessment_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_attempts_user_assessment 
ON assessment_attempts(user_id, assessment_id, attempted_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_attempts_score 
ON assessment_attempts(score DESC, attempted_at DESC);

-- Certificate tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_certificates_user_issued 
ON certificates(user_id, issued_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_certificates_course_issued 
ON certificates(course_id, issued_at DESC);

-- Category organization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_order 
ON categories(parent_id, sort_order);

-- Content schema for educational materials
CREATE SCHEMA IF NOT EXISTS content;

-- Learning paths and curricula
CREATE TABLE IF NOT EXISTS content.learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    estimated_duration INTEGER, -- in hours
    prerequisites JSONB,
    learning_objectives TEXT[],
    is_published BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_learning_paths_difficulty_published 
ON content.learning_paths(difficulty_level, is_published) WHERE is_published = true;

-- Learning path course relationships
CREATE TABLE IF NOT EXISTS content.learning_path_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL,
    course_id UUID NOT NULL,
    sequence_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(learning_path_id, course_id),
    UNIQUE(learning_path_id, sequence_order)
);

-- Interactive content elements
CREATE TABLE IF NOT EXISTS content.interactive_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL,
    element_type VARCHAR(50) NOT NULL, -- quiz, code_exercise, simulation, video
    element_data JSONB NOT NULL,
    sequence_order INTEGER,
    points_value INTEGER DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interactive_elements_lesson_order 
ON content.interactive_elements(lesson_id, sequence_order);

-- User-generated content and discussions
CREATE TABLE IF NOT EXISTS content.discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID,
    lesson_id UUID,
    parent_id UUID, -- for threaded discussions
    user_id UUID NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_answered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_discussions_course_created 
ON content.discussions(course_id, created_at DESC);

CREATE INDEX idx_discussions_lesson_created 
ON content.discussions(lesson_id, created_at DESC);

CREATE INDEX idx_discussions_user_created 
ON content.discussions(user_id, created_at DESC);

-- Full-text search on discussions
CREATE INDEX idx_discussions_content_search 
ON content.discussions USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || content));

-- Progress schema for detailed tracking
CREATE SCHEMA IF NOT EXISTS progress;

-- Detailed lesson progress tracking
CREATE TABLE IF NOT EXISTS progress.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- in seconds
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    last_position INTEGER, -- video timestamp, reading position, etc.
    interactions_data JSONB, -- clicks, pauses, rewinds, etc.
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user_updated 
ON progress.lesson_progress(user_id, updated_at DESC);

CREATE INDEX idx_lesson_progress_lesson_completion 
ON progress.lesson_progress(lesson_id, is_completed, completion_time DESC);

-- Learning analytics and insights
CREATE TABLE IF NOT EXISTS progress.learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID,
    metric_type VARCHAR(50) NOT NULL, -- engagement_time, completion_rate, quiz_performance
    metric_value DECIMAL(10,4),
    metric_data JSONB,
    calculated_for_period DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_learning_analytics_user_period 
ON progress.learning_analytics(user_id, calculated_for_period DESC);

CREATE INDEX idx_learning_analytics_course_metric 
ON progress.learning_analytics(course_id, metric_type, calculated_for_period DESC);

-- Personalized recommendations
CREATE TABLE IF NOT EXISTS progress.content_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    recommended_content_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- course, lesson, learning_path
    recommendation_type VARCHAR(50) NOT NULL, -- based_on_progress, similar_users, trending
    confidence_score DECIMAL(5,4),
    recommendation_data JSONB,
    is_viewed BOOLEAN DEFAULT false,
    is_acted_upon BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_content_recommendations_user_created 
ON progress.content_recommendations(user_id, created_at DESC);

CREATE INDEX idx_content_recommendations_confidence 
ON progress.content_recommendations(confidence_score DESC, created_at DESC);

-- Education analytics procedures
CREATE OR REPLACE FUNCTION calculate_learning_analytics()
RETURNS void AS $$
BEGIN
    -- Calculate daily engagement metrics
    INSERT INTO progress.learning_analytics (
        user_id, course_id, metric_type, metric_value, calculated_for_period
    )
    SELECT 
        lp.user_id,
        l.course_id,
        'daily_engagement_minutes' as metric_type,
        COALESCE(SUM(lp.time_spent), 0) / 60.0 as metric_value,
        CURRENT_DATE - INTERVAL '1 day' as calculated_for_period
    FROM progress.lesson_progress lp
    JOIN lessons l ON l.id = lp.lesson_id
    WHERE DATE(lp.updated_at) = CURRENT_DATE - INTERVAL '1 day'
    GROUP BY lp.user_id, l.course_id
    ON CONFLICT (user_id, course_id, metric_type, calculated_for_period) DO UPDATE SET
        metric_value = EXCLUDED.metric_value;
    
    -- Calculate completion rates
    INSERT INTO progress.learning_analytics (
        user_id, course_id, metric_type, metric_value, calculated_for_period
    )
    SELECT 
        up.user_id,
        up.course_id,
        'course_completion_rate' as metric_type,
        up.completion_percentage as metric_value,
        CURRENT_DATE as calculated_for_period
    FROM user_progress up
    WHERE up.updated_at >= CURRENT_DATE - INTERVAL '1 day'
    ON CONFLICT (user_id, course_id, metric_type, calculated_for_period) DO UPDATE SET
        metric_value = EXCLUDED.metric_value;
        
    -- Calculate quiz performance averages
    INSERT INTO progress.learning_analytics (
        user_id, metric_type, metric_value, calculated_for_period
    )
    SELECT 
        aa.user_id,
        'avg_quiz_performance' as metric_type,
        AVG(aa.score) as metric_value,
        CURRENT_DATE - INTERVAL '1 day' as calculated_for_period
    FROM assessment_attempts aa
    WHERE DATE(aa.attempted_at) = CURRENT_DATE - INTERVAL '1 day'
    GROUP BY aa.user_id
    ON CONFLICT (user_id, metric_type, calculated_for_period) DO UPDATE SET
        metric_value = EXCLUDED.metric_value;
END;
$$ LANGUAGE plpgsql;

-- Content recommendation engine
CREATE OR REPLACE FUNCTION generate_content_recommendations()
RETURNS void AS $$
BEGIN
    -- Clear expired recommendations
    DELETE FROM progress.content_recommendations 
    WHERE expires_at < NOW();
    
    -- Recommend courses based on completion patterns
    INSERT INTO progress.content_recommendations (
        user_id, recommended_content_id, content_type, recommendation_type, confidence_score
    )
    WITH user_completed_courses AS (
        SELECT DISTINCT up.user_id, up.course_id
        FROM user_progress up
        WHERE up.completion_percentage >= 90
    ),
    similar_users AS (
        SELECT 
            u1.user_id as target_user,
            u2.user_id as similar_user,
            COUNT(*) as common_courses
        FROM user_completed_courses u1
        JOIN user_completed_courses u2 ON u1.course_id = u2.course_id
        WHERE u1.user_id != u2.user_id
        GROUP BY u1.user_id, u2.user_id
        HAVING COUNT(*) >= 3
    ),
    recommendations AS (
        SELECT 
            su.target_user as user_id,
            ucc.course_id as recommended_content_id,
            'course' as content_type,
            'similar_users' as recommendation_type,
            (su.common_courses::float / 10.0) as confidence_score
        FROM similar_users su
        JOIN user_completed_courses ucc ON ucc.user_id = su.similar_user
        LEFT JOIN user_completed_courses target_courses ON 
            target_courses.user_id = su.target_user AND 
            target_courses.course_id = ucc.course_id
        WHERE target_courses.course_id IS NULL  -- Not already taken
    )
    SELECT 
        user_id, recommended_content_id, content_type, recommendation_type,
        LEAST(confidence_score, 1.0) as confidence_score
    FROM recommendations
    WHERE confidence_score >= 0.3
    ON CONFLICT (user_id, recommended_content_id, content_type) DO UPDATE SET
        confidence_score = EXCLUDED.confidence_score,
        created_at = NOW(),
        expires_at = NOW() + INTERVAL '7 days';
    
    -- Recommend next courses in learning paths
    INSERT INTO progress.content_recommendations (
        user_id, recommended_content_id, content_type, recommendation_type, confidence_score
    )
    SELECT DISTINCT
        up.user_id,
        lpc_next.course_id as recommended_content_id,
        'course' as content_type,
        'learning_path_progression' as recommendation_type,
        0.9 as confidence_score
    FROM user_progress up
    JOIN content.learning_path_courses lpc_current ON lpc_current.course_id = up.course_id
    JOIN content.learning_path_courses lpc_next ON 
        lpc_next.learning_path_id = lpc_current.learning_path_id
        AND lpc_next.sequence_order = lpc_current.sequence_order + 1
    LEFT JOIN user_progress up_next ON 
        up_next.user_id = up.user_id AND up_next.course_id = lpc_next.course_id
    WHERE up.completion_percentage >= 90
    AND up_next.course_id IS NULL  -- Next course not started
    ON CONFLICT (user_id, recommended_content_id, content_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Content performance analysis
CREATE OR REPLACE FUNCTION analyze_content_performance()
RETURNS void AS $$
BEGIN
    -- Update course engagement metrics
    WITH course_metrics AS (
        SELECT 
            c.id as course_id,
            COUNT(DISTINCT up.user_id) as enrolled_users,
            AVG(up.completion_percentage) as avg_completion_rate,
            COUNT(CASE WHEN up.completion_percentage >= 90 THEN 1 END) as completed_users,
            AVG(la.metric_value) as avg_engagement_minutes
        FROM courses c
        LEFT JOIN user_progress up ON up.course_id = c.id
        LEFT JOIN progress.learning_analytics la ON 
            la.course_id = c.id AND la.metric_type = 'daily_engagement_minutes'
            AND la.calculated_for_period >= CURRENT_DATE - INTERVAL '7 days'
        WHERE c.is_published = true
        GROUP BY c.id
    )
    UPDATE courses c
    SET 
        enrollment_count = cm.enrolled_users,
        completion_rate = cm.avg_completion_rate,
        engagement_score = LEAST(cm.avg_engagement_minutes / 30.0, 1.0), -- Normalized to 30 min
        updated_at = NOW()
    FROM course_metrics cm
    WHERE c.id = cm.course_id;
    
    -- Identify struggling students
    INSERT INTO progress.content_recommendations (
        user_id, recommended_content_id, content_type, recommendation_type, confidence_score
    )
    SELECT 
        up.user_id,
        prerequisite_courses.course_id as recommended_content_id,
        'course' as content_type,
        'remedial_learning' as recommendation_type,
        0.8 as confidence_score
    FROM user_progress up
    JOIN courses c ON c.id = up.course_id
    CROSS JOIN LATERAL jsonb_array_elements_text(c.prerequisites) AS prerequisite_courses(course_id)
    LEFT JOIN user_progress prereq_progress ON 
        prereq_progress.user_id = up.user_id 
        AND prereq_progress.course_id = prerequisite_courses.course_id::UUID
    WHERE up.completion_percentage < 30
    AND up.updated_at >= NOW() - INTERVAL '7 days'
    AND (prereq_progress.completion_percentage < 80 OR prereq_progress.course_id IS NULL)
    ON CONFLICT (user_id, recommended_content_id, content_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Data cleanup procedures
CREATE OR REPLACE FUNCTION cleanup_education_data()
RETURNS void AS $$
BEGIN
    -- Clean up old lesson progress sessions (keep detailed data for 1 year)
    DELETE FROM progress.lesson_progress 
    WHERE updated_at < NOW() - INTERVAL '1 year'
    AND is_completed = true;
    
    -- Clean up old learning analytics (keep 2 years)
    DELETE FROM progress.learning_analytics 
    WHERE calculated_for_period < CURRENT_DATE - INTERVAL '2 years';
    
    -- Clean up old recommendations
    DELETE FROM progress.content_recommendations 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND (is_acted_upon = true OR expires_at < NOW());
    
    -- Archive old discussions (mark as archived, don't delete)
    UPDATE content.discussions 
    SET is_archived = true
    WHERE created_at < NOW() - INTERVAL '2 years'
    AND parent_id IS NULL;  -- Only archive top-level posts
    
    -- Clean up old assessment attempts (keep recent for analytics)
    DELETE FROM assessment_attempts 
    WHERE attempted_at < NOW() - INTERVAL '3 years';
END;
$$ LANGUAGE plpgsql;

-- Materialized views for education analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS content.course_analytics AS
SELECT 
    c.id,
    c.title,
    c.category_id,
    c.difficulty_level,
    COUNT(DISTINCT up.user_id) as enrolled_count,
    COUNT(DISTINCT CASE WHEN up.completion_percentage >= 90 THEN up.user_id END) as completed_count,
    AVG(up.completion_percentage) as avg_completion_rate,
    AVG(aa.score) as avg_quiz_score,
    COUNT(DISTINCT cert.id) as certificates_issued,
    AVG(EXTRACT(days FROM up.updated_at - up.created_at)) as avg_completion_days,
    c.rating,
    c.created_at
FROM courses c
LEFT JOIN user_progress up ON up.course_id = c.id
LEFT JOIN assessment_attempts aa ON aa.assessment_id IN (
    SELECT a.id FROM assessments a 
    JOIN lessons l ON l.id = a.lesson_id 
    WHERE l.course_id = c.id
) AND aa.user_id = up.user_id
LEFT JOIN certificates cert ON cert.course_id = c.id
WHERE c.is_published = true
GROUP BY c.id, c.title, c.category_id, c.difficulty_level, c.rating, c.created_at
ORDER BY enrolled_count DESC;

-- User learning progress summary
CREATE MATERIALIZED VIEW IF NOT EXISTS progress.user_learning_summary AS
SELECT 
    up.user_id,
    COUNT(DISTINCT up.course_id) as courses_enrolled,
    COUNT(DISTINCT CASE WHEN up.completion_percentage >= 90 THEN up.course_id END) as courses_completed,
    AVG(up.completion_percentage) as avg_completion_rate,
    SUM(lp.time_spent) / 3600.0 as total_hours_spent,
    COUNT(DISTINCT cert.id) as certificates_earned,
    AVG(aa.score) as avg_quiz_score,
    MAX(up.updated_at) as last_activity_date,
    MIN(up.created_at) as first_enrollment_date
FROM user_progress up
LEFT JOIN progress.lesson_progress lp ON lp.user_id = up.user_id
LEFT JOIN certificates cert ON cert.user_id = up.user_id
LEFT JOIN assessment_attempts aa ON aa.user_id = up.user_id
WHERE up.is_active = true
GROUP BY up.user_id
HAVING COUNT(DISTINCT up.course_id) > 0;

-- Schedule maintenance tasks
-- SELECT cron.schedule('calculate-learning-analytics', '0 1 * * *', 'SELECT calculate_learning_analytics();');
-- SELECT cron.schedule('generate-content-recommendations', '0 2 * * *', 'SELECT generate_content_recommendations();');
-- SELECT cron.schedule('analyze-content-performance', '0 3 * * *', 'SELECT analyze_content_performance();');
-- SELECT cron.schedule('cleanup-education-data', '0 4 * * 0', 'SELECT cleanup_education_data();');
-- SELECT cron.schedule('refresh-education-analytics', '0 */6 * * *', 
--   'REFRESH MATERIALIZED VIEW content.course_analytics; REFRESH MATERIALIZED VIEW progress.user_learning_summary;');

COMMENT ON DATABASE treum_education IS 'Education service database with personalized learning analytics, content recommendations, and progress tracking';
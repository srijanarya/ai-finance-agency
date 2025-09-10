-- TREUM Notifications Database Schema with Performance Optimizations
-- Database: treum_notifications
-- Service: notification

\c treum_notifications;

-- Notification-specific optimizations for high-throughput messaging
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET work_mem = '8MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Write-heavy optimizations for notification queuing
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET synchronous_commit = off;  -- Acceptable for notifications
ALTER SYSTEM SET checkpoint_completion_target = 0.9;

-- Notification delivery indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_status 
ON notifications(user_id, status) WHERE status IN ('pending', 'failed');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_scheduled_at 
ON notifications(scheduled_at ASC) WHERE status = 'scheduled' AND scheduled_at <= NOW();

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_priority 
ON notifications(created_at DESC, priority DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type_status 
ON notifications(notification_type, status);

-- Notification history for analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_history_user_created 
ON notification_history(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_history_delivery_status 
ON notification_history(delivery_status, delivered_at DESC);

-- User preferences optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_preferences_user 
ON notification_preferences(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_preferences_type 
ON notification_preferences(notification_type) WHERE is_enabled = true;

-- Push subscriptions for web push
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_push_subscriptions_user_active 
ON push_subscriptions(user_id) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_push_subscriptions_endpoint 
ON push_subscriptions USING hash(endpoint);

-- Template management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_templates_type 
ON notification_templates(template_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_templates_active 
ON notification_templates(is_active) WHERE is_active = true;

-- Templates schema for notification content management
CREATE SCHEMA IF NOT EXISTS templates;

-- Template versions for A/B testing
CREATE TABLE IF NOT EXISTS templates.template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    subject VARCHAR(255),
    body_text TEXT,
    body_html TEXT,
    variables JSONB,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(template_id, version_number)
);

CREATE INDEX idx_template_versions_template_active 
ON templates.template_versions(template_id, is_active);

-- Template performance tracking
CREATE TABLE IF NOT EXISTS templates.template_performance (
    template_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    delivery_rate DECIMAL(5,2),
    open_rate DECIMAL(5,2),
    click_rate DECIMAL(5,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (template_id, version_number)
);

-- Delivery schema for tracking and analytics
CREATE SCHEMA IF NOT EXISTS delivery;

-- Delivery attempts tracking
CREATE TABLE IF NOT EXISTS delivery.delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL,
    attempt_number INTEGER DEFAULT 1,
    delivery_method VARCHAR(20) NOT NULL, -- email, sms, push, in_app
    provider VARCHAR(50), -- sendgrid, twilio, fcm, etc.
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_delivery_attempts_notification_attempt 
ON delivery.delivery_attempts(notification_id, attempt_number);

CREATE INDEX idx_delivery_attempts_status_attempted 
ON delivery.delivery_attempts(status, attempted_at DESC);

-- Bounce and complaint handling
CREATE TABLE IF NOT EXISTS delivery.bounce_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID,
    user_id UUID NOT NULL,
    email_address VARCHAR(255),
    phone_number VARCHAR(20),
    bounce_type VARCHAR(50), -- hard, soft, complaint, unsubscribe
    bounce_reason TEXT,
    provider_response JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bounce_complaints_user_type 
ON delivery.bounce_complaints(user_id, bounce_type);

CREATE INDEX idx_bounce_complaints_email_occurred 
ON delivery.bounce_complaints(email_address, occurred_at DESC);

-- Notification queue management
CREATE TABLE IF NOT EXISTS delivery.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL,
    user_id UUID NOT NULL,
    priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
    delivery_method VARCHAR(20) NOT NULL,
    max_attempts INTEGER DEFAULT 3,
    current_attempts INTEGER DEFAULT 0,
    next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'queued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_queue_next_attempt_priority 
ON delivery.notification_queue(next_attempt_at ASC, priority ASC) 
WHERE status = 'queued' AND next_attempt_at <= NOW();

-- Notification processing procedures
CREATE OR REPLACE FUNCTION process_notification_queue()
RETURNS void AS $$
DECLARE
    queue_item RECORD;
    delivery_success BOOLEAN;
BEGIN
    -- Process pending notifications in priority order
    FOR queue_item IN
        SELECT nq.*, n.notification_type, n.subject, n.body, n.metadata
        FROM delivery.notification_queue nq
        JOIN notifications n ON n.id = nq.notification_id
        WHERE nq.status = 'queued'
        AND nq.next_attempt_at <= NOW()
        ORDER BY nq.priority ASC, nq.next_attempt_at ASC
        LIMIT 100  -- Process in batches
    LOOP
        -- Check user preferences
        IF NOT EXISTS (
            SELECT 1 FROM notification_preferences np
            WHERE np.user_id = queue_item.user_id
            AND np.notification_type = queue_item.notification_type
            AND np.delivery_method = queue_item.delivery_method
            AND np.is_enabled = true
        ) THEN
            -- User has disabled this notification type/method
            UPDATE delivery.notification_queue 
            SET status = 'skipped_preference'
            WHERE id = queue_item.id;
            CONTINUE;
        END IF;
        
        -- Record delivery attempt
        INSERT INTO delivery.delivery_attempts (
            notification_id, attempt_number, delivery_method, status
        ) VALUES (
            queue_item.notification_id, 
            queue_item.current_attempts + 1, 
            queue_item.delivery_method, 
            'attempting'
        );
        
        -- Update queue item
        UPDATE delivery.notification_queue 
        SET 
            current_attempts = current_attempts + 1,
            status = CASE 
                WHEN current_attempts + 1 >= max_attempts THEN 'failed'
                ELSE 'processing'
            END,
            next_attempt_at = CASE 
                WHEN current_attempts + 1 >= max_attempts THEN NULL
                ELSE NOW() + (INTERVAL '5 minutes' * POWER(2, current_attempts))  -- Exponential backoff
            END
        WHERE id = queue_item.id;
        
        -- Here you would call external notification service
        -- For this example, we'll simulate success/failure
        delivery_success := (RANDOM() > 0.1);  -- 90% success rate
        
        IF delivery_success THEN
            UPDATE notifications 
            SET status = 'sent', sent_at = NOW()
            WHERE id = queue_item.notification_id;
            
            UPDATE delivery.notification_queue 
            SET status = 'completed'
            WHERE id = queue_item.id;
            
            -- Record in history
            INSERT INTO notification_history (
                notification_id, user_id, delivery_status, delivered_at
            ) VALUES (
                queue_item.notification_id, queue_item.user_id, 'delivered', NOW()
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Template performance analytics
CREATE OR REPLACE FUNCTION update_template_performance()
RETURNS void AS $$
BEGIN
    -- Update template performance metrics
    INSERT INTO templates.template_performance (
        template_id, version_number, sent_count, delivered_count, 
        opened_count, clicked_count, delivery_rate, open_rate, click_rate
    )
    SELECT 
        nt.id as template_id,
        1 as version_number,  -- Simplified - would track actual versions
        COUNT(*) as sent_count,
        COUNT(CASE WHEN nh.delivery_status = 'delivered' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN nh.opened_at IS NOT NULL THEN 1 END) as opened_count,
        COUNT(CASE WHEN nh.clicked_at IS NOT NULL THEN 1 END) as clicked_count,
        (COUNT(CASE WHEN nh.delivery_status = 'delivered' THEN 1 END) * 100.0 / COUNT(*)) as delivery_rate,
        (COUNT(CASE WHEN nh.opened_at IS NOT NULL THEN 1 END) * 100.0 / 
         NULLIF(COUNT(CASE WHEN nh.delivery_status = 'delivered' THEN 1 END), 0)) as open_rate,
        (COUNT(CASE WHEN nh.clicked_at IS NOT NULL THEN 1 END) * 100.0 / 
         NULLIF(COUNT(CASE WHEN nh.opened_at IS NOT NULL THEN 1 END), 0)) as click_rate
    FROM notification_templates nt
    JOIN notifications n ON n.template_id = nt.id
    LEFT JOIN notification_history nh ON nh.notification_id = n.id
    WHERE n.created_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY nt.id
    ON CONFLICT (template_id, version_number) DO UPDATE SET
        sent_count = EXCLUDED.sent_count,
        delivered_count = EXCLUDED.delivered_count,
        opened_count = EXCLUDED.opened_count,
        clicked_count = EXCLUDED.clicked_count,
        delivery_rate = EXCLUDED.delivery_rate,
        open_rate = EXCLUDED.open_rate,
        click_rate = EXCLUDED.click_rate,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Bounce handling procedure
CREATE OR REPLACE FUNCTION handle_notification_bounces()
RETURNS void AS $$
BEGIN
    -- Automatically disable notifications for hard bounces
    UPDATE notification_preferences 
    SET is_enabled = false, updated_at = NOW()
    WHERE user_id IN (
        SELECT DISTINCT user_id 
        FROM delivery.bounce_complaints 
        WHERE bounce_type = 'hard'
        AND occurred_at >= NOW() - INTERVAL '24 hours'
    );
    
    -- Flag users with multiple soft bounces
    INSERT INTO delivery.bounce_complaints (user_id, bounce_type, bounce_reason)
    SELECT 
        user_id,
        'multiple_soft_bounces' as bounce_type,
        'Multiple soft bounces detected - temporarily disabled' as bounce_reason
    FROM (
        SELECT user_id, COUNT(*) as bounce_count
        FROM delivery.bounce_complaints
        WHERE bounce_type = 'soft'
        AND occurred_at >= NOW() - INTERVAL '7 days'
        GROUP BY user_id
        HAVING COUNT(*) >= 5
    ) multiple_bounces
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Data cleanup procedures
CREATE OR REPLACE FUNCTION cleanup_notification_data()
RETURNS void AS $$
BEGIN
    -- Clean up old notification history (keep 1 year)
    DELETE FROM notification_history 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Clean up old delivery attempts (keep 6 months)
    DELETE FROM delivery.delivery_attempts 
    WHERE attempted_at < NOW() - INTERVAL '6 months';
    
    -- Clean up completed queue items (keep 30 days)
    DELETE FROM delivery.notification_queue 
    WHERE status IN ('completed', 'failed', 'skipped_preference')
    AND created_at < NOW() - INTERVAL '30 days';
    
    -- Clean up old bounces (keep 2 years for compliance)
    DELETE FROM delivery.bounce_complaints 
    WHERE occurred_at < NOW() - INTERVAL '2 years';
    
    -- Archive old notifications (keep active for 90 days)
    UPDATE notifications 
    SET status = 'archived'
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND status NOT IN ('archived', 'scheduled');
END;
$$ LANGUAGE plpgsql;

-- Materialized views for notification analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS delivery.notification_metrics AS
SELECT 
    DATE_TRUNC('day', n.created_at)::DATE as notification_date,
    n.notification_type,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN n.status = 'sent' THEN 1 END) as sent_count,
    COUNT(CASE WHEN nh.delivery_status = 'delivered' THEN 1 END) as delivered_count,
    COUNT(CASE WHEN nh.opened_at IS NOT NULL THEN 1 END) as opened_count,
    COUNT(CASE WHEN nh.clicked_at IS NOT NULL THEN 1 END) as clicked_count,
    AVG(CASE WHEN nh.delivered_at IS NOT NULL AND n.created_at IS NOT NULL 
        THEN EXTRACT(epoch FROM nh.delivered_at - n.created_at) ELSE NULL END) as avg_delivery_time_seconds
FROM notifications n
LEFT JOIN notification_history nh ON nh.notification_id = n.id
WHERE n.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', n.created_at), n.notification_type
ORDER BY notification_date DESC;

-- User engagement metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS delivery.user_engagement AS
SELECT 
    user_id,
    COUNT(*) as total_notifications_received,
    COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as notifications_opened,
    COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as notifications_clicked,
    MAX(delivered_at) as last_notification_delivered,
    (COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)) as open_rate,
    (COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) * 100.0 / 
     NULLIF(COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END), 0)) as click_through_rate
FROM notification_history
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id
HAVING COUNT(*) >= 5;  -- Minimum sample size

-- Schedule maintenance tasks
-- SELECT cron.schedule('process-notification-queue', '* * * * *', 'SELECT process_notification_queue();');
-- SELECT cron.schedule('update-template-performance', '0 */6 * * *', 'SELECT update_template_performance();');
-- SELECT cron.schedule('handle-notification-bounces', '0 */2 * * *', 'SELECT handle_notification_bounces();');
-- SELECT cron.schedule('cleanup-notification-data', '0 2 * * *', 'SELECT cleanup_notification_data();');
-- SELECT cron.schedule('refresh-notification-analytics', '0 1 * * *', 
--   'REFRESH MATERIALIZED VIEW delivery.notification_metrics; REFRESH MATERIALIZED VIEW delivery.user_engagement;');

COMMENT ON DATABASE treum_notifications IS 'Notification service database optimized for high-throughput message delivery and engagement analytics';
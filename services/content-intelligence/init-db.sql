-- Content Intelligence Engine Database Initialization
-- This script sets up the initial database schema and seed data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create content_templates table
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template identification
    template_name VARCHAR(200) NOT NULL,
    template_category VARCHAR(100) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    
    -- Template content
    template_structure JSONB NOT NULL,
    example_content TEXT,
    content_guidelines TEXT,
    
    -- AI generation parameters
    ai_model_preference VARCHAR(50) DEFAULT 'auto',
    generation_parameters JSONB,
    quality_threshold DECIMAL(3, 1) DEFAULT 8.0,
    
    -- Compliance requirements
    compliance_level VARCHAR(20) DEFAULT 'standard',
    required_disclaimers JSONB,
    restricted_jurisdictions TEXT[],
    
    -- Usage and performance
    usage_count INTEGER DEFAULT 0,
    average_quality_score DECIMAL(3, 1),
    average_engagement_rate DECIMAL(5, 2),
    
    -- Metadata
    industry_tags TEXT[],
    audience_tags TEXT[],
    language VARCHAR(5) DEFAULT 'en',
    
    -- Template management
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_by UUID,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for content_templates
CREATE INDEX IF NOT EXISTS idx_content_templates_category_type ON content_templates(template_category, template_type);
CREATE INDEX IF NOT EXISTS idx_content_templates_tags ON content_templates USING GIN(industry_tags, audience_tags);
CREATE INDEX IF NOT EXISTS idx_content_templates_usage ON content_templates(usage_count DESC);

-- Insert sample content templates
INSERT INTO content_templates (
    template_name, 
    template_category, 
    template_type, 
    template_structure,
    content_guidelines,
    industry_tags,
    audience_tags
) VALUES 
(
    'Market Analysis Report',
    'market_analysis',
    'report',
    '{"title": "{{market}} Market Analysis - {{date}}", "sections": ["executive_summary", "market_overview", "key_trends", "outlook", "risks"], "tone": "professional", "length": "2000-3000"}'::jsonb,
    'Provide data-driven insights with clear market trends, supported by reliable sources. Include risk disclaimers.',
    ARRAY['equities', 'market_research'],
    ARRAY['institutional_investors', 'financial_advisors']
),
(
    'Social Media Financial Tip',
    'education',
    'post',
    '{"hook": "{{attention_grabber}}", "tip": "{{main_content}}", "cta": "{{call_to_action}}", "hashtags": "{{relevant_hashtags}}", "length": "280-500"}'::jsonb,
    'Educational, actionable financial tips for social media. Keep it simple, engaging, and compliant.',
    ARRAY['personal_finance', 'education'],
    ARRAY['retail_investors', 'millennials']
),
(
    'Investment Newsletter',
    'newsletter',
    'email',
    '{"subject": "{{newsletter_title}}", "greeting": "{{personalized_greeting}}", "sections": ["market_update", "investment_spotlight", "educational_content"], "closing": "{{signature}}", "length": "1500-2500"}'::jsonb,
    'Weekly investment insights combining market updates with educational content. Maintain professional tone.',
    ARRAY['investments', 'portfolio_management'],
    ARRAY['individual_investors', 'high_net_worth']
),
(
    'Crypto Analysis',
    'market_analysis',
    'article',
    '{"title": "{{crypto_focus}} Analysis", "sections": ["price_analysis", "technical_indicators", "fundamental_factors", "risk_assessment"], "length": "1200-1800"}'::jsonb,
    'Balanced cryptocurrency analysis covering both technical and fundamental factors. Include high-risk disclaimers.',
    ARRAY['cryptocurrency', 'blockchain'],
    ARRAY['crypto_investors', 'tech_savvy']
),
(
    'ESG Investment Insight',
    'education',
    'article',
    '{"title": "ESG Investing: {{focus_area}}", "sections": ["esg_definition", "investment_benefits", "selection_criteria", "performance_data"], "length": "1000-1500"}'::jsonb,
    'Educational content about ESG investing principles and opportunities. Focus on sustainability impact.',
    ARRAY['esg', 'sustainable_investing'],
    ARRAY['conscious_investors', 'millennials']
) 
ON CONFLICT DO NOTHING;

-- Create compliance_rules table with sample data
CREATE TABLE IF NOT EXISTS compliance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Rule identification
    rule_name VARCHAR(200) NOT NULL,
    rule_category VARCHAR(100) NOT NULL,
    rule_code VARCHAR(50),
    
    -- Rule details
    rule_description TEXT NOT NULL,
    rule_full_text TEXT,
    interpretation_guidance TEXT,
    
    -- Applicability
    applicable_jurisdictions TEXT[] NOT NULL,
    applicable_content_types TEXT[],
    applicable_industries TEXT[],
    
    -- Rule parameters
    severity_level VARCHAR(20) NOT NULL,
    violation_penalty TEXT,
    
    -- Detection parameters
    detection_keywords TEXT[],
    detection_patterns JSONB,
    
    -- Automation settings
    auto_enforcement BOOLEAN DEFAULT FALSE,
    requires_human_review BOOLEAN DEFAULT TRUE,
    
    -- Rule lifecycle
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    superseded_by UUID,
    
    -- Metadata
    regulatory_source VARCHAR(200),
    last_updated_by VARCHAR(100),
    update_frequency VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample compliance rules
INSERT INTO compliance_rules (
    rule_name,
    rule_category,
    rule_code,
    rule_description,
    applicable_jurisdictions,
    applicable_content_types,
    severity_level,
    detection_keywords,
    effective_date
) VALUES 
(
    'Investment Advice Disclaimer Requirement',
    'SEC',
    'SEC-17a-3',
    'All investment-related content must include appropriate disclaimers about risks and that past performance does not guarantee future results.',
    ARRAY['US'],
    ARRAY['analysis', 'recommendation', 'post'],
    'high',
    ARRAY['investment', 'portfolio', 'returns', 'profit', 'gain'],
    '2020-01-01'
),
(
    'Forward-Looking Statement Warnings',
    'SEC',
    'SEC-27A',
    'Content containing forward-looking statements must include safe harbor disclaimers.',
    ARRAY['US'],
    ARRAY['analysis', 'report', 'article'],
    'medium',
    ARRAY['forecast', 'expect', 'predict', 'outlook', 'will', 'should'],
    '2020-01-01'
),
(
    'GDPR Privacy Compliance',
    'GDPR',
    'GDPR-ART-13',
    'Content that collects or processes personal data must include privacy notices.',
    ARRAY['EU', 'UK'],
    ARRAY['email', 'newsletter', 'form'],
    'critical',
    ARRAY['email', 'subscribe', 'personal', 'data', 'contact'],
    '2018-05-25'
),
(
    'High-Risk Investment Warning',
    'FINRA',
    'FINRA-2210',
    'Content promoting high-risk investments must include prominent risk warnings.',
    ARRAY['US'],
    ARRAY['analysis', 'post', 'article'],
    'high',
    ARRAY['crypto', 'options', 'futures', 'leverage', 'margin'],
    '2020-01-01'
)
ON CONFLICT DO NOTHING;

-- Create indexes for compliance_rules
CREATE INDEX IF NOT EXISTS idx_compliance_rules_category_jurisdiction ON compliance_rules(rule_category, applicable_jurisdictions);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_content_type ON compliance_rules USING GIN(applicable_content_types);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_severity ON compliance_rules(severity_level, is_active);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_effective ON compliance_rules(effective_date, expiry_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to tables
CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_rules_updated_at BEFORE UPDATE ON compliance_rules 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO content_intelligence_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO content_intelligence_user;

COMMIT;
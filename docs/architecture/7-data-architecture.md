# 7. Data Architecture

## 7.1 Database Design - PostgreSQL Schemas

**Core Database Schemas**:

```sql
-- ======================================
-- USER MANAGEMENT SCHEMA
-- ======================================
CREATE SCHEMA user_management;

-- Users table with KYC compliance
CREATE TABLE user_management.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    kyc_status VARCHAR(20) CHECK (kyc_status IN ('pending', 'verified', 'rejected', 'expired')),
    kyc_verified_at TIMESTAMP,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Audit fields
    created_by UUID,
    updated_by UUID,
    
    -- Compliance fields
    aml_status VARCHAR(20) DEFAULT 'pending',
    sanctions_check_date TIMESTAMP,
    pep_status BOOLEAN DEFAULT FALSE
);

-- User profiles with PII encryption
CREATE TABLE user_management.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES user_management.users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    pan_number VARCHAR(20) UNIQUE, -- Encrypted
    aadhaar_number VARCHAR(20), -- Encrypted
    address JSONB, -- Encrypted JSON
    nationality VARCHAR(3) DEFAULT 'IND',
    occupation VARCHAR(100),
    annual_income DECIMAL(15,2),
    
    -- Investment profile
    investment_experience VARCHAR(20) CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
    risk_tolerance VARCHAR(20) CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
    investment_horizon VARCHAR(20) CHECK (investment_horizon IN ('short', 'medium', 'long')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role-based access control
CREATE TABLE user_management.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_management.user_roles (
    user_id UUID REFERENCES user_management.users(id),
    role_id UUID REFERENCES user_management.roles(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    expires_at TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- ======================================
-- EDUCATION PLATFORM SCHEMA
-- ======================================
CREATE SCHEMA education;

-- Course catalog
CREATE TABLE education.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES user_management.users(id),
    category VARCHAR(100),
    level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    duration_minutes INTEGER,
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')),
    
    -- SEO and metadata
    slug VARCHAR(255) UNIQUE,
    meta_description TEXT,
    tags TEXT[],
    
    -- Content metadata
    module_count INTEGER DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    assessment_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Course modules and lessons
CREATE TABLE education.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES education.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(course_id, order_index)
);

CREATE TABLE education.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES education.course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(20) CHECK (content_type IN ('video', 'text', 'quiz', 'assignment')),
    content_url VARCHAR(500),
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    
    -- Video specific fields
    video_id VARCHAR(100),
    transcript TEXT,
    subtitles JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(module_id, order_index)
);

-- Enrollments and progress tracking
CREATE TABLE education.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_management.users(id),
    course_id UUID REFERENCES education.courses(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    last_accessed_at TIMESTAMP,
    
    -- Payment information
    payment_id UUID,
    amount_paid DECIMAL(10,2),
    
    UNIQUE(user_id, course_id)
);

CREATE TABLE education.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES education.enrollments(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES education.lessons(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent_minutes INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    
    UNIQUE(enrollment_id, lesson_id)
);

-- ======================================
-- FINANCIAL TRANSACTIONS SCHEMA
-- ======================================
CREATE SCHEMA finance;

-- Payment transactions with full audit trail
CREATE TABLE finance.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_management.users(id),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('payment', 'refund', 'subscription', 'commission')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Payment gateway details
    gateway_provider VARCHAR(50), -- razorpay, stripe, payu
    gateway_transaction_id VARCHAR(255),
    gateway_reference VARCHAR(255),
    gateway_fees DECIMAL(10,2),
    
    -- Related entities
    related_entity_type VARCHAR(50), -- course, subscription, signal_plan
    related_entity_id UUID,
    
    -- Metadata
    metadata JSONB,
    failure_reason TEXT,
    processed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription management
CREATE TABLE finance.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE finance.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_management.users(id),
    plan_id UUID REFERENCES finance.subscription_plans(id),
    status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
    
    -- Billing details
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    next_billing_date TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Payment details
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method_id UUID,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- SIGNALS & TRADING SCHEMA
-- ======================================
CREATE SCHEMA signals;

-- Signal generation and distribution
CREATE TABLE signals.signal_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    source_type VARCHAR(20) CHECK (source_type IN ('ai_model', 'analyst', 'algorithm', 'sentiment')),
    confidence_score DECIMAL(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signals.trading_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES signals.signal_sources(id),
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(50),
    signal_type VARCHAR(20) CHECK (signal_type IN ('buy', 'sell', 'hold', 'exit')),
    
    -- Signal details
    entry_price DECIMAL(15,4),
    target_price DECIMAL(15,4),
    stop_loss DECIMAL(15,4),
    quantity_recommended INTEGER,
    confidence_level DECIMAL(5,2),
    
    -- Timing
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    executed_at TIMESTAMP,
    
    -- Performance tracking
    actual_entry_price DECIMAL(15,4),
    actual_exit_price DECIMAL(15,4),
    actual_return_percentage DECIMAL(8,4),
    
    -- Metadata
    analysis_data JSONB,
    market_conditions JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signal subscriptions and access control
CREATE TABLE signals.signal_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_management.users(id),
    subscription_id UUID REFERENCES finance.user_subscriptions(id),
    signal_categories TEXT[], -- ['equity', 'crypto', 'forex', 'commodity']
    max_signals_per_day INTEGER,
    real_time_access BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 7.2 Data Warehouse for Analytics

**Snowflake Architecture**:
```sql
-- ======================================
-- SNOWFLAKE DATA WAREHOUSE SCHEMA
-- ======================================

-- Create databases
CREATE DATABASE TREUM_ANALYTICS;
CREATE DATABASE TREUM_STAGING;

USE DATABASE TREUM_ANALYTICS;

-- User analytics warehouse
CREATE OR REPLACE TABLE user_analytics (
    user_id STRING,
    registration_date DATE,
    kyc_completion_date DATE,
    user_tier STRING, -- free, premium, enterprise
    total_courses_enrolled INTEGER,
    total_amount_spent DECIMAL(15,2),
    last_login_date DATE,
    lifetime_value DECIMAL(15,2),
    churn_probability DECIMAL(5,4),
    
    -- Engagement metrics
    total_login_days INTEGER,
    avg_session_duration_minutes DECIMAL(8,2),
    total_video_watch_minutes INTEGER,
    course_completion_rate DECIMAL(5,4),
    
    -- Trading metrics
    total_signals_received INTEGER,
    signals_acted_upon INTEGER,
    avg_signal_return DECIMAL(8,4),
    total_trading_volume DECIMAL(15,2),
    
    -- Temporal fields
    date_created DATE,
    date_updated DATE,
    
    PRIMARY KEY (user_id, date_created)
) CLUSTER BY (date_created, user_tier);

-- Course performance analytics
CREATE OR REPLACE TABLE course_analytics (
    course_id STRING,
    course_title STRING,
    instructor_id STRING,
    category STRING,
    
    -- Enrollment metrics
    total_enrollments INTEGER,
    total_completions INTEGER,
    completion_rate DECIMAL(5,4),
    avg_completion_time_days DECIMAL(8,2),
    
    -- Financial metrics
    total_revenue DECIMAL(15,2),
    avg_price DECIMAL(10,2),
    refund_rate DECIMAL(5,4),
    
    -- Engagement metrics
    avg_rating DECIMAL(3,2),
    total_reviews INTEGER,
    avg_watch_time_percentage DECIMAL(5,4),
    
    -- Performance over time
    monthly_enrollments VARIANT, -- JSON array of monthly data
    revenue_trend VARIANT,
    
    date_created DATE,
    PRIMARY KEY (course_id, date_created)
) CLUSTER BY (date_created, category);

-- Signal performance analytics
CREATE OR REPLACE TABLE signal_analytics (
    signal_id STRING,
    symbol STRING,
    exchange STRING,
    signal_type STRING,
    source_id STRING,
    
    -- Performance metrics
    entry_price DECIMAL(15,4),
    exit_price DECIMAL(15,4),
    return_percentage DECIMAL(8,4),
    hold_duration_hours INTEGER,
    accuracy_score DECIMAL(5,4),
    
    -- Distribution metrics
    total_subscribers INTEGER,
    signals_acted_upon INTEGER,
    action_rate DECIMAL(5,4),
    avg_subscriber_return DECIMAL(8,4),
    
    -- Market context
    market_conditions VARIANT,
    volatility_index DECIMAL(8,4),
    
    signal_date DATE,
    created_date DATE,
    
    PRIMARY KEY (signal_id, created_date)
) CLUSTER BY (signal_date, symbol);
```

**ETL Pipeline with DBT**:
```yaml
# dbt_project.yml
name: 'treum_analytics'
version: '1.0.0'
config-version: 2

model-paths: ["models"]
analysis-paths: ["analysis"]
test-paths: ["tests"]
seed-paths: ["data"]

models:
  treum_analytics:
    staging:
      +materialized: view
      +schema: staging
    marts:
      +materialized: table
      +schema: marts
    aggregates:
      +materialized: incremental
      +schema: aggregates
      +unique_key: id
      +on_schema_change: append_new_columns

# DBT model for user analytics
# models/marts/user_analytics.sql
{{ config(
    materialized='incremental',
    unique_key='user_id',
    on_schema_change='append_new_columns'
) }}

WITH user_base AS (
    SELECT 
        u.id as user_id,
        u.created_at::date as registration_date,
        up.kyc_verified_at::date as kyc_completion_date,
        CASE 
            WHEN s.plan_id IS NOT NULL THEN sp.name
            ELSE 'free'
        END as user_tier
    FROM {{ ref('stg_users') }} u
    LEFT JOIN {{ ref('stg_user_profiles') }} up ON u.id = up.user_id
    LEFT JOIN {{ ref('stg_user_subscriptions') }} s ON u.id = s.user_id AND s.status = 'active'
    LEFT JOIN {{ ref('stg_subscription_plans') }} sp ON s.plan_id = sp.id
),

enrollment_metrics AS (
    SELECT 
        user_id,
        COUNT(*) as total_courses_enrolled,
        SUM(amount_paid) as total_amount_spent,
        AVG(progress_percentage) as avg_course_progress
    FROM {{ ref('stg_enrollments') }}
    GROUP BY user_id
),

engagement_metrics AS (
    SELECT 
        user_id,
        COUNT(DISTINCT login_date) as total_login_days,
        AVG(session_duration_minutes) as avg_session_duration,
        SUM(video_watch_minutes) as total_video_watch_minutes
    FROM {{ ref('stg_user_sessions') }}
    GROUP BY user_id
)

SELECT 
    ub.user_id,
    ub.registration_date,
    ub.kyc_completion_date,
    ub.user_tier,
    COALESCE(em.total_courses_enrolled, 0) as total_courses_enrolled,
    COALESCE(em.total_amount_spent, 0) as total_amount_spent,
    COALESCE(em.avg_course_progress, 0) as avg_course_progress,
    COALESCE(egm.total_login_days, 0) as total_login_days,
    COALESCE(egm.avg_session_duration, 0) as avg_session_duration,
    COALESCE(egm.total_video_watch_minutes, 0) as total_video_watch_minutes,
    CURRENT_DATE() as date_created
FROM user_base ub
LEFT JOIN enrollment_metrics em ON ub.user_id = em.user_id
LEFT JOIN engagement_metrics egm ON ub.user_id = egm.user_id

{% if is_incremental() %}
WHERE ub.registration_date >= (SELECT MAX(date_created) FROM {{ this }}) - INTERVAL '7 days'
{% endif %}
```

## 7.3 Real-time Streaming with Kafka

**Kafka Architecture for Signal Distribution**:
```yaml
Kafka Cluster Configuration:
  Brokers: 6 (across 3 AZs, 2 per AZ)
  Replication Factor: 3
  Min In-Sync Replicas: 2
  
Topics:
  trading-signals:
    partitions: 12
    retention: 7 days
    compression: lz4
    
  user-events:
    partitions: 24
    retention: 30 days
    compression: snappy
    
  payment-events:
    partitions: 6
    retention: 90 days
    compression: gzip
    
  video-analytics:
    partitions: 12
    retention: 14 days
    compression: lz4
```

**Kafka Streams Application for Real-time Processing**:
```java
@Component
public class SignalProcessingStream {
    
    @Bean
    public KStream<String, TradingSignal> signalProcessingTopology(
            StreamsBuilder streamsBuilder) {
        
        KStream<String, TradingSignal> signalStream = streamsBuilder
            .stream("raw-signals", Consumed.with(Serdes.String(), signalSerde()));
        
        // Enrich signals with market data
        KTable<String, MarketData> marketTable = streamsBuilder
            .table("market-data", Consumed.with(Serdes.String(), marketDataSerde()));
        
        KStream<String, EnrichedSignal> enrichedSignals = signalStream
            .join(marketTable, 
                (signal, market) -> new EnrichedSignal(signal, market),
                Joined.with(Serdes.String(), signalSerde(), marketDataSerde())
            );
        
        // Filter signals by confidence score
        KStream<String, EnrichedSignal> highConfidenceSignals = enrichedSignals
            .filter((key, signal) -> signal.getConfidenceScore() > 75.0);
        
        // Route signals to user-specific topics
        highConfidenceSignals
            .selectKey((key, signal) -> signal.getSymbol())
            .to("trading-signals", Produced.with(Serdes.String(), enrichedSignalSerde()));
        
        // Create aggregated statistics
        KTable<String, SignalStats> signalStats = enrichedSignals
            .groupBy((key, signal) -> signal.getSymbol())
            .aggregate(
                SignalStats::new,
                (key, signal, stats) -> stats.update(signal),
                Materialized.<String, SignalStats, KeyValueStore<Bytes, byte[]>>as("signal-stats")
                    .withKeySerde(Serdes.String())
                    .withValueSerde(signalStatsSerde())
            );
        
        return signalStream;
    }
    
    @Bean
    public KStream<String, UserEvent> userEventProcessing(
            StreamsBuilder streamsBuilder) {
        
        KStream<String, UserEvent> userEvents = streamsBuilder
            .stream("user-events", Consumed.with(Serdes.String(), userEventSerde()));
        
        // Real-time user segmentation
        KStream<String, UserSegment> userSegments = userEvents
            .groupByKey()
            .windowedBy(TimeWindows.of(Duration.ofMinutes(5)))
            .aggregate(
                UserActivity::new,
                (key, event, activity) -> activity.addEvent(event),
                Materialized.with(Serdes.String(), userActivitySerde())
            )
            .toStream()
            .mapValues(activity -> calculateUserSegment(activity));
        
        // Send to recommendations engine
        userSegments.to("user-segments", 
            Produced.with(Serdes.String(), userSegmentSerde()));
        
        return userEvents;
    }
}
```

## 7.4 Data Lake for ML Training

**S3 Data Lake Structure**:
```
treum-data-lake/
├── raw/
│   ├── year=2024/month=01/day=15/
│   │   ├── user-events/           # User interaction logs
│   │   ├── market-data/           # Price feeds, volumes
│   │   ├── social-sentiment/      # Social media sentiment
│   │   └── news-data/             # Financial news articles
│   └── year=2024/month=01/day=16/
├── processed/
│   ├── features/
│   │   ├── user-features/         # Engineered user features
│   │   ├── market-features/       # Technical indicators
│   │   └── signal-features/       # Signal performance features
│   └── training-data/
│       ├── signal-prediction/     # ML training datasets
│       ├── user-churn/           # Churn prediction data
│       └── recommendation/        # Course recommendation data
└── models/
    ├── signal-generation/         # Trained ML models
    ├── risk-assessment/          # Risk scoring models
    └── recommendation/           # Recommendation engines
```

**Apache Airflow DAGs for Data Pipeline**:
```python
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.operators.bash_operator import BashOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'treum_ml_pipeline',
    default_args=default_args,
    description='TREUM ML Training Pipeline',
    schedule_interval='@daily',
    catchup=False,
    max_active_runs=1
)

def extract_user_features(**context):
    """Extract user behavior features for ML training"""
    import pandas as pd
    from sqlalchemy import create_engine
    
    engine = create_engine(os.getenv('POSTGRES_URL'))
    
    query = """
    SELECT 
        u.id as user_id,
        EXTRACT(epoch FROM NOW() - u.created_at) / 86400 as account_age_days,
        COUNT(DISTINCT e.course_id) as courses_enrolled,
        AVG(e.progress_percentage) as avg_course_progress,
        SUM(t.amount) as total_spent,
        COUNT(DISTINCT DATE(s.login_at)) as active_days_last_30,
        AVG(s.session_duration) as avg_session_duration
    FROM user_management.users u
    LEFT JOIN education.enrollments e ON u.id = e.user_id
    LEFT JOIN finance.transactions t ON u.id = t.user_id AND t.status = 'completed'
    LEFT JOIN user_sessions s ON u.id = s.user_id 
        AND s.login_at >= NOW() - INTERVAL '30 days'
    WHERE u.created_at >= '{{ ds }}' - INTERVAL '7 days'
        AND u.created_at < '{{ ds }}'
    GROUP BY u.id, u.created_at
    """
    
    df = pd.read_sql(query, engine)
    
    # Feature engineering
    df['spending_velocity'] = df['total_spent'] / df['account_age_days']
    df['engagement_score'] = (df['active_days_last_30'] * df['avg_session_duration']) / 30
    df['course_completion_rate'] = df['avg_course_progress'] / 100
    
    # Save to S3
    s3_path = f"s3://treum-data-lake/processed/features/user-features/date={{ ds }}/user_features.parquet"
    df.to_parquet(s3_path, index=False)

def train_signal_model(**context):
    """Train signal generation model"""
    import mlflow
    import mlflow.sklearn
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_squared_error, r2_score
    
    # Load training data
    training_data = load_from_s3("s3://treum-data-lake/processed/training-data/signal-prediction/")
    
    X = training_data[['volatility', 'volume', 'rsi', 'macd', 'sentiment_score']]
    y = training_data['next_day_return']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    # Log with MLflow
    with mlflow.start_run():
        mlflow.log_param("n_estimators", 100)
        mlflow.log_metric("mse", mse)
        mlflow.log_metric("r2", r2)
        mlflow.sklearn.log_model(model, "signal_model")
        
        # Register model if performance is good
        if r2 > 0.7:
            mlflow.register_model(
                f"runs:/{mlflow.active_run().info.run_id}/signal_model",
                "signal_generation_model"
            )

# Define tasks
extract_features_task = PythonOperator(
    task_id='extract_user_features',
    python_callable=extract_user_features,
    dag=dag
)

extract_market_data_task = BashOperator(
    task_id='extract_market_data',
    bash_command="""
    python /opt/airflow/scripts/extract_market_data.py \
        --date {{ ds }} \
        --output s3://treum-data-lake/raw/year={{ macros.ds_format(ds, "%Y-%m-%d", "%Y") }}/month={{ macros.ds_format(ds, "%Y-%m-%d", "%m") }}/day={{ macros.ds_format(ds, "%Y-%m-%d", "%d") }}/market-data/
    """,
    dag=dag
)

train_model_task = PythonOperator(
    task_id='train_signal_model',
    python_callable=train_signal_model,
    dag=dag
)

# Set dependencies
extract_features_task >> train_model_task
extract_market_data_task >> train_model_task
```

## 7.5 OLTP vs OLAP Separation

**OLTP (Operational) - Production Databases**:
```yaml
PostgreSQL Primary (OLTP):
  Purpose: Transactional operations
  Characteristics:
    - High concurrency (1000+ connections)
    - Low latency (< 10ms queries)
    - ACID compliance
    - Normalized schema
    - Row-based storage
    
  Workload:
    - User authentication: 10K QPS
    - Course enrollments: 500 QPS
    - Payment processing: 200 QPS
    - Signal distribution: 5K QPS
    
  Configuration:
    shared_buffers: 8GB
    effective_cache_size: 24GB
    work_mem: 256MB
    max_connections: 1000
    checkpoint_segments: 64
```

**OLAP (Analytical) - Data Warehouse**:
```yaml
Snowflake (OLAP):
  Purpose: Analytics and reporting
  Characteristics:
    - Complex aggregations
    - Large data scans
    - Columnar storage
    - Denormalized schema
    - Time-based partitioning
    
  Workload:
    - Daily revenue reports
    - User behavior analysis
    - Signal performance analytics
    - Cohort analysis
    - Predictive modeling
    
  Warehouses:
    COMPUTE_WH_SMALL: 
      - Scheduled reports
      - Dashboard queries
    COMPUTE_WH_LARGE:
      - ML training data prep
      - Complex analytics
    COMPUTE_WH_XLARGE:
      - Historical data analysis
      - Data science workloads
```

**Data Synchronization Strategy**:
```yaml
Real-time Sync (CDC):
  Tool: Debezium + Kafka Connect
  Sources: PostgreSQL, MongoDB
  Targets: Snowflake, S3 Data Lake
  Latency: < 5 seconds
  
Batch Sync:
  Tool: Apache Airflow + Apache Spark
  Schedule: Hourly for aggregations, Daily for full sync
  Data Volume: 100GB+ daily
  
Stream Processing:
  Tool: Kafka Streams
  Purpose: Real-time aggregations
  Output: Redis for fast retrieval
```

---

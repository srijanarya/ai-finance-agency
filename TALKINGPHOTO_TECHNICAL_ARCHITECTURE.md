# TalkingPhoto MVP - Technical Architecture & System Design

**Project**: AI-Powered Creator Platform for Photo-to-Video Workflows  
**Budget**: ₹1 Lakh → ₹7.5L MRR in 8 weeks  
**Architecture**: Export-first MVP → Progressive API integrations  
**Deployment**: Streamlit Cloud for rapid professional deployment  

---

## 🏗️ SYSTEM ARCHITECTURE OVERVIEW

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "External Services"
        NB[Nano Banana API<br/>₹0.039/image]
        VEO[Veo3 API<br/>₹0.15/second]
        RWY[Runway API<br/>₹0.20/second]
        STR[Stripe API<br/>Payment Processing]
        AWS[AWS S3<br/>File Storage]
    end

    subgraph "Streamlit Cloud Deployment"
        subgraph "Frontend Layer"
            UI[Streamlit UI<br/>main.py]
            AUTH[Authentication<br/>streamlit-authenticator]
            UP[File Upload Handler<br/>streamlit-dropzone]
        end

        subgraph "Application Layer"
            API[Flask API Gateway<br/>api.py]
            WE[Workflow Engine<br/>workflow_processor.py]
            EG[Export Generator<br/>export_kit.py]
            QM[Queue Manager<br/>celery_worker.py]
        end

        subgraph "Business Logic"
            AI[AI Service Router<br/>ai_services/]
            PM[Payment Manager<br/>payment_service.py]
            UM[User Manager<br/>user_service.py]
            AM[Analytics Manager<br/>analytics.py]
        end

        subgraph "Data Layer"
            DB[(PostgreSQL<br/>User Data)]
            REDIS[(Redis<br/>Session & Cache)]
            FS[File System<br/>Temp Storage]
        end
    end

    subgraph "Monitoring & Observability"
        LOGS[Logging<br/>Structured JSON]
        METRICS[Metrics<br/>Prometheus]
        ALERTS[Alerts<br/>Discord/Slack]
    end

    UI --> AUTH
    UI --> UP
    UI --> API
    API --> WE
    WE --> AI
    WE --> EG
    AI --> NB
    AI --> VEO
    AI --> RWY
    API --> PM
    API --> UM
    API --> AM
    PM --> STR
    UM --> DB
    AM --> DB
    WE --> QM
    QM --> REDIS
    API --> FS
    FS --> AWS
    
    API --> LOGS
    WE --> METRICS
    METRICS --> ALERTS
```

---

## 🎯 1. API INTEGRATION ARCHITECTURE WITH FALLBACKS

### AI Service Router Design

```python
# ai_services/router.py
class AIServiceRouter:
    def __init__(self):
        self.services = {
            'image_enhancement': [
                {'name': 'nano_banana', 'cost': 0.039, 'quality': 8.5, 'speed': 2.1},
                {'name': 'ideogram', 'cost': 0.50, 'quality': 9.2, 'speed': 3.4},
                {'name': 'midjourney_api', 'cost': 0.35, 'quality': 9.5, 'speed': 8.2}
            ],
            'video_generation': [
                {'name': 'veo3', 'cost': 0.15, 'quality': 8.0, 'speed': 12.5},
                {'name': 'runway_act2', 'cost': 0.20, 'quality': 9.5, 'speed': 15.3},
                {'name': 'heygen_avatar', 'cost': 3.00, 'quality': 9.8, 'speed': 25.0}
            ]
        }
        self.fallback_chain = self._build_fallback_chain()
    
    def route_request(self, service_type: str, user_tier: str, budget_limit: float):
        """Smart routing based on user tier, budget, and service availability"""
        available_services = self._get_available_services(service_type)
        optimal_service = self._select_optimal_service(
            available_services, user_tier, budget_limit
        )
        return self._execute_with_fallback(optimal_service, service_type)
    
    def _execute_with_fallback(self, primary_service, service_type):
        """Execute with automatic fallback on failure"""
        fallback_services = self.fallback_chain[service_type]
        
        for service_config in [primary_service] + fallback_services:
            try:
                result = self._call_service(service_config)
                if self._validate_result(result):
                    return result
            except Exception as e:
                self._log_service_failure(service_config, e)
                continue
        
        raise ServiceUnavailableError("All services failed for " + service_type)
```

### API Integration Patterns

```python
# ai_services/integrations/
class BaseAIService:
    def __init__(self, api_key: str, rate_limiter: RateLimiter):
        self.api_key = api_key
        self.rate_limiter = rate_limiter
        self.circuit_breaker = CircuitBreaker()
    
    async def process(self, input_data: dict) -> dict:
        async with self.rate_limiter:
            with self.circuit_breaker:
                return await self._process_internal(input_data)

class NanoBananaService(BaseAIService):
    async def enhance_image(self, image_data: bytes, enhancement_type: str):
        """Nano Banana image enhancement with Gemini 2.5 Flash"""
        payload = {
            "image": base64.b64encode(image_data).decode(),
            "enhancement_type": enhancement_type,
            "quality": "high"
        }
        
        response = await self._make_request(
            endpoint="https://nanobanana.ai/api/v1/enhance",
            payload=payload
        )
        
        return {
            "enhanced_image": response["enhanced_image"],
            "enhancement_applied": response["enhancements"],
            "cost": 0.039,
            "processing_time": response["processing_time"]
        }

class Veo3Service(BaseAIService):
    async def generate_video(self, image_data: bytes, script: str, duration: int):
        """Veo3 video generation with optimized settings"""
        payload = {
            "input_image": base64.b64encode(image_data).decode(),
            "script": script,
            "duration": min(duration, 10),  # 10s limit for cost control
            "quality": "standard",
            "format": "mp4"
        }
        
        # Start async generation
        job_response = await self._make_request(
            endpoint="https://veo3.ai/api/v1/generate",
            payload=payload
        )
        
        # Poll for completion with exponential backoff
        video_result = await self._poll_job_completion(job_response["job_id"])
        
        return {
            "video_url": video_result["video_url"],
            "duration": video_result["duration"],
            "cost": duration * 0.15,
            "processing_time": video_result["total_time"]
        }
```

### Fallback Strategy Configuration

```yaml
# config/fallback_strategies.yaml
image_enhancement:
  primary: nano_banana
  fallbacks:
    - service: ideogram
      trigger_conditions:
        - nano_banana_unavailable
        - quality_below_threshold: 7.0
    - service: local_upscaler
      trigger_conditions:
        - all_apis_unavailable
        - budget_exceeded

video_generation:
  primary: veo3
  fallbacks:
    - service: runway_act2
      trigger_conditions:
        - veo3_unavailable
        - user_tier: premium
    - service: local_stable_video
      trigger_conditions:
        - all_apis_unavailable
        - emergency_mode: true

quality_thresholds:
  image_enhancement: 8.0
  video_generation: 7.5
  overall_workflow: 8.0

budget_limits:
  free_tier: 0.10
  starter_tier: 0.50
  pro_tier: 2.00
  enterprise_tier: 10.00
```

---

## 🔄 2. DATA FLOW & PROCESSING PIPELINE

### Workflow Processing Pipeline

```python
# workflow_processor.py
class WorkflowProcessor:
    def __init__(self):
        self.ai_router = AIServiceRouter()
        self.export_generator = ExportKitGenerator()
        self.quality_validator = QualityValidator()
        self.cost_tracker = CostTracker()
    
    async def process_workflow(self, workflow_request: WorkflowRequest) -> WorkflowResult:
        """Main processing pipeline with quality gates and cost controls"""
        
        # Step 1: Validate inputs and user permissions
        validation_result = await self._validate_request(workflow_request)
        if not validation_result.valid:
            raise ValidationError(validation_result.errors)
        
        # Step 2: Cost estimation and approval
        estimated_cost = await self._estimate_workflow_cost(workflow_request)
        if not await self._approve_cost(workflow_request.user, estimated_cost):
            raise BudgetExceededError(f"Cost {estimated_cost} exceeds user budget")
        
        # Step 3: Image enhancement
        enhanced_image = await self._enhance_image(
            workflow_request.image_data,
            workflow_request.enhancement_type
        )
        
        # Step 4: Quality validation
        image_quality = await self.quality_validator.validate_image(enhanced_image)
        if image_quality.score < 8.0:
            enhanced_image = await self._retry_enhancement(workflow_request.image_data)
        
        # Step 5: Video generation
        generated_video = await self._generate_video(
            enhanced_image,
            workflow_request.script,
            workflow_request.duration
        )
        
        # Step 6: Final quality check
        final_quality = await self.quality_validator.validate_video(generated_video)
        
        # Step 7: Export kit generation
        export_kit = await self.export_generator.create_export_kit(
            workflow_request.workflow_type,
            enhanced_image,
            generated_video,
            workflow_request.target_platforms
        )
        
        # Step 8: Track costs and analytics
        await self.cost_tracker.record_workflow_cost(
            workflow_request.user,
            estimated_cost
        )
        
        return WorkflowResult(
            enhanced_image=enhanced_image,
            generated_video=generated_video,
            export_kit=export_kit,
            total_cost=estimated_cost,
            quality_scores=final_quality,
            processing_time=time.time() - workflow_request.start_time
        )
    
    async def _enhance_image(self, image_data: bytes, enhancement_type: str):
        """Image enhancement with smart routing and fallbacks"""
        return await self.ai_router.route_request(
            service_type='image_enhancement',
            input_data={'image': image_data, 'type': enhancement_type},
            user_tier=self.current_user.tier,
            budget_limit=self.current_user.budget_per_workflow
        )
```

### Queue Management System

```python
# queue_manager.py using Celery + Redis
from celery import Celery
from celery.result import AsyncResult

app = Celery('talkingphoto', broker='redis://localhost:6379')

@app.task(bind=True, max_retries=3)
def process_workflow_async(self, workflow_id: str, workflow_data: dict):
    """Async workflow processing with retry logic"""
    try:
        workflow_processor = WorkflowProcessor()
        result = await workflow_processor.process_workflow(
            WorkflowRequest.from_dict(workflow_data)
        )
        
        # Update database with result
        update_workflow_status(workflow_id, 'completed', result)
        
        # Send notification to user
        send_completion_notification(workflow_data['user_id'], workflow_id, result)
        
        return result.to_dict()
        
    except Exception as exc:
        # Log error and retry if retries remaining
        log_workflow_error(workflow_id, exc)
        
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        else:
            # Mark as failed and notify user
            update_workflow_status(workflow_id, 'failed', str(exc))
            send_failure_notification(workflow_data['user_id'], workflow_id, str(exc))
            raise

@app.task
def cleanup_temp_files(file_paths: list):
    """Clean up temporary files after processing"""
    for file_path in file_paths:
        try:
            os.remove(file_path)
        except FileNotFoundError:
            pass  # File already cleaned up
```

### Real-time Status Updates

```python
# status_updates.py using WebSockets
import asyncio
import websockets
import json

class WorkflowStatusManager:
    def __init__(self):
        self.active_connections = {}
    
    async def connect_user(self, websocket, user_id: str):
        """Connect user to real-time updates"""
        self.active_connections[user_id] = websocket
        
        try:
            await websocket.wait_closed()
        finally:
            del self.active_connections[user_id]
    
    async def update_workflow_status(self, user_id: str, workflow_id: str, status: dict):
        """Send status update to connected user"""
        if user_id in self.active_connections:
            message = {
                "type": "workflow_status",
                "workflow_id": workflow_id,
                "status": status,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            try:
                await self.active_connections[user_id].send(json.dumps(message))
            except websockets.exceptions.ConnectionClosed:
                del self.active_connections[user_id]

# Integration with Streamlit for real-time updates
def show_realtime_progress(workflow_id: str):
    """Display real-time progress in Streamlit"""
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    # Connect to WebSocket for updates
    async def listen_for_updates():
        uri = f"ws://localhost:8765/workflow/{workflow_id}"
        async with websockets.connect(uri) as websocket:
            async for message in websocket:
                data = json.loads(message)
                
                if data["type"] == "workflow_status":
                    progress_bar.progress(data["status"]["progress"] / 100)
                    status_text.text(data["status"]["message"])
    
    # Run in background
    asyncio.create_task(listen_for_updates())
```

---

## 🗄️ 3. DATABASE SCHEMA & DATA MANAGEMENT

### Core Database Schema

```sql
-- database/schema.sql

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    credits_remaining INTEGER DEFAULT 3,
    credits_total INTEGER DEFAULT 3,
    billing_cycle_start DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Billing information
    stripe_customer_id VARCHAR(100),
    current_subscription_id VARCHAR(100),
    subscription_status VARCHAR(50),
    
    -- Usage tracking
    monthly_workflows_used INTEGER DEFAULT 0,
    monthly_cost_incurred DECIMAL(10,4) DEFAULT 0.0000,
    
    -- Profile
    profile_image_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    CONSTRAINT valid_tier CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
    CONSTRAINT valid_credits CHECK (credits_remaining >= 0)
);

-- Workflows and Processing
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Workflow metadata
    workflow_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    title VARCHAR(255),
    description TEXT,
    
    -- Input data
    input_image_url TEXT NOT NULL,
    input_image_metadata JSONB,
    script TEXT,
    script_language VARCHAR(10) DEFAULT 'en',
    target_duration INTEGER DEFAULT 10, -- seconds
    target_platforms TEXT[], -- ['instagram', 'tiktok', 'youtube']
    
    -- Processing results
    enhanced_image_url TEXT,
    generated_video_url TEXT,
    export_kit_data JSONB,
    
    -- Quality metrics
    image_quality_score DECIMAL(3,2),
    video_quality_score DECIMAL(3,2),
    overall_quality_score DECIMAL(3,2),
    
    -- Cost tracking
    estimated_cost DECIMAL(10,4),
    actual_cost DECIMAL(10,4),
    cost_breakdown JSONB,
    
    -- Processing metrics
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    processing_time_seconds INTEGER,
    ai_services_used JSONB, -- Track which APIs were used
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    CONSTRAINT valid_duration CHECK (target_duration BETWEEN 1 AND 60),
    CONSTRAINT valid_quality CHECK (
        image_quality_score IS NULL OR image_quality_score BETWEEN 0 AND 10
    )
);

-- Export Kit Templates
CREATE TABLE export_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_type VARCHAR(100) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    
    -- Template content
    instructions_html TEXT NOT NULL,
    prompt_template TEXT,
    settings_json JSONB,
    assets_required TEXT[], -- List of asset types needed
    
    -- Metadata
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    estimated_time_minutes INTEGER,
    tools_required TEXT[],
    
    -- Performance tracking
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2), -- Percentage of successful uses
    user_rating DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT valid_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    CONSTRAINT unique_workflow_platform UNIQUE (workflow_type, platform, template_name)
);

-- User Sessions and Analytics
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event tracking
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    page_url TEXT,
    referrer TEXT,
    
    -- Session tracking
    session_id UUID,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    
    -- Performance metrics
    page_load_time INTEGER, -- milliseconds
    interaction_time INTEGER, -- time spent on action in seconds
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment and Billing
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Stripe integration
    stripe_payment_id VARCHAR(100) UNIQUE,
    stripe_invoice_id VARCHAR(100),
    
    -- Payment details
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50),
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending',
    failure_reason TEXT,
    
    -- Billing period
    billing_period_start DATE,
    billing_period_end DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    CONSTRAINT positive_amount CHECK (amount_cents > 0)
);

-- System Health and Monitoring
CREATE TABLE system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Service metrics
    service_name VARCHAR(100) NOT NULL,
    endpoint VARCHAR(255),
    response_time_ms INTEGER,
    status_code INTEGER,
    success BOOLEAN,
    
    -- Error tracking
    error_message TEXT,
    error_type VARCHAR(100),
    
    -- Resource usage
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_mb INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier, is_active);
CREATE INDEX idx_workflows_user_status ON workflows(user_id, status);
CREATE INDEX idx_workflows_created ON workflows(created_at DESC);
CREATE INDEX idx_analytics_user_event ON user_analytics(user_id, event_type, created_at);
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
CREATE INDEX idx_system_health_service ON system_health(service_name, created_at);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Data Access Layer

```python
# database/models.py
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, DECIMAL, ARRAY, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import sessionmaker
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    subscription_tier = Column(String(50), default='free')
    credits_remaining = Column(Integer, default=3)
    monthly_workflows_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def can_create_workflow(self) -> bool:
        """Check if user has credits/permissions for new workflow"""
        tier_limits = {
            'free': 3,
            'starter': 30,
            'pro': -1,  # unlimited
            'enterprise': -1
        }
        limit = tier_limits.get(self.subscription_tier, 0)
        return limit == -1 or self.monthly_workflows_used < limit
    
    def get_budget_limit(self) -> float:
        """Get per-workflow budget limit for user tier"""
        budgets = {
            'free': 0.10,
            'starter': 0.50,
            'pro': 2.00,
            'enterprise': 10.00
        }
        return budgets.get(self.subscription_tier, 0.0)

class Workflow(Base):
    __tablename__ = 'workflows'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    workflow_type = Column(String(100), nullable=False)
    status = Column(String(50), default='pending')
    
    # Processing data
    input_image_url = Column(String(500))
    enhanced_image_url = Column(String(500))
    generated_video_url = Column(String(500))
    export_kit_data = Column(JSON)
    
    # Quality and cost tracking
    overall_quality_score = Column(DECIMAL(3,2))
    actual_cost = Column(DECIMAL(10,4))
    processing_time_seconds = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def update_status(self, new_status: str, additional_data: dict = None):
        """Update workflow status with optional additional data"""
        self.status = new_status
        if additional_data:
            for key, value in additional_data.items():
                if hasattr(self, key):
                    setattr(self, key, value)

# Database connection and session management
class DatabaseManager:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def get_db_session(self):
        """Get database session with automatic cleanup"""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
    
    def create_tables(self):
        """Create all tables"""
        Base.metadata.create_all(bind=self.engine)
    
    def health_check(self) -> bool:
        """Check database connectivity"""
        try:
            with self.engine.connect() as conn:
                conn.execute("SELECT 1")
            return True
        except Exception:
            return False
```

---

## 💾 4. FILE STORAGE & CONTENT DELIVERY

### Storage Architecture

```python
# storage/file_manager.py
import boto3
import os
from typing import Optional
from datetime import datetime, timedelta

class FileStorageManager:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'ap-south-1')  # Mumbai region
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME', 'talkingphoto-storage')
        self.cdn_domain = os.getenv('CDN_DOMAIN', 'cdn.talkingphoto.ai')
    
    async def upload_image(self, image_data: bytes, user_id: str, filename: str) -> str:
        """Upload image to S3 with optimized settings"""
        key = f"images/{user_id}/{datetime.utcnow().strftime('%Y/%m/%d')}/{filename}"
        
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=image_data,
                ContentType='image/jpeg',
                CacheControl='max-age=31536000',  # 1 year cache
                Metadata={
                    'user_id': user_id,
                    'upload_time': datetime.utcnow().isoformat(),
                    'file_type': 'enhanced_image'
                }
            )
            
            return f"https://{self.cdn_domain}/{key}"
            
        except Exception as e:
            # Fallback to local storage if S3 fails
            return await self._upload_to_local_storage(image_data, key)
    
    async def upload_video(self, video_data: bytes, user_id: str, filename: str) -> str:
        """Upload video to S3 with video-optimized settings"""
        key = f"videos/{user_id}/{datetime.utcnow().strftime('%Y/%m/%d')}/{filename}"
        
        try:
            # Use multipart upload for large videos
            if len(video_data) > 100 * 1024 * 1024:  # 100MB
                return await self._multipart_upload(video_data, key, 'video/mp4')
            else:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=video_data,
                    ContentType='video/mp4',
                    CacheControl='max-age=2592000',  # 30 days cache
                    Metadata={
                        'user_id': user_id,
                        'upload_time': datetime.utcnow().isoformat(),
                        'file_type': 'generated_video'
                    }
                )
            
            return f"https://{self.cdn_domain}/{key}"
            
        except Exception as e:
            return await self._upload_to_local_storage(video_data, key)
    
    async def generate_signed_url(self, file_url: str, expiry_hours: int = 24) -> str:
        """Generate signed URL for private file access"""
        # Extract key from URL
        key = file_url.replace(f"https://{self.cdn_domain}/", "")
        
        return self.s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket_name, 'Key': key},
            ExpiresIn=expiry_hours * 3600
        )
    
    async def cleanup_old_files(self, older_than_days: int = 30):
        """Clean up files older than specified days to control costs"""
        cutoff_date = datetime.utcnow() - timedelta(days=older_than_days)
        
        # List objects older than cutoff date
        response = self.s3_client.list_objects_v2(
            Bucket=self.bucket_name,
            Prefix='temp/',  # Only clean temp files
        )
        
        objects_to_delete = []
        for obj in response.get('Contents', []):
            if obj['LastModified'].replace(tzinfo=None) < cutoff_date:
                objects_to_delete.append({'Key': obj['Key']})
        
        if objects_to_delete:
            self.s3_client.delete_objects(
                Bucket=self.bucket_name,
                Delete={'Objects': objects_to_delete}
            )
    
    async def _upload_to_local_storage(self, file_data: bytes, key: str) -> str:
        """Fallback local storage when S3 is unavailable"""
        local_path = f"temp/{key}"
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        with open(local_path, 'wb') as f:
            f.write(file_data)
        
        return f"/temp/{key}"  # Return local URL

# Content Delivery Network optimization
class CDNOptimizer:
    def __init__(self):
        self.image_transformations = {
            'thumbnail': 'w_300,h_300,c_fill,q_80',
            'preview': 'w_800,h_600,c_fit,q_85',
            'full': 'w_1920,h_1080,c_limit,q_90'
        }
        
    def get_optimized_image_url(self, base_url: str, size: str = 'preview') -> str:
        """Get CDN-optimized image URL with transformations"""
        transformation = self.image_transformations.get(size, 'w_800,h_600,c_fit,q_85')
        return base_url.replace('/images/', f'/images/{transformation}/')
    
    def get_optimized_video_url(self, base_url: str, quality: str = 'auto') -> str:
        """Get CDN-optimized video URL with adaptive streaming"""
        quality_params = {
            'auto': 'q_auto,f_auto',
            'high': 'q_80,br_2000k',
            'medium': 'q_70,br_1000k',
            'low': 'q_60,br_500k'
        }
        params = quality_params.get(quality, 'q_auto,f_auto')
        return base_url.replace('/videos/', f'/videos/{params}/')
```

### File Upload Handling

```python
# frontend/upload_handler.py for Streamlit
import streamlit as st
from PIL import Image
import io
import magic

class FileUploadHandler:
    def __init__(self):
        self.allowed_image_types = ['image/jpeg', 'image/png', 'image/webp']
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        self.max_image_resolution = (4096, 4096)
    
    def handle_image_upload(self) -> Optional[bytes]:
        """Handle image upload with validation and preprocessing"""
        uploaded_file = st.file_uploader(
            "Upload your photo",
            type=['jpg', 'jpeg', 'png', 'webp'],
            help="Supported formats: JPG, PNG, WebP (max 50MB)"
        )
        
        if uploaded_file is not None:
            # Validate file
            validation_result = self._validate_image_file(uploaded_file)
            if not validation_result['valid']:
                st.error(validation_result['error'])
                return None
            
            # Process and optimize image
            processed_image = self._process_image(uploaded_file)
            
            # Show preview
            col1, col2 = st.columns([1, 2])
            with col1:
                st.image(processed_image, caption="Uploaded Image", use_column_width=True)
            
            with col2:
                self._display_image_info(processed_image)
            
            return processed_image.getvalue()
        
        return None
    
    def _validate_image_file(self, uploaded_file) -> dict:
        """Validate uploaded image file"""
        # Check file size
        if uploaded_file.size > self.max_file_size:
            return {
                'valid': False,
                'error': f'File too large. Maximum size: {self.max_file_size // 1024 // 1024}MB'
            }
        
        # Check file type
        file_bytes = uploaded_file.read()
        uploaded_file.seek(0)  # Reset file pointer
        
        try:
            mime_type = magic.from_buffer(file_bytes, mime=True)
            if mime_type not in self.allowed_image_types:
                return {
                    'valid': False,
                    'error': f'Invalid file type: {mime_type}. Allowed: {", ".join(self.allowed_image_types)}'
                }
        except Exception:
            return {
                'valid': False,
                'error': 'Unable to determine file type'
            }
        
        # Check image validity
        try:
            image = Image.open(io.BytesIO(file_bytes))
            width, height = image.size
            
            if width > self.max_image_resolution[0] or height > self.max_image_resolution[1]:
                return {
                    'valid': False,
                    'error': f'Image too large: {width}x{height}. Maximum: {self.max_image_resolution[0]}x{self.max_image_resolution[1]}'
                }
            
        except Exception as e:
            return {
                'valid': False,
                'error': f'Invalid image file: {str(e)}'
            }
        
        return {'valid': True}
    
    def _process_image(self, uploaded_file) -> io.BytesIO:
        """Process and optimize uploaded image"""
        image = Image.open(uploaded_file)
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')
        
        # Optimize size while maintaining quality
        if max(image.size) > 2048:
            image.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
        
        # Save to bytes with optimization
        output = io.BytesIO()
        image.save(
            output,
            format='JPEG',
            quality=90,
            optimize=True,
            progressive=True
        )
        output.seek(0)
        
        return output
    
    def _display_image_info(self, processed_image: io.BytesIO):
        """Display image information and processing stats"""
        image = Image.open(processed_image)
        processed_image.seek(0)
        
        st.info(f"""
        **Image Details:**
        - Dimensions: {image.size[0]} x {image.size[1]} pixels
        - Format: {image.format}
        - Mode: {image.mode}
        - Size: {processed_image.getbuffer().nbytes / 1024:.1f} KB
        """)
```

---

## 🔐 5. SECURITY ARCHITECTURE & DATA PROTECTION

### Authentication & Authorization

```python
# security/auth_manager.py
import streamlit_authenticator as stauth
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from typing import Optional, Dict

class AuthenticationManager:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')
        self.token_expiry_hours = 24
        self.password_min_length = 8
        self.max_login_attempts = 5
        self.lockout_duration_minutes = 30
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    def generate_jwt_token(self, user_id: str, user_data: dict) -> str:
        """Generate JWT token for authenticated user"""
        payload = {
            'user_id': user_id,
            'email': user_data['email'],
            'subscription_tier': user_data['subscription_tier'],
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=self.token_expiry_hours)
        }
        
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def validate_jwt_token(self, token: str) -> Optional[Dict]:
        """Validate and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def setup_streamlit_auth(self, db_session) -> stauth.Authenticate:
        """Setup Streamlit authenticator with database backend"""
        # Load user credentials from database
        users = db_session.query(User).filter(User.is_active == True).all()
        
        credentials = {
            'usernames': {}
        }
        
        for user in users:
            credentials['usernames'][user.username] = {
                'email': user.email,
                'name': user.username,
                'password': user.password_hash,
                'subscription_tier': user.subscription_tier
            }
        
        # Configure authenticator
        authenticator = stauth.Authenticate(
            credentials,
            'talkingphoto_auth',
            self.secret_key,
            cookie_expiry_days=7
        )
        
        return authenticator
    
    def check_rate_limit(self, identifier: str, action: str, redis_client) -> bool:
        """Rate limiting for authentication attempts"""
        key = f"rate_limit:{action}:{identifier}"
        current_attempts = redis_client.get(key)
        
        if current_attempts is None:
            redis_client.setex(key, 3600, 1)  # 1 hour expiry
            return True
        
        if int(current_attempts) >= self.max_login_attempts:
            return False
        
        redis_client.incr(key)
        return True

# Data Protection and Privacy
class DataProtectionManager:
    def __init__(self):
        self.encryption_key = os.getenv('ENCRYPTION_KEY', 'your-encryption-key')
    
    def anonymize_user_data(self, user_data: dict) -> dict:
        """Anonymize sensitive user data for analytics"""
        anonymized = user_data.copy()
        
        # Hash email to create anonymous identifier
        if 'email' in anonymized:
            anonymized['user_hash'] = hashlib.sha256(
                anonymized['email'].encode()
            ).hexdigest()[:16]
            del anonymized['email']
        
        # Remove other PII
        pii_fields = ['name', 'phone', 'address', 'ip_address']
        for field in pii_fields:
            if field in anonymized:
                del anonymized[field]
        
        return anonymized
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data for database storage"""
        from cryptography.fernet import Fernet
        cipher_suite = Fernet(self.encryption_key.encode())
        return cipher_suite.encrypt(data.encode()).decode()
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data from database"""
        from cryptography.fernet import Fernet
        cipher_suite = Fernet(self.encryption_key.encode())
        return cipher_suite.decrypt(encrypted_data.encode()).decode()
    
    def gdpr_data_export(self, user_id: str, db_session) -> dict:
        """Export all user data for GDPR compliance"""
        user = db_session.query(User).filter(User.id == user_id).first()
        workflows = db_session.query(Workflow).filter(Workflow.user_id == user_id).all()
        payments = db_session.query(Payment).filter(Payment.user_id == user_id).all()
        
        export_data = {
            'user_profile': {
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'subscription_tier': user.subscription_tier,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None
            },
            'workflows': [
                {
                    'id': str(w.id),
                    'workflow_type': w.workflow_type,
                    'created_at': w.created_at.isoformat(),
                    'status': w.status,
                    'cost': float(w.actual_cost) if w.actual_cost else None
                }
                for w in workflows
            ],
            'payments': [
                {
                    'id': str(p.id),
                    'amount': p.amount_cents / 100,
                    'currency': p.currency,
                    'created_at': p.created_at.isoformat(),
                    'status': p.status
                }
                for p in payments
            ]
        }
        
        return export_data
    
    def gdpr_data_deletion(self, user_id: str, db_session, file_manager):
        """Delete all user data for GDPR compliance"""
        # Mark user as deleted (soft delete)
        user = db_session.query(User).filter(User.id == user_id).first()
        user.is_active = False
        user.email = f"deleted_{user_id}@deleted.com"
        user.username = f"deleted_{user_id}"
        
        # Delete associated files
        workflows = db_session.query(Workflow).filter(Workflow.user_id == user_id).all()
        for workflow in workflows:
            if workflow.input_image_url:
                file_manager.delete_file(workflow.input_image_url)
            if workflow.enhanced_image_url:
                file_manager.delete_file(workflow.enhanced_image_url)
            if workflow.generated_video_url:
                file_manager.delete_file(workflow.generated_video_url)
        
        # Anonymize workflow data
        for workflow in workflows:
            workflow.script = "[DELETED]"
            workflow.input_image_url = None
            workflow.enhanced_image_url = None
            workflow.generated_video_url = None
        
        db_session.commit()

# Input Validation and Sanitization
class InputValidator:
    def __init__(self):
        self.max_script_length = 5000
        self.allowed_languages = ['en', 'hi', 'es', 'fr', 'de', 'ja', 'ko', 'zh']
        self.dangerous_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'eval\s*\(',
            r'exec\s*\('
        ]
    
    def validate_script_input(self, script: str) -> dict:
        """Validate and sanitize script input"""
        if not script or len(script.strip()) == 0:
            return {'valid': False, 'error': 'Script cannot be empty'}
        
        if len(script) > self.max_script_length:
            return {'valid': False, 'error': f'Script too long (max {self.max_script_length} characters)'}
        
        # Check for dangerous patterns
        import re
        for pattern in self.dangerous_patterns:
            if re.search(pattern, script, re.IGNORECASE):
                return {'valid': False, 'error': 'Script contains potentially unsafe content'}
        
        # Sanitize HTML
        import bleach
        clean_script = bleach.clean(
            script,
            tags=[],  # No HTML tags allowed
            attributes={},
            strip=True
        )
        
        return {'valid': True, 'sanitized_script': clean_script}
    
    def validate_workflow_type(self, workflow_type: str) -> bool:
        """Validate workflow type"""
        allowed_types = ['product_demo', 'avatar_presentation', 'lifestyle_content', 'educational']
        return workflow_type in allowed_types
```

---

## 📊 6. MONITORING & LOGGING ARCHITECTURE

### Comprehensive Monitoring System

```python
# monitoring/monitoring_manager.py
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List
import psutil
import requests
from dataclasses import dataclass

@dataclass
class ServiceHealth:
    service_name: str
    status: str
    response_time: float
    last_check: datetime
    error_message: str = None

class MonitoringManager:
    def __init__(self, db_session, redis_client):
        self.db_session = db_session
        self.redis_client = redis_client
        self.logger = self._setup_structured_logging()
        
        # Performance thresholds
        self.thresholds = {
            'api_response_time': 2000,  # milliseconds
            'database_query_time': 1000,
            'ai_service_time': 30000,
            'memory_usage': 85,  # percentage
            'cpu_usage': 80,
            'disk_usage': 90
        }
        
        # Service endpoints to monitor
        self.services_to_monitor = {
            'nano_banana': 'https://nanobanana.ai/health',
            'veo3': 'https://veo3.ai/api/health',
            'runway': 'https://api.runwayml.com/health',
            'stripe': 'https://api.stripe.com/v1/account',
            's3': 'https://s3.amazonaws.com',
            'database': 'internal_check'
        }
    
    def _setup_structured_logging(self):
        """Setup structured JSON logging"""
        logger = logging.getLogger('talkingphoto')
        logger.setLevel(logging.INFO)
        
        # JSON formatter
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", '
            '"service": "talkingphoto", "message": "%(message)s", '
            '"module": "%(module)s", "function": "%(funcName)s", '
            '"line": %(lineno)d}'
        )
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        # File handler for persistent logging
        file_handler = logging.FileHandler('logs/talkingphoto.log')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        return logger
    
    async def health_check_all_services(self) -> Dict[str, ServiceHealth]:
        """Check health of all external services"""
        health_results = {}
        
        for service_name, endpoint in self.services_to_monitor.items():
            health_results[service_name] = await self._check_service_health(
                service_name, endpoint
            )
        
        # Store results in database
        await self._store_health_results(health_results)
        
        # Send alerts if any service is down
        await self._check_and_send_alerts(health_results)
        
        return health_results
    
    async def _check_service_health(self, service_name: str, endpoint: str) -> ServiceHealth:
        """Check individual service health"""
        start_time = datetime.utcnow()
        
        try:
            if service_name == 'database':
                # Internal database health check
                result = self.db_session.execute("SELECT 1")
                response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
                
                return ServiceHealth(
                    service_name=service_name,
                    status='healthy',
                    response_time=response_time,
                    last_check=datetime.utcnow()
                )
            
            else:
                # External service health check
                response = requests.get(endpoint, timeout=10)
                response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
                
                status = 'healthy' if response.status_code < 400 else 'unhealthy'
                
                return ServiceHealth(
                    service_name=service_name,
                    status=status,
                    response_time=response_time,
                    last_check=datetime.utcnow(),
                    error_message=None if status == 'healthy' else f"HTTP {response.status_code}"
                )
                
        except Exception as e:
            response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            return ServiceHealth(
                service_name=service_name,
                status='unhealthy',
                response_time=response_time,
                last_check=datetime.utcnow(),
                error_message=str(e)
            )
    
    def monitor_system_resources(self) -> Dict[str, float]:
        """Monitor system resource usage"""
        resources = {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
            'network_io': psutil.net_io_counters().bytes_sent + psutil.net_io_counters().bytes_recv
        }
        
        # Log resource usage
        self.logger.info(f"System resources: {json.dumps(resources)}")
        
        # Check thresholds and alert
        for resource, value in resources.items():
            threshold_key = resource.replace('_percent', '_usage')
            if threshold_key in self.thresholds and value > self.thresholds[threshold_key]:
                self._send_resource_alert(resource, value, self.thresholds[threshold_key])
        
        return resources
    
    def track_user_workflow_metrics(self, workflow_id: str, user_id: str, metrics: Dict):
        """Track detailed workflow performance metrics"""
        tracking_data = {
            'workflow_id': workflow_id,
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat(),
            'metrics': metrics
        }
        
        # Store in Redis for real-time analytics
        self.redis_client.lpush('workflow_metrics', json.dumps(tracking_data))
        self.redis_client.ltrim('workflow_metrics', 0, 9999)  # Keep last 10k entries
        
        # Log for persistent analysis
        self.logger.info(f"Workflow metrics: {json.dumps(tracking_data)}")
        
        # Check performance thresholds
        self._check_performance_thresholds(metrics)
    
    def _check_performance_thresholds(self, metrics: Dict):
        """Check if performance metrics exceed thresholds"""
        alerts = []
        
        if metrics.get('total_processing_time', 0) > self.thresholds['ai_service_time']:
            alerts.append(f"Workflow processing time exceeded threshold: {metrics['total_processing_time']}ms")
        
        if metrics.get('database_query_time', 0) > self.thresholds['database_query_time']:
            alerts.append(f"Database query time exceeded threshold: {metrics['database_query_time']}ms")
        
        for alert in alerts:
            self._send_performance_alert(alert)
    
    async def generate_analytics_report(self, hours: int = 24) -> Dict:
        """Generate comprehensive analytics report"""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        # Query database for metrics
        workflows = self.db_session.query(Workflow).filter(
            Workflow.created_at >= start_time
        ).all()
        
        users = self.db_session.query(User).filter(
            User.created_at >= start_time
        ).all()
        
        # Calculate key metrics
        report = {
            'time_period': {
                'start': start_time.isoformat(),
                'end': end_time.isoformat(),
                'duration_hours': hours
            },
            'workflow_metrics': {
                'total_workflows': len(workflows),
                'completed_workflows': len([w for w in workflows if w.status == 'completed']),
                'failed_workflows': len([w for w in workflows if w.status == 'failed']),
                'average_processing_time': self._calculate_avg_processing_time(workflows),
                'total_cost': sum(float(w.actual_cost or 0) for w in workflows)
            },
            'user_metrics': {
                'new_users': len(users),
                'active_users': self._count_active_users(start_time),
                'user_by_tier': self._count_users_by_tier()
            },
            'service_health': await self._get_service_uptime_stats(hours),
            'cost_analysis': self._analyze_costs(workflows),
            'quality_metrics': self._analyze_quality_scores(workflows)
        }
        
        return report
    
    def _send_resource_alert(self, resource: str, current_value: float, threshold: float):
        """Send alert for resource usage threshold breach"""
        message = f"🚨 Resource Alert: {resource} at {current_value:.1f}% (threshold: {threshold}%)"
        self._send_alert(message, severity='warning')
    
    def _send_performance_alert(self, message: str):
        """Send performance alert"""
        alert_message = f"⚡ Performance Alert: {message}"
        self._send_alert(alert_message, severity='warning')
    
    def _send_alert(self, message: str, severity: str = 'info'):
        """Send alert via configured channels (Discord, Slack, etc.)"""
        alert_data = {
            'message': message,
            'severity': severity,
            'service': 'talkingphoto',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Log alert
        self.logger.warning(f"Alert: {json.dumps(alert_data)}")
        
        # Send to external alerting systems
        webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
        if webhook_url:
            requests.post(webhook_url, json={'content': message})

# Real-time Dashboard for Streamlit
class RealTimeDashboard:
    def __init__(self, monitoring_manager: MonitoringManager):
        self.monitoring = monitoring_manager
    
    def display_dashboard(self):
        """Display real-time monitoring dashboard in Streamlit"""
        st.title("🔍 TalkingPhoto System Dashboard")
        
        # Auto-refresh every 30 seconds
        st.experimental_rerun = st.button("🔄 Refresh", key="dashboard_refresh")
        
        # Service Health Status
        st.subheader("🏥 Service Health")
        health_results = asyncio.run(self.monitoring.health_check_all_services())
        
        cols = st.columns(len(health_results))
        for i, (service, health) in enumerate(health_results.items()):
            with cols[i]:
                status_emoji = "✅" if health.status == "healthy" else "❌"
                st.metric(
                    f"{status_emoji} {service.title()}",
                    f"{health.response_time:.0f}ms",
                    delta=None
                )
        
        # System Resources
        st.subheader("💻 System Resources")
        resources = self.monitoring.monitor_system_resources()
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("CPU Usage", f"{resources['cpu_percent']:.1f}%")
        with col2:
            st.metric("Memory Usage", f"{resources['memory_percent']:.1f}%")
        with col3:
            st.metric("Disk Usage", f"{resources['disk_percent']:.1f}%")
        
        # Recent Workflows
        st.subheader("🔄 Recent Workflows")
        recent_workflows = self.monitoring.db_session.query(Workflow).order_by(
            Workflow.created_at.desc()
        ).limit(10).all()
        
        workflow_data = []
        for w in recent_workflows:
            workflow_data.append({
                'ID': str(w.id)[:8],
                'Type': w.workflow_type,
                'Status': w.status,
                'Cost': f"₹{float(w.actual_cost or 0):.2f}",
                'Processing Time': f"{w.processing_time_seconds or 0}s",
                'Created': w.created_at.strftime('%H:%M:%S')
            })
        
        st.dataframe(workflow_data, use_container_width=True)
        
        # Analytics Summary
        st.subheader("📊 24-Hour Summary")
        report = asyncio.run(self.monitoring.generate_analytics_report(24))
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Workflows", report['workflow_metrics']['total_workflows'])
        with col2:
            st.metric("Success Rate", f"{report['workflow_metrics']['completed_workflows'] / max(report['workflow_metrics']['total_workflows'], 1) * 100:.1f}%")
        with col3:
            st.metric("New Users", report['user_metrics']['new_users'])
        with col4:
            st.metric("Total Revenue", f"₹{report['workflow_metrics']['total_cost']:.2f}")
```

---

## 🚀 7. DEPLOYMENT & SCALING CONSIDERATIONS

### Streamlit Cloud Deployment Architecture

```python
# deployment/streamlit_config.py
import streamlit as st
import os
from pathlib import Path

class StreamlitDeploymentConfig:
    def __init__(self):
        self.app_title = "TalkingPhoto - AI Creator Platform"
        self.app_icon = "🎬"
        self.layout = "wide"
        self.initial_sidebar_state = "expanded"
        
    def configure_streamlit(self):
        """Configure Streamlit app settings for production"""
        st.set_page_config(
            page_title=self.app_title,
            page_icon=self.app_icon,
            layout=self.layout,
            initial_sidebar_state=self.initial_sidebar_state,
            menu_items={
                'Get Help': 'https://docs.talkingphoto.ai',
                'Report a bug': 'https://github.com/talkingphoto/issues',
                'About': f"""
                # {self.app_title}
                
                Transform photos into engaging talking videos with AI.
                
                **Features:**
                - Photo enhancement with Nano Banana
                - Video generation with Veo3
                - Export workflows for multiple platforms
                - Professional quality results
                
                Built with ❤️ for creators
                """
            }
        )
        
        # Custom CSS for professional appearance
        st.markdown("""
        <style>
        .main > div {
            padding-top: 2rem;
            padding-bottom: 2rem;
        }
        
        .stAlert > div {
            padding: 1rem;
        }
        
        .upload-area {
            border: 2px dashed #ccc;
            border-radius: 10px;
            padding: 2rem;
            text-align: center;
            margin: 1rem 0;
        }
        
        .metric-card {
            background: white;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 0.5rem 0;
        }
        
        .success-message {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 1rem;
            border-radius: 5px;
            margin: 1rem 0;
        }
        
        .processing-indicator {
            text-align: center;
            padding: 2rem;
        }
        
        .feature-highlight {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
        }
        </style>
        """, unsafe_allow_html=True)
    
    def setup_production_secrets(self):
        """Setup production secrets and environment variables"""
        required_secrets = [
            'NANO_BANANA_API_KEY',
            'VEO3_API_KEY',
            'STRIPE_SECRET_KEY',
            'DATABASE_URL',
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'REDIS_URL',
            'JWT_SECRET_KEY'
        ]
        
        missing_secrets = []
        for secret in required_secrets:
            if not st.secrets.get(secret) and not os.getenv(secret):
                missing_secrets.append(secret)
        
        if missing_secrets:
            st.error(f"""
            ⚠️ **Missing Production Secrets:**
            
            Please configure the following secrets in Streamlit Cloud:
            {chr(10).join([f'• {secret}' for secret in missing_secrets])}
            
            Go to: https://share.streamlit.io/deploy → Settings → Secrets
            """)
            st.stop()
    
    def setup_monitoring_integration(self):
        """Setup monitoring for production environment"""
        # Setup error tracking
        if st.secrets.get('SENTRY_DSN'):
            import sentry_sdk
            sentry_sdk.init(
                dsn=st.secrets['SENTRY_DSN'],
                traces_sample_rate=0.1,
                environment='production'
            )
        
        # Setup analytics
        if st.secrets.get('GOOGLE_ANALYTICS_ID'):
            ga_id = st.secrets['GOOGLE_ANALYTICS_ID']
            st.markdown(f"""
            <!-- Google Analytics -->
            <script async src="https://www.googletagmanager.com/gtag/js?id={ga_id}"></script>
            <script>
              window.dataLayer = window.dataLayer || [];
              function gtag(){{dataLayer.push(arguments);}}
              gtag('js', new Date());
              gtag('config', '{ga_id}');
            </script>
            """, unsafe_allow_html=True)

# requirements.txt for Streamlit deployment
REQUIREMENTS_TXT = """
streamlit>=1.28.0
streamlit-authenticator>=0.2.3
streamlit-option-menu>=0.3.6
pillow>=9.5.0
requests>=2.31.0
psycopg2-binary>=2.9.7
redis>=4.6.0
boto3>=1.28.0
celery>=5.3.0
sqlalchemy>=2.0.0
bcrypt>=4.0.1
pyjwt>=2.8.0
python-multipart>=0.0.6
aiohttp>=3.8.5
asyncio>=3.4.3
python-magic>=0.4.27
bleach>=6.0.0
cryptography>=41.0.0
psutil>=5.9.5
sentry-sdk>=1.29.0
stripe>=5.5.0
python-dotenv>=1.0.0
"""

# streamlit_app.py - Main application entry point
MAIN_APP_CODE = '''
import streamlit as st
import asyncio
from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from deployment.streamlit_config import StreamlitDeploymentConfig
from frontend.main_ui import TalkingPhotoApp
from database.models import DatabaseManager
from monitoring.monitoring_manager import MonitoringManager

# Initialize deployment configuration
config = StreamlitDeploymentConfig()
config.configure_streamlit()
config.setup_production_secrets()
config.setup_monitoring_integration()

# Initialize database
@st.cache_resource
def init_database():
    db_url = st.secrets.get("DATABASE_URL") or os.getenv("DATABASE_URL")
    db_manager = DatabaseManager(db_url)
    db_manager.create_tables()
    return db_manager

# Initialize Redis
@st.cache_resource
def init_redis():
    import redis
    redis_url = st.secrets.get("REDIS_URL") or os.getenv("REDIS_URL", "redis://localhost:6379")
    return redis.from_url(redis_url)

# Initialize monitoring
@st.cache_resource
def init_monitoring():
    db_manager = init_database()
    redis_client = init_redis()
    return MonitoringManager(db_manager.get_db_session(), redis_client)

def main():
    """Main application entry point"""
    
    # Initialize core services
    db_manager = init_database()
    redis_client = init_redis()
    monitoring = init_monitoring()
    
    # Health check
    if not db_manager.health_check():
        st.error("❌ Database connection failed. Please check configuration.")
        st.stop()
    
    # Initialize main app
    app = TalkingPhotoApp(db_manager, redis_client, monitoring)
    
    # Run the application
    app.run()

if __name__ == "__main__":
    main()
'''
```

### Auto-Scaling Configuration

```yaml
# deployment/scaling_config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: talkingphoto-config
data:
  # Application settings
  MAX_CONCURRENT_WORKFLOWS: "50"
  WORKER_POOL_SIZE: "10"
  QUEUE_BATCH_SIZE: "5"
  
  # Performance thresholds
  CPU_SCALE_THRESHOLD: "70"
  MEMORY_SCALE_THRESHOLD: "80"
  RESPONSE_TIME_THRESHOLD: "2000"
  
  # Cost control
  MAX_DAILY_API_COST: "5000"  # ₹5000 per day
  COST_ALERT_THRESHOLD: "4000"
  
  # Quality settings
  MIN_QUALITY_SCORE: "8.0"
  RETRY_COUNT: "3"
  FALLBACK_ENABLED: "true"

---
# Horizontal Pod Autoscaler for future Kubernetes deployment
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: talkingphoto-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: talkingphoto-app
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

---

## 🛠️ 8. TECHNOLOGY STACK RECOMMENDATIONS

### Core Technology Stack

```python
# tech_stack_analysis.py

class TechnologyStackRecommendations:
    def __init__(self):
        self.stack_analysis = self._analyze_tech_stack()
    
    def _analyze_tech_stack(self):
        return {
            "frontend": {
                "primary": "Streamlit",
                "rationale": [
                    "Rapid development and deployment",
                    "Python-native for AI integrations", 
                    "Built-in authentication and file handling",
                    "Professional hosting on Streamlit Cloud",
                    "Cost-effective for MVP (₹0 hosting cost)",
                    "Easy migration path to React/Next.js"
                ],
                "alternatives": ["React + Next.js", "Vue.js", "Gradio"],
                "migration_timeline": "Month 6-8 when revenue > ₹25L MRR"
            },
            
            "backend_api": {
                "primary": "Flask + FastAPI",
                "rationale": [
                    "Lightweight and fast development",
                    "Excellent async support for AI API calls",
                    "Great documentation with OpenAPI",
                    "Easy integration with Streamlit",
                    "Mature ecosystem for ML/AI applications"
                ],
                "alternatives": ["Django", "NestJS", "Express.js"],
                "architecture_pattern": "API Gateway + Microservices (Phase 2)"
            },
            
            "database": {
                "primary": "PostgreSQL",
                "rationale": [
                    "ACID compliance for payment processing",
                    "JSON/JSONB support for flexible schemas",
                    "Excellent performance and scaling",
                    "Rich ecosystem and extensions",
                    "Free tier available on multiple platforms"
                ],
                "secondary": "Redis",
                "secondary_rationale": [
                    "Session management and caching",
                    "Real-time features and queuing",
                    "Fast temporary data storage"
                ]
            },
            
            "ai_integration": {
                "image_enhancement": {
                    "primary": "Nano Banana (Google Gemini 2.5 Flash)",
                    "cost": "₹0.039 per image",
                    "fallbacks": ["Ideogram", "Local upscaling"],
                    "quality_score": 8.5
                },
                "video_generation": {
                    "primary": "Veo3",
                    "cost": "₹0.15 per second",
                    "fallbacks": ["Runway Act-2", "Local Stable Video"],
                    "quality_score": 8.0
                }
            },
            
            "deployment": {
                "mvp": {
                    "platform": "Streamlit Cloud",
                    "cost": "₹0/month",
                    "scalability": "Up to 1000+ concurrent users",
                    "features": ["Custom domain", "Authentication", "Secrets management"]
                },
                "scale": {
                    "platform": "Vercel + AWS",
                    "cost": "₹5000-25000/month",
                    "timeline": "Month 6+",
                    "features": ["Global CDN", "Auto-scaling", "Advanced monitoring"]
                }
            },
            
            "payment_processing": {
                "primary": "Stripe",
                "rationale": [
                    "Excellent Indian market support",
                    "UPI, Cards, NetBanking, Wallets",
                    "Automatic tax compliance",
                    "Subscription management",
                    "Robust fraud protection"
                ],
                "backup": "Razorpay",
                "processing_fee": "2.9% + ₹3 per transaction"
            },
            
            "file_storage": {
                "primary": "AWS S3 + CloudFront",
                "rationale": [
                    "Cost-effective for media files",
                    "Global CDN with CloudFront",
                    "Automatic scaling",
                    "Integration with AI services"
                ],
                "cost_estimate": "₹500-2000/month",
                "fallback": "Local filesystem (development)"
            },
            
            "monitoring": {
                "logging": "Python logging + Structured JSON",
                "metrics": "Built-in Streamlit metrics + Custom dashboard",
                "alerting": "Discord/Slack webhooks",
                "error_tracking": "Sentry (optional)",
                "cost": "₹0-1000/month"
            }
        }
    
    def get_cost_analysis(self, user_count: int, workflows_per_month: int):
        """Calculate monthly cost for given usage"""
        
        # AI API costs
        avg_cost_per_workflow = 0.50  # ₹0.039 + ₹0.15*3sec average
        ai_costs = workflows_per_month * avg_cost_per_workflow
        
        # Infrastructure costs
        if user_count < 1000:
            hosting_cost = 0  # Streamlit Cloud free
            storage_cost = 500  # AWS S3
            database_cost = 0  # Free tier
        elif user_count < 5000:
            hosting_cost = 5000  # Vercel Pro
            storage_cost = 2000  # AWS S3 + CloudFront
            database_cost = 2000  # Managed PostgreSQL
        else:
            hosting_cost = 15000  # Enterprise hosting
            storage_cost = 5000  # AWS S3 + CloudFront
            database_cost = 8000  # Managed PostgreSQL + Redis
        
        # Payment processing (2.9% of revenue)
        avg_revenue_per_workflow = 5.0  # ₹5 average
        revenue = workflows_per_month * avg_revenue_per_workflow
        payment_costs = revenue * 0.029
        
        # Monitoring and tools
        monitoring_cost = 1000 if user_count > 1000 else 0
        
        total_cost = (
            ai_costs + 
            hosting_cost + 
            storage_cost + 
            database_cost + 
            payment_costs + 
            monitoring_cost
        )
        
        return {
            "breakdown": {
                "ai_apis": ai_costs,
                "hosting": hosting_cost,
                "storage": storage_cost,
                "database": database_cost,
                "payments": payment_costs,
                "monitoring": monitoring_cost
            },
            "total_monthly_cost": total_cost,
            "cost_per_user": total_cost / user_count if user_count > 0 else 0,
            "cost_per_workflow": total_cost / workflows_per_month if workflows_per_month > 0 else 0,
            "projected_revenue": revenue,
            "profit_margin": ((revenue - total_cost) / revenue * 100) if revenue > 0 else 0
        }
    
    def get_migration_roadmap(self):
        """Technology migration roadmap for scaling"""
        return {
            "phase_1": {
                "timeline": "Months 1-3",
                "revenue_target": "₹7.5L MRR",
                "tech_stack": {
                    "frontend": "Streamlit",
                    "backend": "Flask + Streamlit",
                    "database": "PostgreSQL (Free tier)",
                    "deployment": "Streamlit Cloud",
                    "monitoring": "Basic logging + Manual monitoring"
                },
                "migration_triggers": [
                    "Revenue > ₹10L MRR",
                    "Users > 1000",
                    "Performance bottlenecks",
                    "Advanced feature requirements"
                ]
            },
            
            "phase_2": {
                "timeline": "Months 4-8",
                "revenue_target": "₹50L MRR", 
                "tech_stack": {
                    "frontend": "Next.js + React",
                    "backend": "FastAPI microservices",
                    "database": "PostgreSQL + Redis cluster",
                    "deployment": "Vercel + AWS",
                    "monitoring": "Prometheus + Grafana"
                },
                "migration_approach": [
                    "Gradual API extraction from Streamlit",
                    "Parallel Next.js development",
                    "Database migration with zero downtime",
                    "Progressive user migration"
                ]
            },
            
            "phase_3": {
                "timeline": "Months 9-12",
                "revenue_target": "₹1Cr MRR",
                "tech_stack": {
                    "frontend": "React + TypeScript",
                    "backend": "Node.js/Python microservices",
                    "database": "PostgreSQL cluster + MongoDB + Redis",
                    "deployment": "Kubernetes + Multi-cloud",
                    "monitoring": "Full observability stack"
                },
                "advanced_features": [
                    "Real-time collaboration",
                    "Advanced AI workflows", 
                    "Enterprise integrations",
                    "Global deployment"
                ]
            }
        }

# Usage example
tech_stack = TechnologyStackRecommendations()

# Cost analysis for different scales
mvp_costs = tech_stack.get_cost_analysis(user_count=500, workflows_per_month=2500)
scale_costs = tech_stack.get_cost_analysis(user_count=5000, workflows_per_month=25000)

print("MVP Phase Costs:", mvp_costs)
print("Scale Phase Costs:", scale_costs)
```

---

## 🔄 9. MIGRATION PATHWAY TO MICROSERVICES

### Phase 2 Architecture Transition

```python
# migration/microservices_architecture.py

class MicroservicesArchitecture:
    """Design for Phase 2 migration from Streamlit monolith to microservices"""
    
    def __init__(self):
        self.service_boundaries = self._define_service_boundaries()
        self.migration_strategy = self._plan_migration_strategy()
    
    def _define_service_boundaries(self):
        return {
            "api_gateway": {
                "responsibility": "Request routing, authentication, rate limiting",
                "technology": "Kong/Nginx + Node.js",
                "endpoints": [
                    "POST /api/v1/workflows",
                    "GET /api/v1/workflows/{id}",
                    "POST /api/v1/auth/login", 
                    "GET /api/v1/user/profile"
                ]
            },
            
            "workflow_service": {
                "responsibility": "Workflow orchestration and state management",
                "technology": "Python/FastAPI",
                "key_features": [
                    "Workflow execution engine",
                    "State machine implementation",
                    "Progress tracking",
                    "Error handling and retries"
                ],
                "database": "PostgreSQL (workflows table)"
            },
            
            "ai_service": {
                "responsibility": "AI API integrations and routing",
                "technology": "Python/FastAPI",
                "key_features": [
                    "Smart AI service routing",
                    "Fallback management",
                    "Quality validation",
                    "Cost optimization"
                ],
                "integrations": ["Nano Banana", "Veo3", "Runway", "Ideogram"]
            },
            
            "user_service": {
                "responsibility": "User management and authentication", 
                "technology": "Node.js/Express",
                "key_features": [
                    "User registration/login",
                    "Subscription management", 
                    "Profile management",
                    "Usage tracking"
                ],
                "database": "PostgreSQL (users table)"
            },
            
            "payment_service": {
                "responsibility": "Payment processing and billing",
                "technology": "Node.js/Express",
                "key_features": [
                    "Stripe integration",
                    "Subscription lifecycle",
                    "Invoice generation",
                    "Usage-based billing"
                ],
                "database": "PostgreSQL (payments table)"
            },
            
            "export_service": {
                "responsibility": "Export kit generation and templates",
                "technology": "Python/FastAPI",
                "key_features": [
                    "Template management",
                    "Platform-specific exports",
                    "Instruction generation",
                    "Asset packaging"
                ],
                "database": "MongoDB (templates and assets)"
            },
            
            "notification_service": {
                "responsibility": "User notifications and alerts",
                "technology": "Node.js/Express",
                "key_features": [
                    "Email notifications",
                    "In-app notifications", 
                    "Webhook handling",
                    "SMS alerts (optional)"
                ],
                "message_queue": "RabbitMQ/Redis"
            },
            
            "analytics_service": {
                "responsibility": "Usage analytics and reporting",
                "technology": "Python/FastAPI",
                "key_features": [
                    "Event tracking",
                    "Usage analytics",
                    "Performance metrics",
                    "Business intelligence"
                ],
                "database": "ClickHouse/TimescaleDB"
            }
        }
    
    def _plan_migration_strategy(self):
        return {
            "phase_2a": {
                "timeline": "Weeks 1-4",
                "approach": "Extract API layer",
                "steps": [
                    "Create FastAPI backend parallel to Streamlit",
                    "Move AI service calls to separate service",
                    "Implement API Gateway with authentication",
                    "Database connection pooling and optimization"
                ],
                "risk_mitigation": [
                    "Keep Streamlit running in parallel",
                    "Feature flagging for gradual rollout",
                    "Comprehensive API testing",
                    "Database connection monitoring"
                ]
            },
            
            "phase_2b": {
                "timeline": "Weeks 5-8", 
                "approach": "Service decomposition",
                "steps": [
                    "Extract User Service with authentication",
                    "Separate Payment Service with Stripe",
                    "Create dedicated Workflow Service",
                    "Implement service-to-service communication"
                ],
                "communication_patterns": [
                    "Synchronous: HTTP/REST for real-time operations",
                    "Asynchronous: Message queues for background tasks",
                    "Event-driven: Domain events for loose coupling"
                ]
            },
            
            "phase_2c": {
                "timeline": "Weeks 9-12",
                "approach": "Advanced features and optimization",
                "steps": [
                    "Add caching layers (Redis)",
                    "Implement circuit breakers",
                    "Add comprehensive monitoring",
                    "Performance optimization and load testing"
                ],
                "monitoring_stack": [
                    "Distributed tracing with Jaeger",
                    "Metrics with Prometheus + Grafana",
                    "Centralized logging with ELK stack",
                    "Health checks and service discovery"
                ]
            }
        }
    
    def generate_service_template(self, service_name: str):
        """Generate FastAPI service template"""
        
        service_config = self.service_boundaries.get(service_name)
        if not service_config:
            raise ValueError(f"Unknown service: {service_name}")
        
        return f"""
# {service_name}/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from .models import *
from .services import *
from .auth import get_current_user

app = FastAPI(
    title="{service_name.title()} Service",
    description="{service_config['responsibility']}",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {{"status": "healthy", "service": "{service_name}"}}

# Service-specific endpoints would go here
# Example endpoints based on service responsibility:
{self._generate_service_endpoints(service_name, service_config)}

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV") == "development"
    )
"""
    
    def _generate_service_endpoints(self, service_name: str, config: dict):
        """Generate service-specific endpoints"""
        
        endpoints = {
            "workflow_service": '''
@app.post("/workflows")
async def create_workflow(
    workflow_data: WorkflowRequest,
    current_user = Depends(get_current_user)
):
    """Create new workflow"""
    workflow = await workflow_service.create_workflow(workflow_data, current_user)
    return workflow

@app.get("/workflows/{workflow_id}")
async def get_workflow(
    workflow_id: str,
    current_user = Depends(get_current_user)
):
    """Get workflow status and results"""
    workflow = await workflow_service.get_workflow(workflow_id, current_user)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@app.post("/workflows/{workflow_id}/retry")
async def retry_workflow(
    workflow_id: str,
    current_user = Depends(get_current_user)
):
    """Retry failed workflow"""
    result = await workflow_service.retry_workflow(workflow_id, current_user)
    return result
''',
            
            "ai_service": '''
@app.post("/enhance-image")
async def enhance_image(
    image_data: UploadFile,
    enhancement_type: str = "standard"
):
    """Enhance image using AI services"""
    result = await ai_service.enhance_image(image_data, enhancement_type)
    return result

@app.post("/generate-video")
async def generate_video(
    enhanced_image: str,
    script: str,
    duration: int = 10
):
    """Generate video from enhanced image"""
    result = await ai_service.generate_video(enhanced_image, script, duration)
    return result

@app.get("/services/health")
async def check_ai_services():
    """Check health of all AI services"""
    health_status = await ai_service.check_all_services_health()
    return health_status
''',
            
            "user_service": '''
@app.post("/users/register")
async def register_user(user_data: UserRegistration):
    """Register new user"""
    user = await user_service.create_user(user_data)
    return user

@app.post("/auth/login")
async def login(credentials: UserCredentials):
    """User login"""
    token = await auth_service.authenticate(credentials)
    return {"access_token": token, "token_type": "bearer"}

@app.get("/users/profile")
async def get_profile(current_user = Depends(get_current_user)):
    """Get user profile"""
    return current_user

@app.put("/users/profile")
async def update_profile(
    profile_data: ProfileUpdate,
    current_user = Depends(get_current_user)
):
    """Update user profile"""
    updated_user = await user_service.update_profile(current_user.id, profile_data)
    return updated_user
'''
        }
        
        return endpoints.get(service_name, "# Service-specific endpoints here")
    
    def generate_docker_compose(self):
        """Generate Docker Compose configuration for development"""
        return '''
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8000:8000"
    environment:
      - ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/talkingphoto
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
      - workflow-service
      - ai-service
      - user-service

  workflow-service:
    build: ./workflow-service
    ports:
      - "8001:8000"
    environment:
      - ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/talkingphoto
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  ai-service:
    build: ./ai-service
    ports:
      - "8002:8000"
    environment:
      - ENV=development
      - NANO_BANANA_API_KEY=${NANO_BANANA_API_KEY}
      - VEO3_API_KEY=${VEO3_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  user-service:
    build: ./user-service
    ports:
      - "8003:8000"
    environment:
      - ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/talkingphoto
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres

  payment-service:
    build: ./payment-service
    ports:
      - "8004:8000"
    environment:
      - ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/talkingphoto
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=talkingphoto
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=password
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
'''
```

---

## 🎯 10. POTENTIAL BOTTLENECKS & SCALING CONSIDERATIONS

### Performance Bottleneck Analysis

```python
# performance/bottleneck_analysis.py

class PerformanceBottleneckAnalysis:
    """Comprehensive analysis of potential performance bottlenecks"""
    
    def __init__(self):
        self.bottlenecks = self._identify_bottlenecks()
        self.scaling_strategies = self._define_scaling_strategies()
    
    def _identify_bottlenecks(self):
        return {
            "ai_api_latency": {
                "description": "AI service API call latency",
                "impact": "High - Directly affects user experience",
                "current_metrics": {
                    "nano_banana": "2.1s average",
                    "veo3": "12.5s average", 
                    "runway": "15.3s average"
                },
                "threshold": "30s total processing time",
                "mitigation_strategies": [
                    "Parallel processing where possible",
                    "Smart caching of repeated requests",
                    "Multiple API key rotation",
                    "Fallback service implementation",
                    "Queue-based processing for non-real-time workflows"
                ],
                "cost_impact": "Direct correlation with user satisfaction"
            },
            
            "database_query_performance": {
                "description": "Database query performance at scale",
                "impact": "Medium - Affects app responsiveness",
                "scaling_concerns": [
                    "User table queries (authentication)",
                    "Workflow history queries",
                    "Analytics aggregation queries",
                    "File metadata lookups"
                ],
                "optimization_strategies": [
                    "Proper indexing on frequently queried columns",
                    "Connection pooling (max 20 connections)",
                    "Query optimization and EXPLAIN analysis",
                    "Read replicas for analytics queries",
                    "Redis caching for frequently accessed data"
                ],
                "monitoring_queries": [
                    "SELECT COUNT(*) FROM workflows WHERE status = 'processing'",
                    "SELECT user_id, COUNT(*) FROM workflows GROUP BY user_id LIMIT 10",
                    "SELECT AVG(processing_time_seconds) FROM workflows WHERE created_at > NOW() - INTERVAL '1 hour'"
                ]
            },
            
            "file_upload_processing": {
                "description": "Large file upload and processing",
                "impact": "Medium - User experience for large files",
                "technical_limits": {
                    "max_image_size": "50MB",
                    "max_resolution": "4096x4096",
                    "processing_memory": "2GB per workflow"
                },
                "optimization_strategies": [
                    "Client-side image compression",
                    "Progressive file upload with chunks",
                    "Background processing for large files",
                    "CDN integration for faster uploads",
                    "Image format optimization (WebP, AVIF)"
                ]
            },
            
            "concurrent_user_limits": {
                "description": "Streamlit concurrent user limitations",
                "impact": "High - Direct revenue impact",
                "streamlit_limits": {
                    "free_tier": "Unlimited apps, but shared resources",
                    "community_cloud": "1GB RAM, 1 CPU core per app",
                    "concurrent_sessions": "~1000 users (estimated)"
                },
                "scaling_strategies": [
                    "Horizontal scaling with multiple Streamlit instances",
                    "Load balancing across instances",
                    "Session state optimization",
                    "Migration to dedicated infrastructure at 1000+ users"
                ]
            },
            
            "api_rate_limits": {
                "description": "Third-party API rate limiting",
                "impact": "High - Service availability",
                "current_limits": {
                    "nano_banana": "1000 requests/hour (estimated)",
                    "veo3": "100 requests/hour (estimated)",
                    "stripe": "100 requests/second"
                },
                "mitigation_strategies": [
                    "Multiple API key rotation",
                    "Request queuing and throttling",
                    "Usage prediction and pre-warming",
                    "Fallback service implementation",
                    "User tier-based prioritization"
                ]
            },
            
            "cost_scaling": {
                "description": "API costs scaling with user growth", 
                "impact": "High - Business sustainability",
                "cost_projections": {
                    "500_users": "₹1,250/month (₹0.50 per workflow avg)",
                    "5000_users": "₹12,500/month", 
                    "50000_users": "₹125,000/month"
                },
                "optimization_strategies": [
                    "Bulk pricing negotiations with API providers",
                    "Smart quality vs cost optimization",
                    "User tier-based service routing",
                    "Intelligent caching to reduce API calls",
                    "Cost-effective fallback services"
                ]
            }
        }
    
    def _define_scaling_strategies(self):
        return {
            "horizontal_scaling": {
                "strategy": "Scale out with multiple instances",
                "implementation_phases": [
                    {
                        "trigger": "500+ concurrent users",
                        "action": "Deploy multiple Streamlit instances",
                        "load_balancing": "Nginx round-robin",
                        "session_management": "Sticky sessions with Redis"
                    },
                    {
                        "trigger": "2000+ concurrent users",
                        "action": "Migrate to microservices architecture",
                        "container_orchestration": "Docker Swarm or Kubernetes",
                        "service_mesh": "Istio for advanced traffic management"
                    }
                ]
            },
            
            "vertical_scaling": {
                "strategy": "Scale up with more powerful instances",
                "resource_optimization": [
                    {
                        "current": "Streamlit Cloud (1GB RAM, 1 CPU)",
                        "next": "AWS EC2 t3.large (2 vCPU, 8GB RAM)",
                        "cost": "~₹2000/month per instance"
                    },
                    {
                        "advanced": "AWS EC2 c5.2xlarge (8 vCPU, 16GB RAM)",
                        "use_case": "High-concurrency processing",
                        "cost": "~₹8000/month per instance"
                    }
                ]
            },
            
            "caching_strategies": {
                "levels": [
                    {
                        "level": "Application Cache",
                        "implementation": "In-memory caching with TTL",
                        "use_cases": ["User sessions", "Frequent database queries"],
                        "tools": "Python functools.lru_cache, Redis"
                    },
                    {
                        "level": "Database Query Cache",
                        "implementation": "Redis-based query result caching",
                        "use_cases": ["User profile data", "Export templates"],
                        "ttl": "1-24 hours based on data volatility"
                    },
                    {
                        "level": "AI API Response Cache",
                        "implementation": "Intelligent caching based on input similarity",
                        "use_cases": ["Similar image enhancements", "Common prompts"],
                        "cache_key": "Hash of input data + service parameters"
                    },
                    {
                        "level": "CDN Cache",
                        "implementation": "CloudFront for static assets",
                        "use_cases": ["Generated images/videos", "Export assets"],
                        "ttl": "30 days for immutable content"
                    }
                ]
            },
            
            "database_scaling": {
                "read_replicas": {
                    "implementation": "PostgreSQL streaming replication",
                    "use_cases": ["Analytics queries", "User profile reads"],
                    "benefits": ["Reduced load on primary", "Geographic distribution"]
                },
                "connection_pooling": {
                    "tool": "PgBouncer",
                    "configuration": {
                        "max_client_conn": 1000,
                        "default_pool_size": 20,
                        "pool_mode": "transaction"
                    }
                },
                "partitioning": {
                    "tables": ["workflows", "user_analytics", "system_health"],
                    "strategy": "Time-based partitioning (monthly)",
                    "benefits": ["Improved query performance", "Easier maintenance"]
                }
            },
            
            "queue_management": {
                "background_processing": {
                    "tool": "Celery + Redis",
                    "worker_configuration": {
                        "concurrent_workers": 10,
                        "task_queues": ["high_priority", "normal", "low_priority"],
                        "retry_policy": "Exponential backoff"
                    }
                },
                "priority_queuing": {
                    "enterprise_users": "High priority queue",
                    "pro_users": "Normal priority queue", 
                    "free_users": "Low priority queue",
                    "implementation": "Redis priority queues"
                }
            }
        }
    
    def get_scaling_recommendations(self, current_metrics: dict) -> dict:
        """Get specific scaling recommendations based on current metrics"""
        
        recommendations = {
            "immediate_actions": [],
            "short_term_planning": [],
            "long_term_strategy": [],
            "cost_implications": {}
        }
        
        # Analyze current performance
        if current_metrics.get("concurrent_users", 0) > 500:
            recommendations["immediate_actions"].append({
                "action": "Deploy load balancer",
                "priority": "High",
                "implementation_time": "1-2 weeks",
                "cost": "₹2000-5000/month"
            })
        
        if current_metrics.get("avg_response_time", 0) > 2000:  # 2 seconds
            recommendations["immediate_actions"].append({
                "action": "Implement Redis caching",
                "priority": "High", 
                "implementation_time": "1 week",
                "cost": "₹1000/month"
            })
        
        if current_metrics.get("database_query_time", 0) > 500:  # 500ms
            recommendations["short_term_planning"].append({
                "action": "Database query optimization and indexing",
                "priority": "Medium",
                "implementation_time": "2-3 weeks",
                "cost": "Development time only"
            })
        
        if current_metrics.get("monthly_api_cost", 0) > 10000:  # ₹10k
            recommendations["short_term_planning"].append({
                "action": "Negotiate bulk API pricing",
                "priority": "Medium",
                "implementation_time": "Ongoing",
                "potential_savings": "20-40%"
            })
        
        # Long-term strategy based on growth trajectory
        if current_metrics.get("growth_rate_monthly", 0) > 50:  # 50% monthly growth
            recommendations["long_term_strategy"].append({
                "action": "Migrate to microservices architecture",
                "timeline": "6-9 months",
                "investment_required": "₹5-10 lakhs",
                "expected_capacity": "10x current capacity"
            })
        
        return recommendations
    
    def generate_performance_monitoring_dashboard(self):
        """Generate Streamlit dashboard for performance monitoring"""
        return '''
def create_performance_dashboard():
    st.title("🚀 Performance Monitoring Dashboard")
    
    # Real-time metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        concurrent_users = get_concurrent_users()
        st.metric("Concurrent Users", concurrent_users, delta=get_user_delta())
    
    with col2:
        avg_response_time = get_avg_response_time()
        st.metric("Avg Response Time", f"{avg_response_time}ms", 
                 delta=f"{get_response_time_delta()}ms")
    
    with col3:
        api_cost_today = get_daily_api_cost()
        st.metric("API Cost Today", f"₹{api_cost_today}", 
                 delta=f"₹{get_cost_delta()}")
    
    with col4:
        success_rate = get_workflow_success_rate()
        st.metric("Success Rate", f"{success_rate}%", 
                 delta=f"{get_success_rate_delta()}%")
    
    # Performance trends
    st.subheader("📊 Performance Trends")
    
    # Response time chart
    response_time_data = get_response_time_history()
    st.line_chart(response_time_data, x="timestamp", y="response_time")
    
    # API usage by service
    st.subheader("🔌 API Usage by Service")
    api_usage = get_api_usage_breakdown()
    st.bar_chart(api_usage)
    
    # Resource utilization
    st.subheader("💻 Resource Utilization")
    col1, col2 = st.columns(2)
    
    with col1:
        cpu_usage = get_cpu_usage()
        st.progress(cpu_usage / 100)
        st.caption(f"CPU: {cpu_usage}%")
    
    with col2:
        memory_usage = get_memory_usage()
        st.progress(memory_usage / 100)
        st.caption(f"Memory: {memory_usage}%")
    
    # Bottleneck alerts
    alerts = get_performance_alerts()
    if alerts:
        st.subheader("⚠️ Performance Alerts")
        for alert in alerts:
            st.warning(alert["message"])
    
    # Scaling recommendations
    st.subheader("💡 Scaling Recommendations")
    current_metrics = {
        "concurrent_users": concurrent_users,
        "avg_response_time": avg_response_time,
        "monthly_api_cost": api_cost_today * 30,
        "growth_rate_monthly": calculate_growth_rate()
    }
    
    analysis = PerformanceBottleneckAnalysis()
    recommendations = analysis.get_scaling_recommendations(current_metrics)
    
    for category, actions in recommendations.items():
        if actions:
            st.write(f"**{category.title().replace('_', ' ')}:**")
            for action in actions:
                if isinstance(action, dict):
                    st.info(f"• {action.get('action', action)}")
'''

# Usage example and cost projection
def calculate_scaling_costs():
    """Calculate costs for different scaling scenarios"""
    
    scenarios = {
        "current_mvp": {
            "users": 500,
            "workflows_per_month": 2500,
            "infrastructure_cost": 0,
            "api_cost": 1250,
            "total_cost": 1250
        },
        "scale_1": {
            "users": 2000,
            "workflows_per_month": 10000,
            "infrastructure_cost": 5000,
            "api_cost": 5000,
            "total_cost": 10000
        },
        "scale_2": {
            "users": 10000, 
            "workflows_per_month": 50000,
            "infrastructure_cost": 25000,
            "api_cost": 25000,
            "total_cost": 50000
        }
    }
    
    return scenarios
```

---

## 📝 SUMMARY

This comprehensive technical architecture provides a production-ready foundation for the TalkingPhoto MVP that can scale from ₹1L budget to ₹7.5L MRR in 8 weeks. 

### Key Architectural Decisions:

1. **Export-First Strategy**: Smart approach that provides immediate value while building toward full integration
2. **Streamlit Cloud Deployment**: Zero hosting costs with professional features for rapid MVP launch
3. **Progressive Architecture**: Clear migration pathway from monolith to microservices as revenue grows
4. **Cost-Efficient AI Integration**: Smart routing and fallbacks to optimize quality vs cost
5. **Scalable Data Architecture**: PostgreSQL + Redis foundation that supports 500+ users initially
6. **Comprehensive Monitoring**: Production-ready observability from day one
7. **Security-First Design**: GDPR compliance, data protection, and secure payment processing

### Migration Pathway:
- **Phase 1 (₹1L → ₹7.5L MRR)**: Streamlit MVP with export workflows
- **Phase 2 (₹7.5L → ₹50L MRR)**: Microservices migration with direct API integrations  
- **Phase 3 (₹50L → ₹1Cr MRR)**: Full platform with marketplace and enterprise features

The architecture balances rapid development speed with long-term scalability, ensuring the business can execute quickly while building a foundation for sustainable growth.

**Next Steps**: Execute the 8-week sprint plan starting with core Streamlit app development and AI service integrations.

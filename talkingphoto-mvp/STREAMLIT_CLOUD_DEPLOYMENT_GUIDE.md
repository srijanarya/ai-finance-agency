# TalkingPhoto MVP - Streamlit Cloud Deployment Guide

## 🚀 Complete Deployment Instructions

This guide provides step-by-step instructions for deploying the TalkingPhoto MVP to Streamlit Cloud with optimized performance and security.

## 📋 Prerequisites

### 1. GitHub Repository Setup
- Fork or create a repository with the TalkingPhoto MVP code
- Ensure all files are committed and pushed to GitHub
- Repository must be public or you need Streamlit Cloud Pro

### 2. Required API Keys
Obtain the following API keys before deployment:

#### Video Generation Services (Choose at least one)
- **HeyGen API Key** (Recommended - Best quality)
- **D-ID API Key** (Alternative)
- **Synthesia API Key** (Enterprise option)
- **Luma AI API Key** (For Veo3 integration)

#### Payment Processing
- **Stripe API Keys** (Live keys for production)
  - Publishable Key: `pk_live_...`
  - Secret Key: `sk_live_...`
  - Webhook Secret: `whsec_...`

#### Indian Market (Optional)
- **Razorpay API Keys**
  - Key ID: `rzp_live_...`
  - Key Secret: `...`

#### Cloud Storage (Choose one)
- **Cloudinary** (Recommended)
  - Cloud Name, API Key, API Secret
- **AWS S3** (Alternative)
  - Access Key ID, Secret Access Key, Bucket Name

## 🏗️ Deployment Steps

### Step 1: Streamlit Cloud Account Setup

1. **Create Account**
   ```
   https://share.streamlit.io/
   ```
   - Sign up with GitHub account
   - Connect your repositories

2. **Deploy New App**
   - Click "New app"
   - Select your repository
   - Choose branch: `main` or `production`
   - Main file path: `talkingphoto-mvp/app.py`

### Step 2: Configure Secrets

1. **Access App Settings**
   - Go to your deployed app
   - Click "Settings" → "Secrets"

2. **Add Production Secrets**
   Copy and paste the following template, replacing with your actual API keys:

   ```toml
   # AI Video Generation (Priority: HeyGen → D-ID → Synthesia)
   [heygen]
   api_key = "hg_live_your_actual_api_key_here"
   api_endpoint = "https://api.heygen.com/v1"

   [d_id]
   api_key = "your_d_id_api_key_here"
   api_endpoint = "https://api.d-id.com"

   # Payment Processing
   [stripe]
   publishable_key = "pk_live_your_actual_stripe_key"
   secret_key = "sk_live_your_actual_stripe_secret"
   webhook_secret = "whsec_your_webhook_secret"

   # Cloud Storage
   [cloudinary]
   cloud_name = "your_cloud_name"
   api_key = "your_api_key"
   api_secret = "your_api_secret"

   # Security
   [jwt]
   secret_key = "your_super_secret_jwt_key_min_32_characters"
   algorithm = "HS256"

   # App Configuration
   [app]
   environment = "production"
   debug = false
   max_concurrent_jobs = 3

   # Feature Flags
   [features]
   enable_payments = true
   enable_analytics = true
   enable_caching = true
   ```

### Step 3: Environment Configuration

1. **Verify Requirements**
   - Check `requirements.txt` is optimized for cloud deployment
   - Ensure all dependencies are pinned to specific versions

2. **Streamlit Configuration**
   - Verify `.streamlit/config.toml` has production settings
   - Confirm theme and performance optimizations

### Step 4: Advanced Settings

1. **Custom Domain (Optional)**
   - Go to Settings → General
   - Add custom domain if you have one
   - Configure CNAME records with your DNS provider

2. **Resource Allocation**
   - Streamlit Cloud provides:
     - 1 CPU core
     - 800MB RAM
     - 50MB upload limit
   - Optimize your app within these limits

## 🔧 Production Optimizations

### 1. Performance Enhancements

```python
# Cache configuration in app.py
@st.cache_data(ttl=3600)  # Cache for 1 hour
def load_expensive_data():
    pass

@st.cache_resource
def initialize_ai_services():
    pass
```

### 2. Memory Management

```python
# Implement memory cleanup
import gc
import psutil

def cleanup_memory():
    gc.collect()
    if psutil.virtual_memory().percent > 80:
        st.cache_data.clear()
        st.cache_resource.clear()
```

### 3. Error Handling

```python
# Production error handling
try:
    result = generate_video()
except Exception as e:
    st.error("Service temporarily unavailable. Please try again.")
    # Log error to external service
    log_error_to_sentry(e)
```

## 🛡️ Security Configuration

### 1. API Key Management
- Never hardcode API keys in your code
- Use Streamlit secrets for all sensitive data
- Rotate keys regularly

### 2. Rate Limiting
```python
# Implement rate limiting
from datetime import datetime, timedelta

def check_rate_limit(user_id: str, max_requests: int = 10) -> bool:
    # Implementation using session state
    pass
```

### 3. Input Validation
```python
def validate_image_upload(uploaded_file):
    # Strict validation
    if uploaded_file.size > 25 * 1024 * 1024:  # 25MB limit
        return False
    if uploaded_file.type not in ['image/jpeg', 'image/png']:
        return False
    return True
```

## 📊 Monitoring & Analytics

### 1. Built-in Monitoring
```python
# Add performance tracking
import time
import streamlit as st

def track_performance():
    start_time = time.time()
    # ... your function
    processing_time = time.time() - start_time
    st.session_state.performance_metrics.append({
        'function': 'video_generation',
        'duration': processing_time,
        'timestamp': datetime.now()
    })
```

### 2. Error Tracking (Optional)
```python
# Sentry integration
import sentry_sdk
from sentry_sdk.integrations.streamlit import StreamlitIntegration

sentry_sdk.init(
    dsn=st.secrets["sentry"]["dsn"],
    integrations=[StreamlitIntegration()],
    environment="production"
)
```

## 🔄 Background Task Management

Since Streamlit Cloud doesn't support Celery, we use the custom `background_tasks.py`:

```python
# In your main app
from background_tasks import submit_video_generation, render_task_progress

# Submit background task
if st.button("Generate Video"):
    task_id = submit_video_generation(
        image_data=uploaded_file.getvalue(),
        script_text=script,
        voice_config=voice_settings,
        video_config=video_settings
    )
    st.success(f"Video generation started! Task ID: {task_id}")

# Monitor progress
if st.session_state.get('current_task_id'):
    completed = render_task_progress()
    if completed:
        st.balloons()
```

## 🌍 Indian Market Optimization

### 1. Payment Integration
```python
# Razorpay integration for Indian users
def detect_indian_user():
    # Simple IP-based detection (consider more sophisticated methods)
    return True  # Implement actual detection

if detect_indian_user():
    # Show Razorpay payment options
    payment_provider = "razorpay"
else:
    # Show Stripe payment options
    payment_provider = "stripe"
```

### 2. Regional Settings
```python
# Indian language support
INDIAN_LANGUAGES = [
    "Hindi - हिन्दी",
    "Tamil - தமிழ்",
    "Telugu - తెలుగు",
    "Bengali - বাংলা",
    "Marathi - मराठी",
    "Gujarati - ગુજરાતી"
]

# Indian pricing
INDIAN_PRICING = {
    "monthly": 299,  # INR
    "yearly": 2999   # INR
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**
   ```
   ModuleNotFoundError: No module named 'X'
   ```
   - Check `requirements.txt` contains the module
   - Verify version compatibility
   - Redeploy the app

2. **Memory Errors**
   ```
   MemoryError: Unable to allocate array
   ```
   - Reduce image processing size
   - Implement memory cleanup
   - Use streaming for large files

3. **Timeout Errors**
   ```
   Request timeout
   ```
   - Implement async processing
   - Add progress indicators
   - Use background tasks

### Debugging Tools

```python
# Debug mode (only in development)
if st.secrets.get("app", {}).get("debug", False):
    st.write("Debug info:", debug_data)
    st.json(session_state_data)
```

## 📈 Performance Metrics

Monitor these key metrics:
- **Response Time**: < 2 seconds for UI interactions
- **Video Generation Time**: < 60 seconds average
- **Memory Usage**: < 600MB peak
- **Error Rate**: < 2%
- **User Satisfaction**: > 4.5/5 stars

## 🚀 Post-Deployment Checklist

- [ ] App loads without errors
- [ ] All API integrations working
- [ ] Payment flow tested
- [ ] Video generation functional
- [ ] Mobile responsive design
- [ ] Performance meets targets
- [ ] Error handling tested
- [ ] Analytics tracking active
- [ ] Security measures verified
- [ ] Documentation updated

## 🔗 Useful Resources

- [Streamlit Cloud Documentation](https://docs.streamlit.io/streamlit-cloud)
- [Streamlit Deployment Guide](https://docs.streamlit.io/streamlit-cloud/get-started/deploy-an-app)
- [Secrets Management](https://docs.streamlit.io/streamlit-cloud/get-started/deploy-an-app/connect-to-data-sources/secrets-management)
- [Performance Optimization](https://docs.streamlit.io/library/advanced-features/caching)

## 📞 Support

For deployment issues:
1. Check Streamlit Cloud logs
2. Verify all secrets are properly configured
3. Test API endpoints independently
4. Contact Streamlit Cloud support if needed

---

**🎯 Success Criteria**: App deployed, fully functional, handling production traffic with <60 second video generation times and >99% uptime.
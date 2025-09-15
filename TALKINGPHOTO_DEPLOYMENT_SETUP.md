# 🚀 TalkingPhoto AI MVP - Complete Setup Guide

## 📊 Setup Progress Tracker

| Service | Status | Notes | Cost |
|---------|--------|-------|------|
| GitHub | ⏳ Pending | Code repository | Free |
| Streamlit Cloud | ⏳ Pending | App hosting | Free |
| Google Cloud | ⏳ Pending | AI APIs | Pay-as-you-go |
| Veo3 API | ⏳ Pending | Video generation | Beta/Free |
| Stripe | ⏳ Pending | Payments | 2.9% + ₹3 per transaction |
| Storage | ⏳ Pending | AWS S3 or Cloudinary | Free tier available |
| PostgreSQL | ⏳ Pending | Supabase | Free tier (500MB) |
| Redis | ⏳ Pending | Upstash | Free tier (10K commands/day) |
| Domain | ⏳ Optional | Custom domain | ~₹1000/year |

---

## 📋 Step-by-Step Setup Instructions

### Step 1: GitHub Account ✅
**Time Required:** 5 minutes  
**Cost:** Free

1. Go to [GitHub.com](https://github.com)
2. Click "Sign up" 
3. Enter email, create password, choose username
4. Verify email address
5. Create new repository named `talkingphoto-ai-mvp`

**What you'll get:**
- Repository URL: `https://github.com/[your-username]/talkingphoto-ai-mvp`
- Version control for your code
- CI/CD integration capability

---

### Step 2: Streamlit Cloud Account 🎯
**Time Required:** 10 minutes  
**Cost:** Free

1. Go to [Streamlit.io/cloud](https://streamlit.io/cloud)
2. Click "Sign up" → Use GitHub account (recommended)
3. Authorize Streamlit to access your GitHub
4. You'll get free hosting for 1 public app

**What you'll get:**
- Free hosting URL: `https://[app-name].streamlit.app`
- Automatic deployments from GitHub
- 1GB resource limit (sufficient for MVP)

---

### Step 3: Google Cloud Account ☁️
**Time Required:** 15 minutes  
**Cost:** $300 free credits for 90 days

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new account (use existing Google account)
3. Add billing information (required but won't charge during free trial)
4. Create new project: "talkingphoto-ai"
5. Enable these APIs:
   - Gemini API (for Nano Banana)
   - Cloud Storage API
   - Cloud Vision API (optional)

**Commands to enable APIs:**
```bash
# After creating project, in Cloud Shell:
gcloud services enable generativelanguage.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable vision.googleapis.com
```

**Get API Key:**
1. Go to APIs & Services → Credentials
2. Create Credentials → API Key
3. Restrict key to specific APIs
4. Copy key: `AIza...` (save securely)

---

### Step 4: Veo3 API Access 🎬
**Time Required:** 5 minutes  
**Cost:** Currently in beta (free)

1. Go to [Google AI Studio](https://makersuite.google.com)
2. Sign in with Google account
3. Navigate to "Video Generation" or "Veo3"
4. Request access (may have waitlist)
5. Once approved, get API key

**Alternative if Veo3 not available:**
- Use Stability AI's video API
- Or RunwayML API as backup

---

### Step 5: Stripe Account 💳
**Time Required:** 20 minutes  
**Cost:** 2.9% + ₹3 per successful transaction

1. Go to [stripe.com](https://stripe.com)
2. Sign up with email
3. Complete business verification:
   - Business type: Individual/Sole Proprietor
   - Business category: Software/Technology
   - Expected volume: ₹0-50,000/month initially
4. Add bank account for payouts (Indian bank account)
5. Get API keys from Dashboard:
   - Test keys: `pk_test_...` and `sk_test_...`
   - Live keys: `pk_live_...` and `sk_live_...` (after verification)

**Indian Requirements:**
- PAN card
- Aadhaar card
- Bank account details
- GST number (optional for now)

---

### Step 6: Storage Solution 📦

#### Option A: AWS S3 (Recommended)
**Time Required:** 15 minutes  
**Cost:** Free tier: 5GB storage, 20K requests/month

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Create AWS account
3. Navigate to S3 service
4. Create bucket: `talkingphoto-uploads`
5. Set bucket policy for public read (for processed videos)
6. Create IAM user with S3 access
7. Get Access Key ID and Secret Access Key

#### Option B: Cloudinary (Easier)
**Time Required:** 5 minutes  
**Cost:** Free tier: 25GB storage, 25GB bandwidth/month

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Get from dashboard:
   - Cloud name
   - API Key
   - API Secret

---

### Step 7: PostgreSQL Database (Supabase) 🗄️
**Time Required:** 10 minutes  
**Cost:** Free tier: 500MB database, 2GB bandwidth

1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Create new project:
   - Name: `talkingphoto-db`
   - Database Password: (generate strong password)
   - Region: Mumbai/Singapore (closest to India)
4. Wait for provisioning (~2 minutes)
5. Get connection string from Settings → Database:
   ```
   postgresql://postgres:[password]@[host]:5432/postgres
   ```

**Create Initial Tables:**
```sql
-- Run in Supabase SQL editor
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    input_image_url TEXT,
    output_video_url TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    stripe_payment_id VARCHAR(255),
    amount INTEGER,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Step 8: Redis Cache (Upstash) ⚡
**Time Required:** 5 minutes  
**Cost:** Free tier: 10,000 commands/day

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub/Google
3. Create new Redis database:
   - Name: `talkingphoto-cache`
   - Region: AWS Mumbai (ap-south-1)
   - Enable TLS
4. Get credentials:
   - Endpoint: `...upstash.io`
   - Password: `...`
   - REST URL: `https://...upstash.io`

---

### Step 9: Domain Name (Optional) 🌐
**Time Required:** 10 minutes  
**Cost:** ~₹800-1500/year

**Option A: Namecheap**
1. Go to [namecheap.com](https://namecheap.com)
2. Search: `talkingphoto.ai` or alternatives
3. Purchase with PayPal/Card

**Option B: GoDaddy India**
1. Go to [godaddy.in](https://godaddy.in)
2. Search and purchase
3. Indian payment methods accepted

**Free Alternative:**
- Use Streamlit's subdomain: `talkingphoto.streamlit.app`

---

## 🔐 Environment Variables Setup

Create `.env` file for local development:

```bash
# API Keys
GOOGLE_CLOUD_API_KEY=AIza...
VEO3_API_KEY=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Database
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Redis
REDIS_URL=redis://default:[password]@[host]:6379

# Storage (choose one)
# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=talkingphoto-uploads
AWS_REGION=ap-south-1

# OR Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# App Settings
APP_ENV=development
APP_SECRET_KEY=[generate-random-string]
```

---

## 🚦 Quick Start Commands

Once all accounts are set up:

```bash
# Clone repository
git clone https://github.com/[your-username]/talkingphoto-ai-mvp.git
cd talkingphoto-ai-mvp

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run locally
streamlit run app.py

# Deploy to Streamlit Cloud
git push origin main
# Connect repo in Streamlit Cloud dashboard
```

---

## 💰 Cost Estimation (Monthly)

### During Development (First 3 months)
- **Total:** ₹0 (using free tiers)

### After MVP Launch (100 users)
- Google Cloud API: ~₹2,000
- Storage: ~₹500
- Database: ₹0 (free tier)
- Redis: ₹0 (free tier)
- Domain: ₹100/month
- **Total:** ~₹2,600/month

### Revenue Model
- ₹99/video × 100 videos = ₹9,900
- Stripe fees: ~₹300
- **Net Revenue:** ~₹7,000/month profit

---

## 🆘 Support & Help

### Community Support
- [Streamlit Forum](https://discuss.streamlit.io)
- [Google Cloud Community](https://cloud.google.com/community)
- [Stripe Discord](https://discord.gg/stripe)

### Documentation
- [Streamlit Docs](https://docs.streamlit.io)
- [Google Gemini API](https://ai.google.dev)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Supabase Docs](https://supabase.com/docs)

---

## ✅ Next Steps After Setup

1. **Test each service individually**
2. **Set up monitoring and alerts**
3. **Create backup strategy**
4. **Implement security best practices**
5. **Prepare launch marketing**

---

**Questions?** Let me know which step you'd like to start with, and I'll guide you through it in detail!
# AI Finance Agency - Subscription Billing System 🚀

A comprehensive subscription billing system built for the AI Finance Agency platform, designed to generate immediate revenue through multiple pricing tiers and payment providers.

## 🎯 Business Overview

**Revenue Potential:**
- **Basic Plan**: $99/month (Premium Telegram signals)
- **Professional Plan**: $500/month (Full dashboard + API access)
- **Enterprise Plan**: $2,000/month (White-label solution)

**Projected Revenue with Conservative Growth:**
- 100 Basic subscribers: $9,900 MRR
- 50 Professional subscribers: $25,000 MRR  
- 10 Enterprise subscribers: $20,000 MRR
- **Total: $54,900 MRR ($658,800 ARR)**

## 🏗️ System Architecture

### Core Components

1. **subscription_manager.py** - Core subscription logic and plan management
2. **payment_processor.py** - Stripe and Razorpay integration
3. **billing_dashboard.py** - Admin interface for subscription management
4. **subscription_api.py** - REST API for customer integration
5. **business_integration.py** - Platform integration and revenue analytics

### Database Schema

- **subscription_plans** - Plan definitions and pricing
- **subscriptions** - Customer subscriptions and status
- **payment_history** - Payment transactions and records
- **subscription_usage** - Feature usage tracking
- **revenue_analytics** - MRR/ARR calculations
- **compliance_logs** - Audit trail for compliance

## 🚀 Quick Start

### 1. Installation

```bash
# Clone and setup
git clone <repository>
cd ai-finance-agency

# Install dependencies
source venv/bin/activate
pip install stripe==8.2.0 razorpay==1.3.0 flask-limiter==3.5.0

# Test system
python3 test_billing_system.py
```

### 2. Configuration

```bash
# Copy environment template
cp .env.subscription .env.billing

# Edit with your credentials
nano .env.billing
```

**Required Configuration:**
```bash
# Stripe (International)
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Razorpay (India)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Security
API_KEY=your_secure_api_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 3. Start Services

```bash
# Option 1: Start all services
./start_billing_system.sh

# Option 2: Start individually
python3 billing_dashboard.py &    # Port 5007
python3 subscription_api.py &     # Port 5008
```

### 4. Access Points

- **Billing Dashboard**: http://localhost:5007
- **Subscription API**: http://localhost:5008
- **API Documentation**: http://localhost:5008/health

## 💳 Payment Integration

### Stripe (International Customers)

```python
from payment_processor import payment_processor

# Create payment intent
intent = payment_processor.create_payment_intent_stripe(
    amount=Decimal('99.00'),
    currency='USD',
    customer_email='customer@example.com',
    subscription_id='sub_12345',
    billing_address={'country': 'US', 'state': 'CA'}
)
```

### Razorpay (Indian Customers)

```python
# Create Razorpay payment intent
intent = payment_processor.create_payment_intent_razorpay(
    amount=Decimal('7500.00'),  # INR
    currency='INR',
    customer_email='customer@example.com',
    subscription_id='sub_12345',
    billing_address={'country': 'IN', 'is_business': False}
)
```

## 📊 Subscription Management

### Create Trial Subscription

```python
from subscription_manager import subscription_manager
from business_integration import business_integration

# Onboard trial user
result = business_integration.onboard_trial_user(
    email='newuser@example.com',
    source='website'
)

print(f"User ID: {result['user_id']}")
print(f"Trial ends: {result['trial_ends']}")
```

### Check Feature Access

```python
# Check if user can access API
has_access, details = subscription_manager.check_access(
    user_id='user_12345',
    resource='api_calls'
)

if has_access:
    # Record usage
    subscription_manager.record_usage(
        subscription_id=details['subscription']['id'],
        resource_type='api_calls',
        count=1
    )
```

## 🔧 API Endpoints

### Authentication
All API endpoints require `X-API-Key` header.

### Core Endpoints

```bash
# Get subscription plans
GET /api/v1/plans

# Get user's subscription
GET /api/v1/users/{user_id}/subscription
Headers: X-API-Key: your_api_key

# Create subscription
POST /api/v1/subscriptions
Content-Type: application/json
{
  "user_id": "user_12345",
  "plan_id": "professional",
  "billing_cycle": "monthly"
}

# Check access
GET /api/v1/users/{user_id}/access/{resource}

# Record usage
POST /api/v1/subscriptions/{sub_id}/usage
{
  "resource_type": "api_calls",
  "count": 1
}
```

### Webhook Endpoints

```bash
# Stripe webhooks
POST /webhooks/stripe
Stripe-Signature: t=timestamp,v1=signature

# Razorpay webhooks
POST /webhooks/razorpay
X-Razorpay-Signature: signature
```

## 📈 Revenue Analytics

### Dashboard Metrics

- **MRR (Monthly Recurring Revenue)**
- **ARR (Annual Recurring Revenue)**
- **Churn Rate**
- **Customer Lifetime Value**
- **Trial Conversion Rate**

### Business Intelligence

```python
# Get revenue metrics
metrics = business_integration.generate_business_metrics()
print(f"Total MRR: ${metrics['financial_metrics']['total_mrr']}")
print(f"Total ARR: ${metrics['financial_metrics']['total_arr']}")

# Generate revenue forecast
forecast = business_integration.generate_revenue_forecast(months_ahead=12)
print(f"Projected ARR: ${forecast['total_projected_arr']}")
```

## 🛡️ Security & Compliance

### PCI DSS Compliance
- Payment data handled by Stripe/Razorpay (PCI Level 1)
- No credit card data stored locally
- Webhook signature verification
- API key authentication

### Data Privacy
- GDPR compliant data handling
- Customer data encryption
- Audit logs for all transactions
- Right to data deletion

### Compliance Logging
```python
# All subscription events are logged
subscription_manager.log_compliance_event(
    action='subscription_created',
    user_id='user_12345',
    details={'plan_id': 'professional'},
    ip_address='192.168.1.1',
    jurisdiction='US'
)
```

## 🌍 International Support

### Multi-Currency
- **USD**: Primary currency for international customers
- **INR**: Indian Rupee for domestic market
- **EUR/GBP**: European markets (via Stripe)

### Tax Calculation
- **US**: State sales tax where applicable
- **India**: 18% GST for digital services
- **EU**: VAT with reverse charge for B2B

### Jurisdiction Compliance
```python
# Tax calculation example
tax_info = payment_processor.calculate_tax(
    amount=Decimal('99.00'),
    country_code='IN',
    is_business=False
)
print(f"Tax amount: ${tax_info.tax_amount}")
```

## 🔄 Business Integration

### Platform Integration
```python
# Integrate with main platform
result = business_integration.handle_platform_integration(
    user_id='user_12345',
    feature='advanced_analytics',
    usage_data={'count': 1}
)

if not result['access_granted']:
    upgrade_suggestion = result['upgrade_suggestion']
    print(f"Upgrade to {upgrade_suggestion['suggested_plan']}")
```

### Customer Lifecycle
1. **Trial Start** → 7-day free trial
2. **Trial End** → Payment required
3. **Active Subscription** → Full access
4. **Usage Tracking** → Monitor limits
5. **Upgrade/Downgrade** → Plan changes
6. **Cancellation** → Graceful termination

## 📋 Admin Dashboard Features

### Subscription Management
- View all subscriptions by status/tier
- Cancel/pause subscriptions
- Process refunds
- Update billing information

### Revenue Analytics
- Real-time MRR/ARR tracking
- Revenue by subscription tier
- Payment provider performance
- Growth rate analysis

### Customer Insights
- Usage patterns
- Upgrade/downgrade trends
- Churn analysis
- Customer lifetime value

## 🚨 Troubleshooting

### Common Issues

1. **Payment Failures**
   ```bash
   # Check payment processor logs
   tail -f billing.log | grep "payment_failed"
   ```

2. **Webhook Issues**
   ```bash
   # Test webhook endpoints
   curl -X POST http://localhost:5008/health
   ```

3. **Database Issues**
   ```bash
   # Reset database
   rm *.db
   python3 test_billing_system.py
   ```

### Support Channels
- **Logs**: Check `billing.log` for system events
- **Health Check**: GET `/health` endpoint
- **Database**: SQLite files in project directory

## 🎯 Deployment Checklist

### Pre-Production
- [ ] Configure payment provider credentials
- [ ] Set up webhook endpoints
- [ ] Test payment flows
- [ ] Verify tax calculations
- [ ] Set up SSL certificates
- [ ] Configure monitoring

### Production Launch
- [ ] Switch to live payment keys
- [ ] Set `PRODUCTION=true`
- [ ] Enable monitoring/alerting
- [ ] Set up backup procedures
- [ ] Configure auto-scaling
- [ ] Test disaster recovery

## 💰 Revenue Optimization

### Pricing Strategy
- **Value-based pricing** aligned with feature access
- **Annual discounts** (2 months free) for cash flow
- **Enterprise custom pricing** for large clients
- **Trial-to-paid conversion** optimization

### Growth Tactics
- **Freemium model** with limited free tier
- **Usage-based upselling** at limit boundaries
- **Referral programs** with subscription credits
- **Enterprise sales** for high-value accounts

## 📈 Success Metrics

### Financial KPIs
- **Monthly Recurring Revenue (MRR)**: Target $50K+ within 6 months
- **Annual Recurring Revenue (ARR)**: Target $600K+ within 12 months
- **Customer Acquisition Cost (CAC)**: < $100 per customer
- **Customer Lifetime Value (CLV)**: > $1,000 per customer

### Operational KPIs
- **Trial-to-Paid Conversion**: > 15%
- **Monthly Churn Rate**: < 5%
- **Payment Success Rate**: > 95%
- **Support Response Time**: < 4 hours

---

**Built by TREUM ALGOTECH**  
*Enabling AI-powered financial intelligence at scale*

For support: Contact the development team  
Last Updated: September 10, 2025

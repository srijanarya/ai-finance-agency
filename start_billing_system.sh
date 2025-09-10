#!/bin/bash
# AI Finance Agency - Complete Billing System Startup
# Starts all billing components for immediate revenue generation

echo "🚀 AI FINANCE AGENCY BILLING SYSTEM"
echo "===================================="
echo "💳 Multi-tier subscription billing"
echo "🌍 International payment processing"
echo "📊 Real-time revenue analytics"
echo "🔐 Enterprise-grade compliance"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Run: python3 -m venv venv && source venv/bin/activate"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check dependencies
echo "📦 Checking dependencies..."
python3 -c "import stripe, razorpay, flask_limiter" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Installing billing dependencies..."
    pip install stripe==8.2.0 razorpay==1.3.0 flask-limiter==3.5.0
fi

# Test system components
echo "🧪 Testing system components..."
python3 test_billing_system.py
if [ $? -ne 0 ]; then
    echo "❌ System test failed! Check error messages above."
    exit 1
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Start billing dashboard
echo "🏦 Starting Billing Dashboard (Port 5007)..."
python3 billing_dashboard.py &
BILLING_PID=$!
sleep 2

# Start subscription API
echo "🔗 Starting Subscription API (Port 5008)..."
python3 subscription_api.py &
API_PID=$!
sleep 2

echo ""
echo "✅ BILLING SYSTEM READY!"
echo "============================="
echo ""
echo "🌐 Access Points:"
echo "   • Billing Dashboard: http://localhost:5007"
echo "   • Subscription API:   http://localhost:5008"
echo "   • Health Check:       http://localhost:5008/health"
echo ""
echo "🔑 Admin Access:"
echo "   • Username: admin"
echo "   • Password: treum2025 (CHANGE IN PRODUCTION!)"
echo ""
echo "💰 Revenue Potential:"
echo "   • Basic Plan:     $99/month  (Premium signals)"
echo "   • Professional:  $500/month (Dashboard + API)"
echo "   • Enterprise:    $2000/month (White-label)"
echo "   • Target ARR:    $658,800 with 160 subscribers"
echo ""
echo "🛠️ Configuration:"
echo "   • Edit .env.billing for payment provider setup"
echo "   • Configure Stripe: https://dashboard.stripe.com/apikeys"
echo "   • Configure Razorpay: https://dashboard.razorpay.com/app/keys"
echo ""
echo "📊 Monitoring:"
echo "   • Logs: tail -f billing.log"
echo "   • Database: *.db files in current directory"
echo "   • Redis: localhost:6379 (install if not running)"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🚑 Stopping services..."
    kill $BILLING_PID $API_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for services
wait
#!/usr/bin/env python3
"""
Subscription Billing System Setup Script
=======================================
Sets up the complete subscription billing system for AI Finance Agency

Author: TREUM ALGOTECH
Created: September 10, 2025
"""

import os
import sys
import subprocess
import sqlite3
import json
from pathlib import Path
from datetime import datetime

def print_banner():
    """Print setup banner"""
    print("\n" + "="*60)
    print("🚀 AI FINANCE AGENCY SUBSCRIPTION BILLING SETUP")
    print("💳 Stripe + Razorpay Integration")
    print("📊 Revenue Analytics Dashboard")
    print("🔐 Compliance & Security")
    print("="*60 + "\n")

def check_python_version():
    """Check Python version"""
    if sys.version_info < (3, 9):
        print("❌ Error: Python 3.9+ required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def install_dependencies():
    """Install required Python packages"""
    print("\n📦 Installing dependencies...")
    
    required_packages = [
        "stripe==8.2.0",
        "razorpay==1.3.0",
        "flask-limiter==3.5.0",
        "python-dotenv>=1.0.0",
        "redis>=5.0.0",
        "flask>=3.0.0",
        "flask-cors>=4.0.0"
    ]
    
    for package in required_packages:
        try:
            result = subprocess.run(
                [sys.executable, "-m", "pip", "install", package],
                capture_output=True,
                text=True,
                check=True
            )
            print(f"✅ Installed: {package}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")
            print(f"Error output: {e.stderr}")
            return False
    
    return True

def setup_database():
    """Initialize subscription database"""
    print("\n🗄️  Setting up database...")
    
    try:
        # Import and initialize subscription manager
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from subscription_manager import subscription_manager
        
        # Database is automatically initialized in subscription_manager
        print("✅ Database schema created")
        print("✅ Default subscription plans added")
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False

def create_config_files():
    """Create configuration files"""
    print("\n⚙️  Creating configuration files...")
    
    # Update config.json with billing ports
    config_path = Path("config.json")
    if config_path.exists():
        with open(config_path, 'r') as f:
            config = json.load(f)
    else:
        config = {}
    
    # Add billing system ports
    if 'ports' not in config:
        config['ports'] = {}
    
    config['ports'].update({
        'billing_dashboard': 5007,
        'subscription_api': 5008
    })
    
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✅ Updated config.json")
    
    # Copy environment template
    env_template = Path(".env.subscription")
    env_file = Path(".env.billing")
    
    if env_template.exists() and not env_file.exists():
        import shutil
        shutil.copy(env_template, env_file)
        print(f"✅ Created {env_file} from template")
        print("⚠️  Please configure your payment provider credentials in .env.billing")
    
    return True

def setup_redis():
    """Check Redis setup"""
    print("\n🔴 Checking Redis...")
    
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis connection successful")
        return True
    except redis.ConnectionError:
        print("⚠️  Redis not running - install and start Redis for caching")
        print("   macOS: brew install redis && brew services start redis")
        print("   Ubuntu: sudo apt install redis-server")
        print("   The system will work without Redis but performance may be reduced")
        return True
    except ImportError:
        print("❌ Redis package not installed")
        return False

def create_startup_scripts():
    """Create startup scripts"""
    print("\n📝 Creating startup scripts...")
    
    # Create billing dashboard startup script
    dashboard_script = Path("start_billing_dashboard.py")
    dashboard_content = '''#!/usr/bin/env python3
"""Start Billing Dashboard"""
import subprocess
import sys
import os
from pathlib import Path

if __name__ == "__main__":
    os.chdir(Path(__file__).parent)
    print("🏦 Starting Billing Dashboard...")
    subprocess.run([sys.executable, "billing_dashboard.py"])
'''
    
    with open(dashboard_script, 'w') as f:
        f.write(dashboard_content)
    dashboard_script.chmod(0o755)
    
    # Create API startup script
    api_script = Path("start_subscription_api.py")
    api_content = '''#!/usr/bin/env python3
"""Start Subscription API"""
import subprocess
import sys
import os
from pathlib import Path

if __name__ == "__main__":
    os.chdir(Path(__file__).parent)
    print("🚀 Starting Subscription API...")
    subprocess.run([sys.executable, "subscription_api.py"])
'''
    
    with open(api_script, 'w') as f:
        f.write(api_content)
    api_script.chmod(0o755)
    
    # Create all-in-one startup script
    all_script = Path("start_billing_system.sh")
    all_content = '''#!/bin/bash
# Start complete billing system

echo "🚀 Starting AI Finance Agency Billing System"
echo "================================="

# Start in background
python3 billing_dashboard.py &
BILLING_PID=$!

python3 subscription_api.py &
API_PID=$!

echo "✅ Billing Dashboard: http://localhost:5007"
echo "✅ Subscription API: http://localhost:5008"
echo "✅ Admin Login: admin / treum2025 (change in production)"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BILLING_PID $API_PID; exit" INT
wait
'''
    
    with open(all_script, 'w') as f:
        f.write(all_content)
    all_script.chmod(0o755)
    
    print("✅ Created startup scripts")
    return True

def test_system():
    """Test system components"""
    print("\n🧪 Testing system components...")
    
    try:
        # Test subscription manager
        from subscription_manager import subscription_manager
        plans = subscription_manager.get_plans()
        print(f"✅ Subscription Manager: {len(plans)} plans loaded")
        
        # Test payment processor (without real credentials)
        from payment_processor import payment_processor
        print("✅ Payment Processor: Initialized")
        
        return True
        
    except Exception as e:
        print(f"❌ System test failed: {e}")
        return False

def print_next_steps():
    """Print next steps for user"""
    print("\n" + "="*60)
    print("🎉 SETUP COMPLETE!")
    print("="*60)
    
    print("\n📋 NEXT STEPS:")
    print("\n1. 🔑 Configure Payment Providers:")
    print("   - Edit .env.billing with your Stripe/Razorpay credentials")
    print("   - Get Stripe keys: https://dashboard.stripe.com/apikeys")
    print("   - Get Razorpay keys: https://dashboard.razorpay.com/app/keys")
    
    print("\n2. 🚀 Start Services:")
    print("   - Run: ./start_billing_system.sh")
    print("   - Or individually:")
    print("     - Billing Dashboard: python3 billing_dashboard.py")
    print("     - Subscription API: python3 subscription_api.py")
    
    print("\n3. 🌐 Access Points:")
    print("   - Billing Dashboard: http://localhost:5007")
    print("   - Subscription API: http://localhost:5008")
    print("   - Admin Login: admin / treum2025 (change in production!)")
    
    print("\n4. 🔒 Production Setup:")
    print("   - Change admin credentials in .env.billing")
    print("   - Set up SSL certificates")
    print("   - Configure webhook endpoints")
    print("   - Set PRODUCTION=true in environment")
    
    print("\n5. 💰 Revenue Targets:")
    print("   - Basic Plan: $99/month (Premium Telegram signals)")
    print("   - Professional: $500/month (Full dashboard + API)")
    print("   - Enterprise: $2000/month (White-label solution)")
    print("   - Projected ARR: $50,000-$500,000+ with 100+ subscribers")
    
    print("\n🆘 SUPPORT:")
    print("   - Documentation: Check created files for detailed API docs")
    print("   - Logs: Check billing.log for system events")
    print("   - Issues: Review error messages and check credentials")
    
    print("\n" + "="*60)

def main():
    """Main setup function"""
    print_banner()
    
    # Check prerequisites
    check_python_version()
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Setup failed at dependency installation")
        return False
    
    # Setup database
    if not setup_database():
        print("❌ Setup failed at database creation")
        return False
    
    # Setup Redis
    setup_redis()
    
    # Create config files
    if not create_config_files():
        print("❌ Setup failed at configuration")
        return False
    
    # Create startup scripts
    if not create_startup_scripts():
        print("❌ Setup failed at script creation")
        return False
    
    # Test system
    if not test_system():
        print("❌ Setup failed at system testing")
        return False
    
    # Print next steps
    print_next_steps()
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

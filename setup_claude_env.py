#!/usr/bin/env python3
"""
Claude Code Environment Setup Helper
Run this in Claude Code to set up your environment variables
"""

import os
import shutil

def setup_claude_environment():
    """Setup environment for Claude Code development"""
    
    print("🤖 Setting up AI Finance Agency for Claude Code")
    print("=" * 60)
    
    # Check if .env.claude exists
    if os.path.exists('.env.claude'):
        print("✅ Found .env.claude template")
        
        # Copy to .env for development
        shutil.copy('.env.claude', '.env')
        print("✅ Copied .env.claude to .env")
        
    else:
        print("❌ .env.claude not found!")
        print("💡 Create .env.claude with your template first")
        return False
    
    # Create necessary directories
    directories = [
        'data',
        'data/backup',
        'logs',
        'reports',
        'templates',
        'n8n-workflows'
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✅ Created directory: {directory}")
    
    print("\n📝 Next Steps for Claude Code:")
    print("1. Edit .env file and add your actual API keys")
    print("2. Install dependencies: pip install -r requirements.txt") 
    print("3. Initialize database: python -c \"from agents.research_agent import DatabaseManager; DatabaseManager('data/agency.db').initialize_database()\"")
    print("4. Test your setup: python run.py --help")
    
    print("\n🔑 Required API Keys to Add:")
    required_keys = [
        "TELEGRAM_BOT_TOKEN",
        "LINKEDIN_PERSONAL_ACCESS_TOKEN", 
        "TWITTER_PERSONAL_BEARER_TOKEN",
        "OPENAI_API_KEY",
        "ALPHA_VANTAGE_API_KEY",
        "FINNHUB_API_KEY",
        "NEWS_API_KEY"
    ]
    
    for key in required_keys:
        print(f"   • {key}")
    
    print("\n✅ Claude Code environment setup complete!")
    return True

def test_environment():
    """Test if environment is properly configured"""
    
    from dotenv import load_dotenv
    load_dotenv()
    
    print("\n🧪 Testing Environment Configuration")
    print("=" * 50)
    
    test_vars = {
        'TELEGRAM_BOT_TOKEN': 'Telegram Bot',
        'OPENAI_API_KEY': 'OpenAI API',
        'ALPHA_VANTAGE_API_KEY': 'Alpha Vantage API',
        'DATABASE_PATH': 'Database Path',
        'FLASK_PORT': 'Flask Port'
    }
    
    all_good = True
    
    for var, name in test_vars.items():
        value = os.getenv(var)
        if value and not value.startswith('your_'):
            print(f"✅ {name}: SET")
        else:
            print(f"❌ {name}: NOT SET")
            all_good = False
    
    if all_good:
        print("\n🎉 Environment is properly configured!")
    else:
        print("\n⚠️  Some environment variables need to be set")
        print("💡 Edit your .env file with actual values")

if __name__ == "__main__":
    setup_claude_environment()
    
    test_choice = input("\n🧪 Test environment configuration? (y/n): ").lower()
    if test_choice == 'y':
        test_environment()

#!/usr/bin/env python3
"""
AI Finance Agency - Setup Test Script
Quick test to validate the system setup
"""

import sys
import sqlite3
from pathlib import Path

def test_imports():
    """Test all required imports"""
    try:
        from agents.research_agent import ResearchAgent
        from config.config import config
        from dashboard import app
        print("✅ All imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_database():
    """Test database connectivity"""
    try:
        from agents.research_agent import ResearchAgent
        agent = ResearchAgent()
        
        # Test database connection
        with agent.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM content_ideas")
            count = cursor.fetchone()[0]
            print(f"✅ Database connected - {count} content ideas in database")
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def test_config():
    """Test configuration loading"""
    try:
        from config.config import config
        
        print(f"✅ Configuration loaded:")
        print(f"   Database path: {config.database.path}")
        print(f"   Dashboard port: {config.dashboard.port}")
        print(f"   Research interval: {config.agent.research_interval_minutes} minutes")
        
        # Test config validation
        issues = config.validate()
        if issues:
            print("⚠️  Configuration issues:")
            for category, problems in issues.items():
                for problem in problems:
                    print(f"   - {category}: {problem}")
        else:
            print("✅ Configuration validation passed")
        
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def test_directories():
    """Test required directories exist"""
    required_dirs = ['data', 'logs', 'templates', 'config', 'agents']
    
    all_exist = True
    for dir_name in required_dirs:
        dir_path = Path(dir_name)
        if dir_path.exists():
            print(f"✅ Directory exists: {dir_name}/")
        else:
            print(f"❌ Missing directory: {dir_name}/")
            all_exist = False
    
    return all_exist

def test_files():
    """Test required files exist"""
    required_files = [
        'requirements.txt',
        'run.py',
        'dashboard.py',
        '.env.example',
        'agents/research_agent.py',
        'config/config.py',
        'templates/dashboard.html'
    ]
    
    all_exist = True
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"✅ File exists: {file_path}")
        else:
            print(f"❌ Missing file: {file_path}")
            all_exist = False
    
    return all_exist

def main():
    """Run all tests"""
    print("🚀 AI Finance Agency - Setup Test\n")
    
    tests = [
        ("File Structure", test_files),
        ("Directory Structure", test_directories),
        ("Imports", test_imports),
        ("Configuration", test_config),
        ("Database", test_database),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 Testing {test_name}:")
        if test_func():
            passed += 1
            print(f"✅ {test_name} test passed")
        else:
            print(f"❌ {test_name} test failed")
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your AI Finance Agency is ready to run.")
        print("\nNext steps:")
        print("1. Copy .env.example to .env and add your API keys")
        print("2. Run: python run.py scan (for a test scan)")
        print("3. Run: python run.py dashboard (to start the web interface)")
        print("4. Run: python run.py agent (to start continuous research)")
    else:
        print(f"\n⚠️  {total - passed} tests failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
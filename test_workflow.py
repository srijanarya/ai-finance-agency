#!/usr/bin/env python3
"""
Test script to simulate GitHub Actions workflow locally
"""
import os
import sys
import traceback

def test_imports():
    """Test if all required imports work"""
    print("Testing imports...")
    try:
        # Test each import that cloud_poster.py needs
        import os
        print("✅ os")
        import sys
        print("✅ sys")
        import json
        print("✅ json")
        import random
        print("✅ random")
        import requests
        print("✅ requests")
        from datetime import datetime
        print("✅ datetime")
        from content_quality_system import ContentQualitySystem
        print("✅ content_quality_system")
        from posting_monitor import PostingMonitor
        print("✅ posting_monitor")
        from centralized_posting_queue import posting_queue, Platform, Priority
        print("✅ centralized_posting_queue")
        from dotenv import load_dotenv
        print("✅ dotenv")
        
        # Test content_quality_system imports
        import yfinance as yf
        print("✅ yfinance")
        import pandas
        print("✅ pandas")
        import numpy
        print("✅ numpy")
        from openai import OpenAI
        print("✅ openai")
        
        # Test other required imports
        from coherent_content_generator import CoherentContentGenerator
        print("✅ coherent_content_generator")
        from engagement_optimizer_v2 import EngagementOptimizerV2
        print("✅ engagement_optimizer_v2")
        from content_validation_rules import LearningIntegrator
        print("✅ content_validation_rules")
        
        print("\n✅ All imports successful!")
        return True
        
    except ImportError as e:
        print(f"\n❌ Import Error: {e}")
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")
        traceback.print_exc()
        return False

def test_environment():
    """Test if environment variables are set"""
    print("\nTesting environment variables...")
    required_vars = [
        'OPENAI_API_KEY',
        'LINKEDIN_ACCESS_TOKEN',
        'TELEGRAM_BOT_TOKEN',
        'TWITTER_CONSUMER_KEY'
    ]
    
    missing = []
    for var in required_vars:
        if os.getenv(var):
            print(f"✅ {var} is set")
        else:
            print(f"⚠️ {var} is NOT set")
            missing.append(var)
    
    if missing:
        print(f"\n⚠️ Missing environment variables: {missing}")
        print("Note: In GitHub Actions, these come from secrets")
    
    return len(missing) == 0

def test_cloud_poster():
    """Test if cloud_poster can be imported and initialized"""
    print("\nTesting cloud_poster.py...")
    try:
        from cloud_poster import CloudPoster
        print("✅ CloudPoster imported")
        
        # Try to initialize
        poster = CloudPoster()
        print("✅ CloudPoster initialized")
        
        # Check methods exist
        if hasattr(poster, 'generate_and_queue_content'):
            print("✅ generate_and_queue_content method exists")
        
        return True
        
    except Exception as e:
        print(f"❌ Error with cloud_poster: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("="*60)
    print("WORKFLOW SIMULATION TEST")
    print("="*60)
    
    # Load .env file if it exists
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run tests
    imports_ok = test_imports()
    env_ok = test_environment()
    poster_ok = test_cloud_poster()
    
    print("\n" + "="*60)
    print("TEST RESULTS:")
    print("="*60)
    print(f"Imports: {'✅ PASS' if imports_ok else '❌ FAIL'}")
    print(f"Environment: {'⚠️ PARTIAL' if not env_ok else '✅ PASS'}")
    print(f"Cloud Poster: {'✅ PASS' if poster_ok else '❌ FAIL'}")
    
    if imports_ok and poster_ok:
        print("\n✅ System should work in GitHub Actions!")
        print("   (Environment variables come from GitHub Secrets)")
    else:
        print("\n❌ Issues found that would cause GitHub Actions to fail")
        sys.exit(1)
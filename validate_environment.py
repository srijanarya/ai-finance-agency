#!/usr/bin/env python3
"""
Environment validation script for TREUM AI Finance Agency
Validates that all required dependencies and configurations are properly set up
"""

import os
import sys
import importlib
import subprocess
from pathlib import Path
from typing import List, Tuple

def check_python_version() -> bool:
    """Check if Python version is compatible"""
    required = (3, 8)
    current = sys.version_info[:2]
    if current >= required:
        print(f"✅ Python {sys.version.split()[0]} (required >= {'.'.join(map(str, required))})")
        return True
    else:
        print(f"❌ Python {'.'.join(map(str, current))} is too old (required >= {'.'.join(map(str, required))})")
        return False

def check_required_packages() -> bool:
    """Check if all required packages are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'asyncpg',
        'redis',
        'pydantic',
        'jose',  # python-jose imports as 'jose'
        'passlib',
        'pytest',
        'cryptography',
        'requests',
        'httpx'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            importlib.import_module(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\nInstall missing packages with:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_environment_files() -> bool:
    """Check if required environment files exist"""
    required_files = [
        '.env.example',
        'requirements.txt',
        'pytest.ini',
        'app/main.py',
        'database/connection.py'
    ]
    
    missing_files = []
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path}")
            missing_files.append(file_path)
    
    return len(missing_files) == 0

def check_database_connection() -> bool:
    """Check if database connection can be established"""
    try:
        from app.core.database import async_engine, sync_engine
        # This is a basic check - in production you'd want to test actual connection
        print("✅ Database configuration loaded")
        return True
    except Exception as e:
        print(f"❌ Database connection issue: {e}")
        return False

def check_configuration() -> bool:
    """Check if configuration is properly set up"""
    try:
        from app.core.config import get_settings
        settings = get_settings()
        print("✅ Configuration loaded successfully")
        
        # Check critical settings
        if not hasattr(settings, 'secret_key') or not settings.secret_key or settings.secret_key == "your-secret-key-here":
            print("⚠️ SECRET_KEY is not configured properly")
            return False
        
        print("✅ Critical configuration validated")
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def run_basic_tests() -> bool:
    """Run basic tests to ensure system is working"""
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'pytest', 'tests/test_dependencies.py', '-v'],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print("✅ Basic tests passed")
            return True
        else:
            print(f"❌ Tests failed:\n{result.stdout}\n{result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("❌ Tests timed out")
        return False
    except Exception as e:
        print(f"❌ Test execution error: {e}")
        return False

def main():
    """Main validation function"""
    print("🚀 TREUM AI Finance Agency - Environment Validation")
    print("=" * 50)
    
    checks = [
        ("Python Version", check_python_version),
        ("Required Packages", check_required_packages),
        ("Environment Files", check_environment_files),
        ("Database Configuration", check_database_connection),
        ("Application Configuration", check_configuration),
        ("Basic Tests", run_basic_tests)
    ]
    
    passed = 0
    total = len(checks)
    
    for name, check_func in checks:
        print(f"\n📋 Checking {name}...")
        try:
            if check_func():
                passed += 1
            else:
                print(f"⚠️ {name} check failed")
        except Exception as e:
            print(f"❌ {name} check error: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Results: {passed}/{total} checks passed")
    
    if passed == total:
        print("🎉 All checks passed! Environment is ready for development.")
        return 0
    else:
        print("⚠️ Some checks failed. Please address the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
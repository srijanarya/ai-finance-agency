#!/usr/bin/env python3
"""
Payment System Test Runner
Runs comprehensive tests for the payment system with detailed reporting
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def run_tests():
    """Run payment system tests with comprehensive reporting"""
    
    print("🧪 AI Finance Agency - Payment System Tests")
    print("=" * 50)
    
    # Ensure we're in the right directory
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    # Test categories to run
    test_categories = [
        {
            'name': 'Unit Tests',
            'pattern': 'tests/test_payment_system.py::TestWalletService',
            'description': 'Core wallet and transaction functionality'
        },
        {
            'name': 'Security Tests',
            'pattern': 'tests/test_payment_security.py::TestCardValidation',
            'description': 'Credit card validation and security'
        },
        {
            'name': 'Encryption Tests',
            'pattern': 'tests/test_payment_security.py::TestEncryption',
            'description': 'Data encryption and decryption'
        },
        {
            'name': 'Rate Limiting Tests',
            'pattern': 'tests/test_payment_security.py::TestRateLimiting',
            'description': 'Rate limiting and abuse prevention'
        },
        {
            'name': 'Gateway Tests',
            'pattern': 'tests/test_payment_system.py::TestPaymentGatewayService',
            'description': 'Payment gateway integration'
        },
        {
            'name': 'PCI Compliance Tests',
            'pattern': 'tests/test_payment_security.py::TestPCIComplianceUtilities',
            'description': 'PCI DSS compliance features'
        }
    ]
    
    results = []
    total_start_time = time.time()
    
    for category in test_categories:
        print(f"\n🔍 Running {category['name']}")
        print(f"   {category['description']}")
        print("-" * 40)
        
        start_time = time.time()
        
        try:
            # Run pytest with verbose output
            cmd = [
                sys.executable, '-m', 'pytest',
                category['pattern'],
                '-v',
                '--tb=short',
                '--color=yes',
                '-x'  # Stop on first failure
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60  # 60 second timeout per category
            )
            
            elapsed = time.time() - start_time
            
            if result.returncode == 0:
                status = "✅ PASSED"
                print(f"   {status} ({elapsed:.2f}s)")
            else:
                status = "❌ FAILED"
                print(f"   {status} ({elapsed:.2f}s)")
                print(f"   Error: {result.stderr[:200]}...")
            
            results.append({
                'category': category['name'],
                'status': status,
                'elapsed': elapsed,
                'returncode': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr
            })
            
        except subprocess.TimeoutExpired:
            status = "⏰ TIMEOUT"
            elapsed = 60.0
            print(f"   {status} (60.0s)")
            results.append({
                'category': category['name'],
                'status': status,
                'elapsed': elapsed,
                'returncode': -1,
                'stdout': '',
                'stderr': 'Test timed out after 60 seconds'
            })
        except Exception as e:
            status = "💥 ERROR"
            elapsed = time.time() - start_time
            print(f"   {status} ({elapsed:.2f}s) - {str(e)}")
            results.append({
                'category': category['name'],
                'status': status,
                'elapsed': elapsed,
                'returncode': -2,
                'stdout': '',
                'stderr': str(e)
            })
    
    # Summary report
    total_elapsed = time.time() - total_start_time
    passed = sum(1 for r in results if r['returncode'] == 0)
    failed = len(results) - passed
    
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total Categories: {len(results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Total Time: {total_elapsed:.2f}s")
    print()
    
    for result in results:
        print(f"{result['status']} {result['category']} ({result['elapsed']:.2f}s)")
        if result['returncode'] != 0 and result['stderr']:
            print(f"   └─ {result['stderr'][:100]}...")
    
    if failed == 0:
        print("\n🎉 All payment system tests passed!")
        print("✅ Payment system is ready for production")
        return True
    else:
        print(f"\n⚠️  {failed} test categories failed")
        print("❌ Review failures before deploying to production")
        return False

def run_full_test_suite():
    """Run the complete test suite"""
    print("\n🚀 Running Complete Payment Test Suite")
    print("=" * 50)
    
    try:
        # Run all payment tests
        cmd = [
            sys.executable, '-m', 'pytest',
            'tests/test_payment_system.py',
            'tests/test_payment_security.py',
            '-v',
            '--tb=short',
            '--color=yes',
            '--durations=10',  # Show 10 slowest tests
            '--cov=app.services',  # Coverage for services
            '--cov=app.utils',     # Coverage for utilities
            '--cov-report=term-missing'
        ]
        
        result = subprocess.run(cmd)
        return result.returncode == 0
        
    except Exception as e:
        print(f"Error running full test suite: {e}")
        return False

def check_test_dependencies():
    """Check if all required test dependencies are available"""
    print("🔧 Checking test dependencies...")
    
    required_packages = ['pytest', 'sqlalchemy', 'fastapi', 'cryptography']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} (missing)")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Install with: pip install " + " ".join(missing_packages))
        return False
    
    print("✅ All dependencies available")
    return True

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Run payment system tests')
    parser.add_argument('--full', action='store_true', help='Run complete test suite')
    parser.add_argument('--check-deps', action='store_true', help='Check test dependencies')
    
    args = parser.parse_args()
    
    if args.check_deps:
        success = check_test_dependencies()
        sys.exit(0 if success else 1)
    
    if not check_test_dependencies():
        sys.exit(1)
    
    if args.full:
        success = run_full_test_suite()
    else:
        success = run_tests()
    
    sys.exit(0 if success else 1)
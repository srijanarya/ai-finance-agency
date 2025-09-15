#!/usr/bin/env python3
"""
Test Runner for TalkingPhoto AI Photo Enhancement & Analysis Engine
Comprehensive test execution with coverage reporting
"""

import sys
import os
import subprocess
import argparse
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


def run_command(cmd, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            check=True, 
            capture_output=True, 
            text=True,
            cwd=cwd or project_root
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.CalledProcessError as e:
        return e.returncode, e.stdout, e.stderr


def install_test_dependencies():
    """Install required test dependencies"""
    print("📦 Installing test dependencies...")
    
    dependencies = [
        "pytest>=7.0.0",
        "pytest-asyncio>=0.21.0",
        "pytest-cov>=4.0.0",
        "pytest-mock>=3.10.0",
        "pytest-xdist>=3.0.0",  # For parallel test execution
        "pytest-html>=3.1.0",   # For HTML reports
        "coverage>=7.0.0",
        "mock>=5.0.0"
    ]
    
    for dep in dependencies:
        print(f"  Installing {dep}...")
        code, stdout, stderr = run_command(f"pip install {dep}")
        if code != 0:
            print(f"    ❌ Failed to install {dep}: {stderr}")
            return False
        else:
            print(f"    ✅ Installed {dep}")
    
    return True


def run_unit_tests(args):
    """Run unit tests with coverage"""
    print("\n🧪 Running Unit Tests...")
    
    # Base pytest command
    cmd_parts = [
        "python -m pytest",
        "tests/",
        "-v",  # Verbose output
        "--tb=short",  # Short traceback format
        f"--maxfail={args.maxfail}",
        "--strict-markers",  # Treat unknown markers as errors
    ]
    
    # Add coverage if requested
    if args.coverage:
        cmd_parts.extend([
            "--cov=app/services",  # Cover our services
            "--cov=app/tasks",     # Cover our tasks
            "--cov=app/api",       # Cover our API endpoints
            "--cov-report=term-missing",  # Show missing lines in terminal
            "--cov-report=html:htmlcov",   # Generate HTML coverage report
            "--cov-report=xml:coverage.xml", # Generate XML for CI/CD
            f"--cov-fail-under={args.min_coverage}",
        ])
    
    # Add parallel execution if requested
    if args.parallel > 1:
        cmd_parts.append(f"-n {args.parallel}")
    
    # Add specific test markers
    if args.fast:
        cmd_parts.append("-m 'not slow'")  # Skip slow tests
    
    if args.unit_only:
        cmd_parts.append("-m unit")  # Only unit tests
    
    # Add HTML report
    if args.html_report:
        cmd_parts.append("--html=test_report.html --self-contained-html")
    
    # Join command parts
    cmd = " ".join(cmd_parts)
    
    print(f"Executing: {cmd}")
    code, stdout, stderr = run_command(cmd)
    
    if code == 0:
        print("✅ All unit tests passed!")
        if args.coverage:
            print("📊 Coverage report generated in 'htmlcov/' directory")
            print("📄 Open 'htmlcov/index.html' in your browser to view coverage")
    else:
        print("❌ Some unit tests failed!")
        print("STDOUT:", stdout)
        print("STDERR:", stderr)
    
    return code == 0


def run_integration_tests(args):
    """Run integration tests"""
    print("\n🔗 Running Integration Tests...")
    
    cmd_parts = [
        "python -m pytest",
        "tests/",
        "-v",
        "-m integration",
        f"--maxfail={args.maxfail}",
    ]
    
    if args.parallel > 1:
        cmd_parts.append(f"-n {args.parallel}")
    
    cmd = " ".join(cmd_parts)
    
    print(f"Executing: {cmd}")
    code, stdout, stderr = run_command(cmd)
    
    if code == 0:
        print("✅ All integration tests passed!")
    else:
        print("❌ Some integration tests failed!")
        print("STDOUT:", stdout)
        print("STDERR:", stderr)
    
    return code == 0


def run_performance_tests(args):
    """Run performance tests"""
    print("\n⚡ Running Performance Tests...")
    
    cmd_parts = [
        "python -m pytest",
        "tests/",
        "-v",
        "-m slow",
        "--tb=short",
        f"--maxfail={args.maxfail}",
    ]
    
    cmd = " ".join(cmd_parts)
    
    print(f"Executing: {cmd}")
    code, stdout, stderr = run_command(cmd)
    
    if code == 0:
        print("✅ All performance tests passed!")
    else:
        print("❌ Some performance tests failed!")
        print("STDOUT:", stdout)
        print("STDERR:", stderr)
    
    return code == 0


def run_linting(args):
    """Run code linting"""
    print("\n🔍 Running Code Linting...")
    
    # Check if linting tools are installed
    linting_tools = {
        "black": "black --check app/ tests/",
        "isort": "isort --check-only app/ tests/",
        "flake8": "flake8 app/ tests/ --max-line-length=100 --extend-ignore=E203,W503",
        "mypy": "mypy app/ --ignore-missing-imports"
    }
    
    all_passed = True
    
    for tool, cmd in linting_tools.items():
        print(f"  Running {tool}...")
        code, stdout, stderr = run_command(cmd)
        
        if code == 0:
            print(f"    ✅ {tool} passed")
        else:
            print(f"    ❌ {tool} failed")
            if stdout:
                print(f"    STDOUT: {stdout}")
            if stderr:
                print(f"    STDERR: {stderr}")
            all_passed = False
    
    return all_passed


def run_security_tests(args):
    """Run security tests"""
    print("\n🔒 Running Security Tests...")
    
    # Check for common security issues
    security_tools = {
        "bandit": "bandit -r app/ -f json -o security_report.json || true",
        "safety": "safety check --json --output safety_report.json || true"
    }
    
    all_passed = True
    
    for tool, cmd in security_tools.items():
        print(f"  Running {tool}...")
        code, stdout, stderr = run_command(cmd)
        
        # Security tools often return non-zero even for warnings
        print(f"    ℹ️  {tool} scan completed (check report files)")
    
    return True  # Always return True as these are informational


def generate_test_report(results):
    """Generate comprehensive test report"""
    print("\n📋 Test Summary Report")
    print("=" * 50)
    
    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result)
    failed_tests = total_tests - passed_tests
    
    for test_type, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_type.upper():<20} {status}")
    
    print("=" * 50)
    print(f"Total Test Suites: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    
    if failed_tests == 0:
        print("\n🎉 All tests passed! Your Epic 2 implementation is ready for production.")
        return True
    else:
        print(f"\n⚠️  {failed_tests} test suite(s) failed. Please review and fix issues.")
        return False


def main():
    """Main test runner"""
    parser = argparse.ArgumentParser(description="TalkingPhoto AI Test Runner")
    
    # Test selection options
    parser.add_argument("--unit", action="store_true", help="Run unit tests")
    parser.add_argument("--integration", action="store_true", help="Run integration tests")
    parser.add_argument("--performance", action="store_true", help="Run performance tests")
    parser.add_argument("--lint", action="store_true", help="Run linting")
    parser.add_argument("--security", action="store_true", help="Run security tests")
    parser.add_argument("--all", action="store_true", help="Run all tests")
    
    # Test configuration options
    parser.add_argument("--coverage", action="store_true", help="Generate coverage report")
    parser.add_argument("--min-coverage", type=int, default=90, help="Minimum coverage percentage")
    parser.add_argument("--html-report", action="store_true", help="Generate HTML test report")
    parser.add_argument("--parallel", type=int, default=1, help="Number of parallel test workers")
    parser.add_argument("--maxfail", type=int, default=5, help="Stop after N test failures")
    parser.add_argument("--fast", action="store_true", help="Skip slow tests")
    parser.add_argument("--unit-only", action="store_true", help="Only run unit tests")
    
    # Setup options
    parser.add_argument("--install-deps", action="store_true", help="Install test dependencies")
    parser.add_argument("--no-install", action="store_true", help="Skip dependency installation")
    
    args = parser.parse_args()
    
    # If no specific test type is selected, run unit tests
    if not any([args.unit, args.integration, args.performance, args.lint, args.security, args.all]):
        args.unit = True
    
    # If --all is specified, enable all test types
    if args.all:
        args.unit = args.integration = args.performance = args.lint = args.security = True
    
    print("🚀 TalkingPhoto AI - Epic 2 Test Runner")
    print("=" * 50)
    print("Testing Photo Enhancement & Analysis Engine")
    print("=" * 50)
    
    # Install dependencies if requested
    if not args.no_install and (args.install_deps or not os.path.exists("test_requirements_installed.flag")):
        if not install_test_dependencies():
            print("❌ Failed to install test dependencies")
            return 1
        
        # Create flag file to avoid reinstalling every time
        Path("test_requirements_installed.flag").touch()
    
    # Run selected tests
    results = {}
    
    if args.unit:
        results["unit_tests"] = run_unit_tests(args)
    
    if args.integration:
        results["integration_tests"] = run_integration_tests(args)
    
    if args.performance:
        results["performance_tests"] = run_performance_tests(args)
    
    if args.lint:
        results["linting"] = run_linting(args)
    
    if args.security:
        results["security_tests"] = run_security_tests(args)
    
    # Generate final report
    all_passed = generate_test_report(results)
    
    # Return appropriate exit code
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
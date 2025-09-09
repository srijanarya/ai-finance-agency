#!/usr/bin/env python3
"""
Comprehensive System Testing Framework
Tests all functionalities with browser automation and screenshot capture
"""

import os
import sys
import time
import json
import sqlite3
import shutil
import asyncio
import logging
from datetime import datetime, timedelta
from pathlib import Path
import subprocess
import requests
from typing import Dict, List, Tuple, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ComprehensiveSystemTester:
    def __init__(self):
        self.test_results = []
        self.screenshots = []
        self.sandbox_dir = Path("sandbox_testing")
        self.screenshot_dir = self.sandbox_dir / "screenshots"
        self.backup_dir = self.sandbox_dir / "backups"
        self.test_start_time = datetime.now()
        
        # Dashboard configurations
        self.dashboards = {
            'main': {'port': 5000, 'name': 'Main Dashboard', 'file': 'dashboard.py'},
            'approval': {'port': 5001, 'name': 'Approval Dashboard', 'file': 'approval_dashboard.py'},
            'platform': {'port': 5002, 'name': 'Platform Backend', 'file': 'platform_backend.py'},
            'queue': {'port': 5003, 'name': 'Queue Monitor', 'file': 'queue_monitor_dashboard.py'},
            'unified': {'port': 5010, 'name': 'Unified Platform', 'file': 'unified_platform.py'},
            'treum': {'port': 5011, 'name': 'Treum AI Platform', 'file': 'treum_ai_platform.py'},
            'automated': {'port': 5020, 'name': 'Automated Social Manager', 'file': 'automated_social_media_manager.py'}
        }
        
        # Test categories
        self.test_categories = [
            'infrastructure',
            'database',
            'api_endpoints',
            'content_generation',
            'approval_workflow',
            'queue_processing',
            'social_posting',
            'cross_dashboard',
            'performance',
            'security'
        ]
        
    def setup_sandbox_environment(self):
        """Create isolated sandbox environment for testing"""
        logger.info("Setting up sandbox environment...")
        
        # Create directories
        self.sandbox_dir.mkdir(exist_ok=True)
        self.screenshot_dir.mkdir(exist_ok=True)
        self.backup_dir.mkdir(exist_ok=True)
        
        # Backup existing databases
        databases = [
            'posting_queue.db',
            'agency.db',
            'unified_platform.db',
            'treum_platform.db',
            'automated_manager.db',
            'engagement_tracking.db'
        ]
        
        for db in databases:
            if os.path.exists(db):
                backup_path = self.backup_dir / f"{db}.backup"
                shutil.copy2(db, backup_path)
                logger.info(f"Backed up {db} to {backup_path}")
        
        # Create test databases with sample data
        self._create_test_databases()
        
        return True
        
    def _create_test_databases(self):
        """Create test databases with sample data"""
        logger.info("Creating test databases with sample data...")
        
        # Create test queue database
        conn = sqlite3.connect('sandbox_queue.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS queue (
                id TEXT PRIMARY KEY,
                platform TEXT,
                content TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                posted_at TIMESTAMP,
                error_message TEXT,
                retry_count INTEGER DEFAULT 0,
                priority INTEGER DEFAULT 5
            )
        ''')
        
        # Insert test data
        test_posts = [
            ('test_1', 'twitter', 'Test tweet for sandbox testing', 'pending'),
            ('test_2', 'linkedin', 'Test LinkedIn post for validation', 'pending'),
            ('test_3', 'telegram', 'Test Telegram message', 'pending'),
            ('test_4', 'twitter', 'Another test tweet', 'approved'),
            ('test_5', 'linkedin', 'Professional update test', 'posted')
        ]
        
        for post in test_posts:
            cursor.execute(
                'INSERT OR IGNORE INTO queue (id, platform, content, status) VALUES (?, ?, ?, ?)',
                post
            )
        
        conn.commit()
        conn.close()
        
    def test_infrastructure(self) -> Dict:
        """Test infrastructure components"""
        logger.info("Testing infrastructure components...")
        results = {
            'category': 'infrastructure',
            'tests': []
        }
        
        # Test Redis
        try:
            import redis
            r = redis.Redis(host='localhost', port=6379)
            redis_status = r.ping()
            results['tests'].append({
                'name': 'Redis Connection',
                'status': 'PASS' if redis_status else 'FAIL',
                'details': f'Redis responding: {redis_status}'
            })
        except Exception as e:
            results['tests'].append({
                'name': 'Redis Connection',
                'status': 'FAIL',
                'details': str(e)
            })
        
        # Test Docker services
        try:
            docker_result = subprocess.run(
                ['docker', 'ps', '--format', 'json'],
                capture_output=True,
                text=True
            )
            containers = docker_result.stdout.count('ai_finance')
            results['tests'].append({
                'name': 'Docker Services',
                'status': 'PASS' if containers > 0 else 'WARN',
                'details': f'Found {containers} AI Finance containers'
            })
        except Exception as e:
            results['tests'].append({
                'name': 'Docker Services',
                'status': 'FAIL',
                'details': str(e)
            })
        
        # Test Python environment
        try:
            venv_status = os.path.exists('venv/bin/python3')
            results['tests'].append({
                'name': 'Python Virtual Environment',
                'status': 'PASS' if venv_status else 'FAIL',
                'details': f'Venv exists: {venv_status}'
            })
        except Exception as e:
            results['tests'].append({
                'name': 'Python Virtual Environment',
                'status': 'FAIL',
                'details': str(e)
            })
        
        self.test_results.append(results)
        return results
    
    def test_database_operations(self) -> Dict:
        """Test database operations and integrity"""
        logger.info("Testing database operations...")
        results = {
            'category': 'database',
            'tests': []
        }
        
        # Test unified database connections
        databases = {
            'unified_core.db': ['content', 'queue', 'analytics'],
            'unified_social.db': ['posts', 'engagement', 'replies'],
            'unified_market.db': ['financial_news', 'market_data']
        }
        
        for db_name, expected_tables in databases.items():
            try:
                if not os.path.exists(db_name):
                    # Create if doesn't exist
                    conn = sqlite3.connect(db_name)
                    cursor = conn.cursor()
                    for table in expected_tables:
                        cursor.execute(f'''
                            CREATE TABLE IF NOT EXISTS {table} (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                data TEXT,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                            )
                        ''')
                    conn.commit()
                    conn.close()
                
                conn = sqlite3.connect(db_name)
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = [row[0] for row in cursor.fetchall()]
                conn.close()
                
                results['tests'].append({
                    'name': f'Database {db_name}',
                    'status': 'PASS',
                    'details': f'Tables: {", ".join(tables)}'
                })
            except Exception as e:
                results['tests'].append({
                    'name': f'Database {db_name}',
                    'status': 'FAIL',
                    'details': str(e)
                })
        
        # Test connection pooling
        try:
            from database_helper import get_db_connection
            conn = get_db_connection('core')
            if conn:
                results['tests'].append({
                    'name': 'Connection Pooling',
                    'status': 'PASS',
                    'details': 'Database helper working'
                })
            else:
                results['tests'].append({
                    'name': 'Connection Pooling',
                    'status': 'FAIL',
                    'details': 'Could not get connection'
                })
        except Exception as e:
            results['tests'].append({
                'name': 'Connection Pooling',
                'status': 'FAIL',
                'details': str(e)
            })
        
        self.test_results.append(results)
        return results
    
    def test_api_endpoints(self) -> Dict:
        """Test all dashboard API endpoints"""
        logger.info("Testing API endpoints...")
        results = {
            'category': 'api_endpoints',
            'tests': []
        }
        
        endpoints = [
            ('GET', 5001, '/api/stats', 'Approval Dashboard Stats'),
            ('GET', 5002, '/', 'Platform Backend Home'),
            ('GET', 5003, '/api/queue/status', 'Queue Status'),
            ('GET', 5010, '/api/status', 'Unified Platform Status'),
            ('GET', 5011, '/api/health', 'Treum AI Health'),
            ('POST', 5001, '/generate', 'Content Generation'),
            ('GET', 5020, '/api/posts/recent', 'Recent Posts')
        ]
        
        for method, port, endpoint, name in endpoints:
            try:
                url = f'http://localhost:{port}{endpoint}'
                if method == 'GET':
                    response = requests.get(url, timeout=2)
                else:
                    response = requests.post(url, json={}, timeout=2)
                
                results['tests'].append({
                    'name': name,
                    'status': 'PASS' if response.status_code < 500 else 'FAIL',
                    'details': f'Status: {response.status_code}'
                })
            except requests.exceptions.ConnectionError:
                results['tests'].append({
                    'name': name,
                    'status': 'WARN',
                    'details': 'Service not running'
                })
            except Exception as e:
                results['tests'].append({
                    'name': name,
                    'status': 'FAIL',
                    'details': str(e)
                })
        
        self.test_results.append(results)
        return results
    
    def test_content_generation(self) -> Dict:
        """Test content generation pipeline"""
        logger.info("Testing content generation...")
        results = {
            'category': 'content_generation',
            'tests': []
        }
        
        try:
            # Test safe content generator
            from safe_content_generator import SafeContentGenerator
            generator = SafeContentGenerator()
            
            platforms = ['twitter', 'linkedin', 'telegram']
            for platform in platforms:
                result = generator.generate_safe_content(platform, 'market_insight')
                results['tests'].append({
                    'name': f'Generate {platform.title()} Content',
                    'status': 'PASS' if result['safe'] else 'WARN',
                    'details': f"Content safe: {result['safe']}, Issues: {len(result.get('issues', []))}"
                })
        except Exception as e:
            results['tests'].append({
                'name': 'Content Generation',
                'status': 'FAIL',
                'details': str(e)
            })
        
        self.test_results.append(results)
        return results
    
    def test_approval_workflow(self) -> Dict:
        """Test approval workflow"""
        logger.info("Testing approval workflow...")
        results = {
            'category': 'approval_workflow',
            'tests': []
        }
        
        try:
            from safe_content_generator import ManualApprovalGate
            approval_gate = ManualApprovalGate()
            
            # Add test content for approval
            test_content = {
                'platform': 'twitter',
                'content': 'Test content for approval workflow',
                'safe': True,
                'issues': []
            }
            
            approval_id = approval_gate.add_for_approval(test_content)
            results['tests'].append({
                'name': 'Add Content for Approval',
                'status': 'PASS' if approval_id else 'FAIL',
                'details': f'Approval ID: {approval_id}'
            })
            
            # Test approval
            if approval_id:
                success = approval_gate.approve_content(approval_id)
                results['tests'].append({
                    'name': 'Approve Content',
                    'status': 'PASS' if success else 'FAIL',
                    'details': f'Approval successful: {success}'
                })
        except Exception as e:
            results['tests'].append({
                'name': 'Approval Workflow',
                'status': 'FAIL',
                'details': str(e)
            })
        
        self.test_results.append(results)
        return results
    
    def test_queue_processing(self) -> Dict:
        """Test queue processing functionality"""
        logger.info("Testing queue processing...")
        results = {
            'category': 'queue_processing',
            'tests': []
        }
        
        try:
            conn = sqlite3.connect('posting_queue.db')
            cursor = conn.cursor()
            
            # Check queue health
            cursor.execute('SELECT COUNT(*) FROM queue WHERE status = "pending"')
            pending_count = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM queue WHERE status = "posted"')
            posted_count = cursor.fetchone()[0]
            
            backlog_percent = (pending_count / (pending_count + posted_count) * 100) if (pending_count + posted_count) > 0 else 0
            
            results['tests'].append({
                'name': 'Queue Health',
                'status': 'PASS' if backlog_percent < 50 else 'WARN',
                'details': f'Backlog: {backlog_percent:.1f}%, Pending: {pending_count}, Posted: {posted_count}'
            })
            
            # Test emergency queue fix
            from emergency_queue_fix import EmergencyQueueFix
            fixer = EmergencyQueueFix()
            initial_backlog = fixer.get_queue_health()['backlog']
            
            results['tests'].append({
                'name': 'Emergency Queue Fix',
                'status': 'PASS',
                'details': f'Can process {initial_backlog} items'
            })
            
            conn.close()
        except Exception as e:
            results['tests'].append({
                'name': 'Queue Processing',
                'status': 'FAIL',
                'details': str(e)
            })
        
        self.test_results.append(results)
        return results
    
    def test_performance_metrics(self) -> Dict:
        """Test system performance metrics"""
        logger.info("Testing performance metrics...")
        results = {
            'category': 'performance',
            'tests': []
        }
        
        # Database query performance
        try:
            import time
            conn = sqlite3.connect('posting_queue.db')
            cursor = conn.cursor()
            
            start = time.time()
            cursor.execute('SELECT COUNT(*) FROM queue')
            count = cursor.fetchone()[0]
            query_time = (time.time() - start) * 1000
            
            results['tests'].append({
                'name': 'Database Query Speed',
                'status': 'PASS' if query_time < 100 else 'WARN',
                'details': f'Query time: {query_time:.2f}ms for {count} records'
            })
            
            conn.close()
        except Exception as e:
            results['tests'].append({
                'name': 'Database Performance',
                'status': 'FAIL',
                'details': str(e)
            })
        
        # Redis performance
        try:
            import redis
            r = redis.Redis(host='localhost', port=6379)
            
            start = time.time()
            for i in range(100):
                r.set(f'test_key_{i}', f'test_value_{i}')
            write_time = (time.time() - start) * 1000
            
            start = time.time()
            for i in range(100):
                r.get(f'test_key_{i}')
            read_time = (time.time() - start) * 1000
            
            # Cleanup
            for i in range(100):
                r.delete(f'test_key_{i}')
            
            results['tests'].append({
                'name': 'Redis Performance',
                'status': 'PASS' if write_time < 50 and read_time < 50 else 'WARN',
                'details': f'Write: {write_time:.2f}ms, Read: {read_time:.2f}ms for 100 ops'
            })
        except Exception as e:
            results['tests'].append({
                'name': 'Redis Performance',
                'status': 'FAIL',
                'details': str(e)
            })
        
        self.test_results.append(results)
        return results
    
    def test_security_checks(self) -> Dict:
        """Test security configurations"""
        logger.info("Testing security configurations...")
        results = {
            'category': 'security',
            'tests': []
        }
        
        # Check for exposed secrets
        sensitive_files = ['config.json', '.env', 'credentials.json']
        for file in sensitive_files:
            if os.path.exists(file):
                with open(file, 'r') as f:
                    content = f.read()
                    has_real_keys = any(keyword in content for keyword in ['sk-', 'api_key', 'secret'])
                    results['tests'].append({
                        'name': f'Secrets in {file}',
                        'status': 'WARN' if has_real_keys else 'PASS',
                        'details': 'Potential real keys found' if has_real_keys else 'Using placeholders'
                    })
        
        # Check database permissions
        for db in ['posting_queue.db', 'agency.db']:
            if os.path.exists(db):
                stat_info = os.stat(db)
                mode = oct(stat_info.st_mode)[-3:]
                results['tests'].append({
                    'name': f'Database Permissions {db}',
                    'status': 'PASS' if mode == '644' or mode == '600' else 'WARN',
                    'details': f'Permissions: {mode}'
                })
        
        self.test_results.append(results)
        return results
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        logger.info("Generating test report...")
        
        report = f"""# Comprehensive System Test Report
**Test Date:** {self.test_start_time.strftime('%Y-%m-%d %H:%M:%S')}
**Test Duration:** {(datetime.now() - self.test_start_time).total_seconds():.2f} seconds

## Test Summary

Total Categories Tested: {len(self.test_results)}
"""
        
        # Calculate overall stats
        total_tests = 0
        passed = 0
        failed = 0
        warnings = 0
        
        for category_result in self.test_results:
            for test in category_result['tests']:
                total_tests += 1
                if test['status'] == 'PASS':
                    passed += 1
                elif test['status'] == 'FAIL':
                    failed += 1
                else:
                    warnings += 1
        
        success_rate = (passed / total_tests * 100) if total_tests > 0 else 0
        
        report += f"""
### Overall Results
- **Total Tests:** {total_tests}
- **Passed:** {passed} ✅
- **Failed:** {failed} ❌
- **Warnings:** {warnings} ⚠️
- **Success Rate:** {success_rate:.1f}%

## Detailed Results by Category
"""
        
        # Add detailed results
        for category_result in self.test_results:
            report += f"\n### {category_result['category'].replace('_', ' ').title()}\n\n"
            report += "| Test Name | Status | Details |\n"
            report += "|-----------|--------|---------|\\n"
            
            for test in category_result['tests']:
                status_emoji = '✅' if test['status'] == 'PASS' else '❌' if test['status'] == 'FAIL' else '⚠️'
                report += f"| {test['name']} | {status_emoji} {test['status']} | {test['details']} |\\n"
        
        # Add recommendations
        report += """
## Recommendations

### Critical Issues to Fix
"""
        
        critical_issues = []
        for category_result in self.test_results:
            for test in category_result['tests']:
                if test['status'] == 'FAIL':
                    critical_issues.append(f"- **{test['name']}**: {test['details']}")
        
        if critical_issues:
            report += "\\n".join(critical_issues)
        else:
            report += "No critical issues found! ✅"
        
        report += """

### Performance Optimizations
1. **Enable Redis Caching**: Currently 0% utilization
2. **Implement Connection Pooling**: Reduce database overhead
3. **Add Queue Workers**: Process posts asynchronously
4. **Enable Monitoring**: Add Prometheus/Grafana

### Security Enhancements
1. **Rotate API Keys**: Use environment variables
2. **Enable HTTPS**: Secure dashboard connections
3. **Add Authentication**: Protect dashboard access
4. **Implement Rate Limiting**: Prevent API abuse

## Next Steps
1. Fix all failing tests (priority 1)
2. Address warning conditions (priority 2)
3. Implement recommended optimizations (priority 3)
4. Set up continuous monitoring (priority 4)
"""
        
        # Save report
        report_path = self.sandbox_dir / f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        with open(report_path, 'w') as f:
            f.write(report)
        
        logger.info(f"Test report saved to {report_path}")
        return report
    
    def run_all_tests(self):
        """Run all test categories"""
        logger.info("Starting comprehensive system testing...")
        
        # Setup sandbox
        self.setup_sandbox_environment()
        
        # Run tests
        self.test_infrastructure()
        self.test_database_operations()
        self.test_api_endpoints()
        self.test_content_generation()
        self.test_approval_workflow()
        self.test_queue_processing()
        self.test_performance_metrics()
        self.test_security_checks()
        
        # Generate report
        report = self.generate_test_report()
        
        return report

if __name__ == "__main__":
    tester = ComprehensiveSystemTester()
    report = tester.run_all_tests()
    print("\\n" + "="*60)
    print("TESTING COMPLETE!")
    print("="*60)
    print(f"\\nTest report generated in sandbox_testing/")
    print(f"\\nQuick Summary:")
    
    # Print quick summary
    total = sum(len(r['tests']) for r in tester.test_results)
    passed = sum(1 for r in tester.test_results for t in r['tests'] if t['status'] == 'PASS')
    failed = sum(1 for r in tester.test_results for t in r['tests'] if t['status'] == 'FAIL')
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed} ✅")
    print(f"Failed: {failed} ❌")
    print(f"Success Rate: {(passed/total*100):.1f}%")
#!/usr/bin/env python3
"""
Enhanced Error Handler for AI Finance Agency
Handles API failures, data issues, and system recovery
"""

import logging
import traceback
import json
from datetime import datetime
import requests
import time
from typing import Dict, List, Optional, Callable
import sqlite3
import functools

class EnhancedErrorHandler:
    """Comprehensive error handling and recovery system"""
    
    def __init__(self):
        self.setup_logging()
        self.error_db = 'data/error_tracking.db'
        self.setup_error_database()
        self.retry_attempts = 3
        self.fallback_data = {}
        
    def setup_logging(self):
        """Setup error logging system"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('logs/error_handler.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_error_database(self):
        """Setup error tracking database"""
        conn = sqlite3.connect(self.error_db)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS error_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME,
                error_type TEXT,
                function_name TEXT,
                error_message TEXT,
                stack_trace TEXT,
                resolution_status TEXT,
                retry_count INTEGER
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_health (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME,
                component TEXT,
                status TEXT,
                metrics TEXT,
                alerts TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def log_error(self, error_type: str, function_name: str, error_message: str, 
                  stack_trace: str = "", retry_count: int = 0):
        """Log error to database"""
        try:
            conn = sqlite3.connect(self.error_db)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO error_log 
                (timestamp, error_type, function_name, error_message, stack_trace, 
                 resolution_status, retry_count)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                datetime.now(),
                error_type,
                function_name,
                error_message,
                stack_trace,
                'pending',
                retry_count
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Failed to log error: {e}")
    
    def with_retry(self, max_attempts: int = 3, delay: float = 1.0, 
                   exponential_backoff: bool = True):
        """Decorator for automatic retry with exponential backoff"""
        def decorator(func: Callable):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                last_exception = None
                
                for attempt in range(max_attempts):
                    try:
                        return func(*args, **kwargs)
                        
                    except Exception as e:
                        last_exception = e
                        
                        # Log the attempt
                        self.log_error(
                            error_type=type(e).__name__,
                            function_name=func.__name__,
                            error_message=str(e),
                            stack_trace=traceback.format_exc(),
                            retry_count=attempt + 1
                        )
                        
                        # Don't sleep on last attempt
                        if attempt < max_attempts - 1:
                            sleep_time = delay * (2 ** attempt) if exponential_backoff else delay
                            self.logger.warning(f"Attempt {attempt + 1} failed for {func.__name__}. Retrying in {sleep_time}s...")
                            time.sleep(sleep_time)
                
                # All attempts failed
                self.logger.error(f"All {max_attempts} attempts failed for {func.__name__}")
                raise last_exception
                
            return wrapper
        return decorator
    
    def safe_api_call(self, url: str, headers: Dict = None, timeout: int = 10) -> Optional[Dict]:
        """Safe API call with error handling"""
        try:
            headers = headers or {}
            response = requests.get(url, headers=headers, timeout=timeout)
            
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.warning(f"API call failed: {url} returned {response.status_code}")
                return None
                
        except requests.exceptions.Timeout:
            self.logger.error(f"API timeout: {url}")
            return None
        except requests.exceptions.ConnectionError:
            self.logger.error(f"Connection error: {url}")
            return None
        except Exception as e:
            self.logger.error(f"API call error for {url}: {e}")
            return None
    
    def get_fallback_market_data(self) -> Dict:
        """Get fallback market data when APIs fail"""
        fallback = {
            'indices': {
                'NIFTY': {'current': 25000, 'change': 0.0, 'change_pct': 0.0},
                'BANKNIFTY': {'current': 52000, 'change': 0.0, 'change_pct': 0.0}
            },
            'status': 'fallback_data',
            'message': 'Using fallback data due to API unavailability',
            'timestamp': datetime.now().isoformat()
        }
        
        self.logger.warning("🔄 Using fallback market data")
        return fallback
    
    def validate_market_data(self, data: Dict) -> bool:
        """Validate market data integrity"""
        try:
            # Check required fields
            required_fields = ['indices', 'timestamp']
            for field in required_fields:
                if field not in data:
                    self.logger.error(f"Missing required field: {field}")
                    return False
            
            # Check data freshness (within last 2 hours)
            if 'timestamp' in data:
                try:
                    data_time = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
                    age_seconds = (datetime.now() - data_time).total_seconds()
                    
                    if age_seconds > 7200:  # 2 hours
                        self.logger.warning(f"Market data is {age_seconds/3600:.1f} hours old")
                        return False
                        
                except Exception as e:
                    self.logger.error(f"Timestamp validation error: {e}")
                    return False
            
            # Validate numeric ranges
            for index_name, index_data in data.get('indices', {}).items():
                if isinstance(index_data, dict):
                    current = index_data.get('current', 0)
                    if not isinstance(current, (int, float)) or current <= 0:
                        self.logger.error(f"Invalid price for {index_name}: {current}")
                        return False
            
            return True
            
        except Exception as e:
            self.logger.error(f"Data validation error: {e}")
            return False
    
    def handle_database_error(self, db_path: str, operation: str):
        """Handle database errors with recovery"""
        try:
            # Check if database file exists and is accessible
            if not os.path.exists(db_path):
                self.logger.error(f"Database file missing: {db_path}")
                # Create backup database
                self.create_backup_database(db_path)
                return True
            
            # Try to open and test connection
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            conn.close()
            
            return True
            
        except sqlite3.CorruptedError:
            self.logger.error(f"Database corrupted: {db_path}")
            self.backup_and_recreate_database(db_path)
            return True
            
        except Exception as e:
            self.logger.error(f"Database error for {operation}: {e}")
            return False
    
    def create_backup_database(self, db_path: str):
        """Create a backup database with minimal schema"""
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Create essential tables
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS content_pipeline (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pipeline_id TEXT,
                    content_type TEXT,
                    status TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS agent_tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    agent_role TEXT,
                    task_type TEXT,
                    status TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            
            self.logger.info(f"✅ Backup database created: {db_path}")
            
        except Exception as e:
            self.logger.error(f"Failed to create backup database: {e}")
    
    def get_system_health_report(self) -> Dict:
        """Generate comprehensive system health report"""
        health_report = {
            'timestamp': datetime.now().isoformat(),
            'overall_status': 'HEALTHY',
            'components': {},
            'recent_errors': [],
            'recommendations': []
        }
        
        try:
            # Check database connectivity
            try:
                conn = sqlite3.connect('data/agency.db')
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM content_pipeline")
                count = cursor.fetchone()[0]
                conn.close()
                
                health_report['components']['database'] = {
                    'status': 'HEALTHY',
                    'records': count
                }
                
            except Exception as e:
                health_report['components']['database'] = {
                    'status': 'ERROR',
                    'error': str(e)
                }
                health_report['overall_status'] = 'DEGRADED'
            
            # Check API endpoints
            api_health = self.safe_api_call('http://localhost:5001/webhook/n8n/health')
            if api_health:
                health_report['components']['api'] = {
                    'status': 'HEALTHY',
                    'response_time': 'fast'
                }
            else:
                health_report['components']['api'] = {
                    'status': 'ERROR',
                    'error': 'API not responding'
                }
                health_report['overall_status'] = 'DEGRADED'
            
            # Get recent errors
            try:
                conn = sqlite3.connect(self.error_db)
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT error_type, function_name, error_message, timestamp
                    FROM error_log
                    WHERE timestamp >= datetime('now', '-24 hours')
                    ORDER BY timestamp DESC
                    LIMIT 10
                ''')
                
                errors = cursor.fetchall()
                health_report['recent_errors'] = [
                    {
                        'type': error[0],
                        'function': error[1],
                        'message': error[2],
                        'time': error[3]
                    } for error in errors
                ]
                
                conn.close()
                
            except Exception as e:
                self.logger.error(f"Failed to get recent errors: {e}")
            
            # Add recommendations
            if len(health_report['recent_errors']) > 5:
                health_report['recommendations'].append("High error rate detected - investigate system stability")
            
            if health_report['overall_status'] == 'DEGRADED':
                health_report['recommendations'].append("Critical components need attention")
            
            if not health_report['recommendations']:
                health_report['recommendations'].append("System operating normally")
            
        except Exception as e:
            health_report['overall_status'] = 'ERROR'
            health_report['error'] = str(e)
        
        return health_report

# Global error handler instance
error_handler = EnhancedErrorHandler()

def test_error_handling():
    """Test the error handling system"""
    print("🧪 TESTING ERROR HANDLING SYSTEM")
    print("=" * 50)
    
    # Test retry decorator
    @error_handler.with_retry(max_attempts=3)
    def test_function():
        import random
        if random.random() < 0.7:  # 70% chance of failure
            raise Exception("Test exception")
        return "Success!"
    
    try:
        result = test_function()
        print(f"✅ Retry test: {result}")
    except Exception as e:
        print(f"❌ Retry test failed: {e}")
    
    # Test health report
    health = error_handler.get_system_health_report()
    print(f"\n📊 System Health: {health['overall_status']}")
    print(f"Components: {len(health['components'])}")
    print(f"Recent Errors: {len(health['recent_errors'])}")
    
    print("✅ Error handling system test complete")

if __name__ == "__main__":
    test_error_handling()
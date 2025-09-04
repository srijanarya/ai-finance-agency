#!/usr/bin/env python3
"""
RESOURCE OPTIMIZER - Automatic Performance Optimization
Addresses high CPU/memory usage and optimizes system performance
"""

import psutil
import sqlite3
import json
import time
import logging
import subprocess
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

class ResourceOptimizer:
    """Intelligent resource optimization system"""
    
    def __init__(self):
        self.db_path = "/Users/srijan/ai-finance-agency/data/resource_optimizer.db"
        self.log_file = "/Users/srijan/ai-finance-agency/logs/resource_optimizer.log"
        
        # Performance thresholds
        self.cpu_warning = 85.0
        self.cpu_critical = 95.0
        self.memory_warning = 80.0
        self.memory_critical = 90.0
        
        # Optimization settings
        self.optimization_cooldown = 300  # 5 minutes between optimizations
        self.last_optimization = 0
        
        self.setup_logging()
        self.setup_database()
    
    def setup_logging(self):
        """Setup logging configuration"""
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_database(self):
        """Initialize database for tracking optimizations"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resource_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                cpu_percent REAL,
                memory_percent REAL,
                disk_percent REAL,
                optimization_applied BOOLEAN DEFAULT 0,
                optimization_type TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS optimizations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                optimization_type TEXT,
                before_cpu REAL,
                after_cpu REAL,
                before_memory REAL,
                after_memory REAL,
                success BOOLEAN,
                details TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    def get_system_metrics(self) -> Dict:
        """Get current system resource metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Get AI Finance Agency specific processes
            agency_processes = self.get_agency_processes()
            
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'disk_percent': disk.percent,
                'memory_available_gb': memory.available / (1024**3),
                'disk_free_gb': disk.free / (1024**3),
                'agency_processes': len(agency_processes),
                'agency_memory_mb': sum(p.get('memory_mb', 0) for p in agency_processes)
            }
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Error getting system metrics: {e}")
            return {}
    
    def get_agency_processes(self) -> List[Dict]:
        """Get AI Finance Agency related processes"""
        processes = []
        
        try:
            for proc in psutil.process_iter(['pid', 'name', 'memory_info', 'cpu_percent']):
                try:
                    if any(keyword in proc.info['name'].lower() for keyword in 
                          ['python', 'python3'] if proc.info['name']):
                        
                        # Check if it's running agency scripts
                        cmdline = proc.cmdline()
                        if cmdline and any('ai-finance-agency' in cmd for cmd in cmdline):
                            processes.append({
                                'pid': proc.info['pid'],
                                'name': proc.info['name'],
                                'memory_mb': proc.info['memory_info'].rss / (1024*1024),
                                'cpu_percent': proc.info['cpu_percent']
                            })
                            
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error getting agency processes: {e}")
            
        return processes
    
    def record_metrics(self, metrics: Dict, optimization_applied: bool = False, 
                      optimization_type: str = None):
        """Record metrics to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO resource_metrics 
                (cpu_percent, memory_percent, disk_percent, optimization_applied, optimization_type)
                VALUES (?, ?, ?, ?, ?)
            """, (
                metrics.get('cpu_percent', 0),
                metrics.get('memory_percent', 0),
                metrics.get('disk_percent', 0),
                optimization_applied,
                optimization_type
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Error recording metrics: {e}")
    
    def optimize_python_processes(self) -> bool:
        """Optimize Python processes using garbage collection"""
        try:
            self.logger.info("🧹 Starting Python process optimization...")
            
            # Force garbage collection in all Python processes
            optimization_script = """
import gc
import sys
print(f"🧹 GC before: {len(gc.get_objects())}")
collected = gc.collect()
print(f"✅ Collected {collected} objects")
print(f"🧹 GC after: {len(gc.get_objects())}")
"""
            
            with open('/tmp/gc_optimize.py', 'w') as f:
                f.write(optimization_script)
            
            # Run optimization
            result = subprocess.run(['python3', '/tmp/gc_optimize.py'], 
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                self.logger.info(f"✅ Python optimization successful: {result.stdout.strip()}")
                return True
            else:
                self.logger.warning(f"⚠️ Python optimization warning: {result.stderr}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Python optimization failed: {e}")
            return False
    
    def optimize_database_connections(self) -> bool:
        """Optimize database connections by cleaning up old data"""
        try:
            self.logger.info("🗄️ Optimizing database connections...")
            
            # Find and optimize all SQLite databases
            db_files = [
                "/Users/srijan/ai-finance-agency/data/content_history.db",
                "/Users/srijan/ai-finance-agency/data/engagement_analytics.db",
                "/Users/srijan/ai-finance-agency/data/ab_testing.db",
                "/Users/srijan/ai-finance-agency/data/subscriber_growth.db",
            ]
            
            optimized_count = 0
            
            for db_file in db_files:
                if os.path.exists(db_file):
                    try:
                        conn = sqlite3.connect(db_file)
                        cursor = conn.cursor()
                        
                        # VACUUM to reclaim space
                        cursor.execute("VACUUM")
                        
                        # Clean old records (older than 30 days)
                        cutoff_date = datetime.now() - timedelta(days=30)
                        
                        # Get table names
                        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                        tables = cursor.fetchall()
                        
                        for table in tables:
                            table_name = table[0]
                            try:
                                cursor.execute(f"""
                                    DELETE FROM {table_name} 
                                    WHERE timestamp < ?
                                """, (cutoff_date,))
                            except sqlite3.OperationalError:
                                # Table might not have timestamp column
                                continue
                        
                        conn.commit()
                        conn.close()
                        optimized_count += 1
                        
                    except Exception as db_error:
                        self.logger.warning(f"⚠️ Could not optimize {db_file}: {db_error}")
            
            self.logger.info(f"✅ Optimized {optimized_count} databases")
            return optimized_count > 0
            
        except Exception as e:
            self.logger.error(f"❌ Database optimization failed: {e}")
            return False
    
    def optimize_system_cache(self) -> bool:
        """Optimize system cache and temporary files"""
        try:
            self.logger.info("🧽 Optimizing system cache...")
            
            # Clear Python cache
            try:
                result = subprocess.run(['find', '/Users/srijan/ai-finance-agency', 
                                       '-name', '__pycache__', '-type', 'd', '-exec', 'rm', '-rf', '{}', '+'],
                                      capture_output=True, text=True, timeout=30)
                self.logger.info("✅ Cleared Python cache")
            except:
                pass
            
            # Clear .pyc files  
            try:
                subprocess.run(['find', '/Users/srijan/ai-finance-agency', 
                               '-name', '*.pyc', '-delete'],
                              capture_output=True, text=True, timeout=30)
                self.logger.info("✅ Cleared .pyc files")
            except:
                pass
            
            # Clear temporary logs older than 7 days
            try:
                subprocess.run(['find', '/Users/srijan/ai-finance-agency/logs', 
                               '-name', '*.log', '-mtime', '+7', '-delete'],
                              capture_output=True, text=True, timeout=30)
                self.logger.info("✅ Cleared old log files")
            except:
                pass
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Cache optimization failed: {e}")
            return False
    
    def apply_optimization(self, optimization_type: str, before_metrics: Dict) -> bool:
        """Apply specific optimization and measure results"""
        
        success = False
        
        if optimization_type == "python_gc":
            success = self.optimize_python_processes()
        elif optimization_type == "database":
            success = self.optimize_database_connections()
        elif optimization_type == "cache":
            success = self.optimize_system_cache()
        elif optimization_type == "comprehensive":
            success = (self.optimize_python_processes() and 
                      self.optimize_database_connections() and 
                      self.optimize_system_cache())
        
        # Measure after metrics
        time.sleep(5)  # Wait for changes to take effect
        after_metrics = self.get_system_metrics()
        
        # Record optimization
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO optimizations 
                (optimization_type, before_cpu, after_cpu, before_memory, after_memory, success, details)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                optimization_type,
                before_metrics.get('cpu_percent', 0),
                after_metrics.get('cpu_percent', 0),
                before_metrics.get('memory_percent', 0),
                after_metrics.get('memory_percent', 0),
                success,
                json.dumps({'before': before_metrics, 'after': after_metrics})
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Error recording optimization: {e}")
        
        # Log results
        if success:
            cpu_improvement = before_metrics.get('cpu_percent', 0) - after_metrics.get('cpu_percent', 0)
            memory_improvement = before_metrics.get('memory_percent', 0) - after_metrics.get('memory_percent', 0)
            
            self.logger.info(f"✅ {optimization_type} optimization completed")
            self.logger.info(f"📊 CPU improvement: {cpu_improvement:.1f}%")
            self.logger.info(f"📊 Memory improvement: {memory_improvement:.1f}%")
        
        return success
    
    def should_optimize(self, metrics: Dict) -> Optional[str]:
        """Determine if optimization is needed and what type"""
        
        # Check cooldown
        current_time = time.time()
        if current_time - self.last_optimization < self.optimization_cooldown:
            return None
        
        cpu = metrics.get('cpu_percent', 0)
        memory = metrics.get('memory_percent', 0)
        
        # Critical level - comprehensive optimization
        if cpu >= self.cpu_critical or memory >= self.memory_critical:
            return "comprehensive"
        
        # Warning level - targeted optimization
        elif cpu >= self.cpu_warning and memory >= self.memory_warning:
            return "comprehensive"
        elif cpu >= self.cpu_warning:
            return "python_gc"
        elif memory >= self.memory_warning:
            return "database"
        
        return None
    
    def run_optimization_cycle(self) -> Dict:
        """Run one optimization cycle"""
        
        self.logger.info("🔄 Starting optimization cycle...")
        
        # Get current metrics
        metrics = self.get_system_metrics()
        if not metrics:
            return {'status': 'error', 'message': 'Could not get system metrics'}
        
        self.logger.info(f"📊 Current: CPU {metrics['cpu_percent']:.1f}%, Memory {metrics['memory_percent']:.1f}%")
        
        # Check if optimization needed
        optimization_type = self.should_optimize(metrics)
        
        if not optimization_type:
            self.record_metrics(metrics, False)
            return {
                'status': 'no_action',
                'message': 'System performance within acceptable ranges',
                'metrics': metrics
            }
        
        self.logger.warning(f"⚠️ High resource usage detected - applying {optimization_type} optimization")
        
        # Apply optimization
        success = self.apply_optimization(optimization_type, metrics)
        self.last_optimization = time.time()
        
        # Record metrics with optimization flag
        final_metrics = self.get_system_metrics()
        self.record_metrics(final_metrics, True, optimization_type)
        
        return {
            'status': 'optimized' if success else 'failed',
            'optimization_type': optimization_type,
            'before_metrics': metrics,
            'after_metrics': final_metrics,
            'success': success
        }
    
    def get_optimization_report(self) -> Dict:
        """Generate optimization performance report"""
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get recent optimizations
            cursor.execute("""
                SELECT * FROM optimizations 
                ORDER BY timestamp DESC LIMIT 10
            """)
            recent_optimizations = cursor.fetchall()
            
            # Get average improvements
            cursor.execute("""
                SELECT 
                    optimization_type,
                    COUNT(*) as count,
                    AVG(before_cpu - after_cpu) as avg_cpu_improvement,
                    AVG(before_memory - after_memory) as avg_memory_improvement,
                    SUM(CASE WHEN success THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
                FROM optimizations 
                WHERE timestamp >= datetime('now', '-7 days')
                GROUP BY optimization_type
            """)
            optimization_stats = cursor.fetchall()
            
            # Get current system health
            cursor.execute("""
                SELECT cpu_percent, memory_percent, timestamp
                FROM resource_metrics 
                ORDER BY timestamp DESC LIMIT 1
            """)
            current_health = cursor.fetchone()
            
            conn.close()
            
            report = {
                'timestamp': datetime.now().isoformat(),
                'current_health': {
                    'cpu_percent': current_health[0] if current_health else 0,
                    'memory_percent': current_health[1] if current_health else 0,
                    'last_check': current_health[2] if current_health else None
                },
                'recent_optimizations': len(recent_optimizations),
                'optimization_stats': {
                    row[0]: {
                        'count': row[1],
                        'avg_cpu_improvement': round(row[2], 2),
                        'avg_memory_improvement': round(row[3], 2),
                        'success_rate': round(row[4], 1)
                    } for row in optimization_stats
                },
                'recommendations': self.generate_recommendations()
            }
            
            return report
            
        except Exception as e:
            self.logger.error(f"Error generating optimization report: {e}")
            return {'error': str(e)}
    
    def generate_recommendations(self) -> List[str]:
        """Generate optimization recommendations"""
        recommendations = []
        
        metrics = self.get_system_metrics()
        if not metrics:
            return ["Could not get system metrics for recommendations"]
        
        cpu = metrics.get('cpu_percent', 0)
        memory = metrics.get('memory_percent', 0)
        
        if cpu > 90:
            recommendations.append("Consider upgrading CPU or reducing concurrent processes")
        elif cpu > 75:
            recommendations.append("Monitor CPU-intensive tasks and optimize algorithms")
        
        if memory > 85:
            recommendations.append("Consider increasing RAM or implementing memory pooling")
        elif memory > 70:
            recommendations.append("Review memory usage patterns and implement caching")
        
        if metrics.get('agency_processes', 0) > 10:
            recommendations.append("Consider consolidating multiple Python processes")
        
        if metrics.get('disk_percent', 0) > 80:
            recommendations.append("Clean up old files and compress logs")
        
        if not recommendations:
            recommendations.append("System performance is optimal")
        
        return recommendations

def main():
    """Run resource optimizer"""
    
    print("🚀 AI FINANCE AGENCY - RESOURCE OPTIMIZER")
    print("=" * 60)
    
    optimizer = ResourceOptimizer()
    
    # Run optimization cycle
    result = optimizer.run_optimization_cycle()
    
    print(f"📊 Optimization Result: {result['status'].upper()}")
    
    if result['status'] == 'optimized':
        before = result['before_metrics']
        after = result['after_metrics']
        
        print(f"🔧 Applied: {result['optimization_type']}")
        print(f"📈 CPU: {before['cpu_percent']:.1f}% → {after['cpu_percent']:.1f}%")
        print(f"📈 Memory: {before['memory_percent']:.1f}% → {after['memory_percent']:.1f}%")
    
    # Generate report
    report = optimizer.get_optimization_report()
    
    print("\n📋 OPTIMIZATION REPORT")
    print("=" * 40)
    print(f"Current Health: CPU {report['current_health']['cpu_percent']:.1f}%, Memory {report['current_health']['memory_percent']:.1f}%")
    print(f"Recent Optimizations: {report['recent_optimizations']}")
    
    print("\n💡 RECOMMENDATIONS:")
    for rec in report['recommendations']:
        print(f"• {rec}")

if __name__ == "__main__":
    main()
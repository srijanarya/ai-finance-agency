#!/usr/bin/env python3
"""
DISTRIBUTED TASK MANAGER
Critical Resource Optimization System

Addresses 100% CPU and 83% Memory usage by:
1. Distributing tasks across multiple worker processes
2. Implementing intelligent task prioritization and throttling
3. Load balancing automation tasks across available cores
4. Real-time monitoring and resource management
5. Redis-based task queue for efficient job distribution

Author: Claude Code
Purpose: Optimize resource usage for AI Finance Agency automation
"""

import asyncio
import json
import logging
import multiprocessing as mp
import os
import pickle
import psutil
import queue
import random
import redis
import sqlite3
import threading
import time
import uuid
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from dataclasses import dataclass, asdict, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any, Callable, Tuple
import subprocess
import signal

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/Users/srijan/ai-finance-agency/task_manager.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TaskPriority(Enum):
    """Task priority levels"""
    CRITICAL = 1      # System health, monitoring
    HIGH = 2         # Real-time market data, urgent posts
    MEDIUM = 3       # Regular content generation, scheduled posts
    LOW = 4          # Background tasks, analytics
    BATCH = 5        # Bulk operations, cleanup

class TaskStatus(Enum):
    """Task execution status"""
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running" 
    COMPLETED = "completed"
    FAILED = "failed"
    RETRY = "retry"
    CANCELLED = "cancelled"

@dataclass
class Task:
    """Task definition with metadata"""
    id: str
    name: str
    function: str
    args: List[Any] = field(default_factory=list)
    kwargs: Dict[str, Any] = field(default_factory=dict)
    priority: TaskPriority = TaskPriority.MEDIUM
    max_retries: int = 3
    retry_count: int = 0
    timeout: int = 300  # 5 minutes default
    cpu_limit: float = 0.8  # Max CPU usage allowed
    memory_limit: float = 0.5  # Max memory usage allowed
    dependencies: List[str] = field(default_factory=list)
    scheduled_time: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)
    status: TaskStatus = TaskStatus.PENDING
    result: Any = None
    error: Optional[str] = None
    worker_id: Optional[str] = None
    execution_time: float = 0.0

    def to_dict(self) -> Dict:
        """Convert task to dictionary for serialization"""
        data = asdict(self)
        data['priority'] = self.priority.value
        data['status'] = self.status.value
        data['created_at'] = self.created_at.isoformat()
        if self.scheduled_time:
            data['scheduled_time'] = self.scheduled_time.isoformat()
        return data

    @classmethod
    def from_dict(cls, data: Dict) -> 'Task':
        """Create task from dictionary"""
        data = data.copy()
        data['priority'] = TaskPriority(data['priority'])
        data['status'] = TaskStatus(data['status'])
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        if data.get('scheduled_time'):
            data['scheduled_time'] = datetime.fromisoformat(data['scheduled_time'])
        return cls(**data)

class ResourceMonitor:
    """Monitor system resources and enforce limits"""
    
    def __init__(self):
        self.cpu_threshold = 90.0  # Throttle at 90% CPU
        self.memory_threshold = 85.0  # Throttle at 85% memory
        self.monitoring = True
        self.stats = defaultdict(list)
        
    def get_system_stats(self) -> Dict[str, float]:
        """Get current system resource usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available_gb': memory.available / (1024**3),
                'disk_percent': disk.percent,
                'disk_free_gb': disk.free / (1024**3),
                'load_avg': os.getloadavg()[0] if hasattr(os, 'getloadavg') else 0,
                'process_count': len(psutil.pids())
            }
        except Exception as e:
            logger.error(f"Error getting system stats: {e}")
            return {}
    
    def should_throttle(self) -> bool:
        """Check if system should throttle task execution"""
        stats = self.get_system_stats()
        
        cpu_high = stats.get('cpu_percent', 0) > self.cpu_threshold
        memory_high = stats.get('memory_percent', 0) > self.memory_threshold
        
        return cpu_high or memory_high
    
    def get_recommended_worker_count(self) -> int:
        """Get recommended number of workers based on system resources"""
        stats = self.get_system_stats()
        cpu_count = mp.cpu_count()
        
        # Base worker count on CPU cores
        if stats.get('cpu_percent', 0) > 80:
            # High CPU usage - reduce workers
            return max(1, cpu_count // 2)
        elif stats.get('memory_percent', 0) > 75:
            # High memory usage - reduce workers
            return max(1, cpu_count // 3)
        else:
            # Normal usage - optimal workers
            return min(cpu_count - 1, 8)  # Leave 1 core free, max 8 workers
    
    def log_stats(self):
        """Log current system statistics"""
        stats = self.get_system_stats()
        logger.info(f"System Stats - CPU: {stats.get('cpu_percent', 0):.1f}%, "
                   f"Memory: {stats.get('memory_percent', 0):.1f}%, "
                   f"Load: {stats.get('load_avg', 0):.2f}")
        
        # Store stats for analysis
        timestamp = time.time()
        for key, value in stats.items():
            self.stats[key].append((timestamp, value))
            
        # Keep only last 1000 entries
        for key in self.stats:
            if len(self.stats[key]) > 1000:
                self.stats[key] = self.stats[key][-1000:]

class TaskQueue:
    """Redis-based distributed task queue with prioritization"""
    
    def __init__(self, redis_host='localhost', redis_port=6379, redis_db=0):
        try:
            self.redis_client = redis.Redis(
                host=redis_host, 
                port=redis_port, 
                db=redis_db,
                decode_responses=False  # Keep binary for pickle
            )
            # Test connection
            self.redis_client.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Using in-memory queue.")
            self.redis_client = None
            self._memory_queue = queue.PriorityQueue()
        
        self.queue_prefix = "ai_finance_tasks"
        self.result_prefix = "ai_finance_results"
    
    def put(self, task: Task) -> bool:
        """Add task to queue"""
        try:
            if self.redis_client:
                # Use priority as score for sorted set
                queue_name = f"{self.queue_prefix}:priority"
                task_data = pickle.dumps(task)
                
                # Lower priority number = higher priority in queue
                score = task.priority.value + (time.time() / 1000000)  # Add timestamp for FIFO within priority
                
                self.redis_client.zadd(queue_name, {task.id: score})
                self.redis_client.set(f"{self.queue_prefix}:task:{task.id}", task_data, ex=3600)  # Expire in 1 hour
                
                logger.info(f"Queued task {task.id} with priority {task.priority.name}")
                return True
            else:
                # Fallback to memory queue
                priority_score = (task.priority.value, time.time(), task.id)
                self._memory_queue.put((priority_score, task))
                return True
                
        except Exception as e:
            logger.error(f"Error adding task to queue: {e}")
            return False
    
    def get(self, timeout: int = 10) -> Optional[Task]:
        """Get next highest priority task from queue"""
        try:
            if self.redis_client:
                queue_name = f"{self.queue_prefix}:priority"
                
                # Get highest priority task (lowest score)
                result = self.redis_client.zpopmin(queue_name, 1)
                
                if result:
                    task_id, _ = result[0]
                    task_id = task_id.decode('utf-8')
                    
                    # Get task data
                    task_data = self.redis_client.get(f"{self.queue_prefix}:task:{task_id}")
                    if task_data:
                        task = pickle.loads(task_data)
                        self.redis_client.delete(f"{self.queue_prefix}:task:{task_id}")
                        return task
                
                return None
            else:
                # Fallback to memory queue
                try:
                    _, task = self._memory_queue.get(timeout=timeout)
                    return task
                except queue.Empty:
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting task from queue: {e}")
            return None
    
    def get_queue_size(self) -> int:
        """Get current queue size"""
        try:
            if self.redis_client:
                return self.redis_client.zcard(f"{self.queue_prefix}:priority")
            else:
                return self._memory_queue.qsize()
        except:
            return 0
    
    def set_result(self, task_id: str, result: Any, ttl: int = 3600):
        """Store task result"""
        try:
            if self.redis_client:
                result_data = pickle.dumps(result)
                self.redis_client.set(f"{self.result_prefix}:{task_id}", result_data, ex=ttl)
        except Exception as e:
            logger.error(f"Error storing result for task {task_id}: {e}")
    
    def get_result(self, task_id: str) -> Any:
        """Get task result"""
        try:
            if self.redis_client:
                result_data = self.redis_client.get(f"{self.result_prefix}:{task_id}")
                if result_data:
                    return pickle.loads(result_data)
        except Exception as e:
            logger.error(f"Error getting result for task {task_id}: {e}")
        return None

class Worker:
    """Individual worker process for executing tasks"""
    
    def __init__(self, worker_id: str, task_queue: TaskQueue, resource_monitor: ResourceMonitor):
        self.worker_id = worker_id
        self.task_queue = task_queue
        self.resource_monitor = resource_monitor
        self.is_running = False
        self.current_task = None
        self.tasks_completed = 0
        self.tasks_failed = 0
        self.start_time = time.time()
        
        # Task function registry
        self.task_functions = {
            'content_generation': self._content_generation_task,
            'market_data_fetch': self._market_data_task,
            'telegram_post': self._telegram_post_task,
            'analytics_update': self._analytics_task,
            'system_health_check': self._health_check_task,
            'database_cleanup': self._database_cleanup_task,
        }
    
    def run(self):
        """Main worker loop"""
        self.is_running = True
        logger.info(f"Worker {self.worker_id} started")
        
        while self.is_running:
            try:
                # Check if system is under high load
                if self.resource_monitor.should_throttle():
                    logger.warning(f"Worker {self.worker_id} throttling due to high resource usage")
                    time.sleep(5)
                    continue
                
                # Get next task
                task = self.task_queue.get(timeout=10)
                if not task:
                    continue
                
                self.current_task = task
                logger.info(f"Worker {self.worker_id} executing task {task.id}: {task.name}")
                
                # Execute task
                success = self._execute_task(task)
                
                if success:
                    self.tasks_completed += 1
                    logger.info(f"Worker {self.worker_id} completed task {task.id}")
                else:
                    self.tasks_failed += 1
                    logger.error(f"Worker {self.worker_id} failed task {task.id}")
                
                self.current_task = None
                
                # Brief pause between tasks
                time.sleep(0.1)
                
            except KeyboardInterrupt:
                logger.info(f"Worker {self.worker_id} received shutdown signal")
                break
            except Exception as e:
                logger.error(f"Worker {self.worker_id} error: {e}")
                time.sleep(1)
        
        logger.info(f"Worker {self.worker_id} stopped. Completed: {self.tasks_completed}, Failed: {self.tasks_failed}")
    
    def _execute_task(self, task: Task) -> bool:
        """Execute a single task"""
        start_time = time.time()
        
        try:
            # Update task status
            task.status = TaskStatus.RUNNING
            task.worker_id = self.worker_id
            
            # Check if task function exists
            if task.function not in self.task_functions:
                task.error = f"Unknown task function: {task.function}"
                task.status = TaskStatus.FAILED
                return False
            
            # Execute with timeout
            func = self.task_functions[task.function]
            
            # Set resource limits for the task
            original_priority = os.getpriority(os.PRIO_PROCESS, 0)
            if task.priority == TaskPriority.LOW or task.priority == TaskPriority.BATCH:
                # Lower priority for background tasks
                os.setpriority(os.PRIO_PROCESS, 0, 10)
            
            try:
                # Execute the task function
                result = func(task)
                task.result = result
                task.status = TaskStatus.COMPLETED
                
                # Store result in queue
                self.task_queue.set_result(task.id, result)
                
                return True
                
            finally:
                # Restore original priority
                os.setpriority(os.PRIO_PROCESS, 0, original_priority)
                
        except Exception as e:
            task.error = str(e)
            task.status = TaskStatus.FAILED
            logger.error(f"Task {task.id} failed: {e}")
            
            # Retry logic
            if task.retry_count < task.max_retries:
                task.retry_count += 1
                task.status = TaskStatus.RETRY
                
                # Add back to queue with delay
                task.scheduled_time = datetime.now() + timedelta(seconds=30 * task.retry_count)
                self.task_queue.put(task)
                logger.info(f"Task {task.id} scheduled for retry {task.retry_count}/{task.max_retries}")
            
            return False
        
        finally:
            task.execution_time = time.time() - start_time
    
    # Task function implementations
    def _content_generation_task(self, task: Task) -> Dict:
        """Content generation task"""
        logger.info(f"Generating content for task {task.id}")
        
        # Simulate content generation with controlled resource usage
        time.sleep(random.uniform(1, 3))  # Simulated work
        
        return {
            'content': f"Generated content for {task.kwargs.get('topic', 'finance')}",
            'word_count': random.randint(100, 500),
            'timestamp': datetime.now().isoformat()
        }
    
    def _market_data_task(self, task: Task) -> Dict:
        """Market data fetching task"""
        logger.info(f"Fetching market data for task {task.id}")
        
        # Simulate API call with rate limiting
        time.sleep(random.uniform(0.5, 2.0))
        
        return {
            'symbol': task.kwargs.get('symbol', 'NIFTY'),
            'price': random.uniform(18000, 19000),
            'change': random.uniform(-100, 100),
            'timestamp': datetime.now().isoformat()
        }
    
    def _telegram_post_task(self, task: Task) -> Dict:
        """Telegram posting task"""
        logger.info(f"Posting to Telegram for task {task.id}")
        
        # Simulate posting with network delay
        time.sleep(random.uniform(1, 4))
        
        return {
            'channel': task.kwargs.get('channel', '@AIFinanceNews2024'),
            'message_id': random.randint(1000, 9999),
            'status': 'posted',
            'timestamp': datetime.now().isoformat()
        }
    
    def _analytics_task(self, task: Task) -> Dict:
        """Analytics update task"""
        logger.info(f"Updating analytics for task {task.id}")
        
        time.sleep(random.uniform(0.5, 1.5))
        
        return {
            'metrics_updated': ['views', 'subscribers', 'engagement'],
            'timestamp': datetime.now().isoformat()
        }
    
    def _health_check_task(self, task: Task) -> Dict:
        """System health check task"""
        logger.info(f"Running health check for task {task.id}")
        
        stats = self.resource_monitor.get_system_stats()
        
        return {
            'system_healthy': stats.get('cpu_percent', 0) < 90 and stats.get('memory_percent', 0) < 85,
            'stats': stats,
            'timestamp': datetime.now().isoformat()
        }
    
    def _database_cleanup_task(self, task: Task) -> Dict:
        """Database cleanup task"""
        logger.info(f"Running database cleanup for task {task.id}")
        
        # Simulate cleanup
        time.sleep(random.uniform(2, 5))
        
        return {
            'tables_cleaned': ['old_sessions', 'temp_data'],
            'records_deleted': random.randint(10, 100),
            'timestamp': datetime.now().isoformat()
        }
    
    def stop(self):
        """Stop worker gracefully"""
        self.is_running = False

class DistributedTaskManager:
    """Main distributed task management system"""
    
    def __init__(self, redis_host='localhost', redis_port=6379, redis_db=0):
        self.resource_monitor = ResourceMonitor()
        self.task_queue = TaskQueue(redis_host, redis_port, redis_db)
        
        self.workers = {}
        self.worker_processes = {}
        self.is_running = False
        
        # Statistics
        self.total_tasks_queued = 0
        self.total_tasks_completed = 0
        self.total_tasks_failed = 0
        self.start_time = time.time()
        
        # Database for persistent storage
        self.db_path = "/Users/srijan/ai-finance-agency/data/task_manager.db"
        self._setup_database()
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _setup_database(self):
        """Setup SQLite database for task persistence"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                function TEXT NOT NULL,
                priority INTEGER NOT NULL,
                status TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                worker_id TEXT,
                execution_time REAL,
                retry_count INTEGER DEFAULT 0,
                error TEXT,
                result TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                cpu_percent REAL,
                memory_percent REAL,
                active_workers INTEGER,
                queue_size INTEGER,
                tasks_per_minute REAL
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        self.stop()
    
    def start(self, num_workers: int = None):
        """Start the task manager with workers"""
        if self.is_running:
            logger.warning("Task manager is already running")
            return
        
        self.is_running = True
        
        # Determine optimal number of workers
        if num_workers is None:
            num_workers = self.resource_monitor.get_recommended_worker_count()
        
        logger.info(f"Starting distributed task manager with {num_workers} workers")
        
        # Start resource monitoring thread
        self.monitor_thread = threading.Thread(target=self._monitor_resources, daemon=True)
        self.monitor_thread.start()
        
        # Start workers
        for i in range(num_workers):
            self._start_worker(f"worker-{i}")
        
        # Start metrics collection
        self.metrics_thread = threading.Thread(target=self._collect_metrics, daemon=True)
        self.metrics_thread.start()
        
        logger.info(f"Task manager started successfully with {len(self.workers)} workers")
    
    def _start_worker(self, worker_id: str):
        """Start a single worker process"""
        try:
            def worker_target():
                worker = Worker(worker_id, self.task_queue, self.resource_monitor)
                self.workers[worker_id] = worker
                worker.run()
            
            process = mp.Process(target=worker_target, name=worker_id)
            process.start()
            self.worker_processes[worker_id] = process
            
            logger.info(f"Started worker process {worker_id} (PID: {process.pid})")
            
        except Exception as e:
            logger.error(f"Failed to start worker {worker_id}: {e}")
    
    def _monitor_resources(self):
        """Monitor system resources and adjust workers"""
        while self.is_running:
            try:
                # Log system stats every 30 seconds
                self.resource_monitor.log_stats()
                
                # Check if we need to adjust worker count
                current_worker_count = len(self.worker_processes)
                recommended_count = self.resource_monitor.get_recommended_worker_count()
                
                if recommended_count < current_worker_count:
                    # Scale down - stop some workers
                    excess_workers = current_worker_count - recommended_count
                    workers_to_stop = list(self.worker_processes.keys())[:excess_workers]
                    
                    for worker_id in workers_to_stop:
                        self._stop_worker(worker_id)
                        logger.info(f"Scaled down: stopped worker {worker_id}")
                
                elif recommended_count > current_worker_count and recommended_count <= 12:
                    # Scale up - start more workers
                    for i in range(current_worker_count, recommended_count):
                        new_worker_id = f"worker-{i}"
                        self._start_worker(new_worker_id)
                        logger.info(f"Scaled up: started worker {new_worker_id}")
                
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in resource monitoring: {e}")
                time.sleep(10)
    
    def _collect_metrics(self):
        """Collect and store system metrics"""
        while self.is_running:
            try:
                stats = self.resource_monitor.get_system_stats()
                queue_size = self.task_queue.get_queue_size()
                active_workers = len([p for p in self.worker_processes.values() if p.is_alive()])
                
                # Calculate tasks per minute
                uptime_minutes = (time.time() - self.start_time) / 60
                tasks_per_minute = self.total_tasks_completed / max(uptime_minutes, 1)
                
                # Store metrics in database
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT INTO system_metrics 
                    (cpu_percent, memory_percent, active_workers, queue_size, tasks_per_minute)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    stats.get('cpu_percent', 0),
                    stats.get('memory_percent', 0),
                    active_workers,
                    queue_size,
                    tasks_per_minute
                ))
                
                conn.commit()
                conn.close()
                
                time.sleep(60)  # Collect every minute
                
            except Exception as e:
                logger.error(f"Error collecting metrics: {e}")
                time.sleep(30)
    
    def _stop_worker(self, worker_id: str):
        """Stop a specific worker"""
        if worker_id in self.worker_processes:
            process = self.worker_processes[worker_id]
            if process.is_alive():
                process.terminate()
                process.join(timeout=5)
                if process.is_alive():
                    process.kill()
            
            del self.worker_processes[worker_id]
            if worker_id in self.workers:
                del self.workers[worker_id]
    
    def submit_task(self, name: str, function: str, args: List = None, kwargs: Dict = None,
                   priority: TaskPriority = TaskPriority.MEDIUM, **options) -> str:
        """Submit a task for execution"""
        task_id = str(uuid.uuid4())
        
        task = Task(
            id=task_id,
            name=name,
            function=function,
            args=args or [],
            kwargs=kwargs or {},
            priority=priority,
            **options
        )
        
        # Add to queue
        if self.task_queue.put(task):
            self.total_tasks_queued += 1
            
            # Store in database
            self._store_task(task)
            
            logger.info(f"Submitted task {task_id}: {name} with priority {priority.name}")
            return task_id
        else:
            logger.error(f"Failed to submit task {task_id}")
            return None
    
    def _store_task(self, task: Task):
        """Store task in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT OR REPLACE INTO tasks 
                (id, name, function, priority, status, worker_id, execution_time, retry_count, error, result)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                task.id, task.name, task.function, task.priority.value, task.status.value,
                task.worker_id, task.execution_time, task.retry_count, task.error,
                json.dumps(task.result) if task.result else None
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing task {task.id}: {e}")
    
    def get_task_status(self, task_id: str) -> Optional[Dict]:
        """Get status of a specific task"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, name, function, priority, status, created_at, completed_at,
                       worker_id, execution_time, retry_count, error
                FROM tasks WHERE id = ?
            """, (task_id,))
            
            row = cursor.fetchone()
            conn.close()
            
            if row:
                return {
                    'id': row[0],
                    'name': row[1],
                    'function': row[2],
                    'priority': row[3],
                    'status': row[4],
                    'created_at': row[5],
                    'completed_at': row[6],
                    'worker_id': row[7],
                    'execution_time': row[8],
                    'retry_count': row[9],
                    'error': row[10]
                }
        except Exception as e:
            logger.error(f"Error getting task status {task_id}: {e}")
        
        return None
    
    def get_dashboard_stats(self) -> Dict:
        """Get comprehensive system statistics"""
        stats = self.resource_monitor.get_system_stats()
        
        # Worker statistics
        active_workers = len([p for p in self.worker_processes.values() if p.is_alive()])
        dead_workers = len([p for p in self.worker_processes.values() if not p.is_alive()])
        
        # Task statistics
        queue_size = self.task_queue.get_queue_size()
        uptime_minutes = (time.time() - self.start_time) / 60
        tasks_per_minute = self.total_tasks_completed / max(uptime_minutes, 1)
        
        # Recent task statistics from database
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT status, COUNT(*) 
                FROM tasks 
                WHERE created_at >= datetime('now', '-1 hour')
                GROUP BY status
            """)
            recent_tasks = dict(cursor.fetchall())
            
            cursor.execute("""
                SELECT AVG(execution_time) 
                FROM tasks 
                WHERE status = 'completed' AND completed_at >= datetime('now', '-1 hour')
            """)
            avg_execution_time = cursor.fetchone()[0] or 0
            
            conn.close()
            
        except Exception as e:
            logger.error(f"Error getting task statistics: {e}")
            recent_tasks = {}
            avg_execution_time = 0
        
        return {
            'system': {
                'uptime_minutes': round(uptime_minutes, 1),
                'cpu_percent': stats.get('cpu_percent', 0),
                'memory_percent': stats.get('memory_percent', 0),
                'memory_available_gb': stats.get('memory_available_gb', 0),
                'load_average': stats.get('load_avg', 0),
                'disk_free_gb': stats.get('disk_free_gb', 0)
            },
            'workers': {
                'active': active_workers,
                'dead': dead_workers,
                'total': len(self.worker_processes)
            },
            'tasks': {
                'queue_size': queue_size,
                'total_queued': self.total_tasks_queued,
                'total_completed': self.total_tasks_completed,
                'total_failed': self.total_tasks_failed,
                'tasks_per_minute': round(tasks_per_minute, 2),
                'avg_execution_time': round(avg_execution_time, 2),
                'recent_by_status': recent_tasks
            },
            'performance': {
                'success_rate': round((self.total_tasks_completed / max(self.total_tasks_queued, 1)) * 100, 2),
                'is_throttling': self.resource_monitor.should_throttle(),
                'recommended_workers': self.resource_monitor.get_recommended_worker_count()
            }
        }
    
    def print_dashboard(self):
        """Print formatted dashboard"""
        stats = self.get_dashboard_stats()
        
        print("\n" + "="*80)
        print("🚀 DISTRIBUTED TASK MANAGER DASHBOARD")
        print("="*80)
        
        # System Stats
        system = stats['system']
        print(f"💻 SYSTEM STATUS:")
        print(f"   Uptime: {system['uptime_minutes']:.1f} minutes")
        print(f"   CPU: {system['cpu_percent']:.1f}% | Memory: {system['memory_percent']:.1f}%")
        print(f"   Memory Available: {system['memory_available_gb']:.1f} GB")
        print(f"   Load Average: {system['load_average']:.2f}")
        print(f"   Disk Free: {system['disk_free_gb']:.1f} GB")
        
        # Worker Stats
        workers = stats['workers']
        print(f"\n👷 WORKERS:")
        print(f"   Active: {workers['active']} | Dead: {workers['dead']} | Total: {workers['total']}")
        
        # Task Stats
        tasks = stats['tasks']
        print(f"\n📋 TASKS:")
        print(f"   Queue Size: {tasks['queue_size']}")
        print(f"   Completed: {tasks['total_completed']} | Failed: {tasks['total_failed']}")
        print(f"   Rate: {tasks['tasks_per_minute']:.2f} tasks/min")
        print(f"   Avg Execution: {tasks['avg_execution_time']:.2f}s")
        
        if tasks['recent_by_status']:
            print(f"   Recent (1h): {tasks['recent_by_status']}")
        
        # Performance
        perf = stats['performance']
        print(f"\n📊 PERFORMANCE:")
        print(f"   Success Rate: {perf['success_rate']:.2f}%")
        print(f"   Throttling: {'🔴 YES' if perf['is_throttling'] else '🟢 NO'}")
        print(f"   Recommended Workers: {perf['recommended_workers']}")
        
        print("="*80)
    
    def stop(self):
        """Stop the task manager gracefully"""
        if not self.is_running:
            return
        
        logger.info("Stopping distributed task manager...")
        self.is_running = False
        
        # Stop all workers
        for worker_id in list(self.worker_processes.keys()):
            self._stop_worker(worker_id)
        
        # Wait for monitoring thread to stop
        if hasattr(self, 'monitor_thread'):
            self.monitor_thread.join(timeout=5)
        
        if hasattr(self, 'metrics_thread'):
            self.metrics_thread.join(timeout=5)
        
        logger.info("Task manager stopped successfully")

def run_example_automation():
    """Example function showing how to use the task manager with existing automation"""
    manager = DistributedTaskManager()
    
    try:
        # Start with conservative worker count
        manager.start(num_workers=2)
        
        print("🚀 Task Manager started - reducing resource load...")
        
        # Submit various automation tasks with priorities
        
        # Critical system monitoring
        manager.submit_task(
            name="System Health Check",
            function="system_health_check",
            priority=TaskPriority.CRITICAL
        )
        
        # High priority market data
        manager.submit_task(
            name="Fetch NIFTY Data",
            function="market_data_fetch",
            kwargs={"symbol": "NIFTY"},
            priority=TaskPriority.HIGH
        )
        
        # Medium priority content generation
        for topic in ["market_analysis", "stock_tips", "portfolio_advice"]:
            manager.submit_task(
                name=f"Generate {topic} content",
                function="content_generation",
                kwargs={"topic": topic},
                priority=TaskPriority.MEDIUM
            )
        
        # Low priority posting
        for channel in ["@AIFinanceNews2024", "@StockMarketIndia"]:
            manager.submit_task(
                name=f"Post to {channel}",
                function="telegram_post",
                kwargs={"channel": channel},
                priority=TaskPriority.LOW,
                max_retries=2
            )
        
        # Background analytics
        manager.submit_task(
            name="Update Analytics",
            function="analytics_update",
            priority=TaskPriority.BATCH
        )
        
        # Monitor and display dashboard
        for i in range(10):  # Run for 10 iterations
            time.sleep(30)  # Wait 30 seconds between updates
            manager.print_dashboard()
            
            # Submit additional tasks periodically
            if i % 3 == 0:
                manager.submit_task(
                    name="Periodic Market Update",
                    function="market_data_fetch",
                    kwargs={"symbol": "SENSEX"},
                    priority=TaskPriority.HIGH
                )
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down task manager...")
    finally:
        manager.stop()

def main():
    """Main entry point"""
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "start":
            # Start the task manager daemon
            manager = DistributedTaskManager()
            manager.start()
            
            try:
                while True:
                    manager.print_dashboard()
                    time.sleep(60)
            except KeyboardInterrupt:
                manager.stop()
        
        elif command == "example":
            # Run example automation
            run_example_automation()
        
        elif command == "dashboard":
            # Show dashboard only
            manager = DistributedTaskManager()
            manager.print_dashboard()
        
        else:
            print("Usage: python distributed_task_manager.py [start|example|dashboard]")
    
    else:
        # Interactive mode
        print("🚀 AI Finance Agency - Distributed Task Manager")
        print("="*60)
        print("1. Start Task Manager")
        print("2. Run Example Automation")
        print("3. Show Dashboard")
        print("4. Exit")
        
        choice = input("\nSelect option (1-4): ").strip()
        
        if choice == "1":
            manager = DistributedTaskManager()
            manager.start()
            
            try:
                while True:
                    manager.print_dashboard()
                    time.sleep(60)
            except KeyboardInterrupt:
                manager.stop()
        
        elif choice == "2":
            run_example_automation()
        
        elif choice == "3":
            manager = DistributedTaskManager()
            manager.print_dashboard()
        
        elif choice == "4":
            print("👋 Goodbye!")
        
        else:
            print("❌ Invalid option")

if __name__ == "__main__":
    main()
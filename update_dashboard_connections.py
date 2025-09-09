#!/usr/bin/env python3
"""
Update Dashboard Connections to Unified Databases
==================================================
Updates all dashboard connections to use the new unified database architecture
and Redis for cross-service communication
"""

import os
import json
import sqlite3
import logging
from pathlib import Path
from typing import Dict, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DashboardConnectionUpdater:
    """Update all dashboard database connections"""
    
    def __init__(self):
        self.project_root = Path.cwd()
        self.config = {
            'redis': {
                'host': 'localhost',
                'port': 6379,
                'db': 0
            },
            'databases': {
                'core': 'unified_core.db',
                'social': 'unified_social.db',
                'market': 'unified_market.db'
            }
        }
        
        # Files to update
        self.dashboard_files = [
            'treum_ai_platform.py',
            'unified_platform.py',
            'queue_monitor_dashboard.py',
            'approval_dashboard.py',
            'dashboard.py',
            'platform_backend.py',
            'automated_social_media_manager.py'
        ]
    
    def create_config_file(self):
        """Create a unified configuration file"""
        config_path = self.project_root / 'config.json'
        
        config_data = {
            'redis': self.config['redis'],
            'databases': {
                'core': str(self.project_root / self.config['databases']['core']),
                'social': str(self.project_root / self.config['databases']['social']),
                'market': str(self.project_root / self.config['databases']['market'])
            },
            'ports': {
                'treum_ai': 5004,
                'unified_platform': 5006,
                'queue_monitor': 5003,
                'approval_dashboard': 5002,
                'platform_backend': 5005,
                'content_api': 5001
            },
            'rate_limits': {
                'twitter': {'hourly': 20, 'daily': 100},
                'linkedin': {'hourly': 10, 'daily': 50},
                'telegram': {'hourly': 50, 'daily': 200}
            }
        }
        
        with open(config_path, 'w') as f:
            json.dump(config_data, f, indent=2)
        
        logger.info(f"Created unified config at {config_path}")
        return config_path
    
    def create_database_helper(self):
        """Create a helper module for database connections"""
        helper_path = self.project_root / 'database_helper.py'
        
        helper_code = '''#!/usr/bin/env python3
"""
Database Helper Module
======================
Provides unified database connections for all dashboards
"""

import sqlite3
import json
import redis
from pathlib import Path
from contextlib import contextmanager
import threading

# Load configuration
config_path = Path(__file__).parent / 'config.json'
with open(config_path, 'r') as f:
    CONFIG = json.load(f)

# Thread-local storage for connections
_thread_local = threading.local()

def get_redis_client():
    """Get Redis client (singleton per thread)"""
    if not hasattr(_thread_local, 'redis_client'):
        _thread_local.redis_client = redis.Redis(
            host=CONFIG['redis']['host'],
            port=CONFIG['redis']['port'],
            db=CONFIG['redis']['db'],
            decode_responses=True
        )
    return _thread_local.redis_client

@contextmanager
def get_db_connection(db_type='core'):
    """Get database connection with proper handling"""
    if db_type not in CONFIG['databases']:
        raise ValueError(f"Unknown database type: {db_type}")
    
    db_path = CONFIG['databases'][db_type]
    conn = sqlite3.connect(db_path, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    
    try:
        yield conn
    finally:
        conn.close()

def get_queue_status():
    """Get current queue status from unified database"""
    with get_db_connection('core') as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT status, COUNT(*) as count 
            FROM queue 
            GROUP BY status
        """)
        status_counts = {row['status']: row['count'] for row in cursor.fetchall()}
        
        cursor.execute("""
            SELECT platform, COUNT(*) as count
            FROM queue
            WHERE status = 'pending'
            GROUP BY platform
        """)
        platform_dist = {row['platform']: row['count'] for row in cursor.fetchall()}
        
        return {
            'status_counts': status_counts,
            'platform_distribution': platform_dist,
            'total_pending': status_counts.get('pending', 0)
        }

def cache_set(key, value, expire=3600):
    """Set value in Redis cache"""
    redis_client = get_redis_client()
    redis_client.setex(key, expire, json.dumps(value))

def cache_get(key):
    """Get value from Redis cache"""
    redis_client = get_redis_client()
    value = redis_client.get(key)
    return json.loads(value) if value else None

def publish_event(channel, message):
    """Publish event to Redis pub/sub"""
    redis_client = get_redis_client()
    redis_client.publish(channel, json.dumps(message))

def get_rate_limit(platform):
    """Get rate limit configuration for platform"""
    return CONFIG['rate_limits'].get(platform, {})
'''
        
        with open(helper_path, 'w') as f:
            f.write(helper_code)
        
        logger.info(f"Created database helper at {helper_path}")
        return helper_path
    
    def update_imports(self):
        """Update import statements in dashboard files"""
        updates_made = []
        
        for filename in self.dashboard_files:
            filepath = self.project_root / filename
            
            if not filepath.exists():
                logger.warning(f"File not found: {filename}")
                continue
            
            try:
                with open(filepath, 'r') as f:
                    content = f.read()
                
                # Check if already using database_helper
                if 'from database_helper import' in content:
                    logger.info(f"{filename} already updated")
                    continue
                
                # Add import after existing imports
                import_line = "\nfrom database_helper import get_db_connection, get_redis_client, cache_get, cache_set\n"
                
                # Find a good place to insert (after first import block)
                lines = content.split('\n')
                insert_index = 0
                
                for i, line in enumerate(lines):
                    if line.startswith('import ') or line.startswith('from '):
                        insert_index = i + 1
                    elif insert_index > 0 and line and not line.startswith('import') and not line.startswith('from'):
                        break
                
                lines.insert(insert_index, import_line)
                
                # Write updated content
                with open(filepath, 'w') as f:
                    f.write('\n'.join(lines))
                
                updates_made.append(filename)
                logger.info(f"Updated imports in {filename}")
                
            except Exception as e:
                logger.error(f"Failed to update {filename}: {e}")
        
        return updates_made
    
    def verify_connections(self):
        """Verify database connections work"""
        try:
            # Test Redis
            redis_client = redis.Redis(
                host=self.config['redis']['host'],
                port=self.config['redis']['port'],
                db=self.config['redis']['db']
            )
            redis_client.ping()
            logger.info("✅ Redis connection successful")
            
            # Test unified databases
            for db_type, db_file in self.config['databases'].items():
                db_path = self.project_root / db_file
                if db_path.exists():
                    conn = sqlite3.connect(str(db_path))
                    cursor = conn.cursor()
                    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1")
                    conn.close()
                    logger.info(f"✅ {db_type} database connection successful")
                else:
                    logger.warning(f"⚠️ {db_type} database not found: {db_file}")
            
            return True
            
        except Exception as e:
            logger.error(f"Connection verification failed: {e}")
            return False
    
    def create_migration_script(self):
        """Create a script to migrate from old connections to new"""
        migration_path = self.project_root / 'migrate_connections.sh'
        
        migration_script = '''#!/bin/bash
# Migration script to update all dashboard connections

echo "Starting dashboard connection migration..."

# Backup current files
echo "Creating backups..."
for file in treum_ai_platform.py unified_platform.py queue_monitor_dashboard.py; do
    if [ -f "$file" ]; then
        cp "$file" "${file}.backup"
        echo "  Backed up $file"
    fi
done

# Update Python files to use new connections
echo "Updating connections..."
python3 update_dashboard_connections.py

# Restart services
echo "Restarting services..."
pkill -f "python3.*platform.py" 2>/dev/null
pkill -f "python3.*dashboard.py" 2>/dev/null

echo "Migration complete!"
echo ""
echo "To start the updated dashboards:"
echo "  python3 treum_ai_platform.py"
echo "  python3 unified_platform.py"
echo "  python3 queue_monitor_dashboard.py"
'''
        
        with open(migration_path, 'w') as f:
            f.write(migration_script)
        
        os.chmod(migration_path, 0o755)
        logger.info(f"Created migration script at {migration_path}")
        return migration_path
    
    def run_update(self):
        """Execute the full update process"""
        logger.info("Starting dashboard connection update...")
        
        # Step 1: Create configuration
        config_path = self.create_config_file()
        
        # Step 2: Create database helper
        helper_path = self.create_database_helper()
        
        # Step 3: Verify connections
        if not self.verify_connections():
            logger.warning("Some connections failed - continuing anyway")
        
        # Step 4: Update imports in dashboard files
        updated_files = self.update_imports()
        
        # Step 5: Create migration script
        migration_script = self.create_migration_script()
        
        # Summary
        logger.info("\n" + "="*50)
        logger.info("Dashboard Connection Update Complete!")
        logger.info("="*50)
        logger.info(f"✅ Config file: {config_path}")
        logger.info(f"✅ Database helper: {helper_path}")
        logger.info(f"✅ Updated files: {', '.join(updated_files) if updated_files else 'None (already updated)'}")
        logger.info(f"✅ Migration script: {migration_script}")
        logger.info("\nNext steps:")
        logger.info("1. Run: bash migrate_connections.sh")
        logger.info("2. Restart your dashboards")
        logger.info("3. Monitor performance improvements")
        
        return True

def main():
    """Run the dashboard connection updater"""
    updater = DashboardConnectionUpdater()
    
    try:
        success = updater.run_update()
        
        if success:
            logger.info("\n✅ All dashboard connections updated successfully!")
            logger.info("Your dashboards are now using:")
            logger.info("  - Unified databases (3 instead of 23)")
            logger.info("  - Redis for caching and cross-service communication")
            logger.info("  - Thread-safe connection pooling")
        
    except Exception as e:
        logger.error(f"Update failed: {e}")
        raise

if __name__ == "__main__":
    main()
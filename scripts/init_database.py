#!/usr/bin/env python3
"""
Database initialization script for AI Finance Agency
Handles database setup, migrations, and initial data seeding
"""

import argparse
import logging
import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from database import init_database, check_database_health, Base, engine
from database.seed_data import seed_database
from database.utils import DatabaseManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def run_migrations():
    """Run database migrations using Alembic"""
    import subprocess
    
    try:
        logger.info("Running database migrations...")
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            cwd=str(project_root),
            check=True,
            capture_output=True,
            text=True
        )
        logger.info("Migrations completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Migration failed: {e.stderr}")
        return False
    except FileNotFoundError:
        logger.error("Alembic not found. Please install with: pip install alembic")
        return False


def create_tables():
    """Create all database tables"""
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to create tables: {e}")
        return False


def setup_database(use_migrations: bool = True, seed_data: bool = True):
    """
    Complete database setup
    
    Args:
        use_migrations: Whether to use Alembic migrations
        seed_data: Whether to seed initial data
    """
    logger.info("🚀 Starting database setup...")
    
    try:
        # Initialize database connections
        logger.info("Initializing database connections...")
        init_database()
        
        # Create tables (either via migrations or direct creation)
        if use_migrations:
            success = run_migrations()
        else:
            success = create_tables()
        
        if not success:
            logger.error("Failed to create database schema")
            return False
        
        # Verify database health
        health = check_database_health()
        if not health['healthy']:
            logger.error(f"Database health check failed: {health.get('error')}")
            return False
        
        logger.info("✅ Database schema created successfully")
        
        # Seed initial data
        if seed_data:
            logger.info("Seeding initial data...")
            seed_database(include_demo_data=True)
            logger.info("✅ Database seeded successfully")
        
        # Final health check and statistics
        db_info = DatabaseManager.get_database_info()
        logger.info(f"📊 Database statistics: {db_info.get('table_statistics', {})}")
        
        logger.info("🎉 Database setup completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Database setup failed: {e}")
        return False


def reset_database(confirm: bool = False):
    """
    Reset the entire database (DANGEROUS!)
    
    Args:
        confirm: Must be True to actually reset
    """
    if not confirm:
        logger.error("Database reset requires explicit confirmation")
        return False
    
    logger.warning("🚨 RESETTING DATABASE - ALL DATA WILL BE LOST!")
    
    try:
        # Initialize connections
        init_database()
        
        # Drop all tables
        logger.info("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        
        # Recreate tables
        logger.info("Recreating tables...")
        Base.metadata.create_all(bind=engine)
        
        # Seed data
        logger.info("Seeding fresh data...")
        seed_database(include_demo_data=True)
        
        logger.info("✅ Database reset completed")
        return True
        
    except Exception as e:
        logger.error(f"Database reset failed: {e}")
        return False


def check_database():
    """Check database health and display information"""
    logger.info("🔍 Checking database health...")
    
    try:
        init_database()
        health = check_database_health()
        
        if health['healthy']:
            logger.info("✅ Database is healthy")
            
            # Display statistics
            db_info = health.get('database_info', {})
            if 'table_statistics' in db_info:
                logger.info("📊 Table Statistics:")
                for table, count in db_info['table_statistics'].items():
                    logger.info(f"  {table}: {count} records")
            
            if 'database_size' in db_info:
                logger.info(f"💾 Database Size: {db_info['database_size']}")
            
            if 'connections' in db_info:
                conn = db_info['connections']
                logger.info(f"🔌 Connections: {conn['active']}/{conn['total']} active")
                
        else:
            logger.error("❌ Database health check failed")
            logger.error(f"Error: {health.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        logger.error(f"Failed to check database: {e}")
        return False
    
    return True


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="AI Finance Agency Database Management",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/init_database.py --setup          # Full setup with migrations
  python scripts/init_database.py --setup --no-migrations  # Setup without migrations
  python scripts/init_database.py --check          # Health check
  python scripts/init_database.py --reset --confirm  # Reset database (DANGEROUS!)
  python scripts/init_database.py --seed           # Seed data only
        """
    )
    
    parser.add_argument(
        "--setup", 
        action="store_true", 
        help="Setup database (create tables and seed data)"
    )
    parser.add_argument(
        "--check", 
        action="store_true", 
        help="Check database health and display statistics"
    )
    parser.add_argument(
        "--seed", 
        action="store_true", 
        help="Seed database with initial data"
    )
    parser.add_argument(
        "--reset", 
        action="store_true", 
        help="Reset database (WARNING: Deletes all data)"
    )
    parser.add_argument(
        "--confirm", 
        action="store_true", 
        help="Confirm dangerous operations like reset"
    )
    parser.add_argument(
        "--no-migrations", 
        action="store_true", 
        help="Skip Alembic migrations and create tables directly"
    )
    parser.add_argument(
        "--no-seed", 
        action="store_true", 
        help="Skip seeding initial data"
    )
    parser.add_argument(
        "--verbose", "-v", 
        action="store_true", 
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Validate environment
    if not os.getenv('DATABASE_URL') and not os.path.exists('.env'):
        logger.warning("No DATABASE_URL found and no .env file detected")
        logger.warning("Make sure database configuration is available")
    
    success = True
    
    try:
        if args.setup:
            success = setup_database(
                use_migrations=not args.no_migrations,
                seed_data=not args.no_seed
            )
        elif args.check:
            success = check_database()
        elif args.seed:
            init_database()
            seed_database(include_demo_data=True)
            logger.info("✅ Database seeding completed")
        elif args.reset:
            success = reset_database(confirm=args.confirm)
        else:
            # Default action - health check
            success = check_database()
        
    except KeyboardInterrupt:
        logger.info("Operation cancelled by user")
        success = False
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        success = False
    
    if success:
        logger.info("🎉 Operation completed successfully!")
        sys.exit(0)
    else:
        logger.error("❌ Operation failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
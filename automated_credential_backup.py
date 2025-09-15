#!/usr/bin/env python3
"""
Automated Credential Backup System
Daily automated backup of credentials and critical files with rotation
"""

import os
import json
import shutil
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
import subprocess

class AutomatedCredentialBackup:
    def __init__(self):
        self.project_root = Path("/Users/srijan/ai-finance-agency")
        self.backup_root = self.project_root / "backup"
        
        # Backup locations
        self.backup_locations = {
            'local_daily': self.backup_root / "daily",
            'local_weekly': self.backup_root / "weekly", 
            'local_monthly': self.backup_root / "monthly",
            'external_drive': Path("/Volumes/External/ai-finance-backup") if Path("/Volumes/External").exists() else None,
            'cloud_sync': self.project_root / "cloud_backup",  # For Dropbox/iCloud sync
            'git_backup': self.project_root / ".backup_git"     # Separate git repo for backups
        }
        
        # Critical files to backup
        self.critical_files = [
            '.env',
            'data/automated_posts.db',
            'data/credentials_backup_20250911_085114.json',
            'linkedin_credentials.json',
            'content_variety_history.json',
            'API_RATE_LIMITS_GUIDE.md'
        ]
        
        # Scripts to backup
        self.script_files = [
            'automated_posting_system.py',
            'social_media_verifier.py',
            'api_rate_limit_monitor.py',
            'platform_health_checker.py',
            'daily_analytics_report.py',
            'test_openai_content.py',
            'linkedin_token_reminder.py'
        ]
        
        # Data directories to backup
        self.data_directories = [
            'data/reports',
            'data/health_reports',
            'data/backups'
        ]
        
        # Retention policies (days)
        self.retention = {
            'daily': 30,    # Keep 30 daily backups
            'weekly': 90,   # Keep 12 weekly backups (3 months)
            'monthly': 365  # Keep 12 monthly backups (1 year)
        }
    
    def create_backup_directories(self):
        """Create backup directory structure"""
        for location_name, path in self.backup_locations.items():
            if path and location_name.startswith('local_'):
                path.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories for rotation
        for backup_type in ['daily', 'weekly', 'monthly']:
            (self.backup_locations[f'local_{backup_type}'] / 'credentials').mkdir(exist_ok=True)
            (self.backup_locations[f'local_{backup_type}'] / 'scripts').mkdir(exist_ok=True)
            (self.backup_locations[f'local_{backup_type}'] / 'data').mkdir(exist_ok=True)
    
    def backup_credentials(self, backup_dir):
        """Backup all credential files"""
        cred_backup_dir = backup_dir / 'credentials'
        
        for file_name in self.critical_files:
            source_file = self.project_root / file_name
            if source_file.exists():
                # Create subdirectories if needed
                dest_file = cred_backup_dir / file_name
                dest_file.parent.mkdir(parents=True, exist_ok=True)
                
                shutil.copy2(source_file, dest_file)
                print(f"  ✅ Backed up: {file_name}")
            else:
                print(f"  ⚠️ Missing: {file_name}")
    
    def backup_scripts(self, backup_dir):
        """Backup all Python scripts"""
        script_backup_dir = backup_dir / 'scripts'
        script_backup_dir.mkdir(parents=True, exist_ok=True)
        
        for file_name in self.script_files:
            source_file = self.project_root / file_name
            if source_file.exists():
                dest_file = script_backup_dir / file_name
                shutil.copy2(source_file, dest_file)
                print(f"  ✅ Backed up: {file_name}")
            else:
                print(f"  ⚠️ Missing: {file_name}")
    
    def backup_data_directories(self, backup_dir):
        """Backup data directories"""
        data_backup_dir = backup_dir / 'data'
        data_backup_dir.mkdir(parents=True, exist_ok=True)
        
        for dir_name in self.data_directories:
            source_dir = self.project_root / dir_name
            if source_dir.exists():
                dest_dir = data_backup_dir / dir_name
                if dest_dir.exists():
                    shutil.rmtree(dest_dir)
                shutil.copytree(source_dir, dest_dir)
                print(f"  ✅ Backed up directory: {dir_name}")
            else:
                print(f"  ⚠️ Missing directory: {dir_name}")
    
    def create_backup_manifest(self, backup_dir, backup_type):
        """Create manifest file with backup details"""
        manifest = {
            'backup_timestamp': datetime.now().isoformat(),
            'backup_type': backup_type,
            'backed_up_files': [],
            'system_info': {
                'hostname': subprocess.run(['hostname'], capture_output=True, text=True).stdout.strip(),
                'python_version': subprocess.run(['python3', '--version'], capture_output=True, text=True).stdout.strip(),
                'disk_usage': {}
            }
        }
        
        # Get disk usage
        try:
            disk_info = subprocess.run(['df', '-h', str(self.project_root)], 
                                     capture_output=True, text=True).stdout
            manifest['system_info']['disk_usage'] = disk_info
        except:
            pass
        
        # List all backed up files
        for root, dirs, files in os.walk(backup_dir):
            for file in files:
                if file != 'manifest.json':
                    file_path = Path(root) / file
                    relative_path = file_path.relative_to(backup_dir)
                    file_stats = file_path.stat()
                    
                    manifest['backed_up_files'].append({
                        'path': str(relative_path),
                        'size_bytes': file_stats.st_size,
                        'modified': datetime.fromtimestamp(file_stats.st_mtime).isoformat()
                    })
        
        # Save manifest
        manifest_file = backup_dir / 'manifest.json'
        with open(manifest_file, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print(f"  📄 Created manifest: {len(manifest['backed_up_files'])} files")
    
    def cleanup_old_backups(self, backup_type):
        """Remove old backups based on retention policy"""
        backup_dir = self.backup_locations[f'local_{backup_type}']
        retention_days = self.retention[backup_type]
        cutoff_date = datetime.now() - timedelta(days=retention_days)
        
        removed_count = 0
        
        if backup_dir.exists():
            for item in backup_dir.iterdir():
                if item.is_dir():
                    # Check if directory name contains timestamp
                    try:
                        dir_timestamp = item.name.split('_')[-1]
                        dir_date = datetime.strptime(dir_timestamp, '%Y%m%d')
                        
                        if dir_date < cutoff_date:
                            shutil.rmtree(item)
                            removed_count += 1
                    except (ValueError, IndexError):
                        # Skip directories that don't match expected pattern
                        continue
        
        if removed_count > 0:
            print(f"  🗑️ Cleaned up {removed_count} old {backup_type} backups")
    
    def run_daily_backup(self):
        """Run daily backup routine"""
        print("📦 DAILY CREDENTIAL BACKUP")
        print("=" * 50)
        print(f"Backup Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 50)
        
        # Create directories
        self.create_backup_directories()
        
        # Create daily backup directory
        backup_timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        daily_backup_dir = self.backup_locations['local_daily'] / f"backup_{backup_timestamp}"
        daily_backup_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"\n💾 Creating daily backup in: {daily_backup_dir}")
        
        # Backup credentials
        print("\\n📋 Backing up credentials...")
        self.backup_credentials(daily_backup_dir)
        
        # Backup scripts
        print("\\n🐍 Backing up scripts...")
        self.backup_scripts(daily_backup_dir)
        
        # Backup data directories
        print("\\n📊 Backing up data directories...")
        self.backup_data_directories(daily_backup_dir)
        
        # Create manifest
        print("\\n📄 Creating backup manifest...")
        self.create_backup_manifest(daily_backup_dir, 'daily')
        
        # Copy to weekly if it's Sunday
        if datetime.now().weekday() == 6:  # Sunday
            weekly_backup_dir = self.backup_locations['local_weekly'] / f"weekly_backup_{backup_timestamp}"
            shutil.copytree(daily_backup_dir, weekly_backup_dir)
            print(f"📅 Created weekly backup: {weekly_backup_dir}")
        
        # Copy to monthly if it's the 1st of the month
        if datetime.now().day == 1:
            monthly_backup_dir = self.backup_locations['local_monthly'] / f"monthly_backup_{backup_timestamp}"
            shutil.copytree(daily_backup_dir, monthly_backup_dir)
            print(f"🗓️ Created monthly backup: {monthly_backup_dir}")
        
        # Cleanup old backups
        print("\\n🧹 Cleaning up old backups...")
        self.cleanup_old_backups('daily')
        if datetime.now().weekday() == 6:
            self.cleanup_old_backups('weekly')
        if datetime.now().day == 1:
            self.cleanup_old_backups('monthly')
        
        # Try to sync to external locations
        self.sync_to_external_locations(daily_backup_dir)
        
        print(f"\\n✅ Daily backup completed successfully!")
        print(f"📁 Backup location: {daily_backup_dir}")
        
        return daily_backup_dir
    
    def sync_to_external_locations(self, source_backup_dir):
        """Sync backup to external locations"""
        print("\\n🌐 Syncing to external locations...")
        
        # Sync to cloud backup directory (for Dropbox/iCloud)
        cloud_dir = self.backup_locations['cloud_sync']
        if cloud_dir:
            cloud_dir.mkdir(exist_ok=True)
            cloud_backup = cloud_dir / f"latest_backup_{datetime.now().strftime('%Y%m%d')}"
            
            try:
                if cloud_backup.exists():
                    shutil.rmtree(cloud_backup)
                shutil.copytree(source_backup_dir, cloud_backup)
                print(f"  ☁️ Synced to cloud: {cloud_backup}")
            except Exception as e:
                print(f"  ⚠️ Cloud sync failed: {e}")
        
        # Sync to external drive if available
        external_dir = self.backup_locations['external_drive']
        if external_dir and external_dir.parent.exists():
            try:
                external_dir.mkdir(parents=True, exist_ok=True)
                external_backup = external_dir / f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                shutil.copytree(source_backup_dir, external_backup)
                print(f"  💽 Synced to external drive: {external_backup}")
            except Exception as e:
                print(f"  ⚠️ External drive sync failed: {e}")
    
    def verify_backup_integrity(self, backup_dir):
        """Verify backup integrity"""
        print(f"\\n🔍 Verifying backup integrity...")
        
        issues = []
        
        # Check manifest exists
        manifest_file = backup_dir / 'manifest.json'
        if not manifest_file.exists():
            issues.append("Missing manifest.json")
            return issues
        
        # Load manifest
        with open(manifest_file, 'r') as f:
            manifest = json.load(f)
        
        # Verify files in manifest exist
        for file_info in manifest['backed_up_files']:
            file_path = backup_dir / file_info['path']
            if not file_path.exists():
                issues.append(f"Missing file: {file_info['path']}")
            else:
                # Check file size
                actual_size = file_path.stat().st_size
                expected_size = file_info['size_bytes']
                if actual_size != expected_size:
                    issues.append(f"Size mismatch: {file_info['path']} (expected {expected_size}, got {actual_size})")
        
        # Verify critical files
        for critical_file in self.critical_files:
            expected_path = backup_dir / 'credentials' / critical_file
            if not expected_path.exists():
                issues.append(f"Missing critical file: {critical_file}")
        
        if issues:
            print(f"  ❌ Found {len(issues)} issues:")
            for issue in issues:
                print(f"    • {issue}")
        else:
            print(f"  ✅ Backup integrity verified: {len(manifest['backed_up_files'])} files OK")
        
        return issues
    
    def list_available_backups(self):
        """List all available backups"""
        print("📂 AVAILABLE BACKUPS")
        print("=" * 50)
        
        for backup_type in ['daily', 'weekly', 'monthly']:
            backup_dir = self.backup_locations[f'local_{backup_type}']
            print(f"\\n{backup_type.upper()} BACKUPS:")
            print("-" * 30)
            
            if backup_dir.exists():
                backups = sorted([d for d in backup_dir.iterdir() if d.is_dir()], 
                               key=lambda x: x.name, reverse=True)
                
                for backup in backups[:5]:  # Show last 5
                    manifest_file = backup / 'manifest.json'
                    if manifest_file.exists():
                        with open(manifest_file, 'r') as f:
                            manifest = json.load(f)
                        
                        timestamp = manifest['backup_timestamp']
                        file_count = len(manifest['backed_up_files'])
                        
                        print(f"  📦 {backup.name}")
                        print(f"      Created: {timestamp}")
                        print(f"      Files: {file_count}")
                    else:
                        print(f"  📦 {backup.name} (no manifest)")
                
                if len(backups) > 5:
                    print(f"  ... and {len(backups) - 5} more")
            else:
                print("  No backups found")

def create_cron_job():
    """Create cron job for daily backups"""
    cron_command = f"0 2 * * * cd {os.getcwd()} && /usr/bin/python3 automated_credential_backup.py --daily >> backup_cron.log 2>&1"
    
    print("📅 CRON JOB SETUP")
    print("=" * 30)
    print("Add this line to your crontab to run daily backups at 2:00 AM:")
    print()
    print(cron_command)
    print()
    print("To install:")
    print("1. Run: crontab -e")
    print("2. Add the line above")
    print("3. Save and exit")
    print()
    print("To verify: crontab -l")

def main():
    """Main execution"""
    backup_system = AutomatedCredentialBackup()
    
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--daily':
        # Called by cron job
        try:
            backup_dir = backup_system.run_daily_backup()
            issues = backup_system.verify_backup_integrity(backup_dir)
            if issues:
                print(f"❌ Backup completed with {len(issues)} issues")
                sys.exit(1)
            else:
                print("✅ Daily backup completed successfully")
                sys.exit(0)
        except Exception as e:
            print(f"❌ Backup failed: {e}")
            sys.exit(1)
    else:
        # Interactive mode
        print("🔐 AI Finance Agency - Automated Credential Backup")
        print("=" * 60)
        
        print("Select operation:")
        print("1. Run daily backup now")
        print("2. List available backups")
        print("3. Set up cron job")
        print("4. Verify latest backup")
        
        try:
            choice = input("\\nEnter choice (1-4): ").strip()
            
            if choice == '1':
                backup_dir = backup_system.run_daily_backup()
                backup_system.verify_backup_integrity(backup_dir)
            elif choice == '2':
                backup_system.list_available_backups()
            elif choice == '3':
                create_cron_job()
            elif choice == '4':
                # Find latest backup
                daily_dir = backup_system.backup_locations['local_daily']
                if daily_dir.exists():
                    backups = sorted([d for d in daily_dir.iterdir() if d.is_dir()], 
                                   key=lambda x: x.name, reverse=True)
                    if backups:
                        backup_system.verify_backup_integrity(backups[0])
                    else:
                        print("No backups found to verify")
                else:
                    print("No backup directory found")
            else:
                print("Invalid choice")
                
        except KeyboardInterrupt:
            print("\\n\\nOperation cancelled by user")

if __name__ == "__main__":
    main()
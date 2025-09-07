#!/usr/bin/env python3
"""
Bulletproof Scheduler with Multiple Fallbacks
"""

import schedule
import time
import subprocess
import os
from datetime import datetime
import threading
import sqlite3

class BulletproofScheduler:
    def __init__(self):
        self.running = True
        self.last_run = None
        
    def generate_content(self):
        """Generate content with error handling"""
        try:
            print(f"\n[{datetime.now()}] Starting content generation...")
            
            # Fix database locks first
            conn = sqlite3.connect('content.db', timeout=30.0)
            conn.execute("PRAGMA journal_mode=WAL")
            conn.close()
            
            # Run content generator
            result = subprocess.run(
                ['python3', 'elite_content_generator.py'],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                print("✅ Content generated successfully")
                self.last_run = datetime.now()
                
                # Trigger posting
                self.post_content()
            else:
                print(f"⚠️ Generation failed: {result.stderr}")
                
        except subprocess.TimeoutExpired:
            print("⚠️ Generation timed out - will retry")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def post_content(self):
        """Post to all platforms"""
        platforms = [
            'linkedin_simple_post.py',
            'twitter_auto_poster.py'
        ]
        
        for platform_script in platforms:
            if os.path.exists(platform_script):
                try:
                    subprocess.run(
                        ['python3', platform_script],
                        timeout=30
                    )
                    print(f"✅ Posted to {platform_script}")
                except:
                    print(f"⚠️ Failed to post to {platform_script}")
    
    def run(self):
        """Main scheduler loop with multiple timing strategies"""
        
        # Strategy 1: Schedule library (primary)
        schedule.every(6).hours.do(self.generate_content)
        schedule.every().day.at("09:00").do(self.generate_content)
        schedule.every().day.at("14:00").do(self.generate_content)
        schedule.every().day.at("19:00").do(self.generate_content)
        
        # Strategy 2: Backup timer thread
        def backup_timer():
            while self.running:
                time.sleep(21600)  # 6 hours
                if self.last_run:
                    time_since = (datetime.now() - self.last_run).seconds
                    if time_since > 21600:
                        print("\n⏰ Backup timer triggered")
                        self.generate_content()
        
        backup_thread = threading.Thread(target=backup_timer)
        backup_thread.daemon = True
        backup_thread.start()
        
        print("=" * 60)
        print("🚀 BULLETPROOF SCHEDULER STARTED")
        print("=" * 60)
        print("Schedule:")
        print("- Every 6 hours")
        print("- Daily at 9 AM, 2 PM, 7 PM")
        print("- Backup timer as failsafe")
        print("\nPress Ctrl+C to stop")
        print("=" * 60)
        
        # Generate immediately on start
        self.generate_content()
        
        # Main loop
        while self.running:
            try:
                schedule.run_pending()
                time.sleep(60)
            except KeyboardInterrupt:
                print("\n👋 Scheduler stopped")
                self.running = False
                break
            except Exception as e:
                print(f"⚠️ Loop error: {e}")
                time.sleep(60)

if __name__ == "__main__":
    scheduler = BulletproofScheduler()
    scheduler.run()

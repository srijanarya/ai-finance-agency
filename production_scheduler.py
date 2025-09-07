#!/usr/bin/env python3
"""
PRODUCTION SCHEDULER - Always Running, Always Generating
Works with built-in Python libraries only
"""

import time
import subprocess
import sys
import os
from datetime import datetime, timedelta
import threading
import json
from pathlib import Path

class ProductionScheduler:
    def __init__(self):
        self.running = True
        self.last_generation = None
        self.last_post = None
        self.generation_interval = 3600  # 1 hour
        self.posting_interval = 7200     # 2 hours
        
    def log(self, message, level="INFO"):
        """Unified logging"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
        # Also write to log file
        with open("production_scheduler.log", "a") as f:
            f.write(f"[{timestamp}] {level}: {message}\n")
    
    def generate_content(self):
        """Generate new content"""
        try:
            self.log("📝 Starting content generation...")
            
            # Run the elite content generator
            result = subprocess.run(
                [sys.executable, "elite_content_production.py"],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                self.log("✅ Content generated successfully")
                self.last_generation = datetime.now()
                return True
            else:
                self.log(f"⚠️ Generation failed: {result.stderr}", "WARNING")
                return False
                
        except subprocess.TimeoutExpired:
            self.log("⚠️ Generation timed out", "WARNING")
            return False
        except Exception as e:
            self.log(f"❌ Error generating content: {e}", "ERROR")
            return False
    
    def post_to_platforms(self):
        """Post content to all platforms"""
        posted = False
        
        # Check if we have content to post
        content_file = Path("elite_content_ready.json")
        if not content_file.exists():
            self.log("⚠️ No content ready to post", "WARNING")
            return False
        
        # Try LinkedIn
        try:
            self.log("📤 Posting to LinkedIn...")
            result = subprocess.run(
                [sys.executable, "linkedin_simple_post.py"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if "Successfully posted" in result.stdout or result.returncode == 0:
                self.log("✅ Posted to LinkedIn")
                posted = True
            else:
                self.log("⚠️ LinkedIn post may have failed", "WARNING")
                
        except Exception as e:
            self.log(f"⚠️ LinkedIn error: {e}", "WARNING")
        
        # Skip Twitter for now (timeout issues)
        # TODO: Fix Twitter integration with proper OAuth
        self.log("⏭️ Skipping Twitter (temporarily disabled - fixing OAuth)", "INFO")
        
        if posted:
            self.last_post = datetime.now()
            
        return posted
    
    def should_generate(self):
        """Check if it's time to generate new content"""
        if not self.last_generation:
            return True
        
        time_since = (datetime.now() - self.last_generation).total_seconds()
        return time_since >= self.generation_interval
    
    def should_post(self):
        """Check if it's time to post"""
        if not self.last_post:
            return True
            
        time_since = (datetime.now() - self.last_post).total_seconds()
        return time_since >= self.posting_interval
    
    def run_cycle(self):
        """Run one complete cycle"""
        try:
            # Generate content if needed
            if self.should_generate():
                success = self.generate_content()
                if success:
                    # Post immediately after generating
                    time.sleep(5)  # Small delay
                    self.post_to_platforms()
            
            # Post existing content if needed
            elif self.should_post():
                self.post_to_platforms()
                
        except Exception as e:
            self.log(f"❌ Cycle error: {e}", "ERROR")
    
    def run(self):
        """Main scheduler loop"""
        print("=" * 60)
        print("🚀 PRODUCTION SCHEDULER STARTED")
        print("=" * 60)
        print(f"⏰ Content Generation: Every {self.generation_interval//60} minutes")
        print(f"📤 Platform Posting: Every {self.posting_interval//60} minutes")
        print("\nPress Ctrl+C to stop")
        print("=" * 60)
        
        self.log("🚀 Production scheduler started")
        
        # Generate and post immediately on start
        self.log("📊 Initial generation and posting...")
        self.generate_content()
        time.sleep(5)
        self.post_to_platforms()
        
        # Main loop
        cycle_count = 0
        while self.running:
            try:
                cycle_count += 1
                
                # Show heartbeat every 10 cycles
                if cycle_count % 10 == 0:
                    self.log(f"💓 Scheduler alive - Cycle {cycle_count}")
                
                # Run the cycle
                self.run_cycle()
                
                # Sleep for 5 minutes between checks
                time.sleep(300)
                
            except KeyboardInterrupt:
                self.log("👋 Scheduler stopped by user")
                self.running = False
                break
            except Exception as e:
                self.log(f"❌ Loop error: {e}", "ERROR")
                time.sleep(60)  # Wait 1 minute on error

def main():
    """Entry point"""
    scheduler = ProductionScheduler()
    
    # Create a daemon thread to handle graceful shutdown
    def signal_handler():
        scheduler.running = False
    
    try:
        scheduler.run()
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
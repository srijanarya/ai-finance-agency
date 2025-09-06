#!/usr/bin/env python3
"""
Enhanced Multi-Platform Scheduler with Content Variety
Posts to LinkedIn, Telegram, and Twitter with unique content each time
"""

import time
import subprocess
import sys
import os
import json
import random
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

class EnhancedScheduler:
    def __init__(self):
        self.running = True
        self.last_generation = None
        self.last_posts = {
            'linkedin': None,
            'telegram': None,
            'twitter': None
        }
        self.generation_interval = 3600  # 1 hour
        self.posting_intervals = {
            'linkedin': 7200,    # 2 hours
            'telegram': 3600,     # 1 hour (more frequent, shorter posts)
            'twitter': 5400       # 1.5 hours
        }
        self.content_history = []
        self.max_history = 50  # Remember last 50 posts to avoid repetition
        
    def log(self, message, level="INFO"):
        """Unified logging"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
        # Write to log file
        with open("enhanced_scheduler.log", "a") as f:
            f.write(f"[{timestamp}] {level}: {message}\n")
    
    def load_content_history(self):
        """Load previous content to avoid repetition"""
        history_file = Path("content_history.json")
        if history_file.exists():
            try:
                with open(history_file, 'r') as f:
                    self.content_history = json.load(f)
            except:
                self.content_history = []
    
    def save_content_history(self):
        """Save content history"""
        with open("content_history.json", 'w') as f:
            json.dump(self.content_history[-self.max_history:], f)
    
    def is_content_unique(self, content):
        """Check if content is unique enough"""
        # Create content fingerprint
        content_hash = hashlib.md5(content.encode()).hexdigest()
        
        # Check if exact duplicate
        if content_hash in self.content_history:
            return False
        
        # Check for similar content (simple similarity check)
        content_words = set(content.lower().split())
        for prev_content in self.content_history[-20:]:  # Check last 20 posts
            if isinstance(prev_content, dict):
                prev_words = set(prev_content.get('content', '').lower().split())
            else:
                prev_words = set(str(prev_content).lower().split())
            
            # If more than 70% words are same, consider it repetitive
            if len(content_words) > 0:
                similarity = len(content_words & prev_words) / len(content_words)
                if similarity > 0.7:
                    return False
        
        return True
    
    def generate_varied_content(self):
        """Generate content with variety"""
        try:
            self.log("📝 Generating varied content...")
            
            # Randomly select content generator
            generators = [
                "elite_content_production.py",
                "humanized_content_generator.py",
                "intelligent_content_system.py",
                "pro_content_creator.py"
            ]
            
            # Filter available generators
            available_generators = [g for g in generators if os.path.exists(g)]
            
            if not available_generators:
                self.log("⚠️ No content generators found", "WARNING")
                return False
            
            # Choose random generator for variety
            generator = random.choice(available_generators)
            self.log(f"Using generator: {generator}")
            
            # Add variety parameters
            env = os.environ.copy()
            env['CONTENT_STYLE'] = random.choice(['educational', 'analytical', 'news', 'technical'])
            env['CONTENT_LENGTH'] = random.choice(['short', 'medium', 'long'])
            
            result = subprocess.run(
                [sys.executable, generator],
                capture_output=True,
                text=True,
                timeout=60,
                env=env
            )
            
            if result.returncode == 0:
                self.log("✅ Varied content generated successfully")
                self.last_generation = datetime.now()
                return True
            else:
                self.log(f"⚠️ Generation failed: {result.stderr}", "WARNING")
                return False
                
        except Exception as e:
            self.log(f"❌ Error generating content: {e}", "ERROR")
            return False
    
    def post_to_linkedin(self):
        """Post to LinkedIn"""
        try:
            self.log("📤 Posting to LinkedIn...")
            
            # Check content uniqueness
            content_file = Path("elite_content_ready.json")
            if content_file.exists():
                with open(content_file, 'r') as f:
                    content = json.load(f)
                    if not self.is_content_unique(content.get('content', '')):
                        self.log("⚠️ Content too similar to previous posts, skipping", "WARNING")
                        return False
            
            result = subprocess.run(
                [sys.executable, "linkedin_simple_post.py"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                self.log("✅ Posted to LinkedIn")
                self.last_posts['linkedin'] = datetime.now()
                
                # Save to history
                if content_file.exists():
                    with open(content_file, 'r') as f:
                        content = json.load(f)
                        self.content_history.append({
                            'platform': 'linkedin',
                            'content': content.get('content', ''),
                            'timestamp': datetime.now().isoformat()
                        })
                        self.save_content_history()
                return True
                
        except Exception as e:
            self.log(f"⚠️ LinkedIn error: {e}", "WARNING")
        return False
    
    def post_to_telegram(self):
        """Post shorter content to Telegram"""
        try:
            self.log("📱 Posting to Telegram...")
            
            # Use telegram auto poster
            result = subprocess.run(
                [sys.executable, "telegram_auto_poster.py"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if "Successfully posted" in result.stdout or result.returncode == 0:
                self.log("✅ Posted to Telegram")
                self.last_posts['telegram'] = datetime.now()
                return True
            else:
                self.log(f"⚠️ Telegram post failed: {result.stderr}", "WARNING")
                
        except Exception as e:
            self.log(f"⚠️ Telegram error: {e}", "WARNING")
        return False
    
    def should_post_to_platform(self, platform):
        """Check if it's time to post to specific platform"""
        if platform not in self.last_posts:
            return True
            
        if not self.last_posts[platform]:
            return True
            
        time_since = (datetime.now() - self.last_posts[platform]).total_seconds()
        return time_since >= self.posting_intervals.get(platform, 7200)
    
    def run_cycle(self):
        """Run one complete cycle"""
        try:
            # Generate content if needed
            if not self.last_generation or \
               (datetime.now() - self.last_generation).total_seconds() >= self.generation_interval:
                success = self.generate_varied_content()
                if success:
                    time.sleep(5)  # Small delay
            
            # Post to platforms based on their schedules
            if self.should_post_to_platform('linkedin'):
                self.post_to_linkedin()
            
            if self.should_post_to_platform('telegram'):
                self.post_to_telegram()
            
            # Twitter disabled for now (OAuth issues)
            # if self.should_post_to_platform('twitter'):
            #     self.post_to_twitter()
                
        except Exception as e:
            self.log(f"❌ Cycle error: {e}", "ERROR")
    
    def run(self):
        """Main scheduler loop"""
        print("=" * 60)
        print("🚀 ENHANCED MULTI-PLATFORM SCHEDULER")
        print("=" * 60)
        print("📅 Schedule:")
        print(f"  • Content Generation: Every {self.generation_interval//60} minutes")
        print(f"  • LinkedIn: Every {self.posting_intervals['linkedin']//60} minutes")
        print(f"  • Telegram: Every {self.posting_intervals['telegram']//60} minutes (shorter posts)")
        print(f"  • Twitter: Disabled (OAuth fix needed)")
        print("\n✨ Features:")
        print("  • Unique content generation")
        print("  • Multi-platform support")
        print("  • Content variety enforcement")
        print("\nPress Ctrl+C to stop")
        print("=" * 60)
        
        self.log("🚀 Enhanced scheduler started")
        
        # Load content history
        self.load_content_history()
        
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
                
                # Wait 1 minute before next check
                time.sleep(60)
                
            except KeyboardInterrupt:
                self.log("🛑 Shutdown requested")
                break
            except Exception as e:
                self.log(f"❌ Main loop error: {e}", "ERROR")
                time.sleep(60)

if __name__ == "__main__":
    scheduler = EnhancedScheduler()
    
    try:
        scheduler.run()
    except KeyboardInterrupt:
        print("\n🛑 Scheduler stopped")
    except Exception as e:
        print(f"❌ Fatal error: {e}")
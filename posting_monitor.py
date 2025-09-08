#!/usr/bin/env python3
"""
Posting Monitor and Recovery System
Ensures no scheduled posts are missed
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List
import pytz

class PostingMonitor:
    """Monitor and recover missed posts"""
    
    def __init__(self):
        self.ist = pytz.timezone('Asia/Kolkata')
        self.schedule_times = [
            {'hour': 9, 'minute': 0, 'name': '9 AM IST'},
            {'hour': 14, 'minute': 0, 'name': '2 PM IST'},
            {'hour': 19, 'minute': 0, 'name': '7 PM IST'},
            {'hour': 21, 'minute': 0, 'name': '9 PM IST'}
        ]
        self.history_file = 'posting_history.json'
        
    def load_history(self) -> Dict:
        """Load posting history"""
        if os.path.exists(self.history_file):
            with open(self.history_file, 'r') as f:
                return json.load(f)
        return {'posts': []}
    
    def save_history(self, history: Dict):
        """Save posting history"""
        with open(self.history_file, 'w') as f:
            json.dump(history, f, indent=2)
    
    def get_expected_posts_today(self) -> List[Dict]:
        """Get all posts that should have happened today"""
        now = datetime.now(self.ist)
        today = now.date()
        expected = []
        
        for schedule in self.schedule_times:
            post_time = self.ist.localize(datetime(
                today.year, today.month, today.day,
                schedule['hour'], schedule['minute']
            ))
            
            # Only include times that have passed
            if post_time <= now:
                expected.append({
                    'time': post_time.isoformat(),
                    'name': schedule['name'],
                    'hour': schedule['hour']
                })
        
        return expected
    
    def check_missed_posts(self) -> List[Dict]:
        """Check for any missed posts today"""
        history = self.load_history()
        expected = self.get_expected_posts_today()
        today = datetime.now(self.ist).date().isoformat()
        
        # Get today's posts from history
        today_posts = [
            p for p in history.get('posts', [])
            if p.get('date', '').startswith(today)
        ]
        
        # Find missed posts
        posted_hours = set()
        for post in today_posts:
            try:
                post_time = datetime.fromisoformat(post['timestamp'])
                posted_hours.add(post_time.hour)
            except:
                pass
        
        missed = []
        for expected_post in expected:
            if expected_post['hour'] not in posted_hours:
                missed.append(expected_post)
        
        return missed
    
    def record_post(self, platform: str, success: bool):
        """Record a successful post"""
        history = self.load_history()
        now = datetime.now(self.ist)
        
        post_record = {
            'timestamp': now.isoformat(),
            'date': now.date().isoformat(),
            'hour': now.hour,
            'platform': platform,
            'success': success
        }
        
        history['posts'].append(post_record)
        
        # Keep only last 30 days
        cutoff = (now - timedelta(days=30)).isoformat()
        history['posts'] = [
            p for p in history['posts']
            if p.get('timestamp', '') > cutoff
        ]
        
        self.save_history(history)
    
    def generate_status_report(self) -> str:
        """Generate a status report"""
        missed = self.check_missed_posts()
        now = datetime.now(self.ist)
        
        report = f"""
📊 POSTING STATUS REPORT
========================
Time: {now.strftime('%B %d, %Y %I:%M %p IST')}

📅 Today's Schedule:
- 9:00 AM IST
- 2:00 PM IST  
- 7:00 PM IST
- 9:00 PM IST

"""
        
        if missed:
            report += f"⚠️ MISSED POSTS TODAY: {len(missed)}\n"
            for post in missed:
                report += f"  ❌ {post['name']}\n"
            report += "\n🔧 Action Required: Run recovery posts\n"
        else:
            report += "✅ All scheduled posts completed!\n"
        
        # Next scheduled post
        for schedule in self.schedule_times:
            post_time = self.ist.localize(datetime(
                now.year, now.month, now.day,
                schedule['hour'], schedule['minute']
            ))
            if post_time > now:
                time_until = post_time - now
                hours = int(time_until.total_seconds() // 3600)
                minutes = int((time_until.total_seconds() % 3600) // 60)
                report += f"\n⏰ Next post: {schedule['name']} (in {hours}h {minutes}m)"
                break
        
        return report
    
    def should_post_now(self) -> bool:
        """Check if we should post now (within 15 min window of scheduled time)"""
        now = datetime.now(self.ist)
        current_hour = now.hour
        current_minute = now.minute
        
        for schedule in self.schedule_times:
            # Check if we're within 15 minutes of a scheduled time
            if schedule['hour'] == current_hour:
                if abs(schedule['minute'] - current_minute) <= 15:
                    return True
            # Handle edge case of top of hour
            elif schedule['hour'] == current_hour - 1 and schedule['minute'] >= 45:
                if current_minute <= 15:
                    return True
        
        return False


def main():
    """Run monitoring check"""
    monitor = PostingMonitor()
    
    print("=" * 60)
    print("🔍 POST MONITORING SYSTEM")
    print("=" * 60)
    
    # Check for missed posts
    missed = monitor.check_missed_posts()
    
    if missed:
        print(f"\n⚠️ ALERT: {len(missed)} posts missed today!")
        for post in missed:
            print(f"  ❌ {post['name']}")
        
        print("\n🚀 Initiating recovery...")
        print("Run: python cloud_poster.py")
        
        # Could automatically trigger recovery here
        import subprocess
        response = input("\nRecover missed posts now? (y/n): ")
        if response.lower() == 'y':
            subprocess.run(['python', 'cloud_poster.py'])
            print("✅ Recovery complete!")
    else:
        print("\n✅ All posts on schedule!")
    
    # Show full report
    print(monitor.generate_status_report())
    
    # Check if we should post now
    if monitor.should_post_now():
        print("\n🔔 REMINDER: Within posting window now!")


if __name__ == "__main__":
    main()
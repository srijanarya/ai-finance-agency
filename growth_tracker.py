#!/usr/bin/env python3
"""
Growth Tracker - Monitor subscriber growth and engagement
"""

import requests
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import sqlite3

load_dotenv()

class GrowthTracker:
    def __init__(self):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.channel = '@AIFinanceNews2024'
        self.db_path = 'data/growth_metrics.db'
        self.init_database()
    
    def init_database(self):
        """Initialize growth tracking database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS growth_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                subscribers INTEGER,
                posts_today INTEGER,
                engagement_rate FLOAT,
                revenue FLOAT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS content_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                content_type TEXT,
                views INTEGER,
                shares INTEGER
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def get_channel_stats(self):
        """Get current channel statistics"""
        url = f'https://api.telegram.org/bot{self.bot_token}/getChatMemberCount'
        params = {'chat_id': self.channel}
        
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            if data['ok']:
                return data['result']
        return 0
    
    def track_growth(self):
        """Track and display growth metrics"""
        subscribers = self.get_channel_stats()
        
        # Save to database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO growth_metrics (subscribers, posts_today, engagement_rate, revenue)
            VALUES (?, ?, ?, ?)
        ''', (subscribers, 0, 0, 0))
        
        conn.commit()
        
        # Get growth rate
        cursor.execute('''
            SELECT subscribers, timestamp 
            FROM growth_metrics 
            ORDER BY timestamp DESC 
            LIMIT 2
        ''')
        
        results = cursor.fetchall()
        
        growth_rate = 0
        if len(results) == 2:
            current = results[0][0]
            previous = results[1][0]
            if previous > 0:
                growth_rate = ((current - previous) / previous) * 100
        
        conn.close()
        
        return {
            'current_subscribers': subscribers,
            'growth_rate': growth_rate,
            'target': 500,
            'progress': (subscribers / 500) * 100
        }
    
    def generate_growth_report(self):
        """Generate comprehensive growth report"""
        stats = self.track_growth()
        
        report = f"""
📊 **GROWTH REPORT** - {datetime.now().strftime('%Y-%m-%d %H:%M')}
{'='*50}

📈 **Current Status:**
• Subscribers: {stats['current_subscribers']}/500 ({stats['progress']:.1f}%)
• Growth Rate: {stats['growth_rate']:.1f}%
• To Goal: {500 - stats['current_subscribers']} subscribers needed

📅 **Projected Timeline:**
"""
        
        # Calculate projection
        if stats['growth_rate'] > 0:
            days_to_goal = (500 - stats['current_subscribers']) / (stats['current_subscribers'] * stats['growth_rate'] / 100)
            report += f"• Days to 500: {days_to_goal:.1f} days\n"
            report += f"• Expected date: {(datetime.now() + timedelta(days=days_to_goal)).strftime('%Y-%m-%d')}\n"
        else:
            report += "• Need more data for projection\n"
        
        report += f"""
💰 **Monetization Readiness:**
• ✅ Channel active
• {'✅' if stats['current_subscribers'] > 100 else '⏳'} 100+ subscribers
• {'✅' if stats['current_subscribers'] > 250 else '⏳'} 250+ subscribers (premium ready)
• {'✅' if stats['current_subscribers'] >= 500 else '⏳'} 500 subscribers (launch paid)

🎯 **Next Actions:**
"""
        
        if stats['current_subscribers'] < 100:
            report += """
1. Share in 5 more WhatsApp groups
2. Post on Reddit India investing subs
3. Create viral "leaked signal" post
"""
        elif stats['current_subscribers'] < 250:
            report += """
1. Launch referral program
2. Share success screenshots
3. Partner with micro-influencers
"""
        elif stats['current_subscribers'] < 500:
            report += """
1. Announce "going paid soon"
2. Offer early-bird pricing
3. Collect testimonials
"""
        else:
            report += """
1. Launch premium tier
2. Reach out to business clients
3. Scale content production
"""
        
        return report
    
    def post_growth_update(self):
        """Post growth update to channel"""
        stats = self.track_growth()
        
        if stats['current_subscribers'] % 50 == 0:  # Milestone posts
            message = f"""
🎉 **MILESTONE ALERT!**

We just hit {stats['current_subscribers']} members!

Thank you for trusting our AI-powered signals.

{'🔥 SPECIAL: Next 24 hours, referring 3 friends gets you VIP access!' if stats['current_subscribers'] < 500 else '🎯 Premium tier launching tomorrow!'}

Growing fast: @AIFinanceNews2024
"""
            
            url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
            data = {
                'chat_id': self.channel,
                'text': message,
                'parse_mode': 'Markdown'
            }
            
            requests.post(url, json=data)
            return True
        
        return False

def main():
    tracker = GrowthTracker()
    
    print("📊 GROWTH TRACKER")
    print("="*50)
    
    # Generate and display report
    report = tracker.generate_growth_report()
    print(report)
    
    # Check for milestone
    if tracker.post_growth_update():
        print("\n✅ Milestone update posted!")
    
    # Save report
    with open('growth_report.txt', 'w') as f:
        f.write(report)
    
    print("\n📁 Report saved to growth_report.txt")

if __name__ == "__main__":
    main()
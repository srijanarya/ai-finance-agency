#!/usr/bin/env python3
"""
Viral Content Templates for Social Media Growth
Generates engaging posts for different platforms
"""

import random
from datetime import datetime
import requests
import os
from dotenv import load_dotenv

load_dotenv()

class ViralContentGenerator:
    def __init__(self):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.channel = '@AIFinanceNews2024'
        
        # Engagement hooks
        self.hooks = [
            "🚨 BREAKING:",
            "📊 EXCLUSIVE:",
            "🔥 ALERT:",
            "💎 HIDDEN GEM:",
            "🎯 AI PREDICTION:",
            "⚡ JUST IN:",
            "🚀 MOON ALERT:",
        ]
        
        # Call-to-actions
        self.ctas = [
            "Join before we go paid: @AIFinanceNews2024",
            "Free for next 100 members only: @AIFinanceNews2024",
            "Get daily signals: @AIFinanceNews2024",
            "Don't miss tomorrow's pick: @AIFinanceNews2024",
            "Turn on notifications 🔔 @AIFinanceNews2024"
        ]
    
    def generate_fomo_post(self):
        """Generate FOMO-inducing content"""
        templates = [
            f"{random.choice(self.hooks)} Our AI detected unusual options activity in RELIANCE\n\n"
            f"📈 Smart money is accumulating\n"
            f"🎯 Target: ₹3,200 (15% upside)\n"
            f"⏰ Entry window: Next 2 hours\n\n"
            f"Full analysis for members only.\n"
            f"{random.choice(self.ctas)}",
            
            f"Member #127 just messaged:\n"
            f'"Your HDFC Bank call gave me ₹15,000 profit!"\n\n'
            f"Yesterday: HDFC Bank ✅ +3.2%\n"
            f"Today's pick drops at 3:30 PM\n\n"
            f"{random.choice(self.ctas)}",
            
            f"🤖 AI scanned 5,000 stocks\n\n"
            f"Found only 3 with breakout patterns.\n"
            f"Accuracy rate: 78% over last 30 days\n\n"
            f"Getting the list?\n"
            f"{random.choice(self.ctas)}"
        ]
        return random.choice(templates)
    
    def generate_authority_post(self):
        """Build authority and credibility"""
        week_performance = [
            ("Monday", "TCS", "+2.3%", "✅"),
            ("Tuesday", "INFY", "+1.8%", "✅"),
            ("Wednesday", "WIPRO", "-0.5%", "❌"),
            ("Thursday", "HDFCBANK", "+3.1%", "✅"),
            ("Friday", "ICICIBANK", "+2.7%", "✅")
        ]
        
        post = "📊 This Week's AI Signal Performance\n\n"
        for day, stock, return_pct, status in week_performance:
            post += f"{day}: {stock} {status} {return_pct}\n"
        
        post += f"\n✅ Success Rate: 80% (4/5)\n"
        post += f"💰 Avg Return: +1.9%\n\n"
        post += f"Next week's signals start Monday 9 AM\n"
        post += f"{random.choice(self.ctas)}"
        
        return post
    
    def generate_whatsapp_share(self):
        """Generate WhatsApp-friendly content"""
        messages = [
            f"*🚀 Free AI Trading Signals!*\n\n"
            f"My friend just launched this:\n"
            f"https://t.me/AIFinanceNews2024\n\n"
            f"✅ Daily stock picks\n"
            f"✅ IPO analysis\n"
            f"✅ Market predictions\n\n"
            f"It's FREE but only for first 500 members.\n"
            f"Already 200+ joined today!",
            
            f"*Guys, check this out! 🔥*\n\n"
            f"AI-powered trading channel:\n"
            f"https://t.me/AIFinanceNews2024\n\n"
            f"Yesterday they predicted RELIANCE crash\n"
            f"Saved me from huge loss! 🙏\n\n"
            f"Join fast, going paid soon!"
        ]
        return random.choice(messages)
    
    def generate_reddit_post(self):
        """Generate Reddit-style valuable content"""
        return """
### AI Analysis: Why RELIANCE might bounce back next week

I've been running an AI model that analyzes market patterns, and it's showing interesting signals for RELIANCE:

**Technical Indicators:**
- RSI oversold at 28 (bounce likely)
- Strong support at ₹2,800 level  
- Volume spike indicates accumulation

**Fundamental Triggers:**
- Jio tariff hikes taking effect
- Retail expansion on track
- Green energy investments paying off

**AI Prediction:** 70% probability of 5-7% bounce within 5 trading days

*Note: Not financial advice. I share more detailed analysis on my Telegram if anyone's interested (check profile).*

What's your view on RELIANCE?
"""
    
    def generate_urgency_post(self):
        """Create urgency for immediate action"""
        posts = [
            f"⏰ LAST 50 FREE SPOTS!\n\n"
            f"At 500 members, we go paid (₹2,999/month)\n"
            f"Currently at: 451 members\n\n"
            f"Join in next hour:\n"
            f"@AIFinanceNews2024",
            
            f"🎁 WEEKEND SPECIAL\n\n"
            f"Next 24 hours only:\n"
            f"✅ Join free\n"
            f"✅ Get Monday's premium pick\n"
            f"✅ Access to VIP trial\n\n"
            f"@AIFinanceNews2024"
        ]
        return random.choice(posts)
    
    def post_to_telegram(self, content):
        """Post content to Telegram channel"""
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': content,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(url, json=data)
        return response.status_code == 200
    
    def execute_growth_blast(self):
        """Execute a growth campaign blast"""
        print("🚀 EXECUTING GROWTH BLAST")
        print("="*50)
        
        # Generate all content types
        contents = [
            ("FOMO Post", self.generate_fomo_post()),
            ("Authority Post", self.generate_authority_post()),
            ("Urgency Post", self.generate_urgency_post())
        ]
        
        for content_type, content in contents:
            print(f"\n📱 {content_type}:")
            print("-"*30)
            print(content)
            print()
            
            if self.post_to_telegram(content):
                print(f"✅ Posted {content_type}")
            else:
                print(f"⚠️ Failed to post {content_type}")
            
            import time
            time.sleep(300)  # 5 minutes between posts
        
        # Generate shareable content
        print("\n📤 SHAREABLE CONTENT FOR OTHER PLATFORMS:")
        print("="*50)
        
        print("\n📱 WhatsApp Message:")
        print("-"*30)
        print(self.generate_whatsapp_share())
        
        print("\n📱 Reddit Post:")
        print("-"*30)
        print(self.generate_reddit_post())

def main():
    generator = ViralContentGenerator()
    
    print("🎯 VIRAL CONTENT GENERATOR")
    print("="*50)
    print("\nOptions:")
    print("1. Generate FOMO post")
    print("2. Generate authority post")
    print("3. Generate urgency post")
    print("4. Generate WhatsApp share message")
    print("5. Generate Reddit post")
    print("6. Execute full growth blast")
    
    # For automated execution, let's do a growth blast
    generator.execute_growth_blast()

if __name__ == "__main__":
    main()
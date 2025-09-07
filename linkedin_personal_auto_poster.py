#!/usr/bin/env python3
"""
LinkedIn Personal Account Auto-Poster
Uses the working personal account credentials
"""

import os
import sys
import time
import random
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
import yfinance as yf

# Load environment
load_dotenv()

class LinkedInPersonalPoster:
    def __init__(self):
        # Personal account credentials (these were working last night)
        self.client_id = os.getenv('LINKEDIN_PERSONAL_CLIENT_ID')
        self.client_secret = os.getenv('LINKEDIN_PERSONAL_CLIENT_SECRET')
        self.access_token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN')
        
        # Your personal URN - srijan-arya-a0a50693
        self.person_urn = os.getenv('LINKEDIN_PERSON_URN', 'urn:li:member:a0a50693')
        
        self.post_count = 0
        
    def get_market_insights(self):
        """Get professional market insights"""
        try:
            indices = {
                'NIFTY 50': '^NSEI',
                'SENSEX': '^BSESN',
                'Bank Nifty': '^NSEBANK'
            }
            
            insights = []
            for name, symbol in indices.items():
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="1d")
                    if not hist.empty:
                        close = hist['Close'].iloc[-1]
                        change = ((close - hist['Open'].iloc[0]) / hist['Open'].iloc[0]) * 100
                        emoji = "📈" if change > 0 else "📉"
                        insights.append(f"{emoji} {name}: {close:,.0f} ({change:+.2f}%)")
                except:
                    pass
            
            return "\n".join(insights) if insights else "Markets showing opportunity"
        except:
            return "Global markets in focus"
    
    def generate_content(self):
        """Generate LinkedIn-appropriate professional content"""
        hour = datetime.now().hour
        market_insights = self.get_market_insights()
        
        templates = [
            # Market Analysis
            f"""📊 Market Pulse | {datetime.now().strftime('%B %d, %Y')}

{market_insights}

💡 Key Insight: Markets reward patience and discipline over impulse and emotion.

In today's volatile environment, successful investors focus on:
• Risk-adjusted returns
• Diversification across assets
• Long-term wealth creation

What's your investment strategy for the current market?

#StockMarket #InvestmentStrategy #FinancialMarkets #WealthCreation""",

            # Trading Wisdom
            f"""🎯 Trading Wisdom for Today

"The stock market is filled with individuals who know the price of everything, but the value of nothing." - Philip Fisher

{market_insights}

Remember: 
✅ Trade what you see, not what you think
✅ Risk management is wealth management
✅ Consistency beats intensity

Share your best trading lesson below!

#Trading #MarketWisdom #FinancialEducation #InvestmentPhilosophy""",

            # Educational Content
            f"""📚 Financial Literacy Moment

Understanding Risk-Reward Ratio:

A 1:3 risk-reward means risking ₹1 to potentially gain ₹3.

Why it matters:
• Win rate of just 30% can still be profitable
• Protects capital during losing streaks
• Creates asymmetric returns in your favor

Current Market Context:
{market_insights}

How do you calculate risk-reward in your trades?

#FinancialLiteracy #RiskManagement #TradingEducation #PersonalFinance""",

            # Motivation & Mindset
            f"""💪 Investor Mindset

The difference between successful and unsuccessful investors isn't knowledge—it's discipline.

Today's Market:
{market_insights}

Success principles:
1. Have a plan before you invest
2. Stick to your strategy during volatility
3. Learn from losses, don't repeat them
4. Stay invested for compound growth

Your wealth journey is a marathon, not a sprint.

#InvestorMindset #WealthBuilding #FinancialFreedom #LongTermInvesting""",

            # Market Opportunities
            f"""🔍 Spotting Opportunities in Today's Market

{market_insights}

Smart money is watching:
• IT sector for global cues
• Banking for rate cycle impact
• Auto for festive demand
• FMCG for rural recovery

Remember: The best time to plant a tree was 20 years ago. The second best time is now.

What sectors are you bullish on?

#MarketOpportunity #SectorAnalysis #InvestmentIdeas #StockPicks"""
        ]
        
        return random.choice(templates)
    
    def post_to_linkedin(self, content):
        """Post content to LinkedIn personal profile"""
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            # LinkedIn API payload for personal posts
            data = {
                "author": self.person_urn,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": content
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            # Post to LinkedIn
            response = requests.post(
                'https://api.linkedin.com/v2/ugcPosts',
                headers=headers,
                json=data
            )
            
            if response.status_code == 201:
                self.post_count += 1
                post_id = response.headers.get('X-RestLi-Id', 'unknown')
                print(f"✅ Posted to LinkedIn Personal Profile (Post #{self.post_count})")
                print(f"   Post ID: {post_id}")
                return True
            else:
                print(f"❌ LinkedIn API error: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error posting to LinkedIn: {e}")
            return False
    
    def run_automation(self):
        """Main automation loop"""
        print("=" * 70)
        print("💼 LINKEDIN PERSONAL AUTO-POSTER")
        print("=" * 70)
        print("Posting professional finance content every 45-60 minutes")
        print("Press Ctrl+C to stop")
        print("=" * 70)
        
        # Post immediately on start
        print("\n📝 Generating first post...")
        content = self.generate_content()
        print("-" * 50)
        print(content[:200] + "..." if len(content) > 200 else content)
        print("-" * 50)
        
        if self.post_to_linkedin(content):
            print(f"📊 Total posts: {self.post_count}")
        else:
            print("⚠️ Will retry next cycle")
        
        while True:
            try:
                # Wait 45-60 minutes
                wait_time = random.randint(2700, 3600)  # 45-60 minutes
                print(f"⏰ Next post in {wait_time//60} minutes...")
                print("=" * 70)
                
                time.sleep(wait_time)
                
                # Generate and post content
                content = self.generate_content()
                
                print(f"\n📝 Posting at {datetime.now().strftime('%H:%M:%S')}...")
                print("-" * 50)
                print(content[:200] + "..." if len(content) > 200 else content)
                print("-" * 50)
                
                if self.post_to_linkedin(content):
                    print(f"📊 Total posts today: {self.post_count}")
                else:
                    print("⚠️ Will retry next cycle")
                
            except KeyboardInterrupt:
                print(f"\n\n👋 Stopping LinkedIn poster...")
                print(f"📊 Total posts: {self.post_count}")
                break
            except Exception as e:
                print(f"Error: {e}")
                print("Retrying in 10 minutes...")
                time.sleep(600)

if __name__ == "__main__":
    # Quick test mode
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        print("\n🧪 TEST MODE - Posting once and exiting")
        poster = LinkedInPersonalPoster()
        content = poster.generate_content()
        print("\nGenerated content:")
        print(content)
        print("\nAttempting to post...")
        if poster.post_to_linkedin(content):
            print("✅ Test successful!")
        else:
            print("❌ Test failed - check credentials or URN")
    else:
        # Normal automation mode
        poster = LinkedInPersonalPoster()
        poster.run_automation()
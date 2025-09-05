#!/usr/bin/env python3
"""
LinkedIn Company Auto-Poster for Treum Algotech
Posts professional finance content to company page
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

class LinkedInCompanyPoster:
    def __init__(self):
        # Company credentials
        self.client_id = os.getenv('LINKEDIN_COMPANY_CLIENT_ID')
        self.client_secret = os.getenv('LINKEDIN_COMPANY_CLIENT_SECRET')
        self.access_token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
        
        # You'll need to get this - it's your company URN
        # Format: urn:li:organization:YOUR_COMPANY_ID
        self.company_urn = os.getenv('LINKEDIN_COMPANY_URN', 'urn:li:organization:98986419')
        
        self.post_count = 0
        
    def get_market_insights(self):
        """Get professional market insights"""
        try:
            # Get major indices
            indices = {
                'S&P 500': '^GSPC',
                'NASDAQ': '^IXIC',
                'NIFTY 50': '^NSEI',
                'SENSEX': '^BSESN'
            }
            
            insights = []
            for name, symbol in indices.items():
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="1d")
                    if not hist.empty:
                        close = hist['Close'].iloc[-1]
                        change = ((close - hist['Open'].iloc[0]) / hist['Open'].iloc[0]) * 100
                        insights.append(f"{name}: {close:,.2f} ({change:+.2f}%)")
                except:
                    pass
            
            return "\n• ".join(insights) if insights else "Markets showing mixed signals"
        except:
            return "Global markets in focus"
    
    def generate_professional_content(self):
        """Generate LinkedIn-appropriate professional content"""
        hour = datetime.now().hour
        market_insights = self.get_market_insights()
        
        templates = [
            # Market Analysis
            f"""🌍 Global Market Pulse | {datetime.now().strftime('%B %d, %Y')}

Today's market movements reflect evolving investor sentiment:

• {market_insights}

Key Takeaway: In volatile markets, disciplined asset allocation and risk management separate successful investors from the crowd.

At Treum Algotech, we leverage AI-driven analytics to identify opportunities others miss.

What's your market outlook for the coming week?

#FinancialMarkets #InvestmentStrategy #MarketAnalysis #WealthManagement #FinTech""",

            # Thought Leadership
            f"""💡 The Future of Finance is Here

Artificial Intelligence is revolutionizing investment strategies:

✓ Pattern recognition across millions of data points
✓ Real-time risk assessment and portfolio optimization
✓ Predictive analytics for market movements
✓ Automated execution with human oversight

The question isn't whether to adopt AI in finance, but how quickly you can integrate it into your investment process.

How is your organization leveraging AI for better financial outcomes?

#ArtificialIntelligence #FinTech #Innovation #DigitalTransformation #FutureOfFinance""",

            # Educational Content
            f"""📊 Investment Insight: Understanding Market Volatility

Volatility isn't your enemy—it's an opportunity in disguise.

Consider this framework:
1. High volatility = Higher option premiums
2. Market corrections = Entry points for quality assets
3. Sector rotation = Rebalancing opportunities

Smart investors don't fear volatility; they prepare for it with:
• Diversified portfolios
• Defined risk parameters
• Systematic rebalancing
• Long-term perspective

Remember: Time in the market beats timing the market.

#InvestmentEducation #PortfolioManagement #RiskManagement #FinancialLiteracy""",

            # Industry Insights
            f"""🚀 Emerging Trends Shaping Financial Markets

Three megatrends every investor should watch:

1. Digital Asset Integration
   - CBDCs gaining traction globally
   - Institutional crypto adoption accelerating

2. ESG Investment Surge
   - $35+ trillion in sustainable investments
   - Performance matching traditional portfolios

3. AI-Powered Trading
   - 80% of trades now algorithmic
   - Retail access to institutional-grade tools

The convergence of these trends is creating unprecedented opportunities.

Which trend do you see having the biggest impact?

#EmergingMarkets #DigitalAssets #ESGInvesting #TechInFinance""",

            # Success Stories
            f"""📈 Case Study: The Power of Systematic Investing

One of our clients started with systematic investment planning:
• Initial: ₹25,000/month
• Duration: 5 years
• Strategy: Diversified equity portfolio

Results:
• Total invested: ₹15 lakhs
• Current value: ₹24.3 lakhs
• CAGR: 18.7%

The secret? Consistency, discipline, and staying invested through market cycles.

Your wealth journey starts with the first step. When will you take yours?

#WealthCreation #SystematicInvestment #SuccessStory #FinancialPlanning"""
        ]
        
        return random.choice(templates)
    
    def post_to_linkedin(self, content):
        """Post content to LinkedIn Company page"""
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            # LinkedIn API payload for company posts
            data = {
                "author": self.company_urn,
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
                print(f"✅ Posted to LinkedIn Company Page (Post #{self.post_count})")
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
        print("🏢 LINKEDIN COMPANY AUTO-POSTER")
        print("Company: Treum Algotech")
        print("=" * 70)
        print("Posting professional finance content every 45-60 minutes")
        print("Press Ctrl+C to stop")
        print("=" * 70)
        
        while True:
            try:
                # Generate professional content
                content = self.generate_professional_content()
                
                # Preview
                print(f"\n📝 Posting at {datetime.now().strftime('%H:%M:%S')}...")
                print("-" * 50)
                print(content[:200] + "..." if len(content) > 200 else content)
                print("-" * 50)
                
                # Post to LinkedIn
                if self.post_to_linkedin(content):
                    print(f"📊 Total posts today: {self.post_count}")
                else:
                    print("⚠️ Will retry next cycle")
                
                # Wait 45-60 minutes
                wait_time = random.randint(2700, 3600)  # 45-60 minutes
                print(f"⏰ Next post in {wait_time//60} minutes...")
                print("=" * 70)
                
                time.sleep(wait_time)
                
            except KeyboardInterrupt:
                print("\n\n👋 Stopping LinkedIn Company poster...")
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
        poster = LinkedInCompanyPoster()
        content = poster.generate_professional_content()
        print("\nGenerated content:")
        print(content)
        print("\nAttempting to post...")
        if poster.post_to_linkedin(content):
            print("✅ Test successful!")
        else:
            print("❌ Test failed - check credentials")
    else:
        # Normal automation mode
        poster = LinkedInCompanyPoster()
        poster.run_automation()
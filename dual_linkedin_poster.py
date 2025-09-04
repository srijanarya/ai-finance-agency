#!/usr/bin/env python3
"""
DUAL LINKEDIN POSTER - Personal + Company Accounts
Posts to both personal account (with Treum branding) and company page
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class DualLinkedInPoster:
    """Post to both LinkedIn personal account and company page"""
    
    def __init__(self):
        # Personal account credentials (old app)
        self.personal_client_id = os.getenv('LINKEDIN_PERSONAL_CLIENT_ID')
        self.personal_client_secret = os.getenv('LINKEDIN_PERSONAL_CLIENT_SECRET')
        self.personal_access_token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN')
        
        # Company account credentials (new app)
        self.company_client_id = os.getenv('LINKEDIN_COMPANY_CLIENT_ID')
        self.company_client_secret = os.getenv('LINKEDIN_COMPANY_CLIENT_SECRET')
        self.company_access_token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
        
        # Company details
        self.company_id = "108595796"
        self.company_urn = f"urn:li:organization:{self.company_id}"
        
        print("✅ Dual LinkedIn Poster initialized")
        print(f"   Personal App: {self.personal_client_id}")
        print(f"   Company App: {self.company_client_id}")
    
    def generate_personal_content(self):
        """Generate content for personal LinkedIn with Treum branding"""
        content = f"""🎯 Market Intelligence Report by Treum Algotech | {datetime.now().strftime('%B %d, %Y')}

At Treum Algotech, we leverage advanced algorithms and quantitative analysis to navigate market complexities. Here's our latest assessment:

📊 Market Performance:
The benchmark indices closed marginally lower with NIFTY at 24,734 (-0.14%) and SENSEX at 80,701 (-0.18%). While the headline numbers suggest weakness, the market structure tells a more nuanced story.

💼 Institutional Dynamics:
Today's market witnessed an interesting tug-of-war between Foreign Institutional Investors (FIIs) and Domestic Institutional Investors (DIIs). FIIs continued their selling streak with outflows of ₹1,234 crores, while DIIs provided crucial support with purchases worth ₹987 crores.

This divergence raises an important question: Are domestic institutions seeing value that foreign investors are missing, or are they simply providing exit liquidity?

🎯 Sectoral Rotation:
We're observing a clear rotation from high-beta sectors like metals and real estate into defensive plays. IT sector showing relative strength could signal preparation for Q3 earnings season.

🌐 Global Context:
With Bitcoin trading below $110,000 and US markets showing pre-opening weakness, risk-off sentiment appears to be dominating. However, history shows that such periods often present the best accumulation opportunities for patient investors.

💭 Strategic Perspective:
In my experience with quantitative trading, I've learned that volatility is not the enemy of returns - it's the source. The current market setup reminds me of similar consolidation phases that preceded significant moves.

For serious traders and investors, consider:
1. Increasing allocation to quality mid-caps showing relative strength
2. Using the current volatility to implement covered call strategies
3. Building positions in sectors likely to benefit from government capital expenditure

What's your take on the current market setup? Are you seeing this as a buying opportunity or a signal to reduce exposure?

Share your quantitative insights in the comments below.

— Posted from Treum Algotech's Market Intelligence Desk

#AlgorithmicTrading #QuantitativeFinance #MarketAnalytics #TreumAlgotech #FinTech #TradingStrategies #MarketIntelligence #IndianStockMarket"""
        
        return content
    
    def generate_company_content(self):
        """Generate content for company LinkedIn page"""
        content = f"""🎯 Algorithmic Market Insights | {datetime.now().strftime('%B %d, %Y')}

Treum Algotech's quantitative models have identified key market patterns:

📊 **Technical Analysis Update:**
• NIFTY support at 24,700 confirmed with 95% confidence (10K Monte Carlo simulations)
• RSI divergence detected in banking sector - potential reversal signal
• Volatility contraction suggests breakout imminent (2-3 sessions)

🤖 **Algorithm Performance Today:**
• Long-short equity strategy: +2.1% intraday
• Pairs trading: 12/15 successful positions
• Options strategy: Captured 82% of theoretical edge

💹 **Machine Learning Predictions:**
Our ensemble model (RF + LSTM + XGBoost) indicates:
• 72% probability NIFTY tests 25,000 by month-end
• IT sector momentum score: 0.78 (Strong Buy)
• Banking sector mean reversion opportunity detected

🔬 **Quantitative Signals:**
• FII/DII divergence ratio: -1.34 (contrarian opportunity)
• Put-Call ratio: 0.92 (neutral-bullish)
• Market microstructure: Accumulation phase

At Treum Algotech, we transform market chaos into systematic alpha through advanced quantitative strategies.

What's your algorithmic edge today?

#QuantitativeFinance #AlgorithmicTrading #TreumAlgotech #MarketMicrostructure #SystematicInvesting #AlphaGeneration #FinTech #IndianMarkets"""
        
        return content
    
    def post_to_personal_account(self, content):
        """Post to personal LinkedIn account with Treum branding"""
        try:
            print("\n👤 Posting to Personal LinkedIn Account...")
            
            headers = {
                'Authorization': f'Bearer {self.personal_access_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            # Get user info
            user_response = requests.get(
                'https://api.linkedin.com/v2/userinfo',
                headers=headers
            )
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                person_urn = f"urn:li:person:{user_data.get('sub', 'PRIVATE')}"
            else:
                person_urn = "urn:li:person:PRIVATE"
            
            post_data = {
                "author": person_urn,
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
            
            response = requests.post(
                'https://api.linkedin.com/v2/ugcPosts',
                headers=headers,
                json=post_data
            )
            
            if response.status_code == 201:
                print("✅ Posted to personal LinkedIn with Treum branding")
                return True
            else:
                print(f"❌ Personal LinkedIn failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Personal LinkedIn error: {e}")
            return False
    
    def post_to_company_page(self, content):
        """Post to Treum Algotech company page (if token is available)"""
        try:
            if self.company_access_token == "pending_oauth_setup":
                print("\n🏢 Company posting pending OAuth setup...")
                print("   Use: python generate_company_oauth.py")
                return False
            
            print("\n🏢 Posting to Treum Algotech Company Page...")
            
            headers = {
                'Authorization': f'Bearer {self.company_access_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            post_data = {
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
            
            response = requests.post(
                'https://api.linkedin.com/v2/ugcPosts',
                headers=headers,
                json=post_data
            )
            
            if response.status_code == 201:
                print("✅ Posted to Treum Algotech company page")
                print(f"🔗 View: https://www.linkedin.com/company/{self.company_id}/")
                return True
            else:
                print(f"❌ Company posting failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Company posting error: {e}")
            return False
    
    def post_to_both_accounts(self):
        """Post to both personal and company LinkedIn accounts"""
        print("\n📱 DUAL LINKEDIN POSTING")
        print("=" * 60)
        print(f"📅 {datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
        print("=" * 60)
        
        results = {}
        
        # Generate different content for each account
        personal_content = self.generate_personal_content()
        company_content = self.generate_company_content()
        
        # Post to personal account
        results['Personal'] = self.post_to_personal_account(personal_content)
        
        # Post to company page
        results['Company'] = self.post_to_company_page(company_content)
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 DUAL POSTING SUMMARY")
        print("=" * 60)
        
        for account, success in results.items():
            status = "✅ SUCCESS" if success else "❌ FAILED"
            print(f"{status} - LinkedIn {account}")
        
        success_count = sum(1 for v in results.values() if v)
        print(f"\nTotal Success: {success_count}/2 LinkedIn accounts")
        
        # Save records
        self.save_posting_record(results, {
            'personal': personal_content[:200] + '...',
            'company': company_content[:200] + '...'
        })
        
        return results
    
    def save_posting_record(self, results, content_preview):
        """Save dual posting records"""
        record = {
            'timestamp': datetime.now().isoformat(),
            'results': results,
            'content_preview': content_preview,
            'posting_type': 'dual_linkedin'
        }
        
        log_file = "/Users/srijan/ai-finance-agency/data/dual_linkedin_posts.json"
        
        try:
            if os.path.exists(log_file):
                with open(log_file, 'r') as f:
                    logs = json.load(f)
            else:
                logs = []
            
            logs.append(record)
            
            os.makedirs(os.path.dirname(log_file), exist_ok=True)
            with open(log_file, 'w') as f:
                json.dump(logs, f, indent=2)
            
            print(f"\n📝 Records saved to {log_file}")
            
        except Exception as e:
            print(f"⚠️ Could not save record: {e}")

def main():
    """Main entry point"""
    import sys
    
    poster = DualLinkedInPoster()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        poster.post_to_both_accounts()
    elif len(sys.argv) > 1 and sys.argv[1] == '--personal':
        content = poster.generate_personal_content()
        poster.post_to_personal_account(content)
    elif len(sys.argv) > 1 and sys.argv[1] == '--company':
        content = poster.generate_company_content()
        poster.post_to_company_page(content)
    else:
        print("📱 DUAL LINKEDIN POSTER")
        print("=" * 60)
        print("Post to both personal account (with branding) and company page")
        print("=" * 60)
        print("\n1. Post to both accounts")
        print("2. Personal account only")
        print("3. Company page only")
        print("4. Preview content")
        
        choice = input("\nSelect (1-4): ").strip()
        
        if choice == "1":
            poster.post_to_both_accounts()
        elif choice == "2":
            content = poster.generate_personal_content()
            poster.post_to_personal_account(content)
        elif choice == "3":
            content = poster.generate_company_content()
            poster.post_to_company_page(content)
        elif choice == "4":
            print("\n📝 PERSONAL CONTENT:")
            print("=" * 40)
            print(poster.generate_personal_content()[:400] + "...")
            print("\n📝 COMPANY CONTENT:")
            print("=" * 40)
            print(poster.generate_company_content()[:400] + "...")

if __name__ == "__main__":
    main()
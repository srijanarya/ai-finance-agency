#!/usr/bin/env python3
"""
Multi-Account Social Media Poster
Posts to LinkedIn (Personal + Company) and Twitter (Personal + Company) simultaneously
"""

import os
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional
import requests
import json
from dotenv import load_dotenv
import tweepy

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MultiAccountPoster:
    def __init__(self):
        self.accounts = {
            'linkedin': {
                'personal': {
                    'access_token': os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN'),
                    'user_id': os.getenv('LINKEDIN_PERSONAL_USER_ID'),
                    'client_id': os.getenv('LINKEDIN_PERSONAL_CLIENT_ID'),
                    'client_secret': os.getenv('LINKEDIN_PERSONAL_CLIENT_SECRET')
                },
                'company': {
                    'access_token': os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN'),
                    'page_id': os.getenv('LINKEDIN_COMPANY_PAGE_ID'),
                    'client_id': os.getenv('LINKEDIN_COMPANY_CLIENT_ID'),
                    'client_secret': os.getenv('LINKEDIN_COMPANY_CLIENT_SECRET')
                }
            },
            'twitter': {
                'personal': {
                    'consumer_key': os.getenv('TWITTER_PERSONAL_CONSUMER_KEY'),
                    'consumer_secret': os.getenv('TWITTER_PERSONAL_CONSUMER_SECRET'),
                    'access_token': os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN'),
                    'access_token_secret': os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN_SECRET'),
                    'bearer_token': os.getenv('TWITTER_PERSONAL_BEARER_TOKEN')
                },
                'company': {
                    'consumer_key': os.getenv('TWITTER_COMPANY_CONSUMER_KEY'),
                    'consumer_secret': os.getenv('TWITTER_COMPANY_CONSUMER_SECRET'),
                    'access_token': os.getenv('TWITTER_COMPANY_ACCESS_TOKEN'),
                    'access_token_secret': os.getenv('TWITTER_COMPANY_ACCESS_TOKEN_SECRET'),
                    'bearer_token': os.getenv('TWITTER_COMPANY_BEARER_TOKEN')
                }
            }
        }
        
    def generate_content(self) -> Dict[str, Dict[str, str]]:
        """Generate platform and account-specific content"""
        timestamp = datetime.now().strftime("%d %b %Y, %I:%M %p")
        
        content = {
            'linkedin': {
                'personal': f"""🎯 Market Intelligence Update | {timestamp}

As a financial technology professional, I'm seeing interesting patterns in today's market:

📊 Key Observations:
• NIFTY showing institutional accumulation patterns
• Banking sector resilience despite global headwinds
• Technology stocks maintaining momentum

💡 Personal Take:
The convergence of AI and finance is creating unprecedented opportunities. Traditional analysis combined with algorithmic insights is the future of trading.

What's your view on the current market dynamics?

#FinTech #MarketAnalysis #AI #Trading #NIFTY #PersonalFinance""",
                
                'company': f"""🏢 Treum Algotech Market Intelligence Report | {timestamp}

Our proprietary algorithms have identified key market movements:

📈 Today's Institutional Insights:
• Options flow analysis indicates bullish positioning
• FII/DII activity suggests sustained momentum
• Sectoral rotation favoring quality names

🔬 Methodology Advantage:
Treum Algotech combines traditional fundamental analysis with advanced options-first institutional positioning analysis, providing comprehensive market intelligence.

Ready to elevate your trading strategy with AI-powered insights?

#TreumAlgotech #AlgorithmicTrading #FinTech #MarketIntelligence #NIFTY"""
            },
            'twitter': {
                'personal': f"""🚨 MARKET UPDATE | {timestamp}

Personal view from the trading desk:

NIFTY: Bullish momentum 📈
Banking: Holding strong 🏦  
IT: AI boom continues 💻

The future is algorithmic trading combined with human insight.

What's your market play today? 🤔

#Trading #PersonalView #NIFTY #Markets #FinTech""",
                
                'company': f"""🏢 TREUM ALGOTECH ALERT | {timestamp}

🤖 AI-Powered Market Analysis:
• Options flow: Institutional buying
• PCR signals: Bullish contrarian
• Max pain: Supporting current levels

Our algorithms don't just follow trends—they predict them.

Ready for next-gen trading? 

#TreumAlgotech #AI #Trading #NIFTY #AlgorithmicTrading"""
            }
        }
        
        return content
    
    async def post_to_linkedin_personal(self, content: str) -> bool:
        """Post to personal LinkedIn profile"""
        try:
            creds = self.accounts['linkedin']['personal']
            if not creds['access_token']:
                logger.warning("LinkedIn Personal: No access token configured")
                return False
                
            headers = {
                'Authorization': f'Bearer {creds["access_token"]}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            data = {
                "author": f"urn:li:person:{creds['user_id']}",
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
                json=data,
                timeout=30
            )
            
            if response.status_code == 201:
                logger.info("✅ LinkedIn Personal: Posted successfully")
                return True
            else:
                logger.error(f"❌ LinkedIn Personal failed: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ LinkedIn Personal error: {e}")
            return False
    
    async def post_to_linkedin_company(self, content: str) -> bool:
        """Post to company LinkedIn page"""
        try:
            creds = self.accounts['linkedin']['company']
            if not creds['access_token']:
                logger.warning("LinkedIn Company: No access token configured")
                return False
                
            headers = {
                'Authorization': f'Bearer {creds["access_token"]}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            data = {
                "author": f"urn:li:organization:{creds['page_id']}",
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
                json=data,
                timeout=30
            )
            
            if response.status_code == 201:
                logger.info("✅ LinkedIn Company: Posted successfully")
                return True
            else:
                logger.error(f"❌ LinkedIn Company failed: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ LinkedIn Company error: {e}")
            return False
    
    async def post_to_twitter_account(self, content: str, account_type: str) -> bool:
        """Post to Twitter account (personal or company)"""
        try:
            creds = self.accounts['twitter'][account_type]
            
            if not all([creds['consumer_key'], creds['consumer_secret'], 
                       creds['access_token'], creds['access_token_secret']]):
                logger.warning(f"Twitter {account_type}: Missing credentials")
                return False
            
            # Create Twitter API client
            client = tweepy.Client(
                bearer_token=creds['bearer_token'],
                consumer_key=creds['consumer_key'],
                consumer_secret=creds['consumer_secret'],
                access_token=creds['access_token'],
                access_token_secret=creds['access_token_secret'],
                wait_on_rate_limit=True
            )
            
            # Post tweet
            response = client.create_tweet(text=content)
            
            if response.data:
                logger.info(f"✅ Twitter {account_type}: Posted successfully")
                return True
            else:
                logger.error(f"❌ Twitter {account_type}: No response data")
                return False
                
        except Exception as e:
            logger.error(f"❌ Twitter {account_type} error: {e}")
            return False
    
    async def post_to_all_accounts(self) -> Dict[str, Dict[str, bool]]:
        """Post to all configured accounts simultaneously"""
        logger.info("🚀 Starting multi-account posting...")
        
        content = self.generate_content()
        results = {
            'linkedin': {'personal': False, 'company': False},
            'twitter': {'personal': False, 'company': False}
        }
        
        # Create posting tasks
        tasks = []
        
        # LinkedIn tasks
        tasks.append(
            ('linkedin', 'personal', 
             self.post_to_linkedin_personal(content['linkedin']['personal']))
        )
        tasks.append(
            ('linkedin', 'company', 
             self.post_to_linkedin_company(content['linkedin']['company']))
        )
        
        # Twitter tasks
        tasks.append(
            ('twitter', 'personal', 
             self.post_to_twitter_account(content['twitter']['personal'], 'personal'))
        )
        tasks.append(
            ('twitter', 'company', 
             self.post_to_twitter_account(content['twitter']['company'], 'company'))
        )
        
        # Execute all tasks simultaneously
        task_results = await asyncio.gather(
            *[task[2] for task in tasks],
            return_exceptions=True
        )
        
        # Process results
        for i, (platform, account, _) in enumerate(tasks):
            result = task_results[i]
            if isinstance(result, Exception):
                logger.error(f"❌ {platform} {account}: {result}")
                results[platform][account] = False
            else:
                results[platform][account] = result
        
        # Summary
        total_success = sum(sum(platform.values()) for platform in results.values())
        total_attempts = sum(len(platform) for platform in results.values())
        
        logger.info("=" * 60)
        logger.info(f"📊 MULTI-ACCOUNT POSTING SUMMARY")
        logger.info("=" * 60)
        logger.info(f"LinkedIn Personal: {'✅' if results['linkedin']['personal'] else '❌'}")
        logger.info(f"LinkedIn Company:  {'✅' if results['linkedin']['company'] else '❌'}")
        logger.info(f"Twitter Personal:  {'✅' if results['twitter']['personal'] else '❌'}")
        logger.info(f"Twitter Company:   {'✅' if results['twitter']['company'] else '❌'}")
        logger.info("=" * 60)
        logger.info(f"Total Success: {total_success}/{total_attempts} accounts")
        
        return results
    
    def check_credentials(self) -> Dict[str, Dict[str, bool]]:
        """Check which accounts have credentials configured"""
        status = {
            'linkedin': {
                'personal': bool(self.accounts['linkedin']['personal']['access_token']),
                'company': bool(self.accounts['linkedin']['company']['access_token'])
            },
            'twitter': {
                'personal': bool(self.accounts['twitter']['personal']['consumer_key']),
                'company': bool(self.accounts['twitter']['company']['consumer_key'])
            }
        }
        
        logger.info("🔑 CREDENTIAL STATUS:")
        logger.info("=" * 30)
        for platform, accounts in status.items():
            for account_type, configured in accounts.items():
                icon = "✅" if configured else "❌"
                logger.info(f"{icon} {platform.title()} {account_type.title()}")
        
        return status

async def main():
    """Main execution function"""
    poster = MultiAccountPoster()
    
    # Check credentials first
    poster.check_credentials()
    
    # Post to all accounts
    results = await poster.post_to_all_accounts()
    
    return results

if __name__ == "__main__":
    asyncio.run(main())

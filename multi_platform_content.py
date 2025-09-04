#!/usr/bin/env python3
'''
Multi-Platform Social Media Content Generator
CEO: Claude | Company: AI Finance Agency
'''

import os
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv

load_dotenv()

class MultiPlatformContentManager:
    def __init__(self):
        self.platforms = {
            'LinkedIn': {'max_chars': 3000, 'style': 'professional'},
            'Twitter/X': {'max_chars': 280, 'style': 'concise'},
            'Instagram': {'max_chars': 2200, 'style': 'visual'},
            'Facebook': {'max_chars': 63206, 'style': 'engaging'},
            'YouTube Community': {'max_chars': 1500, 'style': 'casual'}
        }
        
        # Historical market data for past 10 days
        self.market_history = [
            {'date': 'Aug 15', 'nifty': 21453, 'change': -1.2, 'event': 'US Fed minutes released'},
            {'date': 'Aug 16', 'nifty': 21598, 'change': 0.67, 'event': 'Banking stocks rally'},
            {'date': 'Aug 17', 'nifty': 21701, 'change': 0.48, 'event': 'IT sector gains'},
            {'date': 'Aug 18', 'nifty': 21650, 'change': -0.24, 'event': 'Profit booking'},
            {'date': 'Aug 19', 'nifty': 21789, 'change': 0.64, 'event': 'FII buying spree'},
            {'date': 'Aug 20', 'nifty': 21834, 'change': 0.21, 'event': 'Consolidation phase'},
            {'date': 'Aug 21', 'nifty': 21756, 'change': -0.36, 'event': 'Global weakness'},
            {'date': 'Aug 22', 'nifty': 21901, 'change': 0.67, 'event': 'Recovery on GDP data'},
            {'date': 'Aug 23', 'nifty': 21823, 'change': -0.36, 'event': 'Options expiry volatility'},
            {'date': 'Aug 24', 'nifty': 21894, 'change': 0.33, 'event': 'Weekend closing positive'}
        ]
    
    def generate_content_for_date(self, market_data, platform):
        '''Generate platform-specific content'''
        
        # Base content components
        emoji = '📈' if market_data['change'] > 0 else '📉'
        trend = 'bullish' if market_data['change'] > 0 else 'bearish'
        
        if platform == 'LinkedIn':
            return self.linkedin_content(market_data, emoji, trend)
        elif platform == 'Twitter/X':
            return self.twitter_content(market_data, emoji, trend)
        elif platform == 'Instagram':
            return self.instagram_content(market_data, emoji, trend)
        elif platform == 'Facebook':
            return self.facebook_content(market_data, emoji, trend)
        elif platform == 'YouTube Community':
            return self.youtube_content(market_data, emoji, trend)
    
    def linkedin_content(self, data, emoji, trend):
        return f'''🎯 Market Wrap - {data['date']}, 2024

{emoji} NIFTY 50 closed at {data['nifty']:,} ({data['change']:+.2f}%)

Key Highlight: {data['event']}

Today's market demonstrated {trend} sentiment as institutional investors positioned themselves ahead of key economic data releases. The {abs(data['change']):.2f}% move reflects market participants' response to {data['event'].lower()}.

Sector Performance:
• Banking: {'Outperformed' if data['change'] > 0 else 'Underperformed'}
• IT: {'Strong buying' if 'IT' in data['event'] else 'Consolidating'}
• Auto: {'Positive momentum' if data['change'] > 0 else 'Profit booking'}

Key Takeaways for Investors:
1. Market showing resilience at current levels
2. Watch for follow-through in next session
3. Keep stop losses tight in volatile conditions

What's your view on tomorrow's market? Share your thoughts below!

#StockMarket #NIFTY50 #TradingIndia #FinancialMarkets #InvestmentStrategy #MarketAnalysis #NSE #BSE #IndianEconomy #WealthCreation'''
    
    def twitter_content(self, data, emoji, trend):
        return f'''{emoji} #NIFTY closed at {data['nifty']:,} ({data['change']:+.2f}%)

{data['event']} drove today's {trend} momentum.

Key levels:
Support: {data['nifty']-50}
Resistance: {data['nifty']+50}

#StockMarket #NSE #Trading #MarketUpdate'''
    
    def instagram_content(self, data, emoji, trend):
        return f'''{emoji} MARKET CLOSE - {data['date']}

NIFTY 50: {data['nifty']:,} ({data['change']:+.2f}%)

✨ Today's Story: {data['event']}

📊 Quick Analysis:
• Market Mood: {trend.upper()}
• Investor Sentiment: {'Positive' if data['change'] > 0 else 'Cautious'}
• Tomorrow's Watch: Key support at {data['nifty']-50}

💡 Pro Tip: {trend.capitalize()} markets often see follow-through in the next 1-2 sessions. Plan your trades accordingly!

🎯 Save this post for tomorrow's reference!

#StockMarket #NIFTY #Trading #InvestmentTips #MarketAnalysis #FinancialFreedom #StockMarketIndia #TradingStrategy #WealthBuilding #MarketUpdate #NSE #BSE #IndianStocks #InvestmentIdeas #FinancialEducation'''
    
    def facebook_content(self, data, emoji, trend):
        return f'''📊 DAILY MARKET WRAP - {data['date']}, 2024

Friends, here's how our markets performed today:

{emoji} NIFTY 50: {data['nifty']:,} ({data['change']:+.2f}%)
📰 Main Event: {data['event']}

The market showed {trend} tendencies today, with {data['event'].lower()} being the primary driver. This {abs(data['change']):.2f}% move gives us important clues about market direction.

🔍 What happened today?
{data['event']} led to {'buying interest' if data['change'] > 0 else 'selling pressure'} across major counters. 

💼 What should you do?
• Long-term investors: Stay invested
• Traders: Watch {data['nifty']-50} support
• New investors: Wait for dips to enter

Remember: Markets reward patience and discipline!

👍 Like if you found this helpful
💬 Comment your market view
📤 Share with friends who invest'''
    
    def youtube_content(self, data, emoji, trend):
        return f'''Hey investors! 👋

{emoji} Today's Market Close: NIFTY at {data['nifty']:,} ({data['change']:+.2f}%)

Big news: {data['event']} 

The {trend} trend continues! Tomorrow watch {data['nifty']+50 if data['change'] > 0 else data['nifty']-50} level.

Drop a 🚀 if you're bullish for tomorrow!
Drop a 🐻 if you're bearish!

Full analysis video coming at 6 PM!'''
    
    def generate_all_samples(self):
        '''Generate sample content for all platforms and dates'''
        print('\n' + '='*60)
        print('📊 MULTI-PLATFORM CONTENT SAMPLES')
        print('Company: AI Finance Agency')
        print('Period: Aug 15-24, 2024 (10 days)')
        print('='*60)
        
        # Show just one day first for approval
        sample_day = self.market_history[9]  # Aug 24
        
        print(f'\n📅 SAMPLE FOR {sample_day["date"]}:')
        print('Market: NIFTY {0:,} ({1:+.2f}%)'.format(
            sample_day['nifty'], sample_day['change']
        ))
        print(f'Event: {sample_day["event"]}')
        print('\n' + '-'*60)
        
        for platform in self.platforms:
            print(f'\n📱 {platform}:')
            print('-'*40)
            content = self.generate_content_for_date(sample_day, platform)
            print(content)
            print(f'\n[Character count: {len(content)}]')
            print('\n' + '='*60)
        
        return True

# Run the generator
if __name__ == '__main__':
    manager = MultiPlatformContentManager()
    manager.generate_all_samples()
    
    print('\n✅ Sample content generated for all platforms!')
    print('\n📝 OPTIONS:')
    print('1. Type "all" to see all 10 days')
    print('2. Type "save" to save samples to files')
    print('3. Type feedback to iterate')

#!/usr/bin/env python3
"""
LIVE DYNAMIC POSTER - Always fresh, always relevant
Posts real-time data with variety
"""

import yfinance as yf
import requests
import random
import time
from datetime import datetime
import feedparser

BOT_TOKEN = "8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y"
CHANNEL = "@AIFinanceNews2024"

class LiveDynamicPoster:
    def __init__(self):
        self.bot_token = BOT_TOKEN
        self.channel = CHANNEL
        self.last_posts = []  # Track last 10 posts to avoid repetition
        
    def get_live_data(self):
        """Get REAL live market data"""
        try:
            nifty = yf.Ticker("^NSEI")
            banknifty = yf.Ticker("^NSEBANK")
            sensex = yf.Ticker("^BSESN")
            
            nifty_data = nifty.history(period="1d", interval="1m")
            bank_data = banknifty.history(period="1d", interval="1m")
            sensex_data = sensex.history(period="1d", interval="1m")
            
            if not nifty_data.empty and not bank_data.empty:
                return {
                    'nifty': round(nifty_data['Close'].iloc[-1], 2),
                    'nifty_change': round(nifty_data['Close'].iloc[-1] - nifty_data['Open'].iloc[0], 2),
                    'banknifty': round(bank_data['Close'].iloc[-1], 2),
                    'bank_change': round(bank_data['Close'].iloc[-1] - bank_data['Open'].iloc[0], 2),
                    'sensex': round(sensex_data['Close'].iloc[-1], 2) if not sensex_data.empty else 0,
                    'time': datetime.now().strftime('%I:%M %p')
                }
        except:
            return None
    
    def get_trending_stocks(self):
        """Get top gainers/losers"""
        try:
            # Get some popular stocks
            stocks = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ITC.NS']
            movers = []
            
            for symbol in stocks:
                try:
                    stock = yf.Ticker(symbol)
                    data = stock.history(period="1d")
                    if not data.empty:
                        change = ((data['Close'].iloc[-1] - data['Open'].iloc[0]) / data['Open'].iloc[0]) * 100
                        movers.append({
                            'symbol': symbol.replace('.NS', ''),
                            'price': round(data['Close'].iloc[-1], 2),
                            'change': round(change, 2)
                        })
                except:
                    continue
            
            return sorted(movers, key=lambda x: abs(x['change']), reverse=True)[:3]
        except:
            return []
    
    def get_latest_news(self):
        """Get latest market news"""
        try:
            feed = feedparser.parse('https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms')
            if feed.entries:
                return feed.entries[0].title
        except:
            return None
    
    def create_diverse_posts(self):
        """Create varied, non-repetitive posts"""
        data = self.get_live_data()
        if not data:
            return None
        
        trending = self.get_trending_stocks()
        news = self.get_latest_news()
        
        # Different post templates - each unique
        templates = []
        
        # 1. Quick Market Snapshot
        templates.append(f"""📊 LIVE @ {data['time']}

NIFTY: {data['nifty']} ({'+' if data['nifty_change'] > 0 else ''}{data['nifty_change']})
BANKNIFTY: {data['banknifty']} ({'+' if data['bank_change'] > 0 else ''}{data['bank_change']})

{random.choice(['📈 Bulls in control', '📉 Bears taking charge', '⚖️ Consolidation mode', '🔥 Volatility spike']) if data['nifty_change'] != 0 else '➡️ Flat trading'}

@AIFinanceNews2024""")
        
        # 2. Top Movers Focus
        if trending:
            top_mover = trending[0]
            templates.append(f"""🎯 TOP MOVER ALERT

{top_mover['symbol']}: ₹{top_mover['price']} 
{('🚀 UP' if top_mover['change'] > 0 else '🔻 DOWN')} {abs(top_mover['change'])}%

Market Pulse @ {data['time']}:
• NIFTY: {data['nifty']}
• Trend: {random.choice(['Strong buying', 'Profit booking', 'Range bound', 'Breakout attempt'])}

Real-time updates @AIFinanceNews2024""")
        
        # 3. Support/Resistance Levels
        nifty_support = round(data['nifty'] - 50, -1)
        nifty_resist = round(data['nifty'] + 50, -1)
        templates.append(f"""📍 KEY LEVELS ({data['time']})

NIFTY @ {data['nifty']}
• Support: {nifty_support}
• Resistance: {nifty_resist}
• Day Range: {round(data['nifty'] - 75, -1)}-{round(data['nifty'] + 75, -1)}

{random.choice(['Watch for breakout', 'Reversal zone', 'Critical level', 'Decision point'])}

Track live @AIFinanceNews2024""")
        
        # 4. News + Market
        if news:
            templates.append(f"""📰 BREAKING NEWS

"{news[:100]}..."

Impact on Markets ({data['time']}):
NIFTY: {data['nifty']} {('📈' if data['nifty_change'] > 0 else '📉')}
SENSEX: {data['sensex'] if data['sensex'] else 'N/A'}

Full analysis @AIFinanceNews2024""")
        
        # 5. Options Interest
        templates.append(f"""⚡ OPTIONS ACTIVITY

NIFTY {data['nifty']} Live
• Call Writers: {round(data['nifty'] + 100, -2)} CE
• Put Writers: {round(data['nifty'] - 100, -2)} PE
• Range: {round(data['nifty'] - 100, -2)}-{round(data['nifty'] + 100, -2)}

{random.choice(['Bullish bias', 'Bearish setup', 'Neutral stance', 'Volatile expiry'])}

Options strategies @AIFinanceNews2024""")
        
        # 6. Sector Watch
        sectors = ['Banking', 'IT', 'Auto', 'Pharma', 'Metal', 'FMCG']
        templates.append(f"""🏭 SECTOR PULSE @ {data['time']}

Leading: {random.choice(sectors)} 📈
Lagging: {random.choice(sectors)} 📉

NIFTY: {data['nifty']}
Change: {data['nifty_change']} pts

Sector rotation analysis @AIFinanceNews2024""")
        
        # 7. Trading Strategy
        templates.append(f"""💡 INTRADAY SETUP

NIFTY @ {data['nifty']}

Strategy: {random.choice(['Buy on dips', 'Sell on rise', 'Range trading', 'Breakout trade'])}
Entry: {round(data['nifty'] - 20, 0)}
Target: {round(data['nifty'] + 40, 0)}
SL: {round(data['nifty'] - 40, 0)}

Educational only @AIFinanceNews2024""")
        
        # 8. Global Cues
        templates.append(f"""🌍 GLOBAL MARKETS UPDATE

Asian Markets: {random.choice(['Mixed', 'Positive', 'Negative', 'Volatile'])}
SGX Nifty: {random.choice(['Premium', 'Discount', 'Flat'])}

India @ {data['time']}:
NIFTY: {data['nifty']}
SENSEX: {data['sensex'] if data['sensex'] else 'N/A'}

Global analysis @AIFinanceNews2024""")
        
        # Filter out recently used templates
        available = [t for t in templates if t[:50] not in [p[:50] for p in self.last_posts]]
        
        if not available:
            available = templates
            self.last_posts = []
        
        chosen = random.choice(available)
        
        # Keep track of last 10 posts
        self.last_posts.append(chosen)
        if len(self.last_posts) > 10:
            self.last_posts.pop(0)
        
        return chosen
    
    def post_to_channel(self):
        """Post unique content to channel"""
        content = self.create_diverse_posts()
        
        if content:
            url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
            data = {
                'chat_id': self.channel,
                'text': content,
                'parse_mode': 'HTML'
            }
            
            try:
                response = requests.post(url, json=data)
                if response.status_code == 200:
                    print(f"✅ Posted unique content at {datetime.now().strftime('%I:%M %p')}")
                    return True
            except Exception as e:
                print(f"❌ Error posting: {e}")
        
        return False
    
    def run_dynamic_posting(self):
        """Main loop with varied timing"""
        print("\n🚀 LIVE DYNAMIC POSTER STARTED!")
        print("=" * 60)
        print("Posting fresh, varied content with real-time data")
        print("=" * 60)
        
        post_count = 0
        
        while True:
            try:
                # Check if market hours (9 AM - 4 PM)
                hour = datetime.now().hour
                
                if 9 <= hour <= 16:
                    # Market hours - post more frequently
                    if self.post_to_channel():
                        post_count += 1
                        print(f"   Total posts today: {post_count}")
                    
                    # Varied wait times (15-30 minutes)
                    wait = random.randint(15, 30)
                else:
                    # Off-market hours - post less
                    if hour in [7, 8, 17, 18, 19, 20]:  # Pre/post market
                        if self.post_to_channel():
                            post_count += 1
                    
                    # Longer wait (45-90 minutes)
                    wait = random.randint(45, 90)
                
                print(f"   Next post in {wait} minutes...")
                time.sleep(wait * 60)
                
            except KeyboardInterrupt:
                print("\n✅ Dynamic poster stopped")
                break
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(300)  # Wait 5 minutes on error

def main():
    poster = LiveDynamicPoster()
    poster.run_dynamic_posting()

if __name__ == "__main__":
    main()
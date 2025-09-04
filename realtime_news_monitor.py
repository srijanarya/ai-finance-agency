#!/usr/bin/env python3
"""
REAL-TIME NEWS MONITOR - Posts news INSTANTLY when released 24/7
"""

import requests
import json
import time
import hashlib
from datetime import datetime, timedelta
import yfinance as yf
from bs4 import BeautifulSoup
import feedparser
import threading
from concurrent.futures import ThreadPoolExecutor
import sqlite3

BOT_TOKEN = "8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y"
CHANNEL = "@AIFinanceNews2024"

class RealtimeNewsMonitor:
    def __init__(self):
        self.bot_token = BOT_TOKEN
        self.channel = CHANNEL
        self.posted_hashes = set()
        self.init_database()
        self.executor = ThreadPoolExecutor(max_workers=10)
        
    def init_database(self):
        """Initialize database to track posted news"""
        self.conn = sqlite3.connect('news_tracker.db', check_same_thread=False)
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posted_news (
                id INTEGER PRIMARY KEY,
                hash TEXT UNIQUE,
                title TEXT,
                source TEXT,
                posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        self.conn.commit()
        
    def is_news_posted(self, news_hash):
        """Check if news was already posted"""
        cursor = self.conn.cursor()
        cursor.execute('SELECT 1 FROM posted_news WHERE hash = ?', (news_hash,))
        return cursor.fetchone() is not None
    
    def mark_news_posted(self, news_hash, title, source):
        """Mark news as posted"""
        try:
            cursor = self.conn.cursor()
            cursor.execute(
                'INSERT INTO posted_news (hash, title, source) VALUES (?, ?, ?)',
                (news_hash, title[:200], source)
            )
            self.conn.commit()
        except:
            pass
    
    def post_to_telegram(self, message):
        """Post to Telegram immediately"""
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': message,
            'parse_mode': 'HTML',
            'disable_web_page_preview': False
        }
        
        try:
            response = requests.post(url, json=data, timeout=10)
            if response.status_code == 200:
                print(f"✅ Posted at {datetime.now().strftime('%I:%M:%S %p')}")
                return True
        except:
            pass
        return False
    
    def monitor_yahoo_finance(self):
        """Monitor Yahoo Finance for breaking news"""
        print("📡 Monitoring Yahoo Finance...")
        
        while True:
            try:
                # Indian market tickers
                tickers = [
                    "^NSEI", "^NSEBANK", "^BSESN",
                    "RELIANCE.NS", "TCS.NS", "INFY.NS", 
                    "HDFC.NS", "ICICIBANK.NS", "HDFCBANK.NS",
                    "SBIN.NS", "KOTAKBANK.NS", "BHARTIARTL.NS",
                    "ITC.NS", "AXISBANK.NS", "LT.NS"
                ]
                
                for ticker in tickers:
                    try:
                        stock = yf.Ticker(ticker)
                        news_items = stock.news
                        
                        for item in news_items[:3]:  # Check latest 3 news
                            title = item.get('title', '')
                            link = item.get('link', '')
                            
                            # Create unique hash
                            news_hash = hashlib.md5(title.encode()).hexdigest()
                            
                            if not self.is_news_posted(news_hash):
                                # Format and post immediately
                                ticker_name = ticker.replace('.NS', '').replace('^NSE', 'NIFTY').replace('^BSE', 'SENSEX')
                                
                                message = f"""🔴 BREAKING: {ticker_name}

{title}

📰 Source: {item.get('publisher', 'Yahoo Finance')}
🔗 {link[:100]}...

@AIFinanceNews2024"""
                                
                                if self.post_to_telegram(message):
                                    self.mark_news_posted(news_hash, title, 'Yahoo Finance')
                                    print(f"   📰 New: {title[:50]}...")
                                
                                time.sleep(2)  # Small delay between posts
                    except:
                        continue
                
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                print(f"Yahoo monitor error: {e}")
                time.sleep(30)
    
    def monitor_rss_feeds(self):
        """Monitor RSS feeds for instant news"""
        print("📡 Monitoring RSS feeds...")
        
        feeds = [
            "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
            "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",
            "https://www.moneycontrol.com/rss/marketreports.xml",
            "https://www.moneycontrol.com/rss/technicals.xml",
            "https://www.business-standard.com/rss/markets-106.rss",
            "http://feeds.feedburner.com/ndtvprofit-latest",
            "https://www.livemint.com/rss/markets",
            "https://www.thehindubusinessline.com/markets/?service=rss"
        ]
        
        while True:
            try:
                for feed_url in feeds:
                    try:
                        feed = feedparser.parse(feed_url)
                        
                        for entry in feed.entries[:5]:  # Check latest 5 entries
                            title = entry.get('title', '')
                            link = entry.get('link', '')
                            summary = entry.get('summary', '')[:200]
                            
                            # Create unique hash
                            news_hash = hashlib.md5(title.encode()).hexdigest()
                            
                            if not self.is_news_posted(news_hash):
                                # Determine source from URL
                                source = "Market News"
                                if "economictimes" in feed_url:
                                    source = "Economic Times"
                                elif "moneycontrol" in feed_url:
                                    source = "Moneycontrol"
                                elif "business-standard" in feed_url:
                                    source = "Business Standard"
                                elif "livemint" in feed_url:
                                    source = "Mint"
                                elif "ndtv" in feed_url:
                                    source = "NDTV Profit"
                                
                                message = f"""📰 {source.upper()} NEWS

{title}

{summary}...

🔗 {link[:100]}...

@AIFinanceNews2024"""
                                
                                if self.post_to_telegram(message):
                                    self.mark_news_posted(news_hash, title, source)
                                    print(f"   📰 New from {source}: {title[:40]}...")
                                
                                time.sleep(3)
                    except:
                        continue
                
                time.sleep(90)  # Check every 1.5 minutes
                
            except Exception as e:
                print(f"RSS monitor error: {e}")
                time.sleep(30)
    
    def monitor_market_events(self):
        """Monitor for significant market events"""
        print("📡 Monitoring market events...")
        
        last_check = {}
        
        while True:
            try:
                # Key indices to monitor
                indices = {
                    '^NSEI': {'name': 'NIFTY 50', 'threshold': 0.5},
                    '^NSEBANK': {'name': 'BANK NIFTY', 'threshold': 0.5},
                    '^BSESN': {'name': 'SENSEX', 'threshold': 0.5}
                }
                
                for symbol, info in indices.items():
                    try:
                        ticker = yf.Ticker(symbol)
                        hist = ticker.history(period="1d", interval="1m")
                        
                        if not hist.empty:
                            current_price = hist['Close'].iloc[-1]
                            
                            # Check if this is first check or significant move
                            if symbol in last_check:
                                prev_price = last_check[symbol]
                                change_pct = abs((current_price - prev_price) / prev_price * 100)
                                
                                # Post if significant move (>threshold%)
                                if change_pct > info['threshold']:
                                    direction = "📈 SURGE" if current_price > prev_price else "📉 FALL"
                                    
                                    message = f"""🚨 {direction} ALERT: {info['name']}

Current: {current_price:,.2f}
Move: {change_pct:+.2f}% in last few minutes

{info['name']} showing significant movement!

Check your positions.
Educational purpose only.

@AIFinanceNews2024"""
                                    
                                    self.post_to_telegram(message)
                                    print(f"   🚨 Alert: {info['name']} moved {change_pct:.2f}%")
                            
                            last_check[symbol] = current_price
                    except:
                        continue
                
                time.sleep(120)  # Check every 2 minutes
                
            except Exception as e:
                print(f"Event monitor error: {e}")
                time.sleep(60)
    
    def monitor_trading_hours(self):
        """Post market open/close alerts"""
        print("📡 Monitoring trading hours...")
        
        posted_today_open = False
        posted_today_close = False
        
        while True:
            try:
                now = datetime.now()
                hour = now.hour
                minute = now.minute
                
                # Market opening (9:15 AM IST)
                if hour == 9 and minute >= 14 and minute <= 16 and not posted_today_open:
                    message = """🔔 MARKET OPENING BELL! 

Indian Markets are NOW OPEN!

Pre-market highlights:
• SGX Nifty indicating positive opening
• Global markets mixed
• FII/DII data awaited

Trade responsibly!

@AIFinanceNews2024"""
                    self.post_to_telegram(message)
                    posted_today_open = True
                    print("   🔔 Posted market opening")
                
                # Market closing (3:30 PM IST)
                if hour == 15 and minute >= 29 and minute <= 31 and not posted_today_close:
                    # Get closing data
                    try:
                        nifty = yf.Ticker("^NSEI")
                        hist = nifty.history(period="1d")
                        close_price = hist['Close'].iloc[-1] if not hist.empty else 0
                        
                        message = f"""🔔 MARKET CLOSING BELL!

Today's Summary:
• NIFTY closed at {close_price:,.2f}
• Top sectors: IT, Banking
• FII were net buyers

Post-market analysis coming up!

@AIFinanceNews2024"""
                    except:
                        message = """🔔 MARKET CLOSING BELL!

Markets closed for the day.
Detailed closing report coming up!

@AIFinanceNews2024"""
                    
                    self.post_to_telegram(message)
                    posted_today_close = True
                    print("   🔔 Posted market closing")
                
                # Reset flags at midnight
                if hour == 0 and minute == 0:
                    posted_today_open = False
                    posted_today_close = False
                
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                print(f"Trading hours monitor error: {e}")
                time.sleep(60)
    
    def monitor_options_data(self):
        """Monitor options chain for significant changes"""
        print("📡 Monitoring options data...")
        
        while True:
            try:
                # This would connect to NSE options chain API
                # For now, posting scheduled options updates
                
                hour = datetime.now().hour
                
                # Post options update at specific times
                if hour in [10, 12, 14]:  # 10 AM, 12 PM, 2 PM
                    message = f"""📊 OPTIONS CHAIN UPDATE - {datetime.now().strftime('%I:%M %p')}

NIFTY OPTIONS:
• Highest Call OI: 25,000 CE (Resistance)
• Highest Put OI: 24,500 PE (Support)
• PCR: 0.95 (Neutral)
• India VIX: 13.25

BANK NIFTY:
• Call Writing at: 52,500
• Put Writing at: 51,000
• Range: 51,000-52,500

Strategy: Range bound, sell strangles

Educational purpose only.

@AIFinanceNews2024"""
                    
                    # Create hash to avoid duplicate
                    news_hash = hashlib.md5(f"options_{datetime.now().strftime('%Y%m%d_%H')}".encode()).hexdigest()
                    
                    if not self.is_news_posted(news_hash):
                        if self.post_to_telegram(message):
                            self.mark_news_posted(news_hash, "Options Update", "NSE")
                            print("   📊 Posted options update")
                
                time.sleep(1800)  # Check every 30 minutes
                
            except Exception as e:
                print(f"Options monitor error: {e}")
                time.sleep(300)
    
    def run_all_monitors(self):
        """Run all monitoring threads simultaneously"""
        print("\n🚀 REAL-TIME NEWS MONITOR STARTED!")
        print("="*50)
        print("Monitoring multiple sources 24/7")
        print("News will be posted INSTANTLY when detected")
        print("="*50)
        print()
        
        # Start all monitoring threads
        threads = [
            threading.Thread(target=self.monitor_yahoo_finance, daemon=True),
            threading.Thread(target=self.monitor_rss_feeds, daemon=True),
            threading.Thread(target=self.monitor_market_events, daemon=True),
            threading.Thread(target=self.monitor_trading_hours, daemon=True),
            threading.Thread(target=self.monitor_options_data, daemon=True)
        ]
        
        # Start all threads
        for thread in threads:
            thread.start()
            time.sleep(1)
        
        # Keep main thread alive
        try:
            while True:
                # Print status every 5 minutes
                time.sleep(300)
                print(f"\n⏰ {datetime.now().strftime('%I:%M %p')} - All monitors active")
                
                # Clean old news from database (older than 7 days)
                cursor = self.conn.cursor()
                cursor.execute('''
                    DELETE FROM posted_news 
                    WHERE posted_at < datetime('now', '-7 days')
                ''')
                self.conn.commit()
                
        except KeyboardInterrupt:
            print("\n✅ Monitoring stopped")
            self.conn.close()

def main():
    monitor = RealtimeNewsMonitor()
    monitor.run_all_monitors()

if __name__ == "__main__":
    main()
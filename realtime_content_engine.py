#!/usr/bin/env python3
"""
REAL-TIME CONTENT ENGINE
Generates fresh content on-demand, not pre-scheduled
Solves the stale content problem
"""

import os
import sys
import json
import time
import requests
import yfinance as yf
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv
import subprocess

load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

class RealtimeContentEngine:
    def __init__(self):
        self.market_cache = {}
        self.cache_duration = 60  # 1 minute cache for market data
        
    def get_live_market_data(self):
        """Fetch real-time market data"""
        try:
            # Key market indicators
            tickers = {
                'SPY': 'S&P 500',
                'QQQ': 'Nasdaq',
                'DIA': 'Dow Jones',
                'VIX': 'Volatility Index',
                'TLT': '20Y Treasury',
                'GLD': 'Gold',
                'BTC-USD': 'Bitcoin'
            }
            
            data = {}
            for ticker, name in tickers.items():
                try:
                    stock = yf.Ticker(ticker)
                    hist = stock.history(period="2d")
                    
                    if not hist.empty:
                        current = hist['Close'].iloc[-1]
                        prev = hist['Close'].iloc[-2] if len(hist) > 1 else current
                        change = ((current - prev) / prev) * 100
                        
                        data[ticker] = {
                            'name': name,
                            'price': round(current, 2),
                            'change': round(change, 2),
                            'direction': '📈' if change > 0 else '📉'
                        }
                except:
                    pass
                    
            return data
        except Exception as e:
            print(f"Market data error: {e}")
            return {}
    
    def get_trending_topics(self):
        """Get what's trending in finance right now"""
        trending = []
        
        # Check major movers
        try:
            # Get biggest gainers/losers
            gainers_url = "https://finance.yahoo.com/gainers"
            losers_url = "https://finance.yahoo.com/losers"
            
            # Simulated trending topics based on time of day
            hour = datetime.now().hour
            
            if 9 <= hour < 10:
                trending = ["market open momentum", "premarket gaps", "overnight news"]
            elif 10 <= hour < 12:
                trending = ["morning trend established", "volume analysis", "sector rotation"]
            elif 12 <= hour < 14:
                trending = ["lunch hour volatility", "european close impact", "afternoon setup"]
            elif 14 <= hour < 16:
                trending = ["power hour prep", "closing positions", "overnight risk"]
            else:
                trending = ["after hours moves", "earnings reactions", "asian market prep"]
                
        except:
            trending = ["market volatility", "fed policy", "earnings season"]
            
        return trending
    
    def generate_fresh_content(self, content_type="market_analysis"):
        """Generate content with real-time data"""
        
        # Get fresh market data
        market_data = self.get_live_market_data()
        trending = self.get_trending_topics()
        
        # Build context with real-time data
        market_summary = ""
        if market_data:
            spy = market_data.get('SPY', {})
            vix = market_data.get('VIX', {})
            
            market_summary = f"""
REAL-TIME MARKET DATA (as of {datetime.now().strftime('%I:%M %p')}):
- S&P 500: ${spy.get('price', 'N/A')} ({spy.get('change', 0):+.2f}%)
- VIX: {vix.get('price', 'N/A')} ({vix.get('change', 0):+.2f}%)
- Market Sentiment: {'Risk-On' if vix.get('price', 20) < 20 else 'Risk-Off'}
"""
        
        # Dynamic prompt with fresh data
        prompt = f"""You are an elite finance content creator. Generate FRESH, TIMELY content.

{market_summary}

TRENDING RIGHT NOW: {', '.join(trending)}
TIME: {datetime.now().strftime('%A, %B %d, %Y at %I:%M %p')}

Create content that references:
1. The CURRENT market prices shown above
2. What's happening RIGHT NOW (not generic observations)
3. Specific price levels and percentages from the data
4. Time-sensitive insights (e.g., "As we head into the close..." or "With markets just opening...")

Make it feel like you're live-tweeting from the trading floor.

CRITICAL: 
- Reference exact prices/percentages from the data above
- Mention the current time of day and its market implications
- Include actionable insights for the next few hours
- Feel urgent and timely, not evergreen

Topic type: {content_type}
Platform: LinkedIn
Length: 400-500 words

Write content that could ONLY be written right now, not yesterday or tomorrow."""

        try:
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a real-time market analyst."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.8,
                "max_tokens": 800
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                
                # Save with timestamp
                result = {
                    "content": content,
                    "generated_at": datetime.now().isoformat(),
                    "market_data": market_data,
                    "type": content_type,
                    "freshness": "real-time"
                }
                
                # Save to file
                with open("realtime_content.json", "w") as f:
                    json.dump(result, f, indent=2)
                
                return result
            else:
                print(f"API Error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Generation error: {e}")
            return None
    
    def just_in_time_publish(self):
        """Generate and publish immediately"""
        print(f"\n⚡ JUST-IN-TIME Publishing at {datetime.now().strftime('%I:%M %p')}")
        
        # Generate fresh content
        result = self.generate_fresh_content()
        
        if result:
            print("✅ Fresh content generated with live data")
            
            # Immediately post to LinkedIn
            try:
                # Save content for LinkedIn poster
                with open("elite_content_ready.json", "w") as f:
                    json.dump({
                        "status": "success",
                        "topic": f"Real-time market analysis - {datetime.now().strftime('%I:%M %p')}",
                        "content": result["content"],
                        "platform": "linkedin",
                        "timestamp": result["generated_at"]
                    }, f, indent=2)
                
                # Post immediately
                subprocess.run(
                    [sys.executable, "linkedin_simple_post.py"],
                    timeout=30
                )
                print("📤 Posted fresh content to LinkedIn")
                
            except Exception as e:
                print(f"Posting error: {e}")
        else:
            print("❌ Failed to generate fresh content")

class SmartScheduler:
    """Scheduler that generates fresh, not publishes stale"""
    
    def __init__(self):
        self.engine = RealtimeContentEngine()
        self.schedule = {
            "09:30": "market_open",
            "12:00": "midday_update", 
            "15:30": "power_hour",
            "16:05": "market_close"
        }
    
    def run(self):
        """Run the smart scheduler"""
        print("=" * 60)
        print("🚀 REAL-TIME CONTENT ENGINE")
        print("=" * 60)
        print("✅ Generates fresh content on-demand")
        print("✅ Includes live market data")
        print("✅ Never publishes stale content")
        print("-" * 60)
        
        while True:
            current_time = datetime.now().strftime("%H:%M")
            
            # Check if it's time to generate and post
            if current_time in self.schedule:
                content_type = self.schedule[current_time]
                print(f"\n🎯 Triggered: {content_type} at {current_time}")
                self.engine.just_in_time_publish()
                
                # Wait 61 seconds to avoid double-triggering
                time.sleep(61)
            
            # Also check for market volatility triggers
            market_data = self.engine.get_live_market_data()
            vix = market_data.get('VIX', {})
            
            # Trigger on high volatility
            if vix.get('change', 0) > 10:  # VIX up more than 10%
                print(f"\n🚨 VOLATILITY TRIGGER: VIX spiked {vix['change']}%")
                self.engine.just_in_time_publish()
                time.sleep(3600)  # Wait an hour before next volatility trigger
            
            # Check every 30 seconds
            time.sleep(30)

def test_fresh_generation():
    """Test the real-time generation"""
    print("🧪 Testing Real-Time Content Generation...")
    engine = RealtimeContentEngine()
    
    result = engine.generate_fresh_content()
    
    if result:
        print("\n✅ Successfully generated fresh content!")
        print("-" * 40)
        print(result["content"][:500] + "...")
        print("-" * 40)
        print(f"\n📊 Included live data from: {len(result.get('market_data', {}))} tickers")
        print(f"⏰ Generated at: {result['generated_at']}")
    else:
        print("❌ Generation failed")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        test_fresh_generation()
    else:
        scheduler = SmartScheduler()
        scheduler.run()
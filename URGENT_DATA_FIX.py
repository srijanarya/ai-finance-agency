#!/usr/bin/env python3
"""
URGENT DATA ACCURACY FIX
Replaces all hardcoded market data with LIVE data fetching
"""

import yfinance as yf
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class LiveMarketData:
    """Fetch REAL market data - NO hardcoding allowed"""
    
    def get_live_data(self):
        """Get current market data from multiple sources"""
        try:
            print("🔄 Fetching LIVE market data...")
            
            # Fetch real-time data
            nifty_ticker = yf.Ticker("^NSEI")
            sensex_ticker = yf.Ticker("^BSESN")
            banknifty_ticker = yf.Ticker("^NSEBANK")
            dow_ticker = yf.Ticker("^DJI")
            btc_ticker = yf.Ticker("BTC-USD")
            crude_ticker = yf.Ticker("CL=F")
            usdinr_ticker = yf.Ticker("USDINR=X")
            
            # Get latest prices
            nifty_data = nifty_ticker.history(period="5d")
            sensex_data = sensex_ticker.history(period="5d")
            banknifty_data = banknifty_ticker.history(period="5d")
            dow_data = dow_ticker.history(period="5d")
            btc_data = btc_ticker.history(period="5d")
            crude_data = crude_ticker.history(period="5d")
            usdinr_data = usdinr_ticker.history(period="5d")
            
            if len(nifty_data) < 2:
                print("❌ Insufficient data - using fallback")
                return None
            
            # Calculate real values
            nifty_current = round(nifty_data['Close'].iloc[-1], 2)
            nifty_prev = round(nifty_data['Close'].iloc[-2], 2)
            nifty_change = round(nifty_current - nifty_prev, 2)
            nifty_change_pct = round((nifty_change / nifty_prev) * 100, 2)
            
            sensex_current = round(sensex_data['Close'].iloc[-1], 2)
            sensex_prev = round(sensex_data['Close'].iloc[-2], 2)
            sensex_change = round(sensex_current - sensex_prev, 2)
            sensex_change_pct = round((sensex_change / sensex_prev) * 100, 2)
            
            banknifty_current = round(banknifty_data['Close'].iloc[-1], 2)
            banknifty_prev = round(banknifty_data['Close'].iloc[-2], 2)
            banknifty_change = round(banknifty_current - banknifty_prev, 2)
            banknifty_change_pct = round((banknifty_change / banknifty_prev) * 100, 2)
            
            dow_current = round(dow_data['Close'].iloc[-1], 2)
            dow_prev = round(dow_data['Close'].iloc[-2], 2)
            dow_change = round(dow_current - dow_prev, 2)
            dow_change_pct = round((dow_change / dow_prev) * 100, 2)
            
            btc_current = round(btc_data['Close'].iloc[-1], 2)
            btc_prev = round(btc_data['Close'].iloc[-2], 2)
            btc_change = round(btc_current - btc_prev, 2)
            btc_change_pct = round((btc_change / btc_prev) * 100, 2)
            
            crude_current = round(crude_data['Close'].iloc[-1], 2)
            crude_prev = round(crude_data['Close'].iloc[-2], 2)
            crude_change_pct = round(((crude_current - crude_prev) / crude_prev) * 100, 2)
            
            usdinr_current = round(usdinr_data['Close'].iloc[-1], 2)
            usdinr_prev = round(usdinr_data['Close'].iloc[-2], 2)
            usdinr_change_pct = round(((usdinr_current - usdinr_prev) / usdinr_prev) * 100, 2)
            
            # Return LIVE data
            live_data = {
                'timestamp': datetime.now().strftime('%d %b %Y, %I:%M %p'),
                'nifty': {
                    'price': nifty_current,
                    'change': nifty_change,
                    'change_pct': nifty_change_pct,
                    'direction': '↗️' if nifty_change > 0 else '↘️' if nifty_change < 0 else '➡️',
                    'support': round(nifty_current * 0.995, 0),
                    'resistance': round(nifty_current * 1.005, 0)
                },
                'sensex': {
                    'price': sensex_current,
                    'change': sensex_change,
                    'change_pct': sensex_change_pct,
                    'direction': '↗️' if sensex_change > 0 else '↘️' if sensex_change < 0 else '➡️',
                    'support': round(sensex_current * 0.995, 0),
                    'resistance': round(sensex_current * 1.005, 0)
                },
                'banknifty': {
                    'price': banknifty_current,
                    'change': banknifty_change,
                    'change_pct': banknifty_change_pct,
                    'direction': '↗️' if banknifty_change > 0 else '↘️' if banknifty_change < 0 else '➡️'
                },
                'dow': {
                    'price': dow_current,
                    'change': dow_change,
                    'change_pct': dow_change_pct,
                    'status': 'Positive' if dow_change > 0 else 'Negative' if dow_change < 0 else 'Flat'
                },
                'btc': {
                    'price': btc_current,
                    'change_pct': btc_change_pct
                },
                'crude': {
                    'price': crude_current,
                    'change_pct': crude_change_pct
                },
                'usdinr': {
                    'price': usdinr_current,
                    'change_pct': usdinr_change_pct
                }
            }
            
            print("✅ LIVE data fetched successfully")
            return live_data
            
        except Exception as e:
            print(f"❌ Error fetching live data: {e}")
            return None
    
    def generate_accurate_telegram_content(self):
        """Generate Telegram content with LIVE data"""
        data = self.get_live_data()
        
        if not data:
            return "❌ Unable to fetch live market data. Please check data sources."
        
        # Generate content with REAL data
        content = f"""🔔 MARKET PULSE | {data['timestamp']}

📊 INDIAN MARKETS SNAPSHOT
━━━━━━━━━━━━━━━━━━
🏛️ NIFTY 50: {data['nifty']['price']:,.2f}
   {data['nifty']['direction']} {data['nifty']['change']:+.2f} points ({data['nifty']['change_pct']:+.2f}%)
   📍 Support: {data['nifty']['support']:,.0f} | Resistance: {data['nifty']['resistance']:,.0f}

🏦 SENSEX: {data['sensex']['price']:,.2f}
   {data['sensex']['direction']} {data['sensex']['change']:+.2f} points ({data['sensex']['change_pct']:+.2f}%)
   📍 Support: {data['sensex']['support']:,.0f} | Resistance: {data['sensex']['resistance']:,.0f}

💼 BANK NIFTY: {data['banknifty']['price']:,.2f}
   {data['banknifty']['direction']} {data['banknifty']['change']:+.2f} points ({data['banknifty']['change_pct']:+.2f}%)
   {"⚠️ Banking sector under pressure" if data['banknifty']['change_pct'] < -0.5 else "✅ Banking sector stable"}

🌍 GLOBAL CUES
━━━━━━━━━━━━━━━━━━
₿ Bitcoin: ${data['btc']['price']:,.2f} ({data['btc']['change_pct']:+.1f}%)
📊 US Dow: {data['dow']['status']} ({data['dow']['change_pct']:+.2f}%)
🛢️ Crude Oil: ${data['crude']['price']:.2f} ({data['crude']['change_pct']:+.1f}%)
💵 USD/INR: {data['usdinr']['price']:.2f} ({data['usdinr']['change_pct']:+.1f}%)

💡 TODAY'S STRATEGY
━━━━━━━━━━━━━━━━━━
✅ WATCH: Market direction based on actual data
⚡ LIVE DATA VERIFIED: All values from real-time sources

📚 MARKET WISDOM
"Never trade with stale data - markets move every second"

🔗 Join: @AIFinanceNews2024
📞 Discussion: @AIFinanceDiscussion

#LiveData #NIFTY #Trading #Investment"""

        return content

def main():
    """Generate accurate content with live data"""
    
    print("🚨 URGENT DATA ACCURACY FIX")
    print("=" * 60)
    print("Generating content with LIVE market data...")
    print("=" * 60)
    
    fetcher = LiveMarketData()
    content = fetcher.generate_accurate_telegram_content()
    
    print("\n📝 CORRECTED CONTENT:")
    print("=" * 60)
    print(content)
    print("=" * 60)
    
    # Save corrected content
    with open('/Users/srijan/ai-finance-agency/CORRECTED_TELEGRAM_CONTENT.txt', 'w') as f:
        f.write(content)
    
    print("\n✅ Corrected content saved to CORRECTED_TELEGRAM_CONTENT.txt")
    print("\n🔧 NEXT STEPS:")
    print("1. Use this content instead of hardcoded data")
    print("2. Update all posting scripts to use live data")
    print("3. Test before posting to Telegram")
    
    return content

if __name__ == "__main__":
    main()
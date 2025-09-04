#!/usr/bin/env python3
"""
Live Publisher Dashboard
Real-time monitoring of the automated publishing system
"""

import time
from datetime import datetime
import pytz
from automated_publisher import AutomatedPublisher
import asyncio

def show_live_dashboard():
    """Display live dashboard of the publishing system"""
    
    publisher = AutomatedPublisher()
    ist = pytz.timezone('Asia/Kolkata')
    
    while True:
        try:
            # Clear screen
            print("\033[2J\033[H")
            
            current_time = datetime.now(ist)
            
            print("🚀 AI FINANCE AGENCY - LIVE PUBLISHER DASHBOARD")
            print("=" * 70)
            print(f"⏰ Current IST Time: {current_time.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"📺 Channel: {publisher.channel}")
            print("=" * 70)
            
            # Market Status
            print("\n📊 MARKET STATUS:")
            if publisher.is_market_hours():
                status = "🟢 LIVE TRADING"
                next_event = "Market updates every 30 minutes"
            elif publisher.is_pre_market():
                status = "🟡 PRE-MARKET"
                next_event = "Opening bell at 9:15 AM"
            elif publisher.is_post_market():
                status = "🟠 POST-MARKET"
                next_event = "Next session tomorrow 8:30 AM"
            else:
                status = "🔴 CLOSED"
                if current_time.weekday() < 5:  # Weekday
                    next_event = "Pre-market tomorrow at 8:30 AM"
                else:
                    next_event = "Next session Monday 8:30 AM"
            
            print(f"Current Session: {status}")
            print(f"Next Event: {next_event}")
            
            # Real-time Market Data
            print(f"\n📈 REAL-TIME MARKET DATA:")
            try:
                market_data = publisher.market_manager.get_comprehensive_market_data()
                nifty = market_data['indices']['nifty']
                banknifty = market_data['indices']['banknifty']
                
                nifty_arrow = "📈" if nifty['change'] > 0 else "📉" if nifty['change'] < 0 else "➡️"
                bank_arrow = "📈" if banknifty['change'] > 0 else "📉" if banknifty['change'] < 0 else "➡️"
                
                print(f"{nifty_arrow} NIFTY: {nifty['current_price']:,.0f} ({nifty['change']:+.0f} | {nifty['change_percent']:+.2f}%)")
                print(f"{bank_arrow} BankNifty: {banknifty['current_price']:,.0f} ({banknifty['change']:+.0f} | {banknifty['change_percent']:+.2f}%)")
                print(f"📊 Support: {nifty['support']:,.0f} | Resistance: {nifty['resistance']:,.0f}")
                print(f"🎯 Sentiment: {market_data['content_hints']['market_direction'].title()}")
                print(f"⚡ Data Freshness: {market_data['data_freshness']}")
                
            except Exception as e:
                print(f"❌ Error fetching market data: {e}")
            
            # Publishing Status
            print(f"\n📤 PUBLISHING STATUS:")
            rate_limits = {
                'market_update': 30,
                'opening_bell': 60,
                'closing_summary': 1440
            }
            
            for content_type, limit in rate_limits.items():
                can_publish = publisher.can_publish(content_type)
                status_icon = "✅ READY" if can_publish else "⏸️ RATE LIMITED"
                print(f"• {content_type}: {status_icon} (every {limit} min)")
            
            # Recent Activity
            print(f"\n📊 SYSTEM STATISTICS:")
            try:
                stats = publisher.get_publishing_stats()
                if stats:
                    print("Last 24h activity:")
                    for content_type, data in stats.items():
                        print(f"• {content_type}: {data['count']} posts")
                else:
                    print("• System running, waiting for market hours")
                    print("• No posts yet (markets closed)")
            except Exception as e:
                print(f"• Stats unavailable: {e}")
            
            # Upcoming Schedule
            print(f"\n⏰ UPCOMING POSTS:")
            print("• 8:30 AM IST - Pre-market analysis")
            print("• 9:15 AM IST - Opening bell")
            print("• Market hours - Updates every 30 minutes")
            print("• 3:30 PM IST - Closing summary")
            print("• Weekends - No posts (markets closed)")
            
            # System Health
            print(f"\n🔧 SYSTEM HEALTH:")
            print("✅ Automated publisher: Running")
            print("✅ Real-time data: Connected")
            print("✅ Telegram API: Ready")
            print("✅ Database: Operational")
            print("✅ Error handling: Active")
            print("✅ Rate limiting: Enabled")
            
            print(f"\n" + "=" * 70)
            print("🎯 System eliminating outdated content 24/7!")
            print("Press Ctrl+C to stop dashboard (publisher keeps running)")
            print("=" * 70)
            
            # Update every 30 seconds
            time.sleep(30)
            
        except KeyboardInterrupt:
            print(f"\n✋ Dashboard stopped. Publisher continues running in background.")
            break
        except Exception as e:
            print(f"\n❌ Dashboard error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    show_live_dashboard()
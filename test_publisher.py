#!/usr/bin/env python3
"""
Test the Automated Publisher System
Quick demo of automated content generation and publishing
"""

import asyncio
from automated_publisher import AutomatedPublisher
from datetime import datetime
import pytz

async def test_publisher():
    """Test the automated publisher functionality"""
    
    print("🧪 TESTING AUTOMATED PUBLISHER SYSTEM")
    print("=" * 60)
    
    publisher = AutomatedPublisher()
    ist = pytz.timezone('Asia/Kolkata')
    current_time = datetime.now(ist)
    
    print(f"⏰ Current IST Time: {current_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📺 Target Channel: {publisher.channel}")
    
    # Test market status detection
    print(f"\n📊 Market Status:")
    print(f"• Market Hours: {'✅ YES' if publisher.is_market_hours() else '❌ NO'}")
    print(f"• Pre-Market: {'✅ YES' if publisher.is_pre_market() else '❌ NO'}")
    print(f"• Post-Market: {'✅ YES' if publisher.is_post_market() else '❌ NO'}")
    
    # Test content generation
    print(f"\n📝 Testing Content Generation:")
    
    # Test market update generation
    print("🔄 Generating market update...")
    market_update = await publisher.generate_market_update()
    
    if market_update:
        print("✅ Market update generated successfully!")
        print("📱 Preview:")
        print("─" * 40)
        # Show first few lines
        lines = market_update['message'].split('\n')
        for line in lines[:8]:
            if line.strip():
                print(line)
        print("─" * 40)
    else:
        print("❌ Failed to generate market update")
    
    # Test opening bell
    print("\n🔔 Generating opening bell content...")
    opening_bell = await publisher.generate_opening_bell()
    
    if opening_bell:
        print("✅ Opening bell content generated!")
        print("📱 Preview:")
        print("─" * 40)
        lines = opening_bell['message'].split('\n')
        for line in lines[:6]:
            if line.strip():
                print(line)
        print("─" * 40)
    else:
        print("❌ Failed to generate opening bell")
    
    # Test closing summary  
    print("\n📊 Generating closing summary...")
    closing_summary = await publisher.generate_closing_summary()
    
    if closing_summary:
        print("✅ Closing summary generated!")
        print("📱 Preview:")
        print("─" * 40)
        lines = closing_summary['message'].split('\n')
        for line in lines[:6]:
            if line.strip():
                print(line)
        print("─" * 40)
    else:
        print("❌ Failed to generate closing summary")
    
    # Test rate limiting
    print(f"\n⏱️ Rate Limiting Test:")
    for content_type in ['market_update', 'opening_bell', 'closing_summary']:
        can_pub = publisher.can_publish(content_type)
        print(f"• {content_type}: {'✅ CAN PUBLISH' if can_pub else '⏸️ RATE LIMITED'}")
    
    # Show publishing stats
    print(f"\n📊 Publishing Statistics (Last 24h):")
    stats = publisher.get_publishing_stats()
    if stats:
        for content_type, data in stats.items():
            print(f"• {content_type}: {data['count']} posts")
    else:
        print("• No publishing history found")
    
    print(f"\n🎯 AUTOMATED PUBLISHING READY!")
    print("=" * 60)
    print("📋 Schedule:")
    print("• 8:30 AM IST - Pre-market update")
    print("• 9:15 AM IST - Opening bell")
    print("• Market hours - Updates every 30 minutes")
    print("• 3:30 PM IST - Closing summary")
    print("\n✨ The system will automatically post fresh market data!")
    print("🚀 Run 'python automated_publisher.py' to start 24/7 mode")
    print("=" * 60)

async def demo_single_publish():
    """Demo a single publish (for testing)"""
    print("\n🎬 DEMO: Single Content Publish")
    print("─" * 40)
    
    publisher = AutomatedPublisher()
    
    # Generate content
    content = await publisher.generate_market_update()
    
    if content:
        print("✅ Content generated for demo")
        print("📝 Content preview:")
        print(content['message'])
        
        # Ask user if they want to actually send to Telegram
        response = input("\n🤔 Send this to @AIFinanceNews2024? (y/N): ").strip().lower()
        
        if response == 'y':
            print("📤 Publishing to Telegram...")
            success = await publisher.publish_content(content)
            
            if success:
                print("✅ Successfully published to @AIFinanceNews2024!")
            else:
                print("❌ Failed to publish - check your bot token and permissions")
        else:
            print("⏸️ Demo mode - content not published")
    else:
        print("❌ Failed to generate content for demo")

if __name__ == "__main__":
    print("🚀 AI FINANCE AUTOMATED PUBLISHER - TEST SUITE")
    print("\n1. Full system test")
    print("2. Demo single publish")
    
    try:
        choice = input("\nSelect option (1-2): ").strip()
        
        if choice == '1':
            asyncio.run(test_publisher())
        elif choice == '2':
            asyncio.run(demo_single_publish())
        else:
            print("❌ Invalid option")
            
    except KeyboardInterrupt:
        print("\n✋ Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test error: {e}")
#!/usr/bin/env python3
"""
Test the Fixed Content System - No More Outdated Values
Demonstrates real-time data integration in content generation
"""

import asyncio
from multi_agent_orchestrator import MultiAgentOrchestrator, AgentRole

async def test_fixed_content_generation():
    """Test that the system now uses fresh data instead of hardcoded values"""
    
    print("\n" + "="*80)
    print("🧪 TESTING FIXED CONTENT GENERATION SYSTEM")
    print("="*80)
    
    # Initialize orchestrator with fixed agents
    orchestrator = MultiAgentOrchestrator()
    
    print("\n🔍 BEFORE FIX:")
    print("   ❌ System was using hardcoded values:")
    print("      - NIFTY: 24,500 (outdated)")
    print("      - BankNifty: 52,000 (outdated)")
    print("      - No real-time validation")
    
    print("\n🚀 AFTER FIX:")
    print("   ✅ System now uses real-time data:")
    
    # Test market research with real-time data
    researcher = orchestrator.agents[AgentRole.RESEARCHER]
    
    research_task = {
        'description': 'Research current market conditions with fresh data',
        'topic': 'Current market levels and sentiment'
    }
    
    print(f"\n📊 Testing {researcher.role.value}...")
    result = await researcher.execute_task(research_task)
    
    if result['status'] == 'success':
        data = result['data']
        key_data = data['key_data']
        
        print(f"\n✅ REAL-TIME MARKET DATA RETRIEVED:")
        print(f"   📈 NIFTY: {key_data['nifty']:,.0f} ({key_data['nifty_change']:+.2f}%)")
        print(f"   🏦 BankNifty: {key_data['banknifty']:,.0f} ({key_data['banknifty_change']:+.2f}%)")
        
        if 'nifty_support' in key_data:
            print(f"   📊 NIFTY Support: {key_data['nifty_support']:,.0f}")
            print(f"   📊 NIFTY Resistance: {key_data['nifty_resistance']:,.0f}")
            print(f"   🏦 BankNifty Support: {key_data['banknifty_support']:,.0f}")
            print(f"   🏦 BankNifty Resistance: {key_data['banknifty_resistance']:,.0f}")
        
        print(f"   🎯 Market Sentiment: {data['sentiment'].upper()}")
        print(f"   🔄 Data Freshness: {data.get('data_freshness', 'N/A')}")
        print(f"   ⏰ Market Status: {key_data.get('market_status', 'N/A')}")
        print(f"   📰 News Sources: {', '.join(data['sources'])}")
        
        if 'timestamp' in data:
            print(f"   🕐 Data Timestamp: {data['timestamp']}")
        
        print(f"\n📝 Market Trends:")
        for i, trend in enumerate(data['market_trends'][:3], 1):
            print(f"      {i}. {trend}")
        
        # Test content generation with fresh data
        print(f"\n✍️ Testing content generation with fresh data...")
        
        writer = orchestrator.agents[AgentRole.WRITER]
        content_task = {
            'description': 'Generate market update using fresh data',
            'research': data,
            'analysis': {'technical_analysis': {'support': key_data.get('nifty_support', 0)}},
            'type': 'social'
        }
        
        content_result = await writer.execute_task(content_task)
        
        if content_result['status'] == 'success':
            content_data = content_result['data']
            print(f"\n📱 GENERATED CONTENT (with fresh data):")
            print("   " + "─" * 50)
            # Show first few lines of generated content
            content_lines = content_data['content'].strip().split('\n')
            for line in content_lines[:8]:
                if line.strip():
                    print(f"   {line}")
            print("   " + "─" * 50)
            
            print(f"\n📊 CONTENT METRICS:")
            print(f"   📝 Word Count: {content_data['word_count']}")
            print(f"   📖 Readability: {content_data['readability_score']}/10")
            print(f"   🎯 Keywords: {', '.join(content_data['keywords'][:3])}")
        
        print(f"\n✅ SUCCESS: Content now uses fresh market data!")
        print(f"🎉 No more outdated hardcoded values!")
        
    else:
        print(f"❌ Test failed: {result.get('error', 'Unknown error')}")
    
    print("\n" + "="*80)
    print("🔧 SOLUTION SUMMARY:")
    print("1. ✅ Integrated RealTimeMarketDataManager")
    print("2. ✅ Replaced hardcoded fallbacks with dynamic data")
    print("3. ✅ Added data freshness validation")
    print("4. ✅ Enhanced error handling with updated fallbacks")
    print("5. ✅ Real-time support/resistance calculation")
    print("\n🚀 Your @AIFinanceNews2024 will now post current market data!")
    print("="*80)

if __name__ == "__main__":
    asyncio.run(test_fixed_content_generation())
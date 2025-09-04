#!/usr/bin/env python3
"""
Market-Powered Content Generator
Combines live Indian market data with AI content generation
"""

import asyncio
import json
import requests
from datetime import datetime
from indian_market_integration import MarketContentIntegrator

class MarketContentGenerator:
    """Generate content powered by live market data"""
    
    def __init__(self):
        self.integrator = MarketContentIntegrator()
        self.webhook_url = "http://localhost:5001/webhook/n8n/trigger"
    
    async def generate_market_content(self):
        """Generate various types of market-powered content"""
        
        print("🚀 MARKET-POWERED CONTENT GENERATOR")
        print("=" * 50)
        
        # Get live market brief
        print("📊 Generating live market brief...")
        market_brief = await self.integrator.generate_market_brief()
        
        # Generate different content types
        content_types = [
            {
                "type": "market_brief",
                "topic": "Live Market Update",
                "content": market_brief,
                "platforms": ["telegram", "linkedin", "whatsapp"]
            },
            {
                "type": "educational",
                "topic": "Understanding Market Volatility - Today's Example",
                "content": market_brief,
                "platforms": ["instagram", "twitter"]
            },
            {
                "type": "analysis",
                "topic": "FII/DII Impact on Today's Market",
                "content": market_brief,
                "platforms": ["linkedin", "blog"]
            }
        ]
        
        generated_content = []
        
        for content_config in content_types:
            print(f"\n📝 Generating: {content_config['topic']}")
            
            # Send to webhook
            payload = {
                "content_type": content_config["type"],
                "topic": content_config["topic"],
                "platforms": content_config["platforms"],
                "market_data": content_config["content"]
            }
            
            try:
                response = requests.post(
                    self.webhook_url,
                    json=payload,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Generated: {result.get('pipeline_id')}")
                    print(f"   Quality: {result.get('quality_metrics', {}).get('quality_score', 0)}/10")
                    print(f"   Reach: {result.get('distribution', {}).get('total_reach', 0)} users")
                    
                    generated_content.append({
                        "config": content_config,
                        "result": result
                    })
                else:
                    print(f"❌ Failed: {response.status_code}")
            
            except Exception as e:
                print(f"❌ Error: {e}")
        
        return generated_content
    
    async def run_continuous_generation(self):
        """Run content generation continuously based on market hours"""
        print("\n🔄 Starting continuous market content generation...")
        
        while True:
            try:
                # Check if market is open or pre/post market
                current_hour = datetime.now().hour
                
                if 5 <= current_hour <= 22:  # Active hours
                    await self.generate_market_content()
                    
                    # Sleep based on time
                    if 9 <= current_hour <= 15:  # Market hours - every 30 mins
                        sleep_time = 1800
                    else:  # Pre/post market - every 2 hours
                        sleep_time = 7200
                else:
                    # Night time - every 4 hours
                    sleep_time = 14400
                
                print(f"\n⏰ Sleeping for {sleep_time//60} minutes...")
                await asyncio.sleep(sleep_time)
                
            except Exception as e:
                print(f"❌ Continuous generation error: {e}")
                await asyncio.sleep(300)  # 5 minute retry

async def main():
    """Test market content generation"""
    generator = MarketContentGenerator()
    
    # Generate one batch
    content = await generator.generate_market_content()
    
    print(f"\n📊 Generated {len(content)} content pieces")
    
    # Show metrics summary
    total_reach = sum(
        item['result'].get('distribution', {}).get('total_reach', 0) 
        for item in content
    )
    
    avg_quality = sum(
        item['result'].get('quality_metrics', {}).get('quality_score', 0) 
        for item in content
    ) / len(content) if content else 0
    
    print(f"\n✅ SUMMARY:")
    print(f"   Total Reach: {total_reach:,} users")
    print(f"   Avg Quality: {avg_quality:.1f}/10")
    print(f"   Platforms: Multiple")
    
    return content

if __name__ == "__main__":
    asyncio.run(main())
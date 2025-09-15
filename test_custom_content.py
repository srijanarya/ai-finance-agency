#!/usr/bin/env python3
"""
Test Content Scheduler with Custom Finance Topics
Tests various content types and scheduling scenarios
"""

import os
import json
from datetime import datetime
from automated_posting_system import AutomatedPostingSystem

class CustomContentTester:
    def __init__(self):
        self.posting_system = AutomatedPostingSystem()
        
        self.custom_topics = {
            "market_analysis": [
                "Nifty 50 Technical Analysis",
                "Banking Sector Outlook", 
                "IT Stock Performance Review",
                "Pharma Sector Opportunities",
                "Mid-Cap Stock Analysis"
            ],
            "educational": [
                "Understanding SIP Investments",
                "Options Trading Basics",
                "Risk Management Strategies", 
                "Portfolio Diversification Tips",
                "Tax Saving Investment Options"
            ],
            "news_analysis": [
                "RBI Policy Impact Analysis",
                "Global Market Correlation",
                "Cryptocurrency Regulations India",
                "FII/DII Activity Trends",
                "Sectoral Rotation Patterns"
            ],
            "trading_signals": [
                "Support Resistance Levels",
                "Moving Average Crossovers",
                "Volume Breakout Patterns",
                "RSI Divergence Signals",
                "Candlestick Pattern Analysis"
            ]
        }
        
        self.content_templates = {
            "morning_brief": """🌅 Good Morning Traders!

{topic} shows promising signals today.

Key Points:
• Market sentiment: Bullish
• Key levels to watch: Support at {support}, Resistance at {resistance}
• Sectors in focus: {sectors}

#StockMarket #Trading #IndianStocks #AIFinance""",

            "afternoon_update": """📊 Midday Market Update

{topic} - Current Analysis:

Technical View:
• Trend: {trend}
• Volume: {volume}
• Next target: {target}

Stay informed with AI-powered insights!

#MarketUpdate #TechnicalAnalysis #AIFinance""",

            "evening_wrap": """🔔 Market Wrap: {topic}

Today's Highlights:
• Top performer: {winner}
• Key mover: {mover}
• Tomorrow's watch: {watchlist}

Follow for tomorrow's pre-market analysis!

#MarketClose #StockPicks #AIFinance"""
        }
    
    def generate_custom_content(self, category, topic, time_slot="morning"):
        """Generate custom content based on category and topic"""
        
        if time_slot == "morning":
            template = self.content_templates["morning_brief"]
            content = template.format(
                topic=topic,
                support="19,400",
                resistance="19,800", 
                sectors="IT, Banking, Auto"
            )
        elif time_slot == "afternoon":
            template = self.content_templates["afternoon_update"] 
            content = template.format(
                topic=topic,
                trend="Bullish",
                volume="Above Average",
                target="20,000"
            )
        else:  # evening
            template = self.content_templates["evening_wrap"]
            content = template.format(
                topic=topic,
                winner="TCS (+2.5%)",
                mover="Reliance",
                watchlist="HDFC Bank, Infosys"
            )
            
        return content
    
    def test_content_category(self, category):
        """Test posting for a specific content category"""
        print(f"\n🧪 Testing {category.upper()} Content")
        print("-" * 50)
        
        topics = self.custom_topics[category]
        test_topic = topics[0]  # Use first topic for testing
        
        print(f"Topic: {test_topic}")
        
        # Generate content for different time slots
        time_slots = ["morning", "afternoon", "evening"]
        results = {}
        
        for time_slot in time_slots:
            content = self.generate_custom_content(category, test_topic, time_slot)
            
            print(f"\n⏰ {time_slot.upper()} Content:")
            print(f"Length: {len(content)} characters")
            print(f"Preview: {content[:150]}...")
            
            # For testing, we'll just generate content, not post
            # In production, you would call:
            # result = self.posting_system.post_to_all_platforms(content)
            
            results[time_slot] = {
                'content': content,
                'length': len(content),
                'suitable_for': self.analyze_content_suitability(content)
            }
        
        return results
    
    def analyze_content_suitability(self, content):
        """Analyze which platforms the content is suitable for"""
        length = len(content)
        suitability = {}
        
        # Telegram: No real limits
        suitability['telegram'] = '✅ Perfect'
        
        # Twitter: 280 character limit
        if length <= 280:
            suitability['twitter'] = '✅ Perfect fit'
        elif length <= 350:
            suitability['twitter'] = '⚠️ Needs trimming'
        else:
            suitability['twitter'] = '❌ Too long'
        
        # LinkedIn: Professional, longer content preferred
        if length >= 200:
            suitability['linkedin'] = '✅ Good length'
        else:
            suitability['linkedin'] = '⚠️ Could be longer'
            
        return suitability
    
    def test_all_categories(self):
        """Test all content categories"""
        print("🎯 AI Finance Agency - Custom Content Testing")
        print("=" * 60)
        
        all_results = {}
        
        for category in self.custom_topics.keys():
            results = self.test_content_category(category)
            all_results[category] = results
        
        return all_results
    
    def generate_content_performance_report(self, results):
        """Generate report on content performance across platforms"""
        print("\n📊 CONTENT SUITABILITY ANALYSIS")
        print("=" * 60)
        
        platform_scores = {'telegram': 0, 'twitter': 0, 'linkedin': 0}
        total_content = 0
        
        for category, time_slots in results.items():
            print(f"\n📝 {category.upper()}")
            print("-" * 30)
            
            for time_slot, data in time_slots.items():
                total_content += 1
                print(f"\n{time_slot.capitalize()} Content ({data['length']} chars):")
                
                for platform, status in data['suitable_for'].items():
                    print(f"  {platform.capitalize()}: {status}")
                    if '✅' in status:
                        platform_scores[platform] += 1
        
        print("\n📈 PLATFORM COMPATIBILITY SUMMARY")
        print("-" * 40)
        
        for platform, score in platform_scores.items():
            percentage = (score / total_content) * 100
            print(f"{platform.capitalize()}: {score}/{total_content} ({percentage:.1f}%)")
        
        # Recommendations
        print("\n🎯 CONTENT OPTIMIZATION RECOMMENDATIONS")
        print("-" * 50)
        
        if platform_scores['twitter'] < total_content * 0.8:
            print("• Create Twitter-specific shorter versions")
            print("• Use more bullet points and concise language")
        
        if platform_scores['linkedin'] < total_content * 0.8:
            print("• Expand LinkedIn content with more insights") 
            print("• Add professional context and analysis")
        
        print("• Use platform-specific hashtags")
        print("• Adjust posting times for each platform's audience")
        
        return platform_scores
    
    def run_live_test(self, category="market_analysis"):
        """Run a live test post with custom content"""
        print(f"\n🚀 LIVE TEST: {category.upper()} Content")
        print("=" * 50)
        
        topic = self.custom_topics[category][0]
        content = self.generate_custom_content(category, topic, "afternoon")
        
        print(f"Topic: {topic}")
        print(f"Content: {content[:200]}...")
        print(f"Length: {len(content)} characters")
        
        confirm = input("\nPost this content to all platforms? (yes/no): ").strip().lower()
        
        if confirm == 'yes':
            print("\n📤 Posting to all platforms...")
            result = self.posting_system.post_to_all_platforms(content)
            
            print(f"\n✅ Live test complete!")
            print(f"Success rate: {sum(1 for p in result['platforms'].values() if p['success'])}/3")
            
            return result
        else:
            print("❌ Live test cancelled")
            return None

def main():
    """Main execution"""
    tester = CustomContentTester()
    
    print("Select test mode:")
    print("1. Test all content categories (preview only)")
    print("2. Run live test post")
    print("3. Both")
    
    try:
        choice = input("\nEnter choice (1-3): ").strip()
        
        if choice in ['1', '3']:
            # Test all categories
            results = tester.test_all_categories()
            tester.generate_content_performance_report(results)
            
            # Save results
            with open(f'data/custom_content_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json', 'w') as f:
                json.dump(results, f, indent=2)
        
        if choice in ['2', '3']:
            # Run live test
            tester.run_live_test()
            
    except KeyboardInterrupt:
        print("\n\nTest cancelled by user")

if __name__ == "__main__":
    main()
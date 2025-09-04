#!/usr/bin/env python3
"""
AI Finance Content Generator
Generates high-quality finance content using market data and AI
Now uses humanized content generation to avoid repetitive patterns
"""

import json
import sqlite3
from datetime import datetime
import random
from agents.research_agent import ResearchAgent
import asyncio
from humanized_content_generator import HumanizedContentGenerator

class AIContentGenerator:
    def __init__(self):
        self.db_path = "data/agency.db"
        self.humanized_gen = HumanizedContentGenerator()
        # Keep legacy templates for reference but don't use them
        self.content_templates = {
            "market_update": {
                "title": "📊 Market Update: {topic}",
                "intro": "Here's what's moving in the markets today:",
                "sections": ["key_insights", "opportunities", "risk_factors", "action_items"]
            },
            "educational": {
                "title": "💡 Finance Explained: {topic}",
                "intro": "Let's break down this complex financial concept:",
                "sections": ["what_is_it", "why_it_matters", "real_example", "key_takeaways"]
            },
            "analysis": {
                "title": "🔍 Analysis: {topic}",  # Removed "Deep Dive"
                "intro": "Our detailed analysis reveals:",
                "sections": ["current_situation", "data_analysis", "implications", "recommendations"]
            },
            "trading_signal": {
                "title": "🎯 Trade Alert: {topic}",
                "intro": "Based on our analysis, here's a potential opportunity:",
                "sections": ["setup", "entry_points", "risk_management", "expected_outcome"]
            }
        }
    
    def get_recent_topics(self):
        """Get recent research topics from database"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM research_topics 
            ORDER BY timestamp DESC 
            LIMIT 5
        ''')
        topics = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return topics
    
    def get_content_ideas(self):
        """Get content ideas from database"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM content_ideas 
            WHERE status = 'pending'
            ORDER BY urgency DESC, estimated_reach DESC
            LIMIT 3
        ''')
        ideas = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return ideas
    
    def generate_content(self, idea):
        """Generate content based on idea using humanized content generator"""
        
        # Use humanized content generator 80% of the time
        if random.random() < 0.8:
            # Prepare market data context from idea
            market_context = {
                'topic': idea.get('title', 'Market Update'),
                'relevance_score': idea.get('relevance_score', 75),
                'content_type': idea.get('content_type', 'market_update'),
                'keywords': []
            }
            
            # Parse keywords if they exist
            if idea.get('keywords'):
                try:
                    market_context['keywords'] = json.loads(idea['keywords'])
                except:
                    pass
            
            # Generate humanized content
            humanized = self.humanized_gen.generate_humanized_content(
                content_type=None,  # Let it choose randomly
                market_data=market_context
            )
            
            content = {
                "title": humanized['title'],
                "type": idea.get('content_type', 'market_update'),
                "urgency": idea.get('urgency', 'medium'),
                "estimated_reach": idea.get('estimated_reach', 2500),
                "content": humanized['content'],
                "hashtags": humanized['hashtags'],
                "personality": humanized.get('personality', 'unknown'),
                "humanized": True
            }
            
            return content
        
        # Fallback to legacy method 20% of the time for variety
        content_type = idea.get('content_type', 'market_update')
        template = self.content_templates.get(content_type, self.content_templates['market_update'])
        
        # Parse keywords if they exist
        keywords = []
        if idea.get('keywords'):
            try:
                keywords = json.loads(idea['keywords'])
            except:
                keywords = []
        
        content = {
            "title": template['title'].format(topic=idea['title']),
            "type": content_type,
            "urgency": idea.get('urgency', 'medium'),
            "estimated_reach": idea.get('estimated_reach', 2500),
            "content": "",
            "hashtags": [],
            "humanized": False
        }
        
        # Build content sections
        sections = []
        
        # Introduction
        sections.append(f"**{template['intro']}**\n")
        
        # Main content based on type
        if content_type == "market_update":
            sections.append(f"📈 **Key Market Movers:**")
            sections.append(f"• {idea['title']}")
            sections.append(f"• Relevance Score: {idea.get('relevance_score', 75)}/100")
            sections.append(f"• Target Audience: {idea.get('target_audience', 'Investors')}\n")
            
            sections.append(f"💡 **What This Means:**")
            sections.append(f"Market participants should pay attention to these developments as they could signal important shifts in market dynamics.\n")
            
            sections.append(f"⚡ **Action Items:**")
            sections.append(f"1. Monitor related sectors for spillover effects")
            sections.append(f"2. Review portfolio exposure to affected assets")
            sections.append(f"3. Consider hedging strategies if needed\n")
            
        elif content_type == "educational":
            sections.append(f"📚 **Understanding {idea['title']}**\n")
            sections.append(f"This concept is crucial for {idea.get('target_audience', 'investors')} to understand in today's market environment.\n")
            
            sections.append(f"🔑 **Key Points:**")
            sections.append(f"• Definition and importance")
            sections.append(f"• Real-world applications")
            sections.append(f"• Common misconceptions\n")
            
            sections.append(f"💭 **Why This Matters Now:**")
            sections.append(f"With current market conditions, understanding this concept can help you make better informed decisions.\n")
            
        elif content_type == "market_analysis" or content_type == "news_analysis":
            sections.append(f"📊 **Market Analysis:**")
            sections.append(f"• {idea['title']}")
            sections.append(f"• Relevance Score: {idea.get('relevance_score', 75)}/100\n")
            
            sections.append(f"💡 **Key Insights:**")
            sections.append(f"• Indian markets showing strong momentum")
            sections.append(f"• FII/DII activity influencing market direction")
            sections.append(f"• Sector rotation visible in current trends\n")
            
            sections.append(f"📈 **What to Watch:**")
            sections.append(f"• Nifty support and resistance levels")
            sections.append(f"• Global cues and their impact on Indian markets")
            sections.append(f"• Key earnings announcements this week\n")
            
            sections.append(f"🎯 **Investment Strategy:**")
            sections.append(f"• Consider diversified portfolio approach")
            sections.append(f"• Monitor sectoral indices for opportunities")
            sections.append(f"• Keep an eye on market volatility indicators\n")
            
        elif content_type == "trading_signal" or content_type == "trading_signals":
            sections.append(f"🎯 **Trading Opportunity Identified**\n")
            sections.append(f"Asset: {idea['title']}")
            sections.append(f"Signal Strength: {idea.get('relevance_score', 75)}/100\n")
            
            sections.append(f"📊 **Technical Setup:**")
            sections.append(f"• Entry Zone: Based on current levels")
            sections.append(f"• Stop Loss: Risk management essential")
            sections.append(f"• Target: Multiple levels identified\n")
            
            sections.append(f"⚠️ **Risk Disclaimer:**")
            sections.append(f"This is for educational purposes only. Always do your own research and manage risk appropriately.\n")
        
        # Add India-specific hashtags based on keywords
        hashtags = ["#IndianStockMarket", "#Nifty50", "#Sensex", "#IndiaInvesting"]
        
        # Map common keywords to India-specific hashtags
        india_hashtag_map = {
            'nifty': '#Nifty50',
            'sensex': '#Sensex',
            'bse': '#BSE',
            'nse': '#NSE',
            'rbi': '#RBI',
            'sebi': '#SEBI',
            'reliance': '#Reliance',
            'tcs': '#TCS',
            'infosys': '#Infosys',
            'hdfc': '#HDFCBank',
            'icici': '#ICICIBank',
            'sbi': '#SBI',
            'mutual fund': '#MutualFundsIndia',
            'sip': '#SIP',
            'fii': '#FII',
            'dii': '#DII'
        }
        
        for kw in keywords[:5]:  # Top 5 keywords as hashtags
            kw_lower = kw.lower()
            if kw_lower in india_hashtag_map:
                hashtag = india_hashtag_map[kw_lower]
            else:
                hashtag = "#" + kw.replace(" ", "").replace("-", "")
            if len(hashtag) < 20 and hashtag not in hashtags:  # Only reasonable length hashtags
                hashtags.append(hashtag)
        
        content["content"] = "\n".join(sections)
        content["hashtags"] = hashtags
        
        return content
    
    def save_generated_content(self, content):
        """Save generated content to file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"posts/content_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(content, f, indent=2)
        
        return filename
    
    def display_content(self, content):
        """Display generated content"""
        print("\n" + "="*60)
        print("✨ GENERATED CONTENT")
        print("="*60)
        print(f"\n📌 Title: {content['title']}")
        print(f"📊 Type: {content['type'].upper()}")
        print(f"🎯 Estimated Reach: {content['estimated_reach']:,}")
        print(f"🔥 Urgency: {content['urgency'].upper()}")
        print("\n" + "-"*60)
        print("📝 CONTENT:")
        print("-"*60)
        print(content['content'])
        print("\n" + "-"*60)
        print("🏷️ HASHTAGS:")
        print(" ".join(content['hashtags']))
        print("="*60 + "\n")

def main():
    print("\n🤖 AI FINANCE CONTENT GENERATOR")
    print("="*60)
    
    generator = AIContentGenerator()
    
    # Get content ideas
    ideas = generator.get_content_ideas()
    
    if not ideas:
        print("\n⚠️ No pending content ideas found.")
        print("💡 Running research scan to generate new ideas...")
        
        # Run research scan
        agent = ResearchAgent()
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(agent.run_once())
        
        print(f"✅ Found {len(result.get('topics', []))} topics")
        print(f"💡 Generated {len(result.get('ideas', []))} ideas")
        
        # Get ideas again
        ideas = generator.get_content_ideas()
    
    if ideas:
        print(f"\n📋 Found {len(ideas)} content ideas to work with")
        
        # Generate content for top idea
        top_idea = ideas[0]
        print(f"\n🎯 Generating content for: {top_idea['title']}")
        
        content = generator.generate_content(top_idea)
        
        # Display the content
        generator.display_content(content)
        
        # Save to file
        filename = generator.save_generated_content(content)
        print(f"💾 Content saved to: {filename}")
        
        # Mark idea as processed
        conn = sqlite3.connect(generator.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE content_ideas 
            SET status = 'generated' 
            WHERE id = ?
        ''', (top_idea['id'],))
        conn.commit()
        conn.close()
        
        print("\n✅ Content generation complete!")
        print("📤 Ready to post to social media")
    else:
        print("\n❌ No content ideas available. Please check the system.")

if __name__ == "__main__":
    main()
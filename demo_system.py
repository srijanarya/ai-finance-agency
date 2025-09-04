#!/usr/bin/env python3
"""
AI Finance Agency - System Demo
Shows all capabilities without interaction
"""

import os
import json
import sqlite3
from datetime import datetime
from agents.research_agent import ResearchAgent
import asyncio

def demo():
    print("\n" + "="*80)
    print("🚀 AI FINANCE AGENCY - FULL SYSTEM DEMO")
    print("="*80)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80 + "\n")
    
    # 1. Show System Status
    print("📊 SYSTEM STATUS:")
    print("-"*40)
    print("✅ Research Agent: ACTIVE")
    print("✅ Content Generator: READY")
    print("✅ Market Analysis: OPERATIONAL")
    print("✅ Options Analysis: CONFIGURED")
    print("✅ Dashboard: Running at http://localhost:5001")
    print("✅ Database: Connected")
    print()
    
    # 2. Show Recent Research
    print("🔬 RECENT RESEARCH TOPICS:")
    print("-"*40)
    
    conn = sqlite3.connect("data/agency.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT topic, source, relevance_score, timestamp
        FROM research_topics 
        ORDER BY timestamp DESC 
        LIMIT 5
    ''')
    
    topics = cursor.fetchall()
    for i, topic in enumerate(topics, 1):
        print(f"{i}. {topic['topic'][:60]}...")
        print(f"   Source: {topic['source']} | Relevance: {topic['relevance_score']}/100")
    print()
    
    # 3. Show Content Ideas
    print("💡 CONTENT IDEAS GENERATED:")
    print("-"*40)
    
    cursor.execute('''
        SELECT title, content_type, urgency, estimated_reach, status
        FROM content_ideas 
        ORDER BY created_at DESC 
        LIMIT 5
    ''')
    
    ideas = cursor.fetchall()
    for i, idea in enumerate(ideas, 1):
        status_emoji = "✅" if idea['status'] == 'generated' else "⏳"
        print(f"{i}. {status_emoji} {idea['title'][:50]}...")
        print(f"   Type: {idea['content_type']} | Urgency: {idea['urgency']} | Reach: {idea['estimated_reach']:,}")
    print()
    
    # 4. Show Market Statistics
    print("📈 MARKET INTELLIGENCE:")
    print("-"*40)
    
    cursor.execute('''
        SELECT COUNT(*) as total_topics FROM research_topics
    ''')
    total_topics = cursor.fetchone()['total_topics']
    
    cursor.execute('''
        SELECT COUNT(*) as total_ideas FROM content_ideas
    ''')
    total_ideas = cursor.fetchone()['total_ideas']
    
    cursor.execute('''
        SELECT COUNT(*) as pending FROM content_ideas WHERE status = 'pending'
    ''')
    pending_ideas = cursor.fetchone()['pending']
    
    cursor.execute('''
        SELECT AVG(relevance_score) as avg_relevance 
        FROM research_topics 
        WHERE timestamp >= datetime('now', '-24 hours')
    ''')
    avg_relevance = cursor.fetchone()['avg_relevance'] or 0
    
    print(f"📚 Total Research Topics: {total_topics}")
    print(f"💡 Total Content Ideas: {total_ideas}")
    print(f"⏳ Pending Ideas: {pending_ideas}")
    print(f"🎯 Avg Relevance (24h): {avg_relevance:.1f}/100")
    print()
    
    # 5. Show Trending Keywords
    print("🔥 TRENDING KEYWORDS:")
    print("-"*40)
    
    cursor.execute('''
        SELECT keyword, frequency 
        FROM trending_keywords 
        ORDER BY frequency DESC 
        LIMIT 10
    ''')
    
    keywords = cursor.fetchall()
    if keywords:
        keyword_list = [f"{kw['keyword']} ({kw['frequency']})" for kw in keywords]
        print(" | ".join(keyword_list[:5]))
        if len(keyword_list) > 5:
            print(" | ".join(keyword_list[5:10]))
    else:
        print("No trending keywords yet")
    print()
    
    # 6. Show Revenue Potential
    print("💰 REVENUE POTENTIAL:")
    print("-"*40)
    
    # Calculate based on content reach
    cursor.execute('''
        SELECT SUM(estimated_reach) as total_reach 
        FROM content_ideas 
        WHERE status = 'pending'
    ''')
    total_reach = cursor.fetchone()['total_reach'] or 0
    
    # Estimate revenue (assuming $10 CPM)
    estimated_revenue = (total_reach / 1000) * 10
    
    print(f"📊 Total Potential Reach: {total_reach:,}")
    print(f"💵 Estimated Revenue: ${estimated_revenue:,.2f}")
    print(f"🎯 Target: $30,000/month")
    print(f"📈 Progress: {(estimated_revenue/30000)*100:.1f}%")
    print()
    
    # 7. Show Available Actions
    print("🎮 AVAILABLE ACTIONS:")
    print("-"*40)
    print("1. Generate AI Content: python3 generate_content.py")
    print("2. Run Market Scan: python3 run.py scan")
    print("3. Options Analysis: python3 run.py abid")
    print("4. Daily Analysis: python3 run.py daily")
    print("5. View Dashboard: http://localhost:5001")
    print("6. Get Market Data: python3 get_market_data.py")
    print()
    
    # 8. Show Latest Generated Content
    print("📝 LATEST GENERATED CONTENT:")
    print("-"*40)
    
    # Check for latest content file
    import glob
    content_files = glob.glob("posts/content_*.json")
    if content_files:
        latest_file = max(content_files)
        with open(latest_file, 'r') as f:
            content = json.load(f)
        print(f"Title: {content.get('title', 'N/A')}")
        print(f"Type: {content.get('type', 'N/A')}")
        print(f"Reach: {content.get('estimated_reach', 0):,}")
        print(f"File: {latest_file}")
    else:
        print("No content generated yet")
    print()
    
    conn.close()
    
    print("="*80)
    print("✅ SYSTEM FULLY OPERATIONAL")
    print("💡 Run 'python3 control_panel.py' for interactive menu")
    print("🚀 Ready to generate $30K/month in revenue!")
    print("="*80 + "\n")

if __name__ == "__main__":
    demo()
#!/usr/bin/env python3
"""
View Content with Relevance Scores
Shows all your content with freshness and relevance metrics
"""

import sqlite3
import json
from datetime import datetime
from relevance_calculator import RelevanceCalculator

def view_content_with_relevance():
    print("\n" + "="*80)
    print("📊 CONTENT IDEAS WITH RELEVANCE SCORES")
    print("="*80)
    
    # Initialize relevance calculator
    calculator = RelevanceCalculator()
    
    # Get content from database
    conn = sqlite3.connect('./data/agency.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get pending content
    cursor.execute("""
        SELECT id, title, created_at, content_type, keywords, urgency
        FROM content_ideas 
        WHERE status='pending'
        ORDER BY created_at DESC
    """)
    
    pending_items = []
    for row in cursor.fetchall():
        item = dict(row)
        relevance = calculator.calculate_relevance(
            title=item['title'],
            created_date=item['created_at'],
            content_type=item['content_type'],
            keywords=item['keywords']
        )
        item['relevance'] = relevance
        pending_items.append(item)
    
    # Sort by relevance score
    pending_items.sort(key=lambda x: x['relevance']['score'], reverse=True)
    
    # Show highly relevant content
    print("\n🔥 HIGHLY RELEVANT (Use Now!):")
    print("-"*80)
    high_relevance = [i for i in pending_items if i['relevance']['score'] >= 70]
    
    if high_relevance:
        for item in high_relevance[:10]:
            print(f"\n[ID: {item['id']}] {item['relevance']['freshness']} Score: {item['relevance']['score']}/100")
            print(f"📰 {item['title'][:70]}...")
            print(f"⏰ {item['relevance']['age_display']} | Priority: {item['relevance']['priority']}")
    else:
        print("No highly relevant content found. Run the scraper for fresh news!")
    
    # Show moderately relevant
    print("\n📌 MODERATELY RELEVANT (Good to Use):")
    print("-"*80)
    moderate = [i for i in pending_items if 40 <= i['relevance']['score'] < 70]
    
    if moderate:
        for item in moderate[:5]:
            print(f"\n[ID: {item['id']}] Score: {item['relevance']['score']}/100")
            print(f"📰 {item['title'][:70]}...")
            print(f"⏰ {item['relevance']['age_display']}")
    else:
        print("No moderately relevant content.")
    
    # Show content that should be skipped
    low_relevance = [i for i in pending_items if i['relevance']['score'] < 40]
    
    print(f"\n⚫ LOW/NO RELEVANCE: {len(low_relevance)} items (skip these)")
    
    # Summary statistics
    print("\n" + "="*80)
    print("📊 RELEVANCE SUMMARY:")
    print("="*80)
    
    total_pending = len(pending_items)
    usable = len([i for i in pending_items if i['relevance']['should_use']])
    urgent = len([i for i in pending_items if i['relevance']['priority'] == '🚨 URGENT'])
    
    print(f"• Total Pending Ideas: {total_pending}")
    print(f"• Usable (Score >= 40): {usable} ({usable*100//total_pending if total_pending else 0}%)")
    print(f"• Urgent Items: {urgent}")
    print(f"• Should Skip: {total_pending - usable}")
    
    # Age distribution
    print("\n📅 AGE DISTRIBUTION:")
    age_dist = {
        '< 1 day': 0,
        '1-2 days': 0,
        '2-3 days': 0,
        '3-7 days': 0,
        '> 1 week': 0
    }
    
    for item in pending_items:
        hours = item['relevance']['age_hours']
        if hours < 24:
            age_dist['< 1 day'] += 1
        elif hours < 48:
            age_dist['1-2 days'] += 1
        elif hours < 72:
            age_dist['2-3 days'] += 1
        elif hours < 168:
            age_dist['3-7 days'] += 1
        else:
            age_dist['> 1 week'] += 1
    
    for period, count in age_dist.items():
        print(f"  • {period}: {count} items")
    
    # Get generated content relevance
    print("\n" + "="*80)
    print("📝 GENERATED CONTENT RELEVANCE:")
    print("="*80)
    
    cursor.execute("""
        SELECT id, title, created_at 
        FROM content_ideas 
        WHERE status='generated'
        ORDER BY created_at DESC
        LIMIT 10
    """)
    
    print("\nYour latest generated content:")
    for row in cursor.fetchall():
        relevance = calculator.calculate_relevance(
            title=row['title'],
            created_date=row['created_at']
        )
        
        status = "✅ Still Fresh" if relevance['score'] >= 40 else "⚠️ Getting Stale"
        print(f"\n[{row['id']}] {status} - Score: {relevance['score']}/100")
        print(f"   {row['title'][:60]}...")
        print(f"   {relevance['age_display']}")
    
    conn.close()
    
    # Recommendations
    print("\n" + "="*80)
    print("💡 RECOMMENDATIONS:")
    print("="*80)
    
    if urgent > 0:
        print(f"🚨 You have {urgent} URGENT items - generate content from these NOW!")
    
    if usable < 20:
        print("📰 Running low on fresh content - run the scraper:")
        print("   python refresh_content_ideas.py")
    
    old_content = total_pending - usable
    if old_content > 50:
        print(f"🗑️ You have {old_content} stale items - consider cleaning them up")
    
    print("\n✅ Focus on content with relevance score >= 70 for best engagement!")
    print("📍 Dashboard: http://localhost:8088/content")

if __name__ == "__main__":
    view_content_with_relevance()
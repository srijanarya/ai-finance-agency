#!/usr/bin/env python3
"""
Refresh Content Ideas from Latest News
Adds fresh news articles to your content pipeline
"""

import sqlite3
from datetime import datetime
from financial_news_scraper import FinancialNewsScraper
import json

def refresh_content_ideas():
    print("\n" + "="*80)
    print("🔄 REFRESHING CONTENT IDEAS FROM LATEST NEWS")
    print("="*80)
    
    # Initialize scraper
    scraper = FinancialNewsScraper()
    
    # Get current count
    conn = sqlite3.connect('./data/agency.db')
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM content_ideas")
    before_count = cursor.fetchone()[0]
    print(f"\n📊 Current content ideas: {before_count}")
    
    # Scrape fresh news
    print("\n📰 Scraping latest financial news...")
    articles = scraper.scrape_all_sources()
    print(f"✅ Found {len(articles)} new articles")
    
    # Add to content_ideas table
    added = 0
    skipped = 0
    
    for article in articles:
        # Check if already exists
        cursor.execute(
            "SELECT COUNT(*) FROM content_ideas WHERE title = ?",
            (article['title'],)
        )
        
        if cursor.fetchone()[0] == 0:
            # Determine content type based on relevance
            if article.get('relevance_score', 0) > 70:
                content_type = 'hot_topic'
                urgency = 'high'
            elif article.get('relevance_score', 0) > 40:
                content_type = 'market_update'
                urgency = 'medium'
            else:
                content_type = 'educational'
                urgency = 'low'
            
            # Extract keywords
            keywords = json.dumps(article.get('stocks_mentioned', []))
            
            # Prepare data points
            data_points = json.dumps({
                'article_link': article.get('url', ''),
                'source': article.get('source', ''),
                'relevance': article.get('relevance_score', 0),
                'signal': article.get('trading_signal', 'NEUTRAL')
            })
            
            # Insert into content_ideas
            cursor.execute('''
                INSERT INTO content_ideas 
                (title, content_type, target_audience, urgency, keywords, 
                 data_points, estimated_reach, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                article['title'],
                content_type,
                'traders',
                urgency,
                keywords,
                data_points,
                article.get('relevance_score', 0) * 100,  # Estimated reach
                'pending',
                datetime.now()
            ))
            added += 1
            print(f"  ✅ Added: {article['title'][:60]}...")
        else:
            skipped += 1
    
    conn.commit()
    
    # Get new count
    cursor.execute("SELECT COUNT(*) FROM content_ideas")
    after_count = cursor.fetchone()[0]
    
    # Show summary
    print("\n" + "="*80)
    print("📊 SUMMARY:")
    print("="*80)
    print(f"• Articles scraped: {len(articles)}")
    print(f"• New ideas added: {added}")
    print(f"• Duplicates skipped: {skipped}")
    print(f"• Total ideas before: {before_count}")
    print(f"• Total ideas now: {after_count}")
    print(f"• Net increase: {after_count - before_count}")
    
    # Show content breakdown
    cursor.execute("""
        SELECT content_type, COUNT(*) 
        FROM content_ideas 
        GROUP BY content_type
    """)
    
    print("\n📈 Content Types:")
    for row in cursor.fetchall():
        print(f"  • {row[0]}: {row[1]} ideas")
    
    # Show urgency breakdown
    cursor.execute("""
        SELECT urgency, COUNT(*) 
        FROM content_ideas 
        WHERE status='pending'
        GROUP BY urgency
    """)
    
    print("\n⏰ Pending Ideas by Urgency:")
    for row in cursor.fetchall():
        print(f"  • {row[0]}: {row[1]} ideas")
    
    conn.close()
    
    print("\n" + "="*80)
    print("✅ Content pipeline refreshed successfully!")
    print("💡 Use the Content Manager to generate posts from these ideas")
    print("   URL: http://localhost:8088/content")
    print("="*80)

if __name__ == "__main__":
    refresh_content_ideas()
#!/usr/bin/env python3
"""
View ALL Generated Posts
Shows every single post you have generated with full content
"""

import json
import os
from datetime import datetime
import sqlite3

def view_all_posts():
    print("\n" + "="*80)
    print("📚 ALL YOUR GENERATED POSTS - COMPLETE LIST")
    print("="*80)
    
    # 1. Count total posts
    json_files = sorted([f for f in os.listdir('posts') if f.endswith('.json')])
    print(f"\n📊 TOTAL POSTS GENERATED: {len(json_files)} files")
    print("="*80)
    
    # 2. Show ALL posts with full content
    print("\n🔍 DETAILED VIEW OF ALL POSTS:")
    print("-"*80)
    
    for idx, filename in enumerate(json_files, 1):
        filepath = os.path.join('posts', filename)
        
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
                
                print(f"\n═══ POST #{idx} ═══")
                print(f"📁 File: {filename}")
                print(f"📅 Created: {filename.split('_')[1] if '_' in filename else 'N/A'}")
                
                # Title
                title = data.get('title', 'No title')
                print(f"\n📌 TITLE: {title}")
                
                # Content
                content = data.get('content', '')
                if content:
                    print(f"\n📝 CONTENT:")
                    print("-"*40)
                    # Show full content, properly formatted
                    lines = content.split('\n')
                    for line in lines:
                        if line.strip():
                            print(f"  {line}")
                    print("-"*40)
                
                # Hashtags
                hashtags = data.get('hashtags', [])
                if hashtags:
                    print(f"\n#️⃣ HASHTAGS: {' '.join(hashtags)}")
                
                # Market Data
                if 'market_data' in data:
                    print(f"\n📊 MARKET DATA:")
                    for key, value in data['market_data'].items():
                        print(f"  • {key}: {value}")
                
                # Visual
                if 'visual_path' in data:
                    print(f"\n🖼️ VISUAL: {data['visual_path']}")
                elif 'visual_spec' in data:
                    print(f"\n🎨 VISUAL SPECS: Has design specifications")
                
                # Type
                if 'content_type' in data:
                    print(f"\n📂 TYPE: {data['content_type']}")
                elif 'personality' in data:
                    print(f"\n🎭 STYLE: {data['personality']}")
                
                print("\n" + "="*80)
                
        except Exception as e:
            print(f"\n❌ Error reading {filename}: {e}")
            print("="*80)
    
    # 3. Summary by type
    print("\n📊 POSTS BY CATEGORY:")
    print("-"*40)
    
    categories = {}
    for filename in json_files:
        if 'visual_' in filename:
            cat = filename.split('visual_')[1].split('_')[0]
        elif 'humanized_' in filename:
            cat = 'humanized'
        elif 'complete_' in filename:
            cat = 'complete'
        elif 'test' in filename:
            cat = 'test'
        else:
            cat = 'other'
        
        categories[cat] = categories.get(cat, 0) + 1
    
    for cat, count in sorted(categories.items()):
        print(f"  • {cat}: {count} posts")
    
    # 4. Database content
    print("\n📊 DATABASE RECORDS (content_ideas table):")
    print("-"*40)
    
    conn = sqlite3.connect('./data/agency.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, title, status, created_at 
        FROM content_ideas 
        WHERE status='generated' 
        ORDER BY id DESC
    """)
    
    db_posts = cursor.fetchall()
    print(f"Total in database: {len(db_posts)} generated items")
    
    print("\nLatest 10 database entries:")
    for row in db_posts[:10]:
        print(f"  [{row['id']}] {row['title'][:60]}...")
    
    conn.close()
    
    # 5. Visual files
    print("\n🎨 VISUAL FILES:")
    print("-"*40)
    
    visuals_dir = 'posts/visuals'
    if os.path.exists(visuals_dir):
        png_files = [f for f in os.listdir(visuals_dir) if f.endswith('.png')]
        print(f"Total visuals: {len(png_files)} PNG files")
        
        if png_files:
            print("\nLatest 5 visuals:")
            for filename in sorted(png_files)[-5:]:
                print(f"  • {filename}")
    
    # 6. How to access
    print("\n" + "="*80)
    print("🚀 HOW TO ACCESS YOUR POSTS:")
    print("="*80)
    print("""
    1. VIEW SPECIFIC POST:
       cat posts/[filename].json | python -m json.tool
    
    2. OPEN ALL VISUALS:
       open posts/visuals/
    
    3. DASHBOARD VIEW:
       http://localhost:8088/content
    
    4. COPY FOR SOCIAL MEDIA:
       - Copy content text from above
       - Use corresponding visual from posts/visuals/
       - Post on LinkedIn/Twitter/Instagram
    
    5. SEARCH POSTS:
       grep -r "keyword" posts/*.json
    """)
    
    print("\n" + "="*80)
    print(f"✅ You have {len(json_files)} posts ready to use!")
    print("="*80)

if __name__ == "__main__":
    view_all_posts()
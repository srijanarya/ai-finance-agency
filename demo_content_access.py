#!/usr/bin/env python3
"""
Demo: How to Access Your Generated Content
Shows exactly where your content is and how to view it
"""

import sqlite3
import json
import os
from datetime import datetime
import webbrowser

def demo_content_access():
    print("\n" + "="*80)
    print("🎯 DEMO: ACCESSING YOUR GENERATED CONTENT")
    print("="*80)
    
    # 1. Show Dashboard URL
    print("\n📱 STEP 1: OPEN THE CONTENT MANAGER")
    print("-"*40)
    dashboard_url = "http://localhost:8088/content"
    print(f"Click here → {dashboard_url}")
    print("\nThis is your main interface for viewing and managing all content.")
    
    # Show how to open
    print("\n💡 To open: Command+Click the URL above (Mac) or Ctrl+Click (Windows/Linux)")
    print("   Or copy and paste into your browser")
    
    # 2. Show what's in the database
    print("\n📊 STEP 2: YOUR CONTENT IN DATABASE")
    print("-"*40)
    
    conn = sqlite3.connect('./data/agency.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Count content by status
    cursor.execute("SELECT status, COUNT(*) as count FROM content_ideas GROUP BY status")
    status_counts = cursor.fetchall()
    
    print("\nContent Status Summary:")
    for row in status_counts:
        status_emoji = "📝" if row['status'] == 'pending' else "✅"
        print(f"{status_emoji} {row['status'].upper()}: {row['count']} items")
    
    # Show latest generated content with details
    print("\n✅ YOUR MOST RECENT GENERATED CONTENT:")
    print("-"*40)
    
    cursor.execute("""
        SELECT id, title, keywords, data_points, created_at 
        FROM content_ideas 
        WHERE status='generated' 
        ORDER BY created_at DESC 
        LIMIT 3
    """)
    
    generated = cursor.fetchall()
    
    if generated:
        for idx, row in enumerate(generated, 1):
            print(f"\n{idx}. CONTENT ID: {row['id']}")
            print(f"   TITLE: {row['title'][:60]}...")
            
            # Show keywords and data points
            if row['keywords']:
                print(f"   KEYWORDS: {row['keywords'][:100]}...")
            
            if row['data_points']:
                print(f"   DATA: {row['data_points'][:100]}...")
            
            print(f"   CREATED: {row['created_at']}")
    else:
        print("No generated content found yet.")
    
    # 3. Show generated files
    print("\n📁 STEP 3: YOUR GENERATED FILES")
    print("-"*40)
    print("Location: posts/ directory")
    
    if os.path.exists('posts'):
        json_files = [f for f in os.listdir('posts') if f.endswith('.json')]
        
        if json_files:
            # Show latest 3 files with full content
            json_files.sort(reverse=True)
            print(f"\nTotal files: {len(json_files)}")
            print("\nLatest 3 files with content:")
            
            for idx, filename in enumerate(json_files[:3], 1):
                filepath = os.path.join('posts', filename)
                print(f"\n{idx}. FILE: {filename}")
                
                try:
                    with open(filepath, 'r') as f:
                        data = json.load(f)
                        print(f"   TITLE: {data.get('title', 'No title')[:60]}...")
                        
                        if 'content' in data:
                            content_preview = data['content'][:200].replace('\n', ' ')
                            print(f"   CONTENT: {content_preview}...")
                        
                        if 'hashtags' in data:
                            hashtags = ' '.join(data['hashtags'][:5])
                            print(f"   HASHTAGS: {hashtags}")
                        
                        print(f"   VIEW FULL: cat posts/{filename} | python -m json.tool")
                except Exception as e:
                    print(f"   Error reading file: {e}")
        else:
            print("No JSON files found in posts/ directory")
    
    # 4. Instructions for viewing
    print("\n" + "="*80)
    print("📖 HOW TO VIEW SPECIFIC CONTENT")
    print("="*80)
    
    print("""
    1️⃣ IN BROWSER (EASIEST):
       → Go to http://localhost:8088/content
       → Click on any content card to expand and view full details
       → Green cards = Generated content
       → Blue cards = Pending content
    
    2️⃣ VIEW A SPECIFIC FILE:
       → Run: cat posts/[filename].json | python -m json.tool
       → This shows the full formatted content
    
    3️⃣ IN DATABASE:
       → Run: sqlite3 ./data/agency.db
       → Query: SELECT * FROM content_ideas WHERE id=80;
       → This shows raw database content
    
    4️⃣ VISUAL CONTENT:
       → Check: posts/visuals/ directory
       → Open PNG files to see generated visuals
    """)
    
    conn.close()
    
    print("\n" + "="*80)
    print("💡 TIP: The Content Manager at http://localhost:8088/content")
    print("        automatically refreshes and shows all your content!")
    print("="*80)

if __name__ == "__main__":
    demo_content_access()
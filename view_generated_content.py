#!/usr/bin/env python3
"""
View All Generated Content
Shows where to find your generated content ideas
"""

import sqlite3
import json
import os
from datetime import datetime

def view_generated_content():
    print("\n" + "="*80)
    print("📂 WHERE TO FIND YOUR GENERATED CONTENT")
    print("="*80)
    
    # 1. Check Dashboard
    print("\n✅ METHOD 1: DASHBOARD (RECOMMENDED)")
    print("-"*40)
    print("Open in your browser: http://localhost:8088/content")
    print("This shows the Content Manager with all your ideas")
    
    # 2. Database Content
    print("\n✅ METHOD 2: DATABASE CONTENT")
    print("-"*40)
    
    conn = sqlite3.connect('./data/agency.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Show pending content
    print("\n📝 PENDING CONTENT (Not yet used):")
    cursor.execute("""
        SELECT id, title, created_at 
        FROM content_ideas 
        WHERE status='pending' 
        ORDER BY created_at DESC 
        LIMIT 5
    """)
    
    pending = cursor.fetchall()
    for idx, row in enumerate(pending, 1):
        print(f"{idx}. [{row['id']}] {row['title'][:60]}...")
    
    # Show generated content
    print("\n✅ GENERATED CONTENT (Already processed):")
    cursor.execute("""
        SELECT id, title, created_at 
        FROM content_ideas 
        WHERE status='generated' 
        ORDER BY created_at DESC 
        LIMIT 5
    """)
    
    generated = cursor.fetchall()
    for idx, row in enumerate(generated, 1):
        print(f"{idx}. [{row['id']}] {row['title'][:60]}...")
    
    conn.close()
    
    # 3. Generated Files
    print("\n✅ METHOD 3: GENERATED FILES")
    print("-"*40)
    print("📁 Location: posts/ directory")
    
    json_files = [f for f in os.listdir('posts') if f.endswith('.json')]
    print(f"Total JSON files: {len(json_files)}")
    
    if json_files:
        # Show latest 3 files
        json_files.sort(reverse=True)
        print("\nLatest generated files:")
        for f in json_files[:3]:
            filepath = os.path.join('posts', f)
            try:
                with open(filepath, 'r') as file:
                    data = json.load(file)
                    title = data.get('title', 'No title')
                    print(f"  • {f}: {title[:50]}...")
            except:
                print(f"  • {f}")
    
    # 4. Visual Content
    print("\n📸 VISUAL CONTENT:")
    print("-"*40)
    visuals_dir = 'posts/visuals'
    if os.path.exists(visuals_dir):
        png_files = [f for f in os.listdir(visuals_dir) if f.endswith('.png')]
        print(f"Total visual files: {len(png_files)}")
        if png_files:
            print(f"Latest: {sorted(png_files)[-1]}")
    
    # 5. How to View Specific Content
    print("\n" + "="*80)
    print("🔍 HOW TO VIEW SPECIFIC CONTENT")
    print("="*80)
    
    print("""
1. FROM DASHBOARD:
   - Go to: http://localhost:8088/content
   - Click on any content card to view/edit
   - Use "Generate Content" button for new content

2. FROM DATABASE (SQL):
   sqlite3 ./data/agency.db
   SELECT * FROM content_ideas WHERE status='pending' LIMIT 10;
   SELECT * FROM content_ideas WHERE status='generated' LIMIT 10;

3. FROM FILES:
   cat posts/[filename].json | python -m json.tool

4. VISUAL EDITOR:
   http://localhost:8088/visual-editor
   - Create visual content from your ideas
    """)
    
    print("\n" + "="*80)
    print("💡 TIP: The Content Manager at http://localhost:8088/content")
    print("        is the easiest way to view and manage all content!")
    print("="*80)

if __name__ == "__main__":
    view_generated_content()
#!/usr/bin/env python3
"""
Clean up old 'Deep Dive' content from database
"""

import sqlite3
import json
from pathlib import Path

def clean_deep_dive_content():
    """Remove or update all 'Deep Dive' content from database"""
    
    print("\n🧹 Cleaning up 'Deep Dive' content from database")
    print("=" * 60)
    
    conn = sqlite3.connect("data/agency.db")
    cursor = conn.cursor()
    
    # Count existing Deep Dive entries
    cursor.execute("""
        SELECT COUNT(*) FROM content_ideas 
        WHERE title LIKE '%Deep Dive%'
    """)
    deep_dive_count = cursor.fetchone()[0]
    
    print(f"📊 Found {deep_dive_count} 'Deep Dive' entries in content_ideas")
    
    if deep_dive_count > 0:
        # Update Deep Dive titles to remove the phrase
        cursor.execute("""
            UPDATE content_ideas 
            SET title = REPLACE(REPLACE(title, 'Deep Dive: ', ''), 'Deep Dive ', '')
            WHERE title LIKE '%Deep Dive%'
        """)
        
        conn.commit()
        print(f"✅ Updated {deep_dive_count} titles to remove 'Deep Dive'")
    
    # Clean up JSON files
    posts_dir = Path("posts")
    json_files = list(posts_dir.glob("content_*.json"))
    
    updated_files = 0
    for json_file in json_files:
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            if 'title' in data and 'Deep Dive' in data.get('title', ''):
                # Update the title
                data['title'] = data['title'].replace('Deep Dive: ', '').replace('Deep Dive ', '')
                data['humanized'] = False  # Mark as old content
                
                with open(json_file, 'w') as f:
                    json.dump(data, f, indent=2)
                
                updated_files += 1
        except:
            continue
    
    if updated_files > 0:
        print(f"✅ Updated {updated_files} JSON files to remove 'Deep Dive'")
    
    conn.close()
    
    print("\n✨ Cleanup complete!")
    print("From now on, new content will use humanized titles without 'Deep Dive'")
    print("=" * 60)

if __name__ == "__main__":
    clean_deep_dive_content()
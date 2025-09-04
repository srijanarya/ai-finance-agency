#!/usr/bin/env python3
"""
Show Pending Content Ready for Posting
"""

import sqlite3
import json
from datetime import datetime

class ContentViewer:
    def __init__(self):
        self.db_path = "data/agency.db"
    
    def get_pending_content(self):
        """Fetch all pending content ideas from database"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM content_ideas 
            WHERE status = 'pending'
            ORDER BY urgency DESC, estimated_reach DESC
            LIMIT 10
        ''')
        
        ideas = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return ideas
    
    def display_content(self):
        """Display all pending content"""
        ideas = self.get_pending_content()
        
        print("\n" + "="*80)
        print("📝 PENDING CONTENT READY FOR POSTING")
        print("="*80)
        
        if not ideas:
            print("\n❌ No pending content found.")
            print("💡 Run 'python generate_content.py' to create new content.")
            return
        
        print(f"\nFound {len(ideas)} content ideas ready to post:\n")
        
        for i, idea in enumerate(ideas[:5], 1):  # Show top 5
            print(f"\n{'-'*80}")
            print(f"📌 ID: {idea['id']} | Priority #{i}")
            print(f"📝 Title: {idea['title']}")
            print(f"📊 Type: {idea['content_type']}")
            print(f"🔥 Urgency: {idea['urgency'].upper()}")
            print(f"🎯 Target: {idea['target_audience']}")
            print(f"📈 Estimated Reach: {idea['estimated_reach']:,}")
            print(f"⭐ Relevance Score: {idea.get('relevance_score', 'N/A')}")
            
            if idea.get('keywords'):
                keywords = json.loads(idea['keywords'])
                print(f"🏷️ Keywords: {', '.join(keywords[:8])}")
            
            if idea.get('data_points'):
                try:
                    data = json.loads(idea['data_points'])
                    if isinstance(data, dict) and data:
                        print(f"📊 Data Points:")
                        for key, value in list(data.items())[:3]:
                            print(f"   • {key}: {value}")
                except:
                    pass
        
        print(f"\n{'-'*80}")
        print(f"\n💡 To edit content: python view_edit_content.py")
        print(f"📤 To post content: python control_panel.py")
        print(f"🔄 To generate new: python generate_content.py")
        print("="*80 + "\n")

def main():
    viewer = ContentViewer()
    viewer.display_content()

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Display Your Generated Content
Shows exactly what content you have generated
"""

import json
import os
from datetime import datetime

def show_generated_content():
    print("\n" + "="*80)
    print("🎯 YOUR ACTUAL GENERATED CONTENT")
    print("="*80)
    
    # 1. Show content from JSON files
    print("\n📝 GENERATED CONTENT FILES IN posts/ DIRECTORY:")
    print("-"*80)
    
    json_files = sorted([f for f in os.listdir('posts') if f.endswith('.json')])
    
    # Show the 5 most recent complete posts
    complete_posts = [f for f in json_files if 'complete' in f or 'test' in f]
    
    if complete_posts:
        print(f"\nYou have {len(complete_posts)} complete posts generated:")
        
        for idx, filename in enumerate(complete_posts[-5:], 1):
            filepath = os.path.join('posts', filename)
            print(f"\n{idx}. FILE: {filename}")
            print("-"*40)
            
            with open(filepath, 'r') as f:
                data = json.load(f)
                
                print(f"📌 TITLE: {data.get('title', 'No title')}")
                print(f"\n📄 CONTENT:")
                content = data.get('content', 'No content')
                # Show full content
                for line in content.split('\n'):
                    if line.strip():
                        print(f"   {line}")
                
                if 'market_data' in data:
                    print(f"\n📊 MARKET DATA INCLUDED:")
                    for key, value in data['market_data'].items():
                        print(f"   • {key}: {value}")
                
                if 'visual_path' in data:
                    print(f"\n🖼️ VISUAL: {data['visual_path']}")
                
                print("\n" + "="*80)
    
    # 2. Show visual content
    print("\n🎨 GENERATED VISUALS IN posts/visuals/ DIRECTORY:")
    print("-"*80)
    
    visuals_dir = 'posts/visuals'
    if os.path.exists(visuals_dir):
        png_files = sorted([f for f in os.listdir(visuals_dir) if f.endswith('.png')])
        
        if png_files:
            print(f"You have {len(png_files)} visual files generated:")
            print("\nLatest 5 visuals:")
            for idx, filename in enumerate(png_files[-5:], 1):
                filepath = os.path.join(visuals_dir, filename)
                size = os.path.getsize(filepath) / 1024  # Size in KB
                print(f"{idx}. {filename} ({size:.1f} KB)")
    
    # 3. Show how to use this content
    print("\n" + "="*80)
    print("💡 HOW TO USE THIS CONTENT:")
    print("="*80)
    print("""
    1. POST ON SOCIAL MEDIA:
       - Copy the content text
       - Use the generated visual (PNG file)
       - Post on LinkedIn/Twitter/Instagram
    
    2. VIEW IN DASHBOARD:
       - Open: http://localhost:8088/content
       - Click on any content card
       - Use "Generate Content" button for more
    
    3. ACCESS FILES DIRECTLY:
       - Text content: posts/*.json files
       - Visual content: posts/visuals/*.png files
    
    4. SHARE WITH CLIENTS:
       - Show them these generated samples
       - Demonstrate the quality and accuracy
       - Use as proof of concept
    """)

if __name__ == "__main__":
    show_generated_content()
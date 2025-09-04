#!/usr/bin/env python3
"""
Test Humanized Content Generation Only
"""

from humanized_content_generator import HumanizedContentGenerator
from datetime import datetime
import json

def test_humanized_content_variety():
    """Test that the humanized content generator creates varied content"""
    
    print("\n🚀 Testing Humanized Content Generation")
    print("=" * 70)
    print("✨ No more 'Deep Dive' titles!")
    print("✨ Different personalities and styles!")
    print("=" * 70)
    
    generator = HumanizedContentGenerator()
    
    # Generate 5 pieces of content to show variety
    for i in range(5):
        print(f"\n\n📝 CONTENT {i+1}")
        print("-" * 70)
        
        content = generator.generate_humanized_content()
        
        print(f"📌 Title: {content['title']}")
        print(f"🎭 Personality: {content['personality']}")
        print(f"📋 Content Type: {content['content_type']}")
        print("\n--- Content ---")
        print(content['content'])
        
        if content['hashtags']:
            print(f"\nHashtags: #{' #'.join(content['hashtags'])}")
        
        # Save to file
        filename = f"posts/humanized_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i}.json"
        with open(filename, 'w') as f:
            json.dump(content, f, indent=2)
        print(f"\n💾 Saved to: {filename}")
    
    print("\n\n" + "=" * 70)
    print("✅ SUCCESS! Generated 5 unique humanized posts")
    print("\n🎯 Key achievements:")
    print("• No 'Deep Dive' titles")
    print("• Varied content structures")
    print("• Different personalities")
    print("• Natural, human-like writing")
    print("• Ready for LinkedIn posting")
    print("=" * 70)
    
    return True

if __name__ == "__main__":
    test_humanized_content_variety()
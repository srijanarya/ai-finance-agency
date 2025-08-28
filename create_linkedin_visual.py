#!/usr/bin/env python3
"""
Create LinkedIn Visual Content
Generates visual posts with engaging titles and graphics
"""

import json
import os
from datetime import datetime
from generate_visual_content import VisualContentGenerator
from PIL import Image, ImageDraw, ImageFont
import textwrap

class LinkedInVisualCreator:
    def __init__(self):
        self.generator = VisualContentGenerator()
        self.output_dir = "posts/visuals"
        os.makedirs(self.output_dir, exist_ok=True)
        
    def create_market_snapshot_visual(self, data: dict) -> str:
        """Create a market snapshot visual"""
        
        # Create a square image (1080x1080 for LinkedIn)
        img = Image.new('RGB', (1080, 1080), color='#0077B6')
        draw = ImageDraw.Draw(img)
        
        # Try to use a system font, fallback to default if not available
        try:
            title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
            body_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
            small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        except:
            # Use default font if system fonts not available
            title_font = ImageFont.load_default()
            body_font = ImageFont.load_default()
            small_font = ImageFont.load_default()
        
        # Background gradient effect
        for i in range(1080):
            color = int(255 * (1 - i/1080))
            draw.rectangle([(0, i), (1080, i+1)], fill=(0, 119+color//4, 182+color//4))
        
        # Add title
        title = data.get('title', 'Market Update')
        wrapped_title = textwrap.fill(title, width=30)
        # Split multiline text and draw each line
        lines = wrapped_title.split('\n')
        y_pos = 100
        for line in lines:
            draw.text((540, y_pos), line, font=title_font, 
                     fill='white', anchor='mt')
            y_pos += 60
        
        # Add market data in a grid
        y_offset = 300
        
        # Create boxes for key metrics
        metrics = [
            ("NIFTY", data.get('nifty', '24,712'), "-0.75%", "#FF4757"),
            ("SENSEX", data.get('sensex', '80,787'), "-0.73%", "#FF4757"),
            ("FII FLOW", data.get('fii', '₹-892 Cr'), "", "#FF4757"),
            ("DII FLOW", data.get('dii', '₹+3,456 Cr'), "", "#00D2D3")
        ]
        
        for i, (label, value, change, color) in enumerate(metrics):
            x = 140 + (i % 2) * 400
            y = y_offset + (i // 2) * 200
            
            # Draw box
            draw.rounded_rectangle([(x, y), (x+360, y+150)], radius=20, 
                                  fill='white', outline=color, width=3)
            
            # Add text
            draw.text((x+180, y+30), label, font=small_font, fill=color, anchor='mt')
            draw.text((x+180, y+75), value, font=body_font, fill='black', anchor='mt')
            if change:
                draw.text((x+180, y+115), change, font=small_font, fill=color, anchor='mt')
        
        # Add key insight
        insight = data.get('insight', 'Smart money is accumulating')
        wrapped_insight = textwrap.fill(insight, width=40)
        # Split and draw insight lines
        insight_lines = wrapped_insight.split('\n')
        y_pos = 750
        for line in insight_lines:
            draw.text((540, y_pos), line, font=body_font, 
                     fill='white', anchor='mt')
            y_pos += 45
        
        # Add branding
        draw.text((540, 980), "AI Finance Agency", font=body_font, 
                 fill='white', anchor='mt')
        draw.text((540, 1020), "Data-Driven Insights", font=small_font, 
                 fill='#B8E6FF', anchor='mt')
        
        # Save image
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{self.output_dir}/linkedin_visual_{timestamp}.png"
        img.save(filename, quality=95)
        
        return filename
    
    def create_stock_analysis_visual(self, stock_data: dict) -> str:
        """Create a stock analysis visual"""
        
        img = Image.new('RGB', (1080, 1080), color='#2C3E50')
        draw = ImageDraw.Draw(img)
        
        try:
            title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 56)
            body_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
            small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        except:
            title_font = ImageFont.load_default()
            body_font = ImageFont.load_default()
            small_font = ImageFont.load_default()
        
        # Gradient background
        for i in range(1080):
            color = int(100 * (1 - i/1080))
            draw.rectangle([(0, i), (1080, i+1)], fill=(44+color, 62+color, 80+color))
        
        # Stock name and recommendation
        stock = stock_data.get('stock', 'TCS')
        recommendation = stock_data.get('recommendation', 'BUY')
        
        # Recommendation badge color
        rec_color = '#00D2D3' if recommendation == 'BUY' else '#FF4757'
        
        draw.text((540, 100), stock, font=title_font, fill='white', anchor='mt')
        
        # Recommendation badge
        draw.rounded_rectangle([(390, 180), (690, 240)], radius=25, 
                              fill=rec_color)
        draw.text((540, 210), recommendation, font=body_font, fill='white', anchor='mm')
        
        # Price levels
        levels = [
            ("Current Price", stock_data.get('cmp', '₹4,234')),
            ("Target", stock_data.get('target', '₹4,500')),
            ("Stop Loss", stock_data.get('stop_loss', '₹4,100')),
            ("Upside", stock_data.get('upside', '15%'))
        ]
        
        y_offset = 320
        for label, value in levels:
            draw.text((200, y_offset), label, font=small_font, fill='#B8C5D6', anchor='lm')
            draw.text((880, y_offset), value, font=body_font, fill='white', anchor='rm')
            y_offset += 80
        
        # Key metrics
        draw.text((540, 700), "KEY METRICS", font=small_font, fill='#B8C5D6', anchor='mt')
        
        metrics = [
            ("P/E", stock_data.get('pe', '29.5')),
            ("P/B", stock_data.get('pb', '3.2')),
            ("ROE", stock_data.get('roe', '18%'))
        ]
        
        x_offset = 270
        for label, value in metrics:
            draw.text((x_offset, 760), label, font=small_font, fill='#B8C5D6', anchor='mt')
            draw.text((x_offset, 800), value, font=body_font, fill='white', anchor='mt')
            x_offset += 270
        
        # Bottom branding
        draw.text((540, 980), "AI Finance Agency", font=body_font, 
                 fill='white', anchor='mt')
        draw.text((540, 1020), datetime.now().strftime("%d %B %Y"), 
                 font=small_font, fill='#B8C5D6', anchor='mt')
        
        # Save
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{self.output_dir}/stock_visual_{timestamp}.png"
        img.save(filename, quality=95)
        
        return filename
    
    def create_complete_post(self, content_type: str = "market_analysis") -> dict:
        """Create a complete LinkedIn post with visual"""
        
        # Generate content
        content_data = self.generator.generate_complete_content(content_type)
        
        # Create visual based on type
        if content_type == "market_analysis":
            visual_data = {
                'title': content_data['title'],
                'nifty': '24,712',
                'sensex': '80,787',
                'fii': '₹-892 Cr',
                'dii': '₹+3,456 Cr',
                'insight': 'DIIs absorbed every FII sell-off. Pattern suggests 15% upside.'
            }
            visual_path = self.create_market_snapshot_visual(visual_data)
        else:
            visual_data = {
                'stock': 'TCS',
                'recommendation': 'BUY',
                'cmp': '₹4,234',
                'target': '₹4,500',
                'stop_loss': '₹4,100',
                'upside': '15%',
                'pe': '29.5',
                'pb': '3.2',
                'roe': '18%'
            }
            visual_path = self.create_stock_analysis_visual(visual_data)
        
        # Prepare complete post
        post = {
            'title': content_data['title'],
            'content': content_data['content'],
            'hashtags': content_data['hashtags'],
            'visual_path': visual_path,
            'visual_spec': content_data['visual_spec'],
            'timestamp': datetime.now().isoformat()
        }
        
        # Save post data
        post_file = f"posts/complete_post_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(post_file, 'w') as f:
            json.dump(post, f, indent=2)
        
        return post

def main():
    creator = LinkedInVisualCreator()
    
    print("\n🎨 Creating LinkedIn Visual Content")
    print("=" * 60)
    
    # Create market analysis post
    print("\n📊 Creating Market Analysis Post...")
    market_post = creator.create_complete_post("market_analysis")
    
    print(f"\n✅ Market Analysis Post Created!")
    print(f"📌 Title: {market_post['title']}")
    print(f"🖼️ Visual: {market_post['visual_path']}")
    print(f"📝 Content Length: {len(market_post['content'])} chars")
    
    # Create stock pick post
    print("\n📈 Creating Stock Pick Post...")
    stock_post = creator.create_complete_post("stock_pick")
    
    print(f"\n✅ Stock Pick Post Created!")
    print(f"📌 Title: {stock_post['title']}")
    print(f"🖼️ Visual: {stock_post['visual_path']}")
    
    print("\n" + "=" * 60)
    print("🎉 Visual content ready for LinkedIn!")
    print(f"📁 Check the 'posts/visuals/' folder for images")
    print("=" * 60)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Professional Visual Content Creator for LinkedIn
Creates high-quality, engaging visual content
"""

import json
import os
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import textwrap
import random
import io

class ProfessionalVisualCreator:
    def __init__(self):
        self.output_dir = "posts/visuals"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Professional color schemes
        self.color_schemes = {
            "professional_blue": {
                "primary": "#003D82",
                "secondary": "#0066CC", 
                "accent": "#00A6FB",
                "success": "#00C851",
                "danger": "#FF4444",
                "background": "#F8F9FA",
                "text": "#2C3E50",
                "light": "#FFFFFF"
            },
            "modern_gradient": {
                "gradient_start": "#667EEA",
                "gradient_end": "#764BA2",
                "primary": "#5A67D8",
                "secondary": "#ED64A6",
                "text": "#FFFFFF",
                "dark_text": "#2D3748",
                "accent": "#FBB6CE"
            },
            "financial_green": {
                "primary": "#004643",
                "secondary": "#2A9D8F",
                "accent": "#E9C46A",
                "success": "#52C41A",
                "danger": "#F44336",
                "background": "#F1FAEE",
                "text": "#264653",
                "light": "#FFFFFF"
            },
            "dark_professional": {
                "primary": "#1A202C",
                "secondary": "#2D3748",
                "accent": "#4299E1",
                "success": "#48BB78",
                "danger": "#F56565",
                "background": "#EDF2F7",
                "text": "#FFFFFF",
                "light": "#F7FAFC"
            }
        }
        
        # Font settings
        self.fonts = self._load_fonts()
        
    def _load_fonts(self):
        """Load professional fonts with fallbacks"""
        fonts = {}
        try:
            # Try to load system fonts
            fonts['title'] = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
            fonts['heading'] = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
            fonts['body'] = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
            fonts['small'] = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
            fonts['tiny'] = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
        except:
            # Fallback to default fonts
            default_size = 40
            fonts['title'] = ImageFont.load_default()
            fonts['heading'] = ImageFont.load_default()
            fonts['body'] = ImageFont.load_default()
            fonts['small'] = ImageFont.load_default()
            fonts['tiny'] = ImageFont.load_default()
        return fonts
    
    def create_market_snapshot_professional(self, data):
        """Create a professional market snapshot visual"""
        
        # Create high-res canvas
        width, height = 1080, 1080
        img = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(img)
        
        # Get color scheme
        colors = self.color_schemes['professional_blue']
        
        # Create gradient background
        for i in range(height):
            color_value = int(255 - (i / height) * 50)
            draw.rectangle([(0, i), (width, i+1)], 
                         fill=(color_value, color_value, min(255, color_value + 5)))
        
        # Add header section with gradient
        header_height = 280
        for i in range(header_height):
            opacity = 1 - (i / header_height * 0.5)
            r = int(0 * opacity + 248 * (1 - opacity))
            g = int(61 * opacity + 249 * (1 - opacity))  
            b = int(130 * opacity + 250 * (1 - opacity))
            draw.rectangle([(0, i), (width, i+1)], fill=(r, g, b))
        
        # Add title with better positioning
        title = data.get('title', 'Market Update')
        title_lines = textwrap.wrap(title, width=35)
        
        y_offset = 60
        for line in title_lines:
            # Add shadow effect for title
            shadow_offset = 2
            draw.text((540 + shadow_offset, y_offset + shadow_offset), line,
                     font=self.fonts['heading'], fill=(0, 0, 0, 128), anchor='mt')
            draw.text((540, y_offset), line,
                     font=self.fonts['heading'], fill='white', anchor='mt')
            y_offset += 60
        
        # Add date/time stamp
        timestamp = datetime.now().strftime("%d %B %Y | %I:%M %p IST")
        draw.text((540, y_offset + 20), timestamp,
                 font=self.fonts['small'], fill=(255, 255, 255, 200), anchor='mt')
        
        # Create card sections for metrics
        card_y = 320
        cards = [
            {"title": "NIFTY 50", "value": data.get('nifty', '24,712'), 
             "change": "-0.75%", "color": colors['danger']},
            {"title": "SENSEX", "value": data.get('sensex', '80,787'), 
             "change": "-0.73%", "color": colors['danger']},
            {"title": "FII FLOW", "value": data.get('fii', '₹-892 Cr'), 
             "change": "", "color": colors['danger']},
            {"title": "DII FLOW", "value": data.get('dii', '₹+3,456 Cr'), 
             "change": "", "color": colors['success']}
        ]
        
        # Draw metric cards in 2x2 grid
        card_width = 460
        card_height = 140
        padding = 30
        
        for i, card in enumerate(cards):
            x = 50 + (i % 2) * (card_width + padding)
            y = card_y + (i // 2) * (card_height + padding)
            
            # Card background with shadow effect using rounded rectangle
            draw.rounded_rectangle([(x+2, y+2), (x + card_width + 2, y + card_height + 2)],
                                  radius=15, fill=(200, 200, 200))
            
            # Card background
            draw.rounded_rectangle([(x, y), (x + card_width, y + card_height)],
                                  radius=15, fill='white')
            
            # Card border top (colored)
            draw.rectangle([(x, y), (x + card_width, y + 5)], fill=card['color'])
            
            # Card content
            draw.text((x + 20, y + 25), card['title'],
                     font=self.fonts['small'], fill=colors['text'])
            draw.text((x + 20, y + 65), card['value'],
                     font=self.fonts['heading'], fill=colors['primary'])
            
            if card['change']:
                change_color = colors['danger'] if '-' in card['change'] else colors['success']
                draw.text((x + 20, y + 110), card['change'],
                         font=self.fonts['small'], fill=change_color)
        
        # Add insight section
        insight_y = 680
        # Draw white background rectangle for insight
        draw.rounded_rectangle([(50, insight_y), (width - 50, insight_y + 140)],
                              radius=15, fill=(255, 255, 255))
        
        # Draw insight with icon
        draw.text((90, insight_y + 30), "💡 KEY INSIGHT",
                 font=self.fonts['small'], fill=colors['primary'])
        
        insight_text = data.get('insight', 'Smart money is accumulating')
        insight_lines = textwrap.wrap(insight_text, width=50)
        y_pos = insight_y + 65
        for line in insight_lines:
            draw.text((90, y_pos), line,
                     font=self.fonts['body'], fill=colors['text'])
            y_pos += 40
        
        # Add call to action
        cta_y = 860
        draw.rounded_rectangle([(340, cta_y), (740, cta_y + 60)],
                              radius=30, fill=colors['accent'])
        draw.text((540, cta_y + 30), "Follow for Daily Updates",
                 font=self.fonts['body'], fill='white', anchor='mm')
        
        # Add branding footer
        footer_y = 960
        # Footer background
        draw.rectangle([(0, footer_y), (width, height)], fill=colors['primary'])
        
        # Logo area (placeholder)
        draw.ellipse([(50, footer_y + 20), (110, footer_y + 80)], 
                    fill=colors['accent'])
        draw.text((80, footer_y + 50), "AF", 
                 font=self.fonts['body'], fill='white', anchor='mm')
        
        # Brand text
        draw.text((140, footer_y + 35), "AI Finance Agency",
                 font=self.fonts['body'], fill='white', anchor='lm')
        draw.text((140, footer_y + 65), "Data-Driven Market Intelligence",
                 font=self.fonts['small'], fill=(255, 255, 255, 180), anchor='lm')
        
        # Social handles
        draw.text((width - 50, footer_y + 50), "@aifinanceagency",
                 font=self.fonts['small'], fill=(255, 255, 255, 180), anchor='rm')
        
        # Save with high quality
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{self.output_dir}/market_professional_{timestamp}.png"
        img.save(filename, quality=95, optimize=True)
        
        return filename
    
    def create_stock_analysis_professional(self, data):
        """Create professional stock analysis visual"""
        
        width, height = 1080, 1080
        img = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(img)
        
        colors = self.color_schemes['financial_green']
        
        # Create sophisticated background
        # Gradient with pattern
        for i in range(height):
            progress = i / height
            r = int(colors['background'][1:3], 16) * (1 - progress * 0.2)
            g = int(colors['background'][3:5], 16) * (1 - progress * 0.2)
            b = int(colors['background'][5:7], 16) * (1 - progress * 0.2)
            draw.rectangle([(0, i), (width, i+1)], fill=(int(r), int(g), int(b)))
        
        # Add geometric patterns
        for i in range(0, width, 100):
            draw.line([(i, 0), (i + height, height)], fill=(230, 230, 230, 50), width=1)
        
        # Header section
        draw.rectangle([(0, 0), (width, 200)], fill=(0, 70, 67))
        
        # Stock name and recommendation badge
        stock = data.get('stock', 'TCS')
        draw.text((540, 60), stock,
                 font=self.fonts['title'], fill='white', anchor='mt')
        
        # Recommendation badge
        rec = data.get('recommendation', 'BUY')
        rec_color = colors['success'] if rec == 'BUY' else colors['danger']
        
        badge_width = 200
        badge_x = 440
        badge_y = 130
        draw.rounded_rectangle([(badge_x, badge_y), (badge_x + badge_width, badge_y + 50)],
                              radius=25, fill=rec_color)
        draw.text((540, badge_y + 25), rec,
                 font=self.fonts['heading'], fill='white', anchor='mm')
        
        # Price card
        price_card_y = 240
        card_margin = 50
        card_width = width - (card_margin * 2)
        card_height = 320
        
        # Card with shadow effect
        draw.rounded_rectangle([(card_margin + 3, price_card_y + 3), 
                               (card_margin + card_width + 3, price_card_y + card_height + 3)],
                              radius=20, fill=(220, 220, 220))
        
        draw.rounded_rectangle([(card_margin, price_card_y), 
                               (card_margin + card_width, price_card_y + card_height)],
                              radius=20, fill='white')
        
        # Price levels with icons
        levels = [
            ("📍 Current", data.get('cmp', '₹4,234'), None),
            ("🎯 Target", data.get('target', '₹4,500'), colors['success']),
            ("🛡️ Stop Loss", data.get('stop_loss', '₹4,100'), colors['danger']),
            ("📈 Upside", data.get('upside', '15%'), colors['accent'])
        ]
        
        y_offset = price_card_y + 40
        for icon_label, value, color in levels:
            draw.text((card_margin + 50, y_offset), icon_label,
                     font=self.fonts['body'], fill=colors['text'])
            
            value_color = color if color else colors['primary']
            draw.text((width - card_margin - 50, y_offset), value,
                     font=self.fonts['heading'], fill=value_color, anchor='rt')
            
            y_offset += 70
            
            # Add separator line
            if icon_label != "📈 Upside":
                draw.line([(card_margin + 50, y_offset - 20), 
                          (width - card_margin - 50, y_offset - 20)],
                         fill=(230, 230, 230), width=1)
        
        # Metrics section
        metrics_y = 600
        metrics = [
            ("P/E Ratio", data.get('pe', '29.5')),
            ("P/B Ratio", data.get('pb', '3.2')),
            ("ROE", data.get('roe', '18%')),
            ("Div Yield", data.get('div_yield', '1.2%'))
        ]
        
        metric_card_width = 230
        metric_spacing = 20
        start_x = (width - (4 * metric_card_width + 3 * metric_spacing)) // 2
        
        for i, (label, value) in enumerate(metrics):
            x = start_x + i * (metric_card_width + metric_spacing)
            
            # Metric card
            draw.rounded_rectangle([(x, metrics_y), (x + metric_card_width, metrics_y + 100)],
                                  radius=15, fill=colors['primary'])
            
            draw.text((x + metric_card_width // 2, metrics_y + 30), label,
                     font=self.fonts['small'], fill=(255, 255, 255, 200), anchor='mm')
            draw.text((x + metric_card_width // 2, metrics_y + 65), value,
                     font=self.fonts['heading'], fill='white', anchor='mm')
        
        # Analysis summary
        summary_y = 740
        draw.rounded_rectangle([(50, summary_y), (width - 50, summary_y + 120)],
                              radius=15, fill=(255, 255, 255))
        
        draw.text((90, summary_y + 25), "📊 TECHNICAL OUTLOOK",
                 font=self.fonts['small'], fill=colors['primary'])
        
        summary_text = "Strong momentum with breakout above resistance. Volume surge confirms institutional buying."
        summary_lines = textwrap.wrap(summary_text, width=55)
        y_pos = summary_y + 55
        for line in summary_lines:
            draw.text((90, y_pos), line,
                     font=self.fonts['body'], fill=colors['text'])
            y_pos += 35
        
        # Footer with branding
        footer_y = 940
        draw.rectangle([(0, footer_y), (width, height)], fill=colors['primary'])
        
        # Time stamp
        timestamp_str = datetime.now().strftime("%d %B %Y | %I:%M %p IST")
        draw.text((50, footer_y + 35), timestamp_str,
                 font=self.fonts['small'], fill=(255, 255, 255, 180))
        
        # Brand
        draw.text((540, footer_y + 35), "AI Finance Agency",
                 font=self.fonts['body'], fill='white', anchor='mm')
        draw.text((540, footer_y + 65), "Professional Market Analysis",
                 font=self.fonts['small'], fill=(255, 255, 255, 180), anchor='mm')
        
        # Disclaimer
        draw.text((width - 50, footer_y + 50), "For Educational Purpose Only",
                 font=self.fonts['tiny'], fill=(255, 255, 255, 150), anchor='rm')
        
        # Save
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{self.output_dir}/stock_professional_{timestamp}.png"
        img.save(filename, quality=95, optimize=True)
        
        return filename
    
    def create_quote_card_professional(self, data):
        """Create professional quote card visual"""
        
        width, height = 1080, 1080
        img = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(img)
        
        colors = self.color_schemes['modern_gradient']
        
        # Create gradient background
        for i in range(height):
            progress = i / height
            r = int(102 + (118 - 102) * progress)  # From #667EEA
            g = int(126 + (75 - 126) * progress)   # to #764BA2
            b = int(234 + (162 - 234) * progress)
            draw.rectangle([(0, i), (width, i+1)], fill=(r, g, b))
        
        # Draw circles pattern directly
        for i in range(0, width, 100):
            for j in range(0, height, 100):
                draw.ellipse([(i-30, j-30), (i+30, j+30)],
                            outline=(255, 255, 255), width=1)
        
        # Quote container
        quote_margin = 100
        quote_y = 250
        quote_height = 400
        
        # Quote background
        draw.rounded_rectangle([(quote_margin, quote_y), 
                               (width - quote_margin, quote_y + quote_height)],
                              radius=20, fill=(255, 255, 255))
        
        # Quote marks
        quote_mark = '"'
        draw.text((quote_margin + 50, quote_y + 40), quote_mark,
                 font=self.fonts['title'], fill=colors['primary'])
        
        # Quote text
        quote = data.get('quote', "Time in the market beats timing the market.")
        quote_lines = textwrap.wrap(quote, width=35)
        
        y_pos = quote_y + 120
        for line in quote_lines:
            draw.text((540, y_pos), line,
                     font=self.fonts['heading'], fill=colors['dark_text'], anchor='mt')
            y_pos += 60
        
        # Quote author
        author = data.get('author', '- Warren Buffett')
        draw.text((540, y_pos + 40), author,
                 font=self.fonts['body'], fill=colors['primary'], anchor='mt')
        
        # Market context
        context_y = 720
        context = data.get('context', 'Applicable to current Indian markets where DIIs are absorbing FII selling')
        context_lines = textwrap.wrap(context, width=45)
        
        for line in context_lines:
            draw.text((540, context_y), line,
                     font=self.fonts['body'], fill='white', anchor='mt')
            context_y += 40
        
        # Call to action
        cta_y = 850
        draw.rounded_rectangle([(340, cta_y), (740, cta_y + 70)],
                              radius=35, fill='white')
        draw.text((540, cta_y + 35), "Follow for More Insights",
                 font=self.fonts['body'], fill=colors['primary'], anchor='mm')
        
        # Branding
        draw.text((540, 980), "AI Finance Agency",
                 font=self.fonts['body'], fill='white', anchor='mt')
        draw.text((540, 1020), "@aifinanceagency",
                 font=self.fonts['small'], fill=(255, 255, 255, 180), anchor='mt')
        
        # Save
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{self.output_dir}/quote_professional_{timestamp}.png"
        img.save(filename, quality=95, optimize=True)
        
        return filename

def test_professional_visuals():
    """Test all visual types with sample data"""
    creator = ProfessionalVisualCreator()
    
    print("🎨 Creating Professional Visuals")
    print("=" * 60)
    
    # Test Market Snapshot
    market_data = {
        'title': 'Markets End Lower as FII Selling Continues',
        'nifty': '24,712 (-0.75%)',
        'sensex': '80,787 (-0.73%)',
        'fii': '₹-892 Cr',
        'dii': '₹+3,456 Cr',
        'insight': 'DIIs absorbed ₹3,456 Cr of FII selling. Historical pattern suggests potential reversal in 2-3 weeks.'
    }
    
    visual1 = creator.create_market_snapshot_professional(market_data)
    print(f"✅ Market Snapshot: {visual1}")
    
    # Test Stock Analysis
    stock_data = {
        'stock': 'RELIANCE',
        'recommendation': 'BUY',
        'cmp': '₹2,834',
        'target': '₹3,200',
        'stop_loss': '₹2,700',
        'upside': '12.9%',
        'pe': '26.3',
        'pb': '2.8',
        'roe': '11.2%',
        'div_yield': '0.31%'
    }
    
    visual2 = creator.create_stock_analysis_professional(stock_data)
    print(f"✅ Stock Analysis: {visual2}")
    
    # Test Quote Card
    quote_data = {
        'quote': 'Be fearful when others are greedy, and greedy when others are fearful.',
        'author': '- Warren Buffett',
        'context': 'With FIIs selling aggressively and retail investors fearful, contrarian opportunity emerges'
    }
    
    visual3 = creator.create_quote_card_professional(quote_data)
    print(f"✅ Quote Card: {visual3}")
    
    print("\n" + "=" * 60)
    print("🎉 All professional visuals created successfully!")
    print(f"📁 Check: {creator.output_dir}/")
    
    return [visual1, visual2, visual3]

if __name__ == "__main__":
    visuals = test_professional_visuals()
    print(f"Created {len(visuals)} professional visuals")
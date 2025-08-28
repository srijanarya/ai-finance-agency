#!/usr/bin/env python3
"""
Dezerv-Style Professional Visual Creator
Learning from successful LinkedIn finance content creators
"""

import json
import os
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import textwrap
import random

class DezervStyleVisualCreator:
    def __init__(self):
        self.output_dir = "posts/visuals"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Dezerv-inspired minimalist color palette
        self.colors = {
            "primary_blue": "#0A66C2",  # LinkedIn blue
            "dark_blue": "#004182",
            "light_blue": "#E7F3FF",
            "success_green": "#057642",
            "danger_red": "#CC0000",
            "text_primary": "#191919",
            "text_secondary": "#666666",
            "background": "#FFFFFF",
            "light_gray": "#F3F2EF",
            "accent_yellow": "#F5C500"
        }
        
        self.fonts = self._load_fonts()
        
    def _load_fonts(self):
        """Load clean, professional fonts"""
        fonts = {}
        try:
            # Prefer clean, modern fonts
            fonts['hero'] = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 84)
            fonts['title'] = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 56)
            fonts['heading'] = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 42)
            fonts['body'] = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
            fonts['small'] = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
            fonts['tiny'] = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
        except:
            # Fallback fonts
            fonts['hero'] = ImageFont.load_default()
            fonts['title'] = ImageFont.load_default() 
            fonts['heading'] = ImageFont.load_default()
            fonts['body'] = ImageFont.load_default()
            fonts['small'] = ImageFont.load_default()
            fonts['tiny'] = ImageFont.load_default()
        return fonts
    
    def create_narrative_visual(self, data):
        """Create a narrative-driven visual like Dezerv's India 2047 post"""
        
        width, height = 1080, 1080
        img = Image.new('RGB', (width, height), color=self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Clean white background with subtle gradient at bottom
        for i in range(height - 200, height):
            opacity = (i - (height - 200)) / 200
            gray_val = int(243 + (255 - 243) * (1 - opacity))
            draw.rectangle([(0, i), (width, i+1)], fill=(gray_val, gray_val, gray_val))
        
        # Top accent bar - minimal and elegant
        draw.rectangle([(0, 0), (width, 8)], fill=self.colors['primary_blue'])
        
        # Hero number/statement - the hook
        hero_y = 100
        hero_text = data.get('hero_text', '₹30 Trillion')
        draw.text((540, hero_y), hero_text,
                 font=self.fonts['hero'], fill=self.colors['primary_blue'], anchor='mt')
        
        # Supporting headline
        headline_y = 200
        headline = data.get('headline', 'India\'s Journey to 2047')
        headline_lines = textwrap.wrap(headline, width=28)
        for line in headline_lines:
            draw.text((540, headline_y), line,
                     font=self.fonts['title'], fill=self.colors['text_primary'], anchor='mt')
            headline_y += 65
        
        # The narrative section - key differentiator
        narrative_y = 350
        narrative = data.get('narrative', 
            "From a $4 trillion economy today to potentially $30 trillion by 2047. "
            "This isn't just growth - it's transformation.")
        
        # Background for narrative
        draw.rounded_rectangle([(60, narrative_y - 20), (width - 60, narrative_y + 150)],
                              radius=15, fill=self.colors['light_gray'])
        
        narrative_lines = textwrap.wrap(narrative, width=45)
        text_y = narrative_y + 20
        for line in narrative_lines:
            draw.text((540, text_y), line,
                     font=self.fonts['body'], fill=self.colors['text_primary'], anchor='mt')
            text_y += 38
        
        # Key insights - bullet points like Dezerv
        insights_y = 550
        insights = data.get('insights', [
            "📈 GDP growth averaging 7-8% annually",
            "🏭 Manufacturing hub of the world",
            "💡 Tech & innovation powerhouse",
            "👥 Demographic dividend at peak"
        ])
        
        for insight in insights:
            # Clean bullet point style
            draw.text((100, insights_y), insight,
                     font=self.fonts['body'], fill=self.colors['text_secondary'])
            insights_y += 50
        
        # Thought-provoking question - engagement driver
        question_y = 800
        question = data.get('question', "Are you positioned for India's growth story?")
        draw.rounded_rectangle([(80, question_y - 10), (width - 80, question_y + 60)],
                              radius=20, fill=self.colors['light_blue'])
        draw.text((540, question_y + 25), question,
                 font=self.fonts['heading'], fill=self.colors['dark_blue'], anchor='mm')
        
        # Clean footer - no heavy branding
        footer_y = 920
        draw.line([(100, footer_y), (width - 100, footer_y)], 
                 fill=self.colors['light_gray'], width=2)
        
        # Minimal branding
        draw.text((100, footer_y + 40), "AI Finance Agency",
                 font=self.fonts['small'], fill=self.colors['text_secondary'])
        
        # Date and context
        timestamp = datetime.now().strftime("%B %Y")
        draw.text((width - 100, footer_y + 40), f"Analysis • {timestamp}",
                 font=self.fonts['small'], fill=self.colors['text_secondary'], anchor='ra')
        
        # Save
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{self.output_dir}/narrative_visual_{timestamp}.png"
        img.save(filename, quality=95, optimize=True)
        
        return filename
    
    def create_data_story_visual(self, data):
        """Create a data storytelling visual with minimal design"""
        
        width, height = 1080, 1080
        img = Image.new('RGB', (width, height), color=self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Subtle top gradient
        for i in range(150):
            opacity = 1 - (i / 150)
            blue_val = int(10 * opacity)
            draw.rectangle([(0, i), (width, i+1)], 
                         fill=(245 + blue_val, 248 + blue_val, 255))
        
        # The hook - a powerful statement
        hook_y = 80
        hook = data.get('hook', 'The Numbers Tell a Story')
        draw.text((540, hook_y), hook,
                 font=self.fonts['heading'], fill=self.colors['text_primary'], anchor='mt')
        
        # Data comparison - before/after or current/future
        comparison_y = 180
        
        # Today's snapshot
        draw.rounded_rectangle([(100, comparison_y), (480, comparison_y + 280)],
                              radius=20, fill=self.colors['light_gray'])
        
        draw.text((290, comparison_y + 30), "TODAY",
                 font=self.fonts['small'], fill=self.colors['text_secondary'], anchor='mt')
        
        current_value = data.get('current_value', '₹4 Trillion')
        draw.text((290, comparison_y + 80), current_value,
                 font=self.fonts['title'], fill=self.colors['text_primary'], anchor='mt')
        
        current_details = data.get('current_details', [
            "5th largest economy",
            "$3,500 per capita"
        ])
        
        detail_y = comparison_y + 160
        for detail in current_details:
            draw.text((290, detail_y), detail,
                     font=self.fonts['small'], fill=self.colors['text_secondary'], anchor='mt')
            detail_y += 35
        
        # Arrow showing progression
        arrow_y = comparison_y + 140
        draw.text((540, arrow_y), "→",
                 font=self.fonts['hero'], fill=self.colors['primary_blue'], anchor='mm')
        
        # Future projection
        draw.rounded_rectangle([(600, comparison_y), (980, comparison_y + 280)],
                              radius=20, fill=self.colors['light_blue'])
        
        draw.text((790, comparison_y + 30), "2047",
                 font=self.fonts['small'], fill=self.colors['dark_blue'], anchor='mt')
        
        future_value = data.get('future_value', '₹30 Trillion')
        draw.text((790, comparison_y + 80), future_value,
                 font=self.fonts['title'], fill=self.colors['dark_blue'], anchor='mt')
        
        future_details = data.get('future_details', [
            "3rd largest economy",
            "$15,000 per capita"
        ])
        
        detail_y = comparison_y + 160
        for detail in future_details:
            draw.text((790, detail_y), detail,
                     font=self.fonts['small'], fill=self.colors['dark_blue'], anchor='mt')
            detail_y += 35
        
        # Key drivers section
        drivers_y = 520
        draw.text((540, drivers_y), "KEY DRIVERS",
                 font=self.fonts['small'], fill=self.colors['text_secondary'], anchor='mt')
        
        drivers = data.get('drivers', [
            "Digital transformation accelerating",
            "Manufacturing renaissance underway", 
            "Services export doubling every 5 years",
            "Startup ecosystem creating unicorns"
        ])
        
        driver_y = drivers_y + 50
        for i, driver in enumerate(drivers):
            # Alternate colors for visual interest
            color = self.colors['text_primary'] if i % 2 == 0 else self.colors['primary_blue']
            draw.text((100, driver_y), f"• {driver}",
                     font=self.fonts['body'], fill=color)
            driver_y += 45
        
        # Investment thesis - the "so what"
        thesis_y = 780
        thesis = data.get('thesis', 
            "Early investors in India's growth story could see transformational returns")
        
        draw.rounded_rectangle([(60, thesis_y), (width - 60, thesis_y + 80)],
                              radius=20, fill=self.colors['accent_yellow'], outline=self.colors['accent_yellow'], width=2)
        
        thesis_lines = textwrap.wrap(thesis, width=40)
        text_y = thesis_y + 25
        for line in thesis_lines:
            draw.text((540, text_y), line,
                     font=self.fonts['body'], fill=self.colors['text_primary'], anchor='mt')
            text_y += 35
        
        # Clean footer
        footer_y = 940
        draw.text((100, footer_y), "#IndiaGrowthStory",
                 font=self.fonts['small'], fill=self.colors['primary_blue'])
        draw.text((width - 100, footer_y), "Data-Driven Insights",
                 font=self.fonts['small'], fill=self.colors['text_secondary'], anchor='ra')
        
        # Save
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{self.output_dir}/data_story_{timestamp}.png"
        img.save(filename, quality=95, optimize=True)
        
        return filename
    
    def create_market_pulse_visual(self, data):
        """Create a clean market update visual"""
        
        width, height = 1080, 1080
        img = Image.new('RGB', (width, height), color=self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Header with date
        header_y = 40
        date_str = datetime.now().strftime("%A, %d %B %Y")
        draw.text((540, header_y), date_str,
                 font=self.fonts['small'], fill=self.colors['text_secondary'], anchor='mt')
        
        # Main headline
        headline_y = 100
        headline = data.get('headline', 'Markets Close Mixed Amid Global Cues')
        draw.text((540, headline_y), headline,
                 font=self.fonts['title'], fill=self.colors['text_primary'], anchor='mt')
        
        # Market indicators grid - clean and minimal
        grid_y = 200
        
        indicators = [
            {"name": "NIFTY 50", "value": data.get('nifty', '24,712'), 
             "change": "-0.75%", "positive": False},
            {"name": "SENSEX", "value": data.get('sensex', '80,787'), 
             "change": "-0.73%", "positive": False},
            {"name": "BANK NIFTY", "value": data.get('banknifty', '51,234'),
             "change": "+0.45%", "positive": True},
            {"name": "NIFTY IT", "value": data.get('niftyit', '38,456'),
             "change": "+1.2%", "positive": True}
        ]
        
        for i, ind in enumerate(indicators):
            x = 290 if i % 2 == 0 else 790
            y = grid_y + (i // 2) * 140
            
            # Clean card design
            card_color = self.colors['light_gray'] if not ind['positive'] else self.colors['light_blue']
            draw.rounded_rectangle([(x - 200, y), (x + 200, y + 100)],
                                  radius=15, fill=card_color)
            
            # Indicator name
            draw.text((x, y + 20), ind['name'],
                     font=self.fonts['small'], fill=self.colors['text_secondary'], anchor='mt')
            
            # Value
            draw.text((x, y + 50), ind['value'],
                     font=self.fonts['heading'], fill=self.colors['text_primary'], anchor='mt')
            
            # Change
            change_color = self.colors['success_green'] if ind['positive'] else self.colors['danger_red']
            draw.text((x + 150, y + 50), ind['change'],
                     font=self.fonts['body'], fill=change_color, anchor='rt')
        
        # Market insight
        insight_y = 520
        draw.text((540, insight_y), "MARKET INSIGHT",
                 font=self.fonts['small'], fill=self.colors['text_secondary'], anchor='mt')
        
        insight_text = data.get('insight',
            "IT stocks lead gains on weak rupee and strong US earnings. "
            "Banking stocks consolidate after recent rally.")
        
        insight_lines = textwrap.wrap(insight_text, width=50)
        text_y = insight_y + 40
        for line in insight_lines:
            draw.text((100, text_y), line,
                     font=self.fonts['body'], fill=self.colors['text_primary'])
            text_y += 38
        
        # FII/DII data - important for Indian markets
        flow_y = 680
        draw.rectangle([(100, flow_y), (width - 100, flow_y + 2)], 
                      fill=self.colors['light_gray'])
        
        flow_y += 30
        
        # FII Flow
        fii_flow = data.get('fii', '₹-892 Cr')
        fii_positive = '+' in fii_flow
        
        draw.text((200, flow_y), "FII",
                 font=self.fonts['body'], fill=self.colors['text_secondary'])
        draw.text((400, flow_y), fii_flow,
                 font=self.fonts['heading'], 
                 fill=self.colors['success_green'] if fii_positive else self.colors['danger_red'],
                 anchor='ra')
        
        # DII Flow  
        dii_flow = data.get('dii', '₹+3,456 Cr')
        dii_positive = '+' in dii_flow
        
        draw.text((600, flow_y), "DII",
                 font=self.fonts['body'], fill=self.colors['text_secondary'])
        draw.text((800, flow_y), dii_flow,
                 font=self.fonts['heading'],
                 fill=self.colors['success_green'] if dii_positive else self.colors['danger_red'],
                 anchor='ra')
        
        # Bottom message - conversational like Dezerv
        message_y = 820
        message = data.get('message', 
            "Domestic institutions continue to support markets. Time to accumulate quality stocks?")
        
        draw.rounded_rectangle([(80, message_y), (width - 80, message_y + 70)],
                              radius=20, fill=self.colors['light_gray'])
        
        message_lines = textwrap.wrap(message, width=45)
        text_y = message_y + 20
        for line in message_lines:
            draw.text((540, text_y), line,
                     font=self.fonts['body'], fill=self.colors['text_primary'], anchor='mt')
            text_y += 35
        
        # Minimal footer
        footer_y = 960
        draw.text((100, footer_y), "Follow for daily updates",
                 font=self.fonts['tiny'], fill=self.colors['text_secondary'])
        draw.text((width - 100, footer_y), "@aifinanceagency",
                 font=self.fonts['tiny'], fill=self.colors['primary_blue'], anchor='ra')
        
        # Save
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{self.output_dir}/market_pulse_{timestamp}.png"
        img.save(filename, quality=95, optimize=True)
        
        return filename

def test_dezerv_style():
    """Test Dezerv-style visuals"""
    creator = DezervStyleVisualCreator()
    
    print("🎨 Creating Dezerv-Style Visuals")
    print("=" * 60)
    
    # Narrative visual
    narrative_data = {
        'hero_text': '₹30 Trillion',
        'headline': 'India\'s Economic Transformation by 2047',
        'narrative': (
            'From a $4 trillion economy today to $30 trillion in 25 years. '
            'This isn\'t just growth - it\'s the greatest wealth creation opportunity of our generation.'
        ),
        'insights': [
            '📈 7-8% sustained GDP growth',
            '🏭 Manufacturing at 25% of GDP',
            '💡 Global innovation hub',
            '👥 500 million entering workforce'
        ],
        'question': 'Are you ready for India\'s century?'
    }
    
    visual1 = creator.create_narrative_visual(narrative_data)
    print(f"✅ Narrative Visual: {visual1}")
    
    # Data story visual
    data_story = {
        'hook': 'The India Growth Story in Numbers',
        'current_value': '₹4 Trillion',
        'current_details': ['5th largest economy', '$2,500 per capita'],
        'future_value': '₹30 Trillion', 
        'future_details': ['3rd largest economy', '$15,000 per capita'],
        'drivers': [
            'Digital India creating $1 trillion economy',
            'Manufacturing exports tripling',
            'Services powerhouse expanding globally',
            'Green energy revolution underway'
        ],
        'thesis': 'Early investors in India\'s transformation could see life-changing returns'
    }
    
    visual2 = creator.create_data_story_visual(data_story)
    print(f"✅ Data Story Visual: {visual2}")
    
    # Market pulse visual
    market_data = {
        'headline': 'Markets Consolidate After Record Highs',
        'nifty': '24,712',
        'sensex': '80,787',
        'banknifty': '51,234',
        'niftyit': '38,456',
        'fii': '₹-892 Cr',
        'dii': '₹+3,456 Cr',
        'insight': (
            'Profit booking in largecaps while midcaps show resilience. '
            'IT stocks outperform on weak rupee and strong guidance.'
        ),
        'message': 'Quality stocks at reasonable valuations. Perfect time to build long-term portfolio?'
    }
    
    visual3 = creator.create_market_pulse_visual(market_data)
    print(f"✅ Market Pulse Visual: {visual3}")
    
    print("\n" + "=" * 60)
    print("🎉 Dezerv-style visuals created successfully!")
    return [visual1, visual2, visual3]

if __name__ == "__main__":
    visuals = test_dezerv_style()
    print(f"Created {len(visuals)} Dezerv-style visuals")
#!/usr/bin/env python3
"""
Minimalist Visual Creator - Dezerv Style
Ultra-clean, professional visuals with maximum impact
"""

from PIL import Image, ImageDraw, ImageFont
import os
from datetime import datetime

class MinimalistVisualCreator:
    def __init__(self):
        """Initialize with Dezerv-inspired minimalist design system"""
        
        # Exact Dezerv color palette (muted, professional)
        self.colors = {
            'background': '#FFFFFF',          # Pure white
            'primary_text': '#1A1A1A',        # Almost black
            'secondary_text': '#6B7280',      # Medium gray
            'accent_blue': '#0A66C2',         # LinkedIn blue (subtle)
            'light_gray': '#F3F4F6',          # Very light gray for accents
            'border_gray': '#E5E7EB',         # Subtle borders
            'positive': '#059669',            # Muted green
            'negative': '#DC2626',            # Muted red
        }
        
        # Typography - clean and minimal
        self.fonts = {
            'hero': 80,        # Large hero numbers
            'title': 32,       # Main titles
            'subtitle': 24,    # Subtitles
            'body': 20,        # Body text
            'caption': 16,     # Small text
            'micro': 14        # Tiny text
        }
        
        # Standard LinkedIn size
        self.width = 1080
        self.height = 1080
        
        # Layout proportions (golden ratio inspired)
        self.margin = 100  # Generous margins
        self.content_width = self.width - (2 * self.margin)
        
    def _get_font(self, size):
        """Get clean sans-serif font"""
        try:
            # Try system fonts first
            return ImageFont.truetype("Helvetica.ttc", size)
        except:
            try:
                return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
            except:
                # Fallback to default
                return ImageFont.load_default()
    
    def create_hero_number_visual(self, data):
        """Create ultra-minimalist hero number visual like Dezerv"""
        
        # Create pure white canvas
        img = Image.new('RGB', (self.width, self.height), self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Hero number (e.g., "₹30 Trillion")
        hero_text = data.get('hero_number', '₹30 Trillion')
        hero_font = self._get_font(self.fonts['hero'])
        
        # Subtitle text
        subtitle = data.get('subtitle', "India's Economic Transformation by 2047")
        subtitle_font = self._get_font(self.fonts['subtitle'])
        
        # Supporting text
        support_text = data.get('support_text', 
            "From a $4 trillion economy today to $30 trillion in 25 years. "
            "This isn't just growth - it's the greatest wealth creation opportunity of our generation.")
        body_font = self._get_font(self.fonts['body'])
        
        # Question at bottom
        question = data.get('question', "Are you ready for India's century?")
        question_font = self._get_font(self.fonts['body'])
        
        # LAYOUT - Generous white space is key
        
        # 1. Hero number - top center with lots of space
        hero_y = 280
        hero_bbox = draw.textbbox((0, 0), hero_text, font=hero_font)
        hero_x = (self.width - (hero_bbox[2] - hero_bbox[0])) // 2
        draw.text((hero_x, hero_y), hero_text, 
                 fill=self.colors['accent_blue'], font=hero_font)
        
        # 2. Subtitle - below hero with space
        subtitle_y = hero_y + 100
        subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
        subtitle_x = (self.width - (subtitle_bbox[2] - subtitle_bbox[0])) // 2
        draw.text((subtitle_x, subtitle_y), subtitle,
                 fill=self.colors['primary_text'], font=subtitle_font)
        
        # 3. Supporting text - wrapped and centered
        support_y = subtitle_y + 100
        words = support_text.split()
        lines = []
        current_line = []
        
        for word in words:
            current_line.append(word)
            test_line = ' '.join(current_line)
            bbox = draw.textbbox((0, 0), test_line, font=body_font)
            if bbox[2] - bbox[0] > self.content_width:
                current_line.pop()
                lines.append(' '.join(current_line))
                current_line = [word]
        lines.append(' '.join(current_line))
        
        # Draw wrapped text
        for i, line in enumerate(lines[:3]):  # Max 3 lines
            line_bbox = draw.textbbox((0, 0), line, font=body_font)
            x = (self.width - (line_bbox[2] - line_bbox[0])) // 2
            draw.text((x, support_y + i * 35), line,
                     fill=self.colors['secondary_text'], font=body_font)
        
        # 4. Very subtle divider line
        divider_y = support_y + 150
        draw.line([(self.margin * 3, divider_y), 
                  (self.width - self.margin * 3, divider_y)],
                 fill=self.colors['border_gray'], width=1)
        
        # 5. Question at bottom - engaging
        question_y = divider_y + 60
        question_bbox = draw.textbbox((0, 0), question, font=question_font)
        question_x = (self.width - (question_bbox[2] - question_bbox[0])) // 2
        draw.text((question_x, question_y), question,
                 fill=self.colors['primary_text'], font=question_font)
        
        # 6. Tiny branding at bottom
        brand_font = self._get_font(self.fonts['micro'])
        brand_text = "AI Finance Agency"
        brand_y = self.height - 40
        brand_bbox = draw.textbbox((0, 0), brand_text, font=brand_font)
        brand_x = (self.width - (brand_bbox[2] - brand_bbox[0])) // 2
        draw.text((brand_x, brand_y), brand_text,
                 fill=self.colors['border_gray'], font=brand_font)
        
        # Save
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"posts/visuals/minimalist_{timestamp}.png"
        os.makedirs("posts/visuals", exist_ok=True)
        img.save(filename, quality=95)
        
        return filename
    
    def create_data_comparison_visual(self, data):
        """Create clean data comparison visual"""
        
        img = Image.new('RGB', (self.width, self.height), self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Title
        title = data.get('title', 'The India Growth Story in Numbers')
        title_font = self._get_font(self.fonts['title'])
        
        # Draw title at top
        title_y = 120
        title_bbox = draw.textbbox((0, 0), title, font=title_font)
        title_x = (self.width - (title_bbox[2] - title_bbox[0])) // 2
        draw.text((title_x, title_y), title,
                 fill=self.colors['primary_text'], font=title_font)
        
        # Two key metrics side by side
        metric1 = data.get('metric1', {'label': 'TODAY', 'value': '₹4 Trillion', 'desc': '5th largest economy'})
        metric2 = data.get('metric2', {'label': '2047', 'value': '₹30 Trillion', 'desc': '3rd largest economy'})
        
        # Metric fonts
        label_font = self._get_font(self.fonts['caption'])
        value_font = self._get_font(50)
        desc_font = self._get_font(self.fonts['caption'])
        
        # Draw metrics with generous spacing
        metric_y = 350
        
        # Metric 1 (left side)
        m1_x = self.width // 4
        
        # Draw subtle background box
        draw.rectangle([m1_x - 100, metric_y - 20, m1_x + 100, metric_y + 150],
                      fill=self.colors['light_gray'], outline=None)
        
        # Label
        label1_bbox = draw.textbbox((0, 0), metric1['label'], font=label_font)
        draw.text((m1_x - (label1_bbox[2] - label1_bbox[0])//2, metric_y),
                 metric1['label'], fill=self.colors['secondary_text'], font=label_font)
        
        # Value
        value1_bbox = draw.textbbox((0, 0), metric1['value'], font=value_font)
        draw.text((m1_x - (value1_bbox[2] - value1_bbox[0])//2, metric_y + 40),
                 metric1['value'], fill=self.colors['primary_text'], font=value_font)
        
        # Description
        desc1_bbox = draw.textbbox((0, 0), metric1['desc'], font=desc_font)
        draw.text((m1_x - (desc1_bbox[2] - desc1_bbox[0])//2, metric_y + 100),
                 metric1['desc'], fill=self.colors['secondary_text'], font=desc_font)
        
        # Arrow between metrics
        arrow_x = self.width // 2
        arrow_font = self._get_font(30)
        draw.text((arrow_x - 15, metric_y + 50), "→",
                 fill=self.colors['accent_blue'], font=arrow_font)
        
        # Metric 2 (right side)
        m2_x = 3 * self.width // 4
        
        # Draw subtle background box
        draw.rectangle([m2_x - 100, metric_y - 20, m2_x + 100, metric_y + 150],
                      fill=self.colors['light_gray'], outline=None)
        
        # Label
        label2_bbox = draw.textbbox((0, 0), metric2['label'], font=label_font)
        draw.text((m2_x - (label2_bbox[2] - label2_bbox[0])//2, metric_y),
                 metric2['label'], fill=self.colors['secondary_text'], font=label_font)
        
        # Value
        value2_bbox = draw.textbbox((0, 0), metric2['value'], font=value_font)
        draw.text((m2_x - (value2_bbox[2] - value2_bbox[0])//2, metric_y + 40),
                 metric2['value'], fill=self.colors['accent_blue'], font=value_font)
        
        # Description
        desc2_bbox = draw.textbbox((0, 0), metric2['desc'], font=desc_font)
        draw.text((m2_x - (desc2_bbox[2] - desc2_bbox[0])//2, metric_y + 100),
                 metric2['desc'], fill=self.colors['secondary_text'], font=desc_font)
        
        # Key insights at bottom
        insights = data.get('insights', [
            '• Digital India creating $1 trillion economy',
            '• Manufacturing exports globally',
            '• Green energy powering growth'
        ])
        
        insight_font = self._get_font(self.fonts['body'])
        insight_y = 600
        
        for insight in insights[:3]:
            draw.text((self.margin, insight_y), insight,
                     fill=self.colors['secondary_text'], font=insight_font)
            insight_y += 35
        
        # Bottom tagline
        tagline = data.get('tagline', "Early investors in India's growth story will be tomorrow's wealth creators")
        tagline_font = self._get_font(self.fonts['caption'])
        tagline_y = 800
        
        # Wrap tagline
        words = tagline.split()
        lines = []
        current_line = []
        
        for word in words:
            current_line.append(word)
            test_line = ' '.join(current_line)
            bbox = draw.textbbox((0, 0), test_line, font=tagline_font)
            if bbox[2] - bbox[0] > self.content_width:
                current_line.pop()
                lines.append(' '.join(current_line))
                current_line = [word]
        lines.append(' '.join(current_line))
        
        for line in lines[:2]:
            line_bbox = draw.textbbox((0, 0), line, font=tagline_font)
            x = (self.width - (line_bbox[2] - line_bbox[0])) // 2
            draw.text((x, tagline_y), line,
                     fill=self.colors['primary_text'], font=tagline_font)
            tagline_y += 25
        
        # Minimal branding
        brand_font = self._get_font(self.fonts['micro'])
        draw.text((self.margin, self.height - 40), "#IndiaGrowthStory",
                 fill=self.colors['border_gray'], font=brand_font)
        
        # Save
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"posts/visuals/data_comparison_{timestamp}.png"
        os.makedirs("posts/visuals", exist_ok=True)
        img.save(filename, quality=95)
        
        return filename
    
    def create_market_pulse_visual(self, data):
        """Create ultra-clean market update visual"""
        
        img = Image.new('RGB', (self.width, self.height), self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Main headline
        headline = data.get('headline', 'Markets Today')
        headline_font = self._get_font(self.fonts['title'])
        
        # Subtitle
        date_text = datetime.now().strftime('%B %d, %Y')
        date_font = self._get_font(self.fonts['caption'])
        
        # Draw header
        headline_y = 100
        headline_bbox = draw.textbbox((0, 0), headline, font=headline_font)
        headline_x = (self.width - (headline_bbox[2] - headline_bbox[0])) // 2
        draw.text((headline_x, headline_y), headline,
                 fill=self.colors['primary_text'], font=headline_font)
        
        date_y = headline_y + 50
        date_bbox = draw.textbbox((0, 0), date_text, font=date_font)
        date_x = (self.width - (date_bbox[2] - date_bbox[0])) // 2
        draw.text((date_x, date_y), date_text,
                 fill=self.colors['secondary_text'], font=date_font)
        
        # Key market metrics - ultra minimal
        metrics = data.get('metrics', [
            {'name': 'NIFTY 50', 'value': '24,712', 'change': '-0.75%', 'negative': True},
            {'name': 'SENSEX', 'value': '80,787', 'change': '-0.73%', 'negative': True},
            {'name': 'BANK NIFTY', 'value': '51,234', 'change': '+0.45%', 'negative': False},
        ])
        
        metric_font = self._get_font(self.fonts['body'])
        value_font = self._get_font(30)
        
        metric_y = 280
        
        for metric in metrics[:3]:
            # Name on left
            draw.text((self.margin * 2, metric_y), metric['name'],
                     fill=self.colors['secondary_text'], font=metric_font)
            
            # Value in center
            value_text = metric['value']
            value_bbox = draw.textbbox((0, 0), value_text, font=value_font)
            value_x = (self.width // 2) - (value_bbox[2] - value_bbox[0]) // 2
            draw.text((value_x, metric_y - 5), value_text,
                     fill=self.colors['primary_text'], font=value_font)
            
            # Change on right
            change_color = self.colors['negative'] if metric.get('negative') else self.colors['positive']
            change_x = self.width - self.margin * 2 - 100
            draw.text((change_x, metric_y), metric['change'],
                     fill=change_color, font=metric_font)
            
            metric_y += 60
        
        # Thin divider
        draw.line([(self.margin * 2, metric_y), 
                  (self.width - self.margin * 2, metric_y)],
                 fill=self.colors['border_gray'], width=1)
        
        # Key insight
        insight_y = metric_y + 60
        insight = data.get('insight', 'FIIs sold ₹892 Cr while DIIs bought ₹3,456 Cr')
        insight_font = self._get_font(self.fonts['subtitle'])
        
        # Center the insight
        insight_bbox = draw.textbbox((0, 0), insight, font=insight_font)
        insight_x = (self.width - (insight_bbox[2] - insight_bbox[0])) // 2
        draw.text((insight_x, insight_y), insight,
                 fill=self.colors['primary_text'], font=insight_font)
        
        # Market sentiment
        sentiment_y = insight_y + 80
        sentiment = data.get('sentiment', 'Range-bound with positive bias')
        sentiment_font = self._get_font(self.fonts['body'])
        
        sentiment_bbox = draw.textbbox((0, 0), sentiment, font=sentiment_font)
        sentiment_x = (self.width - (sentiment_bbox[2] - sentiment_bbox[0])) // 2
        draw.text((sentiment_x, sentiment_y), sentiment,
                 fill=self.colors['secondary_text'], font=sentiment_font)
        
        # Call to action
        cta_y = self.height - 150
        cta = data.get('cta', 'What sectors are you watching today?')
        cta_font = self._get_font(self.fonts['body'])
        
        cta_bbox = draw.textbbox((0, 0), cta, font=cta_font)
        cta_x = (self.width - (cta_bbox[2] - cta_bbox[0])) // 2
        draw.text((cta_x, cta_y), cta,
                 fill=self.colors['primary_text'], font=cta_font)
        
        # Minimal branding
        brand_font = self._get_font(self.fonts['micro'])
        draw.text((self.margin, self.height - 40), "Analysis • August 2025",
                 fill=self.colors['border_gray'], font=brand_font)
        
        # Save
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"posts/visuals/market_pulse_{timestamp}.png"
        os.makedirs("posts/visuals", exist_ok=True)
        img.save(filename, quality=95)
        
        return filename


def test_minimalist_visuals():
    """Test the minimalist visual creator"""
    
    print("\n🎨 Testing Minimalist Visual Creator (Dezerv Style)")
    print("=" * 60)
    
    creator = MinimalistVisualCreator()
    
    # Test 1: Hero number visual
    print("\n1. Creating Hero Number Visual...")
    data1 = {
        'hero_number': '₹30 Trillion',
        'subtitle': "India's Economic Transformation by 2047",
        'support_text': ("From ₹4 trillion today to ₹30 trillion in 25 years. "
                        "This isn't just growth - it's wealth creation at scale."),
        'question': 'Are you positioned for this opportunity?'
    }
    file1 = creator.create_hero_number_visual(data1)
    print(f"   ✅ Saved to: {file1}")
    
    # Test 2: Data comparison visual
    print("\n2. Creating Data Comparison Visual...")
    data2 = {
        'title': 'The India Growth Story',
        'metric1': {'label': 'TODAY', 'value': '₹4 Trillion', 'desc': '5th largest economy'},
        'metric2': {'label': '2047', 'value': '₹30 Trillion', 'desc': '3rd largest economy'},
        'insights': [
            '• Digital economy: ₹1 trillion opportunity',
            '• Services powerhouse expanding globally',
            '• Green energy revolution underway'
        ],
        'tagline': "Early investors in India's growth story will create generational wealth"
    }
    file2 = creator.create_data_comparison_visual(data2)
    print(f"   ✅ Saved to: {file2}")
    
    # Test 3: Market pulse visual
    print("\n3. Creating Market Pulse Visual...")
    
    # Get real market data
    from get_indian_market_data import get_real_indian_market_data, format_market_update
    real_data = get_real_indian_market_data()
    formatted = format_market_update(real_data)
    
    data3 = {
        'headline': 'Market Pulse',
        'metrics': [
            {'name': 'NIFTY 50', 'value': formatted['nifty'], 
             'change': formatted['nifty_change'], 
             'negative': '-' in formatted['nifty_change']},
            {'name': 'TOP SECTOR', 'value': formatted['top_sector'].split('(')[0].strip(), 
             'change': formatted['top_sector'].split('(')[1].replace(')', ''), 
             'negative': '-' in formatted['top_sector']},
            {'name': 'FII/DII', 'value': formatted['fii'], 
             'change': formatted['dii'], 'negative': False},
        ],
        'insight': f"Market sentiment: {formatted['market_sentiment']}",
        'sentiment': 'DIIs continue to support markets',
        'cta': 'Which sectors offer value at current levels?'
    }
    file3 = creator.create_market_pulse_visual(data3)
    print(f"   ✅ Saved to: {file3}")
    
    print("\n✨ All minimalist visuals created successfully!")
    print("These match Dezerv's ultra-clean, professional style")
    print("=" * 60)
    
    return [file1, file2, file3]


if __name__ == "__main__":
    test_minimalist_visuals()
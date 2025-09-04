#!/usr/bin/env python3
"""
Superior Visual System for Financial Content
Single, optimized visual generation system based on data-driven best practices
"""

from PIL import Image, ImageDraw, ImageFont
import os
from typing import Dict, Tuple, Optional
import re
from datetime import datetime

class SuperiorVisualGenerator:
    def __init__(self):
        # Optimal dimensions for multi-platform sharing
        self.width = 1200
        self.height = 675  # 16:9 ratio, perfect for LinkedIn and Twitter
        
        # Research-backed color system
        self.colors = {
            # Primary colors with specific purposes
            'background': '#FFFFFF',  # Pure white for maximum contrast
            'primary_text': '#0A0A0A',  # Near-black for 15:1 contrast ratio
            'secondary_text': '#4A4A4A',  # Gray for supporting text (7:1 ratio)
            
            # Semantic colors for financial data
            'positive': '#00A67E',  # Green for gains (not too bright)
            'negative': '#E63946',  # Red for losses (high visibility)
            'neutral': '#2563EB',  # Professional blue
            'warning': '#F59E0B',  # Amber for caution
            
            # Accent colors
            'accent_light': '#F3F4F6',  # Very light gray for subtle backgrounds
            'accent_border': '#E5E7EB',  # Border color
            'highlight': '#FEF3C7',  # Soft yellow for highlighting
        }
        
        # Typography system based on readability research
        self.fonts = {
            'hero': 72,  # For main number (3-4x larger than body)
            'title': 32,  # For section headers
            'subtitle': 24,  # For supporting numbers
            'body': 18,  # For regular text (minimum for mobile)
            'caption': 14,  # For disclaimers
        }
        
        # Layout zones for optimal visual flow (Z-pattern)
        self.zones = {
            'header': (0, 0, self.width, 120),  # Top brand zone
            'hero': (50, 120, self.width-50, 400),  # Main content area
            'support': (50, 400, self.width-50, 550),  # Supporting data
            'footer': (0, 550, self.width, self.height),  # CTA/Question zone
        }
        
        # Content patterns that work
        self.visual_patterns = {
            'single_metric': self._create_single_metric_visual,
            'comparison': self._create_comparison_visual,
            'trend': self._create_trend_visual,
            'alert': self._create_alert_visual,
            'insight': self._create_insight_visual
        }
    
    def generate_visual(self, content_data: Dict) -> str:
        """
        Generate a superior visual based on content type and data
        """
        # Analyze content to determine best visual pattern
        pattern = self._determine_pattern(content_data)
        
        # Create the visual using the appropriate pattern
        image = self.visual_patterns[pattern](content_data)
        
        # Save with optimization
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"posts/visuals/superior_{timestamp}.png"
        
        os.makedirs('posts/visuals', exist_ok=True)
        image.save(filename, 'PNG', optimize=True, quality=95)
        
        return filename
    
    def _determine_pattern(self, content_data: Dict) -> str:
        """Intelligently determine which visual pattern to use"""
        
        content = content_data.get('content', '').lower()
        title = content_data.get('title', '').lower()
        content_type = content_data.get('content_type', '')
        
        # Pattern detection based on content analysis
        if 'breakout' in title or 'alert' in title:
            return 'alert'
        elif 'vs' in title or 'comparison' in content or 'fii' in content and 'dii' in content:
            return 'comparison'
        elif 'trend' in content or 'momentum' in content:
            return 'trend'
        elif any(word in title for word in ['why', 'how', 'what', 'insight']):
            return 'insight'
        else:
            return 'single_metric'
    
    def _create_single_metric_visual(self, content_data: Dict) -> Image:
        """Create a visual focused on one key metric"""
        
        img = Image.new('RGB', (self.width, self.height), self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Extract key metric from content
        numbers = re.findall(r'₹?[\d,]+\.?\d*%?', content_data.get('content', ''))
        key_metric = numbers[0] if numbers else '24,712'
        
        # Header zone - subtle branding
        self._draw_header(draw, "MARKET INSIGHT")
        
        # Hero zone - the main metric (huge and bold)
        hero_font = self._get_font(self.fonts['hero'])
        metric_text = key_metric
        
        # Center the hero metric
        bbox = draw.textbbox((0, 0), metric_text, font=hero_font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (self.width - text_width) // 2
        y = 200
        
        # Determine color based on sentiment
        metric_color = self._get_sentiment_color(content_data)
        draw.text((x, y), metric_text, fill=metric_color, font=hero_font)
        
        # Context line (essential for understanding)
        context_font = self._get_font(self.fonts['subtitle'])
        context = self._extract_context(content_data.get('title', ''))
        
        bbox = draw.textbbox((0, 0), context, font=context_font)
        context_width = bbox[2] - bbox[0]
        x_context = (self.width - context_width) // 2
        draw.text((x_context, y + text_height + 20), context, 
                 fill=self.colors['secondary_text'], font=context_font)
        
        # Supporting data points (3 maximum)
        self._draw_supporting_data(draw, content_data, y_start=400)
        
        # Footer - Call to action or question
        self._draw_footer(draw, content_data)
        
        return img
    
    def _create_comparison_visual(self, content_data: Dict) -> Image:
        """Create a visual comparing two metrics"""
        
        img = Image.new('RGB', (self.width, self.height), self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Header
        self._draw_header(draw, "MARKET FLOW")
        
        # Extract comparison data
        numbers = re.findall(r'₹?([\d,]+(?:\.\d+)?)\s*(?:Cr|cr)', content_data.get('content', ''))
        
        if len(numbers) >= 2:
            left_value = f"₹{numbers[0]} Cr"
            right_value = f"₹{numbers[1]} Cr"
        else:
            left_value = "₹2,340 Cr"
            right_value = "₹2,890 Cr"
        
        # Split screen comparison
        mid_x = self.width // 2
        
        # Left side (usually negative/FII)
        self._draw_metric_block(draw, 50, 180, mid_x - 75, 380,
                               left_value, "FII SELLING", self.colors['negative'])
        
        # VS divider
        vs_font = self._get_font(self.fonts['title'])
        draw.text((mid_x - 20, 250), "VS", fill=self.colors['secondary_text'], font=vs_font)
        
        # Right side (usually positive/DII)
        self._draw_metric_block(draw, mid_x + 25, 180, self.width - 50, 380,
                               right_value, "DII BUYING", self.colors['positive'])
        
        # Net impact
        net_font = self._get_font(self.fonts['subtitle'])
        net_text = "Market Absorbs Selling Pressure"
        bbox = draw.textbbox((0, 0), net_text, font=net_font)
        text_width = bbox[2] - bbox[0]
        draw.text(((self.width - text_width) // 2, 420), net_text,
                 fill=self.colors['primary_text'], font=net_font)
        
        # Footer
        self._draw_footer(draw, content_data)
        
        return img
    
    def _create_alert_visual(self, content_data: Dict) -> Image:
        """Create an urgent alert-style visual"""
        
        img = Image.new('RGB', (self.width, self.height), self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Alert header with color coding
        alert_color = self.colors['warning']
        draw.rectangle((0, 0, self.width, 80), fill=alert_color)
        
        alert_font = self._get_font(self.fonts['title'])
        draw.text((50, 25), "⚡ BREAKOUT ALERT", fill=self.colors['background'], font=alert_font)
        
        # Stock name and key level
        title_parts = content_data.get('title', '').split()
        stock = next((word for word in title_parts if word.isupper()), 'RELIANCE')
        
        stock_font = self._get_font(48)
        draw.text((50, 120), stock, fill=self.colors['primary_text'], font=stock_font)
        
        # Breakout level
        numbers = re.findall(r'[\d,]+(?:\.\d+)?', content_data.get('content', ''))
        breakout_level = numbers[0] if numbers else '2,450'
        
        level_font = self._get_font(self.fonts['hero'])
        draw.text((50, 180), f"₹{breakout_level}", fill=self.colors['positive'], font=level_font)
        
        # Key levels
        levels_font = self._get_font(self.fonts['body'])
        y_offset = 300
        
        levels = [
            f"Target 1: ₹{numbers[1] if len(numbers) > 1 else '2,500'}",
            f"Target 2: ₹{numbers[2] if len(numbers) > 2 else '2,550'}",
            f"Stop Loss: ₹{numbers[3] if len(numbers) > 3 else '2,400'}"
        ]
        
        for level in levels:
            color = self.colors['positive'] if 'Target' in level else self.colors['negative']
            draw.text((50, y_offset), level, fill=color, font=levels_font)
            y_offset += 40
        
        # Volume confirmation
        volume_text = "Volume: +150% vs Average"
        draw.text((50, y_offset + 20), volume_text, 
                 fill=self.colors['secondary_text'], font=levels_font)
        
        # Footer with urgency
        self._draw_footer(draw, content_data, urgent=True)
        
        return img
    
    def _create_trend_visual(self, content_data: Dict) -> Image:
        """Create a trend/momentum visual"""
        
        img = Image.new('RGB', (self.width, self.height), self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Header
        self._draw_header(draw, "TREND ANALYSIS")
        
        # Create simple trend bars (without actual charting library)
        self._draw_trend_bars(draw, content_data)
        
        # Footer
        self._draw_footer(draw, content_data)
        
        return img
    
    def _create_insight_visual(self, content_data: Dict) -> Image:
        """Create an insight/educational visual"""
        
        img = Image.new('RGB', (self.width, self.height), self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Header
        self._draw_header(draw, "KEY INSIGHT")
        
        # Extract the main insight
        title = content_data.get('title', 'Market Insight')
        
        # Title as a question or statement
        title_font = self._get_font(36)
        
        # Word wrap for long titles
        words = title.split()
        lines = []
        current_line = []
        
        for word in words:
            current_line.append(word)
            test_line = ' '.join(current_line)
            bbox = draw.textbbox((0, 0), test_line, font=title_font)
            if bbox[2] - bbox[0] > self.width - 100:
                current_line.pop()
                lines.append(' '.join(current_line))
                current_line = [word]
        lines.append(' '.join(current_line))
        
        y = 150
        for line in lines:
            draw.text((50, y), line, fill=self.colors['primary_text'], font=title_font)
            y += 50
        
        # Key points
        content_lines = content_data.get('content', '').split('\n')
        important_lines = [line for line in content_lines if line.strip() and 
                          any(char in line for char in ['•', '1.', '2.', '3.', ':'])][:3]
        
        point_font = self._get_font(self.fonts['subtitle'])
        y = 350
        
        for line in important_lines:
            # Clean up the line
            clean_line = re.sub(r'^[•\d.]\s*', '→ ', line.strip())[:80]
            draw.text((50, y), clean_line, fill=self.colors['secondary_text'], font=point_font)
            y += 40
        
        # Footer
        self._draw_footer(draw, content_data)
        
        return img
    
    def _draw_header(self, draw: ImageDraw, text: str):
        """Draw consistent header branding"""
        header_font = self._get_font(14)
        draw.text((50, 30), text, fill=self.colors['secondary_text'], font=header_font)
        
        # Subtle line separator
        draw.line((50, 70, self.width - 50, 70), fill=self.colors['accent_border'], width=1)
    
    def _draw_footer(self, draw: ImageDraw, content_data: Dict, urgent: bool = False):
        """Draw engaging footer with CTA"""
        footer_font = self._get_font(self.fonts['subtitle'])
        
        # Extract or generate engaging question
        questions = [
            "Ready to take action?",
            "What's your move?",
            "Are you positioned?",
            "Missing this opportunity?",
            "Time to act?"
        ]
        
        question = content_data.get('question', questions[0])
        
        if urgent:
            # Urgent footer with background
            draw.rectangle((0, self.height - 100, self.width, self.height), 
                          fill=self.colors['accent_light'])
            question = "⚡ " + question
        
        # Center the question
        bbox = draw.textbbox((0, 0), question, font=footer_font)
        text_width = bbox[2] - bbox[0]
        x = (self.width - text_width) // 2
        y = self.height - 70
        
        draw.text((x, y), question, fill=self.colors['primary_text'], font=footer_font)
        
        # Add subtle branding
        brand_font = self._get_font(12)
        brand_text = "AI Finance Agency"
        draw.text((self.width - 150, self.height - 25), brand_text,
                 fill=self.colors['secondary_text'], font=brand_font)
    
    def _draw_supporting_data(self, draw: ImageDraw, content_data: Dict, y_start: int):
        """Draw up to 3 supporting data points"""
        support_font = self._get_font(self.fonts['body'])
        
        # Extract supporting data
        content = content_data.get('content', '')
        lines = content.split('\n')
        
        data_points = []
        for line in lines:
            if any(indicator in line for indicator in [':', '•', '→', 'Support', 'Resistance', 'Volume']):
                data_points.append(line.strip()[:60])
                if len(data_points) >= 3:
                    break
        
        y = y_start
        for point in data_points:
            draw.text((50, y), point, fill=self.colors['secondary_text'], font=support_font)
            y += 30
    
    def _draw_metric_block(self, draw: ImageDraw, x1: int, y1: int, x2: int, y2: int,
                          value: str, label: str, color: str):
        """Draw a metric block for comparisons"""
        
        # Background
        draw.rectangle((x1, y1, x2, y2), fill=self.colors['accent_light'])
        
        # Value (large)
        value_font = self._get_font(48)
        
        # Center value in block
        bbox = draw.textbbox((0, 0), value, font=value_font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        value_x = x1 + ((x2 - x1 - text_width) // 2)
        value_y = y1 + ((y2 - y1 - text_height) // 2) - 20
        
        draw.text((value_x, value_y), value, fill=color, font=value_font)
        
        # Label (small)
        label_font = self._get_font(self.fonts['body'])
        bbox = draw.textbbox((0, 0), label, font=label_font)
        label_width = bbox[2] - bbox[0]
        
        label_x = x1 + ((x2 - x1 - label_width) // 2)
        label_y = value_y + text_height + 10
        
        draw.text((label_x, label_y), label, fill=self.colors['secondary_text'], font=label_font)
    
    def _draw_trend_bars(self, draw: ImageDraw, content_data: Dict):
        """Draw simple trend visualization"""
        
        # Extract trend data
        content = content_data.get('content', '')
        numbers = re.findall(r'[+-]?\d+\.?\d*%', content)
        
        if not numbers:
            numbers = ['+2.5%', '+1.8%', '-0.5%', '+3.2%', '+1.5%']
        
        # Draw bars
        bar_width = 80
        spacing = 20
        start_x = (self.width - (len(numbers) * (bar_width + spacing))) // 2
        
        max_height = 200
        y_base = 400
        
        for i, num in enumerate(numbers[:7]):  # Max 7 bars
            value = float(num.replace('%', '').replace('+', ''))
            height = abs(value) * 20  # Scale factor
            
            x = start_x + i * (bar_width + spacing)
            
            if value > 0:
                color = self.colors['positive']
                y = y_base - height
            else:
                color = self.colors['negative']
                y = y_base
            
            draw.rectangle((x, y, x + bar_width, y_base), fill=color)
            
            # Value label
            label_font = self._get_font(14)
            draw.text((x + 20, y_base + 10), num, 
                     fill=self.colors['secondary_text'], font=label_font)
    
    def _get_sentiment_color(self, content_data: Dict) -> str:
        """Determine color based on content sentiment"""
        content = (content_data.get('content', '') + content_data.get('title', '')).lower()
        
        positive_words = ['buy', 'bullish', 'breakout', 'gain', 'profit', 'up', 'positive', 'outperform']
        negative_words = ['sell', 'bearish', 'breakdown', 'loss', 'fall', 'down', 'negative', 'underperform']
        
        positive_count = sum(1 for word in positive_words if word in content)
        negative_count = sum(1 for word in negative_words if word in content)
        
        if positive_count > negative_count:
            return self.colors['positive']
        elif negative_count > positive_count:
            return self.colors['negative']
        else:
            return self.colors['neutral']
    
    def _extract_context(self, title: str) -> str:
        """Extract context from title"""
        # Remove numbers and clean up
        context = re.sub(r'[\d,]+\.?\d*', '', title)
        context = re.sub(r'[₹%]', '', context)
        context = ' '.join(context.split())[:50]  # Limit length
        
        return context if context else "Market Update"
    
    def _get_font(self, size: int):
        """Get font with fallback"""
        try:
            # Try to use a better font if available
            font_path = "/System/Library/Fonts/Helvetica.ttc"
            return ImageFont.truetype(font_path, size)
        except:
            # Fallback to default
            return ImageFont.load_default()


# Test the system
if __name__ == "__main__":
    generator = SuperiorVisualGenerator()
    
    test_data = {
        'title': 'FIIs pulled out ₹2,340 Cr while DIIs bought ₹2,890 Cr',
        'content': '''Market Flow Update:
        
        FII Activity: Net selling of ₹2,340 Cr
        DII Activity: Net buying of ₹2,890 Cr
        
        Banking: Heavy accumulation by DIIs
        IT: Profit booking by FIIs
        
        Net Impact: Markets absorbed selling pressure''',
        'content_type': 'market_flow'
    }
    
    visual_path = generator.generate_visual(test_data)
    print(f"Visual generated: {visual_path}")
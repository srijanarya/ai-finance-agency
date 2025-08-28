#!/usr/bin/env python3
"""
Humanized Content Generator
Creates varied, authentic-feeling content that doesn't seem AI-generated
"""

import json
import random
import sqlite3
from datetime import datetime, timedelta
import yfinance as yf
from typing import Dict, List
import re

class HumanizedContentGenerator:
    def __init__(self):
        self.db_path = "data/agency.db"
        
        # Varied opening styles - no more "Deep Dive"
        self.title_styles = {
            "news_reaction": [
                "{company} just {action}. Here's what investors need to know",
                "Breaking: {event} - {impact}",
                "{sector} stocks {movement} after {trigger}",
                "Why {company} {action} (and what it means for you)",
                "{number}% {movement} in {stock} - The real story"
            ],
            
            "conversational": [
                "Okay, we need to talk about {topic}",
                "Something interesting happened in {sector} today",
                "I've been watching {stock} for weeks. Here's why",
                "Not sure if you noticed, but {observation}",
                "Quick thought on {topic} that's been bothering me"
            ],
            
            "question_based": [
                "Is {company} still a buy at these levels?",
                "Should you worry about {event}?",
                "Why is nobody talking about {observation}?",
                "What's really happening with {sector}?",
                "Can {stock} sustain this momentum?"
            ],
            
            "data_focused": [
                "{number} {metric} that explain {topic}",
                "{company}: Numbers don't lie",
                "The {metric} nobody's watching in {sector}",
                "FII vs DII: Today's surprising data",
                "{percentage}% - The number that changed everything"
            ],
            
            "story_telling": [
                "The {company} story nobody's telling",
                "How {event} changed the game for {sector}",
                "Inside {company}'s {timeframe} transformation",
                "From {point_a} to {point_b}: {company}'s journey",
                "What {expert} got wrong about {topic}"
            ],
            
            "opinion_piece": [
                "My take on {topic}",
                "Unpopular opinion: {contrarian_view}",
                "Why I'm {action} {stock} (even though {counter_argument})",
                "The bull case for {sector} everyone's missing",
                "Time to reconsider {commonly_held_belief}?"
            ],
            
            "educational": [
                "Understanding {concept} through {example}",
                "How to spot {pattern} before it's obvious",
                "{concept} explained with {company} example",
                "What {metric} really tells you about {stock}",
                "Decoding {jargon} for retail investors"
            ]
        }
        
        # Human-like content openers
        self.content_openers = [
            "Alright, let's dive in.\n\n",
            "Here's the thing:\n\n",
            "So I was looking at the data today, and...\n\n",
            "Quick update for those tracking:\n\n",
            "Been thinking about this all morning:\n\n",
            "Interesting development today.\n\n",
            "Not going to lie, this surprised me:\n\n",
            "For those who asked about {topic}:\n\n",
            "Some context first:\n\n",
            "Bear with me on this one:\n\n",
            "Let me break this down:\n\n",
            "Straight to the point:\n\n",
            "This needs more attention:\n\n",
            "Can't ignore this anymore:\n\n",
            ""  # Sometimes no opener is more natural
        ]
        
        # Varied content structures
        self.content_patterns = {
            "analytical": self._generate_analytical_content,
            "narrative": self._generate_narrative_content,
            "listicle": self._generate_listicle_content,
            "comparison": self._generate_comparison_content,
            "quick_take": self._generate_quick_take,
            "thread_style": self._generate_thread_style,
            "data_dump": self._generate_data_dump,
            "opinion": self._generate_opinion_content
        }
        
        # Human quirks and personality traits
        self.personality_traits = {
            "cautious_optimist": {
                "phrases": ["could be interesting", "worth watching", "cautiously optimistic", 
                           "let's see how this plays out", "early days but"],
                "emoji_style": "minimal",
                "data_preference": "balanced"
            },
            "data_nerd": {
                "phrases": ["numbers don't lie", "data suggests", "statistically speaking",
                           "if we look at the metrics", "historically"],
                "emoji_style": "charts_only",
                "data_preference": "heavy"
            },
            "straight_talker": {
                "phrases": ["here's the deal", "bottom line", "let's be real",
                           "no sugar coating", "simple as that"],
                "emoji_style": "none",
                "data_preference": "minimal"
            },
            "educator": {
                "phrases": ["think of it this way", "for context", "remember that",
                           "this is important because", "let me explain"],
                "emoji_style": "educational",
                "data_preference": "moderate"
            },
            "contrarian": {
                "phrases": ["everyone's wrong about", "unpopular opinion", "contrary to popular belief",
                           "here's what they're missing", "actually"],
                "emoji_style": "minimal",
                "data_preference": "selective"
            }
        }
        
        # Closing styles
        self.closing_styles = [
            "\n\nThoughts?",
            "\n\nWhat's your take?",
            "\n\nAm I overthinking this?",
            "\n\nLet me know what you think.",
            "\n\nAgree? Disagree?",
            "\n\nWould love to hear your views.",
            "\n\nMake of that what you will.",
            "\n\nTime will tell.",
            "\n\nKeep an eye on this.",
            "\n\n(Not investment advice, obviously)",
            "\n\nDYOR as always.",
            ""  # Sometimes no closing is more natural
        ]
        
        # Hashtag styles
        self.hashtag_patterns = {
            "professional": ["#IndianStockMarket", "#Nifty50", "#StockMarketIndia", "#MarketAnalysis"],
            "casual": ["#stocks", "#trading", "#markets", "#investing"],
            "mixed": ["#IndianMarkets", "#StocksToBuy", "#MarketUpdate", "#TradingView"],
            "minimal": ["#markets", "#india"],
            "none": []
        }
        
    def _add_typos_occasionally(self, text: str) -> str:
        """Add occasional typos to make content more human"""
        if random.random() > 0.95:  # 5% chance
            typos = {
                "the": ["teh", "th"],
                "and": ["adn", "nad"],
                "because": ["becuase", "becasue"],
                "their": ["thier"],
                "definitely": ["definately"],
                "separate": ["seperate"]
            }
            for correct, wrongs in typos.items():
                if correct in text and random.random() > 0.7:
                    text = text.replace(correct, random.choice(wrongs), 1)
        return text
    
    def _add_informal_language(self, text: str) -> str:
        """Make language more conversational"""
        informal_replacements = {
            "approximately": "around",
            "utilize": "use",
            "however": "but",
            "therefore": "so",
            "significant": "big",
            "commence": "start",
            "terminate": "end",
            "purchase": "buy",
            "において": "at"
        }
        
        if random.random() > 0.6:  # 40% chance to informalize
            for formal, informal in informal_replacements.items():
                text = text.replace(formal, informal)
        
        return text
    
    def _generate_analytical_content(self, data: Dict) -> str:
        """Generate analytical style content"""
        content = []
        
        # Start with current situation
        content.append(f"Current situation: {data.get('situation', 'Markets trading mixed')}")
        content.append("")
        
        # Add key metrics
        if data.get('metrics'):
            content.append("Key metrics:")
            for metric in data['metrics'][:3]:
                content.append(f"• {metric}")
            content.append("")
        
        # Analysis
        content.append(data.get('analysis', 'Technical indicators suggest consolidation'))
        content.append("")
        
        # Implications
        content.append("What this means:")
        content.append(data.get('implications', 'Wait for clear direction before taking positions'))
        
        return "\n".join(content)
    
    def _generate_narrative_content(self, data: Dict) -> str:
        """Generate story-style content"""
        content = []
        
        # Set the scene
        content.append(data.get('scene', 'Something interesting happened today.'))
        content.append("")
        
        # Build the story
        content.append(data.get('development', 'The market reacted differently than expected.'))
        content.append("")
        
        # Add data points naturally
        if data.get('data_points'):
            content.append(f"Consider this: {data['data_points'][0]}")
            if len(data['data_points']) > 1:
                content.append(f"And then: {data['data_points'][1]}")
        content.append("")
        
        # Conclusion
        content.append(data.get('conclusion', 'Makes you think, doesn\'t it?'))
        
        return "\n".join(content)
    
    def _generate_listicle_content(self, data: Dict) -> str:
        """Generate list-based content"""
        content = []
        
        # Brief intro
        content.append(data.get('intro', 'Quick observations from today:'))
        content.append("")
        
        # Numbered list
        points = data.get('points', ['Point 1', 'Point 2', 'Point 3'])
        for i, point in enumerate(points[:5], 1):
            content.append(f"{i}. {point}")
        content.append("")
        
        # Wrap up
        if random.random() > 0.5:
            content.append(data.get('summary', 'That\'s all for now.'))
        
        return "\n".join(content)
    
    def _generate_comparison_content(self, data: Dict) -> str:
        """Generate comparison style content"""
        content = []
        
        content.append(f"{data.get('item1', 'Option A')} vs {data.get('item2', 'Option B')}")
        content.append("")
        
        # Comparison points
        content.append(f"Performance: {data.get('comparison1', 'A leads')}")
        content.append(f"Valuation: {data.get('comparison2', 'B cheaper')}")
        content.append(f"Risk: {data.get('comparison3', 'Both moderate')}")
        content.append("")
        
        # Verdict
        content.append(f"Verdict: {data.get('verdict', 'Depends on your risk appetite')}")
        
        return "\n".join(content)
    
    def _generate_quick_take(self, data: Dict) -> str:
        """Generate brief, punchy content"""
        content = []
        
        # One main point
        content.append(data.get('main_point', 'Market moved. Here\'s why:'))
        content.append("")
        
        # Brief explanation
        content.append(data.get('explanation', 'Simple supply-demand dynamics.'))
        
        # Maybe add one data point
        if random.random() > 0.5 and data.get('data'):
            content.append("")
            content.append(f"({data['data']})")
        
        return "\n".join(content)
    
    def _generate_thread_style(self, data: Dict) -> str:
        """Generate thread-style content"""
        content = []
        
        points = data.get('thread_points', ['Point 1', 'Point 2', 'Point 3'])
        
        for i, point in enumerate(points[:4]):
            if i == 0:
                content.append(f"🧵 {point}")
            else:
                content.append(f"\n{i+1}/ {point}")
        
        # End thread
        content.append(f"\n{len(points)+1}/ That's it. That's the thread.")
        
        return "\n".join(content)
    
    def _generate_data_dump(self, data: Dict) -> str:
        """Generate data-heavy content"""
        content = []
        
        content.append("Today's numbers:")
        content.append("")
        
        # Market data
        if data.get('market_data'):
            for key, value in data['market_data'].items():
                content.append(f"{key}: {value}")
        content.append("")
        
        # One line interpretation
        content.append(data.get('interpretation', 'Read into it what you will.'))
        
        return "\n".join(content)
    
    def _generate_opinion_content(self, data: Dict) -> str:
        """Generate opinion-based content"""
        content = []
        
        # State opinion upfront
        content.append(data.get('opinion', 'I think markets are overreacting.'))
        content.append("")
        
        # Support with some reasoning
        content.append(f"Why? {data.get('reasoning', 'Fundamentals haven\'t changed.')}")
        content.append("")
        
        # Acknowledge counter
        if random.random() > 0.5:
            content.append(f"Yes, {data.get('counter', 'sentiment is negative')}. But {data.get('but', 'that creates opportunity')}.")
        
        return "\n".join(content)
    
    def generate_humanized_content(self, content_type: str = None, market_data: Dict = None) -> Dict:
        """Generate complete humanized content"""
        
        # Select random personality for this post
        personality = random.choice(list(self.personality_traits.keys()))
        traits = self.personality_traits[personality]
        
        # Select content pattern
        if not content_type:
            content_type = random.choice(list(self.content_patterns.keys()))
        
        # Generate title (no more Deep Dive!)
        title_category = random.choice(list(self.title_styles.keys()))
        title_template = random.choice(self.title_styles[title_category])
        
        # Fill in title with real data
        title_data = self._get_title_data(market_data)
        title = title_template.format(**title_data)
        
        # Select opener
        opener = random.choice(self.content_openers)
        if "{topic}" in opener:
            opener = opener.format(topic=title_data.get('topic', 'this'))
        
        # Generate main content
        content_data = self._prepare_content_data(market_data, personality)
        main_content = self.content_patterns[content_type](content_data)
        
        # Add personality phrases
        if random.random() > 0.6:
            phrase = random.choice(traits['phrases'])
            main_content = self._inject_phrase(main_content, phrase)
        
        # Make it conversational
        main_content = self._add_informal_language(main_content)
        
        # Occasionally add typos (very rarely)
        main_content = self._add_typos_occasionally(main_content)
        
        # Add closing
        closing = random.choice(self.closing_styles)
        
        # Combine everything
        full_content = opener + main_content + closing
        
        # Select hashtag style
        hashtag_style = random.choice(list(self.hashtag_patterns.keys()))
        hashtags = self.hashtag_patterns[hashtag_style]
        
        # Add emojis based on personality
        if traits['emoji_style'] == 'minimal':
            full_content = self._add_minimal_emojis(full_content)
        elif traits['emoji_style'] == 'charts_only':
            full_content = self._add_chart_emojis(full_content)
        elif traits['emoji_style'] == 'educational':
            full_content = self._add_educational_emojis(full_content)
        
        return {
            'title': title,
            'content': full_content,
            'hashtags': hashtags,
            'personality': personality,
            'content_type': content_type,
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_title_data(self, market_data: Dict = None) -> Dict:
        """Prepare data for title templates"""
        
        # Default data
        data = {
            'company': random.choice(['Reliance', 'TCS', 'Infosys', 'HDFC Bank', 'ITC', 'Wipro']),
            'action': random.choice(['surged 5%', 'broke resistance', 'announced results', 'hit 52-week high']),
            'event': random.choice(['RBI policy', 'Q3 results', 'FII selling', 'Budget announcement']),
            'impact': random.choice(['Markets volatile', '3 sectors to watch', 'Opportunity emerging']),
            'sector': random.choice(['IT', 'Banking', 'Pharma', 'Auto', 'FMCG']),
            'movement': random.choice(['rally', 'correct', 'consolidate', 'breakout']),
            'trigger': random.choice(['earnings beat', 'policy change', 'global cues', 'technical breakout']),
            'number': random.choice(['3', '5', '7', '10']),
            'stock': random.choice(['Nifty', 'Bank Nifty', 'IT index', 'Sensex']),
            'topic': random.choice(['FII flows', 'earnings season', 'rate cuts', 'market volatility']),
            'observation': random.choice(['volumes are picking up', 'smart money is accumulating', 'patterns are shifting']),
            'metric': random.choice(['indicators', 'data points', 'signals', 'patterns']),
            'percentage': random.choice(['2.5', '3.7', '5.2', '8.3']),
            'timeframe': random.choice(['3-month', '6-month', 'YTD', 'quarterly']),
            'point_a': random.choice(['₹100', 'startup', 'loss-making']),
            'point_b': random.choice(['₹1000', 'unicorn', 'profitable']),
            'expert': random.choice(['the street', 'analysts', 'everyone']),
            'contrarian_view': random.choice(['Buy when others sell', 'This dip is a gift', 'Corrections are healthy']),
            'counter_argument': random.choice(['everyone\'s bearish', 'charts look bad', 'FIIs are selling']),
            'commonly_held_belief': random.choice(['IT is overvalued', 'markets will crash', 'buy the dip always works']),
            'concept': random.choice(['P/E ratios', 'support levels', 'divergences', 'volume analysis']),
            'example': random.choice(['today\'s move', 'Reliance', 'IT sector', 'recent correction']),
            'pattern': random.choice(['reversal', 'breakout', 'accumulation', 'distribution']),
            'jargon': random.choice(['RSI divergence', 'cup and handle', 'death cross', 'IV crush'])
        }
        
        # Override with actual market data if provided
        if market_data:
            data.update(market_data)
        
        return data
    
    def _prepare_content_data(self, market_data: Dict, personality: str) -> Dict:
        """Prepare data for content generation"""
        
        # Import the real data fetcher
        try:
            from get_indian_market_data import get_real_indian_market_data, format_market_update
            real_data = get_real_indian_market_data()
            formatted = format_market_update(real_data)
            
            # Use real data
            metrics = [
                f"Nifty: {formatted['nifty']} ({formatted['nifty_change']})",
                f"FII: {formatted['fii']}, DII: {formatted['dii']}",
                f"Top Sector: {formatted['top_sector']}"
            ]
            
            # Get actual top gainers
            if real_data.get('top_gainers'):
                top_gainer = real_data['top_gainers'][0]
                metrics.append(f"Top Gainer: {top_gainer[0]} (+{top_gainer[1]:.1f}%)")
        except:
            # Fallback to defaults
            metrics = [
                'Nifty: 24,712 (-0.75%)',
                'FII: -892 Cr, DII: +3,456 Cr',
                'Top Sector: IT (+1.2%)'
            ]
        
        data = {
            'situation': 'Markets traded sideways today with mixed global cues',
            'metrics': metrics,
            'analysis': 'Range-bound movement suggests accumulation phase',
            'implications': 'Good time to build positions gradually',
            'scene': 'Walked into the trading room this morning to an unusual sight',
            'development': 'FIIs were selling, but someone was buying everything',
            'data_points': ['₹3,456 Cr absorbed by DIIs', 'Nifty held 24,700 despite pressure'],
            'conclusion': 'Sometimes the best trades happen when nobody\'s watching',
            'intro': 'Five things that caught my attention today',
            'points': [
                'IT stocks quietly outperforming',
                'Bank Nifty holding crucial support',
                'Pharma seeing renewed interest',
                'Mid-caps showing relative strength',
                'VIX surprisingly calm'
            ],
            'summary': 'Watch these spaces tomorrow',
            'item1': 'Large-caps',
            'item2': 'Mid-caps',
            'comparison1': 'Mid-caps up 0.5% vs Large-cap -0.75%',
            'comparison2': 'Large-caps at 25 PE vs Mid-caps at 22 PE',
            'comparison3': 'Mid-caps more volatile short-term',
            'verdict': 'Mid-caps for risk-takers, Large-caps for stability',
            'main_point': 'That Reliance move? Not random',
            'explanation': 'Jio announcement coming. Connect the dots',
            'data': 'Volume 2x average',
            'thread_points': [
                'Everyone\'s worried about FII selling',
                'But look closer: They\'re only selling banks',
                'Meanwhile accumulating IT and Pharma',
                'Classic sector rotation, not exit'
            ],
            'market_data': {
                'Nifty': '24,712 (-0.75%)',
                'Sensex': '80,787 (-0.73%)',
                'Bank Nifty': '51,234 (+0.45%)',
                'India VIX': '14.5',
                'FII/DII': '-892/+3,456 Cr'
            },
            'interpretation': 'Consolidation before next move',
            'opinion': 'This correction is healthy, not concerning',
            'reasoning': 'We ran up 15% without pause',
            'counter': 'FIIs are selling',
            'but': 'they always sell at highs, and buy back lower'
        }
        
        # Override with actual market data if provided
        if market_data:
            data.update(market_data)
        
        return data
    
    def _inject_phrase(self, content: str, phrase: str) -> str:
        """Naturally inject personality phrases into content"""
        lines = content.split('\n')
        if len(lines) > 2:
            insert_pos = random.randint(1, len(lines)-1)
            lines.insert(insert_pos, f"\n{phrase.capitalize()},\n")
        return '\n'.join(lines)
    
    def _add_minimal_emojis(self, content: str) -> str:
        """Add very few emojis"""
        if random.random() > 0.7:
            emoji_map = {
                'up': '📈',
                'down': '📉',
                'important': '👇',
                'think': '🤔'
            }
            for word, emoji in emoji_map.items():
                if word in content.lower() and random.random() > 0.5:
                    return content + f" {emoji}"
        return content
    
    def _add_chart_emojis(self, content: str) -> str:
        """Add only chart/data related emojis"""
        replacements = {
            'data': '📊 data',
            'chart': '📈 chart',
            'numbers': '🔢 numbers',
            'analysis': '📉 analysis'
        }
        for word, replacement in replacements.items():
            if word in content.lower():
                content = content.replace(word, replacement, 1)
                break
        return content
    
    def _add_educational_emojis(self, content: str) -> str:
        """Add educational emojis"""
        replacements = {
            'learn': '📚 learn',
            'important': '⚠️ important',
            'tip': '💡 tip',
            'note': '📝 note'
        }
        for word, replacement in replacements.items():
            if word in content.lower():
                content = content.replace(word, replacement, 1)
        return content
    
    def generate_batch(self, count: int = 5) -> List[Dict]:
        """Generate multiple pieces of varied content"""
        contents = []
        used_patterns = []
        used_personalities = []
        
        for _ in range(count):
            # Ensure variety
            pattern = random.choice([p for p in self.content_patterns.keys() if p not in used_patterns])
            used_patterns.append(pattern)
            
            content = self.generate_humanized_content(content_type=pattern)
            contents.append(content)
            
            # Reset if we've used all patterns
            if len(used_patterns) >= len(self.content_patterns):
                used_patterns = []
        
        return contents


def test_humanized_generator():
    """Test the humanized content generator"""
    generator = HumanizedContentGenerator()
    
    print("🎨 Generating Humanized Content")
    print("=" * 60)
    
    # Generate batch of varied content
    contents = generator.generate_batch(5)
    
    for i, content in enumerate(contents, 1):
        print(f"\n--- Content {i} ---")
        print(f"Title: {content['title']}")
        print(f"Type: {content['content_type']}")
        print(f"Personality: {content['personality']}")
        print(f"\nContent:\n{content['content']}")
        print(f"\nHashtags: {' '.join(content['hashtags']) if content['hashtags'] else 'None'}")
        print("-" * 40)
    
    print("\n✅ Generated 5 unique, humanized pieces of content")
    print("Note: No 'Deep Dive' titles, varied structures, different personalities!")
    
    return contents


if __name__ == "__main__":
    contents = test_humanized_generator()
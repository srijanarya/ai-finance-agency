#!/usr/bin/env python3
"""
Content Variety Enhancer
========================
Ensures maximum variety in your social media posts by:
1. Rotating through different content types
2. Using different market data points
3. Varying the writing style and format
"""

import random
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict
import yfinance as yf

class ContentVarietyEnhancer:
    """Enhances content variety for social media posts"""
    
    def __init__(self):
        self.history_file = 'content_variety_history.json'
        self.load_history()
        
    def load_history(self):
        """Load posting history to avoid repetition"""
        if os.path.exists(self.history_file):
            with open(self.history_file, 'r') as f:
                self.history = json.load(f)
        else:
            self.history = {
                'last_content_types': [],
                'last_stocks_mentioned': [],
                'last_themes': [],
                'last_formats': []
            }
    
    def save_history(self):
        """Save posting history"""
        with open(self.history_file, 'w') as f:
            json.dump(self.history, f, indent=2)
    
    def get_varied_content_type(self) -> str:
        """Get a content type that hasn't been used recently"""
        all_types = [
            # Market Analysis (30%)
            'market_overview',
            'sector_analysis', 
            'stock_spotlight',
            'index_analysis',
            
            # Educational (25%)
            'trading_strategy',
            'investment_tip',
            'risk_management',
            'market_terminology',
            
            # News & Events (20%)
            'breaking_news',
            'earnings_preview',
            'economic_indicator',
            'policy_update',
            
            # Interactive (15%)
            'market_quiz',
            'poll_question',
            'myth_buster',
            'fact_of_day',
            
            # Personal Stories (10%)
            'success_story',
            'lesson_learned',
            'market_observation',
            'trader_psychology'
        ]
        
        # Avoid recent types
        recent = self.history['last_content_types'][-5:] if self.history['last_content_types'] else []
        available = [t for t in all_types if t not in recent]
        
        if not available:
            available = all_types
        
        selected = random.choice(available)
        self.history['last_content_types'].append(selected)
        
        # Keep only last 10 to avoid memory bloat
        if len(self.history['last_content_types']) > 10:
            self.history['last_content_types'] = self.history['last_content_types'][-10:]
        
        return selected
    
    def get_varied_market_data(self) -> Dict:
        """Get varied market data points to discuss"""
        try:
            data = {}
            
            # Basic indices - always include
            nifty = yf.Ticker('^NSEI')
            sensex = yf.Ticker('^BSESN')
            
            nifty_data = nifty.history(period='5d')
            sensex_data = sensex.history(period='5d')
            
            # Calculate various metrics for variety
            if not nifty_data.empty:
                data['nifty'] = {
                    'current': nifty_data['Close'].iloc[-1],
                    'change_pct': ((nifty_data['Close'].iloc[-1] - nifty_data['Close'].iloc[-2]) / nifty_data['Close'].iloc[-2] * 100) if len(nifty_data) > 1 else 0,
                    'week_high': nifty_data['High'].max(),
                    'week_low': nifty_data['Low'].min(),
                    'volatility': nifty_data['Close'].pct_change().std() * 100
                }
            
            # Get different stocks each time
            stock_universe = [
                'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
                'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
                'LT.NS', 'WIPRO.NS', 'AXISBANK.NS', 'ASIAN.NS', 'ULTRACEMCO.NS',
                'MARUTI.NS', 'TITAN.NS', 'NESTLEIND.NS', 'BAJFINANCE.NS', 'ONGC.NS'
            ]
            
            # Pick random stocks to analyze
            selected_stocks = random.sample(stock_universe, min(5, len(stock_universe)))
            data['stocks'] = []
            
            for symbol in selected_stocks:
                try:
                    stock = yf.Ticker(symbol)
                    hist = stock.history(period='2d')
                    if not hist.empty and len(hist) > 1:
                        data['stocks'].append({
                            'symbol': symbol.replace('.NS', ''),
                            'price': hist['Close'].iloc[-1],
                            'change_pct': ((hist['Close'].iloc[-1] - hist['Close'].iloc[-2]) / hist['Close'].iloc[-2] * 100),
                            'volume': hist['Volume'].iloc[-1]
                        })
                except:
                    continue
            
            # Get different sector focus each time
            sectors = ['Banking', 'IT', 'Pharma', 'Auto', 'FMCG', 'Metal', 'Energy', 'Realty']
            data['focus_sector'] = random.choice(sectors)
            
            # Add variety metrics
            data['metrics_to_highlight'] = random.sample([
                'price_action',
                'volume_analysis', 
                'support_resistance',
                'momentum_indicators',
                'sector_rotation',
                'fii_dii_activity',
                'options_data',
                'delivery_percentage'
            ], 3)
            
            return data
            
        except Exception as e:
            print(f"Error fetching varied data: {e}")
            return {}
    
    def get_varied_format(self, platform: str) -> str:
        """Get varied content format templates"""
        
        if platform == 'twitter':
            formats = [
                "📊 {index_update}\n\n{key_point}\n\n{hashtags}",
                "🎯 {stock_focus}\n{analysis}\n\n💡 {tip}\n\n{hashtags}",
                "Breaking: {news}\n\nImpact: {impact}\n\n{hashtags}",
                "Question: {question}\n\nA) {option_a}\nB) {option_b}\n\nReply with your answer! {hashtags}",
                "{emoji} {fact}\n\nDid you know? {explanation}\n\n{hashtags}"
            ]
        elif platform == 'linkedin':
            formats = [
                "professional_analysis",
                "thought_leadership",
                "market_commentary",
                "educational_post",
                "success_story"
            ]
        else:  # telegram
            formats = [
                "detailed_update",
                "quick_alert",
                "analysis_report",
                "trading_setup",
                "news_digest"
            ]
        
        # Avoid recent formats
        recent = self.history['last_formats'][-3:] if self.history['last_formats'] else []
        available = [f for f in formats if f not in recent]
        
        if not available:
            available = formats
        
        selected = random.choice(available)
        self.history['last_formats'].append(selected)
        
        # Keep only last 10
        if len(self.history['last_formats']) > 10:
            self.history['last_formats'] = self.history['last_formats'][-10:]
        
        return selected
    
    def get_content_suggestions(self) -> Dict:
        """Get suggestions for varied content"""
        content_type = self.get_varied_content_type()
        market_data = self.get_varied_market_data()
        
        suggestions = {
            'content_type': content_type,
            'market_data': market_data,
            'formats': {
                'twitter': self.get_varied_format('twitter'),
                'linkedin': self.get_varied_format('linkedin'),
                'telegram': self.get_varied_format('telegram')
            },
            'themes': self._get_varied_themes(),
            'angles': self._get_varied_angles()
        }
        
        self.save_history()
        return suggestions
    
    def _get_varied_themes(self) -> List[str]:
        """Get varied content themes"""
        all_themes = [
            'bullish_outlook', 'cautious_approach', 'opportunity_spotting',
            'risk_awareness', 'long_term_investing', 'short_term_trading',
            'technical_analysis', 'fundamental_analysis', 'market_psychology',
            'global_impact', 'domestic_focus', 'sector_rotation',
            'wealth_creation', 'capital_preservation', 'income_generation'
        ]
        
        return random.sample(all_themes, 3)
    
    def _get_varied_angles(self) -> List[str]:
        """Get varied angles to approach content"""
        angles = [
            'data_driven', 'story_telling', 'educational', 'conversational',
            'analytical', 'predictive', 'historical_comparison', 'expert_opinion',
            'beginner_friendly', 'advanced_strategy', 'contrarian_view',
            'mainstream_consensus', 'breaking_news', 'deep_dive'
        ]
        
        return random.sample(angles, 3)
    
    def generate_variety_report(self):
        """Generate a report showing content variety"""
        suggestions = self.get_content_suggestions()
        
        print("\n" + "="*60)
        print("📊 CONTENT VARIETY SUGGESTIONS")
        print("="*60)
        
        print(f"\n🎯 Content Type: {suggestions['content_type']}")
        print(f"📝 Themes: {', '.join(suggestions['themes'])}")
        print(f"🔄 Angles: {', '.join(suggestions['angles'])}")
        
        print("\n📈 Market Data Focus:")
        if suggestions['market_data'].get('stocks'):
            print("  Stocks to mention:")
            for stock in suggestions['market_data']['stocks'][:3]:
                print(f"    • {stock['symbol']}: ₹{stock['price']:.2f} ({stock['change_pct']:+.1f}%)")
        
        if suggestions['market_data'].get('focus_sector'):
            print(f"  Sector Focus: {suggestions['market_data']['focus_sector']}")
        
        if suggestions['market_data'].get('metrics_to_highlight'):
            print(f"  Metrics: {', '.join(suggestions['market_data']['metrics_to_highlight'])}")
        
        print("\n💡 Format Suggestions:")
        print(f"  Twitter: {suggestions['formats']['twitter']}")
        print(f"  LinkedIn: {suggestions['formats']['linkedin']}")
        print(f"  Telegram: {suggestions['formats']['telegram']}")
        
        print("\n" + "="*60)
        print("✨ Each post will be unique with this variety!")


# Example usage
if __name__ == "__main__":
    enhancer = ContentVarietyEnhancer()
    enhancer.generate_variety_report()
    
    # Show how content changes
    print("\n🔄 Generating 3 different content suggestions:")
    for i in range(3):
        print(f"\n--- Suggestion {i+1} ---")
        suggestions = enhancer.get_content_suggestions()
        print(f"Type: {suggestions['content_type']}")
        print(f"Theme: {suggestions['themes'][0]}")
        print(f"Angle: {suggestions['angles'][0]}")
#!/usr/bin/env python3
"""
Content Relevance Calculator
Calculates how relevant content is based on age, topic, and market conditions
"""

from datetime import datetime, timedelta
import re
import json

class RelevanceCalculator:
    """Calculate content relevance scores"""
    
    def calculate_relevance(self, title, created_date, content_type=None, keywords=None):
        """
        Calculate relevance score (0-100) based on multiple factors
        Higher score = More relevant
        """
        score = 100.0
        
        # 1. AGE PENALTY - Content loses relevance over time
        now = datetime.now()
        if isinstance(created_date, str):
            created_date = datetime.fromisoformat(created_date.replace(' ', 'T'))
        
        age_hours = (now - created_date).total_seconds() / 3600
        
        # Relevance decay schedule
        if age_hours < 6:
            # Less than 6 hours old - 100% relevant
            age_penalty = 0
            freshness = "🔥 HOT"
        elif age_hours < 24:
            # Less than 1 day - loses 20%
            age_penalty = 20
            freshness = "📰 FRESH"
        elif age_hours < 48:
            # 1-2 days old - loses 40%
            age_penalty = 40
            freshness = "📅 RECENT"
        elif age_hours < 72:
            # 2-3 days old - loses 60%
            age_penalty = 60
            freshness = "📆 AGING"
        elif age_hours < 168:
            # 3-7 days old - loses 75%
            age_penalty = 75
            freshness = "🗓️ OLD"
        else:
            # More than 1 week - loses 90%
            age_penalty = 90
            freshness = "📜 STALE"
        
        score -= age_penalty
        
        # 2. TOPIC BOOST - Some topics stay relevant longer
        evergreen_keywords = [
            'educational', 'tutorial', 'guide', 'strategy', 'analysis',
            'fundamental', 'technical', 'pattern', 'indicator', 'method'
        ]
        
        time_sensitive_keywords = [
            'breaking', 'just in', 'today', 'now', 'alert', 'urgent',
            'earnings', 'result', 'ipo', 'announcement', 'merger'
        ]
        
        title_lower = title.lower() if title else ""
        
        # Check for evergreen content (stays relevant longer)
        if any(keyword in title_lower for keyword in evergreen_keywords):
            score += 15  # Boost evergreen content
            if age_hours > 72:
                score += 10  # Extra boost for old evergreen content
        
        # Check for time-sensitive content (decays faster)
        if any(keyword in title_lower for keyword in time_sensitive_keywords):
            if age_hours > 24:
                score -= 20  # Extra penalty for old breaking news
        
        # 3. MARKET EVENT RELEVANCE
        market_events = {
            'earnings': 7,    # Earnings relevant for 7 days
            'ipo': 14,        # IPO news relevant for 2 weeks
            'rbi': 30,        # RBI policy relevant for a month
            'budget': 30,     # Budget news relevant for a month
            'result': 3,      # Company results relevant for 3 days
            'dividend': 7,    # Dividend news relevant for a week
        }
        
        for event, relevance_days in market_events.items():
            if event in title_lower:
                if age_hours <= relevance_days * 24:
                    score += 10  # Boost if within relevance window
                else:
                    score -= 15  # Penalty if outside window
        
        # 4. SPECIFIC STOCK/PRICE MENTIONS
        # News with specific prices become irrelevant quickly
        if re.search(r'₹\d+|Rs\s*\d+|\$\d+', title):
            if age_hours > 48:
                score -= 15  # Old price mentions are less relevant
        
        # 5. Cap the score between 0 and 100
        score = max(0, min(100, score))
        
        return {
            'score': round(score, 1),
            'freshness': freshness,
            'age_hours': round(age_hours, 1),
            'age_display': self._format_age(age_hours),
            'relevance_level': self._get_relevance_level(score),
            'should_use': score >= 40,  # Recommend using if score >= 40
            'priority': self._get_priority(score, age_hours)
        }
    
    def _format_age(self, hours):
        """Format age in human-readable format"""
        if hours < 1:
            return f"{int(hours * 60)} minutes ago"
        elif hours < 24:
            return f"{int(hours)} hours ago"
        elif hours < 48:
            return "Yesterday"
        elif hours < 168:
            return f"{int(hours / 24)} days ago"
        else:
            return f"{int(hours / 168)} weeks ago"
    
    def _get_relevance_level(self, score):
        """Get relevance level based on score"""
        if score >= 80:
            return "🟢 HIGHLY RELEVANT"
        elif score >= 60:
            return "🟡 MODERATELY RELEVANT"
        elif score >= 40:
            return "🟠 SOMEWHAT RELEVANT"
        elif score >= 20:
            return "🔴 LOW RELEVANCE"
        else:
            return "⚫ NOT RELEVANT"
    
    def _get_priority(self, score, age_hours):
        """Get priority for content generation"""
        if score >= 80 and age_hours < 6:
            return "🚨 URGENT"
        elif score >= 70 and age_hours < 24:
            return "⚡ HIGH"
        elif score >= 50:
            return "📌 MEDIUM"
        elif score >= 30:
            return "📎 LOW"
        else:
            return "🗑️ SKIP"
    
    def batch_calculate(self, items):
        """Calculate relevance for multiple items"""
        results = []
        for item in items:
            relevance = self.calculate_relevance(
                title=item.get('title'),
                created_date=item.get('created_at'),
                content_type=item.get('content_type'),
                keywords=item.get('keywords')
            )
            results.append({
                **item,
                'relevance': relevance
            })
        
        # Sort by relevance score
        results.sort(key=lambda x: x['relevance']['score'], reverse=True)
        return results


def test_relevance():
    """Test the relevance calculator"""
    calculator = RelevanceCalculator()
    
    test_cases = [
        {
            'title': 'BREAKING: Nifty crashes 500 points',
            'created_at': datetime.now() - timedelta(hours=2)
        },
        {
            'title': 'Educational: How to read candlestick patterns',
            'created_at': datetime.now() - timedelta(days=5)
        },
        {
            'title': 'RBI announces rate cut decision',
            'created_at': datetime.now() - timedelta(days=2)
        },
        {
            'title': 'Reliance Q3 earnings beat estimates',
            'created_at': datetime.now() - timedelta(days=8)
        },
        {
            'title': 'Stock at ₹1,234 - Buy now',
            'created_at': datetime.now() - timedelta(days=4)
        }
    ]
    
    print("\n" + "="*80)
    print("📊 RELEVANCE CALCULATOR TEST")
    print("="*80)
    
    for case in test_cases:
        relevance = calculator.calculate_relevance(
            case['title'],
            case['created_at']
        )
        
        print(f"\n📰 {case['title']}")
        print(f"   Age: {relevance['age_display']}")
        print(f"   Score: {relevance['score']}/100")
        print(f"   Status: {relevance['relevance_level']}")
        print(f"   Freshness: {relevance['freshness']}")
        print(f"   Priority: {relevance['priority']}")
        print(f"   Should Use: {'✅ Yes' if relevance['should_use'] else '❌ No'}")


if __name__ == "__main__":
    test_relevance()
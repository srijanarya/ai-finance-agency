#!/usr/bin/env python3
"""
Content Quality Analyzer
Rates financial content and provides improvement suggestions
"""

import re
from typing import Dict, List, Tuple

class ContentQualityAnalyzer:
    def __init__(self):
        # Professional content scoring criteria
        self.scoring_criteria = {
            'data_density': {
                'weight': 0.15,
                'description': 'Specific numbers, percentages, and metrics'
            },
            'actionability': {
                'weight': 0.20,
                'description': 'Clear trade setups, levels, or investment ideas'
            },
            'timeliness': {
                'weight': 0.15,
                'description': 'Current events, breaking news, timely insights'
            },
            'uniqueness': {
                'weight': 0.15,
                'description': 'Original insights not found elsewhere'
            },
            'clarity': {
                'weight': 0.10,
                'description': 'Easy to understand, well-structured'
            },
            'engagement': {
                'weight': 0.10,
                'description': 'Hooks, questions, conversation starters'
            },
            'credibility': {
                'weight': 0.10,
                'description': 'Sources, reasoning, logical flow'
            },
            'visual_appeal': {
                'weight': 0.05,
                'description': 'Formatting, emojis used sparingly'
            }
        }
        
    def analyze_content(self, content: str, title: str = "") -> Dict:
        """Analyze content quality and provide detailed scoring"""
        
        scores = {}
        
        # 1. Data Density (0-10)
        numbers = re.findall(r'\d+[.,]?\d*%?', content)
        currency = re.findall(r'[₹$]\s*[\d,]+(?:\.\d+)?(?:\s*(?:Cr|Lakh|K|M|B|T))?', content)
        data_points = len(numbers) + len(currency) * 2
        scores['data_density'] = min(10, data_points * 1.5)
        
        # 2. Actionability (0-10)
        action_keywords = ['buy', 'sell', 'accumulate', 'book', 'exit', 'enter', 'target', 
                          'stop loss', 'support', 'resistance', 'breakout', 'breakdown']
        action_count = sum(1 for keyword in action_keywords if keyword.lower() in content.lower())
        levels_mentioned = len(re.findall(r'\d{4,6}', content))  # Price levels
        scores['actionability'] = min(10, (action_count * 2) + (levels_mentioned * 1))
        
        # 3. Timeliness (0-10)
        time_keywords = ['today', 'yesterday', 'tomorrow', 'this week', 'breaking', 'just', 
                        'now', 'alert', 'update', 'latest', 'developing']
        time_count = sum(1 for keyword in time_keywords if keyword.lower() in content.lower())
        scores['timeliness'] = min(10, time_count * 2)
        
        # 4. Uniqueness (0-10)
        unique_phrases = ['nobody is talking about', 'hidden', 'overlooked', 'contrarian',
                         'exclusive', 'first to', 'discovered', "here's what"]
        unique_count = sum(1 for phrase in unique_phrases if phrase.lower() in content.lower())
        analysis_depth = len(content.split('\n')) / 2  # More detailed = more unique
        scores['uniqueness'] = min(10, unique_count * 3 + analysis_depth)
        
        # 5. Clarity (0-10)
        bullets = content.count('•') + content.count('→') + content.count('✓')
        sections = content.count('\n\n')
        short_sentences = len([s for s in content.split('.') if 5 < len(s.split()) < 15])
        scores['clarity'] = min(10, bullets + sections + (short_sentences * 0.5))
        
        # 6. Engagement (0-10)
        questions = content.count('?')
        calls_to_action = sum(1 for cta in ['thoughts?', 'agree?', 'what do you think', 
                                            'let me know', 'comment below'] 
                             if cta.lower() in content.lower())
        emojis = len(re.findall(r'[📊🎯💡🚀📈📉✅❌⚡️🔥💰]', content))
        scores['engagement'] = min(10, questions * 2 + calls_to_action * 3 + emojis * 0.5)
        
        # 7. Credibility (0-10)
        reasoning_words = ['because', 'therefore', 'hence', 'due to', 'as a result', 
                          'data shows', 'analysis reveals', 'historically']
        reasoning_count = sum(1 for word in reasoning_words if word.lower() in content.lower())
        source_mentions = sum(1 for source in ['nse', 'bse', 'sebi', 'rbi', 'report', 'data'] 
                             if source.lower() in content.lower())
        scores['credibility'] = min(10, reasoning_count * 1.5 + source_mentions * 2)
        
        # 8. Visual Appeal (0-10)
        proper_formatting = sections * 2
        emoji_balance = min(5, emojis) if emojis < 10 else max(0, 10 - emojis)
        scores['visual_appeal'] = min(10, proper_formatting + emoji_balance)
        
        # Calculate weighted total
        total_score = 0
        for criterion, weight_info in self.scoring_criteria.items():
            score = scores.get(criterion, 0)
            weighted = score * weight_info['weight']
            total_score += weighted
        
        # Generate improvement suggestions
        suggestions = self._generate_suggestions(scores)
        
        return {
            'total_score': round(total_score, 2),
            'grade': self._get_grade(total_score),
            'detailed_scores': scores,
            'suggestions': suggestions,
            'strengths': self._identify_strengths(scores),
            'weaknesses': self._identify_weaknesses(scores)
        }
    
    def _get_grade(self, score: float) -> str:
        """Convert score to grade"""
        if score >= 9: return 'A+ (Exceptional)'
        elif score >= 8: return 'A (Excellent)'
        elif score >= 7: return 'B+ (Very Good)'
        elif score >= 6: return 'B (Good)'
        elif score >= 5: return 'C+ (Average)'
        elif score >= 4: return 'C (Below Average)'
        elif score >= 3: return 'D (Poor)'
        else: return 'F (Needs Major Improvement)'
    
    def _identify_strengths(self, scores: Dict) -> List[str]:
        """Identify content strengths"""
        strengths = []
        for criterion, score in scores.items():
            if score >= 7:
                strengths.append(f"Strong {criterion.replace('_', ' ')}: {score}/10")
        return strengths
    
    def _identify_weaknesses(self, scores: Dict) -> List[str]:
        """Identify content weaknesses"""
        weaknesses = []
        for criterion, score in scores.items():
            if score < 5:
                weaknesses.append(f"Weak {criterion.replace('_', ' ')}: {score}/10")
        return weaknesses
    
    def _generate_suggestions(self, scores: Dict) -> List[str]:
        """Generate specific improvement suggestions"""
        suggestions = []
        
        if scores.get('data_density', 0) < 5:
            suggestions.append("📊 Add more specific numbers: price levels, percentages, volumes, ratios")
        
        if scores.get('actionability', 0) < 5:
            suggestions.append("🎯 Include clear action points: entry/exit levels, specific stocks, time frames")
        
        if scores.get('timeliness', 0) < 5:
            suggestions.append("⏰ Reference current events: today's moves, breaking news, upcoming catalysts")
        
        if scores.get('uniqueness', 0) < 5:
            suggestions.append("💡 Add unique insights: contrarian views, hidden patterns, exclusive analysis")
        
        if scores.get('clarity', 0) < 5:
            suggestions.append("📝 Improve structure: use bullets, shorter sentences, clear sections")
        
        if scores.get('engagement', 0) < 5:
            suggestions.append("💬 Boost engagement: ask questions, add CTAs, create discussion points")
        
        if scores.get('credibility', 0) < 5:
            suggestions.append("🔍 Add credibility: cite sources, explain reasoning, show data backing")
        
        return suggestions
    
    def compare_content(self, content1: str, content2: str) -> Dict:
        """Compare two pieces of content"""
        analysis1 = self.analyze_content(content1)
        analysis2 = self.analyze_content(content2)
        
        return {
            'content1_score': analysis1['total_score'],
            'content2_score': analysis2['total_score'],
            'winner': 1 if analysis1['total_score'] > analysis2['total_score'] else 2,
            'improvement': abs(analysis1['total_score'] - analysis2['total_score'])
        }


def analyze_current_content():
    """Analyze a sample of current content"""
    
    # Sample of current underwhelming content
    current_content = """🚀 India's Market Opportunity

📊 Key Numbers:
• Nifty: 24,712 (-0.75%)
• Sensex: 80,787 (-0.73%)
• FII: ₹-892 Cr | DII: ₹+3,456 Cr

🎯 What Smart Money is Doing:
DIIs bought ₹15,000 Cr in last 10 sessions

💡 Your Action Plan:
✓ Accumulate quality on dips
✓ Keep 20% cash ready

What's your take? 👇"""

    # What good content should look like (inspired by successful creators)
    improved_content = """🚨 BREAKING: Adani Ports jumps 4.2% after Hindenburg closure

The setup I shared yesterday at ₹1,420 played out perfectly.
Here's what happened and what's next:

📊 TODAY'S ACTION:
• Entry triggered: ₹1,420 ✅
• Current: ₹1,475 (+3.87%)
• Volume: 2.3x average (institutions accumulating)
• RSI: 58 (room to run)

🎯 UPDATED LEVELS:
• Immediate target: ₹1,510 (2.4% upside)
• Stop loss: Trail to ₹1,445
• Major resistance: ₹1,550 (psychological)

💡 THE BIGGER PICTURE:
While everyone's focused on the Hindenburg news, notice:
→ FIIs turned net buyers in Adani stocks (₹890 Cr today)
→ Adani Green got MSCI inclusion (passive flows coming)
→ Ports business unaffected (15% volume growth QoQ)

⚡ SIMILAR SETUPS FORMING:
1. Adani Ent near ₹2,880 support
2. Adani Green breakout above ₹1,820
3. ACC showing accumulation at ₹2,150

🔔 Set alerts at these levels. 
 
Disclaimer: Not advice. I'm long Adani Ports from ₹1,420.

Which Adani stock are you tracking? 👇"""
    
    analyzer = ContentQualityAnalyzer()
    
    print("\n" + "="*70)
    print("📊 CONTENT QUALITY ANALYSIS")
    print("="*70)
    
    print("\n🔴 CURRENT CONTENT ANALYSIS:")
    print("-"*40)
    current_analysis = analyzer.analyze_content(current_content)
    print(f"Score: {current_analysis['total_score']}/10")
    print(f"Grade: {current_analysis['grade']}")
    print("\nDetailed Scores:")
    for criterion, score in current_analysis['detailed_scores'].items():
        print(f"  • {criterion.replace('_', ' ').title()}: {score}/10")
    print("\nWeaknesses:")
    for weakness in current_analysis['weaknesses']:
        print(f"  ❌ {weakness}")
    print("\nSuggestions:")
    for suggestion in current_analysis['suggestions']:
        print(f"  → {suggestion}")
    
    print("\n🟢 IMPROVED CONTENT ANALYSIS:")
    print("-"*40)
    improved_analysis = analyzer.analyze_content(improved_content)
    print(f"Score: {improved_analysis['total_score']}/10")
    print(f"Grade: {improved_analysis['grade']}")
    print("\nDetailed Scores:")
    for criterion, score in improved_analysis['detailed_scores'].items():
        print(f"  • {criterion.replace('_', ' ').title()}: {score}/10")
    print("\nStrengths:")
    for strength in improved_analysis['strengths']:
        print(f"  ✅ {strength}")
    
    print("\n📈 IMPROVEMENT NEEDED:")
    print(f"Current content needs {improved_analysis['total_score'] - current_analysis['total_score']:.1f} point improvement")
    
    print("\n" + "="*70)
    return current_analysis, improved_analysis


if __name__ == "__main__":
    analyze_current_content()
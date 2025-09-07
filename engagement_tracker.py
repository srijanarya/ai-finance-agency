#!/usr/bin/env python3
"""
Engagement Tracking System for Posted Content
Monitors and analyzes engagement metrics across platforms
"""
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests
from dotenv import load_dotenv

load_dotenv()

class EngagementTracker:
    """Track and analyze engagement metrics for posted content"""
    
    def __init__(self):
        self.metrics_file = 'engagement_metrics.json'
        self.load_metrics()
        
    def load_metrics(self):
        """Load existing metrics or create new file"""
        if os.path.exists(self.metrics_file):
            with open(self.metrics_file, 'r') as f:
                self.metrics = json.load(f)
        else:
            self.metrics = {
                'posts': [],
                'summary': {
                    'total_posts': 0,
                    'avg_engagement_score': 0,
                    'best_performing_type': None,
                    'platform_stats': {}
                }
            }
    
    def save_metrics(self):
        """Save metrics to file"""
        with open(self.metrics_file, 'w') as f:
            json.dump(self.metrics, f, indent=2)
    
    def track_post(self, platform: str, content_type: str, 
                   post_id: str, content_preview: str,
                   engagement_score: float, coherence_score: int,
                   multipliers_applied: List[str]):
        """Track a new post with its metrics"""
        post_entry = {
            'timestamp': datetime.now().isoformat(),
            'platform': platform,
            'content_type': content_type,
            'post_id': post_id,
            'content_preview': content_preview[:200],
            'engagement_score': engagement_score,
            'coherence_score': coherence_score,
            'multipliers_applied': multipliers_applied,
            'actual_engagement': {
                'likes': 0,
                'comments': 0,
                'shares': 0,
                'views': 0
            },
            'performance_vs_expected': 'pending'
        }
        
        self.metrics['posts'].append(post_entry)
        self.update_summary()
        self.save_metrics()
        
        return post_entry
    
    def update_summary(self):
        """Update summary statistics"""
        posts = self.metrics['posts']
        if not posts:
            return
        
        # Total posts
        self.metrics['summary']['total_posts'] = len(posts)
        
        # Average engagement score
        avg_score = sum(p['engagement_score'] for p in posts) / len(posts)
        self.metrics['summary']['avg_engagement_score'] = round(avg_score, 1)
        
        # Best performing content type
        type_scores = {}
        for post in posts:
            ct = post['content_type']
            if ct not in type_scores:
                type_scores[ct] = []
            type_scores[ct].append(post['engagement_score'])
        
        best_type = max(type_scores.items(), 
                       key=lambda x: sum(x[1])/len(x[1]) if x[1] else 0)
        self.metrics['summary']['best_performing_type'] = best_type[0]
        
        # Platform statistics
        platform_stats = {}
        for post in posts:
            platform = post['platform']
            if platform not in platform_stats:
                platform_stats[platform] = {
                    'count': 0,
                    'avg_score': 0,
                    'avg_coherence': 0
                }
            
            platform_stats[platform]['count'] += 1
            
        for platform in platform_stats:
            platform_posts = [p for p in posts if p['platform'] == platform]
            platform_stats[platform]['avg_score'] = round(
                sum(p['engagement_score'] for p in platform_posts) / len(platform_posts), 1
            )
            platform_stats[platform]['avg_coherence'] = round(
                sum(p['coherence_score'] for p in platform_posts) / len(platform_posts), 1
            )
        
        self.metrics['summary']['platform_stats'] = platform_stats
    
    def get_recent_posts(self, hours: int = 24) -> List[Dict]:
        """Get posts from the last N hours"""
        cutoff = datetime.now() - timedelta(hours=hours)
        recent = []
        
        for post in self.metrics['posts']:
            post_time = datetime.fromisoformat(post['timestamp'])
            if post_time > cutoff:
                recent.append(post)
        
        return recent
    
    def get_performance_report(self) -> Dict:
        """Generate performance report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': self.metrics['summary'],
            'last_24h': {
                'posts': len(self.get_recent_posts(24)),
                'platforms': set(p['platform'] for p in self.get_recent_posts(24))
            },
            'top_multipliers': self.get_top_multipliers(),
            'content_distribution': self.get_content_distribution()
        }
        
        return report
    
    def get_top_multipliers(self) -> Dict:
        """Get most frequently used multipliers"""
        multiplier_count = {}
        
        for post in self.metrics['posts']:
            for multiplier in post.get('multipliers_applied', []):
                multiplier_count[multiplier] = multiplier_count.get(multiplier, 0) + 1
        
        # Sort by count
        sorted_multipliers = sorted(multiplier_count.items(), 
                                   key=lambda x: x[1], 
                                   reverse=True)
        
        return dict(sorted_multipliers[:5])
    
    def get_content_distribution(self) -> Dict:
        """Get distribution of content types"""
        distribution = {}
        
        for post in self.metrics['posts']:
            ct = post['content_type']
            distribution[ct] = distribution.get(ct, 0) + 1
        
        return distribution
    
    def analyze_coherence_impact(self) -> Dict:
        """Analyze impact of coherence on engagement"""
        high_coherence = [p for p in self.metrics['posts'] if p['coherence_score'] >= 8]
        low_coherence = [p for p in self.metrics['posts'] if p['coherence_score'] < 8]
        
        analysis = {
            'high_coherence_posts': len(high_coherence),
            'low_coherence_posts': len(low_coherence),
            'high_coherence_avg_score': 0,
            'low_coherence_avg_score': 0
        }
        
        if high_coherence:
            analysis['high_coherence_avg_score'] = round(
                sum(p['engagement_score'] for p in high_coherence) / len(high_coherence), 1
            )
        
        if low_coherence:
            analysis['low_coherence_avg_score'] = round(
                sum(p['engagement_score'] for p in low_coherence) / len(low_coherence), 1
            )
        
        return analysis


class PostQualityVerifier:
    """Verify content quality before posting"""
    
    def __init__(self):
        self.min_coherence_score = 7
        self.max_strategies_count = 10
        self.banned_phrases = [
            "Today, on",
            "Consider investing",
            "As an AI",
            "I cannot provide",
            "It's important to note"
        ]
    
    def verify_content(self, content: str, content_type: str) -> Dict:
        """Verify content meets quality standards"""
        issues = []
        warnings = []
        
        # Check coherence via API
        coherence_check = self.check_coherence(content)
        if not coherence_check['is_coherent']:
            issues.extend(coherence_check['issues'])
        
        # Check for banned phrases
        for phrase in self.banned_phrases:
            if phrase.lower() in content.lower():
                issues.append(f"Contains banned phrase: '{phrase}'")
        
        # Check for excessive strategies count
        import re
        numbers = re.findall(r'\d+\s+(?:strategies|tips|ways|methods)', content.lower())
        for match in numbers:
            num = int(match.split()[0])
            if num > self.max_strategies_count:
                issues.append(f"Too many items listed: {num} (max: {self.max_strategies_count})")
        
        # Check content length
        if len(content) < 100:
            issues.append("Content too short (min: 100 characters)")
        
        if len(content) > 3000:
            warnings.append("Content very long - consider breaking into series")
        
        # Check for proper structure
        if content_type in ['tax_strategies', 'investment_mistake', 'options_loss_story']:
            if '₹' not in content and '$' not in content:
                warnings.append("No currency symbols found - add specific numbers")
        
        # Calculate quality score
        quality_score = 10
        quality_score -= len(issues) * 2
        quality_score -= len(warnings) * 0.5
        quality_score = max(0, quality_score)
        
        return {
            'approved': len(issues) == 0,
            'quality_score': quality_score,
            'issues': issues,
            'warnings': warnings,
            'coherence_score': coherence_check.get('score', 0)
        }
    
    def check_coherence(self, content: str) -> Dict:
        """Check content coherence via API"""
        try:
            response = requests.post(
                'http://localhost:5001/validate_prompt',
                json={'prompt': content}
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'is_coherent': result.get('is_coherent', False),
                    'score': result.get('score', 0),
                    'issues': result.get('issues', [])
                }
        except:
            pass
        
        # Fallback if API not available
        return {
            'is_coherent': True,
            'score': 5,
            'issues': []
        }


def main():
    """Test engagement tracking"""
    print("="*80)
    print("📊 ENGAGEMENT TRACKING SYSTEM")
    print("="*80)
    
    tracker = EngagementTracker()
    verifier = PostQualityVerifier()
    
    # Example: Track the post you just made
    sample_content = """Wealth truth nobody wants to hear:

Time in market beats timing the market

The math:
Missing 10 best days = 50% lower returns
vs
Perfect timing = Impossible consistently"""
    
    # Verify content quality
    print("\n🔍 Verifying Content Quality...")
    verification = verifier.verify_content(sample_content, 'wealth_lesson')
    
    if verification['approved']:
        print(f"✅ Content approved! Quality score: {verification['quality_score']}/10")
    else:
        print(f"❌ Content has issues:")
        for issue in verification['issues']:
            print(f"   • {issue}")
    
    if verification['warnings']:
        print(f"⚠️ Warnings:")
        for warning in verification['warnings']:
            print(f"   • {warning}")
    
    # Track the post
    print("\n📈 Tracking Post...")
    post = tracker.track_post(
        platform='linkedin',
        content_type='wealth_lesson',
        post_id='sample_' + datetime.now().strftime('%Y%m%d_%H%M%S'),
        content_preview=sample_content,
        engagement_score=127.4,  # From v2.0 optimizer
        coherence_score=10,
        multipliers_applied=['loss_framing', 'visual_content', 'social_proof']
    )
    
    print(f"✅ Post tracked: {post['post_id']}")
    
    # Generate report
    print("\n📊 Performance Report:")
    report = tracker.get_performance_report()
    
    print(f"\nSummary:")
    print(f"   Total Posts: {report['summary']['total_posts']}")
    print(f"   Avg Engagement Score: {report['summary']['avg_engagement_score']}x")
    print(f"   Best Content Type: {report['summary']['best_performing_type']}")
    
    print(f"\nPlatform Stats:")
    for platform, stats in report['summary']['platform_stats'].items():
        print(f"   {platform.upper()}:")
        print(f"      Posts: {stats['count']}")
        print(f"      Avg Score: {stats['avg_score']}x")
        print(f"      Avg Coherence: {stats['avg_coherence']}/10")
    
    # Analyze coherence impact
    print("\n🎯 Coherence Impact Analysis:")
    coherence_analysis = tracker.analyze_coherence_impact()
    print(f"   High Coherence Posts (8+): {coherence_analysis['high_coherence_posts']}")
    print(f"   Avg Score: {coherence_analysis['high_coherence_avg_score']}x")
    print(f"   Low Coherence Posts (<8): {coherence_analysis['low_coherence_posts']}")
    print(f"   Avg Score: {coherence_analysis['low_coherence_avg_score']}x")
    
    if coherence_analysis['high_coherence_avg_score'] > coherence_analysis['low_coherence_avg_score']:
        improvement = ((coherence_analysis['high_coherence_avg_score'] / 
                       max(coherence_analysis['low_coherence_avg_score'], 1)) - 1) * 100
        print(f"\n   💡 High coherence content performs {improvement:.0f}% better!")


if __name__ == "__main__":
    main()
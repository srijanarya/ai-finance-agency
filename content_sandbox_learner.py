#!/usr/bin/env python3
"""
Content Sandbox Learning System
Simulates content posting, detects issues, and learns from feedback
"""

import os
import json
import re
from datetime import datetime
from typing import Dict, List, Any, Tuple
from collections import defaultdict
import hashlib
from content_quality_system import ContentQualitySystem
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class ContentSandboxLearner:
    """Sandbox environment for testing and improving content generation"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.quality_system = ContentQualitySystem()
        self.issue_patterns = defaultdict(int)
        self.learning_history = []
        self.improvements = []
        
        # Load or create learning database
        self.db_file = 'sandbox_learning.json'
        self.load_learning_data()
        
    def load_learning_data(self):
        """Load previous learning data"""
        if os.path.exists(self.db_file):
            with open(self.db_file, 'r') as f:
                data = json.load(f)
                self.issue_patterns = defaultdict(int, data.get('issue_patterns', {}))
                self.learning_history = data.get('learning_history', [])
                self.improvements = data.get('improvements', [])
        
    def save_learning_data(self):
        """Save learning data"""
        data = {
            'issue_patterns': dict(self.issue_patterns),
            'learning_history': self.learning_history[-100:],  # Keep last 100
            'improvements': self.improvements[-50:],  # Keep last 50
            'last_updated': datetime.now().isoformat()
        }
        with open(self.db_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def detect_issues(self, content: str, platform: str) -> List[Dict]:
        """Advanced issue detection with pattern recognition"""
        issues = []
        severity_scores = {}
        
        # 1. Placeholder and Visual Reference Detection
        visual_patterns = [
            (r'\bVisual:\s*\w+', 'visual_reference', 'critical'),
            (r'\[Image[^\]]*\]', 'image_placeholder', 'critical'),
            (r'\[Chart[^\]]*\]', 'chart_placeholder', 'critical'),
            (r'\[Graph[^\]]*\]', 'graph_placeholder', 'critical'),
            (r'\[Infographic[^\]]*\]', 'infographic_placeholder', 'critical'),
            (r'See the chart below', 'missing_visual', 'critical'),
            (r'As shown in the graph', 'missing_visual', 'critical'),
        ]
        
        for pattern, issue_type, severity in visual_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                issues.append({
                    'type': issue_type,
                    'severity': severity,
                    'pattern': pattern,
                    'description': f"Contains {issue_type.replace('_', ' ')}"
                })
        
        # 2. Repetitive Content Patterns
        repetitive_patterns = [
            (r'lost\s+\d+%.*lost\s+\d+%', 'repetitive_loss', 'high'),
            (r'gained\s+\d+%.*gained\s+\d+%.*gained\s+\d+%', 'repetitive_gains', 'medium'),
            (r'(market\s+crash.*){3,}', 'repetitive_theme', 'high'),
        ]
        
        for pattern, issue_type, severity in repetitive_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                issues.append({
                    'type': issue_type,
                    'severity': severity,
                    'pattern': pattern,
                    'description': f"Contains {issue_type.replace('_', ' ')}"
                })
        
        # 3. Fake Urgency and Numbers
        fake_patterns = [
            (r'\d+\s+spots?\s+left', 'fake_scarcity', 'critical'),
            (r'Join\s+\d+\+?\s+investors?', 'fake_numbers', 'critical'),
            (r'Last\s+(day|chance|opportunity)', 'fake_urgency', 'high'),
            (r'Limited\s+time\s+offer', 'fake_urgency', 'high'),
            (r'Act\s+now', 'spam_cta', 'medium'),
        ]
        
        for pattern, issue_type, severity in fake_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                issues.append({
                    'type': issue_type,
                    'severity': severity,
                    'pattern': pattern,
                    'description': f"Contains {issue_type.replace('_', ' ')}"
                })
        
        # 4. Quality Issues
        quality_issues = []
        
        # Check for duplicate hashtags
        hashtags = re.findall(r'#\w+', content)
        if len(hashtags) != len(set(hashtags)):
            quality_issues.append({
                'type': 'duplicate_hashtags',
                'severity': 'medium',
                'description': 'Contains duplicate hashtags'
            })
        
        # Check for incomplete sentences
        if content.strip().endswith('...') and len(content) < 100:
            quality_issues.append({
                'type': 'incomplete_content',
                'severity': 'high',
                'description': 'Content appears truncated'
            })
        
        # Check for lack of specific data
        if not re.search(r'\d+\.?\d*[%₹$]|\₹\d+', content):
            quality_issues.append({
                'type': 'no_specific_data',
                'severity': 'medium',
                'description': 'Missing specific numbers or data'
            })
        
        # 5. Platform-specific issues
        platform_limits = {
            'twitter': 280,
            'linkedin': 1300,
            'telegram': 2000
        }
        
        if platform in platform_limits:
            if len(content) > platform_limits[platform]:
                quality_issues.append({
                    'type': 'exceeds_limit',
                    'severity': 'critical',
                    'description': f'Exceeds {platform} character limit'
                })
        
        # 6. Engagement killers
        boring_patterns = [
            (r'^In today\'s market', 'generic_opening', 'medium'),
            (r'As we all know', 'weak_opening', 'medium'),
            (r'It is important to note', 'verbose', 'low'),
            (r'In conclusion', 'unnecessary_conclusion', 'low'),
        ]
        
        for pattern, issue_type, severity in boring_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                quality_issues.append({
                    'type': issue_type,
                    'severity': severity,
                    'pattern': pattern,
                    'description': f"Contains {issue_type.replace('_', ' ')}"
                })
        
        issues.extend(quality_issues)
        
        # Update pattern tracking for learning
        for issue in issues:
            self.issue_patterns[issue['type']] += 1
        
        return issues
    
    def simulate_audience_reaction(self, content: str, platform: str) -> Dict:
        """Simulate how audience would react to content"""
        
        prompt = f"""You are a social media analytics expert simulating audience reaction.
        
        Platform: {platform}
        Content: {content}
        
        Analyze this content and predict:
        1. Engagement Score (0-100): How likely users are to interact
        2. Trust Score (0-100): How credible and professional it appears
        3. Action Score (0-100): How likely to drive desired action
        4. Main Issues: What would make users scroll past or distrust
        5. Best Element: What works well
        
        Be harsh but fair. Focus on real user behavior.
        
        Return as JSON:
        {{
            "engagement_score": <number>,
            "trust_score": <number>,
            "action_score": <number>,
            "main_issues": ["issue1", "issue2"],
            "best_element": "what works",
            "would_share": true/false,
            "first_impression": "what users think in 2 seconds"
        }}"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=300
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Extract JSON from response
            import json
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
        except Exception as e:
            print(f"Simulation error: {e}")
        
        return {
            "engagement_score": 0,
            "trust_score": 0,
            "action_score": 0,
            "main_issues": ["Failed to analyze"],
            "best_element": "Unknown",
            "would_share": False,
            "first_impression": "Error in analysis"
        }
    
    def generate_improvement_prompt(self, issues: List[Dict], reaction: Dict) -> str:
        """Generate specific improvement instructions based on issues"""
        
        improvements = []
        
        # Critical issues first
        critical_issues = [i for i in issues if i.get('severity') == 'critical']
        if critical_issues:
            improvements.append("CRITICAL FIXES REQUIRED:")
            for issue in critical_issues:
                if 'visual' in issue['type'] or 'placeholder' in issue['type']:
                    improvements.append("- NEVER mention visuals, charts, or images")
                elif 'fake' in issue['type']:
                    improvements.append("- Remove ALL fake numbers and false urgency")
                elif 'exceeds_limit' in issue['type']:
                    improvements.append(f"- Must stay under character limit")
        
        # Based on reaction scores
        if reaction['engagement_score'] < 50:
            improvements.append("- Start with a surprising fact or contrarian view")
            improvements.append("- Add personal insight or unique angle")
        
        if reaction['trust_score'] < 50:
            improvements.append("- Use specific, verifiable data points")
            improvements.append("- Avoid hyperbole and exaggeration")
        
        if reaction['action_score'] < 50:
            improvements.append("- Include clear, specific next step")
            improvements.append("- Make the benefit immediately obvious")
        
        # Platform-specific improvements
        improvements.append("\nPLATFORM OPTIMIZATION:")
        improvements.append("- LinkedIn: Professional tone, data-driven insights")
        improvements.append("- Twitter: Punchy, memorable, shareable")
        improvements.append("- Telegram: Conversational, detailed, actionable")
        
        return "\n".join(improvements)
    
    def learn_and_improve(self, content: str, issues: List[Dict], 
                         reaction: Dict, platform: str) -> str:
        """Learn from issues and generate improved content"""
        
        improvement_prompt = self.generate_improvement_prompt(issues, reaction)
        
        prompt = f"""You are a content improvement specialist.
        
        Original Content: {content}
        Platform: {platform}
        
        Issues Found:
        {json.dumps(issues, indent=2)}
        
        Audience Reaction:
        - Engagement: {reaction['engagement_score']}/100
        - Trust: {reaction['trust_score']}/100
        - Action: {reaction['action_score']}/100
        - First Impression: {reaction['first_impression']}
        
        Improvement Requirements:
        {improvement_prompt}
        
        Create an IMPROVED version that:
        1. Fixes ALL critical issues
        2. Maintains factual accuracy
        3. Increases engagement without being spammy
        4. Fits platform best practices
        
        Improved content:"""
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        improved = response.choices[0].message.content.strip()
        
        # Record the improvement
        self.improvements.append({
            'timestamp': datetime.now().isoformat(),
            'platform': platform,
            'issues_fixed': len(issues),
            'engagement_before': reaction['engagement_score'],
            'improvement_applied': improvement_prompt[:200]
        })
        
        return improved
    
    def run_sandbox_test(self, platform: str, content_type: str = 'market_insight', 
                         iterations: int = 3) -> Dict:
        """Run iterative sandbox testing with learning"""
        
        print(f"\n{'='*60}")
        print(f"🧪 SANDBOX TESTING - {platform.upper()}")
        print(f"{'='*60}")
        
        results = {
            'platform': platform,
            'iterations': [],
            'final_content': None,
            'total_issues_found': 0,
            'total_issues_fixed': 0
        }
        
        # Generate initial content
        print("\n📝 Generating initial content...")
        content_result = self.quality_system.create_content(platform, content_type)
        
        if not content_result.get('success'):
            print("❌ Initial generation failed")
            return results
        
        current_content = content_result['content']
        
        for iteration in range(iterations):
            print(f"\n🔄 Iteration {iteration + 1}/{iterations}")
            print("-" * 40)
            
            # Detect issues
            issues = self.detect_issues(current_content, platform)
            print(f"🔍 Issues found: {len(issues)}")
            
            if issues:
                for issue in issues[:3]:  # Show first 3 issues
                    severity_emoji = {'critical': '🔴', 'high': '🟠', 
                                    'medium': '🟡', 'low': '🟢'}
                    print(f"  {severity_emoji.get(issue['severity'], '⚪')} "
                          f"{issue['description']}")
            
            # Simulate audience reaction
            print("👥 Simulating audience reaction...")
            reaction = self.simulate_audience_reaction(current_content, platform)
            print(f"  Engagement: {reaction['engagement_score']}/100")
            print(f"  Trust: {reaction['trust_score']}/100")
            print(f"  Action: {reaction['action_score']}/100")
            print(f"  First Impression: {reaction['first_impression']}")
            
            # Store iteration data
            iteration_data = {
                'iteration': iteration + 1,
                'content': current_content[:200] + '...',
                'issues': issues,
                'reaction': reaction,
                'scores': {
                    'engagement': reaction['engagement_score'],
                    'trust': reaction['trust_score'],
                    'action': reaction['action_score']
                }
            }
            results['iterations'].append(iteration_data)
            results['total_issues_found'] += len(issues)
            
            # Learn and improve if issues exist or scores are low
            avg_score = (reaction['engagement_score'] + 
                        reaction['trust_score'] + 
                        reaction['action_score']) / 3
            
            if issues or avg_score < 80:
                print("🎓 Learning and improving...")
                improved_content = self.learn_and_improve(
                    current_content, issues, reaction, platform
                )
                
                # Check if improvement actually helped
                new_issues = self.detect_issues(improved_content, platform)
                if len(new_issues) < len(issues):
                    print(f"✅ Fixed {len(issues) - len(new_issues)} issues")
                    results['total_issues_fixed'] += len(issues) - len(new_issues)
                    current_content = improved_content
                else:
                    print("⚠️ Improvement didn't reduce issues")
            else:
                print("✅ Content meets quality standards!")
                break
        
        results['final_content'] = current_content
        
        # Record learning
        self.learning_history.append({
            'timestamp': datetime.now().isoformat(),
            'platform': platform,
            'content_type': content_type,
            'iterations_needed': len(results['iterations']),
            'final_scores': results['iterations'][-1]['scores'] if results['iterations'] else {}
        })
        
        # Save learning data
        self.save_learning_data()
        
        return results
    
    def run_comprehensive_test(self):
        """Run sandbox tests for all platforms"""
        
        print("\n" + "="*60)
        print("🚀 COMPREHENSIVE SANDBOX TESTING")
        print("="*60)
        
        all_results = []
        
        platforms = [
            ('linkedin', 'market_insight'),
            ('twitter', 'quick_tip'),
            ('telegram', 'trading_strategy')
        ]
        
        for platform, content_type in platforms:
            result = self.run_sandbox_test(platform, content_type, iterations=3)
            all_results.append(result)
            
            if result['final_content']:
                print(f"\n📄 Final {platform} content (first 200 chars):")
                print(result['final_content'][:200] + "...")
        
        # Summary report
        print("\n" + "="*60)
        print("📊 SANDBOX LEARNING REPORT")
        print("="*60)
        
        total_issues = sum(r['total_issues_found'] for r in all_results)
        total_fixed = sum(r['total_issues_fixed'] for r in all_results)
        
        print(f"\n📈 Overall Statistics:")
        print(f"  Total Issues Found: {total_issues}")
        print(f"  Total Issues Fixed: {total_fixed}")
        print(f"  Fix Rate: {(total_fixed/total_issues*100 if total_issues else 0):.1f}%")
        
        print(f"\n🎯 Most Common Issues:")
        top_issues = sorted(self.issue_patterns.items(), 
                          key=lambda x: x[1], reverse=True)[:5]
        for issue_type, count in top_issues:
            print(f"  - {issue_type.replace('_', ' ').title()}: {count} times")
        
        print(f"\n💡 Learning Insights:")
        if self.improvements:
            recent = self.improvements[-3:]
            for imp in recent:
                print(f"  - {imp['platform']}: Fixed {imp['issues_fixed']} issues, "
                      f"engagement {imp['engagement_before']}→?")
        
        # Save comprehensive results
        with open('sandbox_test_results.json', 'w') as f:
            json.dump({
                'test_date': datetime.now().isoformat(),
                'platforms_tested': [r['platform'] for r in all_results],
                'total_issues_found': total_issues,
                'total_issues_fixed': total_fixed,
                'results': all_results
            }, f, indent=2, default=str)
        
        print("\n✅ Sandbox testing complete! Results saved.")
        return all_results
    
    def get_learning_summary(self) -> Dict:
        """Get summary of what the system has learned"""
        
        summary = {
            'total_tests': len(self.learning_history),
            'total_improvements': len(self.improvements),
            'common_issues': dict(sorted(self.issue_patterns.items(), 
                                       key=lambda x: x[1], reverse=True)[:10]),
            'average_iterations_needed': 0,
            'platforms_tested': defaultdict(int)
        }
        
        if self.learning_history:
            iterations = [h['iterations_needed'] for h in self.learning_history]
            summary['average_iterations_needed'] = sum(iterations) / len(iterations)
            
            for h in self.learning_history:
                summary['platforms_tested'][h['platform']] += 1
        
        return summary


def main():
    """Main execution"""
    sandbox = ContentSandboxLearner()
    
    # Run comprehensive test
    results = sandbox.run_comprehensive_test()
    
    # Show learning summary
    print("\n" + "="*60)
    print("🧠 LEARNING SUMMARY")
    print("="*60)
    
    summary = sandbox.get_learning_summary()
    print(f"\nTotal Tests Run: {summary['total_tests']}")
    print(f"Total Improvements Made: {summary['total_improvements']}")
    print(f"Average Iterations Needed: {summary['average_iterations_needed']:.1f}")
    
    print("\nTests by Platform:")
    for platform, count in summary['platforms_tested'].items():
        print(f"  {platform}: {count} tests")
    
    print("\n🎯 The system is learning and improving with each test!")


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Simplified Content Sandbox - Fast issue detection and learning
"""

import os
import re
import json
from datetime import datetime
from typing import Dict, List
from content_quality_system import ContentQualitySystem
from dotenv import load_dotenv

load_dotenv()

class SimpleSandbox:
    """Lightweight sandbox for testing content issues"""
    
    def __init__(self):
        self.quality_system = ContentQualitySystem()
        self.test_results = []
        
    def quick_issue_scan(self, content: str) -> Dict:
        """Fast scan for common issues"""
        
        issues = {
            'critical': [],
            'warnings': [],
            'score': 100
        }
        
        # CRITICAL: Visual references (your main complaint)
        visual_patterns = [
            r'\bVisual:',
            r'\[Image\]', r'\[Chart\]', r'\[Graph\]', 
            r'\[Infographic\]', r'\[Screenshot\]',
            r'See the chart', r'As shown in', r'Look at the graph'
        ]
        
        for pattern in visual_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                issues['critical'].append(f"Found: {pattern}")
                issues['score'] -= 20
        
        # CRITICAL: Repetitive loss stories (your second complaint)
        loss_count = len(re.findall(r'lost?\s+\d+%', content, re.IGNORECASE))
        if loss_count > 2:
            issues['critical'].append(f"Too many loss stories ({loss_count} found)")
            issues['score'] -= 15
        
        # WARNING: Fake urgency/numbers
        fake_patterns = [
            (r'\d+\s+spots?\s+left', 'Fake scarcity'),
            (r'Join\s+\d+\+?\s+investors?', 'Fake community numbers'),
            (r'Last\s+(day|chance)', 'False urgency'),
            (r'Limited\s+time', 'Time pressure tactics'),
        ]
        
        for pattern, desc in fake_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                issues['warnings'].append(desc)
                issues['score'] -= 10
        
        # WARNING: Quality issues
        if content.strip().endswith('...') and 'Read more' not in content:
            issues['warnings'].append("Content appears truncated")
            issues['score'] -= 5
            
        hashtags = re.findall(r'#\w+', content)
        if len(hashtags) != len(set(hashtags)):
            issues['warnings'].append("Duplicate hashtags")
            issues['score'] -= 5
        
        issues['score'] = max(0, issues['score'])
        return issues
    
    def test_single_platform(self, platform: str) -> Dict:
        """Test content generation for one platform"""
        
        print(f"\n🧪 Testing {platform.upper()}...")
        
        # Generate content
        result = self.quality_system.create_content(platform)
        
        if not result.get('success'):
            return {
                'platform': platform,
                'success': False,
                'error': 'Generation failed'
            }
        
        content = result['content']
        
        # Scan for issues
        issues = self.quick_issue_scan(content)
        
        # Display results
        print(f"\n📋 Content Preview (first 150 chars):")
        print(f"   {content[:150]}...")
        
        print(f"\n🎯 Quality Score: {issues['score']}/100")
        
        if issues['critical']:
            print(f"\n🔴 CRITICAL ISSUES:")
            for issue in issues['critical']:
                print(f"   - {issue}")
        
        if issues['warnings']:
            print(f"\n🟡 WARNINGS:")
            for warning in issues['warnings']:
                print(f"   - {warning}")
        
        if not issues['critical'] and not issues['warnings']:
            print("✅ No issues found!")
        
        return {
            'platform': platform,
            'success': True,
            'content': content,
            'issues': issues,
            'quality_score': result.get('quality_score', 0),
            'sandbox_score': issues['score']
        }
    
    def run_sandbox_tests(self):
        """Run tests for all platforms"""
        
        print("\n" + "="*60)
        print("🚀 CONTENT SANDBOX TESTING")
        print("="*60)
        print("\nThis sandbox will:")
        print("1. Generate content for each platform")
        print("2. Detect visual references and repetitive patterns")
        print("3. Score content quality")
        print("4. Show specific issues to fix")
        
        platforms = ['linkedin', 'twitter', 'telegram']
        results = []
        
        for platform in platforms:
            result = self.test_single_platform(platform)
            results.append(result)
            self.test_results.append(result)
        
        # Summary
        print("\n" + "="*60)
        print("📊 SANDBOX SUMMARY")
        print("="*60)
        
        total_critical = 0
        total_warnings = 0
        
        for r in results:
            if r.get('success'):
                critical = len(r['issues']['critical'])
                warnings = len(r['issues']['warnings'])
                total_critical += critical
                total_warnings += warnings
                
                status = "✅ CLEAN" if critical == 0 else "🔴 NEEDS FIX"
                print(f"\n{r['platform'].upper()}: {status}")
                print(f"  Quality Score: {r['quality_score']}/10")
                print(f"  Sandbox Score: {r['sandbox_score']}/100")
                print(f"  Critical Issues: {critical}")
                print(f"  Warnings: {warnings}")
        
        print(f"\n📈 TOTAL ISSUES FOUND:")
        print(f"  Critical: {total_critical}")
        print(f"  Warnings: {total_warnings}")
        
        # Save results
        with open('sandbox_results.json', 'w') as f:
            json.dump({
                'test_date': datetime.now().isoformat(),
                'results': results,
                'summary': {
                    'total_critical': total_critical,
                    'total_warnings': total_warnings
                }
            }, f, indent=2, default=str)
        
        print("\n✅ Results saved to sandbox_results.json")
        
        # Recommendations
        if total_critical > 0:
            print("\n⚠️ CRITICAL FIXES NEEDED:")
            print("1. Remove ALL 'Visual:' references")
            print("2. Never mention charts/graphs/images")
            print("3. Reduce repetitive loss stories")
            print("4. Use varied content themes")
        
        return results
    
    def show_problem_examples(self):
        """Show examples of problematic content"""
        
        print("\n" + "="*60)
        print("❌ EXAMPLES OF ISSUES TO AVOID")
        print("="*60)
        
        bad_examples = [
            ("Visual Reference", "Visual: Market trends showing...", 
             "The market trends indicate..."),
            
            ("Placeholder", "[Chart showing Nifty performance]", 
             "Nifty has moved 5% this week"),
            
            ("Repetitive Loss", "He lost 30% in stocks, lost 20% in crypto, lost 15% in forex",
             "Portfolio diversification across assets showed mixed results"),
            
            ("Fake Urgency", "Only 7 spots left! Join 10,247 investors",
             "Learn proven investment strategies"),
            
            ("Truncation", "The key to successful investing is...",
             "The key to successful investing is patience and research")
        ]
        
        for issue_type, bad, good in bad_examples:
            print(f"\n🔴 {issue_type}:")
            print(f"   BAD:  {bad}")
            print(f"   GOOD: {good}")


def main():
    """Run the sandbox"""
    sandbox = SimpleSandbox()
    
    # Show what to avoid
    sandbox.show_problem_examples()
    
    # Run tests
    results = sandbox.run_sandbox_tests()
    
    # Final message
    print("\n💡 TIP: Run this sandbox before deploying to catch issues early!")


if __name__ == "__main__":
    main()
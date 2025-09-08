#!/usr/bin/env python3
"""
Content Validation Rules Engine
Enforces learned quality rules across all content generation
"""

import re
from typing import Dict, List, Tuple, Any
import json
from datetime import datetime

class ContentValidationRules:
    """Centralized validation rules based on learnings"""
    
    def __init__(self):
        # Load learned patterns from sandbox testing
        self.load_learned_patterns()
        
    def load_learned_patterns(self):
        """Load patterns we've learned to avoid"""
        
        # CRITICAL: Must never appear
        self.critical_patterns = [
            # Visual references (your #1 complaint)
            (r'\bVisual:\s*', 'visual_reference', 'Contains "Visual:" reference'),
            (r'\[Image[^\]]*\]', 'image_placeholder', 'Contains image placeholder'),
            (r'\[Chart[^\]]*\]', 'chart_placeholder', 'Contains chart placeholder'),
            (r'\[Graph[^\]]*\]', 'graph_placeholder', 'Contains graph placeholder'),
            (r'\[Infographic[^\]]*\]', 'infographic_placeholder', 'Contains infographic placeholder'),
            (r'See the chart', 'chart_reference', 'References non-existent chart'),
            (r'As shown in the graph', 'graph_reference', 'References non-existent graph'),
            (r'Look at the visual', 'visual_reference', 'References non-existent visual'),
            
            # Fake urgency and numbers
            (r'\d+\s+spots?\s+left', 'fake_scarcity', 'Contains fake scarcity'),
            (r'Join\s+\d+\+?\s+(investors?|traders?)', 'fake_community', 'Contains fake community numbers'),
            (r'Last\s+(day|chance|opportunity)\s+to', 'fake_urgency', 'Contains false urgency'),
            (r'Expires?\s+in\s+\d+\s+(hours?|days?)', 'fake_deadline', 'Contains fake deadline'),
        ]
        
        # WARNING: Should be avoided
        self.warning_patterns = [
            # Repetitive patterns (your #2 complaint)
            (r'(lost\s+\d+%.*){3,}', 'repetitive_losses', 'Too many loss stories'),
            (r'(gained\s+\d+%.*){4,}', 'repetitive_gains', 'Too many gain stories'),
            
            # Generic openings
            (r'^In today\'s market', 'generic_opening', 'Generic opening'),
            (r'^As we all know', 'weak_opening', 'Weak opening'),
            
            # Truncation
            (r'\.\.\.$(?!.*Read more)', 'truncated_content', 'Content appears truncated'),
        ]
        
        # Required elements
        self.required_elements = {
            'specific_data': (r'\d+\.?\d*[%₹$€]|\₹\d+|\$\d+', 'Must include specific numbers'),
            'actionable': (r'(consider|explore|review|analyze|invest|allocate)', 'Must include actionable advice'),
        }
        
        # Platform-specific limits
        self.platform_limits = {
            'twitter': 280,
            'linkedin': 1300,
            'telegram': 2000
        }
    
    def validate_content(self, content: str, platform: str) -> Tuple[bool, List[Dict]]:
        """
        Validate content against all rules
        Returns: (is_valid, list_of_issues)
        """
        issues = []
        
        # Check critical patterns - ANY match = FAIL
        for pattern, issue_type, description in self.critical_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                issues.append({
                    'severity': 'CRITICAL',
                    'type': issue_type,
                    'description': description,
                    'action': 'MUST FIX before posting'
                })
        
        # Check warning patterns
        for pattern, issue_type, description in self.warning_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                issues.append({
                    'severity': 'WARNING',
                    'type': issue_type,
                    'description': description,
                    'action': 'Should improve'
                })
        
        # Check required elements
        for element, (pattern, description) in self.required_elements.items():
            if not re.search(pattern, content):
                issues.append({
                    'severity': 'WARNING',
                    'type': f'missing_{element}',
                    'description': description,
                    'action': 'Add specific data'
                })
        
        # Check platform limits
        if platform in self.platform_limits:
            limit = self.platform_limits[platform]
            if len(content) > limit:
                issues.append({
                    'severity': 'CRITICAL',
                    'type': 'exceeds_limit',
                    'description': f'Exceeds {platform} limit ({len(content)}/{limit} chars)',
                    'action': 'MUST shorten content'
                })
        
        # Check for duplicate hashtags
        hashtags = re.findall(r'#\w+', content)
        if len(hashtags) != len(set(hashtags)):
            duplicates = [h for h in hashtags if hashtags.count(h) > 1]
            issues.append({
                'severity': 'WARNING',
                'type': 'duplicate_hashtags',
                'description': f'Duplicate hashtags: {set(duplicates)}',
                'action': 'Remove duplicates'
            })
        
        # Determine if content is valid
        has_critical = any(i['severity'] == 'CRITICAL' for i in issues)
        is_valid = not has_critical
        
        return is_valid, issues
    
    def auto_fix_content(self, content: str, issues: List[Dict]) -> str:
        """Automatically fix common issues"""
        
        fixed_content = content
        
        for issue in issues:
            if issue['type'] == 'visual_reference':
                # Remove Visual: references
                fixed_content = re.sub(r'\bVisual:\s*[^\n.!?]*[.!?]?\s*', '', fixed_content)
            
            elif issue['type'] in ['image_placeholder', 'chart_placeholder', 'graph_placeholder']:
                # Remove placeholders
                fixed_content = re.sub(r'\[[^\]]+\]', '', fixed_content)
            
            elif issue['type'] == 'duplicate_hashtags':
                # Remove duplicate hashtags
                hashtags = re.findall(r'#\w+', fixed_content)
                seen = set()
                for tag in hashtags:
                    if tag in seen:
                        # Remove the duplicate, keep the first occurrence
                        fixed_content = fixed_content.replace(tag, '', 1)
                    seen.add(tag)
            
            elif issue['type'] == 'truncated_content':
                # Remove trailing ellipsis if not intentional
                if fixed_content.strip().endswith('...'):
                    fixed_content = fixed_content.rstrip('.') + '.'
        
        # Clean up extra spaces
        fixed_content = re.sub(r'\s+', ' ', fixed_content).strip()
        
        return fixed_content
    
    def get_improvement_prompt(self, issues: List[Dict]) -> str:
        """Generate specific instructions to fix issues"""
        
        instructions = []
        
        critical_issues = [i for i in issues if i['severity'] == 'CRITICAL']
        warning_issues = [i for i in issues if i['severity'] == 'WARNING']
        
        if critical_issues:
            instructions.append("CRITICAL FIXES REQUIRED:")
            for issue in critical_issues:
                instructions.append(f"- {issue['action']}: {issue['description']}")
        
        if warning_issues:
            instructions.append("\nIMPROVEMENTS NEEDED:")
            for issue in warning_issues:
                instructions.append(f"- {issue['action']}: {issue['description']}")
        
        instructions.append("\nREMEMBER:")
        instructions.append("- NEVER mention visuals, charts, or images")
        instructions.append("- Include specific numbers and data points")
        instructions.append("- Vary content themes (not just losses)")
        instructions.append("- Make content actionable")
        
        return "\n".join(instructions)


class LearningIntegrator:
    """Integrates learnings into the content pipeline"""
    
    def __init__(self):
        self.validator = ContentValidationRules()
        self.learning_log = []
        self.improvement_history = []
        
    def validate_and_improve(self, content: str, platform: str, 
                            max_attempts: int = 3) -> Dict:
        """
        Validate content and improve if needed
        Returns final content and validation status
        """
        
        attempt = 0
        current_content = content
        all_issues = []
        
        while attempt < max_attempts:
            attempt += 1
            
            # Validate
            is_valid, issues = self.validator.validate_content(current_content, platform)
            all_issues.extend(issues)
            
            if is_valid and not issues:
                # Perfect content!
                return {
                    'success': True,
                    'content': current_content,
                    'attempts': attempt,
                    'issues_found': 0,
                    'status': 'APPROVED'
                }
            
            if is_valid and issues:
                # Has warnings but acceptable
                # Try to auto-fix minor issues
                fixed = self.validator.auto_fix_content(current_content, issues)
                
                return {
                    'success': True,
                    'content': fixed,
                    'attempts': attempt,
                    'issues_found': len(issues),
                    'issues_fixed': len(issues),
                    'status': 'APPROVED_WITH_FIXES'
                }
            
            # Has critical issues - must fix
            if attempt < max_attempts:
                # Auto-fix what we can
                current_content = self.validator.auto_fix_content(current_content, issues)
                
                # Log the learning
                self.log_learning(platform, issues, attempt)
            
        # Failed after max attempts
        return {
            'success': False,
            'content': current_content,
            'attempts': attempt,
            'issues_found': len(all_issues),
            'critical_issues': [i for i in all_issues if i['severity'] == 'CRITICAL'],
            'status': 'REJECTED'
        }
    
    def log_learning(self, platform: str, issues: List[Dict], attempt: int):
        """Log what we learned from this validation"""
        
        learning_entry = {
            'timestamp': datetime.now().isoformat(),
            'platform': platform,
            'attempt': attempt,
            'issues': issues,
            'issue_types': list(set(i['type'] for i in issues))
        }
        
        self.learning_log.append(learning_entry)
        
        # Save to file for persistence
        self.save_learnings()
    
    def save_learnings(self):
        """Save learnings to file"""
        
        try:
            with open('content_learnings.json', 'w') as f:
                json.dump({
                    'learning_log': self.learning_log[-100:],  # Keep last 100
                    'last_updated': datetime.now().isoformat()
                }, f, indent=2, default=str)
        except:
            pass
    
    def get_learning_summary(self) -> Dict:
        """Get summary of what we've learned"""
        
        if not self.learning_log:
            return {'message': 'No learnings yet'}
        
        issue_counts = {}
        platform_counts = {}
        
        for entry in self.learning_log:
            platform_counts[entry['platform']] = platform_counts.get(entry['platform'], 0) + 1
            for issue_type in entry.get('issue_types', []):
                issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1
        
        return {
            'total_validations': len(self.learning_log),
            'platforms': platform_counts,
            'common_issues': dict(sorted(issue_counts.items(), 
                                       key=lambda x: x[1], reverse=True)[:5]),
            'last_validation': self.learning_log[-1]['timestamp'] if self.learning_log else None
        }


def test_validation():
    """Test the validation system"""
    
    print("\n" + "="*60)
    print("🧪 TESTING CONTENT VALIDATION RULES")
    print("="*60)
    
    integrator = LearningIntegrator()
    
    # Test cases with known issues
    test_cases = [
        {
            'platform': 'linkedin',
            'content': "Visual: Market trends showing bullish patterns [Chart] Join 10,000+ investors!",
            'expected': 'CRITICAL'
        },
        {
            'platform': 'twitter',
            'content': "Nifty up 5% today! Smart money is moving into IT stocks. Time to review your portfolio. #Nifty #Stocks",
            'expected': 'APPROVED'
        },
        {
            'platform': 'telegram',
            'content': "He lost 30% in stocks, lost 20% in crypto, lost 15% in forex, lost everything...",
            'expected': 'WARNING'
        }
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}: {test['platform']}")
        print(f"Content: {test['content'][:100]}...")
        
        result = integrator.validate_and_improve(
            test['content'], 
            test['platform']
        )
        
        print(f"Status: {result['status']}")
        print(f"Issues Found: {result.get('issues_found', 0)}")
        
        if result['status'] != 'APPROVED' and result.get('critical_issues'):
            print("Critical Issues:")
            for issue in result['critical_issues'][:3]:
                print(f"  - {issue['description']}")
    
    # Show learning summary
    print("\n" + "="*60)
    print("📊 LEARNING SUMMARY")
    print("="*60)
    
    summary = integrator.get_learning_summary()
    print(f"Total Validations: {summary.get('total_validations', 0)}")
    if summary.get('common_issues'):
        print("Most Common Issues:")
        for issue_type, count in summary['common_issues'].items():
            print(f"  - {issue_type}: {count} times")


if __name__ == "__main__":
    test_validation()
#!/usr/bin/env python3
"""
Simplified Multi-Agent Content Quality System
Professional content creation with quality gates (lightweight version)
"""

import os
import json
import re
from datetime import datetime
from typing import Dict, List, Any
from coherent_content_generator import CoherentContentGenerator
from engagement_optimizer_v2 import EngagementOptimizerV2
from content_validation_rules import LearningIntegrator
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class ContentQualitySystem:
    """Lightweight multi-agent content creation system"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.generator = CoherentContentGenerator()
        self.optimizer = EngagementOptimizerV2()
        self.learning_integrator = LearningIntegrator()  # Add validation integration
        
    def research_agent(self, platform: str, content_type: str) -> str:
        """Research Agent - Gathers market insights"""
        current_date = datetime.now().strftime("%B %Y")
        prompt = f"""You are a Market Research Analyst for Indian financial markets.
        Current Date: {current_date}
        
        Task: Identify a compelling topic for {platform} content ({content_type}).
        
        IMPORTANT: Use ONLY current date ({current_date}) in your content. Do NOT use old dates like 2023.
        
        Provide:
        1. Current market trend or event (as of {current_date})
        2. Real, specific data points (percentages, prices) - use realistic current market levels
        3. Key insight that others might miss
        4. Actionable angle for investors
        
        Format: Brief research report (100 words max)"""
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200
        )
        
        return response.choices[0].message.content.strip()
    
    def junior_writer_agent(self, research: str, platform: str, content_type: str) -> str:
        """Junior Writer Agent - Creates first draft"""
        current_date = datetime.now().strftime("%B %Y")
        prompt = f"""You are a Junior Financial Content Writer.
        Current Date: {current_date}
        
        Research Brief: {research}
        
        Task: Write a first draft for {platform} ({content_type}).
        
        STRICT Requirements:
        - Use ONLY current date ({current_date}) - NO old dates like 2023 or September 2023
        - Use the specific data from research
        - Clear structure with intro, body, conclusion
        - Include real, current market numbers (Nifty around 26000, Sensex around 85000)
        - Appropriate length for {platform}
        - NO placeholders like [Image], [Chart], or "Visual:"
        - NO fake numbers or "Join X subscribers"
        - NO repetitive loss stories
        - Focus on opportunities and insights, not just problems
        
        Write the draft:"""
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content.strip()
    
    def senior_writer_agent(self, draft: str, platform: str) -> str:
        """Senior Writer Agent - Enhances content"""
        current_date = datetime.now().strftime("%B %Y")
        prompt = f"""You are a Senior Financial Content Strategist.
        Current Date: {current_date}
        
        Draft to enhance: {draft}
        
        Task: Transform this into engaging, insightful {platform} content.
        
        STRICT Improvements needed:
        - Ensure all dates are current ({current_date}) - fix any old dates
        - Add personal insight or unique angle
        - Include a compelling hook that's relevant to TODAY's market
        - Make it conversational and authentic
        - Add specific call-to-action (no fake numbers or urgency)
        - Ensure it feels valuable and timely
        - Remove any "Visual:" references or placeholders
        - Focus on opportunities, not repetitive loss stories
        
        Enhanced version:"""
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=600
        )
        
        return response.choices[0].message.content.strip()
    
    def editor_agent(self, content: str, platform: str) -> str:
        """Editor Agent - Polish and optimize"""
        current_date = datetime.now().strftime("%B %Y")
        
        platform_limits = {
            'linkedin': 1300,
            'twitter': 280,
            'telegram': 2000
        }
        
        prompt = f"""You are a Content Editor specializing in financial content.
        Current Date: {current_date}
        
        Content to edit: {content}
        
        Task: Final edit for {platform} (max {platform_limits.get(platform, 1000)} chars).
        
        STRICT Requirements:
        - Update ANY old dates (like 2023, September 2023) to current ({current_date})
        - Remove ANY placeholder text ([Image], [Chart], "Visual:", etc.)
        - Remove fake urgency ("Last day", "97 spots left")
        - Fix any duplicate hashtags
        - Ensure factual accuracy with current market levels
        - Use current Nifty (~26000) and Sensex (~85000) levels
        - Optimize for {platform} best practices
        - Keep it under character limit
        
        Final edited version:"""
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=400
        )
        
        edited = response.choices[0].message.content.strip()
        
        # Enforce character limit
        max_chars = platform_limits.get(platform, 1000)
        if len(edited) > max_chars:
            edited = edited[:max_chars-3] + "..."
            
        return edited
    
    def qa_agent(self, content: str) -> Dict:
        """QA Agent - Quality scoring and validation"""
        
        score = 10
        issues = []
        
        # Check for placeholders
        placeholder_patterns = [
            r'\[.*?\]',  # Any text in brackets
            r'\(.*?spots left.*?\)',  # Fake scarcity
            r'Join \d+.*?investors',  # Fake numbers
            r'Top post in r/',  # Reddit references
            'Last day to act',  # Vague urgency
            'Visual:',  # Visual references without images
        ]
        
        for pattern in placeholder_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                issues.append(f"Contains problematic pattern: {pattern}")
                score -= 2
        
        # Check for duplicate hashtags
        hashtags = re.findall(r'#\w+', content)
        if len(hashtags) != len(set(hashtags)):
            issues.append("Duplicate hashtags found")
            score -= 1
        
        # Check for specific data
        has_numbers = bool(re.search(r'\d+\.?\d*%?', content))
        if not has_numbers:
            issues.append("No specific data or numbers")
            score -= 2
        
        # Check content quality
        if len(content) < 50:
            issues.append("Content too short")
            score -= 3
        
        # Check for spammy elements
        spam_words = ['FREE', 'URGENT', 'LIMITED TIME', 'ACT NOW']
        for word in spam_words:
            if word in content.upper():
                issues.append(f"Contains spammy word: {word}")
                score -= 1
        
        # Use GPT for semantic quality check
        prompt = f"""Rate this financial content from 1-10 for:
        1. Accuracy and credibility
        2. Value to readers
        3. Professionalism
        
        Content: {content}
        
        Provide only a number (1-10):"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=10
            )
            
            gpt_score = int(re.search(r'\d+', response.choices[0].message.content).group())
            
            # Average with rule-based score
            final_score = (max(0, score) + gpt_score) / 2
            
        except:
            final_score = max(0, score)
        
        return {
            'score': round(final_score, 1),
            'issues': issues,
            'passed': final_score >= 7,
            'recommendation': 'Approve for publishing' if final_score >= 7 else 'Needs revision'
        }
    
    def create_content(self, platform: str, content_type: str = 'market_insight') -> Dict:
        """Create content through multi-agent pipeline"""
        
        print(f"\n{'='*60}")
        print(f"🚀 MULTI-AGENT CONTENT CREATION - {platform.upper()}")
        print(f"{'='*60}")
        
        try:
            # Step 1: Research
            print("\n📊 Research Agent working...")
            research = self.research_agent(platform, content_type)
            print(f"✓ Research complete: {research[:100]}...")
            
            # Step 2: First Draft
            print("\n✍️ Junior Writer creating draft...")
            draft = self.junior_writer_agent(research, platform, content_type)
            print(f"✓ Draft complete: {len(draft)} chars")
            
            # Step 3: Enhancement
            print("\n🎨 Senior Writer enhancing...")
            enhanced = self.senior_writer_agent(draft, platform)
            print(f"✓ Enhanced: {len(enhanced)} chars")
            
            # Step 4: Editing
            print("\n📝 Editor polishing...")
            final_content = self.editor_agent(enhanced, platform)
            print(f"✓ Edited: {len(final_content)} chars")
            
            # Step 5: Quality Check
            print("\n🔍 QA Agent reviewing...")
            qa_result = self.qa_agent(final_content)
            
            # Step 6: Learning Integration - Validate and Auto-fix
            print("\n🎓 Applying learned validation rules...")
            validation_result = self.learning_integrator.validate_and_improve(
                final_content, platform
            )
            
            if validation_result['success'] and qa_result['passed']:
                final_content = validation_result['content']  # Use improved version
                print(f"✅ APPROVED - Score: {qa_result['score']}/10")
                print(f"   Validation: {validation_result['status']}")
                if validation_result.get('issues_fixed', 0) > 0:
                    print(f"   Auto-fixed {validation_result['issues_fixed']} issues")
                
                # Calculate engagement (simplified)
                engagement = len(final_content) * 2.5  # Simple engagement metric
                
                return {
                    'success': True,
                    'content': final_content,
                    'quality_score': qa_result['score'],
                    'engagement_score': engagement,
                    'platform': platform,
                    'content_type': content_type,
                    'validation_status': validation_result['status'],
                    'issues_fixed': validation_result.get('issues_fixed', 0),
                    'timestamp': datetime.now().isoformat()
                }
            else:
                print(f"❌ REJECTED - Score: {qa_result['score']}/10")
                print("Issues found:")
                for issue in qa_result['issues']:
                    print(f"  - {issue}")
                
                return {
                    'success': False,
                    'content': final_content,
                    'quality_score': qa_result['score'],
                    'issues': qa_result['issues'],
                    'platform': platform
                }
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return {
                'success': False,
                'error': str(e),
                'platform': platform
            }
    
    def test_system(self):
        """Test the multi-agent system"""
        print("\n" + "="*60)
        print("🧪 TESTING MULTI-AGENT QUALITY SYSTEM")
        print("="*60)
        
        results = []
        
        # Test different platforms
        tests = [
            ('linkedin', 'market_insight'),
            ('twitter', 'quick_tip'),
            ('telegram', 'trading_strategy')
        ]
        
        for platform, content_type in tests:
            print(f"\n{'='*40}")
            print(f"Testing {platform} - {content_type}")
            print('='*40)
            
            result = self.create_content(platform, content_type)
            results.append(result)
            
            if result.get('success'):
                print(f"\n📄 Generated Content:")
                print(f"{result['content'][:200]}...")
        
        # Summary
        print("\n" + "="*60)
        print("📊 TEST RESULTS SUMMARY")
        print("="*60)
        
        for result in results:
            platform = result.get('platform', 'Unknown')
            if result.get('success'):
                print(f"✅ {platform}: Score {result.get('quality_score')}/10, "
                      f"Engagement {result.get('engagement_score', 0):.1f}x")
            else:
                print(f"❌ {platform}: Failed - Score {result.get('quality_score', 0)}/10")
        
        return results


def main():
    """Main execution"""
    system = ContentQualitySystem()
    
    # Test the system
    results = system.test_system()
    
    # Save results
    with open('content_quality_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print("\n✅ Test complete! Results saved to content_quality_test_results.json")
    
    # Show sample of best content
    best_result = max([r for r in results if r.get('success', False)], 
                     key=lambda x: x.get('quality_score', 0),
                     default=None)
    
    if best_result:
        print(f"\n🏆 Best Content (Score: {best_result['quality_score']}/10):")
        print("-" * 40)
        print(best_result['content'])
        print("-" * 40)


if __name__ == "__main__":
    main()
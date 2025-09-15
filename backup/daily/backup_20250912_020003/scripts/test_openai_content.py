#!/usr/bin/env python3
"""
Test OpenAI Content Generation Integration
Tests AI-powered content creation with compliance checks
"""

import os
import json
import openai
from datetime import datetime
from dotenv import load_dotenv
from automated_posting_system import AutomatedPostingSystem

# Load environment variables
load_dotenv()

class OpenAIContentTester:
    def __init__(self):
        self.openai_key = os.getenv('OPENAI_API_KEY')
        if self.openai_key:
            openai.api_key = self.openai_key
        
        self.posting_system = AutomatedPostingSystem()
        
        # Content generation prompts
        self.prompts = {
            'market_update': """Generate a concise Indian stock market update for social media.
            Include:
            - Current Nifty 50 trend (use realistic levels around 19,500-20,000)
            - One key sector in focus
            - Brief outlook
            
            Requirements:
            - Under 250 characters
            - Include relevant hashtags
            - Professional but engaging tone
            - Add FINRA-style disclaimer at end
            
            Format for multi-platform posting.""",
            
            'educational': """Create educational financial content about SIP investments.
            Include:
            - Simple explanation
            - Key benefits
            - Getting started tip
            
            Requirements:
            - Under 280 characters for Twitter compatibility
            - Beginner-friendly language
            - Include hashtags
            - Compliance disclaimer
            
            Target audience: New investors in India.""",
            
            'technical_analysis': """Generate technical analysis content for Indian stocks.
            Focus on:
            - Support/resistance levels for Nifty 50
            - Key technical indicators
            - Trading outlook
            
            Requirements:
            - Under 260 characters
            - Include specific levels (use realistic numbers)
            - Technical hashtags
            - Risk disclaimer
            
            Professional trader audience.""",
            
            'news_commentary': """Create commentary on RBI monetary policy impact.
            Include:
            - Policy change summary
            - Market impact
            - Investor implications
            
            Requirements:
            - Under 270 characters
            - Balanced perspective
            - Include hashtags
            - Educational disclaimer
            
            For retail investors."""
        }
        
        # Compliance keywords to check for
        self.compliance_checks = {
            'required_disclaimers': [
                'disclaimer', 'educational', 'not investment advice', 
                'consult', 'sebi', 'finra', 'risk'
            ],
            'forbidden_words': [
                'guaranteed', 'sure shot', 'no risk', 'certain profit',
                'foolproof', 'never lose', 'guaranteed returns'
            ],
            'financial_advice_flags': [
                'buy now', 'sell immediately', 'must buy', 'urgent sell',
                'hot tip', 'insider', 'guaranteed winner'
            ]
        }
    
    def generate_content_with_openai(self, prompt_type):
        """Generate content using OpenAI API"""
        if not self.openai_key:
            print("⚠️ OpenAI API key not found, using fallback content")
            return self.get_fallback_content(prompt_type)
        
        try:
            prompt = self.prompts[prompt_type]
            
            response = openai.ChatCompletion.create(
                model='gpt-3.5-turbo',
                messages=[{
                    'role': 'system',
                    'content': 'You are a professional financial content creator for Indian markets. Always include appropriate disclaimers.'
                }, {
                    'role': 'user',
                    'content': prompt
                }],
                max_tokens=150,
                temperature=0.7
            )
            
            content = response.choices[0].message.content.strip()
            
            print(f"✅ OpenAI generated content for {prompt_type}")
            return content
            
        except Exception as e:
            print(f"❌ OpenAI API Error: {e}")
            return self.get_fallback_content(prompt_type)
    
    def get_fallback_content(self, prompt_type):
        """Fallback content if OpenAI is unavailable"""
        fallback_content = {
            'market_update': f"""📊 Market Update - {datetime.now().strftime('%d %b')}

Nifty 50 trading near 19,650 levels with IT sector showing strength. Banking stocks consolidating after recent gains.

Outlook: Cautiously optimistic with support at 19,500.

⚠️ For educational purposes only. Not investment advice.

#Nifty50 #StockMarket #AIFinance""",

            'educational': f"""💡 SIP Investing Made Simple

Systematic Investment Plan (SIP) allows you to invest fixed amounts regularly in mutual funds.

Benefits: Rupee cost averaging, disciplined investing, compounding growth.

Start small, stay consistent! 

⚠️ Consult SEBI-registered advisor.

#SIP #MutualFunds #Investment""",

            'technical_analysis': f"""📈 Technical Outlook - Nifty 50

Current Level: 19,650
Support: 19,500
Resistance: 19,850

RSI showing neutral at 52. Volume above average. 

Next target: 20,000 on breakout.

⚠️ Technical analysis for education. Trade at your own risk.

#TechnicalAnalysis #Trading""",

            'news_commentary': f"""🏦 RBI Policy Impact Analysis

Recent policy stance maintains accommodative approach. Banking sector likely to benefit from stable rates.

Market impact: Positive for interest-sensitive sectors.

⚠️ Analysis for educational purposes. Consult financial advisor.

#RBIPolicy #Banking #MarketAnalysis"""
        }
        
        return fallback_content.get(prompt_type, "Content generation failed")
    
    def check_compliance(self, content):
        """Check content for compliance with financial regulations"""
        compliance_score = 100
        issues = []
        warnings = []
        
        content_lower = content.lower()
        
        # Check for required disclaimers
        has_disclaimer = any(word in content_lower for word in self.compliance_checks['required_disclaimers'])
        if not has_disclaimer:
            compliance_score -= 30
            issues.append("Missing required disclaimer")
        
        # Check for forbidden words
        forbidden_found = [word for word in self.compliance_checks['forbidden_words'] if word in content_lower]
        if forbidden_found:
            compliance_score -= 50
            issues.append(f"Contains forbidden words: {', '.join(forbidden_found)}")
        
        # Check for financial advice flags
        advice_flags = [word for word in self.compliance_checks['financial_advice_flags'] if word in content_lower]
        if advice_flags:
            compliance_score -= 25
            warnings.append(f"May constitute financial advice: {', '.join(advice_flags)}")
        
        # Check content length for platforms
        if len(content) > 280:
            warnings.append("Content exceeds Twitter character limit")
        
        return {
            'score': max(0, compliance_score),
            'issues': issues,
            'warnings': warnings,
            'has_disclaimer': has_disclaimer,
            'safe_to_post': compliance_score >= 70 and not issues
        }
    
    def test_content_generation(self):
        """Test content generation for all types"""
        print("🤖 AI CONTENT GENERATION TEST")
        print("="*50)
        
        results = {}
        
        for prompt_type in self.prompts.keys():
            print(f"\n📝 Testing {prompt_type.upper().replace('_', ' ')}")
            print("-" * 40)
            
            # Generate content
            content = self.generate_content_with_openai(prompt_type)
            
            # Check compliance
            compliance = self.check_compliance(content)
            
            # Display results
            print(f"Content Length: {len(content)} characters")
            print(f"Compliance Score: {compliance['score']}/100")
            
            if compliance['safe_to_post']:
                print("✅ Safe to post")
            else:
                print("❌ Needs review before posting")
            
            if compliance['issues']:
                print("🚨 Issues:")
                for issue in compliance['issues']:
                    print(f"  • {issue}")
            
            if compliance['warnings']:
                print("⚠️ Warnings:")
                for warning in compliance['warnings']:
                    print(f"  • {warning}")
            
            print(f"\nGenerated Content:")
            print(f"'{content}'")
            
            results[prompt_type] = {
                'content': content,
                'compliance': compliance,
                'timestamp': datetime.now().isoformat()
            }
        
        return results
    
    def test_live_ai_posting(self):
        """Test live posting with AI-generated content"""
        print("\n🚀 LIVE AI CONTENT POSTING TEST")
        print("="*50)
        
        # Generate content
        content = self.generate_content_with_openai('market_update')
        
        # Check compliance
        compliance = self.check_compliance(content)
        
        print(f"Generated Content: {content}")
        print(f"Compliance Score: {compliance['score']}/100")
        
        if not compliance['safe_to_post']:
            print("❌ Content failed compliance check - cannot post")
            return None
        
        confirm = input("\nPost this AI-generated content to all platforms? (yes/no): ").strip().lower()
        
        if confirm == 'yes':
            print("\n📤 Posting AI-generated content...")
            result = self.posting_system.post_to_all_platforms(content)
            
            # Add AI generation metadata
            result['ai_generated'] = True
            result['compliance_score'] = compliance['score']
            result['content_type'] = 'market_update'
            
            print(f"\n✅ AI content posted successfully!")
            print(f"Success rate: {sum(1 for p in result['platforms'].values() if p['success'])}/3")
            
            return result
        else:
            print("❌ Live AI posting cancelled")
            return None
    
    def generate_content_report(self, results):
        """Generate comprehensive content analysis report"""
        print("\n📊 AI CONTENT GENERATION REPORT")
        print("="*60)
        
        total_content = len(results)
        safe_content = sum(1 for r in results.values() if r['compliance']['safe_to_post'])
        avg_compliance = sum(r['compliance']['score'] for r in results.values()) / total_content
        
        print(f"Content Types Tested: {total_content}")
        print(f"Safe to Post: {safe_content}/{total_content} ({safe_content/total_content*100:.1f}%)")
        print(f"Average Compliance Score: {avg_compliance:.1f}/100")
        
        print(f"\n📝 DETAILED ANALYSIS:")
        
        for content_type, data in results.items():
            compliance = data['compliance']
            status = "✅ APPROVED" if compliance['safe_to_post'] else "❌ NEEDS REVIEW"
            
            print(f"\n{content_type.upper().replace('_', ' ')}: {status}")
            print(f"  Compliance: {compliance['score']}/100")
            print(f"  Length: {len(data['content'])} chars")
            print(f"  Has Disclaimer: {'✅' if compliance['has_disclaimer'] else '❌'}")
            
            if compliance['issues']:
                print(f"  Issues: {len(compliance['issues'])}")
        
        print(f"\n🎯 RECOMMENDATIONS:")
        
        if avg_compliance < 80:
            print("• Improve disclaimer inclusion in prompts")
            print("• Add more specific compliance instructions")
        
        if safe_content < total_content:
            print("• Review and refine content generation prompts")
            print("• Implement additional compliance filters")
        
        print("• Always review AI-generated content before posting")
        print("• Maintain human oversight for financial content")
        
        # Save report
        report_file = f'data/ai_content_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(report_file, 'w') as f:
            json.dump({
                'test_date': datetime.now().isoformat(),
                'summary': {
                    'total_content': total_content,
                    'safe_content': safe_content,
                    'avg_compliance': avg_compliance
                },
                'results': results
            }, f, indent=2)
        
        print(f"\n📄 Report saved: {report_file}")

def main():
    """Main execution"""
    tester = OpenAIContentTester()
    
    print("🤖 AI Finance Agency - OpenAI Content Generation Test")
    print("="*60)
    
    print("\nSelect test mode:")
    print("1. Test AI content generation (all types)")
    print("2. Live AI posting test")
    print("3. Both")
    
    try:
        choice = input("\nEnter choice (1-3): ").strip()
        
        if choice in ['1', '3']:
            # Test content generation
            results = tester.test_content_generation()
            tester.generate_content_report(results)
        
        if choice in ['2', '3']:
            # Live posting test
            tester.test_live_ai_posting()
            
    except KeyboardInterrupt:
        print("\n\nTest cancelled by user")

if __name__ == "__main__":
    main()
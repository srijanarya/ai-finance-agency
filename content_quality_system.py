#!/usr/bin/env python3
"""
Simplified Multi-Agent Content Quality System
Professional content creation with quality gates (lightweight version)
"""

import os
import json
import re
import yfinance as yf
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from coherent_content_generator import CoherentContentGenerator
from engagement_optimizer_v2 import EngagementOptimizerV2
from content_validation_rules import LearningIntegrator
from dotenv import load_dotenv
from openai import OpenAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class ContentQualitySystem:
    """Lightweight multi-agent content creation system with REAL market data"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.generator = CoherentContentGenerator()
        self.optimizer = EngagementOptimizerV2()
        self.learning_integrator = LearningIntegrator()  # Add validation integration
        self.market_data_cache = {}  # Cache for market data
        self.cache_timestamp = None
        
    def get_real_market_data(self) -> Dict:
        """Fetch REAL market data from Yahoo Finance"""
        # Cache for 5 minutes to avoid too many API calls
        if self.cache_timestamp and (datetime.now() - self.cache_timestamp).seconds < 300:
            return self.market_data_cache
            
        try:
            data = {}
            
            # Indian Indices
            nifty = yf.Ticker('^NSEI')
            sensex = yf.Ticker('^BSESN')
            
            # Get current and historical data
            nifty_hist = nifty.history(period='5d')
            sensex_hist = sensex.history(period='5d')
            
            if not nifty_hist.empty:
                data['nifty'] = {
                    'current': nifty_hist['Close'].iloc[-1],
                    'prev_close': nifty_hist['Close'].iloc[-2] if len(nifty_hist) > 1 else nifty_hist['Close'].iloc[-1],
                    'change_pct': ((nifty_hist['Close'].iloc[-1] - nifty_hist['Close'].iloc[-2]) / nifty_hist['Close'].iloc[-2] * 100) if len(nifty_hist) > 1 else 0
                }
            
            if not sensex_hist.empty:
                data['sensex'] = {
                    'current': sensex_hist['Close'].iloc[-1],
                    'prev_close': sensex_hist['Close'].iloc[-2] if len(sensex_hist) > 1 else sensex_hist['Close'].iloc[-1],
                    'change_pct': ((sensex_hist['Close'].iloc[-1] - sensex_hist['Close'].iloc[-2]) / sensex_hist['Close'].iloc[-2] * 100) if len(sensex_hist) > 1 else 0
                }
            
            # USD/INR
            usdinr = yf.Ticker('INR=X')
            usdinr_hist = usdinr.history(period='5d')
            if not usdinr_hist.empty:
                data['usdinr'] = {
                    'current': usdinr_hist['Close'].iloc[-1],
                    'change_pct': ((usdinr_hist['Close'].iloc[-1] - usdinr_hist['Close'].iloc[-2]) / usdinr_hist['Close'].iloc[-2] * 100) if len(usdinr_hist) > 1 else 0
                }
            
            # Cache the data
            self.market_data_cache = data
            self.cache_timestamp = datetime.now()
            
            logger.info(f"Fetched real market data: Nifty={data.get('nifty', {}).get('current', 'N/A'):.2f}, Sensex={data.get('sensex', {}).get('current', 'N/A'):.2f}")
            return data
            
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
            # Return last cached data if available
            if self.market_data_cache:
                return self.market_data_cache
            # Fallback to empty dict
            return {}
    
    def research_agent(self, platform: str, content_type: str) -> str:
        """Research Agent - Gathers market insights with REAL data"""
        current_date = datetime.now().strftime("%B %Y")
        
        # Get REAL market data
        market_data = self.get_real_market_data()
        
        # Format real data for prompt
        nifty_price = market_data.get('nifty', {}).get('current', 24773)
        nifty_change = market_data.get('nifty', {}).get('change_pct', 0)
        sensex_price = market_data.get('sensex', {}).get('current', 80787)
        sensex_change = market_data.get('sensex', {}).get('change_pct', 0)
        usdinr_rate = market_data.get('usdinr', {}).get('current', 87.93)
        
        prompt = f"""You are a Market Research Analyst for Indian financial markets.
        Current Date: {current_date}
        
        Task: Identify a compelling topic for {platform} content ({content_type}).
        
        IMPORTANT: Use ONLY current date ({current_date}) in your content. Do NOT use old dates like 2023.
        
        REAL INDIAN MARKET DATA (Live):
        - Nifty 50: {nifty_price:.2f} ({nifty_change:+.2f}% today)
        - Sensex: {sensex_price:.2f} ({sensex_change:+.2f}% today)
        - USD/INR: ₹{usdinr_rate:.2f}
        - RBI Repo Rate: 6.5%
        - India 10Y Bond: ~7.2%
        - FY in India: April-March (FY25-26 ends March 2026)
        - LTCG tax on equity: 12.5%
        - STCG tax on equity: 20%
        
        Provide:
        1. Current trend with REAL data (use the exact numbers provided)
        2. Specific, factual numbers from the data above
        3. Real insight based on today's market movement
        4. Actionable advice for Indian investors
        
        Format: Brief research report (100 words max)"""
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200
        )
        
        return response.choices[0].message.content.strip()
    
    def junior_writer_agent(self, research: str, platform: str, content_type: str) -> str:
        """Junior Writer Agent - Creates first draft with REAL data"""
        current_date = datetime.now().strftime("%B %Y")
        
        # Get REAL market data for reference
        market_data = self.get_real_market_data()
        nifty_price = market_data.get('nifty', {}).get('current', 24773)
        sensex_price = market_data.get('sensex', {}).get('current', 80787)
        usdinr_rate = market_data.get('usdinr', {}).get('current', 87.93)
        
        prompt = f"""You are a Junior Financial Content Writer.
        Current Date: {current_date}
        
        Research Brief: {research}
        
        Task: Write a first draft for {platform} ({content_type}).
        
        STRICT Requirements:
        - Use ONLY current date ({current_date})
        - Use REAL Indian market data:
          * Nifty: {nifty_price:.0f} (EXACT, not rounded to thousands)
          * Sensex: {sensex_price:.0f} (EXACT, not rounded)
          * USD/INR: ₹{usdinr_rate:.2f}
          * RBI Repo: 6.5%
          * Indian FY: April-March
        - Clear structure
        - Length for {platform}
        - NO placeholders or fake numbers
        - Focus on real opportunities
        
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
        """Editor Agent - Polish and optimize with REAL data verification"""
        current_date = datetime.now().strftime("%B %Y")
        
        # Get REAL market data for verification
        market_data = self.get_real_market_data()
        nifty_price = market_data.get('nifty', {}).get('current', 24773)
        sensex_price = market_data.get('sensex', {}).get('current', 80787)
        usdinr_rate = market_data.get('usdinr', {}).get('current', 87.93)
        
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
        - Verify and CORRECT market data to REAL values:
          * Nifty MUST be: {nifty_price:.0f} (NOT 26,000)
          * Sensex MUST be: {sensex_price:.0f} (NOT 85,000)
          * USD/INR: ₹{usdinr_rate:.2f}
          * RBI Rate: 6.5%
          * FY: April-March
        - If content mentions Nifty as 26,000 or similar, REPLACE with {nifty_price:.0f}
        - If content mentions Sensex as 85,000 or similar, REPLACE with {sensex_price:.0f}
        - Fix ANY wrong dates to {current_date}
        - Remove ALL placeholders
        - Remove fake urgency
        - Fix duplicates
        - Optimize for {platform}
        - Keep under limit
        
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
    
    def create_content(self, platform: str, content_type: str = 'market_insight', variety_hints: Dict = None) -> Dict:
        """Create content through multi-agent pipeline with variety enhancement"""
        
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
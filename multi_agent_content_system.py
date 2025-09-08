#!/usr/bin/env python3
"""
Multi-Agent Content Creation System using CrewAI
Professional content creation with quality gates
"""

import os
import json
import random
from datetime import datetime
from typing import Dict, List, Any
from crewai import Agent, Task, Crew, Process
from coherent_content_generator import CoherentContentGenerator
from engagement_optimizer_v2 import EngagementOptimizerV2
from dotenv import load_dotenv

load_dotenv()

class ContentCreationCrew:
    """Multi-agent system for professional content creation"""
    
    def __init__(self):
        self.generator = CoherentContentGenerator()
        self.optimizer = EngagementOptimizerV2()
        self.setup_agents()
        
    def setup_agents(self):
        """Initialize all content creation agents"""
        
        # Research Agent - Gathers market data and insights
        self.research_agent = Agent(
            role='Market Research Analyst',
            goal='Gather comprehensive market data and identify key financial insights',
            backstory="""You are an expert financial analyst specializing in Indian markets.
            You have access to real-time market data, news feeds, and technical indicators.
            Your job is to identify the most relevant and impactful information for content creation.""",
            verbose=True,
            allow_delegation=False
        )
        
        # Junior Writer Agent - Creates first draft
        self.junior_writer = Agent(
            role='Junior Financial Content Writer',
            goal='Create structured first drafts based on research data',
            backstory="""You are a skilled financial writer who excels at organizing data into readable content.
            You focus on accuracy, clarity, and proper structure. You follow templates but add fresh perspectives.""",
            verbose=True,
            allow_delegation=False
        )
        
        # Senior Writer Agent - Enhances content
        self.senior_writer = Agent(
            role='Senior Financial Content Strategist',
            goal='Transform drafts into engaging, insightful content that drives action',
            backstory="""You are an experienced content strategist with deep market knowledge.
            You add personality, storytelling, and actionable insights. You understand what makes content viral
            and how to connect with both retail and institutional investors.""",
            verbose=True,
            allow_delegation=False
        )
        
        # Editor Agent - Polish and platform optimization
        self.editor_agent = Agent(
            role='Content Editor and Platform Specialist',
            goal='Ensure content quality, accuracy, and platform optimization',
            backstory="""You are a meticulous editor with expertise in financial content.
            You check facts, improve clarity, optimize for each platform (LinkedIn/Twitter/Telegram),
            and ensure compliance with financial communication standards.""",
            verbose=True,
            allow_delegation=False
        )
        
        # QA Agent - Final quality check
        self.qa_agent = Agent(
            role='Quality Assurance Specialist',
            goal='Score content quality and ensure it meets publication standards',
            backstory="""You are a quality expert who uses data-driven scoring methodologies.
            You check for accuracy, engagement potential, compliance, and brand consistency.
            You reject low-quality content and provide specific improvement feedback.""",
            verbose=True,
            allow_delegation=False
        )
    
    def analyze_content_quality(self, content: str) -> Dict:
        """Analyze content for quality issues"""
        issues = []
        score = 10
        
        # Check for placeholder text
        placeholder_patterns = [
            '[Infographic', '[Bar chart', '[Line graph', '[Pie chart',
            '[Scatter plot', '[Bubble chart', '[Treemap', '(97 spots left)',
            'Join 10,247', 'Last day to act', 'Top post in r/'
        ]
        
        for pattern in placeholder_patterns:
            if pattern in content:
                issues.append(f"Contains placeholder text: {pattern}")
                score -= 2
        
        # Check for duplicate hashtags
        import re
        hashtags = re.findall(r'#\w+', content)
        if len(hashtags) != len(set(hashtags)):
            issues.append("Contains duplicate hashtags")
            score -= 1
        
        # Check for spammy CTAs
        if 'FREE' in content and 'spots left' in content.lower():
            issues.append("Contains spammy call-to-action")
            score -= 1
        
        # Check for fake urgency
        urgency_phrases = ['expires in', 'final hours', 'last chance', 'ending soon']
        for phrase in urgency_phrases:
            if phrase in content.lower() and 'specific date' not in content.lower():
                issues.append(f"Contains vague urgency: {phrase}")
                score -= 1
        
        # Check content length
        if len(content) < 100:
            issues.append("Content too short")
            score -= 2
        elif len(content) > 3000:
            issues.append("Content too long")
            score -= 1
        
        # Check for market data
        has_numbers = any(char.isdigit() for char in content)
        if not has_numbers:
            issues.append("No specific data or numbers")
            score -= 2
        
        return {
            'score': max(0, score),
            'issues': issues,
            'passed': score >= 7
        }
    
    def create_content(self, platform: str, content_type: str = None) -> Dict:
        """Create content using multi-agent workflow"""
        
        print("\n" + "="*60)
        print(f"🚀 MULTI-AGENT CONTENT CREATION - {platform.upper()}")
        print("="*60)
        
        # Task 1: Research
        research_task = Task(
            description=f"""Research current Indian financial markets and identify a compelling topic for {platform}.
            Focus on: Recent market movements, sector rotations, policy changes, or investment opportunities.
            Provide specific data points, percentages, and actionable insights.""",
            agent=self.research_agent,
            expected_output="Market research brief with key data points and insights"
        )
        
        # Task 2: First Draft
        writing_task = Task(
            description=f"""Using the research provided, write a first draft for {platform}.
            Content type: {content_type or 'market insight'}
            Include specific numbers, real examples, and clear structure.
            Follow platform best practices but avoid generic templates.""",
            agent=self.junior_writer,
            expected_output="Structured first draft with accurate data"
        )
        
        # Task 3: Enhancement
        enhancement_task = Task(
            description=f"""Enhance the draft to make it more engaging and insightful.
            Add storytelling elements, personal insights, and actionable takeaways.
            Make it feel authentic and valuable. Remove any generic phrases.""",
            agent=self.senior_writer,
            expected_output="Enhanced content with personality and insights"
        )
        
        # Task 4: Editing
        editing_task = Task(
            description=f"""Edit and optimize the content for {platform}.
            Fix any errors, improve clarity, and ensure platform-specific optimization.
            Remove any placeholder text, fake numbers, or spammy elements.
            LinkedIn: Professional tone, 1300 chars max
            Twitter: Concise, 280 chars
            Telegram: Conversational, with emojis""",
            agent=self.editor_agent,
            expected_output="Polished, platform-optimized content"
        )
        
        # Task 5: Quality Check
        qa_task = Task(
            description="""Perform final quality check on the content.
            Score it from 0-10 based on:
            - Accuracy and factual correctness
            - Engagement potential
            - Absence of placeholders or fake elements
            - Platform optimization
            - Overall value to readers
            Reject if score < 7 and provide specific feedback.""",
            agent=self.qa_agent,
            expected_output="Quality score and approval status"
        )
        
        # Create crew with sequential process
        crew = Crew(
            agents=[
                self.research_agent,
                self.junior_writer,
                self.senior_writer,
                self.editor_agent,
                self.qa_agent
            ],
            tasks=[
                research_task,
                writing_task,
                enhancement_task,
                editing_task,
                qa_task
            ],
            process=Process.sequential,
            verbose=True
        )
        
        # Execute the crew
        try:
            result = crew.kickoff()
            
            # Parse the final content
            final_content = str(result)
            
            # Perform additional quality check
            quality_check = self.analyze_content_quality(final_content)
            
            if quality_check['passed']:
                print(f"\n✅ Content APPROVED (Score: {quality_check['score']}/10)")
                
                # Calculate engagement score
                engagement_score = self.optimizer.calculate_engagement_score(final_content)
                
                return {
                    'success': True,
                    'content': final_content,
                    'quality_score': quality_check['score'],
                    'engagement_score': engagement_score,
                    'platform': platform,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                print(f"\n❌ Content REJECTED (Score: {quality_check['score']}/10)")
                print("Issues found:")
                for issue in quality_check['issues']:
                    print(f"  - {issue}")
                
                return {
                    'success': False,
                    'content': final_content,
                    'quality_score': quality_check['score'],
                    'issues': quality_check['issues'],
                    'platform': platform
                }
                
        except Exception as e:
            print(f"\n❌ Error in multi-agent workflow: {e}")
            return {
                'success': False,
                'error': str(e),
                'platform': platform
            }
    
    def test_system(self):
        """Test the multi-agent system with all platforms"""
        print("\n" + "="*60)
        print("🧪 TESTING MULTI-AGENT CONTENT SYSTEM")
        print("="*60)
        
        results = []
        
        # Test LinkedIn
        print("\n📘 Testing LinkedIn content...")
        linkedin_result = self.create_content('linkedin', 'market_insight')
        results.append(linkedin_result)
        
        # Test Twitter
        print("\n🐦 Testing Twitter content...")
        twitter_result = self.create_content('twitter', 'quick_tip')
        results.append(twitter_result)
        
        # Test Telegram
        print("\n💬 Testing Telegram content...")
        telegram_result = self.create_content('telegram', 'trading_strategy')
        results.append(telegram_result)
        
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
                print(f"❌ {platform}: Failed - {result.get('error', 'Quality check failed')}")
        
        return results


def main():
    """Main execution"""
    crew = ContentCreationCrew()
    
    # Test the system
    results = crew.test_system()
    
    # Save results
    with open('multi_agent_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print("\n✅ Test complete! Results saved to multi_agent_test_results.json")


if __name__ == "__main__":
    main()
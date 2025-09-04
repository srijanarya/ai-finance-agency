#!/usr/bin/env python3
"""
Professional Content Quality Tester
Automated testing and grading of generated content
"""

import time
import json
import requests
from datetime import datetime
import sqlite3
import os

class ProfessionalContentTester:
    """Professional content testing and quality assessment"""
    
    def __init__(self):
        self.test_results = []
        self.base_url = "http://localhost:8088"
        
    def test_content_generation(self, content_id, expected_keywords):
        """Test content generation for a specific ID"""
        print(f"\n{'='*60}")
        print(f"TESTING CONTENT ID: {content_id}")
        print(f"{'='*60}")
        
        # First, get the original content from database
        conn = sqlite3.connect('data/agency.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM content_ideas WHERE id = ?', (content_id,))
        row = cursor.fetchone()
        
        if row:
            # Convert to dict
            original = {}
            for key in row.keys():
                original[key] = row[key]
        else:
            original = None
        
        if not original:
            print(f"❌ ERROR: Content ID {content_id} not found in database")
            return None
            
        original_title = original.get('title', 'Unknown')
        print(f"📰 Original Title: {original_title}")
        print(f"📝 Description: {original.get('description', 'N/A')}")
        
        # Generate content via API
        print(f"\n🔄 Generating content...")
        response = requests.post(f'{self.base_url}/api/content/generate', 
            json={
                'content_id': content_id,
                'premium': True,
                'include_visual': True
            },
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ API Error: {response.status_code}")
            return None
            
        result = response.json()
        
        # Analyze the generated content
        print(f"\n📊 CONTENT ANALYSIS:")
        print(f"{'='*60}")
        
        generated_title = result.get('title', 'NO TITLE')
        generated_content = result.get('content', 'NO CONTENT')
        visual_path = result.get('visual_path', None)
        
        print(f"✅ Generated Title: {generated_title}")
        print(f"📄 Content Length: {len(generated_content)} characters")
        print(f"🖼️ Visual Generated: {'Yes - ' + visual_path if visual_path else 'No'}")
        print(f"📊 Quality Score: {result.get('quality_score', 0)}/10")
        print(f"🔗 Data Source: {result.get('data_source', 'Unknown')}")
        
        # Grade the content  
        grade = self.grade_content(original_title, generated_title, generated_content, expected_keywords, result)
        
        # Store result
        self.test_results.append({
            'content_id': content_id,
            'original_title': original_title,
            'generated_title': generated_title,
            'grade': grade,
            'visual': bool(visual_path)
        })
        
        conn.close()
        return grade
    
    def grade_content(self, original_title, generated_title, generated_content, expected_keywords, result):
        """Grade content quality based on multiple criteria"""
        
        print(f"\n🎯 QUALITY ASSESSMENT:")
        print(f"{'='*60}")
        
        score = 0
        max_score = 100
        feedback = []
        
        # 1. RELEVANCE CHECK (40 points)
        print("\n1️⃣ RELEVANCE CHECK (40 points):")
        relevance_score = 0
        
        # Check if main subject is mentioned
        original_lower = original_title.lower()
        generated_lower = (generated_title + generated_content).lower()
        
        # Extract main subject (e.g., "Reliance" from Reliance share price...)
        main_subjects = []
        if 'reliance' in original_lower or 'ril' in original_lower:
            main_subjects = ['reliance', 'ril']
        elif 'hdfc' in original_lower:
            main_subjects = ['hdfc']
        elif 'tcs' in original_lower:
            main_subjects = ['tcs']
        elif 'infosys' in original_lower:
            main_subjects = ['infosys']
        elif 'nifty' in original_lower:
            main_subjects = ['nifty']
        
        if main_subjects:
            subject_found = any(subj in generated_lower for subj in main_subjects)
            if subject_found:
                relevance_score += 25
                print(f"  ✅ Main subject found: {main_subjects[0]} (+25)")
            else:
                print(f"  ❌ Main subject NOT found: {main_subjects[0]} (0)")
                feedback.append(f"CRITICAL: Main subject '{main_subjects[0]}' missing from content")
        
        # Check for context match (crash, surge, AGM, etc.)
        if 'crash' in original_lower or 'fall' in original_lower or 'drop' in original_lower:
            if any(word in generated_lower for word in ['crash', 'fall', 'drop', 'down', 'bearish', 'decline']):
                relevance_score += 15
                print(f"  ✅ Negative sentiment matched (+15)")
            else:
                print(f"  ❌ Sentiment mismatch - expected negative (0)")
                feedback.append("Sentiment doesn't match the original news")
        elif 'surge' in original_lower or 'gain' in original_lower or 'rally' in original_lower:
            if any(word in generated_lower for word in ['surge', 'gain', 'rally', 'up', 'bullish', 'rise']):
                relevance_score += 15
                print(f"  ✅ Positive sentiment matched (+15)")
            else:
                print(f"  ❌ Sentiment mismatch - expected positive (0)")
                feedback.append("Sentiment doesn't match the original news")
        
        score += relevance_score
        
        # 2. DATA ACCURACY (30 points)
        print("\n2️⃣ DATA ACCURACY (30 points):")
        data_score = 0
        
        # Check for price data
        import re
        prices = re.findall(r'₹[\d,]+\.?\d*', generated_content)
        if prices:
            data_score += 10
            print(f"  ✅ Price data included: {prices[:3]} (+10)")
            
            # Check for fake prices
            if '2400' in generated_content or '2450' in generated_content or '2500' in generated_content:
                data_score -= 20
                print(f"  ❌ FAKE/WRONG prices detected! (-20)")
                feedback.append("CRITICAL: Incorrect price data detected")
        else:
            print(f"  ⚠️ No price data found (0)")
        
        # Check for percentages
        percentages = re.findall(r'\d+\.?\d*%', generated_content)
        if percentages:
            data_score += 10
            print(f"  ✅ Percentage changes included: {percentages[:3]} (+10)")
        
        # Check for technical indicators
        if any(indicator in generated_lower for indicator in ['rsi', 'support', 'resistance', 'volume']):
            data_score += 10
            print(f"  ✅ Technical indicators present (+10)")
        
        score += max(0, data_score)  # Don't go negative
        
        # 3. CONTENT QUALITY (20 points)
        print("\n3️⃣ CONTENT QUALITY (20 points):")
        quality_score = 0
        
        # Length check
        if 100 <= len(generated_content) <= 500:
            quality_score += 10
            print(f"  ✅ Optimal length: {len(generated_content)} chars (+10)")
        elif len(generated_content) < 100:
            print(f"  ❌ Too short: {len(generated_content)} chars (0)")
            feedback.append("Content too brief")
        else:
            quality_score += 5
            print(f"  ⚠️ Too long: {len(generated_content)} chars (+5)")
            feedback.append("Content could be more concise")
        
        # Structure check (bullets, sections)
        if '→' in generated_content or '•' in generated_content:
            quality_score += 5
            print(f"  ✅ Good formatting with bullets (+5)")
        
        # Call to action
        if any(cta in generated_lower for cta in ['watch', 'wait', 'trade', 'target', 'stop']):
            quality_score += 5
            print(f"  ✅ Contains actionable insights (+5)")
        
        score += quality_score
        
        # 4. ENGAGEMENT (10 points)
        print("\n4️⃣ ENGAGEMENT (10 points):")
        engagement_score = 0
        
        # Emoji usage (professional amount)
        emoji_count = len(re.findall(r'[📊📈📉🔴🟢💹🎯🚀⚠️✅❌]', generated_content))
        if 2 <= emoji_count <= 8:
            engagement_score += 5
            print(f"  ✅ Professional emoji usage: {emoji_count} (+5)")
        elif emoji_count > 8:
            print(f"  ⚠️ Too many emojis: {emoji_count} (0)")
            feedback.append("Reduce emoji usage")
        
        # Hashtags
        if result.get('hashtags'):
            engagement_score += 5
            print(f"  ✅ Hashtags included (+5)")
        
        score += engagement_score
        
        # FINAL GRADE
        print(f"\n{'='*60}")
        print(f"📊 FINAL SCORE: {score}/{max_score}")
        
        if score >= 85:
            grade = 'A+'
            verdict = '🌟 EXCELLENT - Ready to post'
        elif score >= 75:
            grade = 'A'
            verdict = '✅ GOOD - Minor improvements possible'
        elif score >= 65:
            grade = 'B'
            verdict = '⚠️ ACCEPTABLE - Needs improvement'
        elif score >= 50:
            grade = 'C'
            verdict = '⚠️ POOR - Significant issues'
        else:
            grade = 'F'
            verdict = '❌ FAIL - Major problems'
        
        print(f"📝 GRADE: {grade}")
        print(f"📋 VERDICT: {verdict}")
        
        if feedback:
            print(f"\n🔧 FEEDBACK:")
            for fb in feedback:
                print(f"  • {fb}")
        
        return {
            'score': score,
            'grade': grade,
            'verdict': verdict,
            'feedback': feedback
        }
    
    def run_test_suite(self):
        """Run comprehensive test suite"""
        print("\n" + "="*60)
        print("🧪 PROFESSIONAL CONTENT QUALITY TEST SUITE")
        print("="*60)
        print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing URL: {self.base_url}")
        
        # Test cases
        test_cases = [
            {
                'id': 121,
                'name': 'Reliance AGM Crash',
                'keywords': ['reliance', 'ril', 'agm', 'crash', '1355']
            },
            {
                'id': 123,
                'name': 'Reliance Shares Lower',
                'keywords': ['reliance', 'lower', 'agm']
            },
            {
                'id': 130,
                'name': 'HDFC Bank Buy Call',
                'keywords': ['hdfc', 'bank', 'buy', 'target', '1850']
            }
        ]
        
        results = []
        for test in test_cases:
            try:
                grade = self.test_content_generation(test['id'], test['keywords'])
                if grade:
                    results.append({
                        'name': test['name'],
                        'grade': grade['grade'],
                        'score': grade['score']
                    })
            except Exception as e:
                print(f"❌ Test failed: {e}")
                results.append({
                    'name': test['name'],
                    'grade': 'ERROR',
                    'score': 0
                })
            
            time.sleep(2)  # Delay between tests
        
        # Summary Report
        print("\n" + "="*60)
        print("📊 TEST SUMMARY REPORT")
        print("="*60)
        
        for result in results:
            print(f"{result['name']}: Grade {result['grade']} ({result['score']}/100)")
        
        avg_score = sum(r['score'] for r in results) / len(results) if results else 0
        print(f"\n📈 Average Score: {avg_score:.1f}/100")
        
        if avg_score >= 75:
            print("✅ SYSTEM PASSED - Content generation working well")
        else:
            print("❌ SYSTEM FAILED - Major issues detected")
        
        return results

def main():
    """Run the automated content tester"""
    tester = ProfessionalContentTester()
    
    # Check if dashboard is running
    try:
        response = requests.get('http://localhost:8088/', timeout=5)
        if response.status_code != 200:
            print("❌ Dashboard not accessible. Please start it first.")
            return
    except:
        print("❌ Dashboard not running. Starting it now...")
        import subprocess
        subprocess.Popen(['python', 'dashboard.py'], 
                        stdout=subprocess.DEVNULL, 
                        stderr=subprocess.DEVNULL)
        time.sleep(5)
    
    # Run tests
    results = tester.run_test_suite()
    
    # Save results
    with open('test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'results': results
        }, f, indent=2)
    
    print(f"\n💾 Results saved to test_results.json")

if __name__ == "__main__":
    main()
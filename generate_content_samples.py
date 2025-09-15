#!/usr/bin/env python3
"""
Generate 10 varied content samples to test quality range
Shows different styles, topics, and platforms
"""

import sys
import os
sys.path.append('/Users/srijan/ai-finance-agency/.ignore')

from elite_content_production import generate_elite_content
import json
import time
from datetime import datetime

# Varied topics to test range
test_topics = [
    # Educational (Zerodha-style)
    "Why 92% of F&O traders lose money: The math behind options trading",
    "Index funds vs Active funds: 10-year performance data from Indian markets",
    
    # News-driven (Real-time)
    "RBI's latest repo rate decision and what it means for your loans",
    "Why FIIs pulled out ₹50,000 crores from Indian markets this month",
    
    # Viral/Controversial
    "The ₹2 lakh crore scam nobody's talking about in Indian markets",
    "Why your mutual fund advisor doesn't want you to know about direct plans",
    
    # Technical Analysis
    "Nifty50 forming head and shoulders pattern - breakout imminent",
    "Hidden divergence in Bank Nifty suggesting 5% move incoming",
    
    # Beginner-friendly
    "Your first ₹10,000: Where to invest as a complete beginner",
    "SIP vs Lumpsum: Which works better in volatile markets?"
]

platforms = ["linkedin", "twitter", "linkedin", "twitter", "linkedin", 
             "twitter", "linkedin", "twitter", "linkedin", "linkedin"]

def generate_samples():
    """Generate diverse content samples"""
    results = []
    print("🚀 Generating 10 Varied Content Samples")
    print("=" * 60)
    
    for i, (topic, platform) in enumerate(zip(test_topics, platforms), 1):
        print(f"\n📝 Sample {i}/10: {platform.upper()}")
        print(f"Topic: {topic[:50]}...")
        
        try:
            start_time = time.time()
            result = generate_elite_content(topic=topic, platform=platform)
            generation_time = time.time() - start_time
            
            if result["status"] == "success":
                # Calculate quality metrics
                content = result["content"]
                metrics = {
                    "word_count": len(content.split()),
                    "has_numbers": any(char.isdigit() for char in content),
                    "has_tickers": "$" in content or "₹" in content,
                    "has_emoji": any(ord(char) > 127 for char in content),
                    "generation_time": round(generation_time, 2),
                    "platform": platform,
                    "topic_type": categorize_topic(topic)
                }
                
                sample = {
                    "sample_id": i,
                    "topic": topic,
                    "platform": platform,
                    "content": content,
                    "metrics": metrics,
                    "timestamp": datetime.now().isoformat()
                }
                
                results.append(sample)
                print(f"✅ Generated: {metrics['word_count']} words in {metrics['generation_time']}s")
                
                # Show preview
                print(f"Preview: {content[:150]}...")
                
            else:
                print(f"❌ Failed: {result.get('error', 'Unknown error')}")
                results.append({
                    "sample_id": i,
                    "topic": topic,
                    "platform": platform,
                    "error": result.get('error', 'Generation failed')
                })
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            results.append({
                "sample_id": i,
                "topic": topic,
                "platform": platform,
                "error": str(e)
            })
    
    return results

def categorize_topic(topic):
    """Categorize topic type"""
    topic_lower = topic.lower()
    if any(word in topic_lower for word in ["why", "how", "what", "guide"]):
        return "educational"
    elif any(word in topic_lower for word in ["₹", "crore", "pulled", "latest"]):
        return "news"
    elif any(word in topic_lower for word in ["scam", "nobody", "doesn't want"]):
        return "controversial"
    elif any(word in topic_lower for word in ["pattern", "divergence", "breakout"]):
        return "technical"
    else:
        return "general"

def analyze_quality(results):
    """Analyze quality across samples"""
    successful = [r for r in results if "error" not in r]
    
    if successful:
        avg_words = sum(r["metrics"]["word_count"] for r in successful) / len(successful)
        avg_time = sum(r["metrics"]["generation_time"] for r in successful) / len(successful)
        with_numbers = sum(1 for r in successful if r["metrics"]["has_numbers"])
        with_tickers = sum(1 for r in successful if r["metrics"]["has_tickers"])
        
        quality_report = {
            "total_samples": len(results),
            "successful": len(successful),
            "failed": len(results) - len(successful),
            "average_words": round(avg_words),
            "average_generation_time": round(avg_time, 2),
            "with_data_points": with_numbers,
            "with_tickers": with_tickers,
            "success_rate": f"{(len(successful)/len(results)*100):.0f}%"
        }
        
        # Quality score calculation
        quality_score = 0
        quality_score += min(30, (len(successful) / len(results)) * 30)  # Success rate
        quality_score += min(20, (avg_words / 100) * 20)  # Length
        quality_score += min(20, (with_numbers / len(successful)) * 20)  # Data usage
        quality_score += min(15, (with_tickers / len(successful)) * 15)  # Finance specific
        quality_score += min(15, (5 / avg_time) * 15)  # Speed
        
        quality_report["quality_score"] = round(quality_score)
        quality_report["grade"] = get_grade(quality_score)
        
        return quality_report
    
    return {"error": "No successful samples generated"}

def get_grade(score):
    """Convert score to grade"""
    if score >= 90: return "A+ (Excellent)"
    elif score >= 80: return "A (Very Good)"
    elif score >= 70: return "B (Good)"
    elif score >= 60: return "C (Acceptable)"
    else: return "D (Needs Improvement)"

def save_results(results, quality_report):
    """Save all results to file"""
    output = {
        "generation_date": datetime.now().isoformat(),
        "quality_report": quality_report,
        "samples": results
    }
    
    filename = f"content_samples_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = f"/Users/srijan/ai-finance-agency/data/{filename}"
    
    os.makedirs("/Users/srijan/ai-finance-agency/data", exist_ok=True)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved to: {filepath}")
    return filepath

def main():
    print("\n" + "="*60)
    print("📊 CONTENT QUALITY RANGE TEST")
    print("="*60)
    
    # Generate samples
    results = generate_samples()
    
    # Analyze quality
    print("\n" + "="*60)
    print("📈 QUALITY ANALYSIS")
    print("="*60)
    
    quality_report = analyze_quality(results)
    
    if "error" not in quality_report:
        print(f"""
Quality Report:
--------------
✅ Success Rate: {quality_report['success_rate']}
📝 Avg Word Count: {quality_report['average_words']}
⚡ Avg Generation Time: {quality_report['average_generation_time']}s
📊 With Data Points: {quality_report['with_data_points']}/{quality_report['successful']}
💹 With Tickers: {quality_report['with_tickers']}/{quality_report['successful']}

🎯 QUALITY SCORE: {quality_report['quality_score']}/100
📊 GRADE: {quality_report['grade']}
        """)
    else:
        print(f"❌ Analysis Error: {quality_report['error']}")
    
    # Save results
    filepath = save_results(results, quality_report)
    
    # Show best and worst samples
    if results:
        print("\n" + "="*60)
        print("💎 BEST SAMPLE (by metrics):")
        print("="*60)
        
        successful = [r for r in results if "error" not in r]
        if successful:
            best = max(successful, key=lambda x: x["metrics"]["word_count"])
            print(f"Topic: {best['topic']}")
            print(f"Platform: {best['platform']}")
            print(f"Words: {best['metrics']['word_count']}")
            print(f"Content Preview:\n{best['content'][:300]}...")
    
    print("\n" + "="*60)
    print("✅ TESTING COMPLETE")
    print(f"📁 Full results in: {filepath}")
    print("="*60)

if __name__ == "__main__":
    main()
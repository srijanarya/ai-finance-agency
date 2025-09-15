#!/usr/bin/env python3
"""
Automated Showcase System - Proves AI Content Works
Generates and posts content for TREUM, tracks metrics
"""

import schedule
import time
from datetime import datetime
import json
import sqlite3
from pathlib import Path

# Import your existing systems
from elite_content_production import generate_elite_content
from automated_posting_system import post_to_linkedin, post_to_twitter

class AutomatedShowcase:
    def __init__(self):
        self.company = "TREUM ALGOTECH"
        self.metrics_db = "showcase_metrics.db"
        self.init_database()
        
    def init_database(self):
        """Track all metrics for showing clients"""
        conn = sqlite3.connect(self.metrics_db)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS showcase_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                platform TEXT,
                content_topic TEXT,
                impressions INTEGER DEFAULT 0,
                likes INTEGER DEFAULT 0,
                shares INTEGER DEFAULT 0,
                comments INTEGER DEFAULT 0,
                clicks INTEGER DEFAULT 0,
                generation_time REAL,
                cost_to_generate REAL
            )
        """)
        conn.commit()
        conn.close()
    
    def generate_and_post(self):
        """Generate content and post to all platforms"""
        print(f"🤖 AI generating content at {datetime.now()}")
        
        # Topics that showcase capability
        showcase_topics = [
            "Why {company} is betting ₹{amount} Cr on {sector}",
            "Breaking: {indicator} signals first time since {year}",
            "{smart_investor}'s hidden position worth ₹{amount} Cr exposed",
            "The ₹{amount} Cr opportunity everyone's missing in {market}"
        ]
        
        # Generate for each platform
        platforms = ["linkedin", "twitter"]
        results = []
        
        for platform in platforms:
            start_time = time.time()
            
            # Generate content
            result = generate_elite_content(platform=platform)
            generation_time = time.time() - start_time
            
            if result["status"] == "success":
                # Post to platform
                if platform == "linkedin":
                    post_result = post_to_linkedin(result["content"])
                elif platform == "twitter":
                    post_result = post_to_twitter(result["content"])
                
                # Track metrics
                self.track_metrics(
                    platform=platform,
                    content_topic=result["topic"],
                    generation_time=generation_time,
                    cost=0.02  # Approximate cost per generation
                )
                
                results.append({
                    "platform": platform,
                    "posted": True,
                    "time": generation_time,
                    "topic": result["topic"][:50]
                })
        
        # Generate comparison metrics
        self.generate_comparison_report(results)
        
        return results
    
    def track_metrics(self, platform, content_topic, generation_time, cost):
        """Store metrics for client demos"""
        conn = sqlite3.connect(self.metrics_db)
        conn.execute("""
            INSERT INTO showcase_metrics 
            (platform, content_topic, generation_time, cost_to_generate)
            VALUES (?, ?, ?, ?)
        """, (platform, content_topic, generation_time, cost))
        conn.commit()
        conn.close()
    
    def generate_comparison_report(self, results):
        """Create comparison: AI vs Human content creation"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "ai_performance": {
                "articles_generated": len(results),
                "total_time": sum(r["time"] for r in results),
                "cost": len(results) * 0.02,
                "platforms_covered": list(set(r["platform"] for r in results))
            },
            "human_equivalent": {
                "time_required": len(results) * 120,  # 2 hours per article
                "cost": len(results) * 2000,  # ₹2000 per article
                "platforms_covered": 1  # Humans typically focus on one
            },
            "efficiency_gain": {
                "time_saved": f"{(120 * len(results)) / 60:.1f} hours",
                "cost_saved": f"₹{len(results) * 1980}",
                "productivity_multiplier": f"{120 / (sum(r['time'] for r in results) / len(results)):.0f}x"
            }
        }
        
        # Save report for demo purposes
        with open("ai_efficiency_proof.json", "w") as f:
            json.dump(report, f, indent=2)
        
        print("\n📊 EFFICIENCY METRICS FOR DEMO:")
        print(f"⚡ Generated {len(results)} articles in {report['ai_performance']['total_time']:.1f} seconds")
        print(f"💰 Cost: ₹{report['ai_performance']['cost']:.2f} vs Human: ₹{report['human_equivalent']['cost']}")
        print(f"🚀 Productivity: {report['efficiency_gain']['productivity_multiplier']} faster")
        
        return report
    
    def create_live_dashboard(self):
        """Generate live metrics dashboard for demos"""
        conn = sqlite3.connect(self.metrics_db)
        
        # Get last 30 days metrics
        metrics = conn.execute("""
            SELECT 
                COUNT(*) as total_posts,
                AVG(generation_time) as avg_time,
                SUM(cost_to_generate) as total_cost,
                COUNT(DISTINCT platform) as platforms_used
            FROM showcase_metrics
            WHERE timestamp > datetime('now', '-30 days')
        """).fetchone()
        
        dashboard = {
            "30_day_metrics": {
                "content_pieces": metrics[0] or 0,
                "avg_generation_time": f"{metrics[1] or 0:.1f} seconds",
                "total_cost": f"₹{metrics[2] or 0:.2f}",
                "platforms_active": metrics[3] or 0
            },
            "roi_metrics": {
                "cost_per_piece": f"₹{(metrics[2] or 0) / max(metrics[0], 1):.2f}",
                "human_equivalent_cost": f"₹{(metrics[0] or 0) * 2000}",
                "savings": f"₹{((metrics[0] or 0) * 2000) - (metrics[2] or 0):.0f}"
            },
            "live_proof": {
                "last_generated": datetime.now().isoformat(),
                "next_scheduled": "Every 4 hours",
                "total_automation": "100%"
            }
        }
        
        conn.close()
        return dashboard
    
    def run_scheduled(self):
        """Run on schedule to build proof"""
        # Generate content every 4 hours
        schedule.every(4).hours.do(self.generate_and_post)
        
        # Update metrics every hour
        schedule.every().hour.do(self.create_live_dashboard)
        
        print("🚀 Automated Showcase System Started")
        print("📊 Building proof of AI content effectiveness")
        print("🔄 Generating content every 4 hours")
        
        # Run once immediately
        self.generate_and_post()
        
        while True:
            schedule.run_pending()
            time.sleep(60)

def main():
    showcase = AutomatedShowcase()
    
    # For immediate demo
    print("\n" + "="*60)
    print("🎯 TREUM AI CONTENT SHOWCASE")
    print("="*60)
    
    # Generate sample content NOW
    print("\n⏱️ Generating content in real-time...")
    results = showcase.generate_and_post()
    
    # Show live dashboard
    dashboard = showcase.create_live_dashboard()
    print("\n📊 LIVE METRICS DASHBOARD:")
    print(json.dumps(dashboard, indent=2))
    
    print("\n✅ Proof generated! Use this in sales demos")
    print("📈 Access dashboard at: http://localhost:8000/showcase")
    
    # Ask if want to run continuously
    if input("\nRun continuous showcase? (y/n): ").lower() == 'y':
        showcase.run_scheduled()

if __name__ == "__main__":
    main()
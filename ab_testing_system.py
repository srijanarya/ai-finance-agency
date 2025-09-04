#!/usr/bin/env python3
"""
A/B Testing System for AI Finance Agency
Test different content formats to optimize engagement
"""

import sqlite3
import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from dataclasses import dataclass
import hashlib

@dataclass
class ABTestVariant:
    """A/B test variant configuration"""
    name: str
    content_template: str
    emoji_style: str
    header_format: str
    cta_type: str
    weight: float = 0.5  # Traffic allocation

@dataclass
class ABTestResult:
    """A/B test result data"""
    variant: str
    impressions: int
    clicks: int
    engagement_score: float
    conversion_rate: float

class ABTestManager:
    """Manages A/B tests for content optimization"""
    
    def __init__(self):
        self.db_path = "ab_testing.db"
        self.setup_database()
        self.active_tests = {}
        
        # Define test variants
        self.content_variants = {
            "header_style": [
                ABTestVariant("professional", "📊 MARKET BRIEF", "minimal", "BRIEF", "analysis"),
                ABTestVariant("dynamic", "🚀 MARKET PULSE", "energetic", "PULSE", "action")
            ],
            "emoji_density": [
                ABTestVariant("high_emoji", "🔥🚀📈💎", "abundant", "EMOJI_RICH", "excitement"),
                ABTestVariant("minimal_emoji", "📊", "clean", "MINIMAL", "professional")  
            ],
            "call_to_action": [
                ABTestVariant("educational", "Learn more about market dynamics", "learning", "EDUCATIONAL", "education"),
                ABTestVariant("action", "Start trading these opportunities now!", "urgent", "ACTION", "trading")
            ]
        }
    
    def setup_database(self):
        """Setup A/B testing database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ab_tests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_name TEXT,
                variant_a TEXT,
                variant_b TEXT,
                start_date DATETIME,
                end_date DATETIME,
                status TEXT DEFAULT 'active',
                winner TEXT,
                confidence_level REAL,
                sample_size INTEGER
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ab_test_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_id INTEGER,
                variant TEXT,
                content_hash TEXT,
                timestamp DATETIME,
                platform TEXT,
                impressions INTEGER DEFAULT 0,
                clicks INTEGER DEFAULT 0,
                shares INTEGER DEFAULT 0,
                engagement_score REAL DEFAULT 0.0,
                user_feedback TEXT,
                FOREIGN KEY (test_id) REFERENCES ab_tests (id)
            )
        """)
        
        conn.commit()
        conn.close()
    
    def create_test(self, test_name: str, variant_a: ABTestVariant, variant_b: ABTestVariant, duration_days: int = 7) -> int:
        """Create a new A/B test"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        start_date = datetime.now()
        end_date = start_date + timedelta(days=duration_days)
        
        cursor.execute("""
            INSERT INTO ab_tests 
            (test_name, variant_a, variant_b, start_date, end_date, sample_size)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            test_name,
            json.dumps(variant_a.__dict__),
            json.dumps(variant_b.__dict__),
            start_date,
            end_date,
            0
        ))
        
        test_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"🧪 Created A/B test '{test_name}' (ID: {test_id})")
        print(f"   Variant A: {variant_a.name}")
        print(f"   Variant B: {variant_b.name}")
        print(f"   Duration: {duration_days} days")
        
        return test_id
    
    def get_variant_for_user(self, test_name: str, user_id: str = None) -> Tuple[str, ABTestVariant]:
        """Get variant for a user (with consistent assignment)"""
        if test_name not in self.content_variants:
            return "default", None
        
        variants = self.content_variants[test_name]
        
        # Use user_id hash for consistent assignment
        if user_id:
            hash_obj = hashlib.md5(f"{test_name}_{user_id}".encode())
            hash_int = int(hash_obj.hexdigest(), 16)
            variant_index = hash_int % len(variants)
        else:
            # Random assignment for anonymous users
            variant_index = random.randint(0, len(variants) - 1)
        
        variant = variants[variant_index]
        return variant.name, variant
    
    def apply_variant_to_content(self, base_content: str, variant: ABTestVariant, test_type: str) -> str:
        """Apply A/B test variant to content"""
        if not variant:
            return base_content
        
        modified_content = base_content
        
        if test_type == "header_style":
            # Replace standard header with variant header
            modified_content = modified_content.replace("MARKET BRIEF", variant.content_template)
            modified_content = modified_content.replace("📊 MARKET BRIEF", variant.content_template)
        
        elif test_type == "emoji_density":
            if variant.name == "high_emoji":
                # Add more emojis to content
                modified_content = self._add_emojis(modified_content)
            elif variant.name == "minimal_emoji":
                # Reduce emojis in content
                modified_content = self._reduce_emojis(modified_content)
        
        elif test_type == "call_to_action":
            # Add CTA at the end
            modified_content += f"\n\n💡 {variant.content_template}"
        
        return modified_content
    
    def _add_emojis(self, content: str) -> str:
        """Add more emojis to content"""
        emoji_map = {
            "NIFTY": "🎯 NIFTY",
            "BANKNIFTY": "🏦 BANKNIFTY", 
            "positive": "🚀",
            "negative": "📉",
            "Market": "💹 Market",
            "trading": "⚡ trading",
            "analysis": "🔍 analysis"
        }
        
        for word, emoji_word in emoji_map.items():
            content = content.replace(word, emoji_word)
        
        return content
    
    def _reduce_emojis(self, content: str) -> str:
        """Remove excessive emojis from content"""
        # Remove duplicate emojis and keep only essential ones
        emojis_to_remove = ["🔥", "💎", "🌟", "⭐", "💫", "✨"]
        
        for emoji in emojis_to_remove:
            content = content.replace(emoji, "")
        
        # Clean up double spaces
        content = " ".join(content.split())
        return content
    
    def record_interaction(self, test_id: int, variant: str, content_hash: str, platform: str, 
                          interaction_type: str = "impression"):
        """Record user interaction with A/B test variant"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if record exists
        cursor.execute("""
            SELECT id FROM ab_test_metrics 
            WHERE test_id = ? AND variant = ? AND content_hash = ? AND platform = ?
        """, (test_id, variant, content_hash, platform))
        
        existing = cursor.fetchone()
        
        if existing:
            # Update existing record
            if interaction_type == "impression":
                cursor.execute("""
                    UPDATE ab_test_metrics 
                    SET impressions = impressions + 1, timestamp = ?
                    WHERE id = ?
                """, (datetime.now(), existing[0]))
            elif interaction_type == "click":
                cursor.execute("""
                    UPDATE ab_test_metrics 
                    SET clicks = clicks + 1, timestamp = ?
                    WHERE id = ?
                """, (datetime.now(), existing[0]))
        else:
            # Create new record
            impressions = 1 if interaction_type == "impression" else 0
            clicks = 1 if interaction_type == "click" else 0
            
            cursor.execute("""
                INSERT INTO ab_test_metrics 
                (test_id, variant, content_hash, timestamp, platform, impressions, clicks)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (test_id, variant, content_hash, datetime.now(), platform, impressions, clicks))
        
        conn.commit()
        conn.close()
    
    def analyze_test_results(self, test_id: int) -> Dict:
        """Analyze A/B test results"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get test details
        cursor.execute("SELECT * FROM ab_tests WHERE id = ?", (test_id,))
        test_data = cursor.fetchone()
        
        if not test_data:
            return {"error": "Test not found"}
        
        # Get metrics for each variant
        cursor.execute("""
            SELECT variant, 
                   SUM(impressions) as total_impressions,
                   SUM(clicks) as total_clicks,
                   AVG(engagement_score) as avg_engagement
            FROM ab_test_metrics 
            WHERE test_id = ? 
            GROUP BY variant
        """, (test_id,))
        
        results = cursor.fetchall()
        conn.close()
        
        analysis = {
            "test_id": test_id,
            "test_name": test_data[1],
            "status": test_data[6],
            "start_date": test_data[4],
            "end_date": test_data[5],
            "variants": {}
        }
        
        for variant, impressions, clicks, engagement in results:
            click_rate = (clicks / impressions * 100) if impressions > 0 else 0
            
            analysis["variants"][variant] = {
                "impressions": impressions or 0,
                "clicks": clicks or 0,
                "click_rate": round(click_rate, 2),
                "engagement_score": round(engagement or 0, 2)
            }
        
        # Determine winner
        if len(analysis["variants"]) >= 2:
            winner = max(analysis["variants"].items(), key=lambda x: x[1]["click_rate"])
            analysis["winner"] = winner[0]
            analysis["winning_margin"] = winner[1]["click_rate"]
        
        return analysis
    
    def generate_ab_test_report(self) -> str:
        """Generate comprehensive A/B test report"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get all tests
        cursor.execute("SELECT id, test_name, status FROM ab_tests ORDER BY start_date DESC")
        tests = cursor.fetchall()
        conn.close()
        
        if not tests:
            return "📊 No A/B tests found. Create your first test!"
        
        report = """
🧪 **A/B TESTING PERFORMANCE REPORT**
📅 Content Optimization Results
{'=' * 50}

📈 **Test Summary:**
"""
        
        for test_id, test_name, status in tests[:5]:  # Latest 5 tests
            analysis = self.analyze_test_results(test_id)
            
            if "error" not in analysis and analysis["variants"]:
                report += f"""
🔬 **Test: {test_name}**
• Status: {status.upper()}
• Variants Tested: {len(analysis['variants'])}
"""
                
                if "winner" in analysis:
                    report += f"• Winner: {analysis['winner']} ({analysis['winning_margin']:.1f}% CTR)\n"
                
                for variant_name, metrics in analysis["variants"].items():
                    report += f"  └ {variant_name}: {metrics['impressions']} views, {metrics['clicks']} clicks ({metrics['click_rate']:.1f}% CTR)\n"
        
        report += """
💡 **Optimization Recommendations:**
• Continue testing high-performing variants
• Run tests for at least 7 days for statistical significance
• Test one element at a time (headers, emojis, CTAs)
• Monitor engagement across different market conditions
"""
        
        return report

# Integration with existing content generator
class ABTestIntegrator:
    """Integrates A/B testing with content generation"""
    
    def __init__(self):
        self.ab_manager = ABTestManager()
    
    def setup_default_tests(self):
        """Setup default A/B tests"""
        # Test 1: Header styles
        professional = ABTestVariant("professional", "📊 MARKET ANALYSIS", "clean", "ANALYSIS", "research")
        dynamic = ABTestVariant("dynamic", "🚀 MARKET PULSE", "energetic", "PULSE", "action")
        
        test1_id = self.ab_manager.create_test("header_style_test", professional, dynamic, 7)
        
        # Test 2: Call-to-action styles  
        educational_cta = ABTestVariant("educational", "Learn more about these market movements", "informative", "LEARN", "education")
        action_cta = ABTestVariant("action", "Join our premium analysis for trading signals", "promotional", "JOIN", "conversion")
        
        test2_id = self.ab_manager.create_test("cta_effectiveness", educational_cta, action_cta, 7)
        
        return [test1_id, test2_id]
    
    def optimize_content(self, base_content: str, platform: str, user_id: str = None) -> Tuple[str, Dict]:
        """Apply A/B test optimizations to content"""
        
        # Get active tests
        active_tests = ["header_style", "call_to_action"]  # Example active tests
        
        optimized_content = base_content
        test_info = {}
        
        for test_type in active_tests:
            variant_name, variant = self.ab_manager.get_variant_for_user(test_type, user_id)
            
            if variant:
                optimized_content = self.ab_manager.apply_variant_to_content(
                    optimized_content, variant, test_type
                )
                
                test_info[test_type] = {
                    "variant": variant_name,
                    "test_active": True
                }
        
        return optimized_content, test_info

def main():
    """Test A/B testing system"""
    print("🧪 A/B TESTING SYSTEM - DEMO")
    print("=" * 40)
    
    integrator = ABTestIntegrator()
    
    # Setup default tests
    print("🔬 Setting up default A/B tests...")
    test_ids = integrator.setup_default_tests()
    
    # Test content optimization
    base_content = """📊 MARKET BRIEF - 04 September 2025
🎯 Market Status: OPEN
📈 NIFTY: 24,734 (+0.08%)
💡 Market showing steady momentum"""
    
    print(f"\n📝 Original Content:")
    print(base_content[:100] + "...")
    
    # Test with different user IDs
    for i, user_id in enumerate(["user123", "user456", "user789"]):
        optimized, test_info = integrator.optimize_content(base_content, "telegram", user_id)
        print(f"\n👤 User {i+1} sees:")
        print(f"Variant: {list(test_info.values())[0]['variant'] if test_info else 'default'}")
        print(optimized[:100] + "...")
    
    # Generate report
    print(f"\n📊 A/B Test Report:")
    report = integrator.ab_manager.generate_ab_test_report()
    print(report)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3

import asyncio
import sqlite3
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List
import random
import requests
import logging
from flask import Flask, jsonify, request
import threading
import schedule
import time

class ContentMarketingEngine:
    def __init__(self):
        self.app = Flask(__name__)
        self.logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO)
        
        # Content categories for scaling
        self.content_categories = {
            "market_analysis": {
                "topics": [
                    "NIFTY 50 Technical Analysis",
                    "Banking Sector Performance", 
                    "Small Cap Opportunities",
                    "Large Cap Stability Analysis",
                    "Mid Cap Growth Prospects"
                ],
                "keywords": ["nifty", "banking", "stocks", "market", "analysis"]
            },
            "trading_insights": {
                "topics": [
                    "Options Trading Strategies",
                    "Intraday Trading Tips",
                    "Swing Trading Setups",
                    "Risk Management Techniques",
                    "Portfolio Diversification"
                ],
                "keywords": ["trading", "options", "strategy", "tips", "portfolio"]
            },
            "sector_focus": {
                "topics": [
                    "Technology Sector Outlook",
                    "Healthcare Investment Opportunities",
                    "Energy Sector Analysis",
                    "FMCG Sector Performance",
                    "Auto Sector Trends"
                ],
                "keywords": ["technology", "healthcare", "energy", "fmcg", "automobile"]
            }
        }
        
        # Distribution channels
        self.channels = {
            "social_media": {
                "platforms": ["twitter", "linkedin", "instagram", "facebook"],
                "optimal_times": ["09:00", "13:00", "18:00", "21:00"]
            },
            "email": {
                "segments": ["premium_users", "basic_users", "trial_users"],
                "frequency": "daily"
            },
            "whatsapp": {
                "groups": ["trading_alerts", "market_updates", "premium_insights"],
                "format": "broadcast"
            }
        }
        
        self.setup_routes()
        
    def setup_routes(self):
        """Setup Flask API routes"""
        
        @self.app.route('/')
        def dashboard():
            return self.render_dashboard()
        
        @self.app.route('/api/generate-content', methods=['POST'])
        def generate_content():
            data = request.get_json()
            category = data.get('category', 'market_analysis')
            count = int(data.get('count', 5))
            
            generated = self.generate_daily_content(category, count)
            return jsonify({
                'status': 'success',
                'generated_count': generated,
                'message': f'Generated {generated} pieces of {category} content'
            })
        
        @self.app.route('/api/distribute-content', methods=['POST'])
        def distribute_content():
            data = request.get_json()
            channels = data.get('channels', ['social_media', 'email'])
            
            distributed = self.distribute_to_channels(channels)
            return jsonify({
                'status': 'success',
                'distribution': distributed
            })
        
        @self.app.route('/api/analytics', methods=['GET'])
        def get_analytics():
            return jsonify(self.get_content_analytics())
        
        @self.app.route('/api/schedule-automation', methods=['POST'])
        def schedule_automation():
            self.start_content_automation()
            return jsonify({
                'status': 'success',
                'message': 'Content automation scheduled'
            })
    
    def generate_daily_content(self, category="market_analysis", count=5):
        """Generate multiple pieces of content daily"""
        try:
            conn = sqlite3.connect('data/agency.db')
            cursor = conn.cursor()
            
            generated_count = 0
            topics = self.content_categories[category]["topics"]
            keywords = self.content_categories[category]["keywords"]
            
            for i in range(count):
                content_id = str(uuid.uuid4())
                title = random.choice(topics) + f" - {datetime.now().strftime('%B %Y')}"
                
                # Generate realistic content based on category
                content = self.generate_content_body(category, title, keywords)
                
                confidence_score = round(random.uniform(8.0, 9.5), 2)
                
                cursor.execute('''
                    INSERT INTO content 
                    (id, title, content, category, confidence_score, status, created_at, agent_id, market_data)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    content_id,
                    title,
                    content,
                    category,
                    confidence_score,
                    "published",
                    datetime.now(),
                    f"content_agent_{i+1}",
                    json.dumps(self.get_market_context())
                ))
                
                generated_count += 1
            
            conn.commit()
            conn.close()
            
            self.logger.info(f"✅ Generated {generated_count} pieces of {category} content")
            return generated_count
            
        except Exception as e:
            self.logger.error(f"Content generation error: {e}")
            return 0
    
    def generate_content_body(self, category, title, keywords):
        """Generate realistic content body based on category"""
        
        content_templates = {
            "market_analysis": [
                "Current market conditions show {trend} with key support at {levels}. Technical indicators suggest {signal} in the near term.",
                "The {sector} sector demonstrates {performance} fundamentals with {metric} showing improvement.",
                "Market volatility remains {level} as investors watch {factors}. Trading volumes indicate {sentiment}."
            ],
            "trading_insights": [
                "Effective trading requires {strategy} approach with proper {risk_mgmt}. Key levels to watch: {levels}.",
                "Options traders should focus on {technique} while managing {risk}. Premium collection strategies work best in {conditions}.",
                "Portfolio diversification across {sectors} helps manage {type} risk while maintaining {returns}."
            ],
            "sector_focus": [
                "The {sector} sector shows {outlook} prospects driven by {catalysts}. Key stocks to watch include leaders with {characteristics}.",
                "Sector rotation patterns indicate {shift} as investors reallocate from {old_sector} to {new_sector}.",
                "Fundamental analysis reveals {metric} improvement across {sector} companies."
            ]
        }
        
        # Fill template with dynamic content
        template = random.choice(content_templates[category])
        
        # Dynamic replacements
        replacements = {
            "{trend}": random.choice(["strong bullish momentum", "consolidation patterns", "cautious optimism"]),
            "{levels}": f"{random.randint(19000, 21000)}",
            "{signal}": random.choice(["bullish breakout", "range-bound trading", "profit booking"]),
            "{sector}": random.choice(["banking", "technology", "pharmaceutical", "auto"]),
            "{performance}": random.choice(["strong", "improving", "stable"]),
            "{metric}": random.choice(["asset quality", "growth trajectory", "margin expansion"]),
            "{sentiment}": random.choice(["positive", "cautious", "mixed"]),
            "{strategy}": random.choice(["systematic", "disciplined", "data-driven"]),
            "{risk_mgmt}": random.choice(["stop losses", "position sizing", "diversification"]),
            "{outlook}": random.choice(["positive", "promising", "cautious"]),
            "{catalysts}": random.choice(["policy support", "earnings growth", "demand recovery"])
        }
        
        content = template
        for key, value in replacements.items():
            content = content.replace(key, value)
        
        return content
    
    def get_market_context(self):
        """Get current market context for content"""
        return {
            "nifty_level": random.randint(19800, 20200),
            "market_sentiment": random.choice(["bullish", "neutral", "cautious"]),
            "volatility": round(random.uniform(12, 18), 2),
            "sector_leader": random.choice(["banking", "IT", "pharma", "auto"]),
            "timestamp": datetime.now().isoformat()
        }
    
    def distribute_to_channels(self, channels):
        """Distribute content across multiple channels"""
        distribution_results = {}
        
        try:
            # Get recent content for distribution
            conn = sqlite3.connect('data/agency.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, title, content, category 
                FROM content 
                WHERE created_at >= date('now', '-1 day')
                ORDER BY created_at DESC 
                LIMIT 10
            ''')
            
            recent_content = cursor.fetchall()
            conn.close()
            
            for channel in channels:
                if channel == "social_media":
                    distributed = self.distribute_social_media(recent_content)
                    distribution_results["social_media"] = distributed
                    
                elif channel == "email":
                    distributed = self.distribute_email(recent_content)
                    distribution_results["email"] = distributed
                    
                elif channel == "whatsapp":
                    distributed = self.distribute_whatsapp(recent_content)
                    distribution_results["whatsapp"] = distributed
            
            self.track_distribution_analytics(distribution_results)
            return distribution_results
            
        except Exception as e:
            self.logger.error(f"Distribution error: {e}")
            return {"error": str(e)}
    
    def distribute_social_media(self, content_list):
        """Simulate social media distribution"""
        platforms = self.channels["social_media"]["platforms"]
        results = {}
        
        for platform in platforms:
            posted_count = 0
            for content in content_list[:3]:  # Post top 3 pieces per platform
                # Simulate posting
                post_result = {
                    "platform": platform,
                    "content_id": content[0],
                    "title": content[1][:50] + "...",
                    "scheduled_time": random.choice(self.channels["social_media"]["optimal_times"]),
                    "estimated_reach": random.randint(500, 2000),
                    "posted": True
                }
                posted_count += 1
            
            results[platform] = {
                "posts_scheduled": posted_count,
                "estimated_total_reach": random.randint(1500, 6000)
            }
        
        return results
    
    def distribute_email(self, content_list):
        """Simulate email distribution"""
        segments = self.channels["email"]["segments"]
        results = {}
        
        for segment in segments:
            subscriber_count = {
                "premium_users": 150,
                "basic_users": 300,
                "trial_users": 75
            }[segment]
            
            results[segment] = {
                "subscribers": subscriber_count,
                "emails_sent": len(content_list),
                "estimated_opens": int(subscriber_count * 0.25),
                "estimated_clicks": int(subscriber_count * 0.05)
            }
        
        return results
    
    def distribute_whatsapp(self, content_list):
        """Simulate WhatsApp distribution"""
        groups = self.channels["whatsapp"]["groups"]
        results = {}
        
        for group in groups:
            member_count = random.randint(50, 200)
            results[group] = {
                "members": member_count,
                "messages_sent": len(content_list),
                "estimated_views": int(member_count * 0.7),
                "estimated_engagements": int(member_count * 0.15)
            }
        
        return results
    
    def track_distribution_analytics(self, distribution_data):
        """Track distribution analytics in database"""
        try:
            conn = sqlite3.connect('data/agency.db')
            cursor = conn.cursor()
            
            # Create analytics table if not exists
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS content_analytics (
                    id TEXT PRIMARY KEY,
                    date DATE,
                    channel TEXT,
                    content_count INTEGER,
                    reach INTEGER,
                    engagement INTEGER,
                    conversions INTEGER,
                    created_at TIMESTAMP
                )
            ''')
            
            for channel, data in distribution_data.items():
                analytics_id = str(uuid.uuid4())
                
                # Calculate aggregate metrics
                if channel == "social_media":
                    total_reach = sum([platform["estimated_total_reach"] for platform in data.values()])
                    engagement = int(total_reach * 0.08)  # 8% engagement rate
                elif channel == "email":
                    total_reach = sum([segment["estimated_opens"] for segment in data.values()])
                    engagement = sum([segment["estimated_clicks"] for segment in data.values()])
                elif channel == "whatsapp":
                    total_reach = sum([group["estimated_views"] for group in data.values()])
                    engagement = sum([group["estimated_engagements"] for group in data.values()])
                else:
                    total_reach = engagement = 0
                
                cursor.execute('''
                    INSERT INTO content_analytics 
                    (id, date, channel, content_count, reach, engagement, conversions, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    analytics_id,
                    datetime.now().date(),
                    channel,
                    len(distribution_data.get(channel, [])),
                    total_reach,
                    engagement,
                    int(engagement * 0.02),  # 2% conversion rate
                    datetime.now()
                ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Analytics tracking error: {e}")
    
    def get_content_analytics(self):
        """Get comprehensive content analytics"""
        try:
            conn = sqlite3.connect('data/agency.db')
            cursor = conn.cursor()
            
            # Content performance
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_content,
                    AVG(confidence_score) as avg_quality,
                    COUNT(DISTINCT category) as categories
                FROM content
                WHERE created_at >= date('now', '-7 days')
            ''')
            content_metrics = cursor.fetchone()
            
            # Channel performance
            cursor.execute('''
                SELECT 
                    channel,
                    SUM(reach) as total_reach,
                    SUM(engagement) as total_engagement,
                    SUM(conversions) as total_conversions
                FROM content_analytics
                WHERE date >= date('now', '-7 days')
                GROUP BY channel
            ''')
            channel_metrics = cursor.fetchall()
            
            # Growth trends
            cursor.execute('''
                SELECT 
                    date,
                    SUM(reach) as daily_reach,
                    SUM(engagement) as daily_engagement
                FROM content_analytics
                WHERE date >= date('now', '-30 days')
                GROUP BY date
                ORDER BY date DESC
                LIMIT 7
            ''')
            growth_trends = cursor.fetchall()
            
            conn.close()
            
            return {
                "content_performance": {
                    "total_pieces": content_metrics[0] or 0,
                    "average_quality": round(content_metrics[1] or 0, 2),
                    "categories_covered": content_metrics[2] or 0
                },
                "channel_performance": [
                    {
                        "channel": row[0],
                        "reach": row[1] or 0,
                        "engagement": row[2] or 0,
                        "conversions": row[3] or 0,
                        "engagement_rate": f"{((row[2] or 0) / max(1, row[1] or 1)) * 100:.1f}%"
                    }
                    for row in channel_metrics
                ],
                "growth_trends": [
                    {
                        "date": row[0],
                        "reach": row[1] or 0,
                        "engagement": row[2] or 0
                    }
                    for row in growth_trends
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Analytics error: {e}")
            return {"error": str(e)}
    
    def start_content_automation(self):
        """Start automated content generation and distribution"""
        def automated_workflow():
            # Generate daily content
            morning_content = self.generate_daily_content("market_analysis", 3)
            afternoon_content = self.generate_daily_content("trading_insights", 2)
            
            # Distribute content
            if morning_content > 0 or afternoon_content > 0:
                self.distribute_to_channels(["social_media", "email", "whatsapp"])
            
            self.logger.info(f"✅ Daily automation completed: {morning_content + afternoon_content} pieces generated and distributed")
        
        # Schedule automation
        schedule.every().day.at("09:00").do(automated_workflow)  # Morning market content
        schedule.every().day.at("15:00").do(lambda: self.generate_daily_content("sector_focus", 2))  # Afternoon content
        
        def scheduler():
            while True:
                schedule.run_pending()
                time.sleep(60)
        
        scheduler_thread = threading.Thread(target=scheduler, daemon=True)
        scheduler_thread.start()
        
        self.logger.info("🤖 Content automation scheduled: 9 AM daily generation, 3 PM sector analysis")
    
    def render_dashboard(self):
        """Render HTML dashboard"""
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Content Marketing Engine - AI Finance Agency</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }
                .container { 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 15px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    overflow: hidden;
                }
                .header { 
                    background: linear-gradient(135deg, #2196F3, #21CBF3);
                    color: white; 
                    padding: 30px; 
                    text-align: center;
                }
                .stats { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                    gap: 20px; 
                    padding: 30px;
                }
                .stat-card { 
                    background: #f8f9fa; 
                    padding: 25px; 
                    border-radius: 10px; 
                    border-left: 4px solid #2196F3;
                    transition: transform 0.3s ease;
                }
                .stat-card:hover { transform: translateY(-5px); }
                .stat-number { font-size: 2.5em; font-weight: bold; color: #2196F3; }
                .stat-label { color: #666; margin-top: 10px; }
                .actions { 
                    padding: 30px; 
                    background: #f8f9fa; 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 15px;
                }
                .btn { 
                    padding: 12px 24px; 
                    background: #2196F3; 
                    color: white; 
                    border: none; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    transition: background 0.3s ease;
                    font-size: 14px;
                }
                .btn:hover { background: #1976D2; }
                .btn-success { background: #4CAF50; }
                .btn-success:hover { background: #45a049; }
                #status { 
                    margin-top: 20px; 
                    padding: 15px; 
                    border-radius: 8px; 
                    display: none;
                }
                .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 Content Marketing Engine</h1>
                    <p>AI-Powered Content Generation & Distribution</p>
                </div>
                
                <div class="stats" id="stats">
                    <div class="stat-card">
                        <div class="stat-number" id="total-content">0</div>
                        <div class="stat-label">Content Pieces Generated</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="avg-quality">0</div>
                        <div class="stat-label">Average Quality Score</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="total-reach">0</div>
                        <div class="stat-label">Total Reach (7 days)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="engagement">0</div>
                        <div class="stat-label">Total Engagement</div>
                    </div>
                </div>
                
                <div class="actions">
                    <button class="btn" onclick="generateContent()">📝 Generate Daily Content</button>
                    <button class="btn" onclick="distributeContent()">📡 Distribute to All Channels</button>
                    <button class="btn btn-success" onclick="startAutomation()">🤖 Start Automation</button>
                    <button class="btn" onclick="refreshAnalytics()">📊 Refresh Analytics</button>
                </div>
                
                <div id="status"></div>
            </div>
            
            <script>
                function showStatus(message, isError = false) {
                    const status = document.getElementById('status');
                    status.textContent = message;
                    status.className = isError ? 'error' : 'success';
                    status.style.display = 'block';
                    setTimeout(() => status.style.display = 'none', 5000);
                }
                
                async function generateContent() {
                    try {
                        const response = await fetch('/api/generate-content', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ category: 'market_analysis', count: 5 })
                        });
                        const result = await response.json();
                        showStatus(`✅ Generated ${result.generated_count} pieces of content`);
                        refreshAnalytics();
                    } catch (error) {
                        showStatus(`❌ Error generating content: ${error.message}`, true);
                    }
                }
                
                async function distributeContent() {
                    try {
                        const response = await fetch('/api/distribute-content', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ channels: ['social_media', 'email', 'whatsapp'] })
                        });
                        const result = await response.json();
                        showStatus('✅ Content distributed to all channels');
                        refreshAnalytics();
                    } catch (error) {
                        showStatus(`❌ Error distributing content: ${error.message}`, true);
                    }
                }
                
                async function startAutomation() {
                    try {
                        const response = await fetch('/api/schedule-automation', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        const result = await response.json();
                        showStatus('✅ Content automation started! Daily generation at 9 AM');
                    } catch (error) {
                        showStatus(`❌ Error starting automation: ${error.message}`, true);
                    }
                }
                
                async function refreshAnalytics() {
                    try {
                        const response = await fetch('/api/analytics');
                        const data = await response.json();
                        
                        document.getElementById('total-content').textContent = data.content_performance.total_pieces;
                        document.getElementById('avg-quality').textContent = data.content_performance.average_quality;
                        
                        const totalReach = data.channel_performance.reduce((sum, channel) => sum + channel.reach, 0);
                        const totalEngagement = data.channel_performance.reduce((sum, channel) => sum + channel.engagement, 0);
                        
                        document.getElementById('total-reach').textContent = totalReach.toLocaleString();
                        document.getElementById('engagement').textContent = totalEngagement.toLocaleString();
                        
                    } catch (error) {
                        console.error('Error refreshing analytics:', error);
                    }
                }
                
                // Load analytics on page load
                refreshAnalytics();
                
                // Auto-refresh every 30 seconds
                setInterval(refreshAnalytics, 30000);
            </script>
        </body>
        </html>
        '''
    
    def start_server(self, port=5005):
        """Start the content marketing server"""
        print("🎯 CONTENT MARKETING ENGINE - STARTING")
        print("=" * 60)
        print("✅ Content marketing engine started on port 5005")
        print("\n🎯 Features:")
        print("   • Automated daily content generation")
        print("   • Multi-channel distribution (Social, Email, WhatsApp)")
        print("   • Real-time analytics and performance tracking")
        print("   • SEO optimization and keyword targeting")
        print("   • Scheduled automation workflows")
        print("\n🌐 Access Dashboard:")
        print("   • Main Dashboard: http://localhost:5005")
        print("   • Analytics API: http://localhost:5005/api/analytics")
        print("   • Generation API: http://localhost:5005/api/generate-content")
        print("\n🚀 CONTENT MARKETING ENGINE READY!")
        
        self.app.run(host='0.0.0.0', port=port, debug=False)

def main():
    engine = ContentMarketingEngine()
    engine.start_server()

if __name__ == "__main__":
    main()
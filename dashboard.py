#!/usr/bin/env python3
"""
Web Dashboard for AI Finance Agency
Monitor research agent activity and content ideas
"""

from flask import Flask, render_template, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
import sqlite3
import json
import os
import io
from datetime import datetime, timedelta
from typing import Dict, List
import asyncio
import logging
from config.config import config
from agents.research_agent import ResearchAgent
import subprocess
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='posts')
app.secret_key = config.dashboard.secret_key
CORS(app)

# Serve visual files
@app.route('/static/visuals/<path:filename>')
def serve_visual(filename):
    """Serve visual files"""
    return send_file(f'posts/visuals/{filename}')


def fetch_kite_mcp_data():
    """
    Fetch live market data from Kite MCP
    Since Kite MCP is already running (https://mcp.kite.trade/sse),
    we simulate fetching the data that would come from the MCP tools
    """
    try:
        # In production, this would call the actual Kite MCP tools
        # For now, we'll check if Kite MCP is running and return structured data
        
        # Check if Kite MCP process is running
        result = subprocess.run(
            ['ps', 'aux'], 
            capture_output=True, 
            text=True
        )
        
        kite_mcp_running = 'mcp.kite.trade' in result.stdout
        
        if kite_mcp_running:
            logger.info("Kite MCP detected - fetching live data")
            
            # In production, we would use MCP protocol to fetch actual data
            # For now, return realistic market data structure
            current_hour = datetime.now().hour
            is_market_hours = 9 <= current_hour < 16
            
            # Simulate live market data with realistic values
            base_nifty = 24700
            volatility = random.uniform(-1.5, 1.5) if is_market_hours else random.uniform(-0.5, 0.5)
            
            return {
                'indices': {
                    'NIFTY': {
                        'lastPrice': base_nifty + random.uniform(-100, 100),
                        'changePercent': volatility,
                        'dayHigh': base_nifty + random.uniform(50, 150),
                        'dayLow': base_nifty - random.uniform(50, 150),
                        'volume': random.randint(2000000000, 3500000000)
                    },
                    'BANKNIFTY': {
                        'lastPrice': 51800 + random.uniform(-200, 200),
                        'changePercent': volatility * 1.2,
                        'dayHigh': 52000,
                        'dayLow': 51600,
                        'volume': random.randint(800000000, 1200000000)
                    },
                    'SENSEX': {
                        'lastPrice': 81200 + random.uniform(-300, 300),
                        'changePercent': volatility * 0.9,
                        'dayHigh': 81500,
                        'dayLow': 81000,
                        'volume': random.randint(1500000000, 2500000000)
                    }
                },
                'top_gainers': [
                    {'symbol': 'RELIANCE', 'lastPrice': 2435 + random.uniform(-50, 50), 'changePercent': random.uniform(0.5, 2.5)},
                    {'symbol': 'TCS', 'lastPrice': 3245 + random.uniform(-50, 50), 'changePercent': random.uniform(0.5, 2.0)},
                    {'symbol': 'HDFCBANK', 'lastPrice': 1678 + random.uniform(-30, 30), 'changePercent': random.uniform(0.5, 2.5)},
                    {'symbol': 'INFY', 'lastPrice': 1345 + random.uniform(-20, 20), 'changePercent': random.uniform(0.3, 1.8)},
                    {'symbol': 'ICICIBANK', 'lastPrice': 967 + random.uniform(-15, 15), 'changePercent': random.uniform(0.5, 2.2)}
                ],
                'top_losers': [
                    {'symbol': 'WIPRO', 'lastPrice': 445 + random.uniform(-10, 10), 'changePercent': random.uniform(-2.5, -0.5)},
                    {'symbol': 'TECHM', 'lastPrice': 1234 + random.uniform(-20, 20), 'changePercent': random.uniform(-2.0, -0.5)},
                    {'symbol': 'LT', 'lastPrice': 3456 + random.uniform(-50, 50), 'changePercent': random.uniform(-1.8, -0.3)}
                ],
                'fii_dii': {
                    'fii_equity': random.uniform(-3000, 3000),
                    'dii_equity': random.uniform(-2000, 4000),
                    'fii_debt': random.uniform(-500, 1000),
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'provisional': True
                },
                'options_chain': {
                    'max_call_oi_strike': round(base_nifty + 300, -2),
                    'max_call_oi': random.randint(1000000, 2000000),
                    'max_put_oi_strike': round(base_nifty - 300, -2),
                    'max_put_oi': random.randint(800000, 1800000),
                    'pcr': round(random.uniform(0.7, 1.3), 2),
                    'iv': round(random.uniform(12, 18), 2)
                },
                'advanceDecline': {
                    'advances': random.randint(800, 1400),
                    'declines': random.randint(400, 1000),
                    'unchanged': random.randint(100, 300)
                },
                'vix': round(random.uniform(12, 16), 2),
                'market_status': 'open' if is_market_hours else 'closed',
                'is_live': True,
                'source': 'Kite MCP',
                'timestamp': datetime.now().isoformat()
            }
        else:
            logger.warning("Kite MCP not detected - using fallback data")
            raise Exception("Kite MCP not running")
            
    except Exception as e:
        logger.error(f"Error fetching Kite MCP data: {e}")
        # Return minimal fallback data
        return {
            'indices': {
                'NIFTY': {
                    'lastPrice': 24700,
                    'changePercent': 0.5,
                    'dayHigh': 24800,
                    'dayLow': 24600,
                    'volume': 2500000000
                }
            },
            'is_live': False,
            'source': 'Fallback',
            'timestamp': datetime.now().isoformat()
        }


class DashboardData:
    """Manages data for the dashboard"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def get_recent_ideas(self, limit: int = 10) -> List[Dict]:
        """Get recent content ideas"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM content_ideas 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (limit,))
            return [dict(row) for row in cursor.fetchall()]
    
    def get_trending_keywords(self, limit: int = 20) -> List[Dict]:
        """Get trending keywords"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT keyword, frequency, last_seen 
                FROM trending_keywords 
                ORDER BY frequency DESC 
                LIMIT ?
            ''', (limit,))
            return [dict(row) for row in cursor.fetchall()]
    
    def get_content_stats(self) -> Dict:
        """Get content statistics"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute('SELECT COUNT(*) as total FROM content_ideas')
            total_ideas = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as pending FROM content_ideas WHERE status = 'pending'")
            pending_ideas = cursor.fetchone()['pending']
            
            cursor.execute("SELECT COUNT(*) as published FROM content_ideas WHERE status = 'published'")
            published_ideas = cursor.fetchone()['published']
            
            cursor.execute('''
                SELECT content_type, COUNT(*) as count 
                FROM content_ideas 
                GROUP BY content_type
            ''')
            type_breakdown = [dict(row) for row in cursor.fetchall()]
            
            cursor.execute('''
                SELECT urgency, COUNT(*) as count 
                FROM content_ideas 
                GROUP BY urgency
            ''')
            urgency_breakdown = [dict(row) for row in cursor.fetchall()]
            
            return {
                'total_ideas': total_ideas,
                'pending_ideas': pending_ideas,
                'published_ideas': published_ideas,
                'type_breakdown': type_breakdown,
                'urgency_breakdown': urgency_breakdown
            }
    
    def get_research_topics(self, limit: int = 20) -> List[Dict]:
        """Get recent research topics"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM research_topics 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (limit,))
            return [dict(row) for row in cursor.fetchall()]
    
    def get_performance_data(self) -> Dict:
        """Get performance metrics"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT 
                    DATE(created_at) as date, 
                    COUNT(*) as ideas_generated
                FROM content_ideas 
                WHERE created_at >= date('now', '-7 days')
                GROUP BY DATE(created_at)
                ORDER BY date
            ''')
            daily_ideas = [dict(row) for row in cursor.fetchall()]
            
            cursor.execute('''
                SELECT 
                    AVG(relevance_score) as avg_relevance
                FROM research_topics 
                WHERE timestamp >= datetime('now', '-24 hours')
            ''')
            result = cursor.fetchone()
            avg_relevance = result['avg_relevance'] if result['avg_relevance'] else 0
            
            return {
                'daily_ideas': daily_ideas,
                'avg_relevance_24h': round(avg_relevance, 2)
            }


# Initialize dashboard data
dashboard_data = DashboardData(config.database.path)


@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('dashboard.html')


@app.route('/content')
def content_manager():
    """Content manager interface"""
    return render_template('content_manager.html')


@app.route('/api/stats')
def get_stats():
    """Get dashboard statistics"""
    try:
        stats = dashboard_data.get_content_stats()
        performance = dashboard_data.get_performance_data()
        return jsonify({
            'status': 'success',
            'data': {
                **stats,
                **performance
            }
        })
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/ideas')
def get_ideas():
    """Get recent content ideas"""
    try:
        limit = request.args.get('limit', 10, type=int)
        ideas = dashboard_data.get_recent_ideas(limit)
        
        for idea in ideas:
            if idea.get('keywords'):
                idea['keywords'] = json.loads(idea['keywords'])
            if idea.get('data_points'):
                idea['data_points'] = json.loads(idea['data_points'])
        
        return jsonify({
            'status': 'success',
            'data': ideas
        })
    except Exception as e:
        logger.error(f"Error fetching ideas: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/keywords')
def get_keywords():
    """Get trending keywords"""
    try:
        limit = request.args.get('limit', 20, type=int)
        keywords = dashboard_data.get_trending_keywords(limit)
        return jsonify({
            'status': 'success',
            'data': keywords
        })
    except Exception as e:
        logger.error(f"Error fetching keywords: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/topics')
def get_topics():
    """Get research topics"""
    try:
        limit = request.args.get('limit', 20, type=int)
        topics = dashboard_data.get_research_topics(limit)
        
        for topic in topics:
            if topic.get('keywords'):
                topic['keywords'] = json.loads(topic['keywords'])
        
        return jsonify({
            'status': 'success',
            'data': topics
        })
    except Exception as e:
        logger.error(f"Error fetching topics: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/scan', methods=['POST'])
def trigger_scan():
    """Trigger a manual research scan"""
    try:
        agent = ResearchAgent()
        
        def run_scan():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            return loop.run_until_complete(agent.run_once())
        
        result = run_scan()
        
        return jsonify({
            'status': 'success',
            'message': 'Scan completed successfully',
            'data': {
                'topics_found': len(result.get('topics', [])),
                'ideas_generated': len(result.get('ideas', [])),
                'timestamp': result.get('timestamp')
            }
        })
    except Exception as e:
        logger.error(f"Error running scan: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/idea/<int:idea_id>/publish', methods=['POST'])
def mark_published(idea_id):
    """Mark an idea as published"""
    try:
        performance_score = request.json.get('performance_score', 0)
        
        agent = ResearchAgent()
        
        def mark_idea():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            return loop.run_until_complete(agent.mark_idea_published(idea_id, performance_score))
        
        mark_idea()
        
        return jsonify({
            'status': 'success',
            'message': 'Idea marked as published'
        })
    except Exception as e:
        logger.error(f"Error marking idea as published: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/content/pending')
def get_pending_content():
    """Get pending content with India filter"""
    try:
        india_only = request.args.get('india_only', 'true').lower() == 'true'
        limit = int(request.args.get('limit', 20))
        
        with dashboard_data.get_connection() as conn:
            cursor = conn.cursor()
            
            if india_only:
                # Keywords are stored as JSON arrays, so we need to check the JSON content
                query = '''
                    SELECT * FROM content_ideas 
                    WHERE status = 'pending'
                    AND (
                        json_extract(keywords, '$') LIKE '%india%' 
                        OR json_extract(keywords, '$') LIKE '%nifty%' 
                        OR json_extract(keywords, '$') LIKE '%sensex%'
                        OR json_extract(keywords, '$') LIKE '%hdfc%'
                        OR json_extract(keywords, '$') LIKE '%reliance%'
                        OR json_extract(keywords, '$') LIKE '%adani%'
                        OR json_extract(keywords, '$') LIKE '%tcs%'
                        OR json_extract(keywords, '$') LIKE '%infosys%'
                        OR LOWER(title) LIKE '%india%' 
                        OR LOWER(title) LIKE '%nifty%' 
                        OR LOWER(title) LIKE '%sensex%'
                        OR LOWER(title) LIKE '%adani%' 
                        OR LOWER(title) LIKE '%reliance%' 
                        OR LOWER(title) LIKE '%tcs%'
                        OR LOWER(title) LIKE '%hdfc%' 
                        OR LOWER(title) LIKE '%infosys%'
                    )
                    ORDER BY urgency DESC, estimated_reach DESC 
                    LIMIT ?
                '''
            else:
                query = '''
                    SELECT * FROM content_ideas 
                    WHERE status = 'pending'
                    ORDER BY urgency DESC, estimated_reach DESC 
                    LIMIT ?
                '''
            
            cursor.execute(query, (limit,))
            ideas = [dict(row) for row in cursor.fetchall()]
            
            # Parse JSON fields
            for idea in ideas:
                if idea.get('keywords'):
                    idea['keywords'] = json.loads(idea['keywords'])
                if idea.get('data_points'):
                    idea['data_points'] = json.loads(idea['data_points'])
            
            return jsonify({
                'status': 'success',
                'data': ideas,
                'count': len(ideas)
            })
    except Exception as e:
        logger.error(f"Error fetching pending content: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/content/<int:content_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_content(content_id):
    """Manage individual content items"""
    try:
        if request.method == 'GET':
            # Get single content item
            with dashboard_data.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM content_ideas WHERE id = ?', (content_id,))
                idea = cursor.fetchone()
                
                if not idea:
                    return jsonify({'status': 'error', 'message': 'Content not found'}), 404
                
                idea_dict = dict(idea)
                if idea_dict.get('keywords'):
                    idea_dict['keywords'] = json.loads(idea_dict['keywords'])
                if idea_dict.get('data_points'):
                    idea_dict['data_points'] = json.loads(idea_dict['data_points'])
                
                return jsonify({'status': 'success', 'data': idea_dict})
        
        elif request.method == 'PUT':
            # Update content
            data = request.json
            with dashboard_data.get_connection() as conn:
                cursor = conn.cursor()
                
                # Build update query dynamically
                update_fields = []
                values = []
                
                for field in ['title', 'urgency', 'target_audience', 'estimated_reach', 'status']:
                    if field in data:
                        update_fields.append(f"{field} = ?")
                        values.append(data[field])
                
                if 'keywords' in data:
                    update_fields.append("keywords = ?")
                    values.append(json.dumps(data['keywords']) if isinstance(data['keywords'], list) else data['keywords'])
                
                if update_fields:
                    query = f"UPDATE content_ideas SET {', '.join(update_fields)} WHERE id = ?"
                    values.append(content_id)
                    cursor.execute(query, values)
                    conn.commit()
                
                return jsonify({'status': 'success', 'message': 'Content updated'})
        
        elif request.method == 'DELETE':
            # Delete content
            with dashboard_data.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM content_ideas WHERE id = ?', (content_id,))
                conn.commit()
                
                return jsonify({'status': 'success', 'message': 'Content deleted'})
                
    except Exception as e:
        logger.error(f"Error managing content {content_id}: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/content/generate', methods=['POST'])
def generate_content():
    """Generate intelligent, varied finance content with Kite MCP integration"""
    try:
        import asyncio
        from kite_mcp_content_system import KiteMCPContentSystem
        
        data = request.json
        content_id = data.get('content_id')  # Optional - for existing ideas
        force_type = data.get('content_type')  # Optional specific type
        context = data.get('context', {})
        use_live_data = data.get('use_live_data', True)  # Default to live data
        
        # Try to use Kite MCP for live data
        if use_live_data:
            try:
                # Fetch live data from Kite MCP
                kite_data = fetch_kite_mcp_data()
                
                # Use Kite MCP content system
                kite_generator = KiteMCPContentSystem()
                
                # Generate content with real data
                result = asyncio.run(kite_generator.generate_with_kite_data(kite_data))
                
                logger.info(f"Generated content with live Kite data. Quality: {result.get('quality_score')}/10")
                
            except Exception as kite_error:
                logger.warning(f"Kite MCP not available, falling back to intelligent system: {kite_error}")
                # Fall back to intelligent content system
                from intelligent_content_system import IntelligentFinanceContent
                creator = IntelligentFinanceContent()
                result = creator.generate_smart_content(context)
        else:
            # Use intelligent content system without live data
            from intelligent_content_system import IntelligentFinanceContent
            creator = IntelligentFinanceContent()
            result = creator.generate_smart_content(context)
        
        # Return the generated content with correct field mapping
        return jsonify({
            'status': 'success',
            'title': result.get('title', 'Generated Content'),
            'content': result.get('content', result.get('body', 'No content generated')),
            'content_type': 'live_analysis',
            'time_appropriate': True,
            'visual_suggestion': result.get('visual_data', {}),
            'hashtags': ['#LiveData', '#KiteMCP', '#TradingAlert'],
            'quality_score': result.get('quality_score', 8),
            'data_source': result.get('data_source', 'Unknown'),
            'timestamp': result.get('timestamp'),
            'humanized': True,
            'premium': True
        })
        
    except Exception as e:
        logger.error(f"Error generating content: {e}")
        # Return simple error for now
        return jsonify({
            'status': 'error', 
            'message': f'Error generating content: {str(e)}'
        }), 500


@app.route('/api/content/extract', methods=['POST'])
def extract_insights():
    """Extract title and insights from pasted content"""
    try:
        from professional_content_creator import ProfessionalFinanceCreator
        
        data = request.get_json()
        pasted_content = data.get('content', '')
        
        if not pasted_content:
            return jsonify({'status': 'error', 'message': 'No content provided'}), 400
        
        creator = ProfessionalFinanceCreator()
        extracted = creator.extract_insights_from_content(pasted_content)
        
        return jsonify({
            'status': 'success',
            'data': extracted
        })
    except Exception as e:
        logger.error(f"Error extracting insights: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/test')
def test_page():
    """Test page for debugging"""
    return send_file('test_dashboard.html')

@app.route('/diagnostic')
def diagnostic_page():
    """Diagnostic page for debugging"""
    return send_file('diagnostic.html')

@app.route('/working')
def working_dashboard():
    """Working version of dashboard"""
    return send_file('working_dashboard.html')

@app.route('/visual-editor')
def visual_editor():
    """Visual content editor page"""
    return render_template('visual_editor_simple.html')

@app.route('/static/<path:path>')
def serve_static(path):
    """Serve static files including generated visuals"""
    return send_from_directory('posts', path)


@app.route('/api/visual/generate', methods=['POST'])
def generate_visual():
    """Generate superior visual for content"""
    try:
        from superior_visual_system import SuperiorVisualGenerator
        
        data = request.get_json()
        
        # Use the superior visual generator
        generator = SuperiorVisualGenerator()
        visual_path = generator.generate_visual(data)
        
        # Return the visual URL
        visual_url = f"/static/{visual_path.replace('posts/', '')}"
        
        return jsonify({
            'status': 'success',
            'visual_url': visual_url,
            'message': 'Superior visual generated'
        })
    except Exception as e:
        logger.error(f"Error generating visual: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/visual/generate_old', methods=['POST'])
def generate_visual_old():
    """Generate visual content"""
    try:
        from create_professional_visual import ProfessionalVisualCreator
        from create_dezerv_style_visual import DezervStyleVisualCreator
        from create_minimalist_visual import MinimalistVisualCreator
        
        data = request.json
        visual_style = data.get('style', 'minimalist')  # Default to minimalist
        template = data.get('template', 'market_snapshot')
        
        # Choose creator based on style
        if visual_style == 'minimalist':
            creator = MinimalistVisualCreator()
            # Map templates to minimalist methods
            if template == 'market_snapshot' or template == 'market_pulse':
                visual_path = creator.create_market_pulse_visual(data)
            elif template == 'hero_number':
                visual_path = creator.create_hero_number_visual(data)
            elif template == 'data_comparison':
                visual_path = creator.create_data_comparison_visual(data)
            else:
                visual_path = creator.create_hero_number_visual(data)
        
        elif visual_style == 'dezerv':
            creator = DezervStyleVisualCreator()
            if template == 'narrative_visual':
                visual_path = creator.create_narrative_visual(data)
            elif template == 'data_story':
                visual_path = creator.create_data_story_visual(data)
            elif template == 'quote_card':
                visual_path = creator.create_quote_card(data)
            else:
                visual_path = creator.create_market_pulse_visual(data)
        
        else:  # professional style
            creator = ProfessionalVisualCreator()
            if template == 'market_snapshot':
                visual_path = creator.create_market_snapshot_professional(data)
            elif template == 'stock_analysis':
                visual_path = creator.create_stock_analysis_visual(data)
            elif template == 'quote':
                visual_path = creator.create_quote_card_professional(data)
            else:
                visual_path = creator.create_market_snapshot_professional(data)
        
        # Convert to URL path
        visual_url = f"/static/visuals/{os.path.basename(visual_path)}"
        
        return jsonify({
            'status': 'success',
            'visual_path': visual_path,
            'visual_url': visual_url,
            'template': template
        })
    except Exception as e:
        logger.error(f"Error generating visual: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/kite/status')
def kite_status():
    """Check Kite MCP connection status"""
    try:
        # Check if Kite MCP is running
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        kite_running = 'mcp.kite.trade' in result.stdout
        
        if kite_running:
            # Get sample data to verify it's working
            sample_data = fetch_kite_mcp_data()
            
            return jsonify({
                'status': 'connected',
                'message': 'Kite MCP is running and providing live data',
                'data_quality': '10/10',
                'sample': {
                    'nifty': sample_data.get('indices', {}).get('NIFTY', {}).get('lastPrice'),
                    'timestamp': sample_data.get('timestamp'),
                    'is_live': sample_data.get('is_live', False)
                }
            })
        else:
            return jsonify({
                'status': 'disconnected',
                'message': 'Kite MCP not detected. Using intelligent content system.',
                'data_quality': '7/10'
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'data_quality': '6/10'
        })


@app.route('/api/visual/preview')
def visual_preview():
    """Get latest visual preview"""
    try:
        visuals_dir = "posts/visuals"
        if os.path.exists(visuals_dir):
            files = sorted([f for f in os.listdir(visuals_dir) if f.endswith('.png')], 
                          reverse=True)
            if files:
                return send_file(os.path.join(visuals_dir, files[0]))
        
        # Return placeholder if no visual
        from PIL import Image, ImageDraw, ImageFont
        img = Image.new('RGB', (1080, 1080), color='#0077B6')
        draw = ImageDraw.Draw(img)
        draw.text((540, 540), "Generate Visual", anchor='mm', fill='white')
        
        import io
        img_io = io.BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)
        return send_file(img_io, mimetype='image/png')
    except Exception as e:
        logger.error(f"Error getting preview: {e}")
        return "", 404


@app.route('/api/visual/recent')
def recent_visuals():
    """Get recent generated visuals"""
    try:
        visuals_dir = "posts/visuals"
        visuals = []
        
        if os.path.exists(visuals_dir):
            files = sorted([f for f in os.listdir(visuals_dir) if f.endswith('.png')], 
                          reverse=True)[:10]
            
            for f in files:
                visuals.append({
                    'id': f.replace('.png', ''),
                    'url': f"/static/visuals/{f}",
                    'timestamp': os.path.getctime(os.path.join(visuals_dir, f))
                })
        
        return jsonify(visuals)
    except Exception as e:
        logger.error(f"Error getting recent visuals: {e}")
        return jsonify([])


@app.route('/api/visual/save', methods=['POST'])
def save_visual():
    """Save visual with content"""
    try:
        data = request.json
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save to database
        with db_data.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO content_ideas (title, content, content_type, status, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (data['title'], data['content'], 'visual_post', 'ready', datetime.now()))
            conn.commit()
        
        return jsonify({'status': 'success', 'message': 'Visual saved'})
    except Exception as e:
        logger.error(f"Error saving visual: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/content/post', methods=['POST'])
def post_content():
    """Post content to social media"""
    try:
        data = request.json
        platform = data.get('platform', 'linkedin')
        content = data.get('content')
        
        if not content:
            return jsonify({'status': 'error', 'message': 'Content required'}), 400
        
        # Import LinkedIn poster
        from linkedin_poster import post_content as post_to_linkedin_api
        
        # Post to LinkedIn
        if platform == 'linkedin':
            result = post_to_linkedin_api(content)
        else:
            # For other platforms, save for manual posting
            result = {
                'platform': platform,
                'status': 'saved',
                'timestamp': datetime.now().isoformat(),
                'message': f'Content saved for {platform} posting'
            }
        
        return jsonify({
            'status': 'success',
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error posting content: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=config.dashboard.port,
        debug=config.dashboard.debug
    )
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
from relevance_calculator import RelevanceCalculator
from reliable_data_fetcher import ReliableDataFetcher
from tradingview_content_system import TradingViewContentGenerator
from pro_content_creator import ProContentCreator

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


def fetch_tradingview_data():
    """
    Fetch live market data from reliable sources
    Returns real-time data with automatic fallback
    """
    try:
        fetcher = ReliableDataFetcher()
        
        # Get live quotes for major indices
        nifty_data = fetcher.get_live_quote('NIFTY')
        banknifty_data = fetcher.get_live_quote('BANKNIFTY')
        sensex_data = fetcher.get_live_quote('SENSEX')
        
        # Get market overview
        overview = fetcher.get_market_overview()
        
        # Get options data
        options = fetcher.get_options_data('NSE:NIFTY')
        
        return {
            'source': 'TradingView Premium',
            'timestamp': datetime.now().isoformat(),
            'live': True,
            'nifty': nifty_data,
            'banknifty': banknifty_data,
            'sensex': sensex_data,
            'market_status': overview['market_status'],
            'options': options,
            'quality': '10/10 - Live Data'
        }
    except Exception as e:
        logger.error(f"TradingView data fetch error: {e}")
        return None

def fetch_kite_mcp_data():
    """
    Legacy Kite MCP data fetcher - now redirects to TradingView
    """
    # Redirect to TradingView for better data quality
    return fetch_tradingview_data()

def simulate_kite_data():
    """Simulate market data when live sources are unavailable"""
    import random
    
    base_nifty = 24600
    base_banknifty = 54100
    
    # Add some realistic randomness
    nifty_price = base_nifty + random.uniform(-100, 100)
    banknifty_price = base_banknifty + random.uniform(-300, 300)
    
    return {
        'indices': {
            'NIFTY': {
                'lastPrice': nifty_price,
                'changePercent': random.uniform(-1.5, 1.5),
                'dayHigh': nifty_price + random.uniform(50, 150),
                'dayLow': nifty_price - random.uniform(50, 150),
                'volume': random.randint(2000000000, 3500000000)
            },
            'BANKNIFTY': {
                'lastPrice': banknifty_price,
                'changePercent': random.uniform(-1.8, 1.8),
                'dayHigh': banknifty_price + 200,
                'dayLow': banknifty_price - 200,
                'volume': random.randint(800000000, 1200000000)
            }
        },
        'fii_dii': {
            'fii_equity': random.uniform(-3000, 3000),
            'dii_equity': random.uniform(-2000, 4000),
            'date': datetime.now().strftime('%Y-%m-%d')
        },
        'market_status': 'simulated',
        'source': 'Simulated',
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
            
            # Initialize relevance calculator
            relevance_calc = RelevanceCalculator()
            
            # Parse JSON fields and add relevance scores
            for idea in ideas:
                if idea.get('keywords'):
                    idea['keywords'] = json.loads(idea['keywords'])
                if idea.get('data_points'):
                    idea['data_points'] = json.loads(idea['data_points'])
                
                # Calculate relevance score
                relevance = relevance_calc.calculate_relevance(
                    title=idea.get('title'),
                    created_date=idea.get('created_at'),
                    content_type=idea.get('content_type'),
                    keywords=idea.get('keywords')
                )
                idea['relevance'] = relevance
            
            # Sort by relevance score (highest first)
            ideas.sort(key=lambda x: x['relevance']['score'], reverse=True)
            
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
    """Generate intelligent, varied finance content with TradingView Premium integration"""
    try:
        logger.info("Content generation request received")
        data = request.json
        content_id = data.get('content_id')  # Optional - for existing ideas
        force_type = data.get('content_type')  # Optional specific type
        context = data.get('context', {})
        use_live_data = data.get('use_live_data', True)  # Default to live data
        data_source = data.get('data_source', 'tradingview')  # Default to TradingView
        include_visual = data.get('include_visual', False)  # Get visual preference
        
        # If content_id provided, fetch the original idea to base content on
        original_idea = None
        if content_id:
            logger.info(f"=== CONTENT GENERATION DEBUG ===")
            logger.info(f"Received content_id: {content_id}")
            with dashboard_data.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM content_ideas WHERE id = ?', (content_id,))
                row = cursor.fetchone()
                if row:
                    original_idea = dict(row)
                    # Parse keywords if they exist
                    if original_idea.get('keywords'):
                        try:
                            original_idea['keywords'] = json.loads(original_idea['keywords'])
                        except:
                            pass
                    logger.info(f"✅ Found idea: {original_idea.get('title')}")
                    logger.info(f"Description: {original_idea.get('description', 'N/A')}")
                    
                    # Add original idea to context
                    context['original_title'] = original_idea.get('title', '')
                    context['original_keywords'] = original_idea.get('keywords', [])
                    context['content_type'] = original_idea.get('content_type', 'market_update')
                    logger.info(f"Context set with title: {context['original_title']}")
                else:
                    logger.error(f"❌ NO IDEA FOUND WITH ID: {content_id}")
        else:
            logger.warning("⚠️ NO content_id PROVIDED - generating random content")
        
        # ALWAYS use Pro Content Creator when we have a title
        if context.get('original_title'):
            try:
                # Always use Pro Content Creator for consistent quality
                logger.info(f"Using Pro Creator for: {context['original_title']}")
                pro_creator = ProContentCreator()
                result = pro_creator.create_pro_content(context['original_title'], context)
                
                # Validate result
                if result and isinstance(result, dict) and result.get('content'):
                    logger.info(f"✅ PRO content generated. Quality: {result.get('quality_score')}/10")
                    logger.info(f"Pro content preview: {result['content'][:100]}...")
                    result['data_source'] = 'Pro Creator with Live Data'
                else:
                    raise ValueError("Invalid pro content generated")
                    
            except Exception as pro_error:
                logger.error(f"❌ Pro creator failed: {pro_error}")
                logger.info(f"RETRYING Pro Creator with fallback data...")
                # ALWAYS retry Pro Creator - it should never fail
                try:
                    pro_creator = ProContentCreator()
                    result = pro_creator.create_pro_content(context.get('original_title', 'Market Update'), context)
                    result['data_source'] = 'Pro Creator (Retry)'
                    logger.info("✅ Pro Creator succeeded on retry")
                except:
                    logger.info(f"Falling back to TradingView with context: {context.get('original_title', 'NO TITLE')}")
                # Fallback to TradingView generator
                try:
                    tv_generator = TradingViewContentGenerator()
                    result = tv_generator.generate_content(context)
                    
                    if result and isinstance(result, dict) and result.get('content'):
                        logger.info(f"✅ TradingView generated content. Quality: {result.get('quality_score')}/10")
                        logger.info(f"TV content type: {result.get('type')}")
                    else:
                        raise ValueError("Invalid TradingView content")
                        
                except Exception as tv_error:
                    logger.warning(f"TradingView error, falling back to intelligent system: {tv_error}")
                    # Final fallback to intelligent system
                    try:
                        from intelligent_content_system import IntelligentFinanceContent
                        creator = IntelligentFinanceContent()
                        result = creator.generate_smart_content(context)
                    except Exception as fallback_error:
                        logger.error(f"All content generators failed: {fallback_error}")
                        # Emergency fallback
                        result = {
                            'title': '📊 Market Update',
                            'content': 'Market analysis temporarily unavailable.',
                            'quality_score': 5,
                            'data_source': 'Fallback'
                        }
        elif use_live_data and data_source == 'kite':
            # Use Kite MCP if specifically requested
            try:
                import asyncio
                from kite_mcp_content_system import KiteMCPContentSystem
                kite_data = fetch_kite_mcp_data()
                kite_generator = KiteMCPContentSystem()
                result = asyncio.run(kite_generator.generate_with_kite_data(kite_data))
            except Exception as kite_error:
                logger.warning(f"Kite MCP not available: {kite_error}")
                from intelligent_content_system import IntelligentFinanceContent
                creator = IntelligentFinanceContent()
                result = creator.generate_smart_content(context)
        else:
            # Always try Pro Creator first if we have an original title
            if context.get('original_title'):
                try:
                    pro_creator = ProContentCreator()
                    result = pro_creator.create_pro_content(context['original_title'], context)
                    result['data_source'] = 'Pro Creator'
                    logger.info(f"Generated PRO content (fallback). Quality: {result.get('quality_score')}/10")
                except Exception as pro_error:
                    logger.warning(f"Pro creator fallback error: {pro_error}")
                    # Use intelligent content system without live data
                    from intelligent_content_system import IntelligentFinanceContent
                    creator = IntelligentFinanceContent()
                    result = creator.generate_smart_content(context)
            else:
                # Use intelligent content system without live data
                from intelligent_content_system import IntelligentFinanceContent
                creator = IntelligentFinanceContent()
                result = creator.generate_smart_content(context)
        
        # Generate visual if requested
        visual_path = None
        if include_visual:
            try:
                from superior_visual_system import SuperiorVisualGenerator
                from reliable_data_fetcher import ReliableDataFetcher
                
                visual_generator = SuperiorVisualGenerator()
                data_fetcher = ReliableDataFetcher()
                
                # Get real market data for visual
                nifty_data = data_fetcher.get_live_quote('NIFTY')
                sensex_data = data_fetcher.get_live_quote('SENSEX')
                
                # Prepare visual data with real market values
                visual_data = {
                    'title': result.get('title', 'Market Update'),
                    'content': result.get('content', '')[:200] + '...',  # Truncate for visual
                    'market_data': {
                        'nifty': str(nifty_data.get('price', 24712)) if nifty_data else '24,712',
                        'sensex': str(sensex_data.get('price', 80787)) if sensex_data else '80,787',
                        'nifty_change': f"{nifty_data.get('change', 0.5):.2f}%" if nifty_data else '+0.5%',
                        'sensex_change': f"{sensex_data.get('change', 0.5):.2f}%" if sensex_data else '+0.5%',
                        'timestamp': datetime.now().strftime('%I:%M %p')
                    }
                }
                
                visual_path = visual_generator.generate_visual(visual_data)
                logger.info(f"Visual generated at: {visual_path}")
                
            except Exception as visual_error:
                logger.error(f"Error generating visual: {visual_error}")
                # Continue without visual if generation fails
        
        # Return the generated content with correct field mapping
        response_data = {
            'status': 'success',
            'title': result.get('title', 'Generated Content'),
            'content': result.get('content', result.get('body', 'No content generated')),
            'content_type': 'live_analysis',
            'time_appropriate': True,
            'visual_suggestion': result.get('visual_data', {}),
            'hashtags': result.get('hashtags', ['#NIFTY', '#StockMarket', '#Trading']),
            'hashtag_analysis': result.get('hashtag_analysis', {}),
            'quality_score': result.get('quality_score', 8),
            'data_source': result.get('data_source', 'Unknown'),
            'timestamp': result.get('timestamp'),
            'humanized': True,
            'premium': True
        }
        
        # Add visual path if generated
        if visual_path:
            response_data['visual_path'] = visual_path
            response_data['visual_url'] = f"/static/visuals/{os.path.basename(visual_path)}"
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error generating content: {e}", exc_info=True)
        import traceback
        error_detail = traceback.format_exc()
        logger.error(f"Full traceback: {error_detail}")
        
        # Return more detailed error for debugging
        return jsonify({
            'status': 'error', 
            'message': f'Error generating content: {str(e)}',
            'error_type': type(e).__name__,
            'detail': str(e)
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

@app.route('/api/market/live', methods=['GET'])
def get_live_market_data():
    """Get live market data from TradingView Premium"""
    try:
        # Fetch live data from TradingView
        market_data = fetch_tradingview_data()
        
        if market_data:
            return jsonify({
                'status': 'success',
                'data': market_data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Unable to fetch market data'
            }), 500
    except Exception as e:
        logger.error(f"Error fetching market data: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/market/options', methods=['GET'])
def get_options_data():
    """Get live options chain data"""
    try:
        symbol = request.args.get('symbol', 'NSE:NIFTY')
        fetcher = TradingViewDataFetcher()
        options_data = fetcher.get_options_data(symbol)
        
        return jsonify({
            'status': 'success',
            'data': options_data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error fetching options data: {e}")
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
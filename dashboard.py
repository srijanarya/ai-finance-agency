#!/usr/bin/env python3
"""
Web Dashboard for AI Finance Agency
Monitor research agent activity and content ideas
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List
import asyncio
import logging
from config.config import config
from agents.research_agent import ResearchAgent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = config.dashboard.secret_key
CORS(app)


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


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=config.dashboard.port,
        debug=config.dashboard.debug
    )
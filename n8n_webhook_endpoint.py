#!/usr/bin/env python3
"""
N8N Webhook Integration Endpoint
Connects n8n workflow with AI Finance Agency
"""

from flask import Flask, request, jsonify
import sqlite3
import json
from datetime import datetime
import asyncio
from multi_agent_orchestrator import MultiAgentOrchestrator

app = Flask(__name__)

# Initialize orchestrator
orchestrator = MultiAgentOrchestrator()

@app.route('/webhook/n8n/trigger', methods=['POST'])
def trigger_content_generation():
    """Webhook endpoint for n8n to trigger content generation"""
    try:
        data = request.json
        
        # Extract parameters from n8n
        content_type = data.get('content_type', 'blog')
        topic = data.get('topic', 'market analysis')
        platforms = data.get('platforms', ['all'])
        priority = data.get('priority', 'normal')
        
        # Create content brief
        content_brief = {
            'content_type': content_type,
            'topic': topic,
            'platforms': platforms,
            'priority': priority,
            'source': 'n8n_workflow',
            'requested_at': datetime.now().isoformat()
        }
        
        # Run the orchestrator pipeline asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            orchestrator.execute_content_pipeline(content_brief)
        )
        loop.close()
        
        # Return result to n8n
        return jsonify({
            'status': 'success',
            'pipeline_id': result['pipeline_id'],
            'content': {
                'title': result['content']['title'],
                'body': result['content']['body'][:500] + '...',  # Preview
                'word_count': result['content']['word_count'],
                'keywords': result['content']['keywords']
            },
            'quality_metrics': result['quality_metrics'],
            'seo': result['seo'],
            'distribution': result['distribution'],
            'execution_time': result['execution_time_formatted']
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/webhook/n8n/metrics', methods=['GET'])
def get_metrics():
    """Get performance metrics for n8n dashboard"""
    try:
        conn = sqlite3.connect('data/agency.db')
        cursor = conn.cursor()
        
        # Get last 24 hours metrics
        cursor.execute('''
            SELECT 
                COUNT(*) as total_content,
                AVG(json_extract(metrics, '$.efficiency_gain')) as avg_efficiency,
                SUM(json_extract(metrics, '$.cost_savings')) as total_savings
            FROM content_pipeline
            WHERE created_at >= datetime('now', '-24 hours')
        ''')
        
        metrics = cursor.fetchone()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'metrics': {
                'content_generated_24h': metrics[0] if metrics else 0,
                'avg_efficiency_gain': f"{metrics[1]:.0f}%" if metrics and metrics[1] else "0%",
                'cost_savings_24h': f"${metrics[2]:.2f}" if metrics and metrics[2] else "$0",
                'agents_active': len(orchestrator.agents),
                'timestamp': datetime.now().isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/webhook/n8n/content/<pipeline_id>', methods=['GET'])
def get_content(pipeline_id):
    """Get full content by pipeline ID"""
    try:
        conn = sqlite3.connect('data/agency.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT title, content_type, status, metrics
            FROM content_pipeline
            WHERE pipeline_id = ?
        ''', (pipeline_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return jsonify({
                'status': 'success',
                'content': {
                    'title': result[0],
                    'type': result[1],
                    'status': result[2],
                    'metrics': json.loads(result[3]) if result[3] else {}
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Content not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/webhook/n8n/health', methods=['GET'])
def health_check():
    """Health check endpoint for n8n monitoring"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Finance Agency',
        'agents': list(orchestrator.agents.keys()),
        'timestamp': datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    print("🚀 N8N Webhook Server Starting...")
    print("📍 Endpoints:")
    print("   - POST /webhook/n8n/trigger - Trigger content generation")
    print("   - GET  /webhook/n8n/metrics - Get performance metrics")
    print("   - GET  /webhook/n8n/content/<id> - Get content by ID")
    print("   - GET  /webhook/n8n/health - Health check")
    print("\n✅ Server running on http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
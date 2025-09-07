#!/usr/bin/env python3
"""
Content Generation API for N8N Integration
This API provides unique, varied content for N8N workflows
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import json
import os
import sys
from fix_content_generation import UniqueContentGenerator
from pro_content_generator import ProContentGenerator

app = Flask(__name__)
CORS(app)  # Allow N8N to access this API

# Initialize content generators
old_generator = UniqueContentGenerator()
pro_generator = ProContentGenerator()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "content_api"
    })

@app.route('/generate', methods=['POST'])
def generate_content():
    """Generate unique content for social media"""
    try:
        # Get request data (optional parameters from N8N)
        data = request.get_json() or {}
        platform = data.get('platform', 'linkedin')
        
        # Use professional content generator for better engagement
        # Switch between generators based on platform or preference
        use_pro = data.get('use_pro', True)  # Default to pro content
        
        if use_pro:
            result = pro_generator.generate_content(platform=platform)
            # Normalize pro generator response
            if 'success' in result and result['success']:
                content = result['content']
                content_type = result['type'] 
                timestamp = result['timestamp']
                unique = True
            else:
                raise Exception("Pro generator failed")
        else:
            result = old_generator.generate_unique_content(platform=platform)
            content = result['content']
            content_type = result['type']
            timestamp = result['timestamp'] 
            unique = result.get('unique', True)
        
        # Format for different platforms
        formatted_content = format_for_platform(content, platform)
        
        # Separate content and hashtags for N8N workflow
        if platform == 'linkedin' and '\n\n#' in formatted_content:
            content_parts = formatted_content.split('\n\n#')
            main_content = content_parts[0]
            hashtags = '#' + content_parts[1] if len(content_parts) > 1 else ''
        else:
            main_content = formatted_content
            hashtags = ''
        
        # Create normalized result for logging
        normalized_result = {
            'content': content,
            'type': content_type,
            'timestamp': timestamp,
            'platform': platform,
            'unique': unique
        }
        
        # Track generation in log
        log_generation(normalized_result, platform)
        
        return jsonify({
            "success": True,
            "content": main_content,
            "hashtags": hashtags,
            "disclaimer": "",
            "type": content_type,
            "platform": platform,
            "timestamp": timestamp,
            "unique": unique,
            "metadata": {
                "length": len(formatted_content),
                "has_hashtags": '#' in formatted_content,
                "has_emojis": any(ord(c) > 127 for c in formatted_content)
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get content generation statistics"""
    try:
        stats = {
            "total_generated": len(old_generator.content_history),
            "content_types_available": len(old_generator.content_types),
            "last_type_used": old_generator.last_content_type,
            "timestamp": datetime.now().isoformat()
        }
        
        # Load generation log if exists
        if os.path.exists('generation_log.json'):
            with open('generation_log.json', 'r') as f:
                log_data = json.load(f)
                stats['recent_generations'] = log_data[-10:]  # Last 10
                stats['platforms'] = {}
                for entry in log_data:
                    platform = entry.get('platform', 'unknown')
                    stats['platforms'][platform] = stats['platforms'].get(platform, 0) + 1
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/check_duplicate', methods=['POST'])
def check_duplicate():
    """Check if content is duplicate"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        
        is_dup = generator.is_duplicate(content)
        
        return jsonify({
            "is_duplicate": is_dup,
            "content_hash": generator.get_content_hash(content),
            "total_history": len(generator.content_history)
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

def format_for_platform(content: str, platform: str) -> str:
    """Format content for specific platform"""
    
    if platform == 'telegram':
        # Telegram: Keep full content but add channel link at end
        if '@AIFinanceNews2024' not in content:
            content = content + '\n\n📊 Follow: @AIFinanceNews2024'
            
    elif platform == 'twitter':
        # Twitter: 280 character limit
        if len(content) > 280:
            content = content[:277] + '...'
            
    elif platform == 'slack':
        # Slack: Add formatting
        content = f"*📊 AI Finance Update*\n\n{content}\n\n_Generated at {datetime.now().strftime('%I:%M %p')}_"
        
    # LinkedIn keeps full content
    return content

def log_generation(result: dict, platform: str):
    """Log content generation for tracking"""
    log_file = 'generation_log.json'
    
    # Load existing log
    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            log_data = json.load(f)
    else:
        log_data = []
    
    # Add new entry
    log_entry = {
        "timestamp": result['timestamp'],
        "platform": platform,
        "type": result['type'],
        "content_preview": result['content'][:100],
        "unique": result['unique']
    }
    
    log_data.append(log_entry)
    
    # Keep only last 1000 entries
    if len(log_data) > 1000:
        log_data = log_data[-1000:]
    
    # Save log
    with open(log_file, 'w') as f:
        json.dump(log_data, f, indent=2)

if __name__ == '__main__':
    print("🚀 Content Generation API Starting...")
    print("📍 Endpoints:")
    print("   POST http://localhost:5001/generate - Generate unique content")
    print("   GET  http://localhost:5001/stats - View statistics")
    print("   POST http://localhost:5001/check_duplicate - Check for duplicates")
    print("   GET  http://localhost:5001/health - Health check")
    print("\n✨ API ready for N8N integration!")
    
    app.run(host='0.0.0.0', port=5001, debug=False)
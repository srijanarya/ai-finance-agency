#!/usr/bin/env python3
"""
Content Generation API for N8N Integration - V2.0 Enhanced
This API provides optimized content with engagement multipliers
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import json
import os
import sys
from fix_content_generation import UniqueContentGenerator
from pro_content_generator import ProContentGenerator
from engagement_optimizer_v2 import EngagementOptimizerV2, ContentPipelineV2
from coherent_content_generator import CoherentContentGenerator, CoherentPromptValidator

app = Flask(__name__)
CORS(app)  # Allow N8N to access this API

# Initialize content generators
old_generator = UniqueContentGenerator()
pro_generator = ProContentGenerator()
v2_optimizer = EngagementOptimizerV2()
v2_pipeline = ContentPipelineV2()
coherent_generator = CoherentContentGenerator()
prompt_validator = CoherentPromptValidator()

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
    """Generate unique content with v2.0 engagement optimization"""
    try:
        # Get request data (optional parameters from N8N)
        data = request.get_json() or {}
        platform = data.get('platform', 'linkedin')
        audience = data.get('audience', 'retail_investors')
        market_time = data.get('market_time', 'market_open')
        use_v2 = data.get('use_v2', True)  # Default to v2.0 optimizer
        use_coherent = data.get('use_coherent', True)  # Use coherent generator for better quality
        
        # Generate base content - use coherent generator for better quality
        if use_coherent:
            result = coherent_generator.generate_coherent_content(platform=platform)
            if result['success']:
                base_content = result['content']
                content_type = result['type']
                timestamp = result['timestamp']
                unique = True
                coherence_score = result.get('coherence_score', 10)
            else:
                raise Exception("Coherent content generation failed")
        else:
            result = pro_generator.generate_content(platform=platform)
            if 'success' in result and result['success']:
                base_content = result['content']
                content_type = result['type']
                timestamp = result['timestamp']
                unique = True
                coherence_score = 5  # Pro generator has moderate coherence
            else:
                raise Exception("Content generation failed")
        
        # Apply v2.0 optimization if enabled
        if use_v2:
            optimized = v2_optimizer.optimize_content(
                base_content,
                platform=platform,
                audience=audience,
                market_time=market_time,
                apply_all=True
            )
            content = optimized['content']
            engagement_score = optimized['engagement_score']
            expected_engagement = optimized['expected_engagement']
            visual_spec = optimized['visual_spec']
            multipliers = optimized['applied_multipliers']
        else:
            content = base_content
            engagement_score = 1.0
            expected_engagement = "baseline"
            visual_spec = None
            multipliers = []
        
        # Content is already formatted by v2.0 optimizer
        formatted_content = content if use_v2 else format_for_platform(content, platform)
        
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
            "engagement_score": engagement_score if use_v2 else 1.0,
            "expected_engagement": expected_engagement if use_v2 else "baseline",
            "multipliers_applied": multipliers if use_v2 else [],
            "visual_spec": visual_spec if use_v2 else None,
            "metadata": {
                "length": len(formatted_content),
                "has_hashtags": '#' in formatted_content,
                "has_emojis": any(ord(c) > 127 for c in formatted_content),
                "v2_optimized": use_v2,
                "coherence_score": coherence_score if use_coherent else 5,
                "coherent_generated": use_coherent
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

@app.route('/generate_v2', methods=['POST'])
def generate_v2_content():
    """Generate content with full v2.0 optimization pipeline"""
    try:
        data = request.get_json() or {}
        day = data.get('day', None)
        
        # Generate full daily content with v2.0 pipeline
        daily_content = v2_pipeline.generate_daily_content(day)
        
        return jsonify({
            "success": True,
            "daily_content": daily_content,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/generate_crisis', methods=['POST'])
def generate_crisis_content():
    """Generate high-urgency crisis content"""
    try:
        data = request.get_json() or {}
        crisis_type = data.get('crisis_type', 'market_crash')
        
        # Generate crisis content with maximum urgency
        crisis_content = v2_pipeline.generate_crisis_content(crisis_type)
        
        return jsonify({
            "success": True,
            "crisis_content": crisis_content,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/generate_coherent', methods=['POST'])
def generate_coherent():
    """Generate coherent content with single-topic focus"""
    try:
        data = request.get_json() or {}
        content_type = data.get('content_type', None)  # Let generator choose if not specified
        platform = data.get('platform', 'linkedin')
        
        # Generate coherent content
        result = coherent_generator.generate_coherent_content(
            content_type=content_type,
            platform=platform
        )
        
        if result['success']:
            # Apply v2.0 optimization if requested
            if data.get('apply_optimization', False):
                optimized = v2_optimizer.optimize_content(
                    result['content'],
                    platform=platform,
                    audience='retail_investors',
                    market_time='market_open'
                )
                result['engagement_score'] = optimized['engagement_score']
                result['multipliers_applied'] = optimized['applied_multipliers']
            
            return jsonify(result)
        else:
            raise Exception("Coherent generation failed")
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/validate_prompt', methods=['POST'])
def validate_prompt():
    """Validate if a prompt will generate coherent content"""
    try:
        data = request.get_json() or {}
        prompt = data.get('prompt', '')
        
        if not prompt:
            return jsonify({
                "success": False,
                "error": "No prompt provided"
            }), 400
        
        validation = prompt_validator.validate_prompt(prompt)
        
        return jsonify({
            "success": True,
            "validation": validation,
            "is_coherent": validation['is_coherent'],
            "score": validation['score'],
            "issues": validation['issues'],
            "recommendations": validation['recommendations']
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Content Generation API V3.0 Starting...")
    print("📍 Endpoints:")
    print("   POST http://localhost:5001/generate - Generate optimized content")
    print("   POST http://localhost:5001/generate_coherent - Generate coherent single-topic content")
    print("   POST http://localhost:5001/validate_prompt - Validate prompt coherence")
    print("   POST http://localhost:5001/generate_v2 - Full v2.0 daily pipeline")
    print("   POST http://localhost:5001/generate_crisis - Crisis content generation")
    print("   GET  http://localhost:5001/stats - View statistics")
    print("   POST http://localhost:5001/check_duplicate - Check for duplicates")
    print("   GET  http://localhost:5001/health - Health check")
    print("\n✨ V3.0 API with coherent content generation ready!")
    print("🎯 Coherence + Engagement = Authentic viral content")
    
    app.run(host='0.0.0.0', port=5001, debug=False)
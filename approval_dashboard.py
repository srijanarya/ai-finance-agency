#!/usr/bin/env python3
"""
Content Approval Dashboard
Professional interface for reviewing and approving content
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
from datetime import datetime
from safe_content_generator import SafeContentGenerator, ManualApprovalGate
from cloud_poster_safe import SafeCloudPoster

from database_helper import get_db_connection, get_redis_client, cache_get, cache_set


app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Initialize components
generator = SafeContentGenerator()
approval_gate = ManualApprovalGate()
poster = SafeCloudPoster()

@app.route('/')
def dashboard():
    """Main dashboard view"""
    # Load pending content
    pending = approval_gate.show_pending()
    
    # Load approved content
    approved = []
    posted = []
    
    if os.path.exists('pending_approval.json'):
        with open('pending_approval.json', 'r') as f:
            all_content = json.load(f)
            approved = [c for c in all_content if c.get('status') == 'approved']
            posted = [c for c in all_content if c.get('status') == 'posted']
    
    # Calculate stats
    stats = {
        'pending_count': len(pending),
        'approved_count': len(approved),
        'posted_count': len(posted),
        'total_generated': len(pending) + len(approved) + len(posted)
    }
    
    return render_template('dashboard.html', 
                         pending=pending, 
                         approved=approved,
                         posted=posted,
                         stats=stats)

@app.route('/generate', methods=['POST'])
def generate_content():
    """Generate new content for all platforms"""
    platforms = ['linkedin', 'twitter', 'telegram']
    results = []
    
    for platform in platforms:
        result = generator.generate_safe_content(platform, 'market_insight')
        if result['safe']:
            approval_id = approval_gate.add_for_approval(result)
            results.append({
                'platform': platform,
                'approval_id': approval_id,
                'success': True
            })
        else:
            results.append({
                'platform': platform,
                'success': False,
                'issues': result['issues']
            })
    
    return jsonify({'results': results})

@app.route('/preview/<approval_id>')
def preview_content(approval_id):
    """Preview specific content"""
    if os.path.exists('pending_approval.json'):
        with open('pending_approval.json', 'r') as f:
            all_content = json.load(f)
            for content in all_content:
                if content.get('approval_id') == approval_id:
                    return render_template('preview.html', content=content)
    
    return redirect(url_for('dashboard'))

@app.route('/approve/<approval_id>', methods=['POST'])
def approve_content(approval_id):
    """Approve content for posting"""
    success = approval_gate.approve_content(approval_id)
    return jsonify({'success': success})

@app.route('/reject/<approval_id>', methods=['POST'])
def reject_content(approval_id):
    """Reject content"""
    if os.path.exists('pending_approval.json'):
        with open('pending_approval.json', 'r') as f:
            all_content = json.load(f)
        
        for content in all_content:
            if content.get('approval_id') == approval_id:
                content['status'] = 'rejected'
                content['rejected_at'] = datetime.now().isoformat()
                
                with open('pending_approval.json', 'w') as f:
                    json.dump(all_content, f, indent=2)
                return jsonify({'success': True})
    
    return jsonify({'success': False})

@app.route('/edit/<approval_id>', methods=['GET', 'POST'])
def edit_content(approval_id):
    """Edit content before approval"""
    if request.method == 'POST':
        new_content = request.json.get('content')
        
        if os.path.exists('pending_approval.json'):
            with open('pending_approval.json', 'r') as f:
                all_content = json.load(f)
            
            for content in all_content:
                if content.get('approval_id') == approval_id:
                    content['content'] = new_content
                    content['edited_at'] = datetime.now().isoformat()
                    
                    # Re-validate
                    validation = generator._validate_content(new_content)
                    content['safe'] = validation['safe']
                    content['issues'] = validation['issues']
                    
                    with open('pending_approval.json', 'w') as f:
                        json.dump(all_content, f, indent=2)
                    
                    return jsonify({'success': True, 'safe': validation['safe']})
        
        return jsonify({'success': False})
    
    # GET request - show edit form
    if os.path.exists('pending_approval.json'):
        with open('pending_approval.json', 'r') as f:
            all_content = json.load(f)
            for content in all_content:
                if content.get('approval_id') == approval_id:
                    return render_template('edit.html', content=content)
    
    return redirect(url_for('dashboard'))

@app.route('/post/<approval_id>', methods=['POST'])
def post_content(approval_id):
    """Post approved content"""
    success = poster.post_approved_content(approval_id)
    return jsonify({'success': success})

@app.route('/api/stats')
def get_stats():
    """Get dashboard statistics"""
    stats = {
        'pending': 0,
        'approved': 0,
        'posted': 0,
        'rejected': 0
    }
    
    if os.path.exists('pending_approval.json'):
        with open('pending_approval.json', 'r') as f:
            all_content = json.load(f)
            for content in all_content:
                status = content.get('status', 'pending')
                if status in stats:
                    stats[status] += 1
    
    return jsonify(stats)

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    
    print("\n" + "="*60)
    print("🚀 CONTENT APPROVAL DASHBOARD")
    print("="*60)
    port = int(os.environ.get('PORT', 5001))
    print(f"\n📱 Access the dashboard at: http://localhost:{port}")
    print("\n✅ Features:")
    print("  - Review all pending content")
    print("  - Edit content before approval")
    print("  - Approve/Reject with one click")
    print("  - Post to platforms after approval")
    print("  - Track all content status")
    print("\n" + "="*60)
    
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
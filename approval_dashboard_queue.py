#!/usr/bin/env python3
"""
Content Approval Dashboard - Centralized Queue Integration
Professional interface for reviewing and approving content through centralized queue
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
import json
import os
from datetime import datetime
from centralized_posting_queue import posting_queue, Platform, Priority
from content_quality_system import ContentQualitySystem
import logging

app = Flask(__name__)
app.config['SECRET_KEY'] = 'approval-dashboard-queue-secret'

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize components
quality_system = ContentQualitySystem()
queue = posting_queue

@app.route('/')
def dashboard():
    """Main dashboard with queue integration"""
    try:
        # Get queue status
        queue_status = queue.get_queue_status()
        
        # Get pending items for approval
        pending_items = queue.get_pending_for_approval()
        
        # Format pending items for display
        pending = []
        for item in pending_items:
            pending.append({
                'id': item.id,
                'platform': item.platform,
                'content': item.content[:200] + "..." if len(item.content) > 200 else item.content,
                'full_content': item.content,
                'priority': item.priority,
                'source': item.source,
                'created_at': item.created_at,
                'metadata': item.metadata
            })
        
        # Calculate extended stats
        stats = {
            'pending_count': queue_status['queue_counts'].get('pending', 0),
            'approved_count': queue_status['queue_counts'].get('approved', 0),
            'posted_count': queue_status['queue_counts'].get('posted', 0),
            'failed_count': queue_status['queue_counts'].get('failed', 0),
            'duplicates_prevented': queue_status['duplicate_stats']['duplicates_prevented'],
            'total_processed': sum(queue_status['queue_counts'].values())
        }
        
        return render_template('approval_dashboard.html', 
                             pending=pending,
                             queue_status=queue_status,
                             stats=stats)
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate_content():
    """Generate new content and add to queue"""
    try:
        data = request.get_json()
        content_type = data.get('content_type', 'market_insight')
        platforms = data.get('platforms', ['linkedin', 'twitter', 'telegram'])
        
        results = []
        
        for platform in platforms:
            # Generate content using quality system
            result = quality_system.create_content(
                platform=platform,
                content_type=content_type
            )
            
            if result.get('success'):
                # Add to queue for approval
                queue_result = queue.add_to_queue(
                    content=result['content'],
                    platform=platform,
                    priority=Priority.NORMAL,
                    source='approval_dashboard',
                    metadata={
                        'content_type': content_type,
                        'quality_score': result.get('quality_score'),
                        'validation_status': result.get('validation_status'),
                        'generated_at': datetime.now().isoformat(),
                        'requires_approval': True
                    }
                )
                
                results.append({
                    'platform': platform,
                    'success': queue_result['success'],
                    'item_id': queue_result.get('item_id'),
                    'queue_position': queue_result.get('queue_position'),
                    'reason': queue_result.get('message', 'Success')
                })
            else:
                results.append({
                    'platform': platform,
                    'success': False,
                    'reason': f"Generation failed: {', '.join(result.get('issues', []))}"
                })
        
        return jsonify({'results': results})
        
    except Exception as e:
        logger.error(f"Content generation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/preview/<item_id>')
def preview_content(item_id):
    """Preview specific content from queue"""
    try:
        # Get all pending items and find the one with matching ID
        pending_items = queue.get_pending_for_approval()
        
        for item in pending_items:
            if item.id == item_id:
                content_data = {
                    'id': item.id,
                    'platform': item.platform,
                    'content': item.content,
                    'priority': item.priority,
                    'source': item.source,
                    'created_at': item.created_at,
                    'metadata': item.metadata,
                    'content_hash': item.content_hash
                }
                return render_template('preview.html', content=content_data)
        
        flash('Content not found', 'error')
        return redirect(url_for('dashboard'))
        
    except Exception as e:
        logger.error(f"Preview error: {e}")
        flash(f'Error loading preview: {str(e)}', 'error')
        return redirect(url_for('dashboard'))

@app.route('/approve/<item_id>', methods=['POST'])
def approve_content(item_id):
    """Approve content for posting"""
    try:
        success = queue.approve_item(item_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Content approved successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Content not found or already processed'
            })
            
    except Exception as e:
        logger.error(f"Approval error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/reject/<item_id>', methods=['POST'])
def reject_content(item_id):
    """Reject content"""
    try:
        data = request.get_json() or {}
        reason = data.get('reason', 'Manual rejection from dashboard')
        
        success = queue.reject_item(item_id, reason)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Content rejected successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Content not found or already processed'
            })
            
    except Exception as e:
        logger.error(f"Rejection error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/bulk-approve', methods=['POST'])
def bulk_approve():
    """Approve multiple items at once"""
    try:
        data = request.get_json()
        item_ids = data.get('item_ids', [])
        
        results = []
        for item_id in item_ids:
            success = queue.approve_item(item_id)
            results.append({
                'item_id': item_id,
                'success': success
            })
        
        successful = sum(1 for r in results if r['success'])
        
        return jsonify({
            'success': True,
            'message': f'Approved {successful}/{len(item_ids)} items',
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Bulk approval error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/process-queue', methods=['POST'])
def process_queue():
    """Process approved items in queue"""
    try:
        data = request.get_json() or {}
        max_items = data.get('max_items', 5)
        
        results = queue.process_queue(max_items)
        
        return jsonify({
            'success': True,
            'results': results,
            'message': f"Processed {results['processed']} items: {results['successful']} posted, {results['failed']} failed, {results['skipped']} skipped"
        })
        
    except Exception as e:
        logger.error(f"Queue processing error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/queue-status')
def queue_status_api():
    """Get current queue status"""
    try:
        status = queue.get_queue_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/test-content', methods=['POST'])
def test_content():
    """Add test content to queue"""
    try:
        data = request.get_json()
        content = data.get('content', 'Test content from approval dashboard')
        platform = data.get('platform', 'telegram')
        
        result = queue.add_to_queue(
            content=content,
            platform=platform,
            priority=Priority.LOW,
            source='approval_dashboard_test',
            metadata={'test': True, 'created_from': 'dashboard'}
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Create HTML templates if they don't exist
@app.before_first_request
def create_templates():
    """Create HTML templates"""
    import os
    templates_dir = "templates"
    
    if not os.path.exists(templates_dir):
        os.makedirs(templates_dir)
    
    # Main dashboard template
    dashboard_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content Approval Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f7;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            text-align: center;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
        }
        .stat-label {
            color: #666;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
        .content-section {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }
        .content-item {
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            background: #f9f9f9;
        }
        .content-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .platform-badge {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            text-transform: uppercase;
        }
        .priority-badge {
            background: #10b981;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
        }
        .priority-high { background: #f59e0b; }
        .priority-urgent { background: #ef4444; }
        .content-text {
            color: #333;
            line-height: 1.6;
            margin-bottom: 1rem;
        }
        .content-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        .btn-approve {
            background: #10b981;
            color: white;
        }
        .btn-approve:hover {
            background: #059669;
        }
        .btn-reject {
            background: #ef4444;
            color: white;
        }
        .btn-reject:hover {
            background: #dc2626;
        }
        .btn-preview {
            background: #6b7280;
            color: white;
        }
        .btn-preview:hover {
            background: #4b5563;
        }
        .btn-primary {
            background: #667eea;
            color: white;
        }
        .btn-primary:hover {
            background: #5a6fd8;
        }
        .actions-bar {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        .form-group select, .form-group input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
        }
        #notifications {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
        .notification {
            background: #10b981;
            color: white;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 0.5rem;
            min-width: 300px;
        }
        .notification.error {
            background: #ef4444;
        }
    </style>
</head>
<body>
    <div id="notifications"></div>
    
    <div class="header">
        <h1>📋 Content Approval Dashboard</h1>
        <p>Centralized Queue Management System</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-number">{{ stats.pending_count }}</div>
            <div class="stat-label">Pending Approval</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{{ stats.approved_count }}</div>
            <div class="stat-label">Approved</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{{ stats.posted_count }}</div>
            <div class="stat-label">Posted</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{{ stats.duplicates_prevented }}</div>
            <div class="stat-label">Duplicates Prevented</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{{ stats.failed_count }}</div>
            <div class="stat-label">Failed Posts</div>
        </div>
    </div>

    <div class="actions-bar">
        <button class="btn btn-primary" onclick="generateContent()">🎯 Generate Content</button>
        <button class="btn btn-primary" onclick="processQueue()">⚡ Process Queue</button>
        <button class="btn btn-primary" onclick="bulkApprove()">✅ Bulk Approve</button>
        <button class="btn btn-primary" onclick="refreshStatus()">🔄 Refresh</button>
        <a href="http://localhost:5001" class="btn btn-primary" target="_blank">📊 Queue Monitor</a>
    </div>

    <div class="content-section">
        <h2>📝 Pending Content ({{ stats.pending_count }})</h2>
        
        {% if pending %}
            {% for item in pending %}
            <div class="content-item" data-item-id="{{ item.id }}">
                <div class="content-header">
                    <div>
                        <span class="platform-badge">{{ item.platform }}</span>
                        <span class="priority-badge {% if item.priority >= 4 %}priority-urgent{% elif item.priority >= 3 %}priority-high{% endif %}">
                            Priority {{ item.priority }}
                        </span>
                    </div>
                    <div style="font-size: 0.9rem; color: #666;">
                        {{ item.source }} • {{ item.created_at.split('T')[1].split('.')[0] if 'T' in item.created_at }}
                    </div>
                </div>
                
                <div class="content-text">{{ item.content }}</div>
                
                <div class="content-actions">
                    <button class="btn btn-approve" onclick="approveContent('{{ item.id }}')">
                        ✅ Approve
                    </button>
                    <button class="btn btn-reject" onclick="rejectContent('{{ item.id }}')">
                        ❌ Reject
                    </button>
                    <button class="btn btn-preview" onclick="previewContent('{{ item.id }}')">
                        👁️ Preview
                    </button>
                    <input type="checkbox" class="bulk-select" value="{{ item.id }}" style="margin-left: auto;">
                </div>
            </div>
            {% endfor %}
        {% else %}
            <p style="text-align: center; color: #666; padding: 2rem;">
                No pending content. <a href="#" onclick="generateContent()">Generate some content</a> to get started.
            </p>
        {% endif %}
    </div>

    <script>
        function showNotification(message, isError = false) {
            const notification = document.createElement('div');
            notification.className = 'notification' + (isError ? ' error' : '');
            notification.textContent = message;
            document.getElementById('notifications').appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }

        async function generateContent() {
            try {
                const response = await fetch('/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content_type: 'market_insight',
                        platforms: ['linkedin', 'twitter', 'telegram']
                    })
                });
                
                const result = await response.json();
                
                if (result.results) {
                    const successful = result.results.filter(r => r.success).length;
                    showNotification(`Generated content for ${successful} platforms`);
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification('Failed to generate content', true);
                }
                
            } catch (error) {
                showNotification('Error generating content: ' + error.message, true);
            }
        }

        async function approveContent(itemId) {
            try {
                const response = await fetch(`/approve/${itemId}`, { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Content approved successfully');
                    document.querySelector(`[data-item-id="${itemId}"]`).remove();
                } else {
                    showNotification(result.message || 'Approval failed', true);
                }
                
            } catch (error) {
                showNotification('Error approving content: ' + error.message, true);
            }
        }

        async function rejectContent(itemId) {
            const reason = prompt('Reason for rejection (optional):') || 'Manual rejection';
            
            try {
                const response = await fetch(`/reject/${itemId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Content rejected');
                    document.querySelector(`[data-item-id="${itemId}"]`).remove();
                } else {
                    showNotification(result.message || 'Rejection failed', true);
                }
                
            } catch (error) {
                showNotification('Error rejecting content: ' + error.message, true);
            }
        }

        function previewContent(itemId) {
            window.open(`/preview/${itemId}`, '_blank');
        }

        async function bulkApprove() {
            const selected = Array.from(document.querySelectorAll('.bulk-select:checked')).map(cb => cb.value);
            
            if (selected.length === 0) {
                showNotification('Please select items to approve', true);
                return;
            }
            
            try {
                const response = await fetch('/bulk-approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ item_ids: selected })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification(result.message);
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification(result.message || 'Bulk approval failed', true);
                }
                
            } catch (error) {
                showNotification('Error with bulk approval: ' + error.message, true);
            }
        }

        async function processQueue() {
            try {
                const response = await fetch('/process-queue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ max_items: 5 })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification(result.message);
                    setTimeout(() => location.reload(), 2000);
                } else {
                    showNotification(result.error || 'Queue processing failed', true);
                }
                
            } catch (error) {
                showNotification('Error processing queue: ' + error.message, true);
            }
        }

        function refreshStatus() {
            location.reload();
        }

        // Auto-refresh every 30 seconds
        setInterval(() => {
            fetch('/queue-status')
                .then(r => r.json())
                .then(status => {
                    // Update stats if different
                    console.log('Queue status updated', status);
                })
                .catch(e => console.error('Status refresh error:', e));
        }, 30000);
    </script>
</body>
</html>"""

    # Preview template
    preview_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content Preview</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f7;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
        }
        .platform-badge {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            text-transform: uppercase;
        }
        .content-box {
            background: #f9f9f9;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin: 1rem 0;
            white-space: pre-wrap;
            line-height: 1.6;
        }
        .metadata {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
        }
        .actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
        }
        .btn-approve {
            background: #10b981;
            color: white;
        }
        .btn-reject {
            background: #ef4444;
            color: white;
        }
        .btn-back {
            background: #6b7280;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Content Preview</h1>
            <div style="margin-top: 1rem;">
                <span class="platform-badge">{{ content.platform }}</span>
                <span style="margin-left: 1rem; color: #666;">{{ content.source }}</span>
            </div>
        </div>

        <div class="content-box">{{ content.content }}</div>

        <div class="metadata">
            <h3>📊 Metadata</h3>
            <p><strong>ID:</strong> {{ content.id }}</p>
            <p><strong>Priority:</strong> {{ content.priority }}</p>
            <p><strong>Created:</strong> {{ content.created_at }}</p>
            <p><strong>Content Hash:</strong> {{ content.content_hash }}</p>
            {% if content.metadata %}
            <p><strong>Additional Info:</strong></p>
            <pre>{{ content.metadata | tojson(indent=2) }}</pre>
            {% endif %}
        </div>

        <div class="actions">
            <button class="btn btn-approve" onclick="approveContent()">✅ Approve</button>
            <button class="btn btn-reject" onclick="rejectContent()">❌ Reject</button>
            <button class="btn btn-back" onclick="window.close()">← Close</button>
        </div>
    </div>

    <script>
        async function approveContent() {
            try {
                const response = await fetch(`/approve/{{ content.id }}`, { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    alert('Content approved successfully');
                    window.close();
                } else {
                    alert('Approval failed: ' + result.message);
                }
                
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }

        async function rejectContent() {
            const reason = prompt('Reason for rejection (optional):') || 'Manual rejection from preview';
            
            try {
                const response = await fetch(`/reject/{{ content.id }}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Content rejected');
                    window.close();
                } else {
                    alert('Rejection failed: ' + result.message);
                }
                
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    </script>
</body>
</html>"""

    # Write templates
    with open(os.path.join(templates_dir, 'approval_dashboard.html'), 'w') as f:
        f.write(dashboard_html)
    
    with open(os.path.join(templates_dir, 'preview.html'), 'w') as f:
        f.write(preview_html)

def main():
    """Run the approval dashboard"""
    print("="*60)
    print("📋 CONTENT APPROVAL DASHBOARD - Queue Integration")
    print("="*60)
    print("Dashboard URL: http://localhost:5002")
    print("Queue Monitor: http://localhost:5001")
    print("="*60)
    
    app.run(host='0.0.0.0', port=5002, debug=True)

if __name__ == "__main__":
    main()
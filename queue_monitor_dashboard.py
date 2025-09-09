#!/usr/bin/env python3
"""
Posting Queue Monitor Dashboard
Web interface for monitoring and managing the centralized posting queue
"""

from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
import json
from datetime import datetime, timedelta
from centralized_posting_queue import CentralizedPostingQueue, Platform, Priority, PostStatus
import logging

app = Flask(__name__)
app.secret_key = 'posting_queue_dashboard_secret'

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize queue
queue = CentralizedPostingQueue()

@app.route('/')
def dashboard():
    """Main dashboard view"""
    try:
        status = queue.get_queue_status()
        return render_template('queue_dashboard.html', 
                             status=status,
                             platforms=list(Platform),
                             priorities=list(Priority))
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/status')
def api_status():
    """API endpoint for queue status"""
    try:
        status = queue.get_queue_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/queue/add', methods=['POST'])
def api_add_to_queue():
    """API endpoint to add content to queue"""
    try:
        data = request.get_json()
        
        content = data.get('content', '').strip()
        platform = data.get('platform', '').lower()
        priority_str = data.get('priority', 'normal').upper()
        source = data.get('source', 'dashboard')
        
        if not content:
            return jsonify({"error": "Content is required"}), 400
        
        if platform not in [p.value for p in Platform if p != Platform.ALL]:
            return jsonify({"error": "Invalid platform"}), 400
        
        try:
            priority = Priority[priority_str]
        except KeyError:
            priority = Priority.NORMAL
        
        # Optional scheduling
        scheduled_for = None
        if data.get('scheduled_for'):
            try:
                scheduled_for = datetime.fromisoformat(data['scheduled_for'])
            except ValueError:
                pass
        
        result = queue.add_to_queue(
            content=content,
            platform=platform,
            priority=priority,
            source=source,
            scheduled_for=scheduled_for,
            metadata=data.get('metadata', {})
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Add to queue error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/queue/process', methods=['POST'])
def api_process_queue():
    """API endpoint to process queue"""
    try:
        max_items = request.get_json().get('max_items', 5)
        results = queue.process_queue(max_items)
        return jsonify(results)
    except Exception as e:
        logger.error(f"Process queue error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/queue/approve/<item_id>', methods=['POST'])
def api_approve_item(item_id):
    """API endpoint to approve queue item"""
    try:
        success = queue.approve_item(item_id)
        if success:
            return jsonify({"success": True, "message": "Item approved"})
        else:
            return jsonify({"error": "Item not found or already processed"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/queue/reject/<item_id>', methods=['POST'])
def api_reject_item(item_id):
    """API endpoint to reject queue item"""
    try:
        data = request.get_json() or {}
        reason = data.get('reason', 'Manual rejection')
        
        success = queue.reject_item(item_id, reason)
        if success:
            return jsonify({"success": True, "message": "Item rejected"})
        else:
            return jsonify({"error": "Item not found or already processed"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/queue/pending')
def api_pending_items():
    """API endpoint to get pending items"""
    try:
        items = queue.get_pending_for_approval()
        return jsonify([{
            "id": item.id,
            "content": item.content[:200] + "..." if len(item.content) > 200 else item.content,
            "platform": item.platform,
            "priority": item.priority,
            "source": item.source,
            "created_at": item.created_at,
            "scheduled_for": item.scheduled_for,
            "metadata": item.metadata
        } for item in items])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/queue/cleanup', methods=['POST'])
def api_cleanup():
    """API endpoint to cleanup old items"""
    try:
        data = request.get_json() or {}
        days_old = data.get('days_old', 7)
        
        cleaned_count = queue.cleanup_old_items(days_old)
        return jsonify({
            "success": True,
            "message": f"Cleaned up {cleaned_count} old items"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test')
def test_page():
    """Test page for adding content"""
    return render_template('test_queue.html')

# Create HTML templates
def create_templates():
    """Create HTML templates if they don't exist"""
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
    <title>Posting Queue Dashboard</title>
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
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
        .platform-status {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }
        .platform-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #eee;
        }
        .platform-row:last-child {
            border-bottom: none;
        }
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-good { background-color: #34d399; }
        .status-warning { background-color: #fbbf24; }
        .status-error { background-color: #f87171; }
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            margin-right: 1rem;
        }
        .btn:hover {
            background: #5a6fd8;
        }
        .btn-success {
            background: #10b981;
        }
        .btn-success:hover {
            background: #059669;
        }
        .btn-danger {
            background: #ef4444;
        }
        .btn-danger:hover {
            background: #dc2626;
        }
        .recent-posts {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .post-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #eee;
        }
        .post-item:last-child {
            border-bottom: none;
        }
        .actions {
            margin: 2rem 0;
            text-align: center;
        }
        .refresh-status {
            display: none;
            color: #10b981;
            margin-left: 1rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Centralized Posting Queue Dashboard</h1>
        <p>Monitoring all posts across LinkedIn, Twitter, and Telegram</p>
        <div>
            <button class="btn" onclick="refreshData()">🔄 Refresh</button>
            <button class="btn btn-success" onclick="processQueue()">▶️ Process Queue</button>
            <button class="btn btn-danger" onclick="cleanupOldItems()">🗑️ Cleanup Old Items</button>
            <span class="refresh-status" id="refreshStatus">Updated!</span>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-number" id="pendingCount">{{ status.queue_counts.get('pending', 0) }}</div>
            <div class="stat-label">Pending Posts</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="postedCount">{{ status.queue_counts.get('posted', 0) }}</div>
            <div class="stat-label">Posted Today</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="duplicatesCount">{{ status.duplicate_stats.duplicates_prevented }}</div>
            <div class="stat-label">Duplicates Prevented</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="failedCount">{{ status.queue_counts.get('failed', 0) }}</div>
            <div class="stat-label">Failed Posts</div>
        </div>
    </div>

    <div class="platform-status">
        <h2>Platform Rate Limits</h2>
        {% for platform, limits in status.rate_limits.items() %}
        <div class="platform-row">
            <div style="display: flex; align-items: center;">
                <div class="status-indicator {% if limits.hourly_ok and limits.daily_ok %}status-good{% elif limits.hourly_ok or limits.daily_ok %}status-warning{% else %}status-error{% endif %}"></div>
                <strong>{{ platform.title() }}</strong>
            </div>
            <div style="text-align: right; font-size: 0.9rem; color: #666;">
                Hourly: {{ limits.hourly_count }}/{{ limits.hourly_limit }} | 
                Daily: {{ limits.daily_count }}/{{ limits.daily_limit }}
            </div>
        </div>
        {% endfor %}
    </div>

    <div class="recent-posts">
        <h2>Recent Posts</h2>
        {% for post in status.recent_posts[:10] %}
        <div class="post-item">
            <div>
                <strong>{{ post.platform.title() }}</strong>
                <span style="color: #666; margin-left: 1rem;">{{ post.source }}</span>
            </div>
            <div style="font-size: 0.9rem; color: #666;">
                {{ post.posted_at.split('T')[1].split('.')[0] if 'T' in post.posted_at else post.posted_at }}
            </div>
        </div>
        {% else %}
        <p style="color: #666; text-align: center;">No recent posts</p>
        {% endfor %}
    </div>

    {% if status.failed_posts %}
    <div class="recent-posts" style="margin-top: 2rem;">
        <h2>Failed Posts (Need Attention)</h2>
        {% for post in status.failed_posts %}
        <div class="post-item">
            <div>
                <strong>{{ post.platform.title() }}</strong>
                <span style="color: #ef4444; margin-left: 1rem;">{{ post.error[:50] }}...</span>
            </div>
            <div style="font-size: 0.9rem; color: #666;">
                Retry {{ post.retry_count }}/{{ post.max_retries }}
            </div>
        </div>
        {% endfor %}
    </div>
    {% endif %}

    <div class="actions">
        <a href="/test" class="btn">🧪 Test Queue</a>
        <button class="btn" onclick="showPendingItems()">📋 View Pending Items</button>
    </div>

    <script>
        async function refreshData() {
            const refreshStatus = document.getElementById('refreshStatus');
            refreshStatus.style.display = 'inline';
            
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                
                // Update stats
                document.getElementById('pendingCount').textContent = data.queue_counts.pending || 0;
                document.getElementById('postedCount').textContent = data.queue_counts.posted || 0;
                document.getElementById('duplicatesCount').textContent = data.duplicate_stats.duplicates_prevented || 0;
                document.getElementById('failedCount').textContent = data.queue_counts.failed || 0;
                
                setTimeout(() => {
                    refreshStatus.style.display = 'none';
                }, 2000);
                
            } catch (error) {
                console.error('Error refreshing data:', error);
                refreshStatus.textContent = 'Error!';
                refreshStatus.style.color = '#ef4444';
                setTimeout(() => {
                    refreshStatus.style.display = 'none';
                    refreshStatus.style.color = '#10b981';
                    refreshStatus.textContent = 'Updated!';
                }, 3000);
            }
        }

        async function processQueue() {
            if (!confirm('Process pending posts in queue?')) return;
            
            try {
                const response = await fetch('/api/queue/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ max_items: 5 })
                });
                
                const result = await response.json();
                alert(`Queue processed! ${result.successful} posted, ${result.failed} failed, ${result.skipped} skipped`);
                refreshData();
                
            } catch (error) {
                alert('Error processing queue: ' + error.message);
            }
        }

        async function cleanupOldItems() {
            if (!confirm('Clean up items older than 7 days?')) return;
            
            try {
                const response = await fetch('/api/queue/cleanup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ days_old: 7 })
                });
                
                const result = await response.json();
                alert(result.message);
                refreshData();
                
            } catch (error) {
                alert('Error cleaning up: ' + error.message);
            }
        }

        async function showPendingItems() {
            try {
                const response = await fetch('/api/queue/pending');
                const items = await response.json();
                
                if (items.length === 0) {
                    alert('No pending items in queue');
                    return;
                }
                
                let message = 'Pending Items:\\n\\n';
                items.slice(0, 10).forEach((item, index) => {
                    message += `${index + 1}. [${item.platform.toUpperCase()}] ${item.content}\\n`;
                    message += `   Source: ${item.source} | Priority: ${item.priority}\\n\\n`;
                });
                
                if (items.length > 10) {
                    message += `... and ${items.length - 10} more items`;
                }
                
                alert(message);
                
            } catch (error) {
                alert('Error fetching pending items: ' + error.message);
            }
        }

        // Auto-refresh every 30 seconds
        setInterval(refreshData, 30000);
    </script>
</body>
</html>"""

    # Test page template
    test_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Posting Queue</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
        }
        textarea, select, input {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e5e5e5;
            border-radius: 8px;
            font-size: 1rem;
            box-sizing: border-box;
        }
        textarea {
            min-height: 120px;
            resize: vertical;
        }
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            width: 100%;
        }
        .btn:hover {
            background: #5a6fd8;
        }
        .result {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 8px;
            display: none;
        }
        .result.success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #10b981;
        }
        .result.error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #ef4444;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 2rem;
            color: #667eea;
            text-decoration: none;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← Back to Dashboard</a>
        
        <h1>🧪 Test Posting Queue</h1>
        <p>Add test content to the posting queue</p>
        
        <form id="testForm">
            <div class="form-group">
                <label for="content">Content:</label>
                <textarea id="content" placeholder="Enter your post content here..." required></textarea>
            </div>
            
            <div class="form-group">
                <label for="platform">Platform:</label>
                <select id="platform" required>
                    <option value="">Select Platform</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="telegram">Telegram</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="priority">Priority:</label>
                <select id="priority">
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="source">Source:</label>
                <input type="text" id="source" value="test_dashboard" placeholder="Source identifier">
            </div>
            
            <button type="submit" class="btn">Add to Queue</button>
        </form>
        
        <div id="result" class="result"></div>
    </div>

    <script>
        document.getElementById('testForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'none';
            
            const formData = {
                content: document.getElementById('content').value,
                platform: document.getElementById('platform').value,
                priority: document.getElementById('priority').value,
                source: document.getElementById('source').value
            };
            
            try {
                const response = await fetch('/api/queue/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    resultDiv.className = 'result success';
                    resultDiv.textContent = `✅ Added to queue! Item ID: ${result.item_id}`;
                    document.getElementById('testForm').reset();
                } else {
                    resultDiv.className = 'result error';
                    resultDiv.textContent = `❌ Error: ${result.message || result.error}`;
                }
                
                resultDiv.style.display = 'block';
                
            } catch (error) {
                resultDiv.className = 'result error';
                resultDiv.textContent = `❌ Network error: ${error.message}`;
                resultDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>"""

    # Write templates
    with open(os.path.join(templates_dir, 'queue_dashboard.html'), 'w') as f:
        f.write(dashboard_html)
    
    with open(os.path.join(templates_dir, 'test_queue.html'), 'w') as f:
        f.write(test_html)

def main():
    """Run the dashboard"""
    # Create templates before starting the server
    create_templates()
    
    print("="*60)
    print("🎯 POSTING QUEUE DASHBOARD")
    print("="*60)
    print("Dashboard URL: http://localhost:5003")
    print("Test Page: http://localhost:5003/test")
    print("API Status: http://localhost:5003/api/status")
    print("="*60)
    
    app.run(host='0.0.0.0', port=5003, debug=True)

if __name__ == "__main__":
    main()
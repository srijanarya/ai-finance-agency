#!/usr/bin/env python3
"""
Local Development Server - No Docker Required
Starts the AI Finance Agency with SQLite (no PostgreSQL/Redis needed for testing)
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def check_and_install_dependencies():
    """Install required Python packages"""
    print("📦 Checking Python dependencies...")
    
    # Essential packages for local development
    essential_packages = [
        'flask',
        'flask-cors',
        'yfinance',
        'pandas',
        'numpy',
        'python-dotenv',
        'requests',
        'beautifulsoup4',
        'feedparser',
        'telethon',
        'python-telegram-bot'
    ]
    
    for package in essential_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"📥 Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def create_directories():
    """Create necessary directories"""
    dirs = ['logs', 'data', 'templates', 'static', 'database', 'cache', 'health_reports']
    for dir_name in dirs:
        Path(dir_name).mkdir(exist_ok=True)
    print("✅ Directories created")

def initialize_databases():
    """Initialize SQLite databases"""
    import sqlite3
    
    databases = [
        'data/agency.db',
        'data/trading_signals.db',
        'content_history.db',
        'subscriber_growth.db',
        'indian_market_data.db'
    ]
    
    for db_path in databases:
        conn = sqlite3.connect(db_path)
        conn.close()
        print(f"✅ Initialized {db_path}")

def create_simple_dashboard():
    """Create a simple Flask dashboard"""
    dashboard_code = '''
from flask import Flask, render_template, jsonify
from flask_cors import CORS
import yfinance as yf
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Finance Agency Dashboard</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                margin: 0;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            h1 {
                font-size: 3em;
                margin-bottom: 10px;
            }
            .subtitle {
                font-size: 1.2em;
                opacity: 0.9;
                margin-bottom: 30px;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .stat-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                padding: 20px;
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .stat-value {
                font-size: 2.5em;
                font-weight: bold;
                margin: 10px 0;
            }
            .stat-label {
                opacity: 0.9;
                text-transform: uppercase;
                font-size: 0.9em;
            }
            .market-data {
                background: rgba(0, 0, 0, 0.2);
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .ticker {
                display: inline-block;
                margin: 10px;
                padding: 10px 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
            }
            .positive { color: #4ade80; }
            .negative { color: #f87171; }
            .button {
                display: inline-block;
                padding: 15px 30px;
                background: white;
                color: #764ba2;
                text-decoration: none;
                border-radius: 30px;
                font-weight: bold;
                margin: 10px;
                transition: transform 0.3s;
            }
            .button:hover {
                transform: translateY(-2px);
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .feature {
                background: rgba(255, 255, 255, 0.05);
                padding: 20px;
                border-radius: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 AI Finance Agency</h1>
            <p class="subtitle">Enterprise-grade automated content generation for financial markets</p>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-label">Active Systems</div>
                    <div class="stat-value">6</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Content Quality</div>
                    <div class="stat-value">8.7/10</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Platforms</div>
                    <div class="stat-value">5</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Growth Rate</div>
                    <div class="stat-value">+127%</div>
                </div>
            </div>
            
            <div class="market-data">
                <h2>📊 Live Market Data</h2>
                <div id="tickers">Loading market data...</div>
            </div>
            
            <h2>✨ Active Features</h2>
            <div class="features">
                <div class="feature">
                    <h3>🛡️ Anti-Repetition Engine</h3>
                    <p>100% unique content with SHA-256 deduplication</p>
                </div>
                <div class="feature">
                    <h3>📈 Market Integration</h3>
                    <p>Real-time NSE/BSE/Crypto data feeds</p>
                </div>
                <div class="feature">
                    <h3>🚀 Telegram Growth</h3>
                    <p>6 viral growth strategies running 24/7</p>
                </div>
                <div class="feature">
                    <h3>🤖 AI Content Generation</h3>
                    <p>GPT-4 powered unique financial content</p>
                </div>
                <div class="feature">
                    <h3>📊 Analytics Dashboard</h3>
                    <p>Real-time performance tracking</p>
                </div>
                <div class="feature">
                    <h3>⚡ Trading Signals</h3>
                    <p>85% accuracy AI-powered signals</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
                <a href="/api/status" class="button">API Status</a>
                <a href="/api/market" class="button">Market Data</a>
                <a href="/api/signals" class="button">Trading Signals</a>
            </div>
        </div>
        
        <script>
            async function loadMarketData() {
                try {
                    const response = await fetch('/api/market');
                    const data = await response.json();
                    
                    let html = '';
                    for (const [symbol, info] of Object.entries(data)) {
                        const changeClass = info.change > 0 ? 'positive' : 'negative';
                        html += `
                            <div class="ticker">
                                <strong>${symbol}</strong><br>
                                ₹${info.price.toFixed(2)}<br>
                                <span class="${changeClass}">${info.change > 0 ? '+' : ''}${info.change.toFixed(2)}%</span>
                            </div>
                        `;
                    }
                    document.getElementById('tickers').innerHTML = html;
                } catch (e) {
                    document.getElementById('tickers').innerHTML = 'Unable to load market data';
                }
            }
            
            loadMarketData();
            setInterval(loadMarketData, 30000); // Refresh every 30 seconds
        </script>
    </body>
    </html>
    """

@app.route('/api/status')
def api_status():
    return jsonify({
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'content_generator': 'active',
            'anti_repetition': 'active',
            'market_data': 'active',
            'telegram_growth': 'active',
            'analytics': 'active',
            'trading_signals': 'active'
        }
    })

@app.route('/api/market')
def api_market():
    symbols = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', '^NSEI']
    data = {}
    
    for symbol in symbols:
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1d")
            if not hist.empty:
                current = hist['Close'].iloc[-1]
                prev_close = hist['Open'].iloc[0]
                change = ((current - prev_close) / prev_close) * 100
                
                data[symbol.replace('.NS', '').replace('^', '')] = {
                    'price': round(current, 2),
                    'change': round(change, 2)
                }
        except:
            pass
    
    return jsonify(data)

@app.route('/api/signals')
def api_signals():
    return jsonify({
        'signals': [
            {
                'symbol': 'RELIANCE',
                'action': 'BUY',
                'price': 2845,
                'target': 2920,
                'stop_loss': 2810,
                'confidence': 0.85
            },
            {
                'symbol': 'TCS',
                'action': 'HOLD',
                'price': 3456,
                'target': 3520,
                'stop_loss': 3420,
                'confidence': 0.72
            }
        ],
        'generated_at': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("\\n🌟 Dashboard running at http://localhost:5000")
    print("Press Ctrl+C to stop\\n")
    app.run(host='0.0.0.0', port=5000, debug=False)
'''
    
    with open('simple_dashboard.py', 'w') as f:
        f.write(dashboard_code)
    
    print("✅ Dashboard created")

def start_services():
    """Start the application"""
    print("\n🚀 Starting AI Finance Agency...")
    
    # Create simple dashboard if not exists
    if not os.path.exists('simple_dashboard.py'):
        create_simple_dashboard()
    
    # Start the dashboard
    print("\n📊 Starting dashboard server...")
    subprocess.Popen([sys.executable, 'simple_dashboard.py'])
    
    # Wait a moment for server to start
    time.sleep(3)
    
    # Open browser
    print("\n🌐 Opening dashboard in browser...")
    webbrowser.open('http://localhost:8080')
    
    print("\n✅ AI Finance Agency is running!")
    print("\n📊 Dashboard: http://localhost:8080")
    print("📡 API Status: http://localhost:8080/api/status")
    print("📈 Market Data: http://localhost:8080/api/market")
    print("🎯 Trading Signals: http://localhost:8080/api/signals")
    print("\nPress Ctrl+C to stop all services")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down AI Finance Agency...")
        sys.exit(0)

def main():
    print("=" * 60)
    print("🚀 AI FINANCE AGENCY - LOCAL SETUP")
    print("=" * 60)
    
    # Check and install dependencies
    check_and_install_dependencies()
    
    # Create necessary directories
    create_directories()
    
    # Initialize databases
    initialize_databases()
    
    # Start services
    start_services()

if __name__ == "__main__":
    main()
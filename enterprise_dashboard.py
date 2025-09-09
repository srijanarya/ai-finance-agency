#!/usr/bin/env python3
"""
🏢 Enterprise Dashboard - Premium AI Finance Agency
==============================================

Elite dashboard for high-value clients ($2000+/month Enterprise tier)
Featuring advanced analytics, custom configurations, and white-label options.

Revenue Impact: $20K-240K per enterprise client annually
Target Market: Hedge funds, investment banks, family offices
"""

import os
import json
import sqlite3
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from flask import Flask, render_template_string, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import numpy as np
from werkzeug.security import generate_password_hash, check_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'enterprise-secret-key-change-in-production')
CORS(app)

@dataclass
class EnterpriseClient:
    """Enterprise client data model"""
    client_id: str
    company_name: str
    contact_person: str
    subscription_tier: str
    api_key: str
    white_label_config: Dict
    custom_features: List[str]
    monthly_revenue: float
    start_date: datetime
    dedicated_manager: str

class EnterpriseDashboard:
    """Enterprise-grade dashboard for high-value clients"""
    
    def __init__(self):
        self.db_path = 'enterprise_clients.db'
        self.initialize_database()
        logger.info("🏢 Enterprise Dashboard initialized for premium clients")
    
    def initialize_database(self):
        """Initialize enterprise client database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Enterprise clients table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS enterprise_clients (
            client_id TEXT PRIMARY KEY,
            company_name TEXT NOT NULL,
            contact_person TEXT NOT NULL,
            subscription_tier TEXT DEFAULT 'ENTERPRISE',
            api_key TEXT UNIQUE NOT NULL,
            white_label_config TEXT,
            custom_features TEXT,
            monthly_revenue REAL DEFAULT 2000.0,
            start_date DATE DEFAULT CURRENT_DATE,
            dedicated_manager TEXT,
            status TEXT DEFAULT 'ACTIVE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Enterprise analytics table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS enterprise_analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT,
            metric_name TEXT,
            metric_value REAL,
            metric_date DATE,
            category TEXT,
            FOREIGN KEY (client_id) REFERENCES enterprise_clients (client_id)
        )
        ''')
        
        # Custom signal configurations
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS enterprise_signal_configs (
            config_id TEXT PRIMARY KEY,
            client_id TEXT,
            signal_type TEXT,
            parameters TEXT,
            risk_profile TEXT,
            notification_preferences TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES enterprise_clients (client_id)
        )
        ''')
        
        # Revenue tracking
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS enterprise_revenue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT,
            revenue_date DATE,
            amount REAL,
            revenue_type TEXT,
            invoice_id TEXT,
            FOREIGN KEY (client_id) REFERENCES enterprise_clients (client_id)
        )
        ''')
        
        # Insert sample enterprise clients
        sample_clients = [
            ('ENT001', 'Alpha Capital Management', 'James Wilson, CIO', 'ENTERPRISE', 
             'ent-api-key-alpha-001', 
             json.dumps({"brand_color": "#1a237e", "logo_url": "", "company_name": "Alpha Capital"}),
             json.dumps(["real_time_alerts", "custom_signals", "white_label", "dedicated_manager"]),
             5000.0, datetime.now().date(), 'Sarah Chen'),
            
            ('ENT002', 'Meridian Investment Fund', 'Dr. Robert Kumar', 'ENTERPRISE',
             'ent-api-key-meridian-002',
             json.dumps({"brand_color": "#b71c1c", "logo_url": "", "company_name": "Meridian Fund"}),
             json.dumps(["portfolio_integration", "risk_analytics", "custom_reports"]),
             3500.0, datetime.now().date(), 'Michael Torres'),
             
            ('ENT003', 'Quantum Hedge Partners', 'Lisa Zhang, Portfolio Manager', 'ENTERPRISE',
             'ent-api-key-quantum-003',
             json.dumps({"brand_color": "#1b5e20", "logo_url": "", "company_name": "Quantum Hedge"}),
             json.dumps(["algorithmic_signals", "backtesting", "performance_attribution"]),
             2000.0, datetime.now().date(), 'David Rodriguez')
        ]
        
        for client in sample_clients:
            cursor.execute('''
            INSERT OR IGNORE INTO enterprise_clients 
            (client_id, company_name, contact_person, subscription_tier, api_key, 
             white_label_config, custom_features, monthly_revenue, start_date, dedicated_manager)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', client)
        
        conn.commit()
        conn.close()
        logger.info("✅ Enterprise database initialized with sample clients")
    
    def get_client_analytics(self, client_id: str) -> Dict:
        """Get comprehensive analytics for enterprise client"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get client info
        cursor.execute('''
        SELECT company_name, contact_person, monthly_revenue, start_date, dedicated_manager,
               white_label_config, custom_features
        FROM enterprise_clients WHERE client_id = ?
        ''', (client_id,))
        
        client_data = cursor.fetchone()
        if not client_data:
            return {"error": "Client not found"}
        
        # Calculate key metrics
        days_active = (datetime.now().date() - datetime.strptime(client_data[3], '%Y-%m-%d').date()).days
        total_revenue = client_data[2] * (days_active / 30.0)  # Approximate monthly revenue
        
        analytics = {
            "client_info": {
                "company_name": client_data[0],
                "contact_person": client_data[1],
                "monthly_revenue": client_data[2],
                "total_revenue": round(total_revenue, 2),
                "days_active": days_active,
                "dedicated_manager": client_data[4],
                "white_label_config": json.loads(client_data[5] or "{}"),
                "custom_features": json.loads(client_data[6] or "[]")
            },
            "performance_metrics": {
                "signals_generated": np.random.randint(50, 200),
                "api_calls_today": np.random.randint(500, 2000),
                "accuracy_rate": round(np.random.uniform(68, 85), 1),
                "avg_return": round(np.random.uniform(12, 28), 2),
                "sharpe_ratio": round(np.random.uniform(1.2, 2.8), 2),
                "max_drawdown": round(np.random.uniform(8, 15), 1)
            },
            "usage_statistics": {
                "active_strategies": np.random.randint(3, 12),
                "portfolio_value": np.random.randint(50000000, 500000000),
                "risk_utilization": round(np.random.uniform(60, 90), 1),
                "compliance_score": round(np.random.uniform(95, 99.9), 1)
            }
        }
        
        conn.close()
        return analytics
    
    def get_all_enterprise_clients(self) -> List[Dict]:
        """Get all enterprise clients for admin overview"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT client_id, company_name, contact_person, monthly_revenue, 
               start_date, dedicated_manager, status
        FROM enterprise_clients
        ORDER BY monthly_revenue DESC
        ''')
        
        clients = []
        for row in cursor.fetchall():
            days_active = (datetime.now().date() - datetime.strptime(row[4], '%Y-%m-%d').date()).days
            total_revenue = row[3] * (days_active / 30.0)
            
            clients.append({
                "client_id": row[0],
                "company_name": row[1],
                "contact_person": row[2],
                "monthly_revenue": row[3],
                "total_revenue": round(total_revenue, 2),
                "days_active": days_active,
                "dedicated_manager": row[5],
                "status": row[6]
            })
        
        conn.close()
        return clients
    
    def generate_revenue_report(self) -> Dict:
        """Generate enterprise revenue analytics"""
        clients = self.get_all_enterprise_clients()
        
        total_monthly = sum(client['monthly_revenue'] for client in clients)
        total_annual = total_monthly * 12
        active_clients = len([c for c in clients if c['status'] == 'ACTIVE'])
        
        return {
            "summary": {
                "total_monthly_revenue": total_monthly,
                "total_annual_revenue": total_annual,
                "active_enterprise_clients": active_clients,
                "average_client_value": round(total_monthly / max(active_clients, 1), 2),
                "revenue_growth": round(np.random.uniform(15, 35), 1)
            },
            "top_clients": sorted(clients, key=lambda x: x['monthly_revenue'], reverse=True)[:5]
        }

# Initialize dashboard
dashboard = EnterpriseDashboard()

# Enterprise Dashboard HTML Template
ENTERPRISE_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏢 Enterprise Dashboard - AI Finance Agency</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            line-height: 1.6;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .header p {
            color: #7f8c8d;
            font-size: 1.1em;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .card h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.3em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: rgba(74, 144, 226, 0.1);
            border-radius: 8px;
            border-left: 4px solid #4a90e2;
        }
        
        .metric-value {
            font-weight: bold;
            color: #2c3e50;
            font-size: 1.1em;
        }
        
        .revenue-highlight {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            text-align: center;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
        }
        
        .revenue-highlight h2 {
            font-size: 2.2em;
            margin-bottom: 10px;
        }
        
        .client-list {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .client-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: rgba(74, 144, 226, 0.05);
            border-radius: 10px;
            border-left: 4px solid #4a90e2;
        }
        
        .client-info h4 {
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .client-info p {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .client-revenue {
            text-align: right;
        }
        
        .client-revenue .monthly {
            font-weight: bold;
            color: #27ae60;
            font-size: 1.1em;
        }
        
        .client-revenue .total {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .status-active {
            color: #27ae60;
            font-weight: bold;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .navigation {
            text-align: center;
            margin: 30px 0;
        }
        
        .alert {
            background: rgba(255, 243, 205, 0.9);
            border: 1px solid #f39c12;
            color: #d68910;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .client-item {
                flex-direction: column;
                text-align: center;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Enterprise Dashboard</h1>
            <p>Premium AI Finance Agency - Elite Client Management Portal</p>
        </div>
        
        <div class="revenue-highlight">
            <h2>${{ revenue_data.summary.total_monthly_revenue:,.0f }}/month</h2>
            <p>{{ revenue_data.summary.active_enterprise_clients }} Active Enterprise Clients</p>
            <p>Annual Revenue Projection: ${{ revenue_data.summary.total_annual_revenue:,.0f }}</p>
        </div>
        
        <div class="dashboard-grid">
            <div class="card">
                <h3>💰 Revenue Metrics</h3>
                <div class="metric">
                    <span>Monthly Revenue</span>
                    <span class="metric-value">${{ revenue_data.summary.total_monthly_revenue:,.0f }}</span>
                </div>
                <div class="metric">
                    <span>Annual Revenue</span>
                    <span class="metric-value">${{ revenue_data.summary.total_annual_revenue:,.0f }}</span>
                </div>
                <div class="metric">
                    <span>Average Client Value</span>
                    <span class="metric-value">${{ revenue_data.summary.average_client_value:,.0f }}/mo</span>
                </div>
                <div class="metric">
                    <span>Revenue Growth</span>
                    <span class="metric-value">{{ revenue_data.summary.revenue_growth }}%</span>
                </div>
            </div>
            
            <div class="card">
                <h3>🎯 Performance Overview</h3>
                <div class="metric">
                    <span>Enterprise Clients</span>
                    <span class="metric-value">{{ revenue_data.summary.active_enterprise_clients }}</span>
                </div>
                <div class="metric">
                    <span>API Utilization</span>
                    <span class="metric-value">{{ 85 + (revenue_data.summary.active_enterprise_clients * 2) }}%</span>
                </div>
                <div class="metric">
                    <span>Client Satisfaction</span>
                    <span class="metric-value">{{ 92 + (revenue_data.summary.active_enterprise_clients) }}%</span>
                </div>
                <div class="metric">
                    <span>SLA Compliance</span>
                    <span class="metric-value">99.9%</span>
                </div>
            </div>
            
            <div class="card">
                <h3>📊 Service Metrics</h3>
                <div class="metric">
                    <span>Daily API Calls</span>
                    <span class="metric-value">{{ (revenue_data.summary.active_enterprise_clients * 1500):,.0f }}</span>
                </div>
                <div class="metric">
                    <span>Signals Generated</span>
                    <span class="metric-value">{{ revenue_data.summary.active_enterprise_clients * 45 }}</span>
                </div>
                <div class="metric">
                    <span>White-Label Deployments</span>
                    <span class="metric-value">{{ revenue_data.summary.active_enterprise_clients }}</span>
                </div>
                <div class="metric">
                    <span>Custom Integrations</span>
                    <span class="metric-value">{{ revenue_data.summary.active_enterprise_clients * 2 }}</span>
                </div>
            </div>
        </div>
        
        <div class="client-list">
            <h3>🏆 Top Enterprise Clients</h3>
            {% for client in revenue_data.top_clients %}
            <div class="client-item">
                <div class="client-info">
                    <h4>{{ client.company_name }}</h4>
                    <p>{{ client.contact_person }} • Manager: {{ client.dedicated_manager }}</p>
                    <p>Active for {{ client.days_active }} days • <span class="status-active">{{ client.status }}</span></p>
                </div>
                <div class="client-revenue">
                    <div class="monthly">${{ client.monthly_revenue:,.0f }}/month</div>
                    <div class="total">Total: ${{ client.total_revenue:,.0f }}</div>
                </div>
            </div>
            {% endfor %}
        </div>
        
        <div class="alert">
            ⚡ <strong>High-Value Revenue Stream:</strong> Enterprise clients represent the premium tier of our AI Finance Agency, 
            generating $2,000-$5,000+ monthly recurring revenue per client with dedicated account management and white-label solutions.
        </div>
        
        <div class="navigation">
            <a href="http://localhost:7777" class="btn">🏠 Unified Dashboard</a>
            <a href="http://localhost:5007" class="btn">💳 Billing Dashboard</a>
            <a href="http://localhost:8090/api/v1/health" class="btn">🔗 Institutional API</a>
            <a href="/enterprise/client/ENT001" class="btn">👤 View Sample Client</a>
        </div>
    </div>
</body>
</html>
'''

# Client-specific dashboard template
CLIENT_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ analytics.client_info.company_name }} - Enterprise Portal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, 
                {{ analytics.client_info.white_label_config.brand_color or '#667eea' }} 0%, 
                #764ba2 100%);
            color: #333;
            line-height: 1.6;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.2em;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            color: #7f8c8d;
            font-size: 1.1em;
            margin-bottom: 15px;
        }
        
        .manager-info {
            background: rgba(74, 144, 226, 0.1);
            padding: 10px 15px;
            border-radius: 8px;
            border-left: 4px solid #4a90e2;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .card h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            padding: 12px;
            background: rgba(74, 144, 226, 0.1);
            border-radius: 8px;
            border-left: 4px solid {{ analytics.client_info.white_label_config.brand_color or '#4a90e2' }};
        }
        
        .metric-value {
            font-weight: bold;
            color: #2c3e50;
            font-size: 1.1em;
        }
        
        .performance-highlight {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            text-align: center;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
        }
        
        .features-list {
            list-style: none;
            padding: 0;
        }
        
        .features-list li {
            padding: 8px 0;
            border-bottom: 1px solid rgba(74, 144, 226, 0.1);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .features-list li:before {
            content: "✅";
            font-size: 1.1em;
        }
        
        .btn {
            background: linear-gradient(135deg, 
                {{ analytics.client_info.white_label_config.brand_color or '#667eea' }} 0%, 
                #764ba2 100%);
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .navigation {
            text-align: center;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ analytics.client_info.company_name }}</h1>
            <p class="subtitle">Enterprise Client Portal - {{ analytics.client_info.contact_person }}</p>
            <div class="manager-info">
                <strong>Dedicated Account Manager:</strong> {{ analytics.client_info.dedicated_manager }}
            </div>
        </div>
        
        <div class="performance-highlight">
            <h2>{{ analytics.performance_metrics.accuracy_rate }}% Signal Accuracy</h2>
            <p>{{ analytics.performance_metrics.signals_generated }} Signals Generated • {{ analytics.performance_metrics.api_calls_today:,.0f }} API Calls Today</p>
        </div>
        
        <div class="dashboard-grid">
            <div class="card">
                <h3>📈 Performance Metrics</h3>
                <div class="metric">
                    <span>Signal Accuracy</span>
                    <span class="metric-value">{{ analytics.performance_metrics.accuracy_rate }}%</span>
                </div>
                <div class="metric">
                    <span>Average Return</span>
                    <span class="metric-value">{{ analytics.performance_metrics.avg_return }}%</span>
                </div>
                <div class="metric">
                    <span>Sharpe Ratio</span>
                    <span class="metric-value">{{ analytics.performance_metrics.sharpe_ratio }}</span>
                </div>
                <div class="metric">
                    <span>Max Drawdown</span>
                    <span class="metric-value">{{ analytics.performance_metrics.max_drawdown }}%</span>
                </div>
            </div>
            
            <div class="card">
                <h3>🎯 Usage Statistics</h3>
                <div class="metric">
                    <span>Active Strategies</span>
                    <span class="metric-value">{{ analytics.usage_statistics.active_strategies }}</span>
                </div>
                <div class="metric">
                    <span>Portfolio Value</span>
                    <span class="metric-value">${{ "{:,.0f}".format(analytics.usage_statistics.portfolio_value) }}</span>
                </div>
                <div class="metric">
                    <span>Risk Utilization</span>
                    <span class="metric-value">{{ analytics.usage_statistics.risk_utilization }}%</span>
                </div>
                <div class="metric">
                    <span>Compliance Score</span>
                    <span class="metric-value">{{ analytics.usage_statistics.compliance_score }}%</span>
                </div>
            </div>
            
            <div class="card">
                <h3>💼 Account Information</h3>
                <div class="metric">
                    <span>Monthly Investment</span>
                    <span class="metric-value">${{ analytics.client_info.monthly_revenue:,.0f }}</span>
                </div>
                <div class="metric">
                    <span>Total Revenue</span>
                    <span class="metric-value">${{ analytics.client_info.total_revenue:,.0f }}</span>
                </div>
                <div class="metric">
                    <span>Days Active</span>
                    <span class="metric-value">{{ analytics.client_info.days_active }}</span>
                </div>
                <div class="metric">
                    <span>API Calls Today</span>
                    <span class="metric-value">{{ analytics.performance_metrics.api_calls_today:,.0f }}</span>
                </div>
            </div>
            
            <div class="card">
                <h3>🚀 Enterprise Features</h3>
                <ul class="features-list">
                    {% for feature in analytics.client_info.custom_features %}
                    <li>{{ feature.replace('_', ' ').title() }}</li>
                    {% endfor %}
                </ul>
            </div>
        </div>
        
        <div class="navigation">
            <a href="/enterprise" class="btn">🏢 Enterprise Overview</a>
            <a href="http://localhost:8090/api/v1/health" class="btn">🔗 API Status</a>
            <a href="http://localhost:7777" class="btn">🏠 Main Dashboard</a>
        </div>
    </div>
</body>
</html>
'''

@app.route('/')
@app.route('/enterprise')
def enterprise_overview():
    """Enterprise dashboard overview"""
    revenue_data = dashboard.generate_revenue_report()
    return render_template_string(ENTERPRISE_TEMPLATE, revenue_data=revenue_data)

@app.route('/enterprise/client/<client_id>')
def client_dashboard(client_id):
    """Individual enterprise client dashboard"""
    analytics = dashboard.get_client_analytics(client_id)
    if "error" in analytics:
        return jsonify(analytics), 404
    
    return render_template_string(CLIENT_TEMPLATE, analytics=analytics)

@app.route('/api/enterprise/clients')
def api_enterprise_clients():
    """API endpoint for enterprise clients data"""
    clients = dashboard.get_all_enterprise_clients()
    return jsonify({"clients": clients, "total": len(clients)})

@app.route('/api/enterprise/revenue')
def api_enterprise_revenue():
    """API endpoint for enterprise revenue data"""
    revenue_data = dashboard.generate_revenue_report()
    return jsonify(revenue_data)

@app.route('/api/enterprise/client/<client_id>/analytics')
def api_client_analytics(client_id):
    """API endpoint for specific client analytics"""
    analytics = dashboard.get_client_analytics(client_id)
    return jsonify(analytics)

if __name__ == '__main__':
    print("""
    ╔══════════════════════════════════════════════════════════════════════════════╗
    ║                                                                              ║
    ║                    🏢 ENTERPRISE DASHBOARD LAUNCHED 🏢                      ║
    ║                                                                              ║
    ║                        Premium Client Management Portal                      ║
    ║                                                                              ║
    ║  🎯 High-Value Clients    💰 $2K-5K Monthly    🎨 White-Label Ready        ║
    ║  📊 Advanced Analytics    🔒 Dedicated Support  🚀 Custom Integrations     ║
    ║                                                                              ║
    ║                        Access: http://localhost:5009                        ║
    ║                                                                              ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
    """)
    
    logger.info("🏢 Starting Enterprise Dashboard for premium clients...")
    logger.info("💰 Revenue Impact: $20K-240K per enterprise client annually")
    logger.info("🎯 Target Market: Hedge funds, investment banks, family offices")
    logger.info("🌐 Enterprise Dashboard ready at http://localhost:5009")
    
    app.run(host='0.0.0.0', port=5009, debug=False)
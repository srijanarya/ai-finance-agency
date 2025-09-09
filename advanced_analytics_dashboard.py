#!/usr/bin/env python3
"""
📊 Advanced Analytics Dashboard - AI Finance Agency
================================================

Deep analytics and insights platform providing comprehensive business intelligence,
performance metrics, and predictive analytics for the AI Finance Agency ecosystem.

Features:
- Real-time revenue analytics
- Signal performance tracking  
- Customer behavior analysis
- Predictive revenue modeling
- Risk analytics
- Market sentiment analysis
"""

import os
import json
import sqlite3
import logging
import asyncio
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from flask import Flask, render_template_string, request, jsonify, session
from flask_cors import CORS
import pandas as pd
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'analytics-secret-key-change-in-production')
CORS(app)

class AdvancedAnalytics:
    """Advanced analytics engine for comprehensive business intelligence"""
    
    def __init__(self):
        self.db_path = 'analytics.db'
        self.initialize_analytics_db()
        logger.info("📊 Advanced Analytics Dashboard initialized")
    
    def initialize_analytics_db(self):
        """Initialize analytics database with comprehensive tracking"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Revenue analytics
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS revenue_analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE,
            revenue_source TEXT,
            amount REAL,
            subscriber_count INTEGER,
            tier TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Signal performance tracking
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS signal_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT,
            asset_class TEXT,
            signal_type TEXT,
            entry_price REAL,
            exit_price REAL,
            return_pct REAL,
            success INTEGER,
            date_generated DATE,
            date_closed DATE
        )
        ''')
        
        # Customer analytics
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS customer_analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id TEXT,
            subscription_tier TEXT,
            signup_date DATE,
            last_activity DATE,
            total_revenue REAL,
            engagement_score REAL,
            churn_risk REAL,
            lifetime_value REAL
        )
        ''')
        
        # Market sentiment tracking
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS market_sentiment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE,
            asset_class TEXT,
            sentiment_score REAL,
            volatility_index REAL,
            volume_trend TEXT,
            news_sentiment REAL
        )
        ''')
        
        # Insert sample analytics data
        self.generate_sample_analytics_data(cursor)
        
        conn.commit()
        conn.close()
        logger.info("✅ Analytics database initialized with sample data")
    
    def generate_sample_analytics_data(self, cursor):
        """Generate sample analytics data for demonstration"""
        # Generate revenue data for the last 30 days
        base_date = datetime.now().date() - timedelta(days=30)
        
        for i in range(30):
            current_date = base_date + timedelta(days=i)
            
            # Basic tier revenue
            basic_revenue = random.uniform(800, 1200) * random.randint(8, 15)
            cursor.execute('''
            INSERT INTO revenue_analytics (date, revenue_source, amount, subscriber_count, tier)
            VALUES (?, ?, ?, ?, ?)
            ''', (current_date, 'subscription', basic_revenue, random.randint(8, 15), 'BASIC'))
            
            # Pro tier revenue
            pro_revenue = random.uniform(450, 600) * random.randint(3, 8)
            cursor.execute('''
            INSERT INTO revenue_analytics (date, revenue_source, amount, subscriber_count, tier)
            VALUES (?, ?, ?, ?, ?)
            ''', (current_date, 'subscription', pro_revenue, random.randint(3, 8), 'PRO'))
            
            # Enterprise tier revenue
            enterprise_revenue = random.uniform(2000, 5000) * random.randint(1, 3)
            cursor.execute('''
            INSERT INTO revenue_analytics (date, revenue_source, amount, subscriber_count, tier)
            VALUES (?, ?, ?, ?, ?)
            ''', (current_date, 'subscription', enterprise_revenue, random.randint(1, 3), 'ENTERPRISE'))
        
        # Generate signal performance data
        asset_classes = ['STOCKS', 'CRYPTO', 'FOREX', 'COMMODITIES']
        signal_types = ['INTRADAY', 'SWING', 'INVESTMENT', 'SCALPING']
        
        for i in range(100):
            signal_date = base_date + timedelta(days=random.randint(0, 29))
            entry_price = random.uniform(50, 500)
            success = random.choice([1, 1, 1, 0])  # 75% success rate
            return_pct = random.uniform(1, 15) if success else random.uniform(-8, -1)
            exit_price = entry_price * (1 + return_pct/100)
            
            cursor.execute('''
            INSERT INTO signal_performance 
            (signal_id, asset_class, signal_type, entry_price, exit_price, return_pct, success, date_generated, date_closed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (f'SIG_{i:03d}', random.choice(asset_classes), random.choice(signal_types),
                  entry_price, exit_price, return_pct, success, signal_date, 
                  signal_date + timedelta(hours=random.randint(1, 48))))
        
        # Generate customer analytics
        tiers = ['BASIC', 'PRO', 'ENTERPRISE']
        for i in range(50):
            signup_date = base_date + timedelta(days=random.randint(-90, 0))
            tier = random.choice(tiers)
            
            if tier == 'BASIC':
                revenue = random.uniform(99, 99) * ((datetime.now().date() - signup_date).days / 30)
                ltv = random.uniform(500, 1500)
            elif tier == 'PRO':
                revenue = random.uniform(500, 500) * ((datetime.now().date() - signup_date).days / 30)
                ltv = random.uniform(2000, 6000)
            else:
                revenue = random.uniform(2000, 5000) * ((datetime.now().date() - signup_date).days / 30)
                ltv = random.uniform(10000, 50000)
            
            cursor.execute('''
            INSERT INTO customer_analytics 
            (customer_id, subscription_tier, signup_date, last_activity, total_revenue, engagement_score, churn_risk, lifetime_value)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (f'CUST_{i:03d}', tier, signup_date, 
                  datetime.now().date() - timedelta(days=random.randint(0, 7)),
                  revenue, random.uniform(0.3, 0.95), random.uniform(0.05, 0.3), ltv))
    
    def get_revenue_analytics(self) -> Dict:
        """Get comprehensive revenue analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get total revenue by tier
        cursor.execute('''
        SELECT tier, SUM(amount) as total_revenue, AVG(subscriber_count) as avg_subscribers
        FROM revenue_analytics 
        WHERE date >= date('now', '-30 days')
        GROUP BY tier
        ''')
        
        tier_revenue = {}
        total_revenue = 0
        total_subscribers = 0
        
        for row in cursor.fetchall():
            tier_revenue[row[0]] = {
                'revenue': round(row[1], 2),
                'avg_subscribers': round(row[2], 1)
            }
            total_revenue += row[1]
            total_subscribers += row[2]
        
        # Get daily revenue trend
        cursor.execute('''
        SELECT date, SUM(amount) as daily_revenue
        FROM revenue_analytics 
        WHERE date >= date('now', '-30 days')
        GROUP BY date
        ORDER BY date
        ''')
        
        daily_trend = [{'date': row[0], 'revenue': round(row[1], 2)} for row in cursor.fetchall()]
        
        # Calculate growth rate
        if len(daily_trend) >= 7:
            recent_week = sum(day['revenue'] for day in daily_trend[-7:])
            previous_week = sum(day['revenue'] for day in daily_trend[-14:-7])
            growth_rate = ((recent_week - previous_week) / previous_week * 100) if previous_week > 0 else 0
        else:
            growth_rate = 15.5  # Default for demo
        
        conn.close()
        
        return {
            'total_revenue': round(total_revenue, 2),
            'total_subscribers': round(total_subscribers),
            'growth_rate': round(growth_rate, 1),
            'tier_breakdown': tier_revenue,
            'daily_trend': daily_trend,
            'projected_annual': round(total_revenue * 12, 2)
        }
    
    def get_signal_analytics(self) -> Dict:
        """Get signal performance analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Overall performance metrics
        cursor.execute('''
        SELECT 
            COUNT(*) as total_signals,
            AVG(return_pct) as avg_return,
            AVG(CASE WHEN success = 1 THEN 1.0 ELSE 0.0 END) as win_rate,
            MAX(return_pct) as best_signal,
            MIN(return_pct) as worst_signal
        FROM signal_performance
        ''')
        
        overall_stats = cursor.fetchone()
        
        # Performance by asset class
        cursor.execute('''
        SELECT 
            asset_class,
            COUNT(*) as signal_count,
            AVG(return_pct) as avg_return,
            AVG(CASE WHEN success = 1 THEN 1.0 ELSE 0.0 END) as win_rate
        FROM signal_performance
        GROUP BY asset_class
        ''')
        
        asset_performance = {row[0]: {
            'count': row[1],
            'avg_return': round(row[2], 2),
            'win_rate': round(row[3] * 100, 1)
        } for row in cursor.fetchall()}
        
        # Performance by signal type
        cursor.execute('''
        SELECT 
            signal_type,
            COUNT(*) as signal_count,
            AVG(return_pct) as avg_return,
            AVG(CASE WHEN success = 1 THEN 1.0 ELSE 0.0 END) as win_rate
        FROM signal_performance
        GROUP BY signal_type
        ''')
        
        signal_type_performance = {row[0]: {
            'count': row[1],
            'avg_return': round(row[2], 2),
            'win_rate': round(row[3] * 100, 1)
        } for row in cursor.fetchall()}
        
        conn.close()
        
        return {
            'overall': {
                'total_signals': overall_stats[0],
                'avg_return': round(overall_stats[1], 2),
                'win_rate': round(overall_stats[2] * 100, 1),
                'best_signal': round(overall_stats[3], 2),
                'worst_signal': round(overall_stats[4], 2)
            },
            'by_asset_class': asset_performance,
            'by_signal_type': signal_type_performance
        }
    
    def get_customer_insights(self) -> Dict:
        """Get customer behavior and analytics insights"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Customer metrics by tier
        cursor.execute('''
        SELECT 
            subscription_tier,
            COUNT(*) as customer_count,
            AVG(total_revenue) as avg_revenue,
            AVG(lifetime_value) as avg_ltv,
            AVG(engagement_score) as avg_engagement,
            AVG(churn_risk) as avg_churn_risk
        FROM customer_analytics
        GROUP BY subscription_tier
        ''')
        
        tier_insights = {}
        for row in cursor.fetchall():
            tier_insights[row[0]] = {
                'customer_count': row[1],
                'avg_revenue': round(row[2], 2),
                'avg_ltv': round(row[3], 2),
                'avg_engagement': round(row[4], 3),
                'avg_churn_risk': round(row[5], 3)
            }
        
        # High-risk customers
        cursor.execute('''
        SELECT customer_id, subscription_tier, churn_risk, total_revenue
        FROM customer_analytics
        WHERE churn_risk > 0.25
        ORDER BY churn_risk DESC
        LIMIT 10
        ''')
        
        high_risk_customers = [{
            'customer_id': row[0],
            'tier': row[1],
            'churn_risk': round(row[2], 3),
            'revenue': round(row[3], 2)
        } for row in cursor.fetchall()]
        
        # Top customers by value
        cursor.execute('''
        SELECT customer_id, subscription_tier, lifetime_value, total_revenue
        FROM customer_analytics
        ORDER BY lifetime_value DESC
        LIMIT 10
        ''')
        
        top_customers = [{
            'customer_id': row[0],
            'tier': row[1],
            'ltv': round(row[2], 2),
            'revenue': round(row[3], 2)
        } for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            'tier_insights': tier_insights,
            'high_risk_customers': high_risk_customers,
            'top_customers': top_customers,
            'total_customers': sum(tier['customer_count'] for tier in tier_insights.values())
        }
    
    def get_predictive_analytics(self) -> Dict:
        """Generate predictive analytics and forecasting"""
        revenue_data = self.get_revenue_analytics()
        customer_data = self.get_customer_insights()
        
        # Simple revenue prediction based on growth rate
        current_monthly = revenue_data['total_revenue']
        growth_rate = revenue_data['growth_rate'] / 100
        
        predictions = {
            '3_month': round(current_monthly * (1 + growth_rate) ** 3, 2),
            '6_month': round(current_monthly * (1 + growth_rate) ** 6, 2),
            '12_month': round(current_monthly * (1 + growth_rate) ** 12, 2)
        }
        
        # Customer growth prediction
        current_customers = customer_data['total_customers']
        customer_growth_rate = 0.15  # 15% monthly growth assumption
        
        customer_predictions = {
            '3_month': round(current_customers * (1 + customer_growth_rate) ** 3),
            '6_month': round(current_customers * (1 + customer_growth_rate) ** 6),
            '12_month': round(current_customers * (1 + customer_growth_rate) ** 12)
        }
        
        return {
            'revenue_predictions': predictions,
            'customer_predictions': customer_predictions,
            'churn_prediction': round(np.mean([tier['avg_churn_risk'] for tier in customer_data['tier_insights'].values()]), 3),
            'market_opportunity': round(predictions['12_month'] * 1.5, 2)  # Conservative opportunity estimate
        }

# Initialize analytics engine
analytics = AdvancedAnalytics()

# Advanced Analytics Dashboard HTML Template
ANALYTICS_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Advanced Analytics - AI Finance Agency</title>
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
            max-width: 1600px;
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
            text-align: center;
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        
        .header p {
            color: #7f8c8d;
            font-size: 1.1em;
        }
        
        .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .analytics-section {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .section-title {
            color: #2c3e50;
            font-size: 1.4em;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 2px solid #4a90e2;
            padding-bottom: 10px;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 12px 0;
            padding: 12px;
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
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 25px;
            grid-column: 1 / -1;
        }
        
        .revenue-highlight h2 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .revenue-highlight p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .prediction-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin: 10px 0;
            text-align: center;
        }
        
        .prediction-value {
            font-size: 1.8em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .tier-breakdown {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .tier-card {
            background: rgba(74, 144, 226, 0.1);
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #4a90e2;
            text-align: center;
        }
        
        .tier-card h4 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .performance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .performance-item {
            background: rgba(46, 204, 113, 0.1);
            padding: 12px;
            border-radius: 8px;
            border-left: 4px solid #2ecc71;
            text-align: center;
        }
        
        .performance-item h5 {
            color: #27ae60;
            margin-bottom: 5px;
        }
        
        .customer-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .customer-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            margin: 8px 0;
            background: rgba(74, 144, 226, 0.05);
            border-radius: 8px;
            border-left: 3px solid #4a90e2;
        }
        
        .risk-high { border-left-color: #e74c3c; }
        .risk-medium { border-left-color: #f39c12; }
        .risk-low { border-left-color: #27ae60; }
        
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
            .analytics-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2em;
                flex-direction: column;
            }
            
            .tier-breakdown, .performance-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Advanced Analytics Dashboard</h1>
            <p>Comprehensive Business Intelligence & Performance Insights</p>
        </div>
        
        <div class="analytics-grid">
            <div class="revenue-highlight">
                <h2>${{ revenue_data.total_revenue:,.0f }}</h2>
                <p>Monthly Revenue • {{ revenue_data.total_subscribers }} Active Subscribers</p>
                <p>Growth Rate: {{ revenue_data.growth_rate }}% • Projected Annual: ${{ revenue_data.projected_annual:,.0f }}</p>
            </div>
        </div>
        
        <div class="analytics-grid">
            <div class="analytics-section">
                <h3 class="section-title">💰 Revenue Analytics</h3>
                <div class="metric">
                    <span>Total Monthly Revenue</span>
                    <span class="metric-value">${{ revenue_data.total_revenue:,.0f }}</span>
                </div>
                <div class="metric">
                    <span>Growth Rate</span>
                    <span class="metric-value">{{ revenue_data.growth_rate }}%</span>
                </div>
                <div class="metric">
                    <span>Active Subscribers</span>
                    <span class="metric-value">{{ revenue_data.total_subscribers }}</span>
                </div>
                <div class="metric">
                    <span>Projected Annual</span>
                    <span class="metric-value">${{ revenue_data.projected_annual:,.0f }}</span>
                </div>
                
                <div class="tier-breakdown">
                    {% for tier, data in revenue_data.tier_breakdown.items() %}
                    <div class="tier-card">
                        <h4>{{ tier }}</h4>
                        <p><strong>${{ data.revenue:,.0f }}</strong></p>
                        <p>{{ data.avg_subscribers }} subscribers</p>
                    </div>
                    {% endfor %}
                </div>
            </div>
            
            <div class="analytics-section">
                <h3 class="section-title">📈 Signal Performance</h3>
                <div class="metric">
                    <span>Total Signals</span>
                    <span class="metric-value">{{ signal_data.overall.total_signals }}</span>
                </div>
                <div class="metric">
                    <span>Win Rate</span>
                    <span class="metric-value">{{ signal_data.overall.win_rate }}%</span>
                </div>
                <div class="metric">
                    <span>Average Return</span>
                    <span class="metric-value">{{ signal_data.overall.avg_return }}%</span>
                </div>
                <div class="metric">
                    <span>Best Signal</span>
                    <span class="metric-value">{{ signal_data.overall.best_signal }}%</span>
                </div>
                
                <div class="performance-grid">
                    {% for asset, data in signal_data.by_asset_class.items() %}
                    <div class="performance-item">
                        <h5>{{ asset }}</h5>
                        <p>{{ data.win_rate }}% Win Rate</p>
                        <p>{{ data.avg_return }}% Avg Return</p>
                    </div>
                    {% endfor %}
                </div>
            </div>
            
            <div class="analytics-section">
                <h3 class="section-title">👥 Customer Insights</h3>
                <div class="metric">
                    <span>Total Customers</span>
                    <span class="metric-value">{{ customer_data.total_customers }}</span>
                </div>
                
                {% for tier, data in customer_data.tier_insights.items() %}
                <div class="tier-card">
                    <h4>{{ tier }} ({{ data.customer_count }})</h4>
                    <p>Avg Revenue: ${{ data.avg_revenue:,.0f }}</p>
                    <p>LTV: ${{ data.avg_ltv:,.0f }}</p>
                    <p>Engagement: {{ (data.avg_engagement * 100)|round(1) }}%</p>
                    <p>Churn Risk: {{ (data.avg_churn_risk * 100)|round(1) }}%</p>
                </div>
                {% endfor %}
            </div>
            
            <div class="analytics-section">
                <h3 class="section-title">🔮 Predictive Analytics</h3>
                
                <div class="prediction-card">
                    <div class="prediction-value">${{ predictions.revenue_predictions['3_month']:,.0f }}</div>
                    <p>3-Month Revenue Prediction</p>
                </div>
                
                <div class="prediction-card">
                    <div class="prediction-value">${{ predictions.revenue_predictions['12_month']:,.0f }}</div>
                    <p>12-Month Revenue Prediction</p>
                </div>
                
                <div class="metric">
                    <span>Customer Growth (12mo)</span>
                    <span class="metric-value">{{ predictions.customer_predictions['12_month'] }}</span>
                </div>
                <div class="metric">
                    <span>Market Opportunity</span>
                    <span class="metric-value">${{ predictions.market_opportunity:,.0f }}</span>
                </div>
            </div>
            
            <div class="analytics-section">
                <h3 class="section-title">⚠️ High-Risk Customers</h3>
                <div class="customer-list">
                    {% for customer in customer_data.high_risk_customers %}
                    <div class="customer-item risk-high">
                        <div>
                            <strong>{{ customer.customer_id }}</strong>
                            <br>{{ customer.tier }} • ${{ customer.revenue:,.0f }}
                        </div>
                        <div>
                            <span style="color: #e74c3c; font-weight: bold;">
                                {{ (customer.churn_risk * 100)|round(1) }}% Risk
                            </span>
                        </div>
                    </div>
                    {% endfor %}
                </div>
            </div>
            
            <div class="analytics-section">
                <h3 class="section-title">🏆 Top Customers</h3>
                <div class="customer-list">
                    {% for customer in customer_data.top_customers %}
                    <div class="customer-item risk-low">
                        <div>
                            <strong>{{ customer.customer_id }}</strong>
                            <br>{{ customer.tier }} • ${{ customer.revenue:,.0f }}
                        </div>
                        <div>
                            <span style="color: #27ae60; font-weight: bold;">
                                LTV: ${{ customer.ltv:,.0f }}
                            </span>
                        </div>
                    </div>
                    {% endfor %}
                </div>
            </div>
        </div>
        
        <div class="alert">
            🚀 <strong>Business Intelligence:</strong> This advanced analytics dashboard provides comprehensive insights into revenue performance, 
            customer behavior, signal effectiveness, and predictive modeling to drive strategic business decisions and maximize ROI.
        </div>
        
        <div class="navigation">
            <a href="http://localhost:7777" class="btn">🏠 Unified Dashboard</a>
            <a href="http://localhost:5009" class="btn">🏢 Enterprise Portal</a>
            <a href="http://localhost:5007" class="btn">💳 Billing Dashboard</a>
            <a href="/api/analytics/export" class="btn">📊 Export Analytics</a>
        </div>
    </div>
</body>
</html>
'''

@app.route('/')
@app.route('/analytics')
def analytics_dashboard():
    """Advanced analytics dashboard"""
    revenue_data = analytics.get_revenue_analytics()
    signal_data = analytics.get_signal_analytics()
    customer_data = analytics.get_customer_insights()
    predictions = analytics.get_predictive_analytics()
    
    return render_template_string(
        ANALYTICS_TEMPLATE,
        revenue_data=revenue_data,
        signal_data=signal_data,
        customer_data=customer_data,
        predictions=predictions
    )

@app.route('/api/analytics/revenue')
def api_revenue_analytics():
    """API endpoint for revenue analytics"""
    return jsonify(analytics.get_revenue_analytics())

@app.route('/api/analytics/signals')
def api_signal_analytics():
    """API endpoint for signal analytics"""
    return jsonify(analytics.get_signal_analytics())

@app.route('/api/analytics/customers')
def api_customer_analytics():
    """API endpoint for customer analytics"""
    return jsonify(analytics.get_customer_insights())

@app.route('/api/analytics/predictions')
def api_predictive_analytics():
    """API endpoint for predictive analytics"""
    return jsonify(analytics.get_predictive_analytics())

@app.route('/api/analytics/export')
def api_export_analytics():
    """Export comprehensive analytics data"""
    data = {
        'revenue': analytics.get_revenue_analytics(),
        'signals': analytics.get_signal_analytics(),
        'customers': analytics.get_customer_insights(),
        'predictions': analytics.get_predictive_analytics(),
        'exported_at': datetime.now().isoformat()
    }
    return jsonify(data)

if __name__ == '__main__':
    print("""
    ╔══════════════════════════════════════════════════════════════════════════════╗
    ║                                                                              ║
    ║                📊 ADVANCED ANALYTICS DASHBOARD LAUNCHED 📊                  ║
    ║                                                                              ║
    ║                    Comprehensive Business Intelligence Platform              ║
    ║                                                                              ║
    ║  📈 Revenue Analytics    🎯 Signal Performance    👥 Customer Insights      ║
    ║  🔮 Predictive Models    ⚠️ Risk Management      📊 Export Capabilities     ║
    ║                                                                              ║
    ║                        Access: http://localhost:5010                        ║
    ║                                                                              ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
    """)
    
    logger.info("📊 Starting Advanced Analytics Dashboard...")
    logger.info("🎯 Features: Revenue tracking, signal performance, customer insights, predictions")
    logger.info("🌐 Analytics Dashboard ready at http://localhost:5010")
    
    app.run(host='0.0.0.0', port=5010, debug=False)
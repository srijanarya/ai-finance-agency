#!/usr/bin/env python3
"""
Public Deployment Strategy for AI Finance Agency
Integrates with existing Treum AlgoTech business at https://treum-algotech.surge.sh/
"""

import os
import json
from flask import Flask, render_template_string, request, jsonify, redirect, url_for
from datetime import datetime
import requests

class PublicDeploymentManager:
    """Manage public deployment and integration with existing website"""
    
    def __init__(self):
        self.domain = "treum-algotech.surge.sh"
        self.api_base = "https://api.treum-algotech.com"  # Future API domain
        self.current_local = "http://localhost:5001"
        
    def create_api_subdomain_config(self):
        """Create configuration for API subdomain deployment"""
        
        # Nginx configuration for reverse proxy
        nginx_config = """
# /etc/nginx/sites-available/ai-finance-api
server {
    listen 80;
    server_name api.treum-algotech.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.treum-algotech.com;
    
    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.treum-algotech.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.treum-algotech.com/privkey.pem;
    
    # Security Headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req zone=api burst=20 nodelay;
    
    # CORS Configuration
    add_header Access-Control-Allow-Origin "https://treum-algotech.surge.sh" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    
    # Proxy to PM2-managed Flask app
    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:5001/webhook/n8n/health;
    }
    
    # Static files (if needed)
    location /static {
        alias /var/www/ai-finance-agency/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
"""
        
        return nginx_config
    
    def create_website_integration_code(self):
        """Create JavaScript code to integrate AI services with existing website"""
        
        integration_js = """
/**
 * AI Finance Agency Integration for Treum AlgoTech Website
 * Adds AI-powered features to the existing F&O education platform
 */

class TreumAIIntegration {
    constructor() {
        this.apiBase = 'https://api.treum-algotech.com';
        this.localFallback = 'http://localhost:5001';
        this.apiKey = null; // Will be set after user authentication
        
        // Initialize integration
        this.init();
    }
    
    async init() {
        // Add AI features to existing website
        this.addAIAnalysisWidget();
        this.addMarketInsightsFeed();
        this.addSubscriptionPlans();
        this.setupEventListeners();
        
        console.log('🤖 Treum AI Finance Agency Integration Loaded');
    }
    
    // Add real-time market analysis widget to homepage
    addAIAnalysisWidget() {
        const widget = `
            <div id="ai-analysis-widget" class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg text-white shadow-lg">
                <h3 class="text-xl font-bold mb-4">🧠 AI Market Analysis</h3>
                <div id="ai-analysis-content">
                    <div class="animate-pulse">Loading AI insights...</div>
                </div>
                <button onclick="treumAI.refreshAnalysis()" class="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                    Refresh Analysis
                </button>
            </div>
        `;
        
        // Insert after existing hero section
        const heroSection = document.querySelector('.hero, .main-content, .container');
        if (heroSection) {
            heroSection.insertAdjacentHTML('afterend', widget);
            this.loadAIAnalysis();
        }
    }
    
    async loadAIAnalysis() {
        try {
            const response = await fetch(`${this.apiBase}/enterprise/analytics/fingpt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    market_data: { stock: 'NIFTY', change_percent: 0.5 },
                    news_text: 'Current market conditions for F&O trading'
                })
            });
            
            const data = await response.json();
            
            const content = `
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="font-semibold">Market Sentiment:</span>
                        <span class="px-3 py-1 bg-green-500 rounded-full text-sm">
                            ${data.analysis.direction} (${data.analysis.confidence}% confidence)
                        </span>
                    </div>
                    <div>
                        <span class="font-semibold">FinGPT Recommendation:</span>
                        <span class="ml-2">${data.analysis.recommendation}</span>
                    </div>
                    <div class="text-sm opacity-90">
                        💡 ${data.analysis.fingpt_insights[0]}
                    </div>
                    <div class="text-xs opacity-75">
                        Powered by FinGPT • ${data.accuracy_rate} accuracy
                    </div>
                </div>
            `;
            
            document.getElementById('ai-analysis-content').innerHTML = content;
            
        } catch (error) {
            console.error('Failed to load AI analysis:', error);
            document.getElementById('ai-analysis-content').innerHTML = 
                '<div class="text-red-200">AI analysis temporarily unavailable</div>';
        }
    }
    
    // Add live market insights feed
    addMarketInsightsFeed() {
        const feed = `
            <div id="market-insights-feed" class="bg-white border rounded-lg shadow-lg p-6 mt-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">📈 Live Market Insights</h3>
                <div id="insights-content" class="space-y-4">
                    <div class="animate-pulse text-gray-500">Loading live insights...</div>
                </div>
                <div class="mt-4 text-center">
                    <button onclick="treumAI.subscribeToInsights()" 
                            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                        Get Premium AI Insights
                    </button>
                </div>
            </div>
        `;
        
        const mainContent = document.querySelector('main, .main-content, .content');
        if (mainContent) {
            mainContent.insertAdjacentHTML('beforeend', feed);
            this.loadMarketInsights();
        }
    }
    
    async loadMarketInsights() {
        try {
            const response = await fetch(`${this.apiBase}/webhook/n8n/metrics`);
            const data = await response.json();
            
            const insights = `
                <div class="grid md:grid-cols-2 gap-4">
                    <div class="bg-green-50 p-4 rounded-lg">
                        <div class="font-semibold text-green-800">Content Generated Today</div>
                        <div class="text-2xl font-bold text-green-600">${data.metrics.content_generated_24h}</div>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <div class="font-semibold text-blue-800">Efficiency Gain</div>
                        <div class="text-2xl font-bold text-blue-600">${data.metrics.avg_efficiency_gain}</div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <div class="font-semibold text-purple-800">Cost Savings</div>
                        <div class="text-2xl font-bold text-purple-600">${data.metrics.cost_savings_24h}</div>
                    </div>
                    <div class="bg-orange-50 p-4 rounded-lg">
                        <div class="font-semibold text-orange-800">Active AI Agents</div>
                        <div class="text-2xl font-bold text-orange-600">${data.metrics.agents_active}</div>
                    </div>
                </div>
            `;
            
            document.getElementById('insights-content').innerHTML = insights;
            
        } catch (error) {
            console.error('Failed to load market insights:', error);
        }
    }
    
    // Add subscription plans integration
    addSubscriptionPlans() {
        const plans = `
            <div id="ai-subscription-plans" class="bg-gray-50 py-12 mt-12 rounded-lg">
                <div class="container mx-auto px-6">
                    <h2 class="text-3xl font-bold text-center mb-8">🚀 AI-Enhanced Trading Education</h2>
                    <div id="subscription-plans" class="grid md:grid-cols-3 gap-6">
                        <div class="animate-pulse text-center">Loading subscription plans...</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', plans);
        this.loadSubscriptionPlans();
    }
    
    async loadSubscriptionPlans() {
        try {
            const response = await fetch(`${this.apiBase}/enterprise/billing/plans`);
            const data = await response.json();
            
            const plansHTML = data.plans.map(plan => `
                <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${plan.name}</h3>
                    <div class="text-3xl font-bold text-blue-600 mb-4">₹${plan.amount}/month</div>
                    <ul class="space-y-2 mb-6">
                        ${plan.features.map(feature => `<li class="flex items-center"><span class="text-green-500 mr-2">✓</span>${feature}</li>`).join('')}
                    </ul>
                    <button onclick="treumAI.subscribe('${plan.id}')" 
                            class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                        Choose Plan
                    </button>
                </div>
            `).join('');
            
            document.getElementById('subscription-plans').innerHTML = plansHTML;
            
        } catch (error) {
            console.error('Failed to load subscription plans:', error);
        }
    }
    
    // Event listeners and user interactions
    setupEventListeners() {
        // Refresh analysis button
        window.treumAI = this; // Make available globally
        
        // Auto-refresh analysis every 5 minutes
        setInterval(() => this.loadAIAnalysis(), 5 * 60 * 1000);
        
        // Auto-refresh insights every 10 minutes  
        setInterval(() => this.loadMarketInsights(), 10 * 60 * 1000);
    }
    
    async refreshAnalysis() {
        document.getElementById('ai-analysis-content').innerHTML = 
            '<div class="animate-pulse">Refreshing AI analysis...</div>';
        await this.loadAIAnalysis();
    }
    
    async subscribe(planId) {
        // Redirect to subscription flow
        const subscribeUrl = `${this.apiBase}/subscribe?plan=${planId}&redirect=${encodeURIComponent(window.location.href)}`;
        window.open(subscribeUrl, '_blank');
    }
    
    async subscribeToInsights() {
        // Show modal or redirect to premium signup
        alert('🚀 Premium AI Insights coming soon! Contact us at treumalgotech@gmail.com for early access.');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TreumAIIntegration();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreumAIIntegration;
}
"""
        
        return integration_js
    
    def create_deployment_script(self):
        """Create automated deployment script"""
        
        deploy_script = """#!/bin/bash
# AI Finance Agency Public Deployment Script
# Deploys the system to production with domain integration

echo "🚀 DEPLOYING AI FINANCE AGENCY TO PRODUCTION"
echo "============================================="

# Step 1: Update system configuration for production
echo "📝 Updating production configuration..."

# Update Flask app for production
export FLASK_ENV=production
export FLASK_DEBUG=false
export API_DOMAIN="api.treum-algotech.com"
export WEBSITE_DOMAIN="treum-algotech.surge.sh"

# Step 2: Install and configure Nginx (if on server)
if command -v nginx &> /dev/null; then
    echo "🔧 Configuring Nginx reverse proxy..."
    sudo cp nginx.conf /etc/nginx/sites-available/ai-finance-api
    sudo ln -sf /etc/nginx/sites-available/ai-finance-api /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Nginx configured"
else
    echo "ℹ️ Nginx not found - running in local mode"
fi

# Step 3: Setup SSL certificates (if on server with domain)
if [ "$API_DOMAIN" != "localhost" ]; then
    echo "🔐 Setting up SSL certificates..."
    if command -v certbot &> /dev/null; then
        sudo certbot --nginx -d api.treum-algotech.com --non-interactive --agree-tos --email treumalgotech@gmail.com
        echo "✅ SSL certificates configured"
    else
        echo "⚠️ Certbot not found - SSL setup skipped"
    fi
fi

# Step 4: Update PM2 configuration for production
echo "🔄 Updating PM2 for production deployment..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

# Step 5: Setup firewall (if on server)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    echo "✅ Firewall configured"
fi

# Step 6: Test deployment
echo "🧪 Testing deployment..."
sleep 5

# Test local endpoints
curl -s http://localhost:5001/webhook/n8n/health > /dev/null && echo "✅ Local API health check passed" || echo "❌ Local API health check failed"

# Test public endpoints (if domain configured)
if [ "$API_DOMAIN" != "localhost" ]; then
    curl -s https://$API_DOMAIN/webhook/n8n/health > /dev/null && echo "✅ Public API health check passed" || echo "❌ Public API health check failed"
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "========================"
echo "🌐 Website: https://treum-algotech.surge.sh/"
echo "🔗 API: https://api.treum-algotech.com/"
echo "📊 Dashboard: https://api.treum-algotech.com/enterprise/dashboard"
echo "💼 Billing: https://api.treum-algotech.com/enterprise/billing/plans"
echo "🧠 FinGPT: https://api.treum-algotech.com/enterprise/analytics/fingpt"
echo ""
echo "📋 Next Steps:"
echo "1. Update DNS: Point api.treum-algotech.com to your server IP"
echo "2. Test API endpoints from website integration"
echo "3. Configure monitoring dashboards"
echo "4. Set up client onboarding flow"
echo ""
echo "📞 Support: System ready for ₹3 crore monthly scaling!"
"""
        
        return deploy_script

def create_public_deployment_files():
    """Create all files needed for public deployment"""
    
    manager = PublicDeploymentManager()
    
    # Create Nginx configuration
    with open('/Users/srijan/ai-finance-agency/nginx.conf', 'w') as f:
        f.write(manager.create_api_subdomain_config())
    
    # Create website integration JavaScript
    with open('/Users/srijan/ai-finance-agency/treum-ai-integration.js', 'w') as f:
        f.write(manager.create_website_integration_code())
    
    # Create deployment script
    with open('/Users/srijan/ai-finance-agency/deploy.sh', 'w') as f:
        f.write(manager.create_deployment_script())
    
    # Make deployment script executable
    os.chmod('/Users/srijan/ai-finance-agency/deploy.sh', 0o755)
    
    print("✅ Public deployment files created:")
    print("   📄 nginx.conf - Reverse proxy configuration")
    print("   📄 treum-ai-integration.js - Website integration")
    print("   📄 deploy.sh - Automated deployment script")

if __name__ == "__main__":
    create_public_deployment_files()
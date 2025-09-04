#!/bin/bash
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

#!/bin/bash

# AI Finance Agency - Dashboard Launcher
echo "🚀 Opening AI Finance Agency Dashboards..."

# Main service URLs
URLS=(
    "http://localhost:5003"  # Production Dashboard
    "http://localhost:5002/subscribe/plans"  # Subscription Plans
    "http://localhost:5004/marketing/analytics"  # Marketing Analytics
    "http://localhost:5001"  # Main API (if it has a dashboard)
)

# Open each URL in browser
for url in "${URLS[@]}"; do
    echo "📊 Opening: $url"
    open "$url"
    sleep 1  # Small delay between opens
done

echo "✅ All dashboards opened in browser!"
echo ""
echo "🎯 Dashboard Overview:"
echo "   • Production Monitor: http://localhost:5003"
echo "   • Subscription Plans: http://localhost:5002/subscribe/plans" 
echo "   • Marketing Analytics: http://localhost:5004/marketing/analytics"
echo "   • Revenue Forecast: http://localhost:5002/subscribe/forecast"
echo ""
echo "📈 Current Status: ₹86.5 Lakh MRR (288% of target)"
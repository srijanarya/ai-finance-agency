
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

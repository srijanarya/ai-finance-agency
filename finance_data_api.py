#!/usr/bin/env python3
"""
Real-Time Financial Data API Service
===================================
Flask-based API service to serve real-time financial data for your finance agency.
Integrates with the realtime_finance_data.py system to provide REST endpoints.

Author: AI Finance Agency
Created: September 8, 2025
Purpose: API service for real-time financial data distribution
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import sqlite3
import logging
from realtime_finance_data import RealTimeFinanceData
import threading
import schedule
import time
import os
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global finance data instance
finance_data = RealTimeFinanceData()

# Cache for storing latest data
data_cache = {
    'market_update': None,
    'last_updated': None,
    'sector_data': {},
    'currency_rates': {},
    'commodity_prices': {}
}

def cache_data():
    """Update cache with latest financial data"""
    try:
        logger.info("Updating financial data cache...")
        
        # Generate fresh market update
        market_update = finance_data.generate_market_update_content()
        
        # Fetch all data types
        indian_indices = finance_data.fetch_indian_indices()
        international_indices = finance_data.fetch_international_indices()
        currencies = finance_data.fetch_currency_rates()
        commodities = finance_data.fetch_commodity_prices()
        
        # Update cache
        data_cache['market_update'] = market_update
        data_cache['last_updated'] = datetime.now().isoformat()
        data_cache['indian_indices'] = {k: {
            'name': v.name,
            'price': v.current_price,
            'change': v.change,
            'change_percent': v.change_percent,
            'currency': v.currency,
            'timestamp': v.timestamp.isoformat()
        } for k, v in indian_indices.items()}
        
        data_cache['international_indices'] = {k: {
            'name': v.name,
            'price': v.current_price,
            'change': v.change,
            'change_percent': v.change_percent,
            'currency': v.currency,
            'timestamp': v.timestamp.isoformat()
        } for k, v in international_indices.items()}
        
        data_cache['currency_rates'] = {k: {
            'base': v.base,
            'target': v.target,
            'rate': v.rate,
            'change': v.change,
            'change_percent': v.change_percent,
            'timestamp': v.timestamp.isoformat()
        } for k, v in currencies.items()}
        
        data_cache['commodity_prices'] = {k: {
            'name': k,
            'price': v.price,
            'unit': v.unit,
            'change': v.change,
            'change_percent': v.change_percent,
            'currency': v.currency,
            'timestamp': v.timestamp.isoformat()
        } for k, v in commodities.items()}
        
        logger.info("Financial data cache updated successfully")
        
    except Exception as e:
        logger.error(f"Error updating cache: {e}")

def require_api_key(f):
    """Decorator to require API key for protected endpoints"""
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != os.getenv('FINANCE_API_KEY', 'finance-agency-2024'):
            return jsonify({'error': 'Invalid or missing API key'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'last_data_update': data_cache.get('last_updated'),
        'service': 'Real-Time Financial Data API'
    })

@app.route('/api/market/update', methods=['GET'])
def get_market_update():
    """Get formatted market update content"""
    try:
        # Check if cache is fresh (within 5 minutes)
        if (data_cache['last_updated'] and 
            datetime.fromisoformat(data_cache['last_updated']) > datetime.now() - timedelta(minutes=5)):
            content = data_cache['market_update']
        else:
            # Generate fresh content
            content = finance_data.generate_market_update_content()
            cache_data()
        
        return jsonify({
            'status': 'success',
            'content': content,
            'timestamp': datetime.now().isoformat(),
            'source': 'Real-Time Financial Data System'
        })
        
    except Exception as e:
        logger.error(f"Error in get_market_update: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/indices/indian', methods=['GET'])
def get_indian_indices():
    """Get Indian market indices data"""
    try:
        if 'indian_indices' in data_cache and data_cache['indian_indices']:
            return jsonify({
                'status': 'success',
                'data': data_cache['indian_indices'],
                'timestamp': datetime.now().isoformat(),
                'count': len(data_cache['indian_indices'])
            })
        else:
            # Fetch fresh data
            indices = finance_data.fetch_indian_indices()
            return jsonify({
                'status': 'success',
                'data': {k: {
                    'name': v.name,
                    'price': v.current_price,
                    'change': v.change,
                    'change_percent': v.change_percent,
                    'currency': v.currency,
                    'timestamp': v.timestamp.isoformat()
                } for k, v in indices.items()},
                'timestamp': datetime.now().isoformat(),
                'count': len(indices)
            })
            
    except Exception as e:
        logger.error(f"Error in get_indian_indices: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/indices/international', methods=['GET'])
def get_international_indices():
    """Get international market indices data"""
    try:
        if 'international_indices' in data_cache and data_cache['international_indices']:
            return jsonify({
                'status': 'success',
                'data': data_cache['international_indices'],
                'timestamp': datetime.now().isoformat(),
                'count': len(data_cache['international_indices'])
            })
        else:
            # Fetch fresh data
            indices = finance_data.fetch_international_indices()
            return jsonify({
                'status': 'success',
                'data': {k: {
                    'name': v.name,
                    'price': v.current_price,
                    'change': v.change,
                    'change_percent': v.change_percent,
                    'currency': v.currency,
                    'timestamp': v.timestamp.isoformat()
                } for k, v in indices.items()},
                'timestamp': datetime.now().isoformat(),
                'count': len(indices)
            })
            
    except Exception as e:
        logger.error(f"Error in get_international_indices: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/currencies', methods=['GET'])
def get_currency_rates():
    """Get currency exchange rates"""
    try:
        if 'currency_rates' in data_cache and data_cache['currency_rates']:
            return jsonify({
                'status': 'success',
                'data': data_cache['currency_rates'],
                'timestamp': datetime.now().isoformat(),
                'count': len(data_cache['currency_rates'])
            })
        else:
            # Fetch fresh data
            currencies = finance_data.fetch_currency_rates()
            return jsonify({
                'status': 'success',
                'data': {k: {
                    'base': v.base,
                    'target': v.target,
                    'rate': v.rate,
                    'change': v.change,
                    'change_percent': v.change_percent,
                    'timestamp': v.timestamp.isoformat()
                } for k, v in currencies.items()},
                'timestamp': datetime.now().isoformat(),
                'count': len(currencies)
            })
            
    except Exception as e:
        logger.error(f"Error in get_currency_rates: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/commodities', methods=['GET'])
def get_commodity_prices():
    """Get commodity prices"""
    try:
        if 'commodity_prices' in data_cache and data_cache['commodity_prices']:
            return jsonify({
                'status': 'success',
                'data': data_cache['commodity_prices'],
                'timestamp': datetime.now().isoformat(),
                'count': len(data_cache['commodity_prices'])
            })
        else:
            # Fetch fresh data
            commodities = finance_data.fetch_commodity_prices()
            return jsonify({
                'status': 'success',
                'data': {k: {
                    'name': k,
                    'price': v.price,
                    'unit': v.unit,
                    'change': v.change,
                    'change_percent': v.change_percent,
                    'currency': v.currency,
                    'timestamp': v.timestamp.isoformat()
                } for k, v in commodities.items()},
                'timestamp': datetime.now().isoformat(),
                'count': len(commodities)
            })
            
    except Exception as e:
        logger.error(f"Error in get_commodity_prices: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    """Get specific stock data"""
    try:
        stock_data = finance_data.get_specific_stock_data(symbol)
        if stock_data:
            return jsonify({
                'status': 'success',
                'data': {
                    'symbol': stock_data.symbol,
                    'name': stock_data.name,
                    'price': stock_data.current_price,
                    'change': stock_data.change,
                    'change_percent': stock_data.change_percent,
                    'volume': stock_data.volume,
                    'market_cap': stock_data.market_cap,
                    'currency': stock_data.currency,
                    'timestamp': stock_data.timestamp.isoformat()
                },
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': f'No data found for symbol {symbol}'}), 404
            
    except Exception as e:
        logger.error(f"Error in get_stock_data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sector/<sector>', methods=['GET'])
def get_sector_analysis(sector):
    """Get sector analysis"""
    try:
        analysis = finance_data.generate_sector_analysis(sector)
        return jsonify({
            'status': 'success',
            'sector': sector,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in get_sector_analysis: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/content/social', methods=['GET'])
def get_social_media_content():
    """Generate social media ready financial content"""
    try:
        platform = request.args.get('platform', 'twitter')  # twitter, linkedin, telegram
        
        market_update = finance_data.generate_market_update_content()
        
        if platform == 'twitter':
            # Twitter format (character limit friendly)
            lines = market_update.split('\n')
            twitter_content = []
            current_tweet = ""
            
            for line in lines[:15]:  # Limit lines for Twitter
                if len(current_tweet + line + "\n") <= 280:
                    current_tweet += line + "\n"
                else:
                    if current_tweet:
                        twitter_content.append(current_tweet.strip())
                    current_tweet = line + "\n"
            
            if current_tweet:
                twitter_content.append(current_tweet.strip())
                
            return jsonify({
                'status': 'success',
                'platform': platform,
                'content': twitter_content,
                'thread_count': len(twitter_content),
                'timestamp': datetime.now().isoformat()
            })
            
        elif platform == 'linkedin':
            # LinkedIn format (professional)
            linkedin_content = f"""🚀 Market Pulse - {datetime.now().strftime('%B %d, %Y')}

{market_update}

#MarketUpdate #Finance #Trading #Investment #StockMarket #NSE #BSE #IndianMarkets #FinTech

💼 Follow for daily market insights and real-time financial data.
📊 Data verified from multiple reliable sources."""
            
            return jsonify({
                'status': 'success',
                'platform': platform,
                'content': linkedin_content,
                'timestamp': datetime.now().isoformat()
            })
            
        else:  # telegram or default
            return jsonify({
                'status': 'success',
                'platform': platform,
                'content': market_update,
                'timestamp': datetime.now().isoformat()
            })
        
    except Exception as e:
        logger.error(f"Error in get_social_media_content: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/refresh', methods=['POST'])
@require_api_key
def force_refresh():
    """Force refresh all cached data"""
    try:
        cache_data()
        return jsonify({
            'status': 'success',
            'message': 'Data cache refreshed successfully',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in force_refresh: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
@require_api_key
def get_stats():
    """Get API usage and data statistics"""
    try:
        # Get database stats
        conn = sqlite3.connect(finance_data.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM market_data WHERE date(created_at) = date('now')")
        market_data_today = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM currency_data WHERE date(created_at) = date('now')")
        currency_data_today = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM commodity_data WHERE date(created_at) = date('now')")
        commodity_data_today = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'status': 'success',
            'stats': {
                'market_data_today': market_data_today,
                'currency_data_today': currency_data_today,
                'commodity_data_today': commodity_data_today,
                'cache_last_updated': data_cache.get('last_updated'),
                'cached_indices_count': len(data_cache.get('indian_indices', {})) + len(data_cache.get('international_indices', {})),
                'cached_currencies_count': len(data_cache.get('currency_rates', {})),
                'cached_commodities_count': len(data_cache.get('commodity_prices', {}))
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in get_stats: {e}")
        return jsonify({'error': str(e)}), 500

def schedule_updates():
    """Schedule regular data updates"""
    def run_scheduler():
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    # Schedule updates every 5 minutes during market hours
    schedule.every(5).minutes.do(cache_data)
    
    # Initial cache
    cache_data()
    
    # Start scheduler in background thread
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    logger.info("Data update scheduler started")

@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'service': 'Real-Time Financial Data API',
        'version': '1.0.0',
        'endpoints': {
            'GET /api/health': 'Health check',
            'GET /api/market/update': 'Get formatted market update content',
            'GET /api/indices/indian': 'Get Indian market indices',
            'GET /api/indices/international': 'Get international market indices',
            'GET /api/currencies': 'Get currency exchange rates',
            'GET /api/commodities': 'Get commodity prices',
            'GET /api/stock/<symbol>': 'Get specific stock data',
            'GET /api/sector/<sector>': 'Get sector analysis',
            'GET /api/content/social?platform=<twitter|linkedin|telegram>': 'Get social media ready content',
            'POST /api/admin/refresh': 'Force refresh cache (requires API key)',
            'GET /api/admin/stats': 'Get API statistics (requires API key)'
        },
        'data_sources': ['Yahoo Finance', 'NSE', 'BSE', 'Multiple APIs'],
        'update_frequency': '5 minutes during market hours',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("Starting Real-Time Financial Data API Service...")
    
    # Start background scheduler
    schedule_updates()
    
    # Start Flask app
    port = int(os.getenv('PORT', 5001))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False,  # Set to False for production
        threaded=True
    )
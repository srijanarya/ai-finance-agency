#!/usr/bin/env python3
"""
Institutional API for Premium Trading Signals
Enterprise-grade API for institutional clients and high-volume users
"""

from flask import Flask, request, jsonify, g
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
import sqlite3
import pandas as pd
import json
import hashlib
import hmac
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
from functools import wraps
import secrets
import jwt
from werkzeug.security import check_password_hash, generate_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(32)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # Configure specific domains in production
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization", "X-API-Key", "X-Timestamp", "X-Signature"]
    }
})

# Configure rate limiting
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["1000 per hour"]
)

class InstitutionalAPI:
    def __init__(self):
        self.api_keys_db = 'api_keys.db'
        self.signals_db = 'premium_signals.db'
        self.performance_db = 'performance_analytics.db'
        self.subscribers_db = 'subscribers.db'
        
        # API Configuration
        self.api_version = "v1"
        self.rate_limits = {
            'BASIC': 100,      # requests per hour
            'PRO': 1000,       # requests per hour  
            'ENTERPRISE': 10000 # requests per hour
        }
        
        # WebSocket connections for real-time updates
        self.websocket_connections = {}
        
        # Cache for frequently accessed data
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes
    
    def validate_api_key(self, api_key: str) -> Optional[Dict]:
        """Validate API key and return client info"""
        try:
            conn = sqlite3.connect(self.api_keys_db)
            cursor = conn.cursor()
            
            cursor.execute('''
            SELECT * FROM api_keys 
            WHERE api_key = ? AND status = 'ACTIVE'
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
            ''', (api_key,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                columns = ['id', 'api_key', 'client_name', 'client_email', 'subscription_tier', 
                          'rate_limit', 'status', 'created_at', 'expires_at', 'last_used', 
                          'usage_count', 'allowed_ips', 'scopes', 'notes']
                return dict(zip(columns, result))
            
            return None
            
        except Exception as e:
            logger.error(f"Error validating API key: {e}")
            return None
    
    def validate_request_signature(self, api_key: str, timestamp: str, signature: str, 
                                 request_body: str = '') -> bool:
        """Validate request signature for enhanced security"""
        try:
            # Check timestamp is within 5 minutes
            current_time = int(time.time())
            request_time = int(timestamp)
            
            if abs(current_time - request_time) > 300:  # 5 minutes
                return False
            
            # Create expected signature
            message = f"{api_key}{timestamp}{request_body}"
            expected_signature = hmac.new(
                api_key.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
            
        except Exception:
            return False
    
    def update_api_usage(self, api_key: str, endpoint: str, method: str, 
                        status_code: int, response_time_ms: int):
        """Update API usage statistics"""
        try:
            conn = sqlite3.connect(self.api_keys_db)
            cursor = conn.cursor()
            
            # Update usage count and last used
            cursor.execute('''
            UPDATE api_keys 
            SET last_used = CURRENT_TIMESTAMP, usage_count = usage_count + 1
            WHERE api_key = ?
            ''', (api_key,))
            
            # Log detailed usage
            cursor.execute('''
            INSERT INTO api_usage_logs 
            (api_key, endpoint, method, ip_address, user_agent, status_code, 
             response_time_ms, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (
                api_key, endpoint, method, 
                request.remote_addr, request.user_agent.string,
                status_code, response_time_ms
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error updating API usage: {e}")
    
    def check_rate_limit(self, api_key: str, client_info: Dict) -> Tuple[bool, Dict]:
        """Check if request exceeds rate limit"""
        try:
            current_hour = datetime.now().replace(minute=0, second=0, microsecond=0)
            
            conn = sqlite3.connect(self.api_keys_db)
            cursor = conn.cursor()
            
            # Get current hour usage
            cursor.execute('''
            SELECT request_count FROM rate_limits 
            WHERE api_key = ? AND time_window = ?
            ''', (api_key, current_hour))
            
            result = cursor.fetchone()
            current_usage = result[0] if result else 0
            
            rate_limit = client_info['rate_limit']
            
            if current_usage >= rate_limit:
                conn.close()
                return False, {
                    'error': 'Rate limit exceeded',
                    'limit': rate_limit,
                    'current_usage': current_usage,
                    'reset_time': (current_hour + timedelta(hours=1)).isoformat()
                }
            
            # Update rate limit counter
            cursor.execute('''
            INSERT OR REPLACE INTO rate_limits 
            (api_key, time_window, request_count)
            VALUES (?, ?, ?)
            ''', (api_key, current_hour, current_usage + 1))
            
            conn.commit()
            conn.close()
            
            return True, {
                'limit': rate_limit,
                'current_usage': current_usage + 1,
                'remaining': rate_limit - current_usage - 1,
                'reset_time': (current_hour + timedelta(hours=1)).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking rate limit: {e}")
            return False, {'error': 'Rate limit check failed'}

# Create API instance
api = InstitutionalAPI()

def require_api_key(f):
    """Decorator to require valid API key"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return jsonify({'error': 'API key required', 'code': 'MISSING_API_KEY'}), 401
        
        # Validate API key
        client_info = api.validate_api_key(api_key)
        if not client_info:
            return jsonify({'error': 'Invalid API key', 'code': 'INVALID_API_KEY'}), 401
        
        # Check IP restrictions if configured
        if client_info['allowed_ips']:
            allowed_ips = json.loads(client_info['allowed_ips'])
            if request.remote_addr not in allowed_ips:
                return jsonify({'error': 'IP not allowed', 'code': 'IP_RESTRICTED'}), 403
        
        # Validate request signature if provided (optional but recommended)
        timestamp = request.headers.get('X-Timestamp')
        signature = request.headers.get('X-Signature')
        
        if signature and timestamp:
            request_body = request.get_data(as_text=True)
            if not api.validate_request_signature(api_key, timestamp, signature, request_body):
                return jsonify({'error': 'Invalid signature', 'code': 'INVALID_SIGNATURE'}), 401
        
        # Check rate limits
        rate_limit_ok, rate_info = api.check_rate_limit(api_key, client_info)
        if not rate_limit_ok:
            return jsonify(rate_info), 429
        
        # Store client info in g for use in endpoint
        g.client_info = client_info
        g.rate_info = rate_info
        
        # Execute endpoint
        try:
            response = f(*args, **kwargs)
            status_code = getattr(response, 'status_code', 200)
            
            # Update API usage statistics
            response_time = int((time.time() - start_time) * 1000)
            api.update_api_usage(
                api_key, request.endpoint or request.path, request.method,
                status_code, response_time
            )
            
            # Add rate limit headers to response
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Limit'] = str(rate_info['limit'])
                response.headers['X-RateLimit-Remaining'] = str(rate_info['remaining'])
                response.headers['X-RateLimit-Reset'] = rate_info['reset_time']
            
            return response
            
        except Exception as e:
            logger.error(f"API endpoint error: {e}")
            api.update_api_usage(
                api_key, request.endpoint or request.path, request.method,
                500, int((time.time() - start_time) * 1000)
            )
            return jsonify({'error': 'Internal server error', 'code': 'INTERNAL_ERROR'}), 500
    
    return decorated_function

# API Endpoints

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': api.api_version,
        'timestamp': datetime.now().isoformat(),
        'uptime': 'system_uptime_placeholder'
    })

@app.route('/api/v1/signals', methods=['GET'])
@require_api_key
def get_signals():
    """Get latest trading signals"""
    try:
        # Parse query parameters
        limit = min(int(request.args.get('limit', 50)), 100)  # Max 100 signals
        signal_type = request.args.get('type')
        asset_class = request.args.get('asset_class')
        tier = request.args.get('tier', g.client_info['subscription_tier'])
        include_closed = request.args.get('include_closed', 'false').lower() == 'true'
        
        # Build query
        conn = sqlite3.connect(api.signals_db)
        
        query = '''
        SELECT * FROM signals 
        WHERE tier_access IN ('BASIC', 'PRO', 'ENTERPRISE')
        '''
        params = []
        
        # Filter by tier access
        tier_hierarchy = {
            'BASIC': ['BASIC'],
            'PRO': ['BASIC', 'PRO'],
            'ENTERPRISE': ['BASIC', 'PRO', 'ENTERPRISE']
        }
        accessible_tiers = tier_hierarchy.get(tier, ['BASIC'])
        placeholders = ','.join(['?' for _ in accessible_tiers])
        query = query.replace("IN ('BASIC', 'PRO', 'ENTERPRISE')", f"IN ({placeholders})")
        params.extend(accessible_tiers)
        
        # Additional filters
        if not include_closed:
            query += ' AND status = ?'
            params.append('ACTIVE')
        
        if signal_type:
            query += ' AND signal_type = ?'
            params.append(signal_type)
        
        if asset_class:
            query += ' AND asset_class = ?'
            params.append(asset_class)
        
        query += ' ORDER BY timestamp DESC LIMIT ?'
        params.append(limit)
        
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        
        # Convert to list of dictionaries
        signals = df.to_dict('records')
        
        # Format response
        response = {
            'status': 'success',
            'count': len(signals),
            'signals': signals,
            'pagination': {
                'limit': limit,
                'total_available': len(signals)
            },
            'timestamp': datetime.now().isoformat(),
            'tier': tier
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in get_signals: {e}")
        return jsonify({'error': 'Failed to fetch signals', 'code': 'FETCH_ERROR'}), 500

@app.route('/api/v1/signals/<signal_id>', methods=['GET'])
@require_api_key
def get_signal_details(signal_id):
    """Get detailed information for a specific signal"""
    try:
        conn = sqlite3.connect(api.signals_db)
        
        query = '''
        SELECT * FROM signals WHERE signal_id = ?
        '''
        
        df = pd.read_sql_query(query, conn, params=(signal_id,))
        
        if df.empty:
            conn.close()
            return jsonify({'error': 'Signal not found', 'code': 'SIGNAL_NOT_FOUND'}), 404
        
        signal = df.iloc[0].to_dict()
        
        # Get signal metadata if available
        metadata_query = '''
        SELECT metadata_key, metadata_value FROM signal_metadata 
        WHERE signal_id = ?
        '''
        metadata_df = pd.read_sql_query(metadata_query, conn, params=(signal_id,))
        
        if not metadata_df.empty:
            signal['metadata'] = dict(zip(metadata_df['metadata_key'], metadata_df['metadata_value']))
        
        # Get signal tags if available
        tags_query = '''
        SELECT tag FROM signal_tags WHERE signal_id = ?
        '''
        tags_df = pd.read_sql_query(tags_query, conn, params=(signal_id,))
        
        if not tags_df.empty:
            signal['tags'] = tags_df['tag'].tolist()
        
        conn.close()
        
        response = {
            'status': 'success',
            'signal': signal,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in get_signal_details: {e}")
        return jsonify({'error': 'Failed to fetch signal details', 'code': 'FETCH_ERROR'}), 500

@app.route('/api/v1/performance/summary', methods=['GET'])
@require_api_key
def get_performance_summary():
    """Get performance summary statistics"""
    try:
        # Parse parameters
        days = min(int(request.args.get('days', 30)), 365)  # Max 365 days
        asset_class = request.args.get('asset_class')
        signal_type = request.args.get('signal_type')
        
        start_date = (datetime.now() - timedelta(days=days)).date()
        end_date = datetime.now().date()
        
        conn = sqlite3.connect(api.performance_db)
        
        # Base query
        query = '''
        SELECT 
            COUNT(*) as total_signals,
            COUNT(CASE WHEN exit_timestamp IS NOT NULL THEN 1 END) as closed_signals,
            AVG(CASE WHEN pnl_percentage > 0 THEN 1.0 ELSE 0.0 END) * 100 as win_rate,
            AVG(pnl_percentage) as avg_return,
            SUM(pnl_percentage) as total_return,
            MAX(pnl_percentage) as best_trade,
            MIN(pnl_percentage) as worst_trade,
            AVG(holding_period_hours) as avg_holding_hours,
            AVG(alpha) as avg_alpha,
            AVG(trade_quality_score) as avg_quality_score
        FROM signal_performance 
        WHERE DATE(entry_timestamp) BETWEEN ? AND ?
        AND exit_timestamp IS NOT NULL
        '''
        params = [start_date, end_date]
        
        # Add filters
        if asset_class:
            query += ' AND asset_class = ?'
            params.append(asset_class)
        
        if signal_type:
            query += ' AND signal_type = ?'
            params.append(signal_type)
        
        df = pd.read_sql_query(query, conn, params=params)
        
        # Get additional metrics
        if not df.empty and df.iloc[0]['closed_signals'] > 0:
            # Calculate Sharpe ratio and other advanced metrics
            returns_query = '''
            SELECT pnl_percentage FROM signal_performance 
            WHERE DATE(entry_timestamp) BETWEEN ? AND ?
            AND exit_timestamp IS NOT NULL
            ''' + (' AND asset_class = ?' if asset_class else '') + \
                  (' AND signal_type = ?' if signal_type else '')
            
            returns_df = pd.read_sql_query(returns_query, conn, params=params)
            
            if not returns_df.empty:
                returns = returns_df['pnl_percentage']
                
                # Sharpe ratio (assuming 5% risk-free rate)
                if returns.std() > 0:
                    sharpe_ratio = (returns.mean() - 0.05/252) / returns.std() * (252**0.5)
                else:
                    sharpe_ratio = 0
                
                # Maximum drawdown
                cumulative_returns = (1 + returns / 100).cumprod()
                rolling_max = cumulative_returns.expanding().max()
                drawdown = (cumulative_returns / rolling_max - 1) * 100
                max_drawdown = abs(drawdown.min()) if not drawdown.empty else 0
                
                # Profit factor
                gross_profit = returns[returns > 0].sum()
                gross_loss = abs(returns[returns < 0].sum())
                profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
                
            else:
                sharpe_ratio = max_drawdown = profit_factor = 0
        else:
            sharpe_ratio = max_drawdown = profit_factor = 0
        
        conn.close()
        
        # Format response
        summary = df.iloc[0].to_dict() if not df.empty else {}
        summary.update({
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown,
            'profit_factor': profit_factor
        })
        
        response = {
            'status': 'success',
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            },
            'filters': {
                'asset_class': asset_class,
                'signal_type': signal_type
            },
            'performance_summary': summary,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in get_performance_summary: {e}")
        return jsonify({'error': 'Failed to fetch performance summary', 'code': 'FETCH_ERROR'}), 500

@app.route('/api/v1/performance/detailed', methods=['GET'])
@require_api_key
def get_detailed_performance():
    """Get detailed performance analytics"""
    try:
        # Parse parameters
        days = min(int(request.args.get('days', 30)), 90)  # Max 90 days for detailed data
        
        start_date = (datetime.now() - timedelta(days=days)).date()
        end_date = datetime.now().date()
        
        conn = sqlite3.connect(api.performance_db)
        
        # Daily performance
        daily_query = '''
        SELECT * FROM daily_performance 
        WHERE date BETWEEN ? AND ?
        ORDER BY date DESC
        '''
        daily_df = pd.read_sql_query(daily_query, conn, params=(start_date, end_date))
        
        # Asset class performance
        asset_query = '''
        SELECT * FROM asset_class_performance 
        WHERE date BETWEEN ? AND ?
        ORDER BY date DESC, asset_class
        '''
        asset_df = pd.read_sql_query(asset_query, conn, params=(start_date, end_date))
        
        # Strategy performance
        strategy_query = '''
        SELECT * FROM strategy_performance 
        WHERE date BETWEEN ? AND ?
        ORDER BY date DESC, signal_type
        '''
        strategy_df = pd.read_sql_query(strategy_query, conn, params=(start_date, end_date))
        
        conn.close()
        
        response = {
            'status': 'success',
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            },
            'daily_performance': daily_df.to_dict('records'),
            'asset_class_performance': asset_df.to_dict('records'),
            'strategy_performance': strategy_df.to_dict('records'),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in get_detailed_performance: {e}")
        return jsonify({'error': 'Failed to fetch detailed performance', 'code': 'FETCH_ERROR'}), 500

@app.route('/api/v1/analytics/portfolio', methods=['POST'])
@require_api_key
def analyze_portfolio():
    """Analyze portfolio performance based on signal following"""
    try:
        if not request.is_json:
            return jsonify({'error': 'JSON payload required', 'code': 'INVALID_PAYLOAD'}), 400
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['positions', 'start_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}', 'code': 'MISSING_FIELD'}), 400
        
        positions = data['positions']  # List of {signal_id, quantity, entry_price, exit_price}
        start_date = data['start_date']
        end_date = data.get('end_date', datetime.now().date().isoformat())
        
        # Calculate portfolio performance
        portfolio_value = 0
        total_pnl = 0
        trades_analysis = []
        
        for position in positions:
            signal_id = position['signal_id']
            quantity = float(position['quantity'])
            entry_price = float(position['entry_price'])
            exit_price = float(position.get('exit_price', entry_price))
            
            # Get signal details
            conn = sqlite3.connect(api.signals_db)
            signal_query = 'SELECT * FROM signals WHERE signal_id = ?'
            signal_df = pd.read_sql_query(signal_query, conn, params=(signal_id,))
            conn.close()
            
            if not signal_df.empty:
                signal_info = signal_df.iloc[0].to_dict()
                
                # Calculate position P&L
                if signal_info['action'] == 'BUY':
                    pnl = (exit_price - entry_price) * quantity
                else:  # SELL
                    pnl = (entry_price - exit_price) * quantity
                
                position_value = exit_price * quantity
                portfolio_value += position_value
                total_pnl += pnl
                
                trades_analysis.append({
                    'signal_id': signal_id,
                    'symbol': signal_info['symbol'],
                    'action': signal_info['action'],
                    'quantity': quantity,
                    'entry_price': entry_price,
                    'exit_price': exit_price,
                    'pnl': pnl,
                    'pnl_percentage': (pnl / (entry_price * quantity)) * 100,
                    'position_value': position_value
                })
        
        # Calculate portfolio metrics
        if trades_analysis:
            returns = [trade['pnl_percentage'] for trade in trades_analysis]
            
            # Portfolio statistics
            total_return_percentage = (total_pnl / sum(trade['entry_price'] * trade['quantity'] for trade in trades_analysis)) * 100
            avg_return = sum(returns) / len(returns)
            win_rate = (len([r for r in returns if r > 0]) / len(returns)) * 100
            
            # Risk metrics
            volatility = pd.Series(returns).std() if len(returns) > 1 else 0
            sharpe_ratio = (avg_return - 0.05) / volatility if volatility > 0 else 0
            
            max_loss = min(returns) if returns else 0
            max_gain = max(returns) if returns else 0
        else:
            total_return_percentage = avg_return = win_rate = volatility = sharpe_ratio = 0
            max_loss = max_gain = 0
        
        response = {
            'status': 'success',
            'portfolio_analysis': {
                'total_positions': len(positions),
                'portfolio_value': portfolio_value,
                'total_pnl': total_pnl,
                'total_return_percentage': total_return_percentage,
                'avg_return_per_trade': avg_return,
                'win_rate': win_rate,
                'volatility': volatility,
                'sharpe_ratio': sharpe_ratio,
                'max_gain': max_gain,
                'max_loss': max_loss
            },
            'trades_analysis': trades_analysis,
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in analyze_portfolio: {e}")
        return jsonify({'error': 'Portfolio analysis failed', 'code': 'ANALYSIS_ERROR'}), 500

@app.route('/api/v1/signals/backtest', methods=['POST'])
@require_api_key
def backtest_strategy():
    """Backtest a trading strategy using historical signals"""
    try:
        if not request.is_json:
            return jsonify({'error': 'JSON payload required', 'code': 'INVALID_PAYLOAD'}), 400
        
        data = request.get_json()
        
        # Validate parameters
        start_date = data.get('start_date', (datetime.now() - timedelta(days=30)).date().isoformat())
        end_date = data.get('end_date', datetime.now().date().isoformat())
        initial_capital = float(data.get('initial_capital', 10000))
        position_size = float(data.get('position_size', 0.1))  # 10% of capital per trade
        filters = data.get('filters', {})
        
        # Get historical signals
        conn = sqlite3.connect(api.performance_db)
        
        query = '''
        SELECT * FROM signal_performance 
        WHERE DATE(entry_timestamp) BETWEEN ? AND ?
        AND exit_timestamp IS NOT NULL
        '''
        params = [start_date, end_date]
        
        # Apply filters
        if filters.get('asset_class'):
            query += ' AND asset_class = ?'
            params.append(filters['asset_class'])
        
        if filters.get('signal_type'):
            query += ' AND signal_type = ?'
            params.append(filters['signal_type'])
        
        if filters.get('min_confidence'):
            query += ' AND confidence_score >= ?'
            params.append(filters['min_confidence'])
        
        query += ' ORDER BY entry_timestamp'
        
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        
        if df.empty:
            return jsonify({
                'status': 'success',
                'backtest_results': {
                    'total_trades': 0,
                    'final_capital': initial_capital,
                    'total_return': 0,
                    'message': 'No signals found for the specified criteria'
                }
            })
        
        # Simulate trading
        capital = initial_capital
        trades = []
        equity_curve = [{'date': start_date, 'equity': capital}]
        
        for _, signal in df.iterrows():
            # Calculate position size
            trade_amount = capital * position_size
            
            # Calculate trade result
            pnl_percentage = signal['pnl_percentage']
            trade_pnl = trade_amount * (pnl_percentage / 100)
            capital += trade_pnl
            
            trades.append({
                'signal_id': signal['signal_id'],
                'symbol': signal['symbol'],
                'entry_date': signal['entry_timestamp'],
                'exit_date': signal['exit_timestamp'],
                'trade_amount': trade_amount,
                'pnl': trade_pnl,
                'pnl_percentage': pnl_percentage,
                'capital_after': capital
            })
            
            equity_curve.append({
                'date': signal['exit_timestamp'][:10],  # Date only
                'equity': capital
            })
        
        # Calculate backtest metrics
        total_return = ((capital - initial_capital) / initial_capital) * 100
        total_trades = len(trades)
        winning_trades = len([t for t in trades if t['pnl'] > 0])
        win_rate = (winning_trades / total_trades) * 100 if total_trades > 0 else 0
        
        avg_win = sum([t['pnl'] for t in trades if t['pnl'] > 0]) / winning_trades if winning_trades > 0 else 0
        avg_loss = sum([t['pnl'] for t in trades if t['pnl'] < 0]) / (total_trades - winning_trades) if (total_trades - winning_trades) > 0 else 0
        profit_factor = abs(avg_win * winning_trades / (avg_loss * (total_trades - winning_trades))) if avg_loss != 0 else float('inf')
        
        # Maximum drawdown
        equity_values = [point['equity'] for point in equity_curve]
        peak = equity_values[0]
        max_drawdown = 0
        
        for equity in equity_values:
            if equity > peak:
                peak = equity
            drawdown = (peak - equity) / peak
            max_drawdown = max(max_drawdown, drawdown)
        
        max_drawdown_percentage = max_drawdown * 100
        
        response = {
            'status': 'success',
            'backtest_results': {
                'period': {'start_date': start_date, 'end_date': end_date},
                'initial_capital': initial_capital,
                'final_capital': capital,
                'total_return': total_return,
                'total_trades': total_trades,
                'winning_trades': winning_trades,
                'losing_trades': total_trades - winning_trades,
                'win_rate': win_rate,
                'avg_win': avg_win,
                'avg_loss': avg_loss,
                'profit_factor': profit_factor,
                'max_drawdown_percentage': max_drawdown_percentage,
                'position_size_percentage': position_size * 100
            },
            'trades': trades[-50:],  # Last 50 trades
            'equity_curve': equity_curve,
            'filters_applied': filters,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in backtest_strategy: {e}")
        return jsonify({'error': 'Backtest failed', 'code': 'BACKTEST_ERROR'}), 500

@app.route('/api/v1/alerts/webhook', methods=['POST'])
@require_api_key
def create_webhook():
    """Create webhook for real-time signal alerts"""
    try:
        if not request.is_json:
            return jsonify({'error': 'JSON payload required', 'code': 'INVALID_PAYLOAD'}), 400
        
        data = request.get_json()
        
        # Validate webhook URL
        webhook_url = data.get('webhook_url')
        if not webhook_url or not webhook_url.startswith(('http://', 'https://')):
            return jsonify({'error': 'Valid webhook URL required', 'code': 'INVALID_WEBHOOK_URL'}), 400
        
        # Webhook configuration
        webhook_config = {
            'client_id': g.client_info['client_name'],
            'api_key': g.client_info['api_key'],
            'webhook_url': webhook_url,
            'filters': data.get('filters', {}),
            'created_at': datetime.now().isoformat(),
            'status': 'active'
        }
        
        # Store webhook configuration (in production, use a proper database)
        webhook_id = hashlib.sha256(f"{g.client_info['api_key']}{webhook_url}".encode()).hexdigest()[:16]
        
        # TODO: Store in database
        # For now, return success response
        
        response = {
            'status': 'success',
            'webhook_id': webhook_id,
            'webhook_config': webhook_config,
            'message': 'Webhook created successfully'
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error creating webhook: {e}")
        return jsonify({'error': 'Failed to create webhook', 'code': 'WEBHOOK_ERROR'}), 500

@app.route('/api/v1/client/info', methods=['GET'])
@require_api_key
def get_client_info():
    """Get client account information and usage statistics"""
    try:
        client_info = g.client_info.copy()
        
        # Remove sensitive information
        client_info.pop('api_key', None)
        
        # Get usage statistics
        conn = sqlite3.connect(api.api_keys_db)
        
        # Recent usage
        usage_query = '''
        SELECT 
            DATE(timestamp) as date,
            COUNT(*) as requests,
            AVG(response_time_ms) as avg_response_time
        FROM api_usage_logs 
        WHERE api_key = ? AND timestamp >= datetime('now', '-30 days')
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
        '''
        
        usage_df = pd.read_sql_query(usage_query, conn, params=(g.client_info['api_key'],))
        
        # Error rate
        error_query = '''
        SELECT 
            COUNT(*) as total_requests,
            COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_requests
        FROM api_usage_logs 
        WHERE api_key = ? AND timestamp >= datetime('now', '-7 days')
        '''
        
        error_df = pd.read_sql_query(error_query, conn, params=(g.client_info['api_key'],))
        
        conn.close()
        
        # Calculate error rate
        if not error_df.empty and error_df.iloc[0]['total_requests'] > 0:
            error_rate = (error_df.iloc[0]['error_requests'] / error_df.iloc[0]['total_requests']) * 100
        else:
            error_rate = 0
        
        response = {
            'status': 'success',
            'client_info': client_info,
            'usage_statistics': {
                'daily_usage_last_30_days': usage_df.to_dict('records'),
                'current_rate_limit': g.rate_info,
                'error_rate_last_7_days': error_rate
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in get_client_info: {e}")
        return jsonify({'error': 'Failed to fetch client info', 'code': 'FETCH_ERROR'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'code': 'NOT_FOUND',
        'message': 'The requested API endpoint does not exist'
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        'error': 'Method not allowed',
        'code': 'METHOD_NOT_ALLOWED',
        'message': 'The HTTP method is not supported for this endpoint'
    }), 405

@app.errorhandler(429)
def ratelimit_handler(error):
    return jsonify({
        'error': 'Rate limit exceeded',
        'code': 'RATE_LIMIT_EXCEEDED',
        'message': 'Too many requests. Please check the rate limit headers.'
    }), 429

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'code': 'INTERNAL_ERROR',
        'message': 'An unexpected error occurred'
    }), 500

if __name__ == '__main__':
    # Initialize databases if they don't exist
    from database_initializer import DatabaseInitializer
    
    initializer = DatabaseInitializer()
    initializer.initialize_all_databases()
    
    # Start the API server
    logger.info("Starting Institutional API server...")
    logger.info("Available endpoints:")
    logger.info("  GET  /api/v1/health - Health check")
    logger.info("  GET  /api/v1/signals - Get trading signals")
    logger.info("  GET  /api/v1/signals/<id> - Get signal details")
    logger.info("  GET  /api/v1/performance/summary - Performance summary")
    logger.info("  GET  /api/v1/performance/detailed - Detailed performance")
    logger.info("  POST /api/v1/analytics/portfolio - Portfolio analysis")
    logger.info("  POST /api/v1/signals/backtest - Strategy backtesting")
    logger.info("  POST /api/v1/alerts/webhook - Create webhook")
    logger.info("  GET  /api/v1/client/info - Client information")
    
    app.run(host='0.0.0.0', port=8080, debug=False)
#!/usr/bin/env python3
"""
Performance Tracking and Analytics System
Comprehensive signal performance monitoring with advanced analytics
"""

import pandas as pd
import numpy as np
import sqlite3
import yfinance as yf
from datetime import datetime, timedelta
import json
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class PerformanceTracker:
    def __init__(self, signals_db_path: str = 'premium_signals.db'):
        self.signals_db_path = signals_db_path
        self.performance_db_path = 'performance_analytics.db'
        self.initialize_performance_db()
        
        # Performance calculation settings
        self.risk_free_rate = 0.05  # 5% annual risk-free rate
        self.trading_days_per_year = 252
        self.benchmark_symbols = {
            'INDIAN_EQUITY': '^NSEI',  # Nifty 50
            'US_EQUITY': '^GSPC',      # S&P 500
            'CRYPTO': 'BTC-USD',       # Bitcoin
            'FOREX': 'DX-Y.NYB'        # US Dollar Index
        }
    
    def initialize_performance_db(self):
        """Initialize performance analytics database"""
        conn = sqlite3.connect(self.performance_db_path)
        cursor = conn.cursor()
        
        # Signal performance table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS signal_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT UNIQUE,
            symbol TEXT,
            asset_class TEXT,
            signal_type TEXT,
            action TEXT,
            entry_price REAL,
            exit_price REAL,
            stop_loss REAL,
            target_price REAL,
            entry_timestamp DATETIME,
            exit_timestamp DATETIME,
            holding_period_hours REAL,
            pnl_percentage REAL,
            pnl_absolute REAL,
            max_favorable_excursion REAL,
            max_adverse_excursion REAL,
            hit_target BOOLEAN,
            hit_stop_loss BOOLEAN,
            confidence_score INTEGER,
            risk_reward_ratio REAL,
            actual_risk_reward REAL,
            benchmark_return REAL,
            alpha REAL,
            trade_quality_score REAL
        )
        ''')
        
        # Daily performance aggregates
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE UNIQUE,
            total_signals INTEGER,
            active_signals INTEGER,
            closed_signals INTEGER,
            winning_signals INTEGER,
            losing_signals INTEGER,
            win_rate REAL,
            avg_return REAL,
            total_return REAL,
            sharpe_ratio REAL,
            sortino_ratio REAL,
            max_drawdown REAL,
            profit_factor REAL,
            avg_holding_period_hours REAL,
            best_trade_return REAL,
            worst_trade_return REAL,
            total_trades_value REAL
        )
        ''')
        
        # Asset class performance
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS asset_class_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE,
            asset_class TEXT,
            total_signals INTEGER,
            win_rate REAL,
            avg_return REAL,
            sharpe_ratio REAL,
            max_drawdown REAL,
            alpha REAL,
            benchmark_return REAL,
            PRIMARY KEY (date, asset_class)
        )
        ''')
        
        # Strategy performance by signal type
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS strategy_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE,
            signal_type TEXT,
            strategy_subtype TEXT,
            total_signals INTEGER,
            win_rate REAL,
            avg_return REAL,
            sharpe_ratio REAL,
            profit_factor REAL,
            max_drawdown REAL,
            avg_confidence REAL,
            PRIMARY KEY (date, signal_type, strategy_subtype)
        )
        ''')
        
        # Subscriber performance tracking
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriber_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            date DATE,
            subscription_tier TEXT,
            signals_received INTEGER,
            signals_acted_on INTEGER,
            estimated_pnl REAL,
            portfolio_value REAL,
            sharpe_ratio REAL,
            max_drawdown REAL,
            PRIMARY KEY (user_id, date)
        )
        ''')
        
        # Benchmark data cache
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS benchmark_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT,
            date DATE,
            open_price REAL,
            high_price REAL,
            low_price REAL,
            close_price REAL,
            adj_close REAL,
            volume BIGINT,
            PRIMARY KEY (symbol, date)
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def fetch_benchmark_data(self, asset_class: str, start_date: str, end_date: str) -> pd.DataFrame:
        """Fetch benchmark data for performance comparison"""
        benchmark_symbol = self.benchmark_symbols.get(asset_class, '^GSPC')
        
        try:
            ticker = yf.Ticker(benchmark_symbol)
            data = ticker.history(start=start_date, end=end_date)
            
            if not data.empty:
                # Cache benchmark data
                self.cache_benchmark_data(benchmark_symbol, data)
                
            return data
            
        except Exception as e:
            print(f"Error fetching benchmark data for {asset_class}: {e}")
            return pd.DataFrame()
    
    def cache_benchmark_data(self, symbol: str, data: pd.DataFrame):
        """Cache benchmark data in database"""
        conn = sqlite3.connect(self.performance_db_path)
        
        for date, row in data.iterrows():
            try:
                conn.execute('''
                INSERT OR REPLACE INTO benchmark_data 
                (symbol, date, open_price, high_price, low_price, close_price, adj_close, volume)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    symbol, date.date(), row['Open'], row['High'], 
                    row['Low'], row['Close'], row['Close'], row['Volume']
                ))
            except Exception:
                continue
        
        conn.commit()
        conn.close()
    
    def update_signal_performance(self, signal_id: str):
        """Update performance metrics for a specific signal"""
        # Get signal data
        signal_data = self.get_signal_data(signal_id)
        if not signal_data:
            return
        
        # Calculate performance metrics
        performance_metrics = self.calculate_signal_metrics(signal_data)
        
        # Store performance data
        self.store_signal_performance(signal_id, performance_metrics)
    
    def get_signal_data(self, signal_id: str) -> Optional[Dict]:
        """Get signal data from signals database"""
        conn = sqlite3.connect(self.signals_db_path)
        
        query = 'SELECT * FROM signals WHERE signal_id = ?'
        cursor = conn.cursor()
        cursor.execute(query, (signal_id,))
        
        columns = [description[0] for description in cursor.description]
        row = cursor.fetchone()
        
        conn.close()
        
        if row:
            return dict(zip(columns, row))
        return None
    
    def calculate_signal_metrics(self, signal_data: Dict) -> Dict:
        """Calculate comprehensive performance metrics for a signal"""
        metrics = {}
        
        entry_price = signal_data['entry_price']
        exit_price = signal_data.get('exit_price')
        stop_loss = signal_data['stop_loss']
        target_price = signal_data['target_price']
        action = signal_data['action']
        symbol = signal_data['symbol']
        asset_class = signal_data['asset_class']
        
        if not exit_price:
            # Signal still active, calculate unrealized P&L
            try:
                current_price = self.get_current_price(symbol)
                exit_price = current_price
            except:
                return {}
        
        # Calculate basic P&L
        if action == 'BUY':
            pnl_percentage = ((exit_price - entry_price) / entry_price) * 100
        else:  # SELL
            pnl_percentage = ((entry_price - exit_price) / entry_price) * 100
        
        pnl_absolute = pnl_percentage * (entry_price / 100)  # Assuming $1 per percentage point
        
        # Calculate actual risk-reward ratio
        if action == 'BUY':
            actual_risk = entry_price - stop_loss
            actual_reward = exit_price - entry_price
        else:
            actual_risk = stop_loss - entry_price
            actual_reward = entry_price - exit_price
        
        actual_risk_reward = abs(actual_reward / actual_risk) if actual_risk != 0 else 0
        
        # Check if targets/stops were hit
        hit_target = False
        hit_stop_loss = False
        
        if action == 'BUY':
            hit_target = exit_price >= target_price * 0.99  # 1% tolerance
            hit_stop_loss = exit_price <= stop_loss * 1.01
        else:
            hit_target = exit_price <= target_price * 1.01
            hit_stop_loss = exit_price >= stop_loss * 0.99
        
        # Calculate holding period
        entry_time = datetime.fromisoformat(signal_data.get('timestamp', datetime.now().isoformat()))
        exit_time = datetime.fromisoformat(signal_data.get('exit_timestamp', datetime.now().isoformat()))
        holding_period_hours = (exit_time - entry_time).total_seconds() / 3600
        
        # Get benchmark return for the same period
        benchmark_return = self.calculate_benchmark_return(
            asset_class, entry_time, exit_time
        )
        
        # Calculate alpha (excess return over benchmark)
        alpha = pnl_percentage - benchmark_return
        
        # Calculate trade quality score (0-100)
        trade_quality_score = self.calculate_trade_quality(
            signal_data, pnl_percentage, hit_target, hit_stop_loss, alpha
        )
        
        # Calculate maximum favorable and adverse excursions
        mfe, mae = self.calculate_excursions(signal_data, entry_time, exit_time)
        
        metrics = {
            'pnl_percentage': pnl_percentage,
            'pnl_absolute': pnl_absolute,
            'actual_risk_reward': actual_risk_reward,
            'hit_target': hit_target,
            'hit_stop_loss': hit_stop_loss,
            'holding_period_hours': holding_period_hours,
            'benchmark_return': benchmark_return,
            'alpha': alpha,
            'trade_quality_score': trade_quality_score,
            'max_favorable_excursion': mfe,
            'max_adverse_excursion': mae
        }
        
        return metrics
    
    def get_current_price(self, symbol: str) -> float:
        """Get current price for a symbol"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period='1d', interval='1m')
            if not data.empty:
                return data['Close'].iloc[-1]
        except:
            pass
        return 0.0
    
    def calculate_benchmark_return(self, asset_class: str, start_time: datetime, end_time: datetime) -> float:
        """Calculate benchmark return for the same period as the signal"""
        benchmark_symbol = self.benchmark_symbols.get(asset_class, '^GSPC')
        
        try:
            ticker = yf.Ticker(benchmark_symbol)
            data = ticker.history(start=start_time.date(), end=end_time.date() + timedelta(days=1))
            
            if len(data) >= 2:
                start_price = data['Close'].iloc[0]
                end_price = data['Close'].iloc[-1]
                return ((end_price - start_price) / start_price) * 100
                
        except Exception:
            pass
        
        return 0.0
    
    def calculate_trade_quality(self, signal_data: Dict, pnl_percentage: float, 
                              hit_target: bool, hit_stop_loss: bool, alpha: float) -> float:
        """Calculate trade quality score (0-100)"""
        score = 50  # Base score
        
        # P&L contribution (0-30 points)
        if pnl_percentage > 0:
            score += min(30, pnl_percentage * 2)  # +2 points per 1% gain
        else:
            score += max(-30, pnl_percentage * 2)  # -2 points per 1% loss
        
        # Target achievement (0-20 points)
        if hit_target:
            score += 20
        elif hit_stop_loss:
            score -= 15
        
        # Alpha contribution (0-15 points)
        score += min(15, max(-15, alpha * 1.5))
        
        # Confidence accuracy (0-15 points)
        confidence = signal_data.get('confidence_score', 5)
        expected_win_rate = confidence / 10.0
        actual_performance = 1 if pnl_percentage > 0 else 0
        
        if (expected_win_rate > 0.7 and actual_performance == 1) or \
           (expected_win_rate < 0.4 and actual_performance == 0):
            score += 15
        elif (expected_win_rate > 0.7 and actual_performance == 0) or \
             (expected_win_rate < 0.4 and actual_performance == 1):
            score -= 10
        
        return max(0, min(100, score))
    
    def calculate_excursions(self, signal_data: Dict, entry_time: datetime, 
                           exit_time: datetime) -> Tuple[float, float]:
        """Calculate Maximum Favorable Excursion (MFE) and Maximum Adverse Excursion (MAE)"""
        symbol = signal_data['symbol']
        entry_price = signal_data['entry_price']
        action = signal_data['action']
        
        try:
            # Get intraday data for the holding period
            ticker = yf.Ticker(symbol)
            data = ticker.history(
                start=entry_time.date(),
                end=exit_time.date() + timedelta(days=1),
                interval='5m'
            )
            
            if data.empty:
                return 0.0, 0.0
            
            # Filter data for the actual holding period
            data = data[(data.index >= entry_time) & (data.index <= exit_time)]
            
            if data.empty:
                return 0.0, 0.0
            
            if action == 'BUY':
                # For long positions
                mfe = ((data['High'].max() - entry_price) / entry_price) * 100
                mae = ((entry_price - data['Low'].min()) / entry_price) * 100
            else:
                # For short positions
                mfe = ((entry_price - data['Low'].min()) / entry_price) * 100
                mae = ((data['High'].max() - entry_price) / entry_price) * 100
            
            return max(0, mfe), max(0, mae)
            
        except Exception as e:
            print(f"Error calculating excursions for {symbol}: {e}")
            return 0.0, 0.0
    
    def store_signal_performance(self, signal_id: str, metrics: Dict):
        """Store signal performance metrics"""
        conn = sqlite3.connect(self.performance_db_path)
        cursor = conn.cursor()
        
        signal_data = self.get_signal_data(signal_id)
        if not signal_data:
            return
        
        cursor.execute('''
        INSERT OR REPLACE INTO signal_performance 
        (signal_id, symbol, asset_class, signal_type, action, entry_price, exit_price,
         stop_loss, target_price, entry_timestamp, exit_timestamp, holding_period_hours,
         pnl_percentage, pnl_absolute, max_favorable_excursion, max_adverse_excursion,
         hit_target, hit_stop_loss, confidence_score, risk_reward_ratio, 
         actual_risk_reward, benchmark_return, alpha, trade_quality_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            signal_id,
            signal_data['symbol'],
            signal_data['asset_class'],
            signal_data['signal_type'],
            signal_data['action'],
            signal_data['entry_price'],
            signal_data.get('exit_price'),
            signal_data['stop_loss'],
            signal_data['target_price'],
            signal_data['timestamp'],
            signal_data.get('exit_timestamp'),
            metrics['holding_period_hours'],
            metrics['pnl_percentage'],
            metrics['pnl_absolute'],
            metrics['max_favorable_excursion'],
            metrics['max_adverse_excursion'],
            metrics['hit_target'],
            metrics['hit_stop_loss'],
            signal_data['confidence_score'],
            signal_data['risk_reward_ratio'],
            metrics['actual_risk_reward'],
            metrics['benchmark_return'],
            metrics['alpha'],
            metrics['trade_quality_score']
        ))
        
        conn.commit()
        conn.close()
    
    def calculate_daily_metrics(self, date: str = None) -> Dict:
        """Calculate daily performance metrics"""
        if not date:
            date = datetime.now().date()
        
        conn = sqlite3.connect(self.performance_db_path)
        
        query = '''
        SELECT * FROM signal_performance 
        WHERE DATE(entry_timestamp) = ?
        '''
        
        df = pd.read_sql_query(query, conn, params=(date,))
        conn.close()
        
        if df.empty:
            return {}
        
        # Calculate metrics
        total_signals = len(df)
        closed_signals = len(df[df['exit_timestamp'].notna()])
        active_signals = total_signals - closed_signals
        
        if closed_signals == 0:
            return {
                'date': date,
                'total_signals': total_signals,
                'active_signals': active_signals,
                'closed_signals': closed_signals
            }
        
        closed_df = df[df['exit_timestamp'].notna()].copy()
        
        winning_signals = len(closed_df[closed_df['pnl_percentage'] > 0])
        losing_signals = len(closed_df[closed_df['pnl_percentage'] <= 0])
        win_rate = (winning_signals / closed_signals) * 100 if closed_signals > 0 else 0
        
        avg_return = closed_df['pnl_percentage'].mean()
        total_return = closed_df['pnl_percentage'].sum()
        
        # Calculate Sharpe ratio (annualized)
        if closed_df['pnl_percentage'].std() > 0:
            daily_sharpe = (avg_return - (self.risk_free_rate / 365)) / closed_df['pnl_percentage'].std()
            sharpe_ratio = daily_sharpe * np.sqrt(self.trading_days_per_year)
        else:
            sharpe_ratio = 0
        
        # Calculate Sortino ratio (downside deviation)
        negative_returns = closed_df[closed_df['pnl_percentage'] < 0]['pnl_percentage']
        if len(negative_returns) > 0:
            downside_std = negative_returns.std()
            sortino_ratio = (avg_return - (self.risk_free_rate / 365)) / downside_std if downside_std > 0 else 0
            sortino_ratio *= np.sqrt(self.trading_days_per_year)
        else:
            sortino_ratio = sharpe_ratio
        
        # Calculate maximum drawdown
        cumulative_returns = (1 + closed_df['pnl_percentage'] / 100).cumprod()
        rolling_max = cumulative_returns.expanding().max()
        drawdown = (cumulative_returns / rolling_max - 1) * 100
        max_drawdown = abs(drawdown.min()) if not drawdown.empty else 0
        
        # Calculate profit factor
        gross_profit = closed_df[closed_df['pnl_percentage'] > 0]['pnl_percentage'].sum()
        gross_loss = abs(closed_df[closed_df['pnl_percentage'] < 0]['pnl_percentage'].sum())
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
        
        # Other metrics
        avg_holding_period = closed_df['holding_period_hours'].mean()
        best_trade = closed_df['pnl_percentage'].max()
        worst_trade = closed_df['pnl_percentage'].min()
        total_trades_value = closed_df['pnl_absolute'].sum()
        
        metrics = {
            'date': date,
            'total_signals': total_signals,
            'active_signals': active_signals,
            'closed_signals': closed_signals,
            'winning_signals': winning_signals,
            'losing_signals': losing_signals,
            'win_rate': win_rate,
            'avg_return': avg_return,
            'total_return': total_return,
            'sharpe_ratio': sharpe_ratio,
            'sortino_ratio': sortino_ratio,
            'max_drawdown': max_drawdown,
            'profit_factor': profit_factor,
            'avg_holding_period_hours': avg_holding_period,
            'best_trade_return': best_trade,
            'worst_trade_return': worst_trade,
            'total_trades_value': total_trades_value
        }
        
        # Store daily metrics
        self.store_daily_metrics(metrics)
        
        return metrics
    
    def store_daily_metrics(self, metrics: Dict):
        """Store daily performance metrics"""
        conn = sqlite3.connect(self.performance_db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT OR REPLACE INTO daily_performance 
        (date, total_signals, active_signals, closed_signals, winning_signals,
         losing_signals, win_rate, avg_return, total_return, sharpe_ratio,
         sortino_ratio, max_drawdown, profit_factor, avg_holding_period_hours,
         best_trade_return, worst_trade_return, total_trades_value)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            metrics['date'], metrics['total_signals'], metrics['active_signals'],
            metrics['closed_signals'], metrics['winning_signals'], metrics['losing_signals'],
            metrics['win_rate'], metrics['avg_return'], metrics['total_return'],
            metrics['sharpe_ratio'], metrics['sortino_ratio'], metrics['max_drawdown'],
            metrics['profit_factor'], metrics['avg_holding_period_hours'],
            metrics['best_trade_return'], metrics['worst_trade_return'],
            metrics['total_trades_value']
        ))
        
        conn.commit()
        conn.close()
    
    def calculate_asset_class_performance(self, date: str = None) -> Dict:
        """Calculate performance metrics by asset class"""
        if not date:
            date = datetime.now().date()
        
        conn = sqlite3.connect(self.performance_db_path)
        
        query = '''
        SELECT asset_class, 
               COUNT(*) as total_signals,
               AVG(CASE WHEN pnl_percentage > 0 THEN 1.0 ELSE 0.0 END) * 100 as win_rate,
               AVG(pnl_percentage) as avg_return,
               AVG(alpha) as alpha,
               AVG(benchmark_return) as benchmark_return,
               STDEV(pnl_percentage) as volatility
        FROM signal_performance 
        WHERE DATE(entry_timestamp) = ?
        AND exit_timestamp IS NOT NULL
        GROUP BY asset_class
        '''
        
        df = pd.read_sql_query(query, conn, params=(date,))
        conn.close()
        
        asset_performance = {}
        
        for _, row in df.iterrows():
            asset_class = row['asset_class']
            
            # Calculate Sharpe ratio
            if row['volatility'] and row['volatility'] > 0:
                sharpe_ratio = (row['avg_return'] - (self.risk_free_rate / 365)) / row['volatility']
                sharpe_ratio *= np.sqrt(self.trading_days_per_year)
            else:
                sharpe_ratio = 0
            
            # Calculate max drawdown for this asset class
            asset_signals = self.get_asset_class_signals(asset_class, date)
            max_drawdown = self.calculate_asset_drawdown(asset_signals)
            
            asset_performance[asset_class] = {
                'date': date,
                'total_signals': int(row['total_signals']),
                'win_rate': row['win_rate'],
                'avg_return': row['avg_return'],
                'sharpe_ratio': sharpe_ratio,
                'max_drawdown': max_drawdown,
                'alpha': row['alpha'],
                'benchmark_return': row['benchmark_return']
            }
            
            # Store asset class performance
            self.store_asset_class_performance(asset_performance[asset_class])
        
        return asset_performance
    
    def get_asset_class_signals(self, asset_class: str, date: str) -> pd.DataFrame:
        """Get signals for specific asset class and date"""
        conn = sqlite3.connect(self.performance_db_path)
        
        query = '''
        SELECT * FROM signal_performance 
        WHERE asset_class = ? AND DATE(entry_timestamp) = ?
        AND exit_timestamp IS NOT NULL
        ORDER BY entry_timestamp
        '''
        
        df = pd.read_sql_query(query, conn, params=(asset_class, date))
        conn.close()
        
        return df
    
    def calculate_asset_drawdown(self, signals_df: pd.DataFrame) -> float:
        """Calculate maximum drawdown for asset class signals"""
        if signals_df.empty:
            return 0.0
        
        cumulative_returns = (1 + signals_df['pnl_percentage'] / 100).cumprod()
        rolling_max = cumulative_returns.expanding().max()
        drawdown = (cumulative_returns / rolling_max - 1) * 100
        
        return abs(drawdown.min()) if not drawdown.empty else 0.0
    
    def store_asset_class_performance(self, metrics: Dict):
        """Store asset class performance metrics"""
        conn = sqlite3.connect(self.performance_db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT OR REPLACE INTO asset_class_performance 
        (date, asset_class, total_signals, win_rate, avg_return, 
         sharpe_ratio, max_drawdown, alpha, benchmark_return)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            metrics['date'], metrics.get('asset_class', ''),
            metrics['total_signals'], metrics['win_rate'], metrics['avg_return'],
            metrics['sharpe_ratio'], metrics['max_drawdown'], 
            metrics['alpha'], metrics['benchmark_return']
        ))
        
        conn.commit()
        conn.close()
    
    def generate_performance_report(self, start_date: str, end_date: str) -> Dict:
        """Generate comprehensive performance report"""
        conn = sqlite3.connect(self.performance_db_path)
        
        # Overall performance
        overall_query = '''
        SELECT 
            COUNT(*) as total_signals,
            COUNT(CASE WHEN exit_timestamp IS NOT NULL THEN 1 END) as closed_signals,
            AVG(CASE WHEN pnl_percentage > 0 THEN 1.0 ELSE 0.0 END) * 100 as win_rate,
            AVG(pnl_percentage) as avg_return,
            SUM(pnl_percentage) as total_return,
            AVG(alpha) as avg_alpha,
            AVG(trade_quality_score) as avg_quality_score,
            AVG(holding_period_hours) as avg_holding_hours
        FROM signal_performance 
        WHERE DATE(entry_timestamp) BETWEEN ? AND ?
        AND exit_timestamp IS NOT NULL
        '''
        
        overall_df = pd.read_sql_query(overall_query, conn, params=(start_date, end_date))
        
        # Performance by asset class
        asset_query = '''
        SELECT 
            asset_class,
            COUNT(*) as signals,
            AVG(CASE WHEN pnl_percentage > 0 THEN 1.0 ELSE 0.0 END) * 100 as win_rate,
            AVG(pnl_percentage) as avg_return,
            AVG(alpha) as avg_alpha
        FROM signal_performance 
        WHERE DATE(entry_timestamp) BETWEEN ? AND ?
        AND exit_timestamp IS NOT NULL
        GROUP BY asset_class
        '''
        
        asset_df = pd.read_sql_query(asset_query, conn, params=(start_date, end_date))
        
        # Performance by signal type
        signal_type_query = '''
        SELECT 
            signal_type,
            COUNT(*) as signals,
            AVG(CASE WHEN pnl_percentage > 0 THEN 1.0 ELSE 0.0 END) * 100 as win_rate,
            AVG(pnl_percentage) as avg_return,
            AVG(holding_period_hours) as avg_holding_hours
        FROM signal_performance 
        WHERE DATE(entry_timestamp) BETWEEN ? AND ?
        AND exit_timestamp IS NOT NULL
        GROUP BY signal_type
        '''
        
        signal_type_df = pd.read_sql_query(signal_type_query, conn, params=(start_date, end_date))
        
        # Top performing signals
        top_signals_query = '''
        SELECT signal_id, symbol, pnl_percentage, alpha, trade_quality_score
        FROM signal_performance 
        WHERE DATE(entry_timestamp) BETWEEN ? AND ?
        AND exit_timestamp IS NOT NULL
        ORDER BY pnl_percentage DESC
        LIMIT 10
        '''
        
        top_signals_df = pd.read_sql_query(top_signals_query, conn, params=(start_date, end_date))
        
        conn.close()
        
        # Calculate additional metrics
        if not overall_df.empty and overall_df.iloc[0]['closed_signals'] > 0:
            # Get all closed signals for advanced calculations
            all_signals = self.get_period_signals(start_date, end_date)
            
            if not all_signals.empty:
                returns = all_signals['pnl_percentage']
                
                # Sharpe ratio
                if returns.std() > 0:
                    sharpe_ratio = (returns.mean() - (self.risk_free_rate / 365)) / returns.std()
                    sharpe_ratio *= np.sqrt(self.trading_days_per_year)
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
        
        report = {
            'period': {'start': start_date, 'end': end_date},
            'overall_performance': {
                'total_signals': int(overall_df.iloc[0]['total_signals']) if not overall_df.empty else 0,
                'closed_signals': int(overall_df.iloc[0]['closed_signals']) if not overall_df.empty else 0,
                'win_rate': overall_df.iloc[0]['win_rate'] if not overall_df.empty else 0,
                'avg_return': overall_df.iloc[0]['avg_return'] if not overall_df.empty else 0,
                'total_return': overall_df.iloc[0]['total_return'] if not overall_df.empty else 0,
                'avg_alpha': overall_df.iloc[0]['avg_alpha'] if not overall_df.empty else 0,
                'avg_quality_score': overall_df.iloc[0]['avg_quality_score'] if not overall_df.empty else 0,
                'avg_holding_hours': overall_df.iloc[0]['avg_holding_hours'] if not overall_df.empty else 0,
                'sharpe_ratio': sharpe_ratio,
                'max_drawdown': max_drawdown,
                'profit_factor': profit_factor
            },
            'performance_by_asset_class': asset_df.to_dict('records'),
            'performance_by_signal_type': signal_type_df.to_dict('records'),
            'top_performing_signals': top_signals_df.to_dict('records'),
            'generated_at': datetime.now().isoformat()
        }
        
        return report
    
    def get_period_signals(self, start_date: str, end_date: str) -> pd.DataFrame:
        """Get all signals for a specific period"""
        conn = sqlite3.connect(self.performance_db_path)
        
        query = '''
        SELECT * FROM signal_performance 
        WHERE DATE(entry_timestamp) BETWEEN ? AND ?
        AND exit_timestamp IS NOT NULL
        ORDER BY entry_timestamp
        '''
        
        df = pd.read_sql_query(query, conn, params=(start_date, end_date))
        conn.close()
        
        return df
    
    def create_performance_visualization(self, start_date: str, end_date: str) -> str:
        """Create performance visualization charts"""
        # Get performance data
        signals_df = self.get_period_signals(start_date, end_date)
        
        if signals_df.empty:
            return None
        
        # Create subplots
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle(f'Signal Performance Analysis ({start_date} to {end_date})', fontsize=16)
        
        # 1. Cumulative returns
        signals_df['cumulative_return'] = (1 + signals_df['pnl_percentage'] / 100).cumprod()
        axes[0, 0].plot(signals_df.index, signals_df['cumulative_return'], linewidth=2)
        axes[0, 0].set_title('Cumulative Returns')
        axes[0, 0].set_ylabel('Cumulative Return')
        axes[0, 0].grid(True, alpha=0.3)
        
        # 2. Win rate by asset class
        win_rate_by_asset = signals_df.groupby('asset_class').apply(
            lambda x: (x['pnl_percentage'] > 0).mean() * 100
        )
        win_rate_by_asset.plot(kind='bar', ax=axes[0, 1])
        axes[0, 1].set_title('Win Rate by Asset Class')
        axes[0, 1].set_ylabel('Win Rate (%)')
        axes[0, 1].tick_params(axis='x', rotation=45)
        
        # 3. Return distribution
        axes[1, 0].hist(signals_df['pnl_percentage'], bins=30, alpha=0.7, edgecolor='black')
        axes[1, 0].axvline(signals_df['pnl_percentage'].mean(), color='red', linestyle='--', 
                          label=f'Mean: {signals_df["pnl_percentage"].mean():.2f}%')
        axes[1, 0].set_title('Return Distribution')
        axes[1, 0].set_xlabel('Return (%)')
        axes[1, 0].set_ylabel('Frequency')
        axes[1, 0].legend()
        
        # 4. Performance by signal type
        perf_by_type = signals_df.groupby('signal_type')['pnl_percentage'].mean()
        perf_by_type.plot(kind='bar', ax=axes[1, 1])
        axes[1, 1].set_title('Average Return by Signal Type')
        axes[1, 1].set_ylabel('Average Return (%)')
        axes[1, 1].tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        
        # Save chart
        chart_path = f'/tmp/performance_report_{start_date}_{end_date}.png'
        plt.savefig(chart_path, dpi=150, bbox_inches='tight')
        plt.close()
        
        return chart_path
    
    def run_daily_analysis(self):
        """Run daily performance analysis"""
        today = datetime.now().date()
        
        # Update all closed signals
        self.update_all_signal_performance()
        
        # Calculate daily metrics
        daily_metrics = self.calculate_daily_metrics(today)
        
        # Calculate asset class performance
        asset_performance = self.calculate_asset_class_performance(today)
        
        print(f"Daily analysis completed for {today}")
        print(f"Total signals: {daily_metrics.get('total_signals', 0)}")
        print(f"Win rate: {daily_metrics.get('win_rate', 0):.2f}%")
        print(f"Average return: {daily_metrics.get('avg_return', 0):.2f}%")
        
        return {
            'daily_metrics': daily_metrics,
            'asset_performance': asset_performance
        }
    
    def update_all_signal_performance(self):
        """Update performance for all signals with exit data"""
        conn = sqlite3.connect(self.signals_db_path)
        
        query = '''
        SELECT signal_id FROM signals 
        WHERE exit_timestamp IS NOT NULL 
        AND signal_id NOT IN (
            SELECT signal_id FROM signal_performance 
            WHERE signal_id IS NOT NULL
        )
        '''
        
        cursor = conn.cursor()
        cursor.execute(query)
        signal_ids = [row[0] for row in cursor.fetchall()]
        conn.close()
        
        for signal_id in signal_ids:
            try:
                self.update_signal_performance(signal_id)
            except Exception as e:
                print(f"Error updating performance for {signal_id}: {e}")

if __name__ == "__main__":
    # Initialize performance tracker
    tracker = PerformanceTracker()
    
    # Run daily analysis
    analysis_result = tracker.run_daily_analysis()
    
    # Generate weekly report
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=7)
    
    weekly_report = tracker.generate_performance_report(
        start_date.isoformat(), 
        end_date.isoformat()
    )
    
    print("\nWeekly Performance Report:")
    print(json.dumps(weekly_report, indent=2, default=str))
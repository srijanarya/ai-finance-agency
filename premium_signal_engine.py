#!/usr/bin/env python3
"""
Premium AI-Powered Trading Signal Engine
Core revenue generator for AI Finance Agency platform
Target: $500K-2M ARR through premium subscriptions
"""

import pandas as pd
import numpy as np
import yfinance as yf
import sqlite3
from datetime import datetime, timedelta
import json
import asyncio
import aiohttp
import ta
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class PremiumSignalEngine:
    def __init__(self):
        self.db_path = 'premium_signals.db'
        self.initialize_database()
        
        # Asset universes for signal generation
        self.indian_stocks = [
            'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFC.NS', 'ICICIBANK.NS',
            'HDFCBANK.NS', 'ITC.NS', 'LT.NS', 'SBIN.NS', 'BHARTIARTL.NS',
            'ASIANPAINT.NS', 'MARUTI.NS', 'M&M.NS', 'KOTAKBANK.NS', 'WIPRO.NS'
        ]
        
        self.us_stocks = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA',
            'NFLX', 'SPY', 'QQQ', 'DIA', 'IWM'
        ]
        
        self.crypto_symbols = [
            'BTC-USD', 'ETH-USD', 'ADA-USD', 'BNB-USD', 'XRP-USD',
            'SOL-USD', 'DOT-USD', 'DOGE-USD', 'AVAX-USD', 'MATIC-USD'
        ]
        
        self.forex_pairs = [
            'USDINR=X', 'EURUSD=X', 'GBPUSD=X', 'USDCAD=X', 'AUDUSD=X'
        ]
        
        # Signal quality thresholds
        self.min_risk_reward = 2.0
        self.min_confidence = 6.0
        self.max_signals_per_day = 15
        
    def initialize_database(self):
        """Initialize SQLite database for storing signals and performance data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Signals table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT UNIQUE,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            symbol TEXT NOT NULL,
            asset_class TEXT NOT NULL,
            signal_type TEXT NOT NULL,
            action TEXT NOT NULL,
            entry_price REAL,
            stop_loss REAL,
            target_price REAL,
            risk_reward_ratio REAL,
            confidence_score INTEGER,
            timeframe TEXT,
            analysis TEXT,
            status TEXT DEFAULT 'ACTIVE',
            exit_price REAL,
            exit_timestamp DATETIME,
            pnl_percentage REAL,
            tier_access TEXT DEFAULT 'BASIC'
        )
        ''')
        
        # Performance tracking table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS performance_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE,
            total_signals INTEGER,
            winning_signals INTEGER,
            losing_signals INTEGER,
            win_rate REAL,
            avg_return REAL,
            sharpe_ratio REAL,
            max_drawdown REAL,
            asset_class TEXT,
            tier TEXT
        )
        ''')
        
        # Market data cache table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS market_data_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT,
            timestamp DATETIME,
            open_price REAL,
            high_price REAL,
            low_price REAL,
            close_price REAL,
            volume BIGINT,
            indicators TEXT
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def fetch_market_data(self, symbol: str, period: str = '5d', interval: str = '5m') -> pd.DataFrame:
        """Fetch market data for analysis"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period, interval=interval)
            
            if data.empty:
                return pd.DataFrame()
            
            # Add technical indicators
            data = self.add_technical_indicators(data)
            return data
            
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            return pd.DataFrame()
    
    def add_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add comprehensive technical indicators"""
        if df.empty or len(df) < 20:
            return df
            
        try:
            # Moving Averages
            df['SMA_20'] = ta.trend.sma_indicator(df['Close'], window=20)
            df['EMA_12'] = ta.trend.ema_indicator(df['Close'], window=12)
            df['EMA_26'] = ta.trend.ema_indicator(df['Close'], window=26)
            
            # MACD
            df['MACD'] = ta.trend.macd(df['Close'])
            df['MACD_signal'] = ta.trend.macd_signal(df['Close'])
            df['MACD_histogram'] = ta.trend.macd_diff(df['Close'])
            
            # RSI
            df['RSI'] = ta.momentum.rsi(df['Close'], window=14)
            
            # Bollinger Bands
            df['BB_upper'] = ta.volatility.bollinger_hband(df['Close'])
            df['BB_lower'] = ta.volatility.bollinger_lband(df['Close'])
            df['BB_middle'] = ta.volatility.bollinger_mavg(df['Close'])
            
            # Stochastic
            df['Stoch_K'] = ta.momentum.stoch(df['High'], df['Low'], df['Close'])
            df['Stoch_D'] = ta.momentum.stoch_signal(df['High'], df['Low'], df['Close'])
            
            # Volume indicators
            df['OBV'] = ta.volume.on_balance_volume(df['Close'], df['Volume'])
            df['Volume_SMA'] = df['Volume'].rolling(window=20).mean()
            
            # Support and Resistance
            df['Support'] = df['Low'].rolling(window=20).min()
            df['Resistance'] = df['High'].rolling(window=20).max()
            
            return df
            
        except Exception as e:
            print(f"Error adding technical indicators: {e}")
            return df
    
    def generate_intraday_signals(self, symbol: str, data: pd.DataFrame) -> List[Dict]:
        """Generate intraday trading signals (5-15 minute timeframes)"""
        signals = []
        
        if data.empty or len(data) < 50:
            return signals
        
        latest = data.iloc[-1]
        previous = data.iloc[-2]
        
        # Mean Reversion Strategy
        if self.detect_mean_reversion_setup(data):
            signal = self.create_mean_reversion_signal(symbol, data, latest)
            if signal and signal['confidence_score'] >= 6:
                signals.append(signal)
        
        # Momentum Breakout Strategy
        if self.detect_momentum_breakout(data):
            signal = self.create_momentum_signal(symbol, data, latest)
            if signal and signal['confidence_score'] >= 6:
                signals.append(signal)
        
        # Scalping Opportunities
        if self.detect_scalping_setup(data):
            signal = self.create_scalping_signal(symbol, data, latest)
            if signal and signal['confidence_score'] >= 7:
                signals.append(signal)
        
        return signals
    
    def generate_swing_signals(self, symbol: str, data: pd.DataFrame) -> List[Dict]:
        """Generate swing trading signals (1-5 day holds)"""
        signals = []
        
        if data.empty or len(data) < 100:
            return signals
        
        # Trend Following Strategy
        if self.detect_trend_continuation(data):
            signal = self.create_trend_signal(symbol, data)
            if signal and signal['confidence_score'] >= 6:
                signals.append(signal)
        
        # Support/Resistance Bounce
        if self.detect_support_resistance_play(data):
            signal = self.create_sr_signal(symbol, data)
            if signal and signal['confidence_score'] >= 7:
                signals.append(signal)
        
        return signals
    
    def generate_investment_signals(self, symbol: str, data: pd.DataFrame) -> List[Dict]:
        """Generate investment signals (weeks to months)"""
        signals = []
        
        # Get longer timeframe data for investment signals
        long_data = self.fetch_market_data(symbol, period='1y', interval='1d')
        if long_data.empty:
            return signals
        
        # Value-based signals
        if self.detect_value_opportunity(long_data):
            signal = self.create_investment_signal(symbol, long_data, 'VALUE_BUY')
            if signal and signal['confidence_score'] >= 7:
                signals.append(signal)
        
        # Growth momentum signals
        if self.detect_growth_momentum(long_data):
            signal = self.create_investment_signal(symbol, long_data, 'GROWTH_BUY')
            if signal and signal['confidence_score'] >= 6:
                signals.append(signal)
        
        return signals
    
    def detect_mean_reversion_setup(self, data: pd.DataFrame) -> bool:
        """Detect mean reversion opportunities"""
        latest = data.iloc[-1]
        
        # RSI oversold/overbought
        rsi_oversold = latest['RSI'] < 30
        rsi_overbought = latest['RSI'] > 70
        
        # Price near Bollinger Bands
        near_lower_band = latest['Close'] <= latest['BB_lower'] * 1.01
        near_upper_band = latest['Close'] >= latest['BB_upper'] * 0.99
        
        # Volume confirmation
        high_volume = latest['Volume'] > latest['Volume_SMA'] * 1.2
        
        return (rsi_oversold and near_lower_band and high_volume) or \
               (rsi_overbought and near_upper_band and high_volume)
    
    def detect_momentum_breakout(self, data: pd.DataFrame) -> bool:
        """Detect momentum breakout patterns"""
        latest = data.iloc[-1]
        previous = data.iloc[-2]
        
        # Price breakout above resistance
        price_breakout = latest['Close'] > latest['Resistance'] and \
                        previous['Close'] <= previous['Resistance']
        
        # MACD bullish crossover
        macd_bullish = latest['MACD'] > latest['MACD_signal'] and \
                      previous['MACD'] <= previous['MACD_signal']
        
        # Volume surge
        volume_surge = latest['Volume'] > latest['Volume_SMA'] * 1.5
        
        return price_breakout and macd_bullish and volume_surge
    
    def detect_scalping_setup(self, data: pd.DataFrame) -> bool:
        """Detect scalping opportunities"""
        if len(data) < 10:
            return False
            
        latest = data.iloc[-1]
        
        # Quick RSI movements
        rsi_quick_move = abs(data['RSI'].iloc[-1] - data['RSI'].iloc[-3]) > 10
        
        # Tight price action near EMA
        near_ema = abs(latest['Close'] - latest['EMA_12']) / latest['Close'] < 0.002
        
        # Increasing volume
        volume_increase = latest['Volume'] > data['Volume'].iloc[-3:].mean() * 1.3
        
        return rsi_quick_move and near_ema and volume_increase
    
    def detect_trend_continuation(self, data: pd.DataFrame) -> bool:
        """Detect trend continuation patterns for swing trading"""
        if len(data) < 50:
            return False
            
        # EMA alignment
        ema_bullish = data['EMA_12'].iloc[-1] > data['EMA_26'].iloc[-1]
        ema_trend = data['EMA_12'].iloc[-1] > data['EMA_12'].iloc[-5]
        
        # Price above key moving averages
        price_above_ema = data['Close'].iloc[-1] > data['EMA_12'].iloc[-1]
        
        # MACD positive
        macd_positive = data['MACD'].iloc[-1] > 0
        
        return ema_bullish and ema_trend and price_above_ema and macd_positive
    
    def detect_support_resistance_play(self, data: pd.DataFrame) -> bool:
        """Detect support/resistance bounce opportunities"""
        latest = data.iloc[-1]
        
        # Price near support with bullish indicators
        near_support = abs(latest['Close'] - latest['Support']) / latest['Close'] < 0.02
        rsi_oversold = latest['RSI'] < 35
        
        # Or price near resistance with bearish indicators
        near_resistance = abs(latest['Close'] - latest['Resistance']) / latest['Close'] < 0.02
        rsi_overbought = latest['RSI'] > 65
        
        return (near_support and rsi_oversold) or (near_resistance and rsi_overbought)
    
    def detect_value_opportunity(self, data: pd.DataFrame) -> bool:
        """Detect value investment opportunities"""
        # Simple value detection based on price action
        current_price = data['Close'].iloc[-1]
        avg_price_6m = data['Close'].iloc[-120:].mean()
        
        # Trading below 6-month average
        value_discount = current_price < avg_price_6m * 0.9
        
        # Not in severe downtrend
        not_crashing = data['Close'].iloc[-1] > data['Close'].iloc[-20:].min() * 1.05
        
        return value_discount and not_crashing
    
    def detect_growth_momentum(self, data: pd.DataFrame) -> bool:
        """Detect growth momentum for investment"""
        if len(data) < 60:
            return False
            
        # Consistent uptrend
        price_trend = data['Close'].iloc[-1] > data['Close'].iloc[-60]
        recent_strength = data['Close'].iloc[-5:].mean() > data['Close'].iloc[-20:-15].mean()
        
        # Volume confirmation
        volume_trend = data['Volume'].iloc[-10:].mean() > data['Volume'].iloc[-30:-20].mean()
        
        return price_trend and recent_strength and volume_trend
    
    def create_mean_reversion_signal(self, symbol: str, data: pd.DataFrame, latest: pd.Series) -> Dict:
        """Create mean reversion signal"""
        # Determine direction
        action = 'BUY' if latest['RSI'] < 30 else 'SELL'
        entry_price = latest['Close']
        
        if action == 'BUY':
            stop_loss = latest['Support'] * 0.98
            target_price = latest['BB_middle']
        else:
            stop_loss = latest['Resistance'] * 1.02
            target_price = latest['BB_middle']
        
        risk_reward = abs(target_price - entry_price) / abs(entry_price - stop_loss)
        
        if risk_reward < self.min_risk_reward:
            return None
        
        confidence = self.calculate_confidence_score(data, 'MEAN_REVERSION')
        
        return {
            'signal_id': f"MR_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M')}",
            'symbol': symbol,
            'asset_class': self.get_asset_class(symbol),
            'signal_type': 'INTRADAY',
            'action': action,
            'entry_price': round(entry_price, 2),
            'stop_loss': round(stop_loss, 2),
            'target_price': round(target_price, 2),
            'risk_reward_ratio': round(risk_reward, 2),
            'confidence_score': confidence,
            'timeframe': '5-15min',
            'analysis': f"Mean reversion signal based on RSI {latest['RSI']:.1f} and Bollinger Band position",
            'tier_access': 'BASIC'
        }
    
    def create_momentum_signal(self, symbol: str, data: pd.DataFrame, latest: pd.Series) -> Dict:
        """Create momentum breakout signal"""
        action = 'BUY'  # Momentum signals are typically bullish
        entry_price = latest['Close']
        stop_loss = latest['EMA_20'] * 0.97
        target_price = entry_price * 1.08  # 8% target
        
        risk_reward = abs(target_price - entry_price) / abs(entry_price - stop_loss)
        
        if risk_reward < self.min_risk_reward:
            return None
        
        confidence = self.calculate_confidence_score(data, 'MOMENTUM')
        
        return {
            'signal_id': f"MOM_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M')}",
            'symbol': symbol,
            'asset_class': self.get_asset_class(symbol),
            'signal_type': 'INTRADAY',
            'action': action,
            'entry_price': round(entry_price, 2),
            'stop_loss': round(stop_loss, 2),
            'target_price': round(target_price, 2),
            'risk_reward_ratio': round(risk_reward, 2),
            'confidence_score': confidence,
            'timeframe': '15-30min',
            'analysis': f"Momentum breakout above resistance with MACD bullish crossover",
            'tier_access': 'PRO'
        }
    
    def create_scalping_signal(self, symbol: str, data: pd.DataFrame, latest: pd.Series) -> Dict:
        """Create scalping signal"""
        action = 'BUY' if latest['RSI'] < 50 else 'SELL'
        entry_price = latest['Close']
        
        # Tight stops for scalping
        stop_loss = entry_price * 0.995 if action == 'BUY' else entry_price * 1.005
        target_price = entry_price * 1.01 if action == 'BUY' else entry_price * 0.99
        
        risk_reward = abs(target_price - entry_price) / abs(entry_price - stop_loss)
        confidence = self.calculate_confidence_score(data, 'SCALPING')
        
        return {
            'signal_id': f"SCALP_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M')}",
            'symbol': symbol,
            'asset_class': self.get_asset_class(symbol),
            'signal_type': 'SCALPING',
            'action': action,
            'entry_price': round(entry_price, 2),
            'stop_loss': round(stop_loss, 2),
            'target_price': round(target_price, 2),
            'risk_reward_ratio': round(risk_reward, 2),
            'confidence_score': confidence,
            'timeframe': '5min',
            'analysis': f"Quick scalp based on RSI {latest['RSI']:.1f} and EMA proximity",
            'tier_access': 'ENTERPRISE'
        }
    
    def create_trend_signal(self, symbol: str, data: pd.DataFrame) -> Dict:
        """Create trend following signal"""
        latest = data.iloc[-1]
        action = 'BUY'
        entry_price = latest['Close']
        stop_loss = latest['EMA_26'] * 0.95
        target_price = entry_price * 1.15  # 15% target for swing trades
        
        risk_reward = abs(target_price - entry_price) / abs(entry_price - stop_loss)
        confidence = self.calculate_confidence_score(data, 'TREND')
        
        return {
            'signal_id': f"TREND_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M')}",
            'symbol': symbol,
            'asset_class': self.get_asset_class(symbol),
            'signal_type': 'SWING',
            'action': action,
            'entry_price': round(entry_price, 2),
            'stop_loss': round(stop_loss, 2),
            'target_price': round(target_price, 2),
            'risk_reward_ratio': round(risk_reward, 2),
            'confidence_score': confidence,
            'timeframe': '1-5 days',
            'analysis': f"Trend continuation with EMA alignment and MACD positive",
            'tier_access': 'BASIC'
        }
    
    def create_sr_signal(self, symbol: str, data: pd.DataFrame) -> Dict:
        """Create support/resistance signal"""
        latest = data.iloc[-1]
        
        # Determine if bouncing off support or resistance
        if abs(latest['Close'] - latest['Support']) < abs(latest['Close'] - latest['Resistance']):
            action = 'BUY'
            entry_price = latest['Close']
            stop_loss = latest['Support'] * 0.97
            target_price = (latest['Resistance'] + latest['Support']) / 2
        else:
            action = 'SELL'
            entry_price = latest['Close']
            stop_loss = latest['Resistance'] * 1.03
            target_price = (latest['Resistance'] + latest['Support']) / 2
        
        risk_reward = abs(target_price - entry_price) / abs(entry_price - stop_loss)
        confidence = self.calculate_confidence_score(data, 'SUPPORT_RESISTANCE')
        
        return {
            'signal_id': f"SR_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M')}",
            'symbol': symbol,
            'asset_class': self.get_asset_class(symbol),
            'signal_type': 'SWING',
            'action': action,
            'entry_price': round(entry_price, 2),
            'stop_loss': round(stop_loss, 2),
            'target_price': round(target_price, 2),
            'risk_reward_ratio': round(risk_reward, 2),
            'confidence_score': confidence,
            'timeframe': '2-7 days',
            'analysis': f"Support/Resistance play with RSI {latest['RSI']:.1f}",
            'tier_access': 'PRO'
        }
    
    def create_investment_signal(self, symbol: str, data: pd.DataFrame, signal_subtype: str) -> Dict:
        """Create investment signal"""
        latest = data.iloc[-1]
        action = 'BUY'
        entry_price = latest['Close']
        stop_loss = data['Close'].iloc[-60:].min() * 0.95  # 3-month low with buffer
        
        if signal_subtype == 'VALUE_BUY':
            target_price = data['Close'].iloc[-120:].mean() * 1.2  # 20% above 6-month average
        else:  # GROWTH_BUY
            target_price = entry_price * 1.3  # 30% target for growth
        
        risk_reward = abs(target_price - entry_price) / abs(entry_price - stop_loss)
        confidence = self.calculate_confidence_score(data, signal_subtype)
        
        return {
            'signal_id': f"INV_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M')}",
            'symbol': symbol,
            'asset_class': self.get_asset_class(symbol),
            'signal_type': 'INVESTMENT',
            'action': action,
            'entry_price': round(entry_price, 2),
            'stop_loss': round(stop_loss, 2),
            'target_price': round(target_price, 2),
            'risk_reward_ratio': round(risk_reward, 2),
            'confidence_score': confidence,
            'timeframe': 'weeks-months',
            'analysis': f"{signal_subtype} opportunity with fundamental and technical alignment",
            'tier_access': 'PRO'
        }
    
    def calculate_confidence_score(self, data: pd.DataFrame, strategy_type: str) -> int:
        """Calculate confidence score (1-10) based on multiple factors"""
        score = 5  # Base score
        latest = data.iloc[-1]
        
        # Volume factor
        if latest['Volume'] > latest['Volume_SMA'] * 1.5:
            score += 1
        elif latest['Volume'] < latest['Volume_SMA'] * 0.7:
            score -= 1
        
        # Volatility factor
        volatility = data['Close'].pct_change().std()
        if 0.01 < volatility < 0.03:  # Optimal volatility range
            score += 1
        elif volatility > 0.05:  # Too volatile
            score -= 1
        
        # Technical alignment
        technical_score = 0
        if latest['RSI'] > 30 and latest['RSI'] < 70:
            technical_score += 1
        if latest['MACD'] > latest['MACD_signal']:
            technical_score += 1
        if latest['Close'] > latest['EMA_12']:
            technical_score += 1
        
        score += technical_score - 1  # Adjust based on technical alignment
        
        # Strategy-specific adjustments
        if strategy_type == 'MOMENTUM':
            if latest['Volume'] > latest['Volume_SMA'] * 2:
                score += 1
        elif strategy_type == 'MEAN_REVERSION':
            if latest['RSI'] < 25 or latest['RSI'] > 75:
                score += 1
        elif strategy_type == 'SCALPING':
            if abs(latest['Close'] - latest['EMA_12']) / latest['Close'] < 0.001:
                score += 1
        
        return max(1, min(10, score))
    
    def get_asset_class(self, symbol: str) -> str:
        """Determine asset class from symbol"""
        if symbol.endswith('.NS'):
            return 'INDIAN_EQUITY'
        elif symbol in self.crypto_symbols:
            return 'CRYPTO'
        elif '=X' in symbol:
            return 'FOREX'
        else:
            return 'US_EQUITY'
    
    def store_signal(self, signal: Dict):
        """Store signal in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT OR REPLACE INTO signals 
        (signal_id, symbol, asset_class, signal_type, action, entry_price,
         stop_loss, target_price, risk_reward_ratio, confidence_score,
         timeframe, analysis, tier_access)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            signal['signal_id'], signal['symbol'], signal['asset_class'],
            signal['signal_type'], signal['action'], signal['entry_price'],
            signal['stop_loss'], signal['target_price'], signal['risk_reward_ratio'],
            signal['confidence_score'], signal['timeframe'], signal['analysis'],
            signal['tier_access']
        ))
        
        conn.commit()
        conn.close()
    
    async def generate_all_signals(self) -> List[Dict]:
        """Generate signals for all asset classes"""
        all_signals = []
        
        # Combine all symbols
        all_symbols = (self.indian_stocks[:10] +  # Limit for performance
                      self.us_stocks[:8] +
                      self.crypto_symbols[:5] +
                      self.forex_pairs[:3])
        
        for symbol in all_symbols:
            try:
                # Fetch intraday data
                intraday_data = self.fetch_market_data(symbol, period='2d', interval='5m')
                if not intraday_data.empty:
                    intraday_signals = self.generate_intraday_signals(symbol, intraday_data)
                    all_signals.extend(intraday_signals)
                
                # Fetch swing data
                swing_data = self.fetch_market_data(symbol, period='30d', interval='1h')
                if not swing_data.empty:
                    swing_signals = self.generate_swing_signals(symbol, swing_data)
                    all_signals.extend(swing_signals)
                
                # Generate investment signals (less frequent)
                if datetime.now().hour == 9:  # Only at market open
                    investment_signals = self.generate_investment_signals(symbol, swing_data)
                    all_signals.extend(investment_signals)
                
            except Exception as e:
                print(f"Error generating signals for {symbol}: {e}")
                continue
        
        # Filter and rank signals
        filtered_signals = []
        for signal in all_signals:
            if (signal['confidence_score'] >= self.min_confidence and
                signal['risk_reward_ratio'] >= self.min_risk_reward):
                filtered_signals.append(signal)
        
        # Sort by confidence score and limit daily signals
        filtered_signals.sort(key=lambda x: x['confidence_score'], reverse=True)
        final_signals = filtered_signals[:self.max_signals_per_day]
        
        # Store signals in database
        for signal in final_signals:
            self.store_signal(signal)
        
        return final_signals
    
    def get_signals_by_tier(self, tier: str) -> List[Dict]:
        """Get signals accessible by subscription tier"""
        conn = sqlite3.connect(self.db_path)
        
        tier_hierarchy = {
            'BASIC': ['BASIC'],
            'PRO': ['BASIC', 'PRO'],
            'ENTERPRISE': ['BASIC', 'PRO', 'ENTERPRISE']
        }
        
        accessible_tiers = tier_hierarchy.get(tier, ['BASIC'])
        placeholders = ','.join(['?' for _ in accessible_tiers])
        
        query = f'''
        SELECT * FROM signals 
        WHERE tier_access IN ({placeholders})
        AND status = 'ACTIVE'
        AND DATE(timestamp) = DATE('now')
        ORDER BY confidence_score DESC
        '''
        
        df = pd.read_sql_query(query, conn, params=accessible_tiers)
        conn.close()
        
        return df.to_dict('records')
    
    def update_signal_exit(self, signal_id: str, exit_price: float):
        """Update signal with exit information"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get signal details
        cursor.execute('SELECT * FROM signals WHERE signal_id = ?', (signal_id,))
        signal = cursor.fetchone()
        
        if signal:
            entry_price = signal[6]  # entry_price column
            action = signal[5]       # action column
            
            # Calculate P&L
            if action == 'BUY':
                pnl_percentage = ((exit_price - entry_price) / entry_price) * 100
            else:
                pnl_percentage = ((entry_price - exit_price) / entry_price) * 100
            
            cursor.execute('''
            UPDATE signals SET 
            exit_price = ?, 
            exit_timestamp = CURRENT_TIMESTAMP,
            pnl_percentage = ?,
            status = 'CLOSED'
            WHERE signal_id = ?
            ''', (exit_price, pnl_percentage, signal_id))
            
            conn.commit()
        
        conn.close()

if __name__ == "__main__":
    # Initialize signal engine
    engine = PremiumSignalEngine()
    
    # Generate signals
    import asyncio
    signals = asyncio.run(engine.generate_all_signals())
    
    print(f"Generated {len(signals)} premium signals")
    for signal in signals[:5]:  # Show first 5 signals
        print(f"\n{signal['signal_id']}: {signal['symbol']} {signal['action']}")
        print(f"Entry: {signal['entry_price']}, Target: {signal['target_price']}")
        print(f"Confidence: {signal['confidence_score']}/10, R:R = {signal['risk_reward_ratio']}")
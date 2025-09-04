#!/usr/bin/env python3
"""
Technical Analysis Agent - Advanced market analysis using technical indicators
Provides trading signals, pattern recognition, and market predictions
"""

import asyncio
import json
import logging
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
import yfinance as yf
from dataclasses import dataclass
import talib
import warnings
warnings.filterwarnings('ignore')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class TechnicalSignal:
    """Technical analysis signal"""
    symbol: str
    indicator: str
    signal: str  # BUY, SELL, HOLD
    strength: float  # 0-100
    price: float
    target: float
    stop_loss: float
    confidence: float
    timestamp: datetime
    metadata: Dict

class TechnicalAnalysisAgent:
    """Advanced technical analysis for Indian markets"""
    
    def __init__(self):
        self.db_path = "data/technical_analysis.db"
        self.init_database()
        self.watchlist = [
            "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
            "HINDUNILVR.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "BAJFINANCE.NS",
            "ASIANPAINT.NS", "MARUTI.NS", "AXISBANK.NS", "LT.NS", "WIPRO.NS",
            "HCLTECH.NS", "ULTRACEMCO.NS", "TITAN.NS", "NESTLEIND.NS", "KOTAKBANK.NS"
        ]
        self.indices = ["^NSEI", "^BSESN", "^NSEBANK"]
        
    def init_database(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Technical signals table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS technical_signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                indicator TEXT NOT NULL,
                signal TEXT NOT NULL,
                strength REAL,
                price REAL,
                target REAL,
                stop_loss REAL,
                confidence REAL,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Market patterns table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS market_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                pattern_name TEXT NOT NULL,
                pattern_type TEXT,
                confirmation_level REAL,
                expected_move REAL,
                time_horizon TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Backtesting results table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS backtest_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                strategy_name TEXT NOT NULL,
                symbol TEXT NOT NULL,
                total_return REAL,
                win_rate REAL,
                sharpe_ratio REAL,
                max_drawdown REAL,
                trades_count INTEGER,
                period TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
        
    async def analyze_stock(self, symbol: str) -> Dict:
        """Comprehensive technical analysis for a stock"""
        try:
            # Fetch historical data
            stock = yf.Ticker(symbol)
            df = stock.history(period="6mo")
            
            if df.empty:
                return None
                
            # Calculate technical indicators
            indicators = await self.calculate_indicators(df)
            
            # Identify chart patterns
            patterns = await self.identify_patterns(df)
            
            # Generate trading signals
            signals = await self.generate_signals(symbol, df, indicators)
            
            # Calculate support and resistance levels
            levels = await self.calculate_support_resistance(df)
            
            # Trend analysis
            trend = await self.analyze_trend(df, indicators)
            
            # Volume analysis
            volume_analysis = await self.analyze_volume(df)
            
            # Risk metrics
            risk_metrics = await self.calculate_risk_metrics(df)
            
            analysis = {
                "symbol": symbol,
                "current_price": float(df['Close'].iloc[-1]),
                "indicators": indicators,
                "patterns": patterns,
                "signals": signals,
                "support_resistance": levels,
                "trend": trend,
                "volume_analysis": volume_analysis,
                "risk_metrics": risk_metrics,
                "timestamp": datetime.now().isoformat()
            }
            
            # Store analysis in database
            await self.store_analysis(analysis)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing {symbol}: {e}")
            return None
            
    async def calculate_indicators(self, df: pd.DataFrame) -> Dict:
        """Calculate technical indicators"""
        close = df['Close'].values
        high = df['High'].values
        low = df['Low'].values
        volume = df['Volume'].values
        
        indicators = {}
        
        # Moving averages
        indicators['SMA_20'] = float(talib.SMA(close, timeperiod=20)[-1])
        indicators['SMA_50'] = float(talib.SMA(close, timeperiod=50)[-1])
        indicators['SMA_200'] = float(talib.SMA(close, timeperiod=200)[-1]) if len(close) >= 200 else None
        indicators['EMA_20'] = float(talib.EMA(close, timeperiod=20)[-1])
        
        # RSI
        rsi = talib.RSI(close, timeperiod=14)
        indicators['RSI'] = float(rsi[-1])
        indicators['RSI_signal'] = self.interpret_rsi(rsi[-1])
        
        # MACD
        macd, macd_signal, macd_hist = talib.MACD(close)
        indicators['MACD'] = float(macd[-1])
        indicators['MACD_signal'] = float(macd_signal[-1])
        indicators['MACD_histogram'] = float(macd_hist[-1])
        indicators['MACD_crossover'] = self.check_macd_crossover(macd, macd_signal)
        
        # Bollinger Bands
        upper, middle, lower = talib.BBANDS(close, timeperiod=20)
        indicators['BB_upper'] = float(upper[-1])
        indicators['BB_middle'] = float(middle[-1])
        indicators['BB_lower'] = float(lower[-1])
        indicators['BB_signal'] = self.interpret_bollinger(close[-1], upper[-1], lower[-1])
        
        # Stochastic
        slowk, slowd = talib.STOCH(high, low, close)
        indicators['STOCH_K'] = float(slowk[-1])
        indicators['STOCH_D'] = float(slowd[-1])
        
        # ATR (Average True Range)
        indicators['ATR'] = float(talib.ATR(high, low, close, timeperiod=14)[-1])
        
        # ADX (Average Directional Index)
        indicators['ADX'] = float(talib.ADX(high, low, close, timeperiod=14)[-1])
        
        # OBV (On Balance Volume)
        indicators['OBV'] = float(talib.OBV(close, volume)[-1])
        
        # Fibonacci retracement levels
        indicators['fibonacci'] = self.calculate_fibonacci(high, low)
        
        return indicators
        
    async def identify_patterns(self, df: pd.DataFrame) -> List[Dict]:
        """Identify chart patterns"""
        patterns = []
        close = df['Close'].values
        high = df['High'].values
        low = df['Low'].values
        
        # Candlestick patterns
        candle_patterns = {
            'HAMMER': talib.CDLHAMMER(df['Open'], high, low, close),
            'DOJI': talib.CDLDOJI(df['Open'], high, low, close),
            'ENGULFING': talib.CDLENGULFING(df['Open'], high, low, close),
            'MORNING_STAR': talib.CDLMORNINGSTAR(df['Open'], high, low, close),
            'EVENING_STAR': talib.CDLEVENINGSTAR(df['Open'], high, low, close),
            'THREE_WHITE_SOLDIERS': talib.CDL3WHITESOLDIERS(df['Open'], high, low, close),
            'THREE_BLACK_CROWS': talib.CDL3BLACKCROWS(df['Open'], high, low, close)
        }
        
        for pattern_name, pattern_data in candle_patterns.items():
            if pattern_data[-1] != 0:
                patterns.append({
                    'type': 'candlestick',
                    'name': pattern_name,
                    'signal': 'BULLISH' if pattern_data[-1] > 0 else 'BEARISH',
                    'strength': abs(pattern_data[-1])
                })
                
        # Chart patterns (simplified detection)
        # Head and Shoulders
        if await self.detect_head_shoulders(df):
            patterns.append({
                'type': 'chart',
                'name': 'HEAD_AND_SHOULDERS',
                'signal': 'BEARISH',
                'strength': 80
            })
            
        # Double Top/Bottom
        double_pattern = await self.detect_double_pattern(df)
        if double_pattern:
            patterns.append(double_pattern)
            
        # Triangle patterns
        triangle = await self.detect_triangle(df)
        if triangle:
            patterns.append(triangle)
            
        return patterns
        
    async def generate_signals(self, symbol: str, df: pd.DataFrame, indicators: Dict) -> List[Dict]:
        """Generate trading signals based on multiple indicators"""
        signals = []
        current_price = float(df['Close'].iloc[-1])
        
        # RSI Signal
        if indicators['RSI'] < 30:
            signals.append({
                'type': 'RSI_OVERSOLD',
                'action': 'BUY',
                'strength': min(100, (30 - indicators['RSI']) * 3),
                'target': current_price * 1.05,
                'stop_loss': current_price * 0.97
            })
        elif indicators['RSI'] > 70:
            signals.append({
                'type': 'RSI_OVERBOUGHT',
                'action': 'SELL',
                'strength': min(100, (indicators['RSI'] - 70) * 3),
                'target': current_price * 0.95,
                'stop_loss': current_price * 1.03
            })
            
        # MACD Signal
        if indicators['MACD_crossover'] == 'BULLISH':
            signals.append({
                'type': 'MACD_BULLISH_CROSSOVER',
                'action': 'BUY',
                'strength': 75,
                'target': current_price * 1.08,
                'stop_loss': current_price * 0.96
            })
        elif indicators['MACD_crossover'] == 'BEARISH':
            signals.append({
                'type': 'MACD_BEARISH_CROSSOVER',
                'action': 'SELL',
                'strength': 75,
                'target': current_price * 0.92,
                'stop_loss': current_price * 1.04
            })
            
        # Moving Average Signals
        if current_price > indicators['SMA_50'] > indicators['SMA_200'] if indicators['SMA_200'] else True:
            signals.append({
                'type': 'GOLDEN_CROSS_TREND',
                'action': 'BUY',
                'strength': 85,
                'target': current_price * 1.10,
                'stop_loss': indicators['SMA_50']
            })
            
        # Bollinger Band Signal
        if indicators['BB_signal'] == 'OVERSOLD':
            signals.append({
                'type': 'BB_SQUEEZE',
                'action': 'BUY',
                'strength': 65,
                'target': indicators['BB_middle'],
                'stop_loss': indicators['BB_lower'] * 0.98
            })
            
        # Store signals in database
        for signal in signals:
            await self.store_signal(symbol, signal)
            
        return signals
        
    async def calculate_support_resistance(self, df: pd.DataFrame) -> Dict:
        """Calculate support and resistance levels"""
        close = df['Close'].values
        high = df['High'].values
        low = df['Low'].values
        
        # Pivot points
        pivot = (high[-1] + low[-1] + close[-1]) / 3
        r1 = 2 * pivot - low[-1]
        r2 = pivot + (high[-1] - low[-1])
        s1 = 2 * pivot - high[-1]
        s2 = pivot - (high[-1] - low[-1])
        
        # Historical support/resistance
        recent_highs = []
        recent_lows = []
        
        for i in range(len(close) - 20, len(close)):
            if i > 0 and i < len(close) - 1:
                if high[i] > high[i-1] and high[i] > high[i+1]:
                    recent_highs.append(high[i])
                if low[i] < low[i-1] and low[i] < low[i+1]:
                    recent_lows.append(low[i])
                    
        return {
            'pivot': pivot,
            'resistance_1': r1,
            'resistance_2': r2,
            'support_1': s1,
            'support_2': s2,
            'historical_resistance': sorted(recent_highs)[-3:] if recent_highs else [],
            'historical_support': sorted(recent_lows)[:3] if recent_lows else []
        }
        
    async def analyze_trend(self, df: pd.DataFrame, indicators: Dict) -> Dict:
        """Analyze market trend"""
        close = df['Close'].values
        
        # Calculate trend strength
        adx = indicators['ADX']
        trend_strength = 'STRONG' if adx > 25 else 'WEAK' if adx < 20 else 'MODERATE'
        
        # Determine trend direction
        sma_20 = indicators['SMA_20']
        sma_50 = indicators['SMA_50']
        current_price = close[-1]
        
        if current_price > sma_20 > sma_50:
            trend_direction = 'UPTREND'
        elif current_price < sma_20 < sma_50:
            trend_direction = 'DOWNTREND'
        else:
            trend_direction = 'SIDEWAYS'
            
        # Calculate trend momentum
        momentum = ((close[-1] - close[-20]) / close[-20]) * 100
        
        return {
            'direction': trend_direction,
            'strength': trend_strength,
            'momentum': momentum,
            'adx': adx,
            'trend_score': self.calculate_trend_score(trend_direction, trend_strength, momentum)
        }
        
    async def analyze_volume(self, df: pd.DataFrame) -> Dict:
        """Analyze volume patterns"""
        volume = df['Volume'].values
        close = df['Close'].values
        
        # Volume moving average
        volume_ma = np.mean(volume[-20:])
        current_volume = volume[-1]
        volume_ratio = current_volume / volume_ma
        
        # Volume trend
        volume_trend = 'INCREASING' if volume[-1] > volume[-5] > volume[-10] else 'DECREASING'
        
        # Price-volume analysis
        if close[-1] > close[-2] and volume[-1] > volume_ma:
            pv_signal = 'BULLISH_CONFIRMATION'
        elif close[-1] < close[-2] and volume[-1] > volume_ma:
            pv_signal = 'BEARISH_CONFIRMATION'
        else:
            pv_signal = 'NEUTRAL'
            
        return {
            'current_volume': current_volume,
            'average_volume': volume_ma,
            'volume_ratio': volume_ratio,
            'volume_trend': volume_trend,
            'price_volume_signal': pv_signal,
            'unusual_activity': volume_ratio > 1.5
        }
        
    async def calculate_risk_metrics(self, df: pd.DataFrame) -> Dict:
        """Calculate risk metrics"""
        returns = df['Close'].pct_change().dropna()
        
        # Volatility
        volatility = returns.std() * np.sqrt(252)  # Annualized
        
        # Beta (simplified - against NIFTY)
        # Would need market returns for accurate beta
        beta = 1.0  # Placeholder
        
        # Value at Risk (VaR) - 95% confidence
        var_95 = np.percentile(returns, 5)
        
        # Maximum drawdown
        cumulative_returns = (1 + returns).cumprod()
        running_max = cumulative_returns.expanding().max()
        drawdown = (cumulative_returns - running_max) / running_max
        max_drawdown = drawdown.min()
        
        # Sharpe ratio (simplified)
        risk_free_rate = 0.06  # 6% annual
        excess_returns = returns.mean() * 252 - risk_free_rate
        sharpe_ratio = excess_returns / volatility if volatility > 0 else 0
        
        return {
            'volatility': volatility,
            'beta': beta,
            'var_95': var_95,
            'max_drawdown': max_drawdown,
            'sharpe_ratio': sharpe_ratio,
            'risk_score': self.calculate_risk_score(volatility, max_drawdown, sharpe_ratio)
        }
        
    def interpret_rsi(self, rsi: float) -> str:
        """Interpret RSI value"""
        if rsi < 30:
            return 'OVERSOLD'
        elif rsi > 70:
            return 'OVERBOUGHT'
        else:
            return 'NEUTRAL'
            
    def check_macd_crossover(self, macd: np.ndarray, signal: np.ndarray) -> str:
        """Check for MACD crossover"""
        if len(macd) < 2 or len(signal) < 2:
            return 'NEUTRAL'
            
        if macd[-1] > signal[-1] and macd[-2] <= signal[-2]:
            return 'BULLISH'
        elif macd[-1] < signal[-1] and macd[-2] >= signal[-2]:
            return 'BEARISH'
        else:
            return 'NEUTRAL'
            
    def interpret_bollinger(self, price: float, upper: float, lower: float) -> str:
        """Interpret Bollinger Bands"""
        if price > upper:
            return 'OVERBOUGHT'
        elif price < lower:
            return 'OVERSOLD'
        else:
            return 'NEUTRAL'
            
    def calculate_fibonacci(self, high: np.ndarray, low: np.ndarray) -> Dict:
        """Calculate Fibonacci retracement levels"""
        max_price = high.max()
        min_price = low.min()
        diff = max_price - min_price
        
        return {
            'level_0': min_price,
            'level_236': min_price + 0.236 * diff,
            'level_382': min_price + 0.382 * diff,
            'level_500': min_price + 0.500 * diff,
            'level_618': min_price + 0.618 * diff,
            'level_786': min_price + 0.786 * diff,
            'level_100': max_price
        }
        
    async def detect_head_shoulders(self, df: pd.DataFrame) -> bool:
        """Detect head and shoulders pattern (simplified)"""
        # Simplified detection logic
        # In production, use more sophisticated pattern recognition
        return False
        
    async def detect_double_pattern(self, df: pd.DataFrame) -> Optional[Dict]:
        """Detect double top/bottom pattern"""
        # Simplified detection
        return None
        
    async def detect_triangle(self, df: pd.DataFrame) -> Optional[Dict]:
        """Detect triangle patterns"""
        # Simplified detection
        return None
        
    def calculate_trend_score(self, direction: str, strength: str, momentum: float) -> float:
        """Calculate overall trend score"""
        direction_score = {'UPTREND': 1, 'SIDEWAYS': 0, 'DOWNTREND': -1}[direction]
        strength_score = {'STRONG': 1, 'MODERATE': 0.5, 'WEAK': 0.25}[strength]
        momentum_score = min(1, abs(momentum) / 10)
        
        return (direction_score * strength_score * momentum_score) * 100
        
    def calculate_risk_score(self, volatility: float, drawdown: float, sharpe: float) -> float:
        """Calculate overall risk score (0-100, lower is better)"""
        vol_score = min(100, volatility * 100)
        dd_score = min(100, abs(drawdown) * 100)
        sharpe_score = max(0, 100 - sharpe * 20) if sharpe > 0 else 100
        
        return (vol_score + dd_score + sharpe_score) / 3
        
    async def store_analysis(self, analysis: Dict):
        """Store analysis in database"""
        # Implementation for storing comprehensive analysis
        pass
        
    async def store_signal(self, symbol: str, signal: Dict):
        """Store trading signal in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO technical_signals 
            (symbol, indicator, signal, strength, price, target, stop_loss, confidence, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            symbol,
            signal['type'],
            signal['action'],
            signal['strength'],
            signal.get('price', 0),
            signal['target'],
            signal['stop_loss'],
            signal.get('confidence', signal['strength']),
            json.dumps(signal)
        ))
        
        conn.commit()
        conn.close()
        
    async def run_continuous_analysis(self):
        """Run continuous technical analysis"""
        logger.info("Starting Technical Analysis Agent...")
        
        while True:
            try:
                # Analyze all stocks in watchlist
                for symbol in self.watchlist:
                    analysis = await self.analyze_stock(symbol)
                    if analysis:
                        logger.info(f"Analyzed {symbol}: {analysis['trend']['direction']}")
                        
                # Analyze indices
                for index in self.indices:
                    analysis = await self.analyze_stock(index)
                    if analysis:
                        logger.info(f"Index {index}: {analysis['trend']['direction']}")
                        
                # Wait before next cycle
                await asyncio.sleep(300)  # 5 minutes
                
            except Exception as e:
                logger.error(f"Error in continuous analysis: {e}")
                await asyncio.sleep(60)

if __name__ == "__main__":
    agent = TechnicalAnalysisAgent()
    asyncio.run(agent.run_continuous_analysis())
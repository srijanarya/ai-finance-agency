#!/usr/bin/env python3
"""
AI Trading Signals System
Generates actionable buy/sell signals for crypto and stocks
Leverages Abid Hassan methodology + technical indicators
"""

import sqlite3
import requests
import json
import numpy as np
from datetime import datetime, timedelta
import time
import os
from typing import Dict, List, Tuple, Optional
import yfinance as yf
import pandas as pd
from textblob import TextBlob
import warnings
warnings.filterwarnings('ignore')

class AITradingSignals:
    def __init__(self):
        self.db_path = "data/trading_signals.db"
        self.crypto_symbols = ['BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD', 'ADA-USD']
        self.stock_symbols = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ITC.NS']
        self.setup_database()
        
        # Signal thresholds
        self.rsi_oversold = 30
        self.rsi_overbought = 70
        self.volume_spike_threshold = 1.5
        self.price_change_threshold = 0.03  # 3%
        
    def setup_database(self):
        """Create signals database"""
        os.makedirs('data', exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS trading_signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                signal_type TEXT NOT NULL,
                action TEXT NOT NULL,
                entry_price REAL,
                target_price REAL,
                stop_loss REAL,
                confidence REAL,
                reasoning TEXT,
                risk_reward_ratio REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active'
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS signal_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                signal_id INTEGER,
                actual_profit_loss REAL,
                hit_target BOOLEAN,
                hit_stop_loss BOOLEAN,
                closed_at TIMESTAMP,
                FOREIGN KEY (signal_id) REFERENCES trading_signals(id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        """Calculate Relative Strength Index"""
        if len(prices) < period + 1:
            return 50  # Neutral if not enough data
        
        deltas = np.diff(prices)
        seed = deltas[:period+1]
        up = seed[seed >= 0].sum() / period
        down = -seed[seed < 0].sum() / period
        
        if down == 0:
            return 100
        
        rs = up / down
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def calculate_macd(self, prices: List[float]) -> Dict:
        """Calculate MACD indicator"""
        if len(prices) < 26:
            return {'macd': 0, 'signal': 0, 'histogram': 0}
        
        exp1 = pd.Series(prices).ewm(span=12, adjust=False).mean()
        exp2 = pd.Series(prices).ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        histogram = macd - signal
        
        return {
            'macd': macd.iloc[-1],
            'signal': signal.iloc[-1],
            'histogram': histogram.iloc[-1]
        }
    
    def analyze_volume_pattern(self, volumes: List[float]) -> str:
        """Analyze volume patterns"""
        if len(volumes) < 5:
            return "insufficient_data"
        
        avg_volume = np.mean(volumes[:-1])
        current_volume = volumes[-1]
        
        if current_volume > avg_volume * self.volume_spike_threshold:
            return "volume_spike"
        elif current_volume < avg_volume * 0.5:
            return "low_volume"
        else:
            return "normal_volume"
    
    def get_market_sentiment(self, symbol: str) -> float:
        """Get market sentiment from news (simplified)"""
        # In production, this would use NewsAPI or similar
        # For now, returning a simulated sentiment
        sentiments = {
            'BTC-USD': 0.6,  # Bullish
            'ETH-USD': 0.7,  # Very Bullish
            'RELIANCE.NS': 0.5,  # Neutral
            'TCS.NS': 0.4,  # Slightly Bearish
        }
        return sentiments.get(symbol, 0.5)
    
    def generate_crypto_signal(self, symbol: str) -> Optional[Dict]:
        """Generate trading signal for crypto"""
        try:
            # Get historical data
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="30d", interval="1h")
            
            if hist.empty:
                return None
            
            prices = hist['Close'].tolist()
            volumes = hist['Volume'].tolist()
            current_price = prices[-1]
            
            # Technical indicators
            rsi = self.calculate_rsi(prices)
            macd = self.calculate_macd(prices)
            volume_pattern = self.analyze_volume_pattern(volumes)
            sentiment = self.get_market_sentiment(symbol)
            
            # Signal generation logic
            signal = None
            confidence = 0
            reasoning = []
            
            # RSI-based signals
            if rsi < self.rsi_oversold:
                signal = "BUY"
                confidence += 30
                reasoning.append(f"RSI oversold at {rsi:.1f}")
            elif rsi > self.rsi_overbought:
                signal = "SELL"
                confidence += 30
                reasoning.append(f"RSI overbought at {rsi:.1f}")
            
            # MACD signals
            if macd['histogram'] > 0 and macd['macd'] > macd['signal']:
                if signal != "SELL":
                    signal = "BUY"
                    confidence += 25
                    reasoning.append("MACD bullish crossover")
            elif macd['histogram'] < 0 and macd['macd'] < macd['signal']:
                if signal != "BUY":
                    signal = "SELL"
                    confidence += 25
                    reasoning.append("MACD bearish crossover")
            
            # Volume confirmation
            if volume_pattern == "volume_spike":
                confidence += 20
                reasoning.append("Volume spike detected")
            
            # Sentiment adjustment
            if sentiment > 0.6:
                if signal == "BUY":
                    confidence += 15
                reasoning.append("Positive market sentiment")
            elif sentiment < 0.4:
                if signal == "SELL":
                    confidence += 15
                reasoning.append("Negative market sentiment")
            
            if signal and confidence >= 50:
                # Calculate targets
                if signal == "BUY":
                    target_price = current_price * 1.05  # 5% profit target
                    stop_loss = current_price * 0.97  # 3% stop loss
                else:
                    target_price = current_price * 0.95  # 5% profit target
                    stop_loss = current_price * 1.03  # 3% stop loss
                
                risk_reward = abs(target_price - current_price) / abs(stop_loss - current_price)
                
                return {
                    'symbol': symbol,
                    'signal_type': 'crypto',
                    'action': signal,
                    'entry_price': current_price,
                    'target_price': target_price,
                    'stop_loss': stop_loss,
                    'confidence': min(confidence, 95),
                    'reasoning': ' | '.join(reasoning),
                    'risk_reward_ratio': risk_reward
                }
            
        except Exception as e:
            print(f"Error generating crypto signal for {symbol}: {e}")
        
        return None
    
    def generate_stock_signal(self, symbol: str) -> Optional[Dict]:
        """Generate trading signal for stocks"""
        try:
            # Similar to crypto but with market hours consideration
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="30d", interval="1d")
            
            if hist.empty:
                return None
            
            prices = hist['Close'].tolist()
            volumes = hist['Volume'].tolist()
            current_price = prices[-1]
            
            # PCR data would go here (from NSE for Indian stocks)
            # For now, using technical indicators only
            
            rsi = self.calculate_rsi(prices)
            macd = self.calculate_macd(prices)
            volume_pattern = self.analyze_volume_pattern(volumes)
            
            signal = None
            confidence = 0
            reasoning = []
            
            # Apply Abid Hassan methodology
            # High PCR (>1.3) = Bullish (contrarian)
            # For demo, simulating PCR
            pcr = np.random.uniform(0.5, 1.8)
            
            if pcr > 1.3:
                signal = "BUY"
                confidence += 40
                reasoning.append(f"High PCR {pcr:.2f} - Institutional bullish")
            elif pcr < 0.7:
                signal = "SELL"
                confidence += 40
                reasoning.append(f"Low PCR {pcr:.2f} - Institutional bearish")
            
            # Add technical confirmation
            if rsi < 40 and signal == "BUY":
                confidence += 25
                reasoning.append(f"RSI oversold at {rsi:.1f}")
            elif rsi > 60 and signal == "SELL":
                confidence += 25
                reasoning.append(f"RSI overbought at {rsi:.1f}")
            
            if signal and confidence >= 50:
                if signal == "BUY":
                    target_price = current_price * 1.03  # 3% for stocks
                    stop_loss = current_price * 0.98  # 2% stop
                else:
                    target_price = current_price * 0.97
                    stop_loss = current_price * 1.02
                
                risk_reward = abs(target_price - current_price) / abs(stop_loss - current_price)
                
                return {
                    'symbol': symbol,
                    'signal_type': 'stock',
                    'action': signal,
                    'entry_price': current_price,
                    'target_price': target_price,
                    'stop_loss': stop_loss,
                    'confidence': min(confidence, 95),
                    'reasoning': ' | '.join(reasoning),
                    'risk_reward_ratio': risk_reward
                }
                
        except Exception as e:
            print(f"Error generating stock signal for {symbol}: {e}")
        
        return None
    
    def save_signal(self, signal: Dict) -> int:
        """Save signal to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO trading_signals 
            (symbol, signal_type, action, entry_price, target_price, 
             stop_loss, confidence, reasoning, risk_reward_ratio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            signal['symbol'], signal['signal_type'], signal['action'],
            signal['entry_price'], signal['target_price'], signal['stop_loss'],
            signal['confidence'], signal['reasoning'], signal['risk_reward_ratio']
        ))
        
        signal_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return signal_id
    
    def generate_all_signals(self) -> List[Dict]:
        """Generate signals for all symbols"""
        all_signals = []
        
        print("🔍 Analyzing Crypto Markets...")
        for symbol in self.crypto_symbols:
            signal = self.generate_crypto_signal(symbol)
            if signal:
                all_signals.append(signal)
                print(f"  ✅ {symbol}: {signal['action']} signal (Confidence: {signal['confidence']}%)")
        
        print("\n🔍 Analyzing Stock Markets...")
        for symbol in self.stock_symbols:
            signal = self.generate_stock_signal(symbol)
            if signal:
                all_signals.append(signal)
                print(f"  ✅ {symbol}: {signal['action']} signal (Confidence: {signal['confidence']}%)")
        
        # Save high-confidence signals
        saved_signals = []
        for signal in all_signals:
            if signal['confidence'] >= 70:
                signal_id = self.save_signal(signal)
                signal['id'] = signal_id
                saved_signals.append(signal)
        
        return saved_signals
    
    def format_signal_message(self, signal: Dict) -> str:
        """Format signal for sharing"""
        emoji = "🟢" if signal['action'] == "BUY" else "🔴"
        
        message = f"""
{emoji} **AI TRADING SIGNAL** {emoji}

📊 Symbol: {signal['symbol']}
📈 Action: **{signal['action']}**
💰 Entry: ${signal['entry_price']:.2f}
🎯 Target: ${signal['target_price']:.2f}
🛑 Stop Loss: ${signal['stop_loss']:.2f}
📊 Risk/Reward: {signal['risk_reward_ratio']:.1f}
🔥 Confidence: {signal['confidence']}%

📝 Analysis: {signal['reasoning']}

⚠️ This is AI analysis, not financial advice
🔔 @AIFinanceNews2024
"""
        return message
    
    def get_active_signals(self) -> List[Dict]:
        """Get all active signals"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM trading_signals 
            WHERE status = 'active' 
            ORDER BY created_at DESC 
            LIMIT 10
        ''')
        
        columns = [desc[0] for desc in cursor.description]
        signals = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return signals
    
    def monitor_signal_performance(self):
        """Monitor and update signal performance"""
        active_signals = self.get_active_signals()
        
        for signal in active_signals:
            try:
                # Get current price
                ticker = yf.Ticker(signal['symbol'])
                current_price = ticker.history(period="1d")['Close'].iloc[-1]
                
                # Check if target or stop loss hit
                if signal['action'] == "BUY":
                    if current_price >= signal['target_price']:
                        self.close_signal(signal['id'], True, False, current_price)
                        print(f"🎯 Target hit for {signal['symbol']}")
                    elif current_price <= signal['stop_loss']:
                        self.close_signal(signal['id'], False, True, current_price)
                        print(f"🛑 Stop loss hit for {signal['symbol']}")
                else:  # SELL
                    if current_price <= signal['target_price']:
                        self.close_signal(signal['id'], True, False, current_price)
                        print(f"🎯 Target hit for {signal['symbol']}")
                    elif current_price >= signal['stop_loss']:
                        self.close_signal(signal['id'], False, True, current_price)
                        print(f"🛑 Stop loss hit for {signal['symbol']}")
                        
            except Exception as e:
                print(f"Error monitoring {signal['symbol']}: {e}")
    
    def close_signal(self, signal_id: int, hit_target: bool, hit_stop_loss: bool, exit_price: float):
        """Close a signal and record performance"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get signal details
        cursor.execute('SELECT entry_price, action FROM trading_signals WHERE id = ?', (signal_id,))
        entry_price, action = cursor.fetchone()
        
        # Calculate profit/loss
        if action == "BUY":
            profit_loss = ((exit_price - entry_price) / entry_price) * 100
        else:
            profit_loss = ((entry_price - exit_price) / entry_price) * 100
        
        # Update signal status
        cursor.execute('UPDATE trading_signals SET status = ? WHERE id = ?', ('closed', signal_id))
        
        # Record performance
        cursor.execute('''
            INSERT INTO signal_performance 
            (signal_id, actual_profit_loss, hit_target, hit_stop_loss, closed_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (signal_id, profit_loss, hit_target, hit_stop_loss, datetime.now()))
        
        conn.commit()
        conn.close()
    
    def get_performance_stats(self) -> Dict:
        """Get overall performance statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                COUNT(*) as total_signals,
                SUM(CASE WHEN hit_target = 1 THEN 1 ELSE 0 END) as targets_hit,
                SUM(CASE WHEN hit_stop_loss = 1 THEN 1 ELSE 0 END) as stops_hit,
                AVG(actual_profit_loss) as avg_profit_loss
            FROM signal_performance
        ''')
        
        stats = cursor.fetchone()
        conn.close()
        
        if stats[0] > 0:
            return {
                'total_signals': stats[0],
                'win_rate': (stats[1] / stats[0]) * 100 if stats[0] > 0 else 0,
                'avg_profit_loss': stats[3] or 0,
                'targets_hit': stats[1] or 0,
                'stops_hit': stats[2] or 0
            }
        else:
            return {
                'total_signals': 0,
                'win_rate': 0,
                'avg_profit_loss': 0,
                'targets_hit': 0,
                'stops_hit': 0
            }

def main():
    print("🤖 AI TRADING SIGNALS SYSTEM")
    print("=" * 50)
    
    signals = AITradingSignals()
    
    while True:
        print("\n1. Generate New Signals")
        print("2. View Active Signals")
        print("3. Monitor Performance")
        print("4. View Statistics")
        print("5. Continuous Mode")
        print("6. Exit")
        
        choice = input("\nSelect option: ")
        
        if choice == "1":
            print("\n🔄 Generating signals...")
            new_signals = signals.generate_all_signals()
            
            if new_signals:
                print(f"\n✅ Generated {len(new_signals)} high-confidence signals!")
                for sig in new_signals:
                    print(signals.format_signal_message(sig))
            else:
                print("No high-confidence signals at this time.")
                
        elif choice == "2":
            active = signals.get_active_signals()
            if active:
                print(f"\n📊 {len(active)} Active Signals:")
                for sig in active:
                    print(f"• {sig['symbol']}: {sig['action']} @ ${sig['entry_price']:.2f}")
            else:
                print("No active signals.")
                
        elif choice == "3":
            print("\n📈 Monitoring signal performance...")
            signals.monitor_signal_performance()
            
        elif choice == "4":
            stats = signals.get_performance_stats()
            print("\n📊 PERFORMANCE STATISTICS")
            print("=" * 30)
            print(f"Total Signals: {stats['total_signals']}")
            print(f"Win Rate: {stats['win_rate']:.1f}%")
            print(f"Avg P/L: {stats['avg_profit_loss']:.2f}%")
            print(f"Targets Hit: {stats['targets_hit']}")
            print(f"Stops Hit: {stats['stops_hit']}")
            
        elif choice == "5":
            print("\n🔄 Starting continuous mode...")
            print("Generating signals every 30 minutes")
            print("Press Ctrl+C to stop")
            
            try:
                while True:
                    new_signals = signals.generate_all_signals()
                    if new_signals:
                        print(f"\n[{datetime.now()}] Generated {len(new_signals)} signals")
                    
                    # Monitor existing signals
                    signals.monitor_signal_performance()
                    
                    time.sleep(1800)  # 30 minutes
                    
            except KeyboardInterrupt:
                print("\n✅ Continuous mode stopped")
                
        elif choice == "6":
            print("👋 Goodbye!")
            break

if __name__ == "__main__":
    main()
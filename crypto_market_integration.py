#!/usr/bin/env python3
"""
CRYPTO MARKET INTEGRATION - Next Phase Enhancement
Adds Bitcoin, Ethereum, and major crypto alerts to AI Finance Agency
"""

import requests
import sqlite3
import json
import time
import logging
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

class CryptoMarketIntegration:
    """Advanced crypto market data integration"""
    
    def __init__(self):
        self.db_path = "/Users/srijan/ai-finance-agency/data/crypto_market.db"
        self.log_file = "/Users/srijan/ai-finance-agency/logs/crypto_integration.log"
        
        # Crypto API endpoints
        self.api_endpoints = {
            'coingecko': 'https://api.coingecko.com/api/v3',
            'coinmarketcap': 'https://pro-api.coinmarketcap.com/v1',  # Requires API key
            'binance': 'https://api.binance.com/api/v3'
        }
        
        # Major crypto symbols to track
        self.crypto_symbols = {
            'BTC': {'name': 'Bitcoin', 'threshold': 2.0},
            'ETH': {'name': 'Ethereum', 'threshold': 3.0}, 
            'BNB': {'name': 'Binance Coin', 'threshold': 5.0},
            'ADA': {'name': 'Cardano', 'threshold': 8.0},
            'DOT': {'name': 'Polkadot', 'threshold': 10.0},
            'SOL': {'name': 'Solana', 'threshold': 8.0},
            'MATIC': {'name': 'Polygon', 'threshold': 12.0},
            'AVAX': {'name': 'Avalanche', 'threshold': 15.0}
        }
        
        # Alert thresholds
        self.price_change_threshold = 5.0  # 5% change triggers alert
        self.volume_spike_threshold = 2.0  # 2x volume triggers alert
        
        self.setup_logging()
        self.setup_database()
    
    def setup_logging(self):
        """Setup logging configuration"""
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_database(self):
        """Initialize crypto database"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS crypto_prices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                symbol TEXT,
                price_usd REAL,
                price_inr REAL,
                market_cap REAL,
                volume_24h REAL,
                change_24h REAL,
                change_7d REAL
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS crypto_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                symbol TEXT,
                alert_type TEXT,
                price_usd REAL,
                change_percent REAL,
                message TEXT,
                sent BOOLEAN DEFAULT 0
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS crypto_content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                content_type TEXT,
                symbol TEXT,
                title TEXT,
                content TEXT,
                quality_score REAL,
                engagement_prediction REAL
            )
        """)
        
        conn.commit()
        conn.close()
    
    def fetch_crypto_data_coingecko(self, symbol: str) -> Optional[Dict]:
        """Fetch crypto data from CoinGecko API (Free)"""
        try:
            # Map symbol to CoinGecko ID
            symbol_map = {
                'BTC': 'bitcoin',
                'ETH': 'ethereum', 
                'BNB': 'binancecoin',
                'ADA': 'cardano',
                'DOT': 'polkadot',
                'SOL': 'solana',
                'MATIC': 'matic-network',
                'AVAX': 'avalanche-2'
            }
            
            coin_id = symbol_map.get(symbol.upper())
            if not coin_id:
                return None
            
            url = f"{self.api_endpoints['coingecko']}/simple/price"
            params = {
                'ids': coin_id,
                'vs_currencies': 'usd,inr',
                'include_24hr_change': 'true',
                'include_market_cap': 'true',
                'include_24hr_vol': 'true'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if coin_id not in data:
                return None
            
            coin_data = data[coin_id]
            
            return {
                'symbol': symbol.upper(),
                'price_usd': coin_data.get('usd', 0),
                'price_inr': coin_data.get('inr', 0),
                'market_cap': coin_data.get('usd_market_cap', 0),
                'volume_24h': coin_data.get('usd_24h_vol', 0),
                'change_24h': coin_data.get('usd_24h_change', 0),
                'change_7d': 0,  # Not available in simple API
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error fetching {symbol} from CoinGecko: {e}")
            return None
    
    def fetch_crypto_data_binance(self, symbol: str) -> Optional[Dict]:
        """Fetch crypto data from Binance API (Backup)"""
        try:
            # Get 24h ticker statistics
            url = f"{self.api_endpoints['binance']}/ticker/24hr"
            params = {'symbol': f"{symbol}USDT"}
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Convert INR (approximate)
            usd_price = float(data['lastPrice'])
            inr_price = usd_price * 83  # Approximate USD to INR
            
            return {
                'symbol': symbol.upper(),
                'price_usd': usd_price,
                'price_inr': inr_price,
                'market_cap': 0,  # Not available
                'volume_24h': float(data['volume']) * usd_price,
                'change_24h': float(data['priceChangePercent']),
                'change_7d': 0,  # Not available in 24h ticker
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error fetching {symbol} from Binance: {e}")
            return None
    
    def get_crypto_data(self, symbol: str) -> Optional[Dict]:
        """Get crypto data with fallback APIs"""
        
        # Try CoinGecko first (more comprehensive)
        data = self.fetch_crypto_data_coingecko(symbol)
        if data:
            return data
        
        # Fallback to Binance
        self.logger.warning(f"CoinGecko failed for {symbol}, trying Binance...")
        data = self.fetch_crypto_data_binance(symbol)
        if data:
            return data
        
        self.logger.error(f"All APIs failed for {symbol}")
        return None
    
    def store_crypto_data(self, crypto_data: Dict):
        """Store crypto data in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO crypto_prices 
                (symbol, price_usd, price_inr, market_cap, volume_24h, change_24h, change_7d)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                crypto_data['symbol'],
                crypto_data['price_usd'],
                crypto_data['price_inr'],
                crypto_data['market_cap'],
                crypto_data['volume_24h'],
                crypto_data['change_24h'],
                crypto_data['change_7d']
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Error storing crypto data: {e}")
    
    def check_price_alerts(self, symbol: str, current_data: Dict) -> List[Dict]:
        """Check if price movement triggers alerts"""
        alerts = []
        
        try:
            change_24h = current_data.get('change_24h', 0)
            price_usd = current_data.get('price_usd', 0)
            
            # Check significant price movements
            threshold = self.crypto_symbols.get(symbol, {}).get('threshold', 5.0)
            
            if abs(change_24h) >= threshold:
                alert_type = "SURGE" if change_24h > 0 else "CRASH"
                
                message = self.generate_crypto_alert_message(symbol, current_data, alert_type)
                
                alert = {
                    'symbol': symbol,
                    'alert_type': alert_type,
                    'price_usd': price_usd,
                    'change_percent': change_24h,
                    'message': message
                }
                alerts.append(alert)
                
                # Store alert
                self.store_crypto_alert(alert)
        
        except Exception as e:
            self.logger.error(f"Error checking alerts for {symbol}: {e}")
        
        return alerts
    
    def store_crypto_alert(self, alert: Dict):
        """Store crypto alert in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO crypto_alerts 
                (symbol, alert_type, price_usd, change_percent, message)
                VALUES (?, ?, ?, ?, ?)
            """, (
                alert['symbol'],
                alert['alert_type'],
                alert['price_usd'],
                alert['change_percent'],
                alert['message']
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Error storing alert: {e}")
    
    def generate_crypto_alert_message(self, symbol: str, data: Dict, alert_type: str) -> str:
        """Generate crypto alert message"""
        
        crypto_name = self.crypto_symbols.get(symbol, {}).get('name', symbol)
        price_usd = data.get('price_usd', 0)
        price_inr = data.get('price_inr', 0)
        change_24h = data.get('change_24h', 0)
        
        direction_emoji = "🚀" if change_24h > 0 else "📉"
        
        message = f"""🚨 CRYPTO ALERT - {alert_type}!

{direction_emoji} {crypto_name} ({symbol})
💰 ${price_usd:,.2f} (₹{price_inr:,.0f})
📊 24h Change: {change_24h:+.2f}%

⚡ Major price movement detected!
📈 Analysis: {"Bulls taking control" if change_24h > 0 else "Bears dominating market"}

💡 Remember: Crypto markets are highly volatile!
🛡️ Always do your own research before investing.

Follow @AIFinanceNews2024 for more verified crypto alerts! 🎯"""
        
        return message
    
    def generate_crypto_market_brief(self) -> str:
        """Generate comprehensive crypto market brief"""
        try:
            # Get latest data for major cryptos
            crypto_data = {}
            
            for symbol in ['BTC', 'ETH', 'BNB']:  # Focus on top 3
                data = self.get_crypto_data(symbol)
                if data:
                    crypto_data[symbol] = data
            
            if not crypto_data:
                return "❌ Unable to fetch crypto market data"
            
            # Analyze market sentiment
            positive_count = sum(1 for d in crypto_data.values() if d.get('change_24h', 0) > 0)
            total_count = len(crypto_data)
            
            if positive_count > total_count * 0.6:
                sentiment = "BULLISH 🚀"
                sentiment_desc = "Crypto markets showing strong momentum"
            elif positive_count < total_count * 0.4:
                sentiment = "BEARISH 📉"
                sentiment_desc = "Crypto markets under pressure"
            else:
                sentiment = "MIXED ⚖️"
                sentiment_desc = "Mixed signals across crypto markets"
            
            # Generate brief
            brief = f"""📊 CRYPTO MARKET BRIEF - {datetime.now().strftime('%d %b %Y')}

🎯 Overall Sentiment: {sentiment}
{sentiment_desc}

💎 TOP CRYPTOS:"""
            
            for symbol, data in crypto_data.items():
                name = self.crypto_symbols.get(symbol, {}).get('name', symbol)
                price_usd = data.get('price_usd', 0)
                change_24h = data.get('change_24h', 0)
                emoji = "🟢" if change_24h > 0 else "🔴" if change_24h < 0 else "🟡"
                
                brief += f"\n{emoji} {name}: ${price_usd:,.2f} ({change_24h:+.1f}%)"
            
            brief += f"""

💡 CRYPTO WISDOM:
{'Ride the wave, but stay cautious!' if sentiment == 'BULLISH 🚀' else 'Bear markets create millionaires!' if sentiment == 'BEARISH 📉' else 'Patience pays in volatile markets!'}

🛡️ Always verify data and do your research!
Follow @AIFinanceNews2024 for verified crypto insights! 🎯"""
            
            return brief
            
        except Exception as e:
            self.logger.error(f"Error generating crypto brief: {e}")
            return "❌ Error generating crypto market brief"
    
    def update_all_crypto_data(self) -> Dict:
        """Update data for all tracked cryptos"""
        results = {
            'success': 0,
            'failed': 0,
            'alerts': [],
            'updated_symbols': []
        }
        
        self.logger.info("🔄 Starting crypto data update...")
        
        for symbol in self.crypto_symbols.keys():
            try:
                data = self.get_crypto_data(symbol)
                if data:
                    self.store_crypto_data(data)
                    results['success'] += 1
                    results['updated_symbols'].append(symbol)
                    
                    # Check for alerts
                    alerts = self.check_price_alerts(symbol, data)
                    results['alerts'].extend(alerts)
                    
                    self.logger.info(f"✅ Updated {symbol}: ${data['price_usd']:.2f} ({data['change_24h']:+.1f}%)")
                else:
                    results['failed'] += 1
                    self.logger.warning(f"❌ Failed to update {symbol}")
                
                time.sleep(1)  # Rate limiting
                
            except Exception as e:
                results['failed'] += 1
                self.logger.error(f"Error updating {symbol}: {e}")
        
        self.logger.info(f"🎯 Update complete: {results['success']} success, {results['failed']} failed, {len(results['alerts'])} alerts")
        
        return results
    
    def get_crypto_analytics(self) -> Dict:
        """Get crypto analytics and insights"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get latest prices
            cursor.execute("""
                SELECT symbol, price_usd, change_24h 
                FROM crypto_prices 
                WHERE timestamp >= datetime('now', '-1 hour')
                GROUP BY symbol
                ORDER BY price_usd DESC
            """)
            latest_prices = cursor.fetchall()
            
            # Get alert count
            cursor.execute("""
                SELECT COUNT(*) FROM crypto_alerts 
                WHERE timestamp >= datetime('now', '-24 hours')
            """)
            alert_count = cursor.fetchone()[0]
            
            # Get top performers
            cursor.execute("""
                SELECT symbol, MAX(change_24h) as max_change
                FROM crypto_prices 
                WHERE timestamp >= datetime('now', '-24 hours')
                GROUP BY symbol
                ORDER BY max_change DESC
                LIMIT 3
            """)
            top_performers = cursor.fetchall()
            
            conn.close()
            
            return {
                'latest_prices': latest_prices,
                'total_tracked': len(self.crypto_symbols),
                'alerts_24h': alert_count,
                'top_performers': top_performers,
                'last_update': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting analytics: {e}")
            return {}
    
    def run_crypto_monitoring(self, continuous: bool = False):
        """Run crypto monitoring system"""
        
        print("🚀 CRYPTO MARKET INTEGRATION - AI Finance Agency")
        print("=" * 70)
        print(f"📊 Tracking {len(self.crypto_symbols)} major cryptocurrencies")
        print(f"⚡ Alert threshold: {self.price_change_threshold}% price movement")
        print("=" * 70)
        
        if continuous:
            print("🔄 Starting continuous monitoring...")
            cycle_count = 0
            
            while True:
                try:
                    cycle_count += 1
                    print(f"\n🔄 Monitoring Cycle {cycle_count} - {datetime.now().strftime('%H:%M:%S')}")
                    
                    results = self.update_all_crypto_data()
                    
                    if results['alerts']:
                        print(f"🚨 {len(results['alerts'])} CRYPTO ALERTS GENERATED!")
                        for alert in results['alerts']:
                            print(f"• {alert['symbol']}: {alert['alert_type']} ({alert['change_percent']:+.1f}%)")
                    
                    print(f"✅ Cycle complete: {results['success']} updated, {results['failed']} failed")
                    
                    # Wait 5 minutes between updates
                    print("⏰ Next update in 5 minutes...")
                    time.sleep(300)
                    
                except KeyboardInterrupt:
                    print("\n👋 Monitoring stopped by user")
                    break
                except Exception as e:
                    self.logger.error(f"Error in monitoring cycle: {e}")
                    time.sleep(60)  # Wait 1 minute before retry
        else:
            # Single update
            results = self.update_all_crypto_data()
            
            print(f"\n📊 UPDATE RESULTS:")
            print(f"✅ Success: {results['success']}")
            print(f"❌ Failed: {results['failed']}")
            print(f"🚨 Alerts: {len(results['alerts'])}")
            
            if results['alerts']:
                print("\n🚨 CRYPTO ALERTS:")
                for alert in results['alerts']:
                    print(f"• {alert['symbol']}: {alert['alert_type']} ({alert['change_percent']:+.1f}%)")
            
            # Generate market brief
            brief = self.generate_crypto_market_brief()
            print("\n📰 CRYPTO MARKET BRIEF:")
            print("-" * 50)
            print(brief)

def main():
    """Main entry point"""
    
    crypto_integration = CryptoMarketIntegration()
    
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "monitor":
            crypto_integration.run_crypto_monitoring(continuous=True)
        elif command == "update":
            crypto_integration.run_crypto_monitoring(continuous=False)
        elif command == "brief":
            brief = crypto_integration.generate_crypto_market_brief()
            print(brief)
        elif command == "analytics":
            analytics = crypto_integration.get_crypto_analytics()
            print(json.dumps(analytics, indent=2))
        else:
            print("Available commands: monitor, update, brief, analytics")
    else:
        # Interactive mode
        print("🚀 CRYPTO MARKET INTEGRATION")
        print("1. Single Update")
        print("2. Continuous Monitoring")
        print("3. Generate Brief")
        
        choice = input("Select option (1-3): ").strip()
        
        if choice == "1":
            crypto_integration.run_crypto_monitoring(continuous=False)
        elif choice == "2":
            crypto_integration.run_crypto_monitoring(continuous=True)
        elif choice == "3":
            brief = crypto_integration.generate_crypto_market_brief()
            print("\n" + brief)
        else:
            print("Invalid option")

if __name__ == "__main__":
    main()
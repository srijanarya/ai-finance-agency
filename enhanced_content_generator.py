#!/usr/bin/env python3
"""
Enhanced Content Generator with REAL Market Data
================================================
Generates high-quality financial content using actual real-time market data
instead of hardcoded fake metrics.

Author: AI Finance Agency
Created: September 8, 2025
"""

import yfinance as yf
import openai
import os
from datetime import datetime, timedelta
import json
import random
from typing import Dict, List, Optional, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedContentGenerator:
    """Content generator that uses REAL market data for authentic insights"""
    
    def __init__(self):
        self.openai_key = os.getenv('OPENAI_API_KEY')
        openai.api_key = self.openai_key
        
    def get_real_market_data(self) -> Dict:
        """Fetch REAL market data from Yahoo Finance"""
        try:
            data = {}
            
            # Indian Indices
            nifty = yf.Ticker('^NSEI')
            sensex = yf.Ticker('^BSESN')
            
            # Get current and historical data
            nifty_hist = nifty.history(period='5d')
            sensex_hist = sensex.history(period='5d')
            
            if not nifty_hist.empty:
                data['nifty'] = {
                    'current': nifty_hist['Close'].iloc[-1],
                    'open': nifty_hist['Open'].iloc[-1],
                    'high': nifty_hist['High'].iloc[-1],
                    'low': nifty_hist['Low'].iloc[-1],
                    'prev_close': nifty_hist['Close'].iloc[-2] if len(nifty_hist) > 1 else nifty_hist['Close'].iloc[-1],
                    'volume': int(nifty_hist['Volume'].iloc[-1]),
                    'change': nifty_hist['Close'].iloc[-1] - nifty_hist['Close'].iloc[-2] if len(nifty_hist) > 1 else 0,
                    'change_pct': ((nifty_hist['Close'].iloc[-1] - nifty_hist['Close'].iloc[-2]) / nifty_hist['Close'].iloc[-2] * 100) if len(nifty_hist) > 1 else 0
                }
            
            if not sensex_hist.empty:
                data['sensex'] = {
                    'current': sensex_hist['Close'].iloc[-1],
                    'open': sensex_hist['Open'].iloc[-1],
                    'high': sensex_hist['High'].iloc[-1],
                    'low': sensex_hist['Low'].iloc[-1],
                    'prev_close': sensex_hist['Close'].iloc[-2] if len(sensex_hist) > 1 else sensex_hist['Close'].iloc[-1],
                    'volume': int(sensex_hist['Volume'].iloc[-1]),
                    'change': sensex_hist['Close'].iloc[-1] - sensex_hist['Close'].iloc[-2] if len(sensex_hist) > 1 else 0,
                    'change_pct': ((sensex_hist['Close'].iloc[-1] - sensex_hist['Close'].iloc[-2]) / sensex_hist['Close'].iloc[-2] * 100) if len(sensex_hist) > 1 else 0
                }
            
            # USD/INR
            usdinr = yf.Ticker('INR=X')
            usdinr_hist = usdinr.history(period='5d')
            if not usdinr_hist.empty:
                data['usdinr'] = {
                    'current': usdinr_hist['Close'].iloc[-1],
                    'change_pct': ((usdinr_hist['Close'].iloc[-1] - usdinr_hist['Close'].iloc[-2]) / usdinr_hist['Close'].iloc[-2] * 100) if len(usdinr_hist) > 1 else 0
                }
            
            # Get top Indian stocks performance
            indian_stocks = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 
                           'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS']
            
            data['top_stocks'] = []
            for symbol in indian_stocks[:5]:  # Get top 5
                try:
                    stock = yf.Ticker(symbol)
                    hist = stock.history(period='2d')
                    if not hist.empty and len(hist) > 1:
                        change_pct = ((hist['Close'].iloc[-1] - hist['Close'].iloc[-2]) / hist['Close'].iloc[-2] * 100)
                        data['top_stocks'].append({
                            'symbol': symbol.replace('.NS', ''),
                            'price': hist['Close'].iloc[-1],
                            'change_pct': change_pct
                        })
                except:
                    continue
            
            # Sort by performance
            data['top_stocks'] = sorted(data['top_stocks'], key=lambda x: x['change_pct'], reverse=True)
            
            # Get sector performance (using sector ETFs)
            sectors = {
                'Banking': 'BANKBEES.NS',
                'IT': 'ITBEES.NS',
                'Pharma': 'PHARMABEES.NS',
                'Auto': '^CNXAUTO',
                'FMCG': '^CNXFMCG'
            }
            
            data['sectors'] = {}
            for sector, ticker in sectors.items():
                try:
                    etf = yf.Ticker(ticker)
                    hist = etf.history(period='2d')
                    if not hist.empty and len(hist) > 1:
                        change_pct = ((hist['Close'].iloc[-1] - hist['Close'].iloc[-2]) / hist['Close'].iloc[-2] * 100)
                        data['sectors'][sector] = change_pct
                except:
                    continue
            
            # Timestamp
            data['timestamp'] = datetime.now().strftime('%B %d, %Y %I:%M %p IST')
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
            return {}
    
    def generate_insight_content(self, platform: str = 'linkedin') -> str:
        """Generate content with REAL market insights"""
        
        # Get real data
        market_data = self.get_real_market_data()
        
        if not market_data:
            return "Unable to fetch market data at this time."
        
        # Create different content types based on real data
        content_types = [
            self._generate_market_update,
            self._generate_stock_focus,
            self._generate_sector_analysis,
            self._generate_trading_insight,
            self._generate_macro_view
        ]
        
        # Pick a random content type for variety
        content_generator = random.choice(content_types)
        return content_generator(market_data, platform)
    
    def _generate_market_update(self, data: Dict, platform: str) -> str:
        """Generate market update with real numbers"""
        
        nifty = data.get('nifty', {})
        sensex = data.get('sensex', {})
        
        if platform == 'linkedin':
            content = f"""🔔 Market Close: {data.get('timestamp', 'Today')}

Nifty 50: {nifty.get('current', 0):.2f} ({nifty.get('change_pct', 0):+.2f}%)
Sensex: {sensex.get('current', 0):.2f} ({sensex.get('change_pct', 0):+.2f}%)
USD/INR: ₹{data.get('usdinr', {}).get('current', 0):.2f}

📊 Key Observations:
"""
            
            # Add real insights based on data
            if nifty.get('change_pct', 0) > 0:
                content += f"• Markets closed in green, Nifty gained {nifty.get('change', 0):.0f} points\n"
            else:
                content += f"• Markets under pressure, Nifty shed {abs(nifty.get('change', 0)):.0f} points\n"
            
            # Add top movers
            if data.get('top_stocks'):
                best = data['top_stocks'][0]
                worst = data['top_stocks'][-1]
                content += f"• {best['symbol']} led gains (+{best['change_pct']:.1f}%)\n"
                if worst['change_pct'] < 0:
                    content += f"• {worst['symbol']} dragged ({worst['change_pct']:.1f}%)\n"
            
            # Add sector performance
            if data.get('sectors'):
                best_sector = max(data['sectors'].items(), key=lambda x: x[1])
                content += f"• {best_sector[0]} sector outperformed (+{best_sector[1]:.1f}%)\n"
            
            # Trading levels
            content += f"\n🎯 Key Levels Tomorrow:\n"
            content += f"• Nifty Support: {int(nifty.get('current', 0) * 0.995)}\n"
            content += f"• Nifty Resistance: {int(nifty.get('current', 0) * 1.005)}\n"
            
            content += "\n#StockMarket #Nifty50 #Sensex #Trading #FinancialMarkets"
            
        elif platform == 'twitter':
            content = f"""Nifty: {nifty.get('current', 0):.0f} ({nifty.get('change_pct', 0):+.1f}%)
Sensex: {sensex.get('current', 0):.0f} ({sensex.get('change_pct', 0):+.1f}%)

"""
            if data.get('top_stocks'):
                best = data['top_stocks'][0]
                content += f"Top gainer: {best['symbol']} +{best['change_pct']:.1f}%\n"
            
            content += f"\n#Nifty #Sensex #StockMarket"
        
        else:  # telegram
            content = f"""📈 Market Update - {data.get('timestamp', 'Now')}

Indices:
• Nifty 50: {nifty.get('current', 0):.2f} ({nifty.get('change_pct', 0):+.2f}%)
• Sensex: {sensex.get('current', 0):.2f} ({sensex.get('change_pct', 0):+.2f}%)
• USD/INR: ₹{data.get('usdinr', {}).get('current', 0):.2f}

Top Movers:
"""
            for stock in data.get('top_stocks', [])[:3]:
                content += f"• {stock['symbol']}: ₹{stock['price']:.2f} ({stock['change_pct']:+.1f}%)\n"
            
            content += "\n📊 @AIFinanceNews2024"
        
        return content
    
    def _generate_stock_focus(self, data: Dict, platform: str) -> str:
        """Generate content focused on specific stock movement"""
        
        if not data.get('top_stocks'):
            return self._generate_market_update(data, platform)
        
        # Pick the biggest mover
        stocks = data['top_stocks']
        focus_stock = stocks[0] if abs(stocks[0]['change_pct']) > abs(stocks[-1]['change_pct']) else stocks[-1]
        
        action = "surged" if focus_stock['change_pct'] > 0 else "plunged"
        
        content = f"""🎯 Stock in Focus: {focus_stock['symbol']}

{focus_stock['symbol']} {action} {abs(focus_stock['change_pct']):.1f}% to ₹{focus_stock['price']:.2f} today.

"""
        
        # Add context based on the stock
        if 'TCS' in focus_stock['symbol'] or 'INFY' in focus_stock['symbol']:
            content += "IT sector facing headwinds from global recession fears and slower tech spending.\n"
        elif 'BANK' in focus_stock['symbol']:
            content += "Banking stocks reacting to RBI policy stance and credit growth data.\n"
        elif 'RELIANCE' in focus_stock['symbol']:
            content += "Energy giant moving on crude oil prices and retail expansion plans.\n"
        
        if platform == 'linkedin':
            content += f"\nMarket Context:\n"
            content += f"• Nifty: {data.get('nifty', {}).get('current', 0):.0f} ({data.get('nifty', {}).get('change_pct', 0):+.1f}%)\n"
            content += f"• Volume: {data.get('nifty', {}).get('volume', 0)/1000000:.1f}M shares\n"
            content += "\n#Stocks #Investing #EquityMarkets"
        
        return content
    
    def _generate_sector_analysis(self, data: Dict, platform: str) -> str:
        """Generate sector-focused content"""
        
        if not data.get('sectors'):
            return self._generate_market_update(data, platform)
        
        sectors = data['sectors']
        
        content = f"""📊 Sector Performance Today:\n\n"""
        
        for sector, change in sorted(sectors.items(), key=lambda x: x[1], reverse=True):
            emoji = "🟢" if change > 0 else "🔴"
            content += f"{emoji} {sector}: {change:+.1f}%\n"
        
        # Add interpretation
        best_sector = max(sectors.items(), key=lambda x: x[1])
        worst_sector = min(sectors.items(), key=lambda x: x[1])
        
        content += f"\n💡 Key Takeaway:\n"
        content += f"{best_sector[0]} leading the rally while {worst_sector[0]} under pressure.\n"
        
        if platform == 'linkedin':
            content += "\nRotation into defensive sectors suggests risk-off sentiment.\n"
            content += "\n#SectorAnalysis #StockMarket #InvestmentStrategy"
        
        return content
    
    def _generate_trading_insight(self, data: Dict, platform: str) -> str:
        """Generate trading-focused content"""
        
        nifty = data.get('nifty', {})
        
        content = f"""📈 Trading Levels - {datetime.now().strftime('%B %d')}

Nifty 50: {nifty.get('current', 0):.2f}

🎯 Intraday Levels:
• Resistance 2: {int(nifty.get('current', 0) * 1.01)}
• Resistance 1: {int(nifty.get('current', 0) * 1.005)}
• Pivot: {int(nifty.get('current', 0))}
• Support 1: {int(nifty.get('current', 0) * 0.995)}
• Support 2: {int(nifty.get('current', 0) * 0.99)}

📊 Today's Range: {nifty.get('low', 0):.0f} - {nifty.get('high', 0):.0f}

"""
        
        if nifty.get('change_pct', 0) > 0:
            content += "✅ Bias: Bullish above pivot\n"
        else:
            content += "⚠️ Bias: Bearish below pivot\n"
        
        if platform == 'linkedin':
            content += "\n#Trading #TechnicalAnalysis #Nifty50 #IntradayTrading"
        
        return content
    
    def _generate_macro_view(self, data: Dict, platform: str) -> str:
        """Generate macro-economic content"""
        
        usdinr = data.get('usdinr', {})
        
        content = f"""🌍 Macro View: Indian Markets

USD/INR: ₹{usdinr.get('current', 0):.2f} ({usdinr.get('change_pct', 0):+.2f}%)

"""
        
        if usdinr.get('change_pct', 0) > 0.5:
            content += "• Rupee weakening puts pressure on importers\n"
            content += "• IT exporters likely to benefit\n"
        elif usdinr.get('change_pct', 0) < -0.5:
            content += "• Rupee strengthening helps control inflation\n"
            content += "• Positive for oil marketing companies\n"
        
        content += f"\nEquity Markets:\n"
        content += f"• Nifty: {data.get('nifty', {}).get('current', 0):.0f}\n"
        content += f"• Sensex: {data.get('sensex', {}).get('current', 0):.0f}\n"
        
        if platform == 'linkedin':
            content += "\n#MacroEconomics #Forex #IndianEconomy #Markets"
        
        return content

# Test the enhanced generator
if __name__ == "__main__":
    generator = EnhancedContentGenerator()
    
    print("Fetching real market data...")
    data = generator.get_real_market_data()
    
    print("\nReal Market Data:")
    print(f"Nifty: {data.get('nifty', {}).get('current', 'N/A')}")
    print(f"Sensex: {data.get('sensex', {}).get('current', 'N/A')}")
    print(f"USD/INR: {data.get('usdinr', {}).get('current', 'N/A')}")
    
    print("\n" + "="*60)
    print("SAMPLE CONTENT WITH REAL DATA")
    print("="*60)
    
    for platform in ['linkedin', 'twitter', 'telegram']:
        print(f"\n📱 {platform.upper()} Content:")
        print("-"*40)
        content = generator.generate_insight_content(platform)
        print(content)
        print()
#!/usr/bin/env python3
"""
Portfolio Management Agent - Intelligent portfolio construction and management
Handles asset allocation, rebalancing, risk management, and performance tracking
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
from dataclasses import dataclass, asdict
from scipy.optimize import minimize
import warnings
warnings.filterwarnings('ignore')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class Portfolio:
    """Portfolio data structure"""
    client_id: str
    name: str
    total_value: float
    cash_balance: float
    holdings: List[Dict]
    allocation_strategy: str
    risk_profile: str
    target_return: float
    rebalance_frequency: str
    created_at: datetime
    last_rebalanced: datetime

@dataclass
class Position:
    """Individual position in portfolio"""
    symbol: str
    quantity: int
    buy_price: float
    current_price: float
    value: float
    weight: float
    pnl: float
    pnl_percentage: float
    sector: str
    asset_class: str

class PortfolioManagementAgent:
    """Advanced portfolio management system"""
    
    def __init__(self):
        self.db_path = "data/portfolio_management.db"
        self.init_database()
        
        # Asset allocation strategies
        self.strategies = {
            'conservative': {
                'equity': 0.30,
                'debt': 0.60,
                'gold': 0.05,
                'cash': 0.05
            },
            'moderate': {
                'equity': 0.50,
                'debt': 0.35,
                'gold': 0.10,
                'cash': 0.05
            },
            'aggressive': {
                'equity': 0.70,
                'debt': 0.20,
                'gold': 0.05,
                'cash': 0.05
            },
            'growth': {
                'equity': 0.80,
                'debt': 0.15,
                'gold': 0.03,
                'cash': 0.02
            }
        }
        
        # Model portfolios
        self.model_portfolios = {
            'nifty50': ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS'],
            'banking': ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'AXISBANK.NS', 'KOTAKBANK.NS'],
            'it': ['TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS', 'TECHM.NS'],
            'pharma': ['SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'DIVISLAB.NS', 'BIOCON.NS'],
            'fmcg': ['HINDUNILVR.NS', 'ITC.NS', 'NESTLEIND.NS', 'BRITANNIA.NS', 'DABUR.NS']
        }
        
    def init_database(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Portfolios table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS portfolios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                total_value REAL,
                cash_balance REAL,
                allocation_strategy TEXT,
                risk_profile TEXT,
                target_return REAL,
                rebalance_frequency TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_rebalanced TIMESTAMP
            )
        """)
        
        # Holdings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS holdings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                portfolio_id INTEGER,
                symbol TEXT NOT NULL,
                quantity INTEGER,
                buy_price REAL,
                current_price REAL,
                value REAL,
                weight REAL,
                pnl REAL,
                pnl_percentage REAL,
                sector TEXT,
                asset_class TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
            )
        """)
        
        # Transactions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                portfolio_id INTEGER,
                symbol TEXT NOT NULL,
                transaction_type TEXT,
                quantity INTEGER,
                price REAL,
                amount REAL,
                fees REAL,
                notes TEXT,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
            )
        """)
        
        # Performance table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                portfolio_id INTEGER,
                date DATE,
                total_value REAL,
                daily_return REAL,
                cumulative_return REAL,
                volatility REAL,
                sharpe_ratio REAL,
                max_drawdown REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
            )
        """)
        
        # Rebalancing history
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rebalancing_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                portfolio_id INTEGER,
                rebalance_type TEXT,
                changes TEXT,
                cost REAL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("Portfolio database initialized successfully")
        
    async def create_portfolio(self, client_id: str, config: Dict) -> Portfolio:
        """Create a new portfolio for a client"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create portfolio entry
            cursor.execute("""
                INSERT INTO portfolios 
                (client_id, name, total_value, cash_balance, allocation_strategy, 
                 risk_profile, target_return, rebalance_frequency)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                client_id,
                config.get('name', f'Portfolio_{client_id}'),
                config.get('initial_investment', 100000),
                config.get('initial_investment', 100000),
                config.get('strategy', 'moderate'),
                config.get('risk_profile', 'moderate'),
                config.get('target_return', 0.15),
                config.get('rebalance_frequency', 'quarterly')
            ))
            
            portfolio_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            # Build initial portfolio
            portfolio = await self.build_initial_portfolio(client_id, config)
            
            logger.info(f"Created portfolio for client {client_id}")
            return portfolio
            
        except Exception as e:
            logger.error(f"Error creating portfolio: {e}")
            return None
            
    async def build_initial_portfolio(self, client_id: str, config: Dict) -> Portfolio:
        """Build initial portfolio based on strategy"""
        try:
            strategy = config.get('strategy', 'moderate')
            allocation = self.strategies[strategy]
            initial_investment = config.get('initial_investment', 100000)
            
            # Get portfolio recommendations
            recommendations = await self.get_stock_recommendations(strategy)
            
            # Allocate funds
            holdings = []
            for asset_class, weight in allocation.items():
                if asset_class == 'equity':
                    # Distribute equity allocation among recommended stocks
                    equity_amount = initial_investment * weight
                    stocks = recommendations.get('stocks', [])
                    
                    if stocks:
                        per_stock = equity_amount / len(stocks)
                        for stock in stocks:
                            price = await self.get_current_price(stock['symbol'])
                            quantity = int(per_stock / price)
                            if quantity > 0:
                                holdings.append({
                                    'symbol': stock['symbol'],
                                    'quantity': quantity,
                                    'buy_price': price,
                                    'current_price': price,
                                    'value': quantity * price,
                                    'sector': stock.get('sector', 'Unknown'),
                                    'asset_class': 'equity'
                                })
                                
            # Store holdings in database
            await self.store_holdings(client_id, holdings)
            
            portfolio = Portfolio(
                client_id=client_id,
                name=config.get('name', f'Portfolio_{client_id}'),
                total_value=initial_investment,
                cash_balance=initial_investment * allocation.get('cash', 0.05),
                holdings=holdings,
                allocation_strategy=strategy,
                risk_profile=config.get('risk_profile', 'moderate'),
                target_return=config.get('target_return', 0.15),
                rebalance_frequency=config.get('rebalance_frequency', 'quarterly'),
                created_at=datetime.now(),
                last_rebalanced=datetime.now()
            )
            
            return portfolio
            
        except Exception as e:
            logger.error(f"Error building initial portfolio: {e}")
            return None
            
    async def get_stock_recommendations(self, strategy: str) -> Dict:
        """Get stock recommendations based on strategy"""
        recommendations = {'stocks': []}
        
        if strategy in ['conservative', 'moderate']:
            # Large cap, stable companies
            stocks = [
                {'symbol': 'RELIANCE.NS', 'sector': 'Energy', 'weight': 0.15},
                {'symbol': 'TCS.NS', 'sector': 'IT', 'weight': 0.15},
                {'symbol': 'HDFCBANK.NS', 'sector': 'Banking', 'weight': 0.15},
                {'symbol': 'INFY.NS', 'sector': 'IT', 'weight': 0.10},
                {'symbol': 'ICICIBANK.NS', 'sector': 'Banking', 'weight': 0.10},
                {'symbol': 'HINDUNILVR.NS', 'sector': 'FMCG', 'weight': 0.10},
                {'symbol': 'ITC.NS', 'sector': 'FMCG', 'weight': 0.10},
                {'symbol': 'BHARTIARTL.NS', 'sector': 'Telecom', 'weight': 0.08},
                {'symbol': 'ASIANPAINT.NS', 'sector': 'Paints', 'weight': 0.07}
            ]
        elif strategy in ['aggressive', 'growth']:
            # Growth stocks, mid-cap
            stocks = [
                {'symbol': 'BAJFINANCE.NS', 'sector': 'Finance', 'weight': 0.12},
                {'symbol': 'TITAN.NS', 'sector': 'Retail', 'weight': 0.12},
                {'symbol': 'PIDILITIND.NS', 'sector': 'Chemicals', 'weight': 0.10},
                {'symbol': 'DMART.NS', 'sector': 'Retail', 'weight': 0.10},
                {'symbol': 'HAVELLS.NS', 'sector': 'Electrical', 'weight': 0.10},
                {'symbol': 'DIVISLAB.NS', 'sector': 'Pharma', 'weight': 0.10},
                {'symbol': 'ADANIENT.NS', 'sector': 'Infrastructure', 'weight': 0.12},
                {'symbol': 'ADANIGREEN.NS', 'sector': 'Renewable', 'weight': 0.12},
                {'symbol': 'LTIM.NS', 'sector': 'IT', 'weight': 0.12}
            ]
        
        # Analyze each stock
        for stock in stocks:
            analysis = await self.analyze_stock_fundamentals(stock['symbol'])
            stock['analysis'] = analysis
            
        recommendations['stocks'] = stocks
        return recommendations
        
    async def analyze_stock_fundamentals(self, symbol: str) -> Dict:
        """Analyze stock fundamentals"""
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            
            analysis = {
                'pe_ratio': info.get('trailingPE', 0),
                'pb_ratio': info.get('priceToBook', 0),
                'dividend_yield': info.get('dividendYield', 0),
                'market_cap': info.get('marketCap', 0),
                'roi': info.get('returnOnEquity', 0),
                'debt_to_equity': info.get('debtToEquity', 0),
                'current_ratio': info.get('currentRatio', 0),
                'revenue_growth': info.get('revenueGrowth', 0),
                'earnings_growth': info.get('earningsGrowth', 0),
                'recommendation': info.get('recommendationKey', 'hold')
            }
            
            # Calculate fundamental score
            score = 0
            if 10 < analysis['pe_ratio'] < 25:
                score += 20
            if analysis['pb_ratio'] < 3:
                score += 15
            if analysis['dividend_yield'] > 0.02:
                score += 10
            if analysis['roi'] > 0.15:
                score += 20
            if analysis['debt_to_equity'] < 1:
                score += 15
            if analysis['current_ratio'] > 1.5:
                score += 10
            if analysis['revenue_growth'] > 0.10:
                score += 10
                
            analysis['fundamental_score'] = score
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing {symbol}: {e}")
            return {}
            
    async def rebalance_portfolio(self, client_id: str) -> Dict:
        """Rebalance portfolio to target allocation"""
        try:
            # Get current portfolio
            portfolio = await self.get_portfolio(client_id)
            if not portfolio:
                return {'status': 'error', 'message': 'Portfolio not found'}
                
            # Calculate current allocation
            current_allocation = await self.calculate_allocation(portfolio)
            
            # Get target allocation
            target_allocation = self.strategies[portfolio['allocation_strategy']]
            
            # Calculate rebalancing trades
            trades = await self.calculate_rebalancing_trades(
                portfolio, current_allocation, target_allocation
            )
            
            # Execute trades
            if trades:
                await self.execute_trades(client_id, trades)
                
                # Record rebalancing
                await self.record_rebalancing(client_id, trades)
                
                logger.info(f"Rebalanced portfolio for {client_id}")
                return {'status': 'success', 'trades': trades}
            else:
                return {'status': 'success', 'message': 'No rebalancing needed'}
                
        except Exception as e:
            logger.error(f"Error rebalancing portfolio: {e}")
            return {'status': 'error', 'message': str(e)}
            
    async def calculate_allocation(self, portfolio: Dict) -> Dict:
        """Calculate current portfolio allocation"""
        total_value = portfolio['total_value']
        allocation = {}
        
        for holding in portfolio['holdings']:
            asset_class = holding['asset_class']
            if asset_class not in allocation:
                allocation[asset_class] = 0
            allocation[asset_class] += holding['value'] / total_value
            
        allocation['cash'] = portfolio['cash_balance'] / total_value
        
        return allocation
        
    async def calculate_rebalancing_trades(
        self, portfolio: Dict, current: Dict, target: Dict
    ) -> List[Dict]:
        """Calculate trades needed for rebalancing"""
        trades = []
        total_value = portfolio['total_value']
        threshold = 0.05  # 5% deviation threshold
        
        for asset_class, target_weight in target.items():
            current_weight = current.get(asset_class, 0)
            deviation = abs(current_weight - target_weight)
            
            if deviation > threshold:
                target_value = total_value * target_weight
                current_value = total_value * current_weight
                difference = target_value - current_value
                
                if difference > 0:
                    # Need to buy
                    trades.append({
                        'asset_class': asset_class,
                        'action': 'BUY',
                        'amount': difference
                    })
                else:
                    # Need to sell
                    trades.append({
                        'asset_class': asset_class,
                        'action': 'SELL',
                        'amount': abs(difference)
                    })
                    
        return trades
        
    async def optimize_portfolio(self, client_id: str) -> Dict:
        """Optimize portfolio using modern portfolio theory"""
        try:
            # Get portfolio holdings
            portfolio = await self.get_portfolio(client_id)
            if not portfolio:
                return {'status': 'error', 'message': 'Portfolio not found'}
                
            # Get historical returns for holdings
            symbols = [h['symbol'] for h in portfolio['holdings']]
            returns_data = await self.get_historical_returns(symbols)
            
            # Calculate expected returns and covariance
            expected_returns = returns_data.mean() * 252  # Annualized
            cov_matrix = returns_data.cov() * 252
            
            # Optimize using Markowitz model
            optimal_weights = await self.markowitz_optimization(
                expected_returns, cov_matrix, portfolio['target_return']
            )
            
            # Generate reallocation recommendations
            recommendations = []
            for i, symbol in enumerate(symbols):
                current_weight = portfolio['holdings'][i]['value'] / portfolio['total_value']
                optimal_weight = optimal_weights[i]
                
                if abs(current_weight - optimal_weight) > 0.02:  # 2% threshold
                    recommendations.append({
                        'symbol': symbol,
                        'current_weight': current_weight,
                        'optimal_weight': optimal_weight,
                        'action': 'INCREASE' if optimal_weight > current_weight else 'DECREASE',
                        'change': optimal_weight - current_weight
                    })
                    
            return {
                'status': 'success',
                'recommendations': recommendations,
                'expected_return': float(np.dot(optimal_weights, expected_returns)),
                'expected_risk': float(np.sqrt(np.dot(optimal_weights.T, np.dot(cov_matrix, optimal_weights))))
            }
            
        except Exception as e:
            logger.error(f"Error optimizing portfolio: {e}")
            return {'status': 'error', 'message': str(e)}
            
    async def get_historical_returns(self, symbols: List[str]) -> pd.DataFrame:
        """Get historical returns for symbols"""
        returns_data = pd.DataFrame()
        
        for symbol in symbols:
            try:
                stock = yf.Ticker(symbol)
                hist = stock.history(period="1y")
                returns = hist['Close'].pct_change().dropna()
                returns_data[symbol] = returns
            except:
                continue
                
        return returns_data.dropna()
        
    async def markowitz_optimization(
        self, expected_returns: pd.Series, cov_matrix: pd.DataFrame, target_return: float
    ) -> np.ndarray:
        """Markowitz portfolio optimization"""
        n_assets = len(expected_returns)
        
        # Optimization constraints
        constraints = [
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},  # Sum to 1
            {'type': 'ineq', 'fun': lambda x: np.dot(x, expected_returns) - target_return}  # Min return
        ]
        
        # Bounds (0 to 1 for each asset)
        bounds = tuple((0, 1) for _ in range(n_assets))
        
        # Initial guess (equal weights)
        x0 = np.array([1/n_assets] * n_assets)
        
        # Objective function (minimize portfolio variance)
        def portfolio_variance(weights):
            return np.dot(weights.T, np.dot(cov_matrix, weights))
            
        # Optimize
        result = minimize(
            portfolio_variance,
            x0,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )
        
        return result.x
        
    async def calculate_performance_metrics(self, client_id: str) -> Dict:
        """Calculate comprehensive performance metrics"""
        try:
            # Get portfolio history
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT date, total_value FROM performance 
                WHERE portfolio_id = (SELECT id FROM portfolios WHERE client_id = ?)
                ORDER BY date
            """, (client_id,))
            
            data = cursor.fetchall()
            conn.close()
            
            if not data:
                return {}
                
            # Convert to DataFrame
            df = pd.DataFrame(data, columns=['date', 'value'])
            df['date'] = pd.to_datetime(df['date'])
            df.set_index('date', inplace=True)
            
            # Calculate returns
            df['returns'] = df['value'].pct_change()
            
            # Performance metrics
            total_return = (df['value'].iloc[-1] - df['value'].iloc[0]) / df['value'].iloc[0]
            annualized_return = (1 + total_return) ** (365 / len(df)) - 1
            volatility = df['returns'].std() * np.sqrt(252)
            
            # Sharpe ratio
            risk_free_rate = 0.06
            sharpe_ratio = (annualized_return - risk_free_rate) / volatility if volatility > 0 else 0
            
            # Maximum drawdown
            cumulative = (1 + df['returns']).cumprod()
            running_max = cumulative.expanding().max()
            drawdown = (cumulative - running_max) / running_max
            max_drawdown = drawdown.min()
            
            # Calmar ratio
            calmar_ratio = annualized_return / abs(max_drawdown) if max_drawdown != 0 else 0
            
            # Win rate
            positive_returns = df['returns'] > 0
            win_rate = positive_returns.sum() / len(df['returns'].dropna())
            
            metrics = {
                'total_return': total_return,
                'annualized_return': annualized_return,
                'volatility': volatility,
                'sharpe_ratio': sharpe_ratio,
                'max_drawdown': max_drawdown,
                'calmar_ratio': calmar_ratio,
                'win_rate': win_rate,
                'best_day': df['returns'].max(),
                'worst_day': df['returns'].min(),
                'current_value': df['value'].iloc[-1]
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error calculating performance metrics: {e}")
            return {}
            
    async def get_current_price(self, symbol: str) -> float:
        """Get current price for a symbol"""
        try:
            stock = yf.Ticker(symbol)
            return stock.info.get('currentPrice', stock.history(period='1d')['Close'].iloc[-1])
        except:
            return 0
            
    async def get_portfolio(self, client_id: str) -> Dict:
        """Get portfolio details"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get portfolio info
        cursor.execute("""
            SELECT * FROM portfolios WHERE client_id = ?
        """, (client_id,))
        
        portfolio_data = cursor.fetchone()
        if not portfolio_data:
            conn.close()
            return None
            
        portfolio_id = portfolio_data[0]
        
        # Get holdings
        cursor.execute("""
            SELECT * FROM holdings WHERE portfolio_id = ?
        """, (portfolio_id,))
        
        holdings = cursor.fetchall()
        conn.close()
        
        return {
            'client_id': client_id,
            'total_value': portfolio_data[3],
            'cash_balance': portfolio_data[4],
            'allocation_strategy': portfolio_data[5],
            'holdings': [
                {
                    'symbol': h[2],
                    'quantity': h[3],
                    'buy_price': h[4],
                    'current_price': h[5],
                    'value': h[6],
                    'asset_class': h[10]
                }
                for h in holdings
            ]
        }
        
    async def store_holdings(self, client_id: str, holdings: List[Dict]):
        """Store portfolio holdings"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get portfolio ID
        cursor.execute("SELECT id FROM portfolios WHERE client_id = ?", (client_id,))
        portfolio_id = cursor.fetchone()[0]
        
        for holding in holdings:
            cursor.execute("""
                INSERT INTO holdings 
                (portfolio_id, symbol, quantity, buy_price, current_price, value, sector, asset_class)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                portfolio_id,
                holding['symbol'],
                holding['quantity'],
                holding['buy_price'],
                holding['current_price'],
                holding['value'],
                holding.get('sector', 'Unknown'),
                holding['asset_class']
            ))
            
        conn.commit()
        conn.close()
        
    async def execute_trades(self, client_id: str, trades: List[Dict]):
        """Execute portfolio trades"""
        # Implementation for executing trades
        pass
        
    async def record_rebalancing(self, client_id: str, trades: List[Dict]):
        """Record rebalancing history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get portfolio ID
        cursor.execute("SELECT id FROM portfolios WHERE client_id = ?", (client_id,))
        portfolio_id = cursor.fetchone()[0]
        
        cursor.execute("""
            INSERT INTO rebalancing_history (portfolio_id, rebalance_type, changes, cost)
            VALUES (?, ?, ?, ?)
        """, (
            portfolio_id,
            'periodic',
            json.dumps(trades),
            sum(t['amount'] * 0.001 for t in trades)  # Assuming 0.1% transaction cost
        ))
        
        conn.commit()
        conn.close()
        
    async def run_portfolio_monitoring(self):
        """Continuous portfolio monitoring"""
        logger.info("Starting Portfolio Management Agent...")
        
        while True:
            try:
                # Get all portfolios
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT client_id FROM portfolios")
                portfolios = cursor.fetchall()
                conn.close()
                
                for (client_id,) in portfolios:
                    # Update portfolio values
                    portfolio = await self.get_portfolio(client_id)
                    if portfolio:
                        # Update current prices
                        for holding in portfolio['holdings']:
                            holding['current_price'] = await self.get_current_price(holding['symbol'])
                            
                        # Calculate performance
                        metrics = await self.calculate_performance_metrics(client_id)
                        logger.info(f"Portfolio {client_id}: Return={metrics.get('total_return', 0):.2%}")
                        
                # Wait before next cycle
                await asyncio.sleep(600)  # 10 minutes
                
            except Exception as e:
                logger.error(f"Error in portfolio monitoring: {e}")
                await asyncio.sleep(60)

if __name__ == "__main__":
    agent = PortfolioManagementAgent()
    asyncio.run(agent.run_portfolio_monitoring())
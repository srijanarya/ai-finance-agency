"""
AI Signal Generation Service
Core service for generating trading signals using AI/ML models
Supports TREUM's ₹60-90 Cr premium signal revenue target
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Tuple, Any
from uuid import UUID

import yfinance as yf
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc

from app.core.database import get_db
from app.core.config import settings
from database.models import (
    TradingSignal, SignalProvider, SignalSubscription, UserSignalPreferences,
    SignalType, SignalPriority, SignalStatus, AssetClass, SubscriptionTier,
    SignalSource, User
)


logger = logging.getLogger(__name__)


class TechnicalIndicators:
    """Technical analysis indicators for signal generation"""
    
    @staticmethod
    def calculate_rsi(prices: np.array, period: int = 14) -> float:
        """Calculate Relative Strength Index"""
        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    @staticmethod
    def calculate_macd(prices: np.array, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[float, float, float]:
        """Calculate MACD (Moving Average Convergence Divergence)"""
        exp1 = pd.Series(prices).ewm(span=fast).mean()
        exp2 = pd.Series(prices).ewm(span=slow).mean()
        macd = exp1 - exp2
        macd_signal = macd.ewm(span=signal).mean()
        macd_histogram = macd - macd_signal
        
        return float(macd.iloc[-1]), float(macd_signal.iloc[-1]), float(macd_histogram.iloc[-1])
    
    @staticmethod
    def calculate_bollinger_bands(prices: np.array, period: int = 20, std_dev: float = 2) -> Tuple[float, float, float]:
        """Calculate Bollinger Bands"""
        sma = np.mean(prices[-period:])
        std = np.std(prices[-period:])
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)
        
        return float(upper_band), float(sma), float(lower_band)
    
    @staticmethod
    def calculate_support_resistance(prices: np.array, window: int = 20) -> Tuple[float, float]:
        """Calculate support and resistance levels"""
        highs = pd.Series(prices).rolling(window=window).max()
        lows = pd.Series(prices).rolling(window=window).min()
        
        resistance = float(highs.iloc[-window:].mean())
        support = float(lows.iloc[-window:].mean())
        
        return support, resistance


class MarketDataFetcher:
    """Fetch market data for signal generation"""
    
    def __init__(self):
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes
    
    async def get_stock_data(self, symbol: str, period: str = "1mo") -> pd.DataFrame:
        """Get stock data from Yahoo Finance"""
        cache_key = f"{symbol}_{period}"
        
        if cache_key in self.cache:
            data, timestamp = self.cache[cache_key]
            if datetime.now().timestamp() - timestamp < self.cache_ttl:
                return data
        
        try:
            # Add .NS for NSE stocks if not present
            if symbol.isalpha() and len(symbol) <= 10 and '.' not in symbol:
                symbol = f"{symbol}.NS"
            
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period)
            
            if data.empty:
                logger.warning(f"No data found for symbol: {symbol}")
                return pd.DataFrame()
            
            # Cache the data
            self.cache[cache_key] = (data, datetime.now().timestamp())
            return data
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {str(e)}")
            return pd.DataFrame()
    
    async def get_crypto_data(self, symbol: str, period: str = "30d") -> pd.DataFrame:
        """Get cryptocurrency data"""
        try:
            # For crypto, use symbol as-is (e.g., BTC-USD, ETH-USD)
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period)
            return data
        except Exception as e:
            logger.error(f"Error fetching crypto data for {symbol}: {str(e)}")
            return pd.DataFrame()


class AISignalEngine:
    """Core AI engine for generating trading signals"""
    
    def __init__(self):
        self.indicators = TechnicalIndicators()
        self.data_fetcher = MarketDataFetcher()
        
        # Signal generation weights (can be ML model in production)
        self.weights = {
            'rsi': 0.25,
            'macd': 0.25,
            'bollinger': 0.20,
            'volume': 0.15,
            'momentum': 0.15
        }
    
    async def analyze_asset(self, symbol: str, asset_class: AssetClass) -> Optional[Dict[str, Any]]:
        """Analyze an asset and generate signal data"""
        try:
            # Fetch market data
            if asset_class == AssetClass.CRYPTO:
                data = await self.data_fetcher.get_crypto_data(symbol)
            else:
                data = await self.data_fetcher.get_stock_data(symbol)
            
            if data.empty or len(data) < 30:
                logger.warning(f"Insufficient data for {symbol}")
                return None
            
            # Calculate technical indicators
            prices = data['Close'].values
            volumes = data['Volume'].values
            
            analysis = {
                'symbol': symbol,
                'current_price': float(prices[-1]),
                'volume': float(volumes[-1]),
                'avg_volume': float(np.mean(volumes[-20:])),
                'price_change_pct': float((prices[-1] - prices[-2]) / prices[-2] * 100)
            }
            
            # Technical indicators
            analysis['rsi'] = self.indicators.calculate_rsi(prices)
            analysis['macd'], analysis['macd_signal'], analysis['macd_histogram'] = self.indicators.calculate_macd(prices)
            analysis['bb_upper'], analysis['bb_middle'], analysis['bb_lower'] = self.indicators.calculate_bollinger_bands(prices)
            analysis['support'], analysis['resistance'] = self.indicators.calculate_support_resistance(prices)
            
            # Calculate bollinger position (0 = at lower band, 1 = at upper band)
            bb_range = analysis['bb_upper'] - analysis['bb_lower']
            if bb_range > 0:
                analysis['bb_position'] = (analysis['current_price'] - analysis['bb_lower']) / bb_range
            else:
                analysis['bb_position'] = 0.5
            
            # Volume analysis
            analysis['volume_ratio'] = analysis['volume'] / analysis['avg_volume'] if analysis['avg_volume'] > 0 else 1.0
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing {symbol}: {str(e)}")
            return None
    
    def generate_signal_score(self, analysis: Dict[str, Any]) -> Tuple[float, SignalType, str]:
        """Generate signal score and type based on analysis"""
        score = 0.0
        signals = []
        
        # RSI Analysis
        rsi = analysis['rsi']
        if rsi < 30:
            score += self.weights['rsi'] * 0.8  # Oversold - potential buy
            signals.append("RSI oversold")
        elif rsi > 70:
            score -= self.weights['rsi'] * 0.8  # Overbought - potential sell
            signals.append("RSI overbought")
        
        # MACD Analysis
        macd_hist = analysis['macd_histogram']
        if macd_hist > 0 and analysis['macd'] > analysis['macd_signal']:
            score += self.weights['macd'] * 0.7  # Bullish momentum
            signals.append("MACD bullish")
        elif macd_hist < 0 and analysis['macd'] < analysis['macd_signal']:
            score -= self.weights['macd'] * 0.7  # Bearish momentum
            signals.append("MACD bearish")
        
        # Bollinger Bands Analysis
        bb_pos = analysis['bb_position']
        if bb_pos < 0.2:
            score += self.weights['bollinger'] * 0.6  # Near lower band - potential buy
            signals.append("Near lower Bollinger band")
        elif bb_pos > 0.8:
            score -= self.weights['bollinger'] * 0.6  # Near upper band - potential sell
            signals.append("Near upper Bollinger band")
        
        # Volume Analysis
        vol_ratio = analysis['volume_ratio']
        if vol_ratio > 1.5:
            score += self.weights['volume'] * 0.5  # High volume confirms signal
            signals.append("High volume confirmation")
        
        # Price Momentum
        price_change = analysis['price_change_pct']
        if abs(price_change) > 2:  # Significant price movement
            momentum_score = min(abs(price_change) / 10, 0.5)  # Cap at 0.5
            if price_change > 0:
                score += self.weights['momentum'] * momentum_score
                signals.append("Positive momentum")
            else:
                score -= self.weights['momentum'] * momentum_score
                signals.append("Negative momentum")
        
        # Determine signal type
        if score > 0.5:
            signal_type = SignalType.BUY
        elif score < -0.5:
            signal_type = SignalType.SELL
        else:
            signal_type = SignalType.HOLD
        
        confidence = min(abs(score), 1.0)  # Cap confidence at 1.0
        reasoning = "; ".join(signals)
        
        return confidence, signal_type, reasoning
    
    def calculate_price_targets(self, analysis: Dict[str, Any], signal_type: SignalType) -> Tuple[Optional[Decimal], Optional[Decimal], Optional[Decimal]]:
        """Calculate entry, target, and stop-loss prices"""
        current_price = Decimal(str(analysis['current_price']))
        support = Decimal(str(analysis['support']))
        resistance = Decimal(str(analysis['resistance']))
        
        if signal_type == SignalType.BUY:
            entry_price = current_price
            # Target: 2% above resistance or 3% above current price, whichever is higher
            target_resistance = resistance * Decimal('1.02')
            target_momentum = current_price * Decimal('1.03')
            target_price = max(target_resistance, target_momentum)
            # Stop loss: 2% below support or 2% below current price, whichever is lower
            stop_support = support * Decimal('0.98')
            stop_momentum = current_price * Decimal('0.98')
            stop_loss = min(stop_support, stop_momentum)
            
        elif signal_type == SignalType.SELL:
            entry_price = current_price
            # Target: 2% below support or 3% below current price, whichever is lower
            target_support = support * Decimal('0.98')
            target_momentum = current_price * Decimal('0.97')
            target_price = min(target_support, target_momentum)
            # Stop loss: 2% above resistance or 2% above current price, whichever is higher
            stop_resistance = resistance * Decimal('1.02')
            stop_momentum = current_price * Decimal('1.02')
            stop_loss = max(stop_resistance, stop_momentum)
            
        else:  # HOLD
            return current_price, None, None
        
        return entry_price, target_price, stop_loss


class SignalGenerationService:
    """Main service for generating and managing trading signals"""
    
    def __init__(self):
        self.ai_engine = AISignalEngine()
        self.db = next(get_db())
    
    async def generate_signals_for_watchlist(self, watchlist: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Generate signals for a list of assets"""
        signals = []
        
        for asset in watchlist:
            try:
                symbol = asset['symbol']
                asset_class = AssetClass(asset['asset_class'])
                exchange = asset.get('exchange', 'NSE')
                
                # Analyze the asset
                analysis = await self.ai_engine.analyze_asset(symbol, asset_class)
                if not analysis:
                    continue
                
                # Generate signal
                confidence, signal_type, reasoning = self.ai_engine.generate_signal_score(analysis)
                
                # Skip weak signals
                if confidence < 0.6:
                    continue
                
                # Calculate price targets
                entry_price, target_price, stop_loss = self.ai_engine.calculate_price_targets(analysis, signal_type)
                
                # Determine priority based on confidence and volume
                if confidence > 0.85 and analysis['volume_ratio'] > 2.0:
                    priority = SignalPriority.CRITICAL
                elif confidence > 0.75:
                    priority = SignalPriority.HIGH
                elif confidence > 0.65:
                    priority = SignalPriority.MEDIUM
                else:
                    priority = SignalPriority.LOW
                
                # Determine minimum subscription tier
                if priority in [SignalPriority.CRITICAL, SignalPriority.HIGH]:
                    min_tier = SubscriptionTier.ELITE
                elif priority == SignalPriority.MEDIUM:
                    min_tier = SubscriptionTier.PRO
                else:
                    min_tier = SubscriptionTier.BASIC
                
                # Calculate risk-reward ratio
                risk_reward_ratio = None
                if entry_price and target_price and stop_loss:
                    if signal_type == SignalType.BUY:
                        potential_gain = target_price - entry_price
                        potential_loss = entry_price - stop_loss
                    else:  # SELL
                        potential_gain = entry_price - target_price
                        potential_loss = stop_loss - entry_price
                    
                    if potential_loss > 0:
                        risk_reward_ratio = float(potential_gain / potential_loss)
                
                signal_data = {
                    'symbol': symbol,
                    'exchange': exchange,
                    'asset_class': asset_class,
                    'signal_type': signal_type,
                    'priority': priority,
                    'confidence_score': confidence,
                    'entry_price': entry_price,
                    'target_price': target_price,
                    'stop_loss': stop_loss,
                    'current_price': Decimal(str(analysis['current_price'])),
                    'risk_reward_ratio': risk_reward_ratio,
                    'min_subscription_tier': min_tier,
                    'technical_indicators': {
                        'rsi': analysis['rsi'],
                        'macd': analysis['macd'],
                        'macd_signal': analysis['macd_signal'],
                        'macd_histogram': analysis['macd_histogram'],
                        'bb_upper': analysis['bb_upper'],
                        'bb_middle': analysis['bb_middle'],
                        'bb_lower': analysis['bb_lower'],
                        'bb_position': analysis['bb_position'],
                        'support': analysis['support'],
                        'resistance': analysis['resistance'],
                        'volume_ratio': analysis['volume_ratio']
                    },
                    'reasoning': reasoning,
                    'tags': self._generate_tags(analysis, signal_type, priority)
                }
                
                signals.append(signal_data)
                
            except Exception as e:
                logger.error(f"Error generating signal for {asset}: {str(e)}")
                continue
        
        return signals
    
    def _generate_tags(self, analysis: Dict[str, Any], signal_type: SignalType, priority: SignalPriority) -> List[str]:
        """Generate tags for the signal based on analysis"""
        tags = []
        
        # Signal type tags
        if signal_type == SignalType.BUY:
            tags.append("bullish")
        elif signal_type == SignalType.SELL:
            tags.append("bearish")
        
        # Technical pattern tags
        rsi = analysis['rsi']
        if rsi < 30:
            tags.append("oversold")
        elif rsi > 70:
            tags.append("overbought")
        
        # Volume tags
        if analysis['volume_ratio'] > 2.0:
            tags.append("high_volume")
        elif analysis['volume_ratio'] > 1.5:
            tags.append("above_average_volume")
        
        # Momentum tags
        price_change = abs(analysis['price_change_pct'])
        if price_change > 5:
            tags.append("strong_momentum")
        elif price_change > 2:
            tags.append("momentum")
        
        # Bollinger bands position
        bb_pos = analysis['bb_position']
        if bb_pos < 0.2:
            tags.append("oversold_bb")
        elif bb_pos > 0.8:
            tags.append("overbought_bb")
        
        # Priority tags
        if priority == SignalPriority.CRITICAL:
            tags.append("urgent")
        elif priority == SignalPriority.HIGH:
            tags.append("high_conviction")
        
        return tags
    
    async def save_signal_to_db(self, signal_data: Dict[str, Any], provider_id: UUID) -> Optional[TradingSignal]:
        """Save generated signal to database"""
        try:
            # Generate unique signal ID
            signal_id = f"SIG_{signal_data['symbol']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Calculate valid_until (signals valid for 4 hours for intraday, 24 hours for swing)
            if signal_data['priority'] in [SignalPriority.CRITICAL, SignalPriority.HIGH]:
                valid_hours = 4  # Intraday signals
            else:
                valid_hours = 24  # Swing signals
            
            valid_until = datetime.now(timezone.utc) + timedelta(hours=valid_hours)
            
            # Create signal record
            signal = TradingSignal(
                signal_id=signal_id,
                provider_id=provider_id,
                source=SignalSource.AI_MODEL,
                symbol=signal_data['symbol'],
                exchange=signal_data['exchange'],
                asset_class=signal_data['asset_class'],
                signal_type=signal_data['signal_type'],
                priority=signal_data['priority'],
                confidence_score=Decimal(str(signal_data['confidence_score'])),
                entry_price=signal_data['entry_price'],
                target_price=signal_data['target_price'],
                stop_loss=signal_data['stop_loss'],
                current_price=signal_data['current_price'],
                risk_reward_ratio=Decimal(str(signal_data['risk_reward_ratio'])) if signal_data['risk_reward_ratio'] else None,
                valid_until=valid_until,
                status=SignalStatus.ACTIVE,
                technical_indicators=signal_data['technical_indicators'],
                min_subscription_tier=signal_data['min_subscription_tier'],
                tags=signal_data['tags'],
                notes=signal_data['reasoning']
            )
            
            self.db.add(signal)
            self.db.commit()
            self.db.refresh(signal)
            
            logger.info(f"Signal saved: {signal_id} for {signal_data['symbol']} - {signal_data['signal_type'].value}")
            return signal
            
        except Exception as e:
            logger.error(f"Error saving signal to database: {str(e)}")
            self.db.rollback()
            return None
    
    async def get_eligible_users_for_signal(self, signal: TradingSignal) -> List[User]:
        """Get users eligible to receive this signal based on their subscription tier"""
        try:
            # Find users with appropriate subscription tier
            # This would integrate with the subscription service in production
            eligible_users = self.db.query(User).filter(
                # Add subscription tier filtering logic here
                # For now, return all active users
                User.status == "active"
            ).all()
            
            return eligible_users
            
        except Exception as e:
            logger.error(f"Error finding eligible users: {str(e)}")
            return []
    
    async def run_signal_generation_cycle(self):
        """Run a complete signal generation cycle"""
        try:
            logger.info("Starting signal generation cycle")
            
            # Get AI signal provider
            provider = self.db.query(SignalProvider).filter(
                SignalProvider.name == "TREUM AI Signal Engine",
                SignalProvider.is_active == True
            ).first()
            
            if not provider:
                # Create provider if it doesn't exist
                provider = SignalProvider(
                    name="TREUM AI Signal Engine",
                    description="AI-powered signal generation using technical analysis and machine learning",
                    provider_type="ai_model",
                    model_version="v1.0",
                    config={
                        "indicators": ["RSI", "MACD", "Bollinger Bands", "Support/Resistance"],
                        "weights": self.ai_engine.weights
                    }
                )
                self.db.add(provider)
                self.db.commit()
                self.db.refresh(provider)
            
            # Define watchlist (in production, this would come from a dynamic source)
            watchlist = [
                {'symbol': 'RELIANCE', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'TCS', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'INFY', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'HDFCBANK', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'ICICIBANK', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'BTC-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
                {'symbol': 'ETH-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
            ]
            
            # Generate signals
            signals = await self.generate_signals_for_watchlist(watchlist)
            
            saved_signals = []
            for signal_data in signals:
                saved_signal = await self.save_signal_to_db(signal_data, provider.id)
                if saved_signal:
                    saved_signals.append(saved_signal)
            
            logger.info(f"Signal generation cycle completed. Generated {len(saved_signals)} signals")
            return saved_signals
            
        except Exception as e:
            logger.error(f"Error in signal generation cycle: {str(e)}")
            return []


# Global service instance
signal_service = SignalGenerationService()


async def generate_signals_scheduled():
    """Scheduled function to generate signals"""
    return await signal_service.run_signal_generation_cycle()


async def analyze_single_asset(symbol: str, asset_class: str) -> Optional[Dict[str, Any]]:
    """Analyze a single asset and return signal data"""
    try:
        engine = AISignalEngine()
        analysis = await engine.analyze_asset(symbol, AssetClass(asset_class))
        
        if not analysis:
            return None
        
        confidence, signal_type, reasoning = engine.generate_signal_score(analysis)
        entry_price, target_price, stop_loss = engine.calculate_price_targets(analysis, signal_type)
        
        return {
            'analysis': analysis,
            'signal_type': signal_type.value,
            'confidence': confidence,
            'reasoning': reasoning,
            'entry_price': float(entry_price) if entry_price else None,
            'target_price': float(target_price) if target_price else None,
            'stop_loss': float(stop_loss) if stop_loss else None
        }
        
    except Exception as e:
        logger.error(f"Error analyzing {symbol}: {str(e)}")
        return None
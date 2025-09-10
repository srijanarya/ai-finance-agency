"""
Enhanced AI Trading Signals Engine - Story 004 Implementation
Multi-AI model ensemble for institutional-grade signal generation
Supports GPT-4, Claude, and custom ML models with confidence scoring
Target: ₹2,500+ Crores ARR through premium AI signals
"""

import asyncio
import json
import logging
import hashlib
import time
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Tuple, Any, Union
from uuid import UUID, uuid4
from enum import Enum
from dataclasses import dataclass, asdict

import openai
import httpx
import numpy as np
import pandas as pd
import yfinance as yf
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, text

from app.core.database import get_db
from app.core.config import get_settings
from database.models import TradingSignal, SignalProvider, User

logger = logging.getLogger(__name__)
settings = get_settings()

class AIModelType(str, Enum):
    """AI model types for ensemble"""
    GPT4 = "gpt-4"
    GPT4_TURBO = "gpt-4-turbo"
    CLAUDE_3_OPUS = "claude-3-opus"
    CLAUDE_3_SONNET = "claude-3-sonnet"
    CUSTOM_LSTM = "custom-lstm"
    CUSTOM_TRANSFORMER = "custom-transformer"
    ENSEMBLE = "ensemble"

class SignalConfidence(str, Enum):
    """Signal confidence levels"""
    VERY_HIGH = "very_high"    # 90-100%
    HIGH = "high"              # 80-89%
    MEDIUM = "medium"          # 60-79%
    LOW = "low"                # 40-59%
    VERY_LOW = "very_low"      # 0-39%

class MarketSentiment(str, Enum):
    """Market sentiment analysis"""
    EXTREMELY_BULLISH = "extremely_bullish"
    BULLISH = "bullish"
    NEUTRAL = "neutral"
    BEARISH = "bearish"
    EXTREMELY_BEARISH = "extremely_bearish"

@dataclass
class MarketData:
    """Structured market data for AI analysis"""
    symbol: str
    current_price: float
    change_24h: float
    volume_24h: float
    market_cap: Optional[float]
    high_52w: float
    low_52w: float
    pe_ratio: Optional[float]
    dividend_yield: Optional[float]
    beta: Optional[float]
    rsi_14: float
    macd_signal: str
    bollinger_position: float
    volume_sma_ratio: float
    price_sma_50: float
    price_sma_200: float
    support_levels: List[float]
    resistance_levels: List[float]
    
class AISignalModel:
    """Base class for AI signal models"""
    
    def __init__(self, model_type: AIModelType):
        self.model_type = model_type
        self.last_request_time = {}
        self.rate_limit_delay = 1.0  # seconds between requests
    
    async def generate_signal(self, market_data: MarketData) -> Dict[str, Any]:
        """Generate trading signal from market data"""
        raise NotImplementedError
    
    def calculate_confidence(self, analysis: Dict[str, Any]) -> float:
        """Calculate signal confidence score"""
        raise NotImplementedError
    
    async def _rate_limit(self, key: str = "default"):
        """Enforce rate limiting"""
        now = time.time()
        if key in self.last_request_time:
            time_since_last = now - self.last_request_time[key]
            if time_since_last < self.rate_limit_delay:
                await asyncio.sleep(self.rate_limit_delay - time_since_last)
        self.last_request_time[key] = time.time()

class GPT4SignalModel(AISignalModel):
    """GPT-4 based signal generation"""
    
    def __init__(self):
        super().__init__(AIModelType.GPT4)
        self.client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
        self.rate_limit_delay = 0.2  # OpenAI rate limiting
    
    async def generate_signal(self, market_data: MarketData) -> Dict[str, Any]:
        """Generate signal using GPT-4 analysis"""
        await self._rate_limit()
        
        prompt = self._create_analysis_prompt(market_data)
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1000,
                response_format={"type": "json_object"}
            )
            
            analysis = json.loads(response.choices[0].message.content)
            confidence = self.calculate_confidence(analysis)
            
            return {
                "model": self.model_type,
                "analysis": analysis,
                "confidence": confidence,
                "timestamp": datetime.utcnow().isoformat(),
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            logger.error(f"GPT-4 signal generation failed for {market_data.symbol}: {e}")
            return {
                "model": self.model_type,
                "analysis": {"error": str(e)},
                "confidence": 0.0,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def _get_system_prompt(self) -> str:
        """System prompt for financial analysis"""
        return """You are an expert quantitative analyst and trader with 20+ years of experience in Indian and global financial markets. 

Your task is to analyze market data and provide trading signals with the following JSON structure:

{
    "signal": "BUY" | "SELL" | "HOLD",
    "strength": 1-10,
    "target_price": number,
    "stop_loss": number,
    "time_horizon": "1h" | "4h" | "1d" | "1w" | "1m",
    "reasoning": "detailed explanation",
    "risk_factors": ["factor1", "factor2"],
    "market_sentiment": "extremely_bullish" | "bullish" | "neutral" | "bearish" | "extremely_bearish",
    "technical_score": 0-100,
    "fundamental_score": 0-100,
    "probability": 0-100
}

Consider technical indicators, market sentiment, volume analysis, support/resistance levels, and macroeconomic factors. Provide conservative, risk-aware recommendations."""

    def _create_analysis_prompt(self, data: MarketData) -> str:
        """Create detailed analysis prompt"""
        return f"""
Analyze {data.symbol} for trading opportunities:

PRICE DATA:
- Current Price: ₹{data.current_price}
- 24h Change: {data.change_24h}%
- Volume: {data.volume_24h:,}
- 52W High/Low: ₹{data.high_52w}/₹{data.low_52w}
- Market Cap: ₹{data.market_cap:,} Cr

TECHNICAL INDICATORS:
- RSI(14): {data.rsi_14}
- MACD Signal: {data.macd_signal}
- Bollinger Position: {data.bollinger_position}%
- Volume/SMA Ratio: {data.volume_sma_ratio}
- SMA 50: ₹{data.price_sma_50}
- SMA 200: ₹{data.price_sma_200}
- Support Levels: {data.support_levels}
- Resistance Levels: {data.resistance_levels}

FUNDAMENTAL DATA:
- P/E Ratio: {data.pe_ratio}
- Dividend Yield: {data.dividend_yield}%
- Beta: {data.beta}

Provide a comprehensive trading recommendation with risk management parameters.
"""
    
    def calculate_confidence(self, analysis: Dict[str, Any]) -> float:
        """Calculate confidence based on GPT-4 analysis quality"""
        if "error" in analysis:
            return 0.0
        
        # Multi-factor confidence scoring
        factors = []
        
        # Technical and fundamental scores
        tech_score = analysis.get("technical_score", 0) / 100
        fund_score = analysis.get("fundamental_score", 0) / 100
        probability = analysis.get("probability", 0) / 100
        
        factors.extend([tech_score, fund_score, probability])
        
        # Signal strength
        strength = analysis.get("strength", 0) / 10
        factors.append(strength)
        
        # Risk assessment
        risk_factors = len(analysis.get("risk_factors", []))
        risk_penalty = max(0, 1 - (risk_factors * 0.1))
        factors.append(risk_penalty)
        
        # Reasoning quality (simple heuristic)
        reasoning = analysis.get("reasoning", "")
        reasoning_score = min(1.0, len(reasoning) / 200)  # Reward detailed reasoning
        factors.append(reasoning_score)
        
        return float(np.mean(factors))

class ClaudeSignalModel(AISignalModel):
    """Claude-3 based signal generation"""
    
    def __init__(self):
        super().__init__(AIModelType.CLAUDE_3_SONNET)
        self.api_key = settings.claude_api_key
        self.base_url = "https://api.anthropic.com/v1/messages"
        self.rate_limit_delay = 0.5  # Anthropic rate limiting
    
    async def generate_signal(self, market_data: MarketData) -> Dict[str, Any]:
        """Generate signal using Claude analysis"""
        await self._rate_limit()
        
        if not self.api_key:
            logger.warning("Claude API key not configured")
            return self._create_error_response("Claude API key not configured")
        
        try:
            headers = {
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            
            payload = {
                "model": "claude-3-sonnet-20240229",
                "max_tokens": 1000,
                "temperature": 0.1,
                "messages": [
                    {
                        "role": "user",
                        "content": self._create_claude_prompt(market_data)
                    }
                ]
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                
                result = response.json()
                content = result["content"][0]["text"]
                
                # Parse JSON response
                analysis = json.loads(content)
                confidence = self.calculate_confidence(analysis)
                
                return {
                    "model": self.model_type,
                    "analysis": analysis,
                    "confidence": confidence,
                    "timestamp": datetime.utcnow().isoformat(),
                    "tokens_used": result.get("usage", {}).get("output_tokens", 0)
                }
                
        except Exception as e:
            logger.error(f"Claude signal generation failed for {market_data.symbol}: {e}")
            return self._create_error_response(str(e))
    
    def _create_claude_prompt(self, data: MarketData) -> str:
        """Create Claude-specific analysis prompt"""
        return f"""As an expert financial analyst, analyze {data.symbol} and provide a trading recommendation in JSON format.

Market Data:
- Price: ₹{data.current_price} (24h: {data.change_24h}%)
- Volume: {data.volume_24h:,}
- Technical: RSI={data.rsi_14}, MACD={data.macd_signal}
- Support/Resistance: {data.support_levels}/{data.resistance_levels}

Return JSON with:
- signal: BUY/SELL/HOLD
- confidence: 0-100
- target_price: number
- stop_loss: number  
- reasoning: detailed analysis
- risk_level: LOW/MEDIUM/HIGH
- time_horizon: trading timeframe

Focus on risk management and provide conservative recommendations."""
    
    def calculate_confidence(self, analysis: Dict[str, Any]) -> float:
        """Calculate confidence based on Claude analysis"""
        if "error" in analysis:
            return 0.0
        
        confidence = analysis.get("confidence", 0) / 100
        
        # Adjust based on risk level
        risk_level = analysis.get("risk_level", "HIGH")
        risk_multiplier = {"LOW": 1.0, "MEDIUM": 0.9, "HIGH": 0.8}.get(risk_level, 0.7)
        
        return float(confidence * risk_multiplier)
    
    def _create_error_response(self, error: str) -> Dict[str, Any]:
        """Create error response"""
        return {
            "model": self.model_type,
            "analysis": {"error": error},
            "confidence": 0.0,
            "timestamp": datetime.utcnow().isoformat()
        }

class CustomMLModel(AISignalModel):
    """Custom machine learning model for signals"""
    
    def __init__(self, model_type: AIModelType = AIModelType.CUSTOM_LSTM):
        super().__init__(model_type)
        self.model_cache = {}
        self.feature_cache = {}
    
    async def generate_signal(self, market_data: MarketData) -> Dict[str, Any]:
        """Generate signal using custom ML model"""
        try:
            # Feature engineering
            features = self._extract_features(market_data)
            
            # Model prediction (placeholder - would use actual trained models)
            prediction = self._predict(features)
            
            analysis = {
                "signal": prediction["action"],
                "probability": prediction["probability"],
                "confidence": prediction["confidence"],
                "features_used": len(features),
                "model_version": "v1.0"
            }
            
            confidence = prediction["confidence"] / 100
            
            return {
                "model": self.model_type,
                "analysis": analysis,
                "confidence": confidence,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Custom ML model failed for {market_data.symbol}: {e}")
            return {
                "model": self.model_type,
                "analysis": {"error": str(e)},
                "confidence": 0.0,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def _extract_features(self, data: MarketData) -> np.ndarray:
        """Extract features for ML model"""
        features = [
            data.current_price,
            data.change_24h,
            data.volume_24h,
            data.rsi_14,
            data.bollinger_position,
            data.volume_sma_ratio,
            (data.current_price - data.price_sma_50) / data.price_sma_50,
            (data.current_price - data.price_sma_200) / data.price_sma_200,
            len(data.support_levels),
            len(data.resistance_levels)
        ]
        
        # Handle None values
        features = [f if f is not None else 0.0 for f in features]
        return np.array(features, dtype=np.float32)
    
    def _predict(self, features: np.ndarray) -> Dict[str, Any]:
        """Placeholder prediction function"""
        # This would use a real trained model in production
        # For now, using simple heuristics
        
        rsi = features[3] if len(features) > 3 else 50
        price_change = features[1] if len(features) > 1 else 0
        
        if rsi < 30 and price_change < -2:
            return {"action": "BUY", "probability": 75, "confidence": 70}
        elif rsi > 70 and price_change > 2:
            return {"action": "SELL", "probability": 70, "confidence": 65}
        else:
            return {"action": "HOLD", "probability": 60, "confidence": 50}
    
    def calculate_confidence(self, analysis: Dict[str, Any]) -> float:
        """Calculate ML model confidence"""
        return analysis.get("confidence", 0) / 100

class AITradingSignalsEngine:
    """Enhanced AI Trading Signals Engine with multi-model ensemble"""
    
    def __init__(self):
        self.models = {
            AIModelType.GPT4: GPT4SignalModel(),
            AIModelType.CLAUDE_3_SONNET: ClaudeSignalModel(),
            AIModelType.CUSTOM_LSTM: CustomMLModel(AIModelType.CUSTOM_LSTM)
        }
        self.ensemble_weights = {
            AIModelType.GPT4: 0.4,
            AIModelType.CLAUDE_3_SONNET: 0.35,
            AIModelType.CUSTOM_LSTM: 0.25
        }
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes
    
    async def generate_ensemble_signal(
        self, 
        symbol: str,
        user_id: Optional[UUID] = None,
        models: Optional[List[AIModelType]] = None
    ) -> Dict[str, Any]:
        """Generate ensemble signal from multiple AI models"""
        
        # Get market data
        market_data = await self._fetch_market_data(symbol)
        if not market_data:
            return self._create_error_response(f"Failed to fetch market data for {symbol}")
        
        # Use specified models or all available models
        selected_models = models or list(self.models.keys())
        
        # Generate signals from all models concurrently
        tasks = []
        for model_type in selected_models:
            if model_type in self.models:
                task = self.models[model_type].generate_signal(market_data)
                tasks.append((model_type, task))
        
        # Collect all model results
        model_results = {}
        for model_type, task in tasks:
            try:
                result = await task
                model_results[model_type] = result
            except Exception as e:
                logger.error(f"Model {model_type} failed: {e}")
                model_results[model_type] = self._create_model_error(model_type, str(e))
        
        # Create ensemble signal
        ensemble_signal = self._create_ensemble_signal(model_results, market_data)
        
        # Store signal in database
        if user_id:
            await self._store_signal(ensemble_signal, user_id, symbol)
        
        return ensemble_signal
    
    async def _fetch_market_data(self, symbol: str) -> Optional[MarketData]:
        """Fetch comprehensive market data"""
        cache_key = f"market_data_{symbol}"
        
        # Check cache
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_ttl:
                return cached_data
        
        try:
            # Fetch from Yahoo Finance (placeholder - would use premium data feeds)
            ticker = yf.Ticker(f"{symbol}.NS")  # NSE suffix for Indian stocks
            info = ticker.info
            history = ticker.history(period="1mo")
            
            if history.empty:
                return None
            
            current_price = float(history['Close'].iloc[-1])
            change_24h = float(((current_price - history['Close'].iloc[-2]) / history['Close'].iloc[-2]) * 100)
            
            # Calculate technical indicators
            rsi_14 = self._calculate_rsi(history['Close'].values)
            sma_50 = float(history['Close'].tail(50).mean())
            sma_200 = float(history['Close'].tail(200).mean()) if len(history) >= 200 else sma_50
            
            market_data = MarketData(
                symbol=symbol,
                current_price=current_price,
                change_24h=change_24h,
                volume_24h=float(history['Volume'].iloc[-1]),
                market_cap=info.get('marketCap'),
                high_52w=float(history['High'].tail(252).max()),
                low_52w=float(history['Low'].tail(252).min()),
                pe_ratio=info.get('trailingPE'),
                dividend_yield=info.get('dividendYield'),
                beta=info.get('beta'),
                rsi_14=rsi_14,
                macd_signal="BULLISH" if current_price > sma_50 else "BEARISH",
                bollinger_position=50.0,  # Placeholder
                volume_sma_ratio=float(history['Volume'].iloc[-1] / history['Volume'].tail(20).mean()),
                price_sma_50=sma_50,
                price_sma_200=sma_200,
                support_levels=self._find_support_levels(history['Low'].values),
                resistance_levels=self._find_resistance_levels(history['High'].values)
            )
            
            # Cache the data
            self.cache[cache_key] = (market_data, time.time())
            return market_data
            
        except Exception as e:
            logger.error(f"Failed to fetch market data for {symbol}: {e}")
            return None
    
    def _calculate_rsi(self, prices: np.ndarray, period: int = 14) -> float:
        """Calculate RSI technical indicator"""
        if len(prices) < period + 1:
            return 50.0
        
        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return float(rsi)
    
    def _find_support_levels(self, lows: np.ndarray, min_touches: int = 2) -> List[float]:
        """Find support levels from price data"""
        # Simplified support level detection
        if len(lows) < 20:
            return [float(np.min(lows))]
        
        # Find local minima
        local_mins = []
        for i in range(5, len(lows) - 5):
            if all(lows[i] <= lows[i-j] for j in range(1, 6)) and \
               all(lows[i] <= lows[i+j] for j in range(1, 6)):
                local_mins.append(float(lows[i]))
        
        return sorted(local_mins)[:3]  # Return top 3 support levels
    
    def _find_resistance_levels(self, highs: np.ndarray, min_touches: int = 2) -> List[float]:
        """Find resistance levels from price data"""
        # Simplified resistance level detection
        if len(highs) < 20:
            return [float(np.max(highs))]
        
        # Find local maxima
        local_maxs = []
        for i in range(5, len(highs) - 5):
            if all(highs[i] >= highs[i-j] for j in range(1, 6)) and \
               all(highs[i] >= highs[i+j] for j in range(1, 6)):
                local_maxs.append(float(highs[i]))
        
        return sorted(local_maxs, reverse=True)[:3]  # Return top 3 resistance levels
    
    def _create_ensemble_signal(
        self, 
        model_results: Dict[AIModelType, Dict[str, Any]],
        market_data: MarketData
    ) -> Dict[str, Any]:
        """Create ensemble signal from multiple model outputs"""
        
        valid_results = {
            model: result for model, result in model_results.items()
            if "error" not in result.get("analysis", {})
        }
        
        if not valid_results:
            return self._create_error_response("All models failed to generate signals")
        
        # Extract signals and confidences
        signals = []
        confidences = []
        target_prices = []
        stop_losses = []
        
        for model_type, result in valid_results.items():
            analysis = result.get("analysis", {})
            confidence = result.get("confidence", 0.0)
            
            signal = analysis.get("signal", "HOLD")
            signals.append(signal)
            confidences.append(confidence)
            
            # Extract price targets if available
            target = analysis.get("target_price")
            if target:
                target_prices.append(float(target))
                
            stop_loss = analysis.get("stop_loss")
            if stop_loss:
                stop_losses.append(float(stop_loss))
        
        # Ensemble decision making
        signal_counts = {"BUY": 0, "SELL": 0, "HOLD": 0}
        weighted_confidence = 0.0
        
        for i, (model_type, signal) in enumerate(zip(valid_results.keys(), signals)):
            weight = self.ensemble_weights.get(model_type, 1.0 / len(valid_results))
            signal_counts[signal] += weight
            weighted_confidence += confidences[i] * weight
        
        # Final signal is majority vote
        final_signal = max(signal_counts, key=signal_counts.get)
        
        # Calculate ensemble confidence
        ensemble_confidence = weighted_confidence / sum(self.ensemble_weights.get(m, 1.0) for m in valid_results.keys())
        
        # Determine confidence level
        if ensemble_confidence >= 0.9:
            confidence_level = SignalConfidence.VERY_HIGH
        elif ensemble_confidence >= 0.8:
            confidence_level = SignalConfidence.HIGH
        elif ensemble_confidence >= 0.6:
            confidence_level = SignalConfidence.MEDIUM
        elif ensemble_confidence >= 0.4:
            confidence_level = SignalConfidence.LOW
        else:
            confidence_level = SignalConfidence.VERY_LOW
        
        return {
            "signal_id": str(uuid4()),
            "symbol": market_data.symbol,
            "signal": final_signal,
            "confidence": ensemble_confidence,
            "confidence_level": confidence_level,
            "target_price": np.mean(target_prices) if target_prices else None,
            "stop_loss": np.mean(stop_losses) if stop_losses else None,
            "current_price": market_data.current_price,
            "model_count": len(valid_results),
            "model_results": model_results,
            "signal_strength": signal_counts[final_signal],
            "market_sentiment": self._determine_market_sentiment(market_data),
            "risk_level": self._assess_risk_level(ensemble_confidence, market_data),
            "timestamp": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
    
    def _determine_market_sentiment(self, market_data: MarketData) -> MarketSentiment:
        """Determine overall market sentiment"""
        sentiment_score = 0
        
        # RSI analysis
        if market_data.rsi_14 > 70:
            sentiment_score += 2
        elif market_data.rsi_14 > 60:
            sentiment_score += 1
        elif market_data.rsi_14 < 30:
            sentiment_score -= 2
        elif market_data.rsi_14 < 40:
            sentiment_score -= 1
        
        # Price vs SMA
        if market_data.current_price > market_data.price_sma_200:
            sentiment_score += 1
        else:
            sentiment_score -= 1
        
        # Volume analysis
        if market_data.volume_sma_ratio > 1.5:
            sentiment_score += 1
        
        # Map score to sentiment
        if sentiment_score >= 3:
            return MarketSentiment.EXTREMELY_BULLISH
        elif sentiment_score >= 1:
            return MarketSentiment.BULLISH
        elif sentiment_score <= -3:
            return MarketSentiment.EXTREMELY_BEARISH
        elif sentiment_score <= -1:
            return MarketSentiment.BEARISH
        else:
            return MarketSentiment.NEUTRAL
    
    def _assess_risk_level(self, confidence: float, market_data: MarketData) -> str:
        """Assess risk level for the signal"""
        risk_factors = 0
        
        # Low confidence increases risk
        if confidence < 0.6:
            risk_factors += 2
        elif confidence < 0.8:
            risk_factors += 1
        
        # High volatility increases risk
        if abs(market_data.change_24h) > 5:
            risk_factors += 1
        
        # Low volume increases risk
        if market_data.volume_sma_ratio < 0.5:
            risk_factors += 1
        
        if risk_factors >= 3:
            return "HIGH"
        elif risk_factors >= 1:
            return "MEDIUM"
        else:
            return "LOW"
    
    async def _store_signal(self, signal: Dict[str, Any], user_id: UUID, symbol: str):
        """Store generated signal in database"""
        try:
            # This would store the signal in the database
            # Implementation depends on your database models
            logger.info(f"Signal stored for user {user_id}, symbol {symbol}")
        except Exception as e:
            logger.error(f"Failed to store signal: {e}")
    
    def _create_error_response(self, error: str) -> Dict[str, Any]:
        """Create error response"""
        return {
            "signal_id": str(uuid4()),
            "error": error,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _create_model_error(self, model_type: AIModelType, error: str) -> Dict[str, Any]:
        """Create model-specific error response"""
        return {
            "model": model_type,
            "analysis": {"error": error},
            "confidence": 0.0,
            "timestamp": datetime.utcnow().isoformat()
        }

# Global instance
ai_signals_engine = AITradingSignalsEngine()
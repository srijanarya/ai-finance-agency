#!/usr/bin/env python3
"""
Abid Hassan Options-Centric Market Analysis Agent
Replicates the systematic options analysis methodology of Abid Hassan from Sensibull
"""

import os
import json
import asyncio
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import sqlite3
from contextlib import contextmanager
import logging
from dataclasses import dataclass, asdict
from enum import Enum
import yfinance as yf
from scipy import stats
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MarketSentiment(Enum):
    STRONGLY_BULLISH = "strongly_bullish"
    BULLISH = "bullish"
    NEUTRAL = "neutral"
    BEARISH = "bearish"
    STRONGLY_BEARISH = "strongly_bearish"


class OptionsStrategy(Enum):
    BUY_CALLS = "buy_calls"
    SELL_CALLS = "sell_calls"
    BUY_PUTS = "buy_puts"
    SELL_PUTS = "sell_puts"
    IRON_CONDOR = "iron_condor"
    STRADDLE = "straddle"
    STRANGLE = "strangle"
    NO_TRADE = "no_trade"


@dataclass
class OptionChainData:
    strike: float
    call_oi: int
    put_oi: int
    call_volume: int
    put_volume: int
    call_iv: float
    put_iv: float
    call_ltp: float
    put_ltp: float
    call_change_oi: int
    put_change_oi: int


@dataclass
class PCRAnalysis:
    pcr: float
    sentiment: MarketSentiment
    signal: str
    explanation: str
    confidence: float


@dataclass
class MaxPainAnalysis:
    max_pain_strike: float
    current_price: float
    distance_from_max_pain: float
    max_pain_signal: str
    explanation: str


@dataclass
class OIAnalysis:
    resistance_levels: List[float]
    support_levels: List[float]
    key_observations: List[str]
    institutional_positioning: str
    bullish_oi_buildup: List[float]
    bearish_oi_buildup: List[float]


@dataclass
class AbidHassanAnalysis:
    symbol: str
    current_price: float
    analysis_time: datetime
    pcr_analysis: PCRAnalysis
    max_pain_analysis: MaxPainAnalysis
    oi_analysis: OIAnalysis
    overall_sentiment: MarketSentiment
    recommended_strategy: OptionsStrategy
    key_levels: Dict[str, float]
    risk_reward_setup: Dict[str, float]
    market_commentary: str


class OptionChainAnalyzer:
    """Core option chain analysis engine following Abid Hassan's methodology"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def calculate_pcr(self, option_data: List[OptionChainData]) -> float:
        """Calculate Put-Call Ratio based on Open Interest"""
        total_put_oi = sum(data.put_oi for data in option_data)
        total_call_oi = sum(data.call_oi for data in option_data)
        
        if total_call_oi == 0:
            return float('inf')
        
        return total_put_oi / total_call_oi
    
    def analyze_pcr_sentiment(self, pcr: float) -> PCRAnalysis:
        """Analyze PCR following Abid Hassan's contrarian institutional logic"""
        if pcr >= 1.3:
            return PCRAnalysis(
                pcr=pcr,
                sentiment=MarketSentiment.STRONGLY_BULLISH,
                signal="Strong Bullish (Contrarian)",
                explanation="Extremely high PCR suggests institutions comfortable selling puts - bullish signal. But watch for overbought reversal.",
                confidence=0.85
            )
        elif pcr >= 1.0:
            return PCRAnalysis(
                pcr=pcr,
                sentiment=MarketSentiment.BULLISH,
                signal="Bullish (Contrarian)",
                explanation="High PCR indicates puts outnumber calls - institutions selling puts, expecting support.",
                confidence=0.75
            )
        elif pcr <= 0.3:
            return PCRAnalysis(
                pcr=pcr,
                sentiment=MarketSentiment.STRONGLY_BULLISH,
                signal="Strong Bullish (Reversal Expected)",
                explanation="Extremely low PCR may signal bullish reversal - market too bearish.",
                confidence=0.70
            )
        elif pcr <= 0.5:
            return PCRAnalysis(
                pcr=pcr,
                sentiment=MarketSentiment.BEARISH,
                signal="Bearish",
                explanation="Low PCR suggests bearish sentiment - calls outnumber puts significantly.",
                confidence=0.65
            )
        else:  # 0.5 < pcr < 1.0
            return PCRAnalysis(
                pcr=pcr,
                sentiment=MarketSentiment.NEUTRAL,
                signal="Neutral",
                explanation="Balanced PCR - no clear directional bias from options positioning.",
                confidence=0.50
            )
    
    def calculate_max_pain(self, option_data: List[OptionChainData]) -> float:
        """Calculate Max Pain - strike where option sellers have least loss"""
        max_pain_values = {}
        
        for data in option_data:
            strike = data.strike
            total_pain = 0
            
            # Calculate pain for this strike price
            for other_data in option_data:
                other_strike = other_data.strike
                
                # Call pain calculation
                if strike > other_strike:
                    call_pain = (strike - other_strike) * other_data.call_oi
                    total_pain += call_pain
                
                # Put pain calculation  
                if strike < other_strike:
                    put_pain = (other_strike - strike) * other_data.put_oi
                    total_pain += put_pain
            
            max_pain_values[strike] = total_pain
        
        # Find strike with minimum total pain
        if max_pain_values:
            return min(max_pain_values.items(), key=lambda x: x[1])[0]
        return 0.0
    
    def analyze_max_pain(self, max_pain_strike: float, current_price: float) -> MaxPainAnalysis:
        """Analyze Max Pain implications following Hassan's framework"""
        distance = current_price - max_pain_strike
        distance_pct = (distance / current_price) * 100
        
        if abs(distance_pct) < 1:
            signal = "Strong Max Pain Magnet"
            explanation = f"Price very close to Max Pain ({max_pain_strike}). Expect consolidation around this level."
        elif distance > 0:
            if distance_pct > 3:
                signal = "Strong Downward Pull Expected"
                explanation = f"Price {distance_pct:.1f}% above Max Pain. Strong gravitational pull downward expected."
            else:
                signal = "Moderate Downward Bias"
                explanation = f"Price above Max Pain by {distance_pct:.1f}%. Mild downward bias expected."
        else:
            if abs(distance_pct) > 3:
                signal = "Strong Upward Pull Expected" 
                explanation = f"Price {abs(distance_pct):.1f}% below Max Pain. Strong upward pull expected."
            else:
                signal = "Moderate Upward Bias"
                explanation = f"Price below Max Pain by {abs(distance_pct):.1f}%. Mild upward bias expected."
        
        return MaxPainAnalysis(
            max_pain_strike=max_pain_strike,
            current_price=current_price,
            distance_from_max_pain=distance,
            max_pain_signal=signal,
            explanation=explanation
        )
    
    def analyze_oi_patterns(self, option_data: List[OptionChainData], current_price: float) -> OIAnalysis:
        """Analyze Open Interest patterns for support/resistance identification"""
        # Sort by strike price
        sorted_data = sorted(option_data, key=lambda x: x.strike)
        
        resistance_levels = []
        support_levels = []
        key_observations = []
        bullish_oi_buildup = []
        bearish_oi_buildup = []
        
        # Find high OI concentrations
        call_oi_threshold = np.percentile([d.call_oi for d in sorted_data], 80)
        put_oi_threshold = np.percentile([d.put_oi for d in sorted_data], 80)
        
        for data in sorted_data:
            # High Call OI = Resistance (institutions selling calls)
            if data.call_oi > call_oi_threshold and data.strike > current_price:
                resistance_levels.append(data.strike)
                key_observations.append(f"Strong Call OI at {data.strike} ({data.call_oi:,}) - Resistance expected")
            
            # High Put OI = Support (institutions selling puts)  
            if data.put_oi > put_oi_threshold and data.strike < current_price:
                support_levels.append(data.strike)
                key_observations.append(f"Strong Put OI at {data.strike} ({data.put_oi:,}) - Support expected")
            
            # Analyze OI changes for directional bias
            if data.call_change_oi > 0 and data.strike > current_price:
                bearish_oi_buildup.append(data.strike)
            
            if data.put_change_oi > 0 and data.strike < current_price:
                bullish_oi_buildup.append(data.strike)
        
        # Determine institutional positioning
        if len(bullish_oi_buildup) > len(bearish_oi_buildup):
            positioning = "Institutions positioning for upside - Put selling dominant"
        elif len(bearish_oi_buildup) > len(bullish_oi_buildup):
            positioning = "Institutions positioning for downside - Call selling dominant"
        else:
            positioning = "Balanced institutional positioning - No clear directional bias"
        
        return OIAnalysis(
            resistance_levels=sorted(resistance_levels)[:3],  # Top 3
            support_levels=sorted(support_levels, reverse=True)[:3],  # Top 3
            key_observations=key_observations,
            institutional_positioning=positioning,
            bullish_oi_buildup=bullish_oi_buildup,
            bearish_oi_buildup=bearish_oi_buildup
        )


class AbidHassanAnalyzer:
    """Main analyzer implementing Abid Hassan's complete methodology"""
    
    def __init__(self, db_path: str = "data/agency.db"):
        self.db_path = db_path
        self.option_analyzer = OptionChainAnalyzer()
        self.logger = logging.getLogger(__name__)
        self.initialize_database()
    
    def initialize_database(self):
        """Initialize database tables for options analysis"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS abid_hassan_analysis (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    analysis_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    current_price REAL,
                    pcr REAL,
                    pcr_sentiment TEXT,
                    max_pain_strike REAL,
                    overall_sentiment TEXT,
                    recommended_strategy TEXT,
                    market_commentary TEXT,
                    analysis_data TEXT
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS option_chain_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    expiry_date DATE,
                    strike REAL,
                    call_oi INTEGER,
                    put_oi INTEGER,
                    call_volume INTEGER,
                    put_volume INTEGER,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            self.logger.info("Abid Hassan analyzer database initialized")
    
    def get_sample_option_data(self, symbol: str) -> List[OptionChainData]:
        """Generate sample option chain data for testing"""
        # This would be replaced with actual Kite MCP integration
        current_price = 19500 if symbol == "NIFTY" else 45000  # Sample prices
        
        strikes = []
        base_strike = int(current_price // 50) * 50  # Round to nearest 50
        
        for i in range(-10, 11):  # 21 strikes around current price
            strikes.append(base_strike + (i * 50))
        
        option_data = []
        for strike in strikes:
            distance_from_atm = abs(strike - current_price) / current_price
            
            # Simulate OI patterns - higher OI at round numbers and ATM
            base_oi = max(10000 - int(distance_from_atm * 50000), 1000)
            
            # Add some randomness
            call_oi = base_oi + np.random.randint(-2000, 2000)
            put_oi = base_oi + np.random.randint(-2000, 2000)
            
            # Simulate some patterns
            if strike > current_price:  # OTM calls - resistance
                call_oi *= 1.2
            if strike < current_price:  # OTM puts - support  
                put_oi *= 1.2
            
            option_data.append(OptionChainData(
                strike=strike,
                call_oi=int(call_oi),
                put_oi=int(put_oi),
                call_volume=int(call_oi * 0.1),
                put_volume=int(put_oi * 0.1),
                call_iv=15 + distance_from_atm * 10,
                put_iv=15 + distance_from_atm * 10,
                call_ltp=max(strike - current_price, 0.05) if strike > current_price else max(current_price - strike + 50, 50),
                put_ltp=max(current_price - strike, 0.05) if strike < current_price else max(strike - current_price + 50, 50),
                call_change_oi=np.random.randint(-1000, 1000),
                put_change_oi=np.random.randint(-1000, 1000)
            ))
        
        return option_data
    
    def determine_overall_sentiment(self, pcr_analysis: PCRAnalysis, max_pain_analysis: MaxPainAnalysis, oi_analysis: OIAnalysis) -> MarketSentiment:
        """Combine all signals to determine overall market sentiment"""
        sentiment_scores = {
            MarketSentiment.STRONGLY_BEARISH: -2,
            MarketSentiment.BEARISH: -1,
            MarketSentiment.NEUTRAL: 0,
            MarketSentiment.BULLISH: 1,
            MarketSentiment.STRONGLY_BULLISH: 2
        }
        
        # Weight PCR analysis (40%)
        total_score = sentiment_scores[pcr_analysis.sentiment] * 0.4
        
        # Weight Max Pain (30%)
        if "Upward" in max_pain_analysis.max_pain_signal:
            total_score += 0.3
        elif "Downward" in max_pain_analysis.max_pain_signal:
            total_score -= 0.3
        
        # Weight OI analysis (30%)
        if "upside" in oi_analysis.institutional_positioning.lower():
            total_score += 0.3
        elif "downside" in oi_analysis.institutional_positioning.lower():
            total_score -= 0.3
        
        # Convert back to sentiment
        if total_score >= 1.5:
            return MarketSentiment.STRONGLY_BULLISH
        elif total_score >= 0.5:
            return MarketSentiment.BULLISH
        elif total_score <= -1.5:
            return MarketSentiment.STRONGLY_BEARISH
        elif total_score <= -0.5:
            return MarketSentiment.BEARISH
        else:
            return MarketSentiment.NEUTRAL
    
    def recommend_strategy(self, sentiment: MarketSentiment, vix_level: float = 15) -> OptionsStrategy:
        """Recommend options strategy based on sentiment and VIX"""
        if vix_level > 22:  # High volatility - favor buying
            if sentiment in [MarketSentiment.BULLISH, MarketSentiment.STRONGLY_BULLISH]:
                return OptionsStrategy.BUY_CALLS
            elif sentiment in [MarketSentiment.BEARISH, MarketSentiment.STRONGLY_BEARISH]:
                return OptionsStrategy.BUY_PUTS
            else:
                return OptionsStrategy.STRADDLE
        
        elif vix_level < 15:  # Low volatility - favor selling
            if sentiment in [MarketSentiment.BULLISH, MarketSentiment.STRONGLY_BULLISH]:
                return OptionsStrategy.SELL_PUTS
            elif sentiment in [MarketSentiment.BEARISH, MarketSentiment.STRONGLY_BEARISH]:
                return OptionsStrategy.SELL_CALLS
            else:
                return OptionsStrategy.IRON_CONDOR
        
        else:  # Medium volatility
            if sentiment == MarketSentiment.NEUTRAL:
                return OptionsStrategy.NO_TRADE
            elif sentiment in [MarketSentiment.BULLISH, MarketSentiment.STRONGLY_BULLISH]:
                return OptionsStrategy.BUY_CALLS
            else:
                return OptionsStrategy.BUY_PUTS
    
    def generate_market_commentary(self, analysis: 'AbidHassanAnalysis') -> str:
        """Generate market commentary in Abid Hassan's style"""
        commentary = []
        
        # Opening with institutional positioning
        commentary.append(f"🎯 Market Analysis for {analysis.symbol} at ₹{analysis.current_price:,.0f}")
        commentary.append(f"📊 Put-Call Ratio: {analysis.pcr_analysis.pcr:.2f} - {analysis.pcr_analysis.signal}")
        commentary.append(f"💡 {analysis.pcr_analysis.explanation}")
        
        # Max Pain analysis
        commentary.append(f"\n🎪 Max Pain Analysis:")
        commentary.append(f"Max Pain Strike: ₹{analysis.max_pain_analysis.max_pain_strike:,.0f}")
        commentary.append(f"{analysis.max_pain_analysis.explanation}")
        
        # OI patterns
        commentary.append(f"\n📈 Open Interest Insights:")
        commentary.append(f"Institutional View: {analysis.oi_analysis.institutional_positioning}")
        
        if analysis.oi_analysis.resistance_levels:
            resistance_str = ", ".join([f"₹{level:,.0f}" for level in analysis.oi_analysis.resistance_levels])
            commentary.append(f"Key Resistance Levels: {resistance_str}")
        
        if analysis.oi_analysis.support_levels:
            support_str = ", ".join([f"₹{level:,.0f}" for level in analysis.oi_analysis.support_levels])
            commentary.append(f"Key Support Levels: {support_str}")
        
        # Overall view and strategy
        commentary.append(f"\n🧠 Abid Hassan Style Analysis:")
        commentary.append(f"Overall Sentiment: {analysis.overall_sentiment.value.replace('_', ' ').title()}")
        commentary.append(f"Recommended Strategy: {analysis.recommended_strategy.value.replace('_', ' ').title()}")
        
        # Risk management reminder (Hassan's signature style)
        commentary.append(f"\n⚠️ Risk Management Reminder:")
        commentary.append(f"Remember: 'Big guys (institutions) are usually right.' Trade with the smart money flow.")
        commentary.append(f"Never risk more than 1-2% of capital per trade. Psychology > Technical analysis.")
        
        return "\n".join(commentary)
    
    async def analyze_symbol(self, symbol: str) -> AbidHassanAnalysis:
        """Perform complete Abid Hassan style analysis for a symbol"""
        try:
            # Get option chain data (this would integrate with Kite MCP)
            option_data = self.get_sample_option_data(symbol)
            current_price = 19500 if symbol == "NIFTY" else 45000
            
            # PCR Analysis
            pcr = self.option_analyzer.calculate_pcr(option_data)
            pcr_analysis = self.option_analyzer.analyze_pcr_sentiment(pcr)
            
            # Max Pain Analysis  
            max_pain_strike = self.option_analyzer.calculate_max_pain(option_data)
            max_pain_analysis = self.option_analyzer.analyze_max_pain(max_pain_strike, current_price)
            
            # OI Pattern Analysis
            oi_analysis = self.option_analyzer.analyze_oi_patterns(option_data, current_price)
            
            # Overall sentiment and strategy
            overall_sentiment = self.determine_overall_sentiment(pcr_analysis, max_pain_analysis, oi_analysis)
            recommended_strategy = self.recommend_strategy(overall_sentiment)
            
            # Key levels
            key_levels = {
                'current_price': current_price,
                'max_pain': max_pain_strike,
                'immediate_resistance': oi_analysis.resistance_levels[0] if oi_analysis.resistance_levels else current_price * 1.02,
                'immediate_support': oi_analysis.support_levels[0] if oi_analysis.support_levels else current_price * 0.98
            }
            
            # Risk-reward setup
            risk_reward_setup = {
                'upside_target': key_levels['immediate_resistance'],
                'downside_target': key_levels['immediate_support'],
                'risk_reward_ratio': abs(key_levels['immediate_resistance'] - current_price) / abs(current_price - key_levels['immediate_support']) if key_levels['immediate_support'] != current_price else 1.0
            }
            
            analysis = AbidHassanAnalysis(
                symbol=symbol,
                current_price=current_price,
                analysis_time=datetime.now(),
                pcr_analysis=pcr_analysis,
                max_pain_analysis=max_pain_analysis,
                oi_analysis=oi_analysis,
                overall_sentiment=overall_sentiment,
                recommended_strategy=recommended_strategy,
                key_levels=key_levels,
                risk_reward_setup=risk_reward_setup,
                market_commentary=""
            )
            
            # Generate commentary
            analysis.market_commentary = self.generate_market_commentary(analysis)
            
            # Store in database
            await self.save_analysis(analysis)
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing {symbol}: {e}")
            raise
    
    async def save_analysis(self, analysis: AbidHassanAnalysis):
        """Save analysis to database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO abid_hassan_analysis 
                (symbol, current_price, pcr, pcr_sentiment, max_pain_strike, 
                 overall_sentiment, recommended_strategy, market_commentary, analysis_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                analysis.symbol,
                analysis.current_price,
                analysis.pcr_analysis.pcr,
                analysis.pcr_analysis.sentiment.value,
                analysis.max_pain_analysis.max_pain_strike,
                analysis.overall_sentiment.value,
                analysis.recommended_strategy.value,
                analysis.market_commentary,
                json.dumps(asdict(analysis), default=str)
            ))
            
            conn.commit()
            self.logger.info(f"Analysis saved for {analysis.symbol}")
    
    async def get_daily_analysis(self, symbols: List[str] = None) -> List[AbidHassanAnalysis]:
        """Generate daily analysis for multiple symbols"""
        if symbols is None:
            symbols = ["NIFTY", "BANKNIFTY"]
        
        analyses = []
        for symbol in symbols:
            try:
                analysis = await self.analyze_symbol(symbol)
                analyses.append(analysis)
                self.logger.info(f"Completed analysis for {symbol}")
            except Exception as e:
                self.logger.error(f"Failed to analyze {symbol}: {e}")
        
        return analyses
    
    async def run_continuous_analysis(self, symbols: List[str] = None, interval_minutes: int = 15):
        """Run continuous analysis like Abid Hassan's daily show"""
        if symbols is None:
            symbols = ["NIFTY", "BANKNIFTY"]
        
        self.logger.info(f"Starting continuous Abid Hassan analysis for {symbols}")
        
        while True:
            try:
                current_time = datetime.now()
                
                # Only analyze during market hours (9:15 AM to 3:30 PM IST)
                if 9 <= current_time.hour < 15 or (current_time.hour == 15 and current_time.minute <= 30):
                    analyses = await self.get_daily_analysis(symbols)
                    
                    for analysis in analyses:
                        print(f"\n{'='*50}")
                        print(analysis.market_commentary)
                        print(f"{'='*50}")
                    
                    self.logger.info(f"Completed analysis cycle for {len(analyses)} symbols")
                else:
                    self.logger.info("Market closed - waiting for next session")
                
                # Wait for next analysis cycle
                await asyncio.sleep(interval_minutes * 60)
                
            except Exception as e:
                self.logger.error(f"Error in continuous analysis: {e}")
                await asyncio.sleep(60)


async def main():
    """Main function for testing the analyzer"""
    analyzer = AbidHassanAnalyzer()
    
    print("🚀 Abid Hassan Options Analysis System")
    print("Analyzing NIFTY and BANKNIFTY...")
    
    analyses = await analyzer.get_daily_analysis(["NIFTY", "BANKNIFTY"])
    
    for analysis in analyses:
        print(f"\n{'='*60}")
        print(analysis.market_commentary)
        print(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(main())
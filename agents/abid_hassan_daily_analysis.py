#!/usr/bin/env python3
"""
Daily Market Analysis Generator - "Kya lag raha hai market" Style
Generates comprehensive daily market analysis following Abid Hassan's methodology
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import pandas as pd
from dataclasses import dataclass, asdict
import os

from .abid_hassan_analyzer import AbidHassanAnalyzer, MarketSentiment, OptionsStrategy
from .kite_option_data import AbidHassanKiteIntegration

logger = logging.getLogger(__name__)


@dataclass
class MarketOutlook:
    timeframe: str  # "intraday", "short_term", "medium_term"
    direction: str
    confidence: float
    key_levels: Dict[str, float]
    rationale: str


@dataclass 
class TradingSetup:
    strategy_name: str
    entry_criteria: str
    target: float
    stop_loss: float
    risk_reward_ratio: float
    position_size: str
    time_horizon: str


@dataclass
class DailyMarketReport:
    report_date: datetime
    symbol: str
    current_price: float
    market_sentiment: MarketSentiment
    global_cues: Dict
    fii_dii_analysis: Dict
    technical_outlook: MarketOutlook
    options_outlook: MarketOutlook
    key_events: List[str]
    trading_setups: List[TradingSetup]
    risk_factors: List[str]
    abid_commentary: str
    next_day_outlook: str


class DailyAnalysisGenerator:
    """Generates comprehensive daily market analysis in Abid Hassan's style"""
    
    def __init__(self, db_path: str = "data/agency.db"):
        self.db_path = db_path
        self.abid_analyzer = AbidHassanAnalyzer(db_path)
        self.kite_integration = None
        self.logger = logging.getLogger(__name__)
        
    async def initialize(self):
        """Initialize all components"""
        try:
            # Initialize Kite integration for real data
            self.kite_integration = AbidHassanKiteIntegration()
            await self.kite_integration.initialize()
            self.logger.info("Daily analysis generator initialized")
            return True
        except Exception as e:
            self.logger.error(f"Failed to initialize: {e}")
            return False
    
    async def get_global_market_cues(self) -> Dict:
        """Analyze global market cues affecting Indian markets"""
        try:
            # This would integrate with global market data
            # Simulated global cues
            global_cues = {
                "us_markets": {
                    "dow_change": 0.5,
                    "nasdaq_change": 0.8,
                    "sp500_change": 0.3,
                    "sentiment": "Positive"
                },
                "asian_markets": {
                    "nikkei_change": 1.2,
                    "hang_seng_change": -0.3,
                    "shanghai_change": 0.1,
                    "sentiment": "Mixed"
                },
                "commodities": {
                    "crude_oil_change": 2.1,
                    "gold_change": -0.5,
                    "silver_change": -0.8
                },
                "currency": {
                    "usd_inr_change": 0.1,
                    "dxy_change": -0.2
                },
                "bond_yields": {
                    "us_10yr": 4.2,
                    "india_10yr": 7.1
                }
            }
            
            return global_cues
            
        except Exception as e:
            self.logger.error(f"Error fetching global cues: {e}")
            return {}
    
    def analyze_global_impact(self, global_cues: Dict) -> str:
        """Analyze global cues impact on Indian markets - Abid Hassan style"""
        commentary = []
        
        # US Markets impact
        us_sentiment = global_cues.get("us_markets", {}).get("sentiment", "Neutral")
        if us_sentiment == "Positive":
            commentary.append("🇺🇸 US markets closed positive - supportive for our opening")
        elif us_sentiment == "Negative":
            commentary.append("🇺🇸 US markets weak - expect cautious opening")
        
        # Asian markets
        asian_sentiment = global_cues.get("asian_markets", {}).get("sentiment", "Mixed")
        commentary.append(f"🌏 Asian markets showing {asian_sentiment.lower()} signals")
        
        # Crude oil impact
        crude_change = global_cues.get("commodities", {}).get("crude_oil_change", 0)
        if abs(crude_change) > 1:
            direction = "up" if crude_change > 0 else "down"
            commentary.append(f"🛢️ Crude oil {direction} {abs(crude_change):.1f}% - watch OMCs and inflation impact")
        
        # USD-INR impact
        usd_inr_change = global_cues.get("currency", {}).get("usd_inr_change", 0)
        if abs(usd_inr_change) > 0.3:
            direction = "stronger" if usd_inr_change > 0 else "weaker"
            commentary.append(f"💱 USD-INR showing {direction} bias - IT stocks in focus")
        
        return " | ".join(commentary) if commentary else "Global cues neutral to mixed"
    
    async def analyze_fii_dii_flows(self) -> Dict:
        """Analyze FII/DII flows with Abid Hassan's interpretation"""
        try:
            if self.kite_integration:
                fii_dii_data = await self.kite_integration.kite_fetcher.get_fii_dii_data()
            else:
                # Fallback simulated data
                fii_dii_data = {
                    "fii": {"equity": {"net": 500.0}},
                    "dii": {"equity": {"net": 300.0}}
                }
            
            fii_net = fii_dii_data.get("fii", {}).get("equity", {}).get("net", 0)
            dii_net = fii_dii_data.get("dii", {}).get("equity", {}).get("net", 0)
            
            analysis = {
                "fii_net": fii_net,
                "dii_net": dii_net,
                "net_institutional": fii_net + dii_net,
                "interpretation": self.interpret_institutional_flows(fii_net, dii_net)
            }
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing FII/DII flows: {e}")
            return {}
    
    def interpret_institutional_flows(self, fii_net: float, dii_net: float) -> str:
        """Interpret institutional flows in Abid Hassan style"""
        if fii_net > 1000 and dii_net > 500:
            return "🟢 Strong institutional buying from both FIIs and DIIs - Very bullish setup"
        elif fii_net > 1000:
            return "🟢 Heavy FII buying - Bullish, but watch DII response"
        elif dii_net > 1000:
            return "🟡 Strong DII buying offsetting FII selling - Supportive"
        elif fii_net < -1000 and dii_net < -500:
            return "🔴 Heavy selling from both FIIs and DIIs - Very bearish"
        elif fii_net < -1000:
            return "🔴 Heavy FII selling - Bearish pressure"
        elif abs(fii_net) < 500 and abs(dii_net) < 500:
            return "⚪ Minimal institutional activity - Range-bound likely"
        else:
            return "🟡 Mixed institutional flows - Watch for clarity"
    
    def generate_technical_outlook(self, symbol: str, current_price: float, 
                                 historical_data: pd.DataFrame = None) -> MarketOutlook:
        """Generate technical analysis outlook"""
        try:
            # This would use actual technical analysis
            # Simulated technical outlook
            resistance = current_price * 1.02
            support = current_price * 0.98
            
            return MarketOutlook(
                timeframe="intraday",
                direction="Neutral to Bullish",
                confidence=0.7,
                key_levels={
                    "immediate_resistance": resistance,
                    "immediate_support": support,
                    "strong_resistance": current_price * 1.05,
                    "strong_support": current_price * 0.95
                },
                rationale=f"Price trading near key levels. Watch {resistance:.0f} resistance and {support:.0f} support"
            )
            
        except Exception as e:
            self.logger.error(f"Error generating technical outlook: {e}")
            return MarketOutlook("intraday", "Neutral", 0.5, {}, "Technical analysis unavailable")
    
    def generate_trading_setups(self, analysis, vix_level: float) -> List[TradingSetup]:
        """Generate trading setups based on analysis"""
        setups = []
        
        try:
            current_price = analysis.current_price
            sentiment = analysis.overall_sentiment
            
            # Strategy 1: Based on overall sentiment
            if sentiment in [MarketSentiment.BULLISH, MarketSentiment.STRONGLY_BULLISH]:
                if vix_level > 20:
                    # High volatility - buy options
                    setups.append(TradingSetup(
                        strategy_name="Long Call",
                        entry_criteria=f"Buy ATM Call if {analysis.symbol} sustains above {current_price:.0f}",
                        target=analysis.key_levels.get('immediate_resistance', current_price * 1.02),
                        stop_loss=current_price * 0.98,
                        risk_reward_ratio=2.0,
                        position_size="2-3% of capital",
                        time_horizon="Intraday to 2-3 days"
                    ))
                else:
                    # Low volatility - sell options
                    setups.append(TradingSetup(
                        strategy_name="Short Put",
                        entry_criteria=f"Sell OTM Put below {analysis.key_levels.get('immediate_support', current_price * 0.98):.0f}",
                        target=current_price * 0.99,
                        stop_loss=current_price * 0.96,
                        risk_reward_ratio=3.0,
                        position_size="5-10% of capital as margin",
                        time_horizon="Till expiry"
                    ))
            
            # Strategy 2: Max Pain based setup
            max_pain = analysis.max_pain_analysis.max_pain_strike
            distance_from_mp = abs(current_price - max_pain) / current_price * 100
            
            if distance_from_mp > 2:
                setups.append(TradingSetup(
                    strategy_name="Max Pain Reversion",
                    entry_criteria=f"Expect move towards Max Pain {max_pain:.0f}",
                    target=max_pain,
                    stop_loss=current_price * (1.015 if current_price > max_pain else 0.985),
                    risk_reward_ratio=1.5,
                    position_size="3-5% of capital",
                    time_horizon="2-3 days before expiry"
                ))
            
            # Strategy 3: PCR based contrarian
            pcr = analysis.pcr_analysis.pcr
            if pcr > 1.3:
                setups.append(TradingSetup(
                    strategy_name="PCR Contrarian Bullish",
                    entry_criteria=f"Very high PCR {pcr:.2f} - contrarian bullish",
                    target=current_price * 1.025,
                    stop_loss=current_price * 0.985,
                    risk_reward_ratio=1.8,
                    position_size="2-4% of capital",
                    time_horizon="1-2 days"
                ))
            
            return setups
            
        except Exception as e:
            self.logger.error(f"Error generating trading setups: {e}")
            return []
    
    def generate_abid_commentary(self, report: DailyMarketReport) -> str:
        """Generate market commentary in Abid Hassan's distinctive style"""
        commentary = []
        
        # Opening with characteristic humility and experience
        commentary.append(f"🙏 Namaste everyone! Kya lag raha hai market today?")
        commentary.append(f"Let me share what the big guys (institutions) are telling us through the options data.")
        
        # Global setup
        commentary.append(f"\n🌍 GLOBAL SETUP:")
        commentary.append(f"{self.analyze_global_impact(report.global_cues)}")
        
        # FII/DII Analysis
        fii_dii = report.fii_dii_analysis
        commentary.append(f"\n💰 INSTITUTIONAL FLOWS:")
        commentary.append(f"FII Net: ₹{fii_dii.get('fii_net', 0):,.0f} Cr | DII Net: ₹{fii_dii.get('dii_net', 0):,.0f} Cr")
        commentary.append(f"📊 {fii_dii.get('interpretation', 'Data unavailable')}")
        
        # Current market snapshot
        commentary.append(f"\n📈 {report.symbol} SNAPSHOT:")
        commentary.append(f"Current Level: ₹{report.current_price:,.0f}")
        commentary.append(f"Market Sentiment: {report.market_sentiment.value.replace('_', ' ').title()}")
        
        # Options analysis - The core of Abid's methodology
        commentary.append(f"\n🎯 OPTIONS ANALYSIS (The Real Story):")
        commentary.append(f"Put-Call Ratio: {report.abid_commentary}")  # This contains PCR analysis
        
        # Key levels from institutional positioning
        technical = report.technical_outlook
        commentary.append(f"\n🔍 KEY LEVELS TO WATCH:")
        commentary.append(f"Immediate Resistance: ₹{technical.key_levels.get('immediate_resistance', 0):,.0f}")
        commentary.append(f"Immediate Support: ₹{technical.key_levels.get('immediate_support', 0):,.0f}")
        
        # Trading setups with risk management focus
        if report.trading_setups:
            commentary.append(f"\n💡 HIGH PROBABILITY SETUPS:")
            for i, setup in enumerate(report.trading_setups[:2], 1):  # Top 2 setups
                commentary.append(f"{i}. {setup.strategy_name}: {setup.entry_criteria}")
                commentary.append(f"   Target: ₹{setup.target:,.0f} | SL: ₹{setup.stop_loss:,.0f} | R:R = {setup.risk_reward_ratio}")
        
        # Risk factors and what to watch
        if report.risk_factors:
            commentary.append(f"\n⚠️  WHAT CAN GO WRONG:")
            for risk in report.risk_factors[:3]:  # Top 3 risks
                commentary.append(f"• {risk}")
        
        # Tomorrow's outlook
        commentary.append(f"\n🔮 TOMORROW'S OUTLOOK:")
        commentary.append(f"{report.next_day_outlook}")
        
        # Signature Abid Hassan wisdom
        commentary.append(f"\n🧠 ABID'S WISDOM:")
        commentary.append(f"Remember: Trading is 90% psychology, 10% numbers.")
        commentary.append(f"The big guys (institutions) are usually right. Follow the smart money flow.")
        commentary.append(f"Never risk more than 1-2% of your capital per trade.")
        commentary.append(f"If you're not sure, don't trade. Markets will always be there tomorrow.")
        
        # Sign off
        commentary.append(f"\n🙏 Trade safely, trade smartly!")
        commentary.append(f"Remember: 90% of the money you'll ever have is coming after age 30.")
        commentary.append(f"Focus on getting good at trading, money will follow.")
        
        return "\n".join(commentary)
    
    def identify_risk_factors(self, symbol: str, analysis, global_cues: Dict) -> List[str]:
        """Identify key risk factors for the day"""
        risks = []
        
        try:
            # VIX based risks
            if hasattr(analysis, 'india_vix'):
                vix = getattr(analysis, 'india_vix', 15)
                if vix > 22:
                    risks.append(f"High volatility environment (VIX: {vix:.1f}) - expect sharp moves")
                elif vix < 12:
                    risks.append(f"Complacency risk (VIX: {vix:.1f}) - sudden spike possible")
            
            # Global risks
            us_sentiment = global_cues.get("us_markets", {}).get("sentiment", "Neutral")
            if us_sentiment == "Negative":
                risks.append("US market weakness could lead to gap down opening")
            
            # Technical risks
            current_price = analysis.current_price
            max_pain = analysis.max_pain_analysis.max_pain_strike
            distance = abs(current_price - max_pain) / current_price * 100
            
            if distance > 3:
                risks.append(f"Price {distance:.1f}% away from Max Pain - expect pullback towards ₹{max_pain:.0f}")
            
            # Options positioning risks
            pcr = analysis.pcr_analysis.pcr
            if pcr > 1.4:
                risks.append("Extremely high PCR - watch for sudden reversal if sentiment changes")
            elif pcr < 0.3:
                risks.append("Very low PCR - market could be overly bullish, reversal risk")
            
            # Event risks
            current_time = datetime.now()
            if current_time.weekday() == 3:  # Thursday - expiry day
                risks.append("Weekly expiry day - expect increased volatility and pin risk")
            
            # Add generic risk if no specific risks identified
            if not risks:
                risks.append("Market can remain irrational longer than you can stay solvent")
            
            return risks[:5]  # Top 5 risks
            
        except Exception as e:
            self.logger.error(f"Error identifying risks: {e}")
            return ["Risk assessment unavailable"]
    
    def generate_next_day_outlook(self, analysis, global_cues: Dict) -> str:
        """Generate next day outlook"""
        try:
            outlook_factors = []
            
            # Based on institutional flows
            fii_net = global_cues.get("fii_net", 0)
            if fii_net > 500:
                outlook_factors.append("FII buying support should continue")
            elif fii_net < -500:
                outlook_factors.append("FII selling pressure may persist")
            
            # Based on options positioning
            sentiment = analysis.overall_sentiment
            if sentiment in [MarketSentiment.BULLISH, MarketSentiment.STRONGLY_BULLISH]:
                outlook_factors.append("Options positioning suggests bullish continuation")
            elif sentiment in [MarketSentiment.BEARISH, MarketSentiment.STRONGLY_BEARISH]:
                outlook_factors.append("Bearish options setup indicates downside risk")
            
            # Max Pain influence
            max_pain = analysis.max_pain_analysis.max_pain_strike
            current_price = analysis.current_price
            if abs(current_price - max_pain) > current_price * 0.02:
                outlook_factors.append(f"Max Pain pull towards ₹{max_pain:.0f} expected")
            
            if outlook_factors:
                return f"Tomorrow expecting: {' | '.join(outlook_factors)}"
            else:
                return "Range-bound consolidation expected with stock-specific action"
                
        except Exception as e:
            self.logger.error(f"Error generating outlook: {e}")
            return "Outlook assessment unavailable"
    
    async def generate_daily_report(self, symbol: str = "NIFTY") -> DailyMarketReport:
        """Generate comprehensive daily market report"""
        try:
            self.logger.info(f"Generating daily report for {symbol}")
            
            # Get Abid Hassan analysis
            analysis = await self.abid_analyzer.analyze_symbol(symbol)
            
            # Get additional data
            global_cues = await self.get_global_market_cues()
            fii_dii_analysis = await self.analyze_fii_dii_flows()
            
            # Get VIX for strategy recommendations
            vix_level = 15.0  # Default
            if self.kite_integration:
                vix_level = await self.kite_integration.kite_fetcher.get_india_vix()
            
            # Generate technical outlook
            technical_outlook = self.generate_technical_outlook(symbol, analysis.current_price)
            
            # Generate options outlook (same timeframe as technical but options-focused)
            options_outlook = MarketOutlook(
                timeframe="intraday",
                direction=analysis.overall_sentiment.value.replace('_', ' ').title(),
                confidence=analysis.pcr_analysis.confidence,
                key_levels={
                    "max_pain": analysis.max_pain_analysis.max_pain_strike,
                    "pcr": analysis.pcr_analysis.pcr
                },
                rationale=f"Options data suggests {analysis.overall_sentiment.value} bias"
            )
            
            # Generate trading setups
            trading_setups = self.generate_trading_setups(analysis, vix_level)
            
            # Identify risk factors
            risk_factors = self.identify_risk_factors(symbol, analysis, {**global_cues, **fii_dii_analysis})
            
            # Generate next day outlook
            next_day_outlook = self.generate_next_day_outlook(analysis, {**global_cues, **fii_dii_analysis})
            
            # Create report
            report = DailyMarketReport(
                report_date=datetime.now(),
                symbol=symbol,
                current_price=analysis.current_price,
                market_sentiment=analysis.overall_sentiment,
                global_cues=global_cues,
                fii_dii_analysis=fii_dii_analysis,
                technical_outlook=technical_outlook,
                options_outlook=options_outlook,
                key_events=[],  # Would be populated with actual events
                trading_setups=trading_setups,
                risk_factors=risk_factors,
                abid_commentary=analysis.market_commentary,
                next_day_outlook=next_day_outlook
            )
            
            # Generate final commentary
            report.abid_commentary = self.generate_abid_commentary(report)
            
            # Save report
            await self.save_daily_report(report)
            
            self.logger.info(f"Daily report generated for {symbol}")
            return report
            
        except Exception as e:
            self.logger.error(f"Error generating daily report: {e}")
            raise
    
    async def save_daily_report(self, report: DailyMarketReport):
        """Save daily report to database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS daily_reports (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        report_date DATE,
                        symbol TEXT,
                        current_price REAL,
                        market_sentiment TEXT,
                        report_data TEXT,
                        abid_commentary TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                cursor.execute('''
                    INSERT INTO daily_reports 
                    (report_date, symbol, current_price, market_sentiment, report_data, abid_commentary)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    report.report_date.date(),
                    report.symbol,
                    report.current_price,
                    report.market_sentiment.value,
                    json.dumps(asdict(report), default=str),
                    report.abid_commentary
                ))
                
                conn.commit()
                self.logger.info(f"Daily report saved for {report.symbol}")
                
        except Exception as e:
            self.logger.error(f"Error saving daily report: {e}")
    
    async def run_daily_analysis(self, symbols: List[str] = None):
        """Run daily analysis for multiple symbols"""
        if symbols is None:
            symbols = ["NIFTY", "BANKNIFTY"]
        
        try:
            await self.initialize()
            
            for symbol in symbols:
                report = await self.generate_daily_report(symbol)
                
                print(f"\n{'='*80}")
                print(f"DAILY MARKET REPORT - {symbol}")
                print(f"{'='*80}")
                print(report.abid_commentary)
                print(f"{'='*80}\n")
                
        except Exception as e:
            self.logger.error(f"Error in daily analysis: {e}")
        
        finally:
            if self.kite_integration:
                await self.kite_integration.cleanup()


async def main():
    """Main function to run daily analysis"""
    generator = DailyAnalysisGenerator()
    await generator.run_daily_analysis(["NIFTY"])


if __name__ == "__main__":
    asyncio.run(main())
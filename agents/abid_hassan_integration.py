#!/usr/bin/env python3
"""
Abid Hassan Methodology Integration Layer
Integrates the complete Abid Hassan options-centric analysis with existing research agent
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import pandas as pd
from dataclasses import dataclass, asdict

from .research_agent import ResearchAgent, ContentType, Urgency
from .abid_hassan_analyzer import AbidHassanAnalyzer, MarketSentiment
from .abid_hassan_daily_analysis import DailyAnalysisGenerator
from .options_first_technical import OptionsFirstTechnicalAnalyzer, OptionsFirstIntegration
from .kite_option_data import AbidHassanKiteIntegration

logger = logging.getLogger(__name__)


@dataclass
class EnhancedContentIdea:
    """Enhanced content idea with Abid Hassan methodology insights"""
    original_idea: Dict
    abid_analysis: Dict
    options_insights: List[str]
    institutional_signals: List[str]
    enhanced_title: str
    enhanced_content_outline: List[str]
    target_audience_refined: str
    estimated_engagement_boost: float


@dataclass
class IntegratedAnalysisReport:
    """Complete integrated analysis combining traditional research with Abid Hassan methodology"""
    symbol: str
    analysis_timestamp: datetime
    traditional_research: Dict
    abid_hassan_analysis: Dict
    options_first_technical: Dict
    integrated_insights: List[str]
    content_recommendations: List[EnhancedContentIdea]
    trading_setups: List[Dict]
    risk_assessment: Dict
    market_outlook: str


class AbidHassanIntegrationEngine:
    """Main integration engine combining all Abid Hassan methodology components"""
    
    def __init__(self, db_path: str = "data/agency.db"):
        self.db_path = db_path
        self.research_agent = ResearchAgent()
        self.abid_analyzer = AbidHassanAnalyzer(db_path)
        self.daily_generator = DailyAnalysisGenerator(db_path)
        self.options_first = OptionsFirstTechnicalAnalyzer()
        self.options_integration = OptionsFirstIntegration()
        self.kite_integration = None
        self.logger = logging.getLogger(__name__)
        
    async def initialize(self):
        """Initialize all components"""
        try:
            # Initialize Kite integration for real data
            self.kite_integration = AbidHassanKiteIntegration()
            await self.kite_integration.initialize()
            
            # Initialize daily generator
            await self.daily_generator.initialize()
            
            self.logger.info("Abid Hassan integration engine initialized")
            return True
        except Exception as e:
            self.logger.error(f"Failed to initialize integration engine: {e}")
            return False
    
    async def run_integrated_analysis(self, symbols: List[str] = None) -> List[IntegratedAnalysisReport]:
        """Run complete integrated analysis combining all methodologies"""
        if symbols is None:
            symbols = ["NIFTY", "BANKNIFTY"]
        
        reports = []
        
        try:
            for symbol in symbols:
                self.logger.info(f"Starting integrated analysis for {symbol}")
                
                # 1. Traditional research analysis
                traditional_research = await self.research_agent.run_once()
                
                # 2. Get real option chain data
                if self.kite_integration:
                    enhanced_data = await self.kite_integration.get_enhanced_analysis_data(symbol)
                    option_data = enhanced_data.get("option_data", [])
                else:
                    option_data = self.abid_analyzer.get_sample_option_data(symbol)
                
                # 3. Abid Hassan core analysis
                abid_analysis = await self.abid_analyzer.analyze_symbol(symbol)
                
                # 4. Options-first technical analysis
                options_first_analysis = await self.options_first.analyze_symbol(symbol, option_data)
                
                # 5. Daily market report
                daily_report = await self.daily_generator.generate_daily_report(symbol)
                
                # 6. Integrate all analyses
                integrated_insights = self.generate_integrated_insights(
                    traditional_research, abid_analysis, options_first_analysis, daily_report
                )
                
                # 7. Enhanced content recommendations
                enhanced_content = await self.enhance_content_ideas(
                    traditional_research, abid_analysis, options_first_analysis
                )
                
                # 8. Generate trading setups
                trading_setups = self.generate_integrated_trading_setups(
                    abid_analysis, options_first_analysis, daily_report
                )
                
                # 9. Risk assessment
                risk_assessment = self.generate_integrated_risk_assessment(
                    abid_analysis, options_first_analysis, daily_report
                )
                
                # 10. Market outlook
                market_outlook = self.generate_integrated_outlook(
                    abid_analysis, options_first_analysis, daily_report
                )
                
                # Create integrated report
                report = IntegratedAnalysisReport(
                    symbol=symbol,
                    analysis_timestamp=datetime.now(),
                    traditional_research=traditional_research,
                    abid_hassan_analysis=asdict(abid_analysis),
                    options_first_technical=asdict(options_first_analysis),
                    integrated_insights=integrated_insights,
                    content_recommendations=enhanced_content,
                    trading_setups=trading_setups,
                    risk_assessment=risk_assessment,
                    market_outlook=market_outlook
                )
                
                reports.append(report)
                self.logger.info(f"Integrated analysis completed for {symbol}")
                
                # Save integrated report
                await self.save_integrated_report(report)
                
            return reports
            
        except Exception as e:
            self.logger.error(f"Error in integrated analysis: {e}")
            raise
    
    def generate_integrated_insights(self, traditional_research: Dict, abid_analysis, 
                                   options_first_analysis, daily_report) -> List[str]:
        """Generate insights by combining all analysis methodologies"""
        insights = []
        
        try:
            # 1. Primary institutional insight (Abid Hassan methodology)
            insights.append(f"🏛️ Institutional Positioning: {abid_analysis.oi_analysis.institutional_positioning}")
            
            # 2. Options-first technical insight
            insights.append(f"📊 Options-First Technical: {options_first_analysis.primary_trend} "
                           f"(Strength: {options_first_analysis.trend_strength:.2f}) - "
                           f"Based on institutional options positioning, not price patterns")
            
            # 3. PCR contrarian insight
            pcr_insight = f"🔄 PCR Contrarian Signal: {abid_analysis.pcr_analysis.signal} "
            pcr_insight += f"(PCR: {abid_analysis.pcr_analysis.pcr:.2f}) - "
            pcr_insight += abid_analysis.pcr_analysis.explanation
            insights.append(pcr_insight)
            
            # 4. Max Pain magnetic insight
            max_pain_insight = f"🧲 Max Pain Analysis: {abid_analysis.max_pain_analysis.max_pain_signal} "
            max_pain_insight += f"Current: ₹{abid_analysis.current_price:,.0f} vs "
            max_pain_insight += f"Max Pain: ₹{abid_analysis.max_pain_analysis.max_pain_strike:,.0f}"
            insights.append(max_pain_insight)
            
            # 5. Traditional research enhancement
            if traditional_research and 'ideas' in traditional_research:
                ideas_count = len(traditional_research['ideas'])
                insights.append(f"📰 Traditional Research: {ideas_count} content opportunities identified "
                               f"from fundamental news analysis")
            
            # 6. FII/DII flow insight
            fii_dii = daily_report.fii_dii_analysis
            insights.append(f"💰 Institutional Flows: {fii_dii.get('interpretation', 'Flows analysis unavailable')}")
            
            # 7. Integration methodology insight
            insights.append("🔬 Methodology Advantage: This analysis combines Abid Hassan's "
                           "institutional options positioning with traditional fundamental research - "
                           "providing both 'what institutions want' and 'what news suggests'")
            
            return insights[:7]  # Top 7 integrated insights
            
        except Exception as e:
            self.logger.error(f"Error generating integrated insights: {e}")
            return ["Integrated insights generation failed"]
    
    async def enhance_content_ideas(self, traditional_research: Dict, abid_analysis, 
                                  options_first_analysis) -> List[EnhancedContentIdea]:
        """Enhance traditional content ideas with Abid Hassan methodology"""
        enhanced_ideas = []
        
        try:
            base_ideas = traditional_research.get('ideas', []) if traditional_research else []
            
            for idea in base_ideas[:5]:  # Top 5 ideas
                # Extract options insights for this idea
                options_insights = [
                    f"Institutional positioning: {abid_analysis.oi_analysis.institutional_positioning}",
                    f"PCR signal: {abid_analysis.pcr_analysis.signal} (PCR: {abid_analysis.pcr_analysis.pcr:.2f})",
                    f"Max Pain pull towards ₹{abid_analysis.max_pain_analysis.max_pain_strike:,.0f}"
                ]
                
                # Institutional signals
                institutional_signals = [
                    f"Smart money trend: {options_first_analysis.primary_trend}",
                    f"Dominant strategy: {options_first_analysis.institutional_positioning.dominant_strategy}",
                    f"Conviction level: {options_first_analysis.institutional_positioning.confidence:.0%}"
                ]
                
                # Enhanced title incorporating options insights
                original_title = idea.get('title', 'Market Analysis')
                enhanced_title = f"{original_title} + Institutional Options Flow Analysis"
                
                # Enhanced content outline
                enhanced_outline = [
                    "Traditional Analysis: " + idea.get('content_type', 'news_analysis'),
                    f"Institutional Positioning: {abid_analysis.oi_analysis.institutional_positioning}",
                    f"Options-Based Levels: Support/Resistance from OI concentrations",
                    f"PCR Contrarian View: {abid_analysis.pcr_analysis.explanation}",
                    f"Max Pain Magnetic Effect: Pull towards ₹{abid_analysis.max_pain_analysis.max_pain_strike:,.0f}",
                    "Trading Implications: How to trade with institutional flow",
                    "Risk Management: Using options-derived levels for stops"
                ]
                
                # Refined target audience
                original_audience = idea.get('target_audience', 'general')
                if 'institutional' in original_audience or 'professional' in original_audience:
                    refined_audience = "institutional_traders_and_sophisticated_retail"
                else:
                    refined_audience = "options_aware_retail_traders"
                
                # Estimated engagement boost from options analysis
                engagement_boost = 1.5  # 50% boost from adding institutional insights
                if abid_analysis.pcr_analysis.confidence > 0.8:
                    engagement_boost += 0.3  # Additional boost for high-confidence signals
                
                enhanced_idea = EnhancedContentIdea(
                    original_idea=idea,
                    abid_analysis=asdict(abid_analysis),
                    options_insights=options_insights,
                    institutional_signals=institutional_signals,
                    enhanced_title=enhanced_title,
                    enhanced_content_outline=enhanced_outline,
                    target_audience_refined=refined_audience,
                    estimated_engagement_boost=engagement_boost
                )
                
                enhanced_ideas.append(enhanced_idea)
            
            # Add pure Abid Hassan methodology content ideas
            enhanced_ideas.extend(await self.generate_pure_abid_hassan_content(abid_analysis, options_first_analysis))
            
            return enhanced_ideas
            
        except Exception as e:
            self.logger.error(f"Error enhancing content ideas: {e}")
            return []
    
    async def generate_pure_abid_hassan_content(self, abid_analysis, options_first_analysis) -> List[EnhancedContentIdea]:
        """Generate pure Abid Hassan methodology content ideas"""
        pure_ideas = []
        
        try:
            # 1. "Kya lag raha hai market" style daily analysis
            daily_analysis_idea = EnhancedContentIdea(
                original_idea={},
                abid_analysis=asdict(abid_analysis),
                options_insights=[
                    "PCR-based market sentiment analysis",
                    "Max Pain theory application",
                    "Institutional positioning through OI patterns"
                ],
                institutional_signals=[
                    "Real-time institutional flow analysis",
                    "Big money positioning insights",
                    "Contrarian institutional signals"
                ],
                enhanced_title=f"Kya Lag Raha Hai {abid_analysis.symbol} - Daily Options Flow Analysis",
                enhanced_content_outline=[
                    "Market Opening Analysis with Global Cues",
                    "FII/DII Flow Impact Assessment", 
                    "Put-Call Ratio Contrarian Analysis",
                    "Max Pain Magnetic Effect Today",
                    "Institutional OI Positioning Changes",
                    "Key Support/Resistance from Options Data",
                    "Trading Setups with Risk-Reward",
                    "Tomorrow's Outlook Based on Smart Money"
                ],
                target_audience_refined="options_traders_and_educators",
                estimated_engagement_boost=2.0
            )
            pure_ideas.append(daily_analysis_idea)
            
            # 2. Educational content on options-first methodology
            methodology_idea = EnhancedContentIdea(
                original_idea={},
                abid_analysis=asdict(abid_analysis),
                options_insights=[
                    "Why OI patterns matter more than price patterns",
                    "How institutions reveal their hand through options",
                    "PCR as a contrarian institutional indicator"
                ],
                institutional_signals=[
                    "Big guys vs small guys positioning",
                    "Smart money flow identification",
                    "Institutional conviction measurement"
                ],
                enhanced_title="Abid Hassan's Revolutionary Approach: Why Options Data Beats Traditional TA",
                enhanced_content_outline=[
                    "The Fundamental Flaw in Traditional Technical Analysis",
                    "Why 'Big Guys Are Usually Right' Philosophy Works",
                    "How to Read Institutional Intent Through Options",
                    "PCR: The Ultimate Contrarian Indicator Explained",
                    "Max Pain Theory: Market Manipulation or Natural Force?",
                    "Building Support/Resistance from OI, Not Price",
                    "Case Studies: When Options Predicted Better Than Charts",
                    "Practical Implementation for Retail Traders"
                ],
                target_audience_refined="trading_educators_and_students",
                estimated_engagement_boost=2.5
            )
            pure_ideas.append(methodology_idea)
            
            return pure_ideas
            
        except Exception as e:
            self.logger.error(f"Error generating pure Abid Hassan content: {e}")
            return []
    
    def generate_integrated_trading_setups(self, abid_analysis, options_first_analysis, daily_report) -> List[Dict]:
        """Generate trading setups combining all methodologies"""
        setups = []
        
        try:
            # Setup 1: Primary institutional flow setup
            primary_setup = {
                "name": "Institutional Flow Following",
                "methodology": "Abid Hassan + Options-First",
                "signal": options_first_analysis.institutional_positioning.key_insight,
                "entry_criteria": f"Follow {options_first_analysis.institutional_positioning.dominant_strategy}",
                "targets": [
                    level.level for level in options_first_analysis.options_based_levels[:3]
                    if level.confidence > 0.7
                ],
                "stop_loss": "Opposite side of strongest OI level",
                "risk_reward": "Minimum 1:2 based on options-derived levels",
                "time_horizon": "Intraday to weekly expiry",
                "confidence": options_first_analysis.institutional_positioning.confidence
            }
            setups.append(primary_setup)
            
            # Setup 2: PCR contrarian setup
            if abid_analysis.pcr_analysis.confidence > 0.7:
                pcr_setup = {
                    "name": "PCR Contrarian Play",
                    "methodology": "Abid Hassan PCR Analysis",
                    "signal": abid_analysis.pcr_analysis.signal,
                    "entry_criteria": abid_analysis.pcr_analysis.explanation,
                    "targets": [abid_analysis.max_pain_analysis.max_pain_strike],
                    "stop_loss": f"Beyond {abid_analysis.pcr_analysis.pcr:.2f} PCR extreme",
                    "risk_reward": "1:1.5 minimum",
                    "time_horizon": "1-3 days",
                    "confidence": abid_analysis.pcr_analysis.confidence
                }
                setups.append(pcr_setup)
            
            # Setup 3: Max Pain reversion setup
            distance_from_mp = abs(abid_analysis.current_price - abid_analysis.max_pain_analysis.max_pain_strike)
            distance_pct = distance_from_mp / abid_analysis.current_price * 100
            
            if distance_pct > 2:
                mp_setup = {
                    "name": "Max Pain Reversion",
                    "methodology": "Max Pain Theory",
                    "signal": abid_analysis.max_pain_analysis.max_pain_signal,
                    "entry_criteria": f"Price {distance_pct:.1f}% away from Max Pain",
                    "targets": [abid_analysis.max_pain_analysis.max_pain_strike],
                    "stop_loss": f"Beyond {distance_pct * 1.5:.1f}% from Max Pain",
                    "risk_reward": "1:2 typical for Max Pain reversion",
                    "time_horizon": "Till expiry",
                    "confidence": 0.6
                }
                setups.append(mp_setup)
            
            return setups
            
        except Exception as e:
            self.logger.error(f"Error generating trading setups: {e}")
            return []
    
    def generate_integrated_risk_assessment(self, abid_analysis, options_first_analysis, daily_report) -> Dict:
        """Generate comprehensive risk assessment"""
        try:
            risks = {
                "options_specific_risks": [
                    f"PCR at extreme level {abid_analysis.pcr_analysis.pcr:.2f} - reversal risk",
                    f"Distance from Max Pain {abs(abid_analysis.current_price - abid_analysis.max_pain_analysis.max_pain_strike)/abid_analysis.current_price*100:.1f}% - reversion risk"
                ],
                "institutional_positioning_risks": [
                    f"Institutional confidence only {options_first_analysis.institutional_positioning.confidence:.0%}",
                    f"Trend strength {options_first_analysis.trend_strength:.2f} - possible trend change"
                ],
                "traditional_risks": daily_report.risk_factors,
                "integrated_risk_score": self.calculate_integrated_risk_score(abid_analysis, options_first_analysis),
                "risk_management_framework": [
                    "Use options-derived levels for primary stops",
                    "Position size based on institutional conviction level",
                    "Monitor OI changes for institutional exit signals",
                    "Never bet against strong institutional positioning"
                ]
            }
            
            return risks
            
        except Exception as e:
            self.logger.error(f"Error generating risk assessment: {e}")
            return {}
    
    def calculate_integrated_risk_score(self, abid_analysis, options_first_analysis) -> float:
        """Calculate integrated risk score (0-100, higher = more risky)"""
        try:
            risk_score = 50  # Start neutral
            
            # PCR extreme risk
            pcr = abid_analysis.pcr_analysis.pcr
            if pcr > 1.4 or pcr < 0.25:
                risk_score += 20  # Extreme PCR = higher risk
            
            # Institutional conviction risk
            conviction = options_first_analysis.institutional_positioning.confidence
            if conviction < 0.5:
                risk_score += 15  # Low conviction = higher risk
            
            # Trend strength risk
            trend_strength = options_first_analysis.trend_strength
            if trend_strength < 0.3:
                risk_score += 10  # Weak trend = higher risk
            
            # Max Pain distance risk
            mp_distance_pct = abs(abid_analysis.current_price - abid_analysis.max_pain_analysis.max_pain_strike) / abid_analysis.current_price * 100
            if mp_distance_pct > 5:
                risk_score += 15  # Far from Max Pain = reversion risk
            
            return min(100, max(0, risk_score))
            
        except Exception as e:
            self.logger.error(f"Error calculating risk score: {e}")
            return 50.0
    
    def generate_integrated_outlook(self, abid_analysis, options_first_analysis, daily_report) -> str:
        """Generate integrated market outlook"""
        try:
            outlook_components = []
            
            # Primary trend from options
            outlook_components.append(f"Primary Trend: {options_first_analysis.primary_trend} "
                                    f"(Institutional confidence: {options_first_analysis.institutional_positioning.confidence:.0%})")
            
            # PCR sentiment
            outlook_components.append(f"PCR Signal: {abid_analysis.pcr_analysis.signal}")
            
            # Max Pain influence
            outlook_components.append(f"Max Pain Influence: {abid_analysis.max_pain_analysis.max_pain_signal}")
            
            # Next day outlook from daily report
            outlook_components.append(f"Tomorrow's Bias: {daily_report.next_day_outlook}")
            
            # Integration summary
            outlook_components.append("Integration Summary: This outlook combines institutional options positioning "
                                    "(Abid Hassan methodology) with traditional fundamental research for comprehensive view")
            
            return " | ".join(outlook_components)
            
        except Exception as e:
            self.logger.error(f"Error generating outlook: {e}")
            return "Integrated outlook generation failed"
    
    async def save_integrated_report(self, report: IntegratedAnalysisReport):
        """Save integrated analysis report to database"""
        try:
            import sqlite3
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS integrated_analysis_reports (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        symbol TEXT NOT NULL,
                        analysis_timestamp DATETIME,
                        report_data TEXT,
                        integrated_insights TEXT,
                        market_outlook TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                cursor.execute('''
                    INSERT INTO integrated_analysis_reports
                    (symbol, analysis_timestamp, report_data, integrated_insights, market_outlook)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    report.symbol,
                    report.analysis_timestamp,
                    json.dumps(asdict(report), default=str),
                    json.dumps(report.integrated_insights),
                    report.market_outlook
                ))
                
                conn.commit()
                self.logger.info(f"Integrated report saved for {report.symbol}")
                
        except Exception as e:
            self.logger.error(f"Error saving integrated report: {e}")
    
    async def generate_content_for_publishing(self, report: IntegratedAnalysisReport) -> Dict:
        """Generate ready-to-publish content from integrated analysis"""
        try:
            content = {
                "title": f"Complete Market Analysis: {report.symbol} - Traditional Research + Abid Hassan Methodology",
                "subtitle": "Combining fundamental analysis with institutional options flow insights",
                "sections": [
                    {
                        "title": "Executive Summary",
                        "content": f"Current Price: ₹{report.abid_hassan_analysis['current_price']:,.0f}\n"
                                  f"Institutional Trend: {report.options_first_technical['primary_trend']}\n"
                                  f"PCR Signal: {report.abid_hassan_analysis['pcr_analysis']['signal']}\n"
                                  f"Max Pain: ₹{report.abid_hassan_analysis['max_pain_analysis']['max_pain_strike']:,.0f}"
                    },
                    {
                        "title": "Institutional Positioning Analysis",
                        "content": "\n".join([
                            "🏛️ What the Big Money is Doing:",
                            report.abid_hassan_analysis['oi_analysis']['institutional_positioning'],
                            f"Conviction Level: {report.options_first_technical['institutional_positioning']['confidence']:.0%}",
                            f"Dominant Strategy: {report.options_first_technical['institutional_positioning']['dominant_strategy']}"
                        ])
                    },
                    {
                        "title": "Key Insights (Integrated Analysis)",
                        "content": "\n".join([f"• {insight}" for insight in report.integrated_insights])
                    },
                    {
                        "title": "Trading Setups",
                        "content": "\n".join([
                            f"Setup {i+1}: {setup['name']}" + 
                            f"\n  Signal: {setup['signal']}" +
                            f"\n  Entry: {setup['entry_criteria']}" +
                            f"\n  Confidence: {setup['confidence']:.0%}"
                            for i, setup in enumerate(report.trading_setups)
                        ])
                    },
                    {
                        "title": "Risk Assessment",
                        "content": f"Integrated Risk Score: {report.risk_assessment.get('integrated_risk_score', 50):.0f}/100\n" +
                                  "Key Risks:\n" + 
                                  "\n".join([f"• {risk}" for risk in report.risk_assessment.get('options_specific_risks', [])])
                    },
                    {
                        "title": "Market Outlook",
                        "content": report.market_outlook
                    }
                ],
                "tags": ["options_analysis", "institutional_flow", "abid_hassan_methodology", report.symbol.lower()],
                "target_audience": "options_traders_and_sophisticated_retail",
                "estimated_read_time": "8-10 minutes",
                "publishing_priority": "high" if any("critical" in insight.lower() or "strong" in insight.lower() 
                                                   for insight in report.integrated_insights) else "medium"
            }
            
            return content
            
        except Exception as e:
            self.logger.error(f"Error generating publishable content: {e}")
            return {}
    
    async def cleanup(self):
        """Cleanup resources"""
        try:
            if self.kite_integration:
                await self.kite_integration.cleanup()
            if self.daily_generator.kite_integration:
                await self.daily_generator.kite_integration.cleanup()
            self.logger.info("Integration engine cleanup completed")
        except Exception as e:
            self.logger.error(f"Error in cleanup: {e}")


async def main():
    """Main function to test the complete integration"""
    integration_engine = AbidHassanIntegrationEngine()
    
    try:
        print("🚀 Abid Hassan Methodology - Complete Integration System")
        print("=" * 80)
        
        # Initialize
        if await integration_engine.initialize():
            print("✅ Integration engine initialized successfully")
        else:
            print("❌ Failed to initialize integration engine")
            return
        
        # Run integrated analysis
        print("\n📊 Running integrated analysis for NIFTY...")
        reports = await integration_engine.run_integrated_analysis(["NIFTY"])
        
        if reports:
            report = reports[0]
            
            print(f"\n📋 INTEGRATED ANALYSIS REPORT - {report.symbol}")
            print("=" * 60)
            
            print("\n🧠 Integrated Insights:")
            for insight in report.integrated_insights:
                print(f"• {insight}")
            
            print(f"\n🎯 Trading Setups:")
            for i, setup in enumerate(report.trading_setups, 1):
                print(f"{i}. {setup['name']} (Confidence: {setup['confidence']:.0%})")
                print(f"   Signal: {setup['signal']}")
            
            print(f"\n⚠️ Risk Assessment:")
            risk_score = report.risk_assessment.get('integrated_risk_score', 50)
            print(f"Integrated Risk Score: {risk_score:.0f}/100")
            
            print(f"\n🔮 Market Outlook:")
            print(report.market_outlook)
            
            print(f"\n📰 Enhanced Content Ideas:")
            for i, content_idea in enumerate(report.content_recommendations[:3], 1):
                print(f"{i}. {content_idea.enhanced_title}")
                print(f"   Engagement Boost: +{(content_idea.estimated_engagement_boost-1)*100:.0f}%")
            
            # Generate publishable content
            publishable = await integration_engine.generate_content_for_publishing(report)
            print(f"\n📝 Ready-to-Publish Content Generated:")
            print(f"Title: {publishable.get('title', 'N/A')}")
            print(f"Priority: {publishable.get('publishing_priority', 'N/A')}")
            print(f"Est. Read Time: {publishable.get('estimated_read_time', 'N/A')}")
            
        print("\n" + "=" * 80)
        print("🎉 Abid Hassan Methodology Integration Complete!")
        print("The AI Finance Agency now has institutional-grade options analysis!")
        
    except Exception as e:
        print(f"❌ Error in integration test: {e}")
        
    finally:
        await integration_engine.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
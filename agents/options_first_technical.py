#!/usr/bin/env python3
"""
Options-First Technical Analysis System
Implements Abid Hassan's revolutionary approach: Options market structure as primary technical indicator
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import yfinance as yf

logger = logging.getLogger(__name__)


class SupportResistanceType(Enum):
    STRONG_SUPPORT = "strong_support"
    MODERATE_SUPPORT = "moderate_support"
    WEAK_SUPPORT = "weak_support"
    STRONG_RESISTANCE = "strong_resistance"
    MODERATE_RESISTANCE = "moderate_resistance"
    WEAK_RESISTANCE = "weak_resistance"


@dataclass
class OptionsBasedLevel:
    level: float
    type: SupportResistanceType
    strength: float  # 0-100 scale
    oi_concentration: int
    confidence: float
    explanation: str
    
    
@dataclass
class InstitutionalPositioning:
    bullish_positioning: float  # % of institutional money positioned bullishly
    bearish_positioning: float  # % positioned bearishly
    neutral_positioning: float  # % in neutral strategies
    dominant_strategy: str
    confidence: float
    key_insight: str


@dataclass
class OptionsFirstAnalysis:
    symbol: str
    current_price: float
    analysis_time: datetime
    options_based_levels: List[OptionsBasedLevel]
    institutional_positioning: InstitutionalPositioning
    primary_trend: str
    trend_strength: float
    key_insights: List[str]
    trading_implications: str


class OptionsFirstTechnicalAnalyzer:
    """
    Core analyzer implementing Abid Hassan's options-first technical analysis
    'Option sellers are big institutions, option buyers are small. Big guys are usually right.'
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def analyze_oi_based_support_resistance(self, option_data: List) -> List[OptionsBasedLevel]:
        """
        Identify support/resistance based on OI concentrations rather than price patterns
        This is the core of Abid Hassan's methodology
        """
        levels = []
        
        try:
            # Convert to DataFrame for easier analysis
            df = pd.DataFrame([{
                'strike': data.strike,
                'call_oi': data.call_oi,
                'put_oi': data.put_oi,
                'call_change_oi': data.call_change_oi,
                'put_change_oi': data.put_change_oi,
                'total_oi': data.call_oi + data.put_oi
            } for data in option_data])
            
            # Calculate OI percentiles for significance thresholds
            call_oi_threshold_strong = df['call_oi'].quantile(0.9)
            call_oi_threshold_moderate = df['call_oi'].quantile(0.75)
            put_oi_threshold_strong = df['put_oi'].quantile(0.9)
            put_oi_threshold_moderate = df['put_oi'].quantile(0.75)
            
            current_price = option_data[len(option_data)//2].strike  # Approximate ATM
            
            for _, row in df.iterrows():
                strike = row['strike']
                call_oi = row['call_oi']
                put_oi = row['put_oi']
                
                # High Call OI = Resistance (institutions selling calls)
                if call_oi >= call_oi_threshold_strong and strike > current_price:
                    strength = min(95, (call_oi / df['call_oi'].max()) * 100)
                    levels.append(OptionsBasedLevel(
                        level=strike,
                        type=SupportResistanceType.STRONG_RESISTANCE,
                        strength=strength,
                        oi_concentration=call_oi,
                        confidence=0.85,
                        explanation=f"High Call OI ({call_oi:,}) at {strike} - Institutions sold calls, expecting resistance"
                    ))
                elif call_oi >= call_oi_threshold_moderate and strike > current_price:
                    strength = min(75, (call_oi / df['call_oi'].max()) * 100)
                    levels.append(OptionsBasedLevel(
                        level=strike,
                        type=SupportResistanceType.MODERATE_RESISTANCE,
                        strength=strength,
                        oi_concentration=call_oi,
                        confidence=0.70,
                        explanation=f"Moderate Call OI ({call_oi:,}) suggests resistance around {strike}"
                    ))
                
                # High Put OI = Support (institutions selling puts)
                if put_oi >= put_oi_threshold_strong and strike < current_price:
                    strength = min(95, (put_oi / df['put_oi'].max()) * 100)
                    levels.append(OptionsBasedLevel(
                        level=strike,
                        type=SupportResistanceType.STRONG_SUPPORT,
                        strength=strength,
                        oi_concentration=put_oi,
                        confidence=0.85,
                        explanation=f"High Put OI ({put_oi:,}) at {strike} - Institutions sold puts, expecting support"
                    ))
                elif put_oi >= put_oi_threshold_moderate and strike < current_price:
                    strength = min(75, (put_oi / df['put_oi'].max()) * 100)
                    levels.append(OptionsBasedLevel(
                        level=strike,
                        type=SupportResistanceType.MODERATE_SUPPORT,
                        strength=strength,
                        oi_concentration=put_oi,
                        confidence=0.70,
                        explanation=f"Moderate Put OI ({put_oi:,}) suggests support around {strike}"
                    ))
            
            # Sort by strength and return top levels
            levels.sort(key=lambda x: x.strength, reverse=True)
            return levels[:8]  # Top 8 most significant levels
            
        except Exception as e:
            self.logger.error(f"Error analyzing OI-based levels: {e}")
            return []
    
    def analyze_institutional_positioning(self, option_data: List) -> InstitutionalPositioning:
        """
        Analyze institutional positioning based on options flow
        'Big guys are usually right' - follow the institutional money
        """
        try:
            total_call_oi = sum(data.call_oi for data in option_data)
            total_put_oi = sum(data.put_oi for data in option_data)
            total_oi = total_call_oi + total_put_oi
            
            # Analyze OI changes for fresh positioning
            fresh_call_selling = sum(max(0, data.call_change_oi) for data in option_data)
            fresh_put_selling = sum(max(0, data.put_change_oi) for data in option_data)
            fresh_call_buying = sum(abs(min(0, data.call_change_oi)) for data in option_data)
            fresh_put_buying = sum(abs(min(0, data.put_change_oi)) for data in option_data)
            
            total_fresh_activity = fresh_call_selling + fresh_put_selling + fresh_call_buying + fresh_put_buying
            
            if total_fresh_activity == 0:
                return InstitutionalPositioning(
                    bullish_positioning=33.0,
                    bearish_positioning=33.0,
                    neutral_positioning=34.0,
                    dominant_strategy="Range-bound",
                    confidence=0.3,
                    key_insight="Minimal fresh institutional activity"
                )
            
            # Calculate positioning percentages
            # Put selling = bullish institutional view
            # Call selling = bearish institutional view
            bullish_flow = fresh_put_selling / total_fresh_activity * 100
            bearish_flow = fresh_call_selling / total_fresh_activity * 100
            neutral_flow = 100 - bullish_flow - bearish_flow
            
            # Determine dominant strategy
            if bullish_flow > bearish_flow + 15:
                dominant_strategy = "Aggressive Put Selling"
                confidence = 0.8
                key_insight = f"Institutions aggressively selling puts - expecting upside support"
            elif bearish_flow > bullish_flow + 15:
                dominant_strategy = "Aggressive Call Selling"
                confidence = 0.8
                key_insight = f"Institutions aggressively selling calls - expecting upside resistance"
            elif bullish_flow > bearish_flow + 5:
                dominant_strategy = "Moderate Bullish Positioning"
                confidence = 0.65
                key_insight = f"Slight institutional bullish bias through put selling"
            elif bearish_flow > bullish_flow + 5:
                dominant_strategy = "Moderate Bearish Positioning"
                confidence = 0.65
                key_insight = f"Slight institutional bearish bias through call selling"
            else:
                dominant_strategy = "Balanced Positioning"
                confidence = 0.5
                key_insight = f"Institutions maintaining balanced options positioning"
            
            return InstitutionalPositioning(
                bullish_positioning=bullish_flow,
                bearish_positioning=bearish_flow,
                neutral_positioning=neutral_flow,
                dominant_strategy=dominant_strategy,
                confidence=confidence,
                key_insight=key_insight
            )
            
        except Exception as e:
            self.logger.error(f"Error analyzing institutional positioning: {e}")
            return InstitutionalPositioning(0, 0, 100, "Unknown", 0, "Analysis failed")
    
    def determine_primary_trend_from_options(self, option_data: List, 
                                           institutional_positioning: InstitutionalPositioning) -> Tuple[str, float]:
        """
        Determine primary trend based on options positioning rather than price action
        Revolutionary approach: Let institutions tell us the trend through their positions
        """
        try:
            current_price = option_data[len(option_data)//2].strike  # Approximate ATM
            
            # Analyze OI distribution relative to current price
            otm_call_oi = sum(data.call_oi for data in option_data if data.strike > current_price * 1.02)
            otm_put_oi = sum(data.put_oi for data in option_data if data.strike < current_price * 0.98)
            
            # Fresh positioning analysis
            fresh_otm_call_oi = sum(data.call_change_oi for data in option_data if data.strike > current_price * 1.02)
            fresh_otm_put_oi = sum(data.put_change_oi for data in option_data if data.strike < current_price * 0.98)
            
            # Score calculation (0-100 scale)
            trend_score = 50  # Start neutral
            
            # Institutional positioning impact (40% weightage)
            bullish_pos = institutional_positioning.bullish_positioning
            bearish_pos = institutional_positioning.bearish_positioning
            trend_score += (bullish_pos - bearish_pos) * 0.4
            
            # OI distribution impact (35% weightage)
            if otm_put_oi > otm_call_oi:
                # More put selling = bullish
                oi_ratio = otm_put_oi / (otm_call_oi + 1)  # Avoid division by zero
                trend_score += min(15, oi_ratio * 5)
            else:
                # More call selling = bearish
                oi_ratio = otm_call_oi / (otm_put_oi + 1)
                trend_score -= min(15, oi_ratio * 5)
            
            # Fresh positioning impact (25% weightage)
            if fresh_otm_put_oi > fresh_otm_call_oi:
                trend_score += 10  # Fresh put selling = bullish
            elif fresh_otm_call_oi > fresh_otm_put_oi:
                trend_score -= 10  # Fresh call selling = bearish
            
            # Determine trend and strength
            trend_score = max(0, min(100, trend_score))  # Clamp between 0-100
            
            if trend_score >= 75:
                trend = "Strong Bullish"
                strength = (trend_score - 50) / 50
            elif trend_score >= 60:
                trend = "Moderate Bullish"
                strength = (trend_score - 50) / 50
            elif trend_score >= 40:
                trend = "Range-bound/Neutral"
                strength = abs(trend_score - 50) / 50
            elif trend_score >= 25:
                trend = "Moderate Bearish"
                strength = (50 - trend_score) / 50
            else:
                trend = "Strong Bearish"
                strength = (50 - trend_score) / 50
            
            return trend, round(strength, 2)
            
        except Exception as e:
            self.logger.error(f"Error determining trend from options: {e}")
            return "Unknown", 0.0
    
    def generate_key_insights(self, levels: List[OptionsBasedLevel], 
                            positioning: InstitutionalPositioning,
                            trend: str) -> List[str]:
        """Generate key insights from options-first analysis"""
        insights = []
        
        try:
            # Insight 1: Strongest institutional conviction
            strongest_level = max(levels, key=lambda x: x.strength) if levels else None
            if strongest_level:
                insights.append(f"Strongest institutional conviction at ₹{strongest_level.level:,.0f} "
                               f"({strongest_level.type.value.replace('_', ' ').title()}) - "
                               f"{strongest_level.explanation}")
            
            # Insight 2: Institutional bias
            if positioning.confidence > 0.7:
                insights.append(f"High conviction institutional setup: {positioning.key_insight}")
            
            # Insight 3: Trend confirmation
            insights.append(f"Options-derived trend: {trend} - Unlike traditional TA, "
                           f"this is based on institutional positioning, not just price")
            
            # Insight 4: Support/Resistance count
            support_levels = [l for l in levels if 'support' in l.type.value]
            resistance_levels = [l for l in levels if 'resistance' in l.type.value]
            
            if len(support_levels) > len(resistance_levels):
                insights.append(f"More institutional support levels ({len(support_levels)}) vs "
                               f"resistance ({len(resistance_levels)}) - bullish skew")
            elif len(resistance_levels) > len(support_levels):
                insights.append(f"More institutional resistance levels ({len(resistance_levels)}) vs "
                               f"support ({len(support_levels)}) - bearish skew")
            
            # Insight 5: Abid Hassan philosophy reminder
            insights.append("Remember Abid's key insight: 'Big guys (institutions) are usually right. "
                           "This analysis follows their positioning, not retail sentiment.'")
            
            return insights[:5]  # Top 5 insights
            
        except Exception as e:
            self.logger.error(f"Error generating insights: {e}")
            return ["Insights generation failed"]
    
    def generate_trading_implications(self, levels: List[OptionsBasedLevel], 
                                    positioning: InstitutionalPositioning,
                                    trend: str, current_price: float) -> str:
        """Generate trading implications based on options-first analysis"""
        try:
            implications = []
            
            # Primary trend implication
            implications.append(f"Primary Direction: {trend} (based on institutional options positioning)")
            
            # Key levels for trading
            support_levels = [l for l in levels if 'support' in l.type.value and l.level < current_price]
            resistance_levels = [l for l in levels if 'resistance' in l.type.value and l.level > current_price]
            
            if support_levels:
                nearest_support = max(support_levels, key=lambda x: x.level)
                implications.append(f"Nearest Support: ₹{nearest_support.level:,.0f} "
                                   f"(Strength: {nearest_support.strength:.0f}%)")
            
            if resistance_levels:
                nearest_resistance = min(resistance_levels, key=lambda x: x.level)
                implications.append(f"Nearest Resistance: ₹{nearest_resistance.level:,.0f} "
                                   f"(Strength: {nearest_resistance.strength:.0f}%)")
            
            # Strategy suggestion based on positioning
            if positioning.confidence > 0.7:
                if positioning.bullish_positioning > positioning.bearish_positioning + 20:
                    implications.append("Strategy: Follow institutional bullish bias - "
                                       "consider buying dips or selling puts")
                elif positioning.bearish_positioning > positioning.bullish_positioning + 20:
                    implications.append("Strategy: Follow institutional bearish bias - "
                                       "consider selling rallies or selling calls")
                else:
                    implications.append("Strategy: Range-bound approach - "
                                       "trade between key support/resistance levels")
            
            # Risk management
            implications.append("Risk Management: Use options-derived levels for stops, "
                               "not traditional price-based levels")
            
            return " | ".join(implications)
            
        except Exception as e:
            self.logger.error(f"Error generating trading implications: {e}")
            return "Trading implications analysis failed"
    
    async def analyze_symbol(self, symbol: str, option_data: List) -> OptionsFirstAnalysis:
        """
        Perform complete options-first technical analysis
        This is the revolutionary approach: Options market structure as primary technical indicator
        """
        try:
            current_price = option_data[len(option_data)//2].strike if option_data else 0
            
            # Core analysis components
            options_based_levels = self.analyze_oi_based_support_resistance(option_data)
            institutional_positioning = self.analyze_institutional_positioning(option_data)
            primary_trend, trend_strength = self.determine_primary_trend_from_options(
                option_data, institutional_positioning
            )
            
            # Generate insights and implications
            key_insights = self.generate_key_insights(
                options_based_levels, institutional_positioning, primary_trend
            )
            trading_implications = self.generate_trading_implications(
                options_based_levels, institutional_positioning, primary_trend, current_price
            )
            
            analysis = OptionsFirstAnalysis(
                symbol=symbol,
                current_price=current_price,
                analysis_time=datetime.now(),
                options_based_levels=options_based_levels,
                institutional_positioning=institutional_positioning,
                primary_trend=primary_trend,
                trend_strength=trend_strength,
                key_insights=key_insights,
                trading_implications=trading_implications
            )
            
            self.logger.info(f"Options-first analysis completed for {symbol}")
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error in options-first analysis for {symbol}: {e}")
            raise
    
    def compare_with_traditional_ta(self, symbol: str, options_analysis: OptionsFirstAnalysis) -> Dict:
        """
        Compare options-first analysis with traditional technical analysis
        Demonstrates why Abid Hassan's approach is superior
        """
        try:
            # This would typically fetch price data and run traditional TA
            # For now, we'll create a conceptual comparison
            
            comparison = {
                "options_first_trend": options_analysis.primary_trend,
                "options_confidence": options_analysis.institutional_positioning.confidence,
                "traditional_ta_issues": [
                    "Based on past price action, not future institutional positioning",
                    "Retail-driven patterns vs institutional insight", 
                    "Lagging indicators vs forward-looking options data",
                    "Subjective pattern recognition vs objective OI data"
                ],
                "options_first_advantages": [
                    "Forward-looking institutional positioning",
                    "Objective data-driven levels (OI concentrations)",
                    "Big money flow insights",
                    "Real institutional support/resistance levels"
                ],
                "abid_hassan_insight": "Traditional TA shows where retail thinks price should go. "
                                     "Options analysis shows where institutions WANT price to go."
            }
            
            return comparison
            
        except Exception as e:
            self.logger.error(f"Error in TA comparison: {e}")
            return {}


class OptionsFirstIntegration:
    """Integration layer for options-first analysis with existing systems"""
    
    def __init__(self):
        self.analyzer = OptionsFirstTechnicalAnalyzer()
        self.logger = logging.getLogger(__name__)
    
    async def enhance_existing_analysis(self, existing_analysis, option_data: List) -> Dict:
        """Enhance existing research with options-first technical analysis"""
        try:
            # Run options-first analysis
            options_first = await self.analyzer.analyze_symbol(
                existing_analysis.symbol, option_data
            )
            
            # Create enhanced analysis
            enhanced = {
                "original_analysis": existing_analysis,
                "options_first_analysis": options_first,
                "combined_insights": self.combine_insights(existing_analysis, options_first),
                "enhanced_recommendations": self.enhance_recommendations(existing_analysis, options_first)
            }
            
            return enhanced
            
        except Exception as e:
            self.logger.error(f"Error enhancing analysis: {e}")
            return {}
    
    def combine_insights(self, existing_analysis, options_first: OptionsFirstAnalysis) -> List[str]:
        """Combine insights from both analyses"""
        combined = []
        
        # Add options-first insights (higher priority)
        combined.extend(options_first.key_insights)
        
        # Add relevant existing insights
        if hasattr(existing_analysis, 'key_insights'):
            combined.extend(existing_analysis.key_insights[:2])
        
        # Add integration insight
        combined.append(f"Integration Insight: Options-first trend ({options_first.primary_trend}) "
                       f"provides institutional view vs traditional price-based analysis")
        
        return combined[:7]  # Top 7 combined insights
    
    def enhance_recommendations(self, existing_analysis, options_first: OptionsFirstAnalysis) -> str:
        """Create enhanced recommendations combining both approaches"""
        recommendations = []
        
        # Primary recommendation from options-first (Abid Hassan approach)
        recommendations.append(f"🎯 Primary (Options-First): {options_first.trading_implications}")
        
        # Secondary from traditional analysis  
        if hasattr(existing_analysis, 'recommended_strategy'):
            recommendations.append(f"📊 Traditional View: {existing_analysis.recommended_strategy.value}")
        
        # Risk management combining both
        recommendations.append("⚠️ Risk Management: Use options-derived levels for primary stops, "
                              "traditional levels for secondary confirmation")
        
        return "\n".join(recommendations)


async def main():
    """Test the options-first technical analysis system"""
    from .abid_hassan_analyzer import AbidHassanAnalyzer
    
    analyzer = OptionsFirstTechnicalAnalyzer()
    
    # Create sample option data
    abid_analyzer = AbidHassanAnalyzer()
    sample_data = abid_analyzer.get_sample_option_data("NIFTY")
    
    print("🚀 Options-First Technical Analysis System")
    print("=" * 60)
    
    # Run analysis
    analysis = await analyzer.analyze_symbol("NIFTY", sample_data)
    
    print(f"\nSymbol: {analysis.symbol}")
    print(f"Current Price: ₹{analysis.current_price:,.0f}")
    print(f"Primary Trend: {analysis.primary_trend} (Strength: {analysis.trend_strength:.2f})")
    
    print(f"\n📊 Institutional Positioning:")
    pos = analysis.institutional_positioning
    print(f"Bullish: {pos.bullish_positioning:.1f}% | Bearish: {pos.bearish_positioning:.1f}%")
    print(f"Dominant Strategy: {pos.dominant_strategy}")
    print(f"Key Insight: {pos.key_insight}")
    
    print(f"\n🎯 Options-Based Key Levels:")
    for level in analysis.options_based_levels[:5]:
        print(f"₹{level.level:,.0f} - {level.type.value.replace('_', ' ').title()} "
              f"(Strength: {level.strength:.0f}%)")
    
    print(f"\n💡 Key Insights:")
    for insight in analysis.key_insights:
        print(f"• {insight}")
    
    print(f"\n🎭 Trading Implications:")
    print(analysis.trading_implications)
    
    print("\n" + "=" * 60)
    print("Options-First Analysis Complete!")


if __name__ == "__main__":
    asyncio.run(main())
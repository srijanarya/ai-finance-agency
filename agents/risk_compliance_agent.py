#!/usr/bin/env python3
"""
Risk Management & Compliance Agent - Advanced risk assessment and regulatory compliance
Monitors portfolio risk, ensures SEBI/RBI compliance, and manages exposure limits
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
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class RiskAlert:
    """Risk alert structure"""
    alert_type: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    portfolio_id: str
    message: str
    metrics: Dict
    recommended_action: str
    timestamp: datetime

class RiskComplianceAgent:
    """Comprehensive risk management and compliance system"""
    
    def __init__(self):
        self.db_path = "data/risk_compliance.db"
        self.init_database()
        
        # Risk thresholds
        self.risk_limits = {
            'max_single_position': 0.20,  # 20% max in single stock
            'max_sector_exposure': 0.35,  # 35% max in single sector
            'max_leverage': 2.0,  # 2x leverage limit
            'min_liquidity': 0.05,  # 5% minimum cash
            'max_var_95': 0.10,  # 10% Value at Risk
            'max_drawdown': 0.25,  # 25% maximum drawdown
            'min_sharpe': 0.5,  # Minimum Sharpe ratio
            'max_beta': 1.5,  # Maximum portfolio beta
            'max_correlation': 0.8  # Maximum correlation between holdings
        }
        
        # SEBI/RBI Compliance rules
        self.compliance_rules = {
            'min_diversification': 10,  # Minimum 10 stocks
            'max_derivative_exposure': 0.20,  # 20% derivatives
            'margin_requirements': 0.30,  # 30% margin for F&O
            'disclosure_threshold': 0.05,  # 5% shareholding disclosure
            'insider_trading_window': 30,  # 30 days blackout
            'kyc_required': True,
            'risk_disclosure_required': True
        }
        
        # Risk categories
        self.risk_categories = [
            'market_risk',
            'credit_risk',
            'liquidity_risk',
            'operational_risk',
            'concentration_risk',
            'regulatory_risk',
            'systemic_risk'
        ]
        
    def init_database(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Risk assessments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS risk_assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                portfolio_id TEXT NOT NULL,
                assessment_date DATE,
                overall_risk_score REAL,
                market_risk REAL,
                credit_risk REAL,
                liquidity_risk REAL,
                concentration_risk REAL,
                var_95 REAL,
                cvar_95 REAL,
                max_drawdown REAL,
                beta REAL,
                correlation_risk REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Risk alerts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS risk_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                portfolio_id TEXT,
                message TEXT,
                metrics TEXT,
                recommended_action TEXT,
                status TEXT DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP
            )
        """)
        
        # Compliance checks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS compliance_checks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                portfolio_id TEXT NOT NULL,
                check_type TEXT NOT NULL,
                status TEXT,
                details TEXT,
                violations TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Stress test results table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS stress_tests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                portfolio_id TEXT NOT NULL,
                scenario_name TEXT,
                scenario_type TEXT,
                impact_percentage REAL,
                affected_positions TEXT,
                recommendations TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Exposure limits table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS exposure_limits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                portfolio_id TEXT NOT NULL,
                limit_type TEXT,
                current_exposure REAL,
                limit_value REAL,
                breach_status BOOLEAN,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("Risk & Compliance database initialized successfully")
        
    async def assess_portfolio_risk(self, portfolio_id: str, holdings: List[Dict]) -> Dict:
        """Comprehensive portfolio risk assessment"""
        try:
            # Calculate various risk metrics
            market_risk = await self.calculate_market_risk(holdings)
            credit_risk = await self.calculate_credit_risk(holdings)
            liquidity_risk = await self.calculate_liquidity_risk(holdings)
            concentration_risk = await self.calculate_concentration_risk(holdings)
            
            # Value at Risk calculations
            var_95, cvar_95 = await self.calculate_var(holdings)
            
            # Portfolio Greeks
            greeks = await self.calculate_portfolio_greeks(holdings)
            
            # Correlation risk
            correlation_risk = await self.calculate_correlation_risk(holdings)
            
            # Overall risk score (weighted average)
            overall_risk = (
                market_risk * 0.30 +
                credit_risk * 0.20 +
                liquidity_risk * 0.15 +
                concentration_risk * 0.25 +
                correlation_risk * 0.10
            )
            
            assessment = {
                'portfolio_id': portfolio_id,
                'assessment_date': datetime.now().isoformat(),
                'overall_risk_score': overall_risk,
                'market_risk': market_risk,
                'credit_risk': credit_risk,
                'liquidity_risk': liquidity_risk,
                'concentration_risk': concentration_risk,
                'var_95': var_95,
                'cvar_95': cvar_95,
                'greeks': greeks,
                'correlation_risk': correlation_risk,
                'risk_rating': self.get_risk_rating(overall_risk)
            }
            
            # Store assessment
            await self.store_risk_assessment(assessment)
            
            # Check for risk breaches
            breaches = await self.check_risk_breaches(assessment, holdings)
            if breaches:
                await self.generate_risk_alerts(portfolio_id, breaches)
                
            return assessment
            
        except Exception as e:
            logger.error(f"Error assessing portfolio risk: {e}")
            return {}
            
    async def calculate_market_risk(self, holdings: List[Dict]) -> float:
        """Calculate market risk exposure"""
        try:
            total_value = sum(h['value'] for h in holdings)
            
            # Get historical volatility for each holding
            volatilities = []
            weights = []
            
            for holding in holdings:
                symbol = holding['symbol']
                weight = holding['value'] / total_value
                
                # Get historical data
                stock = yf.Ticker(symbol)
                hist = stock.history(period="3mo")
                
                if not hist.empty:
                    returns = hist['Close'].pct_change().dropna()
                    volatility = returns.std() * np.sqrt(252)  # Annualized
                    volatilities.append(volatility)
                    weights.append(weight)
                    
            # Portfolio volatility
            if volatilities:
                portfolio_volatility = np.dot(weights, volatilities)
                # Normalize to 0-100 scale
                market_risk = min(100, portfolio_volatility * 100)
            else:
                market_risk = 50  # Default medium risk
                
            return market_risk
            
        except Exception as e:
            logger.error(f"Error calculating market risk: {e}")
            return 50
            
    async def calculate_credit_risk(self, holdings: List[Dict]) -> float:
        """Calculate credit risk based on company fundamentals"""
        try:
            credit_scores = []
            weights = []
            total_value = sum(h['value'] for h in holdings)
            
            for holding in holdings:
                symbol = holding['symbol']
                weight = holding['value'] / total_value
                
                # Get company fundamentals
                stock = yf.Ticker(symbol)
                info = stock.info
                
                # Credit score based on fundamentals
                score = 50  # Base score
                
                # Debt to equity ratio
                debt_to_equity = info.get('debtToEquity', 0)
                if debt_to_equity < 0.5:
                    score -= 10
                elif debt_to_equity > 2:
                    score += 20
                    
                # Current ratio
                current_ratio = info.get('currentRatio', 1)
                if current_ratio > 2:
                    score -= 10
                elif current_ratio < 1:
                    score += 15
                    
                # Profit margins
                profit_margin = info.get('profitMargins', 0)
                if profit_margin > 0.15:
                    score -= 5
                elif profit_margin < 0:
                    score += 25
                    
                credit_scores.append(score)
                weights.append(weight)
                
            # Weighted average credit risk
            if credit_scores:
                credit_risk = np.dot(weights, credit_scores)
            else:
                credit_risk = 50
                
            return min(100, max(0, credit_risk))
            
        except Exception as e:
            logger.error(f"Error calculating credit risk: {e}")
            return 50
            
    async def calculate_liquidity_risk(self, holdings: List[Dict]) -> float:
        """Calculate liquidity risk based on trading volumes"""
        try:
            liquidity_scores = []
            weights = []
            total_value = sum(h['value'] for h in holdings)
            
            for holding in holdings:
                symbol = holding['symbol']
                weight = holding['value'] / total_value
                
                # Get trading volume
                stock = yf.Ticker(symbol)
                info = stock.info
                hist = stock.history(period="1mo")
                
                if not hist.empty:
                    avg_volume = hist['Volume'].mean()
                    avg_value = avg_volume * hist['Close'].mean()
                    
                    # Position size vs daily traded value
                    position_value = holding['value']
                    days_to_liquidate = position_value / avg_value if avg_value > 0 else 10
                    
                    # Liquidity score
                    if days_to_liquidate < 0.1:
                        score = 10
                    elif days_to_liquidate < 1:
                        score = 30
                    elif days_to_liquidate < 5:
                        score = 60
                    else:
                        score = 90
                        
                    liquidity_scores.append(score)
                    weights.append(weight)
                    
            # Weighted average liquidity risk
            if liquidity_scores:
                liquidity_risk = np.dot(weights, liquidity_scores)
            else:
                liquidity_risk = 50
                
            return min(100, max(0, liquidity_risk))
            
        except Exception as e:
            logger.error(f"Error calculating liquidity risk: {e}")
            return 50
            
    async def calculate_concentration_risk(self, holdings: List[Dict]) -> float:
        """Calculate concentration risk"""
        try:
            total_value = sum(h['value'] for h in holdings)
            
            # Position concentration
            position_weights = [h['value'] / total_value for h in holdings]
            max_position = max(position_weights) if position_weights else 0
            
            # Sector concentration
            sector_exposure = {}
            for holding in holdings:
                sector = holding.get('sector', 'Unknown')
                if sector not in sector_exposure:
                    sector_exposure[sector] = 0
                sector_exposure[sector] += holding['value'] / total_value
                
            max_sector = max(sector_exposure.values()) if sector_exposure else 0
            
            # Herfindahl index (concentration measure)
            herfindahl = sum(w**2 for w in position_weights)
            
            # Calculate concentration risk score
            concentration_risk = 0
            
            # Position concentration
            if max_position > 0.20:
                concentration_risk += 30
            elif max_position > 0.15:
                concentration_risk += 20
            elif max_position > 0.10:
                concentration_risk += 10
                
            # Sector concentration
            if max_sector > 0.35:
                concentration_risk += 30
            elif max_sector > 0.25:
                concentration_risk += 20
            elif max_sector > 0.20:
                concentration_risk += 10
                
            # Diversification (Herfindahl)
            if herfindahl > 0.15:
                concentration_risk += 40
            elif herfindahl > 0.10:
                concentration_risk += 25
            elif herfindahl > 0.05:
                concentration_risk += 15
                
            return min(100, concentration_risk)
            
        except Exception as e:
            logger.error(f"Error calculating concentration risk: {e}")
            return 50
            
    async def calculate_var(self, holdings: List[Dict], confidence_level: float = 0.95) -> Tuple[float, float]:
        """Calculate Value at Risk and Conditional VaR"""
        try:
            # Get portfolio returns
            portfolio_returns = []
            
            for holding in holdings:
                symbol = holding['symbol']
                stock = yf.Ticker(symbol)
                hist = stock.history(period="1y")
                
                if not hist.empty:
                    returns = hist['Close'].pct_change().dropna()
                    portfolio_returns.extend(returns.tolist())
                    
            if portfolio_returns:
                # Sort returns
                sorted_returns = sorted(portfolio_returns)
                
                # VaR calculation
                var_index = int((1 - confidence_level) * len(sorted_returns))
                var_95 = abs(sorted_returns[var_index])
                
                # CVaR (Expected Shortfall)
                cvar_95 = abs(np.mean(sorted_returns[:var_index]))
            else:
                var_95 = 0.05
                cvar_95 = 0.08
                
            return var_95, cvar_95
            
        except Exception as e:
            logger.error(f"Error calculating VaR: {e}")
            return 0.05, 0.08
            
    async def calculate_portfolio_greeks(self, holdings: List[Dict]) -> Dict:
        """Calculate portfolio Greeks for options positions"""
        # Simplified Greeks calculation
        # In production, would use proper options pricing models
        return {
            'delta': 0.6,  # Portfolio delta
            'gamma': 0.02,  # Portfolio gamma
            'theta': -0.05,  # Portfolio theta
            'vega': 0.15,  # Portfolio vega
            'rho': 0.03  # Portfolio rho
        }
        
    async def calculate_correlation_risk(self, holdings: List[Dict]) -> float:
        """Calculate correlation risk between holdings"""
        try:
            if len(holdings) < 2:
                return 0
                
            # Get returns for all holdings
            returns_data = pd.DataFrame()
            
            for holding in holdings[:10]:  # Limit to top 10 for performance
                symbol = holding['symbol']
                stock = yf.Ticker(symbol)
                hist = stock.history(period="3mo")
                
                if not hist.empty:
                    returns = hist['Close'].pct_change().dropna()
                    returns_data[symbol] = returns
                    
            if returns_data.shape[1] > 1:
                # Calculate correlation matrix
                corr_matrix = returns_data.corr()
                
                # Get upper triangle of correlation matrix
                upper_triangle = corr_matrix.where(
                    np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)
                )
                
                # Average correlation
                avg_correlation = upper_triangle.stack().mean()
                
                # High correlation increases risk
                if avg_correlation > 0.7:
                    correlation_risk = 80
                elif avg_correlation > 0.5:
                    correlation_risk = 60
                elif avg_correlation > 0.3:
                    correlation_risk = 40
                else:
                    correlation_risk = 20
            else:
                correlation_risk = 50
                
            return correlation_risk
            
        except Exception as e:
            logger.error(f"Error calculating correlation risk: {e}")
            return 50
            
    def get_risk_rating(self, risk_score: float) -> str:
        """Get risk rating based on score"""
        if risk_score < 20:
            return 'VERY_LOW'
        elif risk_score < 40:
            return 'LOW'
        elif risk_score < 60:
            return 'MODERATE'
        elif risk_score < 80:
            return 'HIGH'
        else:
            return 'VERY_HIGH'
            
    async def check_risk_breaches(self, assessment: Dict, holdings: List[Dict]) -> List[Dict]:
        """Check for risk limit breaches"""
        breaches = []
        
        # VaR breach
        if assessment['var_95'] > self.risk_limits['max_var_95']:
            breaches.append({
                'type': 'VAR_BREACH',
                'current': assessment['var_95'],
                'limit': self.risk_limits['max_var_95'],
                'severity': 'HIGH'
            })
            
        # Concentration breaches
        total_value = sum(h['value'] for h in holdings)
        for holding in holdings:
            weight = holding['value'] / total_value
            if weight > self.risk_limits['max_single_position']:
                breaches.append({
                    'type': 'POSITION_CONCENTRATION',
                    'symbol': holding['symbol'],
                    'current': weight,
                    'limit': self.risk_limits['max_single_position'],
                    'severity': 'MEDIUM'
                })
                
        return breaches
        
    async def generate_risk_alerts(self, portfolio_id: str, breaches: List[Dict]):
        """Generate risk alerts for breaches"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for breach in breaches:
            message = f"Risk limit breach: {breach['type']} - Current: {breach['current']:.2%}, Limit: {breach['limit']:.2%}"
            
            cursor.execute("""
                INSERT INTO risk_alerts 
                (alert_type, severity, portfolio_id, message, metrics, recommended_action)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                breach['type'],
                breach['severity'],
                portfolio_id,
                message,
                json.dumps(breach),
                self.get_recommended_action(breach['type'])
            ))
            
        conn.commit()
        conn.close()
        
    def get_recommended_action(self, breach_type: str) -> str:
        """Get recommended action for risk breach"""
        actions = {
            'VAR_BREACH': 'Reduce portfolio leverage and consider hedging strategies',
            'POSITION_CONCENTRATION': 'Rebalance portfolio to reduce position size',
            'SECTOR_CONCENTRATION': 'Diversify across multiple sectors',
            'LIQUIDITY_RISK': 'Increase allocation to liquid assets',
            'CORRELATION_RISK': 'Add uncorrelated assets to portfolio'
        }
        return actions.get(breach_type, 'Review portfolio and consult risk manager')
        
    async def check_compliance(self, portfolio_id: str, holdings: List[Dict]) -> Dict:
        """Check regulatory compliance"""
        try:
            violations = []
            
            # Check minimum diversification
            if len(holdings) < self.compliance_rules['min_diversification']:
                violations.append({
                    'rule': 'MINIMUM_DIVERSIFICATION',
                    'message': f"Portfolio has {len(holdings)} stocks, minimum required: {self.compliance_rules['min_diversification']}",
                    'severity': 'HIGH'
                })
                
            # Check for proper disclosures
            total_value = sum(h['value'] for h in holdings)
            for holding in holdings:
                weight = holding['value'] / total_value
                if weight > self.compliance_rules['disclosure_threshold']:
                    violations.append({
                        'rule': 'DISCLOSURE_REQUIREMENT',
                        'message': f"{holding['symbol']} exceeds {self.compliance_rules['disclosure_threshold']:.0%} threshold",
                        'severity': 'MEDIUM'
                    })
                    
            compliance_status = {
                'portfolio_id': portfolio_id,
                'compliant': len(violations) == 0,
                'violations': violations,
                'checked_at': datetime.now().isoformat()
            }
            
            # Store compliance check
            await self.store_compliance_check(compliance_status)
            
            return compliance_status
            
        except Exception as e:
            logger.error(f"Error checking compliance: {e}")
            return {'compliant': False, 'error': str(e)}
            
    async def run_stress_tests(self, portfolio_id: str, holdings: List[Dict]) -> List[Dict]:
        """Run stress tests on portfolio"""
        scenarios = [
            {
                'name': 'Market Crash -20%',
                'type': 'MARKET_SHOCK',
                'market_change': -0.20,
                'volatility_multiplier': 2.0
            },
            {
                'name': 'Interest Rate Hike',
                'type': 'RATE_SHOCK',
                'rate_change': 0.02,
                'sector_impacts': {'Banking': 0.05, 'IT': -0.10}
            },
            {
                'name': 'Currency Devaluation',
                'type': 'CURRENCY_SHOCK',
                'currency_change': -0.15,
                'export_benefit': 0.10
            },
            {
                'name': 'Sector Rotation',
                'type': 'SECTOR_ROTATION',
                'from_sectors': ['IT', 'Pharma'],
                'to_sectors': ['Banking', 'Auto'],
                'rotation_magnitude': 0.15
            }
        ]
        
        results = []
        
        for scenario in scenarios:
            impact = await self.calculate_scenario_impact(holdings, scenario)
            results.append({
                'scenario_name': scenario['name'],
                'scenario_type': scenario['type'],
                'portfolio_impact': impact['total_impact'],
                'affected_positions': impact['affected_positions'],
                'recommendations': impact['recommendations']
            })
            
            # Store stress test result
            await self.store_stress_test(portfolio_id, results[-1])
            
        return results
        
    async def calculate_scenario_impact(self, holdings: List[Dict], scenario: Dict) -> Dict:
        """Calculate impact of stress scenario"""
        total_value = sum(h['value'] for h in holdings)
        total_impact = 0
        affected_positions = []
        
        for holding in holdings:
            impact = 0
            
            if scenario['type'] == 'MARKET_SHOCK':
                # Simple market shock impact
                impact = holding['value'] * scenario['market_change']
                
            elif scenario['type'] == 'RATE_SHOCK':
                # Sector-specific impacts
                sector = holding.get('sector', 'Unknown')
                sector_impact = scenario['sector_impacts'].get(sector, -0.05)
                impact = holding['value'] * sector_impact
                
            if impact != 0:
                affected_positions.append({
                    'symbol': holding['symbol'],
                    'impact': impact,
                    'impact_percentage': impact / holding['value']
                })
                total_impact += impact
                
        return {
            'total_impact': total_impact / total_value,
            'affected_positions': affected_positions,
            'recommendations': self.get_stress_test_recommendations(scenario, total_impact / total_value)
        }
        
    def get_stress_test_recommendations(self, scenario: Dict, impact: float) -> List[str]:
        """Get recommendations based on stress test results"""
        recommendations = []
        
        if abs(impact) > 0.15:
            recommendations.append("Consider hedging strategies to protect against extreme scenarios")
            recommendations.append("Review portfolio allocation and reduce concentrated positions")
            
        if scenario['type'] == 'MARKET_SHOCK':
            recommendations.append("Increase allocation to defensive sectors")
            recommendations.append("Consider adding gold or other safe-haven assets")
            
        elif scenario['type'] == 'RATE_SHOCK':
            recommendations.append("Review exposure to rate-sensitive sectors")
            recommendations.append("Consider floating rate instruments")
            
        return recommendations
        
    async def store_risk_assessment(self, assessment: Dict):
        """Store risk assessment in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO risk_assessments 
            (portfolio_id, assessment_date, overall_risk_score, market_risk, 
             credit_risk, liquidity_risk, concentration_risk, var_95, cvar_95,
             beta, correlation_risk)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            assessment['portfolio_id'],
            assessment['assessment_date'],
            assessment['overall_risk_score'],
            assessment['market_risk'],
            assessment['credit_risk'],
            assessment['liquidity_risk'],
            assessment['concentration_risk'],
            assessment['var_95'],
            assessment['cvar_95'],
            assessment['greeks'].get('delta', 0),
            assessment['correlation_risk']
        ))
        
        conn.commit()
        conn.close()
        
    async def store_compliance_check(self, compliance_status: Dict):
        """Store compliance check in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO compliance_checks 
            (portfolio_id, check_type, status, details, violations)
            VALUES (?, ?, ?, ?, ?)
        """, (
            compliance_status['portfolio_id'],
            'SEBI_RBI_COMPLIANCE',
            'COMPLIANT' if compliance_status['compliant'] else 'VIOLATION',
            json.dumps(compliance_status),
            json.dumps(compliance_status['violations'])
        ))
        
        conn.commit()
        conn.close()
        
    async def store_stress_test(self, portfolio_id: str, result: Dict):
        """Store stress test result in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO stress_tests 
            (portfolio_id, scenario_name, scenario_type, impact_percentage, 
             affected_positions, recommendations)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            portfolio_id,
            result['scenario_name'],
            result['scenario_type'],
            result['portfolio_impact'],
            json.dumps(result['affected_positions']),
            json.dumps(result['recommendations'])
        ))
        
        conn.commit()
        conn.close()
        
    async def generate_risk_report(self, portfolio_id: str) -> Dict:
        """Generate comprehensive risk report"""
        try:
            # Get latest risk assessment
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT * FROM risk_assessments 
                WHERE portfolio_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            """, (portfolio_id,))
            
            assessment = cursor.fetchone()
            
            # Get active alerts
            cursor.execute("""
                SELECT * FROM risk_alerts 
                WHERE portfolio_id = ? AND status = 'ACTIVE'
                ORDER BY severity DESC, created_at DESC
            """, (portfolio_id,))
            
            alerts = cursor.fetchall()
            
            # Get recent compliance checks
            cursor.execute("""
                SELECT * FROM compliance_checks 
                WHERE portfolio_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            """, (portfolio_id,))
            
            compliance = cursor.fetchone()
            
            conn.close()
            
            report = {
                'portfolio_id': portfolio_id,
                'report_date': datetime.now().isoformat(),
                'risk_assessment': {
                    'overall_score': assessment[3] if assessment else 0,
                    'risk_rating': self.get_risk_rating(assessment[3] if assessment else 50),
                    'var_95': assessment[8] if assessment else 0,
                    'max_drawdown': assessment[10] if assessment else 0
                },
                'active_alerts': len(alerts),
                'compliance_status': 'COMPLIANT' if compliance and compliance[3] == 'COMPLIANT' else 'REVIEW_REQUIRED',
                'recommendations': self.generate_recommendations(assessment, alerts, compliance)
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating risk report: {e}")
            return {}
            
    def generate_recommendations(self, assessment, alerts, compliance) -> List[str]:
        """Generate risk management recommendations"""
        recommendations = []
        
        if assessment and assessment[3] > 60:  # High risk score
            recommendations.append("Consider reducing portfolio leverage")
            recommendations.append("Increase diversification across sectors")
            
        if alerts and len(alerts) > 5:
            recommendations.append("Multiple risk alerts active - immediate review required")
            
        if compliance and compliance[3] != 'COMPLIANT':
            recommendations.append("Address compliance violations immediately")
            
        return recommendations
        
    async def run_continuous_monitoring(self):
        """Run continuous risk monitoring"""
        logger.info("Starting Risk & Compliance Agent...")
        
        while True:
            try:
                # Monitor all portfolios
                # In production, would get portfolio list from database
                
                await asyncio.sleep(900)  # 15 minutes
                
            except Exception as e:
                logger.error(f"Error in risk monitoring: {e}")
                await asyncio.sleep(60)

if __name__ == "__main__":
    agent = RiskComplianceAgent()
    asyncio.run(agent.run_continuous_monitoring())
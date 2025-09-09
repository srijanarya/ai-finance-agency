#!/usr/bin/env python3
"""
Compliance Monitoring System for SEBI Guidelines
Ensures all trading signals comply with regulatory requirements
"""

import sqlite3
import pandas as pd
import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging
import warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ComplianceMonitor:
    def __init__(self):
        self.db_path = 'compliance_monitoring.db'
        self.signals_db_path = 'premium_signals.db'
        self.initialize_compliance_db()
        
        # SEBI Compliance Rules
        self.compliance_rules = {
            'disclaimer_requirements': {
                'mandatory_text': [
                    "This is not financial advice",
                    "Past performance does not guarantee future results",
                    "Please consult your financial advisor",
                    "Trade at your own risk",
                    "SEBI Registration: [Required for advisory services]"
                ],
                'risk_warning_mandatory': True,
                'past_performance_warning': True
            },
            'signal_content_rules': {
                'no_guaranteed_returns': True,
                'no_assured_profits': True,
                'risk_disclosure_required': True,
                'clear_entry_exit_levels': True,
                'stop_loss_mandatory': True
            },
            'marketing_compliance': {
                'no_misleading_claims': True,
                'performance_context_required': True,
                'risk_prominence': True,
                'testimonials_restrictions': True
            },
            'research_analyst_requirements': {
                'analyst_credentials_disclosure': True,
                'research_methodology_disclosure': True,
                'conflicts_of_interest_disclosure': True,
                'update_policy_disclosure': True
            },
            'record_keeping': {
                'signal_tracking_mandatory': True,
                'performance_recording_required': True,
                'client_interaction_logs': True,
                'complaint_handling_logs': True
            }
        }
        
        # Prohibited words and phrases
        self.prohibited_terms = [
            'guaranteed profit', 'guaranteed returns', 'sure shot', 'assured profit',
            'risk-free', '100% success', 'never lose', 'always profitable',
            'get rich quick', 'easy money', 'no risk', 'foolproof',
            'certain profit', 'guaranteed success', 'zero risk'
        ]
        
        # Required disclaimers
        self.required_disclaimers = {
            'general_risk': "Trading in securities involves risks and there is no assurance of returns. Past performance is not indicative of future results.",
            'advice_disclaimer': "This information is for educational purposes only and should not be considered as financial advice. Please consult with a qualified financial advisor before making investment decisions.",
            'sebi_compliance': "This service complies with SEBI guidelines for investment advisors. All recommendations are based on technical and fundamental analysis.",
            'loss_warning': "Trading in derivatives and leveraged products can result in losses exceeding the initial investment."
        }
    
    def initialize_compliance_db(self):
        """Initialize compliance monitoring database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Compliance checks table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS compliance_checks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT NOT NULL,
            check_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            check_type TEXT NOT NULL,
            status TEXT NOT NULL,
            details TEXT,
            violations TEXT,
            severity TEXT DEFAULT 'LOW',
            resolved BOOLEAN DEFAULT 0,
            resolution_notes TEXT
        )
        ''')
        
        # Signal compliance status
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS signal_compliance_status (
            signal_id TEXT PRIMARY KEY,
            overall_status TEXT NOT NULL,
            last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
            disclaimer_compliance BOOLEAN DEFAULT 0,
            content_compliance BOOLEAN DEFAULT 0,
            marketing_compliance BOOLEAN DEFAULT 0,
            record_keeping_compliance BOOLEAN DEFAULT 0,
            violations_count INTEGER DEFAULT 0,
            approved_for_distribution BOOLEAN DEFAULT 0,
            approval_timestamp DATETIME,
            approved_by TEXT
        )
        ''')
        
        # Regulatory requirements tracking
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS regulatory_requirements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            requirement_type TEXT NOT NULL,
            requirement_description TEXT NOT NULL,
            compliance_level TEXT DEFAULT 'MANDATORY',
            effective_date DATE,
            review_date DATE,
            status TEXT DEFAULT 'ACTIVE',
            implementation_notes TEXT
        )
        ''')
        
        # Compliance violations log
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS compliance_violations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT,
            violation_type TEXT NOT NULL,
            violation_description TEXT NOT NULL,
            severity TEXT DEFAULT 'MEDIUM',
            detected_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'OPEN',
            resolution_timestamp DATETIME,
            corrective_action TEXT,
            responsible_person TEXT
        )
        ''')
        
        # Audit trail
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_trail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action_type TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            user_id TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            details TEXT,
            ip_address TEXT,
            user_agent TEXT
        )
        ''')
        
        # Client complaints and feedback
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS client_feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            feedback_type TEXT DEFAULT 'GENERAL',
            subject TEXT,
            description TEXT NOT NULL,
            signal_id TEXT,
            severity TEXT DEFAULT 'LOW',
            status TEXT DEFAULT 'OPEN',
            created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved_timestamp DATETIME,
            resolution_notes TEXT,
            assigned_to TEXT
        )
        ''')
        
        conn.commit()
        conn.close()
        
        # Initialize default regulatory requirements
        self.setup_default_requirements()
    
    def setup_default_requirements(self):
        """Setup default SEBI compliance requirements"""
        default_requirements = [
            {
                'type': 'DISCLAIMER',
                'description': 'All investment recommendations must include risk disclaimers',
                'level': 'MANDATORY'
            },
            {
                'type': 'PERFORMANCE_WARNING',
                'description': 'Past performance warnings must be prominently displayed',
                'level': 'MANDATORY'
            },
            {
                'type': 'ADVISORY_REGISTRATION',
                'description': 'Investment advisory services require SEBI registration',
                'level': 'MANDATORY'
            },
            {
                'type': 'RECORD_KEEPING',
                'description': 'All client interactions and recommendations must be recorded',
                'level': 'MANDATORY'
            },
            {
                'type': 'RISK_PROFILING',
                'description': 'Client risk profiling before providing recommendations',
                'level': 'RECOMMENDED'
            },
            {
                'type': 'CONFLICT_DISCLOSURE',
                'description': 'Disclosure of conflicts of interest',
                'level': 'MANDATORY'
            }
        ]
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for req in default_requirements:
            cursor.execute('''
            INSERT OR IGNORE INTO regulatory_requirements 
            (requirement_type, requirement_description, compliance_level, effective_date, status)
            VALUES (?, ?, ?, ?, ?)
            ''', (
                req['type'], req['description'], req['level'],
                datetime.now().date(), 'ACTIVE'
            ))
        
        conn.commit()
        conn.close()
    
    def check_signal_compliance(self, signal_id: str) -> Dict:
        """Perform comprehensive compliance check on a signal"""
        # Get signal data
        signal_data = self.get_signal_data(signal_id)
        if not signal_data:
            return {'status': 'ERROR', 'message': 'Signal not found'}
        
        compliance_results = {
            'signal_id': signal_id,
            'overall_status': 'COMPLIANT',
            'checks_performed': [],
            'violations': [],
            'warnings': [],
            'recommendations': []
        }
        
        # Perform various compliance checks
        checks = [
            self.check_disclaimer_compliance,
            self.check_content_compliance,
            self.check_marketing_compliance,
            self.check_risk_disclosure,
            self.check_prohibited_terms
        ]
        
        for check_function in checks:
            try:
                check_result = check_function(signal_data)
                compliance_results['checks_performed'].append(check_result['check_type'])
                
                if check_result['status'] == 'VIOLATION':
                    compliance_results['violations'].append(check_result)
                    compliance_results['overall_status'] = 'NON_COMPLIANT'
                elif check_result['status'] == 'WARNING':
                    compliance_results['warnings'].append(check_result)
                    if compliance_results['overall_status'] == 'COMPLIANT':
                        compliance_results['overall_status'] = 'NEEDS_REVIEW'
                
                if 'recommendations' in check_result:
                    compliance_results['recommendations'].extend(check_result['recommendations'])
                    
            except Exception as e:
                logger.error(f"Error in compliance check {check_function.__name__}: {e}")
                continue
        
        # Store compliance results
        self.store_compliance_results(signal_id, compliance_results)
        
        # Log audit trail
        self.log_audit_action('COMPLIANCE_CHECK', 'SIGNAL', signal_id, 
                             details=json.dumps(compliance_results))
        
        return compliance_results
    
    def get_signal_data(self, signal_id: str) -> Optional[Dict]:
        """Get signal data from signals database"""
        try:
            conn = sqlite3.connect(self.signals_db_path)
            
            query = 'SELECT * FROM signals WHERE signal_id = ?'
            cursor = conn.cursor()
            cursor.execute(query, (signal_id,))
            
            columns = [description[0] for description in cursor.description]
            row = cursor.fetchone()
            
            conn.close()
            
            if row:
                return dict(zip(columns, row))
            return None
            
        except Exception as e:
            logger.error(f"Error fetching signal data: {e}")
            return None
    
    def check_disclaimer_compliance(self, signal_data: Dict) -> Dict:
        """Check if signal includes required disclaimers"""
        check_result = {
            'check_type': 'DISCLAIMER_COMPLIANCE',
            'status': 'COMPLIANT',
            'details': [],
            'violations': [],
            'recommendations': []
        }
        
        analysis_text = signal_data.get('analysis', '').lower()
        
        # Check for risk disclaimer
        risk_keywords = ['risk', 'loss', 'not guaranteed', 'past performance']
        risk_mentioned = any(keyword in analysis_text for keyword in risk_keywords)
        
        if not risk_mentioned:
            check_result['status'] = 'VIOLATION'
            check_result['violations'].append("Missing risk disclaimer")
            check_result['recommendations'].append("Add risk warning to signal analysis")
        
        # Check for financial advice disclaimer
        advice_disclaimer = any(phrase in analysis_text for phrase in 
                               ['not financial advice', 'educational purpose', 'consult advisor'])
        
        if not advice_disclaimer:
            check_result['status'] = 'WARNING'
            check_result['details'].append("Consider adding financial advice disclaimer")
            check_result['recommendations'].append("Add 'This is not financial advice' disclaimer")
        
        return check_result
    
    def check_content_compliance(self, signal_data: Dict) -> Dict:
        """Check signal content for compliance violations"""
        check_result = {
            'check_type': 'CONTENT_COMPLIANCE',
            'status': 'COMPLIANT',
            'details': [],
            'violations': [],
            'recommendations': []
        }
        
        analysis_text = signal_data.get('analysis', '').lower()
        
        # Check for mandatory fields
        required_fields = ['entry_price', 'stop_loss', 'target_price']
        missing_fields = []
        
        for field in required_fields:
            if not signal_data.get(field) or signal_data.get(field) == 0:
                missing_fields.append(field)
        
        if missing_fields:
            check_result['status'] = 'VIOLATION'
            check_result['violations'].append(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Check risk-reward ratio
        risk_reward = signal_data.get('risk_reward_ratio', 0)
        if risk_reward < 1.5:
            check_result['status'] = 'WARNING'
            check_result['details'].append(f"Low risk-reward ratio: {risk_reward}")
            check_result['recommendations'].append("Consider signals with better risk-reward ratios")
        
        # Check confidence score reasonableness
        confidence = signal_data.get('confidence_score', 0)
        if confidence > 9:
            check_result['status'] = 'WARNING'
            check_result['details'].append("Very high confidence score may mislead investors")
            check_result['recommendations'].append("Review confidence scoring methodology")
        
        return check_result
    
    def check_marketing_compliance(self, signal_data: Dict) -> Dict:
        """Check marketing compliance"""
        check_result = {
            'check_type': 'MARKETING_COMPLIANCE',
            'status': 'COMPLIANT',
            'details': [],
            'violations': [],
            'recommendations': []
        }
        
        analysis_text = signal_data.get('analysis', '').lower()
        
        # Check for promotional language that might be misleading
        promotional_terms = ['hot tip', 'insider', 'exclusive', 'secret', 'limited time']
        found_promotional = [term for term in promotional_terms if term in analysis_text]
        
        if found_promotional:
            check_result['status'] = 'WARNING'
            check_result['details'].append(f"Promotional language detected: {', '.join(found_promotional)}")
            check_result['recommendations'].append("Use neutral, analytical language")
        
        # Check for overly aggressive language
        aggressive_terms = ['must buy', 'don\'t miss', 'urgent', 'act now', 'last chance']
        found_aggressive = [term for term in aggressive_terms if term in analysis_text]
        
        if found_aggressive:
            check_result['status'] = 'VIOLATION'
            check_result['violations'].append(f"Aggressive marketing language: {', '.join(found_aggressive)}")
        
        return check_result
    
    def check_risk_disclosure(self, signal_data: Dict) -> Dict:
        """Check adequacy of risk disclosure"""
        check_result = {
            'check_type': 'RISK_DISCLOSURE',
            'status': 'COMPLIANT',
            'details': [],
            'violations': [],
            'recommendations': []
        }
        
        analysis_text = signal_data.get('analysis', '').lower()
        signal_type = signal_data.get('signal_type', '')
        
        # Risk disclosure requirements based on signal type
        if signal_type == 'SCALPING':
            if 'high frequency' not in analysis_text and 'quick trades' not in analysis_text:
                check_result['status'] = 'WARNING'
                check_result['details'].append("Scalping risks not adequately disclosed")
                check_result['recommendations'].append("Add scalping-specific risk warnings")
        
        elif signal_type == 'INVESTMENT':
            if 'long-term' not in analysis_text and 'market volatility' not in analysis_text:
                check_result['status'] = 'WARNING'
                check_result['details'].append("Long-term investment risks not disclosed")
                check_result['recommendations'].append("Add long-term investment risk warnings")
        
        # Check for crypto-specific warnings
        if signal_data.get('asset_class') == 'CRYPTO':
            crypto_warnings = ['volatile', 'regulatory risk', 'high risk']
            crypto_warning_present = any(warning in analysis_text for warning in crypto_warnings)
            
            if not crypto_warning_present:
                check_result['status'] = 'VIOLATION'
                check_result['violations'].append("Crypto-specific risk warnings missing")
        
        return check_result
    
    def check_prohibited_terms(self, signal_data: Dict) -> Dict:
        """Check for prohibited terms and phrases"""
        check_result = {
            'check_type': 'PROHIBITED_TERMS',
            'status': 'COMPLIANT',
            'details': [],
            'violations': [],
            'recommendations': []
        }
        
        analysis_text = signal_data.get('analysis', '').lower()
        
        # Check for prohibited terms
        found_prohibited = []
        for term in self.prohibited_terms:
            if term in analysis_text:
                found_prohibited.append(term)
        
        if found_prohibited:
            check_result['status'] = 'VIOLATION'
            check_result['violations'].append(f"Prohibited terms found: {', '.join(found_prohibited)}")
            check_result['recommendations'].append("Remove guaranteed return claims and misleading language")
        
        # Check for percentage claims without context
        percentage_pattern = r'(\d+)%\s*(profit|return|gain)'
        percentage_matches = re.findall(percentage_pattern, analysis_text)
        
        if percentage_matches:
            check_result['status'] = 'WARNING'
            check_result['details'].append("Specific return percentages mentioned")
            check_result['recommendations'].append("Provide context and disclaimers for return projections")
        
        return check_result
    
    def store_compliance_results(self, signal_id: str, results: Dict):
        """Store compliance check results"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Store overall compliance status
        cursor.execute('''
        INSERT OR REPLACE INTO signal_compliance_status 
        (signal_id, overall_status, disclaimer_compliance, content_compliance,
         marketing_compliance, violations_count, approved_for_distribution)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            signal_id, results['overall_status'],
            'disclaimer_compliance' in [c['check_type'] for c in results['checks_performed']],
            'content_compliance' in [c['check_type'] for c in results['checks_performed']],
            'marketing_compliance' in [c['check_type'] for c in results['checks_performed']],
            len(results['violations']),
            results['overall_status'] == 'COMPLIANT'
        ))
        
        # Store individual violations
        for violation in results['violations']:
            cursor.execute('''
            INSERT INTO compliance_violations 
            (signal_id, violation_type, violation_description, severity)
            VALUES (?, ?, ?, ?)
            ''', (
                signal_id, violation['check_type'], 
                '; '.join(violation['violations']), 'HIGH'
            ))
        
        # Store warnings as low-severity violations
        for warning in results['warnings']:
            cursor.execute('''
            INSERT INTO compliance_violations 
            (signal_id, violation_type, violation_description, severity)
            VALUES (?, ?, ?, ?)
            ''', (
                signal_id, warning['check_type'], 
                '; '.join(warning['details']), 'LOW'
            ))
        
        conn.commit()
        conn.close()
    
    def log_audit_action(self, action_type: str, entity_type: str, entity_id: str, 
                        user_id: str = None, details: str = None):
        """Log audit trail for compliance actions"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT INTO audit_trail 
        (action_type, entity_type, entity_id, user_id, details)
        VALUES (?, ?, ?, ?, ?)
        ''', (action_type, entity_type, entity_id, user_id, details))
        
        conn.commit()
        conn.close()
    
    def approve_signal_for_distribution(self, signal_id: str, approver_id: str) -> Tuple[bool, str]:
        """Approve signal for distribution after compliance check"""
        # Get compliance status
        compliance_status = self.get_signal_compliance_status(signal_id)
        
        if not compliance_status:
            return False, "Signal compliance status not found"
        
        if compliance_status['overall_status'] != 'COMPLIANT':
            if compliance_status['violations_count'] > 0:
                return False, f"Signal has {compliance_status['violations_count']} compliance violations"
        
        # Approve signal
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        UPDATE signal_compliance_status 
        SET approved_for_distribution = 1, approval_timestamp = ?, approved_by = ?
        WHERE signal_id = ?
        ''', (datetime.now(), approver_id, signal_id))
        
        conn.commit()
        conn.close()
        
        # Log approval
        self.log_audit_action('SIGNAL_APPROVAL', 'SIGNAL', signal_id, approver_id,
                             f"Signal approved for distribution")
        
        logger.info(f"Signal {signal_id} approved for distribution by {approver_id}")
        return True, "Signal approved for distribution"
    
    def get_signal_compliance_status(self, signal_id: str) -> Optional[Dict]:
        """Get compliance status for a signal"""
        conn = sqlite3.connect(self.db_path)
        
        query = 'SELECT * FROM signal_compliance_status WHERE signal_id = ?'
        df = pd.read_sql_query(query, conn, params=(signal_id,))
        conn.close()
        
        if df.empty:
            return None
        
        return df.iloc[0].to_dict()
    
    def generate_compliance_report(self, start_date: str, end_date: str) -> Dict:
        """Generate comprehensive compliance report"""
        conn = sqlite3.connect(self.db_path)
        
        # Overall compliance metrics
        overall_query = '''
        SELECT 
            COUNT(*) as total_signals,
            COUNT(CASE WHEN overall_status = 'COMPLIANT' THEN 1 END) as compliant_signals,
            COUNT(CASE WHEN overall_status = 'NON_COMPLIANT' THEN 1 END) as non_compliant_signals,
            COUNT(CASE WHEN overall_status = 'NEEDS_REVIEW' THEN 1 END) as needs_review_signals,
            COUNT(CASE WHEN approved_for_distribution = 1 THEN 1 END) as approved_signals
        FROM signal_compliance_status 
        WHERE DATE(last_checked) BETWEEN ? AND ?
        '''
        
        overall_df = pd.read_sql_query(overall_query, conn, params=(start_date, end_date))
        
        # Violations by type
        violations_query = '''
        SELECT 
            violation_type,
            COUNT(*) as count,
            severity
        FROM compliance_violations 
        WHERE DATE(detected_timestamp) BETWEEN ? AND ?
        GROUP BY violation_type, severity
        ORDER BY count DESC
        '''
        
        violations_df = pd.read_sql_query(violations_query, conn, params=(start_date, end_date))
        
        # Compliance trends
        trends_query = '''
        SELECT 
            DATE(last_checked) as date,
            COUNT(*) as total_checks,
            COUNT(CASE WHEN overall_status = 'COMPLIANT' THEN 1 END) as compliant_count
        FROM signal_compliance_status 
        WHERE DATE(last_checked) BETWEEN ? AND ?
        GROUP BY DATE(last_checked)
        ORDER BY date
        '''
        
        trends_df = pd.read_sql_query(trends_query, conn, params=(start_date, end_date))
        
        conn.close()
        
        # Calculate compliance rate
        if not overall_df.empty and overall_df.iloc[0]['total_signals'] > 0:
            compliance_rate = (overall_df.iloc[0]['compliant_signals'] / 
                             overall_df.iloc[0]['total_signals']) * 100
        else:
            compliance_rate = 0
        
        report = {
            'period': {'start': start_date, 'end': end_date},
            'summary': {
                'total_signals_checked': int(overall_df.iloc[0]['total_signals']) if not overall_df.empty else 0,
                'compliant_signals': int(overall_df.iloc[0]['compliant_signals']) if not overall_df.empty else 0,
                'non_compliant_signals': int(overall_df.iloc[0]['non_compliant_signals']) if not overall_df.empty else 0,
                'needs_review_signals': int(overall_df.iloc[0]['needs_review_signals']) if not overall_df.empty else 0,
                'approved_signals': int(overall_df.iloc[0]['approved_signals']) if not overall_df.empty else 0,
                'compliance_rate_percentage': compliance_rate
            },
            'violations_breakdown': violations_df.to_dict('records'),
            'compliance_trends': trends_df.to_dict('records'),
            'generated_at': datetime.now().isoformat()
        }
        
        return report
    
    def handle_client_complaint(self, complaint_data: Dict) -> str:
        """Handle client complaints and feedback"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT INTO client_feedback 
        (client_id, feedback_type, subject, description, signal_id, severity)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            complaint_data['client_id'],
            complaint_data.get('feedback_type', 'COMPLAINT'),
            complaint_data.get('subject', ''),
            complaint_data['description'],
            complaint_data.get('signal_id'),
            complaint_data.get('severity', 'MEDIUM')
        ))
        
        complaint_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Log audit trail
        self.log_audit_action('CLIENT_COMPLAINT', 'FEEDBACK', str(complaint_id),
                             complaint_data['client_id'], 
                             f"Complaint: {complaint_data.get('subject', 'No subject')}")
        
        logger.info(f"Client complaint recorded: ID {complaint_id}")
        return f"COMPLAINT_{complaint_id:06d}"
    
    def get_compliance_dashboard_data(self) -> Dict:
        """Get compliance dashboard data"""
        conn = sqlite3.connect(self.db_path)
        
        # Recent compliance status
        recent_query = '''
        SELECT 
            overall_status,
            COUNT(*) as count
        FROM signal_compliance_status 
        WHERE DATE(last_checked) >= DATE('now', '-7 days')
        GROUP BY overall_status
        '''
        
        recent_df = pd.read_sql_query(recent_query, conn)
        
        # Active violations
        violations_query = '''
        SELECT 
            violation_type,
            severity,
            COUNT(*) as count
        FROM compliance_violations 
        WHERE status = 'OPEN'
        GROUP BY violation_type, severity
        '''
        
        violations_df = pd.read_sql_query(violations_query, conn)
        
        # Pending approvals
        pending_query = '''
        SELECT COUNT(*) as pending_count
        FROM signal_compliance_status 
        WHERE overall_status = 'COMPLIANT' 
        AND approved_for_distribution = 0
        '''
        
        pending_df = pd.read_sql_query(pending_query, conn)
        
        conn.close()
        
        dashboard_data = {
            'compliance_summary': {
                'recent_checks': recent_df.to_dict('records'),
                'total_recent_checks': recent_df['count'].sum() if not recent_df.empty else 0
            },
            'active_violations': violations_df.to_dict('records'),
            'pending_approvals': int(pending_df.iloc[0]['pending_count']) if not pending_df.empty else 0,
            'last_updated': datetime.now().isoformat()
        }
        
        return dashboard_data
    
    def batch_compliance_check(self, signal_ids: List[str]) -> Dict:
        """Perform batch compliance check on multiple signals"""
        results = {
            'total_signals': len(signal_ids),
            'compliant': 0,
            'non_compliant': 0,
            'needs_review': 0,
            'errors': 0,
            'detailed_results': []
        }
        
        for signal_id in signal_ids:
            try:
                compliance_result = self.check_signal_compliance(signal_id)
                results['detailed_results'].append(compliance_result)
                
                if compliance_result['overall_status'] == 'COMPLIANT':
                    results['compliant'] += 1
                elif compliance_result['overall_status'] == 'NON_COMPLIANT':
                    results['non_compliant'] += 1
                elif compliance_result['overall_status'] == 'NEEDS_REVIEW':
                    results['needs_review'] += 1
                    
            except Exception as e:
                logger.error(f"Error checking compliance for {signal_id}: {e}")
                results['errors'] += 1
        
        logger.info(f"Batch compliance check completed: {results['compliant']} compliant, "
                   f"{results['non_compliant']} non-compliant, {results['needs_review']} need review")
        
        return results
    
    def add_required_disclaimers(self, signal_data: Dict) -> Dict:
        """Add required disclaimers to signal analysis"""
        analysis = signal_data.get('analysis', '')
        
        # Add general risk disclaimer if not present
        risk_keywords = ['risk', 'loss', 'not guaranteed']
        if not any(keyword in analysis.lower() for keyword in risk_keywords):
            analysis += f"\n\n⚠️ {self.required_disclaimers['general_risk']}"
        
        # Add advice disclaimer
        if 'financial advice' not in analysis.lower():
            analysis += f"\n\n📋 {self.required_disclaimers['advice_disclaimer']}"
        
        # Add asset-specific disclaimers
        if signal_data.get('asset_class') == 'CRYPTO':
            if 'volatile' not in analysis.lower():
                analysis += "\n\n🚨 Cryptocurrency trading involves high volatility and regulatory risks."
        
        if signal_data.get('signal_type') == 'SCALPING':
            if 'quick trades' not in analysis.lower():
                analysis += f"\n\n⚠️ {self.required_disclaimers['loss_warning']}"
        
        signal_data['analysis'] = analysis
        return signal_data
    
    def run_daily_compliance_scan(self):
        """Run daily compliance scan on all recent signals"""
        try:
            # Get all signals from today that haven't been checked
            conn = sqlite3.connect(self.signals_db_path)
            
            query = '''
            SELECT signal_id FROM signals 
            WHERE DATE(timestamp) = DATE('now')
            AND signal_id NOT IN (
                SELECT signal_id FROM signal_compliance_status 
                WHERE DATE(last_checked) = DATE('now')
            )
            '''
            
            df = pd.read_sql_query(query, conn)
            conn.close()
            
            if df.empty:
                logger.info("No new signals to check for compliance")
                return
            
            signal_ids = df['signal_id'].tolist()
            
            # Run batch compliance check
            results = self.batch_compliance_check(signal_ids)
            
            logger.info(f"Daily compliance scan completed: "
                       f"{results['compliant']} compliant, "
                       f"{results['non_compliant']} non-compliant, "
                       f"{results['needs_review']} need review")
            
            return results
            
        except Exception as e:
            logger.error(f"Error in daily compliance scan: {e}")
            return None

if __name__ == "__main__":
    # Initialize compliance monitor
    monitor = ComplianceMonitor()
    
    # Example: Check compliance for a sample signal
    sample_signal_data = {
        'signal_id': 'TEST_001',
        'symbol': 'RELIANCE.NS',
        'analysis': 'Technical breakout pattern with strong volume. Entry above 2500.',
        'entry_price': 2500,
        'stop_loss': 2450,
        'target_price': 2600,
        'risk_reward_ratio': 2.0,
        'confidence_score': 8,
        'asset_class': 'INDIAN_EQUITY',
        'signal_type': 'SWING'
    }
    
    # Mock store the signal first
    conn = sqlite3.connect(monitor.signals_db_path)
    conn.execute('''
    CREATE TABLE IF NOT EXISTS signals (
        signal_id TEXT PRIMARY KEY,
        symbol TEXT,
        analysis TEXT,
        entry_price REAL,
        stop_loss REAL,
        target_price REAL,
        risk_reward_ratio REAL,
        confidence_score INTEGER,
        asset_class TEXT,
        signal_type TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.execute('''
    INSERT OR REPLACE INTO signals 
    (signal_id, symbol, analysis, entry_price, stop_loss, target_price, 
     risk_reward_ratio, confidence_score, asset_class, signal_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        sample_signal_data['signal_id'], sample_signal_data['symbol'],
        sample_signal_data['analysis'], sample_signal_data['entry_price'],
        sample_signal_data['stop_loss'], sample_signal_data['target_price'],
        sample_signal_data['risk_reward_ratio'], sample_signal_data['confidence_score'],
        sample_signal_data['asset_class'], sample_signal_data['signal_type']
    ))
    conn.commit()
    conn.close()
    
    # Run compliance check
    compliance_result = monitor.check_signal_compliance('TEST_001')
    print("Compliance Check Result:")
    print(json.dumps(compliance_result, indent=2))
    
    # Get compliance report
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=7)
    
    report = monitor.generate_compliance_report(start_date.isoformat(), end_date.isoformat())
    print("\nCompliance Report:")
    print(json.dumps(report, indent=2, default=str))
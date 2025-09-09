#!/usr/bin/env python3
"""
Database Schema Initializer for Premium Trading Signal Service
Sets up all required databases and schemas for the AI Finance Agency platform
"""

import sqlite3
import os
import json
from datetime import datetime, timedelta
import pandas as pd
import logging
from typing import Dict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseInitializer:
    def __init__(self):
        self.databases = {
            'premium_signals.db': self.create_signals_schema,
            'subscribers.db': self.create_subscribers_schema,
            'performance_analytics.db': self.create_performance_schema,
            'subscription_management.db': self.create_subscription_management_schema,
            'compliance_monitoring.db': self.create_compliance_schema,
            'api_keys.db': self.create_api_keys_schema
        }
    
    def initialize_all_databases(self):
        """Initialize all databases and their schemas"""
        logger.info("Starting database initialization...")
        
        for db_name, schema_function in self.databases.items():
            try:
                logger.info(f"Initializing {db_name}...")
                schema_function(db_name)
                logger.info(f"✅ {db_name} initialized successfully")
            except Exception as e:
                logger.error(f"❌ Error initializing {db_name}: {e}")
        
        # Create indexes for performance optimization
        self.create_database_indexes()
        
        # Insert sample data for testing
        self.insert_sample_data()
        
        logger.info("🎉 Database initialization completed!")
    
    def create_signals_schema(self, db_path: str):
        """Create signals database schema"""
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Main signals table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT UNIQUE NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            symbol TEXT NOT NULL,
            asset_class TEXT NOT NULL,
            signal_type TEXT NOT NULL,
            action TEXT NOT NULL,
            entry_price REAL NOT NULL,
            stop_loss REAL NOT NULL,
            target_price REAL NOT NULL,
            risk_reward_ratio REAL NOT NULL,
            confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 1 AND 10),
            timeframe TEXT NOT NULL,
            analysis TEXT NOT NULL,
            status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'CANCELLED')),
            exit_price REAL,
            exit_timestamp DATETIME,
            pnl_percentage REAL,
            tier_access TEXT DEFAULT 'BASIC' CHECK (tier_access IN ('BASIC', 'PRO', 'ENTERPRISE')),
            created_by TEXT DEFAULT 'SYSTEM',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Signal metadata table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS signal_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT NOT NULL,
            metadata_key TEXT NOT NULL,
            metadata_value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (signal_id) REFERENCES signals (signal_id),
            UNIQUE(signal_id, metadata_key)
        )
        ''')
        
        # Signal tags table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS signal_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT NOT NULL,
            tag TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (signal_id) REFERENCES signals (signal_id),
            UNIQUE(signal_id, tag)
        )
        ''')
        
        # Market data cache table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS market_data_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            timestamp DATETIME NOT NULL,
            open_price REAL,
            high_price REAL,
            low_price REAL,
            close_price REAL,
            volume BIGINT,
            indicators TEXT,
            timeframe TEXT DEFAULT '5m',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(symbol, timestamp, timeframe)
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_subscribers_schema(self, db_path: str):
        """Create subscribers database schema"""
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Subscribers table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            telegram_chat_id TEXT,
            whatsapp_number TEXT,
            firebase_token TEXT,
            subscription_tier TEXT DEFAULT 'BASIC' CHECK (subscription_tier IN ('BASIC', 'PRO', 'ENTERPRISE')),
            status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_signal_sent DATETIME,
            preferences TEXT,
            payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
            timezone TEXT DEFAULT 'UTC',
            language TEXT DEFAULT 'en'
        )
        ''')
        
        # Delivery logs table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS delivery_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            channel TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            error_message TEXT,
            delivery_time_ms INTEGER,
            retry_count INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES subscribers (user_id)
        )
        ''')
        
        # Channel performance table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS channel_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            channel TEXT NOT NULL,
            total_sent INTEGER DEFAULT 0,
            successful_deliveries INTEGER DEFAULT 0,
            failed_deliveries INTEGER DEFAULT 0,
            avg_delivery_time_ms REAL,
            bounce_rate REAL,
            UNIQUE(date, channel)
        )
        ''')
        
        # Subscriber engagement metrics
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriber_engagement (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            date DATE NOT NULL,
            signals_received INTEGER DEFAULT 0,
            signals_opened INTEGER DEFAULT 0,
            signals_clicked INTEGER DEFAULT 0,
            app_sessions INTEGER DEFAULT 0,
            session_duration_minutes REAL DEFAULT 0,
            last_activity DATETIME,
            FOREIGN KEY (user_id) REFERENCES subscribers (user_id),
            UNIQUE(user_id, date)
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_performance_schema(self, db_path: str):
        """Create performance analytics database schema"""
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Signal performance table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS signal_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT UNIQUE NOT NULL,
            symbol TEXT,
            asset_class TEXT,
            signal_type TEXT,
            action TEXT,
            entry_price REAL,
            exit_price REAL,
            stop_loss REAL,
            target_price REAL,
            entry_timestamp DATETIME,
            exit_timestamp DATETIME,
            holding_period_hours REAL,
            pnl_percentage REAL,
            pnl_absolute REAL,
            max_favorable_excursion REAL,
            max_adverse_excursion REAL,
            hit_target BOOLEAN DEFAULT 0,
            hit_stop_loss BOOLEAN DEFAULT 0,
            confidence_score INTEGER,
            risk_reward_ratio REAL,
            actual_risk_reward REAL,
            benchmark_return REAL,
            alpha REAL,
            trade_quality_score REAL CHECK (trade_quality_score BETWEEN 0 AND 100)
        )
        ''')
        
        # Daily performance aggregates
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE UNIQUE NOT NULL,
            total_signals INTEGER DEFAULT 0,
            active_signals INTEGER DEFAULT 0,
            closed_signals INTEGER DEFAULT 0,
            winning_signals INTEGER DEFAULT 0,
            losing_signals INTEGER DEFAULT 0,
            win_rate REAL,
            avg_return REAL,
            total_return REAL,
            sharpe_ratio REAL,
            sortino_ratio REAL,
            max_drawdown REAL,
            profit_factor REAL,
            avg_holding_period_hours REAL,
            best_trade_return REAL,
            worst_trade_return REAL,
            total_trades_value REAL,
            volatility REAL,
            calmar_ratio REAL
        )
        ''')
        
        # Asset class performance
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS asset_class_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            asset_class TEXT NOT NULL,
            total_signals INTEGER DEFAULT 0,
            win_rate REAL,
            avg_return REAL,
            sharpe_ratio REAL,
            max_drawdown REAL,
            alpha REAL,
            benchmark_return REAL,
            correlation REAL,
            UNIQUE(date, asset_class)
        )
        ''')
        
        # Strategy performance by signal type
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS strategy_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            signal_type TEXT NOT NULL,
            strategy_subtype TEXT,
            total_signals INTEGER DEFAULT 0,
            win_rate REAL,
            avg_return REAL,
            sharpe_ratio REAL,
            profit_factor REAL,
            max_drawdown REAL,
            avg_confidence REAL,
            avg_holding_period REAL,
            UNIQUE(date, signal_type, strategy_subtype)
        )
        ''')
        
        # Benchmark data cache
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS benchmark_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            date DATE NOT NULL,
            open_price REAL,
            high_price REAL,
            low_price REAL,
            close_price REAL,
            adj_close REAL,
            volume BIGINT,
            returns REAL,
            UNIQUE(symbol, date)
        )
        ''')
        
        # Risk metrics table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS risk_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            portfolio_value REAL,
            var_95 REAL,
            var_99 REAL,
            expected_shortfall REAL,
            maximum_drawdown REAL,
            portfolio_beta REAL,
            portfolio_volatility REAL,
            tracking_error REAL
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_subscription_management_schema(self, db_path: str):
        """Create subscription management database schema"""
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Subscriptions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL,
            name TEXT,
            phone TEXT,
            subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('BASIC', 'PRO', 'ENTERPRISE')),
            billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
            status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED', 'CANCELLED_AT_PERIOD_END')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            next_billing_date DATETIME,
            trial_end_date DATETIME,
            payment_method_id TEXT,
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            total_paid REAL DEFAULT 0,
            discount_percentage REAL DEFAULT 0,
            referral_code TEXT,
            referred_by TEXT,
            cancellation_date DATETIME,
            cancellation_reason TEXT,
            auto_renew BOOLEAN DEFAULT 1,
            preferences TEXT,
            notes TEXT,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Payment history table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS payment_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            stripe_payment_id TEXT,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'USD',
            status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING', 'REFUNDED')),
            payment_method TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            billing_period_start DATE,
            billing_period_end DATE,
            invoice_url TEXT,
            receipt_url TEXT,
            failure_reason TEXT,
            transaction_fee REAL,
            FOREIGN KEY (user_id) REFERENCES subscriptions (user_id)
        )
        ''')
        
        # Usage tracking table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS usage_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            date DATE NOT NULL,
            signals_received INTEGER DEFAULT 0,
            signals_acted_on INTEGER DEFAULT 0,
            api_calls INTEGER DEFAULT 0,
            login_count INTEGER DEFAULT 0,
            last_activity DATETIME,
            feature_usage TEXT,
            bandwidth_used_mb REAL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES subscriptions (user_id),
            UNIQUE(user_id, date)
        )
        ''')
        
        # Subscription analytics table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscription_analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            tier TEXT NOT NULL,
            new_subscriptions INTEGER DEFAULT 0,
            cancelled_subscriptions INTEGER DEFAULT 0,
            renewed_subscriptions INTEGER DEFAULT 0,
            active_subscriptions INTEGER DEFAULT 0,
            churned_subscriptions INTEGER DEFAULT 0,
            mrr REAL DEFAULT 0,
            arr REAL DEFAULT 0,
            churn_rate REAL DEFAULT 0,
            ltv REAL DEFAULT 0,
            cac REAL DEFAULT 0,
            net_revenue_retention REAL DEFAULT 0,
            UNIQUE(date, tier)
        )
        ''')
        
        # Discount codes table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS discount_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed_amount')),
            discount_value REAL NOT NULL,
            applicable_tiers TEXT,
            max_uses INTEGER,
            current_uses INTEGER DEFAULT 0,
            valid_from DATETIME NOT NULL,
            valid_until DATETIME NOT NULL,
            created_by TEXT,
            status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Referrals table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS referrals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            referrer_user_id TEXT NOT NULL,
            referred_user_id TEXT NOT NULL,
            referral_code TEXT NOT NULL,
            reward_amount REAL,
            reward_status TEXT DEFAULT 'PENDING' CHECK (reward_status IN ('PENDING', 'PAID', 'CANCELLED')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            converted_at DATETIME,
            reward_paid_at DATETIME,
            FOREIGN KEY (referrer_user_id) REFERENCES subscriptions (user_id),
            FOREIGN KEY (referred_user_id) REFERENCES subscriptions (user_id)
        )
        ''')
        
        # Trial conversions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS trial_conversions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            trial_start DATETIME NOT NULL,
            trial_end DATETIME NOT NULL,
            converted BOOLEAN DEFAULT 0,
            conversion_date DATETIME,
            conversion_tier TEXT,
            engagement_score REAL,
            signals_during_trial INTEGER DEFAULT 0,
            last_activity_trial DATETIME,
            conversion_value REAL,
            FOREIGN KEY (user_id) REFERENCES subscriptions (user_id)
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_compliance_schema(self, db_path: str):
        """Create compliance monitoring database schema"""
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Compliance checks table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS compliance_checks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT NOT NULL,
            check_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            check_type TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('PASS', 'FAIL', 'WARNING')),
            details TEXT,
            violations TEXT,
            severity TEXT DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
            resolved BOOLEAN DEFAULT 0,
            resolution_notes TEXT,
            resolved_by TEXT,
            resolved_at DATETIME
        )
        ''')
        
        # Signal compliance status
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS signal_compliance_status (
            signal_id TEXT PRIMARY KEY,
            overall_status TEXT NOT NULL CHECK (overall_status IN ('COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW', 'PENDING')),
            last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
            disclaimer_compliance BOOLEAN DEFAULT 0,
            content_compliance BOOLEAN DEFAULT 0,
            marketing_compliance BOOLEAN DEFAULT 0,
            record_keeping_compliance BOOLEAN DEFAULT 0,
            violations_count INTEGER DEFAULT 0,
            approved_for_distribution BOOLEAN DEFAULT 0,
            approval_timestamp DATETIME,
            approved_by TEXT,
            compliance_score REAL CHECK (compliance_score BETWEEN 0 AND 100)
        )
        ''')
        
        # Regulatory requirements tracking
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS regulatory_requirements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            requirement_type TEXT NOT NULL,
            requirement_description TEXT NOT NULL,
            compliance_level TEXT DEFAULT 'MANDATORY' CHECK (compliance_level IN ('MANDATORY', 'RECOMMENDED', 'OPTIONAL')),
            effective_date DATE,
            review_date DATE,
            status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUPERSEDED')),
            implementation_notes TEXT,
            responsible_team TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Compliance violations log
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS compliance_violations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT,
            violation_type TEXT NOT NULL,
            violation_description TEXT NOT NULL,
            severity TEXT DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
            detected_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACKNOWLEDGED')),
            resolution_timestamp DATETIME,
            corrective_action TEXT,
            responsible_person TEXT,
            estimated_resolution_date DATE,
            actual_resolution_date DATE
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
            user_agent TEXT,
            session_id TEXT,
            before_state TEXT,
            after_state TEXT
        )
        ''')
        
        # Client feedback and complaints
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS client_feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            feedback_type TEXT DEFAULT 'GENERAL' CHECK (feedback_type IN ('COMPLAINT', 'SUGGESTION', 'COMPLIMENT', 'GENERAL', 'BUG_REPORT')),
            subject TEXT,
            description TEXT NOT NULL,
            signal_id TEXT,
            severity TEXT DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
            status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
            created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved_timestamp DATETIME,
            resolution_notes TEXT,
            assigned_to TEXT,
            category TEXT,
            tags TEXT
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_api_keys_schema(self, db_path: str):
        """Create API keys database schema"""
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # API keys table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_key TEXT UNIQUE NOT NULL,
            client_name TEXT NOT NULL,
            client_email TEXT,
            subscription_tier TEXT DEFAULT 'ENTERPRISE' CHECK (subscription_tier IN ('BASIC', 'PRO', 'ENTERPRISE')),
            rate_limit INTEGER DEFAULT 1000,
            status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            last_used DATETIME,
            usage_count INTEGER DEFAULT 0,
            allowed_ips TEXT,
            scopes TEXT,
            notes TEXT
        )
        ''')
        
        # API usage logs
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_usage_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_key TEXT NOT NULL,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT,
            status_code INTEGER,
            response_time_ms INTEGER,
            request_size_bytes INTEGER,
            response_size_bytes INTEGER,
            error_message TEXT,
            FOREIGN KEY (api_key) REFERENCES api_keys (api_key)
        )
        ''')
        
        # Rate limiting table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS rate_limits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_key TEXT NOT NULL,
            time_window DATETIME NOT NULL,
            request_count INTEGER DEFAULT 1,
            UNIQUE(api_key, time_window),
            FOREIGN KEY (api_key) REFERENCES api_keys (api_key)
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_database_indexes(self):
        """Create indexes for performance optimization"""
        logger.info("Creating database indexes for performance optimization...")
        
        # Indexes for signals database
        self.create_indexes('premium_signals.db', [
            'CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals (timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals (symbol)',
            'CREATE INDEX IF NOT EXISTS idx_signals_status ON signals (status)',
            'CREATE INDEX IF NOT EXISTS idx_signals_tier_access ON signals (tier_access)',
            'CREATE INDEX IF NOT EXISTS idx_signals_asset_class ON signals (asset_class)',
            'CREATE INDEX IF NOT EXISTS idx_market_data_symbol_timestamp ON market_data_cache (symbol, timestamp)'
        ])
        
        # Indexes for subscribers database
        self.create_indexes('subscribers.db', [
            'CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON subscribers (user_id)',
            'CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email)',
            'CREATE INDEX IF NOT EXISTS idx_subscribers_tier ON subscribers (subscription_tier)',
            'CREATE INDEX IF NOT EXISTS idx_delivery_logs_signal_id ON delivery_logs (signal_id)',
            'CREATE INDEX IF NOT EXISTS idx_delivery_logs_user_id ON delivery_logs (user_id)',
            'CREATE INDEX IF NOT EXISTS idx_delivery_logs_timestamp ON delivery_logs (timestamp)'
        ])
        
        # Indexes for performance database
        self.create_indexes('performance_analytics.db', [
            'CREATE INDEX IF NOT EXISTS idx_performance_signal_id ON signal_performance (signal_id)',
            'CREATE INDEX IF NOT EXISTS idx_performance_entry_timestamp ON signal_performance (entry_timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_daily_performance_date ON daily_performance (date)',
            'CREATE INDEX IF NOT EXISTS idx_asset_performance_date_class ON asset_class_performance (date, asset_class)'
        ])
        
        # Indexes for subscription management
        self.create_indexes('subscription_management.db', [
            'CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id)',
            'CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions (subscription_tier)',
            'CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status)',
            'CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history (user_id)',
            'CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date ON usage_tracking (user_id, date)'
        ])
        
        # Indexes for compliance monitoring
        self.create_indexes('compliance_monitoring.db', [
            'CREATE INDEX IF NOT EXISTS idx_compliance_checks_signal_id ON compliance_checks (signal_id)',
            'CREATE INDEX IF NOT EXISTS idx_compliance_status_signal_id ON signal_compliance_status (signal_id)',
            'CREATE INDEX IF NOT EXISTS idx_violations_signal_id ON compliance_violations (signal_id)',
            'CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail (timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_feedback_client_id ON client_feedback (client_id)'
        ])
        
        # Indexes for API keys
        self.create_indexes('api_keys.db', [
            'CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys (api_key)',
            'CREATE INDEX IF NOT EXISTS idx_api_usage_key ON api_usage_logs (api_key)',
            'CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage_logs (timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window ON rate_limits (api_key, time_window)'
        ])
    
    def create_indexes(self, db_path: str, indexes: list):
        """Create indexes for a specific database"""
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        for index_sql in indexes:
            try:
                cursor.execute(index_sql)
            except Exception as e:
                logger.warning(f"Index creation warning for {db_path}: {e}")
        
        conn.commit()
        conn.close()
    
    def insert_sample_data(self):
        """Insert sample data for testing"""
        logger.info("Inserting sample data for testing...")
        
        # Sample discount codes
        self.insert_sample_discount_codes()
        
        # Sample regulatory requirements
        self.insert_sample_regulatory_requirements()
        
        # Sample API key for testing
        self.insert_sample_api_key()
        
        logger.info("Sample data inserted successfully")
    
    def insert_sample_discount_codes(self):
        """Insert sample discount codes"""
        conn = sqlite3.connect('subscription_management.db')
        cursor = conn.cursor()
        
        sample_codes = [
            {
                'code': 'LAUNCH50',
                'discount_type': 'percentage',
                'discount_value': 50.0,
                'applicable_tiers': json.dumps(['BASIC', 'PRO']),
                'max_uses': 100,
                'valid_from': datetime.now(),
                'valid_until': datetime.now() + timedelta(days=30),
                'created_by': 'SYSTEM'
            },
            {
                'code': 'ANNUAL25',
                'discount_type': 'percentage',
                'discount_value': 25.0,
                'applicable_tiers': json.dumps(['BASIC', 'PRO', 'ENTERPRISE']),
                'max_uses': 1000,
                'valid_from': datetime.now(),
                'valid_until': datetime.now() + timedelta(days=365),
                'created_by': 'SYSTEM'
            },
            {
                'code': 'STUDENT30',
                'discount_type': 'percentage',
                'discount_value': 30.0,
                'applicable_tiers': json.dumps(['BASIC', 'PRO']),
                'max_uses': 500,
                'valid_from': datetime.now(),
                'valid_until': datetime.now() + timedelta(days=180),
                'created_by': 'SYSTEM'
            }
        ]
        
        for code in sample_codes:
            cursor.execute('''
            INSERT OR IGNORE INTO discount_codes 
            (code, discount_type, discount_value, applicable_tiers, max_uses, 
             valid_from, valid_until, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                code['code'], code['discount_type'], code['discount_value'],
                code['applicable_tiers'], code['max_uses'], code['valid_from'],
                code['valid_until'], code['created_by']
            ))
        
        conn.commit()
        conn.close()
    
    def insert_sample_regulatory_requirements(self):
        """Insert sample regulatory requirements"""
        conn = sqlite3.connect('compliance_monitoring.db')
        cursor = conn.cursor()
        
        requirements = [
            {
                'type': 'SEBI_DISCLAIMER',
                'description': 'All investment recommendations must include SEBI-compliant risk disclaimers',
                'level': 'MANDATORY',
                'team': 'Compliance'
            },
            {
                'type': 'PAST_PERFORMANCE_WARNING',
                'description': 'Past performance warnings must be prominently displayed in all communications',
                'level': 'MANDATORY',
                'team': 'Legal'
            },
            {
                'type': 'RISK_PROFILING',
                'description': 'Client risk profiling before providing investment recommendations',
                'level': 'RECOMMENDED',
                'team': 'Operations'
            },
            {
                'type': 'RECORD_KEEPING',
                'description': 'Comprehensive record keeping of all client interactions and recommendations',
                'level': 'MANDATORY',
                'team': 'Operations'
            },
            {
                'type': 'CONFLICT_DISCLOSURE',
                'description': 'Full disclosure of any conflicts of interest',
                'level': 'MANDATORY',
                'team': 'Compliance'
            }
        ]
        
        for req in requirements:
            cursor.execute('''
            INSERT OR IGNORE INTO regulatory_requirements 
            (requirement_type, requirement_description, compliance_level, 
             effective_date, status)
            VALUES (?, ?, ?, ?, ?)
            ''', (
                req['type'], req['description'], req['level'],
                datetime.now().date(), 'ACTIVE'
            ))
        
        conn.commit()
        conn.close()
    
    def insert_sample_api_key(self):
        """Insert a sample API key for testing"""
        conn = sqlite3.connect('api_keys.db')
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT OR IGNORE INTO api_keys 
        (api_key, client_name, client_email, subscription_tier, rate_limit, scopes)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            'test_api_key_12345abcdef',
            'Test Client',
            'test@example.com',
            'ENTERPRISE',
            10000,
            json.dumps(['signals:read', 'performance:read', 'analytics:read'])
        ))
        
        conn.commit()
        conn.close()
    
    def verify_database_integrity(self) -> Dict:
        """Verify all databases are properly created and accessible"""
        logger.info("Verifying database integrity...")
        
        results = {
            'status': 'SUCCESS',
            'databases_checked': 0,
            'tables_verified': 0,
            'indexes_verified': 0,
            'errors': []
        }
        
        for db_name in self.databases.keys():
            try:
                if not os.path.exists(db_name):
                    results['errors'].append(f"Database file not found: {db_name}")
                    continue
                
                conn = sqlite3.connect(db_name)
                cursor = conn.cursor()
                
                # Check tables exist
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = cursor.fetchall()
                results['tables_verified'] += len(tables)
                
                # Check indexes exist
                cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
                indexes = cursor.fetchall()
                results['indexes_verified'] += len(indexes)
                
                conn.close()
                results['databases_checked'] += 1
                
                logger.info(f"✅ {db_name}: {len(tables)} tables, {len(indexes)} indexes")
                
            except Exception as e:
                error_msg = f"Error verifying {db_name}: {e}"
                results['errors'].append(error_msg)
                logger.error(error_msg)
        
        if results['errors']:
            results['status'] = 'ERRORS_FOUND'
        
        logger.info(f"Database verification completed: "
                   f"{results['databases_checked']} databases, "
                   f"{results['tables_verified']} tables, "
                   f"{results['indexes_verified']} indexes")
        
        return results
    
    def get_database_statistics(self) -> Dict:
        """Get statistics about all databases"""
        stats = {}
        
        for db_name in self.databases.keys():
            try:
                conn = sqlite3.connect(db_name)
                
                # Get table statistics
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT name, 
                           (SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND tbl_name=m.name) as index_count
                    FROM sqlite_master m WHERE type='table'
                """)
                
                tables = cursor.fetchall()
                
                # Get database size
                cursor.execute("PRAGMA page_count")
                page_count = cursor.fetchone()[0]
                cursor.execute("PRAGMA page_size")
                page_size = cursor.fetchone()[0]
                db_size = page_count * page_size
                
                stats[db_name] = {
                    'tables': len(tables),
                    'total_indexes': sum(table[1] for table in tables),
                    'size_bytes': db_size,
                    'size_mb': round(db_size / (1024 * 1024), 2),
                    'table_details': [{'name': t[0], 'indexes': t[1]} for t in tables]
                }
                
                conn.close()
                
            except Exception as e:
                stats[db_name] = {'error': str(e)}
        
        return stats
    
    def backup_databases(self, backup_dir: str = 'backups'):
        """Create backup of all databases"""
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_results = []
        
        for db_name in self.databases.keys():
            try:
                if os.path.exists(db_name):
                    backup_name = f"{backup_dir}/{db_name.replace('.db', '')}_{timestamp}.db"
                    
                    # Simple file copy for SQLite backup
                    import shutil
                    shutil.copy2(db_name, backup_name)
                    
                    backup_results.append({
                        'database': db_name,
                        'backup_file': backup_name,
                        'status': 'SUCCESS'
                    })
                    
                    logger.info(f"✅ Backed up {db_name} to {backup_name}")
                
            except Exception as e:
                backup_results.append({
                    'database': db_name,
                    'status': 'FAILED',
                    'error': str(e)
                })
                logger.error(f"❌ Failed to backup {db_name}: {e}")
        
        return backup_results

if __name__ == "__main__":
    # Initialize all databases
    initializer = DatabaseInitializer()
    
    # Create all databases and schemas
    initializer.initialize_all_databases()
    
    # Verify database integrity
    verification_results = initializer.verify_database_integrity()
    print("\nDatabase Verification Results:")
    print(json.dumps(verification_results, indent=2))
    
    # Get database statistics
    stats = initializer.get_database_statistics()
    print("\nDatabase Statistics:")
    for db_name, db_stats in stats.items():
        print(f"\n{db_name}:")
        if 'error' not in db_stats:
            print(f"  Tables: {db_stats['tables']}")
            print(f"  Indexes: {db_stats['total_indexes']}")
            print(f"  Size: {db_stats['size_mb']} MB")
        else:
            print(f"  Error: {db_stats['error']}")
    
    # Create backup
    backup_results = initializer.backup_databases()
    print(f"\nBackup completed: {len([r for r in backup_results if r['status'] == 'SUCCESS'])} successful")
    
    print("\n🎉 Database initialization and verification completed successfully!")
    print("\nThe premium trading signal service databases are ready for use.")
    print("\nNext steps:")
    print("1. Configure API keys and external service credentials")
    print("2. Set up monitoring and alerting")
    print("3. Deploy the signal generation and distribution services")
    print("4. Begin subscriber onboarding and signal distribution")
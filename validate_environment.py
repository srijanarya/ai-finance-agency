#!/usr/bin/env python3
"""
Environment Validation Script for AI Finance Agency
Tests all API connections and validates configuration
"""

import sys
import os
import asyncio
from typing import Dict, List, Tuple
from dotenv import load_dotenv
import logging

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


class EnvironmentValidator:
    """Validates environment configuration and tests connections"""
    
    def __init__(self):
        self.results = {
            'ai_services': {},
            'databases': {},
            'social_media': {},
            'market_data': {},
            'external_services': {}
        }
        self.errors = []
        self.warnings = []
        self.successes = []
    
    async def validate_ai_services(self):
        """Test AI service connections"""
        print("\n🤖 Testing AI Services...")
        
        # Test OpenAI
        openai_key = os.getenv('OPENAI_API_KEY')
        if openai_key and openai_key.startswith('sk-'):
            try:
                import openai
                client = openai.OpenAI(api_key=openai_key)
                # Simple test - get models list
                models = client.models.list()
                self.results['ai_services']['openai'] = 'connected'
                self.successes.append("✅ OpenAI API connected successfully")
            except Exception as e:
                self.results['ai_services']['openai'] = 'failed'
                self.errors.append(f"❌ OpenAI connection failed: {str(e)}")
        else:
            self.results['ai_services']['openai'] = 'not_configured'
            self.warnings.append("⚠️ OpenAI API key not configured")
        
        # Test Anthropic Claude
        claude_key = os.getenv('CLAUDE_API_KEY')
        if claude_key and claude_key != 'sk-ant-api03-...' and claude_key != 'your_anthropic_key':
            try:
                import anthropic
                client = anthropic.Anthropic(api_key=claude_key)
                # Simple test message
                response = client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=10,
                    messages=[{"role": "user", "content": "test"}]
                )
                self.results['ai_services']['claude'] = 'connected'
                self.successes.append("✅ Claude API connected successfully")
            except Exception as e:
                self.results['ai_services']['claude'] = 'failed'
                self.errors.append(f"❌ Claude connection failed: {str(e)}")
        else:
            self.results['ai_services']['claude'] = 'not_configured'
            self.warnings.append("⚠️ Claude API key not configured")
    
    async def validate_databases(self):
        """Test database connections"""
        print("\n💾 Testing Database Connections...")
        
        # Test SQLite
        try:
            import sqlite3
            db_path = os.getenv('DATABASE_PATH', 'data/agency.db')
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT sqlite_version()")
            version = cursor.fetchone()[0]
            conn.close()
            self.results['databases']['sqlite'] = 'connected'
            self.successes.append(f"✅ SQLite database connected (v{version})")
        except Exception as e:
            self.results['databases']['sqlite'] = 'failed'
            self.errors.append(f"❌ SQLite connection failed: {str(e)}")
        
        # Test Redis
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        try:
            import redis
            r = redis.from_url(redis_url)
            r.ping()
            self.results['databases']['redis'] = 'connected'
            self.successes.append("✅ Redis cache connected")
        except:
            self.results['databases']['redis'] = 'not_available'
            self.warnings.append("⚠️ Redis cache not available (optional)")
        
        # Test Supabase
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        if supabase_url and supabase_key and not supabase_url.startswith('https://xxxxx'):
            try:
                from supabase import create_client
                supabase = create_client(supabase_url, supabase_key)
                # Simple test - try to access auth
                _ = supabase.auth
                self.results['databases']['supabase'] = 'connected'
                self.successes.append("✅ Supabase connected")
            except Exception as e:
                self.results['databases']['supabase'] = 'failed'
                self.errors.append(f"❌ Supabase connection failed: {str(e)}")
        else:
            self.results['databases']['supabase'] = 'not_configured'
            self.warnings.append("⚠️ Supabase not configured (optional)")
    
    async def validate_social_media(self):
        """Test social media API connections"""
        print("\n📱 Testing Social Media APIs...")
        
        # Test Twitter
        twitter_keys = [
            os.getenv('TWITTER_CONSUMER_KEY'),
            os.getenv('TWITTER_CONSUMER_SECRET'),
            os.getenv('TWITTER_ACCESS_TOKEN'),
            os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        ]
        
        if all(twitter_keys) and twitter_keys[0] != '':
            try:
                import tweepy
                auth = tweepy.OAuthHandler(twitter_keys[0], twitter_keys[1])
                auth.set_access_token(twitter_keys[2], twitter_keys[3])
                api = tweepy.API(auth)
                api.verify_credentials()
                self.results['social_media']['twitter'] = 'connected'
                self.successes.append("✅ Twitter API connected")
            except Exception as e:
                self.results['social_media']['twitter'] = 'failed'
                self.errors.append(f"❌ Twitter connection failed: {str(e)}")
        else:
            self.results['social_media']['twitter'] = 'not_configured'
            self.warnings.append("⚠️ Twitter API not configured")
        
        # Test Telegram
        telegram_token = os.getenv('TELEGRAM_BOT_TOKEN')
        if telegram_token and telegram_token != '':
            try:
                import requests
                response = requests.get(f'https://api.telegram.org/bot{telegram_token}/getMe')
                if response.status_code == 200:
                    self.results['social_media']['telegram'] = 'connected'
                    self.successes.append("✅ Telegram Bot connected")
                else:
                    self.results['social_media']['telegram'] = 'failed'
                    self.errors.append(f"❌ Telegram Bot connection failed")
            except Exception as e:
                self.results['social_media']['telegram'] = 'failed'
                self.errors.append(f"❌ Telegram connection failed: {str(e)}")
        else:
            self.results['social_media']['telegram'] = 'not_configured'
            self.warnings.append("⚠️ Telegram Bot not configured")
        
        # Test LinkedIn
        linkedin_token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN') or os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
        if linkedin_token and linkedin_token != '':
            self.results['social_media']['linkedin'] = 'configured'
            self.successes.append("✅ LinkedIn credentials configured (connection test requires OAuth flow)")
        else:
            self.results['social_media']['linkedin'] = 'not_configured'
            self.warnings.append("⚠️ LinkedIn not configured")
    
    async def validate_market_data(self):
        """Test market data API connections"""
        print("\n📈 Testing Market Data APIs...")
        
        # Test Alpha Vantage
        alpha_key = os.getenv('ALPHA_VANTAGE_KEY')
        if alpha_key and alpha_key != '':
            try:
                import requests
                response = requests.get(
                    f'https://www.alphavantage.co/query',
                    params={
                        'function': 'TIME_SERIES_INTRADAY',
                        'symbol': 'IBM',
                        'interval': '5min',
                        'apikey': alpha_key
                    }
                )
                if response.status_code == 200 and 'Error Message' not in response.text:
                    self.results['market_data']['alpha_vantage'] = 'connected'
                    self.successes.append("✅ Alpha Vantage API connected")
                else:
                    self.results['market_data']['alpha_vantage'] = 'failed'
                    self.errors.append("❌ Alpha Vantage API key invalid")
            except Exception as e:
                self.results['market_data']['alpha_vantage'] = 'failed'
                self.errors.append(f"❌ Alpha Vantage connection failed: {str(e)}")
        else:
            self.results['market_data']['alpha_vantage'] = 'not_configured'
            self.warnings.append("⚠️ Alpha Vantage not configured")
        
        # Test Yahoo Finance (no API key needed)
        try:
            import yfinance as yf
            ticker = yf.Ticker("AAPL")
            _ = ticker.info
            self.results['market_data']['yahoo_finance'] = 'connected'
            self.successes.append("✅ Yahoo Finance connected")
        except:
            self.results['market_data']['yahoo_finance'] = 'not_available'
            self.warnings.append("⚠️ Yahoo Finance not available")
    
    def generate_report(self) -> str:
        """Generate validation report"""
        report = []
        report.append("\n" + "="*60)
        report.append("🔍 ENVIRONMENT VALIDATION REPORT")
        report.append("="*60 + "\n")
        
        # Summary
        total_tests = sum(len(v) for v in self.results.values())
        successful = len(self.successes)
        failed = len(self.errors)
        warnings = len(self.warnings)
        
        report.append(f"📊 SUMMARY:")
        report.append(f"  Total Tests: {total_tests}")
        report.append(f"  ✅ Successful: {successful}")
        report.append(f"  ❌ Failed: {failed}")
        report.append(f"  ⚠️ Warnings: {warnings}")
        report.append("")
        
        # Successes
        if self.successes:
            report.append("✅ SUCCESSFUL CONNECTIONS:")
            for success in self.successes:
                report.append(f"  {success}")
            report.append("")
        
        # Errors
        if self.errors:
            report.append("❌ ERRORS (must fix for full functionality):")
            for error in self.errors:
                report.append(f"  {error}")
            report.append("")
        
        # Warnings
        if self.warnings:
            report.append("⚠️ WARNINGS (optional configurations):")
            for warning in self.warnings:
                report.append(f"  {warning}")
            report.append("")
        
        # Capability Assessment
        report.append("🎯 CAPABILITY ASSESSMENT:")
        
        # Check minimal requirements
        has_ai = any(v == 'connected' for v in self.results['ai_services'].values())
        has_db = self.results['databases'].get('sqlite') == 'connected'
        has_social = any(v in ['connected', 'configured'] for v in self.results['social_media'].values())
        
        if has_ai and has_db:
            report.append("  ✅ Core functionality available (AI + Database)")
        else:
            report.append("  ❌ Core functionality NOT available")
            if not has_ai:
                report.append("     - Missing: AI service configuration")
            if not has_db:
                report.append("     - Missing: Database configuration")
        
        if has_social:
            report.append("  ✅ Social media posting available")
        else:
            report.append("  ⚠️ Social media posting not available")
        
        if self.results['market_data'].get('yahoo_finance') == 'connected' or \
           any(v == 'connected' for k, v in self.results['market_data'].items() if k != 'yahoo_finance'):
            report.append("  ✅ Market data available")
        else:
            report.append("  ⚠️ Market data not available")
        
        report.append("\n" + "="*60)
        
        # Recommendation
        if failed == 0:
            report.append("🎉 All configured services are working!")
            report.append("✅ Environment is ready for use")
        elif has_ai and has_db:
            report.append("⚠️ Some services failed, but core functionality is available")
            report.append("📝 Review errors above and configure missing services as needed")
        else:
            report.append("❌ Critical services are not configured")
            report.append("📝 Please configure at least one AI service and ensure database is accessible")
        
        report.append("="*60 + "\n")
        
        return "\n".join(report)
    
    async def run_validation(self):
        """Run all validation tests"""
        print("\n🚀 Starting Environment Validation...\n")
        
        # Run all validations
        await self.validate_ai_services()
        await self.validate_databases()
        await self.validate_social_media()
        await self.validate_market_data()
        
        # Generate and print report
        report = self.generate_report()
        print(report)
        
        # Save report to file
        report_path = "validation_report.txt"
        with open(report_path, 'w') as f:
            f.write(report)
        print(f"📄 Report saved to: {report_path}")
        
        # Return status
        has_ai = any(v == 'connected' for v in self.results['ai_services'].values())
        has_db = self.results['databases'].get('sqlite') == 'connected'
        
        return has_ai and has_db  # Return True if core functionality is available


async def main():
    """Main execution function"""
    validator = EnvironmentValidator()
    is_valid = await validator.run_validation()
    
    # Exit with appropriate code
    sys.exit(0 if is_valid else 1)


if __name__ == "__main__":
    # Check if we should use the enhanced config
    if '--enhanced' in sys.argv:
        from config.enhanced_config import enhanced_config
        enhanced_config.print_validation_report()
        if not enhanced_config.is_valid:
            sys.exit(1)
    else:
        # Run async validation
        asyncio.run(main())
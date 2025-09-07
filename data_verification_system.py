#!/usr/bin/env python3
"""
DATA VERIFICATION SYSTEM
Prevents posting of inaccurate market data
"""

import yfinance as yf
from datetime import datetime, timedelta
import json
import logging
import hashlib

class DataVerificationSystem:
    """Comprehensive data verification to prevent inaccurate posts"""
    
    def __init__(self):
        self.verification_log = "/Users/srijan/ai-finance-agency/logs/data_verification.log"
        self.setup_logging()
        
        # Acceptable variance thresholds
        self.max_price_variance = 0.05  # 5% max difference between sources
        self.max_age_minutes = 30       # Data must be less than 30 minutes old
        
    def setup_logging(self):
        """Setup verification logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.verification_log),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def verify_market_data(self, data_dict):
        """Verify market data accuracy before posting"""
        
        self.logger.info("🔍 Starting data verification...")
        
        verification_results = {
            'timestamp': datetime.now().isoformat(),
            'status': 'PASSED',
            'errors': [],
            'warnings': [],
            'data_hash': self.generate_data_hash(data_dict)
        }
        
        # 1. Check data freshness
        if not self.verify_data_freshness(data_dict):
            verification_results['errors'].append("Data is too old (>30 minutes)")
            verification_results['status'] = 'FAILED'
        
        # 2. Cross-verify with multiple sources
        cross_check = self.cross_verify_prices(data_dict)
        if not cross_check['valid']:
            verification_results['errors'].extend(cross_check['errors'])
            verification_results['status'] = 'FAILED'
        
        # 3. Check for suspicious values
        if not self.check_realistic_values(data_dict):
            verification_results['errors'].append("Unrealistic market values detected")
            verification_results['status'] = 'FAILED'
        
        # 4. Validate against hardcoded patterns
        if self.detect_hardcoded_patterns(data_dict):
            verification_results['errors'].append("CRITICAL: Hardcoded data patterns detected")
            verification_results['status'] = 'FAILED'
        
        # Log results
        if verification_results['status'] == 'FAILED':
            self.logger.error(f"❌ Data verification FAILED: {verification_results['errors']}")
        else:
            self.logger.info("✅ Data verification PASSED")
        
        return verification_results
    
    def verify_data_freshness(self, data_dict):
        """Check if data is fresh (not stale)"""
        try:
            if 'timestamp' not in data_dict:
                self.logger.warning("⚠️ No timestamp in data")
                return False
            
            data_time = datetime.fromisoformat(data_dict['timestamp'].replace('Z', '+00:00'))
            age_minutes = (datetime.now() - data_time).total_seconds() / 60
            
            if age_minutes > self.max_age_minutes:
                self.logger.error(f"❌ Data too old: {age_minutes:.1f} minutes")
                return False
            
            self.logger.info(f"✅ Data freshness: {age_minutes:.1f} minutes")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Freshness check failed: {e}")
            return False
    
    def cross_verify_prices(self, data_dict):
        """Cross-verify prices with live sources"""
        results = {'valid': True, 'errors': []}
        
        try:
            # Fetch live comparison data
            live_nifty = yf.Ticker("^NSEI").history(period="1d")
            live_btc = yf.Ticker("BTC-USD").history(period="1d")
            live_dow = yf.Ticker("^DJI").history(period="1d")
            
            if len(live_nifty) == 0:
                results['errors'].append("Unable to fetch live NIFTY data for verification")
                results['valid'] = False
                return results
            
            # Compare NIFTY
            if 'nifty' in data_dict:
                live_nifty_price = live_nifty['Close'].iloc[-1]
                posted_nifty = data_dict['nifty'].get('price', 0)
                
                variance = abs(live_nifty_price - posted_nifty) / live_nifty_price
                if variance > self.max_price_variance:
                    results['errors'].append(f"NIFTY variance too high: {variance*100:.1f}%")
                    results['valid'] = False
                else:
                    self.logger.info(f"✅ NIFTY verification passed: {variance*100:.2f}% variance")
            
            # Compare Bitcoin
            if 'btc' in data_dict and len(live_btc) > 0:
                live_btc_price = live_btc['Close'].iloc[-1]
                posted_btc = data_dict['btc'].get('price', 0)
                
                variance = abs(live_btc_price - posted_btc) / live_btc_price
                if variance > self.max_price_variance:
                    results['errors'].append(f"Bitcoin variance too high: {variance*100:.1f}%")
                    results['valid'] = False
                else:
                    self.logger.info(f"✅ Bitcoin verification passed: {variance*100:.2f}% variance")
            
            # Compare Dow
            if 'dow' in data_dict and len(live_dow) > 0:
                live_dow_price = live_dow['Close'].iloc[-1]
                posted_dow = data_dict['dow'].get('price', 0)
                
                variance = abs(live_dow_price - posted_dow) / live_dow_price
                if variance > self.max_price_variance:
                    results['errors'].append(f"Dow variance too high: {variance*100:.1f}%")
                    results['valid'] = False
                else:
                    self.logger.info(f"✅ Dow verification passed: {variance*100:.2f}% variance")
            
        except Exception as e:
            results['errors'].append(f"Cross-verification failed: {e}")
            results['valid'] = False
        
        return results
    
    def check_realistic_values(self, data_dict):
        """Check for unrealistic market values"""
        
        # Realistic ranges (as of 2025)
        ranges = {
            'nifty': (20000, 30000),
            'sensex': (65000, 95000),
            'btc': (90000, 150000),
            'dow': (40000, 50000)
        }
        
        for market, (min_val, max_val) in ranges.items():
            if market in data_dict:
                price = data_dict[market].get('price', 0)
                if not (min_val <= price <= max_val):
                    self.logger.error(f"❌ {market.upper()} price unrealistic: {price}")
                    return False
        
        return True
    
    def detect_hardcoded_patterns(self, data_dict):
        """Detect if data contains known hardcoded patterns"""
        
        # Known hardcoded values that were causing issues
        suspicious_values = [
            24734.30,   # Hardcoded NIFTY
            80701.23,   # Hardcoded SENSEX
            109660,     # Hardcoded Bitcoin
            50821.50    # Hardcoded Bank NIFTY
        ]
        
        for market, values in data_dict.items():
            if isinstance(values, dict) and 'price' in values:
                price = values['price']
                if price in suspicious_values:
                    self.logger.error(f"🚨 HARDCODED VALUE DETECTED: {market} = {price}")
                    return True
        
        return False
    
    def generate_data_hash(self, data_dict):
        """Generate hash of data for tracking"""
        data_str = json.dumps(data_dict, sort_keys=True)
        return hashlib.md5(data_str.encode()).hexdigest()
    
    def approve_for_posting(self, data_dict):
        """Final approval check before posting"""
        
        verification = self.verify_market_data(data_dict)
        
        if verification['status'] == 'PASSED':
            self.logger.info("✅ DATA APPROVED FOR POSTING")
            self.log_approved_post(data_dict, verification)
            return True
        else:
            self.logger.error("❌ DATA REJECTED FOR POSTING")
            self.log_rejected_post(data_dict, verification)
            return False
    
    def log_approved_post(self, data_dict, verification):
        """Log approved posts"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'status': 'APPROVED',
            'data_hash': verification['data_hash'],
            'data_summary': self.summarize_data(data_dict)
        }
        
        with open('/Users/srijan/ai-finance-agency/logs/approved_posts.log', 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def log_rejected_post(self, data_dict, verification):
        """Log rejected posts"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'status': 'REJECTED',
            'errors': verification['errors'],
            'data_hash': verification['data_hash'],
            'data_summary': self.summarize_data(data_dict)
        }
        
        with open('/Users/srijan/ai-finance-agency/logs/rejected_posts.log', 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def summarize_data(self, data_dict):
        """Create summary of data for logging"""
        summary = {}
        for market, values in data_dict.items():
            if isinstance(values, dict) and 'price' in values:
                summary[market] = {
                    'price': values['price'],
                    'change_pct': values.get('change_pct', 0)
                }
        return summary

def main():
    """Test the verification system"""
    
    print("🔍 DATA VERIFICATION SYSTEM TEST")
    print("=" * 50)
    
    # Test with live data
    import yfinance as yf
    
    try:
        nifty = yf.Ticker("^NSEI").history(period="1d")
        btc = yf.Ticker("BTC-USD").history(period="1d")
        
        test_data = {
            'timestamp': datetime.now().isoformat(),
            'nifty': {
                'price': float(nifty['Close'].iloc[-1]),
                'change_pct': 0.5
            },
            'btc': {
                'price': float(btc['Close'].iloc[-1]),
                'change_pct': -1.2
            }
        }
        
        verifier = DataVerificationSystem()
        approved = verifier.approve_for_posting(test_data)
        
        print(f"\n📊 Test Result: {'✅ APPROVED' if approved else '❌ REJECTED'}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    main()
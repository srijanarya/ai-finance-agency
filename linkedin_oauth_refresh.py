#!/usr/bin/env python3
"""
LinkedIn OAuth Token Refresh System
Automatically refreshes LinkedIn tokens before expiry
"""

import os
import json
import time
import requests
import schedule
from datetime import datetime, timedelta
from dotenv import load_dotenv, set_key
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/Users/srijan/ai-finance-agency/data/logs/linkedin_oauth.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class LinkedInTokenManager:
    """Manages LinkedIn OAuth tokens with automatic refresh"""
    
    def __init__(self):
        load_dotenv()
        
        # OAuth credentials
        self.client_id = os.getenv('LINKEDIN_COMPANY_CLIENT_ID', '77ccq66ayuwvqo')
        self.client_secret = os.getenv('LINKEDIN_COMPANY_CLIENT_SECRET', 'WPL_AP1.Vj3PvAamQi6UQCmM.K478VA==')
        self.redirect_uri = 'http://localhost:8080/callback'
        
        # Token management
        self.token_file = '/Users/srijan/ai-finance-agency/data/linkedin_tokens.json'
        self.env_file = '/Users/srijan/ai-finance-agency/.env'
        
        # OAuth URLs
        self.token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
        self.introspect_url = 'https://www.linkedin.com/oauth/v2/introspectToken'
        
        # Load existing tokens
        self.load_tokens()
    
    def load_tokens(self):
        """Load existing tokens from file"""
        if os.path.exists(self.token_file):
            try:
                with open(self.token_file, 'r') as f:
                    data = json.load(f)
                    self.access_token = data.get('access_token')
                    self.refresh_token = data.get('refresh_token')
                    self.expires_at = datetime.fromisoformat(data.get('expires_at', ''))
                    logger.info(f"Loaded tokens. Expires at: {self.expires_at}")
            except Exception as e:
                logger.error(f"Error loading tokens: {e}")
                self.access_token = None
                self.refresh_token = None
                self.expires_at = None
        else:
            self.access_token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
            self.refresh_token = os.getenv('LINKEDIN_REFRESH_TOKEN')
            # Assume 60 days from now if no expiry info
            self.expires_at = datetime.now() + timedelta(days=60)
    
    def save_tokens(self):
        """Save tokens to file and environment"""
        data = {
            'access_token': self.access_token,
            'refresh_token': self.refresh_token,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'last_updated': datetime.now().isoformat()
        }
        
        # Save to JSON file
        os.makedirs(os.path.dirname(self.token_file), exist_ok=True)
        with open(self.token_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        # Update .env file
        if self.access_token:
            set_key(self.env_file, 'LINKEDIN_COMPANY_ACCESS_TOKEN', self.access_token)
        if self.refresh_token:
            set_key(self.env_file, 'LINKEDIN_REFRESH_TOKEN', self.refresh_token)
        
        logger.info("Tokens saved successfully")
    
    def check_token_validity(self):
        """Check if current token is valid"""
        if not self.access_token:
            logger.warning("No access token available")
            return False
        
        try:
            # Use introspection endpoint
            response = requests.post(
                self.introspect_url,
                data={'token': self.access_token, 'client_id': self.client_id}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('active'):
                    # Update expiry time
                    expires_in = data.get('expires_in', 0)
                    if expires_in > 0:
                        self.expires_at = datetime.now() + timedelta(seconds=expires_in)
                        self.save_tokens()
                    logger.info(f"Token is valid. Expires in {expires_in} seconds")
                    return True
                else:
                    logger.warning("Token is inactive")
                    return False
            else:
                logger.error(f"Token validation failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error checking token validity: {e}")
            return False
    
    def refresh_access_token(self):
        """Refresh the access token using refresh token"""
        if not self.refresh_token:
            logger.error("No refresh token available")
            return False
        
        try:
            data = {
                'grant_type': 'refresh_token',
                'refresh_token': self.refresh_token,
                'client_id': self.client_id,
                'client_secret': self.client_secret
            }
            
            response = requests.post(self.token_url, data=data)
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data.get('access_token')
                new_refresh = token_data.get('refresh_token')
                if new_refresh:
                    self.refresh_token = new_refresh
                
                # Calculate expiry (LinkedIn tokens typically last 60 days)
                expires_in = token_data.get('expires_in', 5184000)  # Default 60 days
                self.expires_at = datetime.now() + timedelta(seconds=expires_in)
                
                # Save new tokens
                self.save_tokens()
                
                logger.info(f"Token refreshed successfully. New expiry: {self.expires_at}")
                return True
            else:
                logger.error(f"Token refresh failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error refreshing token: {e}")
            return False
    
    def should_refresh(self):
        """Check if token should be refreshed (7 days before expiry)"""
        if not self.expires_at:
            return True
        
        days_until_expiry = (self.expires_at - datetime.now()).days
        
        if days_until_expiry <= 7:
            logger.info(f"Token expires in {days_until_expiry} days. Refresh needed.")
            return True
        
        logger.info(f"Token valid for {days_until_expiry} more days")
        return False
    
    def automated_refresh_check(self):
        """Automated check and refresh if needed"""
        logger.info("Running automated token refresh check...")
        
        # First check if token is valid
        if not self.check_token_validity():
            logger.warning("Token is invalid. Attempting refresh...")
            if self.refresh_access_token():
                logger.info("✅ Token refreshed successfully")
                self.send_notification("LinkedIn token refreshed successfully", "success")
            else:
                logger.error("❌ Token refresh failed - manual intervention required")
                self.send_notification("LinkedIn token refresh failed - action required!", "error")
                return False
        
        # Check if refresh is needed soon
        elif self.should_refresh():
            logger.info("Token expiring soon. Refreshing proactively...")
            if self.refresh_access_token():
                logger.info("✅ Token refreshed proactively")
                self.send_notification("LinkedIn token refreshed proactively", "success")
            else:
                logger.warning("⚠️ Proactive refresh failed - will retry")
                self.send_notification("LinkedIn token refresh warning", "warning")
        else:
            logger.info("✅ Token is valid and not expiring soon")
        
        return True
    
    def send_notification(self, message, level="info"):
        """Send notification about token status"""
        notification_file = '/Users/srijan/ai-finance-agency/data/notifications/linkedin_oauth.json'
        
        os.makedirs(os.path.dirname(notification_file), exist_ok=True)
        
        notification = {
            'timestamp': datetime.now().isoformat(),
            'level': level,
            'message': message,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'days_remaining': (self.expires_at - datetime.now()).days if self.expires_at else 0
        }
        
        # Append to notifications
        notifications = []
        if os.path.exists(notification_file):
            try:
                with open(notification_file, 'r') as f:
                    notifications = json.load(f)
            except:
                notifications = []
        
        notifications.append(notification)
        
        # Keep only last 100 notifications
        notifications = notifications[-100:]
        
        with open(notification_file, 'w') as f:
            json.dump(notifications, f, indent=2)
        
        logger.info(f"Notification sent: {message}")
    
    def get_token_status(self):
        """Get current token status"""
        status = {
            'has_access_token': bool(self.access_token),
            'has_refresh_token': bool(self.refresh_token),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'days_remaining': (self.expires_at - datetime.now()).days if self.expires_at else 0,
            'needs_refresh': self.should_refresh(),
            'is_valid': self.check_token_validity()
        }
        return status
    
    def schedule_automated_checks(self):
        """Schedule automated token checks"""
        # Check every day at 9 AM
        schedule.every().day.at("09:00").do(self.automated_refresh_check)
        
        # Also check every 12 hours as backup
        schedule.every(12).hours.do(self.automated_refresh_check)
        
        logger.info("Scheduled automated token checks")
        
        # Run initial check
        self.automated_refresh_check()
        
        # Keep running
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

def main():
    """Main execution"""
    import sys
    
    manager = LinkedInTokenManager()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "status":
            # Show current status
            status = manager.get_token_status()
            print("\n📊 LinkedIn Token Status")
            print("=" * 50)
            print(f"Has Access Token: {'✅' if status['has_access_token'] else '❌'}")
            print(f"Has Refresh Token: {'✅' if status['has_refresh_token'] else '❌'}")
            print(f"Is Valid: {'✅' if status['is_valid'] else '❌'}")
            print(f"Expires At: {status['expires_at']}")
            print(f"Days Remaining: {status['days_remaining']}")
            print(f"Needs Refresh: {'Yes' if status['needs_refresh'] else 'No'}")
            
        elif command == "refresh":
            # Force refresh
            print("🔄 Forcing token refresh...")
            if manager.refresh_access_token():
                print("✅ Token refreshed successfully")
            else:
                print("❌ Token refresh failed")
        
        elif command == "check":
            # Run single check
            print("🔍 Running token check...")
            manager.automated_refresh_check()
        
        elif command == "daemon":
            # Run as daemon with scheduled checks
            print("🤖 Starting LinkedIn OAuth daemon...")
            print("Press Ctrl+C to stop")
            try:
                manager.schedule_automated_checks()
            except KeyboardInterrupt:
                print("\n👋 Daemon stopped")
    else:
        # Default: show status and options
        print("\n🔐 LinkedIn OAuth Token Manager")
        print("=" * 50)
        print("\nUsage:")
        print("  python3 linkedin_oauth_refresh.py status   - Show token status")
        print("  python3 linkedin_oauth_refresh.py check    - Run single check")
        print("  python3 linkedin_oauth_refresh.py refresh  - Force token refresh")
        print("  python3 linkedin_oauth_refresh.py daemon   - Run automated daemon")
        print("\nRunning status check...")
        
        status = manager.get_token_status()
        print(f"\nCurrent Status: {'✅ Valid' if status['is_valid'] else '❌ Invalid'}")
        print(f"Days Remaining: {status['days_remaining']}")

if __name__ == "__main__":
    main()
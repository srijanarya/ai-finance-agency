#!/usr/bin/env python3
"""
Multi-Channel Signal Distribution System
Premium signal delivery across Telegram, WhatsApp, Email, and API
"""

import asyncio
import aiohttp
import smtplib
import sqlite3
import json
import requests
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from typing import Dict, List, Optional
import matplotlib.pyplot as plt
import pandas as pd
from twilio.rest import Client
import logging
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DeliveryChannel:
    """Configuration for signal delivery channels"""
    name: str
    enabled: bool
    config: Dict
    tier_access: List[str]

class SignalDistribution:
    def __init__(self):
        self.db_path = 'premium_signals.db'
        self.subscribers_db = 'subscribers.db'
        self.initialize_subscribers_db()
        
        # Channel configurations
        self.channels = {
            'telegram': DeliveryChannel(
                name='Telegram',
                enabled=True,
                config={
                    'basic_bot_token': 'YOUR_TELEGRAM_BOT_TOKEN_BASIC',
                    'pro_bot_token': 'YOUR_TELEGRAM_BOT_TOKEN_PRO',
                    'enterprise_bot_token': 'YOUR_TELEGRAM_BOT_TOKEN_ENTERPRISE',
                    'basic_chat_id': 'YOUR_BASIC_CHAT_ID',
                    'pro_chat_id': 'YOUR_PRO_CHAT_ID',
                    'enterprise_chat_id': 'YOUR_ENTERPRISE_CHAT_ID'
                },
                tier_access=['BASIC', 'PRO', 'ENTERPRISE']
            ),
            'whatsapp': DeliveryChannel(
                name='WhatsApp Business',
                enabled=True,
                config={
                    'twilio_account_sid': 'YOUR_TWILIO_ACCOUNT_SID',
                    'twilio_auth_token': 'YOUR_TWILIO_AUTH_TOKEN',
                    'whatsapp_number': 'whatsapp:+14155238886'  # Twilio sandbox
                },
                tier_access=['PRO', 'ENTERPRISE']
            ),
            'email': DeliveryChannel(
                name='Email Alerts',
                enabled=True,
                config={
                    'smtp_server': 'smtp.gmail.com',
                    'smtp_port': 587,
                    'email': 'your-alerts@gmail.com',
                    'password': 'your-app-password'
                },
                tier_access=['BASIC', 'PRO', 'ENTERPRISE']
            ),
            'push': DeliveryChannel(
                name='Push Notifications',
                enabled=True,
                config={
                    'firebase_server_key': 'YOUR_FIREBASE_SERVER_KEY',
                    'push_service_url': 'https://fcm.googleapis.com/fcm/send'
                },
                tier_access=['PRO', 'ENTERPRISE']
            )
        }
        
        # Initialize Twilio client
        self.twilio_client = None
        if self.channels['whatsapp'].enabled:
            try:
                self.twilio_client = Client(
                    self.channels['whatsapp'].config['twilio_account_sid'],
                    self.channels['whatsapp'].config['twilio_auth_token']
                )
            except Exception as e:
                logger.warning(f"Failed to initialize Twilio client: {e}")
    
    def initialize_subscribers_db(self):
        """Initialize subscribers database"""
        conn = sqlite3.connect(self.subscribers_db)
        cursor = conn.cursor()
        
        # Subscribers table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            email TEXT,
            phone TEXT,
            telegram_chat_id TEXT,
            whatsapp_number TEXT,
            firebase_token TEXT,
            subscription_tier TEXT DEFAULT 'BASIC',
            status TEXT DEFAULT 'ACTIVE',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_signal_sent DATETIME,
            preferences TEXT,
            payment_status TEXT DEFAULT 'PENDING'
        )
        ''')
        
        # Delivery logs table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS delivery_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_id TEXT,
            user_id TEXT,
            channel TEXT,
            status TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            error_message TEXT,
            delivery_time_ms INTEGER
        )
        ''')
        
        # Channel performance table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS channel_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE,
            channel TEXT,
            total_sent INTEGER,
            successful_deliveries INTEGER,
            failed_deliveries INTEGER,
            avg_delivery_time_ms REAL,
            bounce_rate REAL
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_subscriber(self, user_data: Dict) -> str:
        """Add new subscriber to the system"""
        conn = sqlite3.connect(self.subscribers_db)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
            INSERT INTO subscribers 
            (user_id, email, phone, telegram_chat_id, whatsapp_number, 
             firebase_token, subscription_tier, preferences)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_data.get('user_id'),
                user_data.get('email'),
                user_data.get('phone'),
                user_data.get('telegram_chat_id'),
                user_data.get('whatsapp_number'),
                user_data.get('firebase_token'),
                user_data.get('subscription_tier', 'BASIC'),
                json.dumps(user_data.get('preferences', {}))
            ))
            
            conn.commit()
            return "SUCCESS"
            
        except sqlite3.IntegrityError:
            return "USER_EXISTS"
        except Exception as e:
            logger.error(f"Error adding subscriber: {e}")
            return "ERROR"
        finally:
            conn.close()
    
    def get_subscribers_by_tier(self, tier: str) -> List[Dict]:
        """Get all active subscribers for a specific tier"""
        conn = sqlite3.connect(self.subscribers_db)
        
        # Tier hierarchy - higher tiers get lower tier signals too
        tier_hierarchy = {
            'BASIC': ['BASIC'],
            'PRO': ['BASIC', 'PRO'],
            'ENTERPRISE': ['BASIC', 'PRO', 'ENTERPRISE']
        }
        
        accessible_tiers = tier_hierarchy.get(tier, ['BASIC'])
        placeholders = ','.join(['?' for _ in accessible_tiers])
        
        query = f'''
        SELECT * FROM subscribers 
        WHERE subscription_tier IN ({placeholders})
        AND status = 'ACTIVE'
        AND payment_status = 'PAID'
        '''
        
        df = pd.read_sql_query(query, conn, params=accessible_tiers)
        conn.close()
        
        return df.to_dict('records')
    
    def format_signal_message(self, signal: Dict, channel: str) -> str:
        """Format signal for specific delivery channel"""
        
        if channel == 'telegram':
            return self.format_telegram_message(signal)
        elif channel == 'whatsapp':
            return self.format_whatsapp_message(signal)
        elif channel == 'email':
            return self.format_email_message(signal)
        elif channel == 'push':
            return self.format_push_message(signal)
        else:
            return self.format_basic_message(signal)
    
    def format_telegram_message(self, signal: Dict) -> str:
        """Format signal for Telegram with rich formatting"""
        emoji_map = {
            'BUY': '🟢',
            'SELL': '🔴',
            'INTRADAY': '⚡',
            'SWING': '📈',
            'INVESTMENT': '💎',
            'SCALPING': '🎯'
        }
        
        action_emoji = emoji_map.get(signal['action'], '📊')
        type_emoji = emoji_map.get(signal['signal_type'], '📊')
        
        confidence_stars = '⭐' * (signal['confidence_score'] // 2)
        
        message = f"""
{action_emoji} *{signal['action']} {signal['symbol']}* {type_emoji}

💰 *Entry Price:* ${signal['entry_price']:.2f}
🛡️ *Stop Loss:* ${signal['stop_loss']:.2f}
🎯 *Target:* ${signal['target_price']:.2f}
📊 *Risk:Reward:* 1:{signal['risk_reward_ratio']:.1f}

{confidence_stars} *Confidence:* {signal['confidence_score']}/10
⏰ *Timeframe:* {signal['timeframe']}
📝 *Analysis:* {signal['analysis']}

🆔 Signal ID: `{signal['signal_id']}`
🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}

⚠️ *Risk Disclaimer:* Past performance doesn't guarantee future results. Trade responsibly.
        """
        
        return message.strip()
    
    def format_whatsapp_message(self, signal: Dict) -> str:
        """Format signal for WhatsApp (plain text)"""
        message = f"""
🔥 PREMIUM SIGNAL ALERT 🔥

{signal['action']} {signal['symbol']} | {signal['signal_type']}

💰 Entry: ${signal['entry_price']:.2f}
🛡️ Stop Loss: ${signal['stop_loss']:.2f}
🎯 Target: ${signal['target_price']:.2f}
📊 R:R = 1:{signal['risk_reward_ratio']:.1f}

⭐ Confidence: {signal['confidence_score']}/10
⏰ Timeframe: {signal['timeframe']}

📋 Analysis: {signal['analysis']}

Signal ID: {signal['signal_id']}
Time: {datetime.now().strftime('%H:%M IST')}

⚠️ Trade at your own risk. This is not financial advice.
        """
        
        return message.strip()
    
    def format_email_message(self, signal: Dict) -> tuple:
        """Format signal for email (subject and HTML body)"""
        subject = f"🔥 {signal['action']} {signal['symbol']} | Confidence {signal['confidence_score']}/10"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }}
                .signal-box {{ border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 20px 0; }}
                .buy {{ border-color: #28a745; }}
                .sell {{ border-color: #dc3545; }}
                .metrics {{ display: flex; justify-content: space-between; margin: 15px 0; }}
                .metric {{ text-align: center; }}
                .metric-value {{ font-size: 18px; font-weight: bold; color: #667eea; }}
                .confidence-bar {{ background: #e0e0e0; height: 10px; border-radius: 5px; margin: 10px 0; }}
                .confidence-fill {{ background: linear-gradient(90deg, #ffc107, #28a745); height: 100%; border-radius: 5px; }}
                .disclaimer {{ background: #f8f9fa; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🚀 AI Finance Agency Premium Signal</h1>
                <p>Professional Trading Signal Alert</p>
            </div>
            
            <div class="signal-box {'buy' if signal['action'] == 'BUY' else 'sell'}">
                <h2>🎯 {signal['action']} {signal['symbol']}</h2>
                <p><strong>Signal Type:</strong> {signal['signal_type']} | <strong>Timeframe:</strong> {signal['timeframe']}</p>
                
                <div class="metrics">
                    <div class="metric">
                        <div>💰 Entry Price</div>
                        <div class="metric-value">${signal['entry_price']:.2f}</div>
                    </div>
                    <div class="metric">
                        <div>🛡️ Stop Loss</div>
                        <div class="metric-value">${signal['stop_loss']:.2f}</div>
                    </div>
                    <div class="metric">
                        <div>🎯 Target</div>
                        <div class="metric-value">${signal['target_price']:.2f}</div>
                    </div>
                    <div class="metric">
                        <div>📊 Risk:Reward</div>
                        <div class="metric-value">1:{signal['risk_reward_ratio']:.1f}</div>
                    </div>
                </div>
                
                <div>
                    <strong>Confidence Score: {signal['confidence_score']}/10</strong>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: {signal['confidence_score']*10}%"></div>
                    </div>
                </div>
                
                <p><strong>📝 Analysis:</strong> {signal['analysis']}</p>
                <p><strong>🆔 Signal ID:</strong> {signal['signal_id']}</p>
                <p><strong>🕐 Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}</p>
            </div>
            
            <div class="disclaimer">
                <strong>⚠️ Risk Disclaimer:</strong> 
                This signal is for educational purposes only. Past performance does not guarantee future results. 
                Always conduct your own research and consider your risk tolerance before trading.
            </div>
            
            <div style="text-align: center; margin: 30px 0; color: #666;">
                <p>AI Finance Agency - Premium Trading Signals</p>
                <p>Powered by Advanced AI & Quantitative Analysis</p>
            </div>
        </body>
        </html>
        """
        
        return subject, html_body
    
    def format_push_message(self, signal: Dict) -> Dict:
        """Format signal for push notification"""
        return {
            "title": f"{signal['action']} {signal['symbol']}",
            "body": f"Entry: ${signal['entry_price']:.2f} | Target: ${signal['target_price']:.2f} | Confidence: {signal['confidence_score']}/10",
            "data": {
                "signal_id": signal['signal_id'],
                "action": signal['action'],
                "symbol": signal['symbol'],
                "entry_price": signal['entry_price'],
                "target_price": signal['target_price'],
                "confidence": signal['confidence_score']
            }
        }
    
    def format_basic_message(self, signal: Dict) -> str:
        """Basic message format for any channel"""
        return f"{signal['action']} {signal['symbol']} @ ${signal['entry_price']:.2f} | Target: ${signal['target_price']:.2f} | SL: ${signal['stop_loss']:.2f}"
    
    async def send_telegram_signal(self, signal: Dict, subscriber: Dict) -> bool:
        """Send signal via Telegram"""
        try:
            tier = subscriber['subscription_tier']
            bot_token_key = f'{tier.lower()}_bot_token'
            chat_id_key = f'{tier.lower()}_chat_id'
            
            bot_token = self.channels['telegram'].config.get(bot_token_key)
            chat_id = subscriber.get('telegram_chat_id') or self.channels['telegram'].config.get(chat_id_key)
            
            if not bot_token or not chat_id:
                logger.error(f"Missing Telegram config for tier {tier}")
                return False
            
            message = self.format_signal_message(signal, 'telegram')
            
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            payload = {
                'chat_id': chat_id,
                'text': message,
                'parse_mode': 'Markdown'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        logger.info(f"Telegram signal sent to {subscriber['user_id']}")
                        return True
                    else:
                        logger.error(f"Telegram API error: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"Telegram delivery error: {e}")
            return False
    
    async def send_whatsapp_signal(self, signal: Dict, subscriber: Dict) -> bool:
        """Send signal via WhatsApp using Twilio"""
        if not self.twilio_client:
            return False
        
        try:
            whatsapp_number = subscriber.get('whatsapp_number')
            if not whatsapp_number:
                return False
            
            # Ensure WhatsApp format
            if not whatsapp_number.startswith('whatsapp:'):
                whatsapp_number = f"whatsapp:{whatsapp_number}"
            
            message = self.format_signal_message(signal, 'whatsapp')
            
            message_obj = self.twilio_client.messages.create(
                body=message,
                from_=self.channels['whatsapp'].config['whatsapp_number'],
                to=whatsapp_number
            )
            
            logger.info(f"WhatsApp signal sent to {subscriber['user_id']}: {message_obj.sid}")
            return True
            
        except Exception as e:
            logger.error(f"WhatsApp delivery error: {e}")
            return False
    
    async def send_email_signal(self, signal: Dict, subscriber: Dict) -> bool:
        """Send signal via email"""
        try:
            email_config = self.channels['email'].config
            
            msg = MIMEMultipart('alternative')
            msg['Subject'], html_body = self.format_signal_message(signal, 'email')
            msg['From'] = email_config['email']
            msg['To'] = subscriber['email']
            
            # Add HTML content
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
            # Add chart if available
            chart_path = self.generate_signal_chart(signal)
            if chart_path:
                with open(chart_path, 'rb') as f:
                    img_data = f.read()
                image = MIMEImage(img_data)
                image.add_header('Content-ID', '<signal_chart>')
                msg.attach(image)
            
            # Send email
            with smtplib.SMTP(email_config['smtp_server'], email_config['smtp_port']) as server:
                server.starttls()
                server.login(email_config['email'], email_config['password'])
                server.send_message(msg)
            
            logger.info(f"Email signal sent to {subscriber['user_id']}")
            return True
            
        except Exception as e:
            logger.error(f"Email delivery error: {e}")
            return False
    
    async def send_push_notification(self, signal: Dict, subscriber: Dict) -> bool:
        """Send push notification via Firebase"""
        try:
            firebase_token = subscriber.get('firebase_token')
            if not firebase_token:
                return False
            
            push_config = self.channels['push'].config
            server_key = push_config['firebase_server_key']
            
            notification = self.format_signal_message(signal, 'push')
            
            headers = {
                'Authorization': f'key={server_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'to': firebase_token,
                'notification': {
                    'title': notification['title'],
                    'body': notification['body']
                },
                'data': notification['data']
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    push_config['push_service_url'],
                    json=payload,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        logger.info(f"Push notification sent to {subscriber['user_id']}")
                        return True
                    else:
                        logger.error(f"Firebase error: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"Push notification error: {e}")
            return False
    
    def generate_signal_chart(self, signal: Dict) -> Optional[str]:
        """Generate a simple chart for the signal (for email attachment)"""
        try:
            # Create a simple price chart with entry, stop loss, and target
            fig, ax = plt.subplots(figsize=(10, 6))
            
            # Mock price data (in reality, you'd fetch actual price data)
            prices = [signal['entry_price']] * 100
            ax.plot(prices, label='Price', linewidth=2)
            ax.axhline(y=signal['entry_price'], color='blue', linestyle='-', label='Entry')
            ax.axhline(y=signal['stop_loss'], color='red', linestyle='--', label='Stop Loss')
            ax.axhline(y=signal['target_price'], color='green', linestyle='--', label='Target')
            
            ax.fill_between(range(100), signal['stop_loss'], signal['entry_price'], 
                           alpha=0.3, color='red', label='Risk Zone')
            ax.fill_between(range(100), signal['entry_price'], signal['target_price'], 
                           alpha=0.3, color='green', label='Profit Zone')
            
            ax.set_title(f"{signal['symbol']} - {signal['action']} Signal", fontsize=16)
            ax.set_xlabel('Time')
            ax.set_ylabel('Price ($)')
            ax.legend()
            ax.grid(True, alpha=0.3)
            
            chart_path = f"/tmp/signal_chart_{signal['signal_id']}.png"
            plt.savefig(chart_path, dpi=150, bbox_inches='tight')
            plt.close()
            
            return chart_path
            
        except Exception as e:
            logger.error(f"Chart generation error: {e}")
            return None
    
    async def distribute_signal(self, signal: Dict):
        """Distribute signal to all appropriate subscribers"""
        start_time = datetime.now()
        
        # Get subscribers for signal's tier
        subscribers = self.get_subscribers_by_tier(signal['tier_access'])
        
        delivery_tasks = []
        
        for subscriber in subscribers:
            # Check user preferences
            preferences = json.loads(subscriber.get('preferences', '{}'))
            
            # Skip if user has disabled this signal type
            if preferences.get('disabled_signal_types', []):
                if signal['signal_type'] in preferences['disabled_signal_types']:
                    continue
            
            # Skip if outside user's trading hours
            if preferences.get('trading_hours'):
                current_hour = datetime.now().hour
                if current_hour < preferences['trading_hours'].get('start', 0) or \
                   current_hour > preferences['trading_hours'].get('end', 23):
                    continue
            
            # Determine which channels to use for this subscriber
            channels_to_use = []
            
            if subscriber['telegram_chat_id'] and 'telegram' not in preferences.get('disabled_channels', []):
                channels_to_use.append('telegram')
            
            if subscriber['whatsapp_number'] and subscriber['subscription_tier'] in ['PRO', 'ENTERPRISE']:
                if 'whatsapp' not in preferences.get('disabled_channels', []):
                    channels_to_use.append('whatsapp')
            
            if subscriber['email'] and 'email' not in preferences.get('disabled_channels', []):
                channels_to_use.append('email')
            
            if subscriber['firebase_token'] and subscriber['subscription_tier'] in ['PRO', 'ENTERPRISE']:
                if 'push' not in preferences.get('disabled_channels', []):
                    channels_to_use.append('push')
            
            # Create delivery tasks
            for channel in channels_to_use:
                if channel == 'telegram':
                    task = self.send_telegram_signal(signal, subscriber)
                elif channel == 'whatsapp':
                    task = self.send_whatsapp_signal(signal, subscriber)
                elif channel == 'email':
                    task = self.send_email_signal(signal, subscriber)
                elif channel == 'push':
                    task = self.send_push_notification(signal, subscriber)
                else:
                    continue
                
                delivery_tasks.append({
                    'task': task,
                    'subscriber': subscriber,
                    'channel': channel,
                    'signal_id': signal['signal_id']
                })
        
        # Execute all delivery tasks concurrently
        if delivery_tasks:
            tasks = [task_info['task'] for task_info in delivery_tasks]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Log delivery results
            for i, result in enumerate(results):
                task_info = delivery_tasks[i]
                success = isinstance(result, bool) and result
                
                self.log_delivery(
                    signal_id=task_info['signal_id'],
                    user_id=task_info['subscriber']['user_id'],
                    channel=task_info['channel'],
                    success=success,
                    error_message=str(result) if not success else None,
                    delivery_time_ms=int((datetime.now() - start_time).total_seconds() * 1000)
                )
        
        logger.info(f"Signal {signal['signal_id']} distributed to {len(subscribers)} subscribers via {len(delivery_tasks)} channels")
    
    def log_delivery(self, signal_id: str, user_id: str, channel: str, success: bool, 
                    error_message: str = None, delivery_time_ms: int = 0):
        """Log delivery attempt"""
        conn = sqlite3.connect(self.subscribers_db)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT INTO delivery_logs 
        (signal_id, user_id, channel, status, error_message, delivery_time_ms)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            signal_id, user_id, channel,
            'SUCCESS' if success else 'FAILED',
            error_message, delivery_time_ms
        ))
        
        conn.commit()
        conn.close()
    
    def get_delivery_stats(self, days: int = 7) -> Dict:
        """Get delivery statistics for the last N days"""
        conn = sqlite3.connect(self.subscribers_db)
        
        query = '''
        SELECT 
            channel,
            COUNT(*) as total_sent,
            SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successful,
            AVG(delivery_time_ms) as avg_delivery_time,
            DATE(timestamp) as date
        FROM delivery_logs 
        WHERE timestamp >= datetime('now', '-{} days')
        GROUP BY channel, DATE(timestamp)
        ORDER BY date DESC, channel
        '''.format(days)
        
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        if df.empty:
            return {}
        
        # Calculate success rates
        df['success_rate'] = (df['successful'] / df['total_sent']) * 100
        
        return {
            'summary': {
                'total_signals_sent': df['total_sent'].sum(),
                'overall_success_rate': (df['successful'].sum() / df['total_sent'].sum()) * 100,
                'avg_delivery_time_ms': df['avg_delivery_time'].mean()
            },
            'by_channel': df.groupby('channel').agg({
                'total_sent': 'sum',
                'successful': 'sum',
                'avg_delivery_time': 'mean'
            }).to_dict('index'),
            'daily_stats': df.to_dict('records')
        }
    
    async def send_bulk_signals(self, signals: List[Dict]):
        """Send multiple signals concurrently"""
        tasks = []
        for signal in signals:
            task = self.distribute_signal(signal)
            tasks.append(task)
        
        if tasks:
            await asyncio.gather(*tasks)
        
        logger.info(f"Distributed {len(signals)} signals in bulk")

# API endpoints for institutional clients
class SignalAPI:
    def __init__(self, distribution_system: SignalDistribution):
        self.distribution = distribution_system
        self.api_keys_db = 'api_keys.db'
        self.initialize_api_db()
    
    def initialize_api_db(self):
        """Initialize API keys database"""
        conn = sqlite3.connect(self.api_keys_db)
        cursor = conn.cursor()
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_key TEXT UNIQUE NOT NULL,
            client_name TEXT NOT NULL,
            subscription_tier TEXT DEFAULT 'ENTERPRISE',
            rate_limit INTEGER DEFAULT 1000,
            status TEXT DEFAULT 'ACTIVE',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_used DATETIME,
            usage_count INTEGER DEFAULT 0
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def validate_api_key(self, api_key: str) -> Optional[Dict]:
        """Validate API key and return client info"""
        conn = sqlite3.connect(self.api_keys_db)
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT * FROM api_keys 
        WHERE api_key = ? AND status = 'ACTIVE'
        ''', (api_key,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            columns = ['id', 'api_key', 'client_name', 'subscription_tier', 
                      'rate_limit', 'status', 'created_at', 'last_used', 'usage_count']
            return dict(zip(columns, result))
        
        return None
    
    def get_signals_api(self, api_key: str, signal_type: str = None, limit: int = 50) -> Dict:
        """API endpoint to get signals"""
        client = self.validate_api_key(api_key)
        if not client:
            return {'error': 'Invalid API key', 'status': 401}
        
        try:
            # Get signals from database
            conn = sqlite3.connect(self.distribution.db_path)
            
            query = '''
            SELECT * FROM signals 
            WHERE status = 'ACTIVE' 
            AND DATE(timestamp) = DATE('now')
            '''
            params = []
            
            if signal_type:
                query += ' AND signal_type = ?'
                params.append(signal_type)
            
            query += f' ORDER BY confidence_score DESC LIMIT {limit}'
            
            df = pd.read_sql_query(query, conn, params=params)
            conn.close()
            
            # Update API usage
            self.update_api_usage(api_key)
            
            return {
                'status': 'success',
                'count': len(df),
                'signals': df.to_dict('records'),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"API error: {e}")
            return {'error': 'Internal server error', 'status': 500}
    
    def update_api_usage(self, api_key: str):
        """Update API usage statistics"""
        conn = sqlite3.connect(self.api_keys_db)
        cursor = conn.cursor()
        
        cursor.execute('''
        UPDATE api_keys 
        SET last_used = CURRENT_TIMESTAMP, usage_count = usage_count + 1
        WHERE api_key = ?
        ''', (api_key,))
        
        conn.commit()
        conn.close()

if __name__ == "__main__":
    # Example usage
    distribution = SignalDistribution()
    
    # Add a test subscriber
    test_subscriber = {
        'user_id': 'test_user_001',
        'email': 'test@example.com',
        'telegram_chat_id': '12345678',
        'subscription_tier': 'PRO',
        'preferences': {
            'trading_hours': {'start': 9, 'end': 16},
            'disabled_channels': [],
            'disabled_signal_types': []
        }
    }
    
    result = distribution.add_subscriber(test_subscriber)
    print(f"Subscriber added: {result}")
    
    # Example signal distribution
    test_signal = {
        'signal_id': 'TEST_001',
        'symbol': 'AAPL',
        'action': 'BUY',
        'entry_price': 150.00,
        'stop_loss': 145.00,
        'target_price': 160.00,
        'risk_reward_ratio': 2.0,
        'confidence_score': 8,
        'signal_type': 'SWING',
        'timeframe': '1-3 days',
        'analysis': 'Bullish breakout above resistance with volume confirmation',
        'tier_access': 'PRO'
    }
    
    # Distribute signal
    asyncio.run(distribution.distribute_signal(test_signal))
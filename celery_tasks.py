"""
Celery Tasks for Async Processing
"""

from celery import shared_task
from datetime import datetime, timedelta
import yfinance as yf
from typing import Dict, List
import asyncio
from database.models import db_manager, Content, MarketData, TradingSignal, GrowthMetric
from cache.redis_cache import cache
from market_content_generator import generate_unique_market_content
from telegram_growth_engine import TelegramGrowthEngine
import json
import hashlib

@shared_task(bind=True, max_retries=3)
def fetch_market_data(self):
    """Fetch and cache real-time market data"""
    try:
        symbols = [
            # Indian stocks
            'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ITC.NS',
            'SBIN.NS', 'BHARTIARTL.NS', 'ICICIBANK.NS', 'KOTAKBANK.NS', 'LT.NS',
            # Indices
            '^NSEI', '^NSEBANK',
            # Crypto
            'BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD', 'ADA-USD'
        ]
        
        session = db_manager.get_session()
        
        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)
                data = ticker.history(period="1d", interval="1m")
                
                if not data.empty:
                    latest = data.iloc[-1]
                    info = ticker.info
                    
                    market_data = {
                        'symbol': symbol,
                        'price': float(latest['Close']),
                        'volume': float(latest['Volume']),
                        'high': float(latest['High']),
                        'low': float(latest['Low']),
                        'change': float(latest['Close'] - data.iloc[0]['Close']),
                        'change_percent': float((latest['Close'] - data.iloc[0]['Close']) / data.iloc[0]['Close'] * 100),
                        'timestamp': datetime.utcnow().isoformat()
                    }
                    
                    # Cache for 5 minutes
                    cache.cache_market_data(symbol, market_data, ttl=300)
                    
                    # Store in database
                    db_entry = MarketData(
                        symbol=symbol,
                        price=market_data['price'],
                        change_percent=market_data['change_percent'],
                        volume=market_data['volume'],
                        source='yfinance',
                        data=market_data
                    )
                    session.add(db_entry)
                    
            except Exception as e:
                print(f"Error fetching {symbol}: {e}")
        
        session.commit()
        session.close()
        
        return {"status": "success", "symbols_updated": len(symbols)}
        
    except Exception as e:
        self.retry(countdown=60, exc=e)

@shared_task(bind=True, max_retries=3)
def generate_content(self):
    """Generate unique market content"""
    try:
        # Get latest market data from cache
        nifty_data = cache.get_market_data('^NSEI')
        btc_data = cache.get_market_data('BTC-USD')
        
        market_context = {
            'nifty': nifty_data,
            'btc': btc_data,
            'timestamp': datetime.utcnow()
        }
        
        # Generate content using existing generator
        content = generate_unique_market_content()
        
        # Create content hash to prevent duplicates
        content_hash = hashlib.sha256(content.encode()).hexdigest()
        
        # Check if content already exists
        if not cache.get_content(content_hash):
            session = db_manager.get_session()
            
            db_content = Content(
                content_hash=content_hash,
                content_text=content,
                content_type='market_update',
                platform='multi',
                quality_score=8.5,
                metadata=market_context
            )
            
            session.add(db_content)
            session.commit()
            session.close()
            
            # Cache content
            cache.cache_content(content_hash, {
                'text': content,
                'created_at': datetime.utcnow().isoformat()
            })
            
            return {"status": "success", "content_hash": content_hash}
        
        return {"status": "duplicate", "content_hash": content_hash}
        
    except Exception as e:
        self.retry(countdown=300, exc=e)

@shared_task(bind=True, max_retries=3)
def post_to_social_media(self):
    """Post content to all social media platforms"""
    try:
        # Get latest unposted content
        session = db_manager.get_session()
        content = session.query(Content).filter(
            Content.published_at.is_(None)
        ).order_by(Content.quality_score.desc()).first()
        
        if content:
            platforms = ['telegram', 'twitter', 'linkedin', 'instagram']
            success_count = 0
            
            for platform in platforms:
                try:
                    # Platform-specific posting logic
                    if platform == 'telegram':
                        # Use telegram_growth_engine
                        success = post_to_telegram.delay(content.content_text)
                    elif platform == 'twitter':
                        # Twitter API posting
                        success = True  # Placeholder
                    elif platform == 'linkedin':
                        # LinkedIn API posting
                        success = True  # Placeholder
                    else:
                        success = True  # Placeholder
                    
                    if success:
                        success_count += 1
                
                except Exception as e:
                    print(f"Error posting to {platform}: {e}")
            
            # Mark content as published
            content.published_at = datetime.utcnow()
            session.commit()
            session.close()
            
            # Track metric
            cache.increment_metric('posts_published', 1)
            
            return {"status": "success", "platforms_posted": success_count}
        
        return {"status": "no_content"}
        
    except Exception as e:
        self.retry(countdown=600, exc=e)

@shared_task
def post_to_telegram(content_text: str):
    """Post content to Telegram channel"""
    try:
        # This would use the telegram_growth_engine
        # For now, just cache it
        cache.set('last_telegram_post', content_text, ttl=3600)
        return True
    except Exception as e:
        print(f"Telegram posting error: {e}")
        return False

@shared_task(bind=True, max_retries=3)
def run_telegram_growth_campaign(self):
    """Run Telegram growth campaigns"""
    try:
        # Run growth engine asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        growth_engine = TelegramGrowthEngine()
        loop.run_until_complete(growth_engine.run_growth_campaign())
        
        return {"status": "success", "campaign": "completed"}
        
    except Exception as e:
        self.retry(countdown=1800, exc=e)

@shared_task
def check_trading_signals():
    """Check and generate trading signals"""
    try:
        session = db_manager.get_session()
        
        # Get recent market data
        recent_data = session.query(MarketData).filter(
            MarketData.timestamp > datetime.utcnow() - timedelta(hours=1)
        ).all()
        
        signals_generated = []
        
        for data in recent_data:
            # Simple signal generation logic
            if data.change_percent > 2:
                signal = TradingSignal(
                    symbol=data.symbol,
                    signal_type='BUY',
                    confidence=0.75,
                    entry_price=data.price,
                    target_price=data.price * 1.03,
                    stop_loss=data.price * 0.98,
                    expires_at=datetime.utcnow() + timedelta(hours=24)
                )
                session.add(signal)
                signals_generated.append(data.symbol)
                
            elif data.change_percent < -2:
                signal = TradingSignal(
                    symbol=data.symbol,
                    signal_type='SELL',
                    confidence=0.75,
                    entry_price=data.price,
                    target_price=data.price * 0.97,
                    stop_loss=data.price * 1.02,
                    expires_at=datetime.utcnow() + timedelta(hours=24)
                )
                session.add(signal)
                signals_generated.append(data.symbol)
        
        session.commit()
        session.close()
        
        # Cache latest signals
        cache.set('latest_signals', signals_generated, ttl=1800)
        
        return {"status": "success", "signals_generated": len(signals_generated)}
        
    except Exception as e:
        print(f"Signal generation error: {e}")
        return {"status": "error", "message": str(e)}

@shared_task
def generate_daily_report():
    """Generate daily analytics report"""
    try:
        session = db_manager.get_session()
        
        # Gather metrics
        today = datetime.utcnow().date()
        
        metrics = {
            'date': today.isoformat(),
            'new_subscribers': cache.get_metric('growth:new_subscriber'),
            'content_generated': session.query(Content).filter(
                Content.created_at >= today
            ).count(),
            'signals_generated': session.query(TradingSignal).filter(
                TradingSignal.created_at >= today
            ).count(),
            'total_posts': cache.get_metric('posts_published'),
            'engagement_rate': calculate_engagement_rate(session),
            'top_performing_content': get_top_content(session),
            'growth_rate': calculate_growth_rate(session)
        }
        
        # Store report
        report_metric = GrowthMetric(
            platform='all',
            metric_name='daily_report',
            metric_value=metrics['growth_rate'],
            metadata=metrics
        )
        session.add(report_metric)
        session.commit()
        session.close()
        
        # Cache report
        cache.set('daily_report', metrics, ttl=86400)
        
        # Send report to admin (placeholder)
        send_admin_report(metrics)
        
        return {"status": "success", "report": metrics}
        
    except Exception as e:
        print(f"Report generation error: {e}")
        return {"status": "error", "message": str(e)}

@shared_task
def cleanup_old_data():
    """Clean up old data from database"""
    try:
        session = db_manager.get_session()
        
        # Delete market data older than 30 days
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        old_market_data = session.query(MarketData).filter(
            MarketData.timestamp < cutoff_date
        ).delete()
        
        # Delete expired trading signals
        expired_signals = session.query(TradingSignal).filter(
            TradingSignal.expires_at < datetime.utcnow()
        ).delete()
        
        session.commit()
        session.close()
        
        # Clear old cache entries
        cache.clear_cache_pattern("market:*")
        
        return {
            "status": "success",
            "market_data_deleted": old_market_data,
            "signals_deleted": expired_signals
        }
        
    except Exception as e:
        print(f"Cleanup error: {e}")
        return {"status": "error", "message": str(e)}

@shared_task
def analyze_subscriber_engagement():
    """Analyze subscriber engagement patterns"""
    try:
        session = db_manager.get_session()
        
        # Get active subscribers
        from database.models import Subscriber, Interaction
        
        subscribers = session.query(Subscriber).filter(
            Subscriber.is_active == True
        ).all()
        
        engagement_data = []
        
        for subscriber in subscribers:
            interactions = session.query(Interaction).filter(
                Interaction.subscriber_id == subscriber.id,
                Interaction.timestamp > datetime.utcnow() - timedelta(days=7)
            ).count()
            
            engagement_score = calculate_engagement_score(interactions)
            
            subscriber.engagement_score = engagement_score
            engagement_data.append({
                'subscriber_id': subscriber.telegram_id,
                'engagement_score': engagement_score,
                'interactions': interactions
            })
        
        session.commit()
        session.close()
        
        # Cache engagement data
        cache.set('engagement_analysis', engagement_data, ttl=21600)
        
        return {"status": "success", "subscribers_analyzed": len(subscribers)}
        
    except Exception as e:
        print(f"Engagement analysis error: {e}")
        return {"status": "error", "message": str(e)}

# Helper functions

def calculate_engagement_rate(session):
    """Calculate overall engagement rate"""
    # Placeholder calculation
    return 0.65

def get_top_content(session):
    """Get top performing content"""
    top = session.query(Content).order_by(
        Content.engagement_score.desc()
    ).limit(5).all()
    
    return [{'id': c.id, 'score': c.engagement_score} for c in top]

def calculate_growth_rate(session):
    """Calculate subscriber growth rate"""
    # Placeholder calculation
    return 0.12

def send_admin_report(metrics):
    """Send report to admin"""
    # Placeholder - would send via email or Telegram
    print(f"Daily report: {metrics}")

def calculate_engagement_score(interactions):
    """Calculate engagement score based on interactions"""
    if interactions == 0:
        return 0.0
    elif interactions < 5:
        return 0.3
    elif interactions < 10:
        return 0.6
    elif interactions < 20:
        return 0.8
    else:
        return 1.0
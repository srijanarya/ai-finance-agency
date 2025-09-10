"""
Real-time Signal Distribution Service
Distributes trading signals to users via WebSocket, push notifications, email, and SMS
Supports sub-100ms delivery target for premium users
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set, Any
from uuid import UUID
import aioredis
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from database.models import (
    User, TradingSignal, SignalSubscription, UserSignalPreferences,
    SubscriptionTier, SignalPriority
)

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages WebSocket connections for real-time signal distribution"""
    
    def __init__(self):
        # Active connections: {user_id: websocket}
        self.active_connections: Dict[str, WebSocket] = {}
        # Connection metadata: {user_id: {"tier": str, "connected_at": datetime}}
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str, subscription_tier: str):
        """Accept WebSocket connection"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.connection_metadata[user_id] = {
            "tier": subscription_tier,
            "connected_at": datetime.now(timezone.utc),
            "signals_sent": 0
        }
        logger.info(f"User {user_id} connected to signal stream")
    
    def disconnect(self, user_id: str):
        """Remove WebSocket connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.connection_metadata:
            del self.connection_metadata[user_id]
        logger.info(f"User {user_id} disconnected from signal stream")
    
    async def send_signal_to_user(self, user_id: str, signal_data: Dict[str, Any]) -> bool:
        """Send signal to specific user via WebSocket"""
        if user_id not in self.active_connections:
            return False
        
        try:
            websocket = self.active_connections[user_id]
            await websocket.send_text(json.dumps({
                "type": "trading_signal",
                "data": signal_data,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }))
            
            # Update metadata
            if user_id in self.connection_metadata:
                self.connection_metadata[user_id]["signals_sent"] += 1
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending signal to user {user_id}: {str(e)}")
            # Remove broken connection
            self.disconnect(user_id)
            return False
    
    async def broadcast_signal(self, signal_data: Dict[str, Any], eligible_users: Set[str]):
        """Broadcast signal to multiple users"""
        if not eligible_users:
            return
        
        # Prepare different message formats for different tiers
        messages = {
            "basic": json.dumps({
                "type": "trading_signal",
                "data": self._filter_signal_for_basic(signal_data),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }),
            "pro": json.dumps({
                "type": "trading_signal", 
                "data": self._filter_signal_for_pro(signal_data),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }),
            "elite": json.dumps({
                "type": "trading_signal",
                "data": signal_data,  # Full data for elite
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        }
        
        # Send to all eligible users
        tasks = []
        for user_id in eligible_users:
            if user_id in self.active_connections:
                user_tier = self.connection_metadata.get(user_id, {}).get("tier", "basic")
                message = messages.get(user_tier, messages["basic"])
                
                task = self._send_message_safe(user_id, message)
                tasks.append(task)
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _send_message_safe(self, user_id: str, message: str):
        """Safely send message to user"""
        try:
            websocket = self.active_connections[user_id]
            await websocket.send_text(message)
            
            # Update metadata
            if user_id in self.connection_metadata:
                self.connection_metadata[user_id]["signals_sent"] += 1
                
        except Exception as e:
            logger.error(f"Error sending message to user {user_id}: {str(e)}")
            self.disconnect(user_id)
    
    def _filter_signal_for_basic(self, signal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Filter signal data for basic tier users"""
        return {
            "signal_id": signal_data.get("signal_id"),
            "symbol": signal_data.get("symbol"),
            "exchange": signal_data.get("exchange"),
            "signal_type": signal_data.get("signal_type"),
            "priority": signal_data.get("priority"),
            "confidence_score": signal_data.get("confidence_score"),
            "current_price": signal_data.get("current_price"),
            "generated_at": signal_data.get("generated_at"),
            "tags": signal_data.get("tags", []),
            "notes": signal_data.get("notes")
        }
    
    def _filter_signal_for_pro(self, signal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Filter signal data for pro tier users"""
        basic_data = self._filter_signal_for_basic(signal_data)
        basic_data.update({
            "entry_price": signal_data.get("entry_price"),
            "target_price": signal_data.get("target_price"),
            "stop_loss": signal_data.get("stop_loss"),
            "risk_reward_ratio": signal_data.get("risk_reward_ratio"),
            "potential_return": signal_data.get("potential_return"),
            "potential_loss": signal_data.get("potential_loss")
        })
        return basic_data
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get WebSocket connection statistics"""
        total_connections = len(self.active_connections)
        tier_breakdown = {}
        
        for user_id, metadata in self.connection_metadata.items():
            tier = metadata.get("tier", "unknown")
            tier_breakdown[tier] = tier_breakdown.get(tier, 0) + 1
        
        return {
            "total_connections": total_connections,
            "tier_breakdown": tier_breakdown,
            "connection_details": self.connection_metadata
        }


class NotificationService:
    """Handles push notifications, email, and SMS for signal delivery"""
    
    def __init__(self):
        self.redis_client = None
        
    async def initialize_redis(self):
        """Initialize Redis connection for notification queuing"""
        try:
            self.redis_client = await aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
    
    async def send_push_notification(self, user_id: str, signal_data: Dict[str, Any]):
        """Send push notification to mobile app"""
        try:
            notification_data = {
                "user_id": user_id,
                "type": "trading_signal",
                "title": f"New {signal_data['signal_type'].upper()} Signal",
                "body": f"{signal_data['symbol']}: {signal_data['notes'][:100]}...",
                "data": {
                    "signal_id": signal_data["signal_id"],
                    "symbol": signal_data["symbol"],
                    "signal_type": signal_data["signal_type"],
                    "priority": signal_data["priority"]
                }
            }
            
            # Queue notification for processing
            if self.redis_client:
                await self.redis_client.lpush(
                    "notification_queue:push",
                    json.dumps(notification_data)
                )
            
            logger.info(f"Push notification queued for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error sending push notification to user {user_id}: {str(e)}")
    
    async def send_email_notification(self, user_id: str, user_email: str, signal_data: Dict[str, Any]):
        """Send email notification"""
        try:
            email_data = {
                "user_id": user_id,
                "email": user_email,
                "type": "trading_signal",
                "subject": f"TREUM Signal Alert: {signal_data['signal_type'].upper()} {signal_data['symbol']}",
                "template": "signal_alert",
                "data": signal_data
            }
            
            # Queue email for processing
            if self.redis_client:
                await self.redis_client.lpush(
                    "notification_queue:email",
                    json.dumps(email_data)
                )
            
            logger.info(f"Email notification queued for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error sending email notification to user {user_id}: {str(e)}")
    
    async def send_sms_notification(self, user_id: str, phone_number: str, signal_data: Dict[str, Any]):
        """Send SMS notification"""
        try:
            # Format SMS message (160 character limit)
            message = f"TREUM: {signal_data['signal_type'].upper()} {signal_data['symbol']} @{signal_data['current_price']} | Conf: {signal_data['confidence_score']:.0%}"
            
            sms_data = {
                "user_id": user_id,
                "phone": phone_number,
                "message": message[:160],
                "type": "trading_signal"
            }
            
            # Queue SMS for processing
            if self.redis_client:
                await self.redis_client.lpush(
                    "notification_queue:sms",
                    json.dumps(sms_data)
                )
            
            logger.info(f"SMS notification queued for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error sending SMS notification to user {user_id}: {str(e)}")


class SignalDistributionService:
    """Main service for distributing trading signals across all channels"""
    
    def __init__(self):
        self.websocket_manager = WebSocketManager()
        self.notification_service = NotificationService()
        self.db = next(get_db())
        
    async def initialize(self):
        """Initialize the distribution service"""
        await self.notification_service.initialize_redis()
        logger.info("Signal distribution service initialized")
    
    async def distribute_signal(self, signal: TradingSignal):
        """Distribute a signal to all eligible users"""
        try:
            start_time = datetime.now()
            
            # Get eligible users for this signal
            eligible_users = await self._get_eligible_users(signal)
            
            if not eligible_users:
                logger.info(f"No eligible users for signal {signal.signal_id}")
                return
            
            # Prepare signal data
            signal_data = self._format_signal_data(signal)
            
            # Get user delivery preferences
            user_preferences = await self._get_user_delivery_preferences(eligible_users)
            
            # Distribute via different channels in parallel
            distribution_tasks = []
            
            # 1. WebSocket distribution (highest priority - sub-100ms target)
            websocket_users = {str(user.id) for user in eligible_users}
            websocket_task = self.websocket_manager.broadcast_signal(signal_data, websocket_users)
            distribution_tasks.append(websocket_task)
            
            # 2. Push notifications
            for user in eligible_users:
                preferences = user_preferences.get(str(user.id))
                if preferences and "push_notification" in preferences.get("delivery_methods", []):
                    push_task = self.notification_service.send_push_notification(str(user.id), signal_data)
                    distribution_tasks.append(push_task)
            
            # 3. Email notifications
            for user in eligible_users:
                preferences = user_preferences.get(str(user.id))
                if preferences and "email" in preferences.get("delivery_methods", []):
                    email_task = self.notification_service.send_email_notification(
                        str(user.id), user.email, signal_data
                    )
                    distribution_tasks.append(email_task)
            
            # 4. SMS notifications
            for user in eligible_users:
                preferences = user_preferences.get(str(user.id))
                if preferences and "sms" in preferences.get("delivery_methods", []) and user.phone:
                    sms_task = self.notification_service.send_sms_notification(
                        str(user.id), user.phone, signal_data
                    )
                    distribution_tasks.append(sms_task)
            
            # Execute all distribution tasks
            await asyncio.gather(*distribution_tasks, return_exceptions=True)
            
            # Log distribution metrics
            end_time = datetime.now()
            distribution_time_ms = (end_time - start_time).total_seconds() * 1000
            
            logger.info(
                f"Signal {signal.signal_id} distributed to {len(eligible_users)} users "
                f"in {distribution_time_ms:.2f}ms"
            )
            
            # Update signal with distribution info
            await self._update_signal_distribution_stats(signal, len(eligible_users), distribution_time_ms)
            
        except Exception as e:
            logger.error(f"Error distributing signal {signal.signal_id}: {str(e)}")
    
    async def _get_eligible_users(self, signal: TradingSignal) -> List[User]:
        """Get users eligible to receive this signal"""
        try:
            # Base query for active users
            query = self.db.query(User).filter(
                User.status == "active"
            )
            
            # In production, this would check subscription status
            # For now, return all active users
            users = query.all()
            
            # Filter users based on their preferences
            eligible_users = []
            for user in users:
                # Check user signal preferences
                preferences = self.db.query(UserSignalPreferences).filter(
                    UserSignalPreferences.user_id == user.id
                ).first()
                
                if self._user_wants_signal(user, signal, preferences):
                    eligible_users.append(user)
            
            return eligible_users
            
        except Exception as e:
            logger.error(f"Error getting eligible users: {str(e)}")
            return []
    
    def _user_wants_signal(self, user: User, signal: TradingSignal, preferences: Optional[UserSignalPreferences]) -> bool:
        """Check if user wants to receive this signal based on preferences"""
        if not preferences:
            return True  # Default to sending if no preferences set
        
        # Check asset class preferences
        if (preferences.preferred_asset_classes and 
            signal.asset_class not in preferences.preferred_asset_classes):
            return False
        
        # Check excluded symbols
        if (preferences.excluded_symbols and 
            signal.symbol in preferences.excluded_symbols):
            return False
        
        # Check minimum confidence score
        if signal.confidence_score < preferences.min_confidence_score:
            return False
        
        # Check minimum risk-reward ratio
        if (preferences.min_risk_reward_ratio and signal.risk_reward_ratio and
            signal.risk_reward_ratio < preferences.min_risk_reward_ratio):
            return False
        
        # Check quiet hours (simplified - would need proper timezone handling in production)
        current_hour = datetime.now().hour
        quiet_start = int(preferences.quiet_hours_start.split(':')[0])
        quiet_end = int(preferences.quiet_hours_end.split(':')[0])
        
        if quiet_start > quiet_end:  # Overnight quiet hours
            if current_hour >= quiet_start or current_hour <= quiet_end:
                return False
        else:  # Same day quiet hours
            if quiet_start <= current_hour <= quiet_end:
                return False
        
        return True
    
    async def _get_user_delivery_preferences(self, users: List[User]) -> Dict[str, Dict[str, Any]]:
        """Get delivery preferences for a list of users"""
        preferences = {}
        
        for user in users:
            user_prefs = self.db.query(UserSignalPreferences).filter(
                UserSignalPreferences.user_id == user.id
            ).first()
            
            if user_prefs:
                preferences[str(user.id)] = {
                    "delivery_methods": user_prefs.delivery_methods or ["push_notification"],
                    "max_signals_per_day": user_prefs.max_signals_per_day,
                    "max_signals_per_hour": user_prefs.max_signals_per_hour
                }
            else:
                preferences[str(user.id)] = {
                    "delivery_methods": ["push_notification"],
                    "max_signals_per_day": 10,
                    "max_signals_per_hour": 3
                }
        
        return preferences
    
    def _format_signal_data(self, signal: TradingSignal) -> Dict[str, Any]:
        """Format signal data for distribution"""
        return {
            "id": str(signal.id),
            "signal_id": signal.signal_id,
            "symbol": signal.symbol,
            "exchange": signal.exchange,
            "asset_class": signal.asset_class,
            "signal_type": signal.signal_type,
            "priority": signal.priority,
            "confidence_score": float(signal.confidence_score),
            "entry_price": float(signal.entry_price) if signal.entry_price else None,
            "target_price": float(signal.target_price) if signal.target_price else None,
            "stop_loss": float(signal.stop_loss) if signal.stop_loss else None,
            "current_price": float(signal.current_price) if signal.current_price else None,
            "risk_reward_ratio": float(signal.risk_reward_ratio) if signal.risk_reward_ratio else None,
            "potential_return": signal.potential_return,
            "potential_loss": signal.potential_loss,
            "generated_at": signal.generated_at.isoformat(),
            "valid_until": signal.valid_until.isoformat() if signal.valid_until else None,
            "status": signal.status,
            "min_subscription_tier": signal.min_subscription_tier,
            "tags": signal.tags or [],
            "notes": signal.notes,
            "technical_indicators": signal.technical_indicators or {},
            "provider_name": signal.provider.name if signal.provider else "Unknown"
        }
    
    async def _update_signal_distribution_stats(self, signal: TradingSignal, user_count: int, distribution_time_ms: float):
        """Update signal with distribution statistics"""
        try:
            # Store distribution metadata
            distribution_metadata = {
                "users_notified": user_count,
                "distribution_time_ms": distribution_time_ms,
                "distributed_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Update signal metadata
            if not signal.market_conditions:
                signal.market_conditions = {}
            
            signal.market_conditions["distribution"] = distribution_metadata
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error updating signal distribution stats: {str(e)}")
    
    async def handle_websocket_connection(self, websocket: WebSocket, user_id: str, subscription_tier: str):
        """Handle individual WebSocket connection"""
        await self.websocket_manager.connect(websocket, user_id, subscription_tier)
        
        try:
            while True:
                # Keep connection alive and handle any incoming messages
                data = await websocket.receive_text()
                
                # Handle ping/pong for connection health
                if data == "ping":
                    await websocket.send_text("pong")
                
        except WebSocketDisconnect:
            self.websocket_manager.disconnect(user_id)
        except Exception as e:
            logger.error(f"WebSocket error for user {user_id}: {str(e)}")
            self.websocket_manager.disconnect(user_id)
    
    def get_distribution_stats(self) -> Dict[str, Any]:
        """Get distribution service statistics"""
        return {
            "websocket_stats": self.websocket_manager.get_connection_stats(),
            "service_status": "running"
        }


# Global service instance
distribution_service = SignalDistributionService()


async def initialize_distribution_service():
    """Initialize the distribution service"""
    await distribution_service.initialize()


async def distribute_signal_to_users(signal: TradingSignal):
    """Distribute signal to eligible users"""
    await distribution_service.distribute_signal(signal)
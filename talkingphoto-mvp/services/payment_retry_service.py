"""
TalkingPhoto AI MVP - Payment Retry Service
Advanced retry logic for failed payments optimized for Indian market
"""

import stripe
import sqlite3
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import schedule
import threading
from services.payment_service import PaymentStatus
from config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = Config.STRIPE_SECRET_KEY


class RetryStatus(Enum):
    """Payment retry status"""
    PENDING = "pending"
    RETRYING = "retrying"
    RECOVERED = "recovered"
    EXHAUSTED = "exhausted"
    CANCELED = "canceled"


class FailureCategory(Enum):
    """Payment failure categories for retry strategy"""
    RECOVERABLE = "recoverable"  # Card declined, insufficient funds
    UNRECOVERABLE = "unrecoverable"  # Invalid card, blocked
    TEMPORARY = "temporary"  # Network issues, processing errors
    AUTHENTICATION = "authentication"  # 3DS failures


@dataclass
class RetryConfig:
    """Retry configuration for different failure types"""
    max_retries: int
    retry_intervals: List[int]  # Hours between retries
    notification_schedule: List[int]  # When to send notifications
    grace_period_hours: int


class PaymentRetryService:
    """
    Intelligent payment retry service with Indian market optimizations
    """

    def __init__(self):
        self.db_path = "data/payments.db"
        self.retry_configs = self._load_retry_configs()
        self._start_background_scheduler()

    def _load_retry_configs(self) -> Dict[FailureCategory, RetryConfig]:
        """Load retry configurations for different failure types"""
        return {
            FailureCategory.RECOVERABLE: RetryConfig(
                max_retries=5,
                retry_intervals=[1, 6, 24, 72, 168],  # 1h, 6h, 1d, 3d, 7d
                notification_schedule=[1, 24, 72, 168],  # When to send dunning emails
                grace_period_hours=168  # 7 days grace period
            ),
            FailureCategory.TEMPORARY: RetryConfig(
                max_retries=3,
                retry_intervals=[0.5, 2, 6],  # 30min, 2h, 6h - faster for temp issues
                notification_schedule=[2, 6],  # Less aggressive notifications
                grace_period_hours=24  # 1 day grace
            ),
            FailureCategory.AUTHENTICATION: RetryConfig(
                max_retries=2,
                retry_intervals=[24, 168],  # 1d, 7d - give user time to resolve 3DS
                notification_schedule=[24, 168],
                grace_period_hours=168  # 7 days
            ),
            FailureCategory.UNRECOVERABLE: RetryConfig(
                max_retries=0,
                retry_intervals=[],
                notification_schedule=[0],  # Immediate notification only
                grace_period_hours=0  # No grace period
            )
        }

    def categorize_failure(self, failure_code: str, failure_message: str) -> FailureCategory:
        """Categorize payment failure for appropriate retry strategy"""
        failure_lower = failure_message.lower()

        # Recoverable failures (common in Indian market)
        recoverable_indicators = [
            'insufficient_funds', 'card_declined', 'expired_card',
            'balance insufficient', 'limit exceeded', 'daily limit',
            'monthly limit', 'transaction limit'
        ]

        # Temporary failures
        temporary_indicators = [
            'processing_error', 'try_again_later', 'network_error',
            'timeout', 'service_unavailable', 'bank_error',
            'issuer_unavailable', 'system_error'
        ]

        # Authentication failures (3DS, OTP issues common in India)
        auth_indicators = [
            'authentication_required', '3d_secure_failure',
            'otp_failed', 'authentication_failed', 'card_authentication',
            'secure_auth_required'
        ]

        # Unrecoverable failures
        unrecoverable_indicators = [
            'card_not_supported', 'currency_not_supported',
            'blocked_card', 'stolen_card', 'invalid_card',
            'do_not_honor', 'fraudulent', 'restricted_card'
        ]

        for indicator in unrecoverable_indicators:
            if indicator in failure_lower:
                return FailureCategory.UNRECOVERABLE

        for indicator in auth_indicators:
            if indicator in failure_lower:
                return FailureCategory.AUTHENTICATION

        for indicator in temporary_indicators:
            if indicator in failure_lower:
                return FailureCategory.TEMPORARY

        for indicator in recoverable_indicators:
            if indicator in failure_lower:
                return FailureCategory.RECOVERABLE

        # Default to recoverable for unknown failures
        return FailureCategory.RECOVERABLE

    def schedule_payment_retry(self, payment_intent_id: str, customer_email: str,
                             failure_code: str, failure_message: str) -> bool:
        """Schedule intelligent payment retry based on failure type"""
        try:
            category = self.categorize_failure(failure_code, failure_message)
            config = self.retry_configs[category]

            if config.max_retries == 0:
                logger.info(f"Unrecoverable failure, no retries scheduled: {payment_intent_id}")
                self._record_retry_exhausted(payment_intent_id, customer_email, failure_message)
                return False

            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Check if retry already exists
                cursor.execute("""
                    SELECT id, retry_count FROM payment_retries
                    WHERE payment_intent_id = ? AND status IN ('pending', 'retrying')
                """, (payment_intent_id,))

                result = cursor.fetchone()

                if result:
                    retry_id, retry_count = result

                    if retry_count >= config.max_retries:
                        self._mark_retry_exhausted(retry_id)
                        return False

                    # Update existing retry
                    next_retry = datetime.now() + timedelta(hours=config.retry_intervals[retry_count])
                    cursor.execute("""
                        UPDATE payment_retries
                        SET retry_count = retry_count + 1, next_retry_at = ?
                        WHERE id = ?
                    """, (next_retry, retry_id))
                else:
                    # Create new retry schedule
                    next_retry = datetime.now() + timedelta(hours=config.retry_intervals[0])
                    cursor.execute("""
                        INSERT INTO payment_retries (
                            payment_intent_id, customer_email, retry_count,
                            next_retry_at, failure_reason, status
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        payment_intent_id, customer_email, 0,
                        next_retry, failure_message, RetryStatus.PENDING.value
                    ))

                conn.commit()

                logger.info(f"Scheduled retry for {payment_intent_id} ({category.value})")
                return True

        except Exception as e:
            logger.error(f"Failed to schedule payment retry: {str(e)}")
            return False

    def process_pending_retries(self):
        """Process all pending payment retries"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Get pending retries that are due
                cursor.execute("""
                    SELECT id, payment_intent_id, customer_email, retry_count, failure_reason
                    FROM payment_retries
                    WHERE status = 'pending'
                    AND next_retry_at <= ?
                """, (datetime.now(),))

                retries = cursor.fetchall()

                for retry in retries:
                    retry_id, pi_id, customer_email, retry_count, failure_reason = retry

                    try:
                        # Mark as retrying
                        cursor.execute("""
                            UPDATE payment_retries
                            SET status = 'retrying', last_retry_at = ?
                            WHERE id = ?
                        """, (datetime.now(), retry_id))
                        conn.commit()

                        # Attempt payment retry
                        success = self._attempt_payment_retry(pi_id, customer_email)

                        if success:
                            cursor.execute("""
                                UPDATE payment_retries
                                SET status = 'recovered'
                                WHERE id = ?
                            """, (retry_id,))

                            # Send recovery confirmation
                            self._send_payment_recovery_notification(customer_email, pi_id)

                            logger.info(f"Payment recovered: {pi_id}")
                        else:
                            # Schedule next retry or mark as exhausted
                            self._handle_retry_failure(retry_id, pi_id, customer_email,
                                                     retry_count, failure_reason)

                        conn.commit()

                    except Exception as e:
                        logger.error(f"Failed to process retry {retry_id}: {str(e)}")
                        # Reset status to pending for later retry
                        cursor.execute("""
                            UPDATE payment_retries
                            SET status = 'pending'
                            WHERE id = ?
                        """, (retry_id,))
                        conn.commit()

        except Exception as e:
            logger.error(f"Failed to process pending retries: {str(e)}")

    def _attempt_payment_retry(self, payment_intent_id: str, customer_email: str) -> bool:
        """Attempt to retry a failed payment"""
        try:
            # Retrieve the payment intent
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            if payment_intent.status == 'succeeded':
                logger.info(f"Payment already succeeded: {payment_intent_id}")
                return True

            if payment_intent.status in ['canceled', 'requires_payment_method']:
                # Get customer's default payment method
                customer = stripe.Customer.retrieve(payment_intent.customer)

                # Try with the customer's default payment method
                if customer.invoice_settings.default_payment_method:
                    payment_intent = stripe.PaymentIntent.modify(
                        payment_intent_id,
                        payment_method=customer.invoice_settings.default_payment_method
                    )

                    # Confirm the payment
                    confirmed_pi = stripe.PaymentIntent.confirm(payment_intent_id)

                    if confirmed_pi.status == 'succeeded':
                        return True
                    elif confirmed_pi.status == 'requires_action':
                        # Send customer link to complete authentication
                        self._send_authentication_required_email(customer_email, confirmed_pi)
                        return False

            return False

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error during retry: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during retry: {str(e)}")
            return False

    def _handle_retry_failure(self, retry_id: int, payment_intent_id: str,
                            customer_email: str, retry_count: int, failure_reason: str):
        """Handle failed retry attempt"""

        # Determine failure category and get config
        category = self.categorize_failure("", failure_reason)
        config = self.retry_configs[category]

        if retry_count + 1 >= config.max_retries:
            # Mark as exhausted
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE payment_retries
                    SET status = 'exhausted'
                    WHERE id = ?
                """, (retry_id,))
                conn.commit()

            # Send final notification
            self._send_retry_exhausted_notification(customer_email, payment_intent_id)

            # Consider downgrading subscription or suspending service
            self._handle_subscription_suspension(customer_email)

            logger.warning(f"Retry exhausted for {payment_intent_id}")
        else:
            # Schedule next retry
            next_retry_hours = config.retry_intervals[retry_count + 1]
            next_retry = datetime.now() + timedelta(hours=next_retry_hours)

            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE payment_retries
                    SET status = 'pending', next_retry_at = ?
                    WHERE id = ?
                """, (next_retry, retry_id))
                conn.commit()

            # Send dunning email if scheduled
            if retry_count + 1 in config.notification_schedule:
                self._send_dunning_email(customer_email, payment_intent_id, retry_count + 1)

    def _mark_retry_exhausted(self, retry_id: int):
        """Mark retry as exhausted"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE payment_retries
                SET status = 'exhausted'
                WHERE id = ?
            """, (retry_id,))
            conn.commit()

    def _record_retry_exhausted(self, payment_intent_id: str, customer_email: str, failure_reason: str):
        """Record immediately exhausted retry for unrecoverable failures"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO payment_retries (
                    payment_intent_id, customer_email, retry_count,
                    failure_reason, status
                ) VALUES (?, ?, ?, ?, ?)
            """, (payment_intent_id, customer_email, 0, failure_reason, RetryStatus.EXHAUSTED.value))
            conn.commit()

    def get_retry_statistics(self) -> Dict:
        """Get retry performance statistics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                stats = {}

                # Overall retry stats
                cursor.execute("""
                    SELECT status, COUNT(*)
                    FROM payment_retries
                    GROUP BY status
                """)

                for status, count in cursor.fetchall():
                    stats[f"total_{status}"] = count

                # Recovery rate
                cursor.execute("""
                    SELECT
                        COUNT(CASE WHEN status = 'recovered' THEN 1 END) as recovered,
                        COUNT(*) as total
                    FROM payment_retries
                    WHERE status IN ('recovered', 'exhausted')
                """)

                result = cursor.fetchone()
                if result and result[1] > 0:
                    stats['recovery_rate'] = round((result[0] / result[1]) * 100, 2)
                else:
                    stats['recovery_rate'] = 0.0

                # Average retry count for recovered payments
                cursor.execute("""
                    SELECT AVG(retry_count)
                    FROM payment_retries
                    WHERE status = 'recovered'
                """)

                result = cursor.fetchone()
                stats['avg_retries_to_recovery'] = round(result[0] or 0, 2)

                return stats

        except Exception as e:
            logger.error(f"Failed to get retry statistics: {str(e)}")
            return {}

    def _start_background_scheduler(self):
        """Start background scheduler for retry processing"""
        def run_scheduler():
            # Schedule retry processing every 30 minutes
            schedule.every(30).minutes.do(self.process_pending_retries)

            # Schedule cleanup of old retries daily
            schedule.every().day.at("02:00").do(self._cleanup_old_retries)

            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute

        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()
        logger.info("Payment retry scheduler started")

    def _cleanup_old_retries(self):
        """Clean up old retry records"""
        try:
            cutoff_date = datetime.now() - timedelta(days=90)  # Keep 90 days of history

            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    DELETE FROM payment_retries
                    WHERE created_at < ? AND status IN ('recovered', 'exhausted', 'canceled')
                """, (cutoff_date,))

                deleted = cursor.rowcount
                conn.commit()

                if deleted > 0:
                    logger.info(f"Cleaned up {deleted} old retry records")

        except Exception as e:
            logger.error(f"Failed to cleanup old retries: {str(e)}")

    # Notification methods (implement based on your email/SMS service)
    def _send_payment_recovery_notification(self, customer_email: str, payment_intent_id: str):
        """Send payment recovery confirmation"""
        logger.info(f"Sending recovery notification to {customer_email} for {payment_intent_id}")

    def _send_authentication_required_email(self, customer_email: str, payment_intent):
        """Send email with authentication link"""
        logger.info(f"Sending authentication required email to {customer_email}")

    def _send_retry_exhausted_notification(self, customer_email: str, payment_intent_id: str):
        """Send final retry exhausted notification"""
        logger.info(f"Sending retry exhausted notification to {customer_email}")

    def _send_dunning_email(self, customer_email: str, payment_intent_id: str, retry_count: int):
        """Send dunning email for failed payment"""
        logger.info(f"Sending dunning email #{retry_count} to {customer_email}")

    def _handle_subscription_suspension(self, customer_email: str):
        """Handle subscription suspension for exhausted retries"""
        logger.info(f"Handling subscription suspension for {customer_email}")
        # Implement logic to suspend or downgrade subscription


# Global retry service instance
payment_retry_service = PaymentRetryService()
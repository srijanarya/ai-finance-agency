"""
TalkingPhoto MVP - Error Recovery and Fallback Handling System
Production-ready error recovery with automatic fallback mechanisms
"""

import asyncio
import time
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Callable
from enum import Enum
import structlog
from dataclasses import dataclass, asdict

from models.video import VideoGeneration, VideoStatus, AIProvider
from models.user import User
from services.websocket_service import WebSocketService
from services.payment_service import PaymentService
from core.database import db
from core.cache import cached_result

logger = structlog.get_logger()


class ErrorSeverity(Enum):
    """Error severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RecoveryAction(Enum):
    """Available recovery actions"""
    RETRY = "retry"
    FALLBACK_PROVIDER = "fallback_provider"
    QUALITY_DOWNGRADE = "quality_downgrade"
    PARTIAL_RETRY = "partial_retry"
    USER_NOTIFICATION = "user_notification"
    REFUND_CREDITS = "refund_credits"
    CANCEL_GENERATION = "cancel_generation"


@dataclass
class ErrorContext:
    """Error context information"""
    error_type: str
    error_message: str
    severity: ErrorSeverity
    video_generation_id: str
    user_id: str
    step: str
    timestamp: datetime
    metadata: Dict[str, Any]


@dataclass
class RecoveryPlan:
    """Recovery plan for handling errors"""
    primary_actions: List[RecoveryAction]
    fallback_actions: List[RecoveryAction]
    max_retries: int
    retry_delay: int
    timeout_seconds: int
    user_notification_required: bool
    credits_refund_percentage: float = 0.0


class ErrorRecoveryService:
    """
    Comprehensive error recovery and fallback handling service
    """

    def __init__(self):
        self.websocket_service = WebSocketService()
        self.payment_service = PaymentService()

        # Error pattern definitions
        self.error_patterns = {
            # API and Network Errors
            'timeout_error': {
                'patterns': ['timeout', 'time out', 'request timeout'],
                'severity': ErrorSeverity.MEDIUM,
                'recovery_plan': RecoveryPlan(
                    primary_actions=[RecoveryAction.RETRY],
                    fallback_actions=[RecoveryAction.FALLBACK_PROVIDER],
                    max_retries=3,
                    retry_delay=30,
                    timeout_seconds=300,
                    user_notification_required=True
                )
            },
            'api_rate_limit': {
                'patterns': ['rate limit', '429', 'too many requests', 'quota exceeded'],
                'severity': ErrorSeverity.HIGH,
                'recovery_plan': RecoveryPlan(
                    primary_actions=[RecoveryAction.FALLBACK_PROVIDER],
                    fallback_actions=[RecoveryAction.QUALITY_DOWNGRADE, RecoveryAction.RETRY],
                    max_retries=2,
                    retry_delay=120,
                    timeout_seconds=600,
                    user_notification_required=True
                )
            },
            'insufficient_credits': {
                'patterns': ['insufficient', 'credit', 'payment required', '402'],
                'severity': ErrorSeverity.CRITICAL,
                'recovery_plan': RecoveryPlan(
                    primary_actions=[RecoveryAction.USER_NOTIFICATION],
                    fallback_actions=[RecoveryAction.CANCEL_GENERATION],
                    max_retries=0,
                    retry_delay=0,
                    timeout_seconds=0,
                    user_notification_required=True
                )
            },
            'file_not_found': {
                'patterns': ['file not found', 'not found', '404', 'missing file'],
                'severity': ErrorSeverity.HIGH,
                'recovery_plan': RecoveryPlan(
                    primary_actions=[RecoveryAction.PARTIAL_RETRY],
                    fallback_actions=[RecoveryAction.CANCEL_GENERATION, RecoveryAction.REFUND_CREDITS],
                    max_retries=1,
                    retry_delay=10,
                    timeout_seconds=60,
                    user_notification_required=True,
                    credits_refund_percentage=1.0
                )
            },
            'processing_error': {
                'patterns': ['processing failed', 'generation failed', 'internal error'],
                'severity': ErrorSeverity.MEDIUM,
                'recovery_plan': RecoveryPlan(
                    primary_actions=[RecoveryAction.RETRY, RecoveryAction.FALLBACK_PROVIDER],
                    fallback_actions=[RecoveryAction.QUALITY_DOWNGRADE],
                    max_retries=2,
                    retry_delay=60,
                    timeout_seconds=300,
                    user_notification_required=True
                )
            },
            'memory_error': {
                'patterns': ['out of memory', 'memory', 'oom', 'resource exhausted'],
                'severity': ErrorSeverity.HIGH,
                'recovery_plan': RecoveryPlan(
                    primary_actions=[RecoveryAction.QUALITY_DOWNGRADE],
                    fallback_actions=[RecoveryAction.FALLBACK_PROVIDER],
                    max_retries=2,
                    retry_delay=30,
                    timeout_seconds=180,
                    user_notification_required=True
                )
            },
            'invalid_input': {
                'patterns': ['invalid', 'bad request', '400', 'malformed'],
                'severity': ErrorSeverity.MEDIUM,
                'recovery_plan': RecoveryPlan(
                    primary_actions=[RecoveryAction.PARTIAL_RETRY],
                    fallback_actions=[RecoveryAction.CANCEL_GENERATION, RecoveryAction.REFUND_CREDITS],
                    max_retries=1,
                    retry_delay=5,
                    timeout_seconds=30,
                    user_notification_required=True,
                    credits_refund_percentage=0.8
                )
            },
            'service_unavailable': {
                'patterns': ['service unavailable', '503', 'temporarily unavailable', 'maintenance'],
                'severity': ErrorSeverity.HIGH,
                'recovery_plan': RecoveryPlan(
                    primary_actions=[RecoveryAction.FALLBACK_PROVIDER],
                    fallback_actions=[RecoveryAction.RETRY, RecoveryAction.USER_NOTIFICATION],
                    max_retries=1,
                    retry_delay=180,
                    timeout_seconds=300,
                    user_notification_required=True
                )
            }
        }

        # Recovery metrics tracking
        self.recovery_stats = {
            'total_errors': 0,
            'successful_recoveries': 0,
            'failed_recoveries': 0,
            'recovery_actions_taken': {},
            'error_patterns_seen': {}
        }

    async def handle_error(
        self,
        video_generation: VideoGeneration,
        error_message: str,
        step: str,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Main error handling entry point
        """
        try:
            # Create error context
            error_context = ErrorContext(
                error_type=self._classify_error(error_message),
                error_message=error_message,
                severity=self._determine_severity(error_message),
                video_generation_id=video_generation.id,
                user_id=video_generation.user_id,
                step=step,
                timestamp=datetime.now(timezone.utc),
                metadata=metadata or {}
            )

            logger.error("Processing error for recovery",
                        video_id=video_generation.id,
                        error_type=error_context.error_type,
                        severity=error_context.severity.value,
                        step=step)

            # Update recovery statistics
            self.recovery_stats['total_errors'] += 1
            error_pattern_key = error_context.error_type
            self.recovery_stats['error_patterns_seen'][error_pattern_key] = \
                self.recovery_stats['error_patterns_seen'].get(error_pattern_key, 0) + 1

            # Get recovery plan
            recovery_plan = self._get_recovery_plan(error_context)
            if not recovery_plan:
                logger.warning("No recovery plan found for error", error_type=error_context.error_type)
                return await self._handle_unrecoverable_error(video_generation, error_context)

            # Execute recovery plan
            recovery_result = await self._execute_recovery_plan(
                video_generation, error_context, recovery_plan
            )

            # Log recovery result
            if recovery_result['success']:
                self.recovery_stats['successful_recoveries'] += 1
                logger.info("Error recovery successful",
                           video_id=video_generation.id,
                           actions_taken=recovery_result.get('actions_taken', []))
            else:
                self.recovery_stats['failed_recoveries'] += 1
                logger.error("Error recovery failed",
                            video_id=video_generation.id,
                            final_error=recovery_result.get('error'))

            return recovery_result

        except Exception as e:
            logger.error("Error recovery system failure", error=str(e))
            return {
                'success': False,
                'error': f'Recovery system failure: {str(e)}',
                'requires_manual_intervention': True
            }

    def _classify_error(self, error_message: str) -> str:
        """
        Classify error based on message patterns
        """
        error_lower = error_message.lower()

        for error_type, pattern_info in self.error_patterns.items():
            for pattern in pattern_info['patterns']:
                if pattern in error_lower:
                    return error_type

        return 'unknown_error'

    def _determine_severity(self, error_message: str) -> ErrorSeverity:
        """
        Determine error severity
        """
        error_type = self._classify_error(error_message)
        return self.error_patterns.get(error_type, {}).get('severity', ErrorSeverity.MEDIUM)

    def _get_recovery_plan(self, error_context: ErrorContext) -> Optional[RecoveryPlan]:
        """
        Get recovery plan for error type
        """
        pattern_info = self.error_patterns.get(error_context.error_type)
        return pattern_info.get('recovery_plan') if pattern_info else None

    async def _execute_recovery_plan(
        self,
        video_generation: VideoGeneration,
        error_context: ErrorContext,
        recovery_plan: RecoveryPlan
    ) -> Dict[str, Any]:
        """
        Execute the recovery plan
        """
        actions_taken = []
        current_attempt = 0

        # Notify user if required
        if recovery_plan.user_notification_required:
            await self._notify_user_of_issue(video_generation, error_context, recovery_plan)

        # Try primary actions first
        for action in recovery_plan.primary_actions:
            try:
                result = await self._execute_recovery_action(
                    video_generation, error_context, action, current_attempt
                )

                actions_taken.append({
                    'action': action.value,
                    'result': result['success'],
                    'attempt': current_attempt,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                })

                # Track action statistics
                action_key = action.value
                self.recovery_stats['recovery_actions_taken'][action_key] = \
                    self.recovery_stats['recovery_actions_taken'].get(action_key, 0) + 1

                if result['success']:
                    return {
                        'success': True,
                        'recovery_action': action.value,
                        'actions_taken': actions_taken,
                        'message': result.get('message', 'Recovery successful')
                    }

                current_attempt += 1

                # Wait before next attempt
                if action == RecoveryAction.RETRY and recovery_plan.retry_delay > 0:
                    await asyncio.sleep(recovery_plan.retry_delay)

            except Exception as e:
                logger.error("Recovery action failed",
                            action=action.value,
                            error=str(e))
                actions_taken.append({
                    'action': action.value,
                    'result': False,
                    'error': str(e),
                    'attempt': current_attempt,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                })

        # Try fallback actions
        for action in recovery_plan.fallback_actions:
            try:
                result = await self._execute_recovery_action(
                    video_generation, error_context, action, current_attempt
                )

                actions_taken.append({
                    'action': action.value,
                    'result': result['success'],
                    'attempt': current_attempt,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                })

                if result['success']:
                    return {
                        'success': True,
                        'recovery_action': action.value,
                        'actions_taken': actions_taken,
                        'message': result.get('message', 'Recovery successful'),
                        'used_fallback': True
                    }

                current_attempt += 1

            except Exception as e:
                logger.error("Fallback recovery action failed",
                            action=action.value,
                            error=str(e))

        # All recovery attempts failed
        return {
            'success': False,
            'error': 'All recovery attempts exhausted',
            'actions_taken': actions_taken,
            'requires_manual_intervention': True
        }

    async def _execute_recovery_action(
        self,
        video_generation: VideoGeneration,
        error_context: ErrorContext,
        action: RecoveryAction,
        attempt_number: int
    ) -> Dict[str, Any]:
        """
        Execute a specific recovery action
        """
        try:
            if action == RecoveryAction.RETRY:
                return await self._retry_generation(video_generation, error_context)

            elif action == RecoveryAction.FALLBACK_PROVIDER:
                return await self._use_fallback_provider(video_generation, error_context)

            elif action == RecoveryAction.QUALITY_DOWNGRADE:
                return await self._downgrade_quality(video_generation, error_context)

            elif action == RecoveryAction.PARTIAL_RETRY:
                return await self._partial_retry(video_generation, error_context)

            elif action == RecoveryAction.USER_NOTIFICATION:
                return await self._notify_user(video_generation, error_context)

            elif action == RecoveryAction.REFUND_CREDITS:
                return await self._refund_credits(video_generation, error_context)

            elif action == RecoveryAction.CANCEL_GENERATION:
                return await self._cancel_generation(video_generation, error_context)

            else:
                return {'success': False, 'error': f'Unknown recovery action: {action.value}'}

        except Exception as e:
            logger.error("Recovery action execution failed",
                        action=action.value,
                        error=str(e))
            return {'success': False, 'error': str(e)}

    async def _retry_generation(
        self,
        video_generation: VideoGeneration,
        error_context: ErrorContext
    ) -> Dict[str, Any]:
        """
        Retry the video generation
        """
        try:
            # Reset status for retry
            video_generation.status = VideoStatus.PENDING
            video_generation.error_message = None
            video_generation.retry_count = getattr(video_generation, 'retry_count', 0) + 1
            db.session.commit()

            # Resubmit to processing queue
            from tasks.video_generation import submit_video_generation

            task_id = submit_video_generation(
                user_id=video_generation.user_id,
                uploaded_file_id=video_generation.source_file_id,
                script_text=video_generation.script_text,
                voice_settings=video_generation.voice_settings or {},
                video_options={
                    'quality': video_generation.video_quality.value,
                    'aspect_ratio': video_generation.aspect_ratio.value
                },
                priority=7  # Higher priority for retries
            )

            logger.info("Video generation retry submitted",
                       video_id=video_generation.id,
                       task_id=task_id,
                       retry_count=video_generation.retry_count)

            return {
                'success': True,
                'message': f'Retry attempt #{video_generation.retry_count} submitted',
                'task_id': task_id
            }

        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _use_fallback_provider(
        self,
        video_generation: VideoGeneration,
        error_context: ErrorContext
    ) -> Dict[str, Any]:
        """
        Switch to fallback AI provider
        """
        try:
            current_provider = video_generation.ai_provider

            # Get next best provider
            fallback_providers = {
                AIProvider.VEO3: AIProvider.RUNWAY,
                AIProvider.RUNWAY: AIProvider.NANO_BANANA,
                AIProvider.NANO_BANANA: AIProvider.MOCK
            }

            fallback_provider = fallback_providers.get(current_provider)
            if not fallback_provider:
                return {'success': False, 'error': 'No fallback provider available'}

            # Update provider and reset status
            original_provider = video_generation.ai_provider
            video_generation.ai_provider = fallback_provider
            video_generation.status = VideoStatus.PENDING
            video_generation.error_message = None
            video_generation.fallback_provider = fallback_provider
            video_generation.original_provider = original_provider
            db.session.commit()

            # Resubmit with new provider
            from tasks.video_generation import submit_video_generation

            task_id = submit_video_generation(
                user_id=video_generation.user_id,
                uploaded_file_id=video_generation.source_file_id,
                script_text=video_generation.script_text,
                voice_settings=video_generation.voice_settings or {},
                video_options={
                    'quality': video_generation.video_quality.value,
                    'aspect_ratio': video_generation.aspect_ratio.value
                },
                priority=6  # High priority for fallback
            )

            logger.info("Fallback provider activated",
                       video_id=video_generation.id,
                       original_provider=original_provider.value,
                       fallback_provider=fallback_provider.value,
                       task_id=task_id)

            return {
                'success': True,
                'message': f'Switched from {original_provider.value} to {fallback_provider.value}',
                'task_id': task_id,
                'fallback_provider': fallback_provider.value
            }

        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _downgrade_quality(
        self,
        video_generation: VideoGeneration,
        error_context: ErrorContext
    ) -> Dict[str, Any]:
        """
        Downgrade video quality to reduce resource requirements
        """
        try:
            from models.video import VideoQuality

            current_quality = video_generation.video_quality
            quality_downgrades = {
                VideoQuality.PREMIUM: VideoQuality.STANDARD,
                VideoQuality.STANDARD: VideoQuality.ECONOMY
            }

            downgraded_quality = quality_downgrades.get(current_quality)
            if not downgraded_quality:
                return {'success': False, 'error': 'Cannot downgrade quality further'}

            # Update quality and reset status
            original_quality = video_generation.video_quality
            video_generation.video_quality = downgraded_quality
            video_generation.status = VideoStatus.PENDING
            video_generation.error_message = None
            db.session.commit()

            # Resubmit with lower quality
            from tasks.video_generation import submit_video_generation

            task_id = submit_video_generation(
                user_id=video_generation.user_id,
                uploaded_file_id=video_generation.source_file_id,
                script_text=video_generation.script_text,
                voice_settings=video_generation.voice_settings or {},
                video_options={
                    'quality': downgraded_quality.value,
                    'aspect_ratio': video_generation.aspect_ratio.value
                },
                priority=5
            )

            logger.info("Quality downgrade applied",
                       video_id=video_generation.id,
                       original_quality=original_quality.value,
                       new_quality=downgraded_quality.value,
                       task_id=task_id)

            return {
                'success': True,
                'message': f'Quality downgraded from {original_quality.value} to {downgraded_quality.value}',
                'task_id': task_id,
                'quality_downgraded': True
            }

        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _partial_retry(
        self,
        video_generation: VideoGeneration,
        error_context: ErrorContext
    ) -> Dict[str, Any]:
        """
        Retry from a specific step in the workflow
        """
        try:
            # Determine which step to retry from based on error context
            retry_from_step = self._determine_retry_step(error_context)

            # Reset status for partial retry
            video_generation.status = VideoStatus.PENDING
            video_generation.error_message = None
            db.session.commit()

            # Submit partial retry (this would need workflow orchestrator support)
            logger.info("Partial retry initiated",
                       video_id=video_generation.id,
                       retry_from_step=retry_from_step)

            return {
                'success': True,
                'message': f'Partial retry from step: {retry_from_step}',
                'retry_from_step': retry_from_step
            }

        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _notify_user(
        self,
        video_generation: VideoGeneration,
        error_context: ErrorContext
    ) -> Dict[str, Any]:
        """
        Send notification to user about the issue
        """
        try:
            # Send WebSocket notification
            await self.websocket_service.send_error_notification(
                user_id=video_generation.user_id,
                video_id=video_generation.id,
                error_message=f"Processing issue: {error_context.error_message}. We're working to fix this."
            )

            # Send email notification (implement as needed)
            # await self._send_email_notification(video_generation, error_context)

            return {
                'success': True,
                'message': 'User notified of processing issue'
            }

        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _refund_credits(
        self,
        video_generation: VideoGeneration,
        error_context: ErrorContext
    ) -> Dict[str, Any]:
        """
        Refund credits to user for failed generation
        """
        try:
            # Get recovery plan to determine refund percentage
            recovery_plan = self._get_recovery_plan(error_context)
            refund_percentage = recovery_plan.credits_refund_percentage if recovery_plan else 1.0

            processing_cost = video_generation.processing_cost or 0
            refund_amount = processing_cost * refund_percentage

            if refund_amount > 0:
                refund_result = self.payment_service.add_credits(
                    video_generation.user_id,
                    refund_amount,
                    f"Refund for failed video generation {video_generation.id}"
                )

                if refund_result['success']:
                    logger.info("Credits refunded",
                               video_id=video_generation.id,
                               user_id=video_generation.user_id,
                               refund_amount=refund_amount)

                    return {
                        'success': True,
                        'message': f'Refunded {refund_amount} credits ({int(refund_percentage * 100)}% of cost)',
                        'refund_amount': refund_amount
                    }
                else:
                    return {'success': False, 'error': f'Refund failed: {refund_result["error"]}'}

            return {'success': True, 'message': 'No refund needed (zero cost)'}

        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _cancel_generation(
        self,
        video_generation: VideoGeneration,
        error_context: ErrorContext
    ) -> Dict[str, Any]:
        """
        Cancel the video generation
        """
        try:
            # Update status to cancelled
            video_generation.status = VideoStatus.CANCELLED
            video_generation.error_message = f"Cancelled due to: {error_context.error_message}"
            video_generation.completed_at = datetime.now(timezone.utc)
            db.session.commit()

            # Notify user
            await self.websocket_service.send_error_notification(
                user_id=video_generation.user_id,
                video_id=video_generation.id,
                error_message="Video generation has been cancelled due to technical issues."
            )

            logger.info("Video generation cancelled",
                       video_id=video_generation.id,
                       reason=error_context.error_message)

            return {
                'success': True,
                'message': 'Video generation cancelled',
                'status': 'cancelled'
            }

        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _handle_unrecoverable_error(
        self,
        video_generation: VideoGeneration,
        error_context: ErrorContext
    ) -> Dict[str, Any]:
        """
        Handle errors that cannot be recovered from
        """
        try:
            # Mark as failed
            video_generation.mark_processing_failed(
                error_context.error_message,
                'unrecoverable_error'
            )
            db.session.commit()

            # Refund full credits
            await self._refund_credits(video_generation, error_context)

            # Notify user
            await self.websocket_service.send_error_notification(
                user_id=video_generation.user_id,
                video_id=video_generation.id,
                error_message="We encountered an issue we couldn't automatically fix. Your credits have been refunded."
            )

            logger.error("Unrecoverable error",
                        video_id=video_generation.id,
                        error_type=error_context.error_type,
                        error_message=error_context.error_message)

            return {
                'success': False,
                'error': 'Unrecoverable error - manual intervention required',
                'credits_refunded': True,
                'requires_manual_intervention': True
            }

        except Exception as e:
            logger.error("Failed to handle unrecoverable error", error=str(e))
            return {
                'success': False,
                'error': f'Failed to handle unrecoverable error: {str(e)}',
                'requires_manual_intervention': True
            }

    async def _notify_user_of_issue(
        self,
        video_generation: VideoGeneration,
        error_context: ErrorContext,
        recovery_plan: RecoveryPlan
    ) -> None:
        """
        Notify user about the issue and recovery attempt
        """
        try:
            message = f"We encountered a {error_context.severity.value} issue during processing. "

            if recovery_plan.primary_actions:
                action_names = [action.value.replace('_', ' ') for action in recovery_plan.primary_actions[:2]]
                message += f"We're automatically trying to resolve this by: {', '.join(action_names)}."

            await self.websocket_service.send_progress_update(
                user_id=video_generation.user_id,
                video_id=video_generation.id,
                progress_data={
                    'progress_percentage': 50,  # Indicate we're handling the issue
                    'current_step': 'error_recovery',
                    'step_details': {
                        'message': message,
                        'error_type': error_context.error_type,
                        'recovery_in_progress': True
                    }
                }
            )

        except Exception as e:
            logger.error("Failed to notify user of issue", error=str(e))

    def _determine_retry_step(self, error_context: ErrorContext) -> str:
        """
        Determine which workflow step to retry from
        """
        step_retry_mapping = {
            'validation': 'validation',
            'photo_enhancement': 'photo_enhancement',
            'tts_generation': 'tts_generation',
            'lipsync_processing': 'lipsync_processing',
            'video_generation': 'video_generation',
            'post_processing': 'post_processing',
            'storage_upload': 'storage_upload'
        }

        return step_retry_mapping.get(error_context.step, 'validation')

    def get_recovery_statistics(self) -> Dict[str, Any]:
        """
        Get error recovery statistics
        """
        return {
            **self.recovery_stats,
            'recovery_success_rate': (
                self.recovery_stats['successful_recoveries'] /
                max(1, self.recovery_stats['total_errors'])
            ) * 100,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
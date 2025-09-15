"""
TalkingPhoto AI MVP - Premium API Endpoints
API endpoints for HeyGen premium service integration
"""

from flask import Blueprint, request, jsonify, session
from flask_cors import cross_origin
import asyncio
import json
from datetime import datetime
from typing import Dict, Any
import logging

# Import services
from services.heygen_service import heygen_service, HeyGenGenerationRequest, HeyGenVideoQuality, HeyGenLanguage
from services.premium_subscription_service import premium_subscription_service, PremiumTier, ServiceProvider
from services.ab_testing_service import ab_testing_service
from services.quality_metrics_service import quality_metrics_service
from services.pricing_strategy import pricing_strategy, PricingTier
from core.security import require_auth, validate_request
from core.cache import cache_response

logger = logging.getLogger(__name__)

# Create Blueprint
premium_bp = Blueprint('premium', __name__, url_prefix='/api/v1/premium')


@premium_bp.route('/subscription/check', methods=['GET'])
@cross_origin()
@require_auth
def check_premium_subscription():
    """Check user's premium subscription status"""
    try:
        user_email = session.get('user_email')
        if not user_email:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get user tier
        tier = premium_subscription_service.get_user_tier(user_email)
        can_use_heygen = premium_subscription_service.can_use_heygen(user_email)
        credits = premium_subscription_service.get_user_credits(user_email)
        
        # Get available providers
        optimal_provider = premium_subscription_service.get_optimal_provider(user_email)
        
        return jsonify({
            'success': True,
            'tier': tier.value,
            'can_use_heygen': can_use_heygen,
            'optimal_provider': optimal_provider.value,
            'credits': credits,
            'features': {
                'heygen_avatars': can_use_heygen,
                'custom_avatars': tier in [PremiumTier.PREMIUM, PremiumTier.ENTERPRISE],
                'quality_comparison': True,
                'professional_support': tier != PremiumTier.FREE
            }
        })
        
    except Exception as e:
        logger.error(f"Premium subscription check failed: {str(e)}")
        return jsonify({'error': 'Failed to check subscription'}), 500


@premium_bp.route('/avatars', methods=['GET'])
@cross_origin()
@require_auth
async def get_premium_avatars():
    """Get available premium avatars for user"""
    try:
        user_email = session.get('user_email')
        if not user_email:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Check premium access
        has_premium = await heygen_service.check_premium_access(user_email)
        if not has_premium:
            return jsonify({
                'error': 'Premium subscription required',
                'upgrade_required': True,
                'message': 'Upgrade to Premium or Enterprise to access professional avatars'
            }), 403
        
        # Get available avatars
        avatars = await heygen_service.get_available_avatars(user_email)
        
        # Format avatar data for API response
        avatar_data = []
        for avatar in avatars:
            avatar_data.append({
                'avatar_id': avatar.avatar_id,
                'name': avatar.name,
                'type': avatar.type.value,
                'gender': avatar.gender,
                'age_range': avatar.age_range,
                'ethnicity': avatar.ethnicity,
                'description': avatar.description,
                'preview_image_url': avatar.preview_image_url,
                'languages': [lang.value for lang in avatar.languages] if avatar.languages else [],
                'is_premium': avatar.is_premium
            })
        
        return jsonify({
            'success': True,
            'avatars': avatar_data,
            'total_count': len(avatar_data)
        })
        
    except Exception as e:
        logger.error(f"Get premium avatars failed: {str(e)}")
        return jsonify({'error': 'Failed to get avatars'}), 500


@premium_bp.route('/avatar/create', methods=['POST'])
@cross_origin()
@require_auth
async def create_custom_avatar():
    """Create custom avatar from user photo"""
    try:
        user_email = session.get('user_email')
        if not user_email:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Validate request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        avatar_name = request.form.get('name', 'Custom Avatar')
        
        if not image_file or image_file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        # Read image data
        image_data = image_file.read()
        
        # Create custom avatar
        result = await heygen_service.create_custom_avatar(user_email, image_data, avatar_name)
        
        if result['success']:
            return jsonify({
                'success': True,
                'avatar': {
                    'avatar_id': result['avatar'].avatar_id,
                    'name': result['avatar'].name,
                    'type': result['avatar'].type.value,
                    'preview_image_url': result['avatar'].preview_image_url
                },
                'processing_time_estimate': result.get('processing_time_estimate', 300),
                'message': 'Custom avatar creation started. Processing typically takes 3-5 minutes.'
            })
        else:
            return jsonify({
                'error': result['error']
            }), 400
        
    except Exception as e:
        logger.error(f"Custom avatar creation failed: {str(e)}")
        return jsonify({'error': 'Failed to create custom avatar'}), 500


@premium_bp.route('/generate', methods=['POST'])
@cross_origin()
@require_auth
@validate_request
async def generate_premium_video():
    """Generate video with HeyGen premium service"""
    try:
        user_email = session.get('user_email')
        if not user_email:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['avatar_id', 'text', 'voice_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check credit availability
        if not premium_subscription_service.use_credit(user_email, ServiceProvider.HEYGEN):
            return jsonify({
                'error': 'Insufficient credits',
                'credits_required': 1,
                'current_credits': premium_subscription_service.get_user_credits(user_email)['remaining_credits']
            }), 403
        
        # Create HeyGen generation request
        quality_map = {
            '720p': HeyGenVideoQuality.HD_720P,
            '1080p': HeyGenVideoQuality.FULL_HD_1080P,
            '4k': HeyGenVideoQuality.UHD_4K
        }
        
        language_map = {
            'en': HeyGenLanguage.ENGLISH,
            'hi': HeyGenLanguage.HINDI,
            'es': HeyGenLanguage.SPANISH,
            'fr': HeyGenLanguage.FRENCH,
            'de': HeyGenLanguage.GERMAN,
            'zh': HeyGenLanguage.CHINESE,
            'ja': HeyGenLanguage.JAPANESE
        }
        
        heygen_request = HeyGenGenerationRequest(
            avatar_id=data['avatar_id'],
            text=data['text'],
            voice_id=data['voice_id'],
            quality=quality_map.get(data.get('quality', '1080p'), HeyGenVideoQuality.FULL_HD_1080P),
            background=data.get('background'),
            language=language_map.get(data.get('language', 'en'), HeyGenLanguage.ENGLISH),
            emotion=data.get('emotion', 'neutral'),
            speed=data.get('speed', 1.0),
            custom_avatar_image=data.get('custom_avatar_image')
        )
        
        # Progress tracking
        progress_updates = []
        
        async def progress_callback(percentage, message):
            progress_updates.append({
                'percentage': percentage,
                'message': message,
                'timestamp': datetime.now().isoformat()
            })
        
        # Generate video
        result = await heygen_service.generate_video(
            user_email, heygen_request, progress_callback
        )
        
        if result['success']:
            # Store video and trigger quality analysis
            video_id = f"heygen_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{user_email.split('@')[0]}"
            
            # Save video file (in production, save to cloud storage)
            video_path = f"data/videos/{video_id}.mp4"
            os.makedirs("data/videos", exist_ok=True)
            
            with open(video_path, 'wb') as f:
                f.write(result['video_data'])
            
            # Trigger quality analysis (async)
            asyncio.create_task(
                quality_metrics_service.analyze_video_quality(
                    video_path, video_id, quality_metrics_service.Provider.HEYGEN
                )
            )
            
            return jsonify({
                'success': True,
                'video_id': video_id,
                'provider': 'heygen_premium',
                'quality': result.get('quality', '1080p'),
                'duration': result.get('duration', 0),
                'processing_time': result.get('processing_time', 0),
                'cost': result.get('cost', 0),
                'premium_features': result.get('premium_features', {}),
                'progress_updates': progress_updates,
                'download_url': f'/api/v1/videos/{video_id}/download',
                'preview_url': f'/api/v1/videos/{video_id}/preview'
            })
        else:
            # Refund credit if generation failed
            # premium_subscription_service.refund_credit(user_email)
            
            return jsonify({
                'error': result['error'],
                'upgrade_required': result.get('upgrade_required', False)
            }), 400
        
    except Exception as e:
        logger.error(f"Premium video generation failed: {str(e)}")
        return jsonify({'error': 'Video generation failed'}), 500


@premium_bp.route('/compare/create', methods=['POST'])
@cross_origin()
@require_auth
async def create_quality_comparison():
    """Create A/B quality comparison between Veo3 and HeyGen"""
    try:
        user_email = session.get('user_email')
        if not user_email:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        script_text = data.get('script_text')
        
        if not script_text:
            return jsonify({'error': 'Script text required'}), 400
        
        # Create comparison session
        session_id = ab_testing_service.create_comparison_session(user_email, script_text)
        
        # Generate comparison videos
        comparison_result = await ab_testing_service.generate_comparison_videos(session_id)
        
        if comparison_result['success']:
            return jsonify({
                'success': True,
                'session_id': session_id,
                'comparison_ready': comparison_result['comparison_ready'],
                'veo3_result': {
                    'success': comparison_result['veo3_result']['success'],
                    'video_id': comparison_result['veo3_result'].get('video_id')
                },
                'heygen_result': {
                    'success': comparison_result['heygen_result']['success'],
                    'video_id': comparison_result['heygen_result'].get('video_id'),
                    'premium_required': not comparison_result['heygen_result']['success']
                },
                'message': 'Quality comparison videos generated. Please review both and provide feedback.'
            })
        else:
            return jsonify({
                'error': comparison_result['error']
            }), 500
        
    except Exception as e:
        logger.error(f"Quality comparison creation failed: {str(e)}")
        return jsonify({'error': 'Failed to create quality comparison'}), 500


@premium_bp.route('/compare/feedback', methods=['POST'])
@cross_origin()
@require_auth
def submit_comparison_feedback():
    """Submit quality comparison feedback"""
    try:
        user_email = session.get('user_email')
        if not user_email:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        required_fields = ['session_id', 'veo3_rating', 'heygen_rating', 'preferred_provider']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate ratings
        if not (1 <= data['veo3_rating'] <= 10) or not (1 <= data['heygen_rating'] <= 10):
            return jsonify({'error': 'Ratings must be between 1 and 10'}), 400
        
        if data['preferred_provider'] not in ['veo3', 'heygen', 'no_preference']:
            return jsonify({'error': 'Invalid preferred provider'}), 400
        
        # Submit feedback
        success = ab_testing_service.submit_comparison_feedback(
            data['session_id'],
            data['veo3_rating'],
            data['heygen_rating'],
            data['preferred_provider'],
            data.get('feedback_text', '')
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Feedback submitted successfully. Thank you for helping improve our service!'
            })
        else:
            return jsonify({'error': 'Failed to submit feedback'}), 500
        
    except Exception as e:
        logger.error(f"Comparison feedback submission failed: {str(e)}")
        return jsonify({'error': 'Failed to submit feedback'}), 500


@premium_bp.route('/pricing', methods=['GET'])
@cross_origin()
@cache_response(300)  # Cache for 5 minutes
def get_premium_pricing():
    """Get premium pricing tiers with HeyGen access"""
    try:
        # Get user's country for regional pricing
        user_country = request.headers.get('CF-IPCountry', 'US')  # Cloudflare header
        user_currency = request.args.get('currency', 'usd').lower()
        
        # Get pricing display
        pricing_display = pricing_strategy.get_optimal_pricing_display(user_country, user_currency)
        
        # Add HeyGen-specific information
        enhanced_pricing = {}
        for tier_name, tier_data in pricing_display.items():
            tier_enum = PricingTier(tier_name)
            base_plan = pricing_strategy.base_pricing[tier_enum]
            
            enhanced_pricing[tier_name] = {
                **tier_data,
                'provider': base_plan.get('provider', 'veo3'),
                'cost_per_video': base_plan.get('cost_per_video'),
                'premium_multiplier': base_plan.get('premium_multiplier'),
                'heygen_access': tier_name in ['premium', 'enterprise'],
                'custom_avatars': tier_name in ['premium', 'enterprise'],
                'quality_comparison': True,
                'api_access': tier_name in ['enterprise']
            }
        
        # Get current promotion if any
        promotions = []
        now = datetime.now()
        if now.month == 11 and 25 <= now.day <= 29:  # Black Friday
            promotions.append({
                'name': 'Black Friday Special',
                'discount': 30,
                'message': '30% off all premium plans!',
                'expires': 'November 29th',
                'code': 'BLACKFRIDAY30'
            })
        
        return jsonify({
            'success': True,
            'pricing': enhanced_pricing,
            'currency': user_currency,
            'country': user_country,
            'promotions': promotions,
            'comparison': {
                'veo3_features': [
                    'Fast generation (0.15/second)',
                    'Good quality AI videos',
                    'Multiple voice options',
                    'Reliable performance'
                ],
                'heygen_features': [
                    'Professional avatars',
                    'Superior lip-sync accuracy',
                    'Custom avatar creation',
                    'Professional lighting',
                    'Enhanced realism'
                ],
                'price_difference': '4x premium for 4x quality'
            }
        })
        
    except Exception as e:
        logger.error(f"Get premium pricing failed: {str(e)}")
        return jsonify({'error': 'Failed to get pricing'}), 500


@premium_bp.route('/subscription/create', methods=['POST'])
@cross_origin()
@require_auth
def create_premium_subscription():
    """Create premium subscription checkout"""
    try:
        user_email = session.get('user_email')
        if not user_email:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        tier = data.get('tier')
        billing_cycle = data.get('billing_cycle', 'monthly')
        
        if tier not in ['standard', 'premium', 'enterprise']:
            return jsonify({'error': 'Invalid subscription tier'}), 400
        
        tier_enum = PremiumTier(tier.upper())
        
        # Create subscription checkout
        checkout_url = premium_subscription_service.create_premium_subscription(
            user_email, tier_enum, billing_cycle
        )
        
        return jsonify({
            'success': True,
            'checkout_url': checkout_url,
            'tier': tier,
            'billing_cycle': billing_cycle
        })
        
    except Exception as e:
        logger.error(f"Premium subscription creation failed: {str(e)}")
        return jsonify({'error': 'Failed to create subscription'}), 500


@premium_bp.route('/usage/stats', methods=['GET'])
@cross_origin()
@require_auth
def get_usage_statistics():
    """Get premium usage statistics for user"""
    try:
        user_email = session.get('user_email')
        if not user_email:
            return jsonify({'error': 'Authentication required'}), 401
        
        days = int(request.args.get('days', 30))
        
        # Get HeyGen usage stats
        heygen_stats = heygen_service.get_premium_usage_stats(user_email, days)
        
        # Get A/B test history
        test_history = ab_testing_service.get_user_test_history(user_email)
        
        # Get current credits
        credits = premium_subscription_service.get_user_credits(user_email)
        
        return jsonify({
            'success': True,
            'usage_period_days': days,
            'premium_usage': heygen_stats,
            'quality_tests': {
                'total_comparisons': len(test_history),
                'recent_comparisons': test_history[:5]  # Last 5 comparisons
            },
            'credits': credits,
            'tier': premium_subscription_service.get_user_tier(user_email).value
        })
        
    except Exception as e:
        logger.error(f"Usage statistics failed: {str(e)}")
        return jsonify({'error': 'Failed to get usage statistics'}), 500


@premium_bp.route('/quality/benchmarks', methods=['GET'])
@cross_origin()
@cache_response(3600)  # Cache for 1 hour
def get_quality_benchmarks():
    """Get quality benchmarks for providers"""
    try:
        # Get provider benchmarks
        benchmarks = quality_metrics_service.get_provider_benchmarks()
        
        # Get A/B test results summary
        test_results = ab_testing_service.get_test_results('default_quality_test')
        
        return jsonify({
            'success': True,
            'benchmarks': benchmarks,
            'ab_test_results': test_results,
            'quality_metrics': {
                'visual_quality': 'Sharpness, brightness, contrast analysis',
                'lip_sync_accuracy': 'Audio-visual synchronization precision',
                'facial_expression': 'Natural expression and emotion rendering',
                'voice_naturalness': 'Audio quality and speech naturalness',
                'overall_realism': 'Combined realism assessment',
                'technical_quality': 'Resolution, frame rate, file integrity'
            },
            'last_updated': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Quality benchmarks failed: {str(e)}")
        return jsonify({'error': 'Failed to get quality benchmarks'}), 500


# Error handlers for premium blueprint
@premium_bp.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request', 'message': str(error)}), 400


@premium_bp.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized', 'message': 'Authentication required'}), 401


@premium_bp.errorhandler(403)
def forbidden(error):
    return jsonify({'error': 'Forbidden', 'message': 'Premium subscription required'}), 403


@premium_bp.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

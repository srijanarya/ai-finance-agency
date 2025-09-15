"""
TalkingPhoto AI MVP - A/B Testing Service
Compares Veo3 vs HeyGen quality and user preferences
"""

import json
import uuid
import sqlite3
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
from redis import Redis
import logging
import random

logger = logging.getLogger(__name__)


class TestVariant(Enum):
    """A/B test variants"""
    VEO3 = "veo3"
    HEYGEN = "heygen"


class TestStatus(Enum):
    """Test status"""
    CREATED = "created"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class ABTestConfiguration:
    """A/B test configuration"""
    test_id: str
    test_name: str
    description: str
    variants: List[TestVariant]
    traffic_split: Dict[str, float]  # {"veo3": 0.5, "heygen": 0.5}
    success_metrics: List[str]
    duration_days: int
    target_sample_size: int


@dataclass
class TestResult:
    """Individual test result"""
    result_id: str
    test_id: str
    user_email: str
    variant: TestVariant
    video_generation_id: str
    quality_rating: int  # 1-10 scale
    user_preference: Optional[TestVariant]
    completion_time: float
    cost: float
    metadata: Dict[str, Any]
    created_at: datetime


class ABTestingService:
    """
    A/B Testing service for comparing video generation providers
    """
    
    def __init__(self):
        self.db_path = "data/ab_testing.db"
        self.redis_client = Redis(decode_responses=True)
        self.init_database()
        self.active_tests = {}
        self._load_active_tests()
    
    def init_database(self):
        """Initialize A/B testing database"""
        import os
        os.makedirs("data", exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # A/B tests configuration table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ab_tests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    test_id TEXT UNIQUE NOT NULL,
                    test_name TEXT NOT NULL,
                    description TEXT,
                    variants TEXT NOT NULL, -- JSON array
                    traffic_split TEXT NOT NULL, -- JSON object
                    success_metrics TEXT, -- JSON array
                    duration_days INTEGER DEFAULT 30,
                    target_sample_size INTEGER DEFAULT 100,
                    status TEXT DEFAULT 'created',
                    start_date TIMESTAMP,
                    end_date TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Test results table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ab_test_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    result_id TEXT UNIQUE NOT NULL,
                    test_id TEXT NOT NULL,
                    user_email TEXT NOT NULL,
                    variant TEXT NOT NULL,
                    video_generation_id TEXT,
                    quality_rating INTEGER,
                    user_preference TEXT,
                    completion_time REAL,
                    cost REAL,
                    processing_time REAL,
                    video_duration REAL,
                    metadata TEXT, -- JSON object
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (test_id) REFERENCES ab_tests (test_id)
                )
            """)
            
            # User test assignments table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_test_assignments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_email TEXT NOT NULL,
                    test_id TEXT NOT NULL,
                    assigned_variant TEXT NOT NULL,
                    assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active INTEGER DEFAULT 1,
                    PRIMARY KEY (user_email, test_id)
                )
            """)
            
            # Quality comparison sessions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS quality_comparison_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT UNIQUE NOT NULL,
                    user_email TEXT NOT NULL,
                    test_script TEXT NOT NULL,
                    veo3_video_id TEXT,
                    heygen_video_id TEXT,
                    veo3_rating INTEGER,
                    heygen_rating INTEGER,
                    preferred_provider TEXT,
                    feedback_text TEXT,
                    comparison_completed INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
    
    def _load_active_tests(self):
        """Load active tests from database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT test_id, test_name, variants, traffic_split FROM ab_tests WHERE status = 'running'"
                )
                
                for row in cursor.fetchall():
                    test_id, test_name, variants_json, traffic_split_json = row
                    
                    self.active_tests[test_id] = {
                        'test_name': test_name,
                        'variants': json.loads(variants_json),
                        'traffic_split': json.loads(traffic_split_json)
                    }
                    
        except Exception as e:
            logger.error(f"Failed to load active tests: {str(e)}")
    
    def create_quality_comparison_test(self, test_name: str, description: str,
                                     duration_days: int = 30,
                                     target_sample_size: int = 100) -> str:
        """Create new A/B test for quality comparison"""
        try:
            test_id = f"quality_test_{uuid.uuid4().hex[:8]}"
            
            config = ABTestConfiguration(
                test_id=test_id,
                test_name=test_name,
                description=description,
                variants=[TestVariant.VEO3, TestVariant.HEYGEN],
                traffic_split={"veo3": 0.5, "heygen": 0.5},
                success_metrics=["quality_rating", "user_preference", "completion_time"],
                duration_days=duration_days,
                target_sample_size=target_sample_size
            )
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO ab_tests (
                        test_id, test_name, description, variants, traffic_split,
                        success_metrics, duration_days, target_sample_size, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    test_id, test_name, description,
                    json.dumps([v.value for v in config.variants]),
                    json.dumps(config.traffic_split),
                    json.dumps(config.success_metrics),
                    duration_days, target_sample_size, 'created'
                ))
                conn.commit()
            
            logger.info(f"Created A/B test: {test_id}")
            return test_id
            
        except Exception as e:
            logger.error(f"Failed to create A/B test: {str(e)}")
            raise
    
    def start_test(self, test_id: str) -> bool:
        """Start running A/B test"""
        try:
            start_date = datetime.now()
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE ab_tests 
                    SET status = 'running', start_date = ?
                    WHERE test_id = ?
                """, (start_date, test_id))
                conn.commit()
            
            # Load test configuration into memory
            self._load_active_tests()
            
            logger.info(f"Started A/B test: {test_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start A/B test: {str(e)}")
            return False
    
    def assign_user_to_variant(self, user_email: str, test_id: str = None) -> TestVariant:
        """Assign user to test variant"""
        try:
            # Use default quality comparison test if none specified
            if not test_id:
                test_id = self._get_default_quality_test()
            
            # Check if user already assigned
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT assigned_variant FROM user_test_assignments WHERE user_email = ? AND test_id = ?",
                    (user_email, test_id)
                )
                result = cursor.fetchone()
                
                if result:
                    return TestVariant(result[0])
            
            # Assign new variant based on traffic split
            if test_id in self.active_tests:
                traffic_split = self.active_tests[test_id]['traffic_split']
                
                # Weighted random assignment
                rand_val = random.random()
                cumulative_weight = 0
                
                for variant, weight in traffic_split.items():
                    cumulative_weight += weight
                    if rand_val <= cumulative_weight:
                        assigned_variant = TestVariant(variant)
                        break
                else:
                    assigned_variant = TestVariant.VEO3  # Fallback
            else:
                # Fallback to 50/50 split
                assigned_variant = random.choice([TestVariant.VEO3, TestVariant.HEYGEN])
            
            # Store assignment
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO user_test_assignments 
                    (user_email, test_id, assigned_variant) VALUES (?, ?, ?)
                """, (user_email, test_id, assigned_variant.value))
                conn.commit()
            
            return assigned_variant
            
        except Exception as e:
            logger.error(f"Failed to assign user to variant: {str(e)}")
            return TestVariant.VEO3  # Fallback
    
    def create_comparison_session(self, user_email: str, script_text: str) -> str:
        """Create quality comparison session for user"""
        try:
            session_id = f"comparison_{uuid.uuid4().hex[:12]}"
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO quality_comparison_sessions 
                    (session_id, user_email, test_script) VALUES (?, ?, ?)
                """, (session_id, user_email, script_text))
                conn.commit()
            
            # Cache session info in Redis
            session_data = {
                'session_id': session_id,
                'user_email': user_email,
                'script_text': script_text,
                'status': 'created',
                'created_at': datetime.now().isoformat()
            }
            
            self.redis_client.setex(
                f"comparison_session:{session_id}",
                86400,  # 24 hours
                json.dumps(session_data)
            )
            
            return session_id
            
        except Exception as e:
            logger.error(f"Failed to create comparison session: {str(e)}")
            raise
    
    async def generate_comparison_videos(self, session_id: str) -> Dict[str, Any]:
        """Generate videos with both providers for comparison"""
        try:
            # Get session data
            session_data = self.redis_client.get(f"comparison_session:{session_id}")
            if not session_data:
                return {'success': False, 'error': 'Session not found'}
            
            session_info = json.loads(session_data)
            user_email = session_info['user_email']
            script_text = session_info['script_text']
            
            # Import services
            from services.video_generation_service import VideoGenerationPipeline, VideoGenerationRequest, VideoQuality, AspectRatio
            from services.heygen_service import heygen_service
            
            # Create video generation requests
            base_request_data = {
                'source_image': 'default_avatar.jpg',  # Use default avatar
                'script_text': script_text,
                'quality': VideoQuality.STANDARD,
                'aspect_ratio': AspectRatio.LANDSCAPE,
                'duration': len(script_text.split()) * 0.5,  # Rough estimate
                'user_email': user_email
            }
            
            # Generate with Veo3
            veo3_request = VideoGenerationRequest(**base_request_data)
            veo3_request.provider_preference = 'veo3'
            
            # Generate with HeyGen (if user has premium access)
            heygen_request = VideoGenerationRequest(**base_request_data)
            heygen_request.provider_preference = 'heygen'
            
            pipeline = VideoGenerationPipeline()
            
            # Generate videos concurrently
            veo3_task = pipeline.generate_video_async(veo3_request, f"veo3_{session_id}")
            
            # Check HeyGen access
            has_heygen_access = await heygen_service.check_premium_access(user_email)
            
            if has_heygen_access:
                heygen_task = pipeline.generate_video_async(heygen_request, f"heygen_{session_id}")
                veo3_result, heygen_result = await asyncio.gather(veo3_task, heygen_task)
            else:
                veo3_result = await veo3_task
                heygen_result = {'success': False, 'error': 'Premium subscription required'}
            
            # Update session with results
            session_info.update({
                'veo3_result': veo3_result,
                'heygen_result': heygen_result,
                'status': 'videos_generated',
                'generated_at': datetime.now().isoformat()
            })
            
            self.redis_client.setex(
                f"comparison_session:{session_id}",
                86400,
                json.dumps(session_info)
            )
            
            # Update database
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                veo3_video_id = veo3_result.get('video_id') if veo3_result['success'] else None
                heygen_video_id = heygen_result.get('video_id') if heygen_result['success'] else None
                
                cursor.execute("""
                    UPDATE quality_comparison_sessions 
                    SET veo3_video_id = ?, heygen_video_id = ?
                    WHERE session_id = ?
                """, (veo3_video_id, heygen_video_id, session_id))
                conn.commit()
            
            return {
                'success': True,
                'session_id': session_id,
                'veo3_result': veo3_result,
                'heygen_result': heygen_result,
                'comparison_ready': veo3_result['success'] and heygen_result['success']
            }
            
        except Exception as e:
            logger.error(f"Failed to generate comparison videos: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def submit_comparison_feedback(self, session_id: str, veo3_rating: int,
                                 heygen_rating: int, preferred_provider: str,
                                 feedback_text: str = "") -> bool:
        """Submit quality comparison feedback"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Update comparison session
                cursor.execute("""
                    UPDATE quality_comparison_sessions 
                    SET veo3_rating = ?, heygen_rating = ?, preferred_provider = ?,
                        feedback_text = ?, comparison_completed = 1
                    WHERE session_id = ?
                """, (veo3_rating, heygen_rating, preferred_provider, 
                      feedback_text, session_id))
                
                # Get session info for test results
                cursor.execute(
                    "SELECT user_email, test_script FROM quality_comparison_sessions WHERE session_id = ?",
                    (session_id,)
                )
                session_data = cursor.fetchone()
                
                if session_data:
                    user_email, test_script = session_data
                    
                    # Create test results for both variants
                    default_test_id = self._get_default_quality_test()
                    
                    # Veo3 result
                    cursor.execute("""
                        INSERT INTO ab_test_results (
                            result_id, test_id, user_email, variant, quality_rating,
                            user_preference, metadata
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        f"veo3_{session_id}", default_test_id, user_email, 'veo3',
                        veo3_rating, preferred_provider,
                        json.dumps({'session_id': session_id, 'feedback': feedback_text})
                    ))
                    
                    # HeyGen result
                    cursor.execute("""
                        INSERT INTO ab_test_results (
                            result_id, test_id, user_email, variant, quality_rating,
                            user_preference, metadata
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        f"heygen_{session_id}", default_test_id, user_email, 'heygen',
                        heygen_rating, preferred_provider,
                        json.dumps({'session_id': session_id, 'feedback': feedback_text})
                    ))
                
                conn.commit()
            
            # Update Redis cache
            session_data = self.redis_client.get(f"comparison_session:{session_id}")
            if session_data:
                session_info = json.loads(session_data)
                session_info.update({
                    'feedback_submitted': True,
                    'veo3_rating': veo3_rating,
                    'heygen_rating': heygen_rating,
                    'preferred_provider': preferred_provider,
                    'feedback_completed_at': datetime.now().isoformat()
                })
                
                self.redis_client.setex(
                    f"comparison_session:{session_id}",
                    86400,
                    json.dumps(session_info)
                )
            
            logger.info(f"Comparison feedback submitted: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to submit comparison feedback: {str(e)}")
            return False
    
    def get_test_results(self, test_id: str) -> Dict[str, Any]:
        """Get comprehensive test results and analysis"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get test info
                cursor.execute(
                    "SELECT test_name, description, start_date, status FROM ab_tests WHERE test_id = ?",
                    (test_id,)
                )
                test_info = cursor.fetchone()
                
                if not test_info:
                    return {'error': 'Test not found'}
                
                test_name, description, start_date, status = test_info
                
                # Get results by variant
                cursor.execute("""
                    SELECT variant, 
                           COUNT(*) as sample_size,
                           AVG(quality_rating) as avg_rating,
                           COUNT(CASE WHEN user_preference = variant THEN 1 END) as preference_count,
                           AVG(completion_time) as avg_completion_time,
                           AVG(cost) as avg_cost
                    FROM ab_test_results 
                    WHERE test_id = ? 
                    GROUP BY variant
                """, (test_id,))
                
                variant_results = {}
                total_participants = 0
                
                for row in cursor.fetchall():
                    variant, sample_size, avg_rating, preference_count, avg_completion_time, avg_cost = row
                    total_participants += sample_size
                    
                    variant_results[variant] = {
                        'sample_size': sample_size,
                        'avg_quality_rating': round(avg_rating or 0, 2),
                        'preference_count': preference_count,
                        'avg_completion_time': round(avg_completion_time or 0, 2),
                        'avg_cost': round(avg_cost or 0, 4)
                    }
                
                # Calculate preference percentages
                for variant_data in variant_results.values():
                    if total_participants > 0:
                        variant_data['preference_percentage'] = round(
                            (variant_data['preference_count'] / total_participants) * 100, 1
                        )
                    else:
                        variant_data['preference_percentage'] = 0
                
                # Determine winner
                winner = None
                if len(variant_results) >= 2:
                    veo3_score = variant_results.get('veo3', {}).get('avg_quality_rating', 0)
                    heygen_score = variant_results.get('heygen', {}).get('avg_quality_rating', 0)
                    
                    if heygen_score > veo3_score:
                        winner = 'heygen'
                    elif veo3_score > heygen_score:
                        winner = 'veo3'
                    else:
                        winner = 'tie'
                
                # Calculate statistical significance (simplified)
                statistical_significance = self._calculate_statistical_significance(variant_results)
                
                return {
                    'test_id': test_id,
                    'test_name': test_name,
                    'description': description,
                    'status': status,
                    'start_date': start_date,
                    'total_participants': total_participants,
                    'variant_results': variant_results,
                    'winner': winner,
                    'statistical_significance': statistical_significance,
                    'insights': self._generate_insights(variant_results)
                }
                
        except Exception as e:
            logger.error(f"Failed to get test results: {str(e)}")
            return {'error': str(e)}
    
    def _calculate_statistical_significance(self, variant_results: Dict) -> Dict[str, Any]:
        """Calculate statistical significance (simplified)"""
        if len(variant_results) < 2:
            return {'significant': False, 'confidence': 0}
        
        # Simplified statistical significance calculation
        # In production, use proper statistical tests like t-test or chi-square
        
        sample_sizes = [v['sample_size'] for v in variant_results.values()]
        min_sample_size = min(sample_sizes)
        
        # Basic rule: need at least 30 samples per variant for significance
        if min_sample_size < 30:
            return {
                'significant': False,
                'confidence': 0,
                'message': f'Insufficient sample size. Need 30+ per variant, got {min_sample_size}'
            }
        
        # Calculate effect size
        ratings = [v['avg_quality_rating'] for v in variant_results.values()]
        effect_size = abs(max(ratings) - min(ratings))
        
        # Simple confidence estimation
        if effect_size >= 1.0 and min_sample_size >= 50:
            confidence = 95
        elif effect_size >= 0.5 and min_sample_size >= 30:
            confidence = 90
        else:
            confidence = 80
        
        return {
            'significant': effect_size >= 0.5 and min_sample_size >= 30,
            'confidence': confidence,
            'effect_size': round(effect_size, 2),
            'min_sample_size': min_sample_size
        }
    
    def _generate_insights(self, variant_results: Dict) -> List[str]:
        """Generate insights from test results"""
        insights = []
        
        if 'veo3' in variant_results and 'heygen' in variant_results:
            veo3 = variant_results['veo3']
            heygen = variant_results['heygen']
            
            # Quality comparison
            quality_diff = heygen['avg_quality_rating'] - veo3['avg_quality_rating']
            if quality_diff > 0.5:
                insights.append(f"HeyGen shows significantly higher quality ({quality_diff:.1f} points)")
            elif quality_diff < -0.5:
                insights.append(f"Veo3 shows significantly higher quality ({abs(quality_diff):.1f} points)")
            else:
                insights.append("Quality ratings are very close between providers")
            
            # Cost comparison
            if heygen['avg_cost'] > veo3['avg_cost'] * 2:
                cost_multiplier = heygen['avg_cost'] / veo3['avg_cost']
                insights.append(f"HeyGen costs {cost_multiplier:.1f}x more than Veo3")
            
            # Preference analysis
            if heygen['preference_percentage'] > 60:
                insights.append(f"{heygen['preference_percentage']}% of users prefer HeyGen")
            elif veo3['preference_percentage'] > 60:
                insights.append(f"{veo3['preference_percentage']}% of users prefer Veo3")
            else:
                insights.append("User preferences are evenly split")
        
        return insights
    
    def _get_default_quality_test(self) -> str:
        """Get or create default quality comparison test"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT test_id FROM ab_tests WHERE test_name = 'Default Quality Comparison' AND status = 'running'"
                )
                result = cursor.fetchone()
                
                if result:
                    return result[0]
                
                # Create default test
                test_id = self.create_quality_comparison_test(
                    "Default Quality Comparison",
                    "Ongoing comparison of Veo3 vs HeyGen quality",
                    duration_days=365,  # Long-running test
                    target_sample_size=1000
                )
                
                self.start_test(test_id)
                return test_id
                
        except Exception as e:
            logger.error(f"Failed to get default quality test: {str(e)}")
            return "default_quality_test"
    
    def get_user_test_history(self, user_email: str) -> List[Dict[str, Any]]:
        """Get user's A/B test participation history"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT qcs.session_id, qcs.test_script, qcs.veo3_rating, 
                           qcs.heygen_rating, qcs.preferred_provider, qcs.created_at
                    FROM quality_comparison_sessions qcs
                    WHERE qcs.user_email = ? AND qcs.comparison_completed = 1
                    ORDER BY qcs.created_at DESC
                """, (user_email,))
                
                history = []
                for row in cursor.fetchall():
                    session_id, script, veo3_rating, heygen_rating, preference, created_at = row
                    history.append({
                        'session_id': session_id,
                        'test_script': script,
                        'veo3_rating': veo3_rating,
                        'heygen_rating': heygen_rating,
                        'preferred_provider': preference,
                        'created_at': created_at
                    })
                
                return history
                
        except Exception as e:
            logger.error(f"Failed to get user test history: {str(e)}")
            return []


# Global A/B testing service instance
ab_testing_service = ABTestingService()

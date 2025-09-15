"""
Celery Tasks for Photo Processing
Background tasks for photo analysis, enhancement, and face detection
"""

import os
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
from sqlalchemy.exc import SQLAlchemyError

from ..celery_app import celery_app, PhotoProcessingTask
from ..services.nano_banana_client import nano_banana_client
from ..services.photo_analyzer import photo_analyzer
from ..services.photo_enhancer import photo_enhancer
from ..services.face_landmark_detector import face_landmark_detector
from ..database.models import (
    Photo, PhotoAnalysis, PhotoEnhancement, FaceDetection, 
    FaceLandmark, PhotoProcessingJob, db_manager
)

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, base=PhotoProcessingTask, name="analyze_photo_task")
def analyze_photo_task(self, photo_id: int, use_nano_banana: bool = True) -> Dict[str, Any]:
    """
    Analyze photo quality and composition
    
    Args:
        photo_id: Database ID of the photo
        use_nano_banana: Whether to use Nano Banana API
        
    Returns:
        Dictionary with analysis results
    """
    session = db_manager.get_session()
    
    try:
        # Get photo from database
        photo = session.query(Photo).filter_by(id=photo_id).first()
        if not photo:
            raise ValueError(f"Photo with ID {photo_id} not found")
        
        # Update processing status
        photo.processing_status = "processing"
        photo.processing_started_at = datetime.utcnow()
        session.commit()
        
        # Update task progress
        self.update_state(state="PROGRESS", meta={"progress": 10, "status": "Starting analysis"})
        
        # Perform quality analysis
        logger.info(f"Analyzing photo quality for photo {photo_id}")
        quality_metrics = photo_analyzer.analyze_image_quality(photo.file_path)
        
        self.update_state(state="PROGRESS", meta={"progress": 40, "status": "Quality analysis complete"})
        
        # Perform composition analysis
        logger.info(f"Analyzing photo composition for photo {photo_id}")
        composition_analysis = photo_analyzer.analyze_composition(photo.file_path)
        
        self.update_state(state="PROGRESS", meta={"progress": 70, "status": "Composition analysis complete"})
        
        # Get crop suggestions
        crop_suggestion = photo_analyzer.suggest_auto_crop(photo.file_path)
        
        self.update_state(state="PROGRESS", meta={"progress": 90, "status": "Generating recommendations"})
        
        # Use Nano Banana API if requested and available
        nano_banana_response = None
        if use_nano_banana and nano_banana_client.api_key:
            try:
                nano_result = await nano_banana_client.analyze_photo_quality(photo.file_path)
                nano_banana_response = nano_result.raw_response
            except Exception as e:
                logger.warning(f"Nano Banana analysis failed: {e}")
        
        # Save analysis results to database
        photo_analysis = PhotoAnalysis(
            photo_id=photo_id,
            brightness_score=quality_metrics.brightness_score,
            contrast_score=quality_metrics.contrast_score,
            sharpness_score=quality_metrics.sharpness_score,
            noise_level=quality_metrics.noise_level,
            overall_quality_score=quality_metrics.overall_score,
            rule_of_thirds_score=composition_analysis.rule_of_thirds_score,
            symmetry_score=composition_analysis.symmetry_score,
            leading_lines_detected=composition_analysis.leading_lines_detected,
            composition_score=composition_analysis.overall_composition_score,
            suggested_crop_x=crop_suggestion.x if crop_suggestion else None,
            suggested_crop_y=crop_suggestion.y if crop_suggestion else None,
            suggested_crop_width=crop_suggestion.width if crop_suggestion else None,
            suggested_crop_height=crop_suggestion.height if crop_suggestion else None,
            nano_banana_response=nano_banana_response,
            analysis_metadata={
                "quality_issues": {
                    "is_blurry": quality_metrics.is_blurry,
                    "is_overexposed": quality_metrics.is_overexposed,
                    "is_underexposed": quality_metrics.is_underexposed
                },
                "composition_suggestions": composition_analysis.suggested_improvements,
                "crop_reason": crop_suggestion.reason if crop_suggestion else None
            }
        )
        
        session.add(photo_analysis)
        
        # Update photo status
        photo.processing_status = "completed"
        photo.processing_completed_at = datetime.utcnow()
        
        session.commit()
        
        # Return results
        result = {
            "photo_id": photo_id,
            "analysis_id": photo_analysis.id,
            "quality_metrics": {
                "brightness": quality_metrics.brightness_score,
                "contrast": quality_metrics.contrast_score,
                "sharpness": quality_metrics.sharpness_score,
                "noise_level": quality_metrics.noise_level,
                "overall_score": quality_metrics.overall_score,
                "issues": {
                    "is_blurry": quality_metrics.is_blurry,
                    "is_overexposed": quality_metrics.is_overexposed,
                    "is_underexposed": quality_metrics.is_underexposed
                }
            },
            "composition_analysis": {
                "rule_of_thirds": composition_analysis.rule_of_thirds_score,
                "symmetry": composition_analysis.symmetry_score,
                "leading_lines": composition_analysis.leading_lines_detected,
                "overall_score": composition_analysis.overall_composition_score,
                "suggestions": composition_analysis.suggested_improvements
            },
            "crop_suggestion": {
                "x": crop_suggestion.x,
                "y": crop_suggestion.y,
                "width": crop_suggestion.width,
                "height": crop_suggestion.height,
                "confidence": crop_suggestion.confidence,
                "reason": crop_suggestion.reason
            } if crop_suggestion else None,
            "processing_time": (datetime.utcnow() - photo.processing_started_at).total_seconds(),
            "nano_banana_used": nano_banana_response is not None
        }
        
        logger.info(f"Photo analysis completed for photo {photo_id}")
        return result
        
    except Exception as e:
        logger.error(f"Photo analysis failed for photo {photo_id}: {e}")
        
        # Update photo status to failed
        try:
            photo.processing_status = "failed"
            session.commit()
        except:
            pass
        
        raise e
    
    finally:
        session.close()


@celery_app.task(bind=True, base=PhotoProcessingTask, name="enhance_photo_task")
def enhance_photo_task(self, photo_id: int, enhancement_settings: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Enhance photo with AI-powered improvements
    
    Args:
        photo_id: Database ID of the photo
        enhancement_settings: Optional custom enhancement settings
        
    Returns:
        Dictionary with enhancement results
    """
    session = db_manager.get_session()
    
    try:
        # Get photo from database
        photo = session.query(Photo).filter_by(id=photo_id).first()
        if not photo:
            raise ValueError(f"Photo with ID {photo_id} not found")
        
        # Update task progress
        self.update_state(state="PROGRESS", meta={"progress": 10, "status": "Preparing enhancement"})
        
        # Generate enhanced filename
        base_name, ext = os.path.splitext(photo.filename)
        enhanced_filename = f"{base_name}_enhanced{ext}"
        enhanced_path = os.path.join(os.path.dirname(photo.file_path), enhanced_filename)
        
        self.update_state(state="PROGRESS", meta={"progress": 30, "status": "Analyzing current quality"})
        
        # Get existing analysis if available
        quality_metrics = None
        existing_analysis = session.query(PhotoAnalysis).filter_by(photo_id=photo_id).first()
        if existing_analysis:
            quality_metrics = {
                "brightness_score": existing_analysis.brightness_score,
                "contrast_score": existing_analysis.contrast_score,
                "sharpness_score": existing_analysis.sharpness_score,
                "noise_level": existing_analysis.noise_level,
                "overall_score": existing_analysis.overall_quality_score,
                "is_blurry": existing_analysis.analysis_metadata.get("quality_issues", {}).get("is_blurry", False),
                "is_overexposed": existing_analysis.analysis_metadata.get("quality_issues", {}).get("is_overexposed", False),
                "is_underexposed": existing_analysis.analysis_metadata.get("quality_issues", {}).get("is_underexposed", False)
            }
        
        self.update_state(state="PROGRESS", meta={"progress": 50, "status": "Applying enhancements"})
        
        # Apply enhancements
        logger.info(f"Enhancing photo {photo_id}")
        if enhancement_settings:
            # Use custom settings
            from ..services.photo_enhancer import EnhancementSettings
            settings = EnhancementSettings(**enhancement_settings)
            enhancement_result = photo_enhancer.enhance_with_settings(
                photo.file_path, enhanced_path, settings
            )
        else:
            # Use auto enhancement
            enhancement_result = photo_enhancer.auto_enhance(
                photo.file_path, enhanced_path, quality_metrics
            )
        
        if not enhancement_result.success:
            raise Exception(f"Enhancement failed: {enhancement_result.error_message}")
        
        self.update_state(state="PROGRESS", meta={"progress": 80, "status": "Saving results"})
        
        # Save enhancement results to database
        photo_enhancement = PhotoEnhancement(
            photo_id=photo_id,
            brightness_adjustment=enhancement_result.settings_applied.brightness_adjustment,
            contrast_adjustment=enhancement_result.settings_applied.contrast_adjustment,
            saturation_adjustment=enhancement_result.settings_applied.saturation_adjustment,
            sharpness_adjustment=enhancement_result.settings_applied.sharpness_adjustment,
            noise_reduction_level=enhancement_result.settings_applied.noise_reduction_level,
            enhanced_file_path=enhanced_path,
            enhancement_applied=True,
            processing_time_seconds=enhancement_result.processing_time,
            enhancement_score=enhancement_result.improvement_score,
            enhancement_metadata={
                "settings_applied": {
                    "brightness_adjustment": enhancement_result.settings_applied.brightness_adjustment,
                    "contrast_adjustment": enhancement_result.settings_applied.contrast_adjustment,
                    "saturation_adjustment": enhancement_result.settings_applied.saturation_adjustment,
                    "sharpness_adjustment": enhancement_result.settings_applied.sharpness_adjustment,
                    "noise_reduction_level": enhancement_result.settings_applied.noise_reduction_level,
                    "auto_white_balance": enhancement_result.settings_applied.auto_white_balance,
                    "auto_color_correction": enhancement_result.settings_applied.auto_color_correction
                },
                "before_after_metrics": enhancement_result.before_after_metrics,
                "custom_settings_used": enhancement_settings is not None
            }
        )
        
        session.add(photo_enhancement)
        session.commit()
        
        self.update_state(state="PROGRESS", meta={"progress": 95, "status": "Creating comparison"})
        
        # Create before/after comparison
        comparison_filename = f"{base_name}_comparison.jpg"
        comparison_path = os.path.join(os.path.dirname(photo.file_path), comparison_filename)
        photo_enhancer.create_before_after_comparison(
            photo.file_path, enhanced_path, comparison_path
        )
        
        # Return results
        result = {
            "photo_id": photo_id,
            "enhancement_id": photo_enhancement.id,
            "enhanced_path": enhanced_path,
            "comparison_path": comparison_path,
            "settings_applied": {
                "brightness_adjustment": enhancement_result.settings_applied.brightness_adjustment,
                "contrast_adjustment": enhancement_result.settings_applied.contrast_adjustment,
                "saturation_adjustment": enhancement_result.settings_applied.saturation_adjustment,
                "sharpness_adjustment": enhancement_result.settings_applied.sharpness_adjustment,
                "noise_reduction_level": enhancement_result.settings_applied.noise_reduction_level
            },
            "improvement_score": enhancement_result.improvement_score,
            "before_after_metrics": enhancement_result.before_after_metrics,
            "processing_time": enhancement_result.processing_time,
            "custom_settings_used": enhancement_settings is not None
        }
        
        logger.info(f"Photo enhancement completed for photo {photo_id}")
        return result
        
    except Exception as e:
        logger.error(f"Photo enhancement failed for photo {photo_id}: {e}")
        raise e
    
    finally:
        session.close()


@celery_app.task(bind=True, base=PhotoProcessingTask, name="detect_faces_task")
def detect_faces_task(self, photo_id: int, use_nano_banana: bool = True) -> Dict[str, Any]:
    """
    Detect faces and analyze landmarks for video generation
    
    Args:
        photo_id: Database ID of the photo
        use_nano_banana: Whether to use Nano Banana API
        
    Returns:
        Dictionary with face detection results
    """
    session = db_manager.get_session()
    
    try:
        # Get photo from database
        photo = session.query(Photo).filter_by(id=photo_id).first()
        if not photo:
            raise ValueError(f"Photo with ID {photo_id} not found")
        
        # Update task progress
        self.update_state(state="PROGRESS", meta={"progress": 10, "status": "Starting face detection"})
        
        # Detect faces and landmarks
        logger.info(f"Detecting faces for photo {photo_id}")
        face_result = await face_landmark_detector.detect_landmarks(
            photo.file_path, use_nano_banana
        )
        
        self.update_state(state="PROGRESS", meta={"progress": 70, "status": "Processing landmarks"})
        
        # Save face detection results
        face_detection = FaceDetection(
            photo_id=photo_id,
            faces_detected=face_result.faces_detected,
            primary_face_id=face_result.primary_face.face_id if face_result.primary_face else None,
            detection_confidence=face_result.primary_face.confidence if face_result.primary_face else 0.0,
            detection_service=face_result.detection_method,
            processing_time_seconds=face_result.processing_time,
            service_response={
                "faces_detected": face_result.faces_detected,
                "image_quality_for_faces": face_result.image_quality_for_faces,
                "recommendations": face_result.recommendations
            }
        )
        
        session.add(face_detection)
        session.flush()  # Get face_detection.id
        
        # Save landmarks for each face
        landmarks_data = []
        for face in face_result.all_faces:
            face_landmark = FaceLandmark(
                face_detection_id=face_detection.id,
                face_index=face.face_id,
                bbox_x=face.bbox[0],
                bbox_y=face.bbox[1],
                bbox_width=face.bbox[2],
                bbox_height=face.bbox[3],
                landmarks={"all_landmarks": face.all_landmarks},
                left_eye_center_x=face.left_eye_center[0],
                left_eye_center_y=face.left_eye_center[1],
                right_eye_center_x=face.right_eye_center[0],
                right_eye_center_y=face.right_eye_center[1],
                nose_tip_x=face.nose_tip[0],
                nose_tip_y=face.nose_tip[1],
                mouth_left_x=face.mouth_left[0],
                mouth_left_y=face.mouth_left[1],
                mouth_right_x=face.mouth_right[0],
                mouth_right_y=face.mouth_right[1],
                mouth_center_x=face.mouth_center[0],
                mouth_center_y=face.mouth_center[1],
                head_pose_pitch=face.head_pose[0],
                head_pose_yaw=face.head_pose[1],
                head_pose_roll=face.head_pose[2],
                expression_scores=face.expression_scores,
                primary_expression=face.primary_expression,
                expression_confidence=max(face.expression_scores.values()) if face.expression_scores else 0.0,
                face_mesh_points=face.face_mesh_3d.tolist() if face.face_mesh_3d is not None else None,
                landmark_quality_score=face.landmark_quality,
                suitable_for_animation=face.suitable_for_animation
            )
            
            session.add(face_landmark)
            landmarks_data.append({
                "face_id": face.face_id,
                "confidence": face.confidence,
                "bbox": face.bbox,
                "key_landmarks": {
                    "left_eye_center": face.left_eye_center,
                    "right_eye_center": face.right_eye_center,
                    "nose_tip": face.nose_tip,
                    "mouth_center": face.mouth_center,
                    "mouth_left": face.mouth_left,
                    "mouth_right": face.mouth_right
                },
                "head_pose": {
                    "pitch": face.head_pose[0],
                    "yaw": face.head_pose[1],
                    "roll": face.head_pose[2]
                },
                "expression": {
                    "primary": face.primary_expression,
                    "scores": face.expression_scores
                },
                "quality_metrics": {
                    "landmark_quality": face.landmark_quality,
                    "symmetry_score": face.symmetry_score,
                    "suitable_for_animation": face.suitable_for_animation
                }
            })
        
        session.commit()
        
        self.update_state(state="PROGRESS", meta={"progress": 95, "status": "Finalizing results"})
        
        # Return results
        result = {
            "photo_id": photo_id,
            "face_detection_id": face_detection.id,
            "faces_detected": face_result.faces_detected,
            "primary_face": {
                "face_id": face_result.primary_face.face_id,
                "confidence": face_result.primary_face.confidence,
                "suitable_for_animation": face_result.primary_face.suitable_for_animation
            } if face_result.primary_face else None,
            "all_faces": landmarks_data,
            "detection_method": face_result.detection_method,
            "image_quality_for_faces": face_result.image_quality_for_faces,
            "recommendations": face_result.recommendations,
            "processing_time": face_result.processing_time,
            "nano_banana_used": face_result.detection_method == "nano_banana"
        }
        
        logger.info(f"Face detection completed for photo {photo_id}: {face_result.faces_detected} faces found")
        return result
        
    except Exception as e:
        logger.error(f"Face detection failed for photo {photo_id}: {e}")
        raise e
    
    finally:
        session.close()


@celery_app.task(bind=True, base=PhotoProcessingTask, name="batch_process_photos_task")
def batch_process_photos_task(self, photo_ids: List[int], processing_options: Dict[str, bool]) -> Dict[str, Any]:
    """
    Process multiple photos in batch
    
    Args:
        photo_ids: List of photo IDs to process
        processing_options: Options for what processing to perform
        
    Returns:
        Dictionary with batch processing results
    """
    total_photos = len(photo_ids)
    completed = 0
    failed = 0
    results = []
    
    try:
        for i, photo_id in enumerate(photo_ids):
            try:
                # Update progress
                progress = int((i / total_photos) * 100)
                self.update_state(
                    state="PROGRESS", 
                    meta={
                        "progress": progress,
                        "status": f"Processing photo {i+1}/{total_photos}",
                        "completed": completed,
                        "failed": failed
                    }
                )
                
                photo_result = {"photo_id": photo_id, "results": {}}
                
                # Run analysis if requested
                if processing_options.get("analyze", True):
                    analysis_result = analyze_photo_task.delay(photo_id)
                    photo_result["results"]["analysis"] = analysis_result.id
                
                # Run enhancement if requested
                if processing_options.get("enhance", False):
                    enhancement_result = enhance_photo_task.delay(photo_id)
                    photo_result["results"]["enhancement"] = enhancement_result.id
                
                # Run face detection if requested
                if processing_options.get("detect_faces", True):
                    face_result = detect_faces_task.delay(photo_id)
                    photo_result["results"]["face_detection"] = face_result.id
                
                results.append(photo_result)
                completed += 1
                
            except Exception as e:
                logger.error(f"Failed to process photo {photo_id} in batch: {e}")
                failed += 1
                results.append({
                    "photo_id": photo_id,
                    "error": str(e),
                    "results": {}
                })
        
        # Final result
        batch_result = {
            "total_photos": total_photos,
            "completed": completed,
            "failed": failed,
            "success_rate": (completed / total_photos) * 100 if total_photos > 0 else 0,
            "results": results,
            "processing_options": processing_options
        }
        
        logger.info(f"Batch processing completed: {completed}/{total_photos} successful")
        return batch_result
        
    except Exception as e:
        logger.error(f"Batch processing failed: {e}")
        raise e


# Utility tasks for monitoring and maintenance
@celery_app.task(bind=True, name="get_processing_stats")
def get_processing_stats(self) -> Dict[str, Any]:
    """Get processing statistics"""
    session = db_manager.get_session()
    
    try:
        # Count photos by status
        from sqlalchemy import func
        
        status_counts = session.query(
            Photo.processing_status,
            func.count(Photo.id)
        ).group_by(Photo.processing_status).all()
        
        # Count processing jobs by status
        job_counts = session.query(
            PhotoProcessingJob.status,
            func.count(PhotoProcessingJob.id)
        ).group_by(PhotoProcessingJob.status).all()
        
        # Get recent processing times
        recent_jobs = session.query(PhotoProcessingJob).filter(
            PhotoProcessingJob.completed_at.isnot(None)
        ).order_by(PhotoProcessingJob.completed_at.desc()).limit(100).all()
        
        avg_processing_time = 0
        if recent_jobs:
            total_time = sum([
                (job.completed_at - job.created_at).total_seconds() 
                for job in recent_jobs 
                if job.completed_at and job.created_at
            ])
            avg_processing_time = total_time / len(recent_jobs)
        
        return {
            "photo_status_counts": dict(status_counts),
            "job_status_counts": dict(job_counts),
            "average_processing_time_seconds": avg_processing_time,
            "recent_jobs_analyzed": len(recent_jobs),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get processing stats: {e}")
        raise e
    
    finally:
        session.close()


@celery_app.task(bind=True, name="cleanup_temp_files")
def cleanup_temp_files(self, max_age_hours: int = 24) -> Dict[str, Any]:
    """Clean up temporary files older than specified age"""
    try:
        import glob
        from datetime import datetime, timedelta
        
        temp_dirs = ["/tmp", "/var/tmp", "temp"]  # Common temp directories
        cleaned_files = 0
        total_size_freed = 0
        
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        
        for temp_dir in temp_dirs:
            if not os.path.exists(temp_dir):
                continue
                
            # Find temporary image files
            patterns = [
                f"{temp_dir}/*_temp*.jpg",
                f"{temp_dir}/*_temp*.png", 
                f"{temp_dir}/*_enhanced*.jpg",
                f"{temp_dir}/*_comparison*.jpg"
            ]
            
            for pattern in patterns:
                for file_path in glob.glob(pattern):
                    try:
                        # Check file age
                        file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
                        if file_mtime < cutoff_time:
                            file_size = os.path.getsize(file_path)
                            os.remove(file_path)
                            cleaned_files += 1
                            total_size_freed += file_size
                    except Exception as e:
                        logger.warning(f"Failed to clean temp file {file_path}: {e}")
        
        return {
            "cleaned_files": cleaned_files,
            "total_size_freed_mb": total_size_freed / (1024 * 1024),
            "max_age_hours": max_age_hours,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Temp file cleanup failed: {e}")
        raise e